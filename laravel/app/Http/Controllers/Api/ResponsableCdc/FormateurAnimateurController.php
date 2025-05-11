<?php

namespace App\Http\Controllers\Api\ResponsableCdc;
use App\Http\Controllers\Controller;
use App\Models\FormateurAnimateur;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FormateurAnimateurController extends Controller
{
    /**
     * Récupérer tous les formateurs animateurs
     */
    public function index()
    {
        try {
            $formateurAnimateurs = FormateurAnimateur::all();
            return response()->json([
                'success' => true,
                'data' => $formateurAnimateurs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des formateurs animateurs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les formateurs animateurs d'une formation spécifique
     */
    public function getByFormation($formationId)
    {
        try {
            // Vérifier si la formation existe
            $formation = Formation::find($formationId);
            if (!$formation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Formation non trouvée'
                ], 404);
            }

            // Récupérer les formateurs animateurs de la formation
            $formateurAnimateurs = FormateurAnimateur::where('formation_id', $formationId)->get();

            return response()->json([
                'success' => true,
                'data' => $formateurAnimateurs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des formateurs animateurs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau formateur animateur
     */
    public function store(Request $request)
    {
        try {
            // Valider les données
            $validator = Validator::make($request->all(), [
                'formation_id' => 'required|exists:formations,id',
                'formateur_animateur_id' => 'required|integer',
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Créer le formateur animateur
            $formateurAnimateur = FormateurAnimateur::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $formateurAnimateur,
                'message' => 'Formateur animateur créé avec succès'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du formateur animateur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer un formateur animateur spécifique
     */
    public function show($id)
    {
        try {
            $formateurAnimateur = FormateurAnimateur::find($id);
            
            if (!$formateurAnimateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Formateur animateur non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $formateurAnimateur
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du formateur animateur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un formateur animateur
     */
    public function update(Request $request, $id)
    {
        try {
            // Trouver le formateur animateur
            $formateurAnimateur = FormateurAnimateur::find($id);
            
            if (!$formateurAnimateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Formateur animateur non trouvé'
                ], 404);
            }

            // Valider les données
            $validator = Validator::make($request->all(), [
                'formation_id' => 'sometimes|required|exists:formations,id',
                'formateur_animateur_id' => 'sometimes|required|integer',
                'nom' => 'sometimes|required|string|max:255',
                'prenom' => 'sometimes|required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mettre à jour le formateur animateur
            $formateurAnimateur->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $formateurAnimateur,
                'message' => 'Formateur animateur mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du formateur animateur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un formateur animateur
     */
    public function destroy($id)
    {
        try {
            // Trouver le formateur animateur
            $formateurAnimateur = FormateurAnimateur::find($id);
            
            if (!$formateurAnimateur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Formateur animateur non trouvé'
                ], 404);
            }

            // Supprimer le formateur animateur
            $formateurAnimateur->delete();

            return response()->json([
                'success' => true,
                'message' => 'Formateur animateur supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du formateur animateur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ajouter plusieurs formateurs animateurs à une formation
     */
    public function addMultiple(Request $request, $formationId)
    {
        try {
            // Vérifier si la formation existe
            $formation = Formation::find($formationId);
            if (!$formation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Formation non trouvée'
                ], 404);
            }

            // Valider les données
            $validator = Validator::make($request->all(), [
                'formateurs_animateurs' => 'required|array',
                'formateurs_animateurs.*.formateur_animateur_id' => 'required|integer',
                'formateurs_animateurs.*.nom' => 'required|string|max:255',
                'formateurs_animateurs.*.prenom' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $addedAnimateurs = [];

            // Ajouter chaque formateur animateur
            foreach ($request->formateurs_animateurs as $animateur) {
                $newAnimateur = FormateurAnimateur::create([
                    'formation_id' => $formationId,
                    'formateur_animateur_id' => $animateur['formateur_animateur_id'],
                    'nom' => $animateur['nom'],
                    'prenom' => $animateur['prenom']
                ]);
                
                $addedAnimateurs[] = $newAnimateur;
            }

            return response()->json([
                'success' => true,
                'data' => $addedAnimateurs,
                'message' => 'Formateurs animateurs ajoutés avec succès'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout des formateurs animateurs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer tous les formateurs animateurs d'une formation
     */
    public function removeAllFromFormation($formationId)
    {
        try {
            // Vérifier si la formation existe
            $formation = Formation::find($formationId);
            if (!$formation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Formation non trouvée'
                ], 404);
            }

            // Supprimer tous les formateurs animateurs de la formation
            $count = FormateurAnimateur::where('formation_id', $formationId)->delete();

            return response()->json([
                'success' => true,
                'message' => $count . ' formateurs animateurs supprimés avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression des formateurs animateurs: ' . $e->getMessage()
            ], 500);
        }
    }
}