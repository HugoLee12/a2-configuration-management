---
status: accepted
---

# Cố tình không dựng pipeline trong giai đoạn đầu, để lấy baseline DORA

Luận điểm của báo cáo A2 là CI/CD cải thiện định lượng tốc độ và độ ổn định giao hàng, nên cần một mốc so sánh có thật.
Chúng tôi chia dự án thành hai giai đoạn: giai đoạn 1 build và triển khai hoàn toàn bằng tay, ghi nhật ký thời gian từng lần; giai đoạn 2 bật pipeline và đo lại trên cùng loại thay đổi.
Số liệu vì vậy là của chính nhóm, không phải trích từ báo cáo ngành.

## Consequences

- **Không được dựng CI/CD ngay từ commit đầu tiên.** Đây là điều phản trực giác và là lý do chính của ADR này: một người mới nhìn repo sẽ tưởng nhóm quên làm pipeline trong mấy tuần đầu.
- Giữa hai giai đoạn chỉ được đổi **đúng một biến** là sự hiện diện của pipeline.
  Vì vậy chiến lược nhánh cố định là trunk-based xuyên suốt, dù GitFlow vẫn được phân tích ở phần lý thuyết của mục 25.1.
- Nhật ký thủ công của giai đoạn 1 là dữ liệu nghiên cứu, phải ghi kỷ luật ngay lúc làm, không thể dựng lại sau.
- Change failure rate và MTTR được bổ sung bằng thí nghiệm tiêm lỗi có kiểm soát ở giai đoạn 2, vì số lần hỏng tự nhiên trong một đồ án là quá ít để có ý nghĩa thống kê.
