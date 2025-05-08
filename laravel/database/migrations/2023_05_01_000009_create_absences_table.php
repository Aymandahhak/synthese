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
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formateur_id')->constrained()->onDelete('cascade');
            $table->foreignId('session_formation_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->boolean('justifiee')->default(false);
            $table->text('motif')->nullable();
            $table->string('piece_jointe')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
}; 