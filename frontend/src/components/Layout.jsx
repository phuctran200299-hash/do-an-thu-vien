import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

function NavItem({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}>
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "glass shadow-soft" : "border-b border-transparent bg-white/90 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="group flex items-center gap-2.5 text-lg font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-lg shadow-soft transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
              📚
            </span>
            <span>
              Thư Viện <span className="text-gradient">Thông Minh</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/">Trang chủ</NavItem>
            <NavItem to="/sach">Danh sách sách</NavItem>
            <NavItem to="/tim-kiem-ai">🤖 Hỏi AI</NavItem>
            {isAuthenticated && !isAdmin && !isStaff && (
              <>
                <NavItem to="/sach-cua-toi">Sách của tôi</NavItem>
                <NavItem to="/yeu-thich">Yêu thích</NavItem>
                <NavItem to="/dat-truoc-cua-toi">Đặt trước</NavItem>
              </>
            )}
            {(isStaff || isAdmin) && <NavItem to="/nhan-vien/muon-tra">Nghiệp vụ thư viện</NavItem>}
            {isAdmin && <NavItem to="/quan-tri">Quản trị</NavItem>}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/tai-khoan"
                  className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-gray-600 transition hover:bg-gray-100 sm:flex"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                  <span className="font-medium">{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-outline !px-3 !py-2">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/dang-nhap" className="btn-outline !px-3 !py-2">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="btn-primary !px-3 !py-2">
                  Đăng ký
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Mở menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            mobileOpen ? "max-h-96 border-t border-gray-100" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            <NavItem to="/">Trang chủ</NavItem>
            <NavItem to="/sach">Danh sách sách</NavItem>
            <NavItem to="/tim-kiem-ai">🤖 Hỏi AI</NavItem>
            {isAuthenticated && !isAdmin && !isStaff && (
              <>
                <NavItem to="/sach-cua-toi">Sách của tôi</NavItem>
                <NavItem to="/yeu-thich">Yêu thích</NavItem>
                <NavItem to="/dat-truoc-cua-toi">Đặt trước</NavItem>
              </>
            )}
            {(isStaff || isAdmin) && <NavItem to="/nhan-vien/muon-tra">Nghiệp vụ thư viện</NavItem>}
            {isAdmin && <NavItem to="/quan-tri">Quản trị</NavItem>}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
