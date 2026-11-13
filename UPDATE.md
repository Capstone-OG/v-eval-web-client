# UPDATE

## [13/11/2026] - Triển Khai Ràng Buộc Xem Lộ Trình Sau Thi (Lớp Học Chung & Cá Nhân Riêng) Và Cơ Chế Kích Hoạt Học Phí

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
  - Viết mới test suite [`tests/curriculumAccess.test.js`](./tests/curriculumAccess.test.js), toàn bộ 31/31 unit tests vượt qua 100%, `npm run lint` đạt 0 lỗi, `npm run build` thành công.
