# CẬP NHẬT TIẾN ĐỘ - V-EVAL WEB CLIENT

## [27/11/2026] - Nâng Cấp Giao Diện Phòng Thi, Khung Chat Gia Sư AI & Phân Tách Thẩm Quyền Quản Lý Cơ Sở / Giáo Viên

- **Phòng Thi & Bảng Số Liệu (`src/components/diagnostic/ExamRoom.jsx`, `src/components/common/MathText.jsx`)**:
  - Tinh gọn header `AppBar` (không icon dư thừa, đồng bộ kiểu chữ bộ đếm giờ & `Rời tab`), cố định chiều cao khung thi (`lg:h-[calc(100vh-61px)]`) để không bị nhảy nút điều hướng giữa các câu, bỏ nhãn `Bloom X/6`, tách rõ 3 vùng màu nền dịu mắt.
  - Bổ sung `splitMarkdownTables()` tự động tách bảng Markdown trong đề thành dropdown `Bảng số liệu` đóng mặc định; chuẩn hóa `renderKatexHtml` hỗ trợ ký hiệu Unicode toán học & công thức hóa học `\ce{...}`.
- **Thẻ Đánh Giá Chi Tiết Kỹ Năng & Khung Chat Gia Sư AI (`DiagnosticSkillOverviewCard.jsx`, `AISocraticTutorModal.jsx`, `AISocraticTutorWidget.jsx`)**:
  - Khắc phục tràn lề phải bằng lưới `minmax(0, 1fr)` + cắt tối đa 2 dòng, sửa tương thích `@mui/material` v9 (`sx` flex), cố định tỷ lệ cột chat `34vw` + cột lịch sử `16vw` (tổng `50vw` đúng nửa màn hình) với hoạt ảnh trượt mượt cả 2 chiều đóng/mở.
- **Điều Phối Lớp Học, Duyệt Lộ Trình 3 Cấp & Cảnh Báo Cấp 3 (`AcademicManagerDashboardView.jsx`, `RoadmapApprovalStudioView.jsx`, `EarlyWarningsMentorPanel.jsx`)**:
  - Bổ sung thanh lọc nhanh 4 miền năng lực và khung cuộn cố định cho bảng đối sánh 12 lớp (`max-h-[540px]`) cùng danh sách lớp offline (`max-h-[620px]`), tách dòng lịch học lên hàng ngang riêng trên 3 nút thao tác và xóa dấu `+` bị lặp ở 4 nút (`Tạo Đợt Học`, `Tạo Khóa Học`, `Mở Lớp Học Mới`, `Xếp / Chuyển HS`).
  - Phân tách tab phê duyệt lộ trình theo đúng vai trò (`mode="manager"` ẩn tab `Chờ GV rà soát`, chỉ hiển thị `Chờ Quản lý cơ sở duyệt`, `Đã chuyển Giám đốc`, `Đã kích hoạt`).
  - Tách bạch chế độ Quản lý cơ sở (`mode="manager"`) trong `EarlyWarningsMentorPanel.jsx`: khóa phạm vi theo đúng học sinh của cơ sở phụ trách, chỉ hiển thị Cảnh báo Cấp 3 (`RED`) kèm nút trực tiếp `Lập Lịch Họp 3 Bên` và `Ghi Nhận Biên Bản Họp` (giữ nguyên 100% luồng xử lý Cấp 1–2 và chuyển cấp của Giáo viên).
- **Kiểm thử**: `node --test tests/*.test.js` pass 100% (`115/115`).
