<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Formateur extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'formateurs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'specialite',
        'region_id',
        'filiere_id',
        'matricule',
        'formation_id',
    ];

    /**
     * Get the user that owns the formateur.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function formation()
{
    return $this->belongsTo(Formation::class);
}

    /**
     * Get the region associated with the formateur.
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the filiere associated with the formateur.
     */
    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    /**
     * The formations that the formateur is compatible with (based on region and filiere).
     */
    public function compatibleFormations()
    {
        return Formation::query()
            ->where(function($query) {
                $query->whereNull('region_id')
                    ->orWhere('region_id', $this->region_id);
            })
            ->where(function($query) {
                $query->whereNull('filiere_id')
                    ->orWhere('filiere_id', $this->filiere_id);
            });
    }
}