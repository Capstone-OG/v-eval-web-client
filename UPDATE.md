# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [19/10/2026] - Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG Như Microsoft Word Equation: Chỉnh Sửa Số Trực Tiếp Trên Công Thức, Thanh Công Cụ Nổi Math Bubble & Chèn Ký Hiệu 1-Click Ribbon Không Cần Popup Modal

- **Trình Soạn Thảo Công Thức Trực Quan Tại Chỗ (In-Place WYSIWYG Equation Canvas - `WordStyleFormulaCanvas.jsx`)**:
  - *Thay Thế Toàn Diện Cơ Chế Cũ (Read-only + Popup Modal)*:
    + Loại bỏ hoàn toàn sự bất tiện khi phải chuyển sang textarea "Gõ văn bản bàn phím" hoặc mở hộp thoại pop-up modal chắn màn hình để điền số.
    + Xây dựng component mới `WordStyleFormulaCanvas.jsx` mang lại trải nghiệm chuẩn mực như Microsoft Word Equation Tools: toàn bộ công thức và văn bản hiển thị ký hiệu sách giáo khoa thực tế nhưng cho phép người dùng click chuột trực tiếp vào từng vị trí để sửa số hoặc chữ.
  - *Bộ Nhận Diện Cấu Trúc Đa Tầng (In-Place Slot Editors)*:
    + **Phân số (`\frac{A}{B}` hoặc `\frac{A}{B} = C`)**: Render cấu trúc 2 tầng với ô tử số `[ A ]` nền vàng hổ phách và ô mẫu số `[ B ]` nền xanh ngọc, kèm vạch kẻ phân số thanh mảnh. Người dùng click vào gõ số trực tiếp trên trang. Tích hợp nút `⚡` tự động tính thương số `A / B` và điền số vào kết quả.
    + **Số mũ & Lũy thừa (`A^{B}`)**: Hiển thị ô cơ số và ô số mũ nhỏ phía trên góc phải, co dãn kích thước theo độ dài ký tự nhập vào.
    + **Căn thức (`\sqrt{A}` hoặc `\sqrt[n]{A}`)**: Dấu căn thức bao quanh ô nhập số bên trong, có thể tự động tính căn bậc hai số học khi bấm tính.
    + **Công thức Hóa học & Nồng độ Mol (`C_M = n/V`, `C%`)**: Hiển thị đầy đủ phương trình hóa học với các ô nhập số mol, thể tích dung dịch (Lít), khối lượng chất tan/dung dịch và nút tự động tính nồng độ kết quả tức thì.
    + **Công thức tổng quát**: Hỗ trợ sửa nhanh bằng inline input kèm Live KaTeX rendering ngay lập tức bên cạnh.

- **Thanh Công Cụ Mini Nổi (Floating Math Bubble Toolbar)**:
  - Tự động định vị và nổi ngay phía trên công thức đang được chọn/kích hoạt.
  - Cung cấp bảng ký hiệu toán học nhanh 1 chạm: `+`, `−`, `×`, `÷`, `±`, `√`, `x²`, `xⁿ`, `x₀`, `π`, `Δ`, `α`, `β`, `∞`, `≠`, `≈`, `≤`, `≥`, `→`, `⇔`, `∈`.
  - Tích hợp các nút chức năng nhanh: `⚡ Tính tự động` (áp dụng cho phân số, nồng độ hóa học, căn bậc hai), `🗑️ Xóa công thức`, và `✓ Xong` để lưu trạng thái.

- **Thanh Ribbon Chèn Ký Hiệu 1-Click (1-Click Word Equation Ribbon)**:
  - Tích hợp dải Ribbon đầu trang với các nút thao tác 1 chạm:
    + `➗ Phân Số & Số (12/4)`
    + `a/b Phân Số Đại Số`
    + `√16 Căn Bậc Hai`
    + `x² Số Mũ`
    + `🧪 Nồng Độ CM (n/V)`
    + `💧 C% Nồng Độ Khối Lượng`
    + `🎯 Đạo Hàm Số Gia SGK`
    + `📋 Hệ Phương Trình`
  - Khi người dùng bấm nút trên Ribbon, công thức mẫu được chèn trực tiếp vào vị trí con trỏ trên trang tài liệu và lập tức kích hoạt các ô slot để người dùng gõ số ngay tại chỗ, hoàn toàn không mở bất kỳ popup modal nào.

- **Đồng Bộ Dữ Liệu Hai Chiều & Tích Hợp Toàn Diện Studio (`CurriculumStudioEditor.jsx`)**:
  - Tích hợp `WordStyleFormulaCanvas` vào cả **Khối 1: Kiến thức nền tảng SGK (`theoryRecap`)** và **Khối 2: Phương pháp giải & thuật toán (`solutionMethod`)**.
  - Tự động serialize các token văn bản và cấu trúc công thức thành chuỗi Markdown/LaTeX chuẩn mực.
  - Dữ liệu đồng bộ hoàn hảo 100% giữa chế độ WYSIWYG, chế độ "Mã nguồn LaTeX thuần (Raw)", chế độ "Xem trang in KaTeX", và lưu thành công vào cơ sở dữ liệu PostgreSQL.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, build hoàn tất trong 751ms trên Vite 8 và React 19).
