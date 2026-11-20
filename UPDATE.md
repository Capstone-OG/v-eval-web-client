# UPDATE — V-Eval-Web_Client

## [21/11/2026]

- **Tự Động Chữa Lành Chùm Đọc Hiểu Bị Nuốt Câu (Passage 118–120) & Xóa Bỏ Ký Tự ABCD Trên Đề (`examParserUtils.js`, `examTextRepair.js`, `ExamPaperView.jsx`, `MathText.jsx`, `examStateBridge.js`, `examStateBridge.test.js`)**:
  - `normalizeExamData` (`examParserUtils.js`): Bổ sung cơ chế tự động chữa lành chùm đọc hiểu (`healHistoryPassageAndTrappedQuestions` & `extractTrappedQuestionsFromPassage`):
    + Khi chùm đọc hiểu có `questions: []` (hiển thị "0 câu") nhưng nội dung đoạn văn bị dính câu hỏi do lỗi OCR/PDF cũ: tự động tách nội dung đoạn văn gốc và giải cứu các câu hỏi con bị nuốt (vd: Câu 118, 119, 120 với đầy đủ phương án A/B/C/D), nâng số lượng câu hỏi chùm đọc hiểu từ "0 câu" lên "3 câu" tương tác đầy đủ.
    + Khôi phục nguyên văn đoạn trích Lịch sử 11 trang 155 sạch sẽ, triệt tiêu 100% các chữ cái đơn bị xé lẻ (`o`, `g`, `n`, `u`, `V`, `i`, `đ`).
  - `ExamPaperView.jsx`: Sửa nhãn chùm đọc hiểu khi có 1 câu duy nhất: `Dựa vào thông tin dưới đây để trả lời câu X` thay vì `từ X đến X`.
  - `repairUnderlineTags` (`examTextRepair.js`): Xóa sạch các nhãn ký tự `(A)`, `(B)`, `(C)`, `(D)` lơ lửng trên thân câu hỏi; kết hợp `MathText.jsx` định dạng từ cần tìm lỗi sai thành **in đậm + gạch chân** (`font-bold underline`).
  - `examStateBridge.js`: Nâng cấp khóa `STORAGE_KEY` lên `veval_active_exam_workspace_v3` để trình duyệt xóa bỏ cache hỏng cũ và tự động chạy cơ chế phục hồi ngay khi nạp trang.
  - Bổ sung unit test 6 trong `examStateBridge.test.js` kiểm chứng phục hồi 100% chùm đọc hiểu 118–120 và tách 3 câu hỏi con.
- **Kiểm thử**: `examStateBridge.test.js` `6/6` pass, `tests/*.test.js` `22/22` pass, `npm run build` thành công `6.40s`.
