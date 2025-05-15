<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormateurAnimateur extends Model
{
    use HasFactory;

    // Nom de la table dans la base de données
    protected $table = 'formateur_animateur';


    // Colonnes que tu souhaites pouvoir mass-assignable
    protected $fillable = [
        'formation_id',
        'nom',
        'prenom',
        'formateur_animateur_id'
    ];

    public function formation()
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }
}
