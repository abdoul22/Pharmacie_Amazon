<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Format a price with MRU currency
     */
    public static function formatPrice($amount, $decimals = 2): string
    {
        return number_format($amount, $decimals) . ' MRU';
    }

    /**
     * Get currency symbol
     */
    public static function getCurrency(): string
    {
        return 'MRU';
    }

    /**
     * Get currency full name
     */
    public static function getCurrencyName(): string
    {
        return 'Ouguiya Mauritanienne';
    }

    /**
     * Format a large amount with K/M notation
     */
    public static function formatLargeAmount($amount): string
    {
        if ($amount >= 1000000) {
            return number_format($amount / 1000000, 1) . 'M MRU';
        } elseif ($amount >= 1000) {
            return number_format($amount / 1000, 1) . 'K MRU';
        }

        return self::formatPrice($amount);
    }
}
