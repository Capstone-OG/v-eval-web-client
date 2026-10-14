# Nhật Ký Cập Nhật (Update Log) - Web Client

## [15/10/2026] - Khắc Phục Triệt Để Lỗi Màn Trắng (White Screen Fix), Hoàn Thiện Studio Sư Phạm Chuyên Sâu & Xóa Bỏ 100% Hardcode

- **Khắc Phục Triệt Để Lỗi Màn Trắng & Nâng Cao Tính Bền Vững Runtime**:
  - *Sửa lỗi biến chưa khai báo*: Khắc phục `ReferenceError: weakPrerequisites is not defined` tại `CurriculumExplorerView.jsx:1303` bằng cách bổ sung bộ lọc dạng bài tiên quyết vùng trũng `<10%` đồng bộ từ `skillMasteryMap`.
  - *Bọc Error Boundary Toàn Cục (`RootErrorBoundary` trong `src/main.jsx`)*: Ngăn ngừa toàn bộ lỗi màn hình trắng trong tương lai; hiển thị giao diện báo lỗi chi tiết, stack trace cùng nút Tải lại trang và Xóa cache khẩn cấp.
  - *Bổ Sung Type Safety & Null Guard Cho `MathText.jsx`*: Thêm kiểm tra nghiêm ngặt `typeof text !== 'string'` để tránh crash khi chuỗi toán học hoặc markdown nhận giá trị rỗng/không hợp lệ.
  - *Chuyển Đổi Tab Lộ Trình Toàn Diện Cho Mọi Vai Trò (`App.jsx`)*: Hỗ trợ Học sinh, Giáo viên và Quản lý học thuật cùng truy cập phân hệ Dàn kiến thức & Lộ trình phân cấp.
- **Triển Khai Môi Trường Studio Sư Phạm Toàn Diện (`CurriculumStudioEditor.jsx`)**:
  - Chuyển đổi toàn diện trải nghiệm hiệu đính của giảng viên sang không gian Studio toàn màn hình tải nặng:
    - *3 Chế Độ Xem Linh Hoạt (View Mode Switcher)*: `Biên soạn (Editor)`, `Chia đôi (Split 50-50 Live KaTeX Preview)`, và `Review Học sinh (Live Preview)` mô phỏng chính xác 100% trải nghiệm của học viên.
    - *Bảng Ký Tự Toán Học KaTeX 3 Chủ Đề*: Phân loại chi tiết theo Đại số & Giải tích, Hình học Oxyz, Logic & Tập hợp hỗ trợ chèn 1-click.
    - *Thư Viện Đồ Thị & Chèn Hình Ảnh Sư Phạm*: Tích hợp modal chọn ảnh mẫu (Đồ thị hàm bậc ba, Bảng biến thiên, Hình chóp S.ABC, Hệ trục Oxyz) hoặc dán link ảnh tùy chỉnh với định dạng Markdown `![Mô tả](url)`.
    - *Động Cơ Render Toán Học Kèm Hình Ảnh (`MathText.jsx`)*: Phân tích và render tự động thẻ hình ảnh Markdown, bo góc viền và bóng đổ chuyên nghiệp.
    - *Bảng Phân Đoạn Video Timestamps*: Thêm/sửa/xóa các mốc thời gian bài giảng và nhúng trực tiếp trình phát video YouTube kiểm thử.
    - *Quản Trị Ngân Hàng Câu Hỏi Thích Ứng (API 16-18)*: Xem danh sách câu hỏi trong PostgreSQL, xóa câu hỏi và mở Dialog tạo mới câu hỏi theo chuẩn Bloom L1-L4.
- **Tích Hợp Studio Vào Dàn Kiến Thức (`CurriculumExplorerView.jsx`)**:
  - Bổ sung nút **"Vào Studio Sư Phạm"** trên thanh công cụ chính và nút **"Mở Studio Biên Soạn Sư Phạm"** trên từng Dạng bài, hỗ trợ chuyển đổi mượt mà giữa cây tri thức và Studio.
  - Cho phép giảng viên mở Studio để tạo mới dạng bài toàn diện ngay từ thanh accordion bài học.
- **Cấu Trúc Cây Tri Thức 3 Tầng Chuẩn SGK GDPT 2018**:
  - Phân cấp `Chương` -> `Bài học` -> `Dạng bài` với hệ thống huy hiệu cảnh báo hổng kiến thức (`🚨 <10%`, `⚠️ <60%`, `✅ ≥60%`).
- **Xóa Bỏ 100% Dữ Liệu Hardcode**:
  - Xóa toàn bộ GUID và câu hỏi mẫu giả, kết nối trực tiếp cơ sở dữ liệu PostgreSQL qua Content Service APIs.
- **Kiểm Thử Đóng Gói Production**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 781ms).
