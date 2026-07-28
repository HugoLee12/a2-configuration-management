---
status: accepted
---

# Triển khai bằng Docker Compose với blue-green, một workflow dùng chung, đo bằng Prometheus

Hệ demo triển khai bằng Docker Compose thành hai môi trường staging và prod, không dùng Kubernetes hay PaaS.
Phát hành theo kiểu blue-green: dựng stack mới song song, chạy smoke test, đạt thì nginx chuyển lưu lượng, hỏng thì tự động quay về bản cũ.
Ba service dùng chung một reusable workflow của GitHub Actions và một base image, thay vì ba bản sao chép.

## Considered Options

- **Kubernetes (k3s/minikube)** - có sẵn rolling update và rollback, đúng bài 25.4 nhất, nhưng phần lớn thời gian sẽ đổ vào học k8s chứ không vào nội dung Ch.25.
- **PaaS (Render/Railway/Fly.io)** - bị loại vì PaaS làm hộ đúng phần build và release mà nhóm cần tự chứng minh.
- **VPS free tier** - MTTR và uptime đo được thật hơn, nhưng thêm rủi ro mạng lúc thuyết trình.
- **Chỉ log có cấu trúc, không Prometheus** - đủ để có số nhưng không có biểu đồ để đưa vào slide và báo cáo.

## Consequences

- Service phải phơi endpoint `/metrics` chuẩn Prometheus ngay từ đầu; thêm Prometheus và Grafana sau đó gần như miễn phí, còn làm ngược lại thì phải sửa lại toàn bộ.
- Blue-green cho phép đo hai con số dùng làm bằng chứng chính: số request lỗi trong lúc phát hành, và MTTR khi tiêm lỗi có kiểm soát.
- Việc dùng chung một workflow cho ba service là vật liệu cho ô Reuse & trade-off của rubric; vế "phân tích lựa chọn" được đáp ứng bằng so sánh GitHub Actions với Jenkins (sách nhắc ở 25.2) và GitLab CI.
