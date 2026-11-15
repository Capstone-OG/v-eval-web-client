# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [15/11/2026] - Triển Khai Bộ Tiện Ích Chuẩn Hóa Dấu Tiếng Việt Toàn Diện, Đồng Bộ Giao Diện Bảng Đánh Giá Chi Tiết & Tối Ưu Hóa Ngữ Liệu Khảo Sát Năng Lực

- **Chuẩn Hóa Triệt Để Dấu Tiếng Việt & Typography Hệ Thống ([`vietnameseUtils.js`](./src/utils/vietnameseUtils.js), [`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx), [`vietnameseDiacritics.test.js`](./tests/vietnameseDiacritics.test.js))**:
  - **Module Tiện Ích `cleanVietnameseDiacritics`**: Xây dựng thuật toán chuẩn hóa dấu tiếng Việt chuyên sâu, xử lý triệt để các ký tự dấu thanh lơ lửng bị phân rã (decomposed/floating diacritics như `´` `\u00B4`, ``` ` ``` `\u0060`, `\u0301`, `\u0300`, `\u0309`, `\u0303`, `\u0323`) thường gặp từ nguồn OCR hoặc PDF scan (ví dụ `số´ng` -> `sống`, `đế´n` -> `đến`, `nhiê`u` -> `nhiều`, `quố´c biê´n` -> `quốc biến`, `thơ â´u` -> `thơ ấu`, `mẹ hiê`n` -> `mẹ hiền`, `nê` nê´p` -> `nề nếp`).
  - **Bảo Toàn 100% Công Thức Toán & KaTeX**: Thuật toán chỉ tác động chính xác lên cụm nguyên âm tiếng Việt, hoàn toàn không chạm vào cú pháp LaTeX (`\frac`, `\text`, `^`, `$`), đảm bảo các ký hiệu hóa học và toán học hiển thị nguyên vẹn.
  - **Khử Bỏ Hoàn Toàn `font-serif`**: Loại bỏ dứt điểm font serif gây xung đột render glyph tiếng Việt trên Chromium Windows, chuyển toàn bộ container ngữ liệu sang `font-sans` (`Plus Jakarta Sans`) sắc nét và hiện đại.
- **Đồng Bộ Toàn Diện Giao Diện Xem Lại Bài Làm (2 Render Loops)**:
  - **Đồng bộ Bảng Đánh Giá Chi Tiết Tại Trang Kết Quả (`DiagnosticReportPanel id="review"`)**: Nâng cấp toàn bộ khối hiển thị câu hỏi và ngữ liệu tại trang kết quả sau nộp bài tương đương 100% với modal lịch sử, xóa bỏ bộ cắt dòng cũ (`line-clamp-3`), chuyển sang thẻ bài đọc ngữ cảnh bo cong cao cấp (`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50`) với thanh cuộn tự nhiên (`max-h-72 overflow-y-auto whitespace-pre-line`).
  - **Lưới Phương Án Trắc Nghiệm Chuẩn SaaS**: Áp dụng thẻ lựa chọn phân màu ngữ nghĩa cao cấp với hiệu ứng ring (`ring-1 ring-emerald-500/30` cho đáp án đúng, `ring-1 ring-rose-500/30` cho lựa chọn sai của thí sinh), icon `Check` và `X` sắc nét cùng nhãn trạng thái rõ ràng.
  - **Thẻ Lời Giải Tư Duy Chi Tiết**: Nền tím nhạt thanh lịch (`bg-purple-50/70 border-purple-200`) kèm icon `Sparkles`, thụt lề chuẩn mực và văn phong sư phạm tích cực cho mọi phân môn.
  - **Ánh Xạ Đúng Miền Năng Lực**: Kỹ năng đọc hiểu Tiếng Việt hiển thị chuẩn miền `Sử dụng Ngôn ngữ & Văn học` với badge xanh lục dịu mắt.
- **Quản Lý Phiên Hội Thoại Đa Lượt Gia Sư AI Socratic ([`aiSessionManager.js`](./src/utils/aiSessionManager.js), [`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx))**:
  - Khắc phục lỗi React Rules of Hooks (*"Rendered more hooks than during the previous render"*).
  - Tích hợp thanh trượt lịch sử phiên hội thoại đa lượt, lưu trữ cục bộ kết hợp đồng bộ tương tác Supabase.
- **Tái Thiết Kế Toàn Diện Bố Cục Trang Chủ Quản Lý Học Thuật ([`CampusManagerDashboardView.jsx`](./src/components/dashboard/CampusManagerDashboardView.jsx))**:
  - Khắc phục triệt để lỗi phần trăm (`6688%` và `7600%`) bằng bộ chuẩn hóa `normalizeMasteryPct`.
  - HeroBanner tích hợp chào mừng Quản lý học thuật, 4 thẻ KPI đối xứng, ma trận nhiệt đối sánh 4 miền cấp cơ sở.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Thành công 100% trong 1.08s.
  - `node --test`: Đạt **38/38 unit tests pass 100%** (bao gồm 2 bài test tự động cho `cleanVietnameseDiacritics`).
