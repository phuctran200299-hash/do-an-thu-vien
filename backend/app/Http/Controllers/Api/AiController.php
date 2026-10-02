<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiRecommendationLog;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * UC05/UC15/UC33 - Chức năng "AI" tìm kiếm và đề xuất sách.
 *
 * Theo đúng phạm vi đề cương ("AI chỉ hỗ trợ tìm kiếm/đề xuất, không tích hợp công cụ phân tích nâng cao"),
 * đây là một bộ máy gợi ý rule-based: đối chiếu từ khoá với tên sách/mô tả/thể loại/tác giả, kết hợp xếp hạng
 * theo thể loại độc giả quan tâm và đánh giá trung bình của sách - không gọi API mô hình ngôn ngữ bên ngoài.
 */
class AiController extends Controller
{
    /**
     * UC05/UC15 - Tìm kiếm sách bằng câu hỏi ngôn ngữ tự nhiên.
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Vui lòng nhập nội dung cần tìm.', 'errors' => $validator->errors()], 422);
        }

        $query = $request->string('query')->toString();
        $keywords = $this->extractKeywords($query);

        if (empty($keywords)) {
            return response()->json(['results' => [], 'message' => 'Không nhận diện được từ khoá phù hợp trong câu hỏi.']);
        }

        $books = Book::with(['category', 'authors'])->get();

        $scored = $books->map(function (Book $book) use ($keywords) {
            [$score, $matchedOn] = $this->scoreBookAgainstKeywords($book, $keywords);

            return ['book' => $book, 'score' => $score, 'matched_on' => $matchedOn];
        })->filter(fn ($item) => $item['score'] > 0)
            ->sortByDesc('score')
            ->take(10)
            ->values();

        $results = $scored->map(function ($item) {
            $book = $item['book'];
            $reason = $this->buildReason($item['matched_on'], $book);

            AiRecommendationLog::create([
                'user_id' => auth('sanctum')->id(),
                'book_id' => $book->id,
                'source' => AiRecommendationLog::SOURCE_SEARCH,
                'query' => request('query'),
                'reason' => $reason,
            ]);

            return [
                'book' => $book,
                'reason' => $reason,
            ];
        });

        return response()->json(['results' => $results]);
    }

    /**
     * UC15 - Đề xuất sách cá nhân hoá dựa trên thể loại độc giả đã mượn/yêu thích nhiều nhất.
     */
    public function recommendations(Request $request)
    {
        $user = $request->user();

        $borrowedCategoryIds = BorrowRecord::where('user_id', $user->id)
            ->where('status', '!=', BorrowRecord::STATUS_CANCELLED)
            ->with('book:id,category_id')
            ->get()
            ->pluck('book.category_id');

        $favoriteCategoryIds = Favorite::where('user_id', $user->id)
            ->with('book:id,category_id')
            ->get()
            ->pluck('book.category_id');

        $preferredCategoryIds = $borrowedCategoryIds->merge($favoriteCategoryIds)->filter()->countBy()->sortDesc();

        $alreadyInteractedBookIds = BorrowRecord::where('user_id', $user->id)->pluck('book_id')
            ->merge(Favorite::where('user_id', $user->id)->pluck('book_id'));

        $query = Book::with(['category', 'authors'])
            ->whereNotIn('id', $alreadyInteractedBookIds);

        if ($preferredCategoryIds->isNotEmpty()) {
            $topCategoryIds = $preferredCategoryIds->keys()->take(3)->all();
            $query->whereIn('category_id', $topCategoryIds);
            $reasonTemplate = 'Cùng thể loại với những sách bạn đã mượn/yêu thích';
        } else {
            $reasonTemplate = 'Sách được đánh giá cao, phù hợp để bắt đầu khám phá';
        }

        $books = $query->orderByDesc('avg_rating')->limit(8)->get();

        // nếu không đủ 8 cuốn theo thể loại yêu thích, bổ sung thêm sách đánh giá cao khác
        if ($books->count() < 8) {
            $extra = Book::with(['category', 'authors'])
                ->whereNotIn('id', $alreadyInteractedBookIds->merge($books->pluck('id')))
                ->orderByDesc('avg_rating')
                ->limit(8 - $books->count())
                ->get();
            $books = $books->concat($extra);
        }

        $results = $books->map(function (Book $book) use ($reasonTemplate, $user) {
            AiRecommendationLog::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'source' => AiRecommendationLog::SOURCE_PERSONALIZED,
                'reason' => $reasonTemplate,
            ]);

            return ['book' => $book, 'reason' => $reasonTemplate];
        });

        return response()->json(['results' => $results]);
    }

    /**
     * UC15 - Tìm các sách có nội dung/thể loại tương tự một cuốn sách cụ thể.
     */
    public function similar(Book $book)
    {
        $book->load('authors');
        $authorIds = $book->authors->pluck('id');

        $similar = Book::with(['category', 'authors'])
            ->where('id', '!=', $book->id)
            ->where(function ($q) use ($book, $authorIds) {
                $q->where('category_id', $book->category_id)
                    ->orWhereHas('authors', fn ($a) => $a->whereIn('authors.id', $authorIds));
            })
            ->orderByDesc('avg_rating')
            ->limit(6)
            ->get();

        $results = $similar->map(function (Book $b) use ($book) {
            $reason = $b->category_id === $book->category_id
                ? "Cùng thể loại \"{$b->category?->name}\" với \"{$book->title}\""
                : 'Cùng tác giả với cuốn sách bạn đang xem';

            AiRecommendationLog::create([
                'user_id' => auth('sanctum')->id(),
                'book_id' => $b->id,
                'source' => AiRecommendationLog::SOURCE_SIMILAR,
                'reason' => $reason,
            ]);

            return ['book' => $b, 'reason' => $reason];
        });

        return response()->json(['results' => $results]);
    }

    /**
     * UC33 - Admin theo dõi thống kê hoạt động của chức năng AI: sách được đề xuất nhiều nhất, nguồn đề xuất.
     */
    public function adminLogs(Request $request)
    {
        $topBooks = AiRecommendationLog::selectRaw('book_id, COUNT(*) as total')
            ->with('book:id,title')
            ->groupBy('book_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $bySource = AiRecommendationLog::selectRaw('source, COUNT(*) as total')
            ->groupBy('source')
            ->get();

        $recentQueries = AiRecommendationLog::where('source', AiRecommendationLog::SOURCE_SEARCH)
            ->whereNotNull('query')
            ->latest()
            ->limit(15)
            ->pluck('query')
            ->unique()
            ->values();

        return response()->json([
            'top_recommended_books' => $topBooks,
            'by_source' => $bySource,
            'recent_queries' => $recentQueries,
            'total_logs' => AiRecommendationLog::count(),
        ]);
    }

    private function extractKeywords(string $query): array
    {
        $stopWords = ['toi', 'muon', 'tim', 'sach', 've', 'la', 've', 'cho', 'nguoi', 'cac', 'mot', 'cuon', 'co', 'the', 'va', 'nhung'];

        $normalized = $this->stripAccents(mb_strtolower($query));
        $words = preg_split('/[^a-z0-9]+/', $normalized, -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_diff($words, $stopWords));
    }

    private function scoreBookAgainstKeywords(Book $book, array $keywords): array
    {
        $score = 0;
        $matchedOn = [];

        $title = $this->stripAccents(mb_strtolower($book->title));
        $description = $this->stripAccents(mb_strtolower((string) $book->description));
        $categoryName = $this->stripAccents(mb_strtolower((string) $book->category?->name));
        $authorNames = $this->stripAccents(mb_strtolower($book->authors->pluck('name')->implode(' ')));

        foreach ($keywords as $word) {
            if (str_contains($title, $word)) {
                $score += 3;
                $matchedOn['title'] = true;
            }
            if (str_contains($categoryName, $word)) {
                $score += 2;
                $matchedOn['category'] = true;
            }
            if (str_contains($authorNames, $word)) {
                $score += 2;
                $matchedOn['author'] = true;
            }
            if (str_contains($description, $word)) {
                $score += 1;
                $matchedOn['description'] = true;
            }
        }

        // ưu tiên nhẹ sách được đánh giá cao khi điểm khớp từ khoá bằng nhau
        $score += (float) $book->avg_rating * 0.1;

        return [$score, $matchedOn];
    }

    private function buildReason(array $matchedOn, Book $book): string
    {
        if (! empty($matchedOn['title'])) {
            return "Tên sách khớp với nội dung bạn tìm kiếm";
        }
        if (! empty($matchedOn['category'])) {
            return "Thuộc thể loại \"{$book->category?->name}\" phù hợp với nhu cầu của bạn";
        }
        if (! empty($matchedOn['author'])) {
            return 'Tác giả phù hợp với nội dung bạn tìm kiếm';
        }

        return 'Mô tả sách có nội dung liên quan đến từ khoá bạn tìm kiếm';
    }

    /**
     * Chuyển tiếng Việt có dấu về không dấu bằng bảng ánh xạ ký tự tường minh.
     * Không dùng iconv('...//TRANSLIT') vì hành vi transliteration cho tiếng Việt
     * không ổn định/thiếu chính xác giữa các hệ điều hành (đặc biệt trên Windows).
     */
    private function stripAccents(string $text): string
    {
        static $map = [
            'à' => 'a', 'á' => 'a', 'ả' => 'a', 'ã' => 'a', 'ạ' => 'a',
            'ă' => 'a', 'ằ' => 'a', 'ắ' => 'a', 'ẳ' => 'a', 'ẵ' => 'a', 'ặ' => 'a',
            'â' => 'a', 'ầ' => 'a', 'ấ' => 'a', 'ẩ' => 'a', 'ẫ' => 'a', 'ậ' => 'a',
            'đ' => 'd',
            'è' => 'e', 'é' => 'e', 'ẻ' => 'e', 'ẽ' => 'e', 'ẹ' => 'e',
            'ê' => 'e', 'ề' => 'e', 'ế' => 'e', 'ể' => 'e', 'ễ' => 'e', 'ệ' => 'e',
            'ì' => 'i', 'í' => 'i', 'ỉ' => 'i', 'ĩ' => 'i', 'ị' => 'i',
            'ò' => 'o', 'ó' => 'o', 'ỏ' => 'o', 'õ' => 'o', 'ọ' => 'o',
            'ô' => 'o', 'ồ' => 'o', 'ố' => 'o', 'ổ' => 'o', 'ỗ' => 'o', 'ộ' => 'o',
            'ơ' => 'o', 'ờ' => 'o', 'ớ' => 'o', 'ở' => 'o', 'ỡ' => 'o', 'ợ' => 'o',
            'ù' => 'u', 'ú' => 'u', 'ủ' => 'u', 'ũ' => 'u', 'ụ' => 'u',
            'ư' => 'u', 'ừ' => 'u', 'ứ' => 'u', 'ử' => 'u', 'ữ' => 'u', 'ự' => 'u',
            'ỳ' => 'y', 'ý' => 'y', 'ỷ' => 'y', 'ỹ' => 'y', 'ỵ' => 'y',
        ];

        return strtr(mb_strtolower($text), $map);
    }
}
