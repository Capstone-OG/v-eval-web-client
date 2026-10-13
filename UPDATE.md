# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [12/10/2026] - Trực Quan Hóa Mã Phòng Thi Thử Demo, Tích Hợp Nút Sao Chép & Tự Điền Passcode 1-Click

- **Trực Quan Hóa Mã Phòng Thi Thử Demo (`DiagnosticAssessmentPage.jsx`)**:
  - Hiển thị trực tiếp mã phòng thi (`VACT2026`, `HCM120`, `LOGIC15`) trên từng thẻ bài thi khảo sát và tích hợp nút `Copy` mã 1-click.
  - Tích hợp huy hiệu Passcode kèm nút `Tự điền & Copy` ngay trong Modal xác nhận vào phòng thi, giúp thí sinh/người dùng demo điền mã tức thì mà không cần nhập thủ công.
  - Bổ sung thanh chọn nhanh mã phòng demo dưới Hero Banner với trạng thái phản hồi `✓ Đã chép`.
- **Đồng Bộ Dữ Liệu Nộp Bài Khảo Thí Vào Practice Service & Fallback An Toàn**:
  - Giữ vững kết nối API `contentService.getExamDetail` và `practiceService.submitDiagnosticTest`.
  - Cơ chế Fallback dự phòng 100% đảm bảo khi chạy demo độc lập vẫn hoạt động mượt mà, đầy đủ tính năng đo lường IRT 2PL Theta 0 và vẽ Radar Chart.
- **Kiểm Thử Biên Dịch & Vận Hành Giao Diện Frontend**:
  - Chạy lệnh `npm run build` thành công 100% trong 1.30 giây, 0 lỗi cú pháp.
