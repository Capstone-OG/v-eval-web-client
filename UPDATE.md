# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [15/10/2026] - Khắc Phục Lỗi Đè Lấn Navbar, Tích Hợp Trung Tâm Khảo Thí & Modal Chọn Đề 30 Câu Cho Tài Khoản Đã Đăng Nhập (Flow 1)

- **Khắc Phục Triệt Để Lỗi Va Chạm Giao Diện Thanh Điều Hướng (Navbar Overlap Fix)**:
  - Sửa lỗi bộ chọn cơ sở đào tạo (`Cơ sở 1: ĐHQG TP.HCM (Thủ Đức)`) đè lấn lên huy hiệu chuỗi học tập `12 Ngày` trên thanh Header.
  - Bổ sung `overflow-hidden min-w-0 max-w-[210px]` cho vùng chứa, `truncate` cho thẻ `<select>` và `shrink-0 whitespace-nowrap` cho huy hiệu ngọn lửa Streak.
  - Tối ưu hóa điểm ngắt giao diện (`hidden xl:flex`) bảo đảm bố cục hiển thị cách đều, rộng rãi trên mọi độ phân giải màn hình.
- **Tích Hợp Sảnh Trung Tâm Khảo Thí & Chẩn Đoán Cho Người Dùng Đã Đăng Nhập (`DiagnosticAssessmentPage.jsx`)**:
  - Xây dựng giao diện Sảnh Trung Tâm Khảo Thí hiển thị khi người dùng chọn mục *Khảo thí & Chẩn đoán (Flow 1)* từ Sidebar Dashboard.
  - Cung cấp Hero Banner giới thiệu chuẩn hóa V-ACT 2026, thanh tìm kiếm/nhập mã phòng thi nhanh, và dải thông tin 5 miền năng lực chuẩn (Toán học, Logic, Ngôn ngữ, KHTN, KHXH).
  - Trình bày danh mục thẻ bài thi trực quan với đầy đủ thông số thời gian, số câu hỏi, huy hiệu trạng thái và mã phòng thi mặc định (`VACT2026`, `HCM120`, `LOGIC15`).
- **Khắc Phục Lỗi Màn Hình Chờ Treo Vô Hạn (Lobby Loading Fix)**:
  - Cập nhật khởi tạo biến trạng thái `isLoading` dựa theo `Boolean(autoStart)` (thay vì cố định `true`), giúp sảnh chờ hiển thị tức thì, không bị modal loading che phủ khi chuyển trang từ Dashboard.
- **Modal Chi Tiết Đề Thi & Xác Thực Passcode Vào Phòng Thi (`selectedExamForModal`)**:
  - Nhấp vào đề thi 30 câu mở popup chi tiết: hiển thị thông số bài thi, cảnh báo quy chế giám sát toàn màn hình Azota và động cơ ước lượng IRT 2PL `\theta_0`.
  - Ô nhập mã phòng thi được tự động điền sẵn `VACT2026` kèm nút *Điền mã mẫu*, hỗ trợ xác thực mã tức thì và khởi động bài thi mượt mà vào Câu 1/30.
- **Chuẩn Hóa Hệ Thống Popup & Thoát Phòng Thi Chuẩn React (Zero Native Dialogs)**:
  - Loại bỏ hoàn toàn `window.alert` và `window.confirm` native, thay thế bằng các React Modal chuyên biệt (`showPopupAlert`, `showExitConfirmModal`) nhằm ngăn chặn việc mất focus cửa sổ trình duyệt gây tính nhầm vi phạm rời tab.
- **Kiểm Thử Biên Dịch & Vận Hành**:
  - Chạy lệnh `npm run build` thành công 100% trong 2.79 giây, 0 lỗi cú pháp.
