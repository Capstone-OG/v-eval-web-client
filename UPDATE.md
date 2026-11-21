# UPDATE — V-Eval-Web_Client

## [21/11/2026]
- **Chuẩn Hóa Dữ Liệu Động Toàn Diện & Triệt Tiêu Giá Trị Tĩnh Cho Phân Hệ Giáo Viên (`TeacherScheduleView.jsx`, `AiTutorModerationView.jsx`, `ClassMicroGroupsModal.jsx`, `TeacherStudentDrillDownModal.jsx`, `practiceService.js`)**:
  - *Thời khóa biểu & Điểm danh (`TeacherScheduleView.jsx`)*: Xóa bỏ hoàn toàn giá trị mặc định tĩnh `'Teacher Khôi'`, thay bằng logic liên kết danh tính động `primaryTeacherName || fullName || name || 'Giảng viên phụ trách'`; thay thế nhãn `'Offline'` cố định bằng cơ chế nhận diện hình thức linh hoạt (`Online` / `Offline`) theo phòng học và URL phòng họp; thay thế phòng `'P.301'` mặc định bằng hiển thị đúng hiện trạng (`Trực tuyến` hoặc `Chưa xếp phòng`); chuẩn hóa nhãn định danh học sinh trong modal điểm danh.
  - *Kiểm duyệt gia sư AI (`AiTutorModerationView.jsx`)*: Chuyển đổi toàn bộ các chỉ số của thẻ "GraphRAG Monitor" (`97.6%`, `142 Exemplars • 68 Traps`) sang tính toán tự động từ tập dữ liệu đàm thoại thực tế (`socraticReliability`, `exemplarsCount`, `trapsCount`); làm sạch các đoạn văn bản mẫu gán sẵn để giáo viên chủ động nhập nhận xét sư phạm nguyên bản; chuẩn hóa tên lớp và học sinh.
  - *Sơ đồ nhóm bàn học vi mô (`ClassMicroGroupsModal.jsx`)*: Loại bỏ hàm sinh mã ngẫu nhiên `Math.random()` và chuỗi dự phòng `WS-OFFLINE-01`; kích hoạt cơ chế tự động đóng gói 5 câu hỏi thích ứng trực tiếp từ Content Service API qua backend khi phát đề; tích hợp lệnh in thực tế `window.print()` cho sơ đồ bàn học.
  - *Hồ sơ chi tiết học sinh (`TeacherStudentDrillDownModal.jsx`)*: Thay thế cơ chế mô phỏng `setTimeout` bằng hệ thống lưu trữ bền vững lịch sử dặn dò sư phạm theo từng học sinh; hiển thị danh sách các lời dặn dò đã gửi gần đây.
  - *Tầng dịch vụ (`practiceService.js`)*: Xóa bỏ dữ liệu giả lập `_source: 'seed_fallback'` trong hàm `forceAggregateClassHeatmap`, đảm bảo ném lỗi chân thực khi dịch vụ backend gặp sự cố.
- **Loại Bỏ 2 Nút Thu Gọn Sidebar Trùng Lặp Ở Mép Brand Header & Navbar (`Sidebar.jsx`, `AccountNavbar.jsx`)**:
  - *Triệt tiêu nút dư thừa gây rối mắt*: Loại bỏ hoàn toàn 2 nút thu gọn/mở rộng sidebar (`PanelLeftClose`/`PanelLeftOpen`) nằm liền kề nhau giữa mép phải thanh Brand Header của Sidebar và mép trái thanh Top Navbar.
  - *Tối giản thanh điều hướng*: Giữ trọn vẹn nút menu điều hướng responsive mobile (`Menu`), làm phẳng và thoáng đãng toàn bộ thanh tiêu đề desktop.
- **Tối Giản Cảnh Báo Sư Phạm Thành Nút Bấm Popup (Pedagogical Alerts Modal) (`TeacherDashboardView.jsx`)**:
  - *Gom khối cảnh báo thành dải thông báo tinh gọn*: Loại bỏ hoàn toàn danh sách các thẻ cảnh báo đỏ/vàng trải dài thô xuống màn hình gây chiếm diện tích; thay thế bằng dải thông báo mỏng gọn (chiều cao ~50px) với nút bấm trực quan `Xem danh sách chuyên đề ({count})`.
  - *Tích hợp Modal chuyên dụng*: Khi bấm nút, modal `Chuyên Đề Cần Bồi Dưỡng Gấp` hiện lên với danh sách cuộn mượt (`max-h-[85vh]`), hiển thị rõ ràng tỷ lệ hiểu bài, số học sinh chưa đạt và nút `Tạo Nhóm Bồi Dưỡng` kích hoạt xếp bàn học vi mô 3–5 em.
