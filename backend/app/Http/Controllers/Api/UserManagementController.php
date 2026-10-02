<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /** UC24 - Admin tìm kiếm / xem danh sách tài khoản người dùng và nhân viên. */
    public function index(Request $request)
    {
        $query = User::with('role');

        if ($request->filled('q')) {
            $keyword = $request->string('q');
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")->orWhere('email', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('role', fn ($r) => $r->where('name', $request->string('role')));
        }

        return response()->json($query->orderBy('name')->paginate(15));
    }

    /** UC24 - Admin tạo tài khoản nhân viên / admin. */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'role' => ['required', Rule::in([Role::READER, Role::STAFF, Role::ADMIN])],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $role = Role::where('name', $request->role)->firstOrFail();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'role_id' => $role->id,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Tạo tài khoản thành công.', 'user' => $user->load('role')], 201);
    }

    /** UC24 - Admin cập nhật thông tin / vai trò tài khoản. */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'role' => ['sometimes', Rule::in([Role::READER, Role::STAFF, Role::ADMIN])],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (isset($data['role'])) {
            if ($user->id === $request->user()->id && $data['role'] !== Role::ADMIN) {
                return response()->json(['message' => 'Không thể tự hạ quyền quản trị của chính tài khoản đang đăng nhập.'], 422);
            }

            $data['role_id'] = Role::where('name', $data['role'])->firstOrFail()->id;
            unset($data['role']);
        }

        $user->update($data);

        return response()->json(['message' => 'Cập nhật tài khoản thành công.', 'user' => $user->fresh('role')]);
    }

    /** UC24 - Admin khoá / mở khoá tài khoản. */
    public function toggleActive(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể tự khoá tài khoản đang đăng nhập.'], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'message' => $user->is_active ? 'Đã mở khoá tài khoản.' : 'Đã khoá tài khoản.',
            'user' => $user,
        ]);
    }
}
