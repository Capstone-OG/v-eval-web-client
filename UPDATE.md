# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [13/10/2026] - Triển Khai Giai Đoạn 1 Core Flow 4: Gia Sư AI Socratic Tutor & GraphRAG Live Streaming

- **Mở Rộng Tầng Dịch Vụ Client (`src/services/practiceService.js`)**:
  - Bổ sung `askAiTutorStream`: Kết nối trực tiếp API Gateway `:5212` -> Practice Service `:5261` (`POST /api/practice/ai-tutor/ask-stream`) xử lý Server-Sent Events (SSE) theo thời gian thực.
  - Tích hợp cơ chế kiểm soát giới hạn tần suất: Bắt mã lỗi `429 Too Many Requests` (chính sách `StrictTutorPolicy` 10 req/phút) và đưa ra thông báo sư phạm thân thiện.
  - Bổ sung `askAiTutor` (REST fallback), `reportAiTutorInteraction` (`POST /api/practice/ai-tutor/report`) và `getAiTutorInteractions`.
- **Nâng Cấp Widget Dashboard Học Sinh (`src/components/dashboard/AISocraticTutorWidget.jsx`)**:
  - Xóa bỏ 100% mã mock giả lập `setTimeout`.
  - Kết nối live SSE streaming với hiệu ứng hiển thị token chữ chạy mượt mà, hỗ trợ nút *Dừng (Abort)* khi đang phát stream.
  - Tích hợp component `MathText` kết xuất công thức toán học KaTeX nội dòng (`$...$`) và khối (`$$...$$`).
  - Hiển thị badge Đồ thị Tri thức GraphRAG và thanh cảnh báo khi chạm trần Rate Limit.
- **Xây Dựng Component Modal Chuyên Sâu (`src/components/modals/AISocraticTutorModal.jsx`)**:
  - Thiết kế giao diện hai cột hiện đại: Cột trái là khung chat Socratic toàn diện với dòng thời gian câu hỏi và gợi ý nhanh (Quick Prompts); Cột phải là bảng phân tích Đồ thị Tri thức 3-Hop (Dạng bài Archetype, Định lý cốt lõi, Bẫy ngộ nhận Misconception Traps).
  - Tích hợp chức năng Báo cáo vi phạm (In-chat Flagging) cho từng câu trả lời của AI (lộ đáp án trực tiếp, ảo giác kiến thức, hướng dẫn khó hiểu) kết nối trực tiếp cơ sở dữ liệu giám sát sư phạm.
- **Chuẩn Hóa Điều Hướng Router (`src/App.jsx` & `src/components/layout/Sidebar.jsx`)**:
  - Sửa lỗi điều hướng: Bấm menu *AI Socratic Tutor* trên Sidebar và nút mở rộng trên Widget giờ đây mở chính xác `AISocraticTutorModal`, chấm dứt việc mở nhầm modal luyện tập ZPD của Flow 3.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` (`vite build`) thành công 100% (**0 Error, 0 Warning**).
  - Chạy `npm run lint` (`oxlint`) đạt tiêu chuẩn mã nguồn sạch.
