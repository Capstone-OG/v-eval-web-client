# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [18/10/2026] - Tách Bạch Ngân Hàng Đề Thi & Tinh Gọn Flow 1 Chỉ Lưu Vết Lịch Sử & Chi Tiết Lần Thi

- **Di Chuyển Toàn Bộ Phòng Thi & Danh Mục Đề Thi Xuống Ngân Hàng Đề (`QuestionBankPage.jsx`)**:
  - Tạo mới component `QuestionBankPage.jsx` phụ trách mục *"Ngân hàng đề & Thi thử"* trên Sidebar.
  - Tích hợp Sảnh Thi Chuẩn Hóa V-ACT 2026, thanh tìm kiếm / nhập mã phòng thi (`VACT2026`), dải 5 Miền Năng Lực Chuẩn, bộ lọc danh mục (Tất Cả, Khảo Sát Đầu Vào, Thi Thử 120 Câu, Luyện Chuyên Sâu) và thẻ đề thi chi tiết kèm modal passcode.
- **Tinh Gọn Trung Tâm Khảo Thí & Chẩn Đoán (Flow 1) Thành 2 Chế Độ Trực Quan (`DiagnosticAssessmentPage.jsx`)**:
  - Loại bỏ hoàn toàn các tab phòng thi trùng lặp, trả Flow 1 về đúng trọng tâm: Quản lý kết quả các lần khảo thí và chẩn đoán năng lực.
  - *Chế độ 1 (Danh Sách Các Lần Làm Bài)*: Hiển thị trực tiếp 4 thẻ chỉ số KPI tổng quan (Tổng số đợt thi, Điểm cao nhất, Năng lực đỉnh IRT `` `\theta` ``, Thời gian trung bình), biểu đồ diện tích Recharts AreaChart xu hướng tiến trình `` `\theta` `` qua các đợt thi so với mốc chuẩn 900+ (`` `\theta \ge +0.80` ``), và bảng lịch sử các lần thi.
  - *Chế độ 2 (Chi Tiết Lần Làm Bài & Biểu Đồ Đa Chiều)*: Nhấp vào bất kỳ lần thi nào trong bảng sẽ mở trang báo cáo chi tiết lần thi đó:
    1. Thanh điều hướng đầu trang với nút *← Quay Lại Danh Sách Lần Thi* và thông tin lần thi.
    2. Cụm 4 thẻ đo nhịp độ Pacing Speedometers (<25s nhanh, 25-90s chuẩn, >90s tốn thời gian, trung bình).
    3. Biểu đồ Radar 5 Miền Năng Lực đối chiếu chuẩn 900+ ĐHQG-HCM.
    4. Thanh tiến trình độ chính xác từng lĩnh vực và lời khuyên sư phạm Cố vấn AI Socratic.
    5. Bảng xem lại 30 câu hỏi chi tiết có bộ lọc (Tất cả / Đúng / Sai / Phân vân) với công thức toán học KaTeX và lời giải từng bước.
- **Cơ Chế Bền Vững & Đồng Bộ Lịch Sử**:
  - Tự động ghi nhận bài thi vừa hoàn thành vào `veval_exam_history` trong `localStorage` và chuyển tiếp tức thì sang trang chi tiết lần thi đó.
- **Kiểm Thử Biên Dịch & Vận Hành Trình Duyệt**:
  - Chạy `npm run build` thành công 100% trong 1.15 giây, 0 lỗi cú pháp.
  - Browser subagent tự động kiểm thử Flow 1 -> Xem lịch sử -> Mở chi tiết đồ thị -> Quay lại -> Sang Ngân hàng đề -> Mở modal passcode `VACT2026` hoạt động trơn tru 100%.
