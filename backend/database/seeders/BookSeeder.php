<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $books = [
            [
                'title' => 'Cho tôi xin một vé đi tuổi thơ',
                'category' => 'Văn học',
                'authors' => ['Nguyễn Nhật Ánh'],
                'description' => 'Tác phẩm viết về những kỷ niệm tuổi thơ trong trẻo, hồn nhiên.',
                'quantity' => 5,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Mắt biếc',
                'category' => 'Văn học',
                'authors' => ['Nguyễn Nhật Ánh'],
                'description' => 'Câu chuyện tình yêu nhẹ nhàng nhưng day dứt của tuổi trẻ.',
                'quantity' => 4,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Dế Mèn phiêu lưu ký',
                'category' => 'Thiếu nhi',
                'authors' => ['Tô Hoài'],
                'description' => 'Tác phẩm kinh điển của văn học thiếu nhi Việt Nam.',
                'quantity' => 6,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Đắc Nhân Tâm',
                'category' => 'Kỹ năng sống',
                'authors' => ['Dale Carnegie'],
                'description' => 'Cuốn sách kinh điển về nghệ thuật đối nhân xử thế.',
                'quantity' => 8,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Đắc Nhân Tâm Trong Kinh Doanh',
                'category' => 'Kỹ năng sống',
                'authors' => ['Dale Carnegie'],
                'description' => 'Ứng dụng nghệ thuật giao tiếp vào môi trường kinh doanh.',
                'quantity' => 3,
                'borrow_fee' => 5000,
            ],
            [
                'title' => 'Cha Giàu Cha Nghèo',
                'category' => 'Kinh tế',
                'authors' => ['Robert T. Kiyosaki'],
                'description' => 'Cuốn sách nổi tiếng về tư duy tài chính cá nhân.',
                'quantity' => 5,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Clean Code',
                'category' => 'Công nghệ thông tin',
                'authors' => ['Robert C. Martin'],
                'description' => 'Sách kinh điển về viết mã nguồn sạch, dễ bảo trì.',
                'quantity' => 4,
                'borrow_fee' => 10000,
            ],
            [
                'title' => 'Clean Architecture',
                'category' => 'Công nghệ thông tin',
                'authors' => ['Robert C. Martin'],
                'description' => 'Nguyên lý thiết kế kiến trúc phần mềm bền vững.',
                'quantity' => 3,
                'borrow_fee' => 10000,
            ],
            [
                'title' => 'Python Crash Course',
                'category' => 'Công nghệ thông tin',
                'authors' => ['Eric Matthes'],
                'description' => 'Giáo trình nhập môn lập trình Python cho người mới bắt đầu.',
                'quantity' => 6,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Sapiens: Lược Sử Loài Người',
                'category' => 'Lịch sử',
                'authors' => ['Yuval Noah Harari'],
                'description' => 'Hành trình khám phá lịch sử tiến hoá của loài người.',
                'quantity' => 4,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Homo Deus: Lược Sử Tương Lai',
                'category' => 'Khoa học',
                'authors' => ['Yuval Noah Harari'],
                'description' => 'Những dự đoán về tương lai của loài người và công nghệ.',
                'quantity' => 3,
                'borrow_fee' => 0,
            ],
            [
                'title' => 'Nhà Giả Kim',
                'category' => 'Văn học',
                'authors' => ['Paulo Coelho'],
                'description' => 'Câu chuyện ngụ ngôn nổi tiếng về hành trình theo đuổi ước mơ.',
                'quantity' => 7,
                'borrow_fee' => 0,
            ],
        ];

        foreach ($books as $data) {
            $category = Category::where('name', $data['category'])->first();

            $book = Book::firstOrCreate(
                ['title' => $data['title']],
                [
                    'category_id' => $category?->id,
                    'description' => $data['description'],
                    'quantity' => $data['quantity'],
                    'available_quantity' => $data['quantity'],
                    'borrow_fee' => $data['borrow_fee'],
                    'status' => Book::STATUS_AVAILABLE,
                ]
            );

            $authorIds = Author::whereIn('name', $data['authors'])->pluck('id');
            $book->authors()->sync($authorIds);
        }
    }
}
