<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

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
        'statut',
        'image',
        'responsable_id',
        'region_id',
        'filiere_id',
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
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'statut' => 'validee', // Default status set to 'validee' (confirmed)
        'image' => '/logo-ofppt-1.jpg', // Default image path
    ];

    /**
     * Get the image URL attribute.
     *
     * @return string
     */
    protected function getImageUrlAttribute()
    {
        if (!$this->image) {
            return asset('/logo-ofppt-1.jpg');
        }

        // If the image path starts with 'http', it's already a full URL
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // If the image starts with '/storage', it's already a public URL
        if (str_starts_with($this->image, '/storage')) {
            return asset($this->image);
        }

        // If it starts with '/images', it's in the public directory
        if (str_starts_with($this->image, '/images')) {
            return asset($this->image);
        }

        // Otherwise, assume it's in the storage/app/public directory
        return Storage::url($this->image);
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_url'];

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