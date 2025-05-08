<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Feedback;
use App\Models\SessionFormation;
use App\Models\User;
use App\Models\Role;
use Carbon\Carbon;

class FeedbackSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get sessions IDs
        $sessionIds = SessionFormation::pluck('id')->toArray();
        
        if (empty($sessionIds)) {
            $this->command->error('No sessions found in database. Please seed the session_formations table first.');
            return;
        }
        
        // Get IDs of relevant formateur roles
        $formateurRoleNames = ['formateur_animateur', 'formateur_participant'];
        $formateurRoleIds = Role::whereIn('name', $formateurRoleNames)->pluck('id');
        
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
        
        // Sample feedback comments
        $positiveComments = [
            'Excellente formation, très pratique et bien expliquée.',
            'Le formateur était très compétent et pédagogue. J\'ai beaucoup appris.',
            'Contenu pertinent et bien structuré, je recommande vivement.',
            'Formation qui répond parfaitement à mes attentes professionnelles.',
            'Animation dynamique et interactive, merci pour cette qualité.',
        ];
        
        $neutralComments = [
            'Formation correcte mais qui pourrait être plus approfondie.',
            'Contenu intéressant mais rythme un peu lent.',
            'Des points positifs et des axes d\'amélioration à considérer.',
            'Répond aux attentes basiques mais manque d\'exemples concrets.',
            'Formation standard, ni excellente ni mauvaise.',
        ];
        
        $negativeComments = [
            'Contenu trop théorique et peu applicable au quotidien.',
            'Rythme trop rapide, difficile de suivre toutes les notions.',
            'Les objectifs annoncés n\'ont pas été atteints.',
            'Manque d\'interactions et d\'exercices pratiques.',
            'Documentation insuffisante pour approfondir après la formation.',
        ];
        
        // Create feedbacks
        $count = 0;
        
        // For each session, create 2-5 feedbacks
        foreach ($sessionIds as $sessionId) {
            $numFeedbacks = rand(2, 5);
            
            // Ensure we don't try to create more feedbacks than available formateurs
            $numFeedbacks = min($numFeedbacks, count($formateurUserIds));
            $usedFormateurIds = []; // Keep track of used formateurs for this session
            
            for ($i = 0; $i < $numFeedbacks; $i++) {
                // Select a unique formateur ID for this session feedback
                do {
                    $formateurId = $formateurUserIds[array_rand($formateurUserIds)];
                } while (in_array($formateurId, $usedFormateurIds));
                $usedFormateurIds[] = $formateurId;
                
                // Random note between 1-5
                $note = rand(1, 5);
                
                // Select appropriate comment based on note
                if ($note >= 4) {
                    $commentaire = $positiveComments[array_rand($positiveComments)];
                } elseif ($note <= 2) {
                    $commentaire = $negativeComments[array_rand($negativeComments)];
                } else {
                    $commentaire = $neutralComments[array_rand($neutralComments)];
                }
                
                // Random creation date in the past 30 days
                $createdAt = Carbon::now()->subDays(rand(1, 30))->format('Y-m-d H:i:s');
                
                Feedback::create([
                    'session_formation_id' => $sessionId,
                    'formateur_user_id' => $formateurId,
                    'note' => $note,
                    'commentaire' => $commentaire,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
                
                $count++;
            }
        }
        
        $this->command->info('Created ' . $count . ' sample feedback entries');
    }
} 