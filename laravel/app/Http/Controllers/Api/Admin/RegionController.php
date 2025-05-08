<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RegionController extends Controller
{
    /**
     * Display a listing of the regions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $regions = Region::orderBy('name')->get();
        return response()->json($regions);
    }

    /**
     * Store a newly created region in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:regions',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $region = Region::create($request->all());
        return response()->json($region, 201);
    }

    /**
     * Display the specified region.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $region = Region::findOrFail($id);
        return response()->json($region);
    }

    /**
     * Update the specified region in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $region = Region::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:regions,name,' . $id,
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $region->update($request->all());
        return response()->json($region);
    }

    /**
     * Remove the specified region from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $region = Region::findOrFail($id);
        
        // Check if the region is associated with any formations
        if ($region->formations()->count() > 0) {
            return response()->json([
                'message' => 'Cette région ne peut pas être supprimée car elle est utilisée par des formations.'
            ], 422);
        }
        
        $region->delete();
        return response()->json(['message' => 'Région supprimée avec succès']);
    }
} 