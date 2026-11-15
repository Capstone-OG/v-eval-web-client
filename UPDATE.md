# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [15/11/2026] - Triển Khai Phân Hệ Kiểm Duyệt Báo Cáo Gia Sư AI Socratic Cho Quản Lý Học Thuật (Core Flow 4: Human-in-the-Loop & Knowledge Graph Feedback)

- **Màn Hình Kiểm Duyệt Báo Cáo Gia Sư AI ([`AiTutorModerationView.jsx`](./src/components/dashboard/AiTutorModerationView.jsx))**:
  - Xây dựng giao diện điều phối và kiểm duyệt phản hồi AI chuyên sâu dành riêng cho vai trò **Quản lý học thuật cơ sở (`ACADEMIC_MANAGER`)** và **Giám đốc học thuật (`ACADEMIC_DIRECTOR`)**.
  - **4 Chỉ số KPI vận hành thời gian thực**: *Báo cáo chờ xử lý*, *Đã giải quyết/Lưu KG*, *Tổng báo cáo học sinh gửi*, và *Tổng đàm thoại AI được giám sát*.
  - **Khung đối soát chi tiết (Interaction Inspector)**:
    - Hiển thị đầy đủ câu hỏi và công thức toán học KaTeX qua component [`MathText.jsx`](./src/components/common/MathText.jsx).
    - Đối chiếu trực quan: Phương án học sinh chọn (SAI - đỏ) với Đáp án đúng CSDL (ĐÚNG - xanh lục).
    - Hộp cảnh báo lý do học sinh báo cáo (AI giải thích khó hiểu, lộ đáp án, ảo giác công thức...).
    - Dựng lại toàn bộ nhật ký đối thoại Socratic từng bước giữa học sinh và AI Tutor.
  - **Bàn làm việc Can thiệp Sư phạm 3 Chế độ (Tri-Modal Pedagogical Actions)**:
    1. **Ghi đè Lời giải mẫu chuẩn (`Override Golden Exemplar`)**: Soạn lời giải chuẩn của chuyên gia học vụ kèm các bước tư duy gợi mở, cập nhật trực tiếp vào Knowledge Graph (`pattern_exemplars`) làm few-shot chuẩn cho AI.
    2. **Bổ sung Bẫy tư duy mới (`Add Novel Cognitive Trap`)**: Đặt mã bẫy, tên bẫy, phân tích sai lầm và câu hỏi gợi mở, lưu vào Knowledge Graph (`pattern_traps`).
    3. **Xác nhận AI hợp lệ (`Verify & Dismiss`)**: Đóng báo cáo khi AI trả lời chuẩn mực Socratic và học sinh ngộ nhận.
- **Tích Hợp Điều Hướng & Cổng Quản Lý Học Thuật ([`Sidebar.jsx`](./src/components/layout/Sidebar.jsx), [`App.jsx`](./src/App.jsx), [`roles.js`](./src/config/roles.js))**:
  - Bổ sung mục **`Kiểm duyệt Gia sư AI`** (id: `ai_moderation`, icon: `Bot`, badge: `Core Flow 4`) vào khối *Quản Trị Học Thuật Cơ Sở* trên thanh điều hướng Sidebar.
  - Đăng ký tab `ai_moderation` trong `ROLE_PORTAL_DEFINITIONS.manager.tabs` và `ROLE_MENUS.manager` / `ROLE_MENUS.director`.
- **Mở Rộng Tầng Dịch Vụ API Client ([`practiceService.js`](./src/services/practiceService.js))**:
  - Bổ sung các hàm: `overrideTutorExemplar`, `addTutorNovelTrap`, và `resolveTutorReport` kèm cơ chế fallback dữ liệu an toàn.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Thành công 100% trong 1.29s.
  - `node --test`: Đạt 31/31 unit tests, 0 lỗi linter.
