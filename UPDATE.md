# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [15/11/2026] - Tách Riêng Trang Thời Khóa Biểu & Điểm Danh (`StudentScheduleView` - `schedule`) Khỏi Trang Lớp Học & Live Q&A (`LiveClassQnAView` - `live`), Loại Bỏ 100% Mock Data & Hardcode Và Hiển Thị Đầy Đủ `radarChart` + `skillPriors` Trong Lịch Sử Bài Làm

- **Tách Biệt Rạch Ròi Trang "Thời Khóa Biểu & Điểm Danh" (`schedule`) Và Trang "Lớp Học & Live Q&A" (`live`) ([`Sidebar.jsx`](./src/components/layout/Sidebar.jsx), [`App.jsx`](./src/App.jsx), [`StudentScheduleView.jsx`](./src/components/dashboard/StudentScheduleView.jsx), [`LiveClassQnAView.jsx`](./src/components/dashboard/LiveClassQnAView.jsx), [`practiceService.js`](./src/services/practiceService.js))**:
  - Bổ sung mục menu độc lập **`id: 'schedule'` ("Thời khóa biểu & Điểm danh")** trong nhóm *Không Gian Học Viên* của `Sidebar.jsx` và `App.jsx`, tách biệt hoàn toàn với mục **`id: 'live'` ("Lớp học & Live Q&A")** trong nhóm *Luyện Tập & Gia Sư AI*.
  - **`StudentScheduleView.jsx` (`activeTab === 'schedule'`)**: Chuyên biệt 100% cho tra cứu Thời khóa biểu theo Học kỳ (`AcademicTerms`) & Khóa học (`Courses`), Khung lịch định kỳ tuần (`ClassSchedules`), danh sách Buổi học (`ClassSessions` kèm nhãn Giảng viên dạy thay & Buổi học bù) và thống kê Điểm danh chuyên cần cá nhân thực tế (`PRESENT`, `LATE`, `EXCUSED`, `ABSENT`, `UNRECORDED`).
  - **`LiveClassQnAView.jsx` (`activeTab === 'live'`)**: Không gian chuyên biệt cho Lớp học phần đang tham gia, Nhóm vi mô tại bàn, lịch Phụ đạo trực tuyến (`LiveQnACard`), danh sách Giảng viên hỗ trợ từ `userService` và kết nối nhanh Gia sư AI Socratic 24/7.
  - **Loại Bỏ 100% Mock Data & Hardcode**: Xóa toàn bộ dữ liệu giả lập và giá trị gán cứng trên cả tầng Service lẫn Component; hiển thị Empty State trung thực khi dữ liệu chưa được khởi tạo từ Backend.

- **Đồng Bộ & Hiển Thị Đầy Đủ `radarChart` Và `skillPriors` Khi Thi Xong Lẫn Khi Xem Lại Lịch Sử Bài Làm ([`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx), [`SubmissionHistoryView.jsx`](./src/components/diagnostic/SubmissionHistoryView.jsx), [`practiceService.js`](./src/services/practiceService.js))**:
  - Chuẩn hóa `normalizeRadarChart` và `normalizeSkillPriors` thuần túy từ dữ liệu API thực cho cả luồng nộp bài (`executeSubmitExam`) lẫn luồng mở lại lịch sử (`openHistoryExam`, `handleSelectSubmission`).
  - Hiển thị đầy đủ **Biểu Đồ Radar Năng Lực (`radarChart`)** cùng **Ma Trận Tiên Nghiệm Kỹ Năng BKT `` `P(L_0)` `` & Tham Số `` `\theta_{\text{skill}}` `` (`skillPriors`)** cả ngay sau khi thi xong lẫn khi bấm vào xem lại bất kỳ bài thi nào trong Lịch sử làm bài.

- **Kiểm Thử & Biên Dịch**:
  - Vượt qua 17/17 unit tests (`node --test`), `npm run build` (`vite v8.3.0`) thành công 100% với 0 lỗi.
