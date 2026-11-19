# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [19/11/2026] - Tái Thiết Kế Thanh Điều Hướng Đỉnh Cao "EdTech Mission Control" & Nâng Cấp Giao Diện Cổng Phụ Huynh, Lịch Sử Bài Thi

- **Tái Thiết Kế Top Navbar Theo Concept "EdTech Mission Control" ([`AccountNavbar.jsx`](./src/components/layout/AccountNavbar.jsx))**:
  - **Triệt tiêu 100% hardcode**: Dữ liệu đếm ngược kỳ thi, thông báo, chip học sinh đồng hành, cơ sở học tập và chuỗi ngày streak được lấy trực tiếp từ CSDL Backend (`practiceService.getAcademicTerms`, `practiceService.getMyAlerts`, `portalMetrics`, `currentUser`).
  - **Viên Nang Đếm Ngược Kỳ Thi & Lộ Trình (Center Pill)**: Tính toán động số ngày còn lại đến kỳ thi ĐGNL ĐHQG TP.HCM / Học kỳ từ CSDL; tích hợp radar pulse và click mở modal chi tiết lộ trình thi Đợt 1, Đợt 2, cấu trúc đề 120 câu / 150 phút và điểm mục tiêu cá nhân (1200 điểm).
  - **Ngữ Cảnh Học Sinh Cho Phụ Huynh & Cơ Sở Cho Học Viên (Left Context)**: Tự động hiển thị chip học sinh đang theo dõi (`👤 Đang đồng hành: [Tên con] ([Lớp])`) cho phụ huynh và huy hiệu cơ sở học tập cho học sinh.
  - **Chuông Cảnh Báo Sớm Tương Tác Sư Phạm (Notification Bell & Flow 6 Drawer)**: Móc nối API `practiceService.getMyAlerts`, lắng nghe sự kiện `veval:flow6-updated`, hiển thị badge số lượng chưa đọc (`animate-pulse`), dropdown phân loại cảnh báo đỏ / vàng / lời khuyên sư phạm kèm thao tác đánh dấu đã đọc (`markAlertAsRead`) và đọc tất cả.
  - **Viên Nang Hồ Sơ & Trạng Thái Trực Tuyến (User Profile Pill & Menu)**: Avatar với chấm xanh online, tên người dùng thật, nhãn vai trò tiếng Việt, menu tài khoản truy cập nhanh cài đặt và đăng xuất.
- **Tái Cấu Trúc Toàn Diện Hero Header & Thông Tin Ngữ Cảnh Con ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Gộp 2 banner xanh cồng kềnh thành 1 Hero Header tông Navy-Indigo (`from-slate-900 via-indigo-950 to-blue-950`), tích hợp trực tiếp thông tin trường THPT, khối lớp và ngành mục tiêu NV1 của con.
  - Tinh tế hóa khối học phí PayOS thành ribbon tài chính thanh lịch với icon `ShieldCheck` và CTA VietQR tự động kích hoạt.
  - Nâng cấp 4 thẻ chỉ số trọng tâm với hàm `getTierInfo` phân loại chuẩn xác 4 bậc sẵn sàng (`NOT_READY`, `PREPARING`, `ACCELERATING`, `READY`).
  - Đưa khối thông tin giáo viên phụ trách về đúng vị trí thẻ hồ sơ cố vấn học vụ với tên giảng viên thật hoặc nhãn trung thực *"Chưa có giáo viên phụ trách"*.
- **Chuẩn Hóa Giao Diện Lịch Sử Bài Thi Của Con ([`SubmissionHistoryView.jsx`](./src/components/diagnostic/SubmissionHistoryView.jsx))**:
  - Đồng bộ Hero Header tông màu Navy-Indigo, bổ sung thanh chọn nhanh con đa năng linh hoạt.
  - Triệt tiêu thuật ngữ kỹ thuật khó hiểu: chuyển đổi theta IRT khô khan (`-1.8333`) sang phân cấp sư phạm nhân văn qua `formatThetaDisplay`, xóa bỏ hậu tố developer `(DIAGNOSTIC)` và nhãn `ZPD`.
  - Khắc phục lỗi đếm lệch câu làm sai (0 câu vs 26 câu): tính toán chuẩn xác `summaryStats.totalWrong` trên toàn bộ các bài thi.
- **Kiểm Thử & Biên Dịch Toàn Bộ Web Client**:
  - `npm run build`: Thành công 100% trong 1.04s, 0 lỗi biên dịch.
  - `node --test tests/*.test.js`: Đạt **22/22 tests passed**.
