# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Tách Rời Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết Tự Động Co Giãn Trong Studio Sư Phạm

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Xóa Bỏ Khung Cuộn Gò Bó (`CurriculumStudioEditor.jsx`)**:
  - *Giải Phóng Khung Giới Hạn Chiều Cao (max-h-80)*:
    + Loại bỏ hoàn toàn `max-h-80 overflow-y-auto` bó hẹp danh sách câu hỏi trong ngân hàng đề Khối 4.
    + Tách rời từng câu hỏi thành các Card độc lập (`p-5 rounded-2xl border border-slate-200 bg-white shadow-xs`), co giãn tự nhiên theo chiều cao thực tế (`h-auto`), triệt tiêu hiện tượng vỡ bảng biến thiên hay thanh cuộn kép.
  - *Hiển Thị Đầy Đủ 4 Phương Án A, B, C, D & Lưới Lựa Chọn Chuẩn Mực*:
    + Hiển thị lưới phương án trực quan, làm nổi bật phương án đúng màu xanh ngọc (`emerald`).
  - *Khung Lời Giải Chi Tiết Hình Chữ Nhật Tự Động Co Giãn Cân Đối*:
    + Thiết kế khung Lời giải chi tiết (`q.explanation`) thành một hình chữ nhật hoàn chỉnh (`w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs`).
    + Tự động co giãn chiều cao tương ứng với số lượng chữ và công thức (`h-auto break-words whitespace-pre-line`), đảm bảo bố cục chữ nhật vuông vức, cân đối và thẩm mỹ.

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.

- **Tối Giản Hóa Toàn Diện Bảng Slide-Over STEM Drawer (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ dropdown STEM thừa trên thanh top header; loại bỏ huy hiệu `GDPT 2018` và các badge phụ.
  - Thêm ô tìm kiếm trực tiếp (`Search input`); danh sách chỉ hiển thị Tiêu đề và Mô tả ngắn gọn (0% icon/emoji); chèn trực tiếp tại đúng dòng con trỏ.
