# UPDATE - V-EVAL WEB CLIENT

## [23/11/2026]
- **Triệt Tiêu Hoàn Toàn Rò Rỉ Mã Định Danh UUID & Đồng Bộ Dữ Liệu Thực Tế Cho Sơ Đồ Nhóm Bàn Học Vi Mô (`ClassMicroGroupsModal.jsx`, `offlineSessionStore.js`, `tests/classMicroGroups.test.js`)**:
  - Nạp song song và đồng bộ 100% dữ liệu từ Backend CSDL: ma trận nhiệt năng lực lớp (`practiceService.getClassHeatmap`), danh sách nhóm bàn (`practiceService.getClassMicroGroups`), và cây kỹ năng chuẩn (`contentService.getSkillsTree`).
  - Xây dựng cơ chế phát hiện và triệt tiêu toàn diện mã GUID thô: ánh xạ chính xác `CommonWeakSkillIds` sang tên chuyên đề tiếng Việt chuẩn (`skillNameMap`), tuyệt đối không để rò rỉ bất kỳ chuỗi UUID nào lên giao diện người dùng.
  - Tinh gọn công thái học: giới hạn tối đa 2 thẻ chuyên đề trọng tâm mỗi nhóm bàn kèm badge rút gọn `+X chuyên đề khác` (hiển thị danh sách đầy đủ khi rê chuột), chống tràn thẻ và bảo toàn danh sách học sinh luôn hiển thị rõ nét trong khung nhìn.
  - Phân giải danh tính họ tên học sinh thực tế từ CSDL: loại bỏ hoàn toàn các nhãn ẩn danh giả lập; tự động gắn hậu tố định danh ngắn gọn (`#8A51`, `#B099`) khi trong cùng một lớp có nhiều học sinh trùng họ tên (như trường hợp 2 học sinh cùng tên "Phạm Tấn Lộc"), giúp Giảng viên phân biệt chuẩn xác 100%.
  - Tích hợp 3 test cases chuyên sâu trong `tests/classMicroGroups.test.js`, nâng tổng số unit test lên 29/29 passed 100%.
- **Sửa Lỗi Tràn Layout & Co Chữ Dọc Trên Thẻ Cảnh Báo Sớm (`EarlyWarningsMentorPanel.jsx`)**:
  - Triệt tiêu hoàn toàn class `whitespace-nowrap` trên dòng thông điệp cảnh báo dài (`alert.message`) gây chèn ép chiều ngang làm cột hướng dẫn sư phạm bên cạnh bị bóp nghẹt thành 1–2 chữ mỗi dòng.
  - Tách riêng thông điệp cảnh báo hiển thị chuẩn độ giãn dòng tự nhiên (`leading-relaxed`), đưa banner hướng dẫn phân cấp sư phạm xuống thành một dải phụ trợ bên dưới với cơ chế `flex-wrap` chống tràn tuyệt đối.
- **Hoàn Thiện Bộ 3 Nghiệp Vụ Cổng Giảng Viên (TCH-03, TCH-04, TCH-05)**:
  - **TCH-03 — Tra Cứu Lịch Sử Làm Bài & Phân Tích Lỗ Hổng Kiến Thức Học Viên Đa Lớp (`TeacherSubmissionHistoryView.jsx`, `App.jsx`, `TeacherPortalView.jsx`)**:
    + Đồng bộ bộ chọn lớp động đa lớp (`assignedClasses`) qua API `practiceService.getClasses({ teacherId })`, cho phép Giảng viên chuyển đổi tức thời giữa các lớp phụ trách và tải danh sách học sinh thực tế từ Heatmap ma trận lớp.
    + Tích hợp đầy đủ 3 nhóm bài làm chuẩn hóa: (1) Thi đầu vào (30 câu - phân tích Theta 0, điểm số, tỷ lệ đúng theo miền); (2) Luyện tập thích ứng ZPD & Topic Quiz; (3) Thi thử V-ACT (120 câu chuẩn hóa kèm trạng thái giám sát liêm chính Proctoring).
    + Chức năng xem chi tiết từng câu làm sai: hiển thị đề bài toán học (KaTeX/MathText), phương án học sinh chọn, đáp án đúng và lời giải chi tiết; tích hợp form lưu ghi chú sư phạm nhanh theo từng học sinh.
  - **TCH-04 — Kênh Nhận & Phản Hồi Tin Nhắn Trao Đổi 2 Chiều Phụ Huynh - Giảng Viên (`parentTeacherMessagingStore.js`, `ParentEarlyWarningsAndTeacherView.jsx`, `EarlyWarningsMentorPanel.jsx`, `tests/parentTeacherMessagingStore.test.js`)**:
    + Xây dựng module lưu trữ và đồng bộ trạng thái phản ứng hai chiều `parentTeacherMessagingStore.js` với cơ chế CustomEvent `veval:parent-teacher-message`.
    + Phía Phụ huynh: Lưu trữ lịch sử tin nhắn kèm liên kết cảnh báo học tập, hiển thị luồng trao đổi dạng hội thoại trực quan kèm phản hồi của Giảng viên ngay khi có.
    + Phía Giảng viên: Bổ sung nút truy cập nhanh "Hộp Thư Phụ Huynh" với chỉ báo tin nhắn mới tại header, gắn nhãn thông báo tin nhắn phụ huynh trên từng thẻ học sinh cảnh báo, mở hộp thoại xem chi tiết và gửi phản hồi sư phạm tức thì về Cổng Phụ huynh.
  - **TCH-05 — Phân Định Rõ Ràng Thẩm Quyền Xử Lý Cảnh Báo Cấp 1–2 (Giảng Viên) vs Cấp 3 (Quản Lý Cơ Sở) (`EarlyWarningsMentorPanel.jsx`)**:
    + Chuẩn hóa nhãn phân cấp trên từng thẻ cảnh báo sớm: Cấp 1 (Nhắc nhở tự học / chuyên cần - Giảng viên trực tiếp kèm cặp), Cấp 2 (Lệch mục tiêu - Giảng viên tư vấn sư phạm), Cấp 3 (Nguy cơ cao, sa sút kéo dài > 7 ngày - Quản lý cơ sở chủ trì).
    + Bổ sung nút action **`Chuyển Lên Quản Lý Cơ Sở (Họp 3 Bên)`** cho toàn bộ cảnh báo Cấp 3 (Đỏ) thay thế việc Giảng viên tự ý đặt lịch; tích hợp modal bàn giao hồ sơ học tập và lưu vết trạng thái chuyển cấp vào bộ nhớ hệ thống.
