<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
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
     * Get the formations for the region.
     */
    public function formations()
    {
        return $this->hasMany(Formation::class);
    }

    /**
     * Get the formateurs for the region.
     */
    public function formateurs()
    {
        return $this->hasMany(Formateur::class);
    }
} 