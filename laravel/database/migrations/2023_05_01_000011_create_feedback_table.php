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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formateur_id')->constrained()->onDelete('cascade');
            $table->foreignId('session_formation_id')->constrained()->onDelete('cascade');
            $table->integer('note')->nullable(); // 1-5
            $table->text('commentaire')->nullable();
            $table->json('aspects_evaluation')->nullable(); // JSON with different evaluation aspects
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
}; 