# CẬP NHẬT TIẾN ĐỘ - V-EVAL WEB CLIENT

## [26/11/2026] - Sửa Tiêu Đề Nhóm Sidebar Xuống Dòng, Tên Thí Sinh Kiểm Tra Bất Thường & Học Phí Theo 2 Đợt

- **Sidebar Nhóm Menu (`src/components/layout/Sidebar.jsx`)**: Sửa lỗi `flex-1` chia đôi chiều rộng làm tiêu đề *"QUẢN LÝ LỚP HỌC"* và *"HỌC LIỆU & ĐỀ THI"* bị xuống dòng, chuyển sang `truncate` + đường kẻ `flex-1 min-w-3` giữ gọn 1 hàng.
- **Tab Kiểm Tra Bài Thi Bất Thường (`TeacherDashboardView.jsx`, `TeacherProctoringReviewModal.jsx`)**: Hiển thị họ tên thí sinh thực tế (nhận `studentName` từ API và đối chiếu dự phòng qua `heatmap.rows`) thay cho GUID thô, ánh xạ tên đề thi từ `contentService.getMockExams()`, sửa hiển thị thời gian nộp (`submittedAt` / `completedAt` / `startedAt`) và điểm số (`score` / `totalScore`).
- **Sidebar Học Viên & Học Phí Theo 2 Đợt (`Sidebar.jsx`, `TuitionPaymentView.jsx`)**: Xóa mục `Luyện tập` trùng lặp, hiển thị đủ Đợt 1 (`ONGOING`) và Đợt 2 (`UPCOMING`), truyền `termId` sang PayOS.
- **Kiểm thử**: `node --test tests/*.test.js` pass 115/115; `npm run build` đạt 0 lỗi (`1.68s`).
