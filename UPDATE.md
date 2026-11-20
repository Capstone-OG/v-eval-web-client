# UPDATE - V-Eval-Web_Client

## [20/11/2026]
- **Kết Nối CSDL Thời Gian Thực Toàn Diện & Chuẩn Hóa Dữ Liệu Động Cho Phân Hệ Giáo Viên (`TeacherDashboardView.jsx`, `TeacherScheduleView.jsx`, `AiTutorModerationView.jsx`, `Sidebar.jsx`, `App.jsx`, `practiceService.js`)**:
  - *Bản đồ ma trận học tập 2D (`TeacherDashboardView.jsx`)*:
    - Chuẩn hóa bộ chọn lớp học phụ trách, khắc phục triệt để lỗi bất đồng bộ mã định danh (`classId` thay vì `id`), kết nối dữ liệu thật từ endpoint `GET /api/practice/classes` và `GET /api/practice/classes/{classId}/heatmap`.
    - Hiển thị trực tiếp 100% dữ liệu thực tế từ CSDL PostgreSQL: danh sách toàn bộ học sinh trong lớp, điểm năng lực, trạng thái cần hỗ trợ, chuyên đề phân hóa 2 đầu và bảng ma trận tiến độ học tập chi tiết.
  - *Thời khóa biểu & Điểm danh chuyên cần (`TeacherScheduleView.jsx`)*:
    - Bổ sung bộ chọn Lớp học phụ trách (`selectedClassId`), tự động tải danh sách ca dạy thực tế từ endpoint `GET /api/practice/schedules/classes/{classId}/sessions` và `GET /api/practice/schedules/teachers/{teacherId}/schedule`.
    - Loại bỏ hoàn toàn các giá trị mặc định tĩnh; liên kết trực tiếp sĩ số học sinh (`enrolledStudentsCount` / `totalStudentsCount`) và tính toán tỷ lệ điểm danh theo thời gian thực.
    - Kết nối danh sách học sinh từ ma trận lớp để hiển thị chính xác họ tên trong Modal điểm danh và lưu trữ trực tiếp lên máy chủ thông qua endpoint `POST /api/practice/schedules/sessions/{sessionId}/attendances`.
  - *Kiểm duyệt Gia sư AI Socratic (`AiTutorModerationView.jsx`)*:
    - Loại bỏ hoàn toàn mảng mẫu tĩnh giả lập (`SEED_INTERACTIONS`) và các công thức cố định trước đây.
    - Kết nối trực tiếp vào 50 phiên đối thoại thực tế từ CSDL backend qua endpoint `GET /api/practice/ai-tutor/interactions`.
    - Hiển thị chính xác nội dung câu hỏi khảo thí, các phương án lựa chọn thực tế từ hệ thống, tiến trình đối thoại Socratic giữa học sinh và trợ lý AI, cùng trạng thái gắn cờ kiểm duyệt.
    - Cung cấp giao diện sư phạm cho phép giáo viên nhập lời giải chuẩn hóa hoặc xác nhận bẫy tư duy dựa trên dữ liệu chuyên môn thật.
  - *Menu Sidebar & Điều Hướng (`Sidebar.jsx`, `App.jsx`)*:
    - Tối giản menu của Giáo viên thành 3 khối nghiệp vụ rõ ràng: **Quản Lý Lớp Học** (`Lớp học & Tiến độ`, `Thời khóa biểu & Điểm danh`, `Lịch sử làm bài`), **Học Liệu & Đề Thi** (`Khung chương trình`, `Sách giáo khoa`, `Đề thi & AI Bloom`), **Kiểm Duyệt & AI** (`Kiểm duyệt gia sư AI`).
    - Đảm bảo mục `Thời khóa biểu & Điểm danh` hiển thị trang trọng trên Sidebar với biểu tượng Calendar và định tuyến mượt mà.
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - `npm run build`: Biên dịch thành công 100% trong 1.22s (`3079 modules`, `0 Error`).
  - `dotnet build`: Dịch thành công toàn bộ Practice Service (`0 Warning`, `0 Error`).
