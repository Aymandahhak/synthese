<?php

namespace App\Http\Controllers\Api\ResponsableCdc;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Formation;
use App\Models\Region;
use App\Models\Filiere;
use App\Models\ResponsableFormation;
use App\Models\FormateurAnimateur;
use App\Models\User;
use App\Models\Formateur;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class GereFormationController extends Controller
{
    // Formations API
    public function index()
    {
        $formations = Formation::with(['region', 'filiere', 'formateurAnimateurs'])
            ->get();
        return response()->json([
            'status' => 'success',
            'data' => $formations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'lieu' => 'nullable|string',
            'capacite_max' => 'nullable|integer',
            'responsable_id' => 'required|exists:responsable_formations,id',
            'region_id' => 'nullable|exists:regions,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'type_formation' => 'required|in:présentiel,à distance,hybride'
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
            'data' => $formation
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $formation = Formation::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|string',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|date|after:date_debut',
            'lieu' => 'nullable|string',
            'capacite_max' => 'nullable|integer',
            'region_id' => 'nullable|exists:regions,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'type_formation' => 'sometimes|in:présentiel,à distance,hybride'
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
            'data' => $formation
        ]);
    }

    public function destroy($id)
    {
        $formation = Formation::findOrFail($id);
        $formation->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Formation supprimée avec succès'
        ]);
    }

    // Regions API
    public function getRegions()
    {
        $regions = Region::all();
        return response()->json([
            'status' => 'success',
            'data' => $regions
        ]);
    }

    public function storeRegion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'code' => 'nullable|string',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $region = Region::create($request->all());
        return response()->json([
            'status' => 'success',
            'data' => $region
        ], 201);
    }

    // Filieres API
    public function getFilieres()
    {
        $filieres = Filiere::all();
        return response()->json([
            'status' => 'success',
            'data' => $filieres
        ]);
    }

    public function storeFiliere(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'code' => 'nullable|string',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $filiere = Filiere::create($request->all());
        return response()->json([
            'status' => 'success',
            'data' => $filiere
        ], 201);
    }

    // Formateur Animateur API
    public function getFormateurAnimateurs()
    {
        try {
            $formateurAnimateurs = FormateurAnimateur::with('formation')
                ->orderBy('nom')
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $formateurAnimateurs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des formateurs animateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function assignFormateurAnimateur(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'formation_id' => 'required|exists:formations,id',
            'nom' => 'required|string',
            'prenom' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $formateurAnimateur = FormateurAnimateur::create($request->all());
        return response()->json([
            'status' => 'success',
            'data' => $formateurAnimateur
        ], 201);
    }

    public function removeFormateurAnimateur($id)
    {
        $formateurAnimateur = FormateurAnimateur::findOrFail($id);
        $formateurAnimateur->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Formateur animateur retiré avec succès'
        ]);
    }

    // Users API
    public function getUsers()
    {
        try {
            $users = User::all();
            return response()->json([
                'status' => 'success',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'nullable|exists:roles,id',
            'avatar' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id,
                'avatar' => $request->avatar
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'role_id' => 'nullable|exists:roles,id',
            'avatar' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->except('password');
            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return response()->json([
                'status' => 'success',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Utilisateur supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Formateurs API
    public function getFormateurs()
    {
        try {
            $formateurs = Formateur::with(['user', 'region', 'filiere'])->get();
            return response()->json([
                'status' => 'success',
                'data' => $formateurs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des formateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeFormateur(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'formation_id' => 'required|exists:formations,id',
            'specialite' => 'nullable|string',
            'region_id' => 'nullable|exists:regions,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'matricule' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Log the request data for debugging
            \Log::info('Creating formateur with data:', $request->all());
            
            $formateur = Formateur::create($request->all());
            
            // Log the created formateur
            \Log::info('Created formateur:', $formateur->toArray());
            
            return response()->json([
                'status' => 'success',
                'data' => $formateur
            ], 201);
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error creating formateur:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création du formateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateFormateur(Request $request, $id)
    {
        $formateur = Formateur::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'user_id' => 'sometimes|exists:users,id',
            'specialite' => 'nullable|string',
            'region_id' => 'nullable|exists:regions,id',
            'filiere_id' => 'nullable|exists:filieres,id',
            'matricule' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $formateur->update($request->all());
            return response()->json([
                'status' => 'success',
                'data' => $formateur
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour du formateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteFormateur($id)
    {
        try {
            $formateur = Formateur::findOrFail($id);
            $formateur->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Formateur supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression du formateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Special API for Users with Formateur info
    public function getUsersWithFormateur()
    {
        try {
            $users = User::with(['formateur' => function($query) {
                $query->with(['region', 'filiere']);
            }])->get();

            return response()->json([
                'status' => 'success',
                'data' => $users->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                        'role_id' => $user->role_id,
                        'formateur' => $user->formateur ? [
                            'id' => $user->formateur->id,
                            'specialite' => $user->formateur->specialite,
                            'matricule' => $user->formateur->matricule,
                            'region' => $user->formateur->region ? [
                                'id' => $user->formateur->region->id,
                                'nom' => $user->formateur->region->nom
                            ] : null,
                            'filiere' => $user->formateur->filiere ? [
                                'id' => $user->formateur->filiere->id,
                                'nom' => $user->formateur->filiere->nom
                            ] : null
                        ] : null
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des utilisateurs avec leurs informations de formateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 