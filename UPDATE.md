# UPDATE — V-Eval-Web_Client

## [22/11/2026]
- **Phân Định Phân Quyền Giảng Viên & Triệt Tiêu Lấn Sân Quyền Quản Trị Cấp Hệ Thống (TCH-01) (`Sidebar.jsx`, `App.jsx`, `CurriculumExplorerView.jsx`, `TextbookStandardView.jsx`, `ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`)**:
  - *Tái cấu trúc Sidebar phân hệ Giảng viên (`Sidebar.jsx`)*:
    + Mục Khung chương trình: Chuyển badge sang `'Tra cứu'`, sublabel `'Tra cứu cây kiến thức & Bloom'`.
    + Nhóm Sách giáo khoa (SGK): Thay thế nhóm 3 tầng con thành 1 mục tra cứu duy nhất: `'Sách giáo khoa (SGK)'`, sublabel `'Tra cứu SGK chuẩn GDPT 2018'`, badge `'Chuẩn'`. Ẩn hoàn toàn các mục Nạp tài liệu SGK (`textbook-ingest`) và Studio biên soạn (`textbook-studio`).
    + Nhóm Đề thi & AI Bloom: Thay thế nhóm 3 tầng con thành 1 mục tra cứu duy nhất: `'Kho đề thi đã xuất bản'`, sublabel `'Tra cứu & xem đề khảo thí'`, badge `'Kho Đề'`. Ẩn hoàn toàn Parse PDF (`exam-ingest`) và Studio biên soạn đề (`exam-studio`).
    + Mục Kiểm duyệt gia sư AI: Cập nhật sublabel `'Đề xuất sửa & Bẫy tư duy lớp mình'`, badge `'Đề xuất'`.
    + Widget chân trang Teacher: Thay đổi nhãn từ `'Studio'` thành `'Tra cứu'`.
  - *Điều hướng & Route Guard (`App.jsx`)*:
    + Cập nhật `ROLE_PORTAL_DEFINITIONS.teacher.tabs` tinh gọn đúng 7 mục theo chuẩn chức năng giảng viên.
    + Bổ sung cơ chế Route Guard tự động chuyển hướng: Giảng viên truy cập tab biên soạn/nạp SGK sẽ được tự động điều hướng về `textbook-standard`; truy cập tab bóc tách/biên soạn đề thi sẽ được điều hướng về `exam-bank`.
    + Truyền tham số vai trò `role` xuống các view chuyên môn để kích hoạt chế độ xem an toàn.
  - *Chế độ Tra cứu Khung chương trình (`CurriculumExplorerView.jsx`)*:
    + Nhận biết vai trò `isReadOnly` khi đăng nhập Giảng viên: ẩn nút `'Vào Studio Sư Phạm'` và `'AI Bóc Tách Tài Liệu & Dạng Bài'`; hiển thị badge nhận diện `'Chế độ Tra Cứu Khung Chương Trình (Read-only)'`.
    + Khóa các thao tác thêm bài, xóa chương, thêm dạng, mở studio và sửa nhanh trên cây tri thức.
    + Chuyển `instructorMode = false` đối với `UnifiedNodeDetailView` để ẩn các công cụ can thiệp cấu trúc.
  - *Chế độ Tra cứu Sách giáo khoa chuẩn (`TextbookStandardView.jsx`)*:
    + Khi `isReadOnly`: Ẩn nút `'Đồng Bộ Khung CT'`, `'Chuẩn Hóa GDPT 2018'`, nút `'Mở Studio Biên Soạn'` và nút điều hướng nạp tài liệu; hiển thị badge `'Chế độ Tra Cứu SGK Chuẩn GDPT 2018 (Read-only)'`.
    + Ẩn hoàn toàn nút xóa cuốn sách khỏi cơ sở dữ liệu (`handleDeleteBook`) và các nút thêm chương/bài/dạng.
  - *Chế độ Tra cứu Kho đề thi đã xuất bản (`ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`)*:
    + Khi `isReadOnly`: Ẩn thanh luồng 3 bước `ExamPageFlowBar`, ẩn các nút `'Parse PDF (Trang 2)'`, `'AI Bloom L1–L6'` và `'Soạn Trong Studio'`; thay bằng badge `'Chế độ Tra Cứu Kho Đề Đã Xuất Bản (Read-only)'`.
    + Bộ lọc kho đề: Tự động lọc chỉ hiển thị các đề thi đã được thẩm định xuất bản (`e.isPublished === true`), vô hiệu hóa quyền xuất bản và xóa đề.
    + Thanh tiêu đề chi tiết đề thi (`ExamWorkspaceHeader.jsx`): Khóa chỉnh sửa, ẩn các nút Lưu Database, Phê duyệt đề, Xóa đề, AI sinh thêm câu Bloom và AI gắn chương/bài.
- **Tách Rõ 2 Tầng Nghiệp Vụ Kiểm Duyệt Gia Sư AI Core Flow 4 Giữa Giảng Viên Và Giám Đốc Học Thuật (`AiTutorModerationView.jsx`)**:
  - *Tầng Giảng viên (`role === 'teacher'`)*:
    + Giới hạn phạm vi: Tích hợp bộ lọc lớp học phụ trách, chỉ theo dõi các tương tác của Gia sư AI với học sinh trong danh sách lớp được phân công.
    + Hero Banner: Cập nhật tiêu đề `'Kiểm Duyệt Gia Sư AI — Lớp Phụ Trách & Đề Xuất Sư Phạm'` kèm bộ chọn lớp trực tiếp.
    + Bàn làm việc đề xuất sư phạm: Chuyển đổi thành cơ chế 2 bước gửi đề xuất gồm Tab 1 (`Đề Xuất Lời Giải Chuẩn`) và Tab 2 (`Đề Xuất Bẫy Tư Duy`). Ẩn hoàn toàn Tab 3 (Xác nhận AI đúng & đóng báo cáo).
    + Cơ chế lưu trữ đề xuất: Đóng gói dữ liệu đề xuất kèm thông tin định danh giảng viên và thời gian tạo, cập nhật trạng thái `PENDING_DIRECTOR_REVIEW` và hiển thị thẻ thông báo đề xuất đang chờ Giám đốc duyệt.
  - *Tầng Giám đốc Học thuật (`role === 'director'`)*:
    + Giữ trọn vẹn quyền giám sát toàn trường trên toàn bộ các lớp học và cơ sở.
    + Bổ sung bộ lọc hàng đợi `'Đề xuất GV ({count})'` giúp Giám đốc phát hiện ngay các đóng góp chuyên môn từ giáo viên.
    + Khối thẩm định đề xuất nổi bật: Hiển thị chi tiết lời giải mẫu hoặc bẫy tư duy do Giảng viên đề xuất, tích hợp 2 nút thao tác 1-chạm:
      * `✓ Phê Duyệt & Ghi Đè Vào Kho RAG Toàn Trường`: Tự động gọi API cập nhật node `PatternExemplar` hoặc `PatternTrap` trong GraphRAG và xóa đề xuất khỏi hàng đợi chờ.
      * `✕ Từ Chối Đề Xuất`: Đóng đề xuất và lưu vết phản hồi sư phạm.
    + Duy trì quyền can thiệp trực tiếp 3 Tab (Ghi đè lời giải mẫu, Bổ sung bẫy tư duy, Xác nhận AI đúng & đóng báo cáo).
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Hoàn thành 100% trong 1.97s (`3081 modules`, `0 Error`).
  - Unit tests: 28/28 unit tests passed (`tests/*.test.js` 22/22, `examStateBridge.test.js` 6/6).
