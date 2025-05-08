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
        Schema::create('formateur_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formateur_id')->constrained()->onDelete('cascade');
            $table->foreignId('session_formation_id')->constrained()->onDelete('cascade');
            $table->string('statut')->default('inscrit'); // inscrit, present, absent
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formateur_session');
    }
}; 