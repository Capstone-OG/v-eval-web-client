# UPDATE - V-Eval-Web_Client

## [21/11/2026]
- **Tối Giản & Tái Cấu Trúc Ma Trận Thời Khóa Biểu Tuần 8 Cột (Weekly Timetable Matrix Grid) (`TeacherScheduleView.jsx`)**:
  - *Tối giản giao diện & loại bỏ banner lệch tông*:
    - Loại bỏ hoàn toàn khối banner hero xanh đen (`bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950`) để tạo sự đồng điệu, thanh thoát và liền mạch với tổng thể giao diện sáng màu.
    - Đưa nút "Làm mới" (`RefreshCw`) vào thanh công cụ điều khiển tuần, giữ trọn vẹn khả năng cập nhật dữ liệu nhanh.
  - *Giao diện ma trận tuần 8 cột chuẩn học viện & đại học*:
    - Cột 1 (Slot): Phân định 6 khung giờ ca học chuẩn: Slot 1 (07:30 - 09:30), Slot 2 (09:45 - 11:45), Slot 3 (13:00 - 15:00), Slot 4 (15:15 - 17:15), Slot 5 (18:00 - 20:00), Slot 6 (20:15 - 22:30).
    - 7 Cột Thứ trong tuần (Thứ 2 đến Chủ nhật) kèm ngày chi tiết `(DD/MM)`. Nổi bật trực quan ngày hiện tại ("Hôm nay") bằng dải màu xanh ngọc dịu nhẹ.
    - Ô không có lịch dạy hiển thị dấu `-` căn giữa thanh lịch.
    - Thẻ ca học đầy đủ thông tin sư phạm: Tên lớp học kèm biểu tượng sách, trạng thái chuyên cần (Có mặt / Chưa điểm danh), giờ học, phòng học, hình thức Offline, giảng viên phụ trách, nhãn chuyên đề bài học và sĩ số học sinh.
    - Tích hợp nút 1-chạm mở Modal điểm danh chuyên cần và nút xếp nhóm học tập vi mô 3–5 em.
  - *Điều hướng tuần & chuyển đổi chế độ xem*:
    - Bộ điều hướng tuần: `< Tuần trước`, `Tuần này`, `Tuần sau >` kèm nhãn khoảng ngày tuần động `Tuần (DD/MM - DD/MM)`.
    - Banner phát hiện thông minh: Tự động phát hiện ca dạy gần nhất trong tương lai khi tuần hiện tại trống lịch và hỗ trợ nút chuyển nhanh 1-chạm đến tuần có lịch dạy.
    - Bộ chuyển đổi chế độ xem linh hoạt giữa `Lưới tuần` (Weekly Matrix Grid) và `Danh sách` (Agenda Cards).
  - *Duy trì kết nối CSDL và lưu điểm danh thời gian thực*:
    - Kết nối 100% dữ liệu thực qua `practiceService.getClasses()`, `practiceService.getClassSessions()`, `practiceService.getTeacherSchedule()`, `practiceService.getSessionAttendances()` và `practiceService.submitSessionAttendances()`.
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - `npm run build`: Biên dịch thành công 100% trong 1.71s (`3079 modules`, `0 Error`).
  - `dotnet build`: Dịch thành công toàn bộ Practice Service (`0 Warning`, `0 Error`).
