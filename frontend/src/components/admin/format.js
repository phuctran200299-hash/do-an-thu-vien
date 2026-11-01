// Định dạng tiền và ngày giờ theo chuẩn Việt Nam
export const money = (v) => `${Number(v || 0).toLocaleString("vi-VN")}đ`;
export const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");
export const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
