<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Region;
use App\Models\Filiere;
use App\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call the RoleSeeder first to ensure roles exist
        $this->call(RoleSeeder::class);

        // Create admin user - Find the 'admin' role ID
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin',
                    'password' => Hash::make('password'),
                    'role_id' => $adminRole->id, // Assign role_id
                ]
            );
        }

        // Find other role IDs
        $respFormRole = Role::where('name', 'responsable_formation')->first();
        $formAnimRole = Role::where('name', 'formateur_animateur')->first();
        $formPartRole = Role::where('name', 'formateur_participant')->first();
        $respCdcRole = Role::where('name', 'responsable_cdc')->first(); // Added CDC
        $respDrRole = Role::where('name', 'responsable_dr')->first(); // Added DR

        // Create some test users if they don't exist and roles were found
        if (User::count() < 5) { // Adjust count as needed
            if ($respFormRole) {
                User::firstOrCreate([
                    'email' => 'responsable@example.com',
                ], [
                    'name' => 'Responsable Formation',
                    'password' => Hash::make('password'),
                    'role_id' => $respFormRole->id,
                ]);
            }
            if ($formAnimRole) {
                 User::firstOrCreate([
                    'email' => 'formateur.animateur@example.com',
                ], [
                    'name' => 'Formateur Animateur',
                    'password' => Hash::make('password'),
                    'role_id' => $formAnimRole->id,
                ]);
            }
            if ($formPartRole) {
                 User::firstOrCreate([
                    'email' => 'formateur.participant@example.com',
                ], [
                    'name' => 'Formateur Participant',
                    'password' => Hash::make('password'),
                    'role_id' => $formPartRole->id,
                ]);
            }
            if ($respCdcRole) { // Add CDC user
                 User::firstOrCreate([
                    'email' => 'cdc@example.com',
                 ], [
                    'name' => 'Responsable CDC',
                    'password' => Hash::make('password'),
                    'role_id' => $respCdcRole->id,
                 ]);
            }
             if ($respDrRole) { // Add DR user
                 User::firstOrCreate([
                    'email' => 'dr@example.com',
                 ], [
                    'name' => 'Responsable DR',
                    'password' => Hash::make('password'),
                    'role_id' => $respDrRole->id,
                 ]);
            }
        }

        // Seed regions if they don't exist
        $regions = [
            ['nom' => 'Casablanca-Settat', 'code' => 'CS'],
            ['nom' => 'Rabat-Salé-Kénitra', 'code' => 'RSK'],
            ['nom' => 'Marrakech-Safi', 'code' => 'MS'],
            ['nom' => 'Fès-Meknès', 'code' => 'FM'],
            ['nom' => 'Tanger-Tétouan-Al Hoceima', 'code' => 'TTA'],
        ];

        foreach ($regions as $region) {
            Region::firstOrCreate(
                ['nom' => $region['nom']],
                ['code' => $region['code'], 'active' => true]
            );
        }

        // Seed filieres if they don't exist
        $filieres = [
            ['name' => 'Développement Web', 'code' => 'DW'],
            ['name' => 'Intelligence Artificielle', 'code' => 'IA'],
            ['name' => 'Gestion de Projet', 'code' => 'GP'],
            ['name' => 'Marketing Digital', 'code' => 'MD'],
            ['name' => 'Cybersécurité', 'code' => 'CS'],
        ];

        foreach ($filieres as $filiere) {
            Filiere::firstOrCreate(
                ['name' => $filiere['name']],
                ['code' => $filiere['code'], 'active' => true]
            );
        }

        // Call other seeders (Ensure RoleSeeder is called first)
        $this->call([
            // RoleSeeder::class, // Already called above
            UserSeeder::class, // Keep if you have a separate UserSeeder
            SessionFormationSeeder::class,
            FeedbackSeeder::class,
            ResponsableFormationSeeder::class, // Add ResponsableFormation seeder
            // Add other seeders here if needed
        ]);
    }
}
