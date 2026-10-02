<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_UNAVAILABLE = 'unavailable';
    public const STATUS_DAMAGED = 'damaged';

    protected $fillable = [
        'category_id',
        'title',
        'cover_image',
        'description',
        'quantity',
        'available_quantity',
        'borrow_fee',
        'status',
        'avg_rating',
        'is_featured',
    ];

    protected $casts = [
        'borrow_fee' => 'decimal:2',
        'avg_rating' => 'decimal:2',
        'is_featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class, 'book_author');
    }

    public function borrowRecords(): HasMany
    {
        return $this->hasMany(BorrowRecord::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function refreshAvgRating(): void
    {
        $this->avg_rating = $this->reviews()->avg('rating') ?? 0;
        $this->save();
    }

    /**
     * Số lượng sách thực sự "tự do" để một độc giả bất kỳ đăng ký mượn ngay, sau khi trừ đi
     * các bản đang được "giữ chỗ" cho những độc giả đã đặt trước và đang ở trạng thái "Sẵn sàng".
     * Dùng để tránh việc một độc giả không đặt trước "cướp" mất bản sách đang giữ cho người xếp hàng.
     */
    public function effectiveAvailableQuantity(): int
    {
        $readyReservations = $this->reservations()->where('status', Reservation::STATUS_READY)->count();

        return $this->available_quantity - $readyReservations;
    }
}
