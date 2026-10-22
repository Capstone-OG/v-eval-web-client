# Flow 1 → Flow 2: API hiện tại và giới hạn

## Lộ trình cá nhân

- `GET /api/v1/practice/diagnostic-submissions/student/{studentId}`: danh sách bài nộp. Chỉ chọn bài `COMPLETED` thuộc học sinh hiện tại.
- `GET /api/v1/practice/diagnostic-submissions/{submissionId}`: điểm thô, theta0, skillBreakdowns, difficultyBreakdowns, questions, radarChart, skillPriors.
- `GET /api/v1/practice/roadmaps/my-roadmap?studentId=...`: lấy lộ trình đã tồn tại. Không tự tạo lại khi mở trang.
- `POST /api/v1/practice/roadmaps/generate`: gửi `studentId`, `diagnosticSubmissionId`, `examDate`, `studyHoursPerDay`.
- `GET /api/v1/practice/roadmaps/nodes/{nodeId}`: chi tiết chặng.

Response tạo lộ trình: `roadmapId`, `studentId`, `diagnosticSubmissionId`, `targetScore`, `totalMilestones`, `completedMilestones`, `isPruned`, `prunedReason`, `status`, `createdAt`, `stages`, `nodes`, `placementClass`.

Response lấy lộ trình bổ sung `progressPercentage`, `updatedAt`; không có `placementClass` trong DTO timeline.

Mỗi stage là một **miền năng lực**: `domainId`, `domainName`, `domainCode`, `totalNodes`, `completedNodes`, `nodes`. Đây KHÔNG phải giai đoạn học 1/2/3.

Node gồm `nodeId`, `skillId`, `skillName`, thông tin miền, `stepOrder`, `materialId`, `quizExamId`, `liveSessionId`, `status`, `isPruned`, `unlockedAt`, `completedAt`.

Chi tiết node có tiến độ video và lịch Live; chưa có nội dung bài giảng hoặc URL video trực tiếp. Không dùng video/quiz mẫu để lấp dữ liệu thiếu.

## Phân môn vào giai đoạn

DTO hiện chưa có `subjectId`, kết quả phân tích từng môn, `learningPhase`, hoặc ngưỡng phân giai đoạn riêng cho từng môn. Không thể dùng `stages` hiện tại như kết quả phân môn 1/2/3. Cần bổ sung hợp đồng BE trước khi triển khai đúng yêu cầu này.

Handler tạo lộ trình hiện gán `targetScore = 800`; FE không thể ghi đè bằng trường không thuộc request DTO. Chưa sửa BE.

## Phân lớp chuyên đề

`POST /api/practice/classes/auto-cluster`

Request: `campusId`, `maxK`.

Response: `campusId`, `totalStudents`, `optimalK`, `elbowData` gồm `k`/`wcss`, `clusters`, `message`.

Mỗi cluster: `clusterIndex`, `classId`, `className`, `centroid`, `dominantWeakDomains`, `studentCount`, `studentIds`, `domainId`, `domainCode`, `wcss`.

Đây là thao tác tạo lớp và ghi danh cho nhiều học sinh trong cơ sở, không phải API chỉ đọc hay phân giai đoạn học từng môn. Không gọi từ trang học sinh.

`POST /api/practice/classes/{classId}/micro-groups/auto-partition`: phân nhóm vi mô trong lớp; controller mô tả nhóm 3–5 học sinh. Đây cũng là thao tác quản lý riêng.

## Phạm vi FE đã nối

Trang sử dụng dữ liệu lộ trình, bài nộp và kỹ năng thật qua API; tạo lộ trình theo yêu cầu người dùng, hiển thị chi tiết node. Không còn nhập dữ liệu mock ở trang được export để sử dụng. Màn demo cũ vẫn giữ trên đĩa nhưng không còn được export làm trang lộ trình chính.

Chưa tích hợp video/quiz/live attendance, chưa có phân giai đoạn từng môn, chưa gọi chia lớp hàng loạt. Chưa chạy POST thật trên tài khoản học sinh.
