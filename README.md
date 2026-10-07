# 🏭 FactoryFPT — Real-Time Industrial IoT System

## 📌 Giới thiệu hệ thống (System Overview)

**FactoryFPT** là hệ thống thu thập, xử lý và trực quan hóa dữ liệu cảm biến công nghiệp theo thời gian thực (Real-time Industrial IoT Pipeline). Dự án được tổ chức theo mô hình **Monorepo** gồm 3 thành phần chính:

1. **Backend (.NET 8 Web API)**: 
   - Xây dựng theo kiến trúc **Clean Architecture**.
   - Tiếp nhận dữ liệu chuỗi cảm biến (Lực, Góc nghiêng, Tọa độ) tải cao qua REST API.
   - Sử dụng **Bounded Channels** (In-Memory Queue) và `BackgroundService` để xử lý ghi dữ liệu bất đồng bộ vào SQL Server.
   - Bắn sự kiện realtime qua **SignalR Hub**.

2. **Frontend (React + Vite Dashboard)**: 
   - Giao diện giám sát thời gian thực.
   - Đăng ký kết nối SignalR với Backend để hiển thị biểu đồ biến động và nhận cảnh báo tức thời khi lực vượt ngưỡng an toàn.

3. **Database (SQL Server 2022)**:
   - Lưu trữ thông tin thiết bị, phiên đo (Session) và chuỗi dữ liệu cảm biến chi tiết.

---

## 🐳 Hướng dẫn khởi chạy bằng Docker (Quick Start)

Toàn bộ hệ thống (SQL Server, Backend API, Frontend Dashboard) đã được đóng gói hoàn chỉnh bằng **Docker Compose**. Bạn chỉ cần 1 câu lệnh duy nhất để khởi chạy:

### Bước 1: Tiền đề
- Đảm bảo ứng dụng **Docker Desktop** trên máy tính đã được mở và đang chạy.

### Bước 2: Chạy câu lệnh
Mở Terminal / PowerShell tại thư mục gốc của dự án và dán lệnh:

```bash
docker compose up --build -d
