<?php

namespace App\Console\Commands;

use App\Models\BorrowRecord;
use Illuminate\Console\Command;

class MarkOverdueBorrows extends Command
{
    protected $signature = 'borrow:mark-overdue';

    protected $description = 'Chuyển các giao dịch "Đang mượn" đã quá hạn trả sang trạng thái "Quá hạn"';

    public function handle(): int
    {
        $count = BorrowRecord::where('status', BorrowRecord::STATUS_BORROWED)
            ->whereDate('due_date', '<', now()->toDateString())
            ->update(['status' => BorrowRecord::STATUS_OVERDUE]);

        $this->info("Đã cập nhật {$count} giao dịch sang trạng thái Quá hạn.");

        return self::SUCCESS;
    }
}
