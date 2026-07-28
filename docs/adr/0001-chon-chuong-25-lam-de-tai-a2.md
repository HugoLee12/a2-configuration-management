---
status: accepted
---

# Chọn Ch.25 Configuration Management làm đề tài A2, phủ cả 4 mục với một luận điểm đo được

Đề cương CNTT313E1 cho phép chọn bất kỳ chủ đề nâng cao nào trong Software Engineering cho project A2 (60% điểm).
Chúng tôi chọn Chương 25 (Configuration Management), tương ứng buổi 14 "DevOps & Configuration Management", và viết báo cáo phủ đủ cả bốn mục 25.1-25.4 thay vì đào sâu một mục.
Lý do: bốn mục của Ch.25 là bốn hoạt động của cùng một quy trình (Hình 25.1), nên một pipeline CI/CD thật đã chạm trọn cả bốn mà không phát sinh thêm khối lượng công việc.

## Considered Options

- **Ch.17+18 Distributed SE & SOA/REST** - trùng trực tiếp ô 25% "Kiến trúc" của rubric, là lựa chọn ăn điểm dễ nhất. Bị loại vì sở thích chủ đề.
- **Ch.14 Resilience + Dependability** - mạnh ở ô Demo & đo lường nhưng vẫn phải tự dựng kiến trúc phân tán làm nền.
- **Ch.15+16 Reuse, Product Lines & CBSE** - trùng ô 20% "Reuse & trade-off".
- **Đào sâu một mục của Ch.25** - bị loại vì lệch nhãn "DevOps & Configuration Management" của buổi 14 và bỏ phí việc pipeline vốn đã phủ cả bốn mục.

## Consequences

- Sommerville 10th ed **không có mục DevOps** trong Ch.25 (chỉ có continuous integration nằm gọn trong 25.2 System building).
  Báo cáo bắt buộc phải bổ sung nguồn ngoài (DORA/State of DevOps, Humble & Farley, Google SRE), không thể chỉ dựa vào sách.
- Rủi ro đã được nêu và chấp nhận: đề tài này dễ biến thành "khoe pipeline" nếu thiếu luận điểm.
  Biện pháp: gắn luận điểm định lượng bằng bộ chỉ số DORA, để pipeline trở thành đối tượng đo lường chứ không phải đồ trang trí.
- Rubric vẫn đòi kiến trúc Distributed/SOA/CBSE (25%) và Reuse (20%) bất kể chủ đề nào, nên hệ thống demo vẫn phải là hệ phân tán thật do nhóm tự thiết kế.
