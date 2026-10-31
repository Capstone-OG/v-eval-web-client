# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Khắc Phục Hiện Tượng Mất Thẻ Hover Khi Rê Chuột (Hover Bridge & Grace Period) & Hoàn Thiện Tương Tác Kéo Thả Trực Tiếp

- **Khắc Phục Hiện Tượng Thẻ Hover Bị Biến Mất Khi Rê Chuột Qua (`HierarchicalMathPalette.jsx`)**:
  - Bổ sung cơ chế trì hoãn đóng thẻ an toàn `hoverCloseTimerRef` (320ms) thay vì tắt lập tức, giải quyết 100% tình trạng "kéo chuột qua cái bảng hiển thị đó thì bị mất tiêu ảo".
  - Tích hợp lớp đệm tàng hình `before:` nối liền không khoảng hở giữa danh mục sidebar và bảng hiển thị bên cạnh.
  - Bật `pointer-events-auto` kèm sự kiện `handleCardMouseEnter`, cho phép người dùng thoải mái rê chuột vào bên trong xem chi tiết, cuộn ngang xem trọn vẹn Bảng Biến Thiên (`overflow-x-auto`) mà thẻ vẫn hiển thị vững vàng.

- **Hỗ Trợ Kéo Thả & Chèn Trực Tiếp Từ Thẻ Hover**:
  - Khối Bảng biến thiên trực quan và nút "✋ Kéo thả" trên thẻ hover hỗ trợ `draggable={true}`, giáo viên có thể kéo trực tiếp từ thẻ xem trước thả vào bài soạn.
  - Bổ sung nút bấm "⚡ Nhấp chèn ngay" hỗ trợ chèn nhanh công thức/bảng biến thiên vào đúng vị trí con trỏ đang đứng trong văn bản.

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
