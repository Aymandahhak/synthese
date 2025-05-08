<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\Region;
use App\Models\Filiere;
use App\Models\Formation;
use App\Models\SessionFormation;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Get stats for admin dashboard
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboardStats(): JsonResponse
    {
        $responsableFormCount = User::whereHas('role', function($q) {
            $q->where('name', 'responsable_formation');
        })->count();
        
        $stats = [
            'usersCount' => User::count(),
            'responsablesFormCount' => $responsableFormCount,
            'formationsCount' => Formation::count(),
            'sessionsCount' => SessionFormation::count(),
            'regionsCount' => Region::count(),
            'filieresCount' => Filiere::count(),
        ];
        
        return response()->json($stats);
    }
    
    /**
     * Get all regions
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRegions(): JsonResponse
    {
        $regions = Region::orderBy('name')->paginate(15);
        return response()->json($regions);
    }
    
    /**
     * Create a new region
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createRegion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:regions',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'sometimes|boolean',
        ]);

        $region = Region::create($validated);
        return response()->json($region, 201);
    }
    
    /**
     * Update an existing region
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Region  $region
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateRegion(Request $request, Region $region): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:regions,name,' . $region->id,
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'sometimes|boolean',
        ]);

        $region->update($validated);
        return response()->json($region);
    }
    
    /**
     * Delete a region
     *
     * @param  \App\Models\Region  $region
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteRegion(Region $region): JsonResponse
    {
        $region->delete();
        return response()->json(['message' => 'Région supprimée avec succès'], 200);
    }

    /**
     * Get all filieres
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFilieres(): JsonResponse
    {
        $filieres = Filiere::orderBy('name')->paginate(15);
        return response()->json($filieres);
    }
    
    /**
     * Create a new filiere
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createFiliere(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:filieres',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'sometimes|boolean',
        ]);

        $filiere = Filiere::create($validated);
        return response()->json($filiere, 201);
    }
    
    /**
     * Update an existing filiere
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Filiere  $filiere
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateFiliere(Request $request, Filiere $filiere): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:filieres,name,' . $filiere->id,
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'sometimes|boolean',
        ]);

        $filiere->update($validated);
        return response()->json($filiere);
    }
    
    /**
     * Delete a filiere
     *
     * @param  \App\Models\Filiere  $filiere
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteFiliere(Filiere $filiere): JsonResponse
    {
        $filiere->delete();
        return response()->json(['message' => 'Filière supprimée avec succès'], 200);
    }
} 