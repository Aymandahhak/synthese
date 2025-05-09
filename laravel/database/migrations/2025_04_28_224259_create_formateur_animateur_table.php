<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('formateur_animateur', function (Blueprint $table) {
            $table->id();
            // Référence vers la table 'formations'
            $table->foreignId('formation_id')
                  ->constrained('formations')  // Contrainte vers la table 'formations'
                  ->onDelete('cascade');  // Si la formation est supprimée, les liens sont supprimés
                  
            // ID du formateur animateur
            $table->unsignedBigInteger('formateur_animateur_id');  
            
            // Nom et prénom du formateur animateur
            $table->string('nom');
            $table->string('prenom');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formateur_animateur_formation');
    }
};
