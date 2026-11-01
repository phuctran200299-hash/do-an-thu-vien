<?php

namespace Tests\Feature;

use App\Models\Role;
use Laravel\Sanctum\Sanctum;

class AuthTest extends ApiTestCase
{
    public function test_register_creates_reader_account(): void
    {
        $res = $this->postJson('/api/register', [
            'name' => 'Độc giả mới',
            'email' => 'moi@test.vn',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $res->assertCreated()->assertJsonPath('user.role.name', Role::READER);
    }

    public function test_register_rejects_duplicate_email_and_mismatched_password(): void
    {
        $this->makeUser(Role::READER, ['email' => 'trung@test.vn']);

        $this->postJson('/api/register', [
            'name' => 'X', 'email' => 'trung@test.vn', 'password' => 'secret123', 'password_confirmation' => 'khac123',
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_success_wrong_password_and_locked_account(): void
    {
        $this->makeUser(Role::READER, ['email' => 'a@test.vn']);
        $this->makeUser(Role::READER, ['email' => 'khoa@test.vn', 'is_active' => false]);

        $this->postJson('/api/login', ['email' => 'a@test.vn', 'password' => 'secret123'])
            ->assertOk()->assertJsonStructure(['access_token', 'user']);
        $this->postJson('/api/login', ['email' => 'a@test.vn', 'password' => 'sai'])->assertStatus(401);
        $this->postJson('/api/login', ['email' => 'khoa@test.vn', 'password' => 'secret123'])->assertStatus(403);
    }

    public function test_me_requires_token(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
        $this->actingAsRole();
        $this->getJson('/api/me')->assertOk()->assertJsonPath('user.role.name', Role::READER);
    }

    public function test_update_profile_and_change_password(): void
    {
        $user = $this->actingAsRole();

        $this->putJson('/api/me', ['name' => 'Tên mới', 'phone' => '0900000000'])
            ->assertOk()->assertJsonPath('user.name', 'Tên mới');

        $this->putJson('/api/me/password', [
            'current_password' => 'sai', 'new_password' => 'moi12345', 'new_password_confirmation' => 'moi12345',
        ])->assertStatus(422);

        $this->putJson('/api/me/password', [
            'current_password' => 'secret123', 'new_password' => 'moi12345', 'new_password_confirmation' => 'moi12345',
        ])->assertOk();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'moi12345'])->assertOk();
    }

    public function test_logout_revokes_token(): void
    {
        $user = $this->makeUser();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_role_middleware_blocks_wrong_roles(): void
    {
        $this->actingAsRole(Role::READER);
        $this->getJson('/api/borrow-requests')->assertStatus(403);
        $this->getJson('/api/admin/statistics')->assertStatus(403);

        Sanctum::actingAs($this->makeUser(Role::STAFF));
        $this->getJson('/api/borrow-requests')->assertOk();
        $this->getJson('/api/admin/statistics')->assertStatus(403);
    }
}
