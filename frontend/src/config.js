// Thông tin liên hệ hiển thị trên website. Có thể ghi đè bằng biến môi trường trong frontend/.env:
//   VITE_ZALO_PHONE=09xxxxxxxx
//   VITE_HOTLINE=09xxxxxxxx
export const CONTACT = {
  zaloPhone: import.meta.env.VITE_ZALO_PHONE || "0987654321",
  hotline: import.meta.env.VITE_HOTLINE || "0987654321",
};
