<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the authenticated user's profile.
     */
    public function show(Request $request)
    {
        $user = Auth::user();
        // return new UserResource($user); // Example using a resource
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            // Add other relevant profile fields
        ]);
    }

    /**
     * Update the authenticated user's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            // Add validation for other updatable fields
        ]);

        // $user->update($validated);

        return response()->json(['message' => 'Profile updated successfully (placeholder)', 'user' => $validated]);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password', // Uses Laravel's built-in check
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Auth::user()->update([
        //     'password' => Hash::make($validated['password']),
        // ]);

        return response()->json(['message' => 'Password updated successfully (placeholder)']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
