# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Khắc Phục Lỗi Runtime ReferenceError & Hoàn Thiện Render Bảng Biến Thiên Trực Quan Trong Thẻ Hover

- **Khắc Phục Lỗi Runtime ReferenceError (`HierarchicalMathPalette.jsx`)**:
  - Khai báo an toàn `hoveredBbtData` qua `useMemo` và `parseVariationTableString`, triệt tiêu hoàn toàn lỗi `hoveredBbtData is not defined` khi mở thẻ xem trước trực quan.
  - Component `<VariationTable />` render mượt mà bảng biến thiên vector mẫu trực tiếp bên trong thẻ Hover sư phạm, loại bỏ 100% khối hộp đen code thô.

- **Bộ Chuyển Đổi 1 Môn Học Duy Nhất Kèm Hiệu Ứng Slide Trượt Mượt Mà**:
  - Trung tâm hiển thị duy nhất 1 môn học rõ nét, font đậm `text-[12px]`, 100% không bao giờ tràn chữ hay co cụm.
  - Hiệu ứng trượt mượt mà (`animate-in fade-in slide-in-from-right-4 / slide-in-from-left-4`), dải 7 chấm tròn định vị và vòng lặp vô hạn.

- **Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM**:
  - Header trắng tinh khôi chuẩn Apple / Linear, huy hiệu `Sparkles` và tiêu đề `Ký Hiệu & STEM`.
  - Ô tìm kiếm bo tròn `rounded-xl` màu phấn nhã nhặn, viền tím tương tác êm ái.
  - Thẻ Accordion bo góc mềm mại, mũi tên xoay 90 độ, dòng công thức 1 hàng ngang tối giản thanh lịch.

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết (`CurriculumStudioEditor.jsx`)**:
  - Loại bỏ hoàn toàn `max-h-80 overflow-y-auto`, tách rời từng câu hỏi thành card độc lập (`h-auto`).
  - Hiển thị đầy đủ 4 phương án A-D và khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ.

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.