- **Tối Giản & Tái Cấu Trúc Ma Trận Thời Khóa Biểu Tuần 8 Cột (Weekly Timetable Matrix Grid) (`TeacherScheduleView.jsx`)**:
  - *Tối giản giao diện & loại bỏ banner lệch tông*: Loại bỏ hoàn toàn khối banner hero xanh đen cồng kềnh giúp giao diện thời khóa biểu đồng điệu với phong cách phẳng sáng màu; chuyển nút làm mới lịch (`RefreshCw`) vào thanh công cụ của bảng tuần.
  - *Giao diện ma trận tuần 8 cột chuẩn học viện & đại học*: Thiết kế bảng ma trận gồm Cột 1 (Slot 1-6) và 7 cột Thứ trong tuần (Thứ 2 - Chủ nhật kèm ngày DD/MM). Tự động nhận diện và làm nổi bật ngày hiện tại ("Hôm nay") bằng viền và nền xanh ngọc dịu nhẹ; các ô trống hiển thị dấu gạch ngang `-` thanh lịch.
  - *Thẻ ca học đầy đủ thông tin sư phạm*: Tên lớp học, chuyên cần, giờ học, phòng học, hình thức Offline, giảng viên phụ trách, chuyên đề bài học và sĩ số; tích hợp nút mở modal điểm danh chuyên cần tại lớp.
  - *Điều hướng tuần linh hoạt*: `< Tuần trước`, `Tuần này`, `Tuần sau >`, banner phát hiện ca dạy gần nhất và bộ chuyển chế độ xem giữa `Lưới tuần` và `Danh sách`.
- **Tự Động Chữa Lành Chùm Đọc Hiểu Bị Nuốt Câu (Passage 118–120) & Xóa Bỏ Ký Tự ABCD Trên Đề (`examParserUtils.js`, `examTextRepair.js`, `ExamPaperView.jsx`, `MathText.jsx`, `examStateBridge.js`, `examStateBridge.test.js`)**:
  - `normalizeExamData` (`examParserUtils.js`): Bổ sung cơ chế tự động chữa lành chùm đọc hiểu (`healHistoryPassageAndTrappedQuestions` & `extractTrappedQuestionsFromPassage`):
    + Khi chùm đọc hiểu có `questions: []` (hiển thị "0 câu") nhưng nội dung đoạn văn bị dính câu hỏi do lỗi OCR/PDF cũ: tự động tách nội dung đoạn văn gốc và giải cứu các câu hỏi con bị nuốt (vd: Câu 118, 119, 120 với đầy đủ phương án A/B/C/D), nâng số lượng câu hỏi chùm đọc hiểu từ "0 câu" lên "3 câu" tương tác đầy đủ.
    + Khôi phục nguyên văn đoạn trích Lịch sử 11 trang 155 sạch sẽ, triệt tiêu 100% các chữ cái đơn bị xé lẻ (`o`, `g`, `n`, `u`, `V`, `i`, `đ`).
  - `ExamPaperView.jsx`: Sửa nhãn chùm đọc hiểu khi có 1 câu duy nhất: `Dựa vào thông tin dưới đây để trả lời câu X` thay vì `từ X đến X`.
  - `repairUnderlineTags` (`examTextRepair.js`): Xóa sạch các nhãn ký tự `(A)`, `(B)`, `(C)`, `(D)` lơ lửng trên thân câu hỏi; kết hợp `MathText.jsx` định dạng từ cần tìm lỗi sai thành **in đậm + gạch chân** (`font-bold underline`).
  - `examStateBridge.js`: Nâng cấp khóa `STORAGE_KEY` lên `veval_active_exam_workspace_v3` để trình duyệt xóa bỏ cache hỏng cũ và tự động chạy cơ chế phục hồi ngay khi nạp trang.
  - Bổ sung unit test 6 trong `examStateBridge.test.js` kiểm chứng phục hồi 100% chùm đọc hiểu 118–120 và tách 3 câu hỏi con.
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - `npm run build`: Biên dịch thành công 100% trong 1.49s (`3079 modules`, `0 Error`).
