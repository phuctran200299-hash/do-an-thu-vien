import { useEffect, useState } from "react";
import { getBooksApi, updateBookStatusApi } from "../../api/books";

const STATUS_OPTIONS = [
  { value: "available", label: "Còn sách" },
  { value: "unavailable", label: "Ngừng cung cấp" },
  { value: "damaged", label: "Hư hỏng" },
];

export default function BookStatus() {
  const [books, setBooks] = useState(null);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState(null);

  const load = () => {
    getBooksApi({ q, per_page: 20 }).then((res) => setBooks(res.data));
  };

  useEffect(load, [q]);

  const handleChange = async (id, status) => {
    setMessage(null);
    try {
      const res = await updateBookStatusApi(id, status);
      setMessage(res.data.message);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Không thể cập nhật tình trạng sách.");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Cập nhật tình trạng sách</h1>
      <p className="mb-4 text-sm text-gray-500">
        Nhân viên cập nhật tình trạng thực tế của sách (còn sách, ngừng cung cấp, hư hỏng...). Để chỉnh sửa thông tin
        khác của sách (tên, số lượng, phí mượn...) vui lòng liên hệ Quản trị viên.
      </p>

      <input
        className="input mb-4 max-w-sm"
        placeholder="Tìm theo tên sách..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {message && <p className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</p>}

      <div className="overflow-x-auto card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tên sách</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Thể loại</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">SL còn / tổng</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tình trạng hiện tại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books?.data.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{b.title}</td>
                <td className="px-4 py-3 text-gray-600">{b.category?.name || "-"}</td>
                <td className="px-4 py-3">
                  {b.available_quantity} / {b.quantity}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input py-1"
                    value={b.status}
                    onChange={(e) => handleChange(b.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
