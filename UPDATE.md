# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [31/10/2026] - Khung Điền Số Trực Quan Kiểu Phân Số Chuẩn SGK, Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (0% Lộ Mã LaTeX), Thanh Soạn Thảo Toàn Năng & AI Sinh Đề (API 16)

- **Khung Điền Số Trực Quan Chuẩn SGK & Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (`WordStyleFormulaCanvas.jsx`)**:
  - *Khung Điền Số & Biểu Thức Trực Quan (Interactive Visual Slots) Dạng Phân Số Chuẩn SGK*:
    + Tự động nhận diện cấu trúc công thức và hiển thị **Khung Điền Số Trực Quan (Visual Slots)**:
      * **Phân số**: Hiển thị dạng phân số dọc với ô nhập Tử số (phía trên), thanh gạch ngang, ô nhập Mẫu số (phía dưới), dấu `=` và ô Đáp số. Giảng viên nhập số trực tiếp vào ô như sách giáo khoa, không cần gõ mã.
      * **Căn thức**: Dấu căn $\sqrt{}$ kèm ô số/biểu thức bên trong và ô đáp số.
      * **Lũy thừa**: Ô nhập Cơ số và ô Số mũ nhỏ.
      * **Hóa học**: $C_M = n / V = [n]/[V] = [kết\_quả]\text{ M}$ và $C\%$ với các ô điền số rõ ràng.
    + Đồng bộ tức thì hai chiều: Mọi thay đổi trên ô điền số lập tức cập nhật lên Thanh Toán Tự Nhiên, Live KaTeX Preview và dòng văn bản canvas.
  - *Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (`latexToNaturalMath` & `naturalMathToLatex`) Tuyệt Đối 0% Lộ Mã LaTeX*:
    + Thanh soạn thảo công thức hỗ trợ hoàn toàn định dạng **Toán Tự Nhiên (Natural Math)**: Chuyển đổi mã lệnh LaTeX nội bộ thành chuỗi biểu thức tự nhiên thân thiện (`12/4 = 3`, `√(16) = 4`, `lim(x → x₀)`), triệt tiêu hoàn toàn dấu gạch chéo `\` và ngoặc nhọn `{}`.
    + Giảng viên và học sinh có thể gõ hoặc dán bất kỳ biểu thức thông thường (`(x+1)/(x-1) = 5`, `2x^2 + 5x - 3 = 0`), hệ thống tự động biên dịch sang KaTeX chuẩn xác mà không bao giờ ép người dùng nhìn thấy hay học mã LaTeX.
    + Xóa bỏ 100% nhãn kỹ thuật gây phản cảm như `LaTeX: ...` hay `Mã công thức KaTeX:` trên mọi khung popover thanh công cụ.
  - *Bộ Máy Tự Động Tính Toán Đáp Số Thông Minh Cho Mọi Phép Toán (`autoCalculateEquation` & Nút `⚡ Tính`)*:
    + Nâng cấp nút `[ ⚡ Tính ]` thành công cụ tự động tính toán số liệu toàn năng: Tự động phân tích và tính nhẩm kết quả chính xác cho mọi biểu thức chứa phân số/phép chia (`12/4` -> `= 3`, `0.2/0.5` -> `= 0.4`), căn bậc hai (`\sqrt{16}` -> `= 4`), lũy thừa (`2^3` -> `= 8`), số học cơ bản (`10 + 2*5` -> `= 20`) và nồng độ hóa học (`C_M`, `C%`). Nếu công thức đã có kết quả sai từ trước, nút `Tính` sẽ tự động cập nhật lại đáp số chính xác.
  - *Chèn Ký Hiệu Thông Minh Nhận Biết Vị Trí Con Trỏ (Cursor-Aware Insertion) & Bao Bọc Vùng Chọn*:
    + Trang bị `activeInputRef` theo dõi chính xác vị trí con trỏ `selectionStart`/`selectionEnd` trong ô soạn thảo: Khi nhấp bất kỳ nút ký hiệu/công thức nào từ các tab môn học (`Cấu trúc`, `Oxyz`, `Vật lý`, `Hóa học`, `Sinh học`, `Ngữ văn`, `Địa lý`, `Ký hiệu & Logic`), hệ thống chèn ngay tại đúng vị trí con trỏ và đưa con trỏ vào bên trong vị trí nhập số. Nếu người dùng bôi đen một đoạn text/biểu thức, nhấp `a/b` sẽ tự động đưa đoạn đó lên tử số, nhấp `√x` sẽ bao bọc đoạn đó trong căn thức.
  - *Cơ Chế Xóa Công Thức Bằng Nút 1-Click, Phím Tắt Backspace Tự Nhiên & Khắc Phục Triệt Để Import*:
    + Khắc phục triệt để lỗi runtime `ReferenceError: unescapeLiteralNewlines is not defined` trong `parseDocumentLines`: Bổ sung đầy đủ hàm tiện ích `unescapeLiteralNewlines` từ `../common/MathText` vào khai báo import của `WordStyleFormulaCanvas.jsx`, bảo đảm quá trình khởi tạo và chuẩn hóa dòng tài liệu luôn thông suốt 100%.
    + Trang bị nút đỏ `[ 🗑️ Xóa ]` trên thanh popover để xóa bỏ công thức tức thì chỉ với 1 click.
    + Khi con trỏ văn bản nằm ở đầu đoạn text liền kề ngay sau một công thức, nhấn `Backspace` sẽ tự động xóa sạch công thức đứng trước mà không làm hỏng cấu trúc dòng; khi ô công thức trống, bấm `Backspace` cũng xóa gọn công thức và trả lại con trỏ cho dòng văn bản.
    + Bổ sung nút bấm `[ 🚀 Mở Studio ]` kết nối trực tiếp đến Modal Studio toán học & STEM khi người dùng muốn vẽ đồ thị hàm số hay dựng bảng biến thiên 3 dòng phức tạp.

- **Đại Tu Toàn Diện Studio Popup Bộ Công Cụ & STEM Chuyên Sâu (`InteractiveFormulaBuilderModal.jsx` & `StemToolsDropdown` Trong `CurriculumStudioEditor.jsx`)**:
  - *Tái Thiết Kế Modal Studio Soạn Thảo Công Thức & STEM 2 Cột Đẳng Cấp (`InteractiveFormulaBuilderModal.jsx`)*:
    + Nâng cấp kích thước modal từ `max-w-2xl` lên Studio cỡ lớn `max-w-5xl h-[88vh] max-h-[840px]` với kiến trúc 2 cột chuyên nghiệp:
      * **Cột Trái (Sidebar công cụ w-72)**: Phân nhóm trực quan thành 2 chuyên mục lớn: "Toán Học & Giải Tích" và "STEM & Hóa Học Thực Nghiệm", với các tile icon Lucide rực rỡ và mô tả 2 dòng rõ nét.
      * **Cột Phải (Workspace tương tác rộng rãi flex-1)**: Tích hợp trực tiếp toàn bộ lưới tương tác `<VariationTable />` 700px+ cùng 4 preset nhanh; Bộ tính toán Hóa học 4 thẻ chuyên sâu (`CM`, `C%`, `m = n * M`, `H%`) tự động tính kết quả; Phân số & tính toán giao diện thẻ 2 tầng trực quan.
  - *Tuyệt Đối Ẩn 100% Mã KaTeX/LaTeX Thô, Chuyên Biệt Hóa Ô Nhập Số & Ký Hiệu Trực Quan Kèm Preset Nạp Mẫu 1-Click*:
    + Xóa bỏ triệt để 100% ô textarea hiển thị mã lệnh KaTeX thô và các chuỗi text raw như `$formula$`.
    + Chuyên biệt hóa toàn bộ việc nhập liệu qua các ô số và ký hiệu trực quan (Visual Slots): Ô nhập Tử số / Mẫu số phân số, ô Bậc căn / Biểu thức trong căn, ô Cơ số / Số mũ, ô Cận tích phân và hệ phương trình.
    + Trang bị bộ nút nạp mẫu thông dụng 1-click (1-Click Presets) cho từng dạng bài toán: Phân số (1/2, 3/4, 12/4=3, phân thức đại số), Giới hạn SGK 2018 (f'(x₀) định nghĩa, sin(x)/x=1, phân thức hữu tỉ, khử vô định 0/0, dãy số 1/n), Đạo hàm số gia, Căn thức, Lũy thừa và Tích phân.
    + Khung xem trước trực quan (Live KaTeX Preview Dock) tập trung duy nhất vào việc hiển thị công thức toán học kích thước lớn (text-2xl) sắc nét như trong sách giáo khoa.

- **Tái Thiết Kế Thanh Soạn Thảo 2 Dòng Trong Văn Bản & Đưa Dropdown STEM Lên Header Khối (`CurriculumStudioEditor.jsx`)**:
  - Đưa dropdown `✨ Công Cụ Toán & STEM ▾` độc lập trên Section Header tổng thể của khối đang sửa.
  - Khu vực văn bản chia 2 dòng rõ rệt: Dòng 1 chứa nút sư phạm (`+ Ví Dụ SGK` hoặc `+ Thêm Bước mới`, `Nạp mẫu 4 bước`) và bộ chuyển đổi chế độ xem (`✍️ Sửa Trực Tiếp`, `👁️ Trang In`, `📄 Raw`); Dòng 2 chứa thuần công cụ văn bản chuẩn Word (`Bold`, `Italic`, `Tiêu đề / Bước`, `Danh sách`, `Đánh số`). Loại bỏ hoàn toàn nút ảnh, cho phép dán ảnh chụp màn hình trực tiếp bằng Ctrl+V.

- **Tích Hợp AI Sinh Câu Hỏi Trắc Nghiệm Tự Động Bám Sát Dạng Bài Vào Khối 4 Ngân Hàng Đề (`CurriculumStudioEditor.jsx`)**:
  - Bổ sung bộ đôi nút tác vụ nổi bật `✨ AI Sinh Câu Hỏi` tại header Khối 4 và trạng thái danh sách câu hỏi trống; tự động kiểm tra định danh dạng bài trong cơ sở dữ liệu và hiển thị Toast nhắc nhở giáo viên.
  - Xây dựng modal sinh câu hỏi thích ứng hàng loạt (`AiQuestionGeneratorModal`): Cho phép tùy biến số lượng và mức độ tư duy mục tiêu (Bloom L1 Nhận biết - L4 Vận dụng cao), kết nối trực tiếp `aiService.generatePatternQuestions` (API 16).
  - Bổ sung nút `✨ AI Tự Điền Câu Hỏi` 1-click trong hộp thoại thêm câu hỏi thủ công (`NewQuestionDialog`).
