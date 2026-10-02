<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => Role::READER], ['description' => 'Độc giả - người dùng mượn sách']);
        Role::firstOrCreate(['name' => Role::STAFF], ['description' => 'Nhân viên thư viện - xử lý nghiệp vụ mượn trả']);
        Role::firstOrCreate(['name' => Role::ADMIN], ['description' => 'Quản trị viên hệ thống']);
    }
}
