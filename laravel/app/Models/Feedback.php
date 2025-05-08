<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'feedback';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_formation_id',
        'formateur_user_id',
        'note',
        'commentaire',
    ];

    /**
     * Get the session formation that the feedback belongs to.
     */
    public function sessionFormation(): BelongsTo
    {
        return $this->belongsTo(SessionFormation::class);
    }

    /**
     * Get the formateur that submitted the feedback.
     */
    public function formateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'formateur_user_id');
    }

    /**
     * Get the sentiment of the feedback based on the note.
     * 
     * @return string
     */
    public function getSentimentAttribute(): string
    {
        if (!$this->note) {
            return 'Neutre';
        }
        
        if ($this->note >= 4) {
            return 'Positif';
        } elseif ($this->note <= 2) {
            return 'Négatif';
        } else {
            return 'Neutre';
        }
    }
}
