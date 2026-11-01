<?php

namespace Tests\Feature;

use App\Models\BorrowRecord;
use App\Models\Review;
use App\Models\Role;

class AdminTest extends ApiTestCase
{
    public function test_admin_user_management(): void
    {
        $admin = $this->actingAsRole(Role::ADMIN);

        $id = $this->postJson('/api/admin/users', [
            'name' => 'Nhân viên mới', 'email' => 'nv@test.vn', 'password' => 'secret123', 'role' => 'staff',
        ])->assertCreated()->assertJsonPath('user.role.name', 'staff')->json('user.id');

        $this->getJson('/api/admin/users?role=staff')->assertOk()->assertJsonPath('total', 1);
        $this->putJson("/api/admin/users/{$id}", ['role' => 'reader'])->assertOk()
            ->assertJsonPath('user.role.name', 'reader');
        $this->putJson("/api/admin/users/{$id}/toggle-active")->assertOk()->assertJsonPath('user.is_active', false);

        $this->putJson("/api/admin/users/{$admin->id}/toggle-active")->assertStatus(422);
        $this->putJson("/api/admin/users/{$admin->id}", ['role' => 'reader'])->assertStatus(422);
    }

    public function test_locked_user_token_is_rejected(): void
    {
        $this->actingAsRole(Role::READER, ['is_active' => false]);
        $this->getJson('/api/favorites')->assertStatus(403);
    }

    public function test_admin_review_moderation(): void
    {
        $book = $this->makeBook();
        $reader = $this->makeUser();
        Review::create(['user_id' => $reader->id, 'book_id' => $book->id, 'rating' => 1, 'comment' => 'spam']);
        $book->refreshAvgRating();

        $this->actingAsRole(Role::ADMIN);
        $reviewId = $this->getJson('/api/admin/reviews?rating=1')->assertOk()->json('data.0.id');
        $this->deleteJson("/api/admin/reviews/{$reviewId}")->assertOk();
        $this->assertEquals(0.0, (float) $book->fresh()->avg_rating);
    }

    public function test_statistics_and_ai_logs(): void
    {
        $book = $this->makeBook();
        $reader = $this->makeUser();
        BorrowRecord::create([
            'user_id' => $reader->id, 'book_id' => $book->id, 'borrow_date' => now()->toDateString(),
            'due_date' => now()->addDays(14)->toDateString(), 'status' => BorrowRecord::STATUS_BORROWED,
        ]);

        $this->actingAsRole(Role::ADMIN);
        $this->getJson('/api/admin/statistics')->assertOk()
            ->assertJsonPath('currently_borrowed', 1)
            ->assertJsonPath('total_users', 1)
            ->assertJsonPath('most_borrowed_books.0.total_borrows', 1);
        $this->getJson('/api/admin/statistics?from=2020-01-01&to=2020-01-31')->assertOk()
            ->assertJsonCount(0, 'most_borrowed_books');

        $this->getJson("/api/books/{$book->id}/similar")->assertOk();
        $this->getJson('/api/admin/ai-logs')->assertOk()->assertJsonStructure(['top_recommended_books', 'by_source', 'total_logs']);
    }

    public function test_cannot_delete_book_with_active_borrow(): void
    {
        $book = $this->makeBook();
        BorrowRecord::create([
            'user_id' => $this->makeUser()->id, 'book_id' => $book->id, 'borrow_date' => now()->toDateString(),
            'due_date' => now()->addDays(14)->toDateString(), 'status' => BorrowRecord::STATUS_PENDING,
        ]);

        $this->actingAsRole(Role::ADMIN);
        $this->deleteJson("/api/books/{$book->id}")->assertStatus(422);
    }
}
