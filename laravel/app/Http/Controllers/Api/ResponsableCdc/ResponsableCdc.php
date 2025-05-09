<?php

namespace App\Http\Controllers\Api\ResponsableCdc;
use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ResponsableCdc extends Controller
{
    /**
     * Afficher la liste des formations
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $formations = Formation::with('responsable')->get();
        return response()->json([
            'status' => 'success',
            'data' => $formations
        ]);
    }

    /**
     * Ajouter une nouvelle formation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
            'responsable_id' => 'required|exists:responsable_formations,id',
            'statut' => 'nullable|in:planifiee,en_cours,terminee,annulee,validee',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $formation = Formation::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Formation créée avec succès',
            'data' => $formation
        ], 201);
    }

    /**
     * Afficher une formation spécifique
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $formation = Formation::with('responsable')->find($id);
        
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
    }

    /**
     * Modifier une formation existante
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $formation = Formation::find($id);
        
        if (!$formation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formation non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
            'responsable_id' => 'sometimes|required|exists:responsable_formations,id',
            'statut' => 'nullable|in:planifiee,en_cours,terminee,annulee,validee',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $formation->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Formation mise à jour avec succès',
            'data' => $formation
        ]);
    }

    /**
     * Supprimer une formation
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $formation = Formation::find($id);
        
        if (!$formation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formation non trouvée'
            ], 404);
        }

        $formation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Formation supprimée avec succès'
        ]);
    }
}