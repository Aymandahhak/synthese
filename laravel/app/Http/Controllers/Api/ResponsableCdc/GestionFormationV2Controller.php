<?php

namespace App\Http\Controllers\Api\ResponsableCdc;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\Formateur;
use App\Models\FormateurAnimateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GestionFormationV2Controller extends Controller
{
    // Get all formations with their formateur animateurs
    public function index()
    {
        try {
            $formations = Formation::with(['formateurAnimateurs.formateur'])
                ->get()
                ->map(function ($formation) {
                    return [
                        'id' => $formation->id,
                        'titre' => $formation->titre,
                        'description' => $formation->description,
                        'date_debut' => $formation->date_debut,
                        'date_fin' => $formation->date_fin,
                        'formateur_animateurs' => $formation->formateurAnimateurs->map(function ($fa) {
                            return [
                                'id' => $fa->id,
                                'formateur' => [
                                    'id' => $fa->formateur->id,
                                    'nom' => $fa->formateur->nom,
                                    'prenom' => $fa->formateur->prenom,
                                    'email' => $fa->formateur->email,
                                ]
                            ];
                        })
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $formations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la récupération des formations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get a specific formation with its formateur animateurs
    public function show($id)
    {
        try {
            $formation = Formation::with(['formateurAnimateurs.formateur'])->find($id);
            
            if (!$formation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Formation non trouvée'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $formation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Create a new formation
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after:date_debut',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $formation = Formation::create($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Formation créée avec succès',
                'data' => $formation
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update a formation
    public function update(Request $request, $id)
    {
        try {
            $formation = Formation::find($id);
            
            if (!$formation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Formation non trouvée'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'titre' => 'string|max:255',
                'description' => 'string',
                'date_debut' => 'date',
                'date_fin' => 'date|after:date_debut',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $formation->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Formation mise à jour avec succès',
                'data' => $formation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete a formation
    public function destroy($id)
    {
        try {
            $formation = Formation::find($id);
            
            if (!$formation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Formation non trouvée'
                ], 404);
            }

            // Delete related formateur animateurs first
            FormateurAnimateur::where('formation_id', $id)->delete();
            
            $formation->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Formation supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Assign formateur to formation
    public function assignFormateur(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'formation_id' => 'required|exists:formations,id',
                'formateur_id' => 'required|exists:formateurs,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if assignment already exists
            $existingAssignment = FormateurAnimateur::where('formation_id', $request->formation_id)
                ->where('formateur_id', $request->formateur_id)
                ->first();

            if ($existingAssignment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ce formateur est déjà assigné à cette formation'
                ], 422);
            }

            $formateurAnimateur = FormateurAnimateur::create([
                'formation_id' => $request->formation_id,
                'formateur_id' => $request->formateur_id,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Formateur assigné avec succès',
                'data' => $formateurAnimateur
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de l\'assignation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Remove formateur from formation
    public function removeFormateur(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'formation_id' => 'required|exists:formations,id',
                'formateur_id' => 'required|exists:formateurs,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $deleted = FormateurAnimateur::where('formation_id', $request->formation_id)
                ->where('formateur_id', $request->formateur_id)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Aucune assignation trouvée'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Formateur retiré avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 