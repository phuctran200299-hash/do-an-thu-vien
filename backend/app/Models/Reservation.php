<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;

    public const STATUS_WAITING = 'cho_sach';
    public const STATUS_READY = 'san_sang';
    public const STATUS_DONE = 'hoan_tat';
    public const STATUS_CANCELLED = 'da_huy';

    protected $fillable = ['user_id', 'book_id', 'status'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
