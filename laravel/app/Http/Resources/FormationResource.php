<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormationResource extends JsonResource
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
            'date_debut' => $this->date_debut?->toIso8601String(),
            'date_fin' => $this->date_fin?->toIso8601String(),
            'statut' => $this->statut,
            'responsable_id' => $this->responsable_id,
            'responsable' => $this->whenLoaded('responsable', function() {
                return [
                    'id' => $this->responsable->id,
                    'name' => $this->responsable->name,
                    'email' => $this->responsable->email,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
} 