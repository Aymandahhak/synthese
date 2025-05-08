<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_formation_id',
        'participant_user_id',
        'status',
        'date_presence',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_presence' => 'date',
    ];

    /**
     * Get the session that this presence record belongs to.
     */
    public function sessionFormation(): BelongsTo
    {
        return $this->belongsTo(SessionFormation::class);
    }

    /**
     * Get the participant user that this presence record belongs to.
     */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_user_id');
    }
}
