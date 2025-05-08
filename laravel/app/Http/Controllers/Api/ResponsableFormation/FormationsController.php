<?php

namespace App\Http\Controllers\Api\Responsable;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\Request;
use App\Http\Resources\FormationResource; // Create using: php artisan make:resource FormationResource
use Illuminate\Support\Facades\Auth; // Import Auth facade

class FormationsController extends Controller
{
    /**
     * Display a listing of the resource owned by the logged-in responsable.
     */
    public function index(Request $request)
    {
        $responsableId = Auth::id();
        // Add logic to fetch formations, potentially filtered or paginated
        // Assuming a 'responsable_id' foreign key exists on the Formation model
        // $formations = Formation::where('responsable_id', $responsableId)
        //                    ->latest()
        //                    ->paginate(10);
        
        // TEMPORARY: Remove ownership filter if 'responsable_id' doesn't exist yet
        $formations = Formation::latest()->paginate(10);
        
        return FormationResource::collection($formations);
    }

    /**
     * Store a newly created resource in storage, associating with the logged-in responsable.
     */
    public function store(Request $request)
    {
        $responsableId = Auth::id();
        
        // TODO: Update validation rules based on your Formation model fields
        $validatedData = $request->validate([
            'titre' => 'required|string|max:255', // Example field, rename if needed
            'description' => 'nullable|string',
            // 'date_debut' => 'required|date',
            // 'date_fin' => 'required|date|after_or_equal:date_debut',
            // 'statut' => 'required|in:planifiée,validée,terminée', 
        ]);

        // Add the responsable_id before creating
        // $validatedData['responsable_id'] = $responsableId; 

        // TEMPORARY: Remove 'responsable_id' if the field doesn't exist yet
        $formation = Formation::create($validatedData);

        // Load the relationship if it exists and is needed in the response
        // $formation->load('responsable'); 

        return response()->json(new FormationResource($formation), 201); // Return 201 Created status
    }

    /**
     * Display the specified resource. Add ownership check if needed.
     */
    public function show(Formation $formation)
    {
        // Optional: Add ownership check if only the owner can view
        // if ($formation->responsable_id !== Auth::id()) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }
        // $formation->load('responsable'); 
        return new FormationResource($formation);
    }

    /**
     * Update the specified resource in storage. Add ownership check.
     */
    public function update(Request $request, Formation $formation)
    {
         // Ensure the authenticated user owns this formation
         // if ($formation->responsable_id !== Auth::id()) {
         //    return response()->json(['message' => 'Unauthorized'], 403);
         // }
         
         // TODO: Update validation rules based on your Formation model fields
         $validatedData = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            // 'date_debut' => 'sometimes|required|date',
            // 'date_fin' => 'sometimes|required|date|after_or_equal:date_debut',
            // 'statut' => 'sometimes|required|in:planifiée,validée,terminée', 
        ]);

        $formation->update($validatedData);
        // $formation->load('responsable'); 

        return new FormationResource($formation);
    }

    /**
     * Remove the specified resource from storage. Add ownership check.
     */
    public function destroy(Formation $formation)
    {
        // Ensure the authenticated user owns this formation
        // if ($formation->responsable_id !== Auth::id()) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }
        
        $formation->delete();

        // Consider what associated data might need cleanup (e.g., sessions linked to this formation)

        return response()->json(null, 204); // Return 204 No Content status
    }
}