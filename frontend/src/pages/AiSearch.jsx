import { useState } from "react";
import { Link } from "react-router-dom";
import { aiSearchApi } from "../api/ai";

export default function AiSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiSearchApi(query);
      setResults(res.data.results);
      setSearched(true);
    } catch (e2) {
      setError(e2.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const samples = [
    "Tôi muốn tìm sách về kỹ năng giao tiếp",
    "Sách lập trình cho người mới bắt đầu",
    "Tiểu thuyết nhẹ nhàng về tuổi thơ",
    "Sách về lịch sử loài người",
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">🤖 Hỏi AI tìm sách</h1>
        <p className="mt-2 text-gray-500">
          Mô tả nhu cầu đọc sách của bạn bằng ngôn ngữ tự nhiên, hệ thống sẽ gợi ý những cuốn sách phù hợp đang có
          trong thư viện.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card flex gap-2 p-3">
        <input
          className="input"
          placeholder='Ví dụ: "Tôi muốn tìm sách về kỹ năng giao tiếp cho người mới bắt đầu"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </form>

      {!searched && (
        <div className="mt-4 flex flex-wrap gap-2">
          {samples.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {results && (
        <div className="mt-6 space-y-3">
          {results.length === 0 && (
            <p className="text-center text-gray-500">Không tìm thấy sách phù hợp với yêu cầu của bạn.</p>
          )}
          {results.map(({ book, reason }) => (
            <Link
              key={book.id}
              to={`/sach/${book.id}`}
              className="card flex gap-4 p-4 hover:shadow-md transition"
            >
              <div className="flex h-24 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-2xl">
                {book.cover_image ? (
                  <img src={book.cover_image} alt={book.title} className="h-full w-full rounded object-cover" />
                ) : (
                  "📖"
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{book.title}</h3>
                <p className="text-xs text-gray-500">{book.authors?.map((a) => a.name).join(", ")}</p>
                <p className="mt-2 text-sm text-primary-700">💡 {reason}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
