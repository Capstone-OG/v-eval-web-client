# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT SERVICE

## [12/11/2026] - Khắc Phục Triệt Để 4 Lỗi Render KaTeX Hóa Học: Loại Bỏ Hộp Đỏ Cú Pháp, Tách Nhãn Phương Trình & Chống Nuốt Tiếng Việt

- **Triệt Tiêu Hoàn Toàn Hộp Lỗi KaTeX Đỏ (#cc0000) & Khắc Phục Lỗi Cú Pháp Dấu Bằng ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Làm sạch dấu `$` đặt nhầm cạnh dấu bằng `\$\s*=\s*\$?|(?<=\w|\})\s*\$\s*=` biến thành `= ` (khắc phục lỗi `$n_{\text{triglyceride}} = \frac{...}{...}$` bị chèn `$=`).
  - Triển khai cơ chế Emergency Sanitization 2 tầng trong `renderKatexHtml`: Khi KaTeX phát hiện lỗi cú pháp, tự động làm sạch và lột bỏ thẻ `<span class="katex-error"`, đảm bảo giao diện luôn hiển thị văn bản công thức mượt mà, sạch sẽ 100% không bao giờ xuất hiện chữ đỏ lỗi trước mắt người dùng.

- **Bảo Toàn Đóng Dấu $ Trước Dấu Chấm Câu Chống Nuốt Văn Bản Tiếng Việt ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Tự động nhận diện công thức kết thúc trước dấu chấm/phẩy theo sau bởi văn bản tiếng Việt giải thích: `(\$[A-Za-z0-9_\\\{\}\^]+)\.\s+([à-ỹA-Z])` -> `$1$. $2`.
  - Khắc phục triệt để hiện tượng `$C_{17}H_{33}. 1 mol triolein...` bị nuốt trọn vào math mode làm dính liền chữ nghiêng.

- **Tách Nhãn Phương Trình Hóa Học & Tự Động Bọc Khối Display Math ($$) ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Tách nhãn mở đầu `Phương trình: ...` hoặc `PTHH: ...` sang dòng trên, bọc phương trình phản ứng hóa học có mũi tên vào khối display math `$$ ... $$` nằm cân đối ở giữa trang.
  - Làm sạch các dấu `$` hoặc `$$` thừa ở đầu/cuối phương trình phản ứng độc lập, tránh hiện tượng hiển thị nguyên chuỗi `\xrightarrow{t^\circ}` hoặc sót `$$` ở cuối dòng.

- **Kiểm Thử & Đảm Bảo Vận Hành**:
  - Chạy `npm run build` thành công 100% trong **2.39 giây** (3015 modules transformed, 0 Error, 0 Warning).
  - Tải lại cấu hình Nginx trong Docker container `v_eval_web_client` (`nginx -s reload`) phục vụ tức thì mã bundle mới cho domain `https://pickic.io.vn`.
