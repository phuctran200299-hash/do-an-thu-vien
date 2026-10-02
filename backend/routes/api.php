<?php

use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\StatisticsController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Hệ thống Quản lý Thư viện Sách Thông minh
|--------------------------------------------------------------------------
*/

// ----- Xác thực -----
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ----- Công khai: sách, tác giả, thể loại, đánh giá, AI -----
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/featured', [BookController::class, 'featured']);
Route::get('/books/{book}', [BookController::class, 'show']);
Route::get('/books/{book}/reviews', [ReviewController::class, 'index']);
Route::get('/books/{book}/similar', [AiController::class, 'similar']);

Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{author}', [AuthorController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::post('/ai/search', [AiController::class, 'search']);

// ----- Yêu cầu đăng nhập -----
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'changePassword']);

    // ----- Độc giả (role: reader, và cũng cho phép staff/admin trải nghiệm) -----
    Route::middleware('role:reader,staff,admin')->group(function () {
        Route::post('/borrow-requests', [BorrowController::class, 'store']);
        Route::get('/my-borrows', [BorrowController::class, 'myBorrows']);
        Route::put('/borrow-requests/{borrowRecord}/cancel', [BorrowController::class, 'cancel']);
        Route::put('/borrow-requests/{borrowRecord}/renew', [BorrowController::class, 'renew']);
        Route::put('/borrow-requests/{borrowRecord}/pay', [BorrowController::class, 'pay']);

        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{bookId}', [FavoriteController::class, 'destroy']);

        Route::post('/books/{book}/reviews', [ReviewController::class, 'store']);
        Route::delete('/books/{book}/reviews', [ReviewController::class, 'destroy']);

        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
        Route::put('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);

        Route::get('/ai/recommendations', [AiController::class, 'recommendations']);
    });

    // ----- Nhân viên & Admin (role: staff, admin) -----
    Route::middleware('role:staff,admin')->group(function () {
        Route::get('/borrow-requests', [BorrowController::class, 'index']);
        Route::get('/borrow-requests/overdue', [BorrowController::class, 'overdue']);
        Route::put('/borrow-requests/{borrowRecord}/approve', [BorrowController::class, 'approve']);
        Route::put('/borrow-requests/{borrowRecord}/reject', [BorrowController::class, 'reject']);
        Route::put('/borrow-requests/{borrowRecord}/return', [BorrowController::class, 'returnBook']);

        Route::put('/books/{book}/status', [BookController::class, 'updateStatus']);

        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/fines', [FineController::class, 'index']);
        Route::put('/fines/{fine}/mark-paid', [FineController::class, 'markPaid']);

        Route::get('/reservations', [ReservationController::class, 'index']);

        Route::get('/staff/users', [StaffController::class, 'searchUsers']);
        Route::get('/staff/users/{user}/borrow-history', [StaffController::class, 'userBorrowHistory']);
    });

    // ----- Chỉ Admin (role: admin) -----
    Route::middleware('role:admin')->group(function () {
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{book}', [BookController::class, 'update']);
        Route::delete('/books/{book}', [BookController::class, 'destroy']);
        Route::put('/books/{book}/toggle-featured', [BookController::class, 'toggleFeatured']);

        Route::post('/authors', [AuthorController::class, 'store']);
        Route::put('/authors/{author}', [AuthorController::class, 'update']);
        Route::delete('/authors/{author}', [AuthorController::class, 'destroy']);

        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        Route::get('/admin/users', [UserManagementController::class, 'index']);
        Route::post('/admin/users', [UserManagementController::class, 'store']);
        Route::put('/admin/users/{user}', [UserManagementController::class, 'update']);
        Route::put('/admin/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive']);

        Route::get('/admin/reviews', [ReviewController::class, 'adminIndex']);
        Route::delete('/admin/reviews/{review}', [ReviewController::class, 'adminDestroy']);

        Route::get('/admin/statistics', [StatisticsController::class, 'index']);
        Route::get('/admin/ai-logs', [AiController::class, 'adminLogs']);
    });
});
