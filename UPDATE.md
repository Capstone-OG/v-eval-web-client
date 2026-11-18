# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [18/11/2026] - Gắn Bối Cảnh studentId Vào Lịch Sử Bài Thi Của Con & Hỗ Trợ Chuyển Đổi Đa Con Cho Phụ Huynh

- **Gắn Bối Cảnh `studentId` Cho Màn Hình Lịch Sử Bài Thi ([`App.jsx`](./src/App.jsx), [`SubmissionHistoryView.jsx`](./src/components/diagnostic/SubmissionHistoryView.jsx))**:
  - Truyền `studentId`, `studentName`, `childrenList` và cờ `isParent` từ `parentPortalData` vào `SubmissionHistoryView`.
  - Thay thế việc truy vấn theo `user.id` của phụ huynh bằng `studentId` của học sinh khi gọi `practiceService.getStudentDiagnosticHistory(targetId)` và `practiceService.getSubmissionHistory(targetId)`.
- **Thanh Chọn Nhanh Đa Con Linh Hoạt (Multi-Child Switcher Chips) ([`SubmissionHistoryView.jsx`](./src/components/diagnostic/SubmissionHistoryView.jsx))**:
  - Tích hợp thanh chip chuyển đổi nhanh giữa các con ngay trên banner đầu trang khi phụ huynh có nhiều con (`childrenList.length > 1`).
  - Tự động kích hoạt tải lại toàn bộ lịch sử làm bài, đồ thị năng lực và sổ tay lỗi sai tương ứng với học sinh được chọn.
  - Bổ sung cơ chế tự phục hồi nạp dữ liệu từ `practiceService.getParentDashboard` khi phụ huynh tải lại trang trực tiếp.
- **Cá Nhân Hóa Trải Nghiệm Vai Trò Phụ Huynh (Parent Persona UX) ([`SubmissionHistoryView.jsx`](./src/components/diagnostic/SubmissionHistoryView.jsx))**:
  - Cập nhật tiêu đề: *"Lịch Sử Bài Thi Của Con: [Tên con]"* và mô tả đồng hành.
  - Ẩn nút *"Làm Đề Khảo Sát Mới"* của học sinh, thay bằng nút *"Làm mới danh sách"* tích hợp trạng thái xoay đồng bộ từ Backend.
  - Chuyển đổi nhãn hiển thị phương án trắc nghiệm thành *"Con đã chọn"* hoặc *"Con chọn đúng"*.
- **Phân Lập Lưu Trữ & Xóa Bài Thi An Toàn ([`practiceService.js`](./src/services/practiceService.js))**:
  - Hỗ trợ tham số `targetStudentId` trong `getSubmissionHistory` và `deleteSubmissionFromHistory`, bảo vệ toàn vẹn lịch sử giữa các tài khoản khác nhau.
- **Kiểm Thử & Biên Dịch Toàn Diện**:
  - `npm run build`: Biên dịch thành công 100% trong 1.70s, 0 lỗi.
  - `node --test tests/*.test.js`: Đạt **22/22 unit tests pass 100%**.
