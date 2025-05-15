<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formation extends Model
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
        'lieu',
        'capacite_max',
        'responsable_id',
        'statut',
        'region_id',
        'filiere_id',
        'image',
        'type_formation'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'capacite_max' => 'integer',
    ];

    /**
     * Get the responsable that owns the formation.
     */
    public function responsable(): BelongsTo
    {
        return $this->belongsTo(ResponsableFormation::class, 'responsable_id');
    }
    
    /**
     * Get the region this formation belongs to.
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    /**
     * Get the filiere this formation belongs to.
     */
    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }

    /**
     * Get the formateurs assigned to this formation.
     */
    public function formateurs(): HasMany
    {
        return $this->hasMany(Formateur::class);
    }

    /**
     * Get the sessions for this formation.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(SessionFormation::class);
    }

    /**
     * Get the documents for the formation.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function formateurAnimateurs()
    {
        return $this->hasMany(FormateurAnimateur::class);
    }
} 