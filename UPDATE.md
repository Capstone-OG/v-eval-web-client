# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [19/11/2026] - Chuẩn Hóa Trải Nghiệm Người Dùng Cổng Phụ Huynh (User-Centric UX): Loại Bỏ 100% Thuật Ngữ Kỹ Thuật

- **Thanh Lọc Toàn Diện Thuật Ngữ Kỹ Thuật Trên Giao Diện Phụ Huynh ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Loại bỏ các thuật ngữ/mã nội bộ: `Core Flow 5`, `● Live Identity + Practice gRPC`, `R_exam`, `PLAR`, `tâm trắc học IRT & BKT`, `thích ứng ZPD`, `chống treo máy ảo`.
  - Thay thế bằng ngôn ngữ thân thiện, dễ hiểu, lấy phụ huynh làm trọng tâm:
    - *Top Badge*: Chuyển thành `"Không Gian Đồng Hành Cùng Con"` kèm chỉ báo trạng thái *"Cập nhật trực tiếp theo thời gian thực"*.
    - *Mô tả cổng*: `"Báo cáo toàn diện về mức độ tự tin thi ĐGNL, thời lượng tự học thực tế và nhận xét đồng hành từ đội ngũ sư phạm V-Eval."`.
    - *Khối Học phí*: Chuyển thành `"Nộp Học Phí Để Mở Khóa Lộ Trình Học Cá Nhân Hóa Cho Con"` và nút `"Nộp Học Phí Cho Con"`.
    - *4 Thẻ tổng quan*: Đổi `"Chỉ số Sẵn sàng Thi (R_exam)"` thành `"Chỉ Số Sẵn Sàng Thi ĐGNL"`, `"Trung bình xác suất làm chủ BKT 4 miền"` thành `"Mức độ bao quát kiến thức các phần thi ĐGNL"`.
    - *3 Trụ cột đánh giá*: Đổi thành `"3 Trụ Cột Đánh Giá Mức Độ Sẵn Sàng Đi Thi Của Con"` (Năng lực làm bài & giải đề thi 50%, Độ vững kiến thức các môn thi 35%, Tính kỷ luật và sự chăm chỉ học tập trong tuần 15%).
    - *Khung giờ tự học*: Chuyển thành lời nhắn nhủ sư phạm gần gũi: *"Hệ thống ghi nhận thời lượng thực chất khi con tập trung học video bài giảng và giải bài tập rèn luyện, giúp phụ huynh an tâm về việc học thật của con."*.
- **Tối Ưu Ngôi Xưng Nhắc Nhở Học Tập ([`StudentEarlyWarningsCard.jsx`](./src/components/dashboard/StudentEarlyWarningsCard.jsx))**:
  - Chuyển đổi ngôi xưng phù hợp góc nhìn phụ huynh: *"nhắc bạn ôn bài..."* -> *"nhắc nhở con ôn bài..."*, *"Bạn đang duy trì..."* -> *"Con đang duy trì nhịp độ học tập rất tốt!"*.
- **Chuẩn Hóa Sidebar & Footer ([`Sidebar.jsx`](./src/components/layout/Sidebar.jsx), [`App.jsx`](./src/App.jsx))**:
  - Menu phụ huynh: Đổi `"Chỉ số R_exam & Kỷ luật tuần"` thành `"Chỉ số sẵn sàng & Tự học tuần"`, đổi `"Đóng Học phí PayOS"` thành `"Đóng Học phí & Gói học"`.
  - Footer hệ thống: Thay đổi hiển thị vai trò kỹ thuật `"Vai trò hiện tại: PARENT"` thành `"Tài khoản: Phụ huynh"`.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Hoàn thành thành công 100% trong 1.19s.
  - `node --test tests/*.test.js`: Đạt **22/22 tests passed**.
