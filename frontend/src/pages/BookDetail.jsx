import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookApi, getReviewsApi, createReviewApi } from "../api/books";
import { createBorrowRequestApi } from "../api/borrows";
import { payBorrowApi } from "../api/payments";
import { addFavoriteApi, getFavoritesApi, removeFavoriteApi } from "../api/favorites";
import { createReservationApi } from "../api/reservations";
import { aiSimilarApi } from "../api/ai";
import { motion } from "framer-motion";
import BookCard from "../components/BookCard";
import BookCover from "../components/BookCover";
import { useAuth } from "../context/AuthContext";

export default function BookDetail() {
  const { id } = useParams();
  const { isAuthenticated, isReader, isAdmin, isStaff } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [pendingPayment, setPendingPayment] = useState(null); // { borrowRecordId, amount }

  const load = () => {
    getBookApi(id).then((res) => setBook(res.data.book));
    getReviewsApi(id).then((res) => setReviews(res.data.reviews));
    aiSimilarApi(id).then((res) => setSimilar(res.data.results));
    if (isAuthenticated && isReader) {
      getFavoritesApi().then((res) => {
        setIsFavorite(res.data.favorites.some((f) => f.book_id === Number(id)));
      });
    }
  };

  useEffect(() => {
    load();
    setPendingPayment(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBorrow = async () => {
    setMessage(null);
    setError(null);
    try {
      const res = await createBorrowRequestApi(Number(id));
      setMessage(res.data.message);
      const record = res.data.borrow_record;
      const unpaid = record.payments?.find((p) => p.payment_status === "pending");
      if (unpaid) {
        setPendingPayment({ borrowRecordId: record.id, amount: unpaid.amount });
      }
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handlePay = async () => {
    if (!pendingPayment) return;
    try {
      await payBorrowApi(pendingPayment.borrowRecordId);
      setMessage("Thanh toán thành công! Yêu cầu mượn sách sẽ được nhân viên xác nhận.");
      setPendingPayment(null);
    } catch (e) {
      setError(e.response?.data?.message || "Thanh toán thất bại.");
    }
  };

  const handleReserve = async () => {
    setMessage(null);
    setError(null);
    try {
      const res = await createReservationApi(Number(id));
      setMessage(res.data.message);
    } catch (e) {
      setError(e.response?.data?.message || "Không thể đặt trước sách này.");
    }
  };

  const toggleFavorite = async () => {
    if (isFavorite) {
      await removeFavoriteApi(id);
      setIsFavorite(false);
    } else {
      await addFavoriteApi(Number(id));
      setIsFavorite(true);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createReviewApi(id, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (e2) {
      setError(e2.response?.data?.message || "Không thể gửi đánh giá.");
    }
  };

  if (!book) return <p className="text-gray-500">Đang tải...</p>;

  const authors = book.authors?.map((a) => a.name).join(", ") || "Chưa rõ tác giả";
  const inStock = book.available_quantity > 0;
  const showReaderActions = isAuthenticated && !isAdmin && !isStaff;

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <motion.div
            className="book-3d group aspect-[3/4] overflow-hidden rounded-lg shadow-card-hover"
            initial={{ opacity: 0, rotateY: -25, x: -30 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <BookCover book={book} size="lg" />
          </motion.div>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-primary-600">{book.category?.name}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{book.title}</h1>
          <p className="mt-1 text-gray-500">Tác giả: {authors}</p>
          <p className="mt-1 text-yellow-600">★ {Number(book.avg_rating || 0).toFixed(1)} / 5</p>

          <p className="mt-4 whitespace-pre-line text-gray-700">{book.description || "Chưa có mô tả."}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              Tình trạng:{" "}
              {inStock ? (
                <span className="font-medium text-green-600">Còn {book.available_quantity} bản</span>
              ) : (
                <span className="font-medium text-red-600">Hết sách</span>
              )}
            </span>
            {Number(book.borrow_fee) > 0 && (
              <span>
                Phí mượn: <span className="font-medium text-primary-600">{Number(book.borrow_fee).toLocaleString("vi-VN")}đ</span>
              </span>
            )}
          </div>

          {message && <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {pendingPayment && (
            <div className="mt-4 flex items-center justify-between rounded-md border border-primary-200 bg-primary-50 p-3">
              <span className="text-sm text-primary-800">
                Cần thanh toán <strong>{Number(pendingPayment.amount).toLocaleString("vi-VN")}đ</strong> để hoàn tất yêu cầu mượn.
              </span>
              <button onClick={handlePay} className="btn-primary">
                Thanh toán ngay
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {!isAuthenticated && (
              <Link to="/dang-nhap" className="btn-primary">
                Đăng nhập để mượn sách
              </Link>
            )}
            {showReaderActions && inStock && (
              <button className="btn-primary" onClick={handleBorrow}>
                Đăng ký mượn
              </button>
            )}
            {showReaderActions && !inStock && (
              <button className="btn-primary" onClick={handleReserve}>
                Đặt trước sách
              </button>
            )}
            {showReaderActions && (
              <button className="btn-outline" onClick={toggleFavorite}>
                {isFavorite ? "♥ Bỏ yêu thích" : "♡ Thêm yêu thích"}
              </button>
            )}
          </div>

          <section className="mt-10">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Đánh giá từ độc giả ({reviews.length})</h2>

            {showReaderActions && (
              <form onSubmit={submitReview} className="mb-6 card p-4">
                <label className="label">Đánh giá của bạn</label>
                <div className="mb-3 flex items-center gap-3">
                  <select
                    className="input w-24"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} sao
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="input mb-3"
                  rows={3}
                  placeholder="Viết nhận xét của bạn về cuốn sách này..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                <button type="submit" className="btn-primary">
                  Gửi đánh giá
                </button>
              </form>
            )}

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{r.user?.name}</span>
                    <span className="text-yellow-600">{"★".repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-gray-500">Chưa có đánh giá nào cho sách này.</p>}
            </div>
          </section>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-bold text-gray-900">🤖 Sách tương tự</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {similar.map(({ book: b }) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
