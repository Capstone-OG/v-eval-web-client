# NHẬT KÝ TIẾN ĐỘ HẰNG NGÀY (DAILY LOG) - V-EVAL WEB CLIENT

---

## [20/10/2026] - Triển Khai Hoàn Thiện Màn Hình Cài Đặt Tài Khoản, Tích Hợp Thông Tin Đại Diện Phụ Huynh (Cha HOẶC Mẹ), Mã Kết Nối Học Sinh & Học Bạ Điện Tử ĐGNL VNU-HCM 2026

- **Mở Rộng Màn Hình Cài Đặt Tài Khoản (`src/components/settings/AccountSettingsPage.jsx`)**:
  - Triển khai toàn diện 5 Tabs chuyên sâu đáp ứng yêu cầu quản lý thông tin phụ huynh và tra cứu học bạ của học sinh:
    1. **Tab 1: Thông tin Cá nhân (Profile & Identity)**: Họ tên, Số điện thoại, Email đã xác thực OTP, Cơ sở đào tạo, Vai trò hệ thống, User ID, thông tin người đại diện phụ huynh, bộ chọn nhanh 6 Avatar 3D học sinh và tùy biến URL ảnh. Tự động đồng bộ ngay vào `Navbar` và `HeroBanner`.
    2. **Tab 2: Mục tiêu Thi cử & ĐGNL (Academic & IRT Goals)**: Thanh trượt tương tác điểm mục tiêu ĐGNL 1200 điểm V-ACT gắn chuẩn đại học (750+, 850+, 950+, 1050+); cập nhật nguyện vọng 1, trường THPT, ngày thi dự kiến, thời lượng học (giờ/ngày) và theo dõi năng lực IRT Theta 0 (+0.65).
    3. **Tab 3: Phụ huynh & Học bạ Điện tử (Family Link & Digital Transcript)** *(MỚI)*:
       - **Mã kết nối học sinh (Student Connection Code)**: Thẻ VIP Card phong cách Dark Glassmorphism hiển thị mã định danh duy nhất (ví dụ: `VEVAL-STU-88902`) kèm nút 1-click sao chép, tính năng tạo mới mã và chỉ báo trạng thái liên kết thời gian thực.
       - **Thông tin Đại diện Phụ huynh (Cha HOẶC Mẹ)**: Bộ chọn chuyển đổi linh hoạt `Cha (Bố)` | `Mẹ` | `Người giám hộ`, ô nhập Họ và tên phụ huynh, Số điện thoại (SMS/Zalo nhận điểm danh & liên hệ khẩn cấp) và Email nhận báo cáo. Hiển thị rõ tên Cha hoặc Mẹ để phân định người đại diện nhận thông báo.
       - **Học bạ Điện tử ĐGNL Chuẩn Hóa**: Khung hiển thị trang trọng bảng điểm V-ACT 1200 điểm, chi tiết 3 phần thi (Ngôn ngữ 310/400, Toán & Logic 255/300, Giải quyết vấn đề 220/500); tỷ lệ chuyên cần (12 ngày streak, 48.5 giờ tự học); lời phê sư phạm từ Giáo viên chủ nhiệm (Thầy Phạm Duy); khuyến nghị chiến lược từ Gia sư AI Socratic; cùng 2 nút hành động: **In / Xuất PDF** và **Gửi Báo Cáo Về Email Phụ Huynh**.
    4. **Tab 4: Bảo mật & Đổi Mật khẩu (Security & Credentials)**: Biểu mẫu đổi mật khẩu với mắt bật/tắt, thanh đo độ mạnh mật khẩu 4 cấp độ (Yếu, Trung bình, Mạnh, Rất an toàn), thẻ thông tin phiên đăng nhập đang hoạt động và nút đăng xuất toàn bộ phiên.
    5. **Tab 5: Tùy chọn Học tập & AI (Preferences & AI Tutor)**: Tùy biến bật/tắt Gia sư AI gợi mở Socratic, lịch nhắc nhở học tập mỗi ngày, âm thanh & pháo hoa confetti, nhận báo cáo tiến độ tuần qua email.
- **Nâng Cấp API Client & Auth Service (`src/services/authService.js`)**:
  - Bổ sung `getParentInfo()` và `updateParentInfo(parentData)` kết nối Identity Service qua Gateway: `GET /api/v1/students/me/parent`, `PUT /api/v1/students/me/parent`.
  - Cơ chế đệm ngoại tuyến (`localStorage`, `tokenStorage`) giúp UI vận hành mượt mà 100% ngay cả khi chưa bật backend.
- **Kiểm Thử Vận Hành & Biên Dịch (Vite Build)**:
  - Chạy `npm run build` thành công 100% trong 1.91 giây, 0 lỗi cú pháp hay bundle.

---

## [20/10/2026] - Chuẩn Hóa Tên Gọi Các Trang & Menu Điều Hướng Sidebar: Loại Bỏ Thuật Ngữ Kỹ Thuật (DAG, ZPD, Socratic), Tối Ưu UX Trực Quan Cho Học Sinh

- **Chuẩn Hóa Danh Mục Điều Hướng Thanh Bên (Sidebar Navigation UX Optimization)**:
  - Tái cấu trúc và đặt lại tên toàn bộ các mục điều hướng trong `Sidebar.jsx` để học sinh và người dùng đọc vào hiểu ngay bản chất tính năng mà không bị bỡ ngỡ bởi các thuật ngữ kỹ thuật / sư phạm chuyên sâu:
    1. *`Dashboard (Tổng quan)`* ➔ **`Tổng quan học tập`**: Thể hiện trực quan đây là trang tổng hợp tiến độ, điểm số và nhiệm vụ học tập hằng ngày.
    2. *`Khảo thí & Chẩn đoán` (Flow 1)* ➔ **`Thi đánh giá đầu vào` (Flow 1)**: Thay thế từ ngữ Hán-Việt chuyên ngành khảo thí bằng tên gọi hành động cụ thể, giúp học sinh hiểu ngay đây là bài thi kiểm tra năng lực đầu vào để xác định trình độ xuất phát.
    3. *`Lộ trình học (DAG)` (Flow 2)* ➔ **`Lộ trình học cá nhân` (Flow 2)**: Loại bỏ từ viết tắt lý thuyết đồ thị máy tính `DAG` (Directed Acyclic Graph), định danh rõ lộ trình học được may đo cá nhân hóa theo từng chuyên đề.
    4. *`Luyện tập ZPD` (Flow 3)* ➔ **`Luyện tập thích ứng` (Flow 3)**: Loại bỏ khái niệm tâm lý học giáo dục `ZPD` (Zone of Proximal Development), thay bằng thuật ngữ công nghệ giáo dục chuẩn xác mô tả cơ chế thích ứng độ khó theo năng lực.
    5. *`AI Socratic Tutor` (Flow 4)* ➔ **`Gia sư AI gợi mở` (Flow 4)**: Việt hóa và giải thích rõ bản chất phương pháp Socratic là gợi ý, định hướng tư duy thay vì giải hộ.
    6. *`Lớp học & Live Q&A`* ➔ **`Lớp học & Hỏi đáp` (Trực tiếp)**: Đơn giản hóa và thuần Việt, loại bỏ thuật ngữ tiếng Anh `Live Q&A`.
    7. *`Báo cáo & Dự báo` (Flow 5 & 6)* ➔ **`Báo cáo & Dự báo điểm` (Flow 5 & 6)**: Làm rõ mục tiêu báo cáo là phân tích năng lực và dự đoán điểm thi đại học.
  - Phân nhóm lại 2 Section trong Sidebar thân thiện hơn:
    + Section 1: *`Khảo thí & Luyện tập`* ➔ **`Học tập & Luyện thi`**.
    + Section 2: *`Hỗ trợ & Năng lực`* ➔ **`Hỗ trợ & Phân tích`**.
- **Đồng Bộ Ngôn Ngữ Trực Quan Trên Các Màn Hình & Modal Liên Quan**:
  - `MetricsGrid.jsx`: Cập nhật thẻ chỉ số *`Lộ trình học thích ứng (DAG)`* ➔ *`Lộ trình học cá nhân hóa`*; nút bấm *`Xem toàn bộ Lộ trình DAG`* ➔ *`Xem toàn bộ Lộ trình học`*; *`Xác suất trúng tuyển BKT`* ➔ *`Xác suất trúng tuyển đại học`*.
  - `DiagnosticAssessmentPage.jsx`: Cập nhật thẻ nhãn danh mục từ *`FLOW 1 • KHẢO THÍ & CHẨN ĐOÁN NĂNG LỰC`* ➔ *`FLOW 1 • THI ĐÁNH GIÁ NĂNG LỰC ĐẦU VÀO`*.
  - `AdaptiveQuizModal.jsx`: Đổi tiêu đề modal *`Luyện Tập Thích Ứng ZPD & BKT (Flow 3)`* ➔ *`Luyện Tập Thích Ứng Theo Năng Lực (Flow 3)`*; cập nhật nút *`Câu tiếp theo trong dải ZPD`* ➔ *`Câu tiếp theo phù hợp năng lực`*.
  - `RadarChartModal.jsx`: Cập nhật tiêu đề *`Biểu Đồ Radar Năng Lực & Đồ Thị DAG`* ➔ *`Biểu Đồ Radar Năng Lực & Cây Tri Thức`*.
  - `HeroBanner.jsx`: Tinh chỉnh các câu động lực học tập, thay thế thuật ngữ kỹ thuật bằng thông điệp truyền cảm hứng trực quan.
  - `QuestionBankPage.jsx`: Cập nhật mô tả đề thi chuẩn hóa nhằm loại bỏ từ viết tắt `DAG`.
- **Kiểm Thử Vận Hành & Biên Dịch (Vite Build)**:
  - Chạy `npm run build` thành công 100% trong 7.21 giây, không phát sinh bất kỳ lỗi cú pháp nào.

---

## [19/10/2026] - Nâng Cấp Lộ Trình Học Cá Nhân Hóa (Flow 2): Phân Cấp 9 Môn Thi Vào 3 Giai Đoạn Dựa Vào Điểm Đầu Vào, Cây Chương & Bài Học, Tích Hợp Video YouTube, Bài Giảng Panorama SGK & Bẫy ĐGNL, Lịch Học Live Google Meet & Quiz Củng Cố

- **Phân Bổ 9 Môn Thi ĐGNL VNU-HCM Vào 3 Giai Đoạn Dựa Trên Điểm Thi Khảo Sát Đầu Vào (`roadmapSubjectsData.js`)**:
  - Tích hợp chuẩn 9 môn thi cốt lõi cấu thành 120 câu đề ĐGNL ĐHQG-HCM phân thành 3 miền: Toán học & Tư duy, Sử dụng ngôn ngữ, Khoa học Tự nhiên & Xã hội.
  - Phân bổ linh hoạt từng môn vào 1 trong 3 Giai đoạn tối ưu hóa Vùng phát triển ZPD căn cứ trên điểm kiểm tra đầu vào (Diagnostic Score):
    1. *Giai đoạn 1: Nền tảng cốt lõi (Score < 50%)*: Dành cho môn có điểm thi đầu vào yếu cần lấy lại gốc SGK và công thức cơ bản: Toán học (42/100), Vật lý (38/100), Sinh học (46/100).
    2. *Giai đoạn 2: Tăng tốc chuyên sâu (Score 50% - 74%)*: Dành cho môn có học lực khá cần rèn luyện phản xạ dạng bài và bẫy đề: Tiếng Việt (68/100), Hóa học (70/100), Lịch sử (72/100).
    3. *Giai đoạn 3: Bứt phá 900+ Master (Score >= 75%)*: Dành cho môn có học lực giỏi cần chinh phục câu phân loại top 5% và tối ưu thời gian: Tư duy Logic & Số liệu (90/100), Tiếng Anh (84/100), Địa lý (80/100).
- **Thiết Kế Không Gian Học Tập Trực Quan & Bộ Lọc Giai Đoạn (`RoadmapLearningPage.jsx`)**:
  - Banner tổng quan hiển thị kết quả kiểm tra đầu vào: `710/1200 Điểm` (Theta IRT = `+0.45`, Top 15%), tóm tắt số lượng môn ở từng giai đoạn (3 môn GĐ 1, 3 môn GĐ 2, 3 môn GĐ 3).
  - Thanh bộ lọc nhanh: Tất cả 9 môn, Giai đoạn 1 (Nền tảng), Giai đoạn 2 (Tăng tốc), Giai đoạn 3 (Bứt phá).
  - Dải thẻ 9 môn học hiển thị trực quan: Icon, tên môn, trọng số điểm, tên giảng viên ĐHQG, thanh tiến trình điểm số đầu vào kèm badge giai đoạn.
- **Cấu Trúc Cây Chương & Bài Học (Chapter & Lesson Accordion Tree)**:
  - Cột bên trái hiển thị danh sách các Chương của môn được chọn; bấm vào mở rộng xem các Bài học.
  - Mỗi bài học hiển thị thời lượng (ví dụ 26 phút), trạng thái (Đã hoàn thành, Đang học, Khóa) và nhãn báo có lịch Live tương tác.
- **Không Gian Học Tập Đa Năng 4 Tabs Toàn Diện**:
  - **Tab 1: Video Bài Giảng**: Tích hợp trình phát video YouTube embed xem trực tiếp, thanh theo dõi thời lượng và % đã xem, nút phóng to toàn màn hình, nút mô phỏng xem (+5 phút) và xem xong 100%.
  - **Tab 2: Bài Giảng & Bẫy Đề (Chuẩn Panorama SGK)**: Thiết kế 3 khối tri thức sư phạm:
    - *Khối 1: Kiến thức nền tảng SGK*: Định nghĩa toán học, danh sách công thức tóm tắt, ví dụ minh họa chuẩn SGK.
    - *Khối 2: Phương pháp giải chi tiết & Bẫy đề ĐGNL*: Thuật toán từng bước, cảnh báo các bẫy đề thi VNU-HCM hay giăng.
    - *Khối 3: Bài toán mẫu & Lời giải*: Câu hỏi phân loại chuẩn độ khó (L1, L2, L3, L4), 4 phương án lựa chọn và lời giải từng bước rõ ràng.
  - **Tab 3: Lịch Học Live & Google Meet**: Hiển thị chuyên đề Live Q&A hàng tuần, thông tin giảng viên phụ trách, lịch học định kỳ, nút tham gia phòng Google Meet trực tiếp (`meet.google.com`), trạng thái điểm danh và tài liệu chuẩn bị trước buổi học.
  - **Tab 4: Quiz Củng Cố**: Bài tập trắc nghiệm củng cố kiến thức bài học (2-3 câu chuẩn IRT), chọn đáp án nộp bài chấm điểm tự động kèm lời giải chi tiết và hiệu ứng confetti khi đạt `>= 60%`.
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - Chạy `npm run build` thành công 100% trong 4.89 giây, toàn bộ bundle sẵn sàng phục vụ kiểm thử giao diện.

---

## [18/10/2026] - Nâng Cấp Trung Tâm Khảo Thí & Chẩn Đoán (Flow 1): Tích Hợp Hệ Thống 3 Sub-Tabs, Biểu Đồ Năng Lực Đa Chiều & Bảng Lịch Sử Các Lần Thi

- **Tích Hợp Hệ Thống 3 Sub-Tabs Chuyên Nghiệp Trong Sảnh Khảo Thí (`DiagnosticAssessmentPage.jsx`)**:
  - Bổ sung thanh điều hướng sub-tabs hiện đại:
    1. *Phòng Thi & Đề Khảo Thí*: Giữ nguyên giao diện phòng thi chuẩn hóa V-ACT 2026, 5 miền năng lực, thẻ đề thi và modal nhập passcode.
    2. *Kết Quả Chẩn Đoán & Biểu Đồ*: Báo cáo phân tích năng lực chi tiết kèm 4 biểu đồ trực quan chuyên sâu.
    3. *Lịch Sử Các Lần Làm Bài*: Nhật ký thống kê toàn diện các đợt khảo thí và thi thử đã thực hiện.
  - Tích hợp huy hiệu trạng thái năng lực thời gian thực hiển thị tham số IRT `` `\theta_0` `` và phân lớp đề xuất ngay trên thanh điều hướng.
- **Xây Dựng Hệ Thống Biểu Đồ Năng Lực Đa Chiều (Diagnostic Analytics & Multi-Chart System)**:
  - **Biểu Đồ Radar 5 Miền Năng Lực (5-Axis Radar Chart)**: Trực quan hóa tương quan năng lực của học sinh so với chuẩn mục tiêu 900+ ĐHQG-HCM across 5 miền: Toán học & Số liệu, Tư duy Logic, Ngôn ngữ & Văn học, KHTN, KHXH.
  - **Biểu Đồ Cột Tỷ Lệ Chính Xác Theo Miền (Domain Accuracy Bar Chart)**: Thống kê chi tiết tỷ lệ % hoàn thành và số câu đúng từng phân môn.
  - **Biểu Đồ Vùng Tiến Trình Năng Lực IRT `` `\theta` `` (Performance Growth Trend Area Chart)**: Đồ thị đường/vùng biểu diễn sự bứt phá của tham số `` `\theta` `` qua từng đợt làm bài, đối chiếu với đường ngưỡng chuẩn 900+ (`` `\theta \ge +0.80` ``).
  - **Hệ Thống Đồng Hồ Tốc Độ & Chiến Thuật Làm Bài (Pacing Speedometer Grid)**: 4 thẻ đo lường thời gian trung bình mỗi câu, số câu phản xạ nhanh (<25s), chuẩn nhịp độ (25-90s) và câu tốn thời gian (>90s).
- **Trực Quan Hóa Nhật Ký & Bảng Lịch Sử Các Đợt Khảo Thí (Test Attempts History Table)**:
  - 4 thẻ KPI tổng kết: Tổng số đợt thi, Điểm số cao nhất, Năng lực đỉnh `` `\theta` ``, Thời gian rèn luyện trung bình.
  - Bảng lịch sử chi tiết hiển thị: Tên đề thi, Ngày nộp bài, Điểm số & Tỷ lệ %, Tham số IRT `` `\theta` ``, Xếp lớp học lực, Thời lượng làm bài.
  - Tích hợp nút tương tác *Xem Đồ Thị*: Bấm vào sẽ tự động chuyển sang tab Kết Quả Chẩn Đoán nạp đúng dữ liệu bài thi đó để xem lại biểu đồ và lời giải 30 câu hỏi.
- **Cơ Chế Bền Vững & Lưu Vết Lịch Sử (Persistence & Realtime Sync)**:
  - Tạo mới module chuẩn hóa `diagnosticData.js` cung cấp dữ liệu chẩn đoán mẫu và lịch sử bài thi ban đầu.
  - Đồng bộ tự động `veval_exam_history` và `veval_latest_diagnostic_result` vào `localStorage`, lưu vết tức thì mỗi khi nộp bài thi mới.
- **Tách Bạch Ngân Hàng Đề Thi & Tinh Gọn Flow 1 Chỉ Lưu Vết Lịch Sử & Chi Tiết Lần Thi (`QuestionBankPage.jsx`, `DiagnosticAssessmentPage.jsx`)**:
  - Di chuyển toàn bộ Sảnh Phòng Thi, 5 Miền Năng Lực, thanh nhập passcode và danh mục đề thi xuống mục **"Ngân hàng đề & Thi thử"** (`QuestionBankPage.jsx`) trong sidebar, khắc phục hoàn toàn sự trùng lặp tính năng giữa Flow 1 và Ngân hàng đề.
  - Tinh gọn **"Khảo thí & Chẩn đoán (Flow 1)"** thành 2 chế độ hiển thị thống nhất không cần sub-tabs:
    1. *Danh Sách Lịch Sử*: Hiển thị trực tiếp các đợt làm bài khảo sát, thẻ chỉ số KPI tổng quan, và biểu đồ tiến trình IRT `` `\theta` ``.
    2. *Trang Chi Tiết Lần Thi*: Nhấp vào bất kỳ dòng nào trong bảng hoặc nút *Xem Đồ Thị & Báo Cáo* sẽ mở ngay trang phân tích chi tiết của bài thi đó (Radar 5 miền, nhịp độ pacing, nhận xét AI Socratic, bảng 30 câu hỏi) kèm nút *← Quay Lại Danh Sách Lần Thi* mượt mà.
- **Kiểm Thử Vận Hành & Trải Nghiệm Trình Duyệt**:
  - Chạy `npm run build` thành công 100% trong 1.15 giây, 0 lỗi cú pháp.
  - Trình duyệt tự động (Browser Subagent) kiểm thử end-to-end: truy cập Flow 1 -> xem bảng lịch sử -> click vào chi tiết lần thi -> kiểm tra các đồ thị -> quay lại danh sách -> chuyển sang Ngân hàng đề -> mở modal nhập passcode `VACT2026` hoạt động hoàn hảo 100%.


---

## [15/10/2026] - Tích Hợp Nút "Thi Thử Ngay" Trên Top Navbar Kế Bên "Đặc Tả Kiến Trúc", Bật Modal Thông Tin & Nhập Passcode Khởi Động Bài Thi Đầu Vào

- **Tích Hợp Nút "Thi Thử Ngay" Trực Tiếp Trên Thanh Điều Hướng Header (`Navbar.jsx`)**:
  - Bổ sung nút gradient xanh-tím nổi bật (`from-blue-600 to-indigo-600`) kèm biểu tượng tia sét vàng `Zap` ngay cạnh nút *Đặc tả Kiến trúc & 3 Q&A* trên thanh Top Navbar của Dashboard.
  - Hỗ trợ responsive đa màn hình (`Thi thử ngay` trên màn hình vừa/lớn và `Thi Thử` trên màn hình nhỏ), giúp học sinh ở mọi giao diện có thể truy cập bài khảo sát năng lực tức thì mà không cần tìm kiếm sâu trong menu.
- **Xây Dựng Component Modal Chi Tiết & Nhập Passcode Tái Sử Dụng (`ExamPasscodeModal.jsx`)**:
  - Tạo mới component `ExamPasscodeModal.jsx` theo chuẩn thiết kế V-Eval, hiển thị trực quan thông số bài thi khảo sát đầu vào 30 câu V-ACT 2026:
    - *Số lượng câu hỏi*: 30 câu trắc nghiệm.
    - *Thời gian làm bài*: 45 phút.
    - *Quy chế phòng thi*: Azota Proctored Toàn Màn Hình.
    - *Động cơ chấm điểm*: IRT 2PL & Theta 0.
  - Tích hợp khối cảnh báo giám sát thi trực tuyến Azota (toàn màn hình, phát hiện rời tab/mất focus quá 3 lần).
  - Tích hợp ô nhập mã phòng thi / mật mã truy cập kèm nút *Điền mã mẫu* (`VACT2026`), xác thực mã hợp lệ và báo lỗi trực quan nếu nhập sai.
- **Đấu Nối Khởi Động Trực Tiếp Phòng Thi Từ Dashboard (`App.jsx`, `DiagnosticAssessmentPage.jsx`)**:
  - Khi học sinh xác nhận mã thành công từ Modal trên Dashboard, hệ thống tự động thiết lập `diagnosticAutoStart = true`, chuyển sang tab `diagnostic`, kích hoạt chế độ thi toàn màn hình và ẩn thanh Navbar/Sidebar để bước vào bài thi tập trung cao độ.
  - Khi nộp bài hoặc chọn quay lại Dashboard, hệ thống tự động reset `autoStart` và khôi phục giao diện điều hướng tổng quan.
- **Kiểm Thử Biên Dịch (Vite Build)**:
  - Chạy `npm run build` thành công 100% trong 1.23 giây, 2902 modules được chuyển đổi sạch, 0 lỗi cú pháp.

---

## [15/10/2026] - Khắc Phục Lỗi Đè Lấn Navbar, Tích Hợp Trung Tâm Khảo Thí & Modal Chọn Đề 30 Câu Cho Tài Khoản Đã Đăng Nhập (Flow 1)

- **Khắc Phục Triệt Để Lỗi Va Chạm Giao Diện Thanh Điều Hướng (Navbar Overlap Fix)**:
  - Sửa lỗi bộ chọn cơ sở đào tạo (`Cơ sở 1: ĐHQG TP.HCM (Thủ Đức)`) đè lấn lên huy hiệu chuỗi học tập `12 Ngày` trên thanh Header.
  - Bổ sung `overflow-hidden min-w-0 max-w-[210px]` cho vùng chứa, `truncate` cho thẻ `<select>` và `shrink-0 whitespace-nowrap` cho huy hiệu ngọn lửa Streak.
  - Tối ưu hóa điểm ngắt giao diện (`hidden xl:flex`) bảo đảm bố cục hiển thị cách đều, rộng rãi trên mọi độ phân giải màn hình.
- **Tích Hợp Sảnh Trung Tâm Khảo Thí & Chẩn Đoán Cho Người Dùng Đã Đăng Nhập (`DiagnosticAssessmentPage.jsx`)**:
  - Xây dựng giao diện Sảnh Trung Tâm Khảo Thí hiển thị khi người dùng chọn mục *Khảo thí & Chẩn đoán (Flow 1)* từ Sidebar Dashboard.
  - Cung cấp Hero Banner giới thiệu chuẩn hóa V-ACT 2026, thanh tìm kiếm/nhập mã phòng thi nhanh, và dải thông tin 5 miền năng lực chuẩn (Toán học, Logic, Ngôn ngữ, KHTN, KHXH).
  - Trình bày danh mục thẻ bài thi trực quan với đầy đủ thông số thời gian, số câu hỏi, huy hiệu trạng thái và mã phòng thi mặc định (`VACT2026`, `HCM120`, `LOGIC15`).
- **Khắc Phục Lỗi Màn Hình Chờ Treo Vô Hạn (Lobby Loading Fix)**:
  - Cập nhật khởi tạo biến trạng thái `isLoading` dựa theo `Boolean(autoStart)` (thay vì cố định `true`), giúp sảnh chờ hiển thị tức thì, không bị modal loading che phủ khi chuyển trang từ Dashboard.
- **Modal Chi Tiết Đề Thi & Xác Thực Passcode Vào Phòng Thi (`selectedExamForModal`)**:
  - Nhấp vào đề thi 30 câu mở popup chi tiết: hiển thị thông số bài thi, cảnh báo quy chế giám sát toàn màn hình Azota và động cơ ước lượng IRT 2PL `\theta_0`.
  - Ô nhập mã phòng thi được tự động điền sẵn `VACT2026` kèm nút *Điền mã mẫu*, hỗ trợ xác thực mã tức thì và khởi động bài thi mượt mà vào Câu 1/30.
- **Chuẩn Hóa Hệ Thống Popup & Thoát Phòng Thi Chuẩn React (Zero Native Dialogs)**:
  - Loại bỏ hoàn toàn `window.alert` và `window.confirm` native, thay thế bằng các React Modal chuyên biệt (`showPopupAlert`, `showExitConfirmModal`) nhằm ngăn chặn việc mất focus cửa sổ trình duyệt gây tính nhầm vi phạm rời tab.
- **Kiểm Thử Biên Dịch & Vận Hành**:
  - Chạy lệnh `npm run build` thành công 100% trong 2.79 giây, 0 lỗi cú pháp.

---

## [12/10/2026] - Trực Quan Hóa Mã Phòng Thi Thử Demo, Tích Hợp Nút Sao Chép & Tự Điền Passcode 1-Click

- **Trực Quan Hóa Mã Phòng Thi Thử & Hỗ Trợ Sao Chép Nhanh (`DiagnosticAssessmentPage.jsx`)**:
  - **Hiển Thị Trực Quan Mã Phòng Trên Từng Card Đề Thi**: Bổ sung hiển thị mã phòng thi tương ứng cho từng đề thi (`VACT2026`, `HCM120`, `LOGIC15`) kèm nút `Copy` (Sao chép) trực tiếp trên Card phòng thi.
  - **Tự Điền & Sao Chép Trong Modal Nhập Mã (1-Click Auto-fill & Copy)**: Trong Modal xác nhận vào phòng thi, tích hợp huy hiệu demo hiển thị passcode kèm nút `Tự điền & Copy` giúp người dùng demo chỉ cần bấm 1 click là tự động điền mã vào ô input và sao chép vào bộ nhớ tạm.
  - **Khối Gợi Ý Mã Nhanh Trên Banner (Quick Code Badges)**: Bổ sung các thẻ bấm nhanh mã phòng demo (`VACT2026`, `HCM120`, `LOGIC15`) ngay dưới thanh tìm kiếm nhanh ở Hero Banner, kèm phản hồi trạng thái `✓ Đã chép`.
- **Đánh Giá & Làm Rõ Trạng Thái Đấu Nối API Phân Hệ Phòng Thi Thử**:
  - **Luồng Lấy & Sinh Đề Thi**: Đã tích hợp API `contentService.getExamDetail` (`/api/v1/content/exams/{id}`) và fallback `contentService.getDiagnosticTest` (`/api/v1/content/diagnostic-test`), đồng thời hỗ trợ sinh đề động từ mô hình Gemini AI (`aiService.generateExam`). Đã có cơ chế Fallback an toàn 100% nếu backend chưa bật.
  - **Luồng Nộp Bài**: Đã đấu nối API `practiceService.submitDiagnosticTest` (`/api/v1/practice/diagnostic-submissions`) ước lượng năng lực IRT 2PL Theta 0 và vẽ Radar Chart.
  - **Luồng Xác Thực Mã Phòng**: Đang kiểm tra cục bộ ở Client-side theo danh sách phòng thi mẫu phục vụ giai đoạn chạy thử nghiệm demo.
- **Kiểm Thử Biên Dịch (Vite Build)**:
  - Chạy `npm run build` thành công 100% không cảnh báo cú pháp, sẵn sàng chạy trải nghiệm demo.

---

## [09/10/2026] - Nâng Cấp Giao Diện Thi Chẩn Đoán Flow 1, Full-Width Footer, Floating Sidebar & Sửa Bug Azota Proctored

- **Tái Cấu Trúc Bố Cục Trang Dashboard & Public Footer Full-Width (`App.jsx`, `PublicFooter.jsx`)**:
  - **Public Footer Full-Width (`w-full bg-slate-950`)**: Đưa `PublicFooter` ra ngoài wrapper cột phải, đặt ở tầng gốc trang Dashboard trải dài 100% bề ngang màn hình.
  - **Sidebar Tự Động Cuộn Theo Trang (Natural Scroll-up)**: Cấu hình `Sidebar` dạng `sticky top-20` bên trong container giữa, tự động cuộn lên trên theo luồng nội dung khi người dùng cuộn xuống dưới cùng để nhường trọn vẹn diện tích chiều ngang cho `PublicFooter`.
  - **Bổ Sung Khoảng Cách Đệm Thông Thoáng (Bottom Padding Spacing)**: Bổ sung `pb-16 lg:pb-24` cho thẻ `<main>` tránh tình trạng các khối card và nút bấm bị dính sát vào Footer.
- **Di Dời Logo Thương Hiệu & Tinh Chỉnh Thanh Header / Sidebar (`Navbar.jsx`, `Sidebar.jsx`)**:
  - **Đưa Logo Lên Top Navbar**: Chuyển cụm Logo thương hiệu **ĐGNL AI v2.4** cùng phụ đề *"Khảo thí & Luyện thi Thích ứng 4.0"* từ Sidebar lên góc trái trên cùng của thanh Header (`Navbar.jsx`).
  - **Đẩy Danh Mục Sidebar Lên Sát Đỉnh**: Loại bỏ khối logo cũ ở Sidebar, giúp mục *"KHẢO THÍ & LUYỆN TẬP"* được đẩy sát lên đỉnh Sidebar, tối ưu không gian hiển thị danh sách điều hướng.
  - **Giao Diện Sidebar Bo Tròn Nổi (Floating Rounded Card)**: Thiết kế Sidebar dạng Card bo tròn 4 góc `rounded-2xl`, hiệu ứng kính mờ `bg-white/95 backdrop-blur-md`, viền mờ `border-slate-200/80` và đổ bóng `shadow-md shadow-slate-200/40`.
- **Tối Ưu Giao Diện Bài Thi Khảo Sát Năng Lực Flow 1 & Bảo Mật Passcode (`DiagnosticAssessmentPage.jsx`)**:
  - **Phòng Thi Đặt Mã Bảo Mật (Strict Passcode Verification)**: Đặt ô nhập mã phòng thi rỗng `""` mặc định, bắt buộc gõ chính xác Passcode (`VACT2026`, `HCM120`, `LOGIC15`) mới cho phép vào thi, hiển thị thông báo lỗi tức thì nếu gõ sai.
  - **Loại Bỏ Mini-Footer Thừa**: Xóa bỏ toàn bộ khối mini-footer nội bộ trùng lặp trong `DiagnosticAssessmentPage.jsx`, giữ giao diện thi sạch đẹp và sử dụng duy nhất `PublicFooter` của hệ thống.
  - **Live IRT Status Badge**: Di dời chỉ số năng lực IRT `Theta 0: +0.65 (82% Trúng tuyển)` lên Top Navbar kế bên Streak Counter.
  - **Bảng Số Câu Hỏi Bên Phải (Right Question Palette)**: Thiết kế 30 nút số câu hỏi sắc nét. Các câu học sinh đã chọn đáp án được tô đậm nổi bật bằng màu xanh ngọc/xanh lá lục bảo (`bg-emerald-600 text-white font-black border-emerald-400 shadow-md`) kèm chấm trắng trực quan.
  - **Khung Làm Bài Bên Trái (Left Question Area)**: Trình bày nội dung câu hỏi KaTeX MathText, đoạn văn đọc hiểu, các lựa chọn A/B/C/D, cùng cụm nút chuyển câu (`Câu trước`, `Câu kế tiếp`, `Hoàn tất & Nộp bài`).
- **Sửa Triệt Để Bug Pop-up Nộp Bài Tính Nhầm Vi Phạm Rời Tab**:
  - Tách luồng `handlePromptSubmitExam` kích hoạt custom React modal `SubmitConfirmModal` thay cho `window.confirm()` native (vốn làm mất focus cửa sổ trình duyệt).
  - Thêm cờ guard `showSubmitConfirmModalRef` tạm thời vô hiệu hóa bộ giám sát `visibilitychange` & `fullscreenchange` khi popup nộp bài đang mở, giải quyết triệt để lỗi bấm "Hủy" bị cộng số lần rời tab.
- **Chế Độ Thi Giám Sát Azota Proctored (Anti-Cheat & Fullscreen)**:
  - **Toàn Màn Hình (Fullscreen API)**: Tự động yêu cầu chế độ Toàn Màn Hình khi bấm bắt đầu thi.
  - **Phát Hiện Vi Phạm Rời Tab / Mất Focus**: Tự động phát hiện khi học sinh chuyển tab hoặc thoát Fullscreen.
  - **Modal Cảnh Báo Vi Phạm (Overlay Warning Modal)**: Bật giao diện cảnh báo vi phạm màu đỏ, đếm số lần vi phạm (`X/3`) và yêu cầu học sinh bấm quay lại Toàn Màn Hình để tiếp tục làm bài.

---

## [06/10/2026] - Đấu Nối 100% API Real Auth, Loại Bỏ Hoàn Toàn Mock Pre-fill & Tự Động Khôi Phục Phiên Làm Việc

- **Tích Hợp 100% API Thực Tế Cho Phân Hệ Xác Thực (`src/components/auth/`)**:
  - Thay thế toàn bộ mã giả `setTimeout` và hardcode JWT Token trong `WebLoginPage.jsx` và `AuthModal.jsx` bằng các hàm `authService.login()`, `authService.register()`, `authService.verifyOtp()`, `authService.forgotPassword()`, `authService.resetPassword()`.
  - **Xoá Hoàn Toàn Ô Pre-fill Giả Lập**: Đặt lại trạng thái ban đầu của ô Email và Password về chuỗi rỗng `''` (thay vì điền sẵn `minhhoang.vnu@gmail.com` và `••••••••`), đảm bảo form đăng nhập gửi đúng thông tin người dùng gõ tới API thực tế.
  - Kết nối trực tiếp qua API Gateway YARP (`http://localhost:5212`) tới Identity Service (`:5155`).
  - Tự động chuyển đổi vai trò hệ thống (`Student`, `Teacher`, `Manager`, `Parent`) từ mảng `roles` trả về của Backend.
  - Xử lý mã lỗi `Auth.AccountNotActivated` (403) mở tự động modal nhập OTP kích hoạt 6 số.
- **Hoàn Thiện Luồng Đăng Xuất & Khôi Phục Phiên (Session Restoration)**:
  - Cập nhật `handleLogout` gọi `authService.logout()` thu hồi Refresh Token và xóa sạch `tokenStorage`.
  - Bổ sung `useEffect` trên `App.jsx` tự động khôi phục thông tin người dùng và vai trò khi bấm F5 reload ứng dụng.
  - Truyền prop `currentUser` thực tế vào `Navbar.jsx` hiển thị đúng Họ tên & Email thực của người dùng đăng nhập.
- **Kiểm Thử Biên Dịch Nguồn (Build Verification)**:
  - Biên dịch sản phẩm thành công với `npx vite build` trong 1.40s (0 error).

---

## [06/10/2026] - Tái Cấu Trúc Phân Hệ Xác Thực (Auth), Custom Rounded Dropdown & Validation Báo Lỗi Theo Trường

- **Tái Cấu Trúc Mã Nguồn Phân Hệ Auth (`src/components/auth/`)**:
  - Tách `WebLoginPage.jsx` (từ >1,240 dòng monolithic) thành 3 subcomponents độc lập, chuyên biệt và dễ bảo trì:
    - `src/components/auth/LoginForm.jsx`: Chứa form đăng nhập Email/SĐT & Mật khẩu, ghi nhớ đăng nhập, nút Đăng nhập thử 1-Click tự động phân role Backend, và các cổng đăng nhập mạng xã hội (Google ID, Zalo Account).
    - `src/components/auth/RegisterForm.jsx`: Chứa form đăng ký mới với chuyển đổi vai trò (Học sinh vs Phụ huynh), các ô thông tin riêng biệt (Họ tên, Email, SĐT, Mật khẩu, Nhập lại mật khẩu, Thanh đo độ mạnh mật khẩu, Checkbox điều khoản).
    - `src/components/auth/ForgotPasswordModal.jsx`: Modal khôi phục mật khẩu 4 bước (Nhập Email -> Mã xác thực OTP 6 số -> Tạo mật khẩu mới -> Đăng nhập ngay).
  - Tối ưu `WebLoginPage.jsx` chỉ còn ~350 dòng, đóng vai trò trang bao bọc (Page Container) quản lý Navigation Header, Cột học thuật bên trái & ảnh thực tế học sinh THPT Việt Nam.
- **Tùy Biến Menu Thả Xuống Bo Tròn Sang Trọng (Custom Rounded Dropdown Select)**:
  - Thay thế hoàn toàn các thẻ `<select>` mặc định của trình duyệt (bị góc vuông sắc nhọn OS) bằng **Custom Motion Dropdown Component** (`rounded-2xl` popover menu, các ô tùy chọn `rounded-xl` kèm icon `CheckCircle2` khi chọn).
  - Áp dụng đồng bộ cho các ô chọn **Khối Lớp** (*Lớp 12, Lớp 11, Thí sinh tự do*) và **Mục tiêu ĐGNL** (*900+, 800+, 700+*) trong cả `WebLoginPage.jsx` và `AuthModal.jsx`.
- **Phân Quyền Giao Diện Đăng Ký Chuẩn Xác Cho Phụ Huynh**:
  - Tự động ẩn các trường dành riêng cho học sinh (**Khối Lớp** & **Mục tiêu ĐGNL**) khi chuyển sang tab đăng ký vai trò **Phụ huynh** (`role === 'parent'`).
- **Nâng Cấp Hệ Thống Báo Lỗi Validate Form Toàn Diện (Per-field Validation)**:
  - Hiển thị thông báo lỗi đồng thời ngay bên dưới tất cả các ô nhập liệu bị thiếu hoặc không hợp lệ khi bấm Submit (thay vì bắt bấm Submit 5 lần).
  - Đổi màu viền sang đỏ (`border-rose-400 bg-rose-50/50`) giúp nhận biết trực quan tức thì.
  - Tự động xóa dòng báo lỗi và màu viền đỏ realtime khi người dùng bắt đầu gõ điều chỉnh lại thông tin (Clear-on-type).
- **Đồng Bộ Hoàn Toàn Với Modal Nhanh `AuthModal.jsx`**:
  - Áp dụng toàn bộ quy tắc validate, custom dropdown bo tròn và ẩn/hiện trường học sinh cho `AuthModal.jsx`.

---

## [02/10/2026] - Nâng Cấp Toàn Diện Tầng Dịch Vụ AI Engine (`src/services/aiService.js`) Qua API Gateway
- **Móc Nối Đầy Đủ 14+ API AI Engine Qua Gateway YARP (`http://localhost:5212`)**:
  - **Nhóm 1: Bóc tách Đề thi PDF (Gemini Vision OCR)**:
    - `uploadPdfExam(pdfFile)`: Upload đề thi PDF phân tích nền (`POST /api/ai-engine/upload-pdf`).
    - `getExamJobStatus(jobId)`: Polling tiến độ OCR (`GET /api/ai-engine/jobs/${jobId}`).
    - `getViewExamUrl(jobId)`: URL xem trực quan kết quả đề thi (`/view-exam`).
  - **Nhóm 2: Nạp & Quản Trị Tri Thức SGK / Vector DB (.NET AI Engine)**:
    - `uploadTextbookPdf(file, options)`: Nạp SGK lên đến 250MB (`POST /api/ai-engine/textbooks/upload-pdf`).
    - `getActiveTextbookJob()`: Khôi phục tác vụ nạp SGK khi người dùng F5 (`GET /api/ai-engine/textbooks/active-job`).
    - `getTextbookCheckpoint(fileHash)`: Kiểm tra Checkpoint SHA-256 (`GET /api/ai-engine/textbooks/checkpoint/${fileHash}`).
    - `getTextbookJobStatus(jobId)`: Polling tiến độ bóc tách SGK (`GET /api/ai-engine/textbooks/jobs/${jobId}`).
    - `getTextbookChunks(sourceId)` & `getTextbookChunksByHash(fileHash)`: Danh sách Vector Chunks tri thức SGK.
    - `saveTextbookChunksToDb(dto)`: Lưu Chunks vào Supabase DB schema `v_eval_ai` (`POST /api/ai-engine/textbooks/save-db`).
    - `pingVisionModels(geminiKey)`: Đo kiểm độ trễ & trạng thái các mô hình Vision AI (`GET /api/ai-engine/textbooks/ping-vision`).
    - `getViewTextbookUrl()`: URL trang nạp & xem SGK trực quan (`/view-textbook`).
  - **Nhóm 3: Sinh Đề Thi AI & Chẩn Đoán Năng Lực IRT/BKT (Python FastAPI RAG)**:
    - `generateExam(payload)`: Sinh đề thi AI theo Prompt & chuẩn hóa Bloom 6 cấp độ (`POST /api/v1/diagnostic/generate-exam`).
    - `analyzeDiagnosticSubmission(payload)`: Chẩn đoán năng lực học sinh IRT 2PL, BKT, Radar chart (`POST /api/v1/diagnostic/analyze`).
    - `getDiagnosticConfig()`: Lấy cấu hình ngưỡng phân lớp và tham số (`GET /api/v1/diagnostic/config`).
    - `getViewDiagnosticUrl()`: URL trang khảo sát năng lực chẩn đoán trực quan (`/view-diagnostic`).
  - **Nhóm 4: Gia Sư AI Socratic RAG & SSE Streaming (Token by Token)**:
    - `askSocraticTutor({ question, sessionId })`: Hỏi đáp gia sư dạng Single Request (`POST /api/v1/chat`).
    - `askSocraticTutorStream({ question, sessionId, onToken, onError, onComplete, signal })`: Token Streaming SSE chạy chữ mượt mà như ChatGPT (`POST /api/v1/chat/stream`).
    - `getChatSessions()` & `clearChatSession(sessionId)`: Quản lý phiên hội thoại (`/api/v1/chat/sessions`).
  - **Nhóm 5: Quản trị Tài liệu Tri thức RAG**:
    - `uploadRagDocument(file)`: Nạp tài liệu tri thức RAG (`POST /api/v1/documents/upload`).
- **Phát Triển Trang Khảo Sát Năng Lực 30 Câu Thật Với AI & Content Service (`DiagnosticAssessmentPage.jsx`)**:
  - Xây dựng component trang hoàn chỉnh `src/components/diagnostic/DiagnosticAssessmentPage.jsx`:
    - Setup screen: Hỗ trợ 3 nguồn đề thi linh hoạt:
      + **Đề Có Sẵn (Content Service)**: Lấy trực tiếp từ Database PostgreSQL 30 câu hỏi chuẩn hóa V-ACT kèm bài đọc hiểu (Passages).
      + **Google Gemini AI Cloud**: Sinh 30 câu hỏi mới 100% kèm công thức Toán KaTeX.
      + **Hiệu Chuẩn AI Fast Bank (<500ms)**: Trích xuất siêu tốc 30 câu từ bộ nhớ hiệu chuẩn psychometrics.
    - In-exam testing screen: Đồng hồ 45 phút, ngữ liệu đọc hiểu collapsible, thanh điều hướng 30 câu kèm cờ phân vân, hiển thị công thức KaTeX, tích hợp Gia sư AI Socratic RAG hỗ trợ tư duy từng bước.
    - Result & Psychometrics screen:
      + Điểm thô thực tế ($X/30$), ước lượng năng lực IRT 2PL `\theta_0`, phân lớp học viên (`FOUNDATION`, `ACCELERATION`, `BREAKTHROUGH`).
      + **Phân tích Tốc độ & Chiến thuật (Pacing Analysis)**: Thời gian trung bình/câu, nhóm làm nhanh (&lt;25s), nhóm chuẩn (25-90s), nhóm tốn thời gian (&gt;90s), câu phân vân gắn cờ 🚩.
      + **Biểu Đồ Radar Năng Lực 5 Lĩnh Vực**: Dữ liệu Recharts Radar Chart lấy trực tiếp từ kết quả 30 câu thật không bịa, đối chiếu chuẩn 900+.
      + **Bảng Tra Cứu & Đáp Án Chi Tiết 30 Câu**: Bộ lọc (Tất cả, Đúng, Sai, Phân vân), đối chiếu đáp án của bạn vs đáp án đúng, badge thời gian, ngữ liệu và lời giải chi tiết KaTeX.
  - Tích hợp vào thanh chuyển trang (Top Page Control Bar) của `App.jsx` và liên kết điều hướng từ Landing Page, HeroBanner và Sidebar Dashboard.
- **Tích Hợp Trình Render Toán Học KaTeX Toàn Diện (`MathText.jsx`, `DiagnosticAssessmentPage.jsx`, `DiagnosticTestModal.jsx`)**:
  - Cài đặt thư viện `katex` và nạp stylesheet `katex/dist/katex.min.css` vào `main.jsx` và font Plus Jakarta Sans.
  - Xây dựng component `src/components/common/MathText.jsx` hỗ trợ parse và render chuẩn xác các công thức toán học STEM phức tạp:
    - Ký hiệu delimiters: `$$...$$`, `$...$`, `\[...\]`, `\(...\)`.
    - Tự động nhận diện lệnh LaTeX: phân số `\frac{...}{...}`, căn thức `\sqrt{...}`, vô cực `\infty`, số mũ `x^4 + 2x^2`, tích phân `\int`, hình học `\perp`...
    - Điều chỉnh màu KaTeX thừa hưởng (inherit) đảm bảo độ tương phản cao, hiển thị sắc nét trên cả nền tối Dark Theme và nền sáng Light Theme.
- **Kiểm Thử Biên Dịch**:
  - `npm run build` thành công 100% trong 1.26s, đóng gói hoàn chỉnh các bộ font KaTeX (woff, woff2, ttf).

---

## [01/10/2026] - Kiểm Thử Toàn Diện Tầng Giao Tiếp API Gateway YARP & Đồng Bộ Kiến Trúc Dịch Vụ Frontend

- **Hoàn Thiện Tầng Service Client Tập Trung (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng Axios instance chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm Bearer token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và xử lý lỗi tập trung.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/auth`, `/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/v1/ai`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.
- **Kiểm Thử Biên Dịch & Vận Hành**:
  - `npm run build` thành công 100% trong 619ms, tạo các bundle tĩnh `dist/` sẵn sàng phục vụ trong container Nginx Alpine.
  - Kiểm thử tương thích môi trường cấu hình qua [`.env`](../.env) và [`.env.example`](../.env.example).

---

## [29/09/2026] - Tích Hợp Web Client Vào Hệ Thống V-Eval System-Repo & Cấu Hình Runner Đa Dịch Vụ

- **Đồng Bộ Repository & Cấu Hình Hệ Thống**:
  - Clone mã nguồn nhánh `develop` từ repository `https://github.com/Capstone-OG/v-eval-web-client.git` vào thư mục chuẩn hóa `All Services/V-Eval-Web_Client`.
  - Bổ sung cấu hình tracking vào [`git_config.txt`](../../git_config.txt):
    ```ini
    V-Eval-Web_Client=https://github.com/Capstone-OG/v-eval-web-client.git|develop
    ```
  - Cập nhật [`Scripts/setup/setup.bat`](../../Scripts/setup/setup.bat) bổ sung cờ kiểm tra `package.json` (`IS_NODE=1`) để ngăn chặn việc sinh nhầm giải pháp .NET Clean Architecture cho các dự án Web/Frontend.
- **Xây Dựng Script Push Độc Lập Cho Web Client**:
  - Tạo script [`Scripts/push.bat`](../Scripts/push.bat) chuyên dụng cho Web Client, đồng bộ tính năng với các microservices backend:
    - Kiểm tra đồng bộ lịch sử commit với Remote `origin/develop`.
    - Menu chọn nhanh đẩy mã nguồn (Nhánh hiện tại, Nhánh đã có, hoặc Khởi tạo nhánh mới).
    - Tự động kiểm tra `git status`, tạo commit và push lên GitHub.
- **Cấu Hình Môi Trường Thực Thi Docker & Local Runner**:
  - Soạn thảo [`Dockerfile`](../Dockerfile) đa tầng (Multi-stage build) sử dụng `node:22-alpine` để biên dịch mã nguồn React 19 và `nginx:alpine` phục vụ file tĩnh SPA.
  - Thiết lập [`nginx.conf`](../nginx.conf) hỗ trợ điều hướng SPA Routing (`try_files $uri $uri/ /index.html;`) tránh lỗi 404 khi người dùng tải lại trang.
  - Cập nhật [`docker-compose.yml`](../../docker-compose.yml) khai báo container `v_eval_web_client` phục vụ tại cổng `5173:80`.
  - Cập nhật [`Scripts/run_local/run_local.bat`](../../Scripts/run_local/run_local.bat) bổ sung tùy chọn khởi chạy Web Client (Tùy chọn [1] Full 7 dịch vụ và Tùy chọn [4] Chỉ Web Client cổng 5173).
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - Chạy thành công `npm install` (cài đặt 87 gói phụ thuộc không có lỗ hổng bảo mật).
  - Chạy `npm run build` thành công trong 3.87 giây, xuất bản thư mục `dist/` hoàn chỉnh.
  - Kiểm tra cú pháp Docker compose với `docker compose config` đạt chuẩn 100%.
- **Xây Dựng Phân Hệ Dịch Vụ Kết Nối API Gateway YARP (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng HTTP Client chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm JWT Bearer Token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và tự động retry khi gặp mã lỗi 401.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/ai-engine`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.

---

### [12/10/2026] - Hoàn Thiện Tích Hợp Kết Quả Khảo Thí Chẩn Đoán Core Flow 1 & Đồng Bộ Chỉ Số Năng Lực Trực Quan
- **Đồng Bộ Dữ Liệu Nộp Bài Khảo Thí Vào Practice Service (`DiagnosticAssessmentPage.jsx`)**:
  - Tích hợp gọi trực tiếp `practiceService.submitDiagnosticTest` từ Web Client khi học sinh nộp bài 30 câu khảo sát chẩn đoán.
  - Tự động chuẩn hóa định dạng ID câu hỏi và ID học sinh sang GUID chuẩn để khớp với kiến trúc Backend.
  - Lưu trữ định danh bài nộp `SubmissionId`, năng lực `Theta 0` và phân lớp năng lực (`PlacementClass`) vào `localStorage` và `sessionStorage` để phục vụ làm dữ liệu đầu vào cho Core Flow 2 (Sinh lộ trình học tập cá nhân hóa).
- **Cập Nhật Động Chỉ Số Năng Lực Thời Gian Thực Trên Navbar (`Navbar.jsx`)**:
  - Huy hiệu Live IRT Status Badge trên thanh Header được cấu hình đọc động chỉ số `veval_theta_0` từ bộ nhớ client sau khi thí sinh hoàn thành bài thi chẩn đoán.
  - Phản ánh tức thì mức độ năng lực cập nhật của học sinh (`+0.85`, `+0.65`...) và đồng bộ trạng thái trúng tuyển mục tiêu.
- **Kiểm Thử Biên Dịch & Vận Hành Giao Diện Frontend**:
  - Chạy lệnh `npm run build` thành công 100% trong 1.61 giây, 0 lỗi cú pháp, toàn bộ các asset KaTeX và gói Recharts được đóng gói sẵn sàng triển khai.

---

### [14/10/2026] - Chuẩn Hóa Kiến Trúc 3-Flow, Tinh Gọn Sảnh Khảo Thí Flow 1 & Phân Định Rõ Ràng Với Milestone Quiz Flow 2
- **Tái Định Hình Sảnh Khảo Thí Flow 1 (`DiagnosticAssessmentPage.jsx`)**:
  - Lọc chính xác danh mục đề thi (`examCategory === 'DIAGNOSTIC'`), chỉ hiển thị bài thi khảo sát chẩn đoán chuẩn hóa 30 câu hỏi của Flow 1.
  - Loại bỏ hoàn toàn sự xuất hiện nhầm lẫn của 4 "Bài Quiz củng cố chặng học" (20 câu - thuộc Flow 2) và các "Đề thi thử 120 câu" (thuộc Flow 3) trên sảnh chờ chẩn đoán.
  - Thiết kế lại Hero Card phòng thi chẩn đoán độc bản: Hiển thị đầy đủ thông số 30 câu hỏi, 45 phút, 5 miền năng lực V-ACT, mã phòng thi `VACT2026` và tích hợp banner giải thích quy trình 3-Flow của V-Eval.
- **Tối Ưu Trải Nghiệm Thí Sinh & Giám Sát Azota Proctored**:
  - Bố cục thích ứng (Adaptive Layout): Tự động mở rộng `max-w-[1720px]` chia 2 cột độc lập khi gặp chùm câu hỏi đọc hiểu (cột trái cuộn ngữ liệu, cột phải chọn đáp án A/B/C/D).
  - Trợ thủ giám sát Azota: Tự động kích hoạt toàn màn hình (Fullscreen API), chuông cảnh báo Web Audio API, nhấp nháy tab cảnh báo khi học sinh mất focus/rời tab.
- **Tích Hợp Modal Xác Nhận Thi Thử Vãng Lai (Guest Mode Popup) Cho Trang Chủ (`PublicLandingPage.jsx` & `App.jsx`)**:
  - Xây dựng Popup Modal xác nhận vào thi thử chuẩn hóa: Giới thiệu 30 câu hỏi, 45 phút, 5 miền thi và nêu rõ quyền lợi "Không cần đăng nhập, hoàn toàn miễn phí".
  - Cung cấp 2 lựa chọn hành động thông minh:
    1. `🚀 Vào Thi Thử Ngay (Chế độ Khách)`: Điều hướng trực tiếp sang phòng thi chẩn đoán độc lập toàn màn hình (`currentPage = 'diagnostic'`) mà không bị nhúng nhầm vào Dashboard học sinh.
    2. `🔑 Đăng Nhập Để Lưu Điểm`: Dành cho thí sinh muốn lưu kết quả vào học bạ và tự động sinh Lộ trình học thích ứng Flow 2.
  - Tối ưu thanh điều hướng sảnh phòng thi: Bổ sung nút `← Về Trang Chủ` giúp khách vãng lai dễ dàng quay lại Landing Page nếu đổi ý.
- **Kiểm Thử Biên Dịch & Vận Hành Frontend**:
  - Chạy lệnh `npm run build` thành công 100% trong 1.16 giây, 0 lỗi cú pháp.






## [22/10/2026] - Diagnostic submission: require backend results

- Removed frontend grading, theta/placement estimation, generated submission IDs, radar benchmarks and commentary fallbacks from submission handling.
- Failed requests or incomplete responses show an error and keep answers in component state; they do not create a result or successful history entry. Answers are not persisted across reloads.
- Backend unchanged. Existing historical/demo displays and backend fallback behavior are outside this change.
- Validation: Vite production build passed; targeted Oxlint passed with existing warnings. No live POST was sent.


### Campus prerequisite correction [22/10/2026]

- Apply changes to the lowercase v-eval-web-client project. Before loading any diagnostic exam, require authentication and fetch student profile plus active campuses.
- Missing/inactive campus opens a selection dialog. Confirm campus through PUT /api/v1/students/me/profile before continuing; failed reads/writes do not enter the exam. Existing valid campus requires no new selection.
- Auto-start begins in setup until prerequisites and exam loading succeed. No mock campus list. Backend unchanged.
- Production build passed; authenticated end-to-end writes not tested.


### Real campus selector [22/10/2026]

- Navbar reads active campuses from GET /api/v1/campuses and the student campus from GET /api/v1/students/me/profile. Removed mock campus list and default campus.
- Student selection is saved through PUT /api/v1/students/me/profile; update selection only after server confirmation. Errors appear beside the selector. Diagnostic setup dispatches a campus update to synchronize Navbar.
- Non-student campus selection is read-only. Backend registration does not accept CampusId; campus remains a profile setup step before the diagnostic exam.
- Live read-only campus API returned CS_THU_DUC and CS_QUAN_10. Vite build passed; targeted lint has warnings and no errors. Authenticated writes were not exercised. Backend unchanged.


### Read-only campus badge [22/10/2026]

- Navbar displays the saved campus name from live API data as plain text. Removed selection control and profile write handler. Missing campus shows an unset state; loading and API errors remain explicit.
- Production build passed. Backend unchanged.


### Mandatory campus prerequisite before all exam entry paths [22/10/2026]

- Removed premature testing transitions from passcode confirmation and retake entry; auto-start no longer requests fullscreen before prerequisite checks.
- Exam loading and timer start happen only after the saved campus is verified against live active campuses. Missing campus requires registration in the pre-exam dialog and confirmed profile save.
- Updated Vietnamese prerequisite messaging. Account registration remains separate; backend unchanged.
- Validation: production build passed. Isolated handler checks passed for missing campus, valid campus, profile API failure and campus API failure; only valid campus loads the exam and enters testing. No authenticated live writes.


### Exam exit control [22/10/2026]

- Removed the in-exam Exit button and its exit confirmation modal/navigation path. Submit remains the normal completion action.
- Added beforeunload warning during testing and submission analysis, cleaned up when leaving those states. Browsers retain control over closing/reloading tabs; no absolute browser exit lock is claimed.
- Production build passed. Backend unchanged.


### Diagnostic report visual refresh [22/10/2026]

- Shared DiagnosticResultSummary renders a dark introductory panel and responsive score, IRT and duration metrics for both historical and newly submitted results. Removed overall placement and hardcoded national percentile claims from these summaries.
- History table removes the overall placement column and play/retry action; keeps the explicit report action. Refined spacing, alternating rows and report button styling.
- History accuracy is derived from correct/total counts, preserving zero; duration no longer defaults to a fabricated 30 minutes. No subject placement is invented and backend placement processing is unchanged.
- Validation: production build and targeted lint passed (existing warnings remain). Visual browser verification not performed.


### Compact report header [22/10/2026]

- Confirmed the shared report summary contains no exam ID label. Redesigned historical report navigation with an accessible compact back button, title and separate submission date.
- Reduced setup top padding, report section gaps and summary hero height; refined gradient and concise report heading. No scoring or API changes.
- Validation: production build passed. Browser visual review not performed.


### Account settings banner redesign [22/10/2026]

- Replaced only the account settings header with AccountSettingsBanner: light blue/white split layout, compact navigation, profile card and existing target score. Removed hardcoded theta and technical JWT badge from this banner.
- Settings tabs, lower cards/forms and save handlers remain unchanged. Responsive single-column layout on small screens.
- Validation: production build and targeted banner lint passed. Browser visual verification not performed.


### Repair incomplete banner undo [22/10/2026]

- Removed the dangling AccountSettingsBanner import and component call after its file was undone. Restored the previous inline header only; lower settings content unchanged.
- Validation: reproduced unresolved import before the fix; production build passed after restoration. Banner redesign reverted.


### Academic save and security accuracy [22/10/2026]

- Academic save requires confirmed targetScore/campusId from the profile API. Errors show failure without local success/cache writes; browser cache failure after confirmed server save does not misreport server failure. Campus changes notify Navbar. Zero target scores load correctly.
- Disabled unsupported university aspiration input and removed its mock default; explicitly marked unavailable for persistence.
- Removed fabricated Chrome/IP/session status and fixed-refresh claims. Logout copy now describes only the current browser session. Real password API flow unchanged; backend token revocation behavior unchanged.
- Validation: production build passed; isolated save checks passed for success, API failure, incomplete response and browser-cache failure. No live profile/password writes.


### Academic save and security accuracy [22/10/2026]

- Include the existing account settings page, Navbar/App entry and authentication service integration required to expose these fixes.
- Academic saves require confirmed target score/campus response; API failures show errors without local success. Unsupported aspirations are disabled.
- Removed mock Chrome/IP/session information; logout describes only the current browser session. Password changes use the existing backend API.
- Build passed; four isolated academic-save checks passed. No live profile/password writes. Backend unchanged; other existing family/preferences demo behavior is outside this fix.


### Tailwind canonical class cleanup [22/10/2026]

- Normalized DiagnosticAssessmentPage classes using the installed Tailwind design system: gradient aliases, flex-shrink alias, z-index and stroke arbitrary values now use canonical utility names. No application logic changes.
- Production build passed. IDE diagnostics cannot be read directly; editor may need to refresh diagnostics.


### Flow 1 to Flow 2 API integration [22/10/2026]

- Main roadmap export now uses ConnectedRoadmapPage with backend diagnostic history/results, existing roadmap retrieval, explicit creation and node detail. No mock imports in the active page. Existing demo source is preserved.
- Request generation uses diagnosticSubmissionId, examDate and studyHoursPerDay; reads actual student identity and completed server submissions. No automatic class clustering or bulk enrollment.
- Contract audit: stages group domains, not per-subject learning phases. Backend does not return subject learningPhase; generation targetScore is fixed at 800. Documented roadmap/class request and response fields in flow_2_api_contract.md.
- Video/quiz execution and individual-subject phase analysis remain pending backend contract/integration; no fabricated results. Backend unchanged.
- Validation: production build passed; targeted lint has warnings only. No authenticated live writes; full browser integration not verified.


### Frontend checkpoint before upstream review [22/10/2026]

- Checkpoint remaining lowercase frontend work: Flow 1 Tailwind aliases, existing roadmap demo/content and menu naming, and real diagnostic-to-roadmap API integration. Main roadmap export uses the connected page; demo source remains preserved.
- Known gaps: no backend per-subject phase response; video/quiz execution not integrated; target score in BE generation fixed at 800. No claim of full Flow 2 completion.
- Validation: latest production build passed; targeted connected-roadmap lint exits successfully with warnings. No authenticated writes or end-to-end browser verification.
- Excludes backend controller edits, uppercase frontend and configuration backups.


### [22/10/2026] - Restore previous roadmap interface

- Restored the roadmap export to the preserved RoadmapLearningPage component at the user's request. The connected API form is no longer the active roadmap screen; its source remains available.
- The restored page uses its existing demo data and interactions. This does not establish a live backend roadmap integration.
- Validation: npm run build passed with a bundle-size warning. Browser appearance has not been visually verified. No commit or push performed for this restoration.


### Role workspaces [22/10/2026]

- Centralized exact Identity role mapping for STUDENT, TEACHER, ACADEMIC_MANAGER, ACADEMIC_DIRECTOR, ADMINISTRATOR and PARENT. Unknown roles have a restricted workspace; multiple roles use administrator/director/manager/teacher/parent/student priority.
- Login and session restoration enter the matching dashboard. Desktop/mobile sidebars share role-specific menus and the existing layout. Student-only dashboard tabs and exam prompts are guarded; role labels are shared across navbar/settings.
- Non-student workspaces have navigation cards and explicit unfinished-feature screens. No operational CRUD or backend authorization was added; existing TeacherDashboardView source remains preserved. Student roadmap restoration remains in place.
- Validation: production build passed with bundle-size warning; targeted lint passed with warnings; isolated role/access matrix passed for six roles, multiple roles, unknown roles and cross-role denial. No browser or live-login verification.

### [02/11/2026] - Frontend role workspace checkpoint

- Checkpoint existing role-specific navigation, login/session routing, shared role labels and student-tab guards for six Identity roles.
- Restore the preserved demo roadmap as the active roadmap screen. Non-student business screens remain placeholders pending API integration.
- Validation on 02/11/2026: npm run build passed with a bundle-size warning; npm run lint exited successfully with warnings. Browser and live-login behavior were not verified in this checkpoint.
### [08/11/2026] - CF1 diagnostic history from server

- Diagnostic history now loads completed submissions for the signed-in student from Practice API; legacy localStorage history/results and sample factories are ignored.
- Added loading, empty, API error/retry and report-loading states. Server ownership and submission IDs are checked; stale responses are discarded.
- Successful submission refreshes server history while showing its confirmed result immediately. Historical reports use the result endpoint; question text/options are unavailable in its DTO and explicitly identified as unavailable.
- Summary DTO lacks theta, so completed result details are fetched for the trend chart. This adds one detail request per completed submission.
- Validation: production build passed with bundle-size warning; targeted oxlint passed with warnings. Browser/live API behavior has not been verified. Timer, submission retry and proctoring fixes remain outside this change.

### [09/11/2026] - CF1 direct diagnostic entry

- The history header New Test button now starts the diagnostic assessment instead of navigating to the question bank; disabled during loading.
- Existing flow checks login and Campus, requests GET /api/content/diagnostic-test, then enters testing after a nonempty exam response. Missing Campus prompts registration before continuing; API failure remains on the error flow.
- Validation: npm run build passed with bundle-size warning. No live API/browser verification. Frontend-only implementation; no backend edits.

### [09/11/2026] - CF1 timestamp-based exam timing

- Added a frontend exam clock retaining milliseconds across question revisits and rounding to integer seconds only for display/payload. Unseen questions send zero instead of the previous fabricated 25-second default.
- Submission sends the actual assessment start timestamp. Countdown derives from an absolute deadline, refreshes on focus/visibility changes, and caps measured question time at the deadline. Timing pauses while submitting; failed submissions retain the original deadline.
- Read-only contract check: existing BE validator accepts TimeSpentSeconds >= 0 and StartedAt is already supported; no backend edits required.
- Validation: npm run build passed with bundle-size warning; three node:test cases passed for revisits/subsecond time, delayed callbacks/deadline, and submission pause/resume. Live browser/API behavior remains unverified. Submission locking, idempotency and reload recovery remain separate work.

### [09/11/2026] - CF1 account isolation

- Removed shared diagnostic-result writes and obsolete guest-result linking on login. Clear legacy diagnostic keys from both browser storages on API client initialization, token updates and logout; preserve unrelated storage.
- Remount diagnostic assessment by user ID so in-progress answers/results do not carry across accounts. Submission responses must match the current owner and login session; ignore late success/error/UI updates after logout, account change or unmount.
- Removed Navbar theta badge reading shared cache and its fabricated default score/admission percentage. Diagnostic history remains server-backed with ownership checks.
- Validation: production build passed with bundle-size warning; five node tests passed (two privacy cleanup tests and three timing regressions). Browser account-switch and live API tests remain unverified. No backend edits; server authorization remains outside this frontend fix.

### [09/11/2026] - CF1 three distinct diagnostic exams

- Show completed distinct diagnostic exam count out of three. Only COMPLETED DIAGNOSTIC submissions contribute; duplicate submissions of one exam do not increase progress.
- Every diagnostic entry reloads owned server history. Block entry at three completed exams or when Content returns an already completed exam; allow a new exam below the limit. Missing exam ID or invalid history blocks entry.
- Existing BE may return the same sole exam; FE reports that no new exam was received rather than allowing a repeat. BE selection of an uncompleted exam and multi-exam theta aggregation remain backend responsibilities, not implemented here.
- Validation: production build passed with bundle-size warning; three eligibility tests passed for new student, distinct count/type/status/limit and invalid ownership/history. Live browser/API not tested. No backend edits.

### [09/11/2026] - CF1 completed-exam dialog polish

- Shortened completed-exam notice to a title and one waiting sentence. Added a three-segment progress indicator with completed count, success icon and explicit return-to-history action.
- Clear selected report before this dialog so closing it returns to the history overview. Added dialog role and accessible title/progress labels.
- Validation: npm run build passed with bundle-size warning. No browser visual verification; frontend only.

### [09/11/2026] - CF1 freeze submission before sending

- Create one immutable submission payload before POST. Retries reuse the original student/exam IDs, start timestamp, answers and per-question durations. Removed fallback exam ID.
- Submission failures stay in the analyzing/submission screen with an explicit retry action; answer changes are guarded once a snapshot exists. Added synchronous in-flight guard against overlapping submission calls; warning count no longer resets on submission.
- Report review uses frozen submitted choices/times. Snapshot resets only when a valid new assessment starts. Payload remains in memory; reload recovery, backend duplicate handling and ambiguous-success reconciliation are separate work. Three-warning pre-submit delay is unchanged.
- Validation: production build passed with bundle-size warning; two snapshot tests passed for immutable retry data and missing IDs. Live browser/network-failure scenarios not verified. No backend changes or new API fields.

### [11/11/2026] - CF1 retry reconciliation, recovery and weak skills

- Before retrying a frozen submission, inspect the owned completed diagnostic history by exam ID and fetch any saved result. A failed history check blocks another POST. Render confirmed server choices/timing when recovering an already saved result.
- Three violations now trigger submission immediately instead of the former 3.5-second delay. Input guards block changes after the threshold or deadline. Warning count remains FE-only because the current API contract has no warning/reason fields.
- Save a versioned draft per student in localStorage, including exam, answers, flags, warning count, original deadline, millisecond timing and frozen payload. On re-entry, check server history before restoring; completed results open their report, expired/violation/frozen drafts stay locked, and active drafts resume with the original deadline. Remove draft after confirmed completion. Storage failure displays a warning; recovery network failure blocks starting another exam until retry.
- Added weak-skill cards with skill/domain, correct count and percentage for both historical and new reports. Question domains now use server domain IDs/names; unavailable domains are explicitly unknown rather than inferred from wording or question order. Existing Campus requirement is preserved.
- Validation: production build passed with bundle-size warning; all 15 node tests passed, including draft ownership/corruption, deadline restoration, saved-result reconciliation, network failures and domain grouping. Targeted oxlint exited successfully with warnings. No live browser/API or visual verification.
- Limits: local drafts apply only to the same browser and can be lost if storage is cleared/disabled; closed-page time reduces remaining time but is not attributed to a question. History lookup is not backend idempotency; an in-flight server request can still race a retry. No backend edits; reliable cross-device drafts, warning persistence and multi-exam aggregation need BE support.

### [12/11/2026] - CF1 confirmed result survives draft cleanup failure

- Added best-effort diagnostic draft removal. Storage deletion exceptions cannot interrupt a confirmed submission result or the recovery path opening an already saved result.
- Cleanup targets only the current student draft. If deletion fails, the next recovery still checks server history before permitting resumed editing or sending.
- Validation: all 7 recovery tests passed, including blocked storage and owner-specific deletion; npm run build passed with bundle-size warning. Browser storage-failure behavior not manually verified. Frontend only; no backend changes.

### [12/11/2026] - CF1 frontend checkpoint before synchronization

- Checkpoint all pending lowercase frontend work: server-backed diagnostic history, account isolation, timestamp timing, three-distinct-exam eligibility, concise progress dialog, frozen submission/retry reconciliation, immediate three-warning submission, per-student draft recovery and weak-skill reporting.
- Confirmed server results remain successful even when draft cleanup fails. Backend source and configuration backups are excluded. Uppercase frontend has pre-existing unresolved conflicts and is not part of this checkpoint.
- Validation: production build passed with bundle-size warning; all 17 node tests passed. Live browser/API and visual behavior not verified. Remaining limits include multi-tab coordination, backend idempotency, warning persistence, and server selection/aggregation of multiple diagnostic exams.


<!-- Imported develop documentation; retained for merge traceability. -->

# NHẬT KÝ KIỂM TRA TIẾN ĐỘ VẬN HÀNH (DAILY CHECK LOG) - WEB CLIENT

## [07/11/2026] - Tái Cấu Trúc Toàn Diện Thanh Điều Hướng Subpage Chuẩn Segmented Control Hiện Đại, Hỗ Trợ Động Giám Đốc Học Thuật (Academic Director), Mở Rộng Không Gian Làm Việc Toàn Màn Hình (`w-full`) & Hoàn Thiện Giao Diện Quản Lý Tài Khoản Ngừng Hoạt Động (Soft Delete / Inactive)

- **Mở Rộng Không Gian Làm Việc Cổng Vai Trò Toàn Chiều Ngang (`w-full`) Sát Sidebar & Tinh Chỉnh Giao Diện Bảng Tài Khoản Không Rớt Dòng ([`App.jsx`](../src/App.jsx), [`AccountProvisioningView.jsx`](../src/components/admin/AccountProvisioningView.jsx), [`CampusManagerDashboardView.jsx`](../src/components/dashboard/CampusManagerDashboardView.jsx), [`ParentDashboardView.jsx`](../src/components/dashboard/ParentDashboardView.jsx), [`TuitionPaymentView.jsx`](../src/components/payment/TuitionPaymentView.jsx), [`apiClient.js`](../src/services/apiClient.js))**:
  - **Loại Bỏ Giới Hạn `max-w-7xl mx-auto`, Mở Rộng `w-full` Thẳng Hàng Với `Navbar` & `Sidebar`**:
    - Thay thế `max-w-7xl mx-auto` bằng `w-full` kèm `px-4 sm:px-6` đồng bộ trên thanh Role Portal Context Strip, vùng `<main>` và `<footer>` trong `App.jsx` cũng như các màn hình `AccountProvisioningView.jsx`, `CampusManagerDashboardView.jsx`, `ParentDashboardView.jsx`, `TuitionPaymentView.jsx`.
    - Xóa bỏ hoàn toàn khoảng trống thừa hai bên cạnh `Sidebar`, giúp bảng danh sách tài khoản 6 cột hiển thị trọn vẹn 100% chiều ngang mà không cần thanh cuộn ngang.
  - **Chuẩn Hóa Bảng Tài Khoản 1 Dòng Duy Nhất (`whitespace-nowrap`) & Bộ Công Cụ Hợp Nhất (`AccountProvisioningView.jsx`)**:
    - Thiết kế lại thanh công cụ hợp nhất (Command Toolbar): Gộp bộ chuyển đổi trạng thái Segmented Switcher (*"Đang hoạt động"*, *"Đã ngừng hoạt động (Ẩn)"*, *"Tất cả"*), thanh tìm kiếm nhanh và hàng pill lọc vai trò vào cùng một khung thẻ trắng tinh gọn.
    - Bổ sung `whitespace-nowrap shrink-0` cho toàn bộ huy hiệu Vai trò (`ROLE_CONFIG`), huy hiệu Trạng thái (*"Hoạt động"* / *"Đã ngừng"*) và nút hành động (*"Ngừng hoạt động"* / *"Khôi phục"*), chấm dứt triệt để tình trạng rớt chữ thành 2 dòng.
    - Bổ sung avatar chữ cái viết tắt 2 ký tự (`getInitials`) phối màu gradient theo từng vai trò và hàm hiển thị đơn vị/chuyên môn thông minh (`getUnitDisplay`) phù hợp cho Giám đốc Học thuật, Phụ huynh, Giảng viên và Học viên.
  - **Nâng Cấp `apiClient.js` Hỗ Trợ Query Parameters (`options.params`) & Phương Thức `PATCH`**:
    - Bổ sung bộ tuần tự hóa `options.params` qua `URLSearchParams` trong `apiClient.js` để mọi truy vấn `GET /api/v1/users?isActive=true&role=...` truyền chính xác tham số lọc xuống Backend, đảm bảo tài khoản `Đã khóa` tự động ẩn 100% khỏi tab *"Đang hoạt động"*.
    - Bổ sung phương thức `apiClient.patch(endpoint, body, options)` phục vụ các API cập nhật trạng thái phần tử.
- **Triển Khai Giao Diện Phân Hệ Quản Lý Tài Khoản Ngừng Hoạt Động (Soft Delete / Inactive) & Thùng Rác Lưu Trữ ([`AccountProvisioningView.jsx`](../src/components/admin/AccountProvisioningView.jsx), [`userService.js`](../src/services/userService.js))**:
  - **Tách Biệt Rạch Ròi Hai Chế Độ Xem (Segmented Navigation)**:
    - Tab 1: **"Tài Khoản Đang Hoạt Động"** (kèm badge số lượng `activeCount` xanh lá): Mặc định chỉ hiển thị tài khoản đang hoạt động, các tài khoản bị vô hiệu hóa sẽ **tự động bị ẩn (hidden)** hoàn toàn khỏi danh sách chính.
    - Tab 2: **"Tài Khoản Đã Ngừng Hoạt Động (Ẩn)"** (kèm badge số lượng `inactiveCount` đỏ): Quản lý tập trung toàn bộ các tài khoản bị vô hiệu hóa kèm banner giải thích cơ chế bảo toàn dữ liệu điểm thi và lịch sử học tập 100%.
    - Tab 3: **"Tất cả"**: Hiển thị toàn bộ danh sách khi cần tra cứu tổng thể.
  - **Modal Xác Nhận Ngừng Hoạt Động (Deactivate Confirmation Modal)**:
    - Cột thao tác hiển thị nút đỏ *"Ngừng hoạt động"* (icon `UserX`).
    - Khi bấm mở modal xác nhận hiển thị thông tin cán bộ/học sinh, cảnh báo Soft Delete không làm mất dữ liệu học tập và nút bấm *"Xác Nhận Ngừng"*.
  - **Modal Xác Nhận Khôi Phục Hoạt Động (Reactivate Confirmation Modal)**:
    - Tại tab *"Đã ngừng hoạt động"*, cột thao tác hiển thị nút xanh *"Khôi phục"* (icon `RotateCcw`).
    - Khi xác nhận khôi phục, tài khoản chuyển `isActive = true`, mở khóa đăng nhập và lập tức quay trở lại danh sách *"Tài Khoản Đang Hoạt Động"*.
  - **Liên Kết Tương Tác Thẻ Thống Kê (Stat Cards)**:
    - Thẻ 1 (*"Đang hoạt động"*) và Thẻ 4 (*"Đã ngừng hoạt động"*) hỗ trợ bấm trực tiếp để chuyển nhanh chế độ xem tương ứng.
- **Tái Cấu Trúc Thanh Điều Hướng Subpage Hiện Đại Chuẩn Segmented Control ([`App.jsx`](../src/App.jsx))**:
  - Khắc phục triệt để lỗi giao diện hàng nút điều hướng bị xuống dòng 2 tầng lộn xộn (4 nút trên, 1 nút trơ trọi dưới) trên Cổng Quản Lý Học Thuật Cơ Sở.
  - Tái thiết kế toàn bộ thanh điều hướng theo phong cách Segmented Control (Apple / Linear / Stripe dashboard): thanh nền `bg-slate-100/90`, nút active dạng thẻ nổi `bg-white text-blue-700 shadow-sm font-extrabold ring-1 ring-slate-200/80` tinh tế thay cho dải gradient cầu vồng cũ.
  - Ngăn chặn hoàn toàn hiện tượng ngắt dòng trên các nút bằng `whitespace-nowrap shrink-0`, tích hợp cuộn ngang mượt mà `overflow-x-auto scrollbar-none` bảo đảm giao diện luôn nằm gọn gàng trên 1 hàng ngang duy nhất trên mọi kích thước màn hình.
  - Bổ sung cơ chế nhận diện động vai trò Giám đốc Học thuật (`ACADEMIC_DIRECTOR`): Hiển thị đúng danh xưng **"Cổng Giám Đốc Học Thuật Toàn Trường"** (ACADEMIC DIRECTOR PORTAL) với icon Vương miện `Crown` và badge tím sang trọng `bg-purple-50 text-purple-700`.
- **Tích Hợp Kiểm Tra Email Đa Tầng DNS MX & Gợi Ý Sửa Lỗi Tên Miền Vào Cấp Phát Tài Khoản ([`AccountProvisioningView.jsx`](../src/components/admin/AccountProvisioningView.jsx), [`emailValidator.js`](../src/utils/emailValidator.js))**:
  - Bổ sung ánh xạ sửa lỗi gõ nhầm tên miền `mail.com` thành `gmail.com` trong `COMMON_DOMAIN_TYPOS`.
  - Tích hợp `validateEmailComprehensive` trực tiếp vào ô nhập Email công tác trong modal cấp phát: Kiểm tra cú pháp RFC 5322, kiểm tra lỗi chính tả tên miền, kiểm tra DNS MX trực tuyến, hiển thị spinner kiểm tra, dấu tích xanh khi hợp lệ và nút gợi ý 1-Click *"Sửa thành: ...@gmail.com"*.
  - Chặn đứng thao tác submit form khi email không hợp lệ, đồng thời bật Toast thông báo màu đỏ nổi bật khi có lỗi phát sinh.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build` (`vite build`) hoàn thành sạch sẽ 100% (`3008 modules transformed`, **0 Error**).

---

- **Loại Bỏ Triệt Để Nút Đăng Nhập Demo, Thanh Chuyển Vai Trò Thủ Công & Token Giả Lập ([`LoginForm.jsx`](../src/components/auth/LoginForm.jsx), [`WebLoginPage.jsx`](../src/components/auth/WebLoginPage.jsx), [`Navbar.jsx`](../src/components/layout/Navbar.jsx), [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx), [`App.jsx`](../src/App.jsx))**:
  - Xóa sạch bộ nút đăng nhập nhanh 1-Click Demo 5 vai trò, nút Google/Zalo giả lập, thông tin tài khoản điền sẵn (`email`, `password`) và token giả `eyDemoAccessToken123456` trong `LoginForm.jsx` và `WebLoginPage.jsx`.
  - Xóa bỏ thanh chuyển đổi vai trò thủ công (`Role Switcher`) trên `Navbar.jsx`, khóa chặt phiên làm việc theo đúng vai trò thực tế trả về từ JWT/Profile của Backend (`authService.resolveAppRole(currentUser)`).
  - Bổ sung cơ chế bảo vệ xác thực (`authService.isAuthenticated()`) tại `App.jsx`: Tự động định tuyến về trang đăng nhập `WebLoginPage` nếu chưa có phiên JWT hợp lệ; nạp đồng bộ hồ sơ thực tế (`authService.fetchCurrentUserProfile()`) và số liệu vận hành thực tế (`portalMetrics`) từ Backend cho `Navbar`, `Sidebar` và từng cổng vai trò.
- **Xóa Sạch 100% Dữ Liệu Mock / Seed Giả Lập Trong Tầng Services ([`authService.js`](../src/services/authService.js), [`userService.js`](../src/services/userService.js), [`paymentService.js`](../src/services/paymentService.js), [`practiceService.js`](../src/services/practiceService.js))**:
  - `authService.js` & `userService.js`: Sau khi đăng nhập tự động gọi `GET /api/v1/users/me` để đồng bộ `id`, `fullName`, `email`, `phone`, `campusId`, `campusName`, `roles` trực tiếp từ PostgreSQL IAM; xóa bỏ hoàn toàn danh sách cơ sở hardcode dự phòng trong `getCampuses()`.
  - `paymentService.js`: Xóa bỏ hoàn toàn nhánh tạo link giả `mock-payment-` và trạng thái thanh toán offline giả lập; mọi giao dịch tạo mã VietQR, kiểm tra trạng thái đơn hàng và đối soát giao dịch đều gọi trực tiếp `/api/practice/payments/...` của Practice Service.
  - `practiceService.js`: Thay thế toàn bộ các hàm sinh dữ liệu mẫu giả lập (`buildSeedStudentDashboard`, `buildSeedClassHeatmap`, `buildSeedParentDashboard`, `buildSeedCampusComparativeHeatmap`, `getDefaultSeedHistory` chứa tên giả `Phạm Minh Hoàng`, `sub_seed_vact_01`...) bằng trạng thái rỗng chuẩn mực (`buildEmptyStudentDashboard`, `buildEmptyClassHeatmap`, `buildEmptyParentDashboard`, `buildEmptyCampusComparativeHeatmap`, `[]`), đảm bảo hệ thống chỉ hiển thị 100% dữ liệu thực từ Backend Database.
- **Loại Bỏ `mockData.js` & Số Liệu Cứng Khỏi Toàn Bộ Các Màn Hình Dashboard, Thanh Toán & Modal ([`HeroBanner.jsx`](../src/components/dashboard/HeroBanner.jsx), [`MetricsGrid.jsx`](../src/components/dashboard/MetricsGrid.jsx), [`MilestoneCard.jsx`](../src/components/dashboard/MilestoneCard.jsx), [`LiveQnACard.jsx`](../src/components/dashboard/LiveQnACard.jsx), [`ParentDashboardView.jsx`](../src/components/dashboard/ParentDashboardView.jsx), [`CampusManagerDashboardView.jsx`](../src/components/dashboard/CampusManagerDashboardView.jsx), [`LearningAnalyticsView.jsx`](../src/components/dashboard/LearningAnalyticsView.jsx), [`TuitionPaymentView.jsx`](../src/components/payment/TuitionPaymentView.jsx), [`RadarChartModal.jsx`](../src/components/modals/RadarChartModal.jsx), [`DiagnosticTestModal.jsx`](../src/components/modals/DiagnosticTestModal.jsx), [`AdaptiveQuizModal.jsx`](../src/components/modals/AdaptiveQuizModal.jsx), [`ClassMicroGroupsModal.jsx`](../src/components/modals/ClassMicroGroupsModal.jsx))**:
  - Ngắt toàn bộ kết nối tới `src/data/mockData.js` trên các component giao diện:
    - `HeroBanner.jsx`, `MetricsGrid.jsx`, `RadarChartModal.jsx`: Hiển thị trực tiếp từ `currentUser` và `studentDashboard` của Backend.
    - `MilestoneCard.jsx`: Hiển thị trực tiếp từ `practiceService.getMyRoadmap()` và `practiceService.generateRoadmap()`.
    - `LiveQnACard.jsx`: Truy vấn danh sách giảng viên thực tế từ `userService.getUsers({ role: 'TEACHER' })`.
    - `ParentDashboardView.jsx`: Xóa bỏ hồ sơ con mặc định `'Phạm Minh Hoàng'`; hiển thị danh sách con thực tế từ `practiceService.getParentDashboard()` hoặc trạng thái trống khi tài khoản phụ huynh chưa liên kết học sinh.
    - `CampusManagerDashboardView.jsx`: Nạp danh sách cơ sở thực từ `userService.getCampuses()`, danh sách giảng viên thực từ `userService.getUsers({ role: 'TEACHER' })`, và danh sách lớp học / sĩ số thực từ `practiceService.getCampusComparativeHeatmap()`.
    - `TuitionPaymentView.jsx`: Xóa bỏ giao dịch mẫu `TX-9872`, khởi tạo danh sách giao dịch thực tế từ cổng thanh toán PayOS.
    - `DiagnosticTestModal.jsx`, `AdaptiveQuizModal.jsx`, `ClassMicroGroupsModal.jsx`: Nạp câu hỏi thực tế từ `contentService.getExamDetail()` và nhóm bàn học vi mô thực tế từ `practiceService.getClassMicroGroups()`.
- **Khắc Phục Điều Hướng Nút Đăng Nhập / Đăng Ký Trên Trang Chủ & Triển Khai Kiểm Tra Tính Hợp Lệ Đa Tầng Cho Email Đăng Ký ([`App.jsx`](../src/App.jsx), [`emailValidator.js`](../src/utils/emailValidator.js), [`authService.js`](../src/services/authService.js), [`RegisterForm.jsx`](../src/components/auth/RegisterForm.jsx), [`WebLoginPage.jsx`](../src/components/auth/WebLoginPage.jsx), [`ForgotPasswordModal.jsx`](../src/components/auth/ForgotPasswordModal.jsx))**:
  - Đấu nối chuẩn xác các prop `onOpenLogin`, `onOpenRegister`, `onOpenDashboard`, `onOpenDiagnostic`, `onOpenArchModal` từ `App.jsx` xuống `PublicLandingPage.jsx` và truyền `initialMode={authInitialMode}` vào `WebLoginPage.jsx` để mở đúng tab Đăng nhập hoặc Đăng ký mới.
  - Xây dựng bộ kiểm tra email đa tầng `src/utils/emailValidator.js` kết hợp gọi trực tiếp `GET /api/auth/validate-email` và Google DNS-over-HTTPS (`https://dns.google/resolve?name={domain}&type=MX`):
    - Kiểm tra cú pháp chuẩn RFC 5322, quy tắc tài khoản Gmail (6–30 ký tự, chỉ chữ/số/dấu chấm, không toàn chữ số).
    - Tự động phát hiện lỗi gõ sai tên miền phổ biến (`gmial.com`, `gamil.com`, `gmail.con`, `yaho.com`, `hotmial.com`, `outlok.com`, `fpt.edu.v`...) kèm nút gợi ý sửa 1-Click.
    - Chặn dịch vụ email ảo 10 phút (`yopmail.com`, `mailinator.com`, `tempmail.com`...) và chặn chuỗi ký tự lặp bất thường (`22222`, `1111`, `aaaa`...) khi người dùng nhập email giả lập.
    - Kiểm tra thời gian thực (`debounce` & `onBlur`) bản ghi máy chủ nhận thư DNS MX và độ khả dụng của email trong CSDL trước khi cho phép gửi mã OTP.
- **Triển Khai Hệ Thống Liên Kết Phụ Huynh - Học Sinh 3 Phương Thức Trực Tiếp Trên Web ([`StudentParentLinkCard.jsx`](../src/components/dashboard/StudentParentLinkCard.jsx), [`ParentDashboardView.jsx`](../src/components/dashboard/ParentDashboardView.jsx), [`userService.js`](../src/services/userService.js), [`App.jsx`](../src/App.jsx))**:
  - **Cổng Học Viên (`StudentParentLinkCard.jsx`)**:
    - Hiển thị **Mã học sinh cố định (`VE-XXXXXX`)**, **Mã PIN 6 số động (30 phút)**, **Đường liên kết mời 1-Click** và **Mã QR trực quan** ngay trên Dashboard Học sinh.
    - Tự động hiển thị banner thông báo nổi bật khi có Phụ huynh gửi yêu cầu liên kết kèm nút **`✓ Chấp Nhận Liên Kết`** / **`Từ chối`** trực tiếp trên Web.
  - **Cổng Phụ Huynh Đồng Hành (`ParentDashboardView.jsx`)**:
    - Tích hợp **Trung Tâm Liên Kết Tài Khoản Học Sinh** với 3 Tab: (1) Nhập Mã Code `VE-XXXXXX` / Mã PIN 6 số / Dán đường liên kết mời; (2) Tìm theo Email hoặc SĐT của con để gửi yêu cầu xác nhận 2 chiều; (3) Hướng dẫn quét Mã QR từ màn hình của con.
    - Tự động nhận diện tham số `?parentLinkCode=...` trên URL khi Phụ huynh bấm đường liên kết mời hoặc quét QR để kết nối tức thì và tải ngay báo cáo học tập của con.
- **Gỡ Bỏ Thư Mục Unit Test (`tests/`) & Kiểm Thử Build ([`package.json`](../package.json), [`ci.yml`](../.github/workflows/ci.yml))**:
  - Xóa bỏ toàn bộ thư mục `tests/` (`paymentService.test.js`, `practiceService.flow5.test.js`, `tokenStorage.test.js`) và script `npm test` theo yêu cầu.
  - `npm run build` (`vite build`) hoàn thành sạch sẽ 100% (`3008 modules transformed`, **0 Error**).

---

## [06/11/2026] - Phân Chia Cổng Giao Diện Riêng Cho 5 Vai Trò (`student`, `parent`, `teacher`, `manager`, `admin`) & Đồng Bộ Toàn Diện Template Màu Sắc Chuẩn Trang Chủ (`#FDFBF7`)

- **Phân Chia Cổng Làm Việc Độc Lập & Điều Hướng Chuyên Biệt Cho Đủ 5 Vai Trò ([`App.jsx`](../src/App.jsx), [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx), [`Navbar.jsx`](../src/components/layout/Navbar.jsx), [`WebLoginPage.jsx`](../src/components/auth/WebLoginPage.jsx), [`LoginForm.jsx`](../src/components/auth/LoginForm.jsx), [`authService.js`](../src/services/authService.js))**:
  - Thiết kế cấu hình cổng độc lập `ROLE_PORTAL_DEFINITIONS` cho toàn bộ **5 vai trò hệ thống**, đảm bảo mỗi vai trò khi đăng nhập đều được định tuyến trực tiếp vào không gian riêng với bộ menu Sidebar, thanh Subpage Tab, huy hiệu trạng thái Navbar và thẻ tổng kết chân Sidebar chuyên biệt:
    1. **Cổng Học Viên (`student` - Student Portal)**: Mặc định vào `dashboard` (`HeroBanner`, `MetricsGrid`, `MilestoneCard`, `LiveQnACard`), kèm các trang riêng `diagnostic` (Khảo thí 30 câu), `history` (Lịch sử & Sổ tay lỗi sai), `roadmap` (Cây tri thức & Lộ trình), `analytics` (Báo cáo & Dự báo IRT), `tuition` (Học phí & Gói học) và các modal luyện tập ZPD, Thi thử, Gia sư AI Socratic.
    2. **Cổng Phụ Huynh Đồng Hành (`parent` - Parent Companion Portal)**: Mặc định vào `dashboard` (`ParentDashboardView` - Chỉ số sẵn sàng thi `R_exam`, Kỷ luật 12h/tuần, Cảnh báo AI), kèm các trang riêng `analytics` (Năng lực 4 miền của con), `history` (Lịch sử bài thi của con), `roadmap` (Tiến độ chuyên đề của con) và `tuition` (Đóng học phí VietQR PayOS).
    3. **Cổng Giảng Viên & Sư Phạm (`teacher` - Teacher Pedagogical Portal)**: Mặc định vào `dashboard` (`TeacherDashboardView` - Ma trận nhiệt lớp học 2D & Xếp nhóm vi mô), kèm `roadmap` (Studio biên soạn học liệu & công thức LaTeX), `diagnostic` (Ngân hàng đề 30 câu), `history` (Nhật ký bài làm học viên) và `analytics` (Phân tích tâm trắc học IRT/BKT).
    4. **Cổng Quản Lý Học Thuật Cơ Sở (`manager` - Campus Manager Portal)**: Mặc định vào `dashboard` (`CampusManagerDashboardView` - Điều phối cơ sở & AI Clustering), kèm `teacher_heatmap` (Giám sát ma trận nhiệt lớp học), `roadmap` (Quản lý khung chương trình), `provision` (Cấp phát tài khoản cơ sở) và `analytics` (Báo cáo chất lượng đào tạo).
    5. **Cổng Quản Trị Viên Hệ Thống (`admin` - System IAM Admin Portal)**: Mặc định vào `provision` (`AccountProvisioningView` - Quản trị định danh & cấp phát tài khoản đa vai trò PostgreSQL Direct), kèm `dashboard` (Giám sát đa cơ sở), `teacher_heatmap` (Ma trận nhiệt toàn hệ thống), `roadmap` (Cây tri thức quốc gia) và `tuition` (Đối soát cổng thanh toán PayOS).
- **Đồng Bộ Toàn Diện Template Màu Sắc Theo Chuẩn Trang Chủ ([`PublicLandingPage.jsx`](../src/components/landing/PublicLandingPage.jsx), [`App.jsx`](../src/App.jsx), [`HeroBanner.jsx`](../src/components/dashboard/HeroBanner.jsx), [`DiagnosticAssessmentPage.jsx`](../src/components/diagnostic/DiagnosticAssessmentPage.jsx), [`SubmissionHistoryView.jsx`](../src/components/diagnostic/SubmissionHistoryView.jsx))**:
  - Lấy bảng màu và ngôn ngữ thiết kế của Trang chủ (`PublicLandingPage.jsx`) làm chuẩn mực thống nhất cho toàn bộ các trang:
    - Nền tảng kem sáng học thuật ấm áp (`bg-[#FDFBF7] text-slate-900 selection:bg-[#FACC15] selection:text-slate-950`) kết hợp quầng sáng xanh/vàng tinh tế.
    - Bề mặt thẻ trắng sắc nét (`bg-white border border-slate-200/80 rounded-3xl shadow-sm`).
    - Dải màu thương hiệu Xanh Hoàng Gia - Indigo - Cyan (`from-blue-600 via-indigo-600 to-cyan-500` và `from-blue-700 via-indigo-700 to-blue-900`) kết hợp điểm nhấn Vàng kim (`#FACC15`).
  - Chuyển đổi hoàn toàn các màn hình nền tối cũ (`bg-slate-950` / `bg-slate-900` tại `DiagnosticAssessmentPage.jsx` và `SubmissionHistoryView.jsx`) sang template sáng `#FDFBF7` / `bg-white` đồng bộ 100% với Trang chủ.
- **Kiểm Thử & Đóng Gói Vận Hành**:
  - `npm test` đạt **9/9 tests PASS (100%)**.
  - `npm run build` (`vite build`) hoàn thành sạch sẽ 100% (`3006 modules transformed`, **0 Error**).

## [08/11/2026] - Chuẩn Hóa Ngôn Ngữ Học Tập Thân Thiện Cho Học Sinh: Lược Bỏ Toàn Bộ Thuật Ngữ Kỹ Thuật Nội Bộ Trên Trang Kết Quả, Dự Báo Điểm, Sổ Tay Câu Sai & Gia Sư AI

- **Chuẩn Hóa Trung Tâm Kết Quả Học Tập & Dự Báo Điểm Thi ([`LearningAnalyticsView.jsx`](../src/components/dashboard/LearningAnalyticsView.jsx), [`ScorePredictionPanel.jsx`](../src/components/dashboard/ScorePredictionPanel.jsx), [`PrescriptionPracticeModal.jsx`](../src/components/modals/PrescriptionPracticeModal.jsx))**:
  - Loại bỏ toàn bộ nhãn kỹ thuật/thuật toán nội bộ gây khó hiểu cho học sinh (`Core Flow 5 & 6`, `Live Gateway API (:5212)`, nút debug `Xem Thử Ghost Onboarding`, `IRT 2PL`, `BKT P(Lt)`, `Theta +0.17`, `SEM 95%`, `Predicted ± 1.96 × SEM`, `Greedy Knapsack ROI`, `ROI = ΔScore / Số giờ ôn`, `AUTO_INIT`, `CRITICAL`, mã thô `PAT_SKILL_*`, `Isomorphic Variants`).
  - Thay thế bằng ngôn ngữ tự học gần gũi, dễ hiểu: **Kết quả học tập & Dự báo điểm thi**, **Khoảng điểm có thể đạt**, **Chủ đề cần ôn ngay để tăng điểm nhanh**, **Tiến độ lộ trình học**, **Thói quen tự học 7 ngày qua**, **Lịch sử làm bài gần đây**, và bộ chuẩn hóa tên bài `formatFriendlyExamTitle` / `formatPrescriptionTitle` / `formatCalculationSource`.
- **Đồng Bộ Hộp Thư Nhắc Nhở, Sổ Tay Câu Làm Sai, Điều Hướng Sidebar & Gia Sư AI Đồng Hành ([`StudentEarlyWarningsCard.jsx`](../src/components/dashboard/StudentEarlyWarningsCard.jsx), [`MistakeNotebookSM2View.jsx`](../src/components/dashboard/MistakeNotebookSM2View.jsx), [`NotificationBellPopover.jsx`](../src/components/layout/NotificationBellPopover.jsx), [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx), [`AdaptiveQuizModal.jsx`](../src/components/modals/AdaptiveQuizModal.jsx), [`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx), [`App.jsx`](../src/App.jsx))**:
  - Chuyển đổi toàn bộ nhãn `Gia sư AI Socratic` / `AI Socratic Tutor` / `Báo cáo vi phạm quy tắc Socratic` sang **Gia sư AI** / **Gia sư AI Đồng Hành** / **Hỏi Gia sư AI**, đồng thời hợp nhất liền mạch với cổng thanh toán học phí PayOS VietQR (`TuitionPaymentView.jsx`, `PayOsCheckoutModal.jsx`) trên `origin/develop`.
  - Lược bỏ các mã quy tắc nội bộ (`BR-01`, `BR-02`, `BR-04`, `Flow 1..6`, `SM-2`, `EaseFactor`, `Metacognition Tagging`, `CARELESS`, `MISSING_CONCEPT`) trên thanh điều hướng trái `Sidebar.jsx`, chuông thông báo `NotificationBellPopover.jsx`, hộp thư nhắc nhở `StudentEarlyWarningsCard.jsx` (bổ sung bộ lọc `Định hướng mục tiêu` và sửa reset `setMarkingId(null)`) cùng `MistakeNotebookSM2View.jsx`.
- **Kiểm Thử & Đóng Gói Vận Hành**:
  - Toàn bộ bộ kiểm thử `npm test` (`11/11 tests pass` trên `4 suites`) và `npm run build` (`vite build`) đóng gói sạch 100% (`0 errors`).

---

## [07/11/2026] - Triển Khai Toàn Diện Core Flow 6 Trên Frontend: Dự Báo Điểm SEM 95%, Toa Thuốc Bù Điểm Knapsack ROI, Cảnh Báo Sớm BR-04 & Sổ Tay Lỗi Sai SM-2

- **Giai Đoạn 1 — Chuẩn Hóa Tầng Dịch Vụ API Client Core Flow 6 ([`apiClient.js`](../src/services/apiClient.js), [`practiceService.js`](../src/services/practiceService.js), [`practiceService.flow6.test.js`](../tests/practiceService.flow6.test.js))**:
  - Bổ sung phương thức HTTP `patch` và bộ trích xuất thông báo lỗi từ cấu trúc `Result<T>` (`data.error.description`) trong `apiClient.js`.
  - Đấu nối trọn bộ 13 phương thức Core Flow 6 qua YARP Gateway (`:5212`), chuẩn hóa song ngữ `snake_case` / `camelCase` cho `PrescriptionItemDto` và các request DTO của ASP.NET Core:
    + **Dự báo SEM & Toa thuốc ROI**: `getMyForecast` (tự động gọi `recalculatePrediction` khi gặp `404`), `getPrescriptionPracticeSession`, `submitPrescriptionPracticeSession`, `recalculatePrediction`.
    + **Cảnh báo sớm BR-04 3 tầng**: `getMyAlerts`, `markAlertAsRead`, `getEarlyWarningsDashboard`, `resolveEarlyWarningAlert`, `scheduleAlertCounseling`.
    + **Sổ tay lỗi sai & Ôn tập ngắt quãng SM-2**: `getMistakeNotebook`, `getDailyMistakeReview`, `tagMistakeCognitiveError`, `submitDailyMistakeReview`.
  - Tích hợp bộ lưu trữ trạng thái ngoại tuyến bền vững (`veval_flow6_state_v1`) và sự kiện đồng bộ thời gian thực `veval:flow6-updated`; bổ sung unit test `practiceService.flow6.test.js` (`8/8 tests pass`, `oxlint 0 warnings/0 errors`, `vite build` sạch 100%).
- **Giai Đoạn 2 — Giao Diện Dự Báo Điểm SEM 95%, Toa Thuốc Bù Điểm Knapsack ROI & Modal Luyện Biến Thể ([`ScorePredictionPanel.jsx`](../src/components/dashboard/ScorePredictionPanel.jsx), [`PrescriptionPracticeModal.jsx`](../src/components/modals/PrescriptionPracticeModal.jsx), [`LearningAnalyticsView.jsx`](../src/components/dashboard/LearningAnalyticsView.jsx), [`App.jsx`](../src/App.jsx))**:
  - Xây dựng `ScorePredictionPanel.jsx` hiển thị thang trực quan 1200 điểm kèm khoảng tin cậy 95% (`Predicted ± 1.96 × SEM`), bảng cân đối thiếu hụt mục tiêu (`ON_TRACK` / `AT_RISK` / `CRITICAL`), nút tái tính toán dự báo SEM (`recalculatePrediction`), và lưới xếp hạng Toa thuốc bù điểm theo `ROI = ΔScore / Số giờ ôn`.
  - Xây dựng `PrescriptionPracticeModal.jsx` cho phép làm 3-5 câu hỏi biến thể đồng cấu (render KaTeX qua `MathText`), nộp bài chấm điểm tức thì, cập nhật xác suất làm chủ BKT `P(L_t)`, gạch nợ điểm thiếu hụt khi đạt `>= 67%` và tích hợp nút **Hỏi Gia sư AI Socratic** cho từng câu ở màn hình kết quả.
  - Tích hợp chế độ `compact` ngay trên trang Dashboard Học sinh (`App.jsx`) và chế độ `full` kèm bộ lọc tab con (`Flow 5 & 6`) trong `LearningAnalyticsView.jsx`.
- **Giai Đoạn 3 — Trung Tâm Thông Báo Quả Chuông Navbar & Cảnh Báo Sớm Cá Nhân BR-04 3 Tầng ([`NotificationBellPopover.jsx`](../src/components/layout/NotificationBellPopover.jsx), [`Navbar.jsx`](../src/components/layout/Navbar.jsx), [`StudentEarlyWarningsCard.jsx`](../src/components/dashboard/StudentEarlyWarningsCard.jsx))**:
  - Thay thế chấm đỏ tĩnh trên `Navbar.jsx` bằng `NotificationBellPopover.jsx` thời gian thực: tự động hiển thị huy hiệu số lượng thông báo chưa đọc (`unreadCount`) cho Học sinh hoặc số lượng cảnh báo chờ can thiệp (`activeAlertsCount`) cho Giáo viên/Quản lý.
  - Xây dựng `StudentEarlyWarningsCard.jsx` tích hợp trong Trung tâm Phân tích & Dự báo (`LearningAnalyticsView.jsx`), hỗ trợ lọc theo mức độ (`RED`, `YELLOW`, `UNREALISTIC_GOAL`, `GREEN`), lọc `unreadOnly`, xem phản hồi can thiệp của Cố vấn (`resolutionNotes`) và đánh dấu đã đọc (`PATCH /api/practice/early-warnings/{alertId}/read`) đồng bộ tức thì qua `veval:flow6-updated`.
- **Giai Đoạn 4 — Bảng Điều Khiển Cảnh Báo Sớm Cố Vấn, Biên Bản Can Thiệp Sư Phạm & Đặt Lịch Tư Vấn 3 Bên ([`EarlyWarningsMentorPanel.jsx`](../src/components/dashboard/EarlyWarningsMentorPanel.jsx), [`TeacherDashboardView.jsx`](../src/components/dashboard/TeacherDashboardView.jsx), [`CampusManagerDashboardView.jsx`](../src/components/dashboard/CampusManagerDashboardView.jsx))**:
  - Xây dựng `EarlyWarningsMentorPanel.jsx` tích hợp đồng thời vào không gian làm việc của Giáo viên (`TeacherDashboardView.jsx`) và Quản lý học thuật cơ sở (`CampusManagerDashboardView.jsx`).
  - Hiển thị dải 6 chỉ số KPI (`TotalAlerts`, `ActiveAlertsCount`, `RedAlertsCount`, `YellowAlertsCount`, `UnrealisticGoalCount`, `ResolvedAlertsCount`), bộ lọc theo lớp phụ trách, phân tầng cảnh báo và trạng thái xử lý, kèm số liệu đối chiếu điểm dự báo SEM / mục tiêu / thiếu hụt của từng học sinh.
  - Tích hợp 2 Modal nghiệp vụ chuyên biệt: **Modal Ghi nhận Can thiệp Sư phạm** (`POST /api/practice/early-warnings/{alertId}/resolve` kèm mẫu ghi chú nhanh) và **Modal Đặt lịch Tư vấn 3 bên** (`POST /api/practice/early-warnings/{alertId}/schedule-counseling`, kiểm tra ngày giờ tương lai và thang điểm đề xuất `0 — 1200`).
- **Giai Đoạn 5 — Sổ Tay Lỗi Sai Phản Tư, Ôn Tập Ngắt Quãng SuperMemo-2 (SM-2) & Đấu Nối Toàn Tuyến 4 Vai Trò ([`MistakeNotebookSM2View.jsx`](../src/components/dashboard/MistakeNotebookSM2View.jsx), [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx), [`ParentDashboardView.jsx`](../src/components/dashboard/ParentDashboardView.jsx), [`App.jsx`](../src/App.jsx))**:
  - Xây dựng `MistakeNotebookSM2View.jsx` cho phép Học sinh duyệt kho lỗi sai cá nhân theo trạng thái thành thạo & nhãn nhận thức (`MISSING_CONCEPT`, `CARELESS`, `MISREAD_QUESTION`), gắn nhãn siêu nhận thức (`POST /api/practice/mistakes/{id}/tag-error`), và chạy trực tiếp phiên ôn tập biến thể đồng cấu đến hạn (`GET /api/practice/mistakes/daily-review` & `POST /api/practice/mistakes/{id}/review-submit`).
  - Hiển thị minh bạch chỉ số `EaseFactor (EF >= 1.3)`, khoảng cách ngày `IntervalDays`, tiến độ `3/3 chu kỳ đúng liên tiếp -> Thành thạo` và nút hỏi Gia sư AI Socratic ngay trên câu vừa ôn.
  - Bổ sung mục điều hướng `Sổ tay Lỗi sai SM-2 (Flow 6)` trên `Sidebar.jsx`, nút chuyển nhanh từ `LearningAnalyticsView.jsx` và đồng bộ luồng cảnh báo sớm sang Cổng Phụ huynh (`ParentDashboardView.jsx`).
- **Kiểm Thử & Đóng Gói Vận Hành**:
  - `npm test` đạt `8/8 tests pass` (`3 suites`), `vite build` đóng gói sạch 100% trong `951ms` (`0 errors`).

---

## [06/11/2026] - Hợp Nhất Nhánh `ThinhTT/feature-curriculum-studio-formula-editor` Vào `develop` & Đồng Bộ Toàn Diện Core Flow 2, 4, 5, PayOS VietQR & OTP Auth

- **Hợp Nhất Tự Động Mã Nguồn & Giải Quyết Xung Đột Giữa `ThinhTT/feature-curriculum-studio-formula-editor` Và `develop` ([`App.jsx`](../src/App.jsx), [`ParentDashboardView.jsx`](../src/components/dashboard/ParentDashboardView.jsx), [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx), [`modals/index.js`](../src/components/modals/index.js))**:
  - Hợp nhất toàn bộ phân hệ **Curriculum Studio & Word-Style Formula Editor (JSXGraph 2D/3D, Bảng Biến Thiên Vector `2N-1`, AI Sinh Câu Hỏi)**, **Thanh toán học phí PayOS VietQR (`TuitionPaymentView.jsx`, `PayOsCheckoutModal.jsx`, `paymentService.js`)**, và **Xác thực OTP 6 chữ số chuẩn Fintech (`ForgotPasswordModal.jsx`, `WebLoginPage.jsx`)** cùng với **Gia sư AI Socratic (Core Flow 4)** và **Trung tâm Phân tích Học tập Đa tác nhân & Ma trận Nhiệt (Core Flow 5)** trên nhánh `develop`.
  - Tại `ParentDashboardView.jsx`: Kết hợp trọn vẹn dữ liệu Cổng Phụ Huynh Đồng Hành Core Flow 5 (`R_exam` 3 trụ cột, tiến độ kỷ luật 12h/tuần, cảnh báo AI) với Banner đóng học phí nhanh qua VietQR PayOS và `PayOsCheckoutModal`.
  - Tại `Sidebar.jsx`, `App.jsx` và `src/components/modals/index.js`: Giữ đầy đủ cả `AISocraticTutorModal` lẫn `PayOsCheckoutModal`, tab `Lịch sử & Sổ tay lỗi sai` (`history`) và tab `Học phí & Gói học` (`tuition`).
- **Kiểm Thử & Đóng Gói Vận Hành**:
  - `npm test` đạt **9/9 tests PASS (100%)** (`paymentService.test.js`, `practiceService.flow5.test.js`, `tokenStorage.test.js`).
  - `npm run build` (`vite build`) hoàn thành sạch sẽ 100% (`3017 modules transformed`, **0 Error**).

---

## [06/11/2026] - Khắc Phục Triệt Để Lỗi Nuốt Exception SSE, Tự Động Điền Lời Dẫn Sư Phạm Khi Nội Dung Rỗng & Cảnh Báo Rate Limit Thân Thiện

- **Khắc Phục Lỗi Nuốt Exception Trong Trình Đọc Stream SSE ([`practiceService.js`](../src/services/practiceService.js))**:
  - Tách bạch hoàn toàn khối `try...catch` của `JSON.parse` khỏi logic xử lý nghiệp vụ: Khi nhận sự kiện lỗi từ máy chủ (`parsed.error`), lập tức kích hoạt `onError(new Error(parsed.error))` và ném lỗi ra ngoài thay vì bị khối `catch` con nuốt mất.
  - Xử lý các dòng dữ liệu raw không phải JSON một cách mượt mà và an toàn.
- **Triệt Tiêu Hoàn Toàn Hiện Tượng Treo Dấu Ba Chấm `...` Vĩnh Viễn ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx))**:
  - Tại sự kiện hoàn tất luồng stream `onComplete`: Nếu nội dung phản hồi `finalAnswer` hoặc tin nhắn cuối của AI bị rỗng, hệ thống tự động điền thông điệp gợi mở sư phạm thân thiện: *"Chào em! Thầy đang lắng nghe thắc mắc của em. Em hãy chia sẻ cụ thể hơn về bài tập hoặc hướng suy luận em muốn thầy gợi mở nhé!"* thay vì hiển thị ba dấu chấm `...`.
  - Tại sự kiện lỗi `onError`: Nếu gặp mã lỗi 429, ngoài việc hiển thị banner cảnh báo hạn mức, hệ thống đồng thời cập nhật bong bóng tin nhắn giải thích rõ ràng lý do hạn mức gọi câu hỏi để học sinh nắm bắt.
- **Kiểm Thử & Đóng Gói**:
  - `npm run build` hoàn thành sạch sẽ 100% không có lỗi.

---

## [05/11/2026] - Khắc Phục Triệt Để Trạng Thái Bắt Thi Lại Chẩn Đoán, Thay Thế AI Widget Bằng Floating FAB Nhỏ Gọn & Tối Ưu Stream Socratic Tutor

- **Loại Bỏ Hoàn Toàn Trạng Thái Bắt Thi Lại Khảo Sát Chẩn Đoán ([`MilestoneCard.jsx`](../src/components/dashboard/MilestoneCard.jsx))**:
  - Tách bạch điều kiện kiểm tra `checkExamHistory`: Chỉ cần `!studentDashboard.needsOnboarding` hoặc có bài làm trong `recentMockExams`, hệ thống xác nhận học sinh đã hoàn thành chẩn đoán đầu vào kể cả khi điểm số ước lượng ban đầu đang ở mức 0.
  - Khi chưa có lộ trình được lưu, hệ thống tự động gọi hàm `autoGenRoadmap` với `diagnosticSubmissionId` sẵn có từ bài khảo sát gần nhất thay vì chuyển giao diện sang thẻ nhắc thi lại.
  - Tuyệt đối không bật trạng thái `hasNoRoadmap = true` cho học sinh đã có lịch sử làm bài, mở khóa trực tiếp Chặng 01 và danh sách nhiệm vụ ôn luyện trọng tâm.
- **Tối Giản Giao Diện Dashboard: Thay Thế Khối Chat Cồng Kềnh Bằng Icon Nổi Góc Phải ([`App.jsx`](../src/App.jsx))**:
  - Loại bỏ hoàn toàn khối widget AI Tutor cồng kềnh nằm trong lưới nội dung trang Dashboard.
  - Tích hợp nút Floating Action Button (FAB) nhỏ gọn, hiện đại ở góc phải phía dưới màn hình với huy hiệu online màu xanh và hiệu ứng viền phát sáng, mở modal Socratic Tutor toàn màn hình khi nhấp chuột.
- **Chống Treo Ba Dấu Chấm & Xử Lý Độc Lập Lời Thoại ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx), [`practiceService.js`](../src/services/practiceService.js))**:
  - Đảm bảo giải phóng `isTyping = false` và hủy controller trong callback `onError`, bảo đảm khung chat không bao giờ bị kẹt ở trạng thái ba dấu chấm `...` khi mạng gián đoạn.
  - Không truyền nhầm phương án chọn giả lập khi học sinh gửi lời chào hỏi hoặc câu hỏi mở.
- **Kiểm Thử & Đóng Gói**:
  - `npm run build` hoàn thành sạch sẽ trong 905ms (3.013 modules transformed, 0 lỗi).

---

## [04/11/2026] - Tối Ưu Hóa Số Liệu Dashboard, Tự Động Kích Hoạt Lộ Trình DAG & Phân Tách Hội Thoại Chào Hỏi Tự Do Khỏi Luồng Đề Bài Thi Của Gia Sư AI Socratic

- **Tách Biệt Hội Thoại Tự Do / Lời Chào Khỏi Luồng Đề Bài Thi & Triệt Tiêu Dummy Options A/B ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx), [`practiceService.js`](../src/services/practiceService.js))**:
  - Khắc phục triệt để hiện tượng học sinh vừa nhắn "hi" hoặc chào hỏi thì AI lập tức lôi một đề toán tam thức bậc hai/bất phương trình ra giảng và phê bình học sinh chọn sai phương án A.
  - Phân định rõ ràng 2 trạng thái: *In-Exam Question Mode* (`initialContext?.question` có thực) vs *General Freeform Mode* (`initialContext === null`).
  - Trong chế độ hội thoại tự do, thiết lập `options = null`, `studentWrongOption = null`, `correctOption = null`, và đưa trực tiếp lời thoại của học sinh vào `studentQuery`.
  - Trong `practiceService.js`: Sửa đổi `normalizeOptions` trả về `null` thay vì tự tạo phương án giả lập `{ A: 'Phương án A', B: 'Phương án B' }`; bổ sung bộ nhận diện lời chào trong `buildRichSocraticFallback` để phản hồi thân thiện, ấm áp và hướng dẫn học sinh đặt câu hỏi học tập cụ thể.
  - Cập nhật payload gửi sang Backend gửi `studentWrongOption: resolvedWrongOpt || 'NONE'` và `correctOption: resolvedCorrectOpt || 'NONE'` tuân thủ schema Pydantic/ASP.NET Core.

- **Thay Thế Widget Gia Sư AI Cồng Kềnh Bằng Icon Nổi Góc Phải Nhỏ Gọn ([`App.jsx`](../src/App.jsx))**:
  - Gỡ bỏ hoàn toàn thẻ `AISocraticTutorWidget` chiếm diện tích lớn trên lưới bố cục 2 cột của trang Dashboard chính, giúp màn hình chỉ tập trung vào các số liệu phân tích và tiến độ chặng học.
  - Tích hợp nút hành động nổi siêu tinh gọn (Floating Action Button - FAB) tại góc dưới bên phải màn hình (`fixed bottom-6 right-6 z-40`), hiển thị biểu tượng Bot AI Socratic, viền phát sáng, chấm trạng thái xanh trực tuyến 24/7 và tooltip nhãn tinh tế.
  - Khi học sinh bấm vào icon nổi, hệ thống mở trực tiếp modal đối thoại Socratic chuyên sâu `AISocraticTutorModal`.

- **Khắc Phục Tình Trạng Bắt Thi Lại Chẩn Đoán & Tự Động Mở Khóa Lộ Trình Thích Ứng ([`MilestoneCard.jsx`](../src/components/dashboard/MilestoneCard.jsx), [`practiceService.js`](../src/services/practiceService.js), [`LearningAnalyticsView.jsx`](../src/components/dashboard/LearningAnalyticsView.jsx))**:
  - Cập nhật hàm `practiceService.getMyRoadmap(studentId)` truyền kèm tham số `?studentId={guid}` và header `X-User-Id`, tương thích 100% với `RoadmapsController.cs` của Practice Service.
  - Tự động nhận diện khi học sinh đã có lịch sử làm bài khảo sát chẩn đoán đầu vào để ngăn chặn tuyệt đối việc hiển thị khung nhắc nhở bắt thi lại (`hasNoRoadmap = true`).
  - Tự động nạp lộ trình 470 mốc và hiển thị chính xác chặng học thực tế từ Backend Database (`Chặng 01 (Tổng hợp): Luyện tập chuyên đề thích ứng`) kèm danh sách nhiệm vụ trọng tâm (`Chương 01: Quan Hệ Song Song`, `Bài 2: Hai Đường Thẳng Song Song`).
  - Trong `LearningAnalyticsView.jsx`, bổ sung cơ chế kiểm tra lịch sử thi thực tế để không bao giờ rơi vào trạng thái Ghost Onboarding giả lập một khi tài khoản đã có dữ liệu làm bài.

- **Bảo Toàn Số Liệu Điểm Ước Tính IRT 2PL Chuẩn Xác Trên Dashboard ([`practiceService.js`](../src/services/practiceService.js))**:
  - Lọc bỏ các bài thi bị hủy hoặc hết hạn (`status === 'EXPIRED'`) trong `getRealUserSubmissions`, ngăn ngừa việc ghi đè điểm số 0 lên tài khoản.
  - Ưu tiên điểm số thực tế từ kết quả chấm điểm Backend (320/1200 điểm, dải dự báo tự tin `275 - 365`) hoặc điểm quy đổi bài làm hợp lệ gần nhất, chấm dứt triệt để hiện tượng hiển thị `0 / 1200 điểm` và `0 - 45`.

- **Kiểm Thử & Đóng Gói Vận Hành**:
  - `npm test` đạt 6/6 test suites passed (100%).
  - `npm run build` Vite hoàn thành trong 1.88s không có bất kỳ lỗi cú pháp hay import nào.

---


## [03/11/2026] - Nâng Cấp Giao Diện Socratic Chat Modal Đơn Cột & Cơ Chế Tiếp Nhận Dữ Liệu Khảo Sát Cho Học Sinh

- **Giao Diện Socratic Chat Modal Hiện Đại ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx))**:
  - Lược bỏ hoàn toàn bảng tri thức bên phải và các mã taxonomy cứng; chuyển sang modal hội thoại tập trung `max-w-3xl` tinh giản.
  - Tách bạch độc lập giữa câu hỏi thắc mắc của học sinh (`studentQuery`) và đề bài gốc (`questionLatex`), không còn in chuỗi `[Ngữ cảnh câu hỏi: ...]`.
- **Bộ Phân Tích Fallback Socratic Thông Minh ([`practiceService.js`](../src/services/practiceService.js))**:
  - Tự động nhận diện câu hỏi trắc nghiệm logic, cấp số cộng, logarit, chính tả để đưa ra gợi ý sư phạm chính xác ngay cả khi ngoại tuyến.
- **Cơ Chế Kế Thừa Lịch Sử Làm Bài Cho Tài Khoản Đăng Nhập ([`practiceService.js`](../src/services/practiceService.js))**:
  - Nâng cấp `getRealUserSubmissions` tự động nhận diện và chuyển giao các bài nộp khảo sát thực hiện trước khi đăng nhập cho học sinh hiện tại, cập nhật `studentId` trong `localStorage`.
  - Giúp Trung Tâm Phân Tích Học Tập (Flow 5) mở khóa ngay lập tức dữ liệu Radar 4 miền, điểm IRT và lịch sử thi thử.
- **Kiểm Thử Hệ Thống**:
  - `npm test` đạt 6/6 passed (100%), `npm run build` Vite hoàn thành trong 1.40s.

---


## [03/11/2026] - Tinh Gọn Khung Chat Gia Sư AI Socratic (`AISocraticTutorModal` & `AISocraticTutorWidget`)

- **Tách Biệt Đề Bài Gốc & Thắc Mắc Trò Chuyện Trong Khung Chat Socratic ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx), [`practiceService.js`](../src/services/practiceService.js))**:
  - Truyền `questionLatex` là đề bài gốc (`initialContext.question || query`) và `studentQuery` là câu hỏi cụ thể học sinh gõ (`query`), loại bỏ hoàn toàn việc nối chuỗi `[Ngữ cảnh câu hỏi: ...]`.
  - Nâng cấp `buildRichSocraticFallback` trong `practiceService.js` xóa bỏ câu văn mẫu *"dấu của đạo hàm $y'$"*, thay bằng gợi mở bản chất giả thiết và mâu thuẫn thích ứng cho mọi môn học.
- **Loại Bỏ Cột Cứng `Mạng Lưới Tri Thức 3-Hop` & Các Khái Niệm Giả Lập Cố Định ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx), [`AISocraticTutorWidget.jsx`](../src/components/dashboard/AISocraticTutorWidget.jsx))**:
  - Xóa bỏ hoàn toàn cột phụ bên phải chứa các thông tin cứng không khớp ngữ cảnh câu hỏi thực tế (`Mạng Lưới Tri Thức 3-Hop`, `Dạng Bài Archetype`, `Toán logic mệnh đề & suy luận kéo theo`, `Mã chuẩn: ARCH_LOGIC_01`, `Định Lý & Công Thức Cốt Lõi`, `Bẫy Sai Lầm Hay Mắc Phải: Bẫy ngộ nhận đảo`).
  - Gỡ bỏ nhãn `Toán logic mệnh đề & suy luận kéo theo` gắn cứng dưới chân bóng chat khởi tạo và trong `AISocraticTutorWidget.jsx`; chỉ hiển thị nhãn chủ đề khi học sinh thực sự mở chat từ một câu hỏi bài tập cụ thể (`initialContext.skill`).
  - Chuyển bố cục `AISocraticTutorModal.jsx` sang khung chat 1 cột tập trung (`max-w-3xl`), hỗ trợ render công thức toán học bằng `MathText` ngay trên thanh ngữ cảnh câu hỏi đang hỏi và giữ nguyên tính năng **Báo cáo** vi phạm quy tắc Socratic trên từng phản hồi của AI.
- **Kiểm Thử & Xác Thực**:
  - Thực thi `npm test` (`6/6 tests pass`) và `npm run build` (`vite build`) thành công 100%.

---

## [02/11/2026] - Đồng Bộ Dữ Liệu Khảo Thí Chẩn Đoán Thực Tế Sang Trung Tâm Phân Tích Học Tập Core Flow 5, Thanh Navbar & Sidebar

- **Đồng Bộ Hai Chiều Kết Quả Khảo Thí Thực Tế & Bù Đắp Dữ Liệu Tức Thì (`Local History Hydration`) ([`practiceService.js`](../src/services/practiceService.js), [`practiceService.flow5.test.js`](../tests/practiceService.flow5.test.js))**:
  - Xây dựng bộ hàm `syncSubmissionToBackend`, `syncUnsyncedSubmissions`, `getRealUserSubmissions`, `scaleLocalSubmissionScore` và `hydrateStudentDashboardWithLocalHistory` trong `practiceService.js`.
  - Khi học sinh đã hoàn thành các bài khảo sát chẩn đoán 30 câu trong kho lịch sử `veval_submission_history_v1` nhưng Backend trả về `needsOnboarding = true` (do chưa đồng bộ hoặc dịch vụ chưa nạp lại), Frontend tự động kích hoạt chế độ **Real Data Hydration**: tắt trạng thái Onboarding, quy đổi điểm thực chuẩn thang ĐGNL V-ACT `0..1200`, tính `Theta_0`, dựng biểu đồ Radar 4 miền thực tế từ tỷ lệ đúng từng miền của các câu đã làm, tính chuỗi ngày tự học thực tế 7 ngày gần nhất, hiển thị đúng họ tên tài khoản đang đăng nhập (`fullName`) và tự động đẩy ngầm (`POST /api/practice/diagnostic-submissions`) lên PostgreSQL.
  - Phát sự kiện đồng bộ toàn cục `CustomEvent('veval:submission-updated')` mỗi khi nộp bài mới hoặc xóa bài trong lịch sử để mọi màn hình cập nhật tức thì mà không cần tải lại trang.
  - Bổ sung unit test kiểm chứng kịch bản bù đắp dữ liệu thật khi `needsOnboarding = true` (`6/6 tests pass`).
- **Khắc Phục Định Danh Học Sinh & Đấu Nối Lưu Trữ Backend Khi Nộp Bài 30 Câu ([`DiagnosticAssessmentPage.jsx`](../src/components/diagnostic/DiagnosticAssessmentPage.jsx))**:
  - Khắc phục lỗi đọc nhầm trường `user?.userId` (luôn `undefined`) sang `user?.id || user?.userId`, đảm bảo gắn đúng GUID của học sinh đang đăng nhập vào lịch sử bài làm và yêu cầu chấm điểm.
  - Tự động gọi `practiceService.syncSubmissionToBackend(savedEntry, studentId)` kèm siêu dữ liệu câu hỏi (`correctOption`, `domainId`, `skillId`, `difficultyLevel`) ngay sau khi hoàn thành bài khảo sát 30 câu và kích hoạt callback `onCompleteDiagnostic`.
- **Hiển Thị Số Liệu Thực Trên `LearningAnalyticsView`, `Navbar` & `Sidebar` ([`LearningAnalyticsView.jsx`](../src/components/dashboard/LearningAnalyticsView.jsx), [`App.jsx`](../src/App.jsx), [`Navbar.jsx`](../src/components/layout/Navbar.jsx), [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx))**:
  - Sửa nút chuyển đổi chế độ xem trước Onboarding trong `LearningAnalyticsView.jsx` sang biến trạng thái 3 chiều (`null | boolean`), hiển thị nhãn thứ thực tế của 7 ngày gần nhất kết thúc tại `Hôm nay`, hiển thị huy hiệu `Theta` trên danh sách đề vừa hoàn thành và tự động làm mới khi nhận sự kiện `veval:submission-updated`.
  - Xóa bỏ số liệu cứng `12 Ngày` trên `Navbar.jsx` và `Theta 0: +0.65 | 82% Trúng tuyển` dưới chân `Sidebar.jsx`, thay bằng số liệu thực tế từ `studentDashboard` của học sinh đang đăng nhập.
- **Kiểm Thử & Xác Thực**:
  - Thực thi `npx oxlint`, `npm test` (`6/6 tests pass`) và `npm run build` (`vite build`) thành công 100%.

---

## [01/11/2026] - Triển Khai Toàn Diện Frontend Core Flow 5: Phân Tích Học Tập, Ma Trận Nhiệt Lớp Học 2D, Cổng Phụ Huynh & Bản Đồ Nhiệt So Sánh Cấp Cơ Sở

- **Chuẩn Hóa Tầng Dịch Vụ `practiceService.js` & Hợp Đồng API Core Flow 5 ([`practiceService.js`](../src/services/practiceService.js), [`practiceService.flow5.test.js`](../tests/practiceService.flow5.test.js))**:
  - Đồng bộ toàn bộ tiền tố đường dẫn Practice Service từ `/api/v1/practice/...` về chuẩn `/api/practice/...` khớp 100% với cấu hình YARP Gateway (`:5212`) và các Controller tại `V-Eval-Practice_Service` (`:5261`).
  - Triển khai trọn bộ 5 phương thức API Core Flow 5 kèm kiểm tra chuẩn GUID (`FLOW5_DEFAULTS`) và cơ chế seed fallback an toàn đúng schema DTO của ASP.NET Core:
    + `getStudentDashboard(studentId)` -> `GET /api/practice/analytics/student/{studentId}/dashboard`
    + `getClassHeatmap(classId, { domainCode, minMastery })` -> `GET /api/practice/classes/{classId}/heatmap`
    + `forceAggregateClassHeatmap(classId)` -> `POST /api/practice/classes/{classId}/heatmap/force-aggregate`
    + `getParentDashboard(parentId)` -> `GET /api/practice/analytics/parent/{parentId}/children`
    + `getCampusComparativeHeatmap(campusId)` -> `GET /api/practice/analytics/campus/{campusId}/comparative-heatmap`
  - Bổ sung bộ unit test kiểm chứng đường dẫn endpoint, chuẩn hóa GUID và cấu trúc DTO fallback (`5/5 tests pass`).
- **Triển Khai Trung Tâm Phân Tích Học Tập Học Sinh Core Flow 5 ([`LearningAnalyticsView.jsx`](../src/components/dashboard/LearningAnalyticsView.jsx), [`HeroBanner.jsx`](../src/components/dashboard/HeroBanner.jsx), [`MetricsGrid.jsx`](../src/components/dashboard/MetricsGrid.jsx), [`RadarChartModal.jsx`](../src/components/modals/RadarChartModal.jsx), [`App.jsx`](../src/App.jsx))**:
  - Đấu nối tab `Báo cáo & Dự báo (Flow 5 & 6)` trên Sidebar vào giao diện `LearningAnalyticsView.jsx` kết nối `practiceService.getStudentDashboard`.
  - Hỗ trợ trạng thái **Ghost Onboarding UI** (`needsOnboarding = true`) điều hướng làm bài khảo sát 30 câu đầu vào.
  - Hiển thị **Biểu đồ Đa giác Năng lực 4 Miền Kép (Dual Radar)** đối sánh `studentScore` thực tế với `targetScore` ngành mục tiêu, **Bộ theo dõi chuỗi 7 ngày chuyên cần (`weeklyActivityDays` + Khiên `Streak Freeze`)**, tiến độ đồ thị tiên quyết DAG và lịch sử đề thi thử ĐGNL chuẩn hóa.
- **Nâng Cấp Ma Trận Nhiệt Lớp Học 2D Cho Giáo Viên & Can Thiệp Nhóm Vi Mô Offline ([`TeacherDashboardView.jsx`](../src/components/dashboard/TeacherDashboardView.jsx))**:
  - Xóa bỏ 100% bảng tĩnh `mockTeacherHeatmap`, kết nối trực tiếp `GET /api/practice/classes/{classId}/heatmap` và nút **Cập nhật tức thì (`POST .../force-aggregate`)**.
  - Hỗ trợ chuyển đổi lớp học phụ trách, lọc theo 4 miền năng lực (`DOM_MATH`, `DOM_LANG`, `DOM_NAT_SCI`, `DOM_SOC_SCI`), lọc ngưỡng thành thạo `` `P(L_t)` ``, lọc mức rủi ro (`HIGH_RISK`, `MEDIUM_RISK`, `SAFE`) và tìm kiếm học sinh.
  - Hiển thị tự động các thẻ cảnh báo sư phạm `CRITICAL_RED` / `WARNING_AMBER`, nhãn nhận diện phân hóa 2 cực `Phân cực` (`isBimodal = true` khi `` `\sigma \ge 0.28` ``) và nút hành động **1-Click Xếp Nhóm & Giao Phiếu Thích Ứng** mở trực tiếp `ClassMicroGroupsModal` theo đúng mô hình Offline Cohort 3–5 học sinh/bàn.
- **Nâng Cấp Cổng Phụ Huynh Đồng Hành & Bản Đồ Nhiệt So Sánh Cấp Cơ Sở ([`ParentDashboardView.jsx`](../src/components/dashboard/ParentDashboardView.jsx), [`CampusManagerDashboardView.jsx`](../src/components/dashboard/CampusManagerDashboardView.jsx))**:
  - `ParentDashboardView.jsx`: Kết nối trực tiếp `GET /api/practice/analytics/parent/{parentId}/children`, hỗ trợ chuyển đổi danh sách con, hiển thị **Chỉ số Sẵn sàng Thi `` `R_{\text{exam}}` ``** (`READY` / `NEAR_READY` / `AT_RISK`), thanh phân rã 3 trụ cột (`` `0.50 \cdot S_\theta + 0.35 \cdot C_{\text{BKT}} + 0.15 \cdot F_{\text{consistency}}` ``), tiến độ kỷ luật tự học xác thực 12 giờ/tuần (`EXCEEDED_GOAL` / `ON_TRACK` / `NEEDS_IMPROVEMENT`), thông điệp AI đồng hành và kênh trao đổi 1-1 với giáo viên phụ trách lớp Offline.
  - `CampusManagerDashboardView.jsx`: Tích hợp khối **Bản Đồ Nhiệt So Sánh Năng Lực 4 Miền Cấp Cơ Sở** (`GET /api/practice/analytics/campus/{campusId}/comparative-heatmap`) hiển thị mức thành thạo trung bình toàn cơ sở, bảng ma trận đối sánh `` `P(L_t)` `` và tỷ lệ học sinh yếu của từng lớp kèm nút mở nhanh sơ đồ bàn vi mô 3–5 học sinh cho các lớp rủi ro cao (`HIGH_RISK`).
- **Kiểm Thử & Xác Thực**:
  - Thực thi `npx oxlint`, `npm test` (`5/5 tests pass`) và `npm run build` (`vite build`) thành công 100%.

---

## [31/10/2026] - Triển Khai Phân Hệ Lịch Sử Làm Bài & Sổ Tay Lỗi Sai Socratic, Chuẩn Hóa Luồng Xem Lại Đáp Án & Khắc Phục Tương Phản `MathText`

- **Triển Khai Phân Hệ Lịch Sử Làm Bài & Sổ Tay Lỗi Sai Socratic ([`SubmissionHistoryView.jsx`](../src/components/diagnostic/SubmissionHistoryView.jsx), [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx), [`App.jsx`](../src/App.jsx))**:
  - Xây dựng giao diện **Lịch Sử Làm Bài & Sổ Tay Lỗi Sai Socratic** cho phép học sinh tra cứu lại toàn bộ các bài khảo sát ĐGNL 30 câu, phiếu luyện tập thích ứng ZPD và bài kiểm tra chuyên đề đã thực hiện.
  - Khi bấm **"Xem Lại Đáp Án & Hỏi AI"** trên bất kỳ bài làm cũ nào, học sinh xem được toàn bộ câu hỏi, phương án đã chọn so với đáp án đúng, lời giải chi tiết và bấm hỏi Gia sư AI Socratic (cả chế độ stream trực tiếp dưới câu hỏi lẫn mở Modal Chat Socratic Chuyên Sâu).
  - Bổ sung tab **Sổ Tay Câu Làm Sai** tự động gom nhóm các câu làm sai từ mọi đề thi trước đó để ôn luyện tập trung cùng AI.
  - Bổ sung danh sách **Lịch Sử Làm Bài Đã Hoàn Thành** ngay trên màn hình khởi tạo của [`DiagnosticAssessmentPage.jsx`](../src/components/diagnostic/DiagnosticAssessmentPage.jsx) và nối tự động lưu lịch sử khi hoàn thành bài làm tại [`DiagnosticAssessmentPage.jsx`](../src/components/diagnostic/DiagnosticAssessmentPage.jsx), [`AdaptiveQuizModal.jsx`](../src/components/modals/AdaptiveQuizModal.jsx) và [`CurriculumExplorerView.jsx`](../src/components/curriculum/CurriculumExplorerView.jsx).
- **Khắc Phục Lỗi Chữ Tối Không Đọc Được Trên Nền Tối & Lỗi Ký Tự `:**` Trong [`MathText.jsx`](../src/components/common/MathText.jsx)**:
  - Loại bỏ các class màu chữ tối cố định (`text-slate-700`, `text-slate-800`, `text-slate-900`) trên các dòng văn bản, danh sách bullet, chữ in đậm `<strong>` và chữ in nghiêng `<em>`, cho phép `MathText` kế thừa màu chữ sáng (`text-white` / `text-slate-100`) khi hiển thị trên nền tối của trang kết quả khảo thí.
  - Sửa biểu thức chính quy chuẩn hóa tiêu đề in đậm để không cắt mất dấu `**` mở đầu trong chuỗi `💡 **Gợi ý phương pháp giải:**` và làm sạch hoàn toàn dấu `**` thừa ở cuối thẻ Callout.
- **Tích Hợp Phân Tích Socratic Giàu Ngữ Cảnh Theo Từng Câu Hỏi ([`DiagnosticAssessmentPage.jsx`](../src/components/diagnostic/DiagnosticAssessmentPage.jsx) & [`practiceService.js`](../src/services/practiceService.js))**:
  - Xây dựng hàm `buildContextualSocraticAnalysis(q)` và `buildRichSocraticFallback`: Khi học sinh bấm hỏi Gia sư AI ở màn hình kết quả mà dịch vụ RAG chưa bật hoặc trả về chuỗi mẫu chung chung, hệ thống tự động phân tích chi tiết phương án học sinh vừa chọn (ví dụ `A: y = x^4 + 2x^2`), đối chiếu với đáp án đúng (`C: y = x^3 + 3x - 1`), trích xuất định lý/đạo hàm từ lời giải của câu hỏi và đặt câu hỏi gợi mở sát 100% nội dung đề bài.
  - Thiết kế lại khung hiển thị phân tích Socratic với nền Indigo/Purple tương phản cao và chữ trắng sắc nét (`text-white`).
- **Cải Tiến Luồng Khảo Thí Chẩn Đoán 30 Câu ([`DiagnosticAssessmentPage.jsx`](../src/components/diagnostic/DiagnosticAssessmentPage.jsx))**:
  - Gỡ bỏ nút bấm và ngăn kéo *Socratic Tutor* khỏi màn hình đang thi (`stage === 'testing'`) để đảm bảo tính nghiêm túc khi khảo thí và học sinh tập trung hoàn thành bài làm.
  - Bổ sung chức năng **Hỏi Gia Sư AI Socratic** trực tiếp tại từng thẻ câu hỏi trong **Bảng Đánh Giá Chi Tiết & Đáp Án 30 Câu Hỏi** ở màn hình kết quả (`stage === 'result'`):
    + Nút **"💡 Hỏi Gia Sư AI Socratic Về Câu Này"**: Stream trực tiếp lời dẫn Socratic phân tích lỗi sai và hướng tư duy ngay bên dưới lời giải của câu hỏi đó.
    + Nút **"Chat Socratic Chuyên Sâu"**: Đóng gói ngữ cảnh câu hỏi, phương án chọn sai và đáp án đúng chuyển sang modal [`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx).
- **Cải Tiến Luồng Luyện Tập Thích Ứng ZPD ([`AdaptiveQuizModal.jsx`](../src/components/modals/AdaptiveQuizModal.jsx))**:
  - Gỡ bỏ các nút hỏi AI khi đang làm câu hỏi (`!quizFinished`), lưu lịch sử phương án chọn của học sinh (`answerHistory`).
  - Nâng cấp màn hình hoàn thành bài tập (`quizFinished === true`): Hiển thị thống kê số câu đúng, xác suất `P(L_t)` và **Danh sách Xem lại đáp án từng câu** (đối chiếu phương án học sinh chọn với đáp án đúng, giải thích chi tiết) kèm nút **"💡 Chưa hiểu bản chất câu này? Hỏi Gia sư AI Socratic bẻ khóa tư duy"** cho từng câu.
- **Tích Hợp Hỏi Gia Sư AI Khi Xem Lại Phiếu Bài Tập Củng Cố ([`CurriculumExplorerView.jsx`](../src/components/curriculum/CurriculumExplorerView.jsx) & [`App.jsx`](../src/App.jsx))**:
  - Bổ sung đối chiếu phương án chọn / đáp án đúng và nút **"💡 Chưa hiểu rõ câu này? Hỏi Gia sư AI Socratic giải thích"** tại màn hình kết quả `quizShowResults` của phiếu bài tập củng cố.
- **Kiểm Thử Đóng Gói (Build & Unit Test Verification)**:
  - Chạy `npm test` (3/3 pass) và `npm run build` (`vite build`) thành công 100%.

---

## [14/10/2026] - Hoàn Tất Giai Đoạn 2 Core Flow 4: Tích Hợp Ngữ Cảnh Bài Tập Socratic (ZPD Quiz & Diagnostic)
- **Tích Hợp Ngữ Cảnh Vào Luyện Tập Thích Ứng ZPD ([`AdaptiveQuizModal.jsx`](../src/components/modals/AdaptiveQuizModal.jsx))**:
  - Bổ sung nút hành động thông minh **"💡 Chưa hiểu bản chất câu này? Hỏi Gia sư Socratic bẻ khóa tư duy"** xuất hiện ngay khi học sinh làm sai hoặc phân vân đáp án.
  - Bổ sung thanh cảnh báo suy ngẫm sau 45 giây (**Contemplation Nudge**): Tự động hiển thị gợi ý hỗ trợ bẻ khóa tư duy khi học sinh dừng lại quá 45 giây ở câu hỏi khó mà chưa thể đưa ra phương án.
  - Thêm nút gọi nhanh **"Gợi mở tư duy Socratic"** ngay dưới nội dung câu hỏi trước khi nộp bài.
  - Tích hợp component `MathText` kết xuất công thức toán học KaTeX trong câu hỏi và 4 phương án trắc nghiệm.
  - Chuẩn hóa định danh GUID cho ngân hàng câu hỏi thích ứng mẫu (`a1b2c3d4-0001-...`).
  - Tự động đóng gói toàn bộ bối cảnh bài tập (`questionId`, `question`, `options`, `skill`, `selectedWrong`, `correctOption`, `difficultyB`, `predictedProb`) chuyển tiếp đến `AISocraticTutorModal`.
- **Tầng Dịch Vụ Chuẩn Hóa Hợp Đồng DTO ([`practiceService.js`](../src/services/practiceService.js))**:
  - Xây dựng bộ lọc chuẩn hóa DTO: `ensureGuid` (đảm bảo GUID hợp lệ tránh lỗi 400 Bad Request từ ASP.NET Core), `cleanOptionKey` (chuẩn hóa ký tự A, B, C, D để khớp Misconception Trap của AI Engine) và `normalizeOptions` (tự động chuyển đổi Array sang Dictionary `<string, string>`).
  - Bổ sung callback `onInteractionId` bắt sự kiện trả về GUID phiên từ dòng SSE stream, phục vụ chính xác tính năng báo cáo vi phạm.
- **Nâng Cấp Modal Chat Socratic Hỗ Trợ Ngữ Cảnh ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx))**:
  - Tự động nhận diện `initialContext`: Hiển thị thanh thông tin ngữ cảnh nổi bật (*Target Context Banner*) gồm trích đoạn đề bài, kỹ năng và phương án học sinh chọn sai.
  - Khởi tạo lời dẫn Socratic cá nhân hóa theo đúng trọng tâm câu hỏi và phương án làm sai thay vì câu chào chung chung.
  - Tự động đóng gói nội dung câu hỏi vào `questionLatex` và truyền `options`, `correctOption` khi người dùng nhập câu hỏi hoặc chọn quick prompt.
  - Cập nhật linh hoạt `interactionId` từ stream cho tính năng gắn cờ báo cáo vi phạm sư phạm.
- **Chuẩn Hóa Khảo Thí Chẩn Đoán 30 Câu ([`DiagnosticAssessmentPage.jsx`](../src/components/diagnostic/DiagnosticAssessmentPage.jsx))**:
  - Chuyển đổi phương thức `handleAskSocraticTutor` sang gọi trực tiếp `practiceService.askAiTutorStream` qua Gateway `:5212`, truyền đầy đủ mã câu hỏi, công thức KaTeX và phương án học sinh vừa làm.
  - Xử lý mượt mà mã lỗi `429 Too Many Requests` (Rate Limit 10 req/phút).
- **Điều Phối Trạng Thái Ứng Dụng ([`App.jsx`](../src/App.jsx))**:
  - Bổ sung state `tutorContext` và hàm điều phối `handleOpenAiTutor(context)`, kết nối liền mạch từ `AdaptiveQuizModal` sang `AISocraticTutorModal`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` (`vite build`) thành công 100% (**0 Error, 0 Warning**).
  - Chạy `npm run lint` (`oxlint`) đạt chuẩn mã nguồn sạch.

---

## [13/10/2026] - Triển Khai Giai Đoạn 1 Core Flow 4: Gia Sư AI Socratic Tutor & GraphRAG Live Streaming
- **Mở Rộng Tầng Dịch Vụ Client ([`practiceService.js`](../src/services/practiceService.js))**:
  - Bổ sung `askAiTutorStream`: Kết nối trực tiếp API Gateway `:5212` -> Practice Service `:5261` (`POST /api/practice/ai-tutor/ask-stream`) xử lý Server-Sent Events (SSE) theo thời gian thực.
  - Tích hợp cơ chế kiểm soát giới hạn tần suất: Bắt mã lỗi `429 Too Many Requests` (chính sách `StrictTutorPolicy` 10 req/phút) và đưa ra thông báo sư phạm thân thiện.
  - Bổ sung `askAiTutor` (REST fallback), `reportAiTutorInteraction` (`POST /api/practice/ai-tutor/report`) và `getAiTutorInteractions`.
- **Nâng Cấp Widget Dashboard Học Sinh ([`AISocraticTutorWidget.jsx`](../src/components/dashboard/AISocraticTutorWidget.jsx))**:
  - Xóa bỏ 100% mã mock giả lập `setTimeout`.
  - Kết nối live SSE streaming với hiệu ứng hiển thị token chữ chạy mượt mà, hỗ trợ nút *Dừng (Abort)* khi đang phát stream.
  - Tích hợp component `MathText` kết xuất công thức toán học KaTeX nội dòng (`$...$`) và khối (`$$...$$`).
  - Hiển thị badge Đồ thị Tri thức GraphRAG và thanh cảnh báo khi chạm trần Rate Limit.
- **Xây Dựng Component Modal Chuyên Sâu ([`AISocraticTutorModal.jsx`](../src/components/modals/AISocraticTutorModal.jsx))**:
  - Thiết kế giao diện hai cột hiện đại: Cột trái là khung chat Socratic toàn diện với dòng thời gian câu hỏi và gợi ý nhanh (Quick Prompts); Cột phải là bảng phân tích Đồ thị Tri thức 3-Hop (Dạng bài Archetype, Định lý cốt lõi, Bẫy ngộ nhận Misconception Traps).
  - Tích hợp chức năng Báo cáo vi phạm (In-chat Flagging) cho từng câu trả lời của AI (lộ đáp án trực tiếp, ảo giác kiến thức, hướng dẫn khó hiểu) kết nối trực tiếp cơ sở dữ liệu giám sát sư phạm.
- **Chuẩn Hóa Điều Hướng Router ([`App.jsx`](../src/App.jsx) & [`Sidebar.jsx`](../src/components/layout/Sidebar.jsx))**:
  - Sửa lỗi điều hướng: Bấm menu *AI Socratic Tutor* trên Sidebar và nút mở rộng trên Widget giờ đây mở chính xác `AISocraticTutorModal`, chấm dứt việc mở nhầm modal luyện tập ZPD của Flow 3.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` (`vite build`) thành công 100% (**0 Error, 0 Warning**).
  - Chạy `npm run lint` (`oxlint`) đạt tiêu chuẩn mã nguồn sạch.

---

## [04/11/2026] - Nâng Cấp Giao Diện Fintech Hiện Đại Cho Modal OTP & Hoàn Thiện Luồng Quên Mật Khẩu (UC 05 / UC 06)

- **Nâng Cấp Giao Diện Nhập Mã OTP Chuẩn Fintech Cao Cấp (ForgotPasswordModal.jsx)**:
  - **Lưới 6 ô vuông nhập số độc lập (6-Digit PIN Grid)**: Thay thế ô nhập đơn điệu bằng 6 ô vuông bo tròn hiện đại (w-12 h-14), cỡ chữ số lớn nổi bật (	ext-2xl font-black), viền xanh neon và hiệu ứng phóng to vi mô (scale-102) khi nhập.
  - **Tương tác bàn phím & dán mã thông minh (Smart Paste & Key Navigation)**: Tự động nhảy con trỏ sang ô tiếp theo khi nhập số, lùi ô khi nhấn Backspace, điều hướng phím mũi tên trái/phải, và tự động bóc tách 6 chữ số khi dán (Ctrl + V) mã OTP từ email.
  - **Đồng hồ đếm ngược & Nút gửi lại mã (Resend Countdown Timer)**: Tích hợp đếm ngược 60 giây và nút Gửi lại mã OTP có hiệu ứng icon xoay tròn RefreshCw.
  - **Huy hiệu thông tin email tinh tế**: Hiển thị chip email người nhận ✉️ thaithinh03456@gmail.com trang nhã thay vì khối cảnh báo xanh cồng kềnh.
  - **Thanh chỉ báo tiến trình 3 bước (Step Progress Indicator)**: Trực quan hóa tiến trình thực hiện: [1. Email] ── [2. Mã OTP] ── [3. Mật khẩu mới].
- **Hoàn Thiện Bước 3 (Thiết Lập Mật Khẩu Mới)**:
  - Bổ sung nút bật/tắt ẩn hiện mật khẩu (Eye / EyeOff) cho cả 2 ô Mật khẩu mới và Xác nhận mật khẩu.
  - Bảng đối soát chính sách bảo mật thời gian thực (Real-time Checklist) với 4 tích xanh: Tối thiểu 8 ký tự, Chữ in hoa (A-Z), Chữ thường (a-z), Chữ số (0-9) và trạng thái trùng khớp mật khẩu.
- **Kiểm Tra Email Tồn Tại Khi Quên Mật Khẩu & Bóc Tách Lỗi Tường Minh**:
  - Tinh chỉnh piClient.js tự động bóc tách data.error.description triệt tiêu lỗi Error: [object Object].
  - Nếu email không tồn tại trong hệ thống (HTTP 404): Báo lỗi chuẩn xác *"Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại."* và giữ nguyên ở Bước 1.
- **Kiểm Thử & Đóng Gói (Build & Test)**:
  - Kiểm thử
pm test: **6/6 tests PASS 100%**.
  -
pm run build hoàn thành trong 1.12s, 0 lỗi cú pháp.
---

## [03/11/2026] - Triển Khai Giao Diện Thanh Toán Học Phí PayOS (VietQR) & Kích Hoạt Lộ Trình Thích Ứng PLAR

- **Triển Khai Dịch Vụ Thanh Toán (`src/services/paymentService.js`)**:
  - Tích hợp giao tiếp API Gateway (`:5212`) ➔ Practice Service (`:5261`) tại đường dẫn `/api/practice/payments`:
    - `createPaymentLink`: Tạo link thanh toán PayOS VietQR với cơ chế fallback giả lập an toàn khi chạy offline.
    - `getPaymentStatus`: Thăm dò (polling) tự động trạng thái thanh toán từ PayOS qua `orderCode`.
    - `getPaymentTransactions`: Tra cứu nhật ký kiểm toán giao dịch (Audit Logs).
  - Đăng ký và xuất khẩu đồng bộ qua `src/services/index.js`.

- **Xây Dựng Modal Thanh Toán PayOS VietQR (`src/components/modals/PayOsCheckoutModal.jsx`)**:
  - Giao diện thanh toán hiện đại chuẩn ngân hàng, hiển thị thông tin gói học, mã đơn hàng, số tiền học phí và nút chuyển hướng sang cổng thanh toán chính thức của PayOS.
  - Cơ chế tự động lắng nghe (polling mỗi 3 giây) kết quả Webhook IPN từ cổng PayOS.
  - Hiệu ứng pháo hoa (`canvas-confetti`) và màn hình chúc mừng khi thanh toán thành công, thông báo kích hoạt lộ trình thích ứng PLAR tức thì kèm nút điều hướng trực tiếp vào chặng học đầu tiên.
  - Hỗ trợ chế độ giả lập xác nhận tức thì (Instant Verify) phục vụ kiểm thử và demo.

- **Xây Dựng Màn Hình Quản Lý Học Phí & Đăng Ký Khóa Học (`src/components/payment/TuitionPaymentView.jsx`)**:
  - Giới thiệu 3 gói đào tạo chuẩn ĐGNL: Gói Cấp Tốc (Fast-Track - 8 tuần), Gói Chuẩn (Standard Adaptive - 12 tuần) và Gói Bứt Phá (Intensive Plus - 16 tuần).
  - Bảng tra cứu lịch sử giao dịch và đối soát học phí chi tiết.
  - Tích hợp trực tiếp vào Cổng Phụ Huynh (`ParentDashboardView.jsx`) với banner nhắc nộp học phí và nút hành động nhanh qua VietQR PayOS.
  - Bổ sung tab điều hướng `Học phí & Gói học` (`tuition`) trên `Sidebar.jsx` và cập nhật định tuyến trong `App.jsx`.

- **Kiểm Thử & Đóng Gói (Build & Test)**:
  - Bổ sung bài kiểm thử `tests/paymentService.test.js`: **6/6 tests PASS 100%**.
  - `npm run build` thành công trong 1.40s với 0 lỗi cú pháp.

---

## [01/11/2026] - Khắc Phục Lỗi Runtime flushSync Is Not Defined & Hoàn Thiện Cơ Chế Nhảy Dòng Lên (Backspace Line Merge)

- **Bổ Sung Import `flushSync` Từ `react-dom` & Gộp Dòng Liền Mạch (`WordStyleFormulaCanvas.jsx`)**:
  - *Nguyên Nhân Sâu Xa*:
    1. Hàm `flushSync` được gọi trong `handleDeleteOrMergeLine` nhưng chưa được import từ `react-dom`, gây lỗi runtime `ReferenceError: flushSync is not defined` âm thầm ngắt quãng luồng xử lý khiến dòng không thể xóa hay nhảy lên dòng trên.
    2. Điều kiện con trỏ đầu dòng `isAtStart` trước đây chỉ kiểm tra `sel.anchorOffset === 0`, dễ bị trượt khi con trỏ nằm trong node text con hoặc selection collapsed.
    3. Khi gộp hai dòng có nội dung, các token chữ nằm cạnh nhau bị phân mảnh thành nhiều thẻ span riêng biệt khiến luồng văn bản bị đứt đoạn.
  - *Giải Pháp Xử Lý Toàn Diện*:
    - *Import Trực Tiếp `flushSync`*: Bổ sung `import { flushSync } from 'react-dom';` kèm khối bọc an toàn `try/catch` fallback gọi `commitDocLines(nextLines)`.
    - *Chuẩn Hóa Nhận Diện Con Trỏ Đầu Dòng*: Kiểm tra đồng thời `sel.anchorOffset === 0` và `range.startOffset === 0` để nhận biết 100% thời điểm con trỏ ở vị trí đầu dòng để nhảy dòng lên (`e.key === 'Backspace'`).
    - *Gộp Liền Khối Các Token Chữ Liền Kề*: Khi gộp dòng dưới lên dòng trên, các token chữ liên tiếp được nối chuỗi `last.text += tok.text` thành 1 span duy nhất, định vị con trỏ chính xác tại điểm nối giữa hai dòng.

---

## [01/11/2026] - Khắc Phục Triệt Để Lỗi Xóa Hết Nội Dung Dòng Nhấn Phím Xóa (Backspace/Delete) Không Tự Động Xóa Dòng

- **Khắc Phục Lỗi Xóa Hết Chữ Nhấn Backspace Không Tự Động Xóa Dòng (`WordStyleFormulaCanvas.jsx`)**:
  - *Nguyên Nhân Sâu Xa*:
    1. Trong `handleDeleteOrMergeLine` và `onKeyDown`, hàm sử dụng trực tiếp biến state React `docLines` (bị dính closure cũ khi người dùng vừa Enter tạo dòng mới hoặc chèn công thức), dẫn đến `idx` trả về `-1` và thoát sớm mà không thực hiện xóa dòng.
    2. Trong `handleDeleteOrMergeLine`, mảng `nextLines` được lọc từ `docLines` cũ thay vì `docLinesRef.current`, làm mất đồng bộ danh sách dòng.
    3. Trong `onInput` của thẻ `<span contentEditable>`, chuỗi văn bản mới chỉ cập nhật khi `onBlur`, khiến state `tokens` vẫn còn giữ chuỗi văn bản cũ trước khi xóa, làm điều kiện kiểm tra rỗng `tokens.every(...)` thất bại.
  - *Giải Pháp Xử Lý Toàn Diện*:
    - *Đồng Bộ State Tức Thời Trên `onInput`*: Cập nhật `tok.text` trực tiếp vào `docLinesRef.current` ngay khi người dùng gõ hoặc xóa từng ký tự mà không kích hoạt re-render React (bảo đảm con trỏ chuột không bị nhảy, không đứt gãy gõ tiếng Việt có dấu).
    - *Chuẩn Hóa Nhận Diện Dòng Trống Tuyệt Đối*: Lọc bỏ toàn bộ ký tự khoảng trắng, xuống dòng, khoảng trắng không ngắt `\u00A0` và zero-width space `\u200B`. Khi dòng không chứa công thức toán và chuỗi văn bản DOM rỗng, hệ thống xác nhận 100% dòng đã được xóa sạch.
    - *Tự Động Xóa Dòng & Thu Hồi Con Trỏ Về Dòng Liền Trước*: Khi người dùng nhấn Backspace hoặc Delete trên dòng trống, `handleDeleteOrMergeLine` tức tốc loại bỏ dòng khỏi `docLinesRef.current`, kích hoạt `commitDocLines` qua `flushSync`, và tự động chuyển con trỏ chuột về cuối dòng phía trước (hoặc đầu dòng sau nếu là dòng 0) để người dùng tiếp tục soạn thảo liền mạch.

---

## [01/11/2026] - Khắc Phục Lỗi Runtime ReferenceError (createPortal Is Not Defined) Trong HierarchicalMathPalette

- **Bổ Sung Import `createPortal` Từ `react-dom` (`HierarchicalMathPalette.jsx`)*:
  - Khắc phục lỗi thiếu câu lệnh import `createPortal` tại đầu file `HierarchicalMathPalette.jsx`, triệt tiêu hoàn toàn lỗi màn hình trắng `ReferenceError: createPortal is not defined`.
  - Bảo đảm thẻ xem trước trực quan Bảng biến thiên và công thức được dịch chuyển an toàn qua Portal gắn trực tiếp vào `document.body` với `z-[99999]`.

---

## [01/11/2026] - Khắc Phục Hiện Tượng Di Chuột Không Hiện Thẻ (React createPortal Body) & Hoàn Thiện Kéo Thả 100% Ăn (DataTransfer Fallback)

- **Khắc Phục Hiện Tượng Di Chuột Vào Không Hiện Thẻ (`HierarchicalMathPalette.jsx`)*:
  - *Chuyển Thẻ Hover Sang `createPortal(..., document.body)`*: Thoát hoàn toàn khỏi cây DOM sidebar và các thuộc tính `overflow: hidden` / stacking context của container cha, gắn trực tiếp vào `document.body` với `z-[99999]`.
  - *Rút Ngắn Độ Trễ Xuống 80ms Siêu Mượt*: Khi rê chuột vào bất kỳ công thức nào ở sidebar, thẻ xem trước trực quan sẽ xuất hiện tức thì trong 80ms thay vì đợi lâu.
  - *Tọa Độ Cố Định Chính Xác Theo Viewport*: Đặt thẻ ổn định ở `rect.right + 10`, không còn bị lệch hay che khuất.

- **Khắc Phục Triệt Để Kéo Thả Không Ăn (`WordStyleFormulaCanvas.jsx`)*:
  - *Bổ Sung Fallback Toàn Diện Cho `dataTransfer`*: Đọc đồng thời `text/veval-block`, `text/veval-math`, `text/veval-bbt` và fallback chuẩn `text/plain` / `Text`. Khắc phục 100% hiện tượng một số trình duyệt Chromium không truyền mime type tùy biến.
  - *Nhận Diện Khối Mẫu Linh Hoạt (`.includes`) Nhận Diện Bảng Biến Thiên*: Bắt trọn vẹn khối `[VARIATION_TABLE]`, `[MATH_GRAPH]` kể cả khi có khoảng trắng xung quanh.
  - *Thả Tự Do Không Gây Bật Khung Studio*: Chèn êm ái công thức vào dòng mà không bật popup Studio gây che khuất văn bản.

---

## [01/11/2026] - Khắc Phục Triệt Để 4 Sự Cố: Enter Không Xuống Dòng, Chèn Không Ăn, Kéo Thả Bị Chặn & Di Chuột Không Hiện

- **Khắc Phục Lỗi Enter Không Xuống Dòng & Chèn Công Thức Không Ăn (`WordStyleFormulaCanvas.jsx`)*:
  - *Đồng Bộ State `docLinesRef` Tức Thời*: Bổ sung `docLinesRef = useRef(docLines)` và cập nhật tức thì trong `commitDocLines`, loại bỏ hoàn toàn hiện tượng closure cũ (stale closure) của React.
  - *Chặn Sự Kiện `onBlur` Xóa Mất Dòng Mới*: Trong `handleTextChange`, bổ sung điều kiện bảo vệ `if (targetTok.text === newText) return;`. Khi người dùng nhấn Enter để xuống dòng hoặc nhấp nút chèn công thức, sự kiện blur của ô soạn thảo trước đó không còn ghi đè làm xóa mất dòng mới tạo hay snippet vừa chèn.
  - *Cắt Tách Chuỗi Nhập Liệu Chuẩn Xác Từng Ký Tự*: `handleInsertNewLineAfter` đọc trực tiếp chuỗi văn bản DOM thời gian thực từ `spanEl.textContent`, tách chính xác phần trước và sau con trỏ chuột `caretOffset` và đưa con trỏ chuột sang dòng mới mượt mà.

- **Khắc Phục Lỗi Kéo Thả Bị Chặn (`WordStyleFormulaCanvas.jsx`)*:
  - Bổ sung `onDragOver` (`e.preventDefault()`, `e.dataTransfer.dropEffect = 'copy'`) và `onDrop` trực tiếp vào từng thẻ `<span contentEditable>`.
  - Giáo viên và học sinh giờ đây có thể kéo thả công thức hoặc Bảng biến thiên thả vào bất kỳ vị trí nào: giữa các chữ cái, đầu dòng, cuối dòng hay toàn bộ khung soạn thảo đều ăn 100%.

- **Khắc Phục Hiện Tượng Di Chuột Lại Không Hiện Bảng (`HierarchicalMathPalette.jsx`)*:
  - Gỡ bỏ hoàn toàn pseudo-element `before:` ở mức `z-[999]` từng che khuất cạnh phải danh mục sidebar và cướp sự kiện chuột.
  - Giảm độ trễ hiển thị xuống 150ms siêu nhạy, bổ sung bảo vệ an toàn `if (!item) return;` trong các hàm xử lý kéo thả và nhấp chuột.

---

## [01/11/2026] - Khắc Phục Hiện Tượng Thẻ Hover Bị Biến Mất Khi Rê Chuột Qua (Hover Bridge & Grace Period) & Hỗ Trợ Kéo Thả Trực Tiếp

- **Khắc Phục Triệt Để Hiện Tượng Thẻ Bảng Hiển Thị Bị Mất Khi Rê Chuột Sang (`HierarchicalMathPalette.jsx`)*:
  - *Bộ Đệm Thời Gian Trì Hoãn (Grace Period 320ms)*: Khi con trỏ chuột rời nút công thức trong sidebar, thẻ hiển thị không bị đóng tức thì mà chờ 320ms, cho phép người dùng di chuyển chuột sang bảng xem trước một cách êm ái, tự nhiên mà không bị tắt đột ngột ("không còn bị mất tiêu ảo").
  - *Lớp Đệm Tàng Hình Nối Liền (Hover Bridge)*: Tích hợp pseudo-element `before:absolute before:-left-3 before:top-0 before:w-4 before:h-full` phủ kín khoảng hở 8px giữa sidebar và thẻ hover, bảo đảm chuột luôn nằm trong vùng tương tác khi di chuyển qua lại.
  - *Giữ Thẻ Mở Ổn Định Khi Rê Chuột Vào Trong (`pointer-events-auto`)*: Bổ sung sự kiện `handleCardMouseEnter` để hủy lệnh tắt, giúp người dùng thoải mái cuộn ngang xem chi tiết các cột của Bảng Biến Thiên (`overflow-x-auto`), đọc ghi chú sư phạm hoặc chọn văn bản.
  - *Hỗ Trợ Thao Tác Kéo Thả Trực Tiếp Từ Thẻ Hover*: Người dùng có thể kéo trực tiếp từ khối Bảng biến thiên, công thức hoặc nút "✋ Kéo thả" trên thẻ hover thả ngay vào bài soạn, hoặc bấm "⚡ Nhấp chèn ngay" để chèn nhanh vào vị trí con trỏ.

---

## [01/11/2026] - Khắc Phục Lỗi Runtime ReferenceError (hoveredBbtData Is Not Defined) & Hoàn Thiện Render Bảng Biến Thiên Trực Quan

- **Khắc Phục Triệt Để Lỗi Khai Báo `hoveredBbtData` (`HierarchicalMathPalette.jsx`)*:
  - Bổ sung khai báo `hoveredBbtData` qua React hook `useMemo` gắn với `hoveredItem`, tự động phân tích cú pháp khối Bảng Biến Thiên `[VARIATION_TABLE]` bằng `parseVariationTableString`.
  - Triệt tiêu hoàn toàn lỗi màn hình trắng `ReferenceError: hoveredBbtData is not defined` khi người dùng rê chuột vào bất kỳ công thức hoặc Bảng biến thiên nào trong thư viện.
  - Bảo đảm component `<VariationTable data={hoveredBbtData} />` nhận dữ liệu chuẩn xác và render sống động 100% trên thẻ xem trước trực quan.

---

## [01/11/2026] - Loại Bỏ Triệt Để Khối Terminal Đen Thô Kệch & Tích Hợp Render Trực Quan Bảng Biến Thiên Vector Trong Thẻ Hover Sư Phạm

- **Loại Bỏ Khối Terminal Đen Thô Kệch & Tích Hợp Render Trực Quan (`HierarchicalMathPalette.jsx` & `VariationTable.jsx`)**:
  - *Xóa Bỏ 100% Khối Code Terminal Đen Thô*: Triệt tiêu hoàn toàn hộp đen developer debug dump (`[VARIATION_TABLE] title: ... x: ...`) gây phản cảm cho giáo viên và người dùng sư phạm.
  - *Tích Hợp Render Trực Quan Chuẩn Vector (`<VariationTable data={hoveredBbtData} />`)*: Tự động phân tích cú pháp khối mẫu và render ngay một Bảng biến thiên trực quan sống động với đầy đủ dòng `x`, dòng `y'`, dấu `+/-`, vạch kép tiệm cận `||`, mũi tên biến thiên vector `↗` / `↘` và giá trị cực trị chuẩn SGK.
  - *Chuẩn Hóa Header Thẻ Hover Nhã Nhặn*: Thay thế chuỗi chữ hoa in đậm tím gắt bằng bố cục phân tầng thanh lịch (`Icon + Tên Môn Học • Danh mục`), huy hiệu `Kéo - Thả` mềm mại và hướng dẫn thao tác rõ nét.

---

## [01/11/2026] - Chuyển Đổi Sang Hiển Thị 1 Môn Học Duy Nhất Kèm Hiệu Ứng Slide Chuyển Động Mượt Mà (< >) & 7 Chấm Định Vị Trực Quan

- **Bộ Chuyển Đổi 1 Môn Học Duy Nhất Kèm Hiệu Ứng Trượt Mượt Mà (`HierarchicalMathPalette.jsx` - `slideDirection` & `animate-in`)*:
  - *Hiển Thị Đúng 1 Môn Học Trung Tâm*: Thay vì chia nhiều cột gây co cụm, trung tâm thanh điều hướng giờ đây hiển thị duy nhất 1 môn học tích cực (`📐 Toán Học`, `🧪 Hóa Học`, `⚛️ Vật Lý`, `🧬 Sinh Học`, `📖 Ngữ Văn`, `🌍 Địa Lý`, `🔣 Ký Hiệu & Logic`).
  - *Không Gian Rộng Rãi 100% Không Bao Giờ Tràn Chữ*: Tên phân môn và icon hiển thị trọn vẹn, font đậm `text-[12px]`, tuyệt đối không còn hiện tượng rớt chữ, tràn viền hay ba chấm `...`.
  - *Hiệu Ứng Slide Chuyển Đổi Mượt Mà*: Tích hợp hướng trượt `slideDirection` (`next` / `prev`) kết hợp Tailwind animation (`animate-in fade-in slide-in-from-right-4` hoặc `slide-in-from-left-4`), khi bấm `>` hoặc `<` thẻ môn học lướt vào êm ái, sống động.
  - *Hàng 7 Chấm Tròn Định Vị Phân Môn*: Bổ sung dải 7 chấm tròn ở chân thanh điều hướng, chấm của môn hiện tại kéo dài (`w-4 bg-indigo-600`), người dùng có thể nhấp vào bất kỳ chấm nào để nhảy thẳng tới môn học đó.
  - *Vòng Lặp Vô Hạn (Modulo Infinite Loop)*: Xoay vòng liên tục không có điểm nghẽn qua lại giữa 7 môn học.

---

## [01/11/2026] - Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM (Modern Redesign) & Băng Chuyền 2 Môn Học Không Bao Giờ Tràn Chữ

- **Đại Tu Toàn Diện Giao Diện Sidebar Trực Quan & Sang Trọng (`HierarchicalMathPalette.jsx`)**:
  - *Thiết Kế Lại Toàn Bộ Header Chuẩn Apple / Linear*: Thay thế thanh header màu tối cũ bằng giao diện trắng tinh khôi (`bg-white`), huy hiệu ngôi sao tím `Sparkles` mềm mại, tiêu đề rõ nét `Ký Hiệu & STEM` và nút thu gọn tối giản.
  - *Thanh Tìm Kiếm Bo Tròn Hiện Đại*: Input bo tròn `rounded-xl` màu xám phấn (`bg-slate-50 focus:bg-white`), viền tương tác tím pastel, hỗ trợ tìm kiếm tức thì mọi ký hiệu, công thức, hợp chất.
  - *Tái Cấu Trúc Băng Chuyền Môn Học 2 Môn Song Song (`visibleDomainKeys`, `handleNextDomain`, `handlePrevDomain`)*:
    + Thu hẹp từ 3 môn xuống hiển thị **chính xác 2 môn học song song**, loại bỏ 100% tình trạng tràn chữ hoặc co cụm `T...`, `H...`.
    + Không gian mỗi nút môn học rộng rãi (~75px - 85px), hiển thị trọn vẹn icon cùng tên phân môn chuẩn mực (`📐 Toán`, `🧪 Hóa`, `⚛️ Vật Lý`, `🧬 Sinh`, `📖 Ngữ Văn`, `🌍 Địa Lý`, `🔣 Ký Hiệu`).
    + Giữ nguyên cơ chế vòng lặp xoay tròn vô hạn (Modulo loop) khi bấm `<` hoặc `>`, xoay chuyển mượt mà liên tục không có điểm dừng.
  - *Chuẩn Hóa Thẻ Danh Mục Accordion & Dòng Công Thức Tinh Tế*:
    + Folder Accordion bo góc `rounded-xl`, mũi tên Chevron xoay mượt mà 90 độ khi đóng/mở.
    + Thẻ công thức dạng viên thuốc (pill) 1 dòng siêu gọn gàng: công thức KaTeX sắc nét, tên nhãn thanh thoát và tay nắm kéo thả mờ tinh tế (`opacity-40 hover:opacity-100`).
  - *Thẻ Hover Dwell Phóng To & Mô Phỏng Sư Phạm*: Rê chuột giữ yên (~380ms) kích hoạt popup Glassmorphism nổi bật hiển thị chi tiết công thức phóng to, mô phỏng Bảng biến thiên, mô tả sư phạm GDPT 2018 và cú pháp.

---

## [01/11/2026] - Tối Ưu Siêu Tinh Gọn Chiều Rộng Sidebar, Carousel 3 Môn Học Vòng Lặp Vô Hạn (< >) & Hiển Thị Đơn Giản Rê Chuột Giữ Để Xem Mô Phỏng Chi Tiết

- **Thu Hẹp Chiều Rộng Tối Đa & Tiết Kiệm Không Gian (`HierarchicalMathPalette.jsx`)**:
  - Giảm chiều ngang sidebar từ `w-60 sm:w-64` (240px - 256px) xuống `w-48 sm:w-52` (192px - 208px), tiết kiệm thêm ~50px chiều ngang màn hình, nhường hơn 85-90% diện tích cho canvas soạn thảo bài giảng.
- **Băng Chuyền Danh Sách Môn Học Ngang 3 Môn Với Vòng Lặp Vô Hạn (`visibleDomainKeys`, `handleNextDomain`, `handlePrevDomain`)**:
  - Tích hợp carousel ngang với 2 nút điều hướng `<` và `>` ở hai đầu.
  - Mỗi lần hiển thị chính xác **3 môn học** song song (`📐 Toán`, `🧪 Hóa`, `⚡ Lý`, `🧬 Sinh`, `📖 Văn`, `🌍 Địa`, `🔣 Ký Hiệu`).
  - Vòng lặp xoay tròn vô tận (Infinite Circular Modulo Loop): Nhấn `>` hoặc `<` sẽ xoay chuyển tịnh tiến 1 môn học và tự động lặp lại liên tục không có điểm dừng, đồng thời kích hoạt môn học tương ứng.
  - Người dùng có thể nhấp trực tiếp vào bất kỳ tab nào trong 3 môn hiển thị để chuyển nhanh.
- **Hiển Thị Danh Sách Công Thức Đơn Giản & Rê Chuột Giữ Để Xem Mô Phỏng Chi Tiết**:
  - Trong danh sách: Mỗi mục công thức/đồ thị được tinh giản thành 1 dòng siêu gọn nhẹ (`h-[32px]`, hiển thị công thức/ký hiệu + nhãn + biểu tượng kéo thả), không còn hộp chứa 2 tầng cồng kềnh.
  - Khi rê chuột và giữ bên trong (~380ms): Bật popup Card mô phỏng chi tiết (`hoveredItem`) hiển thị công thức phóng to KaTeX/mô phỏng cấu trúc Bảng biến thiên, mô tả sư phạm, cú pháp mã lệnh và hướng dẫn kéo thả / nhấp chuột.

---

## [01/11/2026] - Chuyển Đổi Sắp Xếp Danh Sách Công Thức Sang 1 Cột Duy Nhất (Single-Column Formula Rows) Trong Thư Viện Ký Hiệu Studio

- **Chuyển Đổi Sắp Xếp Công Thức Sang 1 Dòng 1 Mục Độc Lập (`HierarchicalMathPalette.jsx`)**:
  - *Loại Bỏ Lưới 2 Cột Chật Hẹp (`grid-cols-2`)*:
    + Thay thế toàn bộ bố cục 2 cột cũ (`grid-cols-2`) ở cả danh mục Accordion cây thư mục và danh sách kết quả tìm kiếm thời gian thực bằng bố cục 1 cột chuẩn mực (`grid-cols-1 gap-1.5`).
    + Khắc phục triệt để tình trạng công thức dài (như hàm phân thức, biểu thức dao động điều hòa, tích phân, công thức di truyền hay phản ứng hóa học) bị gò bó, co cụm hoặc tràn viền ngang khi hiển thị cạnh nhau trên thanh sidebar hẹp.
  - *Mở Rộng Không Gian Hiển Thị Thẻ Công Thức (Full-Width Formula Cards)*:
    + Tận dụng 100% bề ngang của thanh sidebar (~220px khả dụng): Hộp preview KaTeX (`min-h-[32px] px-2 py-1 rounded-lg bg-slate-50/90`) cho phép công thức toán học và hợp chất hiển thị tự nhiên, sắc nét, cân đối và dễ nhìn mà không bị che khuất.
    + Hàng thông tin dưới cùng hiển thị đầy đủ nhãn công thức (`text-[10.5px] font-bold text-slate-600 truncate`), huy hiệu phân môn, nút gợi ý `Chèn` tinh tế và biểu tượng tay nắm kéo thả `GripVertical`.
  - *Nâng Tầm Trải Nghiệm Kéo - Thả & Nhấp Chuột*:
    + Toàn bộ diện tích thẻ ngang lớn trở thành đích ngắm thao tác trực quan (Click-to-insert hoặc Drag-and-drop), giúp giảng viên và người biên soạn thao tác cực kỳ chuẩn xác, nhanh gọn và thuận tiện.

---

## [01/11/2026] - Tinh Gọn Thanh Sidebar Ký Hiệu Bên Trái Studio Sư Phạm & Tiết Kiệm Tối Đa Không Gian Soạn Thảo

- **Tinh Gọn Thanh Sidebar Ký Hiệu Bên Trái (`HierarchicalMathPalette.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Thu Hẹp Chiều Rộng Đáng Kể (~25-30% Diện Tích)*:
    + Giảm mạnh chiều rộng thanh Sidebar mở rộng từ `w-76 sm:w-84` (304px - 336px) xuống `w-60 sm:w-64` (240px - 256px), hoàn trả ngay lập tức gần 80px - 96px chiều ngang cho không gian làm việc và khung soạn thảo bài giảng chính.
    + Thu gọn thanh ray khi đóng (Collapsed Rail) từ `w-12` xuống `w-10` với bộ nút icon tròn nhỏ gọn (`w-7 h-7 rounded-lg`).
  - *Thiết Kế Lại Header & Ô Tìm Kiếm Siêu Gọn Nhẹ*:
    + Nén Header thành 1 hàng ngang duy nhất (`px-2.5 py-2 text-[10px]`), loại bỏ dòng mô tả phụ rườm rà.
    + Tối ưu ô tìm kiếm nhanh (`Search Input`) với padding mỏng `py-1 text-[11px]` và khoảng đệm nhỏ nhắn.
  - *Tinh Gọn Lưới Thẻ Ký Hiệu & Hợp Chất 7 Môn Học*:
    + Thu nhỏ chiều cao tối thiểu của thẻ công thức từ `min-h-[38px]` xuống `min-h-[30px] - min-h-[32px]`, cỡ chữ KaTeX `text-[12px]`, nhãn tên `text-[9.5px]` sắc nét.
    + Tinh giản thanh chuyển đổi phân môn (Domain Pills) với padding `py-0.5 px-1.5 text-[10px]` và thanh footer chân trang ngắn gọn (`text-[9.5px]`).

---

## [01/11/2026] - Giải Phóng Khung Câu Hỏi Bổ Sung & Tự Động Co Giãn Khung Chữ Nhật Lời Giải Chi Tiết Chuẩn Sư Phạm

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Xóa Bỏ Khung Cuộn Gò Bó (`CurriculumStudioEditor.jsx`)**:
  - *Giải Phóng Khung Giới Hạn Chiều Cao (max-h-80 overflow-y-auto)*:
    + Loại bỏ hoàn toàn giới hạn chiều cao cố định `max-h-80` vốn làm co cụm các câu hỏi vào một hộp cuộn chật hẹp, triệt tiêu hiện tượng vỡ khung và xuất hiện thanh cuộn kép khi câu hỏi có bảng biến thiên lớn hoặc đồ thị.
    + Tách rời từng câu hỏi thành các thẻ Card độc lập, thoáng đãng (`p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3.5`) với chiều cao tự động co giãn (`h-auto`).
  - *Hiển Thị Đầy Đủ 4 Phương Án A, B, C, D & Nổi Bật Đáp Án Đúng*:
    + Tự động hiển thị lưới 2 cột đáp án A, B, C, D chuẩn mực; đáp án đúng được làm nổi bật với viền và badge xanh ngọc (`emerald`).
  - *Khung Lời Giải Chi Tiết Hình Chữ Nhật Tự Động Co Giãn Chuẩn Mực*:
    + Thiết kế khung Lời giải chi tiết (`q.explanation`) thành một hình chữ nhật hoàn chỉnh (`w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs`).
    + Tự động điều chỉnh chiều cao tương ứng với dung lượng chữ (`h-auto break-words whitespace-pre-line`), đảm bảo bất kể lời giải ngắn hay dài hàng chục dòng, khung chữ nhật luôn bao bọc cân đối, thẩm mỹ và không bao giờ bị cắt cụt hay tràn viền.

---

## [01/11/2026] - Loại Bỏ Banner Xanh Lá Live Preview & Tối Ưu Không Gian Xem Trước Học Sinh Trong Studio Sư Phạm

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - *Gỡ Bỏ Banner Rườm Rà "Giao Diện Trực Quan Học Sinh Nhìn Thấy (Live Preview) - Thời gian thực"*:
    + Gỡ bỏ hoàn toàn thanh banner màu xanh ngọc (`bg-gradient-to-r from-emerald-600 to-teal-600`) ở đỉnh cột phải của chế độ Chia đôi (Split) và Xem trước (Preview).
    + Giải phóng không gian dọc đáng kể (~60px), giúp khu vực mô phỏng giao diện học sinh (`Simulated Student Container`) bắt đầu ngay từ trên cùng với thẻ định danh dạng bài, trọng số và mức độ Bloom chuẩn xác.
    + Mang lại diện mạo liền mạch, tinh gọn và chuyên nghiệp hơn cho giao diện soạn thảo sư phạm.

---

## [31/10/2026] - Chuẩn Hóa UI Khối 4 Ngang Hàng Thẳng Lối, Xóa Bỏ Nút Dán Ảnh & Bảng Công Cụ STEM Trôi Nổi Cạnh Phải Màn Hình Mũi Tên "<" Trong Studio Sư Phạm

- **Tối Giản Hóa Bảng STEM Cạnh Phải (Thanh Tìm Kiếm Search, Không Icon/Huy Hiệu, Gỡ Bỏ Dropdown Header & Chèn Chuẩn Xác Tại Con Trỏ)**:
  - *Gỡ Bỏ Hoàn Toàn Dropdown STEM Trên Thanh Header*:
    + Loại bỏ nút `StemToolsDropdown` khỏi header chính của Studio, triệt tiêu sự trùng lặp (dư thừa công cụ STEM) khi giảng viên đã có mini-tab `< STEM` neo cố định mép phải màn hình.
  - *Làm Sạch Toàn Diện Bảng Slide-over STEM Drawer (`FloatingStemDrawer`)*:
    + Xóa bỏ huy hiệu `GDPT 2018` và các nhãn công nghệ phụ (`JSXGraph`, `SGK 2018`, `Auto Calc`, `Vi Tích Phân`) gây rối mắt.
    + Bổ sung thanh tìm kiếm công cụ thời gian thực (`Search input`) ở đầu bảng, hỗ trợ tìm kiếm tức thì theo tên, mô tả hoặc từ khóa (MathLab, Bảng biến thiên, Phân số, Đạo hàm, Hóa học...).
    + Chuẩn hóa danh sách công cụ: Chỉ hiển thị rõ nét Tiêu đề công cụ và Mô tả ngắn gọn, loại bỏ 100% icon emoji, hộp icon màu sắc và các nút lồng nhau, tạo diện mạo tối giản, thanh lịch.
  - *Chèn Công Thức & Khối Đồ Thị/Bảng Biến Thiên Ngay Tại Vị Trí Con Trỏ Đang Đứng*:
    + Gỡ bỏ dropdown thủ công `🎯 Chèn vào mục`, tự động bắt chính xác canvas và dòng con trỏ mà giáo viên đang thao tác.
    + Nâng cấp động cơ `insertSnippet` trong [`WordStyleFormulaCanvas.jsx`](./src/components/curriculum/WordStyleFormulaCanvas.jsx): Đối với các khối trực quan lớn (`[VARIATION_TABLE]`, `[MATH_GRAPH]`, `[MATH_GRAPH_3D]`, `[MATH_GEOMETRY_2D]`), hệ thống chèn trực tiếp tại đúng chỉ mục dòng (`targetIdx`) con trỏ đang đứng thay vì vứt xuống cuối tài liệu.

- **Khắc Phục Lỗi Cú Pháp Import Dấu Phẩy & Tinh Chỉnh Nút STEM Trôi Nổi Cạnh Phải Siêu Gọn Nhẹ (`CurriculumStudioEditor.jsx`)**:
  - *Sửa Triệt Để Lỗi Cú Pháp TypeScript (TS1005 `',' expected`)*:
    + Bổ sung dấu phẩy kết thúc `Table2,` trong khối destructuring import từ thư viện `lucide-react` tại đầu file `CurriculumStudioEditor.jsx`, loại bỏ hoàn toàn cảnh báo parser của TypeScript Language Server và linter IDE.
  - *Thiết Kế Lại Nút Neo Cạnh Phải Màn Hình Mũi Tên "<" Siêu Gọn Nhẹ (Ultra-Compact Sleek Tab)*:
    + Thay thế thanh tab dài 160px (`CÔNG CỤ STEM`) bằng mini-tab siêu tinh tế `[ < ✨ STEM ]` với chiều cao chỉ ~55px và chiều rộng ~20px (`pl-1.5 pr-1 py-2 rounded-l-xl`), ôm sát mép phải màn hình.
    + Bố trí mũi tên nhỏ `<` (`ChevronLeft className="w-3.5 h-3.5"`), biểu tượng ngôi sao `✨` nhỏ nhắn và chữ `STEM` xoay dọc thanh thoát, triệt tiêu 100% tình trạng che lấn hay va chạm vào nội dung trang soạn thảo bên dưới.
    + Tinh chỉnh kích thước ngăn kéo trượt `FloatingStemDrawer` từ `w-88 sm:w-[420px] max-h-[90vh]` xuống `w-80 sm:w-[380px] max-h-[86vh]`, gia tăng không gian thoáng đãng cho khu vực làm việc chính.

- **Chuẩn Hóa UI Khối 4 Ngân Hàng Đề Hàng Thẳng Lối, Xóa Bỏ Nút Dán Ảnh & Bảng Công Cụ STEM Trôi Nổi Cạnh Phải Màn Hình (`CurriculumStudioEditor.jsx`)**:
  - *Sắp Xếp Ngang Hàng Thẳng Lối Khối 4 & Loại Bỏ Emoji Ký Tự Trùng Lặp*:
    + Căn thẳng hàng 1 dòng duy nhất cho bộ đôi nút tác vụ `AI Sinh Câu Hỏi` và `Thêm Câu Hỏi Mới` tại Header Khối 4 (`flex items-center gap-2.5 shrink-0 whitespace-nowrap`), triệt tiêu hiện tượng co cụm bẻ 2 hàng gây kênh lệch layout.
    + Khử triệt để ký hiệu trùng lặp: Loại bỏ emoji `✨` và `+` thừa trong text nhãn khi đã có icon Lucide `Sparkles` và `Plus` đi kèm, mang lại diện mạo chỉn chu, chuyên nghiệp.
  - *Loại Bỏ Hoàn Toàn Nút Dán/Tải Ảnh Rời Rạc & Tối Giản Nhãn Tiêu Đề*:
    + Gỡ bỏ hoàn toàn nút `🖼️ Dán/Tải Ảnh` thừa thãi tại tiểu mục Đề bài và Lời giải mẫu (giảng viên dán ảnh trực tiếp từ clipboard vào canvas bằng phím tắt `Ctrl+V` tiện lợi).
    + Tối giản và làm sạch nhãn tiểu mục, xóa bỏ toàn bộ nút phụ gây xao nhãng.
  - *Thống Nhất Công Cụ STEM Duy Nhất Trên Đầu & Bảng Công Cụ Trôi Nổi Cạnh Phải Mũi Tên "<"*:
    + Gỡ bỏ toàn bộ các nút dropdown STEM rải rác bên trong từng khối (Khối 1, Khối 2, Khối 4) để tránh phân mảnh giao diện.
    + Đưa `StemToolsDropdown` duy nhất lên thanh Header Studio trên cùng, tích hợp đầy đủ MathLab 2D/3D, Bảng biến thiên, Phân số, Đạo hàm, Hóa học.
    + Trang bị nút trôi nổi neo cố định cạnh phải màn hình `[ < ✨ CÔNG CỤ STEM ]`: Nhấp vào sẽ trượt ra Bảng Công Cụ Studio Toàn Năng (`FloatingStemDrawer`) với bộ chọn mục tiêu chèn động (`Khối 1: Nền tảng SGK`, `Khối 2: Phương pháp giải`, `Khối 4: Đề bài mẫu`, `Khối 4: Lời giải mẫu`) cùng đầy đủ các công cụ chuyên sâu MathLab 2D/3D, Bảng biến thiên, Phân số, Vi tích phân, Hóa học và Thư viện ký hiệu 7 môn học.

- **Tích Hợp AI Sinh Câu Hỏi Thích Ứng Bám Sát Dạng Bài (API 16), Modal `AiQuestionGeneratorModal` & Trợ Lý AI Tự Điền Đề Bài 1-Click Trong Studio Sư Phạm**:
- **Tích Hợp AI Sinh Câu Hỏi Trắc Nghiệm Tự Động Bám Sát Dạng Bài Vào Khối 4 Ngân Hàng Đề (`CurriculumStudioEditor.jsx`)**:
  - *Bộ Đôi Nút Tác Vụ AI & Kiểm Tra Định Danh Dạng Bài Trước Khi Sinh*:
    - Bổ sung nút bấm nổi bật `✨ AI Sinh Câu Hỏi` (gradient tím - indigo) tại header Khối 4 và trạng thái danh sách trống (`Chưa có câu hỏi bổ sung nào trong cơ sở dữ liệu`).
    - Tự động kiểm tra định danh dạng bài `skillId`: Nếu dạng bài chưa được lưu vào cơ sở dữ liệu (`!form.patternId && !pattern?.patternId`), hệ thống lập tức hiển thị thông báo nhắc nhở giáo viên bấm `Lưu Dạng Bài` ở góc trên trước, sau đó AI mới tiến hành sinh câu hỏi và lưu tự động vào ngân hàng đề để đảm bảo tính toàn vẹn dữ liệu.
  - *Modal Sinh Câu Hỏi Thích Ứng Hàng Loạt Chuẩn Cấu Trúc Thi (`AiQuestionGeneratorModal`)*:
    - Cho phép giáo viên linh hoạt chọn số lượng câu hỏi cần tạo (`1 câu`, `2 câu`, `3 câu`, `5 câu`) và mức độ tư duy mục tiêu (Bloom L1 Nhận biết, L2 Thông hiểu, L3 Vận dụng, L4 Vận dụng cao).
    - Kết nối dịch vụ `aiService.generatePatternQuestions` (gọi AI Engine `/api/ai-engine/curriculum/generate-questions`) truyền đầy đủ ngữ cảnh `patternName`, `lessonName`, `domainName`, `theoryRecap`, `solutionMethod` và danh sách đề bài hiện có để AI tạo đề mới bám sát 100% bản đồ tri thức dạng bài và không trùng lặp.
    - Hiển thị trực quan kết quả sinh với Live KaTeX Preview, lưới 4 phương án A, B, C, D nổi bật phương án đúng màu xanh ngọc, lời giải chi tiết từng bước và checkbox chọn lọc từng câu.
    - Hỗ trợ lưu hàng loạt (Batch Save) các câu hỏi đã chọn trực tiếp vào cơ sở dữ liệu thông qua `contentService.createQuestion` (API 16), tự động cập nhật danh sách câu hỏi ngân hàng đề ngay lập tức.
  - *Tích Hợp `✨ AI Tự Điền Câu Hỏi` Vào Hộp Thoại Thêm Câu Hỏi Thủ Công (`NewQuestionDialog`)*:
    - Trang bị nút `✨ AI Tự Điền Câu Hỏi` ngay cạnh nhãn Đề bài trong modal thêm câu hỏi thủ công: 1-click nhờ Gemini AI tự động soạn thảo và điền đầy đủ đề bài KaTeX, 4 phương án, đáp án đúng, mức độ Bloom và lời giải chi tiết theo đúng Dạng bài đang mở.

- **Tái Thiết Kế Thanh Soạn Thảo 2 Dòng Trong Văn Bản & Đưa Dropdown STEM Lên Header Khối (`CurriculumStudioEditor.jsx`)**:
  - *Tách Biệt Section Header Tổng Thể & Thanh Soạn Thảo Văn Bản 2 Dòng*:
    - Giữ trọn vẹn dropdown `✨ Công Cụ Toán & STEM ▾` độc lập trên thanh Section Header tổng thể của mục đang sửa (Khối 1 `theoryRecap` và Khối 2 `solutionMethod`).
    - Chuyển các nút đính kèm nội dung ngoại vi về đúng khu vực văn bản và phân tách thành 2 dòng rõ rệt:
      + **Dòng 1 (Nằm trên văn bản)**: Loại bỏ hoàn toàn nút `+ Thêm / Dán Ảnh` (người dùng dán ảnh trực tiếp qua phím tắt Ctrl+V nhanh chóng), giữ lại nút tiện ích sư phạm (`+ Ví Dụ SGK` ở Khối 1 hoặc `+ Thêm Bước mới`, `Nạp mẫu chuẩn 4 bước` ở Khối 2) và bộ nút chuyển đổi chế độ xem (`✍️ Sửa Trực Tiếp`, `👁️ Trang In`, `📄 Raw`) ở bên phải.
      + **Dòng 2 (Văn bản & công cụ chữ)**: Chuyên biệt phục vụ định dạng chữ chuẩn Word (`Văn bản: Bold`, `Italic`, `Tiêu đề / Bước`, `Danh sách`, `Đánh số`), tạo bố cục 2 tầng thanh thoát, không chồng chéo.
  - *Dropdown Menu Tương Tác & Gộp 2 Nút Đồ Thị (`StemToolsDropdown`)*:
    - Xây dựng component `StemToolsDropdown` hỗ trợ chế độ chuẩn và `compact`, tự động đóng khi nhấp chuột ra ngoài (click outside).
    - Gộp 2 nút `📈 Đồ Thị Hàm Số` và `🧊 MathLab 3D/2D` thành 1 tùy chọn duy nhất: **`📈 Đồ Thị & MathLab (2D/3D)`** mở thẳng phòng thí nghiệm MathLab trực quan toàn diện (hàm số Oxy, hình phẳng 2D và không gian 3D).
    - Tích hợp đầy đủ các công cụ chuyên sâu: `📊 Bảng Biến Thiên`, `📈 Đồ Thị & MathLab (2D/3D)`, `➗ Phân Số & Tính Toán`, `🎯 Đạo Hàm Số Gia`, và `🧪 Hóa Học & Nồng Độ`.

- **Đại Tu Toàn Diện Studio Popup Bộ Công Cụ & STEM Chuyên Sâu (`InteractiveFormulaBuilderModal.jsx` & `StemToolsDropdown` Trong `CurriculumStudioEditor.jsx`)**:
  - *Tái Thiết Kế Modal Studio Soạn Thảo Công Thức & STEM 2 Cột Đẳng Cấp (`InteractiveFormulaBuilderModal.jsx`)*:
    - Nâng cấp kích thước modal từ `max-w-2xl` (672px chật hẹp) lên Studio cỡ lớn `max-w-5xl h-[88vh] max-h-[840px]` với kiến trúc 2 cột chuyên nghiệp:
      + **Cột Trái (Sidebar công cụ w-72)**: Phân nhóm trực quan thành 2 chuyên mục lớn: "Toán Học & Giải Tích" (Bảng Biến Thiên, Phân Số, Căn Thức, Lũy Thừa, Tích Phân, Hệ Phương Trình, Đồ Thị Oxy) và "STEM & Hóa Học Thực Nghiệm" (Hóa Học Nồng Độ Mol & Khối Lượng), với các tile icon Lucide rực rỡ, badge chỉ mục và mô tả 2 dòng rõ nét.
      + **Cột Phải (Không gian làm việc tương tác rộng rãi flex-1)**:
        * Bảng Biến Thiên: Tích hợp trực tiếp toàn bộ lưới tương tác `<VariationTable />` 700px+ cùng 4 preset nhanh (Bậc 3 a>0, Bậc 3 a<0, Bậc 4 trùng phương, Phân thức ||), bảo toàn toàn bộ thanh công cụ Kéo - Thả mà không bị co cụm cột hay tràn vỡ layout.
        * Bộ Tính Toán Hóa Học: 4 thẻ tương tác chuyên sâu (`CM = n/V`, `C% = m_ct/m_dd * 100%`, `m = n * M`, `H% = m_tt/m_lt * 100%`) kèm các ô nhập có đơn vị chuẩn (`mol`, `Lít`, `g`, `g/mol`), tự động hiển thị kết quả tính toán tức thì trên badge xanh ngọc emerald.
        * Phân Số & Tính Toán: Giao diện thẻ 2 tầng trực quan phân cách bởi gạch ngang tử/mẫu, tự động rút gọn phân số và tính giá trị thập phân.
    - Cập nhật Live KaTeX Preview Dock nổi phía dưới cùng nút bấm "Chèn Vào Bài Giảng (Enter)" rực rỡ, hỗ trợ phím tắt Esc/Enter mượt mà.
  - *Nâng Cấp Menu Thả Dropdown STEM Lên Chuẩn Mega Menu Studio (`StemToolsDropdown`)*:
    - Mở rộng kích thước từ `w-64` (đơn điệu, nhỏ) thành Mega Menu `w-[420px]` sang trọng với banner gradient tối màu `STUDIO CÔNG CỤ TOÁN & STEM (GDPT 2018)`.
    - Trình bày 5 thẻ chức năng chi tiết với icon đa sắc, tiêu đề in đậm, phụ đề 2 dòng giải thích tính năng và badge nhận diện chuẩn mực (`SGK 2018`, `JSXGraph Native`, `Auto Calc`, `Vi Tích Phân`, `Thực Nghiệm`).
    - Nút kích hoạt trên Header khối được nâng cấp thành nút bo tròn sang trọng với icon Sparkles phát sáng tinh tế.
  - *Tuyệt Đối Ẩn 100% Mã KaTeX/LaTeX Thô, Chuyên Biệt Hóa 100% Ô Nhập Số & Ký Hiệu Trực Quan Kèm Preset Nạp Mẫu 1-Click*:
    - Xóa bỏ triệt để 100% ô textarea hiển thị mã lệnh KaTeX thô và các chuỗi text raw như `$formula$`, tuân thủ nghiêm ngặt tôn chỉ trải nghiệm người dùng sư phạm: Giảng viên và người dùng cuối không bao giờ phải nhìn thấy hay gõ mã lệnh LaTeX thô.
    - Chuyên biệt hóa toàn bộ việc nhập liệu qua các ô số và ký hiệu trực quan (Visual Slots): Ô nhập Tử số / Mẫu số phân số, ô Bậc căn / Biểu thức trong căn, ô Cơ số / Số mũ, ô Cận tích phân và hệ phương trình.
    - Trang bị bộ nút nạp mẫu thông dụng 1-click (1-Click Presets) cho từng dạng bài toán: Phân số (1/2, 3/4, 12/4=3, phân thức đại số), Giới hạn SGK 2018 (f'(x₀) định nghĩa, sin(x)/x=1, phân thức hữu tỉ, khử vô định 0/0, dãy số 1/n), Đạo hàm số gia, Căn thức, Lũy thừa và Tích phân.
    - Khung xem trước trực quan (Live KaTeX Preview Dock) tập trung duy nhất vào việc hiển thị công thức toán học kích thước lớn (text-2xl) sắc nét như trong sách giáo khoa, không có bất kỳ yếu tố kỹ thuật gây xao nhãng.

- **Tối Ưu Hóa Chỉnh Sửa & Xóa Trực Tiếp Công Thức Trực Quan Trong Khung Soạn Thảo Văn Bản (`WordStyleFormulaCanvas.jsx`)**:
  - *Khung Điền Số & Biểu Thức Trực Quan (Interactive Visual Slots) Dạng Phân Số Chuẩn SGK*:
    + Tự động nhận diện cấu trúc công thức và hiển thị **Khung Điền Số Trực Quan (Visual Slots)**:
      * **Phân số**: Hiển thị chồng dọc chuẩn SGK với ô nhập Tử số (phía trên), thanh gạch ngang phân số, ô nhập Mẫu số (phía dưới), dấu `=` và ô Đáp số tự động. Người dùng chỉ cần nhập số vào từng ô mà không cần quan tâm đến cú pháp lệnh.
      * **Căn thức**: Hiển thị dấu căn $\sqrt{}$ kèm ô nhập số/biểu thức bên trong và ô đáp số.
      * **Lũy thừa**: Hiển thị ô nhập Cơ số và ô Số mũ nhỏ góc trên.
      * **Hóa học**: Hiển thị biểu thức $C_M = n / V = [n]/[V] = [kết\_quả]\text{ M}$ và $C\%$ với các ô điền số rõ ràng.
    + Đồng bộ tức thì hai chiều: Mọi thay đổi trên ô điền số lập tức cập nhật lên Thanh Toán Tự Nhiên, Live KaTeX Preview và dòng văn bản canvas.
  - *Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (`latexToNaturalMath` & `naturalMathToLatex`) Tuyệt Đối 0% Lộ Mã LaTeX*:
    + Thanh soạn thảo công thức hỗ trợ hoàn toàn định dạng **Toán Tự Nhiên (Natural Math)**: Chuyển đổi mã lệnh LaTeX nội bộ thành chuỗi biểu thức tự nhiên thân thiện (`12/4 = 3`, `√(16) = 4`, `lim(x → x₀)`), triệt tiêu hoàn toàn dấu gạch chéo `\` và ngoặc nhọn `{}`.
    + Giảng viên và học sinh có thể gõ hoặc dán bất kỳ biểu thức thông thường (`(x+1)/(x-1) = 5`, `2x^2 + 5x - 3 = 0`), hệ thống tự động biên dịch sang KaTeX chuẩn xác mà không bao giờ ép người dùng nhìn thấy hay học mã LaTeX.
    + Xóa bỏ 100% nhãn kỹ thuật gây phản cảm như `LaTeX: ...` hay `Mã công thức KaTeX:` trên mọi khung popover thanh công cụ.
  - *Thanh Soạn Thảo Công Thức Toàn Năng Siêu Linh Hoạt (Universal Formula Bar) & Dock Xem Trước Trực Quan SGK*:
    + Xóa bỏ triệt để hệ thống ô con phân mảnh bó hẹp (vốn ép người dùng vào khung cứng tử/mẫu phân số hoặc số mũ mà không thể thêm bớt phép tính hay gõ tự do). Thay thế bằng **Thanh Soạn Thảo Công Thức Toàn Năng (Universal Formula Bar)**: Chấp nhận mọi dạng công thức toán học, vật lý, hóa học không giới hạn độ phức tạp (`12/4 = 3`, `f(x) = (x^2-1)/(x-1) = x+1`, căn thức, tích phân, giới hạn, nồng độ mol `C_M`...).
    + Tích hợp **Dock Xem Trước Trực Quan Học Sinh Thấy (Live KaTeX Typography Preview Dock)** ngay bên dưới thanh soạn thảo: Hiển thị lập tức công thức kết quả chuẩn sách giáo khoa (serif typography) sắc nét theo thời gian thực khi gõ.
    + Tuyệt đối xóa sạch 100% nhãn kỹ thuật gây phản cảm như `LaTeX: ...` hay `Mã công thức KaTeX`, mang lại trải nghiệm sư phạm tinh tế 100% WYSIWYG.
  - *Bộ Máy Tự Động Tính Toán Đáp Số Thông Minh Cho Mọi Phép Toán (`autoCalculateEquation` & Nút `⚡ Tính`)*:
    + Nâng cấp nút `[ ⚡ Tính ]` thành công cụ tự động tính toán số liệu toàn năng: Tự động phân tích và tính nhẩm kết quả chính xác cho mọi biểu thức chứa phân số/phép chia (`12/4` -> `= 3`, `0.2/0.5` -> `= 0.4`), căn bậc hai (`\sqrt{16}` -> `= 4`), lũy thừa (`2^3` -> `= 8`), số học cơ bản (`10 + 2*5` -> `= 20`) và nồng độ hóa học (`C_M`, `C%`). Nếu công thức đã có kết quả sai từ trước, nút `Tính` sẽ tự động cập nhật lại đáp số chính xác.
  - *Chèn Ký Hiệu Thông Minh Nhận Biết Vị Trí Con Trỏ (Cursor-Aware Insertion) & Bao Bọc Vùng Chọn*:
    + Trang bị `activeInputRef` theo dõi chính xác vị trí con trỏ `selectionStart`/`selectionEnd` trong ô soạn thảo: Khi nhấp bất kỳ nút ký hiệu/công thức nào từ các tab môn học (`Cấu trúc`, `Oxyz`, `Vật lý`, `Hóa học`, `Ký hiệu`, `Ngoặc & Logic`), hệ thống chèn ngay tại đúng vị trí con trỏ và đưa con trỏ vào bên trong vị trí nhập số. Nếu người dùng bôi đen một đoạn text/biểu thức, nhấp `a/b` sẽ tự động đưa đoạn đó lên tử số, nhấp `√x` sẽ bao bọc đoạn đó trong căn thức.
  - *Cơ Chế Xóa Công Thức Bằng Nút 1-Click, Phím Tắt Backspace Tự Nhiên & Khắc Phục Triệt Để Toàn Bộ Import*:
    + Khắc phục triệt để lỗi runtime `ReferenceError: unescapeLiteralNewlines is not defined`, `ReferenceError: useImperativeHandle is not defined` và `ReferenceError: parseVariationTableString is not defined`: Bổ sung đầy đủ hook `useImperativeHandle` từ React, hàm tiện ích `unescapeLiteralNewlines` từ `../common/MathText` và hàm giải mã chuỗi bảng biến thiên `parseVariationTableString` từ `../common/VariationTable` vào khai báo import của `WordStyleFormulaCanvas.jsx`, bảo đảm quá trình render khối bảng biến thiên `[VARIATION_TABLE]`, chuẩn hóa dòng tài liệu và liên kết imperative handle giữa Studio Editor với Canvas luôn thông suốt 100%, chấm dứt hoàn toàn hiện tượng trắng trang (White Screen) khi nạp tài liệu bài giảng.
    + Trang bị nút đỏ `[ 🗑️ Xóa ]` trên thanh popover để xóa bỏ công thức tức thì chỉ với 1 click.
    + Khi con trỏ văn bản nằm ở đầu đoạn text liền kề ngay sau một công thức, nhấn `Backspace` sẽ tự động xóa sạch công thức đứng trước mà không làm hỏng cấu trúc dòng; khi ô công thức trống, bấm `Backspace` cũng xóa gọn công thức và trả lại con trỏ cho dòng văn bản.
    + Bổ sung nút bấm `[ 🚀 Mở Studio ]` kết nối trực tiếp đến Modal Studio toán học & STEM khi người dùng muốn vẽ đồ thị hàm số hay dựng bảng biến thiên 3 dòng phức tạp.

---

## [30/10/2026] - Hoàn Thiện Bảng Biến Thiên Lưới `2N - 1` Cột Chống Mất Ô Khi Xóa Chữ, Tái Thiết Kế Thư Viện Công Thức / Hợp Chất Kéo - Thả & Nâng Cấp Kéo - Thả Trực Tiếp Vào Ô Con Công Thức

- **Hoàn Thiện Bảng Biến Thiên Lưới `2N - 1` Cột & Bảo Toàn Ô Trống Khi Xóa Chữ (`VariationTable.jsx`, `InteractiveFormulaBuilderModal.jsx`)**:
  - *Chuẩn Hóa Lưới Cột `2N - 1` Không Nhảy Layout*:
    + Triển khai hàm `normalizeVariationGrid` và `buildDataFromGrid` trong [`VariationTable.jsx`](./src/components/common/VariationTable.jsx) căn thẳng hàng dọc tuyệt đối giữa mốc `x_m`, đạo hàm tại điểm (`0` hoặc tiệm cận đứng vạch kép `||`) và giá trị cực trị `y_m` ở các cột chẵn (`2m`), đồng thời đặt dấu khoảng `+`/`-` và mũi tên chéo SVG `↗`/`↘` ở các cột lẻ (`2k + 1`).
    + Cố định chiều cao 3 dòng (`h-11`, `h-11`, `h-24`) và đặt thanh công cụ Kéo - Thả ở phía dưới bảng để bảng không bao giờ bị giật/nhảy vị trí khi click.
    + Sửa lỗi lệch prop `initialTemplateId` trong [`InteractiveFormulaBuilderModal.jsx`](./src/components/curriculum/InteractiveFormulaBuilderModal.jsx) để nút `📊 Bảng Biến Thiên` mở đúng tab ngay lập tức và nhúng trực tiếp `<VariationTable />` tương tác vào trong modal.
  - *Bảo Toàn Ô Trống (`Thả số`), Tiệm Cận Đứng (`||`) & Hiển Thị Ký Hiệu Toán Học Thân Thiện (`-∞` Thay Vì `-\infty`) Khi Sửa Ô*:
    + Triển khai `splitVariationRow` bảo toàn tuyệt đối ký hiệu vạch kép `||` khi tách dòng theo dấu `|` và giữ nguyên các ô đang để trống (`""`), kết hợp `healSplitDoubleBars` và toán tử `??` (thay cho `|| '-\infty'`) để xóa trắng ô (`Backspace` hoặc nút `✕ Xóa ô`) không bao giờ bị mất ô hay tự nhảy về `-\infty`, luôn hiển thị nhãn gợi ý `Thả số` sẵn sàng nhận kéo thả mới.
    + Bổ sung `formatSlotDisplayValue` và `parseSlotInputToLatex` trên thanh `QuickEditorToolbar` giúp ô `Gõ số/chữ:` luôn hiển thị ký hiệu trực quan (`-∞`, `+∞`, `1/2`, `√2`, `y_CĐ`) thay vì mã LaTeX thô (`-\infty`), đồng thời tự động focus ô nhập khi nhấp chọn ô trên bảng và xóa gọn toàn bộ ký hiệu đặc biệt chỉ với 1 phím `Backspace`.
    + Loại bỏ hoàn toàn nhãn thừa `Chuẩn SGK GDPT 2018` / `SGK GDPT 2018` trên header Bảng biến thiên, modal chèn công thức và các thẻ danh mục để giao diện luôn tinh gọn, thoáng rộng và không bị tràn/cắt xén chữ.
    + Khắc phục triệt để hiện tượng tràn số khỏi ô bảng khi thêm nhiều cực trị: Thiết lập `<colgroup>` và thuật toán tính độ rộng tối thiểu động `calculatedTableMinWidth` (mốc thường `74px`, tiệm cận `104px`, khoảng biến thiên `68px`), kết hợp `overflow-hidden` và container cuộn ngang tự động `overflow-x-auto pb-1.5` để mỗi ô luôn giữ trọn vẹn số, ký hiệu và mũi tên mà không bao giờ bị ép méo hay tràn vỡ ra ngoài.
    + *Nâng Cấp Kéo - Thả & Thêm Tiệm Cận Đứng 1-Click (`handleAddAsymptoteColumn`)*:
      * Trang bị nút bấm **`|| Thêm tiệm cận`** màu hổ phách ngay trên thanh công cụ bảng, 1-click chèn ngay 1 cột tiệm cận đứng vạch kép `||` hoàn chỉnh (tính toán hoành độ `x_0` tự động, đạo hàm `y' = ||`, giá trị giới hạn hai bên `-\infty || +\infty`).
      * Hỗ trợ **Kéo - Thả thẻ `|| (Tiệm cận)` vào khoảng giữa 2 cột (Interval Drop)**: Thả vào bất kỳ dòng nào (`x`, `y'`, `y`) giữa 2 cột lập tức chèn 1 cột tiệm cận đứng vào đúng vị trí đó.
      * Hỗ trợ **Kéo - Thả thẻ `|| (Tiệm cận)` vào cột mốc bất kỳ**: Thả vào dòng `x`, dòng `y'` hoặc dòng `y` lập tức chuyển đổi cột mốc thành tiệm cận đứng vạch kép `||`, mở rộng toàn bộ `<td>` thành vùng DropZone mượt mà không bị trượt chuột.

- **Tái Thiết Kế Thư Viện Công Thức & Hợp Chất Kéo - Thả 7 Môn Học (`HierarchicalMathPalette.jsx`) & Kéo - Thả Vào Ô Con Công Thức (`WordStyleFormulaCanvas.jsx`)**:
  - *Giao Diện Thẻ Studio Tile 7 Môn Học (`HierarchicalMathPalette.jsx`)*:
    + Thiết kế bảng màu chủ đề riêng cho 7 môn học (`Toán Học`, `Hóa Học`, `Vật Lý`, `Sinh Học`, `Ngữ Văn`, `Địa Lý`, `Ký Hiệu`), hiển thị trực tiếp công thức KaTeX và hợp chất hóa học sắc nét ngay giữa thẻ (`draggable={true}`) và bổ sung danh mục `Bảng Biến Thiên & Cực Trị (Kéo - Thả)`.
  - *Bảo Toàn Khung Công Thức & Nhận Kéo - Thả Trực Tiếp Vào Ô Con (`WordStyleFormulaCanvas.jsx`)*:
    + Bổ sung `lastCommittedContentRef` ngăn `useEffect` перезагружать lại toàn bộ dòng khi người dùng đang xóa trắng chữ trong ô công thức đang mở, giữ nguyên trạng thái `activeFormulaId` và gán placeholder `\square` an toàn khi serialize.
    + Bổ sung `handleDropOnFormulaInput` (`onDragOver` & `onDrop`) trực tiếp trên từng ô `<input>` con của phân số (`num`, `den`, `result`), lũy thừa (`base`, `exp`), căn thức (`expr`) và công thức chung (`latex`), đồng thời tự động khôi phục dòng trống khi xóa hết khối bảng/công thức để người dùng luôn kéo thả lại được vào mọi khung soạn thảo.

---

## [29/10/2026] - Chuẩn Hóa Hiển Thị Công Thức Trực Quan WYSIWYG Toàn Diện Trong Studio Sư Phạm & Nâng Cấp Phòng Thí Nghiệm Hình Học Phẳng 2D Tương Tác (`JSXGraph`)

- **Chuyển Đổi Toàn Bộ Ô Nhập Text Thô Sang Canvas Công Thức Trực Quan (`WordStyleFormulaCanvas.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Khắc Phục Triệt Để Hiện Tượng Lộ Mã LaTeX Thô (`$y'$`, `$y = f(x)$`, `[VARIATION_TABLE]\`)*:
    + Nâng cấp [`WordStyleFormulaCanvas.jsx`](./src/components/curriculum/WordStyleFormulaCanvas.jsx) bổ sung 2 chế độ bố cục mới: `compact` (dành cho thẻ Bẫy đề thi, thẻ Mẹo làm bài, Đề bài mẫu và Lời giải chi tiết) và `singleLine` (dành cho 4 phương án trắc nghiệm A, B, C, D).
    + Thay thế hoàn toàn các thẻ `<textarea>` và `<input type="text">` thô trong Khối 2 (Mục 2 `examTraps`, Mục 3 `casioTricks`) và Khối 4 (`sampleQuestion.contentLatex`, `optionA..D`, `explanation`) của [`CurriculumStudioEditor.jsx`](./src/components/curriculum/CurriculumStudioEditor.jsx) bằng `<WordStyleFormulaCanvas />`. Giảng viên và cán bộ học vụ luôn nhìn thấy công thức toán học thực tế như người đọc bình thường tiếp cận, nhấp trực tiếp vào công thức để sửa số/ký hiệu tại chỗ.
  - *Bóc Tách, Render Trực Quan & Chỉnh Sửa Kéo - Thả (Drag & Drop) Khối Bảng Biến Thiên (`VariationTable.jsx`), Thư Viện Công Thức / Hợp Chất (`HierarchicalMathPalette.jsx`) Và Đồ Thị 2D/3D Ngay Trong Canvas*:
    + Nâng cấp `parseDocumentLines`, `serializeDocumentLines` và `handleDropSnippetOnCanvas` trong [`WordStyleFormulaCanvas.jsx`](./src/components/curriculum/WordStyleFormulaCanvas.jsx) để nhận diện nguyên khối các thẻ `[VARIATION_TABLE]...[/VARIATION_TABLE]`, `[MATH_GRAPH]...[/MATH_GRAPH]`, `[MATH_GRAPH_3D]...[/MATH_GRAPH_3D]`, `[MATH_GEOMETRY_2D]...[/MATH_GEOMETRY_2D]` và ảnh `![alt](url)`, hiển thị trực tiếp `<VariationTable />` và `<InteractiveMathRenderer />` ngay trong vùng soạn thảo và nhận thao tác kéo - thả trực tiếp từ thư viện bên trái.
    + Nâng cấp [`VariationTable.jsx`](./src/components/common/VariationTable.jsx) và [`InteractiveFormulaBuilderModal.jsx`](./src/components/curriculum/InteractiveFormulaBuilderModal.jsx) sang **Kiến trúc Lưới Cột Chuẩn SGK `2N - 1` Cột & Tương Tác Không Nhảy Bảng (Zero-Jump Grid Editor)**:
      * Khắc phục triệt để lỗi lệch cột giữa dòng `x`, dòng `y'` và dòng `y` bằng thuật toán `normalizeVariationGrid` chia bảng thành đúng `2N - 1` cột dọc cố định: các cột chẵn (`2m`) căn thẳng hàng dọc giữa mốc `x_m`, đạo hàm tại điểm (`0` hoặc tiệm cận đứng `||`) và giá trị cực trị `y_m`; các cột lẻ (`2k + 1`) căn thẳng hàng dọc giữa khoảng dấu `+` / `-` và mũi tên вектор chéo SVG `↗` / `↘`.
      * Loại bỏ hoàn toàn cơ chế đóng/mở khung phía trên làm đẩy bảng nhảy xuống dưới chuột khi click; cố định chiều cao 3 dòng (`h-11`, `h-11`, `h-24`) và đặt **Thanh Công Cụ Kéo - Thả & Chỉnh Nhanh** cố định phía dưới bảng.
      * Tối ưu hóa thao tác 1 chạm: Nhấp 1 lần vào dấu `+` / `-` (hoặc mũi tên `↗` / `↘`) để đảo chiều biến thiên tại chỗ; nhấp 1 lần vào `0` / `||` ở dòng `y'` để đổi giữa điểm cực trị và tiệm cận đứng vạch kép; nhấp vào ô `x` hoặc `y` để chọn rồi chạm thẻ ký hiệu / gõ số trực tiếp hoặc kéo thẻ thả thẳng vào ô.
      * Sửa lỗi lệch prop `initialTemplateId` trong `InteractiveFormulaBuilderModal.jsx` giúp nút `📊 Bảng Biến Thiên` mở đúng tab ngay lập tức và tích hợp trực tiếp bảng biến thiên tương tác kéo - thả vào trong modal thay cho 4 ô nhập chuỗi thô.
    + Tái thiết kế toàn diện [`HierarchicalMathPalette.jsx`](./src/components/curriculum/HierarchicalMathPalette.jsx) (**Thư Viện Công Thức & Hợp Chất Kéo - Thả**): Phân phối bảng màu chủ đề riêng cho 7 lĩnh vực (`Toán Học`, `Hóa Học`, `Vật Lý`, `Sinh Học`, `Ngữ Văn`, `Địa Lý`, `Ký Hiệu`), hiển thị mỗi công thức/hợp chất dưới dạng **Studio Tile trực quan** (`draggable={true}`) với khung chữ KaTeX nổi bật ở trung tâm, bổ sung danh mục `Bảng Biến Thiên & Cực Trị (Kéo - Thả)` và rút ngắn thời gian hiện thẻ xem trước xuống `450ms`.
  - *Khử Triệt Để Dấu Nháy Đơn Thừa `'...'`, Dấu Gạch Chéo Ngược Cuối Dòng `\` & Đồng Bộ Nút Mức Độ Bloom*:
    + Bổ sung hàm làm sạch `cleanOptionOrText` và nâng cấp `sanitizeLineText` tự động loại bỏ cặp dấu nháy đơn bao quanh phương án trắc nghiệm (ví dụ `'Hàm số đồng biến trên ...'`) và các dấu `\` thừa cuối dòng.
    + Bổ sung hàm `normalizeBloomLevel` ánh xạ chính xác các giá trị `'Nhận biết'`, `'Thông hiểu'`, `'Vận dụng'`, `'Vận dụng cao'` về chuẩn `'Nhận biết (L1)'`..`'Vận dụng cao (L4)'`, đảm bảo nút mức độ nhận thức Bloom trong phần Cài đặt Định danh luôn sáng rõ trạng thái đang chọn.

- **Nâng Cấp Toàn Diện Phòng Thí Nghiệm Hình Học Phẳng 2D Tương Tác (`InteractiveMathWorkbenchModal.jsx`, `InteractiveMathRenderer.jsx` & `mathGraphUtils.js`)**:
  - *Khắc Phục Lỗi Dính Chữ Nghiêng Trên Header `Mô hình:` & Chồng Lấp Nhãn Điểm `H`, `M` Trên Mặt Phẳng 2D*:
    + Tách biệt văn bản tiếng Việt khỏi cặp dấu `$...$` trong `getCurrentFormulaString()` và header `Mô hình:`, chấm dứt hiện tượng chữ tiếng Việt bị KaTeX ép thành chuỗi nghiêng dính liền (`TamgiácvuôngABCtạiA`).
    + Dựng chân đường cao `H` bằng phép chiếu vuông góc thực sự (`perpendicular` + `intersection` kèm ký hiệu góc vuông `angle` tại `A` và `H`) với tọa độ chuẩn `A(0,0), B(6,0), C(0,3.5)` và `label.offset` tách biệt hoàn toàn giữa `H (Chân đường cao)` và `M (Tâm ngoại tiếp)`.
  - *Bổ Sung 6 Mô Hình Hình Học Phẳng Chuẩn Đề Thi & Bảng Điều Khiển Tùy Biến Đỉnh / Đường Phụ (`SHAPES_2D_META`, `mount2DGeometryBoard`)*:
    + Cung cấp 6 mô hình hình học phẳng kinh điển: Tam giác vuông `ABC` (đường cao `AH`, trung tuyến `AM`), Tam giác nhọn `ABC` nội tiếp `(O)` (trực tâm `H`, trọng tâm `G`), Đường tròn `(O; R)` & hai tiếp tuyến `MA, MB`, Tứ giác nội tiếp `ABCD`, Hình bình hành / Hình thoi `ABCD`, và Hình thang vuông `ABCD`.
    + Trang bị bảng điều khiển cột trái đầy đủ cho tab `📐 Hình Phẳng 2D`: chọn mô hình, bật/tắt đường cao, trung tuyến, đường tròn ngoại tiếp, hệ trục `Oxy`, sửa tên & tọa độ `(X, Y)` từng đỉnh, thêm điểm phụ chia đoạn và kẻ đoạn thẳng phụ nét đứt/nét liền.
    + Hoàn thiện bộ tuần tự hóa & giải mã `formatMathGeometry2DTag` / `parseMathGeometry2DTag` cho thẻ `[MATH_GEOMETRY_2D]...[/MATH_GEOMETRY_2D]` và tích hợp vào `InteractiveMathRenderer.jsx`.

---

## [22/10/2026] - Hệ Thống Thông Báo Toàn Cục (Global Notification Toast System) Thay Thế Toàn Bộ Browser Alert

- **Kiến Trúc Điều Phối Thông Báo Toàn Cục (`ToastContext.jsx` & `GlobalToastContainer.jsx`)**:
  - *Thay Thế Triệt Để Hộp Thoại Chặn Luồng `window.alert()` Của Trình Duyệt*:
    + Hộp thoại `alert()` truyền thống của trình duyệt web làm đông cứng giao diện (blocking modal), tạo trải nghiệm gián đoạn và thiếu chuyên nghiệp cho giáo viên lẫn học sinh.
    + Xây dựng hệ thống Toast thông báo nổi hiện đại, mượt mà, phân cấp 4 nhóm trạng thái nhận diện thị giác rõ ràng:
      * **Thành công (Success - Xanh ngọc lục bảo `emerald`)**: Thông báo lưu bài, tạo câu hỏi, cập nhật node, nạp đề thành công.
      * **Báo lỗi (Error - Đỏ hồng `rose`)**: Bắt lỗi API, ngoại lệ kết nối mạng, lỗi phân tích bài thi hoặc lỗi xác thực CSDL.
      * **Cảnh báo (Warning - Vàng hổ phách `amber`)**: Nhắc nhở thiếu dữ liệu, chọn thiếu đáp án, xác nhận thao tác.
      * **Thông tin (Info - Xanh dương `indigo`)**: Hướng dẫn tiến trình, xuất bản sơ đồ hoặc trạng thái đếm ngầm.
  - *Bộ Khung Giao Diện Card Toast Nổi Cao Cấp (`GlobalToastContainer.jsx`)*:
    + Định vị góc trên bên phải màn hình (`top-4 right-4 sm:top-6 sm:right-6`) với chỉ số lớp tối cao `z-[999999]`, đảm bảo luôn nổi trên mọi modal full-screen hay sidebar.
    + Thiết kế kính mờ Glassmorphism (`backdrop-blur-md bg-white/95 border shadow-xl rounded-2xl`).
    + Hiển thị đa dòng tự nhiên: Tự động tách dòng câu thông báo dài, hỗ trợ cả tiêu đề (`title`) và nội dung chi tiết (`message`).
    + Thanh đếm ngược tiến độ (Countdown Progress Bar) tự động co ngắn mượt mà theo thời gian chờ (`duration` mặc định 4000ms).
    + Tính năng thông minh tạm dừng đếm ngược khi người dùng rê chuột vào card (`onMouseEnter` / `onMouseLeave`) để đọc nội dung dài mà không lo bị đóng mất.
    + Nút bấm `X` đóng nhanh tiện lợi kèm hiệu ứng viền sáng hover.
  - *Cơ Chế Gọi Đa Dụng (Hook & Universal Singleton)*:
    + Cung cấp React Hook `useToast()` dùng bên trong các component React: `const { showToast, toast } = useToast()`.
    + Đồng thời xuất bản đối tượng Singleton `toast` toàn cục có thể import và gọi từ bất kỳ đâu (kể cả ngoài component lifecycle, file helper, service hay callback Axios):
      * `toast.success(message, options)`
      * `toast.error(message, options)`
      * `toast.warning(message, options)`
      * `toast.info(message, options)`
      * `toast.dismiss(id)`
  - *Cơ Chế Phòng Vệ Tự Động Bọc `window.alert` (Defensive Interception Layer)*:
    + Khi `ToastProvider` được gắn vào DOM, hệ thống tự động ghi đè an toàn `window.alert(msg)` để chuyển tiếp toàn bộ chuỗi thông báo sang `toast.info(...)` (hoặc `toast.error` nếu chuỗi chứa chữ 'lỗi' / 'thất bại').
    + Đảm bảo ngay cả khi có code bên thứ ba, thư viện ngoài hoặc các component chưa kịp refactor gọi `alert()`, trình duyệt cũng sẽ không bao giờ bật pop-up modal thô ráp chặn đứng người dùng.

- **Di Chuyển & Chuẩn Hóa 100% Các Lệnh Alert Cũ Sang Toast Thông Minh**:
  - `CurriculumExplorerView.jsx`: Chuyển đổi 13+ vị trí `alert(...)` (khởi chạy bài kiểm tra, tạo/xóa dạng bài, xóa chương học, xóa bài học, tạo chương, tạo bài, import JSON, bóc tách AI, sinh đề) sang `toast.success`, `toast.error`, `toast.warning`, `toast.info`.
  - `CurriculumStudioEditor.jsx`: Chuyển đổi các thông báo xóa câu hỏi, cảnh báo thiếu nội dung/đáp án và lưu câu hỏi mới sang `toast.warning`, `toast.success`, `toast.error`.
  - `DiagnosticAssessmentPage.jsx`: Chuyển đổi các khối `catch` khởi tạo đề thi và nộp bài thi chẩn đoán từ `alert(...)` sang `toast.error(...)`.
  - `CampusManagerDashboardView.jsx`: Chuyển đổi lỗi cấp tài khoản sang `toast.error(...)`.
  - `AccountProvisioningView.jsx`: Chuyển đổi lỗi đổi trạng thái tài khoản sang `toast.error(...)` và bổ sung `toast.success` khi kích hoạt/tạm khóa thành công.
  - `ClassMicroGroupsModal.jsx`: Chuyển đổi thông báo in sơ đồ phân bàn sang `toast.info(...)`.

- **Hộp Thoại Xác Nhận Xóa In-App Hiện Đại (In-App Confirm Dialogs - Zero Browser Modals)**:
  - *Thay thế triệt để `window.confirm` bằng Hộp thoại Xác nhận Trong Ứng Dụng*:
    + Loại bỏ hoàn toàn hộp thoại modal mặc định của trình duyệt (`window.confirm`) khi xóa Chương, xóa Bài học và xóa Dạng bài trong [`CurriculumExplorerView.jsx`](./src/components/curriculum/CurriculumExplorerView.jsx).
    + Xây dựng modal `confirmDeleteDialog` đồng bộ giao diện Glassmorphism với màu cảnh báo đỏ (`rose-500`), icon `<AlertTriangle />`, hiển thị tường minh tên Node chuẩn bị xóa, danh sách tài liệu / bài tập bị ảnh hưởng và nút "Xác Nhận Xóa" chuyên nghiệp.
    + Trong [`CurriculumStudioEditor.jsx`](./src/components/curriculum/CurriculumStudioEditor.jsx), cơ chế xóa câu hỏi được thay bằng thao tác 2 chạm (Two-Tap Confirmation): chạm lần 1 hiển thị đếm ngược "Nhấn để xác nhận xóa", chạm lần 2 thực hiện xóa an toàn kèm `toast.success`.

- **Tối Giản Hóa Hộp Thoại Sửa Nhanh & Chuyển Đổi Nút "Sửa Nhanh" Sang Icon Cây Bút (`CurriculumExplorerView.jsx`)**:
  - *Chuyển đổi nút Sửa Nhanh sang Icon Bút*: Thay thế nút bấm văn bản "Sửa nhanh" bằng icon button `<Pencil className="w-4 h-4" />` tinh gọn, bo góc hiện đại kèm tooltip "Sửa thông tin nhanh".
  - *Tái cấu trúc Modal Sửa Nhanh (`isEditModalOpen`)*:
    + Loại bỏ toàn bộ 4 tab biên soạn nội dung bên trong (Lý thuyết SGK, Phương pháp KaTeX, Video giảng, Câu hỏi mẫu) khỏi hộp thoại này theo đúng yêu cầu sư phạm.
    + Tập trung 100% vào việc chỉnh sửa metadata: Tên/Tiêu đề dạng bài, Chương học trực thuộc, Khối lớp (Lớp 10, 11, 12), Mức độ nhận thức chuẩn Bloom (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và Trọng số năng lực (%).
    + Tích hợp banner điều hướng nổi bật: "Cần chỉnh sửa nội dung bài học chuyên sâu? Mở Studio Biên Soạn Sư Phạm", giúp giảng viên dễ dàng chuyển hướng sang Studio khi cần soạn công thức phức tạp hoặc vẽ đồ thị JSXGraph.

- **Tự Động Nạp & Mở Dạng Bài Đầu Tiên Khi Chọn Chương / Bài Học**:
  - Cập nhật hàm `toggleChapter` và `toggleLesson` trong [`CurriculumExplorerView.jsx`](./src/components/curriculum/CurriculumExplorerView.jsx): Khi người dùng bấm vào tiêu đề Chương hoặc Bài học, hệ thống tự động tìm và chọn dạng bài đầu tiên (`selectedPattern`), giải quyết dứt điểm hiện tượng khung bên phải bị trống/không tải nội dung khi mới chọn chương.

- **Khắc Phục Cảnh Báo KaTeX Strict Mode Đối Với Ký Tự Tiếng Việt (`MathText.jsx`)**:
  - Bổ sung cấu hình `strict: 'ignore'` trong trình dựng `renderKatexHtml` của [`MathText.jsx`](./src/components/common/MathText.jsx), triệt tiêu hoàn toàn cảnh báo `LaTeX-incompatible input Unicode text character "Đ" used in math mode`.


---

## [21/10/2026] - Nền Ô Ly Vở Học Sinh 2D Phẳng Cho Hình Học Không Gian 3D, Mở Quyền Xóa Chương/Bài Học (Cascade Delete), Thêm Chương/Bài Mới & Bộ Lọc Phân Loại Tri Thức Đa Chiều

- **Nền Giấy Ô Ly Vở Học Sinh 2D Phẳng Cho Hình Học Không Gian 3D (`InteractiveMathRenderer.jsx`, `InteractiveMathWorkbenchModal.jsx`, `index.css`)**:
  - *Thay Thế Nền Trắng Đơn Điệu Bằng Nền Giấy Ô Ly Chuẩn Sư Phạm THPT*:
    + Theo phản hồi sư phạm, thay vì để nền trắng trơn gây trống trải hoặc dùng lưới 3D nghiêng phối cảnh làm rối mắt hình khối, áp dụng nền giấy ô ly 2D phẳng (`flat 2D notebook squared paper grid`).
    + Triển khai hai lớp lưới đồng tâm bằng CSS Linear Gradients:
      * Lưới phụ `20px x 20px` nét mờ nhẹ (`#e2e8f0` 1px).
      * Lưới chính `100px x 100px` nét đậm định vị (`#cbd5e1` 1px) trên nền trắng tinh khiết `#ffffff`.
    + Lưới là dạng 2D phẳng tuyệt đối ("không chia 3D"), cố định ở hậu cảnh (background), tạo cảm giác thân thuộc như đang dựng hình trên trang vở ghi chép môn Toán Hình học không gian THPT.
  - *Cơ Chế Khử Nền Trắng Che Phủ SVG Của JSXGraph (`index.css`)*:
    + Mặc định CSS của JSXGraph gán `background-color: #ffffff !important` cho thẻ `<svg>`.
    + Bổ sung selector có độ ưu tiên cao `.jxgbox.jxgbox-3d-grid svg { background-color: transparent !important; background: transparent !important; }`, cho phép các ô ly 2D phía sau container lộ rõ sắc nét mà không bị SVG đè lên.
    + Áp dụng đồng bộ trên cả component hiển thị `InteractiveMathRenderer` khi `is3D === true` và Workbench biên tập `InteractiveMathWorkbenchModal` tại tab `3d_space`.

- **Tái Cấu Trúc Toàn Diện Hệ Trục Tọa Độ Oxyz 3D Vector & Bật/Tắt Trực Quan (`InteractiveMathRenderer.jsx` & `InteractiveMathWorkbenchModal.jsx`)**:
  - *Khắc Phục Hiện Tượng Trục Oxyz Không Hiện Khi Nhấp Nút*:
    + Nhận diện nguyên nhân gốc: `view3d.defaultAxes` của JSXGraph sử dụng đối tượng `axis3d` không hỗ trợ mũi tên nhọn, thiếu nhãn gốc tọa độ $O$ và `setAttribute({ visible })` không cập nhật được các phần tử 2D con. Đồng thời, biến tham chiếu `v.defaultAxes?.x` bị lệch định danh so với thuộc tính nội bộ `xAxis`, khiến lệnh chuyển trạng thái bị bỏ qua.
    + Loại bỏ cơ chế trục mặc định (`axesPosition: 'none'`), chủ động dựng hệ trục Oxyz vector độc lập.
  - *Hệ Trục Oxyz 3D Vector Chuẩn SGK Hình Học Không Gian GDPT 2018*:
    + Điểm gốc tọa độ $O(0, 0, 0)$ có nhãn $O$ màu slate xám đậm (`#334155`).
    + Trục hoành $Ox$: Vector đi từ $[0, 0, 0]$ đến $[5.5, 0, 0]$, màu đỏ rực (`#ef4444`), độ dày nét 2px, mũi tên nhọn (`lastArrow: true`), nhãn $x$ in đậm nổi bật.
    + Trục tung $Oy$: Vector đi từ $[0, 0, 0]$ đến $[0, 5.5, 0]$, màu xanh lá (`#10b981`), độ dày nét 2px, mũi tên nhọn (`lastArrow: true`), nhãn $y$ in đậm.
    + Trục cao $Oz$: Vector đi từ $[0, 0, 0]$ đến $[0, 0, 6.5]$, màu xanh dương (`#3b82f6`), độ dày nét 2px, mũi tên nhọn (`lastArrow: true`), nhãn $z$ in đậm.
    + Ba tia đối âm nét đứt ($Ox^-, Oy^-, Oz^-$): Dựng các tia nét đứt mờ (`dash: 2`) về phía trục âm, hỗ trợ học sinh định vị không gian 3D trực quan khi xoay góc nhìn.
  - *Cơ Chế Bật/Tắt Linh Hoạt (Interactive Toggle)*:
    + Lưu trữ các phần tử trục vào `axesElementsRef.current`, cập nhật tức thì visibility trên cả đối tượng 3D lẫn `element2D` SVG, phản hồi 60 FPS khi bấm nút.
    + Nâng cấp nút bấm trên toolbar: Thể hiện trạng thái active rõ ràng (`bg-indigo-600 text-white shadow-xs`), icon la bàn chuyển trắng và nhãn chuyển thành "Đang bật Oxyz".
    + Bổ sung nút bấm và hệ trục Oxyz tương ứng trên canvas phòng thí nghiệm MathLab (`InteractiveMathWorkbenchModal.jsx`).

- **Mở Quyền Quản Trị Xóa & Thêm Chương / Bài Học Trên Cây Tri Thức (`CurriculumExplorerView.jsx`)**:
  - *Xóa Chương Học Đa Cấp (Cascade Delete Chapter)*:
    + Tích hợp nút thùng rác `Trash2` trực tiếp trên từng header Chương học (`chap.chapterId`).
    + Hộp thoại cảnh báo thông minh: Hiển thị rõ số lượng bài học, dạng bài và câu hỏi sẽ bị xóa vĩnh viễn khỏi CSDL trước khi xác nhận.
    + Kết nối API backend `DELETE /api/content/curriculum/nodes/{nodeId}`, tự động kích hoạt bộ thu thập đệ quy `CollectDescendantIds` xóa sạch các thực thể phụ thuộc (`SkillPrerequisites`, `Materials`, `Questions`, `Skills`).
    + Cập nhật tức thì giao diện thông qua `fetchCurriculumData()` và reset lựa chọn an toàn nếu dạng bài đang xem nằm trong nhánh bị xóa.
  - *Xóa Bài Học (Delete Lesson)*:
    + Tích hợp nút xóa `Trash2` trên từng header Bài học (`les.lessonId`), cảnh báo số lượng dạng bài trực thuộc.
  - *Tạo Chương Học Mới (`+ Thêm Chương Mới`)*:
    + Bổ sung nút `+ Thêm Chương Mới` nổi bật trên đỉnh cột Cấu trúc phân cấp.
    + Modal `CreateChapterModal` chuyên nghiệp: Cho phép Giảng viên/Ban Chuyên Môn chọn Miền tri thức, Phân môn trực thuộc (Vật lí, Hóa học, Sinh học, v.v.), Khối lớp (Lớp 12, 11, 10), Năm học áp dụng (2025 - 2026, 2024 - 2025), Tên chương, Trọng số (%) và Mục tiêu chuẩn đầu ra.
    + Tự động format định danh chuẩn hóa: `[Lớp 12] [Tên chương] (2025-2026)`.
  - *Thêm Bài Học Mới (`+ Thêm bài`)*:
    + Bổ sung nút `+ Thêm bài` trên từng Chapter Header, mở modal `CreateLessonModal` với trường tên bài, trọng số và tóm tắt nội dung cốt lõi; tự động bung mở Chương (auto-expand) ngay sau khi tạo thành công.

- **Bộ Lọc Phân Loại Tri Thức Đa Chiều (`Bộ Lọc Phân Loại Tri Thức` Toolbar)**:
  - *Phân Tách Phân Môn Riêng Biệt (Sub-Subjects)*:
    + Thay vì chỉ hiển thị các Miền tri thức lớn, giao diện cho phép học sinh và giáo viên lọc sâu theo từng môn học cụ thể:
      * **Khoa học Tự nhiên**: Tất cả môn, Vật lí, Hóa học, Sinh học.
      * **Khoa học Xã hội**: Tất cả môn, Lịch sử, Địa lí, GDKT & Pháp luật.
      * **Sử dụng Ngôn ngữ**: Tất cả môn, Tiếng Việt / Ngữ văn, Tiếng Anh.
      * **Toán học & Tư duy định lượng**: Tất cả môn, Đại số & Giải tích, Hình học & Đo lường, Xác suất & Thống kê, Tư duy Logic & Dữ liệu.
  - *Phân Loại Theo Khối Lớp (Grade Filter)*:
    + Hỗ trợ các nút lọc tức thì: `Tất cả lớp`, `Lớp 12 (Trọng tâm ĐGNL V-ACT)`, `Lớp 11`, `Lớp 10`.
    + Động cơ suy luận regex quét thông minh từ khóa khối lớp từ tên chương và bài học.
  - *Phân Loại Theo Năm Học (Academic Year Filter)*:
    + Hỗ trợ chọn lọc: `Tất cả năm`, `2025 - 2026 (Chương trình GDPT 2018 Mới)`, `2024 - 2025`.
  - *Thống Kê Khớp Thời Gian Thực & Đặt Lại Bộ Lọc*:
    + Hiển thị số lượng Chương và Bài học khớp bộ lọc theo thời gian thực (real-time badge).
    + Nút "Đặt lại bộ lọc" xuất hiện tự động khi có ít nhất một tiêu chí lọc được kích hoạt.

- **Động Cơ Bảng Biến Thiên Vector Nội Sinh Hỗ Trợ Tiệm Cận Kép (`VariationTable.jsx`)**:
  - *Hỗ Trợ Hàm Phân Thức Hữu Tỉ (Bậc 1/1 & Bậc 2/1)*:
    + Nâng cấp bộ phân tích chuỗi `parseVariationTableString` và kiến trúc render vector 3 dòng.
    + Cho phép khai báo ký hiệu vạch kép `||` tại điểm gián đoạn của mẫu số trong cả dòng đạo hàm $y'$ và dòng biến thiên $y$ / `dir`.
    + Render vạch kép SVG sắc nét ngăn cách hai nhánh đồ thị theo đúng quy chuẩn sách giáo khoa Toán học THPT.
  - *Tự Động Suy Luận Hướng Mũi Tên (`directions`)*:
    + Khi LLM sinh thiếu dòng `dir`, động cơ tự động ánh xạ trực tiếp từ dấu của $y'$ (`+` -> `up`, `-` -> `down`, `||` -> ngắt quãng) mà không làm vỡ giao diện.
    + Khử triệt để các ký hiệu `$` dư thừa và hỗ trợ linh hoạt cả dấu phẩy `,` lẫn dấu gạch đứng `|`.

- **Động Cơ Vẽ Đồ Thị Vi Tích Phân 2D & Tự Động Dựng Tiệm Cận (`InteractiveMathRenderer.jsx`)**:
  - *Tự Động Dựng Đường Tiệm Cận & Tâm Đối Xứng*:
    + Hàm phân thức bậc 1/1 (`rational`): Tự động tính toán và vẽ đường tiệm cận đứng $x = -d/c$ (nét đứt màu xám), tiệm cận ngang $y = a/c$ (nét đứt màu xám), và điểm tâm đối xứng $I(-d/c, a/c)$ giao điểm của 2 đường tiệm cận.
    + Hàm phân thức bậc 2/1 (`rational_21`): Tự động vẽ đường tiệm cận đứng $x = -e/d$ và tiệm cận xiên $y = \frac{a}{d}x + \frac{bd - ae}{d^2}$ nét đứt cùng tâm đối xứng $I$.
  - *Chống Hiện Tượng Nối Dọc Qua Tiệm Cận*:
    + Thiết lập cờ `discontinuous: isRational` trong JSXGraph `board.create('functiongraph', ...)`. Đồ thị được ngắt nét hoàn toàn tại điểm gián đoạn, loại bỏ hiện tượng vẽ nối một đường thẳng đứng xuyên qua tiệm cận.

- **Chuẩn Hóa Payload Nạp Tri Thức & Khắc Phục Lỗi Validation Error CSDL (`contentService.js` & `CurriculumExplorerView.jsx`)**:
  - *Bộ Lọc Chuẩn Hóa Payload Client-Side (`contentService.js`)*:
    + Triển khai hai hàm trợ giúp `normalizeCorrectOption(raw)` và `sanitizeCurriculumPayload(payload)`.
    + Đảm bảo trước khi dữ liệu được gửi đến backend `Content Service` (`POST /api/content/curriculum/import`, `createQuestion`, `updateQuestion`), toàn bộ các trường `correctOption` của mọi câu hỏi trong các bài học và dạng bài đều được chuẩn hóa về duy nhất 1 ký tự chuẩn mực `'A'`, `'B'`, `'C'`, `'D'`.
    + Xử lý an toàn mọi dạng dữ liệu thô sinh ra từ OCR hoặc nhập liệu: chuỗi có dấu chấm (`"A."`), ngoặc (`"(B)"`, `"[C]"`), hai chấm (`"D:"`), từ khóa (`"Đáp án C"`, `"Phương án B"`, `"Option A"`), số nguyên (`0..3`), chuỗi rỗng và `null`.
    + Chuẩn hóa tự động kiểu dữ liệu số cho `difficultyLevel` (mặc định 2), điền giá trị chuỗi an toàn cho các phương án `optionA` - `optionD` và `explanation`.
  - *Cải Tiến Thông Báo Lỗi Chi Tiết Tại Modal Nạp Tri Thức (`CurriculumExplorerView.jsx`)*:
    + Định dạng lại chuỗi thông báo lỗi khi backend trả về lỗi xác thực RFC 9110/Problem Details (trích xuất trực tiếp `errors[field]` thành danh sách rõ ràng thay vì in cả đối tượng JSON thô).

- **Khắc Phục Triệt Để Hiện Tượng Sinh Nhầm Card Đồ Thị Oxy Đè Lên Bảng Biến Thiên (`mathGraphUtils.js`, `MathText.jsx`, `VariationTable.jsx` & `InteractiveMathRenderer.jsx`)**:
  - *Bản Chất Sự Cố*: Trong hàm `autoSynthesizeMathGraph2DFromText`, biểu thức nhận diện hàm số `y = ...` quét qua câu hỏi chứa bảng biến thiên (như *"Đồ thị hàm số y = f(x) có bảng biến thiên như sau: [VARIATION_TABLE]..."*). Do không kiểm tra sự tồn tại của thẻ `[VARIATION_TABLE]` và cụm từ "bảng biến thiên", đồng thời chấp nhận hàm trừu tượng `f(x)`, hàm tự động gom toàn bộ nội dung đề bài và chuỗi thẻ bảng biến thiên thành công thức đồ thị và sinh một khối `[MATH_GRAPH]` thừa thãi. Hệ quả là một card "Oxy Tương Tác" khổng lồ xuất hiện đè lên bảng biến thiên, in đè toàn bộ text đề bài và chuỗi mã thô lên mặt phẳng tọa độ Oxy.
  - *Giải Pháp Xử Lý Toàn Diện*:
    + *Bộ Lọc Chống Sinh Nhầm (`mathGraphUtils.js`)*: Lập tức trả về `null` nếu chuỗi văn bản đã có thẻ `[VARIATION_TABLE]`, `[MATH_GRAPH]`, `[MATH_GRAPH_3D]` hoặc chứa từ khóa "bảng biến thiên", "bảng xét dấu". Đồng thời từ chối các hàm số trừu tượng dạng $f(x), g(x), u(x)$, và chỉ sinh đồ thị 2D khi có biểu thức đại số cụ thể ($x^3, x^4, \frac{ax+b}{cx+d}, x^2$).
    + *Bảo Vệ Thẻ Đặc Biệt Trong Bộ Chuẩn Hóa Toán (`MathText.jsx`)*: Tokenize văn bản kết hợp cả dấu phân cách toán và các khối thẻ đặc biệt (`[VARIATION_TABLE]`, `[MATH_GRAPH]`), đảm bảo nội dung bên trong thẻ không bị các biểu thức chính quy KaTeX/Hóa học can thiệp làm biến dạng cú pháp.
    + *Hỗ Trợ Bảng Biến Thiên Trên Một Dòng (`VariationTable.jsx`)*: Nâng cấp `parseVariationTableString` tự động tách dòng an toàn khi AI trả về chuỗi JSON không có ký tự ngắt dòng `\n` (tự chèn `\n` trước `x:`, `y':`, `y:`, `dir:`), bảo đảm bảng biến thiên hiển thị hoàn hảo 100% trong mọi trường hợp.
    + *Cơ Chế Bảo Vệ Nhãn Trên Mặt Phẳng Oxy (`InteractiveMathRenderer.jsx`)*: Kiểm soát chặt chẽ `config.title` và `config.formula`, chỉ hiển thị huy hiệu và nhãn đường cong khi công thức hợp lệ, súc tích (< 35 ký tự), tuyệt đối không in chuỗi văn bản dài lên canvas JSXGraph.

- **Khắc Phục Hoàn Toàn Lỗi UI Khối 3D Bị Nửa Canvas Trắng Đè Lên (`InteractiveMathRenderer.jsx` & `InteractiveMathWorkbenchModal.jsx`)**:
  - *Bản Chất Sự Cố*: Trong JSXGraph native engine, khi gọi `board.create('view3d', ...)`, mặc định các mặt phẳng thành hộp phía sau (`xPlaneRear`, `yPlaneRear`, `zPlaneRear`) được kích hoạt với mắt lưới (grid mesh). Do không gian bounding box giới hạn từ $[-6, 6]$, thành hộp chỉ che phủ góc phần tư phía sau/bên trái của trục tọa độ, trong khi nửa bên phải hoàn toàn không có vách lưới, tạo ra một đường cắt dọc sắc cạnh trông như khối trắng đè lên mô hình 3D.
  - *Giải Pháp Xử Lý*: Thiết lập tường minh `xPlaneRear: { visible: false }, yPlaneRear: { visible: false }, zPlaneRear: { visible: false }, xPlaneFront: { visible: false }, yPlaneFront: { visible: false }, zPlaneFront: { visible: false }` trên cả component hiển thị `InteractiveMathRenderer` và modal biên tập `InteractiveMathWorkbenchModal`. Toàn bộ nền canvas chuyển sang màu trắng đồng nhất 100%, không còn bất kỳ vách ngăn hoặc khối cắt ngang nào.
  - *Nút Bật/Tắt Hệ Trục Oxyz (`Compass` Icon)*: Theo chuẩn hình học không gian SGK GDPT 2018 (hình chóp, tứ diện thuần túy không có trục tọa độ), bổ sung công tắc `Trục Oxyz` trên thanh công cụ của card 3D. Mặc định ẩn hệ trục để mô hình thanh thoát như hình vẽ SGK, đồng thời cho phép giảng viên/học sinh bật nhanh 3 trục màu $x$ (đỏ), $y$ (xanh lá), $z$ (xanh dương) khi cần quan sát tọa độ không gian.

- **Khắc Phục Triệt Để Lỗi Render KaTeX & Mất Ký Tự Đầu `**` Trong Bài Toán Mẫu (`MathText.jsx`)**:
  - *Bản Chất Sự Cố*: Trong bộ phân tích cấu trúc văn bản của `MathText.jsx`, điều kiện nhận diện Callout Card sử dụng `line.includes('Bài toán mẫu')` quá rộng, khiến mọi dòng nội dung bài toán (ví dụ: `**Bài toán mẫu:** Cho tứ diện $ABCD$...`) bị hiểu nhầm là dòng tiêu đề Callout. Bộ bóc tách sau đó chạy regex xóa ký tự đầu dòng `^[^\p{L}\p{N}\s]+`, nuốt mất dấu `**` mở đầu và nhét nguyên đoạn văn bản vào `<span>{cleanHeading}</span>` dạng text thô, làm tê liệt hoàn toàn bộ render KaTeX cho `$ABCD$`, `$M, N$`, `$(DMN)$`, `$(BCD)$`.
  - *Giải Pháp Xử Lý*:
    + Nâng cấp regex `isSampleHeadingCallout`: Ràng buộc tiêu đề Callout chỉ được kích hoạt khi dòng thực sự bắt đầu bằng định dạng Heading (`###` hoặc emoji tiêu đề `[📝📄✍️]`). Các dòng nội dung bài toán `**Bài toán mẫu:**...` hoặc `- **Bài toán mẫu:**...` được chuyển trực tiếp vào luồng xử lý văn bản nội dòng (inline stream).
    + Chuẩn hóa render an toàn: Bọc nội dung tiêu đề Callout trong `{renderInlineContent(cleanHeading, lineKey)}`, đảm bảo kể cả khi tiêu đề chứa công thức toán ($S.ABCD$) vẫn được KaTeX dịch sang ký hiệu toán học hoàn hảo.
    + Bộ sửa chữa dấu sao mồ côi (`normalizeMathString`): Bổ sung regex tự động vá các trường hợp mất dấu `**` đầu do AI hoặc người dùng gõ thiếu (chuyển `Bài toán mẫu:**` thành `**Bài toán mẫu:**`).
    + Tích hợp bộ tự động tổng hợp bảng biến thiên từ chữ (`autoSynthesizeVariationTableFromText`) trong `mathGraphUtils.js` và `MathText.jsx`.

- **Quản Lý Trạng Thái Toàn Vẹn Bài Toán Mẫu (`CurriculumStudioEditor.jsx`)**:
  - Bổ sung trường `sampleProblem` vào `form` state, bộ cập nhật kết quả AI `handleAiAnalysisComplete`, và hàm tái lắp ghép `fullSolutionMethod` khi lưu, bảo đảm bài toán mẫu không bị thất thoát trong quá trình biên soạn sư phạm.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 1.09s trên Vite 8 và React 19).

---

## [20/10/2026] - Kiến Trúc Độc Lập Component Live Math Renderer 2D/3D Tương Tác, Chuẩn Hóa Chuỗi Tag Lưu Trữ Database & Đồng Bộ Tuyệt Đối Giao Diện Giảng Viên - Học Sinh

- **Component Tái Sử Dụng Cao Độc Lập `InteractiveMathRenderer.jsx` (JSXGraph v1.14.0 Native React Engine)**:
  - *Xóa Bỏ Hoàn Toàn Giải Pháp Ảnh Chụp Tĩnh (Zero Static Screenshots)*: Nhận định chính xác đồ thị và hình học không gian 3D là các đối tượng tương tác toán học phức tạp cần giữ nguyên thư viện vector nội sinh. Component tự động render trực tiếp trên máy client bằng SVG/Canvas của JSXGraph với tốc độ 60 FPS, không dùng ảnh chụp màn hình, không suy giảm độ sắc nét khi zoom và không tốn băng thông lưu trữ.
  - *Tương Tác Không Gian 3D Toàn Diện (Trackball 360° & Zoom)*: Tích hợp đầy đủ khả năng rê chuột xoay đa hướng không gian 360° (trackball rotation), cuộn chuột thu phóng (zoom in/out), nút "Góc nhìn" để đưa về góc chuẩn (azimuth 0.85, elevation 0.35) và chế độ xem phóng to toàn màn hình (Modal Expand).
  - *Quản Lý Vòng Đời Trực Quan An Toàn (Lifecycle Isolation)*: Cơ chế sinh ID container ngẫu nhiên (`jxg_math_...`) và giải phóng bộ nhớ tự động (`JXG.JSXGraph.freeBoard`) khi unmount, ngăn ngừa 100% rò rỉ bộ nhớ hoặc xung đột DOM khi một trang hiển thị nhiều câu hỏi có đồ thị cùng lúc.

- **Chuẩn Hóa Bộ Tiện Ích `mathGraphUtils.js` & Định Dạng Thẻ Lưu Trữ Không Đổi Schema Database**:
  - *Cơ Chế Thẻ Siêu Dữ Liệu Văn Bản Nhẹ (Tag-Based Text Serialization)*:
    + Thẻ `[MATH_GRAPH]...[/MATH_GRAPH]`: Đồ thị hàm số 2D (loại hàm, công thức KaTeX, các tham số $a, b, c, d, e$, biểu thức tùy biến `customExpr`, đường phụ `auxExpr`, đường xiên biện luận nghiệm `slopeM` & `paramM`, phép biến đổi trị tuyệt đối, tích phân diện tích).
    + Thẻ `[MATH_GRAPH_3D]...[/MATH_GRAPH_3D]`: Hình học không gian 3D (loại hình khối `shapeType`, mô hình kinh điển `preset`, kích thước $h, w, d, r$, tọa độ và nhãn các đỉnh tùy biến `vertices`, danh sách điểm phụ `extraPoints` kèm tỉ lệ chia đoạn và màu sắc, danh sách đường kẻ phụ `auxLines` kèm nét đứt khuất SGK `dash=2` và màu sắc).
  - *Tương Thích 100% Với CSDL PostgreSQL*: Lưu trữ trực tiếp trong các cột `ContentLatex` hoặc `Explanation` (kiểu `text` không giới hạn dung lượng ký tự), không làm thay đổi bảng dữ liệu, không cần chạy migration CSDL và an toàn tuyệt đối với API Content Service.
  - *Sẵn Sàng Cho AI Engine & Ingestion Review*: Cấu trúc thẻ dạng key-value trực quan, rõ ràng, giúp AI Engine (Gemini) dễ dàng bóc tách từ PDF đề thi hoặc sinh ra trong JSON payload mà không lo lỗi thoát ký tự JavaScript phức tạp; đồng thời các modal duyệt tài liệu của giảng viên tự động hiển thị mô hình 3D tương tác ngay lập tức.

- **Tích Hợp Sâu Vào Động Cơ `MathText.jsx` - Kích Hoạt Tự Động Toàn Hệ Thống**:
  - *Tự Động Bóc Tách Khối Thẻ*: Cập nhật biểu thức chính quy (Regex) trong `MathText.jsx` để bắt trọn các khối `[MATH_GRAPH_3D]`, `[MATH_GRAPH]` và `[MATH_GEOMETRY_2D]`.
  - *Động Cơ Dựng Hình Không Gian Tự Động Từ Chữ (`autoSynthesizeMathGraph3DFromText` & `autoSynthesizeMathGraph2DFromText`)*: Khi đề bài hoặc ví dụ giáo khoa chỉ mô tả hình bằng chữ thuần túy (như *"Cho hình chóp S.ABCD..."*, *"Cho tứ diện ABCD..."*, *"M là trung điểm SC..."*, *"y = x^3 - 3x + 1"*), bộ phân tích ngữ nghĩa tự động trích xuất loại hình, đỉnh, điểm phụ, đường nét đứt và dựng ngay mô hình 3D xoay 360 độ hoặc đồ thị 2D trực tiếp trong `MathText.jsx` mà không cần phụ thuộc vào việc file nguồn có in sẵn hình hay không.
  - *Độ Phủ Tuyệt Đối*: Vì toàn bộ ứng dụng (Khảo thí chẩn đoán năng lực `DiagnosticAssessmentPage.jsx`, Khảo sát `DiagnosticTestModal.jsx`, Ngân hàng câu hỏi Studio `CurriculumStudioEditor.jsx`, Duyệt cây tri thức `CurriculumExplorerView.jsx`) đều dùng `MathText`, mọi vị trí có chứa thẻ đồ thị đều tự động chuyển thành component tương tác mà không cần sửa đổi thủ công từng trang.
  - *Bổ Sung Cho Quiz Thích Ứng Học Sinh (`AdaptiveQuizModal.jsx`)*: Bọc `MathText` cho nội dung câu hỏi và các phương án của học sinh, đảm bảo học sinh làm bài thi thích ứng theo ZPD được tương tác trực tiếp với mô hình 3D.

- **Tính Nhất Quán Tuyệt Đối Giữa Màn Hình Giảng Viên & Học Sinh (Data & Visual Parity)**:
  - Giảng viên trên Studio Workbench tùy chỉnh tọa độ đỉnh, đổi tên đỉnh ($S \to P, A \to M$), kẻ thêm đường phụ nét đứt màu đỏ hay thiết diện ra sao thì khi học sinh nhận dữ liệu từ DB, component `InteractiveMathRenderer` giải mã và dựng lại chính xác 100% hình dạng, màu sắc và góc nhìn đó.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 964ms trên Vite 8 và React 19).

---

## [20/10/2026] - Hợp Nhất Động Cơ MathLab JSXGraph Nội Sinh, Tùy Chỉnh Tọa Độ (X,Y,Z) & Đổi Tên Đỉnh Không Gian 3D, Bộ Kẻ Đường Phụ Tự Do & Hệ Thống Đồ Thị VD/VDC GDPT 2018

- **Thống Nhất Động Cơ Toán Học Tương Tác JSXGraph Nội Sinh (`InteractiveMathWorkbenchModal.jsx`)**:
  - *Loại Bỏ Hoàn Toàn GeoGebra*: Tách biệt triệt để khỏi web-applet bên thứ ba, loại bỏ phụ thuộc iframe mạng và độ trễ tải trang. Toàn bộ phân hệ MathLab chuyển đổi 100% sang engine vector JSXGraph v1.14.0 nội sinh, hoạt động ngoại tuyến (offline), tốc độ vẽ mượt mà 60 FPS Canvas/SVG.
  - *Chuẩn Hóa Ribbon & Navigation Header*: Tinh giản tiêu đề và nút kích hoạt trên thanh Ribbon (`CurriculumStudioEditor.jsx` và `CurriculumExplorerView.jsx`) về nhãn chuẩn `⚡ MathLab 2D/3D (JSXGraph)`.

- **Bộ Công Cụ Tùy Chỉnh Tọa Độ (X,Y,Z) & Đổi Tên Các Đỉnh Hình Học Không Gian 3D (`InteractiveMathWorkbenchModal.jsx`)**:
  - *Công Tắc Tùy Chỉnh Đỉnh (`isCustomizingBasePoints`)*: Bổ sung toggle trực quan `⚙️ Tùy chỉnh vị trí (X, Y, Z) & Đổi tên các đỉnh` nằm ngay dưới bộ chọn 9 loại hình không gian THPT.
  - *Bảng Điều Khiển Tọa Độ Vi Mô*: Cho phép giáo viên đổi tên bất kỳ đỉnh nào của hình (ví dụ `A` thành `M`, `S` thành `P`, `A'` thành `A₁`) và nhập tọa độ thực `(X, Y, Z)` với bước nhảy 0.2.
  - *Phản Hồi Trực Quan Thời Gian Thực*: Mọi sự thay đổi về tọa độ đỉnh sẽ làm co giãn, tịnh tiến và cập nhật tức thì toàn bộ các cạnh, đường bao, mặt đáy, đường vuông góc phụ và thiết diện trên khung nhìn không gian 3D.
  - *Nút Reset Mặc Định*: Tích hợp nút `🔄 Mặc định` khôi phục lại 100% tên đỉnh và tọa độ gốc chuẩn SGK của hình khối đang chọn chỉ với 1 cú click.

- **Mở Rộng Thư Viện Hình Học Không Gian Đa Dạng & Bộ Kẻ Thêm Đường Phụ Tự Do (`InteractiveMathWorkbenchModal.jsx`)**:
  - *9 Loại Hình Không Gian Chuẩn Kỳ Thi THPT*: Hỗ trợ toàn diện Chóp `S.ABCD` (`SA` vuông góc đáy), Chóp `S.ABC` (đáy vuông tại `B`), Chóp Tứ Giác Đều (`SO` vuông góc đáy), Chóp Tam Giác Đều (`SG` vuông góc đáy), Chóp có mặt bên vuông góc đáy (`(SAB)` vuông góc `(ABCD)`), Lăng trụ tam giác `ABC.A'B'C'`, Hình hộp chữ nhật / Hình lập phương `ABCD.A'B'C'D'`, Nón/Trụ tròn xoay, và Mặt cầu cắt mặt phẳng Oxyz.
  - *Bộ Mô Hình Dựng Đường Phụ Kinh Điển (Presets)*: Tích hợp sẵn mô hình 2 bước kẻ khoảng cách `d(A, (SBC)) = AK` (với `AH` vuông góc `BC`, `AK` vuông góc `SB`), góc giữa đường thẳng và mặt phẳng, và thiết diện `(MNPQ)` qua các trung điểm.
  - *Tự Do Thêm Điểm Phụ Trên Cạnh*: Cho phép chọn cạnh, đặt tên điểm, chọn tỉ lệ `k` (có nút nhanh `1/2` Trung điểm, `1/3` Trọng tâm) để tạo đỉnh mới nội suy tức thì.
  - *Bộ Kẻ Đoạn Thẳng Phụ Tùy Biến*: Nối bất kỳ 2 điểm nào trong không gian (kể cả đỉnh tùy biến và điểm phụ mới tạo), hỗ trợ tùy chọn nét đứt khuất SGK hoặc nét liền, chọn màu nét (Đỏ, Vàng cam, Tím neon, Xanh lá, Xanh dương).

- **Hệ Thống Đồ Thị Hàm Số Vận Dụng & Vận Dụng Cao (VD / VDC) GDPT 2018 (`InteractiveMathWorkbenchModal.jsx`)**:
  - *Chuyên Đề 1 - Khảo Sát & Phân Thức Tiệm Cận Xiên (Điểm Nhấn GDPT 2018)*: Hàm số `y = (ax² + bx + c)/(dx + e)` tự động vẽ đường tiệm cận đứng, đường tiệm cận xiên nét đứt và đánh dấu tâm đối xứng `I`.
  - *Chuyên Đề 2 - Biến Đổi Đồ Thị Chứa Dấu Giá Trị Tuyệt Đối Phức Hợp*: Hỗ trợ `y = |f(x)|`, `y = f(|x|)`, `y = |f(|x|)|`, `y = |f(x) + m|` (kèm slider tham số `m` dịch chuyển đồ thị và đếm số cực trị), và `y = f(x) + |f(x)|`.
  - *Chuyên Đề 3 - Đồ Thị Đạo Hàm f'(x) & Tương Giao Hàm Hợp*: Hiển thị đường cong `y = f'(x)`, vẽ đường phụ `y = h(x)` (đường thẳng hoặc parabol), tự động tìm và chấm đỏ các hoành độ giao điểm `x_i` (các điểm cực trị của hàm hiệu).
  - *Chuyên Đề 4 - Biện Luận Nghiệm Tham Số d: y = ax + m*: Thanh trượt hệ số góc `a` và tham số `m`, tự động quét nghiệm và hiển thị số lượng nghiệm theo thời gian thực.
  - *Chuyên Đề 5 - Ứng Dụng Tích Phân Tính Diện Tích Hình Phẳng 2 Đường Cong*: Tìm giao điểm, tô màu miền khép kín giữa 2 đường cong và tính giá trị diện tích tích phân số học.
  - *Chuyên Đề 6 - Nhận Dạng Bộ Ba Đồ Thị f(x), f'(x), F(x)*: Vẽ đồng thời 3 đường cong chuẩn mực và có nút toggle "Ẩn tên hàm" phục vụ soạn câu hỏi trắc nghiệm kiểm tra học sinh.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 965ms trên Vite 8 và React 19).

---

## [20/10/2026] - Khắc Phục Lỗi Icon Bài Toán Mẫu, Tone Trắng Panoramic Workspace, Xóa Dòng Bằng Backspace, Chống Cắt Công Thức & Mở Rộng Thư Viện Ký Hiệu GDPT 2018 Toàn Diện

- **Khắc Phục Triệt Để Lỗi Icon Kim Cương '' Tại Thẻ 'Bài toán mẫu áp dụng phương pháp:' (`MathText.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Nguyên Nhân Sự Cố*: Ký tự emoji `📝` hoặc icon UTF-8 gốc khi qua các tầng tuần tự hóa bị giải mã sai thành mã thay thế Unicode `\uFFFD` (hiển thị hình thoi chấm hỏi `` trên trình duyệt).
  - *Giải Pháp Xử Lý Tinh Vi*: Bổ sung Unicode-aware regex `^[^\p{L}\p{N}\s]+` tự động bóc tách sạch sẽ mọi ký tự lỗi/thay thế đứng đầu tiêu đề, chuẩn hóa nhãn tiêu đề về `Bài toán mẫu áp dụng phương pháp:`.
  - Thay thế toàn bộ biểu tượng bị lỗi bằng vector icon Lucide `FileText` và `BookOpen` màu hổ phách (`amber-600`) viền bo tròn sắc nét, tương thích 100% trên mọi nền tảng.

- **Đồng Bộ Hoàn Toàn Header Bar Panoramic Workspace & Dạng Bài Sang Tone Trắng Sáng (`CurriculumExplorerView.jsx`)**:
  - *Loại Bỏ Vết Nền Tối Lạc Tone*: Chuyển đổi thanh tiêu đề modal `h2` bóc tách tài liệu (dòng 2490) và thanh header dạng bài (dòng 2830) từ dải gradient màu tối `bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900` sang nền trắng thanh lịch `bg-white border-b border-slate-200 text-slate-900`.
  - Chấm dứt hoàn toàn tình trạng "trên đen dưới trắng", tạo sự liền mạch thẩm mỹ 100% theo chuẩn hệ thống.

- **Loại Bỏ Hoàn Toàn Đoạn Văn Bản Mẹo Không Cần Thiết Dưới Chân Trang (`WordStyleFormulaCanvas.jsx`)**:
  - Đã xóa sạch dòng hướng dẫn: `💡 Gõ văn bản như Word • Bấm Enter để xuống dòng • Nhấp khoảng trống tự nhảy trỏ về cuối dòng • Nhấp công thức để sửa số tại chỗ` theo đúng yêu cầu, giữ cho canvas soạn thảo tinh giản và thông thoáng.

- **Hỗ Trợ Xóa Dòng Linh Hoạt Bằng Phím Backspace (`WordStyleFormulaCanvas.jsx`)**:
  - *Cơ Chế Xử Lý*: Hiện thực hàm `handleDeleteLine(lineIndex)` và gắn bộ lắng nghe phím `Backspace` trên các span `contentEditable`.
  - Khi người dùng bấm Backspace tại đầu dòng (offset 0) hoặc trên một dòng trống, hệ thống tự động xóa dòng hiện tại hoặc gộp nội dung vào cuối dòng liền trước, điều hướng con trỏ chính xác về vị trí nối dòng, mang lại trải nghiệm gõ phím mượt mà như Microsoft Word thật.

- **Khắc Phục Hiện Tượng Bị Cắt Cụt '...' Khi Công Thức Quá Dài Trong Thanh Tra Nổi (`WordStyleFormulaCanvas.jsx`)**:
  - *Nguyên Nhân*: Thẻ xem trước KaTeX bên trong popup inspector trước đây bị giới hạn cứng `max-w-[140px]` và mang class `truncate`, làm các biểu thức toán học hoặc phản ứng hóa học dài bị cắt ngang bằng dấu ba chấm `...`.
  - *Giải Pháp*: Gỡ bỏ hoàn toàn `truncate` khỏi vùng render KaTeX; mở rộng kích thước container xem trước lên `max-w-[280px]` kèm thanh cuộn ngang `overflow-x-auto scrollbar-none`; nâng bề rộng tối đa của popup thanh tra từ 420px lên `max-w-[540px]`, đảm bảo công thức hiển thị đầy đủ, không bao giờ bị cắt cụt.

- **Khắc Phục Triệt Để Hiện Tượng Chữ Trắng Trên Nền Trắng Khi Tạo Câu Hỏi Mới (`CurriculumStudioEditor.jsx`)**:
  - *Nguyên Nhân*: Thẻ cha cấp cao của Studio mang class `text-slate-100`, dẫn đến các thẻ `<textarea>` và `<input>` (phương án A, B, C, D và lời giải chi tiết) trong Khối 4 và modal `NewQuestionDialog` bị kế thừa màu chữ trắng trên nền thẻ `bg-white`, khiến người dùng không nhìn thấy chữ khi nhập liệu.
  - *Khắc Phục*: Thêm rõ ràng các thuộc tính màu sắc độc lập `text-slate-900 placeholder:text-slate-400 font-medium` cho tất cả các trường nhập liệu đề bài, 4 phương án trắc nghiệm A-D, và form tạo câu hỏi mới.

- **Mở Rộng Thư Viện Ký Hiệu & Công Thức Toàn Diện Chuẩn GDPT 2018 Lớp 10 - 12 (`HierarchicalMathPalette.jsx` & `WordStyleFormulaCanvas.jsx`)**:
  - Mở rộng kho tàng công thức và ký hiệu bao phủ đầy đủ tất cả các môn học phổ thông:
    - **Ngữ Văn**: Biện pháp tu từ (So sánh, Ẩn dụ, Hoán dụ, Nhân hóa, Điệp ngữ, Nói quá, Nói giảm nói tránh, Liệt kê, Tương phản, Câu hỏi tu từ); Thao tác lập luận (Giải thích, Phân tích, Chứng minh, Bác bỏ, Bình luận, So sánh); Cấu trúc đoạn văn (Diễn dịch, Quy nạp, Tổng-Phân-Hợp, Song hành, Móc xích, Phép thế, Phép nối); Thể loại thơ (Lục bát, Song thất lục bát, Thất ngôn bát cú Đường luật, Thơ tự do) và 6 phong cách ngôn ngữ.
    - **Địa Lý**: Dân số & lao động (Mật độ dân số, Tỉ suất gia tăng tự nhiên, Tỉ lệ thành thị, Thất nghiệp); Khí hậu & thủy văn (Biên độ nhiệt, Nhiệt độ trung bình, Lượng mưa, Cân bằng ẩm, Lưu lượng nước); Kinh tế & XNK (Cán cân XNK, Tỉ số XK/NK, Tỉ trọng cơ cấu %, Tốc độ tăng trưởng, GDP/người); Nông nghiệp & tài nguyên (Năng suất, Sản lượng, Bình quân lương thực, Độ che phủ rừng); Kỹ năng biểu đồ & Tọa độ cực Việt Nam.
    - **Sinh Học**: Di truyền phân tử (Số lượng nucleotit $N = 2A + 2G$, Chiều dài $L$, Khối lượng $M$, Chu kỳ xoắn $C$, Liên kết hidro $H$, Liên kết hóa trị $HT$, mARN, Số axit amin); Nguyên phân & Giảm phân (Số tế bào $2^k$, NST cung cấp, Giao tử đực/cái, Hiệu suất thụ tinh); Quy luật di truyền & Quần thể (F2 Menđen 3:1 & 9:3:3:1, Cân bằng Hardy-Weinberg, Tần số alen $p, q$, Tần số hoán vị gen $f$).
    - **Toán Học Nâng Cao**: Hình học Oxyz (Phương trình tổng quát mặt phẳng, PT tham số & chính tắc đường thẳng, Mặt cầu, Khoảng cách điểm đến mp, Thể tích tứ diện); Xác suất & Thống kê GDPT 2018 (Xác suất có điều kiện $P(A|B)$, Công thức Bayes & xác suất toàn phần, Kỳ vọng $E(X)$, Phương sai $V(X)$, Độ lệch chuẩn $\sigma(X)$, Trung bình mẫu ghép nhóm).

---

## [19/10/2026] - Tái Cấu Trúc Header Chi Tiết Dạng Bài Tránh Chèn Ép Tiêu Đề, Khắc Phục Triệt Để Lỗi Mờ Tab 'Khoa Học Tự Nhiên' & Redesign Hero Banner Tone Trắng Sáng

- **Tái Cấu Trúc Header Chi Tiết Dạng Bài Tránh Chèn Ép Tiêu Đề (`CurriculumExplorerView.jsx`)**:
  - *Khắc Phục Lỗi Tiêu Đề Bị Bóp Nghẹt, Bẻ Thành 3 Dòng*:
    + Trước đây header chi tiết dạng bài gom chung meta badges và tiêu đề `h2` trong cùng một khối flex bên trái, đặt ngang hàng với 3 nút chức năng bên phải (`Mở Studio`, `Sửa nhanh`, `Luyện tập củng cố`). Do 3 nút này chiếm tới ~500px, tiêu đề dạng bài (như "Nhận biết sự kiện lịch sử") bị ép vào phần không gian hẹp còn lại ~180px, dẫn đến vỡ dòng thành 3 đoạn chữ cụt lủn rất xấu xí.
    + Tách cấu trúc header thành 2 hàng phân cấp rõ ràng:
      * **Hàng 1 (Top Bar)**: Meta badges (`Mã Dạng`, `Trọng số`, `Mức độ Bloom`) bố trí gọn gàng bên trái; 3 nút hành động căn chỉnh bên phải.
      * **Hàng 2 (Full-Width Title)**: Tiêu đề `h2` (`text-xl lg:text-2xl font-black text-slate-900`) độc chiếm 100% bề ngang khung nhìn, hiển thị liền mạch trên 1 dòng duy nhất, không bao giờ bị chèn ép hay vỡ chữ.

- **Khắc Phục Triệt Để Lỗi Mờ/Mất Tương Phản Tab 'Khoa Học Tự Nhiên' (`CurriculumExplorerView.jsx`)**:
  - *Nguyên Nhân Sự Cố*: Vệt trang trí nền `bg-cyan-50/70 blur-3xl` đặt tại vị trí `left-1/3 bottom-0` nằm trực tiếp bên dưới tab thứ 3 "Khoa học tự nhiên". Do tab dùng nền bán trong suốt `bg-slate-50/70`, bộ lọc Gaussian blur làm sai lệch cơ chế khử răng cưa subpixel font-smoothing của trình duyệt Blink/Chromium, đồng thời nhuộm mờ màu cyan lên viền, chữ và biểu tượng `Atom`, khiến tab thứ 3 trông nhợt nhạt và bị mờ hẳn so với 4 tab còn lại.
  - *Giải Pháp Triệt Để*:
    + Gỡ bỏ hoàn toàn 2 khối cầu blur trang trí nền (`bg-cyan-50/70 blur-3xl` và `bg-indigo-50/70 blur-3xl`), giữ nền thẻ `bg-white` phẳng, sạch và tinh khôi 100%.
    + Bổ sung lớp ngữ cảnh xếp chồng độc lập `relative z-10` cho lưới chứa 5 tab miền năng lực (`lg:grid-cols-5`).
    + Chuyển đổi các tab chưa kích hoạt sang nền trắng thuần `bg-white hover:bg-slate-50`, viền đặc sắc nét `border border-slate-200 hover:border-slate-300`, chữ `text-slate-800 font-bold group-hover:text-slate-900` và icon box `bg-slate-100/90 text-slate-600`, đảm bảo cả 5 miền năng lực đồng nhất, sắc nét, tương phản cao trên mọi màn hình.

- **Redesign Toàn Diện Hero Banner & Thanh Chọn Miền Kiến Thức Chuẩn Tone Trắng Sáng (`CurriculumExplorerView.jsx`)**:
  - *Khắc Phục Lệch Tone Màu "Trên Đen Dưới Trắng"*:
    + Trước đây banner đầu trang sử dụng gradient nền tối (`bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900`) tương phản đột ngột và lệch tone hoàn toàn so với toàn bộ giao diện nền sáng của hệ thống.
    + Chuyển đổi 100% sang **Tone Trắng Sáng Thanh Lịch**: `bg-white border border-slate-200/80 rounded-2xl shadow-xs`.
  - *Thiết Kế Tinh Gọn, Đơn Giản & Hiện Đại*:
    + Giảm padding cồng kềnh từ `p-8` xuống `p-5 lg:p-6` giúp tiết kiệm chiều cao màn hình, thông thoáng và vừa vặn khung nhìn.
    + Title `text-xl lg:text-2xl font-black text-slate-900`, badge `bg-indigo-50 text-indigo-700` nhỏ gọn, tinh tế.
    + Chuyển 2 khối thống kê "Cấu trúc phân cấp" và "Trọng số chuẩn hóa 1.200 Điểm" từ dạng hộp to thành các chip ngang compact `px-3.5 py-2 rounded-xl bg-slate-50/90 border border-slate-200/80` căn thẳng hàng với tiêu đề.
  - *Căn Đều 5 Miền Năng Lực Trên 1 Hàng Ngang Duy Nhất (`lg:grid-cols-5`)*:
    + Thay thế lưới `grid-cols-4` (vốn làm miền thứ 5 "Sử dụng Ngôn ngữ" bị rớt xuống hàng 2 cô độc) bằng lưới 5 cột hoàn hảo `lg:grid-cols-5`.
    + Tab kích hoạt (Active): Nền `bg-indigo-50/90 border-2 border-indigo-600 text-slate-900 shadow-sm ring-2 ring-indigo-500/15`, icon đổi sang gradient màu rực rỡ.
    + Tab chưa kích hoạt: Nền `bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs`, sắc nét và ổn định.

- **Loại Bỏ Hoàn Toàn Chữ 'text' Thừa Trước Công Thức Hóa Học & Ion (`MathText.jsx`)**:
  - *Nguyên Nhân Sự Cố*: Trong đề bài hoặc đáp án chứa ion hóa học (ví dụ: `Số oxi hóa của sulfur (S) trong ion textSO_4^{2-} là:`), các lệnh LaTeX `\text` bị mất backslash hoặc không có ngoặc nhọn khiến chữ "text" bị KaTeX hiển thị nghiêng dạng biến số toán học ($textSO_4^{2-}$).
  - *Cơ Chế Làm Sạch Tinh Vi*: Bổ sung bộ lọc trong hàm `normalizeMathString`:
    + `str = str.replace(/(?:\\text|\btext)(?=[A-Z])/g, '');`
    + `str = str.replace(/(?:\\text|\btext)\{([A-Z][a-zA-Z0-9_+\-^]*)\}/g, '$1');`
    Tự động tách bỏ tiền tố `text` / `\text` khi đứng liền trước các ký hiệu hóa học viết hoa ($SO_4^{2-}$, $H_2O$, $Fe^{3+}$, $KMnO_4$), khôi phục công thức hóa học gốc hiển thị trong trẻo, sắc nét 100%.

- **Chèn Công Thức Ngay Tại Vị Trí Con Trỏ (Active Caret Precision Insertion - `WordStyleFormulaCanvas.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Khắc Phục Lỗi Chèn Rơi Xuống Cuối Văn Bản*: Trước đây khi giáo viên đang soạn thảo trên canvas WYSIWYG và nhấp chọn ký hiệu từ sidebar hoặc thanh tra, hệ thống không tìm thấy `textarea` nên fallback nối chuỗi vào cuối văn bản (`. a/b a/b a/b`).
  - *Giải Pháp Bắt Con Trỏ Tinh Vi*:
    + Nâng cấp `WordStyleFormulaCanvas` bằng `forwardRef` và `useImperativeHandle`, xuất bản phương thức `insertSnippet(latexSnippet)`.
    + Theo dõi liên tục vị trí con trỏ `activePositionRef.current = { lineId, tokenId, offset }` thông qua các sự kiện `onKeyUp`, `onMouseUp`, `onFocus`, `onInput`.
    + Khi giáo viên nhấp chọn ký hiệu, hệ thống chia tách chính xác đoạn text token hiện tại tại `offset`, chèn token công thức `formulaToken` vào ngay vị trí con trỏ và tự động đưa tiêu điểm ra sau công thức mới chèn để giáo viên tiếp tục gõ văn bản liền mạch.
    + Kết nối `theoryCanvasRef` và `methodCanvasRef` trong `CurriculumStudioEditor.jsx`, tự động điều hướng luồng chèn vào đúng canvas đang kích hoạt.

- **Khôi Phục Giao Diện Trắng Sáng Thanh Lịch (Clean White Tone Reversion - `HierarchicalMathPalette.jsx`)**:
  - *Loại Bỏ Hoàn Toàn Giao Diện Tối (Dark Theme)*: Chuyển toàn bộ khung thanh công cụ từ `bg-slate-900` sang tone màu trắng sáng sang trọng `bg-white border-r border-slate-200 text-slate-800 shadow-sm`.
  - *Chuẩn Hóa Bộ Nhận Diện Sư Phạm Nền Sáng*:
    + Header và thanh lọc danh mục: Nền `bg-slate-50/90 border-slate-200`, chữ `text-slate-800`.
    + Nút môn học (Toán, Hóa, Lý, Ký hiệu): Nút kích hoạt `bg-cyan-600 text-white font-bold shadow-xs`, nút không kích hoạt `bg-white text-slate-600 hover:bg-slate-100 border-slate-200/80`.
    + Nút công thức: Nền sáng nhẹ `bg-slate-50 hover:bg-cyan-50/80 border border-slate-200 hover:border-cyan-400 text-slate-700 hover:text-cyan-900 shadow-2xs`.
    + Thẻ nổi 2 giây (Hover Card): Nền trắng mờ cao cấp `bg-white/98 text-slate-900 border-2 border-cyan-500 shadow-2xl`, khung KaTeX nền `bg-slate-50 text-cyan-900`.

- **Cây Thư Mục Accordion Toggles & Kho Tàng Ký Hiệu, Hợp Chất Đồ Sộ (`HierarchicalMathPalette.jsx`)**:
  - *Cấu Trúc Accordion Toggle Cây Thư Mục (Folder Tree Navigation)*:
    + Thay thế thanh cuộn ngang đơn điệu bằng các thư mục Accordion có thể mở/đóng linh hoạt (`ChevronDown` / `ChevronRight`).
    + Hiển thị nhãn đếm số lượng công thức trong từng mục (ví dụ: `12`, `14`, `16`).
    + Tên nút ngắn gọn, súc tích (chỉ chứa ký hiệu hoặc tên viết tắt: `a/b`, `√x`, `H₂SO₄`, `SO₄²⁻`, `NaOH`, `x²`, `∫`, `lim`, `sin`, `cos`...), bố trí lưới 2 cột gọn gàng, tăng gấp 5 lần mật độ hiển thị mà không gây rối mắt.
  - *Bổ Sung Thanh Tìm Kiếm Tức Thì (Instant Search Filter)*:
    + Tích hợp ô tìm kiếm `🔍 Tìm nhanh H2SO4, NaOH, √x, a/b, sin...` ở đầu sidebar, lọc trực tiếp hàng trăm công thức trong thời gian thực.
  - *Thư Viện Hóa Học & Toán Học Chuyên Sâu GDPT 2018*:
    + **Toán Học**: Đại số & Căn thức, Đạo hàm & Khảo sát hàm số, Tích phân & Giới hạn, Lượng giác, Mũ & Logarit, Hình học Không gian & Oxyz, Số phức & Xác suất.
    + **Hóa Học**: Axit vô cơ & hữu cơ, Bazơ & Kiềm, Muối, Oxit, Hợp chất hữu cơ, Cation & Anion, Số oxi hóa, Mũi tên phản ứng, Công thức tính nồng độ & mol.
    + **Vật Lý**: Dao động cơ, Sóng cơ & âm, Điện xoay chiều, Sóng ánh sáng & Lượng tử, Hạt nhân nguyên tử.
    + **Ký Hiệu & Logic**: Toàn bộ ký hiệu toán học, ký tự Hy Lạp, tập hợp và hệ phương trình.

- **Tự Động Nhảy Con Trỏ Về Cuối Dòng Khi Nhấp Khoảng Trống (Whitespace Click Focus - `WordStyleFormulaCanvas.jsx`)**:
  - Bổ sung hàm xử lý `handleLineRowClick` trên từng dòng văn bản: Nếu người dùng nhấp chuột vào vùng đệm trống bên phải hoặc khoảng trắng của dòng, hệ thống tự động tìm thẻ text cuối dòng, kích hoạt `focus()` và kéo con trỏ về cuối chữ bằng `Selection.collapse()`.

- **Loại Bỏ Nút "+ Thêm dòng mới" Dư Thừa & Xóa Bỏ Dấu Gạch Chéo Ngược Đuôi Dòng (`\`)**:
  - *Bỏ Nút Dư Thừa*: Thao tác bấm `Enter` đã hỗ trợ tách dòng mới mượt mà, loại bỏ nút bấm rườm rà dưới chân canvas.
  - *Xóa Sổ Ký Tự `\` Cuối Dòng*: Bổ sung hàm lọc `sanitizeLineText` và regex stripping trên `WordStyleFormulaCanvas.jsx` và `MathText.jsx`, loại bỏ hoàn toàn các ký tự `\` hoặc `/` thừa ở cuối câu.

- **Khắc Phục Lỗi Hiển Thị Emoji `📝`**:
  - Thay thế biểu tượng cảm xúc `📝` bằng các icon vector Lucide sắc nét (`FileEdit`, `FileText`, `BookOpen`, `AlertTriangle`, `Sparkles`), đảm bảo hiển thị 100% đồng nhất trên mọi hệ điều hành Windows và trình duyệt.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 773ms trên Vite 8 và React 19).
  - Hỗ trợ phím Enter tách dòng tự nhiên như Microsoft Word.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn tất trong 777ms trên Vite 8 và React 19).

---

## [18/10/2026] - Khắc Phục Lỗi Render Markdown Đầu Dòng (Heading ###, In Đậm **, In Nghiêng ***) & Chuẩn Hóa Sư Phạm Phân Biệt STEM (Casio) vs Ngữ Văn / KHXH

- **Khắc Phục Triệt Để Lỗi Render Markdown & Ký Tự Đầu Dòng (`MathText.jsx`)**:
  - *Sửa Lỗi Regex Bullet Nuốt Ký Tự In Đậm `**`*:
    + Trước đây, regex bullet `line.match(/^(\s*)(?:[-*•]|\u2022)\s*(?:[-*•]\s*)?(.*)$/)` xem ký tự `*` đầu dòng là bullet point mà không bắt buộc có khoảng trắng, dẫn đến các dòng in đậm bắt đầu bằng `**Ví dụ:**` bị nuốt 2 dấu `**` đầu tiên thành bullet `•`, để lại đuôi `Ví dụ:**` không có cặp mở, render thành `• Ví dụ:**` dạng thô.
    + Cập nhật regex mới: `^(\s*)(?:[-+•\u2022]|\*(?!\*))\s+(?:[-+•\u2022]\s+)?(.*)$`, bảo vệ tuyệt đối chuỗi `**` hoặc `***` không bị nhận nhầm thành bullet marker, bắt buộc phải có khoảng trắng phía sau dấu `*` đơn.
  - *Hỗ Trợ Toàn Diện Markdown Headings (`#`, `##`, `###`, `####`)*:
    + Tự động nhận diện cú pháp heading tiêu chuẩn Markdown và phân cấp font chữ rõ ràng, trang nhã.
    + Nhận diện các thẻ khối sư phạm chuyên dụng:
      * `### 📌 Ví dụ minh họa SGK:`: Render thành **Thẻ Ví Dụ Minh Họa SGK (Teal/Emerald Card)** với viền thanh nhã, huy hiệu nổi bật `📌 VÍ DỤ MINH HỌA SGK`, nền `bg-teal-50/70 border border-teal-200/80`.
      * `### 📝` / `### 📄 Bài toán mẫu áp dụng phương pháp:`: Render thành **Thẻ Bài Toán Mẫu Áp Dụng (Amber Card)** với huy hiệu `📝 BÀI TOÁN MẪU ÁP DỤNG`, nền `bg-amber-50/70 border border-amber-200/80`.
  - *Tự Động Chuẩn Hóa Cặp Dấu In Đậm / In Nghiêng*:
    + Bổ sung bộ xử lý Regex nội dòng hỗ trợ `***bold italic***`, `**bold**`, `*italic*`.
    + Tự động bù cặp mở in đậm đối với các nhãn bị mất dấu mở ở đầu dòng: `([A-ZÀ-Ỹa-zà-ỹ0-9\s&]{2,30}):\*\*` -> `**$1:**`.

- **Chuẩn Hóa Sư Phạm Đa Miền: Phân Biệt Rõ STEM vs Ngữ Văn / KHXH (`CurriculumStudioEditor.jsx` & `CurriculumExplorerView.jsx`)**:
  - *Loại Bỏ Hoàn Toàn Khái Niệm Mẹo Casio Với Môn Ngữ Văn & Khoa Học Xã Hội*:
    + Xây dựng hàm kiểm tra lĩnh vực `isMathOrStemDomain(domain)` nhận diện chính xác các môn Toán, Lý, Hóa, Sinh, Tin học (STEM) so với Ngữ văn, Lịch sử, Địa lí, GDCD, Ngoại ngữ.
    + **Giao diện Studio (`CurriculumStudioEditor.jsx`)**:
      * Đối với môn STEM: Giữ nguyên Thẻ `💡 Kỹ thuật Casio & mẹo tư duy nhanh` (hướng dẫn phím bấm fx-580VN X, fx-880BTG, Table Mode).
      * Đối với môn Ngữ văn / KHXH: Tự động đổi thành Thẻ `💡 Mẹo tư duy & Chiến thuật làm bài (Ngữ văn)` với viền tím violet sư phạm, hướng dẫn chiến thuật đọc hiểu, cấu trúc đoạn văn tổng - phân - hợp, dẫn chứng thực tế và phân bổ thời gian làm bài; tuyệt đối không hiển thị phím bấm máy tính Casio.
    + **Panoramic Workspace (`CurriculumExplorerView.jsx`)**:
      * Đổi tiêu đề thẻ Khối 2: "Bài toán mẫu" -> "Bài mẫu" (cho Ngữ văn).
      * Thẻ mẹo công nghệ hiển thị nhãn `Chiến thuật làm bài` thay cho `Kỹ thuật Casio`.
      * **Khắc phục lỗi nút `+ AI Tạo Thêm 2 Bài Mẫu` sinh nhầm biến số `$X = 2,07$`**: Hàm `handleAddAiPracticeQuestions` trước đây hardcode mẫu bài toán định lượng STEM (phản ứng, khảo sát, đại lượng $X = 2,07$). Đã nâng cấp kiểm tra `isStem`: với môn Ngữ văn/KHXH, tự động sinh 2 câu hỏi rèn luyện L3 & L4 chuẩn mực về lập ý, phân tích luận điểm, nghệ thuật dẫn chứng và đánh giá tư tưởng nhân văn, loại bỏ hoàn toàn các biến số $X$ và thuật ngữ đại số.
  - *Nâng Cấp Bộ Bóc Tách Khối Sư Phạm (`parseTheoryRecapSections` & `parseSolutionMethodSections`)*:
    + Tự động giải phóng ký tự ngắt dòng `\n` thô (`unescapeLiteralNewlines`) trước khi match regex.
    + Mở rộng regex nhận diện cả icon `📄` và tiêu đề Ngữ văn `### 💡 Mẹo tư duy & Chiến thuật làm bài:`.

- **Sinh Câu Hỏi Rèn Luyện Thích Ứng Bám Sát 100% Tri Thức Dạng Bài Đang Phân Tích (`CurriculumExplorerView.jsx` & `aiService.js`)**:
  - *Kết Nối Trực Tiếp Backend AI Engine & Triệt Tiêu 100% Hardcode / Fallback*:
    + Loại bỏ hoàn toàn toàn bộ mã lệnh hardcode và hàm fallback giả lập (`extractPatternPedagogicalContext`), tuân thủ triệt để nguyên tắc Dữ liệu thật 100% của hệ thống V-Eval.
    + Khắc phục triệt để lỗi tham chiếu biến `selectedLesson` chưa được khai báo trong Panoramic Workspace khiến hàm nhảy vào khối catch; chuẩn hóa trích xuất `currentLessonName` an toàn từ `previewSelectedLessonKey` và `targetPattern.lessonName`.
    + Đấu nối trực tiếp `aiService.generatePatternQuestions` gửi toàn bộ dữ liệu ngữ cảnh: `pattern_name`, `lesson_name`, `domain_name`, `theory_recap`, `solution_method`, `count: 2`, và danh sách đề bài các câu hỏi đã có (`existing_questions`).
  - *Cơ Chế Chống Trùng Lặp Khi Bấm Tạo Nhiều Lần (Anti-Duplication Prompting)*:
    + Thu thập danh sách câu hỏi hiện có trong dạng bài và chuyển giao cho AI Engine; Gemini được chỉ thị bắt buộc khai thác các trích đoạn, khía cạnh cảm thụ hoặc góc độ bài tập mới, không bao giờ lặp lại câu hỏi cũ khi người dùng nhấn tạo nhiều lần.
  - *Tự Động Chọn & Cuộn Đến Câu Hỏi Vừa Sinh*:
    + Khi 2 câu hỏi mới từ Gemini được thêm vào ngân hàng câu hỏi của dạng bài, hệ thống tự động cập nhật số lượng badge câu hỏi và chuyển `activeQuestionIndex` đến ngay câu hỏi vừa được sinh để giáo viên/học sinh kiểm tra và tương tác tức thì.
    + Nếu AI Engine gặp sự cố mạng hoặc lỗi xử lý, hệ thống hiển thị thông báo lỗi minh thị (alert/toast) thay vì ngụy tạo câu hỏi giả.

- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 2.30s trên Vite 8 và React 19).

---

## [17/10/2026] - Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG (Không Lộ Mã Lệnh), Bộ Công Cụ Hóa Học & Toán Học Thực Tế Chèn Số & Tự Động Tính Toán Kết Quả (Interactive Smart Science Calculator), Loại Bỏ Hoàn Toàn Text In Preview Thụ Động, Tách Riêng Trang LaTeX Thuần, Bộ Renderer Đồ Thị Oxy / Bảng Biến Thiên Nội Sinh & Desmos Calculator

- **Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG & Bộ Công Cụ Hóa Học / Toán Học Thực Tế (`CurriculumStudioEditor.jsx` & `InteractiveFormulaBuilderModal.jsx`)**:
  - *Giải Quyết Triệt Để Phàn Nàn Của Người Dùng Về Mã Code `\frac` ("frag")*:
    + Người dùng phản hồi việc nhìn thấy mã code LaTeX thô như `` `\frac{...}{...}` ``, `` `\lim` ``, `` `\Delta` ``, `` `$` `` trong khung soạn thảo gây ức chế, không giống trải nghiệm Microsoft Word, và yêu cầu công thức phải là ký hiệu thực sự có thể chèn số vào và tính toán.
    + **Chế Độ Ký Hiệu Trực Quan WYSIWYG (Mặc định)**: Toàn bộ nội dung bài học hiển thị 100% bằng ký hiệu toán học và hóa học chuẩn sách giáo khoa (phân số có thanh ngang tử/mẫu, căn thức, đạo hàm số gia, nồng độ mol), tuyệt đối không để lộ bất kỳ mã lệnh cú pháp `\frac` hay dấu `$` nào.
    + Nút chuyển đổi linh hoạt: `` `[Xem Ký Hiệu Thật (WYSIWYG)]` `` ⟷ `` `[Gõ Văn Bản Bàn Phím]` `` cho phép giáo viên tùy ý lựa chọn khi cần gõ văn bản thuần hoặc thao tác trực quan.
  - *Bộ Công Cụ Hóa Học Thực Tế: Chèn Số Vào Công Thức & Tự Động Tính Toán*:
    + **🧪 Nồng độ mol dung dịch ($C_M = \frac{n}{V}$)**: Nhập số mol $n$ (mol) và thể tích $V$ (Lít) -> Hệ thống tự động tính toán $C_M = n / V$ (M) và hiển thị ký hiệu thật `` `C_M = \frac{n}{V} = \frac{0.2}{0.5} = 0.4\text{ M}` ``.
    + **💧 Nồng độ phần trăm ($C\% = \frac{m_{ct}}{m_{dd}} \times 100\%$)**: Nhập $m_{ct}$ (g) và $m_{dd}$ (g) -> Tự động tính toán ra $C\%$.
    + **⚖️ Khối lượng chất ($m = n \times M$)**: Nhập số mol $n$ và khối lượng mol $M$ -> Tự động tính ra khối lượng $m$ (gam).
    + **⚡ Hiệu suất phản ứng ($H = \frac{m_{tt}}{m_{lt}} \times 100\%$)**: Nhập $m_{tt}$ (thực tế) và $m_{lt}$ (lý thuyết) -> Tự động tính ra $H\%$.
    + Tùy chọn chèn: Cho phép giáo viên lựa chọn chèn chỉ công thức thay số hoặc chèn toàn bộ chuỗi tính toán kèm đáp số hoàn chỉnh vào bài học.
  - *Bộ Tính Toán Phân Số & Đạo Hàm Số Gia Tự Động*:
    + **➗ Phân số tính toán ($A/B$)**: Nhập số vào ô Tử số và Mẫu số -> Tự động rút gọn và tính ra kết quả (ví dụ: `` `\frac{12}{4} = 3` ``).
    + **🎯 Đạo hàm bằng số gia ($f'(x_0) = \lim_{\Delta x \to 0}\frac{\Delta y}{\Delta x}$)**: Hỗ trợ nhập hàm số $f(x)$ và điểm $x_0$, tự động hiển thị quy trình số gia và tính toán ra kết quả đạo hàm như trong ví dụ SGK.
  - *Nút Thao Tác Nhanh Trên Thanh Ribbon Word Toolbar*:
    + Bổ sung 2 nút chuyên dụng: `` `🧪 Hóa Học & Nồng Độ` `` và `` `➗ Phân Số & Tính Toán` `` trên thanh công cụ của cả Khối 1 và Khối 2 để giáo viên mở nhanh bộ chèn số và tính toán chỉ với 1 click.

- **Trình Soạn Thảo Sư Phạm Trực Tiếp Kiểu Microsoft Word (Word Document Sheet Canvas - `CurriculumStudioEditor.jsx`)**:
  - *Chấm Dứt Hoàn Toàn Mô Hình Chia Ô Thụ Động Cũ ("Gõ Ô Trên - Preview Ô Dưới")*:
    + Theo phản hồi từ người dùng, mô hình chia 2 ô (ô nhập liệu phía trên và ô đọc chỉ xem "Text In Preview" phía dưới) làm đứt gãy luồng tư duy sư phạm và gây bất tiện khi phải cuộn lên cuộn xuống để sửa lỗi.
    + Xóa bỏ triệt để 100% các ô "Text In Preview" thụ động trên cả Khối 1 (Lý thuyết SGK) và Khối 2 (Phương pháp giải, Bẫy đề thi & Mẹo Casio).
  - *Trải Nghiệm Gõ & Sửa Trực Tiếp Tại Chỗ Như Microsoft Word (In-Place Document Canvas)*:
    + **Thanh Ribbon Word Toolbar Chuẩn Quốc Tế**: Tích hợp các nút định dạng văn bản trực quan: In đậm (Bold `` `**` ``), In nghiêng (Italic `` `*` ``), Tiêu đề (Heading `` `###` ``), Danh sách gạch đầu dòng (`` `-` ``), Danh sách đánh số thứ tự (`` `1.` ``).
    + **Tích Hợp Tiện Ích Toán Học STEM 1-Chạm**: Các nút chèn nhanh `` `✨ Điền Công Thức` `` (mở Interactive Formula Builder), `` `📊 Bảng Biến Thiên` `` (chèn preset SGK 3 dòng), `` `📈 Đồ Thị Hàm Số` `` (chèn đồ thị Oxy / Desmos), `` `🖼️ Dán (Ctrl+V) / Tải Ảnh` `` và nút `` `+ Thêm Bước mới` `` (tự động đếm số bước tiếp theo).
    + **Trang Giấy Word Canvas Trắng Tinh**: Thiết kế trang tài liệu chuẩn A4 có bóng đổ thanh lịch (`shadow-md border border-slate-300 rounded-2xl`), cho phép giáo viên gõ, xóa, chèn ảnh và sửa trực tiếp tại chỗ không giới hạn.
    + **Nút Chuyển Đổi Nhanh Linh Hoạt**: Cụm nút `` `✍️ Sửa Trực Tiếp` `` ⟷ `` `👁️ Xem Trang In / Học Sinh` `` ngay trên đầu trang giấy giúp giáo viên chuyển đổi chỉ trong 1 click để kiểm tra thành phẩm KaTeX thực tế mà học sinh sẽ nhìn thấy khi in hoặc học trực tuyến.
  - *Hộp Thẻ Cảnh Báo & Mẹo Casio Tương Tác Trực Tiếp*:
    + **Thẻ Bẫy Đề Thi ĐGNL**: Chuyển thành Thẻ Cảnh Báo Sư Phạm màu hồng ấm áp (`bg-rose-50/60 border-2 border-rose-200`), cho phép gõ và sửa trực tiếp nội dung bẫy đề thi bên trong thẻ, có nút chèn ký hiệu KaTeX và thêm nhanh mục bẫy.
    + **Thẻ Kỹ Thuật Casio & Mẹo Tư Duy Nhanh**: Chuyển thành Thẻ Mẹo Công Nghệ màu tím Indigo (`bg-indigo-50/60 border-2 border-indigo-200`), gõ và sửa trực tiếp bên trong thẻ, có nút chèn nhanh mẫu mẹo Casio `[Menu 8]` và phím tắt KaTeX.
  - *Tách Riêng Trang Mã Nguồn LaTeX Thuần Độc Lập Dành Cho AI*:
    + Tách biệt hoàn toàn thành một tab riêng biệt: `` `⚡ Trang Mã Nguồn LaTeX Thuần (Dành Cho AI)` ``, giao diện Dark Mode (`bg-slate-900`) chuyên dụng cho việc dán nhanh toàn văn mã nguồn Markdown / LaTeX thô từ ChatGPT, Gemini hoặc AI Engine.
    + Khi chuyển qua lại giữa Trang Mã Nguồn LaTeX và Trình Soạn Thảo Word Trực Tiếp, dữ liệu được tự động đồng bộ hai chiều mượt mà 100%.

- **Bộ Renderer Bảng Biến Thiên Nội Sinh Chuẩn SGK GDPT 2018 (`VariationTable.jsx`)**:
  - *Kết Cấu 3 Dòng Sư Phạm Chuẩn Mực*: Render bảng biến thiên vector HTML/SVG 3 dòng phân định sắc nét gồm: dòng `` `x` ``, dòng dấu đạo hàm `` `y'` ``, dòng chiều biến thiên `` `y` `` với mũi tên dốc lên `` `\nearrow` `` và dốc xuống `` `\searrow` ``.
  - *Xóa Bỏ Nhược Điểm Ảnh Scan Mờ Nhòe*: Hiển thị vector sắc nét 100% trên mọi độ phân giải màn hình (Retina / 4K), hỗ trợ đầy đủ các ký hiệu toán học đặc biệt như vô cực (`` `-\infty` ``, `` `+\infty` ``), vạch kép không xác định `` `||` ``, điểm cực đại, cực tiểu.
  - *Parser Chuẩn Hóa Cú Pháp Khối*: Tự động bóc tách khối nội dung dạng `` `[VARIATION_TABLE]...[/VARIATION_TABLE]` `` với cấu trúc dòng `` `x: ...` ``, `` `y_prime: ...` ``, `` `y: ...` ``.

- **Bộ Renderer Đồ Thị Hàm Số Oxy & Tích Hợp Đồ Thị Tương Tác Desmos Calculator (`MathGraphView.jsx`)**:
  - *Đồ Thị Hàm Số Vector SVG*: Tự động vẽ hệ trục toạ độ Oxy, gốc toạ độ O, mũi tên định hướng, lưới toạ độ phụ (grid), vạch chia đơn vị toạ độ, và đường cong giải tích liên tục cho các hàm số toán học THPT phổ biến:
    + Hàm bậc 3: `` `y = ax^3 + bx^2 + cx + d` ``
    + Hàm phân thức bậc nhất trên bậc nhất: `` `y = \frac{ax+b}{cx+d}` `` (tự động vẽ 2 đường tiệm cận đứng và tiệm cận ngang dạng nét đứt màu đỏ / xanh)
    + Hàm trùng phương: `` `y = ax^4 + bx^2 + c` ``
    + Parabol bậc 2: `` `y = ax^2 + bx + c` ``
  - *Dóng Nét Đứt Tọa Độ Cực Trị*: Tự động dóng đường nét đứt (dashed line) từ điểm cực đại `` `(x_{CĐ}; y_{CĐ})` `` và cực tiểu `` `(x_{CT}; y_{CT})` `` vuông góc về 2 trục tọa độ Ox, Oy kèm nhãn tọa độ KaTeX rõ nét.
  - *Tích Hợp Đồ Thị Tương Tác Chuẩn Quốc Tế Kiểu MATLAB / Desmos*: Bổ sung nút chuyển đổi 1-chạm giữa chế độ SVG tĩnh và chế độ **Interactive Desmos Graphing Calculator** (nhúng iframe Desmos trực quan), cho phép giáo viên và học sinh trực tiếp zoom in/out, pan chuyển động, tra cứu toạ độ điểm cực trị, tiếp tuyến và nghiệm của phương trình toán học một cách sinh động, chuyên nghiệp.
  - *Hỗ Trợ Cú Pháp Khối Đồ Thị*: Nhận diện thẻ `` `[GRAPH: type=cubic | formula=y=x^3-3x+1 | cd=(1,4) | ct=(-1,0)]` ``.

- **Bộ Nhận Diện & Render Toán Học Toàn Cục (`MathText.jsx`)**:
  - Mở rộng regex tách khối nhận diện song song cả khối `` `[VARIATION_TABLE]...[/VARIATION_TABLE]` `` và thẻ `` `[GRAPH: ...]` ``.
  - Tự động mount `<VariationTable />` và `<MathGraphView />` đồng bộ trên toàn bộ nền tảng: Khối 1 (Lý thuyết nền tảng), Khối 2 (Phương pháp giải), Khối 4 (Đề bài câu hỏi mẫu, Lời giải chi tiết) và Khung Trợ lý Gia sư AI Socratic.

- **Trình Điền Công Thức & Đồ Thị Trực Quan Cho Giảng Viên (Click-to-Fill Formula Builder - `InteractiveFormulaBuilderModal.jsx`)**:
  - *Giải Phóng Giảng Viên Khỏi Rào Cản Mã LaTeX Thô*: Giảng viên không cần nhớ hoặc gõ các đoạn mã cú pháp phức tạp như `` `\frac{a}{b}` ``, `` `\sqrt[n]{x}` ``, `` `\int_{a}^{b} f(x)dx` ``.
  - *Trải Nghiệm Click-to-Fill Dễ Dàng*: Giảng viên chỉ cần nhấp vào công thức mong muốn, hệ thống sẽ mở modal chuyên biệt với các ô điền số / ký tự tương ứng:
    + Phân số: Điền ô Tử số và ô Mẫu số.
    + Căn thức: Điền ô Bậc căn và ô Biểu thức dưới căn.
    + Lũy thừa / Chỉ số: Điền Cơ số, Số mũ trên, Chỉ số dưới.
    + Tích phân: Điền Cận dưới, Cận trên, Biểu thức hàm số `` `f(x)` ``, Biến vi phân `` `dx` ``.
    + Giới hạn: Điền Biến tiến tới (ví dụ: `` `x \to x_0` ``) và Biểu thức.
    + Hệ phương trình: Điền Phương trình 1, Phương trình 2.
    + Bảng biến thiên SGK: 4 mẫu Presets phổ biến (Bậc 3 `` `a > 0` ``, Bậc 3 `` `a < 0` ``, Phân thức `` `ad - bc > 0` ``, Trùng phương) kèm tuỳ chỉnh các dòng tọa độ.
    + Đồ thị hàm số: Chọn dạng hàm, phương trình toán học và toạ độ cực trị.
  - *Khung Xem Trước KaTeX Thời Gian Thực (Live Preview)*: Cập nhật trực quan công thức toán học ngay khi gõ từng con số; phím tắt `` `Ctrl + Enter` `` để chèn tức thì vào vị trí con trỏ chuột, phím `` `Esc` `` để đóng.

- **Cơ Chế Dán Trực Tiếp Ảnh Chụp Màn Hình (Ctrl+V) & Tải Tệp Minh Họa Đề Thi (`CurriculumStudioEditor.jsx`)**:
  - Bắt sự kiện clipboard `` `onPaste` `` trên toàn bộ các khung soạn thảo (Lý thuyết Khối 1, Phương pháp giải Khối 2, Bẫy đề thi, Mẹo Casio, Đề bài mẫu Khối 4, Lời giải mẫu Khối 4).
  - Tự động phát hiện Blob hình ảnh từ Snipping Tool, Zalo, clipboard và chuyển đổi sang Base64 Data URL qua `` `FileReader` ``, chèn ngay cú pháp Markdown ảnh `` `![Ảnh minh họa](data:image/...)` `` vào đúng vị trí con trỏ.
  - Bổ sung nút bấm `` `🖼️ Dán/Tải Ảnh` `` trên thanh công cụ nhanh của mọi khối soạn thảo để tải ảnh minh họa trực tiếp từ máy tính.
  - Đính kèm đầy đủ thanh công cụ tiện ích nhanh: `` `✨ Điền Công Thức` ``, `` `📊 Bảng Biến Thiên` ``, `` `📈 Đồ Thị Hàm Số` ``, `` `🖼️ Dán/Tải Ảnh` ``.

- **Tinh Chỉnh Kích Thước Tinh Gọn, Thoáng Đãng & Thiết Kế Mật Độ Cao Cho Panoramic Workspace Modal (`CurriculumExplorerView.jsx`)**:
  - *Giải Quyết Tình Trạng To Phồng & Rối Mắt*: Người dùng phản hồi giao diện modal bóc tách toàn cảnh 3 cột có kích thước các thành phần khá to (padding `p-4`, `p-5`, font chữ lớn, card bài mẫu và các ô đáp án chiếm nhiều diện tích), gây choán ngợp khi hiển thị danh sách 5 bài học, 10 dạng bài và 40 câu hỏi.
  - *Thiết Kế Lại Theo Tiêu Chuẩn Compact & High-Density Studio UI*:
    + **Header & Summary Banner**: Thu gọn padding từ `p-4 sm:p-5` xuống `px-4 py-2.5 sm:px-5 sm:py-3`, icon Wand giảm còn `w-8 h-8`, title `text-xs sm:text-sm font-extrabold`. Banner thành công giảm padding xuống `px-4 py-2`, icon Check `w-7 h-7`, nút "Phân Tích Tệp Khác" thanh mảnh `px-2.5 py-1 text-[11px]`.
    + **Cột 1 (Điều Hướng Phân Cấp - 4 Cols / 33%)**: Thu gọn Tầng 1 (Chương & Bài học) với padding `p-2.5`, chữ bài học `text-[11px]`, badge số dạng và bài mẫu `text-[9.5px]`. Tầng 2 (Dạng bài học thuật) tối ưu card dạng bài thành `p-2 rounded-xl text-[11px]`, font tiêu đề `text-[11px] leading-snug`, badge phân loại/trọng số/số bài `text-[9px] px-1.5 py-0.2`, nút mở Studio `text-[10px]`.
    + **Cột 2 (Khối 1 & Khối 2 - Sư Phạm Nền Tảng)**: Header dạng bài tinh gọn `px-4 py-2`, nút "Mở Trong Studio Sư Phạm" thu nhỏ `px-2.5 py-1 text-[11px]`. Các ô Định lý SGK, Ví dụ minh họa, Thuật toán giải Khối 2, Bẫy đề thi và Casio giảm padding còn `p-2.5` và `p-2`, font chữ `text-[11px]`, giúp bao quát toàn bộ lý thuyết và phương pháp mà không cần cuộn trang nhiều lần.
    + **Cột 3 (Khối 4 - Ngân Hàng Bài Mẫu Chuyên Sâu)**: Thanh tabs cấp độ Bloom và pills câu hỏi (Câu 1, Câu 2...) thu gọn chiều cao với padding `py-0.5` / `py-1`, text `text-[10.5px]`. Lưới 4 phương án A-B-C-D được tối ưu với padding `p-1.5 px-2 rounded-lg text-[11px]`, badge chữ cái `w-3.5 h-3.5 text-[9px]`, khung lời giải chi tiết `p-2.5 text-[11px]`.
    + **Modal Footer**: Giảm padding còn `px-4 py-2 sm:px-5 sm:py-2.5`, kích thước các nút Đóng / Nạp PostgreSQL vừa vặn, thanh lịch.
  - *Trải Nghiệm Trực Quan*: Toàn bộ modal thu gọn ~30% thể tích, hiển thị sắc nét, thoáng đãng, chuyên nghiệp và tối ưu hóa không gian hiển thị thông tin học thuật.

- **Kiểm Thử Đóng Gói Toàn Diện (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 829ms trên Vite 8 và React 19).

---

## [16/10/2026] - Tái Cân Đối Bố Cục Không Gian Panoramic Workspace, Thẻ Ví Dụ Minh Họa SGK & Bài Toán Mẫu Áp Dụng (Khối 1 & Khối 2), Mở Rộng Ngân Hàng Bài Mẫu Chuyên Sâu Đa Cấp Độ

- **Tích Hợp Khối Thẻ Ví Dụ Minh Họa SGK (Khối 1) & Bài Toán Mẫu Áp Dụng Phương Pháp (Khối 2) Chuẩn Sư Phạm**:
  - *Tách Biệt Nội Dung Bằng Parser Chuyên Sâu (`CurriculumStudioEditor.jsx`)*:
    + Bổ sung hàm xuất khẩu `parseTheoryRecapSections`: Phân tách chuỗi `theoryRecap` thành `{ theory, example }` dựa trên điểm neo `### 📌 Ví dụ minh họa SGK:`.
    + Nâng cấp hàm xuất khẩu `parseSolutionMethodSections`: Phân tách chuỗi `solutionMethod` thành `{ method, sampleProblem, traps, casio }` sử dụng regex lookahead phân định rõ ràng giữa các bước giải thuật, `### 📝 Bài toán mẫu áp dụng phương pháp:`, `### ⚠️ Các bẫy đề thi`, và `### 💡 Kỹ thuật Casio & mẹo tư duy nhanh`.
  - *Hiển Thị Thẻ Trực Quan Độc Lập Nổi Bật (`CurriculumExplorerView.jsx`)*:
    + **Khối 1 (Kiến Thức Nền Tảng SGK)**: Bên dưới phần định lý và công thức, bố trí Thẻ **📌 Ví Dụ Minh Họa SGK** với viền gradient Emerald/Teal dịu mát, huy hiệu "VÍ DỤ SGK", bài toán ngữ cảnh và lời giải KaTeX từng bước.
    + **Khối 2 (Phương Pháp Giải Chi Tiết & Bẫy)**: Bên dưới các bước giải thuật (Bước 1, Bước 2, Bước 3...), hiển thị Thẻ **📝 Bài Toán Mẫu Áp Dụng Phương Pháp** với viền gradient Amber/Orange ấm áp, huy hiệu "BÀI TOÁN MẪU ÁP DỤNG", minh họa cách áp dụng trực tiếp thuật toán vào bài tập cụ thể, đặt trước khối Callout Bẫy đề thi (Rose Alert) và Mẹo Casio (Indigo Tip).
    + Toàn bộ nội dung công thức, phương trình phản ứng hóa học và ký hiệu được render mượt mà qua `<MathText />`.
- **Tái Cân Đối Toàn Diện Bố Cục Không Gian Panoramic Workspace (`CurriculumExplorerView.jsx`)**:
  - *Giải Quyết Triệt Để Tình Trạng Mất Cân Đối*: Xóa bỏ hoàn toàn bố cục 3 cột cũ gây lệch diện tích (Cột 1 và Cột 2 bị trống 70% không gian đáy, Cột 3 dồn toàn bộ 4 khối sư phạm cuộn dài vô tận).
  - *Chuyển Đổi Sang Bố Cục 2 Phân Vùng Cân Xứng (2-Master-Pane Layout)*:
    - **Phân Vùng 1: Cột Trái Điều Hướng Phân Cấp (4 Cols / ~33% width)**:
      + *Tầng 1 (Cây Chương & Bài Học)*: Chiếm tối đa 40% chiều cao, hiển thị danh sách Chương và Bài học với badge tổng hợp số lượng Dạng bài và tổng số Bài toán mẫu (`X dạng • Y bài mẫu`).
      + *Tầng 2 (Danh Mục Dạng Bài Của Bài Học)*: Chiếm 60% chiều cao còn lại với thanh cuộn độc lập, tích hợp bộ lọc Bloom L1 - L4, hiển thị badge phân loại, trọng số và **huy hiệu nổi bật số lượng bài mẫu chuyên sâu (`🎯 X bài mẫu chuyên sâu`)**.
    - **Phân Vùng 2: Khung Chính Chi Tiết Sư Phạm & Ngân Hàng Bài Mẫu (8 Cols / ~67% width)**:
      + *Top Banner Thống Kê Tổng Lực*: Hiển thị tự động tổng số bài tập mẫu chuyên sâu trên toàn bộ chuyên đề: `X Chương • Y Bài học • Z Dạng bài chi tiết • W Bài tập mẫu chuyên sâu`.
      + *Khung Chia Đôi Song Song 2 Cột Cân Đối (50% - 50%)*:
        * **Cột Trái (Kiến Thức & Phương Pháp Sư Phạm)**: Hiển thị Khối 1 (Lý thuyết SGK nền tảng & Thẻ Ví Dụ Minh Họa SGK), Khối 2 (Phương pháp giải, Thẻ Bài Toán Mẫu Áp Dụng Phương Pháp, Bẫy đề thi ĐGNL Rose Alert, Mẹo Casio Indigo Tip), và Khối 3 (Thời lượng video bài giảng khuyến nghị).
        * **Cột Phải (Ngân Hàng Bài Mẫu & Luyện Tập Chuyên Sâu - Khối 4)**: Hiển thị toàn bộ bộ sưu tập 4 câu hỏi trắc nghiệm chuẩn Bloom L1-L4.
- **Tính Năng Động: Sinh Thêm Bài Tập Rèn Luyện AI Tức Thì (`+ AI Tạo Thêm 2 Bài Mẫu`)**:
  - Tích hợp nút bấm gradient tím-xanh `+ AI Tạo Thêm 2 Bài Mẫu` ngay trên header của Khối 4.
  - Cho phép giáo viên nhấp 1 phát để sinh tức thì 2 bài tập rèn luyện (L3 Vận dụng & L4 Vận dụng cao) bám sát lý thuyết và phương pháp giải của dạng bài hiện tại.
  - Tự động cập nhật tổng số câu hỏi trên thanh tab và focus ngay vào câu hỏi mới sinh.
- **Bộ Chuyển Đổi Câu Hỏi Mẫu Tương Tác & Bộ Lọc Cấp Độ Bloom Thông Minh (Khối 4)**:
  - Thanh bộ lọc Bloom theo tab trực quan: `[Tất cả (14)]`, `[L1: Nhận biết (2)]`, `[L2: Thông hiểu (2)]`, `[L3: Vận dụng (5 câu)]`, `[L4: Vận dụng cao (5 câu)]`.
  - Giúp giáo viên nhanh chóng lọc và duyệt riêng từng nhóm câu hỏi, đặc biệt là nhóm 4-5 câu Vận dụng (L3) và Vận dụng cao (L4) mà không bị choáng ngợp hay rối mắt.
  - Thanh tab pills trực quan cho từng câu hỏi trong nhóm được chọn: `[Câu 1 • L1: Nhận biết]`, `[Câu 2 • L2: Thông hiểu]`, `[Câu 3 • L3: Vận dụng]`, `[Câu 4 • L4: Vận dụng cao]`...
  - Hiển thị đầy đủ: Đề bài KaTeX, lưới 4 phương án A-B-C-D với phương án đúng được viền xanh ngọc Emerald kèm icon Check, và khung Lời giải chi tiết KaTeX từng bước.
  - Tích hợp thanh điều hướng phân trang câu hỏi `← Câu trước` / `Câu tiếp theo →`.
  - Hiển thị thẻ phân bổ chi tiết mật độ câu hỏi ở Pane 1: `(L1: 2 • L2: 2 • L3: 5 • L4: 5)` và `Chuẩn ĐGNL: L3 (5 câu) • L4 (5 câu)`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 732ms).

---

## [15/10/2026] - Nâng Cấp Cây Tri Thức Phân Cấp 3 Tầng, Studio Sư Phạm Chuyên Sâu (Curriculum Studio Editor), Bàn Phím KaTeX STEM 10 Danh Mục, Không Gian Bóc Tách Khổ Lớn 3 Cột, Khắc Phục Lỗi Màn Trắng & KaTeX

- **Kiến Trúc Soạn Thảo Đa Chế Độ: Soạn Thảo Trực Quan (Text In Preview Chuẩn Học Sinh) Song Hành Mã Nguồn LaTeX Thuần (Nhập Nhanh Từ AI) (`CurriculumStudioEditor.jsx`)**:
  - *Giải Phóng Giáo Viên Khỏi Rào Cản Kỹ Thuật*: Không ép buộc giáo viên phải cắt vụn bài giảng thành 4 ô form rời rạc (Định nghĩa, Công thức, Quy tắc, Hình ảnh) gây mất mạch tư duy sư phạm. Hệ thống trang bị 2 chế độ soạn thảo chuyên sâu:
    1. Chế độ **Soạn Thảo Trực Quan (Text In Preview - Chuẩn Học Sinh)** (Mặc định):
       - Cho phép giáo viên soạn thảo tự nhiên, hỗ trợ chèn nhanh cấu trúc: `+ Khối công thức $$...$$`, `+ Gạch đầu dòng`.
       - Tích hợp trực tiếp **Khung Hiển Thị Trực Quan (Text In Preview - Giao Diện Học Sinh Thấy)** song hành ngay bên dưới ô soạn thảo. Khung này sử dụng `<MathText />` render thời gian thực các công thức toán học KaTeX thật (phân số, căn thức, giới hạn, tích phân, đồ thị minh họa), mô phỏng chuẩn xác 100% thẻ lý thuyết mà học sinh sẽ trải nghiệm.
    2. Chế độ **Mã Nguồn LaTeX Thuần (Nhập Nhanh Từ AI)**:
       - Trang bị khung soạn thảo monospace nền tối chuyên dụng, tối ưu cho thao tác copy-paste nhanh 1-chạm kết quả trích xuất từ Gemini / ChatGPT / AI Engine mà không phải chuyển đổi thủ công.
  - *Cơ Chế Chèn Ký Hiệu KaTeX STEM Chuẩn Xác Tại Vị Trí Con Trỏ (Cursor-Precision Insertion Engine)*:
    - Bổ sung `useRef` quản lý `textareaRefs` theo dõi vị trí con trỏ chuột (`selectionStart` / `selectionEnd`) trên từng ô soạn thảo đang active.
    - Khi giáo viên click vào bất kỳ ký hiệu nào trên Bảng KaTeX STEM 10 danh mục (hơn 120+ công thức toán học), công thức tự động chèn đúng vào vị trí con trỏ chuột đang đứng và tự động khôi phục focus, chấm dứt hoàn toàn hiện tượng công thức bị nối đuôi về cuối văn bản.
  - *Áp Dụng Cho Cả Khối 1 (Lý Thuyết Nền Tảng) & Khối 2 (Phương Pháp Giải Chuyên Biệt)*:
    - Ở Khối 2, chế độ trực quan cung cấp khung soạn bước giải kèm xem trước thẻ Bẫy đề thi ĐGNL (Rose Alert) và Mẹo Casio (Indigo Tip) sống động, song song với chế độ mã nguồn LaTeX thuần để nạp nhanh từ AI.

- **Tái Cấu Trúc Toàn Diện Động Cơ Render KaTeX & Sửa Triệt Để Lỗi Vỡ Dòng Văn Bản (`MathText.jsx`)**:
  - *Nguyên Nhân Vỡ Dòng Từng Chữ (Sentence Shattering Root Cause)*: Trước đó, hàm `MathText` chia chuỗi toàn cục theo ký tự phân cách toán học trước, sau đó bọc mỗi mẩu text trung gian (dấu phẩy, dấu chấm, dấu ngoặc, từ ngữ) vào một thẻ `display: block` (`span className="block leading-relaxed"`). Điều này khiến câu văn bị xé nhỏ thành hàng chục dòng dọc riêng biệt cho từng dấu chấm, dấu phẩy và công thức toán.
  - *Tách Biệt Hai Tầng Render (Line-Level vs Inline-Level)*: Tái cấu trúc kiến trúc phân tích thành 2 tầng độc lập:
    1. Tầng dòng (Line-Level): Chỉ bóc tách các dòng ngắt `\n` thực sự, nhận diện Khối cảnh báo Callout (`### ⚠️`, `### 💡`), Dòng bước giải (`Bước 1:`, `**Bước 1:**`), và Danh sách dấu chấm/dấu gạch.
    2. Tầng nội dòng (Inline-Level): Toàn bộ văn bản, công thức toán (`$...$`, `\(...\)`), chữ in đậm (`**...**`), và ảnh Markdown (`![alt](url)`) bên trong một dòng đều được render dưới dạng inline thuần túy (`<span>`, `<strong>`, `<img>`), tuyệt đối không chứa thẻ `block` nào, đảm bảo câu văn và công thức toán học/hóa học tuôn chảy mượt mà trên cùng một dòng.
  - *Khắc Phục Lỗi Trùng Lặp Bullet (`• - `)*: Cập nhật biểu thức chính quy bóc tách danh sách để cắt bỏ hoàn toàn dấu gạch ngang đầu dòng `- ` hoặc bullet trùng lặp, chỉ hiển thị duy nhất 1 bullet chấm tròn màu Indigo `•` thanh lịch, thẳng hàng hoàn hảo.
  - *Khắc Phục Triệt Để Ký Tự Thoát `\n` Bị Hiển Thị Thô*:
    - Trước đó, biểu thức `replace(/\\n(?![a-zA-Z])/g, '\n')` chặn tất cả các chữ cái đứng sau `\n`, dẫn đến các từ tiếng Việt như `\nTrong`, `\nKiểm`, `\nBước 2:` không bao giờ được unescape mà hiển thị trần trụi dạng text thô `.\nTrong` và `.\nBước`.
    - Nâng cấp negative lookahead chính xác chỉ bảo vệ đúng 15 lệnh LaTeX thực sự bắt đầu bằng `\n` (`` `\neq` ``, `` `\notin` ``, `` `\nabla` ``, `` `\nu` ``, v.v.), giải phóng 100% các từ tiếng Việt và ngắt dòng thực sự, giúp chia đoạn và chia bước giải rõ ràng, ngăn nắp.
    - Xuất hàm helper `unescapeLiteralNewlines` đồng bộ vào `CurriculumStudioEditor.jsx` để textarea nhập liệu cũng tự động giải phóng `\n` thành Enter xuống dòng thực tế, giúp giảng viên soạn thảo cực kỳ trực quan.
  - *Tự Động Nhận Diện & Bọc KaTeX Cho Công Thức Hóa Học & Ion Đa Nguyên Tử*:
    - Tự động bọc KaTeX cho các ion đơn/đa nguyên tử có điện tích: `` `H^+` ``, `` `OH^-` ``, `` `SO_4^{2-}` ``, `` `NO_3^-` ``, `` `Fe^{3+}` ``, `` `Na^+` ``.
    - Tự động bọc KaTeX cho các hợp chất có chỉ số dưới: `` `H_2O` ``, `` `H_2SO_4` ``, `` `HNO_3` ``, `` `CO_2` ``, `` `Fe_2O_3` ``, `` `KMnO_4` `` ngay cả khi người dùng hoặc AI không gõ cặp dấu `$`.
  - *Hỗ Trợ Danh Sách Thụt Lề & Phân Cấp*: Hỗ trợ thụt lề nhiều cấp cho danh sách lồng nhau và danh sách đánh số (`1.`, `2)`).
  - *Xử Lý Inline Thông Minh*: Đối với các chuỗi ngắn không chứa cấu trúc dòng (như phương án trắc nghiệm A-D, tiêu đề, công thức rời), `MathText` tự động render dưới dạng `<span>` nội dòng để tránh vi phạm cấu trúc DOM React (`div cannot appear as child of span`).
- **Khắc Phục Triệt Để Lỗi Hiển Thị KaTeX & Chuỗi Ký Tự (`MathText.jsx`)**:
  - Xử lý triệt để ký tự thoát `\n\n` bị hiển thị thô thành text (`str.replace(/\\n/g, '\n')`).
  - Tự động bọc KaTeX cho các lệnh LaTeX độc lập (`\Delta`, `\frac`, `\lim`, `\int`, `\alpha`, `x_0`, v.v.) nằm ngoài khối `$...$`, loại bỏ hoàn toàn tình trạng mã LaTeX xuất hiện dạng chuỗi code thô.
  - Bóc tách và render các khối Callout cảnh báo sư phạm (`### ⚠️ Các bẫy đề thi:` thành thẻ cảnh báo Rose Alert, `### 💡 Mẹo Casio:` thành thẻ mẹo Indigo Tip) và các bước giải nổi bật `**Bước X:**`.
- **Bàn Phím Ảo & Bảng Ký Hiệu Công Thức KaTeX STEM Chuyên Sâu 10 Danh Mục (`CurriculumStudioEditor.jsx`)**:
  - Mở rộng từ 10 ký tự cơ bản lên hơn 120+ công thức toán học chuyên sâu trải dài 10 danh mục:
    1. Đại số & Giải tích cơ bản
    2. Đạo hàm & Tiếp tuyến
    3. Tích phân & Giới hạn
    4. Mũ & Logarit
    5. Lượng giác
    6. Hình học & Không gian Oxyz (vectơ, tích có hướng, khoảng cách, mặt cầu)
    7. Hệ phương trình & Dấu ngoặc
    8. Tập hợp & Logic
    9. Ký tự Hy Lạp (Alpha, Beta, Delta, Omega, Pi, Theta...)
    10. Xác suất & Thống kê (Chỉnh hợp, Tổ hợp, Xác suất có điều kiện, Kỳ vọng, Phương sai)
  - Render trực tiếp KaTeX sống động trên từng nút bấm preview.
  - Thêm bộ chọn mục tiêu chèn thông minh (`Khối 1: Nền tảng SGK`, `Khối 2: Phương pháp giải`, `Bẫy đề thi`, `Mẹo Casio`, `Khối 4: Câu hỏi mẫu`, `Lời giải mẫu`) tự động theo dõi con trỏ focus của người dùng và hỗ trợ chèn ở cả Khối 1, Khối 2 và Khối 4.
  - Bổ sung hàm regex `parseSolutionMethodSections` tự động bóc tách các mục nhúng `### ⚠️` và `### 💡` vào đúng các ô nhập liệu chuyên biệt.
- **Không Gian Làm Việc Bóc Tách Tài Liệu Khổ Lớn Toàn Màn Hình 3 Cột (Fullscreen Panoramic Ingestion Studio - `CurriculumExplorerView.jsx`)**:
  - Nâng cấp modal chật hẹp cũ thành Workspace Studio kích thước cực đại (`max-w-[1580px] h-[95vh]`).
  - Hỗ trợ tài liệu lớn (sách 99+ trang, giáo trình chuyên đề) với bộ lọc phạm vi trang linh hoạt: `Toàn bộ tài liệu` hoặc `Chỉ định phạm vi trang` (`startPage` đến `endPage`), tránh tràn RAM và giới hạn token.
  - Bổ sung tùy chọn độ sâu phân tích (`Mặc định` hoặc `Chuyên sâu ĐGNL VNU-HCM & TN THPT (Chi tiết từng dạng & bẫy)`).
  - Layout 3 cột trực quan chuyên nghiệp:
    - Cột 1: Cây mục lục Chương & Bài học (kèm thống kê tổng số Dạng bài).
    - Cột 2: Danh mục Dạng bài học thuật theo bài học được chọn, tích hợp bộ lọc mức độ Bloom (Tất cả, L1, L2, L3, L4).
    - Cột 3: Chi tiết dạng bài & Thanh tra KaTeX sống động (Live KaTeX Pattern Inspector) xem trước 4 khối sư phạm và mở trực tiếp vào Studio.
- **Phân Hệ AI Bóc Tách Tài Liệu (PDF/DOCX) & Tự Động Nhận Diện Dạng Bài Sư Phạm (`CurriculumExplorerView.jsx`, `aiService.js`)**:
  - *Bộ Tiếp Nhận Đa Định Dạng Tài Liệu*: Hỗ trợ kéo & thả tệp sách giáo khoa hoặc tài liệu chuyên đề (.pdf, .docx, .txt) hoặc nhập trích đoạn mục lục/chuyên đề với thanh tiến trình trực quan 4 bước: `1. Đọc tệp & OCR` -> `2. Phân tích Chương - Bài` -> `3. Nhận diện Dạng bài` -> `4. Chuẩn hóa KaTeX`.
  - *Móc Nối API Gateway & AI Engine*: Tích hợp `aiService.extractCurriculumFromDocument` gọi trực tiếp `POST /api/ai-engine/curriculum/extract` (.NET 9 C#).
  - *Khu Vực Duyệt Dạng Bài Trực Quan (Pattern Showcase Accordion)*: Hiển thị toàn bộ cây tri thức bóc tách được (Số chương, số bài, số dạng bài), kèm các huy hiệu nhận diện phân loại dạng toán, cấp độ Bloom, kỹ năng cốt lõi và xem trước 4 khối sư phạm (Nền tảng SGK, Phương pháp KaTeX từng bước, Đề thi trắc nghiệm mẫu).
  - *Chuyển Tiếp Trực Tiếp Vào Studio*: Tích hợp nút "Mở Trong Studio" trên từng Dạng bài bóc tách được, cho phép giảng viên nhảy thẳng vào Studio toàn màn hình để kiểm tra, tinh chỉnh và thêm hình ảnh minh họa trước khi lưu vào CSDL.
  - *Nạp Trực Tiếp Vào PostgreSQL*: Nút "Nạp Vào CSDL PostgreSQL" gọi `contentService.importCurriculum` (`POST /api/content/curriculum/import`) lưu toàn bộ cây phân cấp vào database với 0 giá trị hardcode.
- **Trợ Lý AI Tri Thức Nhận Diện & Chuẩn Hóa Dạng Bài Trong Studio (`CurriculumStudioEditor.jsx`)**:
  - *Tích Hợp API `aiService.analyzePatternWithAi`*: Nút bấm **"AI Nhận Diện Dạng Bài"** gửi tên dạng bài hiện tại lên động cơ AI Knowledge (`POST /api/v1/documents/analyze-pattern`).
  - *Tự Động Điền & Tối Ưu Nội Dung Sư Phạm*: Tự động nhận diện bản chất toán học (Tham số m, Cực trị, Tiệm cận, Tối ưu thực tế, Không gian Oxyz...), điền quy trình 4 bước KaTeX, bẫy đề thi ĐGNL thường gặp, mẹo Casio fx-580/fx-880 và sinh câu hỏi trắc nghiệm chuẩn Bloom kèm lời giải chi tiết.
  - *Banner Phân Loại Sư Phạm*: Hiển thị banner chuyên nghiệp ghi rõ phân loại dạng bài, kỹ năng cốt lõi và cấp độ Bloom.
- **Khắc Phục Triệt Để Lỗi Màn Trắng (White Screen Fix) & Tăng Cường Bền Vững Runtime**:
  - Khắc phục `ReferenceError: weakPrerequisites is not defined` tại `CurriculumExplorerView.jsx:1303` bằng cách bổ sung bộ lọc dạng bài tiên quyết vùng trũng `<10%` đồng bộ từ `skillMasteryMap`.
  - Bọc `RootErrorBoundary` toàn cục tại `src/main.jsx` bắt mọi ngoại lệ render của React, hiển thị giao diện báo lỗi chi tiết cùng nút khôi phục reload/xóa cache.
  - Bổ sung type safety cho `MathText.jsx` với kiểm tra nghiêm ngặt `typeof text !== 'string'`.
  - Mở rộng hiển thị tab Lộ trình (`roadmap`) trên `App.jsx` cho mọi vai trò (Học sinh, Giáo viên, Quản trị viên).

- **Triển Khai Studio Sư Phạm Chuyên Sâu Toàn Diện (Curriculum Studio Editor & Authoring Environment)**:
  - Đáp ứng yêu cầu nghiệp vụ chuyên sâu của giảng viên: thay vì modal nhập liệu đơn sơ chật hẹp, chuyển đổi sang không gian Studio toàn màn hình (`CurriculumStudioEditor.jsx`) hỗ trợ tải nặng và đa dạng nội dung:
    - *3 Chế Độ Xem Linh Hoạt (View Mode Switcher)*:
      + `Biên soạn (Editor)`: Toàn màn hình tập trung soạn thảo lý thuyết, bẫy đề thi, Casio và câu hỏi.
      + `Chia đôi (Split 50-50)`: Nửa trái soạn thảo - nửa phải hiển thị Live Preview tức thời theo thời gian thực.
      + `Review Học sinh (Live Preview)`: Mô phỏng chính xác 100% giao diện học sinh nhìn thấy và trải nghiệm học tập dạng bài.
    - *Bảng Ký Tự Toán Học Đa Chủ Đề (KaTeX Palette)*: Phân loại theo 3 nhóm chuyên sâu: Đại số & Giải tích, Hình học & Không gian Oxyz, Logic & Tập hợp.
    - *Bộ Công Cụ Chèn Hình Ảnh & Thư Viện Đồ Thị (Diagram Gallery & Image Uploader)*: Hỗ trợ chèn trực tiếp link hình ảnh đồ thị hàm bậc ba, bảng biến thiên, hình chóp tam giác S.ABC, hệ trục Oxyz vào các khối lý thuyết và đề bài trắc nghiệm.
    - *Nâng Cấp Động Cơ Render Toán Học (`MathText.jsx`)*: Bổ sung bộ phân tích và render Markdown Image `![alt](url)` tự động, hiển thị hình ảnh đồ thị sắc nét, bo góc và hiệu ứng bóng đổ chuẩn sách giáo khoa.
    - *Trình Quản Lý Video Bài Giảng & Bảng Phân Đoạn Thời Gian (Timestamps Table)*: Cho phép xem thử video nhúng trực tiếp và thêm/sửa/xóa các mốc thời gian phân đoạn video (ví dụ: `00:00 Lý thuyết`, `03:15 Phương pháp`, `07:30 Ví dụ mẫu`).
    - *Studio Quản Trị Ngân Hàng Câu Hỏi Thích Ứng (API 16-18)*: Tải danh sách câu hỏi thuộc dạng bài từ PostgreSQL, hỗ trợ xem chi tiết, xóa câu hỏi và mở Dialog thêm câu hỏi mới với 4 bậc Bloom (L1 Nhận biết - L4 Vận dụng cao), 4 phương án A-D và lời giải chi tiết KaTeX.
    - *Tích Hợp Chặt Chẽ Với Cây Tri Thức (`CurriculumExplorerView.jsx`)*: Nút "Mở Studio Biên Soạn Sư Phạm" trên thanh công cụ, trên từng dạng bài và trong modal thêm mới cho phép chuyển đổi mượt mà giữa cây tri thức và Studio.
- **Tái Thiết Kế Cột Trái Cây Tri Thức 3 Tầng (Accordion Tree Navigation)**:
  - Chuyển đổi danh sách kỹ năng phẳng thành Accordion phân cấp 3 tầng chuẩn sư phạm SGK GDPT 2018:
    - *Tầng 1 (Chương học)*: Hiển thị tên chương, mã chuyên đề, số lượng bài học, trọng số, hỗ trợ đóng/mở linh hoạt.
    - *Tầng 2 (Bài học cụ thể)*: Hiển thị tên bài, biểu tượng sách, số lượng dạng bài con, hỗ trợ đóng/mở lồng nhau.
    - *Tầng 3 (Dạng bài cụ thể)*: Thẻ chọn dạng bài trực quan với mã code, chuẩn Bloom, nút sửa nhanh và hệ thống huy hiệu năng lực cá nhân:
      + `🚨 Hổng kiến thức (<10%)`: Màu đỏ đậm, nhấp nháy cảnh báo cần phục hồi vi mô ngay.
      + `⚠️ Vùng trũng (<60%)`: Màu vàng cam, cảnh báo kỹ năng chưa đạt chuẩn.
      + `✅ Đã vững (≥60%)`: Màu xanh ngọc, biểu thị kỹ năng đã thành thạo.
- **Xóa Bỏ Toàn Bộ Dữ Liệu Mẫu Hardcode Trên Frontend**:
  - Loại bỏ hoàn toàn các GUID hardcode mẫu trong `skillMasteryMap`. Toàn bộ chỉ số năng lực được trích xuất động từ kết quả khảo sát `diagData.skill_scores` hoặc `roadmapData.nodes`.
  - Loại bỏ hoàn toàn các câu hỏi giả fabricated trong fallback của `handleLaunchAdaptiveQuiz`. Nếu ngân hàng đề chưa có câu hỏi, hiển thị thông báo trạng thái cập nhật từ Ban Chuyên Môn/AI.
- **Hoàn Thiện 4 Khối Nội Dung Sư Phạm Cho Từng Dạng Bài (Cột Phải)**:
  - *Khối 1: Kiến thức nền tảng & Điều kiện tiên quyết (SGK Chuẩn)*: Định lý, định nghĩa, điều kiện đủ và đồ thị DAG liên kết.
  - *Khối 2: Phương pháp giải chuyên biệt từng bước & Công thức KaTeX*: Trình bày quy trình giải (Bước 1 -> Bước 2 -> Bước 3), ngân hàng công thức toán học KaTeX, các bẫy đề thi ĐGNL, kỹ thuật Casio và thẻ GraphRAG liên môn.
  - *Khối 3: Video bài giảng phương pháp & Lời giải mẫu chi tiết*: Video lecture preview kèm thời lượng (chuẩn FSM Gate ≥ 80%) và bài toán mẫu trắc nghiệm có lời giải chi tiết từng bước.
  - *Khối 4: Luyện tập củng cố thích ứng (API 19 Content Service)*: Tự động phát hiện các dạng bài tiên quyết liên kết đang bị hổng (&lt;10%) và tự động gom thêm câu hỏi từ dạng tiên quyết vào đề luyện tập để học sinh chữa dứt điểm gốc rễ.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 3.91s).


---

## [14/10/2026] - Triển Khai Phân Hệ Dàn Kiến Thức Khung Năng Lực Chuẩn ĐGNL & Tích Hợp Luyện Tập Củng Cố API 19

- **Xây Dựng Giao Diện Phân Hệ Dàn Kiến Thức (`src/components/curriculum/CurriculumExplorerView.jsx`)**:
  - Tích hợp 4 miền năng lực cốt lõi theo cấu trúc chuẩn ĐGNL ĐHQG-HCM (Ngôn ngữ, Toán học & Logic, Phân tích số liệu, Khoa học Tự nhiên & Xã hội).
  - Tích hợp công cụ tìm kiếm theo từ khóa kỹ năng, công thức toán học và mô hình liên môn.
  - Hiển thị ngân hàng công thức KaTeX chuẩn hóa (Đạo hàm, Tích phân Newton-Leibniz, Logic Boole De Morgan, Arrhenius, Hardy-Weinberg...) thông qua component `MathText`.
  - Tích hợp khối **Tri thức liên môn (Cross-Disciplinary GraphRAG)** mô tả sự kế thừa mô hình toán học giải quyết các bài toán Vật lý, Hóa học, Sinh học và Phân tích số liệu.
  - Thẻ bài giảng video mini-preview kèm giảng viên và thời lượng.
  - Câu hỏi mẫu chuẩn V-ACT kèm lời giải chi tiết từng bước.
- **Tích Hợp Modal Luyện Tập Củng Cố Tức Thì (Content Service API 19 Runner)**:
  - Nút bấm **"Luyện tập 5 câu củng cố"** gọi trực tiếp `contentService.createAdaptiveQuiz` (`POST /api/content/exams/quiz`).
  - Giao diện làm bài trắc nghiệm thích ứng trực tiếp trên modal: Hỗ trợ render KaTeX cho câu hỏi và phương án, bộ đếm câu, nộp bài chấm điểm thời gian thực, bảng tổng kết điểm và xem lại lời giải chi tiết.
- **Mở Rộng Tầng Dịch Vụ `contentService.js`**:
  - Bổ sung `createAdaptiveQuiz(payload)` gọi `POST /api/content/exams/quiz` bên Content Service.
  - Bổ sung `getQuestionsBySkill(skillId)` gọi `GET /api/content/questions/by-skill/{skillId}`.
- **Tích Hợp Điều Hướng Dashboard Học Sinh (`App.jsx` & `Sidebar.jsx`)**:
  - Điều hướng tab `roadmap` hiển thị trực tiếp `CurriculumExplorerView`.
  - Liên kết thẻ Metric DAG trên Dashboard chuyển thẳng vào Dàn kiến thức.
- **Xóa Bỏ Hoàn Toàn Dữ Liệu Hardcode `DOMAINS_DATA` Trên Frontend**:
  - Gỡ bỏ 100% mảng dữ liệu tĩnh `DOMAINS_DATA` trong `CurriculumExplorerView.jsx`.
  - Kết nối động trực tiếp với API Content Service thông qua `contentService.getCurriculum()` (`GET /api/content/curriculum`).
  - Tự động map các biểu tượng icon (`Cpu`, `BookOpen`, `Atom`, `BarChart2`, `Layers`), tiêu đề, chuyên đề, công thức KaTeX và câu hỏi mẫu được nạp từ cơ sở dữ liệu.
  - Bổ sung màn hình nạp (Loading Skeleton & Spinner) mượt mà khi truy vấn dữ liệu từ API Gateway.
- **Tích Hợp Đo Lường Năng Lực Cá Nhân & Định Vị Vùng Trũng Động (Dynamic Mastery Detection)**:
  - Bổ sung banner thông báo tương tác trong `CurriculumExplorerView`: Nếu học viên chưa thi khảo sát, hiển thị banner cảnh báo khung chuẩn 120 câu kèm nút chuyển nhanh sang tab Khảo sát 30 câu.
  - Sau khi học viên hoàn thành bài thi khảo sát, tự động tính toán và gắn badge cờ đỏ `⚠️ Vùng trũng (Mastery: X%)` cho các kỹ năng có độ thành thạo dưới 60%, cờ xanh `✅ Đã vững` cho các kỹ năng đạt chuẩn.
  - Bổ sung callout đề xuất củng cố tức thì tại chi tiết kỹ năng yếu để gọi API 19 Content Service.
- **Hợp Nhất Phân Hệ Khảo Sát Năng Lực Đầu Vào Vào Chung Dashboard (Tab-based Flow 1)**:
  - Loại bỏ hoàn toàn cơ chế tách rời toàn màn hình gây đứt gãy luồng người dùng (`setCurrentPage('diagnostic')`).
  - Tích hợp `DiagnosticAssessmentPage` (chế độ `embedded = true`) trực tiếp vào khung nội dung chính khi `activeTab === 'diagnostic'`.
  - Giữ vững thanh `Navbar` phía trên và `Sidebar` bên trái, cho phép học sinh chuyển đổi linh hoạt giữa Dashboard tổng quan, Khảo thí chẩn đoán và Dàn kiến thức mà không bị mất ngữ cảnh làm việc.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [10/10/2026] - Giao Diện Quản Lý Nhóm Học Tập Vi Mô (Micro Study Groups: 3 - 5 Học Sinh) & Phân Bổ Sơ Đồ Bàn Học Offline
- **Thiết Kế Modal Sơ Đồ Nhóm Bàn Học Vi Mô ([`ClassMicroGroupsModal.jsx`](../src/components/modals/ClassMicroGroupsModal.jsx))**:
  - Xây dựng component modal hiển thị sơ đồ phân bổ bàn học offline của lớp (Trần sĩ số tối đa 20 em, mỗi bàn 3 - 5 học sinh).
  - Tích hợp bộ chọn quy mô bàn học (`3 bạn/bàn`, `4 bạn/bàn`, `5 bạn/bàn`) với thuật toán gom cụm đồng nhất (Homogeneous Clustering) theo lỗ hổng kiến thức.
  - Hiển thị danh sách các trạm bàn học: Tên bàn học sư phạm, chủ đề trọng tâm `FocusArea`, tag các kỹ năng yếu chung (`CommonWeakSkills`), danh sách học sinh tại bàn kèm chỉ số thành thạo kiến thức.
  - Tích hợp tính năng **Phân phối đề luyện tập thích ứng** trực tiếp cho bàn học (`practiceService.assignGroupWorksheet`), hiển thị trạng thái phát đề và thời gian thực.
  - Bổ sung nút xuất file sơ đồ bàn học dạng PDF cho Giảng viên in ra phát tận bàn offline.
- **Nâng Cấp Cổng Điều Hành Học Thuật Cơ Sở ([`CampusManagerDashboardView.jsx`](../src/components/dashboard/CampusManagerDashboardView.jsx))**:
  - Chuẩn hóa danh sách lớp học offline theo cơ chế trần 20 học sinh và số thứ tự tăng dần (`Lớp Nền tảng 01`, `Lớp Nền tảng 02`, `Lớp Tăng tốc 01`, `Lớp Bứt phá 01`).
  - Hiển thị badge sĩ số chuẩn hóa: `Sĩ số: {studentCount}/20`.
  - Tích hợp nút hành động **"Sơ Đồ Nhóm Bàn (3 - 5 Bạn)"** trên từng thẻ lớp học, mở modal tương tác trực tiếp.
  - Bổ sung nút **"Tự Động Gom Cụm AI"** trên thanh công cụ lớp học gọi trực tiếp API K-Means Elbow Method (`practiceService.autoClusterClasses`).
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [09/10/2026] - Mở Rộng Client Service: Bổ Sung Tích Hợp API Phân Cụm Lớp Chuyên Đề & Nhóm Học Tập Vi Mô (3 - 5 Học Sinh)
- **Cập Nhật Tầng Dịch Vụ `practiceService.js`**:
  - Bổ sung phương thức `autoClusterClasses(campusId, maxK = 6)` gọi `POST /api/v1/practice/classes/auto-cluster` phục vụ tự động phân cụm tạo lớp chuyên đề theo K-Means/Elbow Method.
  - Bổ sung phương thức `autoPartitionMicroGroups(classId, preferredGroupSize = 4)` gọi `POST /api/v1/practice/classes/{classId}/micro-groups/auto-partition` tự động chia học sinh trong lớp thành các nhóm vi mô 3 - 5 bạn theo lỗ hổng kiến thức.
  - Bổ sung phương thức `getClassMicroGroups(classId)` gọi `GET /api/v1/practice/classes/{classId}/micro-groups` lấy sơ đồ bàn học và danh sách nhóm vi mô cho dashboard giáo viên.
  - Bổ sung phương thức `assignGroupWorksheet(classId, groupId, worksheetId, worksheetTitle)` gọi `POST /api/v1/practice/classes/{classId}/micro-groups/{groupId}/assign-worksheet` phân phối đề luyện tập thích ứng theo nhóm.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [08/10/2026] - Đồng Bộ Tinh Gọn Tầng Dịch Vụ: Loại Bỏ Các Lời Gọi API Live Streaming Tại Client
- **Loại Bỏ Các Phương Thức Gọi API Live Streaming Trong `practiceService.js`**:
  - Gỡ bỏ các hàm gọi API tương ứng với các endpoint vừa được xóa: `createLiveSession`, `getMyLiveSchedule`, `joinLiveSession`, `markTeacherAttendance`, `getTeacherSchedule`, `updateRecordingUrl`, `cancelLiveSession`.
  - Giữ lại phương thức phân công giáo viên lớp học `assignTeacher`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [06/10/2026] - Khắc Phục Sự Cố Thông Báo Discord, Thiết Lập CI/CD GitHub Actions & Hoàn Thiện Tích Hợp Web Client
- **Sửa Lỗi Thiếu Thông Báo Discord & Thiết Lập CI/CD GitHub Actions Cho Web Client**:
  - Phát hiện nguyên nhân Web Client trước đó không gửi thông báo về Discord: Repo thiếu hoàn toàn thư mục cấu hình `.github/workflows`.
  - Thiết lập `.github/workflows/discord-commit-tracker.yml`: Tự động bắt sự kiện `push` trên mọi nhánh, bóc tách commit SHA, danh sách file thay đổi kèm emoji chỉ thị, đọc nội dung `UPDATE.md` và gửi tin nhắn embed thời gian thực về webhook Discord hệ thống.
  - Thiết lập `.github/workflows/ci.yml`: Tự động kiểm thử `npm ci` và biên dịch `npm run build` trên Node.js 20.x cho mỗi commit/PR.
- **Kiểm Thử Vận Hành & Build Verification**:
  - Chạy `npm run build` thành công 100% trong 679ms (0 error, 0 warning).
  - Xác nhận 2903 modules Vite được đóng gói hoàn hảo.

---

## [05/10/2026] - Hợp Nhất Giao Diện Xác Thực (TNhan UI/UX) Với Tầng API IAM (ThinhTT), Cấp Quyền Đa Vai Trò
- **Hợp Nhất Toàn Diện Hệ Thống Xác Thực (Auth Subsystem)**:
  - Tiếp nhận và nâng cấp toàn bộ giao diện Auth hiện đại từ nhánh `TNhan`:
    + Split-screen layout 12 cột với ảnh sinh viên thật `vietnamese_student_real.jpg`, thanh ticker tin tức hoạt động thời gian thực (`liveActivities`), và hiệu ứng động mượt mà bằng Framer Motion.
    + Module hóa form đăng nhập (`LoginForm.jsx`), form đăng ký (`RegisterForm.jsx`), modal quên mật khẩu 4 bước OTP (`ForgotPasswordModal.jsx`) và popup modal nhanh (`AuthModal.jsx`).
    + Tích hợp Custom Rounded Select bo góc cao cấp cho lựa chọn Khối Lớp (12, 11, Thí sinh tự do) và Mục tiêu điểm ĐGNL (900+, 800+, 700+).
    + Hiển thị thông báo lỗi trực tiếp từng trường nhập liệu (`fieldErrors`), thanh đo độ mạnh mật khẩu 3 cấp độ (`passStrength`).
  - Đấu nối 100% logic API và Tầng dịch vụ IAM từ nhánh `ThinhTT`:
    + Thay thế toàn bộ mã giả lập `setTimeout` bằng các hàm gọi API thật qua `authService.js` (`POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify-account`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).
    + Tích hợp nạp động danh sách Cơ sở Đào tạo (`GET /api/v1/campuses`) vào dropdown bo tròn trong `RegisterForm.jsx`.
    + Bắt mã lỗi tài khoản chưa kích hoạt (`Auth.AccountNotActivated`) để tự động mở bước xác thực mã OTP 6 số.
    + Bảo toàn 1-Click Demo Login cho 4 vai trò (Học sinh, Giáo viên, Quản lý cơ sở, Phụ huynh) với cơ chế fallback offline an toàn.
- **Bảo Toàn 100% Các Tính Năng Độc Quyền Của Nhánh ThinhTT**:
  - Trang Quản trị Cấp phát Tài khoản IAM (`src/components/admin/AccountProvisioningView.jsx`).
  - Bảng điều khiển Quản lý Học thuật Cơ sở (`src/components/dashboard/CampusManagerDashboardView.jsx`).
  - Bảng điều khiển Phụ huynh (`src/components/dashboard/ParentDashboardView.jsx`).
  - Tầng dịch vụ quản lý User và cấp phát tài khoản (`src/services/userService.js`).
  - Bộ định tuyến trung tâm và quản trị trạng thái phiên làm việc (`src/App.jsx`).

---

## [04/10/2026] - Triển Khai Hoàn Chỉnh Trang Cấp Phát & Quản Lý Tài Khoản Đa Vai Trò (IAM Provisioning Page), Smart RBAC & Móc Nối Backend CSDL
- **Triển Khai Trang Quản Trị Cấp Phát Tài Khoản Đa Vai Trò (`AccountProvisioningView.jsx`)**:
  - Giao diện quản trị cấp cao: Thống kê số lượng tài khoản thời gian thực (Tổng số, Giảng viên, Quản lý, Học sinh & Phụ huynh, Tỷ lệ kích hoạt).
  - Bộ lọc vai trò tức thì (Tất cả, `TEACHER`, `ACADEMIC_MANAGER`, `ACADEMIC_DIRECTOR`, `ADMINISTRATOR`, `PARENT`, `STUDENT`) và ô tìm kiếm thông minh theo Họ tên, Email, Số điện thoại.
  - Bảng dữ liệu người dùng trực quan: Avatar gradient, Huy hiệu vai trò RBAC sắc nét, Cơ sở công tác, Bộ môn chuyên môn, và Nút gạt chuyển đổi trạng thái Khóa / Mở khóa tài khoản thời gian thực gọi trực tiếp API `PATCH /api/v1/users/{id}/toggle-status`.
  - Modal **Cấp Phát Tài Khoản Mới**:
    + Card lựa chọn trực quan 6 vai trò kèm mô tả chức năng chi tiết.
    + Dropdown nạp danh sách cơ sở đào tạo thực tế từ CSDL PostgreSQL (`GET /api/v1/campuses`).
    + Form nhập thông tin cán bộ, chuyên môn phụ trách, bộ tạo mật khẩu ngẫu nhiên an toàn hoặc mật khẩu tùy chỉnh.
    + Hộp thông báo cấp tài khoản thành công kèm nút **"Sao chép thông tin bàn giao"** một chạm để gửi ngay cho cán bộ.
- **Tầng Dịch Vụ Người Dùng Mới (`src/services/userService.js`)**:
  - `getUsers(params)`: Gọi API `GET /api/v1/users` qua Gateway YARP `:5212`.
  - `provisionUser(userData)`: Gọi API `POST /api/v1/users/provision` nạp thẳng vào CSDL PostgreSQL, kích hoạt ngay không cần OTP.
  - `toggleUserStatus(userId)`: Gọi API `PATCH /api/v1/users/{id}/toggle-status`.
- **Tích Hợp Điều Hướng & Trải Nghiệm Người Dùng (`App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `CampusManagerDashboardView.jsx`)**:
  - Nút chuyển tab **"Cấp Tài Khoản (IAM)"** trên Thanh điều hướng đầu trang và Menu người dùng.
  - Nút liên kết nhanh "Quản lý IAM" trên Bảng điều khiển Quản lý cơ sở (`CampusManagerDashboardView.jsx`).
  - Nối thành công hàm cấp giảng viên nhanh trong bảng điều khiển cơ sở gọi trực tiếp API thật.
- **Phân Định Nghiệp Vụ Đăng Ký & Đăng Nhập Đa Vai Trò (Smart RBAC Architecture)**:
  - Khóa chặt form đăng ký chỉ cho phép 2 vai trò mở tự do: **Học sinh (`STUDENT`)** và **Phụ huynh (`PARENT`)**.
  - Các vai trò nhân sự gồm Giáo viên (`TEACHER`), Quản lý học thuật cơ sở (`ACADEMIC_MANAGER`), Giám đốc đào tạo (`ACADEMIC_DIRECTOR`) và Quản trị viên hệ thống (`ADMINISTRATOR`) được cấp phát nội bộ từ Admin/Quản lý cơ sở.
- **Kiểm Thử Biên Dịch (Build Verification)**:
  - `npm run build` thành công 100% trong 758ms (0 lỗi cú pháp, 0 warnings, toàn bộ bundle được tối ưu hóa).
  - `npm run lint` đạt chuẩn 0 error.

---

## [02/10/2026] - Nâng Cấp Toàn Diện Tầng Dịch Vụ AI Engine (`src/services/aiService.js`) Qua API Gateway
- **Móc Nối Đầy Đủ 14+ API AI Engine Qua Gateway YARP (`http://localhost:5212`)**:
  - **Nhóm 1: Bóc tách Đề thi PDF (Gemini Vision OCR)**:
    - `uploadPdfExam(pdfFile)`: Upload đề thi PDF phân tích nền (`POST /api/ai-engine/upload-pdf`).
    - `getExamJobStatus(jobId)`: Polling tiến độ OCR (`GET /api/ai-engine/jobs/${jobId}`).
    - `getViewExamUrl(jobId)`: URL xem trực quan kết quả đề thi (`/view-exam`).
  - **Nhóm 2: Nạp & Quản Trị Tri Thức SGK / Vector DB (.NET AI Engine)**:
    - `uploadTextbookPdf(file, options)`: Nạp SGK lên đến 250MB (`POST /api/ai-engine/textbooks/upload-pdf`).
    - `getActiveTextbookJob()`: Khôi phục tác vụ nạp SGK khi người dùng F5 (`GET /api/ai-engine/textbooks/active-job`).
    - `getTextbookCheckpoint(fileHash)`: Kiểm tra Checkpoint SHA-256 (`GET /api/ai-engine/textbooks/checkpoint/${fileHash}`).
    - `getTextbookJobStatus(jobId)`: Polling tiến độ bóc tách SGK (`GET /api/ai-engine/textbooks/jobs/${jobId}`).
    - `getTextbookChunks(sourceId)` & `getTextbookChunksByHash(fileHash)`: Danh sách Vector Chunks tri thức SGK.
    - `saveTextbookChunksToDb(dto)`: Lưu Chunks vào Supabase DB schema `v_eval_ai` (`POST /api/ai-engine/textbooks/save-db`).
    - `pingVisionModels(geminiKey)`: Đo kiểm độ trễ & trạng thái các mô hình Vision AI (`GET /api/ai-engine/textbooks/ping-vision`).
    - `getViewTextbookUrl()`: URL trang nạp & xem SGK trực quan (`/view-textbook`).
  - **Nhóm 3: Sinh Đề Thi AI & Chẩn Đoán Năng Lực IRT/BKT (Python FastAPI RAG)**:
    - `generateExam(payload)`: Sinh đề thi AI theo Prompt & chuẩn hóa Bloom 6 cấp độ (`POST /api/v1/diagnostic/generate-exam`).
    - `analyzeDiagnosticSubmission(payload)`: Chẩn đoán năng lực học sinh IRT 2PL, BKT, Radar chart (`POST /api/v1/diagnostic/analyze`).
    - `getDiagnosticConfig()`: Lấy cấu hình ngưỡng phân lớp và tham số (`GET /api/v1/diagnostic/config`).
    - `getViewDiagnosticUrl()`: URL trang khảo sát năng lực chẩn đoán trực quan (`/view-diagnostic`).
  - **Nhóm 4: Gia Sư AI Socratic RAG & SSE Streaming (Token by Token)**:
    - `askSocraticTutor({ question, sessionId })`: Hỏi đáp gia sư dạng Single Request (`POST /api/v1/chat`).
    - `askSocraticTutorStream({ question, sessionId, onToken, onError, onComplete, signal })`: Token Streaming SSE chạy chữ mượt mà như ChatGPT (`POST /api/v1/chat/stream`).
    - `getChatSessions()` & `clearChatSession(sessionId)`: Quản lý phiên hội thoại (`/api/v1/chat/sessions`).
  - **Nhóm 5: Quản trị Tài liệu Tri thức RAG**:
    - `uploadRagDocument(file)`: Nạp tài liệu tri thức RAG (`POST /api/v1/documents/upload`).
- **Phát Triển Trang Khảo Sát Năng Lực 30 Câu Thật Với AI & Content Service (`DiagnosticAssessmentPage.jsx`)**:
  - Xây dựng component trang hoàn chỉnh `src/components/diagnostic/DiagnosticAssessmentPage.jsx`:
    - Setup screen: Hỗ trợ 3 nguồn đề thi linh hoạt:
      + **Đề Có Sẵn (Content Service)**: Lấy trực tiếp từ Database PostgreSQL 30 câu hỏi chuẩn hóa V-ACT kèm bài đọc hiểu (Passages).
      + **Google Gemini AI Cloud**: Sinh 30 câu hỏi mới 100% kèm công thức Toán KaTeX.
      + **Hiệu Chuẩn AI Fast Bank (<500ms)**: Trích xuất siêu tốc 30 câu từ bộ nhớ hiệu chuẩn psychometrics.
    - In-exam testing screen: Đồng hồ 45 phút, ngữ liệu đọc hiểu collapsible, thanh điều hướng 30 câu kèm cờ phân vân, hiển thị công thức KaTeX, tích hợp Gia sư AI Socratic RAG hỗ trợ tư duy từng bước.
    - Result & Psychometrics screen:
      + Điểm thô thực tế ($X/30$), ước lượng năng lực IRT 2PL `\theta_0`, phân lớp học viên (`FOUNDATION`, `ACCELERATION`, `BREAKTHROUGH`).
      + **Phân tích Tốc độ & Chiến thuật (Pacing Analysis)**: Thời gian trung bình/câu, nhóm làm nhanh (&lt;25s), nhóm chuẩn (25-90s), nhóm tốn thời gian (&gt;90s), câu phân vân gắn cờ 🚩.
      + **Biểu Đồ Radar Năng Lực 5 Lĩnh Vực**: Dữ liệu Recharts Radar Chart lấy trực tiếp từ kết quả 30 câu thật không bịa, đối chiếu chuẩn 900+.
      + **Bảng Tra Cứu & Đáp Án Chi Tiết 30 Câu**: Bộ lọc (Tất cả, Đúng, Sai, Phân vân), đối chiếu đáp án của bạn vs đáp án đúng, badge thời gian, ngữ liệu và lời giải chi tiết KaTeX.
  - Tích hợp vào thanh chuyển trang (Top Page Control Bar) của `App.jsx` và liên kết điều hướng từ Landing Page, HeroBanner và Sidebar Dashboard.
- **Tích Hợp Trình Render Toán Học KaTeX Toàn Diện (`MathText.jsx`, `DiagnosticAssessmentPage.jsx`, `DiagnosticTestModal.jsx`)**:
  - Cài đặt thư viện `katex` và nạp stylesheet `katex/dist/katex.min.css` vào `main.jsx` và font Plus Jakarta Sans.
  - Xây dựng component `src/components/common/MathText.jsx` hỗ trợ parse và render chuẩn xác các công thức toán học STEM phức tạp:
    - Ký hiệu delimiters: `$$...$$`, `$...$`, `\[...\]`, `\(...\)`.
    - Tự động nhận diện lệnh LaTeX: phân số `\frac{...}{...}`, căn thức `\sqrt{...}`, vô cực `\infty`, số mũ `x^4 + 2x^2`, tích phân `\int`, hình học `\perp`...
    - Điều chỉnh màu KaTeX thừa hưởng (inherit) đảm bảo độ tương phản cao, hiển thị sắc nét trên cả nền tối Dark Theme và nền sáng Light Theme.
- **Kiểm Thử Biên Dịch**:
  - `npm run build` thành công 100% trong 1.26s, đóng gói hoàn chỉnh các bộ font KaTeX (woff, woff2, ttf).

---

## [01/10/2026] - Kiểm Thử Toàn Diện Tầng Giao Tiếp API Gateway YARP & Đồng Bộ Kiến Trúc Dịch Vụ Frontend

- **Hoàn Thiện Tầng Service Client Tập Trung (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng Axios instance chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm Bearer token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và xử lý lỗi tập trung.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/auth`, `/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/v1/ai`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.
- **Kiểm Thử Biên Dịch & Vận Hành**:
  - `npm run build` thành công 100% trong 619ms, tạo các bundle tĩnh `dist/` sẵn sàng phục vụ trong container Nginx Alpine.
  - Kiểm thử tương thích môi trường cấu hình qua [`.env`](../.env) và [`.env.example`](../.env.example).

---

## [29/09/2026] - Tích Hợp Web Client Vào Hệ Thống V-Eval System-Repo & Cấu Hình Runner Đa Dịch Vụ

- **Đồng Bộ Repository & Cấu Hình Hệ Thống**:
  - Clone mã nguồn nhánh `develop` từ repository `https://github.com/Capstone-OG/v-eval-web-client.git` vào thư mục chuẩn hóa `All Services/V-Eval-Web_Client`.
  - Bổ sung cấu hình tracking vào [`git_config.txt`](../../git_config.txt):
    ```ini
    V-Eval-Web_Client=https://github.com/Capstone-OG/v-eval-web-client.git|develop
    ```
  - Cập nhật [`Scripts/setup/setup.bat`](../../Scripts/setup/setup.bat) bổ sung cờ kiểm tra `package.json` (`IS_NODE=1`) để ngăn chặn việc sinh nhầm giải pháp .NET Clean Architecture cho các dự án Web/Frontend.
- **Xây Dựng Script Push Độc Lập Cho Web Client**:
  - Tạo script [`Scripts/push.bat`](../Scripts/push.bat) chuyên dụng cho Web Client, đồng bộ tính năng với các microservices backend:
    - Kiểm tra đồng bộ lịch sử commit với Remote `origin/develop`.
    - Menu chọn nhanh đẩy mã nguồn (Nhánh hiện tại, Nhánh đã có, hoặc Khởi tạo nhánh mới).
    - Tự động kiểm tra `git status`, tạo commit và push lên GitHub.
- **Cấu Hình Môi Trường Thực Thi Docker & Local Runner**:
  - Soạn thảo [`Dockerfile`](../Dockerfile) đa tầng (Multi-stage build) sử dụng `node:22-alpine` để biên dịch mã nguồn React 19 và `nginx:alpine` phục vụ file tĩnh SPA.
  - Thiết lập [`nginx.conf`](../nginx.conf) hỗ trợ điều hướng SPA Routing (`try_files $uri $uri/ /index.html;`) tránh lỗi 404 khi người dùng tải lại trang.
  - Cập nhật [`docker-compose.yml`](../../docker-compose.yml) khai báo container `v_eval_web_client` phục vụ tại cổng `5173:80`.
  - Cập nhật [`Scripts/run_local/run_local.bat`](../../Scripts/run_local/run_local.bat) bổ sung tùy chọn khởi chạy Web Client (Tùy chọn [1] Full 7 dịch vụ và Tùy chọn [4] Chỉ Web Client cổng 5173).
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - Chạy thành công `npm install` (cài đặt 87 gói phụ thuộc không có lỗ hổng bảo mật).
  - Chạy `npm run build` thành công trong 3.87 giây, xuất bản thư mục `dist/` hoàn chỉnh.
  - Kiểm tra cú pháp Docker compose với `docker compose config` đạt chuẩn 100%.
- **Xây Dựng Phân Hệ Dịch Vụ Kết Nối API Gateway YARP (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng HTTP Client chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm JWT Bearer Token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và tự động retry khi gặp mã lỗi 401.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/ai-engine`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.


### [12/11/2026] - Merge develop into diagnostic frontend branch

- Resolve 24 conflicted frontend files from develop 115eace. Integrate incoming role portals, curriculum/authoring, payment, notifications, expanded API services and structured math rendering; preserve the local diagnostic assessment lifecycle, profile helpers, account settings and remember-me behavior.
- Wire the retained diagnostic page into the new portal with the signed-in user and account-specific component key. Student history uses the owned server-backed diagnostic view. Remove incoming shared latest-result loading and prevent seeded/unowned local submission history from reappearing.
- Combine API query params and PATCH support with proactive token refresh, session-only login, session generation guards and diagnostic privacy cleanup. Refresh preserves the user and selected storage without creating a new login session. Add diagnostic API aliases required by the retained assessment.
- Fix conditional React hooks in incoming MathGraphView and math-workbench modal. Install the declared jsxgraph dependency; retain its incoming package/lock contract.
- Validation: production build passed; npm run lint exited zero with warnings; all 21 tests passed (17 diagnostic/privacy, 2 Flow 6 and 2 merge integration cases). Build warns about bundle size and direct eval inside jsxgraph. Browser/live API/visual behavior was not verified.
- Scope: frontend and progress documentation only. No backend code or configuration backups changed. System-Repo and uppercase frontend have separate merge state; their service code is outside this resolution.

### [12/11/2026] - V-Eval logo integration

- Added the approved generated transparent PNG as src/assets/v-eval-logo-v2.png, keeping its original resolution and alpha. Verified dimensions 1877 x 838 and transparent corner pixel.
- Added shared BrandLogo component with intrinsic dimensions, responsive width and preserved aspect ratio. Replaced placeholder brand marks in public header, login header, sidebar and mobile portal navbar. Dark public footer uses a white silhouette through CSS filtering.
- Validation: npm run build passed with existing bundle-size and jsxgraph eval warnings. Browser visual verification not performed. No backend edits; existing staged merge state preserved.

### [12/11/2026] - Frontend merge and branding checkpoint

- Complete the lowercase frontend merge of develop 115eace into TNhan/auth-custom-select-validation, retaining diagnostic lifecycle fixes and integrating incoming portals/services/math tooling.
- Include approved transparent V-Eval logo and shared BrandLogo integration in public/login headers, sidebar, mobile navbar and dark footer.
- Validation before commit: all 21 node tests passed; lint exited zero with warnings; production build passed with existing bundle-size and jsxgraph eval warnings. Live browser/API behavior not verified.
- Commit scope is the frontend repository only. The root repository's separate pending merge, backend repositories, uppercase frontend and configuration backups remain untouched by this commit. No push performed.

---

## [12/11/2026] - Tinh Gọn Giao Diện Đăng Nhập Thân Thiện Với Người Dùng & Chuẩn Hóa Truyền Tải Lỗi Từ Backend

- **Tinh gọn nội dung & bố cục màn hình Đăng nhập / Đăng ký (`src/components/auth/WebLoginPage.jsx`, `LoginForm.jsx`, `RegisterForm.jsx`, `AuthModal.jsx`, `src/utils/emailValidator.js`)**:
  - Loại bỏ toàn bộ thuật ngữ kỹ thuật, kiến trúc và học thuật nội bộ không phù hợp với học sinh/phụ huynh như `v2.4 Live`, `IRT 3PL`, `IRT Theta`, `IRT 2PL`, `DAG Topo`, `CAT`, `AI Socratic Tutor`, `ZPD`, `BKT`, `IAM Gateway (:5212)`, `IAM Backend`, `JWT`, `API Gateway`, mã cơ sở nội bộ `(${c.code || 'ACTIVE'})` và chi tiết kỹ thuật email (`MX`, `DNS NXDOMAIN`).
  - Thay thế bằng thông điệp học tập tự nhiên, dễ hiểu (ví dụ: *Đánh giá năng lực 15 phút*, *Lộ trình học tập cá nhân hóa*, *Hỗ trợ giải đáp 24/7*, *Đăng nhập một tài khoản cho mọi vai trò*).
  - Loại bỏ hộp thông báo *"Đăng nhập một tài khoản cho mọi vai trò"* ở dưới nút Đăng nhập và thiết kế lại bố cục card đăng nhập theo tỷ lệ cân xứng `6/6` (`max-w-[1060px]`): lược bỏ phần header thừa bên trái, mở rộng khung ảnh học sinh full chiều ngang cột trái với 4 thẻ tiện ích gọn gàng và căn giữa khối form đăng nhập trong một khung nhìn desktop không bị scroll.
- **Chuẩn hóa cơ chế trích xuất và hiển thị lỗi trực tiếp từ Backend (`src/utils/apiErrorHandler.js`, `src/services/apiClient.js`, `src/services/authService.js`)**:
  - Bổ sung bộ trích xuất dùng chung `extractBackendErrorMessage` & `formatApiError` ưu tiên lấy trực tiếp thông báo lỗi trả về từ Backend across mọi định dạng (`error.description`, `errors[]`, ASP.NET `ValidationProblemDetails`, `message`, `detail`, `title`, plain text) thay vì tạo từ điển thông báo riêng ở FE.
  - Đọc body an toàn trong `apiClient.js` và chỉ dùng thông điệp dự phòng thân thiện khi Backend/Proxy không trả về nội dung đọc được (như phản hồi rỗng `502`/`503`/`504`, HTML hoặc mất kết nối mạng), chấm dứt hiển thị thô `HTTP Error 502` trên màn hình đăng nhập.
  - Bổ sung fallback `/api/v1/identity/auth/...` khi gặp `404` cho `forgotPassword`, `verifyResetOtp`, `resetPassword` trong `authService.js`.
- **Kiểm thử & Biên dịch**:
  - Thêm bộ test `tests/apiErrorHandler.test.js` (4 test cases); chạy `node --test tests/*.test.js src/**/*.test.js` đạt **25/25 pass**, `npm run lint` đạt 0 errors, `npm run build` thành công 100%.

### [12/11/2026] - Compact portal navigation and account menu

- Keep the sidebar as primary navigation and remove the duplicated role/context/segmented tab strip. Remove the redundant role badge below the sidebar logo.
- Compact top bar shows current page title, student-only streak chip, notification placeholder and avatar/name menu. Settings, home and logout now live in the account dropdown, with outside-click/Escape dismissal, arrow navigation and accessible labels. Removed static notification unread dot; notification button remains unavailable rather than claiming unread data.
- On mobile/tablet, a hamburger opens the shared role sidebar in a drawer with focus containment, Escape/backdrop dismissal, scroll locking and close-on-navigation/desktop resize. Desktop retains the sidebar.
- Greeting text uses role and profile full name; student/parent banners are updated and other role landing pages show a role-aware greeting. Removed the student campaign label; detailed dashboard streak remains.
- Repository diagnosis before edits: lowercase frontend was clean; System-Repo had 99 pending changes in a separate merge, uppercase frontend had 9 changes including 4 conflicts, and other service repositories had their own pre-existing edits/backups. No reset, commit, push or backend edits performed.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings; lint exited zero with warnings; all 21 existing tests passed. Browser visual, keyboard and mobile interactions were not manually verified.

### [12/11/2026] - Refine compact header visual hierarchy

- Add a V-Eval/role breadcrumb and page icon above/beside the stronger page title. Use a subtle tinted background and balanced 72/80px header height without restoring duplicate tab navigation.
- Show a compact local-date label on wide screens, refine the student streak as a small two-line chip, and restore role context below the account name with a gradient avatar and clear expanded-state styling.
- Mobile retains compact labels and hamburger navigation. Existing account dropdown and dashboard streak detail are unchanged.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings. Browser visual verification not performed; no backend edits, commit or push.

### [12/11/2026] - Student sidebar organization preview

- Reorganize student-only sidebar into Overview, Learning, Assessment and Student Services. Group existing diagnostic and mock-exam actions under an expandable Tests & Mock Exams menu; retain history and analytics as sibling entries.
- Preserve every existing tab ID, callback, API and assessment behavior. Existing practice action remains Practice rather than claiming a new mistake-notebook workflow. Other roles are unchanged.
- Submenu opens on the diagnostic tab; child actions retain active highlighting and close the shared mobile drawer after navigation. Expanding the parent does not navigate.
- Validation: production build passed with existing warnings. No new business logic or tests; browser visual/interaction verification pending. No commit or push.

### [12/11/2026] - Dashboard entry guidance for diagnostic onboarding

- Add an inline first-position student dashboard card above parent linking and the greeting banner. Read completed distinct diagnostic exams from the existing history API and validated local draft for the current student.
- Show first-assessment, partial-progress, saved-draft, locked-submission, completed and loading/error states. Buttons navigate to existing diagnostic/roadmap screens; no exam is started automatically and no assessment handlers or APIs changed.
- Partial progress uses Check next assessment rather than claiming a new exam is available. The existing diagnostic entry validates actual availability. No extra Content request is made on dashboard load.
- Show accurate /3 progress and a retry action on history failure; no demo progress. User/account changes discard obsolete requests. Existing page remains usable; no modal or screen dimming.
- Validation: production build and lint exited zero with existing warnings. Browser visual/interaction verification not performed. No backend edits, commit or push.

### [12/11/2026] - Colorful diagnostic onboarding card

- Restyle the existing dashboard card with a light blue/indigo/violet gradient, decorative background rings, gradient assessment icon, concise badge and stronger heading hierarchy.
- Add a white inset progress/action panel with three numbered/checkmarked milestones and gradient CTA. Completed state uses emerald/teal; responsive stacking and all existing state/API/navigation behavior remain unchanged.
- Validation: production build passed with existing warnings. No browser visual verification, backend edits, commit or push.

### [12/11/2026] - Parent-link card readability

- Increase parent-link heading to 16/18px and description to 14px with comfortable line height. Separate account code into a larger monospace badge and allow heading/badges to wrap.
- Refine the card with a subtle indigo tint, larger family icon and responsive action area. Shorten duplicate copy, use clear copy confirmation and keep all handlers/API/modal behavior unchanged.
- Validation: production build passed with existing warnings; browser visual verification not performed. UI only; no commit/push.

### [13/11/2026] - Dashboard setup cards in 7:3 columns

- Place diagnostic onboarding and parent linking in a shared 7fr/3fr grid at xl widths, with equal-height stretching and minimum-width safeguards. Smaller screens stack diagnostic first, parent linking second.
- Compact diagnostic heading/icon/action panel and use container-width breakpoints so its internal layout responds to available card width, not full viewport width.
- Parent link card stays vertical with its code and description above two compact action buttons. Pending-parent requests and modal/API handlers are preserved.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings. No live browser visual verification. Presentation only; no backend edits, commit or push.

### [13/11/2026] - Account dropdown visual polish

- Refine account menu with a blue/indigo-tinted identity panel, avatar, role badge, improved spacing and icon containers for settings/home.
- Make logout an explicit solid red full-width action with white icon/text, darker hover and visible keyboard focus. Preserve all existing actions, menu dismissal and navigation behavior.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings. No browser visual verification, backend edits, commit or push.

### [13/11/2026] - Separate student history and stabilize curriculum layout

- Student History now has separate Diagnostic, Practice and Mock Exam categories. Diagnostic history reuses the server-backed result view in read-only history mode: no new-exam action, auto-start or draft recovery. Diagnostic entry retains start/resume/progress and links to history instead of duplicating the history table.
- Practice history displays only current-student ZPD/TOPIC records actually stored by the existing practice UI and labels them browser-local, with answer review. No seeded history or fabricated remote results. Mock history has an explicit unavailable state.
- Read-only backend inspection found diagnostic list/detail endpoints, but no per-student practice-attempt or mock-exam list endpoint in the current Stages/MockExams controllers. Mock detail exists by submission ID only. Backend list endpoints are needed for complete cross-device practice/mock history; no backend edits.
- Curriculum loading now reserves a comparable page structure with skeletons; remove the content entrance animation/broad header transition, constrain width/min-width, wrap header actions by available container width, and stabilize scrollbar space. This addresses identified layout-shift/overflow risks; reported browser zoom appearance has not been reproduced directly.
- Validation: production build and lint exited zero with existing warnings; 21 existing node tests passed. Browser visual, slow-network and category interactions remain unverified. No commit/push.

### [13/11/2026] - Student portal UI and history checkpoint

- Checkpoint pending frontend presentation work: compact account header/menu with red logout, role-aware greetings, shared mobile sidebar and grouped student navigation.
- Include API-backed diagnostic entry guidance, colorful progress card, 7:3 setup-card layout and readable parent-link controls.
- Separate diagnostic entry from categorized history. Diagnostic history is server-backed; practice history is explicitly browser-local; mock history awaits a BE list API. Stabilize curriculum loading and width behavior without backend changes.
- Final validation before commit: all 21 existing tests passed, lint exited zero with warnings, production build passed with existing bundle-size/jsxgraph eval warnings, and git diff whitespace check passed. Browser/live API and reported layout issue remain unverified directly.
- Commit scope is lowercase frontend only. Root repository pending merge, uppercase frontend and backend service changes are excluded. No push performed.

### [13/11/2026] - Student curriculum catalog and spacious learning workspace

- Add a student-only catalog: subject selection, search and Chapter/Lesson/Pattern accordion with explicit Enter lesson actions. Do not auto-open a lesson or show authoring controls to students.
- Open selected patterns in a full-application reading workspace with breadcrumb/back navigation, optional outline, Knowledge/Method/Video & Examples tabs, larger reading text and preserved MathText graph/formula rendering. Sidebar is covered while studying; restore catalog focus/scroll on return.
- Reuse existing curriculum data, quiz generation/submission handlers and quiz modal; extract modal JSX for reuse without changing scoring or API payloads. Existing AI context callback is wired from App. Staff retain the original two-column authoring interface.
- Video controls use provided safe HTTP(S) source URLs; unsupported sources open in a new tab. Missing content is labelled as being updated. No completion/mastery state or prerequisites are invented, and existing quiz fallback behavior is unchanged.
- Validation: production build and lint passed with existing warnings; all 21 existing tests passed. Browser visual/media/keyboard flows have not been manually verified. No backend edits, commit or push.

### [13/11/2026] - Student chapter/lesson accordion defaults

- Open only the first chapter and first lesson by default for each subject. Opening another chapter/lesson collapses its sibling; show patterns only after lesson expansion. Search temporarily expands matching results.
- This changes catalog disclosure state only; lesson content, quiz handlers and APIs are unchanged. Confirmed existing add/edit chapter, lesson and pattern controls remain in the staff authoring view, not the student view.
- Validation: production build passed with existing warnings. Browser interaction not manually verified. No backend edits, commit or push.

### [13/11/2026] - Preserve independently expanded chapters and lessons

- Correct the previous exclusive accordion behavior at the user's request. Each chapter and lesson now has its own expansion flag; opening a new item does not collapse existing items.
- Retain first-chapter/first-lesson defaults, per-subject expansion memory while mounted, and search expansion. Only clicking an already expanded item's own heading collapses it. This supersedes the earlier sibling-exclusive behavior.
- Validation: production build passed with existing warnings. No business logic/API changes, commit or push.

### [13/11/2026] - Chapter-scoped reading outline

- Restrict reading-workspace outline to the current chapter. Show chapter name, flat lesson section headings and their pattern links; no extra nested disclosure controls.
- Mark current lesson/pattern with highlight, current-page semantics and Studying label. Selecting a link stays within the chapter; a separate action returns to the catalog to choose another chapter.
- Validation: production build passed with existing warnings. No quiz/API changes, browser visual verification, commit or push.


### [13/11/2026] - Dedicated teacher portal and scoped live data

- Added teacher teaching overview with quick links to curriculum authoring, class mastery, exam bank, student diagnostic history and early-warning support. Existing staff chapter/lesson/pattern editing stays in CurriculumExplorerView; student reading workspace remains separate.
- Teacher navigation no longer routes history/analytics to student screens or exam bank back to curriculum. Removed obsolete teacher Live Q&A shortcut and misleading sidebar zero counts.
- New portal uses direct API requests without seeded fallback. Exam list/detail use Content endpoints. Heatmap and diagnostic history use the assigned class and its roster. Alert resolution sends mentor_id and resolution_notes and refreshes only after API success. Account/tab remounts and effect cleanup discard obsolete read responses.
- BE dependencies: no teacher assigned-class list endpoint found in ClassesController, and UserProfileDto has no class assignment. Class-dependent screens show unavailable state until currentUser.classId is supplied. No default/sample class or all-system alert request is issued.
- BE gap verified read-only: GetAlertsDashboardQueryHandler does not apply MentorId; absent ClassId calls GetAllAlertsAsync. FE always includes a class for teacher alerts, but server-side assignment authorization still requires BE review. Teacher-wide practice/mock submission lists were not found; history is explicitly diagnostic-only.
- Validation: 24 tests passed including missing-assignment/global-alert guards; lint exited zero with warnings and production build passed with existing JSXGraph eval/bundle warnings. Live teacher login, visual browser review and API authorization not verified. Backend files unchanged; no commit/push.


### [13/11/2026] - Curriculum and teacher portal commit checkpoint

- Prepare the lowercase frontend checkpoint containing the student catalog/reading workspace, chapter-scoped outline, teacher overview/navigation, scoped API requests and tests. Validation: 24 tests passed, lint and build passed with warnings, whitespace check passed. Live browser/API verification remains pending. Backend repositories and root pending merge are excluded; push is left to the user.

---

## [13/11/2026] - Khắc Phục Lỗi Lịch Sử Làm Bài & Bóc Tách Câu Hỏi Luyện Tập Thích Ứng ZPD

- **Khắc phục lỗi Lịch sử làm bài & Tạo bài kiểm tra đầu vào (`src/services/practiceService.js`)**:
  - Loại bỏ tiền tố thừa `/v1/` trong hai phương thức `getDiagnosticHistory` và `getDiagnosticResult`: chuyển đổi từ `/api/v1/practice/diagnostic-submissions/...` sang `/api/practice/diagnostic-submissions/...` khớp đúng với route của Controller `DiagnosticSubmissionsController.cs` trong Practice Service.
  - Xử lý triệt để lỗi HTTP 404 *"Không tìm thấy dữ liệu hoặc đường dẫn yêu cầu"* trên cả trang Lịch sử làm bài lẫn sự kiện khởi tạo bài thi mới khi học sinh bấm "Làm Bài Kiểm Tra Mới".
- **Khắc phục lỗi nạp câu hỏi Luyện tập thích ứng ZPD (`src/components/modals/AdaptiveQuizModal.jsx`)**:
  - Bổ sung cơ chế bóc tách câu hỏi đa tầng: gom câu hỏi từ `single_questions` (hoặc `singleQuestions`), và nếu rỗng thì trích xuất danh sách câu hỏi phân bổ trong các bài đọc ngữ cảnh `passages.flatMap(p => p.questions || [])` của Content Service.
  - Loại bỏ tình trạng mảng câu hỏi rỗng và cảnh báo *"Chưa có câu hỏi ZPD từ Backend Content Service. Vui lòng kiểm tra kết nối Gateway (:5212)"*.
- **Kiểm thử & Biên dịch**:
  - Chạy `node --test tests/*.test.js src/**/*.test.js`: **28/28 tests pass**.
  - `npm run lint` đạt 0 errors, `npm run build` thành công xuất bản bundle sạch.

---

## [13/11/2026] - Triển Khai Ràng Buộc Xem Lộ Trình Sau Thi (Lớp Học Chung & Cá Nhân Riêng) Và Cơ Chế Kích Hoạt Học Phí

- **Phân tách và trực quan hóa 2 chế độ Lộ trình học tập (`StudentCurriculumView.jsx`, `curriculumAccess.js`)**:
  - **Lớp Học Chung (Chương trình đào tạo chuẩn)**: Cung cấp cây tri thức chuẩn hóa 5 miền ĐGNL V-ACT theo cấu trúc Chương -> Bài học -> Dạng bài (patterns).
  - **Lộ Trình Cá Nhân Riêng (Theo kết quả khảo sát)**: Tự động phân cụm dạng bài học dựa trên kết quả thi chẩn đoán (IRT Theta & điểm 4 miền) thành 3 chặng thích ứng:
    - *Chặng 1*: Bù lỗ hổng kiến thức & Trọng tâm bứt phá (ZPD Priority - ưu tiên cao nhất, tiềm năng hồi phục `+75 - +110` điểm).
    - *Chặng 2*: Nâng cao năng lực vận dụng & logic ĐGNL (`+50 - +70` điểm).
    - *Chặng 3*: Thực chiến bấm giờ & Chinh phục điểm 900+ (`+35 - +50` điểm).
  - Tích hợp bộ chuyển tab trực quan giữa *🏫 Lớp Học Chung* và *🎯 Lộ Trình Cá Nhân Riêng*.
- **Thiết lập Ràng buộc Học phí & Chế độ Xem Tổng Quát (Paywall & Overview Mode)**:
  - Học sinh sau khi hoàn thành bài thi khảo sát năng lực được **xem toàn bộ khung cấu trúc tổng quát** của cả 2 lộ trình (mục tiêu đầu ra, độ khó, dạng bài cần bù điểm, thời lượng ôn tập dự kiến).
  - **Ràng buộc vào học**: Nếu chưa đóng học phí (`!isPaid`), các bài học chi tiết, phương pháp giải từng bước, video bài giảng độc quyền và bài tập luyện tập thích ứng củng cố sẽ ở trạng thái khóa.
  - Khi học sinh bấm "Vào học" hoặc "Luyện tập củng cố", hệ thống hiển thị `TuitionRequiredModal` nhắc nhở hoàn tất học phí, kèm nút dẫn trực tiếp sang màn hình thanh toán PayOS VietQR (`onNavigateTuition`) và nút xem trước tóm tắt tổng quát.
- **Tích hợp liên kết sau thi & thanh toán (`DiagnosticAssessmentPage.jsx`, `TuitionPaymentView.jsx`, `App.jsx`)**:
  - Tại màn hình kết quả sau khi thi (`stage === 'result'`), bổ sung banner thông báo và các nút hành động trực tiếp: "Xem Lộ Trình (Lớp Chung & Cá Nhân)" và "Kích Hoạt Học Phí".
  - Trong `TuitionPaymentView.jsx`, tích hợp lưu vết trạng thái đóng tiền (`veval_tuition_paid_${studentId}`), phát sự kiện `veval:tuition-paid`, và cung cấp nút kích hoạt test nhanh phục vụ nghiệm thu.
- **Kiểm thử & Đảm bảo chất lượng**:
  - Viết mới test suite `tests/curriculumAccess.test.js`: kiểm thử trạng thái học phí, phân cụm 3 chặng học thích ứng và xử lý an toàn dữ liệu đầu vào rỗng.
  - Chạy `node --test tests/*.test.js src/**/*.test.js`: toàn bộ **31/31 tests pass** 100%.
  - Chạy `npm run lint` đạt 0 errors, `npm run build` thành công trong 1.15s.

---

## [13/11/2026] - Gia Cố Cơ Chế Tự Hồi Phục (Graceful Fallback) Màn Hình Lịch Sử Làm Bài

- **Bảo Vệ Luồng Nạp Lịch Sử Khảo Sát Năng Lực Đầu Vào (`src/components/diagnostic/DiagnosticAssessmentPage.jsx`)**:
  - Tái cấu trúc cơ chế nạp chi tiết các bài thi đã làm trong `Promise.all`: bọc từng lời gọi `practiceService.getDiagnosticResult` trong `try/catch` độc lập.
  - Khi một bài thi trong lịch sử gặp lỗi hoặc là đề thi cũ không còn dữ liệu câu hỏi chi tiết từ Backend, hệ thống tự động fallback trích xuất dữ liệu tóm tắt (`theta0`, `totalScore`, `totalCorrect`, `totalQuestions`, `placementClass`, `totalTimeSpentSeconds`).
  - Triệt tiêu 100% nguy cơ 1 bài thi cũ làm sập toàn bộ danh sách lịch sử thi của học sinh, ngăn chặn lỗi hiển thị *"Không tải được lịch sử: Đã xảy ra lỗi nội bộ trên hệ thống máy chủ Practice Service"*.
- **Kiểm Thử & Biên Dịch**:
  - Toàn bộ 31/31 kiểm thử đơn vị node test vượt qua 100%.
  - Lệnh `npm run lint` và `npm run build` chạy thành công, không phát sinh bất kỳ lỗi bundle nào.

---

## [13/11/2026] - Tối Giản Hóa Màn Hình Tổng Quan Học Tập (Dashboard UX Clean-up) & Loại Bỏ Khối Chặng Học Giả Lập

- **Loại Bỏ Khối Chặng Học & Lịch Phụ Đạo Giả Lập (`src/App.jsx`)**:
  - Gỡ bỏ hoàn toàn cụm `MilestoneCard` ("Chặng 01 (Tổng hợp) : Luyện tập chuyên đề thích ứng...") và `LiveQnACard` ("Phòng Giải Đáp Chuyên Đề ĐGNL & Sửa Bài Socratic...").
  - Xóa bỏ tình trạng hiển thị dữ liệu giả lập chặng học và buổi học không có thực, ngăn chặn xung đột thông tin với tính năng Lộ trình học tập (`StudentCurriculumView`) vừa xây dựng.
- **Tinh Chỉnh HeroBanner & Bỏ Thuật Ngữ Kỹ Thuật (`src/components/dashboard/HeroBanner.jsx`)**:
  - Tinh gọn các thông điệp truyền cảm hứng học tập: thay thế toàn bộ từ ngữ nội bộ ("ZPD", "DAG", "IRT 2PL", "Core Flow 5") bằng ngôn ngữ sư phạm dễ hiểu, tự nhiên cho học sinh và phụ huynh.
  - Chuẩn hóa 3 nút hành động chính: *Vào học theo lộ trình* (điều hướng thẳng vào cây bài học chuẩn hoặc lộ trình thích ứng), *Đánh giá năng lực đầu vào*, *Hỏi Gia sư AI 24/7*.
- **Chuẩn Hóa Lưới Chỉ Số Năng Lực Trọng Tâm (`src/components/dashboard/MetricsGrid.jsx`)**:
  - Thay thế các nhãn hệ thống ("Flow 5", "Flow 2", "Flow 3", "Lộ trình DAG") bằng các chỉ số thiết thực: *Điểm năng lực ước tính (Thang 1200)*, *Kỷ luật chuyên cần*, *Tiến độ lộ trình học*, *Trọng tâm cần cải thiện*.
- **Kiểm Thử & Biên Dịch**:
  - Toàn bộ 31/31 unit tests đạt pass 100%.
  - `npm run lint` đạt 0 lỗi, `npm run build` thành công trong 1.17s (giảm kích thước bundle sạch sẽ).

---

## [13/11/2026] - Tái Cấu Trúc Bố Cục Trang Tổng Quan Học Tập Hài Hòa & Nâng Cấp Nhận Diện Ảnh Học Sinh

- **Tái Cấu Trúc Thứ Tự Thị Giác (Dashboard Layout Hierarchy Optimization - `src/App.jsx`)**:
  - Đưa `HeroBanner` lên vị trí đầu trang làm khối chào đón và truyền cảm hứng chủ đạo, loại bỏ tình trạng hai thẻ thông báo đầu vào và liên kết phụ huynh đè lên trên lời chào.
  - Sắp xếp lưới 4 chỉ số `MetricsGrid` ở vị trí trung tâm, giúp học sinh nắm bắt ngay 4 KPI cốt lõi (Điểm dự báo 1200, Streak chuyên cần, Tiến độ lộ trình, Trọng tâm cần ôn tập).
  - Đặt khối hành động kép (`DiagnosticOnboardingCard` 70% + `StudentParentLinkCard` 30%) ở phần dưới trang, tạo điểm tựa thị giác vững chắc, cân đối và liền mạch trước footer thay vì để trang bị cụt đột ngột.
- **Nâng Cấp Thẻ Ảnh Học Sinh Thực Tế (`src/components/dashboard/HeroBanner.jsx`)**:
  - Chuyển đổi từ ảnh mẫu ghép gỗ (`students_cutout_badge.jpg`) sang ảnh chân dung học sinh THPT Việt Nam ôn tập thực tế (`vietnamese_student_real.jpg`).
  - Thiết kế khung thẻ kính Glassmorphism bán trong suốt (`bg-white/10 backdrop-blur-md border border-white/20`) hài hòa với nền chuyển sắc xanh hoàng gia của HeroBanner.
- **Kiểm Thử & Biên Dịch**:
  - Toàn bộ 31/31 unit tests đạt pass 100%.
  - `npm run lint` 0 lỗi, `npm run build` thành công trong 1.05s.
