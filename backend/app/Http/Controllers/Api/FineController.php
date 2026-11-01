<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fine;
use Illuminate\Http\Request;

class FineController extends Controller
{
    /**
     * UC21/UC30 - Nhân viên/Admin xem danh sách phí phạt.
     */
    public function index(Request $request)
    {
        $query = Fine::with(['borrowRecord.user', 'borrowRecord.book']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(15));
    }

    /**
     * UC21/UC30 - Nhân viên/Admin xác nhận độc giả đã thanh toán phí phạt (thu tiền mặt tại quầy).
     */
    public function markPaid(Fine $fine)
    {
        if ($fine->status === Fine::STATUS_PAID) {
            return response()->json(['message' => 'Khoản phí phạt này đã được thanh toán trước đó.'], 422);
        }

        $fine->update(['status' => Fine::STATUS_PAID]);

        return response()->json(['message' => 'Đã ghi nhận thanh toán phí phạt.', 'fine' => $fine->fresh()]);
    }
}
