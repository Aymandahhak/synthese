<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Allow OPTIONS requests to pass through (for CORS preflight)
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }
        
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get role from user
        $userRole = $request->user()->role;
        
        // Handle when role relation is not loaded
        if (!$userRole) {
            $request->user()->load('role');
            $userRole = $request->user()->role;
        }
        
        // Get role name, handling different possible structures
        $roleName = '';
        if (is_string($userRole)) {
            $roleName = $userRole;
        } elseif (is_object($userRole) && isset($userRole->name)) {
            $roleName = $userRole->name;
        } elseif (isset($request->user()->role_name)) {
            $roleName = $request->user()->role_name;
        }
        
        // If no valid role found
        if (empty($roleName)) {
            return response()->json([
                'message' => 'User role could not be determined',
                'user' => $request->user()->toArray()
            ], 403);
        }

        // Check if user has any of the required roles
        foreach ($roles as $role) {
            if ($roleName === $role) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Unauthorized - Insufficient permissions'
        ], 403);
    }
}
