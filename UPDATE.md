# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [20/10/2026] - Hợp Nhất Động Cơ MathLab JSXGraph Nội Sinh, Tùy Chỉnh Tọa Độ (X,Y,Z) & Đổi Tên Đỉnh Không Gian 3D, Bộ Kẻ Đường Phụ Tự Do & Hệ Thống Đồ Thị VD/VDC GDPT 2018

- **Thống Nhất Động Cơ Toán Học Tương Tác JSXGraph Nội Sinh (`InteractiveMathWorkbenchModal.jsx`)**:
  - *Loại Bỏ Hoàn Toàn GeoGebra*: Tách biệt triệt để khỏi web-applet bên thứ ba, loại bỏ phụ thuộc iframe mạng và độ trễ tải trang. Toàn bộ phân hệ MathLab chuyển đổi 100% sang engine vector JSXGraph v1.14.0 nội sinh, hoạt động ngoại tuyến (offline), tốc độ vẽ mượt mà 60 FPS Canvas/SVG.
  - *Chuẩn Hóa Ribbon & Navigation Header*: Tinh giản tiêu đề và nút kích hoạt trên thanh Ribbon (`CurriculumStudioEditor.jsx` và `CurriculumExplorerView.jsx`) về nhãn chuẩn `⚡ MathLab 2D/3D (JSXGraph)`.

- **Bộ Công Cụ Tùy Chỉnh Tọa Độ (X,Y,Z) & Đổi Tên Các Đỉnh Hình Học Không Gian 3D (`InteractiveMathWorkbenchModal.jsx`)**:
  - *Công Tắc Tùy Chỉnh Đỉnh (`isCustomizingBasePoints`)*: Bổ sung toggle trực quan `⚙️ Tùy chỉnh vị trí (X, Y, Z) & Đổi tên các đỉnh` nằm ngay dưới bộ chọn 9 loại hình không gian THPT.
  - *Bảng Điều Khiển Tọa Độ Vi Mô*: Cho phép giáo viên đổi tên bất kỳ đỉnh nào của hình (ví dụ `A` thành `M`, `S` thành `P`, `A'` thành `A₁`) và nhập tọa độ thực `(X, Y, Z)` với bước nhảy 0.2.
  - *Phản Hồi Trực Quan Thời Gian Thực*: Mọi sự thay đổi về tọa độ đỉnh sẽ làm co giãn, tịnh tiến và cập nhật tức thì toàn bộ các cạnh, đường bao, mặt đáy, đường vuông góc phụ và thiết diện trên khung nhìn không gian 3D.
  - *Nút Reset Mặc Định*: Tích hợp nút `🔄 Mặc định` khôi phục lại 100% tên đỉnh và tọa độ gốc chuẩn SGK của hình khối đang chọn chỉ với 1 cú click.

- **Mở Rộng Thư Viện Hình Học Không Gian Đa Dạng & Bộ Kẻ Thêm Đường Phụ Tự Do (`InteractiveMathWorkbenchModal.jsx`)**:
  - *9 Loại Hình Không Gian Chuẩn Kỳ Thi THPT*: Hỗ trợ toàn diện Chóp `S.ABCD` (`SA` vuông góc đáy), Chóp `S.ABC` (đáy vuông tại `B`), Chóp Tứ Giác Đều (`SO` vuông góc đáy), Chóp Tam Giác Đều (`SG` vuông góc đáy), Chóp có mặt bên vuông góc đáy (`(SAB)` vuông góc `(ABCD)`), Lăng trụ tam giác `ABC.A'B'C'`, Hình hộp chữ nhật / Hình lập phương `ABCD.A'B'C'D'`, Nón/Trụ tròn xoay, và Mặt cầu cắt mặt phẳng Oxyz.
  - *Bộ Mô Hình Dựng Đường Phụ Kinh Điển (Presets)*: Tích hợp sẵn mô hình 2 bước kẻ khoảng cách `d(A, (SBC)) = AK` (với `AH` vuông góc `BC`, `AK` vuông góc `SB`), góc giữa đường thẳng và mặt phẳng, và thiết diện `(MNPQ)` qua các trung điểm.
  - *Tự Do Thêm Điểm Phụ Trên Cạnh*: Cho phép chọn cạnh, đặt tên điểm, chọn tỉ lệ `k` (có nút nhanh `1/2` Trung điểm, `1/3` Trọng tâm) để tạo đỉnh mới nội suy tức thì.
  - *Bộ Kẻ Đoạn Thẳng Phụ Tùy Biến*: Nối bất kỳ 2 điểm nào trong không gian (kể cả đỉnh tùy biến và điểm phụ mới tạo), hỗ trợ tùy chọn nét đứt khuất SGK hoặc nét liền, chọn màu nét (Đỏ, Vàng cam, Tím neon, Xanh lá, Xanh dương).

- **Hệ Thống Đồ Thị Hàm Số Vận Dụng & Vận Dụng Cao (VD / VDC) GDPT 2018 (`InteractiveMathWorkbenchModal.jsx`)**:
  - *Chuyên Đề 1 - Khảo Sát & Phân Thức Tiệm Cận Xiên (Điểm Nhấn GDPT 2018)*: Hàm số `y = (ax² + bx + c)/(dx + e)` tự động vẽ đường tiệm cận đứng, đường tiệm cận xiên nét đứt và đánh dấu tâm đối xứng `I`.
  - *Chuyên Đề 2 - Biến Đổi Đồ Thị Chứa Dấu Giá Trị Tuyệt Đối Phức Hợp*: Hỗ trợ `y = |f(x)|`, `y = f(|x|)`, `y = |f(|x|)|`, `y = |f(x) + m|` (kèm slider tham số `m` dịch chuyển đồ thị và đếm số cực trị), và `y = f(x) + |f(x)|`.
  - *Chuyên Đề 3 - Đồ Thị Đạo Hàm f'(x) & Tương Giao Hàm Hợp*: Hiển thị đường cong `y = f'(x)`, vẽ đường phụ `y = h(x)` (đường thẳng hoặc parabol), tự động tìm và chấm đỏ các hoành độ giao điểm `x_i` (các điểm cực trị của hàm hiệu).
  - *Chuyên Đề 4 - Biện Luận Nghiệm Tham Số d: y = ax + m*: Thanh trượt hệ số góc `a` và tham số `m`, tự động quét nghiệm và hiển thị số lượng nghiệm theo thời gian thực.
  - *Chuyên Đề 5 - Ứng Dụng Tích Phân Tính Diện Tích Hình Phẳng 2 Đường Cong*: Tìm giao điểm, tô màu miền khép kín giữa 2 đường cong và tính giá trị diện tích tích phân số học.
  - *Chuyên Đề 6 - Nhận Dạng Bộ Ba Đồ Thị f(x), f'(x), F(x)*: Vẽ đồng thời 3 đường cong chuẩn mực và có nút toggle "Ẩn tên hàm" phục vụ soạn câu hỏi trắc nghiệm kiểm tra học sinh.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 965ms trên Vite 8 và React 19).
