# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT SERVICE

## [12/11/2026] - Khắc Phục Triệt Để Lỗi Render KaTeX Math, Chống Nuốt Văn Bản Tiếng Việt Đa Dòng & Tách Nhãn Phương Trình Phản Ứng Hóa Học

- **Loại Bỏ Hoàn Toàn Lỗi KaTeX Syntax Đỏ (`<span class="katex-error">`) ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Tự động lọc sạch ký tự `$` chưa thoát bị kẹp bên trong công thức LaTeX (`clean.replace(/(?<!\\)\$/g, '')`) trước khi đưa vào `katex.renderToString()`.
  - Tự động cân bằng dấu ngoặc nhọn `{` và `}` giúp bảo vệ công thức đốt cháy phức tạp như `\frac{n_{CO_2} - n_{H_2O}}{k - 1}` không bao giờ bị gãy cú pháp KaTeX.

- **Bảo Vệ Ngôn Ngữ Tự Nhiên & Khử Hoàn Toàn Lỗi Nuốt Tiếng Việt Đa Dòng (`suyragốcacidlà`)**:
  - Giới hạn inline math strictly trên một dòng (`\$[^\$\r\n]+?\$`), ngăn chặn triệt để hiện tượng dấu `$` mở dở ở một dòng kết nối với dấu `$` ở dòng khác nuốt chửng nhiều dòng văn bản tiếng Việt vào math mode.
  - Bổ sung cơ chế tự động khôi phục ngôn ngữ tự nhiên: Bất kỳ khối toán học đơn (`$...$`) nào chứa nguyên âm Tiếng Việt có dấu (`àáạ...`) mà không nằm trong `\text{}` sẽ được tự động giải nén và hiển thị thành văn bản thông thường, bảo vệ 100% ngữ nghĩa của SGK.

- **Tách Nhãn Mở Đầu & Đóng Khối Phương Trình Hóa Học ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Tự động bóc tách nhãn dẫn `Phương trình: ...` hoặc `PTHH: ...`, đưa phương trình phản ứng có mũi tên (`\xrightarrow`, `\rightleftharpoons`, `\longrightarrow`) thành khối display math `$$ ... $$` căn giữa độc lập.
  - Sửa lỗi khoảng trắng sau dấu gạch dưới chỉ số `(OH)_ 3` -> `(OH)_3`.
  - Chuẩn hóa khoảng trắng công thức `C_{15}H_{31} COOH` thành `$C_{15}H_{31}COOH$`.
  - Hàn gắn công thức ester bị ngắt dòng `$C_nH_{2n}\nO_2` thành `$C_nH_{2n}O_2$`.
  - Chuẩn hóa điều kiện bất đẳng thức có dấu `$` đặt nhầm `(n \ge 2$)` thành `($n \ge 2$)`.

- **Nghiệm Thu & Triển Khai Hot-Reload Nginx**:
  - `npm run build` hoàn thành trong **2.82 giây** (3015 modules transformed, 0 Error, 0 Warning).
  - Tải lại cấu hình Nginx trong Docker container `v_eval_web_client` (`nginx -s reload`) phục vụ tức thì mã bundle mới cho domain `https://pickic.io.vn`.
