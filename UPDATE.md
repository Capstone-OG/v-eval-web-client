# UPDATE - V-Eval-Web_Client

## [19/11/2026]
- **Nâng Cấp Giao Diện Xếp Lớp Đầu Vào Theo Ma Trận 4 Miền × 3 Cấp Bậc (12 Lớp Chuẩn - `./src/components/dashboard/AcademicManagerDashboardView.jsx`, `./src/services/practiceService.js`)**:
  - Thay thế ô nhập `Max K` cũ bằng cấu hình ngưỡng trực quan: **Ngưỡng Cơ bản (`< 50%`)**, **Ngưỡng Nâng cao (`>= 75%`)**, tùy chọn **Hiển thị & khởi tạo đủ khung 12 lớp** và checkbox **Chỉ xếp học sinh mới chưa có lớp (Bảo toàn 100% lớp của HS cũ)**.
  - Hiển thị kết quả dưới dạng **Ma trận 4 hàng (4 Miền kiến thức) × 3 cột (Cơ bản / Tăng tốc / Nâng cao)** kèm badge `+N mới`, thanh độ nắm vững trung bình từng miền, sĩ số `X/20 HS`, nhãn trạng thái (`Đủ điều kiện mở lớp`, `Đang gom lớp (< 5 HS)`, `Chưa có HS`) và nút **Gán Giáo Viên Phụ Trách** trực tiếp cho từng lớp.
- **Triệt Tiêu 100% Hardcode Tên Học Sinh - Kết Nối Động Qua Identity REST API (`./src/components/dashboard/EarlyWarningsMentorPanel.jsx`)**:
  - *Bổ sung import `useMemo`*: Khắc phục lỗi runtime `ReferenceError: useMemo is not defined` tại dòng 1 của `EarlyWarningsMentorPanel.jsx`.
  - *Xóa bỏ toàn bộ hàm `resolveStudentDisplayName` và mảng GUID tĩnh*: Không còn bất kỳ đoạn mã gán tên theo chuỗi hex nào (`11111111`, `11110000`, `99999999`, `BC933364`...).
  - *Tích hợp truy vấn động từ `userService.getUsers({ role: 'STUDENT', pageSize: 100 })`*: Tự động xây dựng từ điển người dùng `identityUsersMap` từ Identity Service (`GET /api/v1/users`) để điền tên đầy đủ cho bất kỳ học sinh nào khi cần.
  - *Ưu tiên dữ liệu chuẩn xác*: Hiển thị trực tiếp `studentName` trả về từ Backend (vốn đã được đồng bộ qua gRPC từ `iam.users`), chỉ fallback sang Identity REST API khi tên bị trống.
  - *Khử trùng lặp thẻ cảnh báo*: Giữ lại bộ lọc `seenAlerts` theo cặp `(studentId, alertType)` để loại bỏ các bản ghi trùng lặp ở client.
- **Khắc Phục Lỗi Xung Đột Phòng Học 409 Khi Đổi Phòng Lớp Học (`./src/components/dashboard/AcademicManagerDashboardView.jsx`)**:
  - *Chuyển đổi cơ chế cập nhật ca học (Edit Slot Thay Vì Append)*:
    - Bổ sung danh sách các ca học hiện tại trong tuần của lớp trong Modal 5 (Thời khóa biểu & Buổi học), hiển thị rõ Thứ, Khung giờ, và Phòng học.
    - Bổ sung nút ✏️ **"Đổi Phòng / Giờ"** cho từng ca học, cho phép chọn nhanh phòng học mới (ví dụ từ `P.301` sang `P.302`) và nút 🗑️ **"Xóa"** ca học thừa.
    - Cập nhật hàm `handleSaveWeeklySlotAndGenerate`: Khi đang ở chế độ chỉnh sửa (`editingSlotIdx !== null`), hệ thống thay thế trực tiếp ca học đang chọn thay vì thêm mới chồng lấn, triệt tiêu mã phòng cũ (`P.301`) trước khi gửi lên API Backend `saveClassWeeklySchedules`.
    - Cập nhật bộ phát hiện xung đột thời gian thực `scheduleSlotConflict`: Loại trừ chính slot đang chỉnh sửa khỏi danh sách so sánh nội bộ, giúp cảnh báo biến mất ngay khi người dùng chọn phòng trống hợp lệ.
- **Tách Riêng Component `AcademicManagerDashboardView.jsx`, Khóa Chặt Cơ Sở Phụ Trách & Tích Hợp Nạp Mẫu Đợt Học / Khóa Học**:
  - Tích hợp nút **"✨ Nạp Đợt Học Mẫu Để Kiểm Thử"** và **"✨ Nạp Khóa Học Mẫu Để Kiểm Thử"** kèm nút **"✨ Điền Mẫu"** trong modal tạo mới.
  - Thay dropdown chọn cơ sở bằng **Huy hiệu Cơ sở Cố định (Locked Campus Badge)** có biểu tượng `Lock` và `ShieldCheck` bảo vệ RBAC (`MGR_22`).
  - Chuẩn hóa giao diện Cảnh báo sớm Production-grade (loại bỏ `Core Flow 6`, `BR-04`, `Tier 1/2/3`, `Toa thuốc bù điểm ROI #1`, `SM-2`, `Mục tiêu ảo`).
- **Kiểm Thử Vận Hành**: `npm run build` (`vite build`) đạt `✓ built in 1.66s` với 3054 modules sạch 100%, 0 lỗi.
