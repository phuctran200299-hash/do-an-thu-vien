import { useCallback, useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import { getReservationsApi } from "../../api/reservations";
import { BookCell, DataTable, PageHeader, Pagination, Pill, Tabs, UserCell } from "../../components/admin/ui";
import { fmtDateTime } from "../../components/admin/format";

const STATUS = {
  cho_sach: { label: "Đang chờ", tone: "yellow" },
  san_sang: { label: "Sẵn sàng", tone: "green" },
  hoan_tat: { label: "Hoàn tất", tone: "blue" },
  da_huy: { label: "Đã huỷ", tone: "gray" },
};

const TABS = [
  { value: "cho_sach", label: "Đang chờ", tone: "bg-amber-100 text-amber-700" },
  { value: "san_sang", label: "Sẵn sàng", tone: "bg-emerald-100 text-emerald-700" },
  { value: "hoan_tat", label: "Hoàn tất" },
  { value: "da_huy", label: "Đã huỷ" },
];

export default function ReservationQueue() {
  const [status, setStatus] = useState("cho_sach");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all(TABS.map((t) => getReservationsApi({ status: t.value }).then((res) => [t.value, res.data.total]))).then((pairs) =>
      setCounts(Object.fromEntries(pairs))
    );
  }, []);

  const load = useCallback(() => {
    setData(null);
    getReservationsApi({ status, page }).then((res) => setData(res.data));
  }, [status, page]);

  useEffect(load, [load]);

  return (
    <div>
      <PageHeader
        icon={Hourglass}
        title="Hàng chờ đặt trước"
        subtitle='Độc giả xếp hàng chờ các đầu sách đã hết. Khi sách được trả, lượt đặt sớm nhất tự động chuyển sang "Sẵn sàng".'
      />

      <Tabs
        tabs={TABS.map((t) => ({ ...t, count: counts[t.value] }))}
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      />

      <DataTable
        loading={!data}
        colSpan={5}
        empty="Không có lượt đặt trước nào."
        head={
          <>
            <th>#</th>
            <th>Độc giả</th>
            <th>Sách</th>
            <th>Thời gian đặt</th>
            <th>Trạng thái</th>
          </>
        }
        footer={<Pagination meta={data} onChange={setPage} />}
      >
        {(data?.data || []).map((r, i) => (
          <tr key={r.id}>
            <td className="w-12 font-bold text-gray-400">{(data.from || 1) + i}</td>
            <td>
              <UserCell user={r.user} />
            </td>
            <td className="min-w-[240px]">
              <BookCell book={r.book} sub={`Còn ${r.book?.available_quantity ?? 0} / ${r.book?.quantity ?? 0} bản`} />
            </td>
            <td className="whitespace-nowrap">{fmtDateTime(r.created_at)}</td>
            <td>
              <Pill tone={STATUS[r.status]?.tone}>{STATUS[r.status]?.label || r.status}</Pill>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
