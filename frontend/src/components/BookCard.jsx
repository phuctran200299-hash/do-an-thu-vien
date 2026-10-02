import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  const authors = book.authors?.map((a) => a.name).join(", ") || "Chưa rõ tác giả";
  const outOfStock = book.available_quantity <= 0;

  return (
    <Link
      to={`/sach/${book.id}`}
      className="card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary-50 to-accent-50">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            📖
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute bottom-2 left-2 translate-y-2 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Xem chi tiết →
        </span>

        {outOfStock ? (
          <span className="badge absolute right-2 top-2 bg-red-500/90 text-white shadow-soft">Hết sách</span>
        ) : (
          <span className="badge absolute right-2 top-2 bg-emerald-500/90 text-white shadow-soft">Còn sách</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-primary-700">
          {book.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-gray-500">{authors}</p>
        <div className="mt-auto flex items-center justify-between pt-2.5">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            ★ {Number(book.avg_rating || 0).toFixed(1)}
          </span>
          {Number(book.borrow_fee) > 0 ? (
            <span className="badge bg-sunset-400/10 text-sunset-500">
              {Number(book.borrow_fee).toLocaleString("vi-VN")}đ
            </span>
          ) : (
            <span className="badge bg-primary-50 text-primary-600">Miễn phí</span>
          )}
        </div>
      </div>
    </Link>
  );
}
