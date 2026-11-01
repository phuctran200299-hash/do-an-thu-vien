<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Payment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Bổ sung lịch sử mượn - trả (đã hoàn tất), đánh giá và yêu thích cho các đầu sách chưa từng có giao dịch,
 * ví dụ sách vừa được thêm vào kho sau khi dữ liệu demo đã được tạo. Chỉ tác động tới sách chưa có lượt mượn
 * nào nên chạy lại nhiều lần không nhân đôi dữ liệu.
 */
class BackfillActivitySeeder extends Seeder
{
    private array $comments = [
        5 => ['Tuyệt vời, đọc một mạch không dứt ra được!', 'Một trong những cuốn hay nhất mình từng đọc.', 'Rất đáng đọc, mình sẽ giới thiệu cho bạn bè.', 'Nội dung sâu sắc, đọc xong thấm rất lâu.'],
        4 => ['Sách hay, nội dung bổ ích.', 'Khá cuốn, chỉ có vài đoạn hơi dài.', 'Đáng thời gian bỏ ra, bản sách của thư viện còn rất mới.', 'Hay, phù hợp đọc cuối tuần.'],
        3 => ['Ổn, nhưng không quá ấn tượng.', 'Nội dung được, cách viết hơi khô.'],
    ];

    public function run(): void
    {
        mt_srand(2027);

        $books = Book::doesntHave('borrowRecords')->where('status', Book::STATUS_AVAILABLE)->get();
        $readers = User::whereHas('role', fn ($q) => $q->where('name', Role::READER))->where('is_active', true)->pluck('id')->all();
        $staffId = User::whereHas('role', fn ($q) => $q->where('name', Role::STAFF))->value('id');

        if ($books->isEmpty() || count($readers) < 5) {
            return;
        }

        DB::transaction(function () use ($books, $readers, $staffId) {
            foreach ($books as $book) {
                $borrowers = (array) array_rand(array_flip($readers), mt_rand(3, 8));

                foreach ($borrowers as $userId) {
                    $borrowDate = now()->subDays(mt_rand(20, 120))->startOfDay();
                    $returnDate = $borrowDate->copy()->addDays(mt_rand(4, BorrowRecord::DEFAULT_BORROW_DAYS));
                    $created = $borrowDate->copy()->setTime(mt_rand(8, 20), mt_rand(0, 59));

                    $recordId = DB::table('borrow_records')->insertGetId([
                        'user_id' => $userId,
                        'book_id' => $book->id,
                        'confirmed_by' => $staffId,
                        'borrow_date' => $borrowDate->toDateString(),
                        'due_date' => $borrowDate->copy()->addDays(BorrowRecord::DEFAULT_BORROW_DAYS)->toDateString(),
                        'return_date' => $returnDate->toDateString(),
                        'status' => BorrowRecord::STATUS_RETURNED,
                        'renewed_count' => 0,
                        'created_at' => $created,
                        'updated_at' => $returnDate->copy()->setTime(10, 0),
                    ]);

                    if ((float) $book->borrow_fee > 0) {
                        DB::table('payments')->insert([
                            'borrow_record_id' => $recordId,
                            'user_id' => $userId,
                            'amount' => $book->borrow_fee,
                            'payment_status' => Payment::STATUS_PAID,
                            'paid_at' => $created->copy()->addMinutes(mt_rand(2, 60)),
                            'created_at' => $created,
                            'updated_at' => $created,
                        ]);
                    }

                    if (mt_rand(1, 100) <= 65) {
                        $r = mt_rand(1, 100);
                        $rating = $r <= 50 ? 5 : ($r <= 85 ? 4 : 3);
                        $when = $returnDate->copy()->addDays(mt_rand(0, 3))->setTime(mt_rand(8, 22), mt_rand(0, 59))->min(now());
                        DB::table('reviews')->insertOrIgnore([
                            'user_id' => $userId,
                            'book_id' => $book->id,
                            'rating' => $rating,
                            'comment' => $this->comments[$rating][array_rand($this->comments[$rating])],
                            'created_at' => $when,
                            'updated_at' => $when,
                        ]);
                    }

                    if (mt_rand(1, 100) <= 30) {
                        DB::table('favorites')->insertOrIgnore([
                            'user_id' => $userId, 'book_id' => $book->id, 'created_at' => $created, 'updated_at' => $created,
                        ]);
                    }
                }

                $book->refreshAvgRating();
            }
        });

        $this->command?->info("BackfillActivitySeeder: đã bổ sung hoạt động cho {$books->count()} đầu sách.");
    }
}
