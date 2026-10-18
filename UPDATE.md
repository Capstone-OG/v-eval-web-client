# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [19/10/2026] - Chuẩn Hóa Toàn Diện Studio Soạn Thảo Sư Phạm WYSIWYG: Chèn Công Thức Tại Vị Trí Con Trỏ, Giao Diện Trắng Sáng Thanh Lịch, Cây Thư Mục Accordion Hợp Chất & Ký Hiệu Đồ Sộ, Nhấp Khoảng Trống Nhảy Cuối Dòng & Xóa Sổ Lỗi Ký Tự

- **Chèn Công Thức Ngay Tại Vị Trí Con Trỏ (Active Caret Precision Insertion - `WordStyleFormulaCanvas.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Khắc Phục Lỗi Chèn Rơi Xuống Cuối Văn Bản*: Trước đây khi giáo viên đang soạn thảo trên canvas WYSIWYG và nhấp chọn ký hiệu từ sidebar hoặc thanh tra, hệ thống không tìm thấy `textarea` nên fallback nối chuỗi vào cuối văn bản (`. a/b a/b a/b`).
  - *Giải Pháp Bắt Con Trỏ Tinh Vi*:
    + Nâng cấp `WordStyleFormulaCanvas` bằng `forwardRef` và `useImperativeHandle`, xuất bản phương thức `insertSnippet(latexSnippet)`.
    + Theo dõi liên tục vị trí con trỏ `activePositionRef.current = { lineId, tokenId, offset }` thông qua các sự kiện `onKeyUp`, `onMouseUp`, `onFocus`, `onInput`.
    + Khi giáo viên nhấp chọn ký hiệu, hệ thống chia tách chính xác đoạn text token hiện tại tại `offset`, chèn token công thức `formulaToken` vào ngay vị trí con trỏ và tự động đưa tiêu điểm ra sau công thức mới chèn để giáo viên tiếp tục gõ văn bản liền mạch.
    + Kết nối `theoryCanvasRef` và `methodCanvasRef` trong `CurriculumStudioEditor.jsx`, tự động điều hướng luồng chèn vào đúng canvas đang kích hoạt.

- **Khôi Phục Giao Diện Trắng Sáng Thanh Lịch (Clean White Tone Reversion - `HierarchicalMathPalette.jsx`)**:
  - *Loại Bỏ Hoàn Toàn Giao Diện Tối (Dark Theme)*: Chuyển toàn bộ khung thanh công cụ từ `bg-slate-900` sang tone màu trắng sáng sang trọng `bg-white border-r border-slate-200 text-slate-800 shadow-sm`.
  - *Chuẩn Hóa Bộ Nhận Diện Sư Phạm Nền Sáng*:
    + Header và thanh lọc danh mục: Nền `bg-slate-50/90 border-slate-200`, chữ `text-slate-800`.
    + Nút môn học (Toán, Hóa, Lý, Ký hiệu): Nút kích hoạt `bg-cyan-600 text-white font-bold shadow-xs`, nút không kích hoạt `bg-white text-slate-600 hover:bg-slate-100 border-slate-200/80`.
    + Nút công thức: Nền sáng nhẹ `bg-slate-50 hover:bg-cyan-50/80 border border-slate-200 hover:border-cyan-400 text-slate-700 hover:text-cyan-900 shadow-2xs`.
    + Thẻ nổi 2 giây (Hover Card): Nền trắng mờ cao cấp `bg-white/98 text-slate-900 border-2 border-cyan-500 shadow-2xl`, khung KaTeX nền `bg-slate-50 text-cyan-900`.

- **Cây Thư Mục Accordion Toggles & Kho Tàng Ký Hiệu, Hợp Chất Đồ Sộ (`HierarchicalMathPalette.jsx`)**:
  - *Cấu Trúc Accordion Toggle Cây Thư Mục (Folder Tree Navigation)*:
    + Thay thế thanh cuộn ngang đơn điệu bằng các thư mục Accordion có thể mở/đóng linh hoạt (`ChevronDown` / `ChevronRight`).
    + Hiển thị nhãn đếm số lượng công thức trong từng mục (ví dụ: `12`, `14`, `16`).
    + Tên nút ngắn gọn, súc tích (chỉ chứa ký hiệu hoặc tên viết tắt: `a/b`, `√x`, `H₂SO₄`, `SO₄²⁻`, `NaOH`, `x²`, `∫`, `lim`, `sin`, `cos`...), bố trí lưới 2 cột gọn gàng, tăng gấp 5 lần mật độ hiển thị mà không gây rối mắt.
  - *Bổ Sung Thanh Tìm Kiếm Tức Thì (Instant Search Filter)*:
    + Tích hợp ô tìm kiếm `🔍 Tìm nhanh H2SO4, NaOH, √x, a/b, sin...` ở đầu sidebar, lọc trực tiếp hàng trăm công thức trong thời gian thực.
  - *Thư Viện Hóa Học & Toán Học Chuyên Sâu GDPT 2018*:
    + **Toán Học**: Đại số & Căn thức, Đạo hàm & Khảo sát hàm số, Tích phân & Giới hạn, Lượng giác, Mũ & Logarit, Hình học Không gian & Oxyz, Số phức & Xác suất.
    + **Hóa Học**: Axit vô cơ & hữu cơ ($H_2SO_4, HCl, HNO_3, H_3PO_4, CH_3COOH...$), Bazơ & Kiềm ($NaOH, KOH, Ba(OH)_2, Cu(OH)_2, Fe(OH)_3, NH_3...$), Muối ($NaCl, CaCO_3, BaSO_4, CuSO_4, FeSO_4, NaHCO_3...$), Oxit ($CO_2, SO_2, P_2O_5, Fe_2O_3, CuO, Al_2O_3...$), Hợp chất hữu cơ ($CH_4, C_2H_4, C_2H_2, C_6H_6, C_2H_5OH, CH_3CHO, HCOOCH_3, Gly, Ala, C_6H_{12}O_6...$), Cation & Anion ($H^+, OH^-, Na^+, Ca^{2+}, Fe^{2+}, Fe^{3+}, Al^{3+}, SO_4^{2-}, NO_3^-, CO_3^{2-}...$), Số oxi hóa ($0, +1, +2, +3, +6, -2...$), Mũi tên phản ứng ($\rightarrow, \rightleftharpoons, \uparrow, \downarrow, \xrightarrow{t^\circ}, \xrightarrow{xt}$), Công thức tính nồng độ & mol ($C_M, C\%, n=m/M, pH$).
    + **Vật Lý**: Dao động cơ ($x, v, a, T$), Sóng cơ & âm ($\lambda, u, L$), Điện xoay chiều ($i, u, Z, Z_L, Z_C, P$), Sóng ánh sáng & Lượng tử ($i, \varepsilon, E=mc^2, \Delta m$).
    + **Ký Hiệu & Logic**: $\pm, \mp, \times, \div, \neq, \approx, \le, \ge, \infty, \pi, \Delta, \alpha, \beta, \theta, \lambda, \Omega, \Rightarrow, \Leftrightarrow, \in, \notin, \forall, \exists, \mathbb{R}, \mathbb{N}, \mathbb{Z}, \emptyset$.

- **Tự Động Nhảy Con Trỏ Về Cuối Dòng Khi Nhấp Khoảng Trống (Whitespace Click Focus - `WordStyleFormulaCanvas.jsx`)**:
  - Bổ sung hàm xử lý `handleLineRowClick` trên từng dòng văn bản: Nếu người dùng nhấp chuột vào vùng đệm trống bên phải hoặc khoảng trắng của dòng, hệ thống tự động tìm thẻ text cuối dòng, kích hoạt `focus()` và kéo con trỏ về cuối chữ bằng `Selection.collapse()`.

- **Loại Bỏ Nút "+ Thêm dòng mới" Dư Thừa & Xóa Bỏ Dấu Gạch Chéo Ngược Đuôi Dòng (`\`)**:
  - *Bỏ Nút Dư Thừa*: Thao tác bấm `Enter` đã hỗ trợ tách dòng mới mượt mà, loại bỏ nút bấm rườm rà dưới chân canvas.
  - *Xóa Sổ Ký Tự `\` Cuối Dòng*: Bổ sung hàm lọc `sanitizeLineText` và regex stripping trên `WordStyleFormulaCanvas.jsx` và `MathText.jsx`, loại bỏ hoàn toàn các ký tự `\` hoặc `/` thừa ở cuối câu (`liên kết ion.\`, `Ví dụ minh họa SGK:\`).

- **Khắc Phục Lỗi Hiển Thị Emoji `📝`**:
  - Thay thế biểu tượng cảm xúc `📝` bằng các icon vector Lucide sắc nét (`FileEdit`, `FileText`, `BookOpen`, `AlertTriangle`, `Sparkles`), đảm bảo hiển thị 100% đồng nhất trên mọi hệ điều hành Windows và trình duyệt.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 773ms trên Vite 8 và React 19).
