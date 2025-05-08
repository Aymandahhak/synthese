<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResponsableFormation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'departement',
        'date_debut_fonction',
        'description',
    ];

    protected $casts = [
        'date_debut_fonction' => 'date',
    ];

    /**
     * Get the user that owns the responsable formation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the formations for the responsable.
     */
    public function formations()
    {
        return $this->hasMany(Formation::class, 'responsable_id');
    }
} 