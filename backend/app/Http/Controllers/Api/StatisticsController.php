<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Fine;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * UC34 - Thống kê tổng hợp phục vụ Admin theo dõi hoạt động thư viện.
     * Hỗ trợ tham số from/to (yyyy-mm-dd) để lọc các số liệu theo giao dịch mượn - trả trong khoảng thời gian.
     */
    public function index(Request $request)
    {
        $from = $request->filled('from') ? $request->date('from')->startOfDay() : now()->subDays(30)->startOfDay();
        $to = $request->filled('to') ? $request->date('to')->endOfDay() : now()->endOfDay();

        $mostBorrowedBooks = BorrowRecord::select('book_id', DB::raw('COUNT(*) as total_borrows'))
            ->whereBetween('borrow_records.created_at', [$from, $to])
            ->with('book:id,title,borrow_fee')
            ->groupBy('book_id')
            ->orderByDesc('total_borrows')
            ->limit(5)
            ->get();

        $topCategories = BorrowRecord::join('books', 'books.id', '=', 'borrow_records.book_id')
            ->join('categories', 'categories.id', '=', 'books.category_id')
            ->select('categories.id', 'categories.name', DB::raw('COUNT(*) as total'))
            ->whereBetween('borrow_records.created_at', [$from, $to])
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $revenueByDay = Payment::where('payment_status', Payment::STATUS_PAID)
            ->whereBetween('paid_at', [$from, $to])
            ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topRevenueBooks = Payment::join('borrow_records', 'borrow_records.id', '=', 'payments.borrow_record_id')
            ->join('books', 'books.id', '=', 'borrow_records.book_id')
            ->where('payments.payment_status', Payment::STATUS_PAID)
            ->whereBetween('payments.paid_at', [$from, $to])
            ->select('books.id', 'books.title', DB::raw('SUM(payments.amount) as revenue'))
            ->groupBy('books.id', 'books.title')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        return response()->json([
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],

            'total_books' => Book::count(),
            'total_users' => User::whereHas('role', fn ($r) => $r->where('name', 'reader'))->count(),
            'total_staff' => User::whereHas('role', fn ($r) => $r->where('name', 'staff'))->count(),

            'total_borrow_count' => BorrowRecord::where('status', '!=', BorrowRecord::STATUS_CANCELLED)->count(),
            'currently_borrowed' => BorrowRecord::where('status', BorrowRecord::STATUS_BORROWED)->count(),
            'currently_returned' => BorrowRecord::where('status', BorrowRecord::STATUS_RETURNED)->count(),
            'currently_overdue' => BorrowRecord::where('status', BorrowRecord::STATUS_OVERDUE)->count(),
            'pending_requests' => BorrowRecord::where('status', BorrowRecord::STATUS_PENDING)->count(),

            'free_borrow_count' => BorrowRecord::whereHas('book', fn ($q) => $q->where('borrow_fee', 0))
                ->where('status', '!=', BorrowRecord::STATUS_CANCELLED)->count(),
            'paid_borrow_count' => BorrowRecord::whereHas('book', fn ($q) => $q->where('borrow_fee', '>', 0))
                ->where('status', '!=', BorrowRecord::STATUS_CANCELLED)->count(),

            'total_revenue' => (float) Payment::where('payment_status', Payment::STATUS_PAID)
                ->whereBetween('paid_at', [$from, $to])->sum('amount'),
            'total_fine_revenue' => (float) Fine::where('status', Fine::STATUS_PAID)
                ->whereBetween('updated_at', [$from, $to])->sum('amount'),
            'unpaid_fine_total' => (float) Fine::where('status', Fine::STATUS_UNPAID)->sum('amount'),

            'most_borrowed_books' => $mostBorrowedBooks,
            'top_categories' => $topCategories,
            'revenue_by_day' => $revenueByDay,
            'top_revenue_books' => $topRevenueBooks,
        ]);
    }
}
