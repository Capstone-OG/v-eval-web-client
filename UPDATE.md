# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [21/10/2026] - Chuẩn Hóa Payload Nạp Tri Thức Client-Side, Động Cơ Bảng Biến Thiên Vector (Vạch Kép ||) Và Đồ Thị Vi Tích Phân 2D

- **Chuẩn Hóa Payload Nạp Tri Thức & Khắc Phục Lỗi Validation Error CSDL (`contentService.js` & `CurriculumExplorerView.jsx`)**:
  - *Bộ Lọc Chuẩn Hóa Payload Client-Side (`contentService.js`)*:
    + Triển khai hai hàm trợ giúp `normalizeCorrectOption(raw)` và `sanitizeCurriculumPayload(payload)`.
    + Đảm bảo trước khi dữ liệu được gửi đến backend `Content Service` (`POST /api/content/curriculum/import`, `createQuestion`, `updateQuestion`), toàn bộ các trường `correctOption` của mọi câu hỏi trong các bài học và dạng bài đều được chuẩn hóa về duy nhất 1 ký tự chuẩn mực `'A'`, `'B'`, `'C'`, `'D'`.
    + Xử lý an toàn mọi dạng dữ liệu thô sinh ra từ OCR hoặc nhập liệu: chuỗi có dấu chấm (`"A."`), ngoặc (`"(B)"`, `"[C]"`), hai chấm (`"D:"`), từ khóa (`"Đáp án C"`, `"Phương án B"`, `"Option A"`), số nguyên (`0..3`), chuỗi rỗng và `null`.
    + Chuẩn hóa tự động kiểu dữ liệu số cho `difficultyLevel` (mặc định 2), điền giá trị chuỗi an toàn cho các phương án `optionA` - `optionD` và `explanation`.
  - *Cải Tiến Thông Báo Lỗi Chi Tiết Tại Modal Nạp Tri Thức (`CurriculumExplorerView.jsx`)*:
    + Định dạng lại chuỗi thông báo lỗi khi backend trả về lỗi xác thực RFC 9110/Problem Details (trích xuất trực tiếp `errors[field]` thành danh sách rõ ràng thay vì in cả đối tượng JSON thô).

- **Động Cơ Bảng Biến Thiên Vector Nội Sinh Hỗ Trợ Tiệm Cận Kép (`VariationTable.jsx`)**:
  - *Hỗ Trợ Hàm Phân Thức Hữu Tỉ (Bậc 1/1 & Bậc 2/1)*: Nâng cấp bộ phân tích chuỗi `parseVariationTableString` và kiến trúc render vector 3 dòng. Cho phép khai báo ký hiệu vạch kép `||` tại điểm gián đoạn của mẫu số trong cả dòng đạo hàm `y'` và dòng biến thiên `y` / `dir`. Render vạch kép SVG sắc nét ngăn cách hai nhánh đồ thị theo đúng quy chuẩn SGK Toán học THPT.
  - *Tự Động Suy Luận Hướng Mũi Tên (`directions`)*: Khi LLM sinh thiếu dòng `dir`, động cơ tự động ánh xạ trực tiếp từ dấu của `y'` (`+` -> `up`, `-` -> `down`, `||` -> ngắt quãng) mà không làm vỡ giao diện. Khử triệt để các ký hiệu `$` dư thừa và hỗ trợ linh hoạt cả dấu phẩy `,` lẫn dấu gạch đứng `|`.

- **Động Cơ Vẽ Đồ Thị Vi Tích Phân 2D & Tự Động Dựng Tiệm Cận (`InteractiveMathRenderer.jsx`)**:
  - *Tự Động Dựng Đường Tiệm Cận & Tâm Đối Xứng*:
    + Hàm phân thức bậc 1/1 (`rational`): Tự động tính toán và vẽ đường tiệm cận đứng `x = -d/c` (nét đứt màu xám), tiệm cận ngang `y = a/c` (nét đứt màu xám), và điểm tâm đối xứng `I(-d/c, a/c)` giao điểm của 2 đường tiệm cận.
    + Hàm phân thức bậc 2/1 (`rational_21`): Tự động vẽ đường tiệm cận đứng `x = -e/d` và tiệm cận xiên `y = (a/d)x + (bd - ae)/d^2` nét đứt cùng tâm đối xứng `I`.
  - *Chống Hiện Tượng Nối Dọc Qua Tiệm Cận*: Thiết lập cờ `discontinuous: isRational` trong JSXGraph `board.create('functiongraph', ...)`. Đồ thị được ngắt nét hoàn toàn tại điểm gián đoạn, loại bỏ hiện tượng vẽ nối một đường thẳng đứng xuyên qua tiệm cận.

