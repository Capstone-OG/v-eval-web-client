# UPDATE — V-Eval-Web_Client

## [23/11/2026]
- **Tối Ưu Hóa Giao Diện & Đồng Bộ 100% Dữ Liệu Học Sinh Thực Tế Cho Buổi Học Offline (TCH-02) (`TeacherScheduleView.jsx`, `OfflineSessionPreparationModal.jsx`, `offlineSessionStore.js`, `tests/offlineSessionStore.test.js`)**:
  - *Tái thiết kế Modal Chuẩn bị Buổi học (`OfflineSessionPreparationModal.jsx`)*:
    + Loại bỏ toàn bộ các khối chữ giải thích quy tắc mang tính giáo điều và thuật ngữ kỹ thuật nội bộ (như `Mô hình lớp học đảo ngược`, `Giảng viên tự quyết 100% không cần Director duyệt`, `ZPD`, `Vi mô`, `Heatmap`, `WS-ZPD-ENG-01`).
    + Tinh giản giao diện thành 2 tab trực quan và gần gũi với giáo viên:
      * **1. Chữa bài chung cả lớp**: Gợi ý các dạng bài học sinh làm sai nhiều nhất từ kết quả làm bài của lớp; danh sách chuyên đề chữa bài tinh gọn chỉ hiển thị số thứ tự và tên chuyên đề kèm nút xóa, loại bỏ hoàn toàn các câu cảnh báo bẫy và câu hỏi mẫu placeholder rườm rà.
      * **2. Nhóm học tập tại bàn**: Hiển thị danh sách các bàn học (Bàn 1, Bàn 2...), tên học sinh từng bàn và phiếu bài tập thực hành tương ứng.
    + Nút bấm chuẩn mực: `Hủy` và `Lưu nội dung buổi học` (loại bỏ chú thích ngoặc đơn dư thừa).
  - *Đồng bộ trực tiếp 100% danh sách học sinh thực tế từ CSDL*:
    + Kết nối API `practiceService.getClassHeatmap(session.classId)` và `practiceService.getSessionAttendances(session.sessionId)` để tải danh sách học sinh thực tế từ cơ sở dữ liệu (`Trần Thái Thịnh`, `Trần Ngọc Mai`, `Mai Thành Nhân`, `Lê Hoàng Long`, `Nguyễn Hoàng An`, `Phạm Tấn Lộc`).
    + Tự động chia nhóm học sinh thật vào các bàn học (Bàn 1 và Bàn 2) theo tỷ lệ cân đối (3 bạn/bàn) kèm phiếu bài tập thích ứng.
    + Bổ sung cơ chế tự động thanh lọc bộ nhớ cache cũ (Local Storage): phát hiện và dọn dẹp các kế hoạch cũ chứa dữ liệu mẫu lỗi thời, tự động thay thế bằng dữ liệu thực tế của lớp học.
    + Khắc phục lỗi hiển thị tên kỹ năng và tỷ lệ làm sai trên danh sách gợi ý: Chuẩn hóa mapping thuộc tính `col.skillName` và tính toán tỷ lệ làm sai thực tế từ `classAveragePlt`, tự động xếp hạng các kỹ năng học sinh trong lớp gặp khó khăn nhất lên đầu.
  - *Tinh gọn thẻ ca học trên Thời khóa biểu (`TeacherScheduleView.jsx`)*:
    + Tinh giản phần hiển thị nội dung buổi học thành 2 mục gọn gàng: `1. Chữa bài chung` và `2. Nhóm tại bàn`.
    + Đổi nút hành động thành `Chuẩn bị buổi học` với icon trực quan, ngôn từ tự nhiên, dễ hiểu.
- **Chuẩn Hóa Phân Quyền Maker - Checker Học Liệu & Đề Thi Cho Role Teacher (`TextbookIngestView.jsx`, `TextbookStudioView.jsx`, `CurriculumStudioEditor.jsx`, `ExamWorkspaceHeader.jsx`, `App.jsx`)**:
  - *Nạp tài liệu SGK (`TextbookIngestView.jsx`)*: Áp dụng cơ chế **Chỉ xem (Read-only)** cho Giảng viên; hiển thị banner `Chế độ Tra Cứu Tài Liệu Nạp (Read-only)`; ẩn nút tải lên file PDF mới và nút chạy AI bóc tách cấp hệ thống.
  - *Studio Biên soạn SGK (`CurriculumStudioEditor.jsx`, `TextbookStudioView.jsx`)*:
    + Hiển thị banner: `Chế độ Soạn thảo (Maker) — Gửi duyệt lên Giám đốc Học thuật`.
    + Chuyển đổi nút lưu thành `Lưu bản nháp` và `Gửi duyệt (PENDING_REVIEW)`.
    + Vô hiệu hóa quyền tự ý xuất bản hoặc xóa học liệu toàn hệ thống.
  - *Biên soạn Đề thi (`ExamWorkspaceHeader.jsx`)*: Tích hợp nút `Gửi duyệt (PENDING_REVIEW)`, ẩn nút Phê duyệt xuất bản (Publish) và ẩn nút Xóa đề thi khỏi CSDL chung.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Hoàn thành 100% trong 1.15s (`3083 modules`, `0 Error`).
  - Unit tests: **30/30 unit tests passed 100%** (`tests/*.test.js` 22/22, `examStateBridge.test.js` 6/6, `offlineSessionStore.test.js` 2/2).
