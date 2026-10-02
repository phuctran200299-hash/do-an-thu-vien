import AdminShell from "../../components/AdminShell";

const links = [
  { to: "/quan-tri", label: "Tổng quan", end: true, icon: "📊" },
  { to: "/quan-tri/sach", label: "Quản lý sách", icon: "📚" },
  { to: "/quan-tri/tac-gia", label: "Quản lý tác giả", icon: "✍️" },
  { to: "/quan-tri/the-loai", label: "Quản lý thể loại", icon: "🏷️" },
  { to: "/quan-tri/danh-gia", label: "Quản lý đánh giá", icon: "⭐" },
  { to: "/quan-tri/nguoi-dung", label: "Quản lý tài khoản", icon: "👤" },
  { to: "/nhan-vien/muon-tra", label: "Nghiệp vụ mượn - trả", icon: "🔁" },
];

export default function AdminLayout() {
  return <AdminShell links={links} roleLabel="Bảng điều khiển Quản trị viên" brand="Khu vực Quản trị" />;
}
