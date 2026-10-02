<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('status');
        });

        Schema::table('borrow_records', function (Blueprint $table) {
            $table->unsignedTinyInteger('renewed_count')->default(0)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });

        Schema::table('borrow_records', function (Blueprint $table) {
            $table->dropColumn('renewed_count');
        });
    }
};
