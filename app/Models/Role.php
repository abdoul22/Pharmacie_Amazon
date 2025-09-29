<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'permissions',
        'level',
        'is_active',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Relation avec les utilisateurs
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByName($query, $name)
    {
        return $query->where('name', $name);
    }

    /**
     * Accessors
     */
    public function getPermissionsListAttribute()
    {
        return $this->permissions ?? [];
    }

    /**
     * Méthodes utilitaires
     */
    public function hasPermission($permission)
    {
        if (!$this->permissions) {
            return false;
        }

        // SuperAdmin a toutes les permissions
        if (in_array('*', $this->permissions)) {
            return true;
        }

        return in_array($permission, $this->permissions);
    }

    public function isHigherThan($role)
    {
        if (is_string($role)) {
            $role = self::where('name', $role)->first();
        }

        if (!$role) {
            return false;
        }

        return $this->level < $role->level; // Plus le niveau est bas, plus c'est élevé
    }

    /**
     * Récupérer un rôle par nom
     */
    public static function getByName($name)
    {
        return static::where('name', $name)->first();
    }

    /**
     * Récupérer tous les rôles actifs
     */
    public static function getActiveRoles()
    {
        return static::active()->orderBy('level')->get();
    }
}
