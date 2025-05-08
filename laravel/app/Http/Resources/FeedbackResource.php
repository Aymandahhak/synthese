<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
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
            'session' => $this->whenLoaded('sessionFormation', function () {
                return [
                    'id' => $this->sessionFormation->id,
                    'titre' => $this->sessionFormation->titre,
                ];
            }),
            'formateur_user_id' => $this->formateur_user_id,
            'formateur' => $this->whenLoaded('formateur', function () {
                return [
                    'id' => $this->formateur->id,
                    'name' => $this->formateur->name,
                ];
            }),
            'note' => $this->note,
            'commentaire' => $this->commentaire,
            'sentiment' => $this->sentiment,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 