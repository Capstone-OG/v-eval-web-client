# Nhật Ký Cập Nhật (Update Log) - Web Client

## [15/10/2026] - Kiến Trúc Soạn Thảo Đa Chế Độ: Soạn Thảo Trực Quan (Text In Preview Chuẩn Học Sinh) Song Hành Mã Nguồn LaTeX Thuần (Nhập Nhanh Từ AI)

- **Kiến Trúc Soạn Thảo Đa Chế Độ Trực Quan & Mã Nguồn LaTeX Song Hành (`CurriculumStudioEditor.jsx`)**:
  - *Đáp Ứng Đúng Bản Chất Soạn Thảo Sư Phạm (Text In Preview)*:
    - Loại bỏ hoàn toàn giải pháp phân rã 4 ô form cứng nhắc (Định nghĩa, Công thức, Quy tắc, Hình ảnh) gây cắt vụn luồng tư duy sư phạm của giáo viên.
    - Chế độ **Soạn Thảo Trực Quan (Text In Preview - Chuẩn Học Sinh)**:
      + Khung soạn thảo văn bản liền mạch tích hợp thanh công cụ nhanh (`+ Khối công thức $$...$$`, `+ Gạch đầu dòng`).
      + **Khung Hiển Thị Trực Quan (Text In Preview - Giao Diện Học Sinh Thấy)** hiển thị song hành ngay bên dưới ô nhập: Render trực tiếp công thức toán học KaTeX thật (phân số, căn thức, giới hạn, tích phân, hình ảnh đồ thị), phản ánh chính xác 100% giao diện học sinh nhìn thấy.
    - Chế độ **Mã Nguồn LaTeX Thuần (Nhập Nhanh Từ AI)**:
      + Khung soạn thảo monospace nền tối chuyên dụng cho việc copy-paste nhanh 1-chạm kết quả trích xuất từ Gemini / ChatGPT / AI Engine mà không qua xử lý trung gian.
  - *Cơ Chế Chèn Ký Hiệu KaTeX STEM Chuẩn Xác Tại Vị Trí Con Trỏ (Cursor-Precision Insertion Engine)*:
    - Sử dụng `textareaRefs` theo dõi chính xác vị trí con trỏ chuột (`selectionStart` / `selectionEnd`) trên từng textarea đang active.
    - Khi giáo viên click vào bất kỳ ký hiệu nào trên Bảng KaTeX STEM 10 danh mục (hơn 120+ công thức toán học), công thức tự động chèn đúng vị trí con trỏ và tự động focus lại mà không bị nhảy lên đầu trang hay cuối trang.
  - *Đồng Bộ Khối 2 - Phương Pháp Giải Chuyên Biệt*:
    - Hỗ trợ cả 2 chế độ: Soạn thảo trực quan xem trước thẻ bẫy đề thi (Rose Alert) và mẹo Casio (Indigo Tip) sống động, song song với chế độ mã nguồn LaTeX thuần để nạp nhanh từ AI.
- **Khắc Phục Triệt Để Ký Tự Thoát `\n` Bị Hiển Thị Thô Dạng Text (`MathText.jsx`)**:
  - *Negative Lookahead Chính Xác*: Thay thế regex cũ bằng danh sách bảo vệ đúng 15 lệnh LaTeX bắt đầu bằng `\n` (`` `\neq` ``, `` `\notin` ``, `` `\nabla` ``, `` `\nu` ``...). Giải phóng 100% các từ tiếng Việt và ngắt dòng thực tế (`` `\nTrong` ``, `` `\nKiểm` ``, `` `\nBước` ``).
  - *Đồng Bộ Textarea Biên Soạn*: Xuất hàm `unescapeLiteralNewlines` giải phóng `\n` thành Enter xuống dòng thực tế khi nạp lý thuyết và phương pháp giải vào khung soạn thảo Studio.
- **Tự Động Bọc KaTeX Cho Ion Đa Nguyên Tử & Hợp Chất Hóa Học**:
  - Tự động nhận diện và bọc KaTeX cho ion đơn/đa nguyên tử có điện tích: `` `H^+` ``, `` `OH^-` ``, `` `SO_4^{2-}` ``, `` `NO_3^-` ``, `` `Fe^{3+}` ``, `` `Na^+` ``, `` `Cl^-` ``.
  - Tự động nhận diện và bọc KaTeX cho các hợp chất có chỉ số dưới: `` `H_2O` ``, `` `H_2SO_4` ``, `` `HNO_3` ``, `` `CO_2` ``, `` `Fe_2O_3` ``, `` `KMnO_4` ``.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 750ms).
