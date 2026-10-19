# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [19/10/2026] - Tái Cấu Trúc Header Chi Tiết Dạng Bài Tránh Chèn Ép Tiêu Đề, Khắc Phục Triệt Để Lỗi Mờ Tab 'Khoa Học Tự Nhiên' & Redesign Hero Banner Tone Trắng Sáng

- **Tái Cấu Trúc Header Chi Tiết Dạng Bài (`CurriculumExplorerView.jsx`)**:
  - *Khắc Phục Lỗi Tiêu Đề Bị Bóp Nghẹt, Bẻ Thành 3 Dòng*:
    + Trước đây header chi tiết dạng bài đặt cụm meta badges và tiêu đề `h2` chung trong một cột flex bên trái, song song hàng ngang với 3 nút chức năng (`Mở Studio`, `Sửa nhanh`, `Luyện tập củng cố`). Do 3 nút chiếm tới gần 500px, tiêu đề dạng bài (như "Nhận biết sự kiện lịch sử") bị ép vào khoảng trống hẹp còn lại ~180px, dẫn đến vỡ dòng thành 3 đoạn chữ cụt lủn rất xấu xí.
    + Tách cấu trúc header thành 2 hàng phân cấp rõ ràng:
      * **Hàng 1 (Top Bar)**: Meta badges (`Mã Dạng`, `Trọng số`, `Mức độ Bloom`) bố trí gọn gàng bên trái; 3 nút hành động căn chỉnh bên phải.
      * **Hàng 2 (Full-Width Title)**: Tiêu đề `h2` (`text-xl lg:text-2xl font-black text-slate-900`) độc chiếm 100% bề ngang khung nhìn, hiển thị liền mạch trên 1 dòng duy nhất, không bao giờ bị chèn ép hay vỡ chữ.

- **Khắc Phục Triệt Để Lỗi Mờ/Mất Tương Phản Tab 'Khoa Học Tự Nhiên' (`CurriculumExplorerView.jsx`)**:
  - *Gỡ Bỏ Khối Blur Nền Bị Nhuộm Màu*: Gỡ bỏ vệt trang trí `bg-cyan-50/70 blur-3xl` tại tọa độ `left-1/3 bottom-0` từng nằm trực tiếp bên dưới tab "Khoa học tự nhiên" khiến Chromium làm nhòe chữ và nhuộm mờ màu cyan.
  - *Tạo Stacking Context Độc Lập*: Bổ sung `relative z-10` và chuẩn hóa 5 tab sang nền trắng thuần `bg-white hover:bg-slate-50`, viền `border-slate-200` và văn bản `text-slate-800 font-bold` sắc nét 100%.

- **Redesign Toàn Diện Hero Banner & Thanh Chọn Miền Kiến Thức Chuẩn Tone Trắng Sáng (`CurriculumExplorerView.jsx`)**:
  - Đồng bộ 100% sang tone trắng sáng thanh lịch `bg-white border border-slate-200/80 rounded-2xl shadow-xs`, xóa bỏ khối đen lạc tone; tinh gọn padding và căn đều 5 miền năng lực trên 1 hàng ngang duy nhất (`lg:grid-cols-5`).

- **Loại Bỏ Hoàn Toàn Chữ 'text' Thừa Trước Công Thức Hóa Học & Ion (`MathText.jsx`)**:
  - Tự động tách bỏ tiền tố `text` / `\text` khi đứng liền trước các ký hiệu hóa học viết hoa ($SO_4^{2-}$, $H_2O$, $Fe^{3+}$, $KMnO_4$).

- **Chèn Công Thức Ngay Tại Vị Trí Con Trỏ (Active Caret Precision Insertion - `WordStyleFormulaCanvas.jsx` & `CurriculumStudioEditor.jsx`)**:
  - Bắt chính xác vị trí con trỏ văn bản (`activePositionRef`) chèn công thức ngay vị trí con trỏ thay vì nối xuống cuối bài.

- **Khôi Phục Giao Diện Trắng Sáng Thanh Lịch & Cây Thư Mục Accordion Toggles (`HierarchicalMathPalette.jsx`)**:
  - Khôi phục tone màu trắng sáng cho sidebar ký hiệu và tổ chức Accordion Toggle kèm tìm kiếm tức thì.

- **Tự Động Nhảy Con Trỏ Về Cuối Dòng, Bỏ Nút Dư Thừa & Sửa Lỗi Emoji `📝`**:
  - Nhấp khoảng trống tự động focus về cuối chữ, phím Enter tách dòng tự nhiên, xóa ký tự `\` cuối câu, icon Lucide sắc nét.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 763ms trên Vite 8 và React 19).
