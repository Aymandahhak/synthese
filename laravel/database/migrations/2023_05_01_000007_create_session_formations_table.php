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
        Schema::create('session_formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained()->onDelete('cascade');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->string('lieu');
            $table->integer('capacite_max')->default(20);
            $table->string('statut')->default('pending'); // pending, validated, rejected
            $table->string('salle')->nullable();
            $table->string('equipement')->nullable();
            $table->text('details_hebergement')->nullable();
            $table->text('details_restauration')->nullable();
            $table->string('formateur_animateur_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_formations');
    }
}; 