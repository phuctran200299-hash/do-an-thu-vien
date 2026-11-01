import { useCallback, useEffect, useState } from "react";
import { BookCheck } from "lucide-react";
import { getBooksApi, updateBookStatusApi } from "../../api/books";
import { Alert, BookCell, DataTable, PageHeader, Pagination, Pill, SearchBox, Tabs } from "../../components/admin/ui";

const STATUS_OPTIONS = [
  { value: "available", label: "Đang cung cấp", tone: "green" },
  { value: "unavailable", label: "Ngừng cung cấp", tone: "gray" },
  { value: "damaged", label: "Hư hỏng", tone: "red" },
];

export default function BookStatus() {
  const [books, setBooks] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [alert, setAlert] = useState(null);

  const load = useCallback(() => {
    getBooksApi({ q: q || undefined, status: status || undefined, page, per_page: 12 }).then((res) => setBooks(res.data));
  }, [q, status, page]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const handleChange = async (id, value) => {
    try {
      const res = await updateBookStatusApi(id, value);
      setAlert({ tone: "success", message: res.data.message });
      load();
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể cập nhật tình trạng sách." });
    }
  };

  return (
    <div>
      <PageHeader
        icon={BookCheck}
        title="Tình trạng sách"
        subtitle="Cập nhật tình trạng thực tế của sách. Để sửa các thông tin khác (tên, số lượng, phí mượn), vui lòng liên hệ Quản trị viên."
      >
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên sách..."
        />
      </PageHeader>

      <Tabs
        tabs={[{ value: "", label: "Tất cả" }, ...STATUS_OPTIONS]}
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      />

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      <DataTable
        loading={!books}
        colSpan={4}
        head={
          <>
            <th>Sách</th>
            <th>Còn / tổng</th>
            <th>Tình trạng hiện tại</th>
            <th className="!text-right">Cập nhật</th>
          </>
        }
        footer={<Pagination meta={books} onChange={setPage} />}
      >
        {(books?.data || []).map((b) => {
          const current = STATUS_OPTIONS.find((o) => o.value === b.status);
          return (
            <tr key={b.id}>
              <td className="min-w-[260px]">
                <BookCell book={b} sub={b.category?.name} />
              </td>
              <td className="whitespace-nowrap font-semibold">
                {b.available_quantity} <span className="font-normal text-gray-400">/ {b.quantity}</span>
              </td>
              <td>
                <Pill tone={current?.tone}>{current?.label || b.status}</Pill>
              </td>
              <td>
                <div className="flex justify-end gap-1">
                  {STATUS_OPTIONS.filter((o) => o.value !== b.status).map((o) => (
                    <button key={o.value} onClick={() => handleChange(b.id, o.value)} className={o.tone === "green" ? "act-success" : o.tone === "red" ? "act-danger" : "act-ghost"}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}
