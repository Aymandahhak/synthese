<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SessionFormation;
use App\Http\Resources\SessionFormationResource;
use App\Models\User; // Import User model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SessionFormationController extends Controller
{
    /**
     * Display a listing of the resource.
     * Apply filtering/sorting as needed.
     */
    public function index(Request $request)
    {
        // Authorization is handled by the route middleware ('role:responsable_formation')
        
        // Start query, load formateur relationship for the resource
        $query = SessionFormation::with('formateur')->orderBy('date_debut', 'desc');

        // TODO: Add filtering based on $request parameters (status, date range, etc.) if needed
        // Example: 
        // if ($request->query('status')) { 
        //     $query->where('etat', $request->query('status')); 
        // }

        $sessions = $query->paginate(15); // Paginate results

        return SessionFormationResource::collection($sessions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'formateur_user_id' => [
                'required',
                'integer',
                // Ensure the user exists and has a role that can be a formateur (e.g., formateur_animateur)
                Rule::exists('users', 'id')->where(function ($query) {
                    // Adjust role check as necessary based on your user roles
                    $query->whereIn('role', ['formateur_animateur', 'formateur_participant', 'admin']); 
                }),
            ],
            'etat' => ['nullable', Rule::in(['planifiee', 'en_cours', 'terminee', 'annulee', 'validee'])], // Default is 'planifiee' in migration
            'location_type' => ['nullable', Rule::in(['local', 'distance', 'hybride'])],
            'location_details' => 'nullable|string|max:255',
            'max_participants' => 'nullable|integer|min:1',
            'category' => ['nullable', Rule::in(['technique', 'pedagogique', 'soft_skills', 'management', 'autre'])],
        ]);

        // Set default status if not provided
        if (!isset($validated['etat'])) {
            $validated['etat'] = 'planifiee';
        }

        $session = SessionFormation::create($validated);

        // Load the formateur relationship before returning the resource
        $session->load('formateur'); 

        return response()->json(
             new SessionFormationResource($session),
             201 // HTTP status code for Created
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(SessionFormation $session)
    {
        // Ensure the relationship is loaded
        $session->load('formateur'); 
        return new SessionFormationResource($session);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SessionFormation $session)
    {
        // Similar validation as store, but adjust as needed (e.g., unique checks)
         $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after_or_equal:date_debut',
            'formateur_user_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->whereIn('role', ['formateur_animateur', 'formateur_participant', 'admin']);
                }),
            ],
            'etat' => ['sometimes', 'required', Rule::in(['planifiee', 'en_cours', 'terminee', 'annulee', 'validee'])],
            'location_type' => ['sometimes', 'nullable', Rule::in(['local', 'distance', 'hybride'])],
            'location_details' => 'sometimes|nullable|string|max:255',
            'max_participants' => 'sometimes|nullable|integer|min:1',
            'category' => ['sometimes', 'nullable', Rule::in(['technique', 'pedagogique', 'soft_skills', 'management', 'autre'])],
        ]);

        $session->update($validated);
        $session->load('formateur');

        return new SessionFormationResource($session);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SessionFormation $session)
    {
        $session->delete();
        // return response()->noContent(); // Standard RESTful response for delete
         return response()->json(['message' => 'Session deleted successfully.'], 200);
    }

    // Add validateSession method if needed later
    /*
    public function validateSession(SessionFormation $session)
    {
        // Logic to change status to 'validee'
        $session->update(['etat' => 'validee']);
        $session->load('formateur');
        return new SessionFormationResource($session);
    }
    */
}
