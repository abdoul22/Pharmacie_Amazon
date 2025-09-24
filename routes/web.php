<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Routes web supprimées - Migration vers SPA avec API REST uniquement
// Toutes les routes pharmacy sont maintenant dans routes/api.php

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
