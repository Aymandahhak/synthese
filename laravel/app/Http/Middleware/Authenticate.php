<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            abort(response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated. Please login first.',
                'login_url' => url('/api/login')
            ], 401));
        }
        
        return route('login');
    }
} 