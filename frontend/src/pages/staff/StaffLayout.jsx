import { BookCheck, CreditCard, Hourglass, LayoutDashboard, Repeat, UserSearch } from "lucide-react";
import AdminShell from "../../components/AdminShell";
import { useAuth } from "../../context/AuthContext";

const workLinks = [
  { to: "/nhan-vien/muon-tra", label: "Xử lý mượn - trả", icon: Repeat, badgeKey: "pending" },
  { to: "/nhan-vien/dat-truoc", label: "Hàng chờ đặt trước", icon: Hourglass },
  { to: "/nhan-vien/giao-dich", label: "Giao dịch & phí phạt", icon: CreditCard },
];

const lookupLinks = [
  { to: "/nhan-vien/tinh-trang-sach", label: "Tình trạng sách", icon: BookCheck },
  { to: "/nhan-vien/doc-gia", label: "Tra cứu độc giả", icon: UserSearch },
];

export default function StaffLayout() {
  const { isAdmin } = useAuth();

  const sections = [
    { title: "Nghiệp vụ", links: workLinks },
    { title: "Tra cứu", links: lookupLinks },
    ...(isAdmin ? [{ title: "Quản trị", links: [{ to: "/quan-tri", label: "Về Bảng điều khiển", end: true, icon: LayoutDashboard }] }] : []),
  ];

  return <AdminShell sections={sections} roleLabel="Nhân viên" brand="Nghiệp vụ thư viện" />;
}
