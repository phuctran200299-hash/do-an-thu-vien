<?php

namespace Tests\Feature;

use App\Models\BorrowRecord;
use App\Models\Reservation;
use App\Models\Role;
use Laravel\Sanctum\Sanctum;

class ReaderFeaturesTest extends ApiTestCase
{
    private function borrowAndApprove($reader, $book): int
    {
        Sanctum::actingAs($reader);
        $id = $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->json('borrow_record.id');
        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->putJson("/api/borrow-requests/{$id}/approve")->assertOk();

        return $id;
    }

    public function test_favorites_add_list_remove(): void
    {
        $book = $this->makeBook();
        $this->actingAsRole();

        $this->postJson('/api/favorites', ['book_id' => $book->id])->assertCreated();
        $this->postJson('/api/favorites', ['book_id' => $book->id])->assertCreated();
        $this->getJson('/api/favorites')->assertOk()->assertJsonCount(1, 'favorites');
        $this->deleteJson("/api/favorites/{$book->id}")->assertOk();
        $this->getJson('/api/favorites')->assertJsonCount(0, 'favorites');
    }

    public function test_review_requires_real_borrow_and_updates_avg_rating(): void
    {
        $book = $this->makeBook();
        $reader = $this->actingAsRole();

        $this->postJson("/api/books/{$book->id}/reviews", ['rating' => 5])->assertStatus(422);

        // chỉ mới gửi yêu cầu (chưa được duyệt) thì chưa được đánh giá
        $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->assertCreated();
        $this->postJson("/api/books/{$book->id}/reviews", ['rating' => 5])->assertStatus(422);

        $id = BorrowRecord::first()->id;
        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->putJson("/api/borrow-requests/{$id}/approve")->assertOk();

        Sanctum::actingAs($reader);
        $this->postJson("/api/books/{$book->id}/reviews", ['rating' => 6])->assertStatus(422);
        $this->postJson("/api/books/{$book->id}/reviews", ['rating' => 4, 'comment' => 'Hay'])->assertCreated();
        $this->assertEquals(4.0, (float) $book->fresh()->avg_rating);

        $this->getJson("/api/books/{$book->id}/reviews")->assertOk()->assertJsonCount(1, 'reviews');
        $this->deleteJson("/api/books/{$book->id}/reviews")->assertOk();
        $this->assertEquals(0.0, (float) $book->fresh()->avg_rating);
    }

    public function test_reservation_queue_ready_and_borrow(): void
    {
        $book = $this->makeBook(['quantity' => 1]);
        $first = $this->makeUser();
        $second = $this->makeUser();
        $third = $this->makeUser();

        Sanctum::actingAs($second);
        $this->postJson('/api/reservations', ['book_id' => $book->id])->assertStatus(422);

        $borrowId = $this->borrowAndApprove($first, $book);

        Sanctum::actingAs($second);
        $this->postJson('/api/reservations', ['book_id' => $book->id])->assertCreated();
        $this->postJson('/api/reservations', ['book_id' => $book->id])->assertStatus(422);
        Sanctum::actingAs($third);
        $this->postJson('/api/reservations', ['book_id' => $book->id])->assertCreated();

        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->putJson("/api/borrow-requests/{$borrowId}/return")->assertOk();
        $this->getJson('/api/reservations')->assertOk()->assertJsonPath('total', 2);

        // độc giả thứ 3 (chưa đến lượt) không được "cướp" bản sách đang giữ cho người thứ 2
        Sanctum::actingAs($third);
        $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->assertStatus(400);

        Sanctum::actingAs($second);
        $this->getJson('/api/my-reservations')->assertJsonPath('reservations.0.status', Reservation::STATUS_READY);
        $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->assertCreated();
        $this->getJson('/api/my-reservations')->assertJsonPath('reservations.0.status', Reservation::STATUS_DONE);
    }

    public function test_cancelling_ready_reservation_passes_turn_to_next_in_queue(): void
    {
        $book = $this->makeBook(['quantity' => 1]);
        $first = $this->makeUser();
        $second = $this->makeUser();
        $third = $this->makeUser();

        $borrowId = $this->borrowAndApprove($first, $book);
        foreach ([$second, $third] as $u) {
            Sanctum::actingAs($u);
            $this->postJson('/api/reservations', ['book_id' => $book->id])->assertCreated();
        }
        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->putJson("/api/borrow-requests/{$borrowId}/return")->assertOk();

        Sanctum::actingAs($second);
        $readyId = Reservation::where('user_id', $second->id)->value('id');
        $this->putJson("/api/reservations/{$readyId}/cancel")->assertOk();

        $this->assertSame(
            Reservation::STATUS_READY,
            Reservation::where('user_id', $third->id)->value('status')
        );
    }

    public function test_ai_recommendations_exclude_already_borrowed(): void
    {
        $borrowed = $this->makeBook();
        $other = $this->makeBook();
        $reader = $this->makeUser();
        $this->borrowAndApprove($reader, $borrowed);

        Sanctum::actingAs($reader);
        $ids = collect($this->getJson('/api/ai/recommendations')->assertOk()->json('results'))->pluck('book.id');
        $this->assertTrue($ids->contains($other->id));
        $this->assertFalse($ids->contains($borrowed->id));
    }
}
