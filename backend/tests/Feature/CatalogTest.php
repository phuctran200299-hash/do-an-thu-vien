<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Category;
use App\Models\Review;
use App\Models\Role;

class CatalogTest extends ApiTestCase
{
    public function test_public_book_listing_search_and_filters(): void
    {
        $this->makeBook(['title' => 'Mắt biếc']);
        $other = Category::create(['name' => 'Công nghệ thông tin']);
        $this->makeBook(['title' => 'Clean Code', 'category_id' => $other->id]);

        $this->getJson('/api/books')->assertOk()->assertJsonPath('total', 2);
        $this->getJson('/api/books?q=biếc')->assertOk()->assertJsonPath('total', 1);
        $this->getJson('/api/books?q=Nhật Ánh')->assertOk()->assertJsonPath('total', 2);
        $this->getJson("/api/books?category_id={$other->id}")->assertJsonPath('data.0.title', 'Clean Code');
        $this->getJson('/api/books?sort=title&direction=asc')->assertJsonPath('data.0.title', 'Clean Code');
    }

    public function test_book_detail_featured_similar_and_categories(): void
    {
        $book = $this->makeBook();
        $this->makeBook();

        $this->getJson("/api/books/{$book->id}")->assertOk()->assertJsonPath('book.id', $book->id);
        $this->getJson('/api/books/999999')->assertNotFound();
        $this->getJson('/api/books/featured')->assertOk()
            ->assertJsonStructure(['admin_featured', 'newest', 'most_borrowed', 'top_rated']);
        $this->getJson("/api/books/{$book->id}/similar")->assertOk()->assertJsonCount(1, 'results');
        $this->getJson('/api/categories')->assertOk()->assertJsonCount(1, 'categories');
        $this->getJson('/api/authors')->assertOk();
    }

    public function test_ai_search_matches_without_accents(): void
    {
        $this->makeBook(['title' => 'Lập trình Python cơ bản']);
        $this->makeBook(['title' => 'Truyện cổ tích']);

        $res = $this->postJson('/api/ai/search', ['query' => 'toi muon sach lap trinh'])->assertOk();
        $this->assertSame('Lập trình Python cơ bản', $res->json('results.0.book.title'));

        $this->postJson('/api/ai/search', [])->assertStatus(422);
    }

    public function test_ai_search_matches_whole_words_and_skips_unrelated_books(): void
    {
        $this->makeBook(['title' => 'Sức mạnh của thói quen', 'description' => 'Thói quen hằng ngày']);
        $this->makeBook(['title' => 'Eloquent JavaScript', 'description' => 'Lập trình web']);
        $this->makeBook(['title' => 'Lược sử thời gian', 'description' => 'Vũ trụ']);
        $this->makeBook(['title' => 'Sách được đánh giá cao nhưng không liên quan', 'avg_rating' => 5]);

        $titles = collect($this->postJson('/api/ai/search', ['query' => 'sách về thói quen'])->assertOk()->json('results'))
            ->pluck('book.title');

        $this->assertSame(['Sức mạnh của thói quen'], $titles->all());
    }

    public function test_ai_search_treats_vietnamese_compound_words_as_one_unit(): void
    {
        $this->makeBook(['title' => 'Python Crash Course', 'description' => 'Nhập môn lập trình Python']);
        $this->makeBook(['title' => 'Hành trình về phương Đông', 'description' => 'Hành trình của nhà khoa học']);
        $this->makeBook(['title' => 'Tâm lý học thành công', 'description' => 'Tâm lý học']);

        foreach (['tôi muốn học lập trình', 'lap trinh', 'học python'] as $query) {
            $titles = collect($this->postJson('/api/ai/search', ['query' => $query])->assertOk()->json('results'))
                ->pluck('book.title');
            $this->assertSame(['Python Crash Course'], $titles->all(), $query);
        }
    }

