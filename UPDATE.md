# UPDATE - V-EVAL WEB CLIENT

## [25/11/2026] - Tối Ưu Supabase Egress (Cache & Deduplication API) & Hoàn Thiện Giao Diện Kho Đề / Xem Đề MUI

- **Chặn Gọi Lặp API Danh Mục & Dashboard ([contentService.js](./src/services/contentService.js), [practiceService.js](./src/services/practiceService.js))**:
  - Thêm bộ đệm TTL **15 phút** + gộp request đang chạy (in-flight Promise deduplication) cho `contentService.getCurriculum()` và `getSkillsTree()`, tự động xóa cache khi cập nhật cây tri thức hoặc câu hỏi.
  - Thêm bộ đệm ngắn hạn **30 giây** + gộp request đang chạy cho `practiceService.getMyRoadmap()` và `getStudentDashboard()`, tự động làm mới khi thay đổi/duyệt lộ trình.
- **Hoàn Thiện UX Kho Đề, Xem Đề & MUI Select**:
  - Tách thẻ tiêu đề đề thi độc lập, phân trang 5 câu/trang, bổ sung nút tắt bộ lọc ma trận, nút AI tự tạo lời giải kế bên Tạo câu hỏi, chuyển toàn bộ dropdown bộ lọc sang MUI `Select` và hộp thoại đổi đề sang MUI `Dialog`.
- **Kiểm Thử**: `npm run build` hoàn thành trong 2.18s (`4271 modules transformed`, 0 lỗi).
