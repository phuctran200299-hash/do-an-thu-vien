<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrow_record_id')->constrained('borrow_records')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('reason', 255)->nullable();
            $table->string('status', 20)->default('unpaid'); // unpaid | paid
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fines');
    }
};