    public function test_cover_image_is_served_as_absolute_url_and_stored_relative(): void
    {
        $book = $this->makeBook(['cover_image' => 'covers/mat-biec.jpg']);

        $this->assertSame(url('covers/mat-biec.jpg'), $book->fresh()->cover_image);

        // admin gửi lại URL đầy đủ của chính máy chủ thì chỉ lưu đường dẫn tương đối
        $book->update(['cover_image' => url('covers/khac.jpg')]);
        $this->assertDatabaseHas('books', ['id' => $book->id, 'cover_image' => 'covers/khac.jpg']);

        $book->update(['cover_image' => 'https://example.com/a.jpg']);
        $this->assertSame('https://example.com/a.jpg', $book->fresh()->cover_image);
    }

    public function test_authors_listing_honours_per_page_and_counts_books(): void
    {
        foreach (range(1, 25) as $i) {
            Author::create(['name' => "Tác giả {$i}"]);
        }
        $this->makeBook();

        $this->getJson('/api/authors?per_page=100')->assertOk()->assertJsonCount(26, 'data');
        $this->getJson('/api/authors?q=Nhật Ánh')->assertOk()->assertJsonPath('data.0.books_count', 1);
        $this->getJson('/api/categories')->assertOk()->assertJsonPath('categories.0.books_count', 1);
    }

    public function test_admin_book_crud(): void
    {
        $this->actingAsRole(Role::ADMIN);
        $author = Author::create(['name' => 'Tô Hoài']);

        $id = $this->postJson('/api/books', [
            'title' => 'Dế Mèn', 'quantity' => 4, 'author_ids' => [$author->id],
        ])->assertCreated()->assertJsonPath('book.available_quantity', 4)->json('book.id');

        $this->putJson("/api/books/{$id}", ['quantity' => 6])->assertOk()
            ->assertJsonPath('book.available_quantity', 6);

        $this->putJson("/api/books/{$id}/toggle-featured")->assertOk()->assertJsonPath('book.is_featured', true);
        $this->deleteJson("/api/books/{$id}")->assertOk();
        $this->assertDatabaseMissing('books', ['id' => $id]);
    }

    public function test_admin_category_and_author_crud(): void
    {
        $this->actingAsRole(Role::ADMIN);

        $catId = $this->postJson('/api/categories', ['name' => 'Triết học'])->assertCreated()->json('category.id');
        $this->postJson('/api/categories', ['name' => 'Triết học'])->assertStatus(422);
        $this->putJson("/api/categories/{$catId}", ['name' => 'Triết học phương Đông'])->assertOk();

        $this->makeBook(['category_id' => $catId]);
        $this->deleteJson("/api/categories/{$catId}")->assertStatus(422);

        $authorId = $this->postJson('/api/authors', ['name' => 'Nam Cao'])->assertCreated()->json('author.id');
        $this->putJson("/api/authors/{$authorId}", ['name' => 'Nam Cao (Trần Hữu Tri)'])->assertOk();
        $this->deleteJson("/api/authors/{$authorId}")->assertOk();
    }

    public function test_staff_can_only_update_book_status(): void
    {
        $book = $this->makeBook();
        $this->actingAsRole(Role::STAFF);

        $this->putJson("/api/books/{$book->id}/status", ['status' => 'damaged'])->assertOk();
        $this->putJson("/api/books/{$book->id}/status", ['status' => 'xyz'])->assertStatus(422);
        $this->putJson("/api/books/{$book->id}", ['title' => 'Đổi tên'])->assertStatus(403);
    }

    public function test_home_overview_is_public_and_masks_reader_names(): void
    {
        $reader = $this->makeUser(Role::READER, ['name' => 'Nguyễn Thị Lan']);
        $book = $this->makeBook();
        Review::create([
            'user_id' => $reader->id, 'book_id' => $book->id, 'rating' => 5,
            'comment' => 'Cuốn sách rất hay, đọc một mạch không dứt ra được.',
        ]);

        $this->getJson('/api/home/overview')->assertOk()
            ->assertJsonPath('stats.books', 1)
            ->assertJsonPath('stats.readers', 1)
            ->assertJsonPath('reviews.0.reader', 'Nguyễn T. Lan')
            ->assertJsonMissing(['email' => $reader->email])
            ->assertJsonStructure(['categories', 'authors', 'recent_borrows']);
    }
}
