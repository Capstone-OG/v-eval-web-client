# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [31/10/2026] - Khắc Phục Lỗi Cú Pháp Import Dấu Phẩy & Tinh Chỉnh Nút STEM Trôi Nổi Cạnh Phải Siêu Gọn Nhẹ Trong Studio Sư Phạm

- **Khắc Phục Lỗi Cú Pháp Import Dấu Phẩy & Tinh Chỉnh Nút STEM Trôi Nổi Cạnh Phải Siêu Gọn Nhẹ (`CurriculumStudioEditor.jsx`)**:
  - *Sửa Triệt Để Lỗi Cú Pháp TypeScript (TS1005 `',' expected`)*:
    + Bổ sung dấu phẩy kết thúc `Table2,` trong khối destructuring import `lucide-react`, bảo đảm 100% chuẩn cú pháp ES Module và triệt tiêu cảnh báo lỗi parser của IDE.
  - *Thiết Kế Lại Nút Neo Cạnh Phải Màn Hình Mũi Tên "<" Siêu Gọn Nhẹ (Ultra-Compact Sleek Tab)*:
    + Thu gọn toàn diện thanh tab từ 160px (`CÔNG CỤ STEM`) xuống mini-tab `[ < ✨ STEM ]` kích thước chỉ ~55px x ~20px (`pl-1.5 pr-1 py-2 rounded-l-xl`), ôm sát mép phải màn hình, triệt tiêu hoàn toàn hiện tượng che lấn nội dung trang giấy Word.
    + Tinh chỉnh chiều rộng ngăn kéo trượt `FloatingStemDrawer` từ `420px` xuống `380px` (`max-h-[86vh]`), tối ưu mật độ hiển thị High-Density.

- **Chuẩn Hóa UI Khối 4 Ngân Hàng Đề Hàng Thẳng Lối & Xóa Bỏ Nút Dán Ảnh Rời Rạc (`CurriculumStudioEditor.jsx`)**:
  - *Sắp Xếp Ngang Hàng Thẳng Lối Khối 4 & Loại Bỏ Emoji Trùng Lặp*:
    + Căn thẳng hàng 1 dòng duy nhất cho bộ đôi nút tác vụ `AI Sinh Câu Hỏi` và `Thêm Câu Hỏi Mới` tại Header Khối 4 (`flex items-center gap-2.5 shrink-0 whitespace-nowrap`), triệt tiêu hiện tượng vỡ 2 hàng gây lệch layout.
    + Loại bỏ emoji `✨` và `+` thừa trong nhãn chữ khi đã có icon Lucide `Sparkles` và `Plus` đi kèm.
  - *Loại Bỏ Hoàn Toàn Nút Dán/Tải Ảnh Rời Rạc & Tối Giản Nhãn Tiêu Đề*:
    + Gỡ bỏ hoàn toàn nút `🖼️ Dán/Tải Ảnh` thừa thãi tại Đề bài và Lời giải mẫu (giáo viên dán ảnh trực tiếp từ clipboard vào canvas bằng phím tắt `Ctrl+V`).
  - *Thống Nhất Công Cụ STEM Duy Nhất Trên Đầu & Bảng Công Cụ Trôi Nổi Cạnh Phải Mũi Tên "<"*:
    + Đưa `StemToolsDropdown` duy nhất lên thanh Header Studio trên cùng (MathLab 2D/3D, Bảng biến thiên, Phân số, Đạo hàm, Hóa học).
    + Trang bị nút trôi nổi neo cố định cạnh phải màn hình `[ < ✨ STEM ]`: Nhấp vào sẽ mở Slide-over Drawer với bộ chọn mục tiêu chèn động (`Khối 1: Nền tảng SGK`, `Khối 2: Phương pháp giải`, `Khối 4: Đề bài mẫu`, `Khối 4: Lời giải mẫu`).

- **Khung Điền Số Trực Quan Chuẩn SGK & Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (`WordStyleFormulaCanvas.jsx`)**:
  - Khung điền số trực quan dạng phân số chuẩn SGK (Tử số, gạch ngang, Mẫu số, đáp số), căn thức, lũy thừa, hóa học; bộ chuyển đổi hai chiều `latexToNaturalMath` & `naturalMathToLatex` (0% lộ mã LaTeX).
  - Nút đỏ `[ 🗑️ Xóa ]` và phím Backspace xóa gọn công thức.

- **Tích Hợp AI Sinh Câu Hỏi Trắc Nghiệm Tự Động Bám Sát Dạng Bài Vào Khối 4 Ngân Hàng Đề (`CurriculumStudioEditor.jsx`)**:
  - Bộ đôi nút tác vụ nổi bật tại Khối 4; modal sinh đề thích ứng (`AiQuestionGeneratorModal`) kết nối API 16; nút `✨ AI Tự Điền Câu Hỏi` 1-click trong hộp thoại thêm câu hỏi thủ công.
