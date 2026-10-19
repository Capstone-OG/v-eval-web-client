# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [19/10/2026] - Redesign Toàn Diện Banner Lộ Trình Chuẩn Tone Trắng Sáng & Tinh Gọn: Đồng Bộ Thẩm Mỹ Nền Trắng, Căn Đều 5 Miền Năng Lực & Loại Bỏ Hoàn Toàn Khối Đen Lạc Tone

- **Redesign Toàn Diện Hero Banner & Thanh Chọn Miền Kiến Thức Chuẩn Tone Trắng Sáng (`CurriculumExplorerView.jsx`)**:
  - *Khắc Phục Lệch Tone Màu "Trên Đen Dưới Trắng"*:
    + Trước đây banner đầu trang sử dụng gradient nền tối (`bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900`) tương phản đột ngột và lệch tone hoàn toàn so với toàn bộ giao diện nền sáng của hệ thống.
    + Chuyển đổi 100% sang **Tone Trắng Sáng Thanh Lịch**: `bg-white border border-slate-200/80 rounded-2xl shadow-xs`, điểm xuyết vệt sáng mờ tinh tế (`bg-indigo-50/70`, `bg-cyan-50/70 blur-3xl`).
  - *Thiết Kế Tinh Gọn, Đơn Giản & Hiện Đại*:
    + Giảm padding cồng kềnh từ `p-8` xuống `p-5 lg:p-6` giúp tiết kiệm chiều cao màn hình, thông thoáng và vừa vặn khung nhìn.
    + Title `text-xl lg:text-2xl font-black text-slate-900`, badge `bg-indigo-50 text-indigo-700` nhỏ gọn, tinh tế.
    + Chuyển 2 khối thống kê "Cấu trúc phân cấp" và "Trọng số chuẩn hóa 1.200 Điểm" từ dạng hộp to thành các chip ngang compact `px-3.5 py-2 rounded-xl bg-slate-50/90 border border-slate-200/80` căn thẳng hàng với tiêu đề.
  - *Căn Đều 5 Miền Năng Lực Trên 1 Hàng Ngang Duy Nhất (`lg:grid-cols-5`)*:
    + Thay thế lưới `grid-cols-4` (vốn làm miền thứ 5 "Sử dụng Ngôn ngữ" bị rớt xuống hàng 2 cô độc) bằng lưới 5 cột hoàn hảo `lg:grid-cols-5`.
    + Tab kích hoạt (Active): Nền `bg-indigo-50/90 border-2 border-indigo-500 text-slate-900 shadow-xs ring-2 ring-indigo-500/10`, icon đổi sang gradient màu rực rỡ.
    + Tab chưa kích hoạt: Nền `bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-700`, chuyển động hover êm ái.

- **Loại Bỏ Hoàn Toàn Chữ 'text' Thừa Trước Công Thức Hóa Học & Ion (`MathText.jsx`)**:
  - *Khắc Phục Lỗi Hiển Thị KaTeX Nghiêng*: Bổ sung bộ lọc trong hàm `normalizeMathString` tự động tách bỏ tiền tố `text` / `\text` khi đứng liền trước các ký hiệu hóa học viết hoa ($SO_4^{2-}$, $H_2O$, $Fe^{3+}$, $KMnO_4$).

- **Chèn Công Thức Ngay Tại Vị Trí Con Trỏ (Active Caret Precision Insertion - `WordStyleFormulaCanvas.jsx` & `CurriculumStudioEditor.jsx`)**:
  - Bắt chính xác vị trí con trỏ văn bản (`activePositionRef`) chèn công thức ngay vị trí con trỏ thay vì nối xuống cuối bài.

- **Khôi Phục Giao Diện Trắng Sáng Thanh Lịch & Cây Thư Mục Accordion Toggles (`HierarchicalMathPalette.jsx`)**:
  - Khôi phục tone màu trắng sáng cho sidebar ký hiệu và tổ chức Accordion Toggle kèm tìm kiếm tức thì.

- **Tự Động Nhảy Con Trỏ Về Cuối Dòng, Bỏ Nút Dư Thừa & Sửa Lỗi Emoji `📝`**:
  - Nhấp khoảng trống tự động focus về cuối chữ, phím Enter tách dòng tự nhiên, xóa ký tự `\` cuối câu, icon Lucide sắc nét.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 3.47s trên Vite 8 và React 19).
