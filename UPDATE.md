# UPDATE — V-Eval-Web_Client

## [21/11/2026]

- **Khắc Phục Giới Hạn Chiều Cao & Khơi Thông Toàn Văn Lý Thuyết SGK Trong Pha Learn Của PLAR (`PlarNodeStudioPanel.jsx`)**:
  - `PlarNodeStudioPanel.jsx`: Tích hợp trực tiếp bộ trích xuất tri thức SGK `getDefaultLessonTheory` & `getSavedTextbookData` vào Pha Learn của PLAR.
  - Gỡ bỏ hoàn toàn mọi rào cản chiều cao (`overflow-visible`), hiển thị đầy đủ 100% định nghĩa, hệ thức, công thức KaTeX và phương pháp giải thay vì chỉ có đoạn tóm tắt ngắn.
  - Tối ưu hóa `PassageContextBox`: Bổ sung nút chuyển đổi `Xem toàn văn / Thu gọn` và tăng trần chiều cao lên `max-h-[460px]`, triệt tiêu hoàn toàn hiện tượng đoạn văn đọc hiểu dài bị co cụm hoặc che khuất tầm nhìn.
  - Nâng cấp nội dung tài liệu chuyên đề Toán 10 (Đường thẳng trong mặt phẳng toạ độ) trong CSDL PostgreSQL `v_eval_content."Materials"` từ 722 ký tự lên 4,270 ký tự toàn văn chuẩn sư phạm GDPT 2018 (đầy đủ VTCP, VTPT, các dạng phương trình, vị trí tương đối, góc, khoảng cách và bẫy đề thi ĐGNL).
  - Tự động chữa lành chùm đọc hiểu bị nuốt câu (Passage 118–120) & xóa bỏ ký tự ABCD trên thân câu hỏi trắc nghiệm tìm lỗi sai (`examParserUtils.js`, `examTextRepair.js`, `ExamPaperView.jsx`, `MathText.jsx`, `examStateBridge.js`).
- **Kiểm thử & Triển khai**: `examStateBridge.test.js` `6/6` pass, `tests/*.test.js` `22/22` pass, `npm run build` thành công `4.38s`, container Docker `v-eval-web-client` được build và deploy hoàn tất.
