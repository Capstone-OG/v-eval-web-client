# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [19/11/2026] - Tối Ưu Giao Diện Cổng Phụ Huynh Khi Lớp Chưa Có Giáo Viên Phụ Trách

- **Xử Lý Trạng Thái Chưa Phân Công Giáo Viên ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Khối thông tin giáo viên phụ trách: Nếu chưa có SĐT (`child.teacherContactPhone === 'Chưa có'`), hiển thị thông điệp nhẹ nhàng *"Chưa có số liên hệ"*.
  - Nút đăng ký lịch trao đổi 1-1: Bổ sung guard kiểm tra, nếu lớp con chưa có giáo viên phụ trách thì hiển thị toast thông báo: *"Lớp học của con hiện đang trong quá trình điều phối phân công giáo viên phụ trách."* thay vì gửi yêu cầu rỗng.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Biên dịch thành công 100% trong 1.14s, 0 lỗi.
