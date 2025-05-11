<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionFormation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'formation_id',
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'heure_debut',
        'heure_fin',
        'lieu',
        'salle',
        'equipement',
        'capacite_max',
        'formateur_animateur_id',
        'statut',
        'details_hebergement',
        'details_restauration',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'capacite_max' => 'integer',
    ];

    /**
     * Get the formateur that owns the session.
     */
    public function formateurAnimateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'formateur_animateur_id');
    }

    /**
     * Get the formation that this session belongs to.
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Get all feedbacks for this session.
     */
    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Get all presences for this session.
     */
    public function presences()
    {
        return $this->hasMany(Presence::class);
    }
}
