import { Pill } from "./admin/ui";

const STATUS_MAP = {
  cho_xac_nhan: { label: "Chờ xác nhận", tone: "yellow" },
  dang_muon: { label: "Đang mượn", tone: "blue" },
  da_tra: { label: "Đã trả", tone: "green" },
  qua_han: { label: "Quá hạn", tone: "red" },
  da_huy: { label: "Đã huỷ", tone: "gray" },
};

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, tone: "gray" };
  const pill = <Pill tone={info.tone}>{info.label}</Pill>;
  return status === "qua_han" ? <span className="badge-attention inline-flex rounded-full">{pill}</span> : pill;
}
