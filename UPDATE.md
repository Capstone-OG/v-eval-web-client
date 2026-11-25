# UPDATE - V-EVAL WEB CLIENT

## [25/11/2026] - Hoàn Thiện Studio Soạn Thảo, MathLab 2D/3D, Phân Trang Đề Thi & Tối Ưu Egress

- **Phân Trang Gọn & Nút Cuộn Nhanh ([ExamPaperView.jsx](./src/components/curriculum/ExamPaperView.jsx))**:
  - Bỏ thanh chọn trang phía trên, chỉ hiển thị số trang gọn 1 hàng ở dưới cùng (`< 1 2 3 4 5 … N >`), bấm vào số trang đang chọn hoặc dấu `…` để nhập trực tiếp số trang.
  - Thêm nút mũi tên xuống mờ góc dưới bên phải để cuộn mượt xuống thanh phân trang dưới cùng.
- **Nâng Cấp Studio Soạn Thảo ([CurriculumStudioEditor.jsx](./src/components/curriculum/CurriculumStudioEditor.jsx), [WordStyleFormulaCanvas.jsx](./src/components/curriculum/WordStyleFormulaCanvas.jsx), [VisualMathField.jsx](./src/components/curriculum/VisualMathField.jsx), [HierarchicalMathPalette.jsx](./src/components/curriculum/HierarchicalMathPalette.jsx))**:
  - Đổi nút `Công thức` thành **Bàn phím soạn thảo** (mở thanh MathLive + bàn phím ảo, bấm `Chèn` / `Enter` chèn thẳng tại vị trí con trỏ nháy).
  - Hiển thị trạng thái đang bật (`active`) cho các nút định dạng (`B`, `I`, `U`, `S`, căn lề, danh sách); tự động giải nén các cụm `\text{...}` tiếng Việt thuần thành văn bản thường và tắt tự động bôi xanh 100% khi focus MathLive.
  - Mặc định mở chuyên mục đầu tiên, tự đóng các chuyên mục sau trong bảng Ký hiệu/Công thức; 2 cột bên tự bám đúng chiều cao khung nội dung giữa; bỏ sticky ở [ExamWorkspaceHeader.jsx](./src/components/curriculum/ExamWorkspaceHeader.jsx) và chỉ giữ sticky cho thanh định dạng (`top-14 sm:top-16 z-20`).
  - Dọn gọn bảng `Mô hình STEM` (bỏ cụm Bộ dựng công thức & Nồng độ/Hiệu suất) và giữ duy nhất `Bảng biến thiên` + `Đồ thị Oxy` trong [InteractiveFormulaBuilderModal.jsx](./src/components/curriculum/InteractiveFormulaBuilderModal.jsx).
- **Thiết Kế Lại Phòng Dựng Hình & Đồ Thị 2D/3D ([InteractiveMathWorkbenchModal.jsx](./src/components/curriculum/InteractiveMathWorkbenchModal.jsx), [mathGraphUtils.js](./src/utils/mathGraphUtils.js), [InteractiveMathRenderer.jsx](./src/components/common/InteractiveMathRenderer.jsx))**:
  - Render 100% KaTeX (không còn lộ text `\frac`, `\sqrt`, `\cdot`), nâng cấp dropdown sang MUI `Select`, tổ chức tab con gọn gàng, bổ sung đầy đủ thanh trượt kích thước/góc xoay 3D/hệ số 2D.
  - Cho phép sửa trực tiếp nhãn hiển thị & tỷ lệ `k` của mọi điểm phụ và thêm công cụ 1-click **Hạ đường vuông góc 3D** tự vẽ ký hiệu góc vuông.
- **Kiểm Thử**: `npm run build` hoàn thành trong 1.74s (`4271 modules transformed`, 0 lỗi).
