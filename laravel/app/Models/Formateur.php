<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    /**
     * Get the user that is the formateur.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the region associated with the formateur.
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the filiere associated with the formateur.
     */
    public function filiere()
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