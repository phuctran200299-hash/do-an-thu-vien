<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BorrowRecord extends Model
{
    use HasFactory;

    // Các trạng thái hợp lệ của một giao dịch mượn sách (theo sơ đồ trạng thái trong tài liệu thiết kế)
    public const STATUS_PENDING = 'cho_xac_nhan';   // Chờ xác nhận
    public const STATUS_BORROWED = 'dang_muon';     // Đang mượn
    public const STATUS_RETURNED = 'da_tra';        // Đã trả
    public const STATUS_OVERDUE = 'qua_han';         // Quá hạn
    public const STATUS_CANCELLED = 'da_huy';        // Đã huỷ

    public const DEFAULT_BORROW_DAYS = 14;
    public const RENEWAL_EXTRA_DAYS = 7;
    public const MAX_RENEWALS = 1;

    protected $fillable = [
        'user_id',
        'book_id',
        'confirmed_by',
        'borrow_date',
        'due_date',
        'return_date',
        'status',
        'renewed_count',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function fines(): HasMany
    {
        return $this->hasMany(Fine::class);
    }

    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_BORROWED
            && $this->due_date !== null
            && $this->due_date->isPast();
    }

    /**
     * Chuyển các bản ghi "Đang mượn" đã quá hạn trả sang trạng thái "Quá hạn".
     * Dùng chung ở mọi nơi đọc/ghi liên quan đến giao dịch mượn để dữ liệu luôn phản ánh đúng thực tế,
     * bổ sung cho lệnh Artisan borrow:mark-overdue chạy định kỳ qua Scheduler.
     */
    public static function syncOverdueStatuses(): void
    {
        static::where('status', self::STATUS_BORROWED)
            ->whereDate('due_date', '<', now()->toDateString())
            ->update(['status' => self::STATUS_OVERDUE]);
    }
}
