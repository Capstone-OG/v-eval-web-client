# UPDATE - V-Eval-Web_Client

## [21/11/2026]
- **Loại Bỏ 2 Nút Thu Gọn Sidebar Trùng Lặp Ở Mép Brand Header & Navbar (`Sidebar.jsx`, `AccountNavbar.jsx`)**:
  - *Triệt tiêu nút dư thừa gây rối mắt*: Loại bỏ hoàn toàn 2 nút thu gọn/mở rộng sidebar (`PanelLeftClose`/`PanelLeftOpen`) nằm liền kề nhau giữa mép phải thanh Brand Header của Sidebar và mép trái thanh Top Navbar.
  - *Tối giản thanh điều hướng*: Giữ trọn vẹn nút menu điều hướng responsive mobile (`Menu`), làm phẳng và thoáng đãng toàn bộ thanh tiêu đề desktop.
- **Tối Giản Cảnh Báo Sư Phạm Thành Nút Bấm Popup (Pedagogical Alerts Modal) (`TeacherDashboardView.jsx`)**:
  - *Gom khối cảnh báo thành dải thông báo tinh gọn*: Loại bỏ hoàn toàn danh sách các thẻ cảnh báo đỏ/vàng trải dài thô xuống màn hình gây chiếm diện tích; thay thế bằng dải thông báo mỏng gọn (chiều cao ~50px) với nút bấm trực quan `Xem danh sách chuyên đề ({count})`.
  - *Tích hợp Modal chuyên dụng*: Khi bấm nút, modal `Chuyên Đề Cần Bồi Dưỡng Gấp` hiện lên với danh sách cuộn mượt (`max-h-[85vh]`), hiển thị rõ ràng tỷ lệ hiểu bài, số học sinh chưa đạt và nút `Tạo Nhóm Bồi Dưỡng` kích hoạt xếp bàn học vi mô 3–5 em.
- **Tối Giản & Tái Cấu Trúc Ma Trận Thời Khóa Biểu Tuần 8 Cột (Weekly Timetable Matrix Grid) (`TeacherScheduleView.jsx`)**:
  - *Tối giản giao diện & loại bỏ banner lệch tông*: Loại bỏ hoàn toàn khối banner hero xanh đen cồng kềnh giúp giao diện thời khóa biểu đồng điệu với phong cách phẳng sáng màu; chuyển nút làm mới lịch (`RefreshCw`) vào thanh công cụ của bảng tuần.
  - *Giao diện ma trận tuần 8 cột chuẩn học viện & đại học*: Thiết kế bảng ma trận gồm Cột 1 (Slot 1-6) và 7 cột Thứ trong tuần (Thứ 2 - Chủ nhật kèm ngày DD/MM). Tự động nhận diện và làm nổi bật ngày hiện tại ("Hôm nay") bằng viền và nền xanh ngọc dịu nhẹ; các ô trống hiển thị dấu gạch ngang `-` thanh lịch.
  - *Thẻ ca học đầy đủ thông tin sư phạm*: Tên lớp học, chuyên cần, giờ học, phòng học, hình thức Offline, giảng viên phụ trách, chuyên đề bài học và sĩ số; tích hợp nút mở modal điểm danh chuyên cần tại lớp.
  - *Điều hướng tuần linh hoạt*: `< Tuần trước`, `Tuần này`, `Tuần sau >`, banner phát hiện ca dạy gần nhất và bộ chuyển chế độ xem giữa `Lưới tuần` và `Danh sách`.
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - `npm run build`: Biên dịch thành công 100% trong 1.32s (`3079 modules`, `0 Error`).
