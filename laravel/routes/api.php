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



// Public route for testing API connection
Route::get('/test', function () {
    return response()->json([
        'message' => 'API connection successful',
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'environment' => config('app.env'),
        'debug' => config('app.debug'),
        'cors' => [
            'origin' => request()->header('Origin'),
            'allowed_origins' => env('CORS_ALLOWED_ORIGINS', 'not configured')
        ]
    ]);
});

// Additional connection test endpoint specifically for the React app
Route::get('/connection-test', function () {
    return response()->json([
        'message' => 'API connection successful',
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'environment' => config('app.env'),
        'cors_origin' => request()->header('Origin'),
        'debug_mode' => config('app.debug')
    ]);
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
    
    Route::get('/responsable-formation/formations', function() {
        // Temporary placeholder response
        // THIS SHOULD LATER POINT TO ResponsableFormationController@index
        return response()->json([
            'message' => 'Liste des formations récupérée avec succès (public placeholder)',
            'data' => [
                [
                    'id' => 1,
                    'titre' => 'Formation React (Public)',
                    // ... other fields
                ]
            ]
        ]);
    });
    
    // COMMENT OUT or REMOVE this placeholder POST route as it doesn't save to DB
    /*
    Route::post('/responsable-formation/formations', function(Request $request) {
        // Validate the incoming request
        $validatedData = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
        ]);

        // Return success response with the data
        return response()->json([
            'message' => 'Formation créée avec succès (Placeholder - Not Saved)',
            'data' => array_merge($validatedData, [
                'id' => rand(100, 999), // Generate random ID
                'statut' => 'pending',
                'created_at' => now()->toIso8601String()
            ])
        ], 201);
    });
    */
    
    // Fallback route for creating formations directly - also works for development
    // Consider removing or securing this too if it's not saving to DB or if controller is preferred
    Route::post('/responsable-formation/formations-direct', function(Request $request) {
        // Validate the incoming request
        $validatedData = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
        ]);

        // Return success response with the data
        return response()->json([
            'message' => 'Formation créée avec succès (via route directe)',
            'data' => array_merge($validatedData, [
                'id' => rand(100, 999), // Generate random ID
                'statut' => 'pending',
                'created_at' => now()->toIso8601String()
            ])
        ], 201);
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

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

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
    
    // Responsable CDC routes
    Route::middleware('role:responsable_cdc')->prefix('responsable-cdc')->group(function () {
        Route::get('/dashboard', function() {
            return response()->json(['message' => 'Responsable CDC Dashboard']);
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

