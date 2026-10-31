# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Chuyển Đổi Sang Hiển Thị 1 Môn Học Duy Nhất Kèm Hiệu Ứng Slide Chuyển Động Mượt Mà (< >)

- **Bộ Chuyển Đổi 1 Môn Học Duy Nhất Kèm Hiệu Ứng Slide Trượt Mượt Mà (`HierarchicalMathPalette.jsx`)**:
  - Trung tâm thanh điều hướng hiển thị **duy nhất 1 môn học** rõ nét, font đậm `text-[12px]`, hiển thị 100% đầy đủ cả icon và tên môn học (`📐 Toán Học`, `🧪 Hóa Học`, `⚛️ Vật Lý`, `🧬 Sinh Học`, `📖 Ngữ Văn`, `🌍 Địa Lý`, `🔣 Ký Hiệu & Logic`), chấm dứt triệt để lỗi tràn chữ hay co cụm.
  - Tích hợp hiệu ứng trượt mượt mà (`animate-in fade-in slide-in-from-right-4 / slide-in-from-left-4`) theo đúng chiều bấm nút `<` hoặc `>`.
  - Dải 7 chấm tròn định vị hỗ trợ theo dõi vị trí môn học và nhấp chuyển nhanh trực tiếp.
  - Vòng lặp xoay tròn vô hạn (Modulo loop) liên tục qua 7 môn học khi nhấn `<` hoặc `>`.

- **Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM**:
  - Header trắng tinh khôi chuẩn Apple / Linear, huy hiệu `Sparkles` và tiêu đề `Ký Hiệu & STEM`.
  - Ô tìm kiếm bo tròn `rounded-xl` màu phấn nhã nhặn, viền tím tương tác êm ái.
  - Thẻ Accordion bo góc mềm mại, mũi tên xoay 90 độ, dòng công thức 1 hàng ngang tối giản thanh lịch.
  - Rê chuột giữ yên (~380ms) để mở thẻ popup Glassmorphism mô phỏng chi tiết KaTeX phóng to và cấu trúc Bảng biến thiên.

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết (`CurriculumStudioEditor.jsx`)**:
  - Loại bỏ hoàn toàn `max-h-80 overflow-y-auto`, tách rời từng câu hỏi thành card độc lập (`h-auto`).
  - Hiển thị đầy đủ 4 phương án A-D và khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ.

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.
