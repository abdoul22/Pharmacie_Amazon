<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'is_approved',
        'last_login_at',
        'approved_by',
        'approved_at',
        'suspended_by',
        'suspended_at',
        'suspension_reason',
        'role_changed_by',
        'role_changed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_approved' => 'boolean',
            'last_login_at' => 'datetime',
            'approved_at' => 'datetime',
            'suspended_at' => 'datetime',
            'role_changed_at' => 'datetime',
        ];
    }

    /**
     * Relations
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function suspendedBy()
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    public function roleChangedBy()
    {
        return $this->belongsTo(User::class, 'role_changed_by');
    }

    /**
     * Scopes
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    public function scopeByRole($query, $role)
    {
        if (is_string($role)) {
            return $query->whereHas('role', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        return $query->where('role_id', $role);
    }

    /**
     * Accessors & Mutators
     */
    public function getStatusAttribute()
    {
        if (!$this->is_approved) {
            return 'pending';
        }

        if ($this->suspended_at) {
            return 'suspended';
        }

        return 'active';
    }

    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            'pending' => 'En attente',
            'suspended' => 'Suspendu',
            'active' => 'Actif',
            default => 'Inconnu'
        };
    }

    /**
     * Accessor pour le nom du rôle (compatibilité)
     */
    public function getRoleAttribute()
    {
        return $this->role()->first()?->name;
    }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    public function hasRole($roleName)
    {
        return $this->role === $roleName;
    }

    /**
     * Vérifier si l'utilisateur a une permission
     */
    public function hasPermission($permission)
    {
        if (!$this->role) {
            return false;
        }

        return $this->role->hasPermission($permission);
    }

    /**
     * Vérifier si l'utilisateur est SuperAdmin
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('superadmin');
    }
}
