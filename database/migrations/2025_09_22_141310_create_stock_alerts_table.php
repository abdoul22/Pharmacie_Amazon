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
        Schema::create('stock_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['low_stock', 'expiring_soon', 'expired']);
            $table->string('message');
            $table->enum('priority', ['low', 'medium', 'high', 'critical']);
            $table->enum('status', ['active', 'seen'])->default('active');
            $table->timestamps();

            $table->index(['product_id']);
            $table->index(['type']);
            $table->index(['status']);
            $table->index(['priority']);
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_alerts');
    }
};
