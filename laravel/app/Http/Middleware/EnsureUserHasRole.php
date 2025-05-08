<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles // Accept one or more roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) { // First check if user is authenticated
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = Auth::user();

        // Check if the user has any of the required roles
        foreach ($roles as $role) {
            if ($user->role === $role) { // Assumes user model has a 'role' attribute
                return $next($request);
            }
        }

        // If user doesn't have any of the required roles
        return response()->json(['message' => 'This action is unauthorized.'], 403); // Forbidden
    }
}