- **Chuẩn Hóa Điều Kiện Hiển Thị Nút Hẹn Tư Vấn 3 Bên Trong Danh Sách Học Sinh Cần Hỗ Trợ (`EarlyWarningsMentorPanel.jsx`)**:
  - Siết chặt điều kiện: Nút `Hẹn Tư Vấn 3 Bên` chỉ hiển thị cho Cảnh báo Đỏ (`alert.alertType === 'RED'`).
  - Các trường hợp lệch mục tiêu (`UNREALISTIC_GOAL`) hoặc nhắc nhở (`YELLOW`) chỉ hiển thị `Ghi Nhận Can Thiệp`.
- **Tối Ưu Hóa Chiều Dài Cuộn & Công Thái Học Tra Cứu Khung Chương Trình Cho Giảng Viên (`CurriculumExplorerView.jsx`)**:
  - Tích hợp 4 Tab chọn nhanh Khối lớp (`Tất cả`, `Lớp 12`, `Lớp 11`, `Lớp 10`) triệt tiêu 70% độ dài cuộn trang.
  - Khung cuộn độc lập Split Independent Scroll và cố định khung chi tiết (Sticky View).
  - Nút công thái học 1-chạm `Thu gọn hết / Mở tất cả` và tinh giản mật độ thẻ chương.
- **Tối Ưu Hóa Trải Nghiệm Người Dùng & Loại Bỏ Thuật Ngữ Kỹ Thuật Khung Chương Trình Cho Phân Hệ Giảng Viên (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`)**:
  - Loại bỏ toàn bộ nhãn kỹ thuật `(Read-only)`, `Trọng số: ...%`, `Đã nạp SGK (x trang)`.
  - Chuẩn hóa thuật ngữ sư phạm: `Cần bổ trợ (<10%)`, `Cần củng cố (<60%)`, `Đã nắm vững (≥60%)`.
  - Chuẩn hóa 3 khối kiến thức: Lý thuyết trọng tâm, Phương pháp giải & Mô hình minh họa, Ngân hàng câu hỏi theo Bloom sư phạm.
- **Tối Ưu Hóa Giao Diện & Đồng Bộ 100% Dữ Liệu Học Sinh Thực Tế Cho Buổi Học Offline (TCH-02) (`TeacherScheduleView.jsx`, `OfflineSessionPreparationModal.jsx`, `offlineSessionStore.js`, `tests/offlineSessionStore.test.js`)**:
  - Tái thiết kế Modal Chuẩn bị buổi học Offline gồm 2 phần (Chữa bài chung cả lớp từ Heatmap + Nhóm học tập tại bàn kèm bài tập ZPD).
  - Đồng bộ 100% học sinh thật từ CSDL PostgreSQL, hiển thị rõ ràng tên kỹ năng và tỷ lệ làm sai.
- **Kiểm Thử & Biên Dịch**:
  - 29/29 unit tests passed 100% (`tests/classMicroGroups.test.js`, `tests/parentTeacherMessagingStore.test.js`, ...).
  - `npm run build`: Hoàn thành 100% trong 1.23s (`3085 modules transformed`, `0 Error`).
