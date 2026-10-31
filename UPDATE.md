# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Tinh Gọn Chiều Rộng Sidebar Ký Hiệu Bên Trái & Tiết Kiệm Tối Đa Diện Tích Soạn Thảo

- **Tinh Gọn Thanh Sidebar Ký Hiệu Bên Trái (`HierarchicalMathPalette.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Thu Hẹp Chiều Rộng Đáng Kể (~25-30% Diện Tích)*:
    + Giảm mạnh chiều rộng thanh Sidebar mở rộng từ `w-76 sm:w-84` (304px - 336px) xuống `w-60 sm:w-64` (240px - 256px), giải phóng ngay gần 80px - 96px chiều ngang cho không gian làm việc và khung soạn thảo bài giảng.
    + Thu gọn thanh ray khi đóng (Collapsed Rail) từ `w-12` xuống `w-10` với bộ nút icon tròn nhỏ gọn (`w-7 h-7`).
  - *Thiết Kế Lại Header & Ô Tìm Kiếm Siêu Gọn Nhẹ*:
    + Nén Header thành 1 hàng ngang duy nhất (`text-[10px]`), loại bỏ dòng mô tả phụ rườm rà.
    + Tối ưu ô tìm kiếm nhanh (`Search Input`) với padding mỏng `py-1 text-[11px]`.
  - *Tinh Gọn Lưới Thẻ Ký Hiệu & Hợp Chất 7 Môn Học*:
    + Thu nhỏ thẻ công thức xuống `min-h-[30px]`, cỡ chữ KaTeX `text-[12px]`, nhãn tên `text-[9.5px]` sắc nét.
    + Tinh giản thanh chuyển đổi phân môn (Domain Pills) với padding `py-0.5 px-1.5 text-[10px]`.

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết (`CurriculumStudioEditor.jsx`)**:
  - Loại bỏ hoàn toàn `max-h-80 overflow-y-auto`, tách rời từng câu hỏi thành card độc lập (`h-auto`).
  - Hiển thị đầy đủ 4 phương án A-D và khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ.

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.
