# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [22/10/2026] - Hộp Thoại Xác Nhận Xóa In-App, Tinh Gọn Modal Sửa Nhanh (Icon Cây Bút), Tự Động Nạp Dạng Bài Khi Mở Chương & Hệ Thống Toast Toàn Cục

- **Hộp Thoại Xác Nhận Xóa In-App Hiện Đại (Zero Native Browser Confirm / Alert)**:
  - Loại bỏ hoàn toàn hộp thoại chặn luồng `window.confirm()` của trình duyệt khi xóa Chương, Bài học hoặc Dạng bài trong [`CurriculumExplorerView.jsx`](./src/components/curriculum/CurriculumExplorerView.jsx).
  - Triển khai modal xác nhận in-app `confirmDeleteDialog` đồng bộ ngôn ngữ thiết kế Glassmorphism, hiển thị cảnh báo đỏ (`rose-500`), icon `<AlertTriangle />`, chi tiết các nội dung con bị xóa cascade và nút "Xác Nhận Xóa" chuyên nghiệp.
  - Trong [`CurriculumStudioEditor.jsx`](./src/components/curriculum/CurriculumStudioEditor.jsx), cơ chế xóa câu hỏi được thay thế bằng xác nhận 2 chạm (Two-Tap Confirmation) đếm ngược 3 giây an toàn.

- **Tinh Gọn Modal Sửa Nhanh (Metadata-Only) & Chuyển Nút Sửa Nhanh Sang Icon Cây Bút**:
  - Chuyển đổi nút bấm văn bản "Sửa nhanh" trên thanh công cụ thành icon button `<Pencil className="w-4 h-4" />` tinh gọn kèm tooltip "Sửa thông tin nhanh".
  - Tái cấu trúc modal `isEditModalOpen`:
    - Chỉ cho phép chỉnh sửa siêu dữ liệu định danh: Tên Dạng bài / Tiêu đề, Chương học trực thuộc, Khối lớp (Lớp 10, 11, 12), Mức độ nhận thức chuẩn Bloom (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao), và Trọng số năng lực (%).
    - Loại bỏ toàn bộ 4 tab biên soạn nội dung bên trong (lý thuyết, phương pháp, video, câu hỏi mẫu) để tránh trùng lặp tính năng.
    - Bổ sung banner điều hướng trực quan: "Cần chỉnh sửa nội dung bài học chuyên sâu? Mở Studio Biên Soạn Sư Phạm".

- **Tự Động Nạp & Mở Dạng Bài Đầu Tiên Khi Chọn Chương / Bài Học**:
  - Cập nhật `toggleChapter` và `toggleLesson` trong [`CurriculumExplorerView.jsx`](./src/components/curriculum/CurriculumExplorerView.jsx): Khi người dùng nhấp vào tiêu đề Chương hoặc Bài học, hệ thống tự động tìm và chọn dạng bài đầu tiên (`selectedPattern`), đảm bảo khung bài học bên phải luôn hiển thị nội dung tức thì.

- **Khắc Phục Cảnh Báo KaTeX Strict Mode Đối Với Ký Tự Tiếng Việt (`MathText.jsx`)**:
  - Bổ sung cấu hình `strict: 'ignore'` trong trình dựng `renderKatexHtml` của [`MathText.jsx`](./src/components/common/MathText.jsx), triệt tiêu hoàn toàn cảnh báo `LaTeX-incompatible input Unicode text character "Đ" used in math mode`.

- **Hệ Thống Thông Báo Toàn Cục (Global Toast Notification System)**:
  - Triển khai `ToastContext.jsx` & `GlobalToastContainer.jsx` thay thế triệt để `window.alert()`.
  - Hỗ trợ 4 nhóm trạng thái (Success, Error, Warning, Info), thanh đếm ngược tự động dừng khi rê chuột, và cơ chế bọc tự động chặn `window.alert()` toàn hệ thống.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 940ms trên Vite 8 và React 19).
