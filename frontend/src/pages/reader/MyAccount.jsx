import { useState } from "react";
import { changePasswordApi, updateProfileApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function MyAccount() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);

  const submitProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);
    try {
      await updateProfileApi(profileForm);
      await refreshUser();
      setProfileMsg("Cập nhật thông tin thành công.");
    } catch (e2) {
      setProfileErr(e2.response?.data?.message || "Không thể cập nhật thông tin.");
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordErr(null);
    try {
      await changePasswordApi(passwordForm);
      setPasswordMsg("Đổi mật khẩu thành công.");
      setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (e2) {
      setPasswordErr(e2.response?.data?.message || "Không thể đổi mật khẩu.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Tài khoản của tôi</h1>

      <form onSubmit={submitProfile} className="card space-y-4 p-6">
        <h2 className="font-semibold text-gray-800">Thông tin cá nhân</h2>
        {profileMsg && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{profileMsg}</p>}
        {profileErr && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{profileErr}</p>}

        <div>
          <label className="label">Họ và tên</label>
          <input
            className="input"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-gray-100" value={user?.email} disabled />
        </div>
        <div>
          <label className="label">Số điện thoại</label>
          <input
            className="input"
            value={profileForm.phone || ""}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Địa chỉ</label>
          <input
            className="input"
            value={profileForm.address || ""}
            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-primary">
          Lưu thay đổi
        </button>
      </form>

      <form onSubmit={submitPassword} className="card space-y-4 p-6">
        <h2 className="font-semibold text-gray-800">Đổi mật khẩu</h2>
        {passwordMsg && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{passwordMsg}</p>}
        {passwordErr && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{passwordErr}</p>}

        <div>
          <label className="label">Mật khẩu hiện tại</label>
          <input
            type="password"
            className="input"
            required
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Mật khẩu mới</label>
          <input
            type="password"
            className="input"
            required
            minLength={6}
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Nhập lại mật khẩu mới</label>
          <input
            type="password"
            className="input"
            required
            value={passwordForm.new_password_confirmation}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-primary">
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}
