<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Seeder;

class Phase2DemoSeeder extends Seeder
{
    public function run(): void
    {
        $reader1 = User::where('email', 'docgia@thuvien.vn')->first();
        $reader2 = User::where('email', 'docgia2@thuvien.vn')->first();
        $staff = User::where('email', 'nhanvien@thuvien.vn')->first();

        if (! $reader1 || ! $reader2 || ! $staff) {
            return;
        }

        // 1) Thanh toán đã hoàn tất cho giao dịch mượn sách có phí (Clean Code) đã seed sẵn ở giai đoạn 1
        $cleanCodeBorrow = BorrowRecord::whereHas('book', fn ($q) => $q->where('title', 'Clean Code'))
            ->where('user_id', $reader1->id)
            ->first();

        if ($cleanCodeBorrow && $cleanCodeBorrow->payments()->doesntExist()) {
            Payment::create([
                'borrow_record_id' => $cleanCodeBorrow->id,
                'user_id' => $reader1->id,
                'amount' => $cleanCodeBorrow->book->borrow_fee,
                'payment_status' => Payment::STATUS_PAID,
                'paid_at' => $cleanCodeBorrow->created_at,
            ]);
        }

        // 2) Yêu cầu mượn sách có phí đang chờ thanh toán (minh hoạ luồng UC09/UC21)
        $feeBook = Book::where('title', 'Đắc Nhân Tâm Trong Kinh Doanh')->first();
        if ($feeBook && ! BorrowRecord::where('user_id', $reader2->id)->where('book_id', $feeBook->id)->exists()) {
            $record = BorrowRecord::create([
                'user_id' => $reader2->id,
                'book_id' => $feeBook->id,
                'borrow_date' => now()->toDateString(),
                'due_date' => now()->addDays(BorrowRecord::DEFAULT_BORROW_DAYS)->toDateString(),
                'status' => BorrowRecord::STATUS_PENDING,
            ]);

            Payment::create([
                'borrow_record_id' => $record->id,
                'user_id' => $reader2->id,
                'amount' => $feeBook->borrow_fee,
                'payment_status' => Payment::STATUS_PENDING,
            ]);
        }

        // 3) Sách hết hàng + độc giả đặt trước (minh hoạ chức năng Đặt trước sách)
        $popularBook = Book::where('title', 'Cha Giàu Cha Nghèo')->first();
        if ($popularBook) {
            $popularBook->update(['available_quantity' => 0]);

            if (! Reservation::where('user_id', $reader1->id)->where('book_id', $popularBook->id)->exists()) {
                Reservation::create([
                    'user_id' => $reader1->id,
                    'book_id' => $popularBook->id,
                    'status' => Reservation::STATUS_WAITING,
                ]);
            }
        }

        // 4) Ghim 3 sách làm "sách nổi bật" thủ công (UC32)
        Book::whereIn('title', ['Nhà Giả Kim', 'Sapiens: Lược Sử Loài Người', 'Clean Code'])
            ->update(['is_featured' => true]);
    }
}
