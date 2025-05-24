<?php

namespace App\Http\Controllers\Api\ResponsableFormation;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\Request;
use App\Http\Resources\FormationResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class FormationsController extends Controller
{
    /**
     * Display a listing of the resource owned by the logged-in responsable.
     */
    public function index(Request $request)
    {
        try {
            // Get all formations
            $formations = Formation::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Liste des formations récupérée avec succès',
                'data' => $formations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching formations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des formations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage, associating with the logged-in responsable.
     */
    public function store(Request $request)
    {
        try {
            // Validate the request data
        $validatedData = $request->validate([
                'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after_or_equal:date_debut',
                'lieu' => 'nullable|string|max:255',
                'capacite_max' => 'nullable|integer|min:1',
                'responsable_id' => 'nullable|integer',
                'region_id' => 'nullable|integer',
                'filiere_id' => 'nullable|integer',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ]);
            
            // Set default status if not provided
            $validatedData['statut'] = $request->input('statut', 'en_attente_validation');
            
            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                
                // Store the image in the public directory
                $image->move(public_path('images/formations'), $imageName);
                $validatedData['image'] = '/images/formations/' . $imageName;
            }
            
            // Create the formation
        $formation = Formation::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Formation créée avec succès',
                'data' => $formation
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating formation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified formation.
     */
    public function show($id)
    {
        try {
            $formation = Formation::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $formation
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching formation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Formation non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified formation.
     */
    public function update(Request $request, $id)
    {
        try {
            $formation = Formation::findOrFail($id);
            
            // Validate the request data
         $validatedData = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
                'date_debut' => 'sometimes|required|date',
                'date_fin' => 'sometimes|required|date|after_or_equal:date_debut',
                'lieu' => 'nullable|string|max:255',
                'capacite_max' => 'nullable|integer|min:1',
                'statut' => 'nullable|string|in:en_attente_validation,validee,rejetee,terminee',
                'region_id' => 'nullable|integer',
                'filiere_id' => 'nullable|integer',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ]);
            
            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if it exists
                if ($formation->image && file_exists(public_path($formation->image))) {
                    unlink(public_path($formation->image));
                }
                
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                
                // Store the image in the public directory
                $image->move(public_path('images/formations'), $imageName);
                $validatedData['image'] = '/images/formations/' . $imageName;
            }
            
            // Update the formation
        $formation->update($validatedData);
            
            return response()->json([
                'success' => true,
                'message' => 'Formation mise à jour avec succès',
                'data' => $formation
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating formation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified formation.
     */
    public function destroy($id)
    {
        try {
            $formation = Formation::findOrFail($id);
            
            // Delete the image file if it exists
            if ($formation->image && file_exists(public_path($formation->image))) {
                unlink(public_path($formation->image));
            }
            
            // Delete the formation
        $formation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Formation supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting formation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}