<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PresenceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_formation_id' => $this->session_formation_id,
            'participant_id' => $this->participant_user_id,
            'status' => $this->status,
            'date_presence' => $this->date_presence->toDateString(),
            // Include participant details if the relationship is loaded
            'participant' => $this->whenLoaded('participant', function () {
                return [
                    'id' => $this->participant->id,
                    'name' => $this->participant->name,
                    'email' => $this->participant->email,
                ];
            }),
            // Include session details if the relationship is loaded
            'session' => $this->whenLoaded('sessionFormation', function () {
                return [
                    'id' => $this->sessionFormation->id,
                    'titre' => $this->sessionFormation->titre,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
} 