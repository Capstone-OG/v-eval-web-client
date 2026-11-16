# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [16/11/2026] - Chuyển Tiếp Lịch Sử Hội Thoại Đa Lượt & Skill ID Chuẩn Xác Cho Gia Sư Socratic, Khắc Phục Triệt Để Hiện Tượng Lặp Từ Kép, Chuẩn Hóa Xóa Phiên (Tombstones)

- **Đồng Bộ Chuyển Tiếp `skillId` & `questionId` Cho Gia Sư AI ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`AdaptiveQuizModal.jsx`](./src/components/modals/AdaptiveQuizModal.jsx))**:
  - Lưu trữ thuộc tính `skillId: initialContext.skillId || initialContext.skill_id || null` vào state phiên `activeSession` khi khởi tạo cuộc trò chuyện Socratic từ câu hỏi kiểm tra/luyện tập.
  - Forward chính xác `skillId: isQuestionMode ? (activeSession.skillId || null) : null` vào `practiceService.askAiTutorStream`.
  - Trong `AdaptiveQuizModal.jsx`: trích xuất `skillId: q.skill_id || q.skillId || null` và chuyển tiếp sang modal gia sư qua `onOpenAiTutorWithContext`, giúp AI Engine neo đậu chính xác vào tài liệu SGK chuẩn GDPT 2018 (`v_eval_content."Materials"`).
- **Chuyển Tiếp Lịch Sử Hội Thoại Đa Lượt Cho Gia Sư Socratic ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`practiceService.js`](./src/services/practiceService.js))**:
  - Mở rộng hàm `practiceService.askAiTutorStream` tiếp nhận tham số `conversationHistory = null` và đóng gói vào body JSON gửi lên backend Practice Service.
  - Trong `AISocraticTutorModal.jsx`: khi người dùng gửi tin nhắn mới, tự động trích xuất tối đa 6 lượt trò chuyện gần nhất (`messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'student' : 'tutor', text: m.text }))`) và chuyển tiếp vào luồng stream SSE.
  - Đảm bảo AI gia sư luôn nhớ sâu sắc bối cảnh các câu hỏi trước (ví dụ: hình chóp `S.ABCD`, giao tuyến `SO`) khi học sinh hỏi tiếp nối thay vì quên bối cảnh.
- **Chuẩn Hóa Kiến Trúc Xóa Phiên & Phân Tách Rạch Ròi Audit Log ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`aiSessionManager.js`](./src/utils/aiSessionManager.js), [`aiSessionManager.test.js`](./tests/aiSessionManager.test.js))**:
  - **Tách bạch 2 tầng kiến trúc chuẩn Enterprise SaaS**: Phân định rõ ràng giữa **Audit Log kiểm toán bất biến** của nhà trường (`v_eval_ai.ai_tutor_interaction_logs` dành cho Mentor/Quản lý học thuật ở Core Flow 4) và **User Chat Sessions** dành cho học sinh. Tuyệt đối không xóa thô (hard-delete) dữ liệu kiểm toán hệ thống.
  - **Ngắt hoàn toàn việc gọi nhầm API kiểm duyệt Mentor**: Xóa bỏ lời gọi ngầm `practiceService.getAiTutorInteractions({ reportedOnly: false })` trong modal học sinh. Học sinh chỉ tải và quản lý các phiên hội thoại cá nhân của chính mình.
  - **Khắc phục lỗi React State Closure khi xóa phiên**: Thay thế biến `sessions` cũ bằng functional state updater nguyên tử `setSessions(prev => ...)`. Khi xóa phiên đang chọn hoặc xóa phiên cuối cùng, hệ thống tính toán danh sách `remaining` tức thời và khởi tạo phiên mới tinh khôi `[freshSess]` mà không kéo theo phiên cũ.
  - **Triển khai cơ chế Tombstones vĩnh viễn**: Bổ sung các phương thức `markSessionDeleted`, `getDeletedSessionIds`, `isSessionDeleted` trong `aiSessionManager.js` lưu vết danh sách ID đã xóa vào `localStorage`. Bất kỳ tiến trình đồng bộ nào cũng tự động bỏ qua các ID này, ngăn chặn 100% hiện tượng hồi sinh phiên đã xóa.
- **Khắc Phục Lỗi Lặp Từ Kép Khi AI Stream Phản Hồi ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`AISocraticTutorWidget.jsx`](./src/components/dashboard/AISocraticTutorWidget.jsx))**:
  - Tách biệt nguồn dữ liệu tích lũy SSE bằng `useRef` (`streamedTextRef`), xóa bỏ biến đổi state in-place, giúp giao diện miễn nhiễm 100% trước cơ chế chạy lặp 2 lần của React StrictMode.
  - Loại bỏ 200+ lần gọi `saveSessions` dư thừa mỗi turn; chỉ lưu phiên 1 lần khi kết thúc stream (`onComplete`).
  - Tự động chữa lành các phiên cũ bị lặp từ trong `localStorage` bằng hàm `cleanDoubledWords`.
- **Kiểm Thử & Biên Dịch Toàn Diện**:
  - `npm run build`: Thành công 100% trong 1.06s.
  - `node --test`: Đạt **22/22 unit tests pass 100%**.
