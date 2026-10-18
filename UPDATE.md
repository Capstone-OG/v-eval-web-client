# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [15/10/2026] - Tích Hợp Nút "Thi Thử Ngay" Trên Top Header & Modal Xác Thực Passcode Khởi Động Bài Thi Đầu Vào

- **Tích Hợp Nút "Thi Thử Ngay" Trực Tiếp Trên Thanh Điều Hướng Header (`Navbar.jsx`)**:
  - Bổ sung nút gradient xanh-tím nổi bật (`from-blue-600 to-indigo-600`) kèm biểu tượng tia sét vàng `Zap` ngay cạnh nút *Đặc tả Kiến trúc & 3 Q&A* trên thanh Top Navbar của Dashboard.
  - Hỗ trợ responsive đa màn hình (`Thi thử ngay` trên màn hình vừa/lớn và `Thi Thử` trên màn hình nhỏ), giúp học sinh truy cập bài khảo sát năng lực 30 câu tức thì tại mọi vị trí trong hệ thống.
- **Xây Dựng Component Modal Chi Tiết & Nhập Passcode Tái Sử Dụng (`ExamPasscodeModal.jsx`)**:
  - Tạo mới component `ExamPasscodeModal.jsx` hiển thị trực quan thông số bài thi khảo sát đầu vào 30 câu V-ACT 2026:
    - *Số lượng câu hỏi*: 30 câu trắc nghiệm.
    - *Thời gian làm bài*: 45 phút.
    - *Quy chế phòng thi*: Azota Proctored Toàn Màn Hình.
    - *Động cơ chấm điểm*: IRT 2PL & Theta 0.
  - Tích hợp khối cảnh báo giám sát thi trực tuyến Azota (toàn màn hình, phát hiện rời tab/mất focus quá 3 lần).
  - Tích hợp ô nhập mã phòng thi / mật mã truy cập kèm nút *Điền mã mẫu* (`VACT2026`), xác thực mã hợp lệ và báo lỗi trực quan nếu nhập sai.
- **Đấu Nối Khởi Động Trực Tiếp Phòng Thi Từ Dashboard (`App.jsx`, `DiagnosticAssessmentPage.jsx`)**:
  - Khi học sinh xác nhận mã thành công từ Modal trên Dashboard, hệ thống tự động thiết lập `diagnosticAutoStart = true`, chuyển sang tab `diagnostic`, kích hoạt chế độ thi toàn màn hình và ẩn thanh Navbar/Sidebar để bước vào bài thi tập trung cao độ.
  - Khi nộp bài hoặc chọn quay lại Dashboard, hệ thống tự động reset `autoStart` và khôi phục giao diện điều hướng tổng quan.
- **Kiểm Thử Biên Dịch & Vận Hành**:
  - Chạy `npm run build` thành công 100% trong 1.23 giây, 2902 modules được chuyển đổi sạch, 0 lỗi cú pháp.
