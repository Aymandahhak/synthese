<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'code',
        'description',
        'active'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean'
    ];

    /**
     * Get the formations for the filiere.
     */
    public function formations()
    {
        return $this->hasMany(Formation::class);
    }

    /**
     * Get the formateurs for the filiere.
     */
    public function formateurs()
    {
        return $this->hasMany(Formateur::class);
    }
} 