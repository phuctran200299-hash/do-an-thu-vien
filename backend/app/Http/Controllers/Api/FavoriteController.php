<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    /** UC13 - Danh sách sách yêu thích của độc giả. */
    public function index(Request $request)
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with('book.category', 'book.authors')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['favorites' => $favorites]);
    }

    /** UC13 - Thêm sách vào danh sách yêu thích. */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'book_id' => ['required', 'exists:books,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'book_id' => $request->book_id,
        ]);

        return response()->json(['message' => 'Đã thêm vào danh sách yêu thích.', 'favorite' => $favorite], 201);
    }

    /** UC13 - Xoá sách khỏi danh sách yêu thích. */
    public function destroy(Request $request, int $bookId)
    {
        Favorite::where('user_id', $request->user()->id)->where('book_id', $bookId)->delete();

        return response()->json(['message' => 'Đã xoá khỏi danh sách yêu thích.']);
    }
}
