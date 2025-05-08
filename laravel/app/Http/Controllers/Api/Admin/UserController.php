<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::with('role')
                   ->orderBy('name')
                   ->paginate(15);

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id'),
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'email_verified_at' => now(),
        ]);

        $user->load('role');

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): JsonResponse
    {
        $user->load('role');
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('roles', 'id'),
            ],
        ]);

        $updateData = [];
        if (isset($validated['name'])) {
            $updateData['name'] = $validated['name'];
        }
        if (isset($validated['email'])) {
            $updateData['email'] = $validated['email'];
        }
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }
        if (isset($validated['role_id'])) {
            $updateData['role_id'] = $validated['role_id'];
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        $user->load('role');

        return response()->json($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->role && $user->role->name === 'admin') {
             $adminCount = User::whereHas('role', function ($query) {
                $query->where('name', 'admin');
             })->count();
             if ($adminCount <= 1) {
                 return response()->json(['message' => 'Cannot delete the last admin user.'], 403);
             }
        }
        
        $user->delete();

        return response()->json(null, 204);
    }
}
