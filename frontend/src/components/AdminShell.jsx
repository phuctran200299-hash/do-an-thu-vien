import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminShell({ links, roleLabel, brand }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ============ Sidebar ============ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-800/60 bg-gray-900 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 px-5 py-5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-lg shadow-soft">
            📚
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold">Thư Viện Thông Minh</p>
            <p className="text-[11px] font-medium text-gray-400">{brand}</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-soft"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            <span>↩</span> Về trang khách
          </Link>
        </div>
      </aside>

      {/* ============ Main column ============ */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white">
              📚
            </span>
            <span className="text-sm font-bold text-gray-900">{brand}</span>
          </div>
          <span className="hidden text-sm font-medium text-gray-500 lg:block">{roleLabel}</span>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-gray-100 py-1 pl-1 pr-3 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-outline !px-3 !py-2 text-sm">
              Đăng xuất
            </button>
          </div>
        </header>

        {/* mobile nav pills (khi không có sidebar) */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2 lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-gray-500"
                }`
              }
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>

        <footer className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Thư Viện Thông Minh — Khu vực quản trị nội bộ.
        </footer>
      </div>
    </div>
  );
}
