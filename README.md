# Hệ thống Quản lý Thư viện Sách Thông minh

Đồ án tốt nghiệp gồm Back-end **Laravel 10** (thư mục `backend`) và Front-end **React 19 + Vite** (thư mục `frontend`), dùng cơ sở dữ liệu MySQL/MariaDB.

## 1. Cần cài sẵn

| Phần mềm | Phiên bản | Ghi chú |
|---|---|---|
| XAMPP | có PHP 8.1 trở lên | dùng PHP và MySQL/MariaDB đi kèm |
| Composer | 2.x | https://getcomposer.org |
| Node.js | 20.19 trở lên (khuyên dùng 22) | đi kèm npm |
| Git | bất kỳ | để tải mã nguồn |

Kiểm tra nhanh trong terminal:

```bash
php -v
composer -V
node -v
```

> Nếu lệnh `php` không chạy được, thêm `C:\xampp\php` vào biến môi trường PATH.

## 2. Tải mã nguồn

```bash
git clone https://github.com/phuctran200299-hash/do-an-thu-vien.git
cd do-an-thu-vien
```

## 3. Tạo cơ sở dữ liệu

1. Mở **XAMPP Control Panel**, bấm **Start** ở dòng **MySQL** (và Apache nếu muốn dùng phpMyAdmin).
2. Vào http://localhost/phpmyadmin, tạo database tên **`thuvien_db`**, chọn bảng mã `utf8mb4_unicode_ci`.

Hoặc tạo bằng lệnh:

```bash
C:\xampp\mysql\bin\mysql -u root -e "CREATE DATABASE thuvien_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

## 4. Cài đặt Back-end (Laravel)

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Mở file `backend/.env`, sửa các dòng sau:

```env
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=thuvien_db
DB_USERNAME=root
DB_PASSWORD=
```

Tạo bảng và nạp dữ liệu mẫu (hơn 100 đầu sách thật kèm ảnh bìa, độc giả, lịch sử mượn - trả, đánh giá…):

```bash
php artisan migrate --seed
```

Chạy máy chủ API:

```bash
php artisan serve
```

API chạy tại http://127.0.0.1:8000. **Giữ nguyên cửa sổ terminal này.**

## 5. Cài đặt Front-end (React)

Mở **một terminal mới**:

```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt tại **http://localhost:5173**.

Tuỳ chọn: tạo file `frontend/.env` nếu cần đổi cấu hình mặc định:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_ZALO_PHONE=09xxxxxxxx
VITE_HOTLINE=09xxxxxxxx
```

Sau khi sửa `.env`, tắt `npm run dev` (Ctrl + C) rồi chạy lại.

## 6. Tài khoản dùng thử

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | admin@thuvien.vn | admin123 |
| Nhân viên | nhanvien@thuvien.vn | staff123 |
| Độc giả | docgia@thuvien.vn | reader123 |
| Độc giả (dữ liệu mẫu) | docgia01@demo.thuvien.vn … docgia40@demo.thuvien.vn | reader123 |

## 7. Lệnh hữu ích

| Việc cần làm | Lệnh (chạy trong `backend`) |
|---|---|
| Xoá sạch và nạp lại dữ liệu mẫu | `php artisan migrate:fresh --seed` |
| Đánh dấu các giao dịch quá hạn | `php artisan borrow:mark-overdue` |
| Chạy lệnh định kỳ khi triển khai thật | cấu hình cron chạy `php artisan schedule:run` mỗi phút |
| Đóng gói Front-end để triển khai | `npm run build` (trong `frontend`), kết quả ở `frontend/dist` |

## 8. Chạy kiểm thử tự động

Tạo thêm database rỗng **`thuvien_test`** (cách làm như bước 3), rồi chạy:

```bash
cd backend
php artisan test
```

Kết quả mong đợi: **36 passed**.

## 9. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `SQLSTATE[HY000] [2002]` khi migrate | MySQL trong XAMPP chưa bật, hãy Start MySQL |
| `Unknown database 'thuvien_db'` | Chưa tạo database ở bước 3 |
| `No application encryption key` | Chạy `php artisan key:generate` |
| Trang web báo lỗi mạng, không tải được sách | Back-end chưa chạy, hãy mở terminal chạy `php artisan serve` |
| Ảnh bìa sách không hiện | Kiểm tra `APP_URL=http://127.0.0.1:8000` trong `backend/.env`, rồi khởi động lại `php artisan serve` |
| Cổng 5173 bị chiếm | Vite tự chuyển sang 5174, mở đúng địa chỉ hiện trong terminal |
| Đăng nhập rồi vẫn bị đẩy ra | Xoá dữ liệu trang (F12 → Application → Local Storage → Clear) rồi đăng nhập lại |
