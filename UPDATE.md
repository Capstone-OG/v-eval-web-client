# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [03/11/2026] - Nâng Cấp Giao Diện Socratic Chat Modal Đơn Cột & Cơ Chế Tiếp Nhận Dữ Liệu Khảo Sát Cho Học Sinh

- **Giao Diện Socratic Chat Modal Hiện Đại ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx))**:
  - Lược bỏ hoàn toàn bảng tri thức bên phải và các mã taxonomy cứng; chuyển sang modal hội thoại tập trung `max-w-3xl` tinh giản.
  - Tách bạch độc lập giữa câu hỏi thắc mắc của học sinh (`studentQuery`) và đề bài gốc (`questionLatex`), không còn in chuỗi `[Ngữ cảnh câu hỏi: ...]`.
- **Bộ Phân Tích Fallback Socratic Thông Minh ([`practiceService.js`](./src/services/practiceService.js))**:
  - Tự động nhận diện câu hỏi trắc nghiệm logic, cấp số cộng, logarit, chính tả để đưa ra gợi ý sư phạm chính xác ngay cả khi ngoại tuyến.
- **Cơ Chế Kế Thừa Lịch Sử Làm Bài Cho Tài Khoản Đăng Nhập ([`practiceService.js`](./src/services/practiceService.js))**:
  - Nâng cấp `getRealUserSubmissions` tự động nhận diện và chuyển giao các bài nộp khảo sát thực hiện trước khi đăng nhập cho học sinh hiện tại, cập nhật `studentId` trong `localStorage`.
  - Giúp Trung Tâm Phân Tích Học Tập (Flow 5) mở khóa ngay lập tức dữ liệu Radar 4 miền, điểm IRT và lịch sử thi thử.
- **Kiểm Thử Hệ Thống**:
  - `npm test` đạt 6/6 passed (100%), `npm run build` Vite hoàn thành trong 1.40s.
