<?php

namespace App\Http\Middleware;

use App\Services\PermissionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Authentication required'
            ], 401);
        }

        foreach ($permissions as $permission) {
            if (!PermissionService::userHasPermission($user, $permission)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - Missing permission: ' . $permission
                ], 403);
            }
        }

        return $next($request);
    }
}
