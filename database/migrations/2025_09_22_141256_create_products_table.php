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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('barcode', 50)->unique();
            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            $table->foreignId('supplier_id')->constrained()->onDelete('restrict');
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('selling_price', 10, 2);
            $table->integer('initial_stock')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->string('pharmaceutical_form', 100);
            $table->string('dosage', 100)->nullable();
            $table->date('expiry_date');
            $table->text('description')->nullable();
            $table->string('image_path', 500)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['barcode']);
            $table->index(['category_id']);
            $table->index(['supplier_id']);
            $table->index(['expiry_date']);
            $table->index(['status']);
            $table->index(['status', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
