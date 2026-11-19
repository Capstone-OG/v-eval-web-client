# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [19/11/2026] - Khắc Phục Triệt Để Lỗi Hook Màn Hình Đỏ, Chuẩn Hóa Cổng Phụ Huynh 4 Phân Hệ & Bố Cục Dashboard 3 Tầng Hiện Đại

- **Khắc Phục Lỗi Hook Vi Phạm Thứ Tự Render ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Di chuyển toàn bộ các Hook `useEffect` (tải học phí `getStudentTuitionStatus`, dự báo `getMyForecast`, lộ trình `getStudentDashboard`, cảnh báo sớm và bài thi gần đây) lên đầu component trước các câu lệnh `if (...) return`, triệt tiêu hoàn toàn ngoại lệ `Rendered more hooks than during the previous render`.
- **Đồng Bộ Hoàn Toàn `activeChildId` Xuyên Suốt Hệ Thống ([`App.jsx`](./src/App.jsx), [`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx), [`AccountNavbar.jsx`](./src/components/layout/AccountNavbar.jsx))**:
  - Nâng state `parentActiveChildId` lên `App.jsx`, giải quyết triệt để lỗi lệch ngữ cảnh con khi chuyển tab; đồng bộ tự động cho toàn bộ Dashboard, Tiến độ & Kết quả, Cảnh báo sớm và Học phí.
- **Tái Thiết Kế Menu Sidebar 4 Mục Chuẩn ([`Sidebar.jsx`](./src/components/layout/Sidebar.jsx), [`App.jsx`](./src/App.jsx))**:
  - Phân tách rạch ròi 4 mục điều hướng: *1. Tổng quan đồng hành*, *2. Tiến độ & Kết quả của con*, *3. Cảnh báo & Trao đổi Giáo viên*, *4. Học phí & Lịch sử giao dịch*.
- **Xây Dựng Phân Hệ Tiến Độ & Kết Quả 3 Tab Hợp Nhất ([`ParentChildResultsView.jsx`](./src/components/dashboard/ParentChildResultsView.jsx))**:
  - Tích hợp 3 góc nhìn dùng chung `activeChildId`: Biểu đồ Radar đối chiếu năng lực 4 môn với ngưỡng mục tiêu, Lộ trình kỹ năng cá nhân hóa (Chế độ chỉ đọc, không có nút làm bài thay con), và Lịch sử thi thử kèm trạng thái giám sát.
- **Xây Dựng Phân Hệ Cảnh Báo & Trao Đổi Giáo Viên ([`ParentEarlyWarningsAndTeacherView.jsx`](./src/components/dashboard/ParentEarlyWarningsAndTeacherView.jsx))**:
  - Lọc chính xác cảnh báo Mức 2 (Lưu ý) và Mức 3 (Nghiêm trọng), hỗ trợ nút *Xác nhận đã xem*, *Xác nhận tham gia họp 3 bên*, và khung nhắn tin trao đổi trực tiếp với Giáo viên phụ trách kèm mã cảnh báo.
- **Tái Cấu Trúc Bố Cục Dashboard 3 Tầng Hoàn Chỉnh**:
  - *Tầng 1*: Thanh chọn con (kèm dropdown chuyển con nếu có nhiều con) + Thông tin Giáo viên lớp Offline phụ trách & nút Nhắn tin; Dải cảnh báo học phí vàng nhạt chỉ hiện khi chưa đóng tiền, tự động ẩn khi đã thanh toán.
  - *Tầng 2*: 4 Thẻ chỉ số Ba Mẹ quan tâm nhất: Điểm thi dự kiến (kèm khoảng dao động và tỉ lệ đạt), Mức độ sẵn sàng thi, Thời gian học tuần này (kèm nút xem 7/30 ngày) và Tiến độ lộ trình cá nhân.
  - *Tầng 3*: Bố cục 2 cột (Cột trái 7 phần: Cảnh báo học tập & Bài thi gần đây; Cột phải 5 phần: Đánh giá 3 mặt học tập & Hồ sơ học tập kèm nút Hủy liên kết con).
- **Chuẩn Hóa Import Toast Hệ Thống ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx), [`ParentEarlyWarningsAndTeacherView.jsx`](./src/components/dashboard/ParentEarlyWarningsAndTeacherView.jsx))**:
  - Chuyển đổi import sang `ToastContext` nội bộ của dự án (`import { toast } from '../../context/ToastContext'`) thay vì package `react-hot-toast` ngoài, triệt tiêu hoàn toàn lỗi import analysis của Vite.
- **Dọn Sạch Toàn Bộ Thuật Ngữ Kỹ Thuật & Dữ Liệu Test ([`TuitionPaymentView.jsx`](./src/components/payment/TuitionPaymentView.jsx))**:
  - Loại bỏ hoàn toàn các từ viết tắt nội bộ: IRT Theta, BKT, ZPD, PLAR, Core Flow 5, Live Identity + Practice gRPC, giá thử nghiệm 5.000 ₫; thay bằng ngôn ngữ tiếng Việt đời thường, dễ hiểu cho gia đình.
- **Đồng Bộ Bộ Chọn Con Toàn Diện Trên Top Navbar & Học Phí ([`AccountNavbar.jsx`](./src/components/layout/AccountNavbar.jsx), [`TuitionPaymentView.jsx`](./src/components/payment/TuitionPaymentView.jsx), [`App.jsx`](./src/App.jsx))**:
  - Bổ sung bộ chọn dropdown con ngay trên thanh điều hướng đầu trang `AccountNavbar` khi phụ huynh liên kết $\ge 2$ con, cho phép chuyển đổi học sinh tức thì từ mọi trang.
  - Đồng bộ hóa sự kiện click chọn thẻ con trong `TuitionPaymentView` với `onSelectChildId`, cập nhật trạng thái `activeChildId` toàn cục ngay lập tức.
- **Kiểm Thử & Nghiệm Thu**:
  - `npm run build`: Thành công 100% trong 1.15s, 0 lỗi biên dịch.
  - `node --test tests/*.test.js`: Toàn bộ **22/22 unit tests Passed**.
