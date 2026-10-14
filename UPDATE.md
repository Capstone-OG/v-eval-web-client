# Nhật Ký Cập Nhật (Update Log) - Web Client

## [14/10/2026] - Chuyển Đổi Hoàn Toàn Dàn Kiến Thức Sang Dữ Liệu Động Từ Database & Bỏ Hardcode FE

- **Xóa Bỏ Hoàn Toàn Dữ Liệu Hardcode `DOMAINS_DATA` Trên Frontend**:
  - Gỡ bỏ toàn bộ mảng dữ liệu tĩnh `DOMAINS_DATA` trong `CurriculumExplorerView.jsx`.
  - Kết nối động trực tiếp với API Content Service thông qua `contentService.getCurriculum()` (`GET /api/content/curriculum`).
  - Thêm trạng thái nạp dữ liệu (Loading Skeleton & Spinner) khi truy vấn cơ sở dữ liệu qua Gateway.
- **Tích Hợp Đo Lường Năng Lực Cá Nhân & Định Vị Vùng Trũng Động (Dynamic Mastery Detection)**:
  - Bổ sung banner thông báo tương tác trong `CurriculumExplorerView`: Nếu học viên chưa thi khảo sát, hiển thị banner cảnh báo khung chuẩn 120 câu kèm nút chuyển nhanh sang tab Khảo sát 30 câu.
  - Sau khi học viên hoàn thành bài thi khảo sát, tự động tính toán và gắn badge cờ đỏ `⚠️ Vùng trũng (Mastery: X%)` cho các kỹ năng có độ thành thạo dưới 60%, cờ xanh `✅ Đã vững` cho các kỹ năng đạt chuẩn.
  - Bổ sung callout đề xuất củng cố tức thì tại chi tiết kỹ năng yếu để gọi API 19 Content Service.
- **Hợp Nhất Phân Hệ Khảo Sát Năng Lực Đầu Vào Vào Chung Dashboard (Tab-based Flow 1)**:
  - Loại bỏ hoàn toàn cơ chế tách rời toàn màn hình (`setCurrentPage('diagnostic')`).
  - Nhúng trực tiếp `DiagnosticAssessmentPage` (`embedded = true`) vào tab `diagnostic` của Dashboard, bảo toàn trọn vẹn `Navbar`, `Sidebar` và trạng thái phiên làm việc.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).
