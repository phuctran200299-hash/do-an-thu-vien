<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Fine;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BorrowController extends Controller
{
    private const MAX_ACTIVE_BORROWS = 5;

    /**
     * UC08 - Độc giả gửi yêu cầu mượn sách.
     * UC09 - Nếu sách có phí, tự tạo một bản ghi thanh toán ở trạng thái "pending" kèm theo.
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
        BorrowRecord::syncOverdueStatuses();

        $hasOverdue = BorrowRecord::where('user_id', $user->id)
            ->where('status', BorrowRecord::STATUS_OVERDUE)
            ->exists();

        if ($hasOverdue) {
            return response()->json(['message' => 'Bạn đang có sách quá hạn chưa trả. Vui lòng trả sách trước khi mượn thêm.'], 422);
        }

        $activeCount = BorrowRecord::where('user_id', $user->id)
            ->whereIn('status', [BorrowRecord::STATUS_PENDING, BorrowRecord::STATUS_BORROWED])
            ->count();

        if ($activeCount >= self::MAX_ACTIVE_BORROWS) {
            return response()->json(['message' => 'Bạn đã đạt giới hạn số sách được mượn/đang chờ xử lý cùng lúc.'], 422);
        }

        $book = Book::findOrFail($request->book_id);

        if ($book->available_quantity < 1 || $book->status !== Book::STATUS_AVAILABLE) {
            return response()->json(['message' => 'Sách hiện đã hết, vui lòng chọn sách khác hoặc đặt trước.'], 400);
        }

        $hasReadyReservation = Reservation::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', Reservation::STATUS_READY)
            ->exists();

        // Nếu còn bản sách đang được "giữ chỗ" cho (những) độc giả khác đã đặt trước và đến lượt,
        // không cho độc giả chưa đặt trước "cướp" mất suất đó.
        if (! $hasReadyReservation && $book->effectiveAvailableQuantity() < 1) {
            return response()->json([
                'message' => 'Sách hiện đang được giữ cho độc giả đã đặt trước. Vui lòng đặt trước để xếp hàng.',
            ], 400);
        }

        $alreadyRequested = BorrowRecord::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', [BorrowRecord::STATUS_PENDING, BorrowRecord::STATUS_BORROWED])
            ->exists();

        if ($alreadyRequested) {
            return response()->json(['message' => 'Bạn đã có một yêu cầu mượn cuốn sách này đang được xử lý.'], 422);
        }

        $record = DB::transaction(function () use ($user, $book) {
            $record = BorrowRecord::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'borrow_date' => now()->toDateString(),
                'due_date' => now()->addDays(BorrowRecord::DEFAULT_BORROW_DAYS)->toDateString(),
                'status' => BorrowRecord::STATUS_PENDING,
            ]);

            if ($book->borrow_fee > 0) {
                Payment::create([
                    'borrow_record_id' => $record->id,
                    'user_id' => $user->id,
                    'amount' => $book->borrow_fee,
                    'payment_status' => Payment::STATUS_PENDING,
                ]);
            }

            // Nếu độc giả đã có lượt đặt trước "Sẵn sàng" cho sách này, coi như đã đến lượt mượn thành công
            Reservation::where('user_id', $user->id)
                ->where('book_id', $book->id)
                ->where('status', Reservation::STATUS_READY)
                ->update(['status' => Reservation::STATUS_DONE]);

            return $record;
        });

        $needsPayment = $book->borrow_fee > 0;

        return response()->json([
            'message' => $needsPayment
                ? 'Đã tạo yêu cầu mượn. Sách này có phí, vui lòng thanh toán để yêu cầu được xử lý.'
                : 'Gửi yêu cầu mượn sách thành công, vui lòng chờ nhân viên thư viện xác nhận.',
            'borrow_record' => $record->load(['book', 'payments']),
        ], 201);
    }

    /**
     * UC09 - Độc giả thanh toán phí mượn cho yêu cầu đang chờ (giả lập thanh toán nội bộ, không tích hợp cổng thanh toán thật).
     */
    public function pay(Request $request, BorrowRecord $borrowRecord)
    {
        if ($borrowRecord->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bạn không có quyền thanh toán cho yêu cầu này.'], 403);
        }

        if ($borrowRecord->status !== BorrowRecord::STATUS_PENDING) {
            return response()->json(['message' => 'Yêu cầu mượn này không còn ở trạng thái chờ xác nhận, không thể thanh toán.'], 422);
        }

        $payment = $borrowRecord->payments()->where('payment_status', Payment::STATUS_PENDING)->latest()->first();

        if (! $payment) {
            return response()->json(['message' => 'Không có khoản thanh toán nào đang chờ xử lý.'], 422);
        }

        $payment->update(['payment_status' => Payment::STATUS_PAID, 'paid_at' => now()]);

        return response()->json(['message' => 'Thanh toán thành công. Yêu cầu mượn sách sẽ được nhân viên xác nhận.', 'payment' => $payment]);
    }

    /**
     * UC10/UC11/UC12 - Độc giả xem sách đang mượn và lịch sử mượn - trả của chính mình.
     */
    public function myBorrows(Request $request)
    {
        BorrowRecord::syncOverdueStatuses();

        $query = BorrowRecord::where('user_id', $request->user()->id)->with(['book', 'payments', 'fines']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(10));
    }

    /**
     * UC17/UC28 - Nhân viên/Admin xem danh sách yêu cầu mượn theo bộ lọc.
     */
    public function index(Request $request)
    {
        BorrowRecord::syncOverdueStatuses();

        $query = BorrowRecord::with(['user', 'book', 'confirmedBy', 'payments', 'fines']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('book_id')) {
            $query->where('book_id', $request->integer('book_id'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(15));
    }

    /**
     * UC19/UC29 - Danh sách giao dịch quá hạn.
     */
    public function overdue(Request $request)
    {
        BorrowRecord::syncOverdueStatuses();

        $query = BorrowRecord::with(['user', 'book'])
            ->where('status', BorrowRecord::STATUS_OVERDUE);

        return response()->json(
            $query->orderBy('due_date')->paginate(15)
        );
    }

    /**
     * UC17 - Nhân viên/Admin xác nhận yêu cầu mượn: trừ số lượng sách, chuyển trạng thái Đang mượn.
     * Nếu sách có phí, yêu cầu phải được thanh toán trước khi xác nhận.
     */
    public function approve(Request $request, BorrowRecord $borrowRecord)
    {
        if ($borrowRecord->status !== BorrowRecord::STATUS_PENDING) {
            return response()->json(['message' => 'Yêu cầu này không ở trạng thái chờ xác nhận.'], 422);
        }

        $unpaidExists = $borrowRecord->payments()->where('payment_status', '!=', Payment::STATUS_PAID)->exists();
        if ($unpaidExists) {
            return response()->json(['message' => 'Độc giả chưa thanh toán phí mượn, chưa thể xác nhận.'], 422);
        }

        $result = DB::transaction(function () use ($borrowRecord, $request) {
            $book = Book::where('id', $borrowRecord->book_id)->lockForUpdate()->first();

            if ($book->available_quantity < 1) {
                return null;
            }

            $book->decrement('available_quantity');

            $borrowRecord->update([
                'status' => BorrowRecord::STATUS_BORROWED,
                'confirmed_by' => $request->user()->id,
                'borrow_date' => now()->toDateString(),
                'due_date' => now()->addDays(BorrowRecord::DEFAULT_BORROW_DAYS)->toDateString(),
            ]);

            return $borrowRecord;
        });

        if (! $result) {
            return response()->json(['message' => 'Sách hiện không còn đủ số lượng để xác nhận.'], 422);
        }

        return response()->json(['message' => 'Xác nhận yêu cầu mượn thành công.', 'borrow_record' => $result->load(['user', 'book'])]);
    }

    /**
     * UC17 - Nhân viên/Admin từ chối yêu cầu mượn.
     */
    public function reject(Request $request, BorrowRecord $borrowRecord)
    {
        if ($borrowRecord->status !== BorrowRecord::STATUS_PENDING) {
            return response()->json(['message' => 'Yêu cầu này không ở trạng thái chờ xác nhận.'], 422);
        }

        DB::transaction(function () use ($borrowRecord, $request) {
            $borrowRecord->update([
                'status' => BorrowRecord::STATUS_CANCELLED,
                'confirmed_by' => $request->user()->id,
            ]);

            // đóng mọi khoản thanh toán còn dang dở (đã trả hoặc đang chờ) của yêu cầu bị từ chối,
            // tránh để lại thanh toán "pending" mồ côi có thể bị thanh toán nhầm sau khi đã huỷ
            $borrowRecord->payments()->where('payment_status', '!=', Payment::STATUS_FAILED)
                ->update(['payment_status' => Payment::STATUS_FAILED]);
        });

        return response()->json(['message' => 'Đã từ chối yêu cầu mượn.', 'borrow_record' => $borrowRecord->load(['user', 'book'])]);
    }

    /**
     * Độc giả tự huỷ yêu cầu đang ở trạng thái chờ xác nhận.
     */
    public function cancel(Request $request, BorrowRecord $borrowRecord)
    {
        if ($borrowRecord->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bạn không có quyền huỷ yêu cầu này.'], 403);
        }

        if ($borrowRecord->status !== BorrowRecord::STATUS_PENDING) {
            return response()->json(['message' => 'Chỉ có thể huỷ yêu cầu đang ở trạng thái chờ xác nhận.'], 422);
        }

        DB::transaction(function () use ($borrowRecord) {
            $borrowRecord->update(['status' => BorrowRecord::STATUS_CANCELLED]);

            // đóng mọi khoản thanh toán còn dang dở, tránh mồ côi thanh toán "pending"/"paid"
            $borrowRecord->payments()->where('payment_status', '!=', Payment::STATUS_FAILED)
                ->update(['payment_status' => Payment::STATUS_FAILED]);
        });

        return response()->json(['message' => 'Đã huỷ yêu cầu mượn sách.']);
    }

    /**
     * (Mở rộng) - Độc giả tự gia hạn thêm hạn trả, giới hạn 1 lần/lượt mượn,
     * chỉ áp dụng khi sách chưa quá hạn và không có ai đang đặt trước sách này.
     */
    public function renew(Request $request, BorrowRecord $borrowRecord)
    {
        if ($borrowRecord->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bạn không có quyền gia hạn yêu cầu này.'], 403);
        }

        BorrowRecord::syncOverdueStatuses();
        $borrowRecord->refresh();

        if ($borrowRecord->status !== BorrowRecord::STATUS_BORROWED) {
            return response()->json(['message' => 'Chỉ có thể gia hạn khi sách đang trong trạng thái đang mượn (không áp dụng khi đã quá hạn).'], 422);
        }

        if ($borrowRecord->renewed_count >= BorrowRecord::MAX_RENEWALS) {
            return response()->json(['message' => 'Bạn đã sử dụng hết số lần gia hạn cho phép (tối đa '.BorrowRecord::MAX_RENEWALS.' lần).'], 422);
        }

        $hasWaitingReservation = Reservation::where('book_id', $borrowRecord->book_id)
            ->where('status', Reservation::STATUS_WAITING)
            ->exists();

        if ($hasWaitingReservation) {
            return response()->json(['message' => 'Không thể gia hạn vì đang có độc giả khác đặt trước cuốn sách này.'], 422);
        }

        $borrowRecord->update([
            'due_date' => $borrowRecord->due_date->addDays(BorrowRecord::RENEWAL_EXTRA_DAYS),
            'renewed_count' => $borrowRecord->renewed_count + 1,
        ]);

        return response()->json(['message' => 'Gia hạn thành công.', 'borrow_record' => $borrowRecord->fresh(['book'])]);
    }

    /**
     * UC18 - Nhân viên/Admin xác nhận trả sách: cộng lại số lượng, chuyển trạng thái Đã trả.
     * Nếu trả trễ hạn, tự động tính phí phạt theo số ngày quá hạn.
     * Nếu có độc giả khác đang đặt trước sách này, đánh dấu lượt đặt trước sớm nhất là "sẵn sàng".
     */
    public function returnBook(Request $request, BorrowRecord $borrowRecord)
    {
        BorrowRecord::syncOverdueStatuses();
        $borrowRecord->refresh();

        if (! in_array($borrowRecord->status, [BorrowRecord::STATUS_BORROWED, BorrowRecord::STATUS_OVERDUE], true)) {
            return response()->json(['message' => 'Giao dịch này không ở trạng thái đang mượn hoặc quá hạn.'], 422);
        }

        $fine = DB::transaction(function () use ($borrowRecord) {
            Book::where('id', $borrowRecord->book_id)->lockForUpdate()->increment('available_quantity');

            $wasOverdue = $borrowRecord->status === BorrowRecord::STATUS_OVERDUE;
            $today = now()->toDateString();

            $borrowRecord->update([
                'status' => BorrowRecord::STATUS_RETURNED,
                'return_date' => $today,
            ]);

            $fine = null;
            if ($wasOverdue) {
                $overdueDays = max(1, $borrowRecord->due_date->diffInDays(now()));
                $fine = Fine::create([
                    'borrow_record_id' => $borrowRecord->id,
                    'amount' => $overdueDays * Fine::FINE_PER_DAY,
                    'reason' => "Trả sách trễ hạn {$overdueDays} ngày",
                    'status' => Fine::STATUS_UNPAID,
                ]);
            }

            $nextReservation = Reservation::where('book_id', $borrowRecord->book_id)
                ->where('status', Reservation::STATUS_WAITING)
                ->oldest()
                ->first();
            $nextReservation?->update(['status' => Reservation::STATUS_READY]);

            return $fine;
        });

        return response()->json([
            'message' => $fine
                ? 'Xác nhận trả sách thành công. Độc giả trả trễ hạn nên phát sinh phí phạt.'
                : 'Xác nhận trả sách thành công.',
            'borrow_record' => $borrowRecord->fresh(['user', 'book', 'fines']),
        ]);
    }
}
