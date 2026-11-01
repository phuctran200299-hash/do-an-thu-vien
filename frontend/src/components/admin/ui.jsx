import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Inbox, Search, X } from "lucide-react";

// Bộ thành phần giao diện dùng chung cho khu vực Quản trị & Nhân viên.

const AVATAR_COLORS = [
  "from-sky-500 to-indigo-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-purple-500",
  "from-rose-500 to-red-500",
];

export function PageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-card">
            <Icon size={22} strokeWidth={2.2} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-0.5 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Avatar({ name = "?", size = 36 }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const color = AVATAR_COLORS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} font-bold text-white shadow-sm`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function UserCell({ user }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={user?.name || "?"} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900">{user?.name}</p>
        <p className="truncate text-xs text-gray-500">{user?.email}</p>
      </div>
    </div>
  );
}

export function BookCell({ book, sub }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-primary-100 to-accent-100 shadow-sm ring-1 ring-black/5">
        {book?.cover_image && <img src={book.cover_image} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </span>
      <div className="min-w-0">
        <p className="line-clamp-2 font-semibold text-gray-900">{book?.title}</p>
        {sub && <p className="truncate text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-5 inline-flex flex-wrap gap-1 rounded-2xl border border-gray-200 bg-white p-1 shadow-soft">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              active ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId="admin-tab-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 shadow-soft"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{t.label}</span>
            {t.count !== undefined && (
              <span
                className={`relative min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  active ? "bg-white/25 text-white" : t.tone || "bg-gray-100 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "Tìm kiếm..." }) {
  return (
    <div className="relative w-full max-w-sm">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input className="input !rounded-xl pl-10" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Alert({ message, tone = "info", onClose }) {
  const styles = {
    info: "border-primary-200 bg-primary-50 text-primary-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  };
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="mb-4 overflow-hidden"
        >
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles[tone]}`}>
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{message}</span>
            {onClose && (
              <button onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Đóng">
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Khung bảng dữ liệu: bo góc, đổ bóng, có trạng thái đang tải và rỗng. */
export function DataTable({ head, loading, empty = "Không có dữ liệu.", colSpan, children, footer }) {
  return (
    <div className="admin-table overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>{head}</tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="!animate-none">
                    <td colSpan={colSpan}>
                      <div className="skeleton h-9 w-full" />
                    </td>
                  </tr>
                ))
              : children}
          </tbody>
        </table>
      </div>
      {!loading && empty && Array.isArray(children) && children.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-14 text-gray-400">
          <Inbox size={36} strokeWidth={1.5} />
          <p className="text-sm">{empty}</p>
        </div>
      )}
      {footer}
    </div>
  );
}

/** Phân trang theo đối tượng paginate của Laravel (current_page, last_page, from, to, total). */
export function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) {
    return meta?.total ? (
      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">Tổng cộng {meta.total} bản ghi</div>
    ) : null;
  }
  const { current_page: page, last_page: last } = meta;
  const pages = [];
  for (let p = 1; p <= last; p++) {
    if (p === 1 || p === last || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const btn = "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-semibold transition";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
      <p className="text-xs text-gray-500">
        Hiển thị <b className="text-gray-700">{meta.from}</b>–<b className="text-gray-700">{meta.to}</b> trên{" "}
        <b className="text-gray-700">{meta.total}</b> bản ghi
      </p>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className={`${btn} text-gray-500 hover:bg-gray-100 disabled:opacity-30`}>
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`${btn} ${p === page ? "bg-primary-600 text-white shadow-soft" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {p}
            </button>
          )
        )}
        <button disabled={page === last} onClick={() => onChange(page + 1)} className={`${btn} text-gray-500 hover:bg-gray-100 disabled:opacity-30`}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function Pill({ tone = "gray", dot = true, children }) {
  const tones = {
    gray: "bg-gray-100 text-gray-600 ring-gray-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    yellow: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  const dots = { gray: "bg-gray-400", green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-rose-500", blue: "bg-sky-500", violet: "bg-violet-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
}
