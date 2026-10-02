<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    /**
     * UC02 - Tìm kiếm / lọc sách (công khai).
     * Tham số hỗ trợ: q (từ khoá), category_id, author_id, status, per_page
     */
    public function index(Request $request)
    {
        $query = Book::query()->with(['category', 'authors']);

        if ($request->filled('q')) {
            $keyword = $request->string('q');
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                    ->orWhereHas('authors', fn ($a) => $a->where('name', 'like', "%{$keyword}%"));
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('author_id')) {
            $query->whereHas('authors', fn ($a) => $a->where('authors.id', $request->integer('author_id')));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $sort = $request->string('sort', 'created_at');
        $direction = $request->string('direction', 'desc');
        if (in_array($sort, ['title', 'created_at', 'avg_rating', 'borrow_fee'], true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->input('per_page', 12), 50);

        return response()->json($query->paginate($perPage));
    }

    /**
     * UC04 - Xem sách nổi bật: sách mới, sách được mượn nhiều, sách đánh giá cao.
     */
    public function featured()
    {
        $newest = Book::with(['category', 'authors'])->orderByDesc('created_at')->limit(8)->get();

        $mostBorrowed = Book::withCount('borrowRecords')
            ->with(['category', 'authors'])
            ->orderByDesc('borrow_records_count')
            ->limit(8)
            ->get();

        $topRated = Book::with(['category', 'authors'])
            ->orderByDesc('avg_rating')
            ->limit(8)
            ->get();

        // UC32 - sách do Admin chủ động ghim làm nổi bật trên trang chủ
        $adminFeatured = Book::with(['category', 'authors'])
            ->where('is_featured', true)
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get();

        return response()->json([
            'admin_featured' => $adminFeatured,
            'newest' => $newest,
            'most_borrowed' => $mostBorrowed,
            'top_rated' => $topRated,
        ]);
    }

    /**
     * UC03 - Xem chi tiết sách.
     */
    public function show(Book $book)
    {
        $book->load(['category', 'authors', 'reviews.user']);

        return response()->json(['book' => $book]);
    }

    /**
     * UC25 - Admin thêm sách mới.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'cover_image' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quantity' => ['required', 'integer', 'min:0'],
            'borrow_fee' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:available,unavailable,damaged'],
            'author_ids' => ['nullable', 'array'],
            'author_ids.*' => ['exists:authors,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['available_quantity'] = $data['quantity'];

        $book = DB::transaction(function () use ($data) {
            $book = Book::create($data);
            if (! empty($data['author_ids'])) {
                $book->authors()->sync($data['author_ids']);
            }

            return $book;
        });

        return response()->json(['message' => 'Thêm sách thành công.', 'book' => $book->load(['category', 'authors'])], 201);
    }

    /**
     * UC25 - Admin cập nhật thông tin sách.
     */
    public function update(Request $request, Book $book)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'cover_image' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'borrow_fee' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:available,unavailable,damaged'],
            'author_ids' => ['nullable', 'array'],
            'author_ids.*' => ['exists:authors,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        DB::transaction(function () use ($data, $book) {
            // nếu tăng/giảm tổng số lượng, điều chỉnh available_quantity theo cùng độ chênh lệch
            if (array_key_exists('quantity', $data)) {
                $diff = $data['quantity'] - $book->quantity;
                $data['available_quantity'] = max(0, $book->available_quantity + $diff);
            }

            $authorIds = $data['author_ids'] ?? null;
            unset($data['author_ids']);

            $book->update($data);

            if ($authorIds !== null) {
                $book->authors()->sync($authorIds);
            }
        });

        return response()->json(['message' => 'Cập nhật sách thành công.', 'book' => $book->fresh(['category', 'authors'])]);
    }

    /**
     * UC32 - Admin ghim/bỏ ghim sách làm "sách nổi bật" hiển thị thủ công trên trang chủ.
     */
    public function toggleFeatured(Book $book)
    {
        $book->update(['is_featured' => ! $book->is_featured]);

        return response()->json([
            'message' => $book->is_featured ? 'Đã ghim sách vào mục nổi bật.' : 'Đã bỏ ghim sách khỏi mục nổi bật.',
            'book' => $book,
        ]);
    }

    /**
     * UC20 - Nhân viên cập nhật tình trạng sách (còn/hư hỏng/ngừng cung cấp) - không được sửa các
     * thông tin khác của sách (chỉ Admin mới có toàn quyền CRUD qua update() ở trên).
     */
    public function updateStatus(Request $request, Book $book)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:available,unavailable,damaged'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $book->update(['status' => $request->status]);

        return response()->json(['message' => 'Cập nhật tình trạng sách thành công.', 'book' => $book->fresh()]);
    }

    /**
     * UC25 - Admin xoá sách (chỉ cho phép khi không còn giao dịch mượn đang xử lý).
     */
    public function destroy(Book $book)
    {
        $hasActiveBorrow = $book->borrowRecords()
            ->whereIn('status', ['cho_xac_nhan', 'dang_muon', 'qua_han'])
            ->exists();

        if ($hasActiveBorrow) {
            return response()->json([
                'message' => 'Không thể xoá sách đang có giao dịch mượn chưa hoàn tất. Hãy chuyển trạng thái sách sang "unavailable" thay vì xoá.',
            ], 422);
        }

        $book->delete();

        return response()->json(['message' => 'Xoá sách thành công.']);
    }
}
