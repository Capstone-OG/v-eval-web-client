# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Loại Bỏ Banner Xanh Lá Live Preview & Tối Ưu Không Gian Xem Trước Trong Studio Sư Phạm

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - *Gỡ Bỏ Hoàn Toàn Thanh Banner "Giao Diện Trực Quan Học Sinh Nhìn Thấy (Live Preview) - Thời gian thực"*:
    + Gỡ bỏ banner xanh ngọc (`bg-gradient-to-r from-emerald-600 to-teal-600`) ở đỉnh cột phải xem trước của chế độ Chia đôi (Split) và Xem trước (Preview).
    + Tiết kiệm ~60px chiều cao màn hình, giúp khung bài học mô phỏng của học sinh (`Simulated Student Container`) hiển thị ngay trên cùng, tạo cảm giác thoáng đãng, tinh tế và chuyên nghiệp.

- **Tối Giản Hóa Toàn Diện Bảng Slide-Over STEM Drawer (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ hoàn toàn dropdown STEM thừa trên thanh top header; loại bỏ huy hiệu `GDPT 2018` và các badge phụ.
  - Bổ sung ô tìm kiếm trực tiếp (`Search input`) ở đầu bảng; danh sách công cụ chỉ hiển thị Tiêu đề và Mô tả ngắn gọn (0% icon/emoji).
  - Tự động bắt mục tiêu và loại bỏ dropdown thủ công `🎯 Chèn vào mục`.

- **Động Cơ Chèn Khối Đồ Thị, Bảng Biến Thiên & Công Thức Chuẩn Xác Tại Con Trỏ (`WordStyleFormulaCanvas.jsx`)**:
  - Chèn trực tiếp tại đúng chỉ mục dòng (`targetIdx`) con trỏ đang đứng thay vì vứt xuống cuối tài liệu.
