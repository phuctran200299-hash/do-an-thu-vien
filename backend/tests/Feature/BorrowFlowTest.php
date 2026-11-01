<?php

namespace Tests\Feature;

use App\Models\BorrowRecord;
use App\Models\Fine;
use App\Models\Role;
use Laravel\Sanctum\Sanctum;

class BorrowFlowTest extends ApiTestCase
{
    public function test_full_free_borrow_approve_renew_return_flow(): void
    {
        $book = $this->makeBook(['quantity' => 2]);
        $reader = $this->actingAsRole();

        $id = $this->postJson('/api/borrow-requests', ['book_id' => $book->id])
            ->assertCreated()->json('borrow_record.id');
        $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->assertStatus(422);

        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->putJson("/api/borrow-requests/{$id}/approve")->assertOk()
            ->assertJsonPath('borrow_record.status', BorrowRecord::STATUS_BORROWED);
        $this->assertSame(1, $book->fresh()->available_quantity);

        Sanctum::actingAs($reader);
        $this->putJson("/api/borrow-requests/{$id}/renew")->assertOk();
        $this->putJson("/api/borrow-requests/{$id}/renew")->assertStatus(422);
        $this->getJson('/api/my-borrows')->assertOk()->assertJsonPath('total', 1);

        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->putJson("/api/borrow-requests/{$id}/return")->assertOk()
            ->assertJsonPath('borrow_record.status', BorrowRecord::STATUS_RETURNED);
        $this->assertSame(2, $book->fresh()->available_quantity);
        $this->assertDatabaseCount('fines', 0);
    }

    public function test_paid_book_requires_payment_before_approval(): void
    {
        $book = $this->makeBook(['borrow_fee' => 10000]);
        $reader = $this->actingAsRole();
        $id = $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->assertCreated()->json('borrow_record.id');

        $staff = $this->makeUser(Role::STAFF);
        Sanctum::actingAs($staff);
        $this->putJson("/api/borrow-requests/{$id}/approve")->assertStatus(422);

        Sanctum::actingAs($this->makeUser());
        $this->putJson("/api/borrow-requests/{$id}/pay")->assertStatus(403);

        Sanctum::actingAs($reader);
        $this->putJson("/api/borrow-requests/{$id}/pay")->assertOk();
        $this->putJson("/api/borrow-requests/{$id}/pay")->assertStatus(422);

        Sanctum::actingAs($staff);
        $this->putJson("/api/borrow-requests/{$id}/approve")->assertOk();
        $this->getJson('/api/payments?status=paid')->assertOk()->assertJsonPath('total', 1);
    }

    public function test_reader_cancel_and_staff_reject(): void
    {
        $book = $this->makeBook(['borrow_fee' => 5000]);
        $reader = $this->actingAsRole();
        $id = $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->json('borrow_record.id');
        $this->putJson("/api/borrow-requests/{$id}/cancel")->assertOk();
        $this->assertDatabaseHas('payments', ['borrow_record_id' => $id, 'payment_status' => 'failed']);

        $id2 = $this->postJson('/api/borrow-requests', ['book_id' => $book->id])->json('borrow_record.id');
        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->putJson("/api/borrow-requests/{$id2}/reject")->assertOk();
        $this->putJson("/api/borrow-requests/{$id2}/approve")->assertStatus(422);
        $this->assertSame(3, $book->fresh()->available_quantity);
    }

    public function test_out_of_stock_unavailable_and_borrow_limit(): void
    {
        $this->actingAsRole();
        $empty = $this->makeBook(['quantity' => 0]);
        $damaged = $this->makeBook(['status' => 'damaged']);

        $this->postJson('/api/borrow-requests', ['book_id' => $empty->id])->assertStatus(400);
        $this->postJson('/api/borrow-requests', ['book_id' => $damaged->id])->assertStatus(400);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/borrow-requests', ['book_id' => $this->makeBook()->id])->assertCreated();
        }
        $this->postJson('/api/borrow-requests', ['book_id' => $this->makeBook()->id])->assertStatus(422);
    }

    public function test_overdue_is_synced_blocks_new_borrow_and_creates_fine_on_return(): void
    {
        $book = $this->makeBook();
        $reader = $this->actingAsRole();
        $record = BorrowRecord::create([
            'user_id' => $reader->id,
            'book_id' => $book->id,
            'borrow_date' => now()->subDays(20)->toDateString(),
            'due_date' => now()->subDays(6)->toDateString(),
            'status' => BorrowRecord::STATUS_BORROWED,
        ]);
        $book->decrement('available_quantity');

        $this->postJson('/api/borrow-requests', ['book_id' => $this->makeBook()->id])->assertStatus(422);
        $this->assertSame(BorrowRecord::STATUS_OVERDUE, $record->fresh()->status);
        $this->putJson("/api/borrow-requests/{$record->id}/renew")->assertStatus(422);

        $staff = $this->makeUser(Role::STAFF);
        Sanctum::actingAs($staff);
        $this->getJson('/api/borrow-requests/overdue')->assertOk()->assertJsonPath('total', 1);
        $this->putJson("/api/borrow-requests/{$record->id}/return")->assertOk();

        $fine = Fine::first();
        $this->assertEquals(6 * Fine::FINE_PER_DAY, (float) $fine->amount);

        $this->getJson("/api/staff/users/{$reader->id}/borrow-history")->assertOk()
            ->assertJsonPath('unpaid_fine_total', 6 * Fine::FINE_PER_DAY);

        $this->putJson("/api/fines/{$fine->id}/mark-paid")->assertOk();
        $this->putJson("/api/fines/{$fine->id}/mark-paid")->assertStatus(422);
    }

    public function test_staff_can_search_borrow_requests_by_reader_or_book(): void
    {
        $lan = $this->makeUser(Role::READER, ['name' => 'Nguyễn Thị Lan']);
        $minh = $this->makeUser(Role::READER, ['name' => 'Trần Văn Minh']);
        $book = $this->makeBook(['title' => 'Dế Mèn phiêu lưu ký']);
        $other = $this->makeBook(['title' => 'Clean Code']);
        foreach ([[$lan, $book], [$minh, $other]] as [$u, $b]) {
            BorrowRecord::create([
                'user_id' => $u->id, 'book_id' => $b->id, 'borrow_date' => now()->toDateString(),
                'due_date' => now()->addDays(14)->toDateString(), 'status' => BorrowRecord::STATUS_PENDING,
            ]);
        }

        $this->actingAsRole(Role::STAFF);
        $this->getJson('/api/borrow-requests?status=cho_xac_nhan&q=Lan')->assertOk()->assertJsonPath('total', 1);
        $this->getJson('/api/borrow-requests?q=Clean')->assertOk()->assertJsonPath('data.0.user.name', 'Trần Văn Minh');
        $this->getJson('/api/borrow-requests?q=khong-ton-tai')->assertOk()->assertJsonPath('total', 0);

        $this->getJson('/api/borrow-requests/summary')->assertOk()
            ->assertJsonPath('cho_xac_nhan', 2)
            ->assertJsonPath('dang_muon', 0)
            ->assertJsonPath('qua_han', 0);
    }

    public function test_staff_user_lookup_only_returns_readers(): void
    {
        $this->makeUser(Role::READER, ['name' => 'Lan độc giả']);
        $this->makeUser(Role::ADMIN, ['name' => 'Lan quản trị']);
        $this->actingAsRole(Role::STAFF);

        $this->getJson('/api/staff/users?q=Lan')->assertOk()->assertJsonPath('total', 1);
    }
}
