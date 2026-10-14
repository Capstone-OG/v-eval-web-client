# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [14/10/2026] - Triển Khai Giai Đoạn 2 Core Flow 4: Tích Hợp Ngữ Cảnh Bài Tập Socratic (ZPD Quiz & Diagnostic)

- **Tích Hợp Ngữ Cảnh Vào Luyện Tập Thích Ứng ZPD (`src/components/modals/AdaptiveQuizModal.jsx`)**:
  - Bổ sung nút hành động thông minh **"💡 Chưa hiểu bản chất câu này? Hỏi Gia sư Socratic bẻ khóa tư duy"** xuất hiện ngay khi học sinh làm sai hoặc phân vân đáp án.
  - Thêm nút gọi nhanh **"Gợi mở tư duy Socratic"** ngay dưới nội dung câu hỏi trước khi nộp bài.
  - Tích hợp component `MathText` kết xuất công thức toán học KaTeX trong câu hỏi và 4 phương án trắc nghiệm.
  - Tự động đóng gói toàn bộ bối cảnh bài tập (`questionId`, `question`, `options`, `skill`, `selectedWrong`, `difficultyB`, `predictedProb`) chuyển tiếp đến `AISocraticTutorModal`.
- **Nâng Cấp Modal Chat Socratic Hỗ Trợ Ngữ Cảnh (`src/components/modals/AISocraticTutorModal.jsx`)**:
  - Tự động nhận diện `initialContext`: Hiển thị thanh thông tin ngữ cảnh nổi bật (*Target Context Banner*) gồm trích đoạn đề bài, kỹ năng và phương án học sinh chọn sai.
  - Khởi tạo lời dẫn Socratic cá nhân hóa theo đúng trọng tâm câu hỏi và phương án làm sai thay vì câu chào chung chung.
  - Thích ứng bộ gợi ý câu hỏi nhanh (Quick Prompts): *"Vì sao phương án em chọn lại chưa chính xác?"*, *"Gợi ý giúp em bước lập luận đầu tiên"*, *"Em chưa hiểu định lý áp dụng cho câu này"*.
  - Đồ thị Tri thức 3-Hop Subgraph tự động ghim dạng bài Archetype và bẫy ngộ nhận tương ứng với câu hỏi đang làm.
- **Chuẩn Hóa Khảo Thí Chẩn Đoán 30 Câu (`src/components/diagnostic/DiagnosticAssessmentPage.jsx`)**:
  - Chuyển đổi phương thức `handleAskSocraticTutor` sang gọi trực tiếp `practiceService.askAiTutorStream` qua Gateway `:5212`, truyền đầy đủ mã câu hỏi, công thức KaTeX và phương án học sinh vừa làm.
  - Xử lý mượt mà mã lỗi `429 Too Many Requests` (Rate Limit 10 req/phút).
- **Điều Phối Trạng Thái Ứng Dụng (`src/App.jsx`)**:
  - Bổ sung state `tutorContext` và hàm điều phối `handleOpenAiTutor(context)`, kết nối liền mạch từ `AdaptiveQuizModal` sang `AISocraticTutorModal`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` (`vite build`) thành công 100% (**0 Error, 0 Warning**).
  - Chạy `npm run lint` (`oxlint`) đạt chuẩn mã nguồn sạch.
