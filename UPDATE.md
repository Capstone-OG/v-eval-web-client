# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT SERVICE

## [12/11/2026] - Khắc Phục Lỗi Render KaTeX Math & Bảo Vệ Toàn Vẹn Văn Bản Tiếng Việt Trong Công Thức Hóa Học

- **Loại Bỏ Hoàn Toàn Lỗi KaTeX Syntax Đỏ (`<span class="katex-error">`) ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Tự động lọc sạch ký tự `$` chưa thoát bị kẹp bên trong công thức LaTeX (`clean.replace(/(?<!\\)\$/g, '')`) trước khi đưa vào `katex.renderToString()`.
  - Tự động cân bằng dấu ngoặc nhọn `{` và `}` giúp bảo vệ công thức đốt cháy phức tạp như `\frac{n_{CO_2} - n_{H_2O}}{k - 1}` không bao giờ bị gãy cú pháp KaTeX.

- **Bảo Vệ Ngôn Ngữ Tự Nhiên & Tiếng Việt Khỏi Bị Nuốt Vào Math Mode**:
  - Gỡ bỏ regex chia tách chuỗi lỗi thời khiến các nhóm chức phân tử như `$-OH$` hoặc `$-COOH$` bị cắt thành `$-$OH$`, làm đảo lộn tính chẵn lẻ của dấu đô la `$`.
  - Bổ sung cơ chế tự động khôi phục ngôn ngữ tự nhiên: Bất kỳ khối toán học đơn (`$...$`) nào chứa nguyên âm Tiếng Việt có dấu (`àáạ...`) mà không nằm trong `\text{}` sẽ được tự động giải nén và hiển thị thành văn bản thông thường, bảo vệ 100% ngữ nghĩa của SGK.

- **Cô Lập Phương Trình Phản Ứng Độc Lập Theo Dòng (Line-by-Line Reaction Isolation)**:
  - Giới hạn phạm vi nhận diện mũi tên phản ứng (`\xrightarrow`, `\rightleftharpoons`, `\longrightarrow`) trên từng dòng riêng biệt, chỉ bọc `$$ ... $$` nếu dòng đó thuần công thức hóa học và không chứa Tiếng Việt.
  - Chấm dứt triệt để hiện tượng dính chuỗi đa dòng và lỗi thừa dấu `$$` ở cuối phương trình.

- **Nghiệm Thu & Triển Khai Hot-Reload Nginx**:
  - `npm run build` hoàn thành trong **3.06 giây** (3015 modules transformed, 0 Error, 0 Warning).
  - Tải lại cấu hình Nginx trong Docker container `v_eval_web_client` (`nginx -s reload`) phục vụ tức thì mã bundle mới cho domain `https://pickic.io.vn`.
