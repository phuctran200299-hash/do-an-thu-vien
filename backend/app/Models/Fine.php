<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fine extends Model
{
    use HasFactory;

    public const STATUS_UNPAID = 'unpaid';
    public const STATUS_PAID = 'paid';

    // mức phạt mỗi ngày quá hạn (đơn vị: đồng) - hằng số đơn giản cho phạm vi đồ án
    public const FINE_PER_DAY = 3000;

    protected $fillable = ['borrow_record_id', 'amount', 'reason', 'status'];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function borrowRecord(): BelongsTo
    {
        return $this->belongsTo(BorrowRecord::class);
    }
}