- **Khắc Phục Triệt Để Hiện Tượng Sinh Nhầm Card Đồ Thị Oxy Đè Lên Bảng Biến Thiên (`mathGraphUtils.js`, `MathText.jsx`, `VariationTable.jsx` & `InteractiveMathRenderer.jsx`)**:
  - *Bộ Lọc Chống Sinh Nhầm (`mathGraphUtils.js`)*: Lập tức trả về `null` nếu chuỗi văn bản đã có thẻ `[VARIATION_TABLE]`, `[MATH_GRAPH]`, `[MATH_GRAPH_3D]` hoặc chứa từ khóa "bảng biến thiên", "bảng xét dấu". Đồng thời từ chối các hàm số trừu tượng dạng `f(x)`, `g(x)`, `u(x)`, và chỉ sinh đồ thị 2D khi có biểu thức đại số cụ thể (`x^3`, `x^4`, `\frac{ax+b}{cx+d}`, `x^2`).
  - *Bảo Vệ Thẻ Đặc Biệt Trong Bộ Chuẩn Hóa Toán (`MathText.jsx`)*: Tokenize văn bản kết hợp cả dấu phân cách toán và các khối thẻ đặc biệt (`[VARIATION_TABLE]`, `[MATH_GRAPH]`), đảm bảo nội dung bên trong thẻ không bị các biểu thức chính quy KaTeX/Hóa học can thiệp làm biến dạng cú pháp.
  - *Hỗ Trợ Bảng Biến Thiên Trên Một Dòng (`VariationTable.jsx`)*: Nâng cấp `parseVariationTableString` tự động tách dòng an toàn khi AI trả về chuỗi JSON không có ký tự ngắt dòng `\n` (tự chèn `\n` trước `x:`, `y':`, `y:`, `dir:`), bảo đảm bảng biến thiên hiển thị hoàn hảo 100% trong mọi trường hợp.
  - *Cơ Chế Bảo Vệ Nhãn Trên Mặt Phẳng Oxy (`InteractiveMathRenderer.jsx`)*: Kiểm soát chặt chẽ `config.title` và `config.formula`, chỉ hiển thị huy hiệu và nhãn đường cong khi công thức hợp lệ, súc tích (< 35 ký tự), tuyệt đối không in chuỗi văn bản dài lên canvas JSXGraph.

- **Khắc Phục Hoàn Toàn Lỗi UI Khối 3D Bị Nửa Canvas Trắng Đè Lên (`InteractiveMathRenderer.jsx` & `InteractiveMathWorkbenchModal.jsx`)**:
  - Thiết lập tường minh `xPlaneRear: { visible: false }, yPlaneRear: { visible: false }, zPlaneRear: { visible: false }, xPlaneFront: { visible: false }, yPlaneFront: { visible: false }, zPlaneFront: { visible: false }` trên cả component hiển thị `InteractiveMathRenderer` và modal biên tập `InteractiveMathWorkbenchModal`. Toàn bộ nền canvas chuyển sang màu trắng đồng nhất 100%, không còn bất kỳ vách ngăn hoặc khối cắt ngang nào.
  - *Nút Bật/Tắt Hệ Trục Oxyz (`Compass` Icon)*: Bổ sung công tắc `Trục Oxyz` trên thanh công cụ của card 3D. Mặc định ẩn hệ trục để mô hình thanh thoát như hình vẽ SGK, đồng thời cho phép giảng viên/học sinh bật nhanh 3 trục màu `x` (đỏ), `y` (xanh lá), `z` (xanh dương) khi cần quan sát tọa độ không gian.

- **Khắc Phục Triệt Để Lỗi Render KaTeX & Mất Ký Tự Đầu `**` Trong Bài Toán Mẫu (`MathText.jsx`)**:
  - Nâng cấp regex `isSampleHeadingCallout`: Ràng buộc tiêu đề Callout chỉ được kích hoạt khi dòng thực sự bắt đầu bằng định dạng Heading (`###` hoặc emoji tiêu đề `[📝📄✍️]`). Các dòng nội dung bài toán `**Bài toán mẫu:**...` được chuyển trực tiếp vào luồng xử lý văn bản nội dòng (inline stream).
  - Chuẩn hóa render an toàn: Bọc nội dung tiêu đề Callout trong `{renderInlineContent(cleanHeading, lineKey)}`.
  - Bộ sửa chữa dấu sao mồ côi (`normalizeMathString`): Bổ sung regex tự động vá các trường hợp mất dấu `**` đầu do AI hoặc người dùng gõ thiếu (chuyển `Bài toán mẫu:**` thành `**Bài toán mẫu:**`).
  - Tích hợp bộ tự động tổng hợp bảng biến thiên từ chữ (`autoSynthesizeVariationTableFromText`) trong `mathGraphUtils.js` và `MathText.jsx`.

- **Quản Lý Trạng Thái Toàn Vẹn Bài Toán Mẫu (`CurriculumStudioEditor.jsx`)**:
  - Bổ sung trường `sampleProblem` vào `form` state, bộ cập nhật kết quả AI `handleAiAnalysisComplete`, và hàm tái lắp ghép `fullSolutionMethod` khi lưu, bảo đảm bài toán mẫu không bị thất thoát trong quá trình biên soạn sư phạm.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 2.50s trên Vite 8 và React 19).
