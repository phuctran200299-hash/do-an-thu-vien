<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', Role::ADMIN)->first();
        $staffRole = Role::where('name', Role::STAFF)->first();
        $readerRole = Role::where('name', Role::READER)->first();

        User::firstOrCreate(
            ['email' => 'admin@thuvien.vn'],
            [
                'name' => 'Quản trị viên',
                'password' => Hash::make('admin123'),
                'role_id' => $adminRole->id,
                'phone' => '0900000001',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'nhanvien@thuvien.vn'],
            [
                'name' => 'Nguyễn Văn Nhân Viên',
                'password' => Hash::make('staff123'),
                'role_id' => $staffRole->id,
                'phone' => '0900000002',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'docgia@thuvien.vn'],
            [
                'name' => 'Trần Thị Độc Giả',
                'password' => Hash::make('reader123'),
                'role_id' => $readerRole->id,
                'phone' => '0900000003',
                'address' => 'Hà Nội',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'docgia2@thuvien.vn'],
            [
                'name' => 'Lê Văn Bình',
                'password' => Hash::make('reader123'),
                'role_id' => $readerRole->id,
                'phone' => '0900000004',
                'address' => 'Hải Phòng',
                'is_active' => true,
            ]
        );
    }
}
