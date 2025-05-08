<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SessionFormation;
use App\Models\User;
use App\Models\Role;
use Carbon\Carbon;

class SessionFormationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get IDs of relevant roles
        $formateurRoleIds = Role::whereIn('name', ['formateur_animateur', 'formateur_participant', 'admin'])
                                ->pluck('id');

        if ($formateurRoleIds->isEmpty()) {
            $this->command->error('Formateur roles not found. Please run RoleSeeder first.');
            return;
        }

        // Get user IDs associated with these roles
        $formateurUserIds = User::whereIn('role_id', $formateurRoleIds)
                                ->pluck('id')
                                ->toArray();

        if (empty($formateurUserIds)) {
            $this->command->error('No users found with formateur roles. Please seed the users table first.');
            return;
        }

        // Create test sessions with varied dates and statuses
        $sessions = [
            [
                'titre' => 'Introduction aux techniques pédagogiques modernes',
                'description' => 'Une session pour maîtriser les approches pédagogiques centrées sur l\'apprenant.',
                'date_debut' => Carbon::now()->addDays(5),
                'date_fin' => Carbon::now()->addDays(6),
                'formateur_user_id' => $formateurUserIds[array_rand($formateurUserIds)],
                'etat' => 'planifiee',
                'location_type' => 'local',
            ],
            [
                'titre' => 'Digitalisation des méthodes d\'enseignement',
                'description' => 'Formation sur l\'utilisation des outils numériques dans l\'enseignement.',
                'date_debut' => Carbon::now()->subDays(5),
                'date_fin' => Carbon::now()->subDays(3),
                'formateur_user_id' => $formateurUserIds[array_rand($formateurUserIds)],
                'etat' => 'terminee',
                'location_type' => 'distance',
            ],
            [
                'titre' => 'Évaluation des compétences professionnelles',
                'description' => 'Comment évaluer efficacement les compétences techniques des apprenants.',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin' => Carbon::now()->addDays(2),
                'formateur_user_id' => $formateurUserIds[array_rand($formateurUserIds)],
                'etat' => 'validee',
                'location_type' => 'hybride',
            ],
            [
                'titre' => 'Gestion de classe et leadership pédagogique',
                'description' => 'Techniques de gestion de classe pour maintenir un environnement d\'apprentissage optimal.',
                'date_debut' => Carbon::now(),
                'date_fin' => Carbon::now()->addHours(8),
                'formateur_user_id' => $formateurUserIds[array_rand($formateurUserIds)],
                'etat' => 'en_cours',
                'location_type' => 'local',
            ],
            [
                'titre' => 'Formation sur l\'intelligence artificielle',
                'description' => 'Introduction à l\'IA et son application dans les métiers techniques.',
                'date_debut' => Carbon::now()->addDays(10),
                'date_fin' => Carbon::now()->addDays(12),
                'formateur_user_id' => $formateurUserIds[array_rand($formateurUserIds)],
                'etat' => 'planifiee',
                'location_type' => 'distance',
            ],
        ];
        
        foreach ($sessions as $session) {
            SessionFormation::create($session);
        }
        
        $this->command->info('Created ' . count($sessions) . ' sample session formations');
    }
} 