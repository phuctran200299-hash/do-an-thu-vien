import { useCallback, useEffect, useState } from "react";
import { Check, Repeat, RotateCcw, X } from "lucide-react";
import {
  approveBorrowApi,
  getBorrowRequestsApi,
  getBorrowSummaryApi,
  getOverdueBorrowsApi,
  rejectBorrowApi,
  returnBorrowApi,
} from "../../api/borrows";
import StatusBadge from "../../components/StatusBadge";
import { Alert, BookCell, DataTable, PageHeader, Pagination, Pill, SearchBox, Tabs, UserCell } from "../../components/admin/ui";
import { fmtDate, money } from "../../components/admin/format";

const TABS = [
  { value: "cho_xac_nhan", label: "Chờ xác nhận", tone: "bg-amber-100 text-amber-700" },
  { value: "dang_muon", label: "Đang mượn", tone: "bg-sky-100 text-sky-700" },
  { value: "qua_han", label: "Quá hạn", tone: "bg-rose-100 text-rose-700" },
  { value: "da_tra", label: "Đã trả" },
  { value: "da_huy", label: "Đã huỷ" },
];

const fetchList = (status, params) =>
  status === "qua_han" ? getOverdueBorrowsApi(params) : getBorrowRequestsApi({ status, ...params });

export default function BorrowManagement() {
  const [status, setStatus] = useState("cho_xac_nhan");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadCounts = useCallback(() => {
    getBorrowSummaryApi().then((res) => setCounts(res.data));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchList(status, { q: q || undefined, page })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [status, q, page]);

  // tải danh sách trước, số đếm sau (máy chủ phát triển xử lý tuần tự từng request)
  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);
  useEffect(() => {
    const t = setTimeout(loadCounts, 150);
    return () => clearTimeout(t);
  }, [loadCounts]);

  const changeTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  const runAction = async (action, id, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusyId(id);
    try {
      const res = await action(id);
      setAlert({ tone: "success", message: res.data.message });
      load();
      loadCounts();
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Có lỗi xảy ra." });
    } finally {
      setBusyId(null);
    }
  };

  const rows = data?.data || [];

  return (
    <div>
      <PageHeader icon={Repeat} title="Quản lý mượn - trả sách" subtitle="Xác nhận yêu cầu mượn, ghi nhận trả sách và theo dõi các giao dịch quá hạn.">
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tìm độc giả, email hoặc tên sách..."
        />
      </PageHeader>

      <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.value] }))} value={status} onChange={changeTab} />

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      <DataTable
        loading={loading && !data}
        colSpan={5}
        head={
          <>
            <th>Độc giả</th>
            <th>Sách</th>
            <th>Thời hạn</th>
            <th>Trạng thái & thanh toán</th>
            <th className="!text-right">Thao tác</th>
          </>
        }
        footer={<Pagination meta={data} onChange={setPage} />}
      >
        {rows.map((r) => {
          const payment = r.payments?.[r.payments.length - 1];
          const unpaidFine = r.fines?.find((f) => f.status === "unpaid");
          const busy = busyId === r.id;
          return (
            <tr key={r.id}>
              <td>
                <UserCell user={r.user} />
              </td>
              <td className="min-w-[220px]">
                <BookCell book={r.book} sub={Number(r.book?.borrow_fee) > 0 ? `Phí mượn ${money(r.book.borrow_fee)}` : "Miễn phí"} />
              </td>
              <td className="whitespace-nowrap text-xs">
                <p className="text-gray-500">Mượn: {fmtDate(r.borrow_date)}</p>
                <p className={r.status === "qua_han" ? "font-semibold text-rose-600" : "font-medium text-gray-800"}>
                  Hạn: {fmtDate(r.due_date)}
                </p>
                {r.renewed_count > 0 && <p className="text-[11px] text-gray-400">Đã gia hạn</p>}
              </td>
              <td>
                <div className="flex flex-col items-start gap-1">
                  <StatusBadge status={r.status} />
                  {payment && (
                    <Pill tone={payment.payment_status === "paid" ? "green" : payment.payment_status === "failed" ? "gray" : "yellow"}>
                      {payment.payment_status === "paid" ? "Đã thanh toán" : payment.payment_status === "failed" ? "Đã huỷ thanh toán" : "Chờ thanh toán"}
                    </Pill>
                  )}
                  {unpaidFine && <Pill tone="red">Phạt {money(unpaidFine.amount)}</Pill>}
                </div>
              </td>
              <td>
                <div className="flex flex-col items-end gap-1.5 2xl:flex-row 2xl:justify-end">
                  {r.status === "cho_xac_nhan" && (
                    <>
                      <button
                        disabled={busy}
                        onClick={() => runAction(approveBorrowApi, r.id)}
                        className="act-success"
                        title={payment && payment.payment_status !== "paid" ? "Độc giả chưa thanh toán phí mượn" : undefined}
                      >
                        <Check size={14} /> Duyệt
                      </button>
                      <button disabled={busy} onClick={() => runAction(rejectBorrowApi, r.id, "Từ chối yêu cầu mượn này?")} className="act-danger">
                        <X size={14} /> Từ chối
                      </button>
                    </>
                  )}
                  {(r.status === "dang_muon" || r.status === "qua_han") && (
                    <button disabled={busy} onClick={() => runAction(returnBorrowApi, r.id)} className="act-primary">
                      <RotateCcw size={14} /> Nhận trả sách
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}
