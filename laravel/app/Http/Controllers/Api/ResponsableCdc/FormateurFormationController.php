<?php
namespace App\Http\Controllers\Api\ResponsableCdc;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Formateur;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class FormateurFormationController extends Controller
{
    /**
     * Afficher toutes les assignations formateur-formation
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $formateurs = Formateur::query()
            ->join('users', 'formateurs.user_id', '=', 'users.id')
            ->leftJoin('regions', 'formateurs.region_id', '=', 'regions.id')
            ->leftJoin('filieres', 'formateurs.filiere_id', '=', 'filieres.id')
            ->select(
                'formateurs.*', 
                'users.name as formateur_name', 
                'regions.nom as region_nom',
                'filieres.nom as filiere_nom'
            )
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $formateurs
        ]);
    }

    /**
     * Créer une nouvelle assignation formateur-formation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'specialite' => 'sometimes|string',
            'region_id' => 'sometimes|exists:regions,id',
            'filiere_id' => 'sometimes|exists:filieres,id',
            'matricule' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier si l'utilisateur a un rôle de formateur
        $user = User::find($request->user_id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé.'
            ], 422);
        }

        // Vérifier si ce formateur existe déjà
        $existingFormateur = Formateur::where('user_id', $request->user_id)->first();
        if ($existingFormateur) {
            return response()->json([
                'success' => false,
                'message' => 'Cet utilisateur est déjà enregistré comme formateur.',
                'data' => $existingFormateur
            ], 422);
        }

        try {
            $formateur = Formateur::create([
                'user_id' => $request->user_id,
                'specialite' => $request->specialite,
                'region_id' => $request->region_id,
                'filiere_id' => $request->filiere_id,
                'matricule' => $request->matricule,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Formateur créé avec succès',
                'data' => $formateur
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du formateur',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Afficher un formateur spécifique
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $formateur = Formateur::find($id);
        
        if (!$formateur) {
            return response()->json([
                'success' => false,
                'message' => 'Formateur non trouvé'
            ], 404);
        }
        
        // Chargement des relations
        $formateur->load(['user', 'region', 'filiere']);
        
        return response()->json([
            'success' => true,
            'data' => $formateur
        ]);
    }

    /**
     * Mettre à jour un formateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'specialite' => 'sometimes|string',
            'region_id' => 'sometimes|exists:regions,id',
            'filiere_id' => 'sometimes|exists:filieres,id',
            'matricule' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $formateur = Formateur::find($id);
        
        if (!$formateur) {
            return response()->json([
                'success' => false,
                'message' => 'Formateur non trouvé'
            ], 404);
        }

        $formateur->update($request->only([
            'specialite', 'region_id', 'filiere_id', 'matricule'
        ]));
        
        return response()->json([
            'success' => true,
            'message' => 'Formateur mis à jour avec succès',
            'data' => $formateur
        ]);
    }

    /**
     * Supprimer un formateur
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $formateur = Formateur::find($id);
        
        if (!$formateur) {
            return response()->json([
                'success' => false,
                'message' => 'Formateur non trouvé'
            ], 404);
        }
        
        $formateur->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Formateur supprimé avec succès'
        ]);
    }

    /**
     * Obtenir toutes les formations compatibles avec un formateur spécifique
     * (selon sa région et sa filière)
     *
     * @param  int  $formateurId
     * @return \Illuminate\Http\Response
     */
    public function getFormationsByFormateur($formateurId)
    {
        $formateur = Formateur::find($formateurId);
        
        if (!$formateur) {
            return response()->json([
                'success' => false,
                'message' => 'Formateur non trouvé'
            ], 404);
        }
        
        // Chercher les formations correspondant à la région et/ou filière du formateur
        $formationsQuery = Formation::query();
        
        if ($formateur->region_id) {
            $formationsQuery->where('region_id', $formateur->region_id);
        }
        
        if ($formateur->filiere_id) {
            $formationsQuery->where('filiere_id', $formateur->filiere_id);
        }
        
        $formations = $formationsQuery->with(['region', 'filiere'])->get();
            
        return response()->json([
            'success' => true,
            'data' => $formations
        ]);
    }

    /**
     * Obtenir tous les formateurs compatibles avec une formation spécifique
     * (selon la région et la filière de la formation)
     *
     * @param  int  $formationId
     * @return \Illuminate\Http\Response
     */
    public function getFormateursByFormation($formationId)
    {
        $formation = Formation::find($formationId);
        
        if (!$formation) {
            return response()->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }
        
        // Chercher les formateurs correspondant à la région et/ou filière de la formation
        $formateursQuery = Formateur::query()
            ->join('users', 'formateurs.user_id', '=', 'users.id')
            ->select('formateurs.*', 'users.name', 'users.email');
        
        if ($formation->region_id) {
            $formateursQuery->where('formateurs.region_id', $formation->region_id);
        }
        
        if ($formation->filiere_id) {
            $formateursQuery->where('formateurs.filiere_id', $formation->filiere_id);
        }
        
        $formateurs = $formateursQuery->get();
            
        return response()->json([
            'success' => true,
            'data' => $formateurs
        ]);
    }

    /**
     * Mettre à jour les informations d'un formateur
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'formateur_id' => 'required|exists:formateurs,id',
            'specialite' => 'sometimes|string',
            'region_id' => 'sometimes|exists:regions,id',
            'filiere_id' => 'sometimes|exists:filieres,id',
            'matricule' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $formateur = Formateur::find($request->formateur_id);
        
        if (!$formateur) {
            return response()->json([
                'success' => false,
                'message' => 'Formateur non trouvé'
            ], 404);
        }

        $formateur->update($request->only([
            'specialite', 'region_id', 'filiere_id', 'matricule'
        ]));
        
        return response()->json([
            'success' => true,
            'message' => 'Informations du formateur mises à jour avec succès',
            'data' => $formateur
        ]);
    }
}