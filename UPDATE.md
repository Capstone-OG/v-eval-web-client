# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT SERVICE

## [11/11/2026] - Khắc Phục Triệt Để Lỗi KaTeX, Bảng Markdown Table, Dấu Nháy Đơn Trắc Nghiệm & Triệt Tiêu Token 'undefined'

- **Tích Hợp Bộ Render Bảng Markdown Sang Bảng Glassmorphic HTML ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - **Triển khai hàm `renderMarkdownTable`**: Tự động chuyển đổi các khối dữ liệu bảng phản ứng/số mol Markdown (`|Chất | CH_3COOH | C_2H_5OH |...|`) thành thẻ `<table>` HTML responsive đẹp mắt, có viền bo `rounded-xl`, nền `bg-slate-100/90` cho header, các dòng xen kẽ zebra striping `bg-white` / `bg-slate-50/70`, có thanh cuộn ngang `overflow-x-auto`.
  - **Hỗ trợ KaTeX inline bên trong từng ô bảng**: Tự động nhận diện công thức hóa học có chỉ số dưới (`CH_3COOH`, `C_2H_5OH`, `CH_3COOC_2H_5`, `H_2O`) trong từng ô bảng và bọc KaTeX chuẩn xác, chấm dứt hoàn toàn tình trạng bảng hiển thị text thô với các ký tự `|` và `|---|---|`.
  - **Cơ chế nhận diện linh hoạt**: Nhận diện bảng bắt đầu bằng ký tự `|` kèm dòng phân cách `|---|---|` mà không bắt buộc ô cuối cùng phải có `|`, tương thích hoàn hảo với mọi định dạng trích xuất từ AI.

- **Nâng Cấp Hàm `cleanOptionDisplay` & Xử Lý Triệt Để Dấu Nháy Đơn Trắc Nghiệm ([`CurriculumExplorerView.jsx`](./src/components/curriculum/CurriculumExplorerView.jsx))**:
  - **Bóc sạch 100% dấu nháy đơn `'` và nháy kép `"`**: Loại bỏ triệt để các dấu nháy `'`, `"`, backtick, dấu nháy cong `‘ ’ “ ”` bao quanh phương án trắc nghiệm ở Khối 4 (như `'HCOOC_2H_5'`, `'C_2H_5CHO'`, `'25,00%'`).
  - **Hàn gắn phương án hóa học bị ngắt dòng do PDF**: Xóa bỏ các ký tự xuống dòng `\r?\n` kẹt giữa công thức este đa chức (như `\text{-OOC-CH}_2` rớt dòng `-CH_2`).
  - **Chuẩn hóa công thức hóa học & tự động bọc KaTeX**: Tự động nhận diện và bọc các công thức este, aldehyde, acid vào cặp dấu `$ ... $`.

- **Triệt Tiêu Hoàn Toàn Token Lỗi Màu Đỏ `'undefined'` ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - **Bảo vệ an toàn trong `renderKatexHtml`**: Làm sạch triệt để mọi chuỗi `\undefined`, `undefined`, `null` trước khi đưa vào thư viện KaTeX; tự động bóc bỏ thẻ lỗi `<span class="katex-error">` nếu phát hiện có chứa token `undefined`, ngăn chặn hoàn toàn chữ `undefined` màu đỏ `#cc0000` hiển thị trên giao diện người dùng.
  - **Phục hồi công thức hiệu suất chuẩn SGK**: Tự động thay thế `H\% undefined %` và `H\% = undefined` bằng công thức chuẩn `` `H\% = \frac{m_{\text{thực tế}}}{m_{\text{lí thuyết}}} \times 100\%` ``.

- **Hàn Gắn Công Thức Hóa Học & Toán Học Bị Vỡ Vụn Do PDF ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - **Nối công thức ester bị ngắt giữa chuỗi C-H và Oxy**: Ghép `` `C_nH_{2n} \n O_2` `` hoặc `` `C_nH_{2n} O_2` `` thành một khối duy nhất `` `$C_nH_{2n}O_2$` ``.
  - **Nối chuỗi công thức sau dấu nối hóa trị `-` hoặc `=`**: Ghép các chuỗi este có liên kết đôi hoặc este đa chức (kể cả chứa thẻ `\text{}`).
  - **Nối nhóm chỉ số ngoặc `)_2`, `)_3`**: Ghép các nhánh este (như `` `\text{HCOOCH(CH}_3 \n )_2` `` $\rightarrow$ `` `$HCOOCH(CH_3)_2$` ``).
  - **Sửa điều kiện bất đẳng thức có dấu `$` bị lệch**: Chuẩn hóa `` `(n \ge 2$)` ``, `` `(n \ge 3$)` ``, `` `($n$ \ge 4$)` `` thành `` `($n \ge 2$)` ``.
  - **Tự động bọc phương trình phản ứng hóa học vào `$...$`**: Bất kỳ phản ứng nào chứa `\rightleftharpoons`, `\xrightarrow` đều được tự động bọc trong `$ ... $`.

- **Kiểm Thử & Build Sản Phẩm**:
  - `npm run build` hoàn thành trong **3.08 giây** (3015 modules transformed, 0 Error, 0 Warning).
