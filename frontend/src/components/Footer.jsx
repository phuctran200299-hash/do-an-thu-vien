import { Link } from "react-router-dom";

const linkGroups = [
  {
    title: "Khám phá",
    links: [
      { to: "/", label: "Trang chủ" },
      { to: "/sach", label: "Danh sách sách" },
      { to: "/tim-kiem-ai", label: "Hỏi AI tìm sách" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { to: "/dang-nhap", label: "Đăng nhập" },
      { to: "/dang-ky", label: "Đăng ký" },
      { to: "/tai-khoan", label: "Tài khoản của tôi" },
    ],
  },
  {
    title: "Bạn đọc",
    links: [
      { to: "/sach-cua-toi", label: "Sách của tôi" },
      { to: "/yeu-thich", label: "Sách yêu thích" },
      { to: "/dat-truoc-cua-toi", label: "Đặt trước sách" },
    ],
  },
];

const socials = [
  { label: "Facebook", icon: "f" },
  { label: "YouTube", icon: "▶" },
  { label: "Zalo", icon: "Z" },
  { label: "Email", icon: "@" },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-sunset-500" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-lg shadow-soft">
              📚
            </span>
            <span>
              Thư Viện <span className="text-gradient">Thông Minh</span>
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            Hệ thống quản lý thư viện hiện đại hỗ trợ tra cứu, mượn - trả sách và gợi ý đọc sách bằng AI, giúp việc
            đọc sách trở nên thuận tiện hơn cho mọi độc giả.
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                title={s.label}
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-500 transition-all duration-200 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-br hover:from-primary-500 hover:to-accent-500 hover:text-white hover:shadow-card"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {linkGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">{group.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 transition-colors hover:text-primary-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">Liên hệ</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span>📍</span>
              <span>Trường Đại học Giao thông Vận tải, Hà Nội</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✉️</span>
              <span>thuvien@utc.edu.vn</span>
            </li>
            <li className="flex items-center gap-2">
              <span>☎️</span>
              <span>(024) 3766 8888</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Thư Viện Thông Minh — Đồ án tốt nghiệp, Khoa CNTT.</p>
          <p>Thiết kế &amp; phát triển với ReactJS, Laravel &amp; Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
