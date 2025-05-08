<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SessionFormation;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SessionController extends Controller
{
    /**
     * Display a listing of the sessions with pagination and optional filtering.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = SessionFormation::with(['formation', 'formateur'])
            ->orderBy('date_debut', 'desc');
        
        // Apply filters if provided
        if ($request->has('formation_id')) {
            $query->where('formation_id', $request->formation_id);
        }
        
        if ($request->has('formateur_id')) {
            $query->where('formateur_id', $request->formateur_id);
        }
        
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }
        
        if ($request->has('date_debut_min')) {
            $query->where('date_debut', '>=', $request->date_debut_min);
        }
        
        if ($request->has('date_fin_max')) {
            $query->where('date_fin', '<=', $request->date_fin_max);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('formation', function($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%");
            });
        }
        
        $sessions = $query->paginate(15);
        
        return response()->json($sessions);
    }

    /**
     * Store a newly created session in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'formation_id' => 'required|exists:formations,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'lieu' => 'required|string|max:255',
            'formateur_id' => 'nullable|exists:users,id',
            'capacite_max' => 'nullable|integer|min:1',
            'statut' => 'required|in:planifiee,en_cours,terminee,annulee',
            'commentaires' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            
            // Verify the formation exists
            $formation = Formation::findOrFail($request->formation_id);
            
            // Create the session
            $session = SessionFormation::create($validator->validated());
            
            DB::commit();
            
            return response()->json(
                SessionFormation::with(['formation', 'formateur'])->find($session->id),
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création de la session', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified session.
     *
     * @param SessionFormation $session
     * @return JsonResponse
     */
    public function show(SessionFormation $session): JsonResponse
    {
        return response()->json(
            $session->load(['formation', 'formateur', 'participants'])
        );
    }

    /**
     * Update the specified session in storage.
     *
     * @param Request $request
     * @param SessionFormation $session
     * @return JsonResponse
     */
    public function update(Request $request, SessionFormation $session): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'formation_id' => 'sometimes|required|exists:formations,id',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after_or_equal:date_debut',
            'lieu' => 'sometimes|required|string|max:255',
            'formateur_id' => 'nullable|exists:users,id',
            'capacite_max' => 'nullable|integer|min:1',
            'statut' => 'sometimes|required|in:planifiee,en_cours,terminee,annulee',
            'commentaires' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            
            // Update the session
            $session->update($validator->validated());
            
            DB::commit();
            
            return response()->json(
                $session->load(['formation', 'formateur'])
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la mise à jour de la session', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified session from storage.
     *
     * @param SessionFormation $session
     * @return JsonResponse
     */
    public function destroy(SessionFormation $session): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            // Delete related records if needed
            // For example, detach participants
            $session->participants()->detach();
            
            // Delete the session
            $session->delete();
            
            DB::commit();
            
            return response()->json(['message' => 'Session supprimée avec succès']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression de la session', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get a list of formatters for dropdown selection.
     * 
     * @return JsonResponse
     */
    public function getFormateurs(): JsonResponse
    {
        // Get users with formateur roles
        $formateurs = User::whereHas('role', function($query) {
            $query->whereIn('name', ['formateur', 'formateur_animateur', 'animateur']);
        })->select('id', 'name', 'email')
          ->orderBy('name')
          ->get();
          
        return response()->json($formateurs);
    }
}
