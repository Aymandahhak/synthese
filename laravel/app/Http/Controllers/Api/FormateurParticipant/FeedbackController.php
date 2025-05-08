<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\SessionFormation;
use App\Http\Resources\FeedbackResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;

class FeedbackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Start query, always load relations
        $query = Feedback::with(['sessionFormation', 'formateur']);
        
        // Filter by session_id if provided
        if ($request->has('session_id')) {
            $query->where('session_formation_id', $request->query('session_id'));
        }
        
        // Filter by formateur_id if provided
        if ($request->has('formateur_id')) {
            $query->where('formateur_user_id', $request->query('formateur_id'));
        }
        
        // Filter by sentiment (derived from note)
        if ($request->has('sentiment')) {
            $sentiment = $request->query('sentiment');
            
            if ($sentiment === 'positif') {
                $query->where('note', '>=', 4);
            } elseif ($sentiment === 'negatif') {
                $query->where('note', '<=', 2);
            } else { // neutre
                $query->whereBetween('note', [3, 3]);
            }
        }
        
        // Filter by date range if provided
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }
        
        // Role-specific modifications
        if (Auth::user()->role === 'responsable_formation') {
            // Responsables can see all feedback
        } elseif (Auth::user()->role === 'formateur_animateur') {
            // Formateurs can only see feedback for their sessions
            $query->whereHas('sessionFormation', function (Builder $q) {
                $q->where('formateur_user_id', Auth::id());
            });
        }
        
        // Order by created_at desc by default
        $query->orderBy('created_at', 'desc');
        
        // Paginate the results
        $feedbacks = $query->paginate(15);
        
        return FeedbackResource::collection($feedbacks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'session_formation_id' => [
                'required',
                'exists:session_formations,id',
            ],
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'required|string|max:1000',
        ]);
        
        // Automatically set the formateur_user_id to the authenticated user
        $validated['formateur_user_id'] = Auth::id();
        
        // Create the feedback
        $feedback = Feedback::create($validated);
        $feedback->load(['sessionFormation', 'formateur']);
        
        return new FeedbackResource($feedback);
    }

    /**
     * Display the specified resource.
     */
    public function show(Feedback $feedback)
    {
        // Check if user has permission to view this feedback
        if (Auth::user()->role !== 'responsable_formation' && 
            Auth::user()->role !== 'admin' && 
            $feedback->formateur_user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $feedback->load(['sessionFormation', 'formateur']);
        
        return new FeedbackResource($feedback);
    }

    /**
     * Get all feedback for a specific session.
     */
    public function getBySession(SessionFormation $session)
    {
        // Check if user has permission to view this session's feedback
        if (Auth::user()->role !== 'responsable_formation' && 
            Auth::user()->role !== 'admin' && 
            $session->formateur_user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $feedbacks = Feedback::where('session_formation_id', $session->id)
            ->with(['formateur'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return FeedbackResource::collection($feedbacks);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Feedback $feedback)
    {
        // Only the user who created the feedback can update it
        if ($feedback->formateur_user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'note' => 'sometimes|required|integer|min:1|max:5',
            'commentaire' => 'sometimes|required|string|max:1000',
        ]);
        
        $feedback->update($validated);
        $feedback->load(['sessionFormation', 'formateur']);
        
        return new FeedbackResource($feedback);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Feedback $feedback)
    {
        // Only the user who created the feedback or an admin can delete it
        if ($feedback->formateur_user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $feedback->delete();
        
        return response()->json(['message' => 'Feedback supprimé avec succès']);
    }
}
