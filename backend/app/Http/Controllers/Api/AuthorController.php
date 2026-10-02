<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthorController extends Controller
{
    /** UC02 - danh sách tác giả (công khai, dùng cho bộ lọc). */
    public function index(Request $request)
    {
        $query = Author::query();

        if ($request->filled('q')) {
            $query->where('name', 'like', '%'.$request->string('q').'%');
        }

        return response()->json($query->orderBy('name')->paginate(20));
    }

    public function show(Author $author)
    {
        return response()->json(['author' => $author->load('books')]);
    }

    /** UC26 - Admin thêm tác giả. */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:150'],
            'biography' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $author = Author::create($validator->validated());

        return response()->json(['message' => 'Thêm tác giả thành công.', 'author' => $author], 201);
    }

    /** UC26 - Admin cập nhật tác giả. */
    public function update(Request $request, Author $author)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:150'],
            'biography' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $author->update($validator->validated());

        return response()->json(['message' => 'Cập nhật tác giả thành công.', 'author' => $author]);
    }

    /** UC26 - Admin xoá tác giả. */
    public function destroy(Author $author)
    {
        $author->delete();

        return response()->json(['message' => 'Xoá tác giả thành công.']);
    }
}
