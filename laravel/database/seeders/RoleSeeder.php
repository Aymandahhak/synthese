<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Import DB facade
use App\Models\Role; // Import Role model

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define the roles based on specifications
        $roles = [
            ['name' => 'admin'],
            ['name' => 'responsable_formation'],
            ['name' => 'responsable_cdc'], // As per specs Actor list
            ['name' => 'responsable_dr'],
            ['name' => 'formateur_animateur'],
            ['name' => 'formateur_participant'],
            // Add any other roles if identified, e.g., a general 'formateur' if needed
        ];

        // Insert roles only if they don't exist
        foreach ($roles as $role) {
            Role::firstOrCreate($role);
        }

        // Optional: You might want to truncate the table first if needed
        // DB::table('roles')->truncate();
        // DB::table('roles')->insert($roles);
    }
}
