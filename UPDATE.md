# UPDATE - V-EVAL WEB CLIENT

## [23/11/2026]
  - **Hoàn Thiện Bộ 3 Nghiệp Vụ Cổng Giảng Viên (TCH-03, TCH-04, TCH-05)**:
    + **TCH-03 — Tra Cứu Lịch Sử Làm Bài & Phân Tích Lỗ Hổng Kiến Thức Học Viên Đa Lớp (`TeacherSubmissionHistoryView.jsx`, `App.jsx`, `TeacherPortalView.jsx`)**:
      * Đồng bộ bộ chọn lớp động đa lớp (`assignedClasses`) qua API `practiceService.getClasses({ teacherId })`, cho phép Giảng viên chuyển đổi tức thời giữa các lớp phụ trách và tải danh sách học sinh thực tế từ Heatmap ma trận lớp.
      * Tích hợp đầy đủ 3 nhóm bài làm chuẩn hóa: (1) Thi đầu vào (30 câu - phân tích Theta 0, điểm số, tỷ lệ đúng theo miền); (2) Luyện tập thích ứng ZPD & Topic Quiz; (3) Thi thử V-ACT (120 câu chuẩn hóa kèm trạng thái giám sát liêm chính Proctoring).
      * Chức năng xem chi tiết từng câu làm sai: hiển thị đề bài toán học (KaTeX/MathText), phương án học sinh chọn, đáp án đúng và lời giải chi tiết giúp Giảng viên chuẩn bị giáo án chữa đề sát lỗ hổng thực tế; tích hợp form lưu ghi chú sư phạm nhanh theo từng học sinh.
    + **TCH-04 — Kênh Nhận & Phản Hồi Tin Nhắn Trao Đổi 2 Chiều Phụ Huynh - Giảng Viên (`parentTeacherMessagingStore.js`, `ParentEarlyWarningsAndTeacherView.jsx`, `EarlyWarningsMentorPanel.jsx`, `tests/parentTeacherMessagingStore.test.js`)**:
      * Xây dựng module lưu trữ và đồng bộ trạng thái phản ứng hai chiều `parentTeacherMessagingStore.js` với cơ chế CustomEvent `veval:parent-teacher-message`.
      * Phía Phụ huynh: Lưu trữ lịch sử tin nhắn kèm liên kết cảnh báo học tập, hiển thị luồng trao đổi dạng hội thoại trực quan kèm phản hồi của Giảng viên ngay khi có.
      * Phía Giảng viên: Bổ sung nút truy cập nhanh "Hộp Thư Phụ Huynh" với chỉ báo tin nhắn mới tại header, gắn nhãn thông báo tin nhắn phụ huynh trên từng thẻ học sinh cảnh báo, mở hộp thoại xem chi tiết và gửi phản hồi sư phạm tức thì về Cổng Phụ huynh.
    + **TCH-05 — Phân Định Rõ Ràng Thẩm Quyền Xử Lý Cảnh Báo Cấp 1–2 (Giảng Viên) vs Cấp 3 (Quản Lý Cơ Sở) (`EarlyWarningsMentorPanel.jsx`)**:
      * Chuẩn hóa nhãn phân cấp trên từng thẻ cảnh báo sớm: Cấp 1 (Nhắc nhở tự học / chuyên cần - Giảng viên trực tiếp kèm cặp), Cấp 2 (Lệch mục tiêu - Giảng viên tư vấn sư phạm), Cấp 3 (Nguy cơ cao, sa sút kéo dài > 7 ngày - Quản lý cơ sở chủ trì).
      * Bổ sung nút action **`Chuyển Lên Quản Lý Cơ Sở (Họp 3 Bên)`** cho toàn bộ cảnh báo Cấp 3 (Đỏ) thay thế việc Giảng viên tự ý đặt lịch; tích hợp modal bàn giao hồ sơ học tập và lưu vết trạng thái chuyển cấp vào bộ nhớ hệ thống.
  - **Chuẩn Hóa Điều Kiện Hiển Thị Nút Hẹn Tư Vấn 3 Bên Trong Danh Sách Học Sinh Cần Hỗ Trợ (`EarlyWarningsMentorPanel.jsx`)**:
    + Siết chặt điều kiện: Nút `Hẹn Tư Vấn 3 Bên` chỉ hiển thị cho Cảnh báo Đỏ (`alert.alertType === 'RED'`).
    + Các trường hợp lệch mục tiêu (`UNREALISTIC_GOAL`) hoặc nhắc nhở (`YELLOW`) chỉ hiển thị `Ghi Nhận Can Thiệp`.
  - **Tối Ưu Hóa Chiều Dài Cuộn & Công Thái Học Tra Cứu Khung Chương Trình Cho Giảng Viên (`CurriculumExplorerView.jsx`)**:
    + Tích hợp 4 Tab chọn nhanh Khối lớp (`Tất cả`, `Lớp 12`, `Lớp 11`, `Lớp 10`) triệt tiêu 70% độ dài cuộn trang.
    + Khung cuộn độc lập Split Independent Scroll và cố định khung chi tiết (Sticky View).
    + Nút công thái học 1-chạm `Thu gọn hết / Mở tất cả` và tinh giản mật độ thẻ chương.
  - **Tối Ưu Hóa Trải Nghiệm Người Dùng & Loại Bỏ Thuật Ngữ Kỹ Thuật Khung Chương Trình Cho Phân Hệ Giảng Viên (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`)**:
    + Loại bỏ toàn bộ nhãn kỹ thuật `(Read-only)`, `Trọng số: ...%`, `Đã nạp SGK (x trang)`.
    + Chuẩn hóa thuật ngữ sư phạm: `Cần bổ trợ (<10%)`, `Cần củng cố (<60%)`, `Đã nắm vững (≥60%)`.
    + Chuẩn hóa 3 khối kiến thức: Lý thuyết trọng tâm, Phương pháp giải & Mô hình minh họa, Ngân hàng câu hỏi theo Bloom sư phạm.
  - **Tối Ưu Hóa Giao Diện & Đồng Bộ 100% Dữ Liệu Học Sinh Thực Tế Cho Buổi Học Offline (TCH-02) (`TeacherScheduleView.jsx`, `OfflineSessionPreparationModal.jsx`, `offlineSessionStore.js`, `tests/offlineSessionStore.test.js`)**:
    + Tái thiết kế Modal Chuẩn bị buổi học Offline gồm 2 phần (Chữa bài chung cả lớp từ Heatmap + Nhóm học tập tại bàn kèm bài tập ZPD).
    + Đồng bộ 100% học sinh thật từ CSDL PostgreSQL, hiển thị rõ ràng tên kỹ năng và tỷ lệ làm sai.
  - **Kiểm Thử & Biên Dịch**:
    + Bổ sung 2 test suites mới (`tests/parentTeacherMessagingStore.test.js`), 26/26 unit tests passed 100%.
    + `npm run build`: Hoàn thành 100% trong 1.25s (`3085 modules transformed`, `0 Error`).
