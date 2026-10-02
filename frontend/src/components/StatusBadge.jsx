const STATUS_MAP = {
  cho_xac_nhan: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800" },
  dang_muon: { label: "Đang mượn", className: "bg-blue-100 text-blue-800" },
  da_tra: { label: "Đã trả", className: "bg-green-100 text-green-800" },
  qua_han: { label: "Quá hạn", className: "bg-red-100 text-red-800" },
  da_huy: { label: "Đã huỷ", className: "bg-gray-100 text-gray-600" },
};

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return <span className={`badge ${info.className}`}>{info.label}</span>;
}
