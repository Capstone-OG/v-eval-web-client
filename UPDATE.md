# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [17/10/2026] - Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG (Ẩn Triệt Để Mã \frac), Bộ Công Cụ Hóa Học & Toán Học Thực Tế Chèn Số & Tự Động Tính Toán (Interactive Smart Science Calculator), Xóa Bỏ Text In Preview, Tách Riêng Trang LaTeX Thuần & Desmos Calculator

- **Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG (`CurriculumStudioEditor.jsx`)**:
  - *Ẩn Hoàn Toàn Mã Code Lệnh Thô `\frac` ("frag"), `\lim`, `\Delta`, `$`*:
    + Giải quyết dứt điểm phàn nàn của người dùng khi nhìn thấy các chuỗi code LaTeX thô thiển trong khung soạn thảo thay vì ký hiệu thực tế.
    + Mặc định hiển thị chế độ **Ký Hiệu Trực Quan WYSIWYG**: Toàn bộ văn bản và công thức toán/hóa học render 100% bằng ký hiệu chuẩn sách giáo khoa (phân số có thanh kẻ ngang tử/mẫu, căn thức, tích phân, số gia, nồng độ mol), không lộ bất kỳ mã lệnh cú pháp nào.
    + Cụm nút chuyển đổi 1-chạm: `[Xem Ký Hiệu Thật (WYSIWYG)]` ⟷ `[Gõ Văn Bản Bàn Phím]` linh hoạt.
  - *Bộ Công Cụ Hóa Học Thực Tế - Chèn Số & Tự Động Tính Toán (`InteractiveFormulaBuilderModal.jsx`)*:
    + **🧪 Nồng độ mol dung dịch ($C_M = \frac{n}{V}$)**: Nhập số mol $n$ (mol) và thể tích $V$ (Lít) -> Tự động tính ra $C_M = n / V$ (M) và chèn cả phép tính: $C_M = \frac{n}{V} = \frac{0.2}{0.5} = 0.4\text{ M}$.
    + **💧 Nồng độ phần trăm ($C\% = \frac{m_{ct}}{m_{dd}} \times 100\%$)**: Nhập $m_{ct}$ và $m_{dd}$ -> Tự động tính ra $C\%$.
    + **⚖️ Khối lượng chất ($m = n \times M$)**: Nhập $n$ và $M$ -> Tự động tính ra khối lượng $m$ (gam).
    + **⚡ Hiệu suất phản ứng ($H = \frac{m_{tt}}{m_{lt}} \times 100\%$)**: Nhập $m_{tt}$ và $m_{lt}$ -> Tự động tính ra $H\%$.
  - *Bộ Tính Toán Phân Số & Đạo Hàm Số Gia SGK*:
    + **➗ Phân số tính toán ($A/B$)**: Nhập số vào ô Tử số và Mẫu số -> Tự động rút gọn và tính ra kết quả (ví dụ: $\frac{12}{4} = 3$).
    + **🎯 Đạo hàm bằng số gia ($f'(x_0) = \lim_{\Delta x \to 0}\frac{\Delta y}{\Delta x}$)**: Tự động tạo quy trình số gia đối số $\Delta x$, số gia hàm số $\Delta y$ và tính toán đạo hàm tại điểm $x_0$.
  - *Nút Thao Tác Nhanh Trên Ribbon Word Toolbar*:
    + Bổ sung 2 nút bấm chuyên dụng: `[🧪 Hóa Học & Nồng Độ]` và `[➗ Phân Số & Tính Toán]` trên thanh Ribbon của Khối 1 và Khối 2.
- **Xóa Bỏ Mô Hình Text In Preview Thụ Động & Tách Riêng Trang LaTeX Thuần Cho AI**:
  - Xóa bỏ triệt để 100% các ô "Text In Preview" thụ động bên dưới.
  - Tách riêng trang mã nguồn LaTeX chuyên biệt nền tối Dark Mode cho AI.
- **Bộ Renderer Đồ Thị Oxy / Bảng Biến Thiên Nội Sinh SGK & Desmos Calculator**:
  - `VariationTable.jsx`: Renderer Bảng biến thiên 3 dòng vector sắc nét 100%.
  - `MathGraphView.jsx`: Renderer Đồ thị hàm số Oxy vector SVG & tích hợp iframe Desmos Graphing Calculator.
  - Hỗ trợ dán ảnh màn hình clipboard `Ctrl + V` thành Base64 Data URL.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn thành trong 743ms trên Vite 8 và React 19).
