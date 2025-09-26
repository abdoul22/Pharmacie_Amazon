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
        Schema::table('products', function (Blueprint $table) {
            $table->enum('prescription_type', ['libre', 'sur_ordonnance', 'controle'])
                ->default('libre')
                ->after('selling_price');

            $table->boolean('requires_prescription')
                ->default(false)
                ->after('prescription_type');

            $table->text('prescription_notes')
                ->nullable()
                ->after('requires_prescription');

            $table->json('restricted_conditions')
                ->nullable()
                ->after('prescription_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'prescription_type',
                'requires_prescription',
                'prescription_notes',
                'restricted_conditions'
            ]);
        });
    }
};
