<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
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

        foreach ($roles as $role) {
            // Check if user has any of the required roles
            if ($request->user()->role->name === $role) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Unauthorized - Insufficient permissions'
        ], 403);
    }
} 