<?php

namespace App\Http\Controllers\Api\ResponsableFormation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SessionFormation;
use Illuminate\Support\Facades\Validator;

class SessionController extends Controller
{
    /**
     * Store a newly created session in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'formation_id' => 'required|exists:formations,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'heure_debut' => 'nullable|date_format:H:i',
            'heure_fin' => 'nullable|date_format:H:i|after:heure_debut',
            'lieu' => 'required|string|max:255',
            'salle' => 'nullable|string|max:255',
            'equipement' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
            'details_hebergement' => 'nullable|string',
            'details_restauration' => 'nullable|string',
            'formateur_animateur_id' => 'nullable|exists:users,id',
            'statut' => 'nullable|string|in:planifiee,en_cours,terminee,annulee,validee'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $session = SessionFormation::create($validator->validated());

        return response()->json([
            'message' => 'Session créée avec succès',
            'data' => $session
        ], 201);
    }
}
