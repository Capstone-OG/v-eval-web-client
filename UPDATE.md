# UPDATE

## [13/11/2026] - Tối Ưu Bộ Render KaTeX/MathText, Tối Giản Bố Cục Trang Tổng Quan, Nâng Cấp Ảnh Học Sinh & Khắc Phục Lỗi Lịch Sử Làm Bài

- **Nâng Cấp Bộ Tiền Xử Lý Công Thức Toán & Hóa Học ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Khôi phục mã lệnh đơn vị rụng gạch chéo: `textmol`, `textgam`, `textg`, `textkg` -> `\text{mol}`, `\text{gam}`.
  - Mở rộng tập toán tử suy luận và so sánh: `\implies`, `>`, `<`, `\ge`, `\le`, `\approx`, `\equiv`, `\rightleftharpoons`, `\xrightarrow`.
  - Tự động bọc biến số đơn trước đơn vị đo: `([amVnxy])\s+(mol|gam|g|kg|lít|lit|ml)` -> `$1 $2` (ví dụ: `$a$ mol`, `$V$ lít`).
  - Chuẩn hóa chỉ số dưới tiếng Việt cho hóa học: `k_{gốc}` -> `k_{\text{gốc}}`, `m_{dd}` -> `m_{\text{dd}}`.
  - Thay thế chuỗi thay thế `'$$$1$$'` bằng hàm lambda match evaluator an toàn `(m, g) => '$' + g + '$'` nhằm triệt tiêu hoàn toàn lỗi ký tự escape sinh ra chuỗi `\$` lỗi trên MD Editor Plus / Chromium.
  - Hỗ trợ số mũ & ngoặc đơn trong biểu thức nhiều vế, bỏ qua khớp nằm trong `$...$`, tách ngoặc không cân bằng ra ngoài công thức; chỉ dò từ tiếng Việt bên ngoài `\text{}`/`_{}`/`^{}` để không gỡ `$` nhầm.
- **Tái cấu trúc bố cục trang Tổng quan theo thứ tự thị giác chuẩn mực ([`App.jsx`](./src/App.jsx), [`HeroBanner.jsx`](./src/components/dashboard/HeroBanner.jsx))**:
  - Đưa `HeroBanner` lên vị trí đầu trang, đặt `MetricsGrid` 4 chỉ số KPI ngay phía dưới banner, bố trí khối hành động kép (`DiagnosticOnboardingCard` 70% + `StudentParentLinkCard` 30%) ở phía chân trang.
  - Gỡ bỏ hoàn toàn khối `MilestoneCard` và `LiveQnACard` giả lập; chuyển đổi ảnh học sinh sang chân dung học sinh THPT Việt Nam thực tế (`vietnamese_student_real.jpg`).
- **Gia cố cơ chế tự hồi phục (Graceful Fallback) nạp lịch sử thi ([`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx))**:
  - Bọc từng lời gọi lấy chi tiết bài nộp trong `try/catch` độc lập, tự động fallback về dữ liệu tóm tắt (`theta0`, `placementClass`, điểm số) khi gặp bài thi cũ không còn câu hỏi trên Backend Content Service.
- **Phân tách 2 chế độ Lộ trình học tập & Ràng buộc học phí ([`StudentCurriculumView.jsx`](./src/components/curriculum/StudentCurriculumView.jsx), [`TuitionRequiredModal.jsx`](./src/components/modals/TuitionRequiredModal.jsx))**:
  - Hỗ trợ chuyển đổi linh hoạt giữa *🏫 Lớp Học Chung* và *🎯 Lộ Trình Cá Nhân Riêng* 3 chặng thích ứng; chặn mở bài học chi tiết và luyện tập củng cố khi chưa hoàn tất học phí qua PayOS VietQR.
- **Kiểm thử & Biên dịch**:
  - Toàn bộ 31/31 unit tests vượt qua 100%, `npm run lint` đạt 0 lỗi, `npm run build` thành công.
