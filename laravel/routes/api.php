<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ResponsableFormation\ResponsableFormationController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\PresenceController;
use App\Http\Controllers\Api\ReportController;
// use App\Http\Controllers\Api\ProfileController; // Commented out as the class doesn't exist
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Models\User;
use App\Models\Role;
use App\Http\Controllers\Api\Admin\FormationController as AdminFormationController;
use App\Http\Controllers\Api\Admin\SessionController as AdminSessionFormationController;
//cdc
use App\Http\Controllers\Api\Responsablecdc\FormationController;
use App\Http\Controllers\Api\Responsablecdc\FormateurFormationController;
use App\Http\Controllers\Api\Responsablecdc\FormateurAnimateurController; 
use App\Http\Controllers\Api\Responsablecdc\UserController; 
use App\Http\Controllers\Api\ResponsableCdc\GereFormationController;

// Global CORS handling for all OPTIONS requests
Route::options('/{any}', function() {
    return response('', 200)
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN')
        ->header('Access-Control-Allow-Origin', '*');
})->where('any', '.*');

// Public route for testing API connection
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API Laravel connectée et fonctionnelle',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Root test API endpoint
Route::get('/root-test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Root API test endpoint',
        'timestamp' => now()->toDateTimeString(),
        'laravel_version' => app()->version(),
        'database_connected' => DB::connection()->getPdo() ? true : false,
        'note' => 'This route is working because it\'s in api.php'
    ]);
});

// Main connection endpoint for React
Route::get('/main', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Connexion à l\'API Laravel réussie',
        'timestamp' => now()->toDateTimeString(),
        'api_status' => [
            'version' => '1.0',
            'laravel_version' => app()->version(),
            'database_connected' => DB::connection()->getPdo() ? true : false,
            'database_name' => DB::connection()->getDatabaseName(),
            'tables' => [
                'formations_exists' => Schema::hasTable('formations'),
                'personal_access_tokens_exists' => Schema::hasTable('personal_access_tokens')
            ]
        ],
        'endpoints' => [
            'api_test' => '/api/connection-status',
            'api_root_test' => '/api/root-test',
            'diagnostic_routes' => [
                'database_fix' => '/api/fix-database',
                'test_create' => '/api/test-create-formation'
            ]
        ]
    ]);
});

// Additional connection test endpoint specifically for the React app
Route::get('/connection-status', function () {
    try {
        $dbConnected = false;
        $dbError = null;
        $dbName = null;
        $tables = [];
        
        try {
            $connection = DB::connection()->getPdo();
            $dbConnected = true;
            $dbName = DB::connection()->getDatabaseName();
            
            // Check for essential tables
            $tables = [
                'formations' => Schema::hasTable('formations'),
                'users' => Schema::hasTable('users'),
                'personal_access_tokens' => Schema::hasTable('personal_access_tokens'),
                'migrations' => Schema::hasTable('migrations')
            ];
        } catch (\Exception $e) {
            $dbError = $e->getMessage();
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'API Connection Test Successful',
            'timestamp' => now()->toDateTimeString(),
            'laravel_version' => app()->version(),
            'api_version' => '1.0',
            'database' => [
                'connected' => $dbConnected,
                'name' => $dbName,
                'error' => $dbError,
                'tables' => $tables
            ],
            'request_info' => [
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'method' => request()->method(),
                'path' => request()->path()
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'API Connection Test Failed',
            'error' => $e->getMessage(),
            'timestamp' => now()->toDateTimeString()
        ], 500);
    }
});

