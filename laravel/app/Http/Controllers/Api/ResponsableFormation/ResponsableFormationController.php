<?php

namespace App\Http\Controllers\Api\ResponsableFormation;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\ResponsableFormation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ResponsableFormationController extends Controller
{
    /**
     * Get the profile data for the responsable formation
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        // For testing without auth, we'll get first responsable formation
        // Later, you would use Auth::id() to get the current user's profile
        $responsable = ResponsableFormation::with('user')->first();
        
        if (!$responsable) {
            return response()->json([
                'message' => 'Profil de responsable de formation introuvable'
            ], 404);
        }
        
        // Count active formations
        $activeFormations = Formation::where('responsable_id', $responsable->id)
            ->whereIn('statut', ['planifiee', 'en_cours'])
            ->count();
        
        // Count completed formations
        $completedFormations = Formation::where('responsable_id', $responsable->id)
            ->where('statut', 'terminee')
            ->count();
            
        // Count pending validations
        $pendingValidations = Formation::where('responsable_id', $responsable->id)
            ->where('statut', 'en_attente_validation')
            ->count();
            
        // Count formateurs currently in formation
        $formateursEnFormation = Formation::where('responsable_id', $responsable->id)
            ->whereIn('statut', ['en_cours'])
            ->withCount('formateurs')
            ->get()
            ->sum('formateurs_count');
        
        // Get recent activity (last 5 formations)
        $recentActivity = Formation::where('responsable_id', $responsable->id)
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($formation) {
                return [
                    'action' => $this->getActionForStatus($formation->statut),
                    'description' => $formation->titre,
                    'date' => $formation->updated_at->format('Y-m-d')
                ];
            });
        
        return response()->json([
            'id' => $responsable->id,
            'name' => $responsable->user->name,
            'role' => 'Responsable Formation',
            'avatar' => '/avatars/responsable1.jpg', // Placeholder, update with actual avatar
            'email' => $responsable->user->email,
            'departement' => $responsable->departement,
            'date_debut_fonction' => $responsable->date_debut_fonction,
            'description' => $responsable->description,
            'statistics' => [
                'pending_validations' => $pendingValidations,
                'active_formations' => $activeFormations,
                'completed_formations' => $completedFormations,
                'formateurs_en_formation' => $formateursEnFormation
            ],
            'recentActivity' => $recentActivity
        ]);
    }
    
    /**
     * Get action description based on status
     */
    private function getActionForStatus($status)
    {
        switch($status) {
            case 'planifiee':
                return 'Formation planifiée';
            case 'en_cours':
                return 'Formation en cours';
            case 'terminee':
                return 'Formation terminée';
            case 'annulee':
                return 'Formation annulée';
            case 'validee':
                return 'Formation validée';
            case 'en_attente_validation':
                return 'En attente de validation';
            default:
                return 'Mise à jour de formation';
        }
    }

    /**
     * Display dashboard data for the responsable de formation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard(Request $request)
    {
        $user = Auth::user();

        // Placeholder data
        $actions = [
            ['id' => 'sessions', 'title' => 'Gérer les Sessions de Formation', 'url' => '/dashboard/responsable-formation/sessions'],
            ['id' => 'feedbacks', 'title' => 'Suivre les Feedbacks des Formateurs', 'url' => '/dashboard/responsable-formation/feedbacks'],
            ['id' => 'presences', 'title' => 'Valider les Participations', 'url' => '/dashboard/responsable-formation/presences'],
            ['id' => 'reports', 'title' => 'Voir les Rapports', 'url' => '/dashboard/responsable-formation/reports'],
        ];

        return response()->json([
            'welcome_message' => 'Bienvenue, Responsable de formation', // Or use $user->name
            'role' => $user->role,
            'actions' => $actions,
            'api_message' => 'hello from API' // Static message for now
        ]);
    }

    /**
     * Afficher la liste des formations
     */
    public function index()
    {
        $userId = Auth::id();
        $responsable = ResponsableFormation::where('user_id', $userId)->first();
        
        if (!$responsable) {
            return response()->json([
                'message' => 'Profil de responsable de formation introuvable'
            ], 404);
        }
        
        $formations = Formation::where('responsable_id', $responsable->id)
                                ->with('formateurs')
                                ->orderBy('date_debut', 'desc')
                                ->get();
        
        return response()->json([
            'message' => 'Liste des formations récupérée avec succès',
            'data' => $formations
        ]);
    }

