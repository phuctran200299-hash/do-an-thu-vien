<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /** UC02 - danh sách thể loại (công khai, dùng cho bộ lọc). */
    public function index()
    {
        return response()->json(['categories' => Category::orderBy('name')->get()]);
    }

    public function show(Category $category)
    {
        return response()->json(['category' => $category->load('books')]);
    }

    /** UC27 - Admin thêm thể loại. */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $category = Category::create($validator->validated());

        return response()->json(['message' => 'Thêm thể loại thành công.', 'category' => $category], 201);
    }

    /** UC27 - Admin cập nhật thể loại. */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $category->update($validator->validated());

        return response()->json(['message' => 'Cập nhật thể loại thành công.', 'category' => $category]);
    }

    /** UC27 - Admin xoá thể loại. */
    public function destroy(Category $category)
    {
        if ($category->books()->exists()) {
            return response()->json([
                'message' => 'Không thể xoá thể loại đang có sách. Vui lòng chuyển sách sang thể loại khác trước.',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Xoá thể loại thành công.']);
    }
}
