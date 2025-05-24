<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Simple test route
Route::get('/test-route', function() {
    return 'Laravel API is working!';
});

// Root route to serve the React app
Route::get('/', function () {
    return view('welcome');
});

// Test route for creating a formation directly
Route::get('/test-create-formation', function () {
    try {
        // Check if there's a responsable_formation record, create one if not
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
            'titre' => 'Formation Test via Web ' . date('Y-m-d H:i:s'),
            'description' => 'Formation créée via une route web pour tester la création',
            'date_debut' => '2025-06-01',
            'date_fin' => '2025-06-30',
            'statut' => 'validee',
            'responsable_id' => $responsable->id,
            'lieu' => 'Test Location',
            'capacite_max' => 25,
            'region_id' => 2,
            'filiere_id' => 3,
            'image' => '/logo-ofppt-1.jpg'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Formation créée avec succès via route web',
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

// Route to reset and seed formations
Route::get('/seed-formations', function () {
    try {
        // Clear existing formations
        \App\Models\Formation::truncate();
        
        // Create example formations
        $formations = [
            [
                'titre' => 'Développement Web Moderne',
                'description' => 'Formation complète sur les technologies web modernes incluant HTML5, CSS3, JavaScript, React et Node.js.',
                'date_debut' => '2025-06-01',
                'date_fin' => '2025-06-30',
                'lieu' => 'Centre de Formation OFPPT - Casablanca',
                'capacite_max' => 25,
                'statut' => 'validee',
                'responsable_id' => 1,
                'region_id' => 2,
                'filiere_id' => 1,
                'image' => '/logo-ofppt-1.jpg',
            ],
            [
                'titre' => 'Formation des Formateurs Pédagogiques',
                'description' => 'Techniques avancées de pédagogie et d\'enseignement pour les formateurs de l\'OFPPT.',
                'date_debut' => '2025-07-01',
                'date_fin' => '2025-07-21',
                'lieu' => 'Centre Développement Compétences - Rabat',
                'capacite_max' => 20,
                'statut' => 'en_attente_validation',
                'responsable_id' => 1,
                'region_id' => 2,
                'filiere_id' => 3,
                'image' => '/logo-ofppt-1.jpg',
            ],
            [
                'titre' => 'Intelligence Artificielle Appliquée',
                'description' => 'Introduction aux concepts fondamentaux de l\'intelligence artificielle et ses applications pratiques dans divers secteurs.',
                'date_debut' => '2025-08-15',
                'date_fin' => '2025-09-15',
                'lieu' => 'Campus Numérique - Casablanca',
                'capacite_max' => 30,
                'statut' => 'validee',
                'responsable_id' => 1,
                'region_id' => 1,
                'filiere_id' => 2,
                'image' => '/logo-ofppt-1.jpg',
            ],
            [
                'titre' => 'Gestion de Projets Agiles',
                'description' => 'Méthodologies agiles pour la gestion de projets: Scrum, Kanban, et les meilleures pratiques de l\'industrie.',
                'date_debut' => '2025-06-15',
                'date_fin' => '2025-07-05',
                'lieu' => 'Complexe de Formation - Tanger',
                'capacite_max' => 22,
                'statut' => 'annulee',
                'responsable_id' => 1,
                'region_id' => 3,
                'filiere_id' => 1,
                'image' => '/logo-ofppt-1.jpg',
            ],
            [
                'titre' => 'Techniques de Marketing Digital',
                'description' => 'Stratégies et outils pour réussir vos campagnes marketing en ligne: SEO, réseaux sociaux, email marketing.',
                'date_debut' => '2025-09-01',
                'date_fin' => '2025-09-30',
                'lieu' => 'Centre de Formation OFPPT - Marrakech',
                'capacite_max' => 35,
                'statut' => 'en_attente_validation',
                'responsable_id' => 1,
                'region_id' => 3,
                'filiere_id' => 4,
                'image' => '/logo-ofppt-1.jpg',
            ],
        ];
        
        // Create each formation
        foreach ($formations as $formationData) {
            \App\Models\Formation::create($formationData);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'All formations have been reset and seeded with example data',
            'count' => count($formations),
            'formations' => $formations
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error while seeding formations',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Diagnostic route for direct formation creation with detailed error reporting
Route::get('/diagnostic-create-formation', function () {
    try {
        // First check database connection
        try {
            $connection = DB::connection()->getPdo();
            $dbStatus = [
                'connected' => true,
                'database_name' => DB::connection()->getDatabaseName(),
                'driver' => DB::connection()->getDriverName()
            ];
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'step' => 'database_connection',
                'message' => 'Database connection failed',
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ], 500);
        }
        
        // Check if formations table exists
        try {
            $tableExists = Schema::hasTable('formations');
            if (!$tableExists) {
                return response()->json([
                    'success' => false,
                    'step' => 'table_check',
                    'message' => 'Formations table does not exist',
                    'tables' => Schema::getAllTables()
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'step' => 'table_check',
                'message' => 'Error checking table existence',
                'error' => $e->getMessage()
            ], 500);
        }
        
        // Check the Formation model and fillable attributes
        try {
            $formationModel = new \App\Models\Formation();
            $fillable = $formationModel->getFillable();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'step' => 'model_check',
                'message' => 'Error checking Formation model',
                'error' => $e->getMessage()
            ], 500);
        }
        
        // Try to create a very simple formation with minimal fields
        try {
            $simpleFormation = [
                'titre' => 'Formation Test Diagnostic ' . date('Y-m-d H:i:s'),
                'description' => 'Formation de diagnostic',
                'date_debut' => '2025-06-01',
                'date_fin' => '2025-06-30',
                'statut' => 'en_attente_validation',
                'responsable_id' => 1
            ];
            
            $formation = \App\Models\Formation::create($simpleFormation);
            
            return response()->json([
                'success' => true,
                'message' => 'Formation créée avec succès via diagnostic',
                'formation' => $formation,
                'db_status' => $dbStatus,
                'model_fillable' => $fillable
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'step' => 'creation',
                'message' => 'Error creating formation',
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => explode("\n", $e->getTraceAsString(), 10),
                'db_status' => $dbStatus,
                'model_fillable' => $fillable
            ], 500);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Unexpected diagnostic error',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// Database diagnostic and repair route
Route::get('/database-fix', function () {
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
        
        // Check if migrations tables exist
        if (!Schema::hasTable('migrations')) {
            $results['checks'][] = [
                'name' => 'migrations_table',
                'status' => 'failure',
                'message' => 'Migrations table does not exist'
            ];
            
            // Create migrations table
            try {
                DB::statement('
                    CREATE TABLE IF NOT EXISTS migrations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        migration VARCHAR(255) NOT NULL,
                        batch INT NOT NULL
                    )
                ');
                
                $results['fixes'][] = [
                    'name' => 'migrations_table',
                    'status' => 'success',
                    'message' => 'Created migrations table'
                ];
            } catch (\Exception $e) {
                $results['fixes'][] = [
                    'name' => 'migrations_table',
                    'status' => 'failure',
                    'message' => 'Failed to create migrations table',
                    'error' => $e->getMessage()
                ];
                $results['status'] = 'failure';
            }
        } else {
            $results['checks'][] = [
                'name' => 'migrations_table',
                'status' => 'success',
                'message' => 'Migrations table exists'
            ];
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
        
        // Check if personal_access_tokens table exists (for Sanctum)
        if (!Schema::hasTable('personal_access_tokens')) {
            $results['checks'][] = [
                'name' => 'personal_access_tokens_table',
                'status' => 'failure',
                'message' => 'Personal access tokens table does not exist'
            ];
            
            // Create personal_access_tokens table
            try {
                DB::statement('
                    CREATE TABLE IF NOT EXISTS personal_access_tokens (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        tokenable_type VARCHAR(255) NOT NULL,
                        tokenable_id INT NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        token VARCHAR(64) NOT NULL,
                        abilities TEXT,
                        last_used_at TIMESTAMP NULL,
                        expires_at TIMESTAMP NULL,
                        created_at TIMESTAMP NULL,
                        updated_at TIMESTAMP NULL,
                        KEY personal_access_tokens_tokenable_type_tokenable_id_index(tokenable_type, tokenable_id)
                    )
                ');
                
                $results['fixes'][] = [
                    'name' => 'personal_access_tokens_table',
                    'status' => 'success',
                    'message' => 'Created personal_access_tokens table'
                ];
            } catch (\Exception $e) {
                $results['fixes'][] = [
                    'name' => 'personal_access_tokens_table',
                    'status' => 'failure',
                    'message' => 'Failed to create personal_access_tokens table',
                    'error' => $e->getMessage()
                ];
                $results['status'] = 'failure';
            }
        } else {
            $results['checks'][] = [
                'name' => 'personal_access_tokens_table',
                'status' => 'success',
                'message' => 'Personal access tokens table exists'
            ];
        }
        
        // Return all results
        return response()->json($results);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'General error in database diagnostic',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Web route to run migrations
Route::get('/run-migrations', function () {
    try {
        // Start tracking output
        ob_start();
        
        // Run the Artisan migrate command
        $exitCode = Artisan::call('migrate', [
            '--force' => true,
        ]);
        
        // Get the output
        $output = ob_get_clean();
        $artisanOutput = Artisan::output();
        
        if ($exitCode === 0) {
            return response()->json([
                'success' => true,
                'message' => 'Migrations ran successfully',
                'output' => $artisanOutput,
                'exit_code' => $exitCode
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Migrations failed',
                'output' => $artisanOutput,
                'exit_code' => $exitCode
            ], 500);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error running migrations',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Route to show all database tables
Route::get('/show-tables', function () {
    try {
        // Get all tables
        $tables = [];
        $rawTables = DB::select('SHOW TABLES');
        
        // Format tables list
        foreach ($rawTables as $table) {
            $tableObj = (array) $table;
            $tableName = reset($tableObj);
            $tables[] = $tableName;
            
            // Check if table is empty
            $count = DB::table($tableName)->count();
            $details[$tableName] = [
                'count' => $count
            ];
            
            // Get column info for each table
            $columns = DB::select("SHOW COLUMNS FROM `$tableName`");
            $details[$tableName]['columns'] = [];
            foreach ($columns as $column) {
                $details[$tableName]['columns'][] = (array) $column;
            }
        }
        
        // Get database info
        $dbInfo = [
            'name' => DB::connection()->getDatabaseName(),
            'driver' => DB::connection()->getDriverName(),
            'version' => DB::select('SELECT version() as version')[0]->version
        ];
        
        return response()->json([
            'success' => true,
            'database' => $dbInfo,
            'tables' => $tables,
            'details' => $details
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error getting database tables',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Route to run Sanctum migrations specifically
Route::get('/fix-sanctum', function () {
    try {
        $results = [
            'steps' => [],
            'status' => 'success'
        ];

        // 1. Check if personal_access_tokens exists
        if (!Schema::hasTable('personal_access_tokens')) {
            $results['steps'][] = [
                'name' => 'check_table',
                'status' => 'info',
                'message' => 'personal_access_tokens table does not exist'
            ];
            
            // 2. Create the table manually
            try {
                DB::statement("
                    CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
                      `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                      `tokenable_type` varchar(255) NOT NULL,
                      `tokenable_id` bigint(20) UNSIGNED NOT NULL,
                      `name` varchar(255) NOT NULL,
                      `token` varchar(64) NOT NULL,
                      `abilities` text DEFAULT NULL,
                      `last_used_at` timestamp NULL DEFAULT NULL,
                      `expires_at` timestamp NULL DEFAULT NULL,
                      `created_at` timestamp NULL DEFAULT NULL,
                      `updated_at` timestamp NULL DEFAULT NULL,
                      PRIMARY KEY (`id`),
                      UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
                      KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
                    )
                ");
                
                $results['steps'][] = [
                    'name' => 'create_table',
                    'status' => 'success',
                    'message' => 'Successfully created personal_access_tokens table'
                ];
            } catch (\Exception $e) {
                $results['steps'][] = [
                    'name' => 'create_table',
                    'status' => 'error',
                    'message' => 'Failed to create personal_access_tokens table: ' . $e->getMessage()
                ];
                $results['status'] = 'error';
            }
        } else {
            $results['steps'][] = [
                'name' => 'check_table',
                'status' => 'success',
                'message' => 'personal_access_tokens table already exists'
            ];
        }
        
        // 3. Attempt to publish sanctum migrations
        try {
            Artisan::call('vendor:publish', [
                '--provider' => 'Laravel\Sanctum\SanctumServiceProvider',
                '--tag' => 'sanctum-migrations',
                '--force' => true,
            ]);
            
            $results['steps'][] = [
                'name' => 'publish_migrations',
                'status' => 'success',
                'message' => 'Published Sanctum migrations',
                'output' => Artisan::output()
            ];
        } catch (\Exception $e) {
            $results['steps'][] = [
                'name' => 'publish_migrations',
                'status' => 'warning',
                'message' => 'Failed to publish Sanctum migrations: ' . $e->getMessage()
            ];
            // Not fatal, continue
        }
        
        // 4. Try running migrations
        try {
            Artisan::call('migrate', [
                '--path' => 'database/migrations',
                '--force' => true,
            ]);
            
            $results['steps'][] = [
                'name' => 'run_migrations',
                'status' => 'success',
                'message' => 'Ran migrations',
                'output' => Artisan::output()
            ];
        } catch (\Exception $e) {
            $results['steps'][] = [
                'name' => 'run_migrations',
                'status' => 'error',
                'message' => 'Failed to run migrations: ' . $e->getMessage()
            ];
            $results['status'] = 'error';
        }
        
        return response()->json($results);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fixing Sanctum',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add a fallback route to catch all other routes
Route::fallback(function () {
    return response()->json([
        'status' => 'error',
        'message' => 'Route not found',
        'api_status' => 'API is running, but the requested route was not found',
        'available_routes' => [
            'root' => '/',
            'api_test' => '/api/connection-status',
            'diagnostic' => '/diagnostic-create-formation',
            'database_fix' => '/database-fix',
            'run_migrations' => '/run-migrations'
        ]
    ], 404);
}); 