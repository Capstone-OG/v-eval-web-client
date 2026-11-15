# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [15/11/2026] - Tích Hợp Đồng Bộ Học Phí Thực Tế Từ Database, Khối Chi Tiết Gói Đào Tạo Đang Kích Hoạt, 6 Phân Hệ Đã Mở Khóa, Bảng Hóa Đơn Điện Tử PayOS & Modal Kiểm Toán Biên Lai Giao Dịch

- **Đồng Bộ Trạng Thái Học Phí Thực Tế & Mở Khóa Khóa Học Tự Động Từ Database ([`curriculumAccess.js`](./src/components/curriculum/curriculumAccess.js), [`StudentCurriculumView.jsx`](./src/components/curriculum/StudentCurriculumView.jsx), [`paymentService.js`](./src/services/paymentService.js))**:
  - Mở rộng `paymentService.getStudentTuitionStatus(studentId)` và `paymentService.getStudentPayments(studentId)` kết nối API Gateway (`:5212`) truy vấn trực tiếp cơ sở dữ liệu Practice Service (`:5261`).
  - Hiện thực hóa hàm `syncTuitionStatusFromServer(studentId)` trong `curriculumAccess.js`: tự động đồng bộ trạng thái thanh toán từ PostgreSQL, ghi nhận vào `localStorage` và bắn sự kiện `veval:tuition-paid`.
  - Trong `StudentCurriculumView.jsx`, tự động kích hoạt `syncTuitionStatusFromServer` khi mở trang, giúp học sinh đã chuyển khoản thành công vào học ngay lập tức mà không bị chặn bởi `TuitionRequiredModal`.

- **Nâng Cấp Toàn Diện Phân Hệ Quản Lý Học Phí & Hóa Đơn ([`TuitionPaymentView.jsx`](./src/components/payment/TuitionPaymentView.jsx), [`App.jsx`](./src/App.jsx))**:
  - **Khối Gói Đào Tạo Đang Kích Hoạt (Active Course Package Card)**: Hiển thị tên khóa học thực tế (`courseName`), mã khóa (`courseCode`), trạng thái `ĐANG HOẠT ĐỘNG (ACTIVE)`, thời hạn hiệu lực (từ ngày - đến ngày, số tuần học) và lớp học phần chuyên đề được xếp (`assignedClassName`).
  - **Danh Mục 6 Phân Hệ & Quyền Lợi Đã Mở Khóa 100%**:
    1. *Lộ Trình Cá Nhân Thích Ứng (PLAR)*: 4 bước P-L-A-R phân bổ theo kết quả bài thi.
    2. *Bài Giảng Chuyên Đề & Video Độc Quyền*: Xem video lý thuyết và phương pháp giải V-ACT.
    3. *Kho Luyện Tập Thích Ứng ZPD*: Sinh câu hỏi phân tầng theo năng lực thực tế.
    4. *Gia Sư AI Socratic Kèm 24/7*: Hướng dẫn tư duy logic đa bước không làm lộ đáp án.
    5. *Thời Khóa Biểu & Điểm Danh Cá Nhân*: Lịch học định kỳ, buổi học bù và điểm danh tại cơ sở.
    6. *Lớp Học Phần & Diễn Đàn Live Q&A*: Nhóm học tập vi mô 3-5 bạn cùng giảng viên.
  - **Bảng Lịch Sử Thanh Toán & Hóa Đơn Điện Tử Thực Tế**: Hiển thị bảng giao dịch đối soát từ DB gồm Mã đơn hàng PayOS (`#orderCode`), Khóa học, Số tiền (VNĐ), Ngân hàng đối ứng (`counterAccountBankName`), Thời gian nộp, Mã giao dịch ngân hàng (`transactionRef`), Trạng thái `ĐÃ HOÀN TẤT` và nút "Xem chi tiết".
  - **Modal Biên Lai Thu Học Phí Điện Tử & Kiểm Toán Bảo Mật**: Hiển thị chi tiết hóa đơn, người nộp, ngân hàng, mã tham chiếu ngân hàng, kiểm toán chữ ký số `HMAC-SHA512 Verified` và nút in biên lai (`window.print()`).

- **Kiểm Thử & Biên Dịch**:
  - Toàn bộ **31/31 unit tests (`node --test`)** đạt pass 100%.
  - `npm run build` (`vite v8.3.0`) hoàn thành trong 1.09s với **0 lỗi cú pháp**.
