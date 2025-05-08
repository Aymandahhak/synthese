<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FiliereController extends Controller
{
    /**
     * Display a listing of the filieres.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $filieres = Filiere::orderBy('name')->get();
        return response()->json($filieres);
    }

    /**
     * Store a newly created filiere in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:filieres',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filiere = Filiere::create($request->all());
        return response()->json($filiere, 201);
    }

    /**
     * Display the specified filiere.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $filiere = Filiere::findOrFail($id);
        return response()->json($filiere);
    }

    /**
     * Update the specified filiere in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $filiere = Filiere::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:filieres,name,' . $id,
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filiere->update($request->all());
        return response()->json($filiere);
    }

    /**
     * Remove the specified filiere from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $filiere = Filiere::findOrFail($id);
        
        // Check if the filiere is associated with any formations
        if ($filiere->formations()->count() > 0) {
            return response()->json([
                'message' => 'Cette filière ne peut pas être supprimée car elle est utilisée par des formations.'
            ], 422);
        }
        
        $filiere->delete();
        return response()->json(['message' => 'Filière supprimée avec succès']);
    }
} 