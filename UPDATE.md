# CẬP NHẬT TIẾN ĐỘ - V-EVAL WEB CLIENT

## [26/11/2026] - Chuyển Học Phí Sang Đóng Theo 2 Đợt & Dọn Mục Luyện Tập Dư Trong Sidebar

- **Sidebar Học Viên (`src/components/layout/Sidebar.jsx`)**: Xóa mục `Luyện tập` bị trùng với `Luyện tập (P-L-A-R)` trong nhóm `Lộ trình của tôi`; đổi nhãn sang `Học phí theo đợt`.
- **Học Phí Theo 2 Đợt (`src/components/payment/TuitionPaymentView.jsx`)**: Sửa truy vấn `getAcademicTerms` hiển thị đủ Đợt 1 (`ONGOING`) và Đợt 2 (`UPCOMING`), ghép thời gian đợt học vào từng thẻ, truyền `termId` sang PayOS và chuẩn hóa toàn bộ nhãn sang mô hình đóng học phí theo đợt.
- **Kiểm thử**: `npm run build` đạt 0 lỗi (`4272 modules transformed`, 5.36s).
