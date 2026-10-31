# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Loại Bỏ Khối Terminal Đen Thô Kệch & Render Trực Quan Bảng Biến Thiên Trong Thẻ Hover Sư Phạm

- **Loại Bỏ Khối Terminal Đen Thô Kệch & Render Trực Quan Bảng Biến Thiên (`HierarchicalMathPalette.jsx`)**:
  - Xóa bỏ 100% khối hộp đen developer debug dump hiển thị code thô `[VARIATION_TABLE]` gây phản cảm cho người dùng sư phạm.
  - Tích hợp component `<VariationTable />` trực tiếp vào thẻ Hover: Tự động render Bảng biến thiên trực quan vector mẫu với đầy đủ 3 dòng `x`, `y'`, `y`, vạch kép tiệm cận `||`, mũi tên và cực trị chuẩn SGK.
  - Chuẩn hóa Header thẻ Hover sang chữ thường thanh lịch (`Icon + Tên Môn • Danh mục`), loại bỏ dòng cú pháp code kỹ thuật.
  - Bộ chuyển đổi 1 môn học duy nhất ở trung tâm không bao giờ tràn chữ, tích hợp hiệu ứng trượt động mượt mà khi bấm `<` hoặc `>` và 7 chấm định vị trực quan.

- **Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM**:
  - Header trắng tinh khôi chuẩn Apple / Linear, huy hiệu `Sparkles` và tiêu đề `Ký Hiệu & STEM`.
  - Ô tìm kiếm bo tròn `rounded-xl` màu phấn nhã nhặn, viền tím tương tác êm ái.
  - Thẻ Accordion bo góc mềm mại, mũi tên xoay 90 độ, dòng công thức 1 hàng ngang tối giản thanh lịch.

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết (`CurriculumStudioEditor.jsx`)**:
  - Loại bỏ hoàn toàn `max-h-80 overflow-y-auto`, tách rời từng câu hỏi thành card độc lập (`h-auto`).
  - Hiển thị đầy đủ 4 phương án A-D và khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ.

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.
