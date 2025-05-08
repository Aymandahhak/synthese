<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionFormationResource extends JsonResource
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
            'titre' => $this->titre,
            'description' => $this->description,
            'date_debut' => $this->date_debut->toIso8601String(), // Format dates consistently
            'date_fin' => $this->date_fin->toIso8601String(),
            'etat' => $this->etat,
            'location_type' => $this->location_type,
            'location_details' => $this->location_details,
            'max_participants' => $this->max_participants,
            'category' => $this->category,
            'formateur_user_id' => $this->formateur_user_id,
            // Include formateur details if the relationship is loaded
            'formateur' => $this->whenLoaded('formateur', function () {
                return [
                    'id' => $this->formateur->id,
                    'name' => $this->formateur->name,
                    // Add other formateur fields if needed
                ];
            }),
            // Include feedback summary if needed
            'feedback_count' => $this->whenLoaded('feedbacks', function () {
                return $this->feedbacks->count();
            }),
            'average_rating' => $this->whenLoaded('feedbacks', function () {
                return $this->feedbacks->avg('note');
            }),
            // Include presence count if needed
            'presence_count' => $this->whenLoaded('presences', function () {
                return $this->presences->count();
            }),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
