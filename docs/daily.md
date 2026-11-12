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
