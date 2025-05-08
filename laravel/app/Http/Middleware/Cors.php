<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // Read origins from .env via CORS_ALLOWED_ORIGINS
        $allowedOrigins = env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174');
        $origins = explode(',', $allowedOrigins);
        
        // Get the origin from the request
        $requestOrigin = $request->header('Origin');
        
        // If the request origin is in the allowed origins list, use it specifically
        if ($requestOrigin && in_array($requestOrigin, $origins)) {
            $response->headers->set('Access-Control-Allow-Origin', $requestOrigin);
        } else {
            // Default to the first allowed origin (or use '*' for development)
            $response->headers->set('Access-Control-Allow-Origin', $origins[0] ?? '*');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN, X-CSRF-TOKEN, Accept');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '3600');
        
        return $response;
    }
} 