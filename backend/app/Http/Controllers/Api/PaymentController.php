<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * UC21/UC30 - Nhân viên/Admin xem danh sách giao dịch thanh toán mượn sách có phí.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['user', 'borrowRecord.book']);

        if ($request->filled('status')) {
            $query->where('payment_status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(15));
    }
}
