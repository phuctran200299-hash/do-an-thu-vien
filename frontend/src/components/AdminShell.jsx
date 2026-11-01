import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, ExternalLink, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getBorrowSummaryApi } from "../api/borrows";
import { Avatar } from "./admin/ui";
import { BackToTop, PageTransition } from "./Motion";

const ROLE_LABEL = { admin: "Quản trị viên", staff: "Nhân viên thư viện", reader: "Độc giả" };

function SidebarContent({ sections, brand, pending, user, onLogout, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-6 pb-6 pt-7">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 text-white shadow-lg shadow-primary-900/40">
          <BookOpen size={20} />
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold text-white">Thư Viện Thông Minh</p>
          <p className="text-[11px] font-medium text-indigo-200/60">{brand}</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200/40">{section.title}</p>
            <div className="space-y-1">
              {section.links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} onClick={onNavigate} className="group relative block">
                  {({ isActive }) => (
                    <span
                      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive ? "text-white" : "text-indigo-100/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600/90 to-primary-500/60 shadow-lg shadow-primary-900/30"
                          transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        />
                      )}
                      <l.icon size={18} className="relative shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className="relative flex-1">{l.label}</span>
                      {l.badgeKey === "pending" && pending > 0 && (
                        <span className="relative rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950">
                          {pending}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="m-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name || "?"} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-indigo-200/60">{ROLE_LABEL[user?.role?.name] || ""}</p>
          </div>
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="rounded-lg p-2 text-indigo-200/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ sections, roleLabel, brand }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(0);
  const [drawer, setDrawer] = useState(false);

  // số yêu cầu mượn đang chờ duyệt, hiển thị thành huy hiệu trên menu
  useEffect(() => {
    getBorrowSummaryApi()
      .then((res) => setPending(res.data.cho_xac_nhan))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const allLinks = sections.flatMap((s) => s.links);
  const current =
    allLinks.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to))) || allLinks[0];
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  const sidebarProps = { sections, brand, pending, user, onLogout: handleLogout };

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      {/* ============ Sidebar (máy tính) ============ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 bg-gradient-to-b from-[#0f1535] via-[#141b45] to-[#1b1550] lg:block">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ============ Sidebar dạng ngăn kéo (điện thoại) ============ */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#0f1535] via-[#141b45] to-[#1b1550] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <SidebarContent {...sidebarProps} onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============ Cột nội dung ============ */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setDrawer(true)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Mở menu"
              >
                {drawer ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-400">
                  {roleLabel} <span className="mx-1">/</span>
                  <span className="text-gray-600">{current?.label}</span>
                </p>
                <p className="truncate text-base font-bold text-gray-900">{current?.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium capitalize text-gray-600 md:flex">
                <CalendarDays size={15} /> {today}
              </span>
              <Link to="/" className="hidden items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-primary-300 hover:text-primary-700 sm:flex">
                <ExternalLink size={14} /> Trang khách
              </Link>
              <Avatar name={user?.name || "?"} size={36} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-7 sm:px-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <BackToTop />

        <footer className="px-8 py-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Thư Viện Thông Minh — Khu vực quản trị nội bộ.
        </footer>
      </div>
    </div>
  );
}
