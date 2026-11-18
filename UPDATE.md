# UPDATE - V-Eval-Web_Client

## [18/11/2026]
- **Tối Giản Hóa Giao Diện Sinh Câu Hỏi Phần 3: Loại Bỏ Nút Toàn Sách Cục Bộ, Bộ Chọn 1 Trong 2 Kèm Nút Sinh Duy Nhất & Dọn Dẹp Icon Thừa (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - *Xóa nút "Sinh toàn bộ sách" khỏi header bài học*: Loại bỏ nút toàn sách khỏi Phần 3 để tách bạch ranh giới phạm vi, đưa chức năng toàn sách lên thanh điều khiển tổng quát trên cùng.
  - *Bộ chọn phạm vi 1 trong 2*: Bổ sung thanh chọn gọn gàng với tiêu mục rõ ràng `Sinh câu hỏi:` cho phép chọn 1 trong 2 chế độ:
    + `[Dạng này]`: Sinh câu hỏi cho dạng bài đang chọn (`activePattern`).
    + `[Cả bài học ({validPatterns.length})]`: Duyệt sinh câu hỏi cho toàn bộ các dạng bài của bài học hiện tại.
  - *Nút `[Sinh câu hỏi]` duy nhất*: Thay thế cụm 3 nút cồng kềnh trước đây bằng 1 nút duy nhất thực thi theo phạm vi đã chọn, tích hợp trạng thái tải xoay vòng `Đang sinh...` chuyên nghiệp.
  - *Dọn dẹp triệt để icon và text dư thừa*: Xóa sạch các emoji lồng ghép trùng lặp (`⚡`, `⚡⚡`, `🌟`, `✨ ⚡`, `⚡ ⚡ ⚡`, `✨ 🌟`), quy chuẩn 100% về icon SVG Lucide tinh tế (`Sparkles`, `RefreshCw`).
- **Thanh Tác Vụ Tổng Quát Nằm Ngay Trên Bộ Chuyển 3 Chế Độ, Tự Động Lưu (Auto-Save) & Nút Lưu Toàn Bộ SGK (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - *Bố trí Thanh Điều Khiển Tổng Quát chuẩn công thái học*: Đặt nổi bật ngay phía trên bộ chuyển 3 chế độ (Phần 1: Cấu trúc / Phần 2: Lý thuyết / Phần 3: Câu hỏi), tách bạch hoàn toàn các tác vụ thuộc về toàn bộ cuốn sách khỏi các phân mục con của từng bài học.
  - *Nút "Lưu Toàn Bộ SGK"*: Thiết kế trực quan với icon `Save`, màu xanh ngọc lục bảo `bg-emerald-700`, cho phép người dùng chủ động bấm lưu toàn bộ Cấu trúc mục lục, Lý thuyết và Ngân hàng câu hỏi của cuốn sách vào persistent storage (`localStorage` & `sessionStorage`).
  - *Nút "Sinh Toàn Bộ Sách"*: Đặt ngay tại thanh tổng quát trên cùng, tách biệt với các nút sinh cục bộ cho bài học và dạng bài ở Phần 3.
  - *Cơ chế Tự Động Lưu (Auto-Save ON) & Khôi Phục Tự Động (Auto-Restore)*:
    + Tự động lưu tức thì vào `localStorage` (`veval_textbook_saved_${sourceId}`) ngay khi AI sinh thêm câu hỏi, chuyển cấp độ Bloom hoặc sửa đổi cấu trúc.
    + Badge hiển thị thời gian: `Đã lưu lúc HH:mm:ss` kèm chấm tròn phát xung xanh lá thời gian thực.
    + Khi chọn lại cuốn sách từ dropdown hoặc refresh trang, hệ thống tự động khôi phục toàn bộ câu hỏi và dạng bài đã lưu từ cache, không bao giờ bị mất dữ liệu.
- **Đa Dạng Hóa Dạng Bài Chuẩn GDPT 2018 & Bộ Chọn Cấp Độ Nhận Thức Bloom (L1–L6) Trực Quan 1-Click (`./src/components/curriculum/TextbookIngestView.jsx`, `./src/components/curriculum/TextbookStandardView.jsx`)**:
  - *Tự động làm giàu dạng bài từ GDPT 2018 preset (`getGdptPreset`)*: Khắc phục hiện tượng bài học chỉ có 1 dạng bài đơn điệu mang cấp độ L2 do chunks OCR chỉ có nhãn mặc định chung. Hệ thống tự động nạp từ 2 đến 4 dạng bài thực tế từ bộ chuẩn GDPT 2018 với đa dạng cấp độ Bloom (L1 Nhớ, L2 Hiểu, L3 Vận dụng, L4 Phân tích).
  - *Bộ chuyển đổi Bloom Level 1-click*:
    + Trên cây mục lục bên trái: Huy hiệu `L{bloomLevel} ▾` cho phép click trực tiếp để xoay vòng cấp độ Bloom (L1 -> L2 -> L3 -> L4 -> L5 -> L6) kèm cập nhật màu sắc tức thì.
    + Tại Phần 3: Bổ sung thanh pill chọn nhanh 6 cấp độ Bloom (L1. Nhớ, L2. Hiểu, L3. Vận dụng, L4. Phân tích, L5. Đánh giá, L6. Sáng tạo) ngay trên danh sách bài tập.
    + Cập nhật `handleAddNewPatternToLesson` tự động gán Bloom level tịnh tiến khi tạo dạng bài mới.
- **Thay Thế `window.confirm`/`alert` Bằng Modal Popup Xác Nhận & Cam Kết Cơ Chế Chỉ Sinh Thêm (Append-Only) Tuyệt Đối Không Ghi Đè Câu Hỏi (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - *Thay thế hộp thoại browser bằng in-app Modal Dialog (`confirmModal`)*: Loại bỏ hoàn toàn `window.confirm`/`alert` của trình duyệt; tích hợp Modal Dialog Tailwind UI hiện đại với backdrop mờ (`backdrop-blur-xs`), card nổi bo tròn 3xl.
  - *Thống kê chi tiết & cam kết bảo toàn*: Hiển thị rõ tên phạm vi bài học / toàn sách, tổng số dạng bài, số câu sinh thêm (`+ 3 câu / dạng`), kèm thông báo cam kết xanh lá: *"Cam kết chỉ sinh thêm, không thay thế: Hệ thống chỉ sinh thêm câu hỏi mới và nối tiếp vào danh sách. Toàn bộ các câu hỏi đã có trước đó đều được giữ nguyên 100%, tuyệt đối không bị ghi đè hoặc thay thế."*
  - *Cơ chế Append-Only an toàn tuyệt đối*:
    + Toàn bộ logic cập nhật bài tập (`updatePatternAt`, `updatePattern`) sử dụng cú pháp nối mảng `exercises: [...existing, ...mappedNew]`.
    + Cấp phát mã ID duy nhất cho từng bài tập mới sinh (`id: `ex_${Date.now()}_...``) chống xung đột key React.
    + Thông báo Toast hiển thị tổng số câu tích lũy sau khi hoàn thành.
- **Tính Năng AI Sinh Câu Hỏi Hàng Loạt (Batch Exercise Generation) Cho Mọi Dạng Bài (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - 3 chế độ sinh bài tập thông minh: Đơn lẻ, Toàn bộ dạng trong bài học, và Toàn bộ dạng trong toàn cuốn sách.
  - Kích hoạt nhanh từ Cây Mục Lục bên trái và Thanh Tổng Quát trên cùng.
  - Thanh tiến trình trực quan thời gian thực hiển thị tỷ lệ `%`, số thứ tự `Dạng X / Y`, tên bài và tên dạng đang xử lý kèm nút `[Dừng Lại]`.
- **Đồng Bộ Hoàn Toàn Cây Cấu Trúc Sách Phân Cấp (Chương ▾ Bài Học ▾ Dạng Bài) Cho Trang Nạp SGK Giống Trang Xem SGK Chuẩn (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - Tái thiết kế cột trái `lg:col-span-4` thành cây accordion 3 tầng chuẩn mực (`Chương C.X` ▾ `Bài học B.X` ▾ `Dạng bài P.X` kèm nhãn Bloom L1–L6 và `cleanPrefix`).
  - Cho phép click chọn Dạng bài trực tiếp trên cây để kích hoạt Phần 3 (Câu Hỏi & Bài Tập SGK).
- **Kiểm Thử Vận Hành**: `npm run build` (`vite build`) đạt `✓ built in 2.24s` với 3053 modules sạch 100%, 0 lỗi.
