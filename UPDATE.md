# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [14/10/2026] - Hoàn Tất Giai Đoạn 2 Core Flow 4: Tích Hợp Ngữ Cảnh Bài Tập Socratic (ZPD Quiz & Diagnostic)

- **Tích Hợp Ngữ Cảnh Vào Luyện Tập Thích Ứng ZPD (`src/components/modals/AdaptiveQuizModal.jsx`)**:
  - Bổ sung nút hành động thông minh **"💡 Chưa hiểu bản chất câu này? Hỏi Gia sư Socratic bẻ khóa tư duy"** xuất hiện ngay khi học sinh làm sai hoặc phân vân đáp án.
  - Bổ sung thanh cảnh báo suy ngẫm sau 45 giây (**Contemplation Nudge**): Tự động hiển thị gợi ý hỗ trợ bẻ khóa tư duy khi học sinh dừng lại quá 45 giây ở câu hỏi khó mà chưa thể đưa ra phương án.
  - Thêm nút gọi nhanh **"Gợi mở tư duy Socratic"** ngay dưới nội dung câu hỏi trước khi nộp bài.
  - Tích hợp component `MathText` kết xuất công thức toán học KaTeX trong câu hỏi và 4 phương án trắc nghiệm.
  - Chuẩn hóa định danh GUID cho ngân hàng câu hỏi thích ứng mẫu (`a1b2c3d4-0001-...`).
  - Tự động đóng gói toàn bộ bối cảnh bài tập (`questionId`, `question`, `options`, `skill`, `selectedWrong`, `correctOption`, `difficultyB`, `predictedProb`) chuyển tiếp đến `AISocraticTutorModal`.
- **Tầng Dịch Vụ Chuẩn Hóa Hợp Đồng DTO (`src/services/practiceService.js`)**:
  - Xây dựng bộ lọc chuẩn hóa DTO: `ensureGuid` (đảm bảo GUID hợp lệ tránh lỗi 400 Bad Request từ ASP.NET Core), `cleanOptionKey` (chuẩn hóa ký tự A, B, C, D để khớp Misconception Trap của AI Engine) và `normalizeOptions` (tự động chuyển đổi Array sang Dictionary `<string, string>`).
  - Bổ sung callback `onInteractionId` bắt sự kiện trả về GUID phiên từ dòng SSE stream, phục vụ chính xác tính năng báo cáo vi phạm.
- **Nâng Cấp Modal Chat Socratic Hỗ Trợ Ngữ Cảnh (`src/components/modals/AISocraticTutorModal.jsx`)**:
  - Tự động nhận diện `initialContext`: Hiển thị thanh thông tin ngữ cảnh nổi bật (*Target Context Banner*) gồm trích đoạn đề bài, kỹ năng và phương án học sinh chọn sai.
  - Khởi tạo lời dẫn Socratic cá nhân hóa theo đúng trọng tâm câu hỏi và phương án làm sai thay vì câu chào chung chung.
  - Tự động đóng gói nội dung câu hỏi vào `questionLatex` và truyền `options`, `correctOption` khi người dùng nhập câu hỏi hoặc chọn quick prompt.
  - Cập nhật linh hoạt `interactionId` từ stream cho tính năng gắn cờ báo cáo vi phạm sư phạm.
- **Chuẩn Hóa Khảo Thí Chẩn Đoán 30 Câu (`src/components/diagnostic/DiagnosticAssessmentPage.jsx`)**:
  - Chuyển đổi phương thức `handleAskSocraticTutor` sang gọi trực tiếp `practiceService.askAiTutorStream` qua Gateway `:5212`, truyền đầy đủ mã câu hỏi, công thức KaTeX và phương án học sinh vừa làm.
  - Xử lý mượt mà mã lỗi `429 Too Many Requests` (Rate Limit 10 req/phút).
- **Điều Phối Trạng Thái Ứng Dụng (`src/App.jsx`)**:
  - Bổ sung state `tutorContext` và hàm điều phối `handleOpenAiTutor(context)`, kết nối liền mạch từ `AdaptiveQuizModal` sang `AISocraticTutorModal`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` (`vite build`) thành công 100% (**0 Error, 0 Warning**).
  - Chạy `npm run lint` (`oxlint`) đạt chuẩn mã nguồn sạch.
