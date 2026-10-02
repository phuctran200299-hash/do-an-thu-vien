import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate("/dang-nhap");
    } catch (e2) {
      const errors = e2.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0]?.[0] : null;
      setError(firstError || e2.response?.data?.message || "Đăng ký thất bại.");
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
        className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-accent-600 via-primary-600 to-primary-800 p-10 text-white md:flex"
      >
        <div className="blob -left-10 -top-10 h-52 w-52 bg-accent-300" />
        <div className="blob -bottom-16 -right-10 h-60 w-60 bg-primary-300 [animation-delay:-3s]" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg backdrop-blur">
              📚
            </span>
            Thư Viện Thông Minh
          </Link>
          <h2 className="mt-12 text-3xl font-extrabold leading-snug">
            Tham gia cộng đồng đọc sách của chúng tôi ngay hôm nay.
          </h2>
          <p className="mt-4 max-w-xs text-sm text-primary-100/80">
            Miễn phí đăng ký, mượn sách chỉ trong vài bước, nhận gợi ý đọc sách được cá nhân hoá bởi AI.
          </p>
        </div>
        <span className="relative text-6xl opacity-30 animate-float">✨</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white p-8 sm:p-10"
      >
        <h1 className="text-2xl font-extrabold text-gray-900">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-gray-500">Tạo tài khoản độc giả miễn phí chỉ trong 1 phút.</p>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Họ và tên</label>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
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
              <label className="label">Số điện thoại</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Địa chỉ</label>
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Nhập lại mật khẩu</label>
              <input
                type="password"
                required
                className="input"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link to="/dang-nhap" className="font-semibold text-primary-600 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
