// Bìa sách tự sinh khi sách chưa có ảnh: màu theo thể loại, có gáy sách và tia sáng lướt qua khi hover.
const PALETTES = [
  ["#1d41d6", "#6096fa"],
  ["#c22fa3", "#f5a8e8"],
  ["#0f766e", "#5eead4"],
  ["#b45309", "#fcd34d"],
  ["#7c3aed", "#c4b5fd"],
  ["#be123c", "#fda4af"],
  ["#0369a1", "#7dd3fc"],
  ["#15803d", "#86efac"],
  ["#9a3412", "#fdba74"],
  ["#334155", "#94a3b8"],
  ["#4338ca", "#a5b4fc"],
  ["#a21caf", "#f0abfc"],
];

function paletteFor(book) {
  const key = book.category_id ?? book.id ?? 0;
  return PALETTES[Math.abs(Number(key)) % PALETTES.length];
}

export default function BookCover({ book, size = "md", className = "" }) {
  if (book.cover_image) {
    return (
      <img
        src={book.cover_image}
        alt={book.title}
        loading="lazy"
        className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${className}`}
      />
    );
  }

  const [from, to] = paletteFor(book);
  const author = book.authors?.[0]?.name;
  const titleSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-[9px]" : "text-sm";

  return (
    <div
      className={`book-cover relative flex h-full w-full flex-col justify-between overflow-hidden p-[12%] text-white transition-transform duration-500 ease-out group-hover:scale-105 ${className}`}
      style={{ backgroundImage: `linear-gradient(140deg, ${from} 0%, ${to} 100%)` }}
    >
      <span className="absolute inset-y-0 left-0 w-[7%] bg-black/20 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.25)]" />
      <span className="absolute -right-[20%] -top-[15%] h-[55%] w-[70%] rounded-full bg-white/15 blur-sm" />
      <span className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[60%] rounded-full bg-black/10" />
      <span className="book-cover-shine" />

      {size !== "sm" && (
        <span
          className={`relative block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 ${
            size === "lg" ? "" : "pr-[42%]"
          }`}
        >
          {book.category?.name || "Thư viện"}
        </span>
      )}
      <p className={`relative line-clamp-4 font-extrabold leading-tight drop-shadow ${titleSize}`}>{book.title}</p>
      {size !== "sm" && (
        <span className="relative line-clamp-1 border-t border-white/30 pt-1.5 text-[11px] font-medium text-white/85">
          {author || "Chưa rõ tác giả"}
        </span>
      )}
    </div>
  );
}
