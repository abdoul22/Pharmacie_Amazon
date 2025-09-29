<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

/**
 * Middleware pour gérer le timeout des sessions
 *
 * Vérifie si la session utilisateur n'a pas expiré côté serveur
 * et fournit des headers pour synchroniser avec le frontend
 */
class SessionTimeoutMiddleware
{
    /**
     * Délai d'inactivité en minutes (par défaut: 60 minutes = 1 heure)
     */
    private int $timeoutMinutes;

    public function __construct()
    {
        // Configurable via .env avec une valeur par défaut
        $this->timeoutMinutes = (int) config('session.inactivity_timeout', 60);
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ignorer pour les routes non authentifiées
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // Vérifier l'activité de l'utilisateur
        $lastActivity = $this->getLastActivity($request);
        $now = Carbon::now();

        if ($lastActivity && $now->diffInMinutes($lastActivity) > $this->timeoutMinutes) {
            // Session expirée côté serveur
            $this->handleExpiredSession($request);

            return response()->json([
                'success' => false,
                'message' => 'Session expirée pour cause d\'inactivité',
                'error_code' => 'SESSION_TIMEOUT',
                'timeout_minutes' => $this->timeoutMinutes,
            ], 401);
        }

        // Mettre à jour l'activité
        $this->updateLastActivity($request);

        // Continuer avec la requête
        $response = $next($request);

        // Ajouter des headers informatifs sur la session
        $response->headers->set('X-Session-Timeout', $this->timeoutMinutes * 60); // en secondes
        $response->headers->set('X-Session-Last-Activity', $now->toISOString());

        if ($lastActivity) {
            $response->headers->set(
                'X-Session-Time-Remaining',
                max(0, ($this->timeoutMinutes * 60) - $now->diffInSeconds($lastActivity))
            );
        }

        return $response;
    }

    /**
     * Obtenir le timestamp de la dernière activité
     */
    private function getLastActivity(Request $request): ?Carbon
    {
        // Chercher dans la session
        $sessionActivity = session('last_activity');
        if ($sessionActivity) {
            return Carbon::parse($sessionActivity);
        }

        // Chercher dans les headers (pour les tokens Sanctum)
        $headerActivity = $request->header('X-Last-Activity');
        if ($headerActivity) {
            return Carbon::parse($headerActivity);
        }

        // Si c'est la première activité, retourner maintenant
        return Carbon::now();
    }

    /**
     * Mettre à jour le timestamp de la dernière activité
     */
    private function updateLastActivity(Request $request): void
    {
        $now = Carbon::now();

        // Mettre à jour dans la session
        session(['last_activity' => $now->toISOString()]);

        // Pour les tokens Sanctum, on peut utiliser une table dédiée ou Redis
        if ($request->user() && $request->bearerToken()) {
            $this->updateTokenActivity($request->user()->id, $now);
        }
    }

    /**
     * Mettre à jour l'activité pour un token d'API
     */
    private function updateTokenActivity(int $userId, Carbon $timestamp): void
    {
        try {
            // Option 1: Utiliser le cache Redis si disponible
            if (config('cache.default') === 'redis') {
                cache()->put(
                    "user_activity:{$userId}",
                    $timestamp->toISOString(),
                    now()->addMinutes($this->timeoutMinutes + 10)
                );
            } else {
                // Option 2: Utiliser la session ou une table dédiée
                session(['user_activity' => $timestamp->toISOString()]);
            }
        } catch (\Exception $e) {
            \Log::warning('Erreur lors de la mise à jour de l\'activité utilisateur', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Gérer une session expirée
     */
    private function handleExpiredSession(Request $request): void
    {
        try {
            $user = Auth::user();

            // Log de l'expiration
            \Log::info('Session expirée pour inactivité', [
                'user_id' => $user?->id,
                'user_email' => $user?->email,
                'timeout_minutes' => $this->timeoutMinutes,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Nettoyer la session
            session()->flush();
            session()->regenerateToken();

            // Pour les tokens Sanctum, révoquer le token actuel
            if ($request->user() && $request->bearerToken()) {
                $request->user()->currentAccessToken()?->delete();
            }

            // Déconnecter l'utilisateur
            Auth::logout();

            // Nettoyer le cache d'activité
            if ($user && config('cache.default') === 'redis') {
                cache()->forget("user_activity:{$user->id}");
            }
        } catch (\Exception $e) {
            \Log::error('Erreur lors du nettoyage de session expirée', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}

