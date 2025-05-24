<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ResponsableFormation;
use App\Models\User;
use App\Models\Role;

class ResponsableFormationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Find the responsable_formation role
        $role = Role::where('name', 'responsable_formation')->first();
        
        if (!$role) {
            $this->command->error('Role "responsable_formation" not found!');
            return;
        }
        
        // Find users with the responsable_formation role
        $users = User::where('role_id', $role->id)->get();
        
        if ($users->isEmpty()) {
            $this->command->error('No users with responsable_formation role found!');
            return;
        }
        
        // For each responsable user, create a ResponsableFormation record if not exists
        foreach ($users as $user) {
            ResponsableFormation::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'departement' => 'Département de Formation',
                    'date_debut_fonction' => now(),
                    'description' => 'Responsable des formations OFPPT',
                ]
            );
            
            $this->command->info("ResponsableFormation created for user: {$user->name}");
        }
    }
} 