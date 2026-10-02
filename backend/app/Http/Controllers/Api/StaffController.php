<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowRecord;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * UC22 - Nhân viên tra cứu thông tin độc giả (chỉ xem, không có quyền chỉnh sửa/phân quyền như Admin).
     */
    public function searchUsers(Request $request)
    {
        $query = User::with('role')->whereHas('role', fn ($r) => $r->where('name', Role::READER));

        if ($request->filled('q')) {
            $keyword = $request->string('q');
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")->orWhere('email', 'like', "%{$keyword}%");
            });
        }

        return response()->json($query->orderBy('name')->paginate(15));
    }

    /**
     * UC22 - Nhân viên xem lịch sử mượn - trả và tình trạng quá hạn của một độc giả cụ thể để hỗ trợ xử lý.
     */
    public function userBorrowHistory(User $user)
    {
        BorrowRecord::syncOverdueStatuses();

        $history = BorrowRecord::where('user_id', $user->id)
            ->with(['book', 'fines'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'user' => $user->load('role'),
            'borrow_history' => $history,
            'overdue_count' => $history->where('status', BorrowRecord::STATUS_OVERDUE)->count(),
            'unpaid_fine_total' => $history->flatMap->fines->where('status', 'unpaid')->sum('amount'),
        ]);
    }
}
