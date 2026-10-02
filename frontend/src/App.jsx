import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import BookList from "./pages/BookList";
import BookDetail from "./pages/BookDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AiSearch from "./pages/AiSearch";

import MyAccount from "./pages/reader/MyAccount";
import MyBorrows from "./pages/reader/MyBorrows";
import Favorites from "./pages/reader/Favorites";
import MyReservations from "./pages/reader/MyReservations";

import StaffLayout from "./pages/staff/StaffLayout";
import BorrowManagement from "./pages/staff/BorrowManagement";
import BookStatus from "./pages/staff/BookStatus";
import PaymentsAndFines from "./pages/staff/PaymentsAndFines";
import ReservationQueue from "./pages/staff/ReservationQueue";
import UserLookup from "./pages/staff/UserLookup";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminAuthors from "./pages/admin/AdminAuthors";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";

export default function App() {
  return (
    <Routes>
      {/* ============ Site khách (có navbar + footer) ============ */}
      <Route element={<Layout />}>
        {/* Công khai */}
        <Route path="/" element={<Home />} />
        <Route path="/sach" element={<BookList />} />
        <Route path="/sach/:id" element={<BookDetail />} />
        <Route path="/tim-kiem-ai" element={<AiSearch />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />

        {/* Độc giả */}
        <Route
          path="/tai-khoan"
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sach-cua-toi"
          element={
            <ProtectedRoute roles={["reader"]}>
              <MyBorrows />
            </ProtectedRoute>
          }
        />
        <Route
          path="/yeu-thich"
          element={
            <ProtectedRoute roles={["reader"]}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dat-truoc-cua-toi"
          element={
            <ProtectedRoute roles={["reader"]}>
              <MyReservations />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<p className="text-center text-gray-500">Không tìm thấy trang.</p>} />
      </Route>

      {/* ============ Khu vực Nhân viên (shell quản trị riêng, không navbar/footer client) ============ */}
      <Route
        path="/nhan-vien"
        element={
          <ProtectedRoute roles={["staff", "admin"]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route path="muon-tra" element={<BorrowManagement />} />
        <Route path="tinh-trang-sach" element={<BookStatus />} />
        <Route path="giao-dich" element={<PaymentsAndFines />} />
        <Route path="dat-truoc" element={<ReservationQueue />} />
        <Route path="doc-gia" element={<UserLookup />} />
      </Route>

      {/* ============ Khu vực Admin (shell quản trị riêng, không navbar/footer client) ============ */}
      <Route
        path="/quan-tri"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="sach" element={<AdminBooks />} />
        <Route path="tac-gia" element={<AdminAuthors />} />
        <Route path="the-loai" element={<AdminCategories />} />
        <Route path="danh-gia" element={<AdminReviews />} />
        <Route path="nguoi-dung" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}
