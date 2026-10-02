<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Độc giả đặt trước một cuốn sách hiện đã hết (available_quantity = 0).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'book_id' => ['required', 'exists:books,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $book = Book::findOrFail($request->book_id);

        if ($book->effectiveAvailableQuantity() > 0) {
            return response()->json(['message' => 'Sách hiện vẫn còn, bạn có thể đăng ký mượn ngay mà không cần đặt trước.'], 422);
        }

        $existing = Reservation::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', [Reservation::STATUS_WAITING, Reservation::STATUS_READY])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Bạn đã đặt trước cuốn sách này rồi.'], 422);
        }

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'status' => Reservation::STATUS_WAITING,
        ]);

        $queuePosition = Reservation::where('book_id', $book->id)
            ->where('status', Reservation::STATUS_WAITING)
            ->where('created_at', '<=', $reservation->created_at)
            ->count();

        return response()->json([
            'message' => "Đặt trước thành công. Bạn đang xếp hàng ở vị trí thứ {$queuePosition}.",
            'reservation' => $reservation->load('book'),
        ], 201);
    }

    /**
     * Độc giả xem danh sách sách đã đặt trước của mình.
     */
    public function myReservations(Request $request)
    {
        $reservations = Reservation::where('user_id', $request->user()->id)
            ->with('book')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['reservations' => $reservations]);
    }

    /**
     * Độc giả huỷ đặt trước.
     */
    public function cancel(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bạn không có quyền huỷ đặt trước này.'], 403);
        }

        if ($reservation->status !== Reservation::STATUS_WAITING) {
            return response()->json(['message' => 'Chỉ có thể huỷ lượt đặt trước khi đang ở trạng thái Đang chờ.'], 422);
        }

        $reservation->update(['status' => Reservation::STATUS_CANCELLED]);

        return response()->json(['message' => 'Đã huỷ đặt trước.']);
    }

    /**
     * Nhân viên/Admin xem danh sách đặt trước theo sách để biết ai đang chờ.
     */
    public function index(Request $request)
    {
        $query = Reservation::with(['user', 'book']);

        if ($request->filled('book_id')) {
            $query->where('book_id', $request->integer('book_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderBy('created_at')->paginate(15));
    }
}
