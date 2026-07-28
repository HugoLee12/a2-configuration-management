# Đồ án A2 - Chuyên đề kỹ thuật phần mềm (CNTT313E1)

Bối cảnh của repo này là một đồ án học phần, không phải một sản phẩm.
Mọi quyết định kỹ thuật được đánh giá theo rubric của đề cương môn học chứ không theo giá trị thương mại.

## Language

**A2**:
Thành phần đánh giá chiếm 60% điểm học phần, gồm ba sản phẩm nộp cùng lúc: báo cáo 12-15 trang, ứng dụng chạy được, và bài thuyết trình.
_Avoid_: đồ án, project cuối kỳ, bài lớn

**A1**:
Thành phần đánh giá chiếm 40% điểm học phần, là các bài nộp theo từng buổi (báo cáo một trang, câu trả lời ngắn, quiz).
_Avoid_: bài tập về nhà, điểm quá trình

**Rubric**:
Bảng năm tiêu chí chấm A2 với trọng số cố định: Kiến trúc 25%, Hiện thực & CI/CD 25%, Reuse & trade-off 20%, Báo cáo & trình bày 20%, Demo & đo lường 10%.
Đây là trọng tài cuối cùng cho mọi tranh luận về phạm vi.

**CLO**:
Chuẩn đầu ra học phần. A2 chịu trách nhiệm cho CLO 2, 3, 4, 5, 6, 7.
_Avoid_: mục tiêu môn học, learning outcome

**Hệ thống demo**:
Ba service TypeScript do nhóm tự viết, tồn tại để pipeline có thứ để build, kiểm thử và phát hành.
Nghiệp vụ của nó cố ý tối giản và không phải đối tượng được chấm điểm.
_Avoid_: ứng dụng, sản phẩm, app

**Luận điểm**:
Khẳng định định lượng mà báo cáo A2 chứng minh và hệ thống demo cung cấp bằng chứng.
Phân biệt với việc trình bày lại kiến thức trong sách.
_Avoid_: đề tài, chủ đề, nội dung báo cáo

## Thiết kế thí nghiệm

**Giai đoạn thủ công**:
Giai đoạn đầu của đồ án, cố tình không có pipeline, mọi lần build và triển khai đều làm tay và ghi nhật ký thời gian.
Đây là nguồn dữ liệu mốc cho luận điểm, không phải giai đoạn chuẩn bị.
_Avoid_: giai đoạn 1, giai đoạn khởi động

**Giai đoạn pipeline**:
Giai đoạn sau, khi pipeline đã bật, đo lại trên cùng loại thay đổi để so sánh với giai đoạn thủ công.
_Avoid_: giai đoạn 2, giai đoạn hoàn thiện

**Nhật ký thủ công**:
Bản ghi thời gian từng lần build và triển khai tay trong giai đoạn thủ công.
Là dữ liệu nghiên cứu, phải ghi ngay lúc làm vì không dựng lại được sau.

**Thí nghiệm tiêm lỗi**:
Việc cố ý đẩy một thay đổi hỏng vào giai đoạn pipeline để đo thời gian phục hồi và tỷ lệ phát hành thất bại.
Bù cho việc số lần hỏng tự nhiên trong một đồ án quá ít để có ý nghĩa.
_Avoid_: chaos test, phá hoại
