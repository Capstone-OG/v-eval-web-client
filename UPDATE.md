# UPDATE

## [13/11/2026] - Tối Giản Màn Hình Tổng Quan Học Tập, Bỏ Khối Chặng Học Giả Lập & Khắc Phục Lỗi Lịch Sử Làm Bài

- **Tối giản hóa màn hình Tổng quan học tập & Bỏ khối chặng học giả lập ([`App.jsx`](./src/App.jsx))**:
  - Gỡ bỏ hoàn toàn khối `MilestoneCard` và `LiveQnACard` tại trang tổng quan (chặng học giả lập, phòng phụ đạo mock), tập trung hoàn toàn vào các nội dung thiết thực cho học sinh.
  - Tinh chỉnh `HeroBanner.jsx` và `MetricsGrid.jsx`: thay thế các từ ngữ kỹ thuật nội bộ ("ZPD", "DAG", "Flow 5", "IRT 2PL") bằng thông tin trực quan: Điểm năng lực ước tính, Chuỗi chuyên cần, Tiến độ lộ trình, và Trọng tâm cần cải thiện.
- **Gia cố cơ chế tự hồi phục (Graceful Fallback) nạp lịch sử thi ([`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx))**:
  - Bọc từng lời gọi lấy chi tiết bài nộp trong `try/catch` độc lập, tự động fallback về dữ liệu tóm tắt (`theta0`, `placementClass`, điểm số) khi gặp bài thi cũ không còn câu hỏi trên Backend Content Service.
  - Xóa bỏ triệt để lỗi crash 500 hiển thị *"Không tải được lịch sử: Đã xảy ra lỗi nội bộ trên hệ thống máy chủ Practice Service"*.
- **Phân tách 2 chế độ Lộ trình học tập ([`StudentCurriculumView.jsx`](./src/components/curriculum/StudentCurriculumView.jsx), [`curriculumAccess.js`](./src/components/curriculum/curriculumAccess.js))**:
  - Hỗ trợ chuyển đổi linh hoạt giữa:
    - *🏫 Lớp Học Chung*: Toàn bộ cây tri thức chuẩn hóa 5 miền ĐGNL V-ACT theo cấu trúc Chương -> Bài học -> Dạng bài.
    - *🎯 Lộ Trình Cá Nhân Riêng*: Tự động phân cụm 3 chặng học thích ứng dựa trên kết quả thi chẩn đoán (Chặng 1: Bù lỗ hổng ZPD `+75 - +110đ`, Chặng 2: Nâng cao vận dụng `+50 - +70đ`, Chặng 3: Thực chiến 900+ `+35 - +50đ`).
- **Thiết lập ràng buộc học phí & Chế độ xem tổng quát ([`TuitionRequiredModal.jsx`](./src/components/modals/TuitionRequiredModal.jsx))**:
  - Học sinh sau khi thi chỉ được xem cấu trúc tổng quát của lộ trình.
  - Chặn mở bài học chi tiết, video bài giảng, phương pháp giải và luyện tập củng cố khi chưa hoàn tất học phí (`!isPaid`), tự động mở modal điều hướng đến trang thanh toán VietQR PayOS.
- **Đồng bộ hóa luồng sau thi & Học phí ([`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx), [`TuitionPaymentView.jsx`](./src/components/payment/TuitionPaymentView.jsx), [`App.jsx`](./src/App.jsx))**:
  - Bổ sung banner thông báo và nút chuyển tiếp trực tiếp sang Lộ trình và Học phí ngay tại màn hình kết quả sau thi.
  - Tích hợp lưu vết trạng thái đóng tiền (`veval_tuition_paid_${studentId}`) và nút kích hoạt nhanh phục vụ kiểm thử nghiệm thu.
- **Kiểm thử & Biên dịch**:
  - Toàn bộ 31/31 unit tests vượt qua 100%, `npm run lint` đạt 0 lỗi, `npm run build` thành công trong 1.17s.
