# UPDATE LOG — V-Eval Web Client

## [24/11/2026] Phân quyền phạm vi Gia sư AI theo lớp phụ trách, UI/UX MUI, Full Studio & MathLive WYSIWYG
- **Kiểm duyệt Gia sư AI phân quyền theo lớp phụ trách (`AiTutorModerationView.jsx`, `aiTutorScoping.js`)**:
  - Giới hạn phạm vi hiển thị đàm thoại Gia sư AI bị báo cáo strictly theo lớp và danh sách học sinh phụ trách (`practiceService.getClasses({ teacherId })` & `getClassHeatmap(classId)`).
  - Loại bỏ hoàn toàn tùy chọn "Tất cả lớp" đối với Giảng viên, đồng bộ toàn bộ bộ đếm KPI, dải chip trạng thái và danh sách đàm thoại theo lớp học thực tế.
  - Tách rời tính năng Xét duyệt câu hỏi khảo thí bị gắn cờ (`FlaggedQuestionsReviewPanel`), ẩn thanh chuyển chế độ khỏi Giảng viên để chỉ phục vụ Giám đốc Học thuật.
  - Bổ sung `tests/aiTutorScoping.test.js` kiểm thử độc lập 5 kịch bản phân quyền, đảm bảo 114/114 unit tests pass 100%.
- **MUI & 10 hạng mục Feedback**:
  - Tích hợp `@mui/material` (`src/theme/muiTheme.js`, `GlobalToastContainer.jsx`), thiết kế lại `DiagnosticResultSummary.jsx` & `DiagnosticSkillOverviewCard.jsx`, bỏ thuật ngữ kỹ thuật (`IRT`, `BKT`, `BR-03`, `Bloom`).
  - Mở khóa chặng `Đã nắm vững`, chế độ Xem lại toàn bộ PLAR, lưu & khôi phục trạng thái Preview theo DB (`previewSubmissionJson`), giữ nguyên trang/chặng khi F5 (`sessionStorage`), và kiểm tra chi tiết từng trường hồ sơ học sinh (`AccountSettingsPage.jsx`).
  - Sổ tay lỗi sai ôn theo từng dạng (`MistakeNotebookSM2View.jsx`), xem đáp án chia cụm 7 câu (`AttemptAnswerReviewList.jsx`), Camera giám sát thi thử (`MockAssessmentPage.jsx`), Sổ tay Gia sư AI kéo-thả (`AISocraticTutorModal.jsx`), và 3 cổng Non-Blocking Roadmap Approval.
- **Kiểm duyệt câu hỏi lỗi & đồng bộ DB**:
  - Kết nối `questionFlagStore.js` và `FlaggedQuestionsReviewPanel.jsx` với API DB `/flag`, `/unflag`, `/flagged`, dọn log mồ côi khi câu đã xóa và mở thẳng `CurriculumStudioEditor` (Full Studio) để sửa câu bị báo cáo.
- **Tinh giản giao diện & Full Studio + MathLive WYSIWYG**:
  - `Sidebar.jsx`, `AccountNavbar.jsx`, `App.jsx`: Icon sidebar trơn không nền khi thu gọn (ẩn khi mở rộng), bỏ nền màu icon Navbar, bỏ thanh footer toàn trang, tự động thu gọn sidebar khi vào `exam-studio` / `textbook-studio`.
  - `CurriculumExplorerView.jsx` & `UnifiedNodeDetailView.jsx`: Rút gọn hàng bài học (icon sách xanh/xám biểu trưng SGK, hover chạy ngang tên bài), cột xem bài học bên phải full-view không cuộn lồng (`borderRadius: 10px`), bỏ nhãn Bloom & mở mặc định khối Lý thuyết trọng tâm.
  - `ExamStudioView.jsx`, `ExamQuestionStudioTab.jsx`, `WordStyleFormulaCanvas.jsx`, `VisualMathField.jsx`: Vào thẳng Full Studio kèm thanh chuyển câu nhanh; cài đặt `mathlive` sửa trực tiếp trên công thức WYSIWYG ở thanh công thức cố định không che chữ, sửa regex nhận diện nhầm phương trình dài thành chỉ số, tắt spellcheck tiếng Việt, đồng bộ màu bàn phím MathLive và thêm nút đóng bàn phím nổi.
- **Đồng bộ từ `develop`**: Phân quyền 3 cấp phê duyệt lộ trình (`RoadmapApprovalStudioView.jsx`), lọc thời khóa biểu theo lớp/học kỳ thực tế (`StudentScheduleView.jsx`, `TeacherScheduleView.jsx`), và hiển thị trường hồ sơ theo vai trò (`AccountSettingsPage.jsx`).
- **Kiểm thử**: `114/114 unit tests pass` (0 fail), `npm run build` (`vite build`) thành công 100% trong 1.65s (0 errors).
