<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        $authors = [
            'Nguyễn Nhật Ánh' => 'Nhà văn Việt Nam nổi tiếng với nhiều tác phẩm văn học thiếu nhi và tuổi mới lớn.',
            'Tô Hoài' => 'Nhà văn Việt Nam, tác giả của nhiều tác phẩm văn học kinh điển.',
            'Dale Carnegie' => 'Tác giả người Mỹ, nổi tiếng với các sách về kỹ năng sống và phát triển bản thân.',
            'Robert T. Kiyosaki' => 'Tác giả người Mỹ, chuyên viết về tài chính cá nhân và đầu tư.',
            'Robert C. Martin' => 'Kỹ sư phần mềm, tác giả nhiều sách kinh điển về lập trình.',
            'Yuval Noah Harari' => 'Sử gia, tác giả người Israel, nổi tiếng với các sách về lịch sử loài người.',
            'Paulo Coelho' => 'Nhà văn người Brazil, tác giả của nhiều tiểu thuyết nổi tiếng thế giới.',
            'Eric Matthes' => 'Tác giả sách hướng dẫn lập trình Python cho người mới bắt đầu.',
        ];

        foreach ($authors as $name => $bio) {
            Author::firstOrCreate(['name' => $name], ['biography' => $bio]);
        }
    }
}
