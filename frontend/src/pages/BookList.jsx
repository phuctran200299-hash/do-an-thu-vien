import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getBooksApi } from "../api/books";
import { getCategoriesApi } from "../api/catalog";
import BookCard from "../components/BookCard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category_id") || "";
  const status = searchParams.get("status") || "";
  const page = searchParams.get("page") || "1";
  const sort = searchParams.get("sort") || "";
  const authorId = searchParams.get("author_id") || "";
  const authorName = searchParams.get("author") || "";

  useEffect(() => {
    getCategoriesApi().then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const [sortField, direction] = sort ? sort.split(":") : [];
    getBooksApi({ q, category_id: categoryId, author_id: authorId || undefined, status, page, sort: sortField, direction })
      .then((res) => setBooks(res.data))
      .finally(() => setLoading(false));
  }, [q, categoryId, authorId, status, page, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "author_id") next.delete("author");
    next.set("page", "1");
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = [
    q && { key: "q", label: `"${q}"` },
    categoryId && { key: "category_id", label: categories.find((c) => String(c.id) === categoryId)?.name },
    authorId && { key: "author_id", label: `Tác giả: ${authorName || "#" + authorId}` },
    status && { key: "status", label: status === "available" ? "Còn sách" : "Ngừng cung cấp" },
  ].filter(Boolean);

  return (
    <div>
      <h1 className="section-title mb-1">Tìm kiếm sách</h1>
      <p className="mb-5 text-sm text-gray-500">Khám phá kho sách với bộ lọc theo tên, thể loại và tình trạng.</p>

      <div className="card mb-6 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            className="input pl-9"
            placeholder="Tìm theo tên sách, tác giả..."
            defaultValue={q}
            onKeyDown={(e) => e.key === "Enter" && updateParam("q", e.currentTarget.value)}
            onBlur={(e) => updateParam("q", e.currentTarget.value)}
          />
        </div>
        <select className="input" value={categoryId} onChange={(e) => updateParam("category_id", e.target.value)}>
          <option value="">Tất cả thể loại</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input" value={status} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="available">Còn sách</option>
          <option value="unavailable">Ngừng cung cấp</option>
        </select>
        <select className="input" value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
          <option value="">Mới nhất</option>
          <option value="avg_rating:desc">Đánh giá cao nhất</option>
          <option value="title:asc">Tên A → Z</option>
          <option value="title:desc">Tên Z → A</option>
          <option value="borrow_fee:asc">Phí mượn thấp → cao</option>
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Đang lọc:</span>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => updateParam(f.key, "")}
              className="badge bg-primary-50 text-primary-700 transition hover:bg-primary-100"
            >
              {f.label} <span className="text-primary-400">✕</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] w-full" />
          ))}
        </div>
      )}

      {!loading && books && (
        <>
          {books.data.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 p-14 text-center">
              <span className="text-4xl">📭</span>
              <p className="font-medium text-gray-600">Không tìm thấy sách phù hợp.</p>
              <p className="text-sm text-gray-400">Hãy thử điều chỉnh lại bộ lọc hoặc từ khoá tìm kiếm.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${q}-${categoryId}-${status}-${page}-${sort}`}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {books.data.map((b) => (
                  <motion.div key={b.id} variants={item}>
                    <BookCard book={b} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {books.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: books.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    p === books.current_page
                      ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-soft"
                      : "border border-gray-200 bg-white text-gray-600 hover:-translate-y-0.5 hover:border-primary-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
