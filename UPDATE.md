# UPDATE - V-Eval-Web_Client

## [19/11/2026] - Chuẩn Hóa Cổng Phụ Huynh 4 Phân Hệ & Tối Ưu Quản Lý Học Thuật Cơ Sở

- **Chuẩn Hóa Cổng Phụ Huynh 4 Phân Hệ & Bố Cục Dashboard 3 Tầng ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx), [`ParentChildResultsView.jsx`](./src/components/dashboard/ParentChildResultsView.jsx), [`ParentEarlyWarningsAndTeacherView.jsx`](./src/components/dashboard/ParentEarlyWarningsAndTeacherView.jsx))**:
  - Di chuyển toàn bộ các Hook `useEffect` lên đầu component trước các câu lệnh `if (...) return`, triệt tiêu hoàn toàn ngoại lệ `Rendered more hooks than during the previous render`.
  - Nâng state `parentActiveChildId` lên `App.jsx`, đồng bộ hóa việc chọn con cho toàn bộ các tab con: Dashboard, Tiến độ & Kết quả, Cảnh báo sớm và Học phí.
  - Tái thiết kế Sidebar thành 4 mục chuẩn: *1. Tổng quan đồng hành*, *2. Tiến độ & Kết quả của con*, *3. Cảnh báo & Trao đổi Giáo viên*, *4. Học phí & Lịch sử giao dịch*.
  - Bổ sung bộ chọn dropdown con ngay trên thanh điều hướng đầu trang `AccountNavbar` khi phụ huynh liên kết $\ge 2$ con, cho phép chuyển đổi học sinh tức thì từ mọi trang.
  - Đồng bộ hóa sự kiện click chọn thẻ con trong `TuitionPaymentView` với `onSelectChildId`, cập nhật trạng thái `activeChildId` toàn cục ngay lập tức.
  - Loại bỏ hoàn toàn các từ viết tắt nội bộ: IRT Theta, BKT, ZPD, PLAR, Core Flow 5, Live Identity + Practice gRPC, giá thử nghiệm 5.000 ₫; thay bằng ngôn ngữ tiếng Việt đời thường, dễ hiểu cho gia đình.
- **Nâng Cấp Giao Diện Xếp Lớp Đầu Vào Theo Ma Trận 4 Miền × 3 Cấp Bậc (12 Lớp Chuẩn - [`AcademicManagerDashboardView.jsx`](./src/components/dashboard/AcademicManagerDashboardView.jsx), [`practiceService.js`](./src/services/practiceService.js))**:
  - Thay thế ô nhập `Max K` cũ bằng cấu hình ngưỡng trực quan: **Ngưỡng Cơ bản (`< 50%`)**, **Ngưỡng Nâng cao (`>= 75%`)**, tùy chọn **Hiển thị & khởi tạo đủ khung 12 lớp** và checkbox **Chỉ xếp học sinh mới chưa có lớp (Bảo toàn 100% lớp của HS cũ)**.
  - Hiển thị kết quả dưới dạng **Ma trận 4 hàng (4 Miền kiến thức) × 3 cột (Cơ bản / Tăng tốc / Nâng cao)** kèm badge `+N mới`, thanh độ nắm vững trung bình từng miền, sĩ số `X/20 HS`, nhãn trạng thái (`Đủ điều kiện mở lớp`, `Đang gom lớp (< 5 HS)`, `Chưa có HS`) và nút **Gán Giáo Viên Phụ Trách** trực tiếp cho từng lớp.
- **Tối Ưu Đồng Bộ Dữ Liệu Học Sinh & Khắc Phục Xung Đột Phòng Học ([`EarlyWarningsMentorPanel.jsx`](./src/components/dashboard/EarlyWarningsMentorPanel.jsx), [`AcademicManagerDashboardView.jsx`](./src/components/dashboard/AcademicManagerDashboardView.jsx))**:
  - Bổ sung `useMemo`, kết nối truy vấn động `userService.getUsers({ role: 'STUDENT' })` lấy tên học sinh từ Identity REST API, ưu tiên dữ liệu từ backend và lọc trùng cảnh báo.
  - Bổ sung cơ chế đổi phòng/giờ học (Edit Slot thay vì Append), cập nhật phát hiện xung đột thời gian thực trong Modal Thời khóa biểu.
- **Kiểm Thử Vận Hành**:
  - `npm run build`: Thành công 100%, 0 lỗi biên dịch.
  - `node --test tests/*.test.js`: Toàn bộ **22/22 unit tests Passed**.
