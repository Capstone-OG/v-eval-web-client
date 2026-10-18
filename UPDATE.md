# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [19/10/2026] - Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG Như Microsoft Word Equation: Studio Toàn Màn Hình Độc Lập Thay Thế Sidebar App, Thẻ Nổi Rê Chuột 2 Giây KaTeX & Thanh Tra Công Thức Siêu Linh Hoạt 4 Tab

- **Studio Soạn Thảo Toàn Màn Hình Độc Lập (Dedicated Standalone Studio Workspace - Không Bị Giới Hạn Khung Hiển Thị)**:
  - *Giải Phóng Toàn Diện Không Gian Làm Việc*:
    + Trước đây, `CurriculumStudioEditor` bị giới hạn trong khung con `max-w-7xl` nằm bên trong trang Lộ trình, bị sidebar chính của app chiếm 240px bên trái dẫn đến tình trạng xuất hiện "2 sidebar song song" và làm chật hẹp khung soạn thảo.
    + Nâng cấp `CurriculumExplorerView.jsx` mở Studio dưới dạng trang độc lập toàn màn hình (`fixed inset-0 z-50 w-screen h-screen bg-slate-950 overflow-hidden`), ẩn hoàn toàn layout ngoài của app.
  - *Thanh Công Cụ Ký Hiệu Phân Cấp Thay Thế Sidebar App*:
    + Đưa `HierarchicalMathPalette.jsx` lên làm Left Sidebar chính của toàn bộ Studio, thay thế trực tiếp vị trí của sidebar app cũ.
    + Tích hợp nút thu gọn/mở rộng: Thu hẹp thành thanh icon rail siêu mỏng 44px (`w-11`), mở rộng (`w-64`/`w-72`) chỉ với 1 click, giúp canvas soạn thảo chiếm trọn vẹn 100% chiều ngang màn hình.
    + Bổ sung thanh điều hướng đỉnh trang (Studio Navbar h-14) với nút `← Quay lại Lộ trình`, breadcrumb bài học, nút chuyển 3 chế độ xem, nút AI nhận diện và nút lưu PostgreSQL.

- **Thẻ Nổi KaTeX Rê Chuột 2 Giây (2-Second Hover Preview Card - `HierarchicalMathPalette.jsx`)**:
  - *Cơ Chế Rê Chuột Đỗ 2 Giây Không Gây Rối Mắt*:
    + Tích hợp bộ đếm thời gian trễ chính xác 2000ms (`hoverTimerRef`). Khi người dùng lướt nhanh chuột, không có popup nào chớp nháy gây khó chịu. Chỉ khi rê chuột dừng lại trên ký hiệu đúng 2 giây, thẻ nổi mới xuất hiện mượt mà.
  - *Nội Dung Thẻ Nổi Sư Phạm Toàn Diện*:
    + **Công thức KaTeX phóng to**: Hiển thị ký hiệu/phương trình cỡ lớn ở trung tâm, nét vector chuẩn mực.
    + **Thông tin môn & danh mục**: Nhãn phân loại trực quan (Toán học, Hóa học, Ký hiệu).
    + **Mô tả ứng dụng sư phạm SGK GDPT 2018**: Giải thích chi tiết ý nghĩa và cách dùng (ví dụ: công thức nồng độ mol $C_M = n/V$, số oxi hóa cực đại $+6$ của S trong $H_2SO_4$, đạo hàm bằng gia số, v.v.).
    + **Cú pháp LaTeX thô & hướng dẫn**: Hiển thị rõ mã lệnh LaTeX (như `\frac{a}{b}`) kèm chỉ dẫn nhấp chuột để chèn ngay tại con trỏ.

- **Thanh Tra Công Thức Siêu Linh Hoạt Phân Cấp 4 Tab (Hierarchical Quick Formula Inspector - `WordStyleFormulaCanvas.jsx`)**:
  - *Đột Phá Tính Năng Sửa Trực Tiếp Trên Trang (In-Place Super Flexibility)*:
    + Khi người dùng nhấp vào bất kỳ công thức nào trên trang, popup thanh tra công thức nổi mở ra với đầy đủ sức mạnh thay vì chỉ vài nút đơn giản.
    + **Phân cấp 4 tab ký hiệu nhanh**:
      * `📐 Cấu trúc`: Phân số $a/b$, Căn $\sqrt{x}, \sqrt[n]{x}$, Số mũ $x^2, x^n$, Chỉ số dưới $x_0$, Trị tuyệt đối $|x|$, Đạo hàm $y'$, Tích phân $\int$, Giới hạn $\lim$, Tổng $\sum$, Vectơ $\vec{u}$.
      * `🧪 Hóa học`: Nồng độ $C_M, C\%$, Hợp chất $H_2SO_4, H_2O, HNO_3$, Ion $SO_4^{2-}, OH^-, Fe^{3+}$, Số oxi hóa $0, +1, +2, +3, +6, -1, -2$, Mũi tên phản ứng $\rightarrow, \rightleftharpoons, \uparrow, \downarrow$.
      * `🔣 Ký hiệu`: Phép toán và so sánh $\pm, \times, \div, \neq, \approx, \le, \ge, \infty, \cdot$, ký tự Hy Lạp $\pi, \Delta, \alpha, \beta, \theta, \lambda, \Omega$.
      * `🧱 Ngoặc & Logic`: Ngoặc tròn $( )$, vuông $[ ]$, nhọn $\{ \}$, suy ra $\Rightarrow$, tương đương $\Leftrightarrow$, thuộc $\in$, không thuộc $\notin$, với mọi $\forall$, tồn tại $\exists$, tập số thực $\mathbb{R}$.
    + Nhấp vào bất kỳ ký hiệu nào sẽ chèn hoặc bao bọc ngay lập tức vào công thức đang chọn.
  - *Nhập Mã LaTeX Trực Tiếp Song Hành Ô Nhập Số (Dual Visual & LaTeX Editing)*:
    + Tích hợp dòng input LaTeX trực tiếp kèm Live KaTeX Preview hiển thị thời gian thực với độ trễ 0ms. Giáo viên có thể gõ hoặc dán bất kỳ đoạn mã LaTeX tùy ý mà không bị gò bó.
    + Giữ nguyên các ô nhập số trực quan (tử số, mẫu số, số mũ) kèm nút `⚡ Tính tự động` thương số/căn bậc hai và nút xóa công thức.

- **Khắc Phục Triệt Để Hiện Tượng Nhảy Dòng & Tiết Diện Công Thức Quá Lớn (`WordStyleFormulaCanvas.jsx`)**:
  - Xóa bỏ cơ chế `flex-wrap`, chuyển sang dòng văn bản tự nhiên theo đoạn (`tokenizeLine`, `parseDocumentLines`, `serializeDocumentLines`), đảm bảo dấu chấm `.` và dấu phẩy `,` bám sát từ ngữ trên cùng dòng, không bao giờ bị rơi rớt xuống dòng độc lập.
  - Tiết diện công thức siêu gọn `text-[13.5px]`, padding `px-0.5 py-0 mx-0.5`, hairline dashed underline khi nghỉ.
  - Hỗ trợ phím Enter tách dòng tự nhiên như Microsoft Word.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn tất trong 777ms trên Vite 8 và React 19).
