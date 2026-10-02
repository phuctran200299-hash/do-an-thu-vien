<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiRecommendationLog extends Model
{
    use HasFactory;

    public const SOURCE_SEARCH = 'search';
    public const SOURCE_PERSONALIZED = 'personalized';
    public const SOURCE_SIMILAR = 'similar';

    protected $fillable = ['user_id', 'book_id', 'source', 'query', 'reason'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
