<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /** UC14 - Xem đánh giá/nhận xét của một cuốn sách (công khai). */
    public function index(Book $book)
    {
        return response()->json([
            'reviews' => $book->reviews()->with('user:id,name')->orderByDesc('created_at')->get(),
        ]);
    }

    /** UC14 - Độc giả gửi đánh giá và nhận xét sách đã từng mượn. */
    public function store(Request $request, Book $book)
    {
        $validator = Validator::make($request->all(), [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        $hasBorrowed = BorrowRecord::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', [BorrowRecord::STATUS_BORROWED, BorrowRecord::STATUS_OVERDUE, BorrowRecord::STATUS_RETURNED])
            ->exists();

        if (! $hasBorrowed) {
            return response()->json(['message' => 'Bạn cần mượn sách này trước khi có thể đánh giá.'], 422);
        }

        $review = Review::updateOrCreate(
            ['user_id' => $user->id, 'book_id' => $book->id],
            $validator->validated()
        );

        $book->refreshAvgRating();

        return response()->json(['message' => 'Cảm ơn bạn đã đánh giá sách.', 'review' => $review->load('user:id,name')], 201);
    }

    /** Độc giả xoá đánh giá của chính mình. */
    public function destroy(Request $request, Book $book)
    {
        Review::where('user_id', $request->user()->id)->where('book_id', $book->id)->delete();
        $book->refreshAvgRating();

        return response()->json(['message' => 'Đã xoá đánh giá.']);
    }

    /** UC31 - Admin xem toàn bộ đánh giá trong hệ thống để kiểm duyệt. */
    public function adminIndex(Request $request)
    {
        $query = Review::with(['user:id,name,email', 'book:id,title']);

        if ($request->filled('book_id')) {
            $query->where('book_id', $request->integer('book_id'));
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->integer('rating'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(15));
    }

    /** UC31 - Admin xoá đánh giá không phù hợp (spam, vi phạm nội dung...). */
    public function adminDestroy(Review $review)
    {
        $book = $review->book;
        $review->delete();
        $book?->refreshAvgRating();

        return response()->json(['message' => 'Đã xoá đánh giá không phù hợp.']);
    }
}
