import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (e2) {
      setError(e2.response?.data?.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-3xl shadow-card md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-10 text-white md:flex"
      >
        <div className="blob -left-10 -top-10 h-52 w-52 bg-accent-400" />
        <div className="blob -bottom-16 -right-10 h-60 w-60 bg-primary-300 [animation-delay:-3s]" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg backdrop-blur">
              📚
            </span>
            Thư Viện Thông Minh
          </Link>
          <h2 className="mt-12 text-3xl font-extrabold leading-snug">
            Chào mừng trở lại! <br /> Tiếp tục hành trình đọc sách của bạn.
          </h2>
          <p className="mt-4 max-w-xs text-sm text-primary-100/80">
            Theo dõi sách đang mượn, khám phá gợi ý AI cá nhân hoá và quản lý danh sách yêu thích chỉ trong một nơi.
          </p>
        </div>
        <span className="relative text-6xl opacity-30 animate-float">🤖</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white p-8 sm:p-10"
      >
        <h1 className="text-2xl font-extrabold text-gray-900">Đăng nhập</h1>
        <p className="mt-1 text-sm text-gray-500">Nhập thông tin tài khoản để tiếp tục.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </motion.p>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Mật khẩu</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link to="/dang-ky" className="font-semibold text-primary-600 hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-2 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-500">
            <p className="font-semibold text-gray-600">Tài khoản demo:</p>
            <p>Admin: admin@thuvien.vn / admin123</p>
            <p>Nhân viên: nhanvien@thuvien.vn / staff123</p>
            <p>Độc giả: docgia@thuvien.vn / reader123</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
