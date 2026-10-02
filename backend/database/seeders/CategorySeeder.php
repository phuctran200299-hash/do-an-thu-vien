<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Văn học' => 'Tiểu thuyết, truyện ngắn, thơ ca trong và ngoài nước',
            'Kỹ năng sống' => 'Sách phát triển bản thân, kỹ năng mềm',
            'Kinh tế' => 'Sách về kinh doanh, quản trị, tài chính',
            'Công nghệ thông tin' => 'Lập trình, khoa học máy tính, công nghệ',
            'Khoa học' => 'Sách phổ biến khoa học tự nhiên, xã hội',
            'Thiếu nhi' => 'Truyện tranh, sách giáo dục cho trẻ em',
            'Lịch sử' => 'Sách về lịch sử Việt Nam và thế giới',
            'Ngoại ngữ' => 'Sách học tiếng Anh và các ngoại ngữ khác',
        ];

        foreach ($categories as $name => $description) {
            Category::firstOrCreate(['name' => $name], ['description' => $description]);
        }
    }
}
