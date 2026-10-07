# 🏭 FactoryFPT — Real-Time IoT System

Dự án thu thập, xử lý và trực quan hóa dữ liệu cảm biến theo thời gian thực (Real-time IoT Pipeline) được tổ chức theo mô hình **Monorepo**.

## 📌 Giới thiệu hệ thống (System Overview)

Hệ thống được thiết kế theo kiến trúc Monorepo bao gồm 3 thành phần chính:

1. **Backend (.NET 8 Web API)**
   - Xây dựng theo kiến trúc **Clean Architecture**.
   - Tiếp nhận dữ liệu chuỗi cảm biến (Lực, Góc nghiêng, Tọa độ) tải cao qua REST API.
   - Sử dụng **Bounded Channels** (In-Memory Queue) và `BackgroundService` để xử lý ghi dữ liệu bất đồng bộ vào SQL Server.
   - Bắn sự kiện realtime qua **SignalR Hub**.

2. **Frontend (React + Vite Dashboard)**
   - Giao diện giám sát thời gian thực.
   - Đăng ký kết nối SignalR với Backend để hiển thị biểu đồ biến động và nhận cảnh báo tức thời khi lực vượt ngưỡng an toàn.

3. **Database (SQL Server 2022)**
   - Lưu trữ thông tin thiết bị, phiên đo (Session) và chuỗi dữ liệu cảm biến chi tiết.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

* **Backend:** .NET 8, SignalR, Bounded Channels, BackgroundService, Entity Framework Core
* **Frontend:** React, Vite, SignalR Client
* **Database:** SQL Server 2022
* **Containerization:** Docker, Docker Compose

---

## 🐳 Hướng dẫn khởi chạy bằng Docker (Quick Start)

Toàn bộ hệ thống (SQL Server, Backend API, Frontend Dashboard) đã được đóng gói hoàn chỉnh bằng **Docker Compose**.

### Bước 1: Tiền đề
* Đảm bảo ứng dụng **Docker Desktop** trên máy tính đã được mở và đang chạy.

### Bước 2: Chạy câu lệnh
Mở Terminal / PowerShell tại thư mục gốc của dự án và dán lệnh:

```bash
docker compose up --build -d
```

### Bước 3: Kiểm tra kết quả
Sau khi các container khởi chạy hoàn tất:
* **Dashboard:** Truy cập `http://localhost:3000`
* **Swagger API:** Truy cập `http://localhost:5000/swagger`

### Bước 4: Dừng hệ thống (Tùy chọn)
Để dừng toàn bộ hệ thống và xóa các container:

```bash
docker compose down
```
