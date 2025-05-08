<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Add diagnostic logging in development
            if (config('app.debug')) {
                Log::info('Login attempt', [
                    'email' => $request->email,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }

            // Special handling for development mode role-specific accounts
            if (config('app.env') === 'local') {
                // Define development accounts for easy role switching
                $devAccounts = [
                    'admin@example.com' => [
                        'role' => 'admin',
                        'role_id' => 1
                    ],
                    'responsable.formation@example.com' => [
                        'role' => 'responsable_formation',
                        'role_id' => 2
                    ],
                    'responsable.dr@example.com' => [
                        'role' => 'responsable_dr',
                        'role_id' => 3
                    ],
                    'responsable.cdc@example.com' => [
                        'role' => 'responsable_cdc',
                        'role_id' => 4
                    ],
                    'formateur.animateur@example.com' => [
                        'role' => 'formateur_animateur',
                        'role_id' => 5
                    ],
                    'formateur.participant@example.com' => [
                        'role' => 'formateur_participant',
                        'role_id' => 6
                    ],
                ];
                
                // If email is a dev account and password is 'password'
                if (array_key_exists($request->email, $devAccounts) && $request->password === 'password') {
                    // Check if user exists in DB
                    $user = User::where('email', $request->email)->first();
                    
                    if (!$user) {
                        // Create the user if it doesn't exist
                        $user = User::create([
                            'name' => ucfirst(explode('@', $request->email)[0]),
                            'email' => $request->email,
                            'password' => bcrypt('password'),
                            'email_verified_at' => now(),
                            'role_id' => $devAccounts[$request->email]['role_id']
                        ]);
                    }
                    
                    // Authenticate the user
                    Auth::login($user);
                    
                    // Build user data with role information
                    $userData = $user->toArray();
                    $roleName = $devAccounts[$request->email]['role'];
                    $roleId = $devAccounts[$request->email]['role_id'];
                    
                    $userData['role_name'] = $roleName;
                    $userData['role'] = ['name' => $roleName, 'id' => $roleId];
                    
                    // Generate token
                    $token = $user->createToken('auth_token')->plainTextToken;
                    
                    return response()->json([
                        'message' => 'Dev account login successful',
                        'access_token' => $token,
                        'token_type' => 'Bearer',
                        'user' => $userData
                    ]);
                }
            }

            // Special handling for admin user in development
            if (config('app.env') === 'local' && $request->email === 'admin@example.com') {
                $user = User::where('email', $request->email)->first();

                // If admin user exists, bypass password check in development
                if ($user) {
                    // Authenticate the user
                    Auth::login($user);
                    
                    // Add role data
                    $userData = $user->toArray();
                    $userData['role_name'] = 'admin';
                    $userData['role'] = ['name' => 'admin', 'id' => 1];
                    
                    // Generate token
                    $token = $user->createToken('auth_token')->plainTextToken;
                    
                    return response()->json([
                        'message' => 'Admin login successful (dev mode)',
                        'access_token' => $token,
                        'token_type' => 'Bearer',
                        'user' => $userData
                    ]);
                }
            }

            // Regular authentication process
            if (!Auth::attempt($request->only('email', 'password'))) {
                // Authentication failed...
                return response()->json([
                    'message' => 'Email ou mot de passe incorrect',
                    'errors' => ['email' => [__('auth.failed')]]
                ], 401);
            }

            // Authentication passed...
            $user = Auth::user();

            // Eager load the role relationship if needed
            if (method_exists($user, 'role')) {
                $user->load('role');
            }

            // Create a Sanctum token for the user
            $token = $user->createToken('auth_token')->plainTextToken;

            // Get user role information
            $roleData = $this->getUserRoleData($user);

            // Merge role data with user data
            $userData = $user->toArray();
            $userData = array_merge($userData, $roleData);

            return response()->json([
                'message' => 'Login successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $userData
            ]);
        } catch (\Exception $e) {
            Log::error('Login exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'email' => $request->email ?? 'not provided'
            ]);
            
            // Return user-friendly error message
            return response()->json([
                'message' => 'Une erreur est survenue lors de la connexion. Veuillez réessayer.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get role data for the user
     * 
     * @param \App\Models\User $user
     * @return array
     */
    private function getUserRoleData($user)
    {
        // Default role data
        $roleData = [
            'role_name' => 'user',
            'role' => ['name' => 'user', 'id' => 0]
        ];

        // Try different approaches to get role information
        // 1. Check if user has a role relationship
        if (method_exists($user, 'role') && $user->role) {
            if (is_object($user->role)) {
                $roleData['role_name'] = $user->role->name;
                $roleData['role'] = [
                    'name' => $user->role->name,
                    'id' => $user->role->id
                ];
            } elseif (is_array($user->role)) {
                $roleData['role_name'] = $user->role['name'] ?? 'user';
                $roleData['role'] = $user->role;
            } elseif (is_string($user->role)) {
                $roleData['role_name'] = $user->role;
                $roleData['role'] = [
                    'name' => $user->role,
                    'id' => $this->getRoleIdFromName($user->role)
                ];
            }
        }
        // 2. Check if user has role_id field
        elseif (isset($user->role_id)) {
            $roleData['role_id'] = $user->role_id;
            $roleName = $this->getRoleNameFromId($user->role_id);
            $roleData['role_name'] = $roleName;
            $roleData['role'] = [
                'name' => $roleName,
                'id' => $user->role_id
            ];
        }

        return $roleData;
    }

    /**
     * Get role name from ID
     */
    private function getRoleNameFromId($id)
    {
        $roles = [
            1 => 'admin',
            2 => 'responsable_formation',
            3 => 'responsable_dr',
            4 => 'responsable_cdc',
            5 => 'formateur_animateur',
            6 => 'formateur_participant'
        ];
        
        return $roles[$id] ?? 'user';
    }

    /**
     * Get role ID from name
     */
    private function getRoleIdFromName($name)
    {
        $roles = [
            'admin' => 1,
            'responsable_formation' => 2,
            'responsable_dr' => 3,
            'responsable_cdc' => 4,
            'formateur_animateur' => 5,
            'formateur_participant' => 6
        ];
        
        return $roles[$name] ?? 0;
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revoke all tokens...
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
} 