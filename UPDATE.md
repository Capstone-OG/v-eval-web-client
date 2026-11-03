# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [03/11/2026] - Tinh Gọn Khung Chat Socratic, Hỗ Trợ `studentQuery` Hội Thoại & Nâng Cấp Fallback Phổ Quát

- **Tinh Gọn Giao Diện Khung Chat Socratic ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`AISocraticTutorWidget.jsx`](./src/components/dashboard/AISocraticTutorWidget.jsx))**:
  - Xóa bỏ hoàn toàn cột phụ cứng `Mạng Lưới Tri Thức 3-Hop`, `Dạng Bài Archetype`, `Mã chuẩn: ARCH_LOGIC_01`, `Định Lý & Công Thức Cốt Lõi`, `Bẫy Sai Lầm Hay Mắc Phải`; chuyển sang khung chat 1 cột thanh thoát, hiển thị đúng ngữ cảnh câu hỏi thực tế.
- **Tách Biệt Đề Bài Gốc & Câu Hỏi Học Sinh ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`practiceService.js`](./src/services/practiceService.js))**:
  - Truyền riêng `questionLatex` và `studentQuery`, chấm dứt việc nối chuỗi `[Ngữ cảnh câu hỏi: ...]`; nâng cấp `buildRichSocraticFallback` xóa bỏ văn mẫu "dấu của đạo hàm" sang phân tích mâu thuẫn bản chất.
- **Kiểm Thử & Xác Thực**:
  - `npm test` (`6/6 pass`) và `npm run build` (`vite build`) thành công 100%.
