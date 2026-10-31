# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM & Băng Chuyền 2 Môn Học Không Tràn Chữ

- **Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM (`HierarchicalMathPalette.jsx`)**:
  - Thay thế header tối cũ bằng giao diện trắng tinh khôi chuẩn Apple / Linear, huy hiệu `Sparkles` và tiêu đề `Ký Hiệu & STEM`.
  - Ô tìm kiếm bo tròn `rounded-xl` màu phấn nhã nhặn, viền tím tương tác êm ái.
  - Băng chuyền môn học hiển thị **chính xác 2 môn học song song** giữa 2 nút điều hướng `<` và `>`, chấm dứt hoàn toàn hiện tượng co cụm `T...`, `H...`.
  - Không gian mỗi nút rộng rãi (~80px), hiển thị đầy đủ icon và tên môn học (`📐 Toán`, `🧪 Hóa`, `⚛️ Vật Lý`, `🧬 Sinh`, `📖 Ngữ Văn`, `🌍 Địa Lý`, `🔣 Ký Hiệu`).
  - Vòng lặp xoay tròn vô hạn (Modulo loop) liên tục qua 7 môn học khi nhấn `<` hoặc `>`.
  - Thẻ Accordion bo góc mềm mại, mũi tên xoay 90 độ, dòng công thức 1 hàng ngang tối giản thanh lịch.
  - Rê chuột giữ yên (~380ms) để mở thẻ popup Glassmorphism mô phỏng chi tiết KaTeX phóng to và cấu trúc Bảng biến thiên.

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết (`CurriculumStudioEditor.jsx`)**:
  - Loại bỏ hoàn toàn `max-h-80 overflow-y-auto`, tách rời từng câu hỏi thành card độc lập (`h-auto`).
  - Hiển thị đầy đủ 4 phương án A-D và khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ.

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.
