# UPDATE LOG — V-Eval Web Client

## [24/11/2026] Nâng cấp toàn diện UI/UX bằng MUI, tinh giản Khung chương trình, Full Studio & MathLive WYSIWYG
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
- **Kiểm thử**: `npm run build` (`vite build`) thành công 100% (`4271 modules transformed`, 0 errors).
