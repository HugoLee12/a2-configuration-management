---
status: accepted
---

# Hệ thống demo là ba service TypeScript với nghiệp vụ tối giản

Project A2 cần một hệ thống thật để pipeline CI/CD build, kiểm thử và phát hành lên.
Chúng tôi tự viết ba service nhỏ bằng TypeScript với nghiệp vụ cố ý tối giản, thay vì một ứng dụng nghiệp vụ đầy đủ hay một dự án mã nguồn mở có sẵn.
Lý do: đề tài chấm năng lực Configuration Management, nên mọi giờ công đổ vào nghiệp vụ đều là giờ công lấy khỏi pipeline, versioning và đo lường.

## Considered Options

- **Nền tảng phục vụ mô hình AI** - đúng chuyên ngành Trí tuệ nhân tạo của nhóm và thuyết trình ấn tượng hơn, nhưng image nặng làm build chậm, tốn công tối ưu pipeline.
- **Hệ đặt chỗ / thương mại điện tử thu nhỏ** - nghiệp vụ dễ kể chuyện nhưng ngốn thời gian vào CRUD.
- **Gắn pipeline vào một dự án mã nguồn mở có sẵn** - bị loại vì nhóm không thiết kế kiến trúc, mất ô 25% "Kiến trúc" của rubric.
- **Trộn TypeScript và .NET (polyglot)** - bị loại vì rubric không có ô điểm nào thưởng cho polyglot, trong khi chi phí CI/CD nhân đôi.

## Consequences

- Hệ demo vẫn phải phân tán thật (nhiều service gọi nhau qua mạng) để giữ ô 25% "Kiến trúc".
- Nghiệp vụ phải có chỗ tự nhiên cho API v1/v2 song song, phục vụ phần 25.4 Release management.
- Hệ phải dễ sinh tải để lấy số liệu cho ô 10% "Demo & đo lường".
