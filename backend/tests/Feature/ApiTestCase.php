<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Lớp cơ sở cho các bài test API: dựng sẵn vai trò và các hàm tiện ích tạo dữ liệu.
 */
abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    protected function makeUser(string $role = Role::READER, array $attrs = []): User
    {
        static $seq = 0;
        $seq++;

        return User::create(array_merge([
            'name' => "Người dùng {$seq}",
            'email' => "user{$seq}_".uniqid().'@test.vn',
            'password' => 'secret123',
            'role_id' => Role::where('name', $role)->value('id'),
            'is_active' => true,
        ], $attrs));
    }

    protected function actingAsRole(string $role = Role::READER, array $attrs = []): User
    {
        $user = $this->makeUser($role, $attrs);
        Sanctum::actingAs($user);

        return $user;
    }

    protected function makeBook(array $attrs = []): Book
    {
        $category = Category::firstOrCreate(['name' => 'Văn học']);
        $quantity = $attrs['quantity'] ?? 3;

        $book = Book::create(array_merge([
            'title' => 'Sách thử nghiệm '.uniqid(),
            'category_id' => $category->id,
            'description' => 'Mô tả sách thử nghiệm',
            'quantity' => $quantity,
            'available_quantity' => $quantity,
            'borrow_fee' => 0,
            'status' => Book::STATUS_AVAILABLE,
        ], $attrs));

        $author = Author::firstOrCreate(['name' => 'Nguyễn Nhật Ánh']);
        $book->authors()->sync([$author->id]);

        return $book;
    }
}
