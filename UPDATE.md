# UPDATE — V-Eval-Web_Client

## [21/11/2026]
- **Khắc Phục Giới Hạn Chiều Cao & Khơi Thông Toàn Văn Lý Thuyết SGK Trong Pha Learn Của PLAR (`PlarNodeStudioPanel.jsx`)**:
  - `PlarNodeStudioPanel.jsx`: Tích hợp trực tiếp bộ trích xuất tri thức SGK `getDefaultLessonTheory` & `getSavedTextbookData` vào Pha Learn của PLAR.
  - Gỡ bỏ hoàn toàn mọi rào cản chiều cao (`overflow-visible`), hiển thị đầy đủ 100% định nghĩa, hệ thức, công thức KaTeX và phương pháp giải thay vì chỉ có đoạn tóm tắt ngắn.
  - Tối ưu hóa `PassageContextBox`: Bổ sung nút chuyển đổi `Xem toàn văn / Thu gọn` và tăng trần chiều cao lên `max-h-[460px]`, triệt tiêu hoàn toàn hiện tượng đoạn văn đọc hiểu dài bị co cụm hoặc che khuất tầm nhìn.
  - Nâng cấp nội dung tài liệu chuyên đề Toán 10 (Đường thẳng trong mặt phẳng toạ độ) trong CSDL PostgreSQL `v_eval_content."Materials"` từ 722 ký tự lên 4,270 ký tự toàn văn chuẩn sư phạm GDPT 2018.
- **Chuẩn Hóa Dữ Liệu Động Toàn Diện & Triệt Tiêu Giá Trị Tĩnh Cho Phân Hệ Giáo Viên (`TeacherScheduleView.jsx`, `AiTutorModerationView.jsx`, `ClassMicroGroupsModal.jsx`, `TeacherStudentDrillDownModal.jsx`, `practiceService.js`)**:
  - *Thời khóa biểu & Điểm danh (`TeacherScheduleView.jsx`)*: Xóa bỏ hoàn toàn giá trị mặc định tĩnh `'Teacher Khôi'`, thay bằng logic liên kết danh tính động; nhận diện hình thức linh hoạt (`Online` / `Offline`); thay thế phòng `'P.301'` mặc định.
  - *Kiểm duyệt gia sư AI (`AiTutorModerationView.jsx`)*: Chuyển đổi thẻ "GraphRAG Monitor" sang tính toán tự động từ tập dữ liệu đàm thoại thực tế.
  - *Sơ đồ nhóm bàn học vi mô (`ClassMicroGroupsModal.jsx`)*: Kích hoạt cơ chế tự động đóng gói 5 câu hỏi thích ứng trực tiếp từ Content Service API qua backend khi phát đề; tích hợp lệnh in thực tế `window.print()`.
  - *Hồ sơ chi tiết học sinh (`TeacherStudentDrillDownModal.jsx`)*: Lưu trữ bền vững lịch sử dặn dò sư phạm theo từng học sinh.
  - *Tầng dịch vụ (`practiceService.js`)*: Xóa bỏ dữ liệu giả lập `_source: 'seed_fallback'` trong `forceAggregateClassHeatmap`.
- **Loại Bỏ 2 Nút Thu Gọn Sidebar Trùng Lặp (`Sidebar.jsx`, `AccountNavbar.jsx`) & Tối Giản Cảnh Báo Sư Phạm Thành Popup (`TeacherDashboardView.jsx`)**:
  - Triệt tiêu 2 nút thu gọn/mở rộng sidebar trùng lặp ở desktop; gom danh sách cảnh báo sư phạm thành dải thông báo tinh gọn mở modal `Chuyên Đề Cần Bồi Dưỡng Gấp`.
- **Tối Giản & Tái Cấu Trúc Ma Trận Thời Khóa Biểu Tuần 8 Cột (`TeacherScheduleView.jsx`)**:
  - Thiết kế bảng ma trận 8 cột (Slot 1-6 + Thứ 2 đến Chủ nhật), làm nổi bật ngày hiện tại, thẻ ca học đầy đủ thông tin kèm modal điểm danh trực tiếp tại lớp.
- **Tự Động Chữa Lành Chùm Đọc Hiểu Bị Nuốt Câu (Passage 118–120) & Xóa Bỏ Ký Tự ABCD Trên Đề (`examParserUtils.js`, `examTextRepair.js`, `ExamPaperView.jsx`, `MathText.jsx`, `examStateBridge.js`, `examStateBridge.test.js`)**:
  - Phục hồi tự động chùm đọc hiểu 118–120; xóa bỏ nhãn `(A)/(B)/(C)/(D)` trên thân câu hỏi và in đậm + gạch chân từ cần tìm lỗi sai; nâng cấp `STORAGE_KEY` lên `veval_active_exam_workspace_v3`.
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - `examStateBridge.test.js` `6/6` pass, `tests/*.test.js` `22/22` pass, `npm run build` thành công `0 Error`.
