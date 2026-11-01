import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";

const AUTOPLAY_MS = 6000;
const AI_SAMPLES = ["Sách giúp quản lý tài chính", "Tiểu thuyết trinh thám hay", "Sách lập trình cho người mới"];

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
};

function IntroSlide({ stats, covers }) {
  return (
    <div className="grid h-full items-center gap-8 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 px-6 py-12 sm:px-12 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur">
          <Sparkles size={14} /> Trải nghiệm đọc sách thế hệ mới
        </span>
        <h1 className="max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Hệ thống Quản lý Thư viện <span className="text-white/90">Sách Thông minh</span>
        </h1>
        <p className="mt-4 max-w-lg text-base text-primary-50/90 sm:text-lg">
          Tra cứu, mượn sách và nhận gợi ý từ AI. Hơn {stats?.totalBooks ?? 100} đầu sách thuộc {stats?.totalCategories ?? 12} thể loại đang chờ bạn khám phá.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/sach" className="btn bg-white text-primary-700 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover">
            Khám phá sách ngay <ArrowRight size={16} />
          </Link>
          <Link to="/tim-kiem-ai" className="btn border-2 border-white/60 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/10">
            <Bot size={16} /> Hỏi AI tìm sách
          </Link>
        </div>
        {stats && (
          <div className="mt-10 hidden flex-wrap gap-8 border-t border-white/20 pt-6 sm:flex">
            {[
              [`${stats.totalBooks}+`, "Đầu sách"],
              [stats.totalCategories, "Thể loại"],
              ["24/7", "Truy cập mọi lúc"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-extrabold">{v}</p>
                <p className="text-sm text-primary-100/80">{l}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative hidden h-80 lg:block">
        {covers.slice(0, 3).map((b, i) => (
          <motion.img
            key={b.id}
            src={b.cover_image}
            alt={b.title}
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: [-12, 0, 12][i] }}
            transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 120, damping: 14 }}
            whileHover={{ y: -14, rotate: 0, zIndex: 10, scale: 1.05 }}
            className="absolute top-4 h-72 w-48 rounded-xl object-cover shadow-2xl ring-4 ring-white/20"
            style={{ left: `${10 + i * 22}%`, zIndex: i === 1 ? 3 : 1 }}
          />
        ))}
      </div>
    </div>
  );
}

function BookSlide({ book }) {
  const authors = book.authors?.map((a) => a.name).join(", ");
  const inStock = book.available_quantity > 0;
  return (
    <div className="relative h-full overflow-hidden bg-gray-900">
      <img src={book.cover_image} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/80 to-gray-900/30" />
      <div className="relative grid h-full items-center gap-8 px-6 py-12 sm:px-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
            <Star size={13} fill="currentColor" /> Sách nổi bật
          </span>
          {book.category && <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">{book.category.name}</p>}
          <h2 className="mt-1 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">{book.title}</h2>
          {authors && <p className="mt-2 text-lg text-white/80">{authors}</p>}
          <p className="mt-4 line-clamp-3 max-w-lg text-white/70">{book.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Star size={15} fill="currentColor" /> {Number(book.avg_rating || 0).toFixed(1)}
            </span>
            <span className="text-white/30">•</span>
            <span className={inStock ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>
              {inStock ? `Còn ${book.available_quantity} bản` : "Hết sách - nhận đặt trước"}
            </span>
            <span className="text-white/30">•</span>
            <span className="font-semibold text-white/80">
              {Number(book.borrow_fee) > 0 ? `${Number(book.borrow_fee).toLocaleString("vi-VN")}đ / lượt` : "Mượn miễn phí"}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={`/sach/${book.id}`} className="btn bg-white text-gray-900 shadow-card hover:-translate-y-0.5">
              {inStock ? "Mượn ngay" : "Đặt trước"} <ArrowRight size={16} />
            </Link>
            <Link to={`/sach/${book.id}`} className="btn border-2 border-white/40 text-white hover:bg-white/10">
              Xem chi tiết
            </Link>
          </div>
        </div>
        <div className="hidden justify-center lg:flex">
          <motion.img
            src={book.cover_image}
            alt={book.title}
            initial={{ opacity: 0, rotateY: -30, x: 40 }}
            animate={{ opacity: 1, rotateY: -12, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ rotateY: 0, scale: 1.04 }}
            style={{ transformPerspective: 900 }}
            className="h-80 w-56 rounded-xl object-cover shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/20"
          />
        </div>
      </div>
    </div>
  );
}

function AiSlide() {
  return (
    <div className="relative grid h-full items-center overflow-hidden bg-gradient-to-br from-[#141b45] via-violet-800 to-fuchsia-700 px-6 py-12 sm:px-12 lg:grid-cols-[1.3fr_1fr]">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:32px_32px] opacity-20" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
          <Bot size={14} /> Trợ lý AI
        </span>
        <h2 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">Chưa biết đọc gì? Cứ hỏi AI!</h2>
        <p className="mt-4 max-w-lg text-white/75">
          Mô tả nhu cầu bằng ngôn ngữ tự nhiên, có dấu hay không dấu đều được. Trợ lý sẽ gợi ý ngay những cuốn phù hợp kèm lý do.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {AI_SAMPLES.map((s) => (
            <Link key={s} to={`/tim-kiem-ai?q=${encodeURIComponent(s)}`} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white hover:text-violet-800">
              “{s}”
            </Link>
          ))}
        </div>
      </div>
      <div className="relative hidden justify-center lg:flex">
        <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative">
          <div className="absolute inset-0 rounded-full bg-fuchsia-400 opacity-40 blur-3xl" />
          <div className="relative flex h-44 w-44 items-center justify-center rounded-[2.5rem] bg-white/15 shadow-2xl ring-1 ring-white/30 backdrop-blur-xl">
            <Bot size={88} strokeWidth={1.4} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function HeroSlider({ stats, featured = [] }) {
  // chỉ đưa lên slider những sách đang được cung cấp và có ảnh bìa
  const withCover = featured.filter((b) => b.cover_image && b.status === "available");
  const slides = [
    { key: "intro", render: () => <IntroSlide stats={stats} covers={withCover} /> },
    ...withCover.slice(0, 3).map((b) => ({ key: `book-${b.id}`, render: () => <BookSlide book={b} /> })),
    { key: "ai", render: () => <AiSlide /> },
  ];

  const [[index, dir], setState] = useState([0, 1]);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const current = ((index % count) + count) % count;

  const go = useCallback((step) => setState(([i]) => [i + step, step]), []);
  const goTo = (i) => setState([i, i > current ? 1 : -1]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, count, go]);

  return (
    <section
      className="relative mb-16 h-[560px] overflow-hidden rounded-3xl text-white shadow-card sm:h-[500px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={slides[current].key}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(1);
            else if (info.offset.x > 80) go(-1);
          }}
          className="absolute inset-0"
        >
          {slides[current].render()}
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Slide trước"
            className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30 sm:flex"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Slide sau"
            className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30 sm:flex"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                onClick={() => goTo(i)}
                aria-label={`Chuyển tới slide ${i + 1}`}
                className={`relative h-2 overflow-hidden rounded-full bg-white/30 transition-all duration-300 ${i === current ? "w-10" : "w-2 hover:bg-white/60"}`}
              >
                {i === current && (
                  <motion.span
                    key={`${index}-${paused}`}
                    className="absolute inset-y-0 left-0 bg-white"
                    initial={{ width: paused ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
