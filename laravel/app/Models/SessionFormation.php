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
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'formateur_user_id',
        'etat',
        'location_type',
        'location_details',
        'max_participants',
        'category',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'max_participants' => 'integer',
    ];

    /**
     * Get the formateur that owns the session.
     */
    public function formateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'formateur_user_id');
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
