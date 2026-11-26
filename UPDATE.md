# CẬP NHẬT TIẾN ĐỘ - V-EVAL WEB CLIENT

## [26/11/2026] - Khắc Phục Tên Thí Sinh Tab Kiểm Tra Bài Thi Bất Thường, Học Phí Theo 2 Đợt & Dọn Sidebar Dư

- **Tab Kiểm Tra Bài Thi Bất Thường (`TeacherDashboardView.jsx`, `TeacherProctoringReviewModal.jsx`)**: Hiển thị họ tên thí sinh thực tế (nhận `studentName` từ API và đối chiếu dự phòng qua `heatmap.rows`) thay cho GUID thô, ánh xạ tên đề thi từ `contentService.getMockExams()`, sửa hiển thị thời gian nộp (`submittedAt` / `completedAt` / `startedAt`) và điểm số (`score` / `totalScore`).
- **Sidebar Học Viên (`src/components/layout/Sidebar.jsx`)**: Xóa mục `Luyện tập` bị trùng với `Luyện tập (P-L-A-R)` trong nhóm `Lộ trình của tôi`; đổi nhãn sang `Học phí theo đợt`.
- **Học Phí Theo 2 Đợt (`src/components/payment/TuitionPaymentView.jsx`)**: Sửa truy vấn `getAcademicTerms` hiển thị đủ Đợt 1 (`ONGOING`) và Đợt 2 (`UPCOMING`), ghép thời gian đợt học vào từng thẻ, truyền `termId` sang PayOS và chuẩn hóa toàn bộ nhãn sang mô hình đóng học phí theo đợt.
- **Kiểm thử**: `node --test tests/*.test.js` pass 115/115; `npm run build` đạt 0 lỗi (`3.84s`).
