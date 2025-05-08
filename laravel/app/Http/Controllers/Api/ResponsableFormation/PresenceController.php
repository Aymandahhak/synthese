<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presence;
use App\Models\SessionFormation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class PresenceController extends Controller
{
    /**
     * Display a listing of the resource, filtered by session.
     */
    public function index(Request $request)
    {
        // Validation: Ensure session_id is provided
        $request->validate([
            'session_id' => 'required|integer|exists:session_formations,id'
        ]);
        
        $sessionId = $request->query('session_id');
        $date = $request->query('date') ? Carbon::parse($request->query('date'))->toDateString() : null;
        
        // Get the session to check its date range
        $session = SessionFormation::findOrFail($sessionId);
        
        // Get all participants for this session
        // In a real implementation, this would be based on session registrants or a defined group
        $participants = User::whereIn('role', ['formateur_participant'])
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
            
        // If a specific date is requested, use that, otherwise use session start date or today
        if (!$date) {
            // Use session start date if it's in the future, otherwise today
            $today = Carbon::today()->toDateString();
            $sessionStart = Carbon::parse($session->date_debut)->toDateString();
            $date = ($sessionStart > $today) ? $sessionStart : $today;
        }
        
        // Get presence records for the session and date
        $presenceRecords = Presence::where('session_formation_id', $sessionId)
            ->where('date_presence', $date)
            ->get()
            ->keyBy('participant_user_id');
            
        // Prepare the attendance data with all participants
        $attendanceData = $participants->map(function($participant) use ($presenceRecords, $date, $sessionId) {
            // Get existing presence record or create a new one
            $presence = $presenceRecords->get($participant->id);
            
            return [
                'participant_id' => $participant->id,
                'participant_name' => $participant->name,
                'participant_email' => $participant->email,
                'status' => $presence ? $presence->status : 'absent', // Default to absent
                'date_presence' => $date,
                'session_formation_id' => $sessionId,
                'presence_id' => $presence ? $presence->id : null
            ];
        });
        
        // Get all dates in the session period
        $sessionDates = $this->getSessionDates($session);
        
        return response()->json([
            'attendance' => $attendanceData,
            'session' => [
                'id' => $session->id,
                'titre' => $session->titre,
                'date_debut' => $session->date_debut,
                'date_fin' => $session->date_fin
            ],
            'session_dates' => $sessionDates,
            'current_date' => $date
        ]);
    }

    /**
     * Store or update presence records (bulk operation).
     */
    public function storeOrUpdate(Request $request)
    {
        // Validate request
        $request->validate([
            'presences' => 'required|array',
            'presences.*.participant_id' => 'required|integer|exists:users,id',
            'presences.*.session_formation_id' => 'required|integer|exists:session_formations,id',
            'presences.*.date_presence' => 'required|date',
            'presences.*.status' => ['required', Rule::in(['present', 'absent', 'justifie'])]
        ]);
        
        $presences = $request->input('presences');
        $results = [];
        
        // Use transaction to ensure all operations complete or none do
        DB::beginTransaction();
        try {
            foreach ($presences as $presenceData) {
                $presence = Presence::updateOrCreate(
                    // Key attributes for finding existing record
                    [
                        'session_formation_id' => $presenceData['session_formation_id'],
                        'participant_user_id' => $presenceData['participant_id'],
                        'date_presence' => $presenceData['date_presence']
                    ],
                    // Values to update
                    [
                        'status' => $presenceData['status']
                    ]
                );
                
                $results[] = [
                    'id' => $presence->id,
                    'participant_id' => $presence->participant_user_id,
                    'status' => $presence->status
                ];
            }
            
            DB::commit();
            return response()->json([
                'message' => 'Présences mises à jour avec succès',
                'results' => $results
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour des présences',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance statistics for a session.
     */
    public function getSessionStats(Request $request)
    {
        $request->validate([
            'session_id' => 'required|integer|exists:session_formations,id'
        ]);
        
        $sessionId = $request->query('session_id');
        $session = SessionFormation::findOrFail($sessionId);
        
        // Get all presence records for this session
        $presences = Presence::where('session_formation_id', $sessionId)->get();
        
        // Calculate statistics
        $totalDays = $this->getSessionDates($session)->count();
        $totalParticipants = User::whereIn('role', ['formateur_participant'])->count();
        $totalPossiblePresences = $totalDays * $totalParticipants;
        
        $presentCount = $presences->where('status', 'present')->count();
        $absentCount = $presences->where('status', 'absent')->count();
        $justifiedCount = $presences->where('status', 'justifie')->count();
        
        // Calculate attendance rate (if there are any possible presences)
        $attendanceRate = $totalPossiblePresences > 0 
            ? round(($presentCount / $totalPossiblePresences) * 100, 2) 
            : 0;
            
        return response()->json([
            'session_id' => $sessionId,
            'total_days' => $totalDays,
            'total_participants' => $totalParticipants,
            'present_count' => $presentCount,
            'absent_count' => $absentCount,
            'justified_count' => $justifiedCount,
            'attendance_rate' => $attendanceRate,
        ]);
    }
    
    /**
     * Get all dates between session start and end date.
     * 
     * @param SessionFormation $session
     * @return \Illuminate\Support\Collection
     */
    private function getSessionDates(SessionFormation $session)
    {
        $startDate = Carbon::parse($session->date_debut)->startOfDay();
        $endDate = Carbon::parse($session->date_fin)->startOfDay();
        
        $dates = collect();
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            // Typically we might exclude weekends here if needed
            // if (!$currentDate->isWeekend()) {
                $dates->push($currentDate->toDateString());
            // }
            $currentDate->addDay();
        }
        
        return $dates;
    }
}
