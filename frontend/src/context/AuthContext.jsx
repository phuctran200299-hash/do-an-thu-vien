import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, logoutApi, meApi, registerApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    meApi()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await registerApi(data);
    return res.data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // bỏ qua lỗi khi token đã hết hạn
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await meApi();
    setUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  };

  const roleName = user?.role?.name || null;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    role: roleName,
    isAdmin: roleName === "admin",
    isStaff: roleName === "staff",
    isReader: roleName === "reader",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}
