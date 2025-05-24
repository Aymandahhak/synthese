<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Formation;
use Illuminate\Support\Facades\DB;

class SeedFormations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:formations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the database with example formations and remove existing ones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting formations seeding process...');
        
        try {
            // Clear existing formations
            $this->info('Removing existing formations...');
            Formation::truncate();
            $this->info('All existing formations have been removed.');
            
            // Create example formations
            $this->info('Creating new example formations...');
            
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
                    'image' => '/images/formations/web_dev.jpg',
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
                    'image' => '/images/formations/teacher_training.jpg',
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
                    'image' => '/images/formations/ai_training.jpg',
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
                    'image' => '/images/formations/agile_management.jpg',
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
                    'image' => '/images/formations/digital_marketing.jpg',
                ],
            ];
            
            // Create each formation
            foreach ($formations as $formationData) {
                Formation::create($formationData);
            }
            
            $this->info('Successfully created ' . count($formations) . ' example formations!');
            $this->info('Formation seeding completed successfully.');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('An error occurred during the seeding process: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
} 