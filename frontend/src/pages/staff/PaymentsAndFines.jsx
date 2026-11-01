import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CreditCard } from "lucide-react";
import { getFinesApi, getPaymentsApi, markFinePaidApi } from "../../api/payments";
import { Alert, BookCell, DataTable, PageHeader, Pagination, Pill, Tabs, UserCell } from "../../components/admin/ui";
import { fmtDateTime, money } from "../../components/admin/format";

const PAYMENT = {
  paid: { label: "Đã thanh toán", tone: "green" },
  pending: { label: "Chờ thanh toán", tone: "yellow" },
  failed: { label: "Đã huỷ", tone: "gray" },
};

const VIEWS = [
  { value: "payments", label: "Thanh toán phí mượn" },
  { value: "fines-unpaid", label: "Phí phạt chưa thu", tone: "bg-rose-100 text-rose-700" },
  { value: "fines-paid", label: "Phí phạt đã thu" },
];

export default function PaymentsAndFines() {
  const [view, setView] = useState("payments");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [counts, setCounts] = useState({});
  const [alert, setAlert] = useState(null);

  const loadCounts = useCallback(() => {
    Promise.all([getPaymentsApi(), getFinesApi({ status: "unpaid" }), getFinesApi({ status: "paid" })]).then(([p, u, f]) =>
      setCounts({ payments: p.data.total, "fines-unpaid": u.data.total, "fines-paid": f.data.total })
    );
  }, []);

  const load = useCallback(() => {
    setData(null);
    const req = view === "payments" ? getPaymentsApi({ page }) : getFinesApi({ status: view === "fines-paid" ? "paid" : "unpaid", page });
    req.then((res) => setData(res.data));
  }, [view, page]);

  useEffect(loadCounts, [loadCounts]);
  useEffect(load, [load]);

  const handleMarkPaid = async (id) => {
    try {
      const res = await markFinePaidApi(id);
      setAlert({ tone: "success", message: res.data.message });
      load();
      loadCounts();
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể xác nhận thu phí phạt." });
    }
  };

  const rows = data?.data || [];

  return (
    <div>
      <PageHeader icon={CreditCard} title="Giao dịch & phí phạt" subtitle="Theo dõi các khoản thanh toán mượn sách có phí và thu phí phạt trả sách trễ hạn tại quầy." />

      <Tabs
        tabs={VIEWS.map((v) => ({ ...v, count: counts[v.value] }))}
        value={view}
        onChange={(v) => {
          setView(v);
          setPage(1);
        }}
      />

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      {view === "payments" ? (
        <DataTable
          loading={!data}
          colSpan={5}
          head={
            <>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian thanh toán</th>
            </>
          }
          footer={<Pagination meta={data} onChange={setPage} />}
        >
          {rows.map((p) => (
            <tr key={p.id}>
              <td>
                <UserCell user={p.user} />
              </td>
              <td className="min-w-[220px]">
                <BookCell book={p.borrow_record?.book} />
              </td>
              <td className="whitespace-nowrap font-bold text-gray-900">{money(p.amount)}</td>
              <td>
                <Pill tone={PAYMENT[p.payment_status]?.tone}>{PAYMENT[p.payment_status]?.label || p.payment_status}</Pill>
              </td>
              <td className="whitespace-nowrap">{fmtDateTime(p.paid_at)}</td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <DataTable
          loading={!data}
          colSpan={5}
          head={
            <>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Lý do</th>
              <th>Số tiền</th>
              <th className="!text-right">{view === "fines-unpaid" ? "Thao tác" : "Trạng thái"}</th>
            </>
          }
          footer={<Pagination meta={data} onChange={setPage} />}
        >
          {rows.map((f) => (
            <tr key={f.id}>
              <td>
                <UserCell user={f.borrow_record?.user} />
              </td>
              <td className="min-w-[220px]">
                <BookCell book={f.borrow_record?.book} />
              </td>
              <td className="text-gray-600">{f.reason}</td>
              <td className="whitespace-nowrap font-bold text-rose-600">{money(f.amount)}</td>
              <td>
                <div className="flex justify-end">
                  {f.status === "unpaid" ? (
                    <button onClick={() => handleMarkPaid(f.id)} className="act-success">
                      <BadgeCheck size={14} /> Đã thu tiền
                    </button>
                  ) : (
                    <Pill tone="green">Đã thu</Pill>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
