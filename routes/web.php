<?php

use Illuminate\Support\Facades\Route;

/**
 * SPA Route - Toutes les routes frontend sont gérées par React Router
 * Laravel sert uniquement la page principale pour toutes les routes
 */
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*')->name('spa');

// Note: Les routes API sont dans routes/api.php
// Les routes d'authentification Laravel (pour la compatibilité) sont dans routes/auth.php
