BỘ TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG (PHIÊN BẢN 2.0)
Đồ án: Xây dựng Hệ thống Quản lý Thư viện Sách Thông minh
Sinh viên: Nguyễn Mạnh Hiếu - MSSV 5250053 - Lớp CNTT K29.1
GVHD: TS. Hoàng Văn Thông

PHIÊN BẢN 2.0 - đã cập nhật theo hệ thống thực tế được cài đặt, chạy và kiểm
thử (Laravel 10 + ReactJS + MySQL), không còn là tài liệu thiết kế dự kiến
thuần tuý như phiên bản 1.0. Xem mục 1.5 và Chương 17.1 trong tài liệu chính
để biết chi tiết những gì đã thay đổi so với bản đầu.

NỘI DUNG THƯ MỤC
-----------------
1. TaiLieu_PhanTich_ThietKe_HeThongThuVien.docx
   Tài liệu chính, gồm:
   - Giới thiệu tổng quan (kèm lịch sử cập nhật tài liệu), phân tích yêu cầu
     chức năng/phi chức năng
   - Danh sách tác nhân (Actor)
   - Sơ đồ kiến trúc hệ thống
   - Sơ đồ Use Case theo từng nhóm tác nhân (Khách/Độc giả, Nhân viên, Admin)
   - Danh mục 36 Use Case (34 UC gốc + 2 UC bổ sung: Gia hạn, Đặt trước) và
     đặc tả chi tiết 16 Use Case tiêu biểu, viết theo đúng hành vi mã nguồn
   - Sơ đồ trạng thái giao dịch mượn sách VÀ trạng thái đặt trước sách
   - Sơ đồ hoạt động tổng thể quy trình mượn - trả
   - 7 sơ đồ tuần tự: đăng nhập, mượn sách, thanh toán, AI, gia hạn (mới),
     đặt trước (mới), trả sách quá hạn & tính phí phạt (mới)
   - Thiết kế cơ sở dữ liệu: sơ đồ ERD 13 bảng (đã thay bảng notifications
     bằng bảng reservations) và mô tả chi tiết từng bảng
   - Danh sách đầy đủ 60 API endpoint theo từng nhóm chức năng
   - Mô tả thiết kế giao diện các màn hình chính (bổ sung các màn hình mới
     cho Nhân viên và Admin)
   - Kế hoạch kiểm thử kèm bảng kịch bản đã kiểm thử thực tế (curl/API +
     trình duyệt thật, có ảnh chụp màn hình kiểm chứng)
   - Phân tích rủi ro (bổ sung rủi ro thực tế đã gặp và cách khắc phục khi
     cài đặt module AI)
   - Hướng phát triển mở rộng (đã loại bỏ mục Đặt trước vì đã triển khai)
   - Kế hoạch thực hiện đề tài (giữ nguyên tiến độ 15 giai đoạn đã đăng ký)
   - Kết luận kèm bảng đối chiếu mức độ hoàn thành so với đề cương
   - Phụ lục bảng thuật ngữ (bổ sung: Rule-based AI, FIFO, Transaction/Lock)

   LƯU Ý: Khi mở file bằng Microsoft Word, vào mục "Mục lục" ở đầu tài liệu,
   nhấn Ctrl+A rồi phím F9 (hoặc chuột phải chọn "Update Field") để mục lục
   tự động cập nhật số trang chính xác.

2. SoDo_HinhAnh/
   Toàn bộ 15 sơ đồ đã nhúng trong tài liệu chính, xuất riêng dưới dạng ảnh
   PNG độ phân giải cao — tiện dùng để chèn vào slide thuyết trình bảo vệ:
   - 01_architecture.png          : Sơ đồ kiến trúc hệ thống
   - 02_usecase_guest_reader.png  : Use Case - Khách và Độc giả (đã cập nhật)
   - 03_usecase_staff.png         : Use Case - Nhân viên thư viện (đã cập nhật)
   - 04_usecase_admin.png         : Use Case - Quản trị viên (đã cập nhật)
   - 05_erd.png                   : Sơ đồ ERD (đã cập nhật - thêm reservations)
   - 06_seq_login.png             : Sequence - Đăng ký / Đăng nhập
   - 07_seq_borrow.png            : Sequence - Đăng ký mượn sách & xác nhận
   - 08_seq_payment.png           : Sequence - Mượn sách có phí & thanh toán (đã cập nhật)
   - 09_seq_ai.png                : Sequence - Tìm kiếm/đề xuất sách bằng AI
   - 10_state_borrow.png          : Sơ đồ trạng thái giao dịch mượn sách
   - 11_activity_borrow_flow.png  : Sơ đồ hoạt động quy trình mượn - trả
   - 12_seq_renew.png             : (MỚI) Sequence - Gia hạn mượn sách
   - 13_seq_reservation.png       : (MỚI) Sequence - Đặt trước sách
   - 14_seq_return_fine.png       : (MỚI) Sequence - Trả sách quá hạn & tính phí phạt
   - 15_state_reservation.png     : (MỚI) Sơ đồ trạng thái đặt trước sách

3. SoDo_MaNguon_Mermaid/
   Mã nguồn (định dạng .mmd, cú pháp Mermaid) của toàn bộ 15 sơ đồ trên.
   Nếu cần chỉnh sửa sơ đồ, có thể dán nội dung file .mmd vào công cụ
   Mermaid Live Editor (mermaid.live) để chỉnh sửa và xuất lại hình ảnh.

GỢI Ý CÁC BƯỚC TIẾP THEO
------------------------
- Đọc và rà soát lại toàn bộ nội dung, điều chỉnh những chi tiết nghiệp vụ
  đặc thù (nếu giảng viên hướng dẫn yêu cầu thay đổi).
- Toàn bộ nội dung trong tài liệu đã khớp với mã nguồn thực tế (backend
  Laravel + frontend ReactJS đã chạy và kiểm thử) — có thể dùng trực tiếp để
  demo trước hội đồng.
- Khi báo cáo/bảo vệ đồ án, có thể trích các sơ đồ trong thư mục SoDo_HinhAnh
  để đưa vào slide trình chiếu.
