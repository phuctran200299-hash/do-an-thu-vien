import { BookCopy, LayoutDashboard, MessageSquareText, PenTool, Repeat, Tags, Users } from "lucide-react";
import AdminShell from "../../components/AdminShell";

const sections = [
  {
    title: "Tổng quan",
    links: [{ to: "/quan-tri", label: "Bảng điều khiển", end: true, icon: LayoutDashboard }],
  },
  {
    title: "Danh mục",
    links: [
      { to: "/quan-tri/sach", label: "Quản lý sách", icon: BookCopy },
      { to: "/quan-tri/tac-gia", label: "Tác giả", icon: PenTool },
      { to: "/quan-tri/the-loai", label: "Thể loại", icon: Tags },
    ],
  },
  {
    title: "Người dùng & nội dung",
    links: [
      { to: "/quan-tri/nguoi-dung", label: "Tài khoản", icon: Users },
      { to: "/quan-tri/danh-gia", label: "Đánh giá", icon: MessageSquareText },
    ],
  },
  {
    title: "Nghiệp vụ",
    links: [{ to: "/nhan-vien/muon-tra", label: "Mượn - trả sách", icon: Repeat, badgeKey: "pending" }],
  },
];

export default function AdminLayout() {
  return <AdminShell sections={sections} roleLabel="Quản trị" brand="Khu vực Quản trị" />;
}
