import { useEffect, useState } from "react";
import BookCard from "../../components/BookCard";
import { getFavoritesApi, removeFavoriteApi } from "../../api/favorites";

export default function Favorites() {
  const [favorites, setFavorites] = useState(null);

  const load = () => {
    getFavoritesApi().then((res) => setFavorites(res.data.favorites));
  };

  useEffect(load, []);

  const handleRemove = async (bookId) => {
    await removeFavoriteApi(bookId);
    load();
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Sách yêu thích</h1>

      {!favorites && <p className="text-gray-500">Đang tải...</p>}

      {favorites && favorites.length === 0 && <p className="text-gray-500">Bạn chưa có sách yêu thích nào.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {favorites?.map((f) => (
          <div key={f.id} className="relative">
            <BookCard book={f.book} />
            <button
              onClick={() => handleRemove(f.book_id)}
              className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow hover:bg-white"
            >
              ✕ Bỏ thích
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
