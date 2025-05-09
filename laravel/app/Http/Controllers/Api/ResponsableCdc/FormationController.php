<?php

namespace App\Http\Controllers\Api\ResponsableCdc;
use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\FormateurAnimateur;
use App\Models\ResponsableFormation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FormationController extends Controller
{
    /**
     * Display a listing of the formations.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $formations = Formation::with(['responsable.user', 'region', 'filiere'])->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $formations
        ]);
    }

    /**
     * Store a newly created formation in storage.
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
            'region_id' => 'nullable|exists:regions,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'image' => 'nullable|image|max:2048', // 2MB max
            'type_formation' => 'required|in:présentiel,à distance,hybride', 

        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Traitement de l'image si elle existe
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('formations', 'public');
            $data['image'] = $path;
        }
        
        $formation = Formation::create($data);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Formation créée avec succès',
            'data' => $formation->load(['responsable.user', 'region', 'filiere'])
        ], 201);
    }

    /**
     * Display the specified formation.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $formation = Formation::with(['responsable.user', 'region', 'filiere'])->findOrFail($id);
        
        return response()->json([
            'status' => 'success',
            'data' => $formation
        ]);
    }

    /**
     * Update the specified formation in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $formation = Formation::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
            'responsable_id' => 'sometimes|required|exists:responsable_formations,id',
            'statut' => 'sometimes|required|in:pending,validated,rejected',
            'region_id' => 'nullable|exists:regions,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'image' => 'nullable|image|max:2048', // 2MB max
            'type_formation' => 'sometimes|required|in:présentiel,à distance,hybride', 

        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Traitement de l'image si elle existe
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($formation->image) {
                Storage::disk('public')->delete($formation->image);
            }
            
            $path = $request->file('image')->store('formations', 'public');
            $data['image'] = $path;
        }
        
        $formation->update($data);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Formation mise à jour avec succès',
            'data' => $formation->load(['responsable.user', 'region', 'filiere'])
        ]);
    }

    /**
     * Remove the specified formation from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $formation = Formation::findOrFail($id);
        
        // Supprimer l'image associée si elle existe
        if ($formation->image) {
            Storage::disk('public')->delete($formation->image);
        }
        
        $formation->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Formation supprimée avec succès'
        ]);
    }
    
    /**
     * Change formation status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function changeStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:pending,validated,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $formation = Formation::findOrFail($id);
        $formation->statut = $request->statut;
        $formation->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Statut de formation mis à jour avec succès',
            'data' => $formation
        ]);
    }
    
    /**
     * Get formateurs of a formation.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getFormateurs($id)
    {
        $formation = Formation::findOrFail($id);
        $formateurs = FormateurAnimateur::where('formation_id', $id)->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $formateurs
        ]);
    }
    
    /**
     * Assign a formateur to a formation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function assignFormateur(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'formation_id' => 'required|exists:formations,id',
            'formateur_animateur_id' => 'required|integer',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier si le formateur est déjà assigné à cette formation
        $existingAssignment = FormateurAnimateur::where('formation_id', $request->formation_id)
            ->where('formateur_animateur_id', $request->formateur_animateur_id)
            ->first();
            
        if ($existingAssignment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ce formateur est déjà assigné à cette formation'
            ], 422);
        }
        
        $formateurAnimateur = FormateurAnimateur::create([
            'formation_id' => $request->formation_id,
            'formateur_animateur_id' => $request->formateur_animateur_id,
            'nom' => $request->nom,
            'prenom' => $request->prenom
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Formateur assigné avec succès',
            'data' => $formateurAnimateur
        ], 201);
    }
    
    /**
     * Update formateur status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateFormateurStatus(Request $request, $id)
    {
        $formateurAnimateur = FormateurAnimateur::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $formateurAnimateur->update($request->all());
        
        return response()->json([
            'status' => 'success',
            'message' => 'Informations du formateur mises à jour avec succès',
            'data' => $formateurAnimateur
        ]);
    }
    
    /**
     * Remove formateur from formation.
     *
     * @param  int  $formationId
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function removeFormateur($formationId, $userId)
    {
        $formateurAnimateur = FormateurAnimateur::where('formation_id', $formationId)
            ->where('formateur_animateur_id', $userId)
            ->firstOrFail();
            
        $formateurAnimateur->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Formateur retiré de la formation avec succès'
        ]);
    }
    
    /**
     * Get formations by responsable.
     *
     * @param  int  $responsableId
     * @return \Illuminate\Http\Response
     */
    public function getFormationsByResponsable($responsableId)
    {
        $responsable = ResponsableFormation::findOrFail($responsableId);
        $formations = $responsable->formations()->with(['region', 'filiere'])->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $formations
        ]);
    }
    
    /**
     * Get pending formations.
     *
     * @return \Illuminate\Http\Response
     */
    public function getPendingFormations()
    {
        $formations = Formation::where('statut', 'pending')
            ->with(['responsable.user', 'region', 'filiere'])
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $formations
        ]);
    }
    
    /**
     * Get validated formations.
     *
     * @return \Illuminate\Http\Response
     */
    public function getValidatedFormations()
    {
        $formations = Formation::where('statut', 'validated')
            ->with(['responsable.user', 'region', 'filiere'])
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $formations
        ]);
    }
    
    /**
     * Search formations.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function searchFormations(Request $request)
    {
        $query = Formation::query()->with(['responsable.user', 'region', 'filiere']);
        
        // Filtres
        if ($request->has('titre')) {
            $query->where('titre', 'like', '%' . $request->titre . '%');
        }
        
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }
        
        if ($request->has('region_id')) {
            $query->where('region_id', $request->region_id);
        }
        
        if ($request->has('filiere_id')) {
            $query->where('filiere_id', $request->filiere_id);
        }
        
        if ($request->has('date_debut')) {
            $query->whereDate('date_debut', '>=', $request->date_debut);
        }
        
        if ($request->has('date_fin')) {
            $query->whereDate('date_fin', '<=', $request->date_fin);
        }
        
        // Tri
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $query->orderBy($sortBy, $sortOrder);
        
        // Pagination
        $perPage = $request->input('per_page', 15);
        $formations = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'data' => $formations
        ]);
    }
}