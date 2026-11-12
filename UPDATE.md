# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [13/11/2026] - Tối Ưu Bộ Render KaTeX/MathText An Toàn & Khởi Chạy Local Dev Server Vite Qua Terminal (Port 5173)

- **Nâng Cấp Bộ Tiền Xử Lý Công Thức Toán & Hóa Học ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Khôi phục mã lệnh đơn vị rụng gạch chéo: `textmol`, `textgam`, `textg`, `textkg` -> `\text{mol}`, `\text{gam}`.
  - Mở rộng tập toán tử suy luận và so sánh: `\implies`, `>`, `<`, `\ge`, `\le`, `\approx`, `\equiv`, `\rightleftharpoons`, `\xrightarrow`.
  - Tự động bọc biến số đơn trước đơn vị đo: `([amVnxy])\s+(mol|gam|g|kg|lít|lit|ml)` -> `$1 $2` (ví dụ: `$a$ mol`, `$V$ lít`).
  - Chuẩn hóa chỉ số dưới tiếng Việt cho hóa học: `k_{gốc}` -> `k_{\text{gốc}}`, `m_{dd}` -> `m_{\text{dd}}`.
  - Thay thế chuỗi thay thế `'$$$1$$'` bằng hàm lambda match evaluator an toàn `(m, g) => '$' + g + '$'` nhằm triệt tiêu hoàn toàn lỗi ký tự escape sinh ra chuỗi `\$` lỗi trên MD Editor Plus / Chromium.

- **Vận Hành Trực Tiếp Qua Terminal (Không Dùng Docker)**:
  - Khởi chạy Web Client React 19 / Vite dev server trực tiếp tại `http://localhost:5173`.
  - Kết nối đồng bộ với API Gateway YARP (`http://localhost:5212`) và .NET 9 AI Engine (`http://localhost:5104`).
  - Toàn bộ giao diện Panoramic Workspace và Studio Sư phạm hiển thị mượt mà, sẵn sàng kiểm thử dữ liệu bóc tách chuyên đề thực tế.

- **Đồng bộ [`MathText.jsx`](./src/components/common/MathText.jsx)**: hỗ trợ số mũ & ngoặc đơn trong biểu thức nhiều vế, bỏ qua khớp nằm trong `$...$`, tách ngoặc không cân bằng ra ngoài công thức.

- **Khắc Phục Lỗi KaTeX Trần Do Web Client Gỡ `$` Nhầm (Lần 2)**:
  - Nguyên nhân gốc: bộ phục hồi trong [`MathText.jsx`](./src/components/common/MathText.jsx) dò từ tiếng Việt (`chất`, `muối`...) ngay cả bên trong `\text{...}` và `_{...}`, nên gỡ `$` của các công thức hợp lệ như `$n_{\text{NaOH}} = 3 \times n_{\text{chất béo}}$`. Nay chỉ dò phần ngoài `\text{}`/`_{}`/`^{}`.
  - Bộ nhận diện phương trình không còn nuốt xuống dòng kế tiếp (chỉ `[ \t]` giữa các vế); chỉ số dưới cho phép ngoặc đơn (`m_{muối (xà phòng)}`).
  - Kiểm chứng JS bằng Node trên các ca ảnh lỗi và 49/49 unit tests C# pass.
