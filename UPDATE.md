# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [03/11/2026] - Tinh Gọn Khung Chat Gia Sư AI Socratic (`AISocraticTutorModal` & `AISocraticTutorWidget`)

- **Loại Bỏ Các Khối Khái Niệm Cứng Trong Khung Chat Socratic ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`AISocraticTutorWidget.jsx`](./src/components/dashboard/AISocraticTutorWidget.jsx))**:
  - Xóa bỏ hoàn toàn cột phụ hiển thị cứng `Mạng Lưới Tri Thức 3-Hop`, `Dạng Bài Archetype`, `Toán logic mệnh đề & suy luận kéo theo`, `Mã chuẩn: ARCH_LOGIC_01`, `Định Lý & Công Thức Cốt Lõi` và `Bẫy Sai Lầm Hay Mắc Phải: Bẫy ngộ nhận đảo`.
  - Xóa bỏ nhãn chủ đề cứng `Toán logic mệnh đề & suy luận kéo theo` gắn mặc định dưới tin nhắn chào mừng; chỉ hiển thị nhãn chủ đề khi học sinh bấm hỏi từ một câu hỏi bài tập cụ thể (`initialContext.skill`).
  - Thiết kế lại `AISocraticTutorModal.jsx` thành khung chat 1 cột gọn gàng (`max-w-3xl`), hỗ trợ render KaTeX bằng `MathText` cho đề bài đang hỏi và giữ nút **Báo cáo** ngay trên từng phản hồi của AI.
- **Kiểm Thử & Xác Thực**:
  - `npm test` (`6/6 tests pass`) và `npm run build` (`vite build`) thành công 100%.
