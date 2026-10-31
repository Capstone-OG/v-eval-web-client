# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [31/10/2026] - Chuẩn Hóa UI Khối 4 Ngang Hàng Thẳng Lối, Xóa Bỏ Nút Dán Ảnh, Bảng Công Cụ STEM Trôi Nổi Cạnh Phải Màn Hình Mũi Tên "<" & AI Sinh Đề (API 16)

- **Chuẩn Hóa UI Khối 4 Ngân Hàng Đề Hàng Thẳng Lối, Xóa Bỏ Nút Dán Ảnh & Bảng Công Cụ STEM Trôi Nổi Cạnh Phải Màn Hình (`CurriculumStudioEditor.jsx`)**:
  - *Sắp Xếp Ngang Hàng Thẳng Lối Khối 4 & Loại Bỏ Emoji Ký Tự Trùng Lặp*:
    + Căn thẳng hàng 1 dòng duy nhất cho bộ đôi nút tác vụ `AI Sinh Câu Hỏi` và `Thêm Câu Hỏi Mới` tại Header Khối 4 (`flex items-center gap-2.5 shrink-0 whitespace-nowrap`), triệt tiêu hiện tượng co cụm bẻ 2 hàng gây kênh lệch layout.
    + Khử triệt để ký hiệu trùng lặp: Loại bỏ emoji `✨` và `+` thừa trong text nhãn khi đã có icon Lucide `Sparkles` và `Plus` đi kèm, mang lại diện mạo chỉn chu, chuyên nghiệp.
  - *Loại Bỏ Hoàn Toàn Nút Dán/Tải Ảnh Rời Rạc & Tối Giản Nhãn Tiêu Đề*:
    + Gỡ bỏ hoàn toàn nút `🖼️ Dán/Tải Ảnh` thừa thãi tại tiểu mục Đề bài và Lời giải mẫu (giảng viên dán ảnh trực tiếp từ clipboard vào canvas bằng phím tắt `Ctrl+V` tiện lợi).
    + Tối giản và làm sạch nhãn tiểu mục, xóa bỏ toàn bộ nút phụ gây xao nhãng.
  - *Thống Nhất Công Cụ STEM Duy Nhất Trên Đầu & Bảng Công Cụ Trôi Nổi Cạnh Phải Mũi Tên "<"*:
    + Gỡ bỏ toàn bộ các nút dropdown STEM rải rác bên trong từng khối (Khối 1, Khối 2, Khối 4) để tránh phân mảnh giao diện.
    + Đưa `StemToolsDropdown` duy nhất lên thanh Header Studio trên cùng, tích hợp đầy đủ MathLab 2D/3D, Bảng biến thiên, Phân số, Đạo hàm, Hóa học.
    + Trang bị nút trôi nổi neo cố định cạnh phải màn hình `[ < ✨ CÔNG CỤ STEM ]`: Nhấp vào sẽ trượt ra Bảng Công Cụ Studio Toàn Năng (`FloatingStemDrawer`) với bộ chọn mục tiêu chèn động (`Khối 1: Nền tảng SGK`, `Khối 2: Phương pháp giải`, `Khối 4: Đề bài mẫu`, `Khối 4: Lời giải mẫu`) cùng đầy đủ các công cụ chuyên sâu MathLab 2D/3D, Bảng biến thiên, Phân số, Vi tích phân, Hóa học và Thư viện ký hiệu 7 môn học.

- **Khung Điền Số Trực Quan Chuẩn SGK & Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (`WordStyleFormulaCanvas.jsx`)**:
  - *Khung Điền Số & Biểu Thức Trực Quan (Interactive Visual Slots) Dạng Phân Số Chuẩn SGK*:
    + Phân số: Hiển thị dạng phân số dọc với ô nhập Tử số (trên), thanh gạch ngang, ô nhập Mẫu số (dưới), dấu `=` và ô Đáp số. Nhập và xóa số trực tiếp tự do.
    + Căn thức, Lũy thừa, Hóa học: Các ô điền số rõ ràng kèm nút `⚡ Tính` tự động cho kết quả chuẩn xác.
  - *Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (0% Lộ Mã LaTeX)*: Hỗ trợ gõ toán tự nhiên (`12/4 = 3`, `căn(16) = 4`, `(x+1)/(x-1) = 5`), không bao giờ để lộ mã LaTeX.
  - *Cơ Chế Xóa Công Thức 1-Click & Phím Tắt Backspace Tự Nhiên*: Nút đỏ `[ 🗑️ Xóa ]` và phím Backspace xóa gọn công thức.

- **Tích Hợp AI Sinh Câu Hỏi Trắc Nghiệm Tự Động Bám Sát Dạng Bài Vào Khối 4 Ngân Hàng Đề (`CurriculumStudioEditor.jsx`)**:
  - Bộ đôi nút tác vụ nổi bật tại Khối 4; modal sinh đề thích ứng (`AiQuestionGeneratorModal`) kết nối API 16; nút `✨ AI Tự Điền Câu Hỏi` 1-click trong hộp thoại thêm câu hỏi thủ công.
