# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Siêu Tinh Gọn Chiều Rộng Sidebar, Carousel 3 Môn Học Vòng Lặp Vô Hạn (< >) & Xem Mô Phỏng Chi Tiết Khi Rê Chuột Giữ

- **Thu Hẹp Chiều Ngang Sidebar Tối Đa (`HierarchicalMathPalette.jsx`)**:
  - Giảm mạnh chiều rộng sidebar từ `w-60 sm:w-64` (240px - 256px) xuống `w-48 sm:w-52` (192px - 208px), giải phóng thêm ~50px chiều ngang cho khung soạn thảo bài giảng.
- **Băng Chuyền 3 Môn Học Ngang Với Vòng Lặp Vô Hạn (`handleNextDomain`, `handlePrevDomain`)**:
  - Bố trí thanh chọn môn học dạng băng chuyền ngang với 2 nút `<` và `>` ở hai đầu, mỗi lần hiển thị chính xác 3 môn học.
  - Vòng lặp xoay tròn vô hạn (Modulo loop), bấm chuyển tiếp liên tục qua lại giữa 7 môn học mà không bị nghẽn ở hai đầu, tự động kích hoạt môn tương ứng.
- **Hiển Thị Danh Sách Công Thức Đơn Giản & Rê Chuột Giữ Để Xem Mô Phỏng Chi Tiết**:
  - Trong danh sách: Mỗi mục công thức/ký hiệu hiển thị siêu tinh giản thành 1 hàng ngang duy nhất (`h-[32px]`, KaTeX + tên nhãn + icon kéo thả).
  - Khi rê chuột và giữ bên trong (~380ms): Mở card mô phỏng chi tiết (`hoveredItem`) hiển thị công thức phóng to sắc nét, mô phỏng cấu trúc Bảng biến thiên, mô tả sư phạm, cú pháp và hướng dẫn thao tác.
- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết (`CurriculumStudioEditor.jsx`)**:
  - Loại bỏ hoàn toàn `max-h-80 overflow-y-auto`, tách rời từng câu hỏi thành card độc lập (`h-auto`).
  - Hiển thị đầy đủ 4 phương án A-D và khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ.
- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.
