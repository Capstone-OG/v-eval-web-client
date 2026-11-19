# UPDATE - V-Eval-Web_Client

## [20/11/2026]
- **Tách Cụm Đề Thi Thành 3 Trang Độc Lập Đồng Bộ 1:1 Với Kiến Trúc SGK & Bổ Sung Chức Năng Xóa Đề Toàn Diện (`Sidebar.jsx`, `App.jsx`, `examStateBridge.js`, `useExamWorkspaceController.js`, `ExamWorkspaceHeader.jsx`, `ExamSharedModals.jsx`, `ExamBankView.jsx`, `ExamIngestView.jsx`, `ExamStudioView.jsx`, `ExamDatabaseModal.jsx`, `TeacherPortalView.jsx`)**:
  - **Menu Dropdown `exam-group` (`Đề thi & AI Bloom`)** trên Sidebar cho `teacher`, `manager`, `admin`:
    1. **Trang 1 — `1. Kho Đề & Xem Đề Thi` (`exam-bank`)**: Kho Đề Supabase + Xem Đề Thi chuẩn in + Sắp Xếp & Trộn Đề kéo-thả.
    2. **Trang 2 — `2. Parse PDF & AI Bloom` (`exam-ingest`)**: Phần 1 Parse PDF (Gemini Vision AI OCR nền xuyên trang) & Phần 2 AI Sinh Câu Hỏi 6 Mức Bloom (`L1–L6`) + Hàng Đợi Kiểm Duyệt.
    3. **Trang 3 — `3. Studio Biên Soạn Đề` (`exam-studio`)**: Studio 2 cột sửa từng câu hỏi + Full Studio 838 ký hiệu & 3D MathLab.
  - **Chức năng `Xóa Đề` đầy đủ trên mọi màn hình**: Hỗ trợ xóa cả đề đã lưu trong Supabase (`DELETE /api/content/exams/{id}`) lẫn đề nháp vừa parse PDF / soạn thủ công khỏi phiên làm việc, hiển thị rõ nút **`Xóa Đề` / `Xóa`** kèm hộp thoại xác nhận tại Trang 1 (Kho Đề + Header Xem Đề), Trang 2 (Parse PDF & AI Bloom), Trang 3 (Studio), Modal đổi đề và `Ngân hàng đề thi` trong `TeacherPortalView.jsx`.
- **Render Bảng HTML `rowspan`/`colspan`, Bảo Vệ `[VARIATION_TABLE]` & Port 100% `view-exam.html` + Node 4 Tầng (`examParserUtils.js`, `ExamRichContent.jsx`, `examCurriculumMatcher.js`, `examOrganizerUtils.js`, `ExamMediaLightbox.jsx`, `ExamNodePickerModal.jsx`, `ExamBlueprintDrawer.jsx`, `aiService.js`, `contentService.js`)**:
  - Khử nhiễu KaTeX 6 tầng, bảng Markdown 2 tầng + bảng HTML `<table>` gộp ô, bảo vệ `[VARIATION_TABLE]`/`[MATH_GRAPH]`/`[MATH_GRAPH_3D]`, biểu đồ Recharts, tự động nhận diện `Miền -> Chương -> Bài -> Dạng bài` + `AI Gắn Chương/Bài` và **Ma Trận Đặc Tả Đề Thi**.
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - `oxlint`: 0 Warning, 0 Error trên toàn bộ 22 file của phân hệ Đề thi.
  - `node --test`: Pass 37/37 unit tests toàn bộ Web Client.
  - `npm run build`: Biên dịch sạch sẽ trong 6.19s (`3073 modules`, `0 Error`).