// Public routes for development without authentication
// Remove or protect these routes before production deployment
Route::prefix('public')->group(function () {
    // Responsable Formation profile and formations
    Route::get('/responsable-formation/profile', function() {
        // Temporary placeholder response until controllers are fully implemented
        return response()->json([
            'id' => 1,
            'name' => 'Responsable Formation',
            'role' => 'Responsable Formation',
            'avatar' => '/avatars/responsable1.jpg',
            'email' => 'responsable@ofppt.ma',
            'departement' => 'Formation Continue',
            'date_debut_fonction' => '2020-01-01',
            'description' => 'Responsable des formations continues',
            'statistics' => [
                'pending_validations' => 5,
                'active_formations' => 10,
                'completed_formations' => 15,
                'formateurs_en_formation' => 8
            ],
            'recentActivity' => [
                ['action' => 'Formation planifiée', 'description' => 'Formation React', 'date' => '2023-05-15'],
                ['action' => 'Formation en cours', 'description' => 'Formation Laravel', 'date' => '2023-05-10'],
                ['action' => 'Formation terminée', 'description' => 'Formation JavaScript', 'date' => '2023-05-05']
            ]
        ]);
    });
    
    // Route to get all formations from database
    Route::get('/responsable-formation/formations', function() {
        // Get all formations from the database
        $formations = \App\Models\Formation::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'message' => 'Liste des formations récupérée avec succès',
            'data' => $formations
        ]);
    });
    
    // Route to get a specific formation by ID
    Route::get('/responsable-formation/formations/{id}', function($id) {
        try {
            // Find the formation by ID
            $formation = \App\Models\Formation::findOrFail($id);
            
            return response()->json([
                'message' => 'Formation récupérée avec succès',
                'data' => $formation
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Error fetching formation: ' . $e->getMessage());
            
            // Return error response
            return response()->json([
                'message' => 'Formation non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    });
    
    // Route to create new formation (stores in database)
    Route::post('/responsable-formation/formations', function(Request $request) {
        try {
            // Validate the incoming request
            $validatedData = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'nullable|string',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after_or_equal:date_debut',
                'lieu' => 'nullable|string|max:255',
                'capacite_max' => 'nullable|integer|min:1',
                'responsable_id' => 'nullable|integer',
                'region_id' => 'nullable|integer',
                'filiere_id' => 'nullable|integer',
            ]);
            
            // Set default status if not provided
            $validatedData['statut'] = $request->input('statut', 'en_attente_validation');
            
            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('images/formations'), $imageName);
                $validatedData['image'] = '/images/formations/' . $imageName;
            }
            
            // Create new formation in database
            $formation = \App\Models\Formation::create($validatedData);
            
            // Return success response with the created formation
            return response()->json([
                'message' => 'Formation créée avec succès',
                'data' => $formation
            ], 201);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Error creating formation: ' . $e->getMessage());
            
            // Return error response
            return response()->json([
                'message' => 'Erreur lors de la création de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Other endpoints needed for the profile page as temporary placeholders
    Route::get('/responsable-formation/sessions', function() {
        return response()->json([
            'message' => 'Liste des sessions récupérée avec succès',
            'data' => []
        ]);
    });
    
    Route::get('/responsable-formation/presences/stats', function() {
        return response()->json([
            'message' => 'Statistiques de présence récupérées avec succès',
            'data' => [
                'total_sessions' => 25,
                'presence_rate' => 85
            ]
        ]);
    });
    
    Route::get('/responsable-formation/reports', function() {
        return response()->json([
            'message' => 'Rapports récupérés avec succès',
            'data' => []
        ]);
    });
});

// Add stats endpoint for token validation
Route::middleware('auth:sanctum')->get('/stats', function () {
    return response()->json(['success' => true, 'message' => 'Token is valid']);
});

// Handle CORS preflight OPTIONS requests
Route::options('/admin/dashboard-stats', function () {
    return response()->json(['status' => 'success']);
});

// Handle CORS preflight OPTIONS requests for login
Route::options('/login', function () {
    return response()->json(['status' => 'success'], 200)
        ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Origin, Authorization');
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout'])->name('logout');

// Authenticated user route (general)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// --- Routes requiring authentication --- 
Route::middleware('auth:sanctum')->group(function () {

    // --- Route to get list of all roles (for admin forms) ---
    Route::get('/roles', function() { 
        return response()->json(Role::orderBy('name')->get());
    })->name('api.roles.list')->middleware('role:admin'); // Protect this for admin use

    // --- Route to get list of potential formateurs (for select dropdowns) ---
    // Accessible to roles that need to assign formateurs (e.g., responsable_formation, admin)
    Route::middleware('role:responsable_formation,admin')->get('/formateurs-list', function() {
        // Adjust the query based on how you identify formateurs (e.g., specific roles)
        $formateurs = User::whereIn('role', ['formateur_animateur', 'formateur_participant', 'admin'])
                          ->select('id', 'name') // Only select necessary fields
                          ->orderBy('name')
                          ->get();
        return response()->json($formateurs);
    })->name('api.formateurs.list');

    // --- Profile Route (Accessible to any authenticated user) ---
    Route::get('/profile', function(Request $request) {
        return response()->json([
            'message' => 'Profile retrieved successfully',
            'data' => [
                'id' => 1,
                'name' => 'Test User',
                'email' => 'test@example.com'
            ]
        ]);
    });
    Route::put('/profile', function(Request $request) {
        return response()->json([
            'message' => 'Profile updated successfully'
        ]);
    }); // For updating profile info
    Route::put('/profile/password', function(Request $request) {
        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }); // For changing password

    // --- Public Region and Filiere Routes ---
    Route::apiResource('regions', RegionController::class)->only(['index', 'show']);
    Route::apiResource('filieres', FiliereController::class)->only(['index', 'show']);

    // --- Admin Routes ---
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        // Dashboard stats
        Route::get('/dashboard-stats', [AdminController::class, 'getDashboardStats'])->name('dashboard-stats');
        
        // User management
        Route::apiResource('users', AdminUserController::class);
        
        // Region management
        Route::get('/regions', [AdminController::class, 'getRegions'])->name('regions.index');
        Route::post('/regions', [AdminController::class, 'createRegion'])->name('regions.create');
        Route::put('/regions/{region}', [AdminController::class, 'updateRegion'])->name('regions.update'); // Use route model binding
        Route::delete('/regions/{region}', [AdminController::class, 'deleteRegion'])->name('regions.delete'); // Use route model binding
        
        // Filiere management
        Route::get('/filieres', [AdminController::class, 'getFilieres'])->name('filieres.index');
        Route::post('/filieres', [AdminController::class, 'createFiliere'])->name('filieres.create');
        Route::put('/filieres/{filiere}', [AdminController::class, 'updateFiliere'])->name('filieres.update'); // Use route model binding
        Route::delete('/filieres/{filiere}', [AdminController::class, 'deleteFiliere'])->name('filieres.delete'); // Use route model binding

        // Formation management
        Route::apiResource('formations', AdminFormationController::class);
        
        // Session management
        Route::apiResource('sessions', SessionController::class);
        Route::get('/formateurs-list', [SessionController::class, 'getFormateurs'])->name('formateurs.list');
    });

    // --- Responsable Formation Specific Routes ---
    // This group can be more specific if needed, e.g., Route::prefix('responsable-formation')->middleware('role:responsable_formation')
    
    // GET Formations list for the authenticated responsable
    Route::get('/responsable-formation/formations', [ResponsableFormationController::class, 'index'])
         ->name('responsable-formation.formations.index'); // Add name for clarity
         
    // POST to create a new Formation for the authenticated responsable
    Route::post('/responsable-formation/formations', [ResponsableFormationController::class, 'store'])
         ->name('responsable-formation.formations.store');

    // GET a specific formation
    Route::get('/responsable-formation/formations/{formation}', [ResponsableFormationController::class, 'show'])
         ->name('responsable-formation.formations.show');

    // PUT to update a specific formation
    Route::put('/responsable-formation/formations/{formation}', [ResponsableFormationController::class, 'update'])
         ->name('responsable-formation.formations.update');
         
    // DELETE a specific formation
    Route::delete('/responsable-formation/formations/{formation}', [ResponsableFormationController::class, 'destroy'])
         ->name('responsable-formation.formations.destroy');

    // --- Session Routes for Responsable Formation ---
    // POST to create a new Session for a Formation
    Route::post('/responsable-formation/sessions', [\App\Http\Controllers\Api\ResponsableFormation\SessionController::class, 'store'])
         ->name('responsable-formation.sessions.store');

    // GET list of sessions (can be filtered, e.g., by formation_id)
    // You might want to add an index method to your SessionController if not already present
    // Route::get('/responsable-formation/sessions', [\App\Http\Controllers\Api\ResponsableFormation\SessionController::class, 'index'])
    //      ->name('responsable-formation.sessions.index');

    // GET a specific session
    // Route::get('/responsable-formation/sessions/{session}', [\App\Http\Controllers\Api\ResponsableFormation\SessionController::class, 'show'])
    //      ->name('responsable-formation.sessions.show');

    // PUT to update a specific session
    // Route::put('/responsable-formation/sessions/{session}', [\App\Http\Controllers\Api\ResponsableFormation\SessionController::class, 'update'])
    //      ->name('responsable-formation.sessions.update');

    // DELETE a specific session
    // Route::delete('/responsable-formation/sessions/{session}', [\App\Http\Controllers\Api\ResponsableFormation\SessionController::class, 'destroy'])
    //      ->name('responsable-formation.sessions.destroy');

    // --- End of Responsable Formation Specific Routes ---

    // --- General Feedback Routes (for formateurs to submit feedback) ---
    Route::apiResource('/feedbacks', FeedbackController::class)->except(['index'])->middleware('role:formateur_animateur,formateur_participant,admin');

    // --- Routes for other roles would go here ---
    // Formateur Animateur routes
    Route::middleware('role:formateur_animateur')->prefix('formateur-animateur')->group(function () {
        Route::get('/dashboard', function() {
            return response()->json(['message' => 'Formateur Animateur Dashboard']);
        });
        // Add more routes as needed
    });
    
    // Formateur Participant routes
    Route::middleware('role:formateur_participant')->prefix('formateur-participant')->group(function () {
        Route::get('/dashboard', function() {
            return response()->json(['message' => 'Formateur Participant Dashboard']);
        });
        // Add more routes as needed
    });
    
    // Responsable DR routes
    Route::middleware('role:responsable_dr')->prefix('responsable-dr')->group(function () {
        Route::get('/dashboard', function() {
            return response()->json(['message' => 'Responsable DR Dashboard']);
        });
        // Add more routes as needed
    });
    
    // Routes pour le Responsable de Formation
    Route::middleware(['auth:sanctum', 'role:responsable_formation'])->prefix('responsable')->group(function () {
        // Formations management
        Route::apiResource('formations', \App\Http\Controllers\Api\Responsable\FormationsController::class);
    });

    // Formations API routes are now handled by specific controllers in the ResponsableFormation directory
    // Sessions API routes are now handled by specific controllers in the ResponsableFormation directory

    // For now, without authentication for testing
    Route::get('/responsable-data', function() {
        // Dummy data for testing
        return response()->json([
            'name' => 'Mohammed Alami',
            'role' => 'Responsable Formation',
            'departement' => 'Département de Formation des Formateurs',
            'avatar' => null,
            'statistics' => [
                'active_formations' => 5,
                'pending_validations' => 2,
                'completed_formations' => 8,
                'formateurs_en_formation' => 15
            ],
            'recentActivity' => [
                [
                    'action' => 'Nouvelle formation créée',
                    'description' => 'Formation sur les méthodes pédagogiques modernes',
                    'date' => '2024-05-01'
                ],
                [
                    'action' => 'Session validée',
                    'description' => 'Session de formation en développement web',
                    'date' => '2024-04-28'
                ],
                [
                    'action' => 'Absence signalée',
                    'description' => 'Abdellah Najib - Formation Excel Avancé',
                    'date' => '2024-04-25'
                ]
            ]
        ]);
    });

});

// Public routes for ResponsableCdc - No authentication required


//responsable cdc

// Routes pour les formations et les formateurs
Route::get('/formations', [FormationController::class, 'index']);
Route::post('/formations', [FormationController::class, 'store']);
Route::get('/formations/{id}', [FormationController::class, 'show']);
Route::put('/formations/{id}', [FormationController::class, 'update']);
Route::delete('/formations/{id}', [FormationController::class, 'destroy']);

// Routes pour les formateurs dans une formation
Route::get('/formations/{id}/formateurs', [FormationController::class, 'getFormateurs']);
Route::post('/formations/assign-formateur', [FormationController::class, 'assignFormateur']);
Route::put('/formations/formateur/{id}', [FormationController::class, 'updateFormateurStatus']);
Route::delete('/formations/{formationId}/formateur/{userId}', [FormationController::class, 'removeFormateur']);

//formateur_formation_api
Route::apiResource('formateur-formations', FormateurFormationController::class);

Route::get('formateurs/{formateurId}/formations', [FormateurFormationController::class, 'getFormationsByFormateur']);
Route::get('formations/{formationId}/formateurs', [FormateurFormationController::class, 'getFormateursByFormation']);
Route::put('formateur-formations/update-status', [FormateurFormationController::class, 'updateStatus']);
// formateur animateur
Route::apiResource('formateurs-animateurs', FormateurAnimateurController::class); //yes

//user
Route::get('/users', [UserController::class, 'index']);

// Routes pour la gestion des formations
Route::prefix('responsable-cdc')->group(function () {
    // Formation routes
    Route::get('/gere-formation', [GereFormationController::class, 'index']);
    Route::post('/gere-formation', [GereFormationController::class, 'store']);
    Route::put('/gere-formation/{id}', [GereFormationController::class, 'update']);
    Route::delete('/gere-formation/{id}', [GereFormationController::class, 'destroy']);

    // Region routes
    Route::get('/regions', [GereFormationController::class, 'getRegions']);
    Route::post('/regions', [GereFormationController::class, 'storeRegion']);

    // Filiere routes
    Route::get('/filieres', [GereFormationController::class, 'getFilieres']);
    Route::post('/filieres', [GereFormationController::class, 'storeFiliere']);

    // User routes
    Route::get('/users', [GereFormationController::class, 'getUsers']);
    Route::post('/users', [GereFormationController::class, 'storeUser']);
    Route::put('/users/{id}', [GereFormationController::class, 'updateUser']);
    Route::delete('/users/{id}', [GereFormationController::class, 'deleteUser']);
    Route::get('/users-with-formateur', [GereFormationController::class, 'getUsersWithFormateur']);

    // Formateur routes
    Route::get('/formateurs', [GereFormationController::class, 'getFormateurs']);
    Route::post('/formateurs', [GereFormationController::class, 'storeFormateur']);
    Route::put('/formateurs/{id}', [GereFormationController::class, 'updateFormateur']);
    Route::delete('/formateurs/{id}', [GereFormationController::class, 'deleteFormateur']);

    // Formateur Animateur routes
    Route::get('/formateur-animateur', [GereFormationController::class, 'getFormateurAnimateurs']);
    Route::post('/formateur-animateur', [GereFormationController::class, 'assignFormateurAnimateur']);
    Route::delete('/formateur-animateur/{id}', [GereFormationController::class, 'removeFormateurAnimateur']);
});

// Add authenticated routes for ResponsableFormation
Route::middleware(['auth:sanctum'])->prefix('responsable-formation')->group(function () {
    // Formations CRUD operations
    Route::apiResource('formations', \App\Http\Controllers\Api\ResponsableFormation\FormationsController::class);
    
    // ... other routes ...
});

// Public routes for creating formations without authentication (temporary for development)
Route::post('/create-formation', function(Request $request) {
    try {
        \Log::info('Received formation creation request with data: ' . json_encode($request->all()));
        
        // Validate the incoming request
        $validatedData = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
            'responsable_id' => 'nullable',
            'region_id' => 'nullable',
            'filiere_id' => 'nullable',
        ]);
        
        \Log::info('Validation passed');
        
        // Set default status if not provided
        $validatedData['statut'] = $request->input('statut', 'en_attente_validation');
        
        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('images/formations'), $imageName);
                $validatedData['image'] = '/images/formations/' . $imageName;
                \Log::info('Image uploaded successfully: ' . $imageName);
            } catch (\Exception $imageError) {
                \Log::error('Image upload failed: ' . $imageError->getMessage());
                // Continue without the image rather than failing
            }
        }
        
        // Make sure region_id and filiere_id are integers if provided
        if (!empty($validatedData['region_id'])) {
            $validatedData['region_id'] = (int)$validatedData['region_id'];
            \Log::info('Region ID set to: ' . $validatedData['region_id']);
        } else {
            // Remove if empty to avoid foreign key constraint issues
            unset($validatedData['region_id']);
            \Log::info('Region ID removed from request');
        }
        
        if (!empty($validatedData['filiere_id'])) {
            $validatedData['filiere_id'] = (int)$validatedData['filiere_id'];
            \Log::info('Filiere ID set to: ' . $validatedData['filiere_id']);
        } else {
            // Remove if empty to avoid foreign key constraint issues
            unset($validatedData['filiere_id']);
            \Log::info('Filiere ID removed from request');
        }
        
        if (!empty($validatedData['responsable_id'])) {
            $validatedData['responsable_id'] = (int)$validatedData['responsable_id'];
            \Log::info('Responsable ID set to: ' . $validatedData['responsable_id']);
        } else {
            // Set default responsable_id if not provided
            $validatedData['responsable_id'] = 1;
            \Log::info('Responsable ID defaulted to 1');
        }
        
        // Try direct DB insertion first to debug
        try {
            \Log::info('Attempting direct DB insertion with: ' . json_encode($validatedData));
            
            // Check if there are required fields in the formations table schema
            $requiredFields = ['titre', 'date_debut', 'date_fin', 'statut', 'responsable_id'];
            $missingFields = [];
            
            foreach ($requiredFields as $field) {
                if (!isset($validatedData[$field]) || $validatedData[$field] === null || $validatedData[$field] === '') {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                \Log::error('Missing required fields: ' . implode(', ', $missingFields));
                return response()->json([
                    'message' => 'Champs obligatoires manquants',
                    'missing_fields' => $missingFields
                ], 422);
            }
            
            // Create new formation in database
            $formation = \App\Models\Formation::create($validatedData);
            \Log::info('Formation created successfully with ID: ' . $formation->id);
            
            // Return success response with the created formation
            return response()->json([
                'message' => 'Formation créée avec succès',
                'data' => $formation
            ], 201);
        } catch (\Exception $dbError) {
            \Log::error('Direct DB insertion failed: ' . $dbError->getMessage());
            \Log::error('DB Error trace: ' . $dbError->getTraceAsString());
            
            // Try with minimal required fields as fallback
            try {
                \Log::info('Trying fallback creation with minimal fields');
                $minimalData = [
                    'titre' => $validatedData['titre'],
                    'description' => $validatedData['description'] ?? 'Formation sans description',
                    'date_debut' => $validatedData['date_debut'],
                    'date_fin' => $validatedData['date_fin'],
                    'statut' => 'en_attente_validation',
                    'responsable_id' => 1,
                ];
                
                $formation = \App\Models\Formation::create($minimalData);
                
                \Log::info('Formation created with minimal data, ID: ' . $formation->id);
                return response()->json([
                    'message' => 'Formation créée avec succès (données minimales)',
                    'data' => $formation,
                    'note' => 'Certains champs ont été omis en raison d\'erreurs de validation'
                ], 201);
            } catch (\Exception $fallbackError) {
                \Log::error('Fallback creation also failed: ' . $fallbackError->getMessage());
                throw $fallbackError;
            }
        }
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation error creating formation: ' . json_encode($e->errors()));
        return response()->json([
            'message' => 'Erreur de validation lors de la création de la formation',
            'errors' => $e->errors()
        ], 422);
    } catch (\PDOException $e) {
        \Log::error('Database error creating formation: ' . $e->getMessage());
        \Log::error('SQL Error: ' . $e->getMessage());
        
        return response()->json([
            'message' => 'Erreur de base de données lors de la création de la formation',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ], 500);
    } catch (\Exception $e) {
        \Log::error('Error creating formation: ' . $e->getMessage());
        \Log::error('Error trace: ' . $e->getTraceAsString());
        
        // Return error response with more details
        return response()->json([
            'message' => 'Erreur lors de la création de la formation',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'code' => $e->getCode()
        ], 500);
    }
});

// Add a special endpoint for direct formation creation via GET (only for testing)
Route::get('/direct-create-formation', function(Request $request) {
    try {
        \Log::info('Received direct formation creation request: ' . json_encode($request->query()));
        
        // Extract data from query parameters
        $titre = $request->query('titre', 'Formation Test ' . date('Y-m-d H:i:s'));
        $description = $request->query('description', 'Formation créée pour tester l\'API');
        $date_debut = $request->query('date_debut', '2025-06-01');
        $date_fin = $request->query('date_fin', '2025-06-30');
        $lieu = $request->query('lieu', 'Casablanca');
        $capacite_max = (int) $request->query('capacite_max', 25);
        $responsable_id = (int) $request->query('responsable_id', 1);
        $region_id = (int) $request->query('region_id', 2);
        $filiere_id = (int) $request->query('filiere_id', 3);
        
        // Ensure proper casting of values and handle empty strings
        if (empty($region_id) || $region_id <= 0) {
            $region_id = 2; // Default region_id
            \Log::info('Using default region_id: 2');
        }
        
        if (empty($filiere_id) || $filiere_id <= 0) {
            $filiere_id = 3; // Default filiere_id
            \Log::info('Using default filiere_id: 3');
        }
        
        if (empty($responsable_id) || $responsable_id <= 0) {
            $responsable_id = 1; // Default responsable_id
            \Log::info('Using default responsable_id: 1');
        }
        
        $formationData = [
            'titre' => $titre,
            'description' => $description,
            'date_debut' => $date_debut,
            'date_fin' => $date_fin,
            'lieu' => $lieu,
            'capacite_max' => $capacite_max,
            'statut' => 'en_attente_validation',
            'responsable_id' => $responsable_id,
            'region_id' => $region_id,
            'filiere_id' => $filiere_id,
        ];
        
        \Log::info('Attempting to create formation with data: ' . json_encode($formationData));
        
        // Directly check DB connection first
        try {
            $testConnection = \DB::connection()->getPdo();
            \Log::info('Database connection successful: ' . \DB::connection()->getDatabaseName());
        } catch (\Exception $dbConnError) {
            \Log::error('Database connection failed: ' . $dbConnError->getMessage());
            throw new \Exception('Cannot connect to database: ' . $dbConnError->getMessage());
        }
        
        // Insert directly into database
        $formation = \App\Models\Formation::create($formationData);
        
        \Log::info('Formation created successfully via direct-create with ID: ' . $formation->id);
        
        return response()->json([
            'message' => 'Formation créée avec succès via direct-create',
            'data' => $formation
        ], 201);
    } catch (\Exception $e) {
        \Log::error('Error in direct-create-formation: ' . $e->getMessage());
        \Log::error('Error trace: ' . $e->getTraceAsString());
        
        // Attempt alternative creation with minimal data
        try {
            \Log::info('Trying alternative creation with minimal data');
            $fallbackData = [
                'titre' => $request->query('titre', 'Formation de secours ' . date('Y-m-d H:i:s')),
                'description' => 'Formation créée après échec - ' . date('Y-m-d H:i:s'),
                'date_debut' => '2025-06-01',
                'date_fin' => '2025-06-30',
                'statut' => 'en_attente_validation',
                'responsable_id' => 1
            ];
            
            $fallbackFormation = \App\Models\Formation::create($fallbackData);
            
            \Log::info('Fallback formation created with ID: ' . $fallbackFormation->id);
            
            return response()->json([
                'message' => 'Formation de secours créée après erreur',
                'data' => $fallbackFormation,
                'original_error' => $e->getMessage()
            ], 201);
        } catch (\Exception $fallbackError) {
            \Log::error('Fallback creation also failed: ' . $fallbackError->getMessage());
            
            return response()->json([
                'message' => 'Échec de création de formation (tentatives multiples)',
                'error' => $e->getMessage(),
                'fallback_error' => $fallbackError->getMessage(),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => explode("\n", $e->getTraceAsString(), 5)[0]
                ]
            ], 500);
        }
    }
});

// Test route for creating a formation directly via API
Route::get('/test-create-formation', function () {
    try {
        // First, find a valid ResponsableFormation record
        $responsable = \App\Models\ResponsableFormation::first();
        
        if (!$responsable) {
            // If no responsable formation record exists, create one
            // First get or create a user with responsable_formation role
            $role = \App\Models\Role::where('name', 'responsable_formation')->first();
            
            if (!$role) {
                // Create the role if it doesn't exist
                $role = \App\Models\Role::create(['name' => 'responsable_formation']);
            }
            
            $user = \App\Models\User::firstOrCreate(
                ['email' => 'responsable@example.com'],
                [
                    'name' => 'Responsable Formation',
                    'email' => 'responsable@example.com',
                    'password' => \Illuminate\Support\Facades\Hash::make('password'),
                    'role_id' => $role->id
                ]
            );
            
            // Create the responsable formation entry
            $responsable = \App\Models\ResponsableFormation::create([
                'user_id' => $user->id,
                'departement' => 'Département de Formation',
                'date_debut_fonction' => now(),
                'description' => 'Responsable des formations OFPPT'
            ]);
            
            \Log::info('Created new ResponsableFormation with ID: ' . $responsable->id);
        }
        
        // Create default images directory if it doesn't exist
        $formationsImgDir = public_path('images/formations');
        if (!file_exists($formationsImgDir)) {
            mkdir($formationsImgDir, 0755, true);
            \Log::info('Created formations images directory: ' . $formationsImgDir);
        }
        
        // Copy default image if it doesn't exist
        $defaultImagePath = public_path('logo-ofppt-1.jpg');
        if (!file_exists($defaultImagePath)) {
            // Try to copy from React public directory
            $reactLogoPath = base_path('../react/public/logo-ofppt-1.jpg');
            if (file_exists($reactLogoPath)) {
                copy($reactLogoPath, $defaultImagePath);
                \Log::info('Copied default logo from React to Laravel public directory');
            }
        }
        
        // Create a formation with minimal data
        $formation = \App\Models\Formation::create([
            'titre' => 'Formation Test via API ' . date('Y-m-d H:i:s'),
            'description' => 'Formation créée via une route API pour tester la création',
            'date_debut' => '2025-06-01',
            'date_fin' => '2025-06-30',
            'statut' => 'validee', // Changed to validee (confirmed) instead of en_attente_validation
            'responsable_id' => $responsable->id, // Use the found or created responsable's ID
            'lieu' => 'Test Location',
            'capacite_max' => 25,
            'region_id' => 2,
            'filiere_id' => 3,
            'image' => '/logo-ofppt-1.jpg' // Default image path
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Formation créée avec succès via API',
            'formation' => $formation,
            'image_url' => asset($formation->image),
            'responsable_info' => [
                'id' => $responsable->id,
                'user_id' => $responsable->user_id,
                'departement' => $responsable->departement
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création de la formation',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ], 500);
    }
});

// Database repair endpoint via API
Route::get('/fix-database', function () {
    $results = [
        'checks' => [],
        'fixes' => [],
        'status' => 'success'
    ];
    
    try {
        // Check database connection
        try {
            $connection = DB::connection()->getPdo();
            $results['checks'][] = [
                'name' => 'database_connection',
                'status' => 'success',
                'message' => 'Connected to database: ' . DB::connection()->getDatabaseName()
            ];
        } catch (\Exception $e) {
            $results['checks'][] = [
                'name' => 'database_connection',
                'status' => 'failure',
                'message' => 'Failed to connect to database',
                'error' => $e->getMessage()
            ];
            $results['status'] = 'failure';
            return response()->json($results);
        }
        
        // Check if formations table exists
        if (!Schema::hasTable('formations')) {
            $results['checks'][] = [
                'name' => 'formations_table',
                'status' => 'failure',
                'message' => 'Formations table does not exist'
            ];
            
            // Create formations table
            try {
                DB::statement('
                    CREATE TABLE IF NOT EXISTS formations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        titre VARCHAR(255) NOT NULL,
                        description TEXT,
                        date_debut DATE,
                        date_fin DATE,
                        lieu VARCHAR(255),
                        capacite_max INT DEFAULT 20,
                        statut VARCHAR(50) DEFAULT "en_attente_validation",
                        responsable_id INT,
                        region_id INT,
                        filiere_id INT,
                        image VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                ');
                
                $results['fixes'][] = [
                    'name' => 'formations_table',
                    'status' => 'success',
                    'message' => 'Created formations table'
                ];
            } catch (\Exception $e) {
                $results['fixes'][] = [
                    'name' => 'formations_table',
                    'status' => 'failure',
                    'message' => 'Failed to create formations table',
                    'error' => $e->getMessage()
                ];
                $results['status'] = 'failure';
            }
        } else {
            $results['checks'][] = [
                'name' => 'formations_table',
                'status' => 'success',
                'message' => 'Formations table exists'
            ];
        }
        
        return response()->json($results);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'General error in database diagnostic',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Root API route redirect
Route::get('/', function () {
    return redirect('/api/connection-status');
});

