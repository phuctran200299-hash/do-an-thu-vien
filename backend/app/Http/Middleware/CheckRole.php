<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Chỉ cho phép request đi tiếp nếu người dùng đã đăng nhập và có một trong các vai trò được liệt kê.
     * Cách dùng trong route: ->middleware('role:admin,staff')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Chưa đăng nhập.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Tài khoản của bạn đã bị khoá.'], 403);
        }

        if (! empty($roles) && ! $user->hasRole(...$roles)) {
            return response()->json(['message' => 'Bạn không có quyền truy cập chức năng này.'], 403);
        }

        return $next($request);
    }
}
