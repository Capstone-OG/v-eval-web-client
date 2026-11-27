# CẬP NHẬT TIẾN ĐỘ - V-EVAL WEB CLIENT

## [27/11/2026] - Nâng Cấp Giao Diện Phòng Thi, Bảng Số Liệu Markdown, Kết Quả Đánh Giá & Khung Chat Gia Sư AI

- **Phòng Thi & Bảng Số Liệu (`src/components/diagnostic/ExamRoom.jsx`, `src/components/common/MathText.jsx`)**:
  - Tinh gọn header `AppBar` (không icon dư thừa, đồng bộ kiểu chữ bộ đếm giờ & `Rời tab`), cố định chiều cao khung thi (`lg:h-[calc(100vh-61px)]`) để không bị nhảy nút điều hướng giữa các câu, bỏ nhãn `Bloom X/6`, tách rõ 3 vùng màu nền dịu mắt.
  - Bổ sung `splitMarkdownTables()` tự động tách bảng Markdown trong đề thành dropdown `Bảng số liệu` đóng mặc định; chuẩn hóa `renderKatexHtml` hỗ trợ ký hiệu Unicode toán học & công thức hóa học `\ce{...}`.
  - Tinh gọn hộp thoại xác nhận nộp bài (`ExamSubmitConfirmation`) và overlay tải chấm bài (`DiagnosticAssessmentPage.jsx`).
- **Thẻ Đánh Giá Chi Tiết Kỹ Năng (`src/components/diagnostic/DiagnosticSkillOverviewCard.jsx`)**:
  - Khắc phục tràn lề phải bằng lưới `minmax(0, 1fr)` + cắt tối đa 2 dòng, sửa tương thích `@mui/material` v9 (`sx` flex) hết lỗi dính chữ `Mức độ nắm vững8%`, gộp trùng lặp kỹ năng và cập nhật `DOMAIN_FALLBACK_MAP`.
- **Khung Chat Gia Sư AI (`src/components/modals/AISocraticTutorModal.jsx`, `src/components/dashboard/AISocraticTutorWidget.jsx`)**:
  - Chuyển sang `slotProps={{ paper: ... }}` tương thích MUI v9, cố định tỷ lệ cột chat `34vw` + cột lịch sử `16vw` (tổng `50vw` đúng nửa màn hình) với hoạt ảnh trượt mượt cả 2 chiều đóng/mở mà không reflow header/chat; dọn sạch icon thừa, footer, badge nhiễu và gợi ý KaTeX ở ô nhập.
- **Kiểm thử**: `node --test tests/*.test.js` pass 100%; `npm run build` đạt 0 lỗi (`1.94s`).