    /**
     * Ajouter une nouvelle formation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
            'formateurs' => 'nullable|array',
            'formateurs.*' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = Auth::id();
        $responsable = ResponsableFormation::where('user_id', $userId)->first();
        
        if (!$responsable) {
            return response()->json([
                'message' => 'Profil de responsable de formation introuvable'
            ], 404);
        }

        $formation = Formation::create([
            'titre' => $request->titre,
            'description' => $request->description,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'lieu' => $request->lieu,
            'capacite_max' => $request->capacite_max ?? 20,
            'responsable_id' => $responsable->id,
            'statut' => 'planifiee'
        ]);

        // Associer les formateurs si fournis
        if ($request->has('formateurs') && is_array($request->formateurs)) {
            $formateurData = [];
            foreach ($request->formateurs as $formateurId) {
                $formateurData[$formateurId] = [
                    'statut' => 'assigne',
                    'date_assignation' => now()
                ];
            }
            $formation->formateurs()->attach($formateurData);
        }

        return response()->json([
            'message' => 'Formation créée avec succès',
            'data' => $formation->load('formateurs')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Modifier une formation
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after:date_debut',
            'lieu' => 'nullable|string|max:255',
            'capacite_max' => 'nullable|integer|min:1',
            'statut' => 'sometimes|in:planifiee,en_cours,terminee,annulee,validee',
            'formateurs' => 'nullable|array',
            'formateurs.*' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = Auth::id();
        $responsable = ResponsableFormation::where('user_id', $userId)->first();
        
        if (!$responsable) {
            return response()->json([
                'message' => 'Profil de responsable de formation introuvable'
            ], 404);
        }

        $formation = Formation::where('id', $id)
                               ->where('responsable_id', $responsable->id)
                               ->first();
        
        if (!$formation) {
            return response()->json([
                'message' => 'Formation introuvable ou vous n\'êtes pas autorisé à la modifier'
            ], 404);
        }

        $formation->update($request->only([
            'titre', 'description', 'date_debut', 'date_fin', 
            'lieu', 'capacite_max', 'statut'
        ]));

        // Mettre à jour les formateurs si fournis
        if ($request->has('formateurs') && is_array($request->formateurs)) {
            $formateurData = [];
            foreach ($request->formateurs as $formateurId) {
                $formateurData[$formateurId] = [
                    'statut' => 'assigne',
                    'date_assignation' => now()
                ];
            }
            $formation->formateurs()->sync($formateurData);
        }

        return response()->json([
            'message' => 'Formation mise à jour avec succès',
            'data' => $formation->load('formateurs')
        ]);
    }

    /**
     * Supprimer une formation
     */
    public function destroy($id)
    {
        $userId = Auth::id();
        $responsable = ResponsableFormation::where('user_id', $userId)->first();
        
        if (!$responsable) {
            return response()->json([
                'message' => 'Profil de responsable de formation introuvable'
            ], 404);
        }

        $formation = Formation::where('id', $id)
                               ->where('responsable_id', $responsable->id)
                               ->first();
        
        if (!$formation) {
            return response()->json([
                'message' => 'Formation introuvable ou vous n\'êtes pas autorisé à la supprimer'
            ], 404);
        }

        $formation->delete();

        return response()->json([
            'message' => 'Formation supprimée avec succès'
        ]);
    }
}
