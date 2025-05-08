<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleNames = [
            'admin',
            'responsable_formation',
            'responsable_cdc',
            'responsable_dr',
            'formateur_animateur',
            'formateur_participant',
        ];

        // Common password for all seeded users
        $password = 'password';

        foreach ($roleNames as $roleName) {
            $role = Role::where('name', $roleName)->first();

            if ($role) {
                User::updateOrCreate(
                    ['email' => $roleName . '@example.com'],
                    [
                        'name' => ucwords(str_replace('_', ' ', $roleName)) . ' User',
                        'email' => $roleName . '@example.com',
                        'password' => Hash::make($password),
                        'role_id' => $role->id,
                        'email_verified_at' => now()
                    ]
                );
            } else {
                $this->command->warn("Role '{$roleName}' not found. Skipping user creation.");
            }
        }

        $this->command->info('Users for each role created/updated successfully with password \'' . $password . '\'.');
    }
}
