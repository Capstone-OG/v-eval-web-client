# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [19/10/2026] - Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG Như Microsoft Word Equation: Thanh Ký Hiệu Phân Cấp Thu Gọn Bên Trái (Hierarchical Palette), Thống Nhất Duy Nhất 1 Thanh Công Cụ & Khắc Phục Triệt Để Lỗi Nhảy Dòng / Tiết Diện Lớn

- **Tái Cấu Trúc Toàn Diện Bộ Công Cụ & Loại Bỏ Trùng Lặp (Single-Version Rule)**:
  - *Thanh Lọc 100% Các Nút Trùng Lặp*:
    + Loại bỏ hoàn toàn sự lộn xộn từ 4-5 thanh công cụ xếp chồng (Bảng ký hiệu KaTeX phía trên, thanh Ribbon, thanh submode lặp lại các nút Hóa/Phân số, thanh toolbar bên trong canvas).
    + Tuân thủ nghiêm ngặt nguyên tắc *"Cùng tính năng chỉ duy nhất 1 phiên bản tồn tại"*: Hợp nhất vào 1 thanh Ribbon Word duy nhất trên đầu trang tài liệu, tích hợp bộ chuyển đổi 3 chế độ xem mượt mà (`✍️ Sửa Trực Tiếp` | `👁️ Trang In` | `Raw`).

- **Thanh Công Cụ Ký Hiệu Phân Cấp Thu Gọn Bên Trái (Hierarchical Math & Science Sidebar - `HierarchicalMathPalette.jsx`)**:
  - *Cấu Trúc Phân Cấp 3 Tầng Chuẩn Mực*:
    + **Tầng 1 (Chuyên Môn)**: Phân tách rõ ràng giữa Toán Học 📐, Hóa Học 🧪, Vật Lý ⚡, và Ký Hiệu Đặc Biệt 🔣.
    + **Tầng 2 (Chuyên Mục Theo Môn)**:
      * *Hóa Học*: Nồng độ dung dịch ($C_M, C\%$), Số oxi hóa ($0, +1, +2, -2, +6$), Ion điện tích ($SO_4^{2-}, OH^-$), Phương trình & Mũi tên phản ứng ($\rightarrow, \rightleftharpoons, \uparrow, \downarrow$).
      * *Toán Học*: Đại số & Căn thức, Đạo hàm & Giới hạn, Mũ & Logarit, Hình học & Oxyz, Lượng giác, Xác suất & Thống kê.
      * *Ký Hiệu Đặc Biệt*: Ký tự Hy Lạp ($\pi, \Delta, \alpha, \beta, \theta, \lambda$), Phép toán & So sánh ($\pm, \times, \div, \approx, \neq, \le, \ge, \infty$).
    + **Tầng 3 (Chip Ký Hiệu KaTeX Trực Quan)**: Các chip hiển thị ký hiệu thật, click 1 chạm để chèn công thức thẳng vào vị trí con trỏ trên canvas hoặc Khối 1/Khối 2.
  - *Thu Gọn Rail Siêu Mỏng*:
    + Hỗ trợ thu hẹp thành thanh icon rail 44px (`w-11`) kèm tooltip, mở rộng (`w-64`/`w-72`) chỉ bằng 1 click chuột giúp giải phóng tối đa không gian soạn thảo.

- **Khắc Phục Triệt Để Hiện Tượng Nhảy Dòng & Tiết Diện Công Thức Quá Lớn (`WordStyleFormulaCanvas.jsx`)**:
  - *Chấm Dứt Lỗi Flex-wrap Xé Dòng & Rơi Rớt Dấu Câu*:
    + Loại bỏ cơ chế `flex-wrap` container từng làm các từ và dấu câu (dấu chấm `.`, phẩy `,`) bị tách rời và nhảy xuống dòng mới sau các công thức/số oxi hóa.
    + Tái thiết kế kiến trúc dòng văn bản tự nhiên theo đoạn (`tokenizeLine`, `parseDocumentLines`, `serializeDocumentLines`). Từng dòng được render trong block paragraph chuẩn (`<div className="text-[13.5px] leading-relaxed my-0.5">`), đảm bảo chữ và công thức chảy liên tục theo văn phong SGK.
  - *Tiết Diện Công Thức Siêu Gọn (Ultra-Compact Formula Footprint)*:
    + Cỡ chữ công thức đồng bộ `text-[13.5px]`, padding thu nhỏ tối thiểu `px-0.5 py-0 mx-0.5`.
    + Ở trạng thái nghỉ, công thức chỉ có đường gạch chân mờ (hairline dashed underline), xóa bỏ hoàn toàn khung bo viền dày và hộp màu to phồng làm méo chiều cao dòng (line-height).
  - *Hỗ Trợ Thao Tác Soạn Thảo Tự Nhiên*:
    + Hỗ trợ phím Enter để ngắt dòng và tách đoạn tự nhiên như Microsoft Word.
    + Bổ sung nút `+ Thêm dòng mới` thanh lịch ở chân trang.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, build hoàn tất trong 753ms trên Vite 8 và React 19).
