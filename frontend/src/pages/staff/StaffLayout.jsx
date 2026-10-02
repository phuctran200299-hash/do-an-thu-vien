import AdminShell from "../../components/AdminShell";
import { useAuth } from "../../context/AuthContext";

const baseLinks = [
  { to: "/nhan-vien/muon-tra", label: "Xử lý mượn - trả", icon: "🔁" },
  { to: "/nhan-vien/tinh-trang-sach", label: "Tình trạng sách", icon: "📗" },
  { to: "/nhan-vien/giao-dich", label: "Giao dịch & phí phạt", icon: "💳" },
  { to: "/nhan-vien/dat-truoc", label: "Hàng chờ đặt trước", icon: "⏳" },
  { to: "/nhan-vien/doc-gia", label: "Tra cứu độc giả", icon: "🔍" },
];

export default function StaffLayout() {
  const { isAdmin } = useAuth();

  const links = isAdmin ? [...baseLinks, { to: "/quan-tri", label: "Về trang Quản trị", icon: "⚙️" }] : baseLinks;

  return <AdminShell links={links} roleLabel="Khu vực Nhân viên thư viện" brand="Nghiệp vụ thư viện" />;
}
