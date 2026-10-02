<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\User;
use Illuminate\Database\Seeder;

class BorrowRecordSeeder extends Seeder
{
    public function run(): void
    {
        $reader1 = User::where('email', 'docgia@thuvien.vn')->first();
        $reader2 = User::where('email', 'docgia2@thuvien.vn')->first();
        $staff = User::where('email', 'nhanvien@thuvien.vn')->first();

        if (! $reader1 || ! $reader2 || ! $staff) {
            return;
        }

        $book1 = Book::where('title', 'Cho tôi xin một vé đi tuổi thơ')->first();
        $book2 = Book::where('title', 'Đắc Nhân Tâm')->first();
        $book3 = Book::where('title', 'Clean Code')->first();
        $book4 = Book::where('title', 'Nhà Giả Kim')->first();

        // 1) Yêu cầu đang chờ xác nhận
        if ($book1) {
            BorrowRecord::firstOrCreate(
                ['user_id' => $reader2->id, 'book_id' => $book1->id, 'status' => BorrowRecord::STATUS_PENDING],
                [
                    'borrow_date' => now()->toDateString(),
                    'due_date' => now()->addDays(BorrowRecord::DEFAULT_BORROW_DAYS)->toDateString(),
                ]
            );
        }

        // 2) Đang mượn (còn hạn)
        if ($book2 && ! BorrowRecord::where('user_id', $reader1->id)->where('book_id', $book2->id)->exists()) {
            BorrowRecord::create([
                'user_id' => $reader1->id,
                'book_id' => $book2->id,
                'confirmed_by' => $staff->id,
                'borrow_date' => now()->subDays(3)->toDateString(),
                'due_date' => now()->addDays(11)->toDateString(),
                'status' => BorrowRecord::STATUS_BORROWED,
            ]);
            $book2->decrement('available_quantity');
        }

        // 3) Quá hạn
        if ($book3 && ! BorrowRecord::where('user_id', $reader1->id)->where('book_id', $book3->id)->exists()) {
            BorrowRecord::create([
                'user_id' => $reader1->id,
                'book_id' => $book3->id,
                'confirmed_by' => $staff->id,
                'borrow_date' => now()->subDays(20)->toDateString(),
                'due_date' => now()->subDays(6)->toDateString(),
                'status' => BorrowRecord::STATUS_OVERDUE,
            ]);
            $book3->decrement('available_quantity');
        }

        // 4) Đã trả (lịch sử)
        if ($book4 && ! BorrowRecord::where('user_id', $reader2->id)->where('book_id', $book4->id)->exists()) {
            BorrowRecord::create([
                'user_id' => $reader2->id,
                'book_id' => $book4->id,
                'confirmed_by' => $staff->id,
                'borrow_date' => now()->subDays(30)->toDateString(),
                'due_date' => now()->subDays(16)->toDateString(),
                'return_date' => now()->subDays(18)->toDateString(),
                'status' => BorrowRecord::STATUS_RETURNED,
            ]);
        }
    }
}
