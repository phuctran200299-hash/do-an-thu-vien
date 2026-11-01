<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Category;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;

class HomeController extends Controller
{
    /**
     * Dữ liệu tổng quan công khai cho trang chủ: số liệu thư viện, thể loại,
     * tác giả tiêu biểu, nhận xét mới và các lượt mượn gần đây.
     */
    public function overview()
    {
        $activeStatuses = [BorrowRecord::STATUS_BORROWED, BorrowRecord::STATUS_OVERDUE, BorrowRecord::STATUS_RETURNED];

        $stats = [
            'books' => Book::count(),
            'copies' => (int) Book::sum('quantity'),
            'authors' => Author::count(),
            'readers' => User::whereHas('role', fn ($q) => $q->where('name', Role::READER))->count(),
            'borrows' => BorrowRecord::whereIn('status', $activeStatuses)->count(),
            'reviews' => Review::count(),
            'avg_rating' => round((float) Review::avg('rating'), 1),
        ];

        $categories = Category::withCount('books')
            ->orderByDesc('books_count')
            ->get()
            ->map(function (Category $category) {
                $category->covers = $category->books()
                    ->whereNotNull('cover_image')
                    ->orderByDesc('avg_rating')
                    ->limit(3)
                    ->get(['id', 'cover_image'])
                    ->pluck('cover_image');

                return $category;
            });

        $authors = Author::withCount('books')
            ->with(['books' => fn ($q) => $q->select('books.id', 'title', 'cover_image', 'avg_rating')->orderByDesc('avg_rating')])
            ->orderByDesc('books_count')
            ->limit(8)
            ->get()
            ->map(fn (Author $author) => [
                'id' => $author->id,
                'name' => $author->name,
                'biography' => Str::limit((string) $author->biography, 110),
                'books_count' => $author->books_count,
                'top_book' => $author->books->first()?->only(['id', 'title', 'cover_image']),
            ]);

        $reviews = Review::with(['user:id,name', 'book:id,title,cover_image'])
            ->where('rating', '>=', 4)
            ->whereNotNull('comment')
            ->whereRaw('CHAR_LENGTH(comment) >= 30')
            ->latest()
            ->limit(40)
            ->get()
            ->unique('comment')
            ->take(6)
            ->values();

        $recentBorrows = BorrowRecord::with(['user:id,name', 'book:id,title,cover_image'])
            ->whereIn('status', $activeStatuses)
            ->latest('borrow_date')
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (BorrowRecord $r) => [
                'id' => $r->id,
                'reader' => $this->maskName($r->user?->name),
                'book' => $r->book,
                'borrow_date' => $r->borrow_date,
            ]);

        return response()->json([
            'stats' => $stats,
            'categories' => $categories,
            'authors' => $authors,
            'reviews' => $reviews->map(fn (Review $r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
                'reader' => $this->maskName($r->user?->name),
                'book' => $r->book,
            ]),
            'recent_borrows' => $recentBorrows,
        ]);
    }

    /** Ẩn bớt họ tên độc giả trên trang công khai: "Nguyễn Thị Lan" -> "Nguyễn T. Lan". */
    private function maskName(?string $name): string
    {
        $parts = preg_split('/\s+/u', trim((string) $name)) ?: [];
        if (count($parts) <= 2) {
            return $parts[0] ?? 'Độc giả';
        }
        $middle = array_map(fn ($p) => mb_substr($p, 0, 1).'.', array_slice($parts, 1, -1));

        return implode(' ', [$parts[0], ...$middle, end($parts)]);
    }
}
