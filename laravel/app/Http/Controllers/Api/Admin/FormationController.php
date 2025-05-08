<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FormationController extends Controller
{
    /**
     * Display a listing of the resource with pagination.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $formations = Formation::orderBy('title')->paginate(15);
        return response()->json($formations);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:formations',
            'description' => 'nullable|string',
            'objectif' => 'nullable|string',
            'duree_jours' => 'nullable|integer|min:0',
            'filiere_id' => 'nullable|exists:filieres,id',
            'region_id' => 'nullable|exists:regions,id',
            'active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $formation = Formation::create($validated);
        return response()->json($formation, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Formation  $formation
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Formation $formation): JsonResponse
    {
        return response()->json($formation);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Formation  $formation
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Formation $formation): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:formations,title,' . $formation->id,
            'description' => 'nullable|string',
            'objectif' => 'nullable|string',
            'duree_jours' => 'nullable|integer|min:0',
            'filiere_id' => 'nullable|exists:filieres,id',
            'region_id' => 'nullable|exists:regions,id',
            'active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $formation->update($validated);
        return response()->json($formation);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Formation  $formation
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Formation $formation): JsonResponse
    {
        $formation->delete();
        return response()->json(['message' => 'Formation supprimée avec succès'], 200);
    }
}
