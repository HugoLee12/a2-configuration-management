# SoftwareEngineering

Repo này là đồ án A2 của học phần CNTT313E1 (Chuyên đề kỹ thuật phần mềm), không phải một sản phẩm thương mại.
Đề tài: Chương 25 Configuration Management và DevOps, áp dụng lên một hệ ba service TypeScript và đo tác động bằng bộ chỉ số DORA.

Đọc `CONTEXT.md` để dùng đúng thuật ngữ, và `docs/adr/` trước khi đề xuất bất kỳ thay đổi kiến trúc nào.

## Ràng buộc phải tôn trọng

- **Rubric là trọng tài.** Mọi tranh luận về phạm vi giải quyết bằng năm tiêu chí chấm điểm trong `CONTEXT.md`, không bằng cái gì "đúng chuẩn công nghiệp".
- **Không dựng pipeline trong giai đoạn thủ công.** Đây là quyết định có chủ đích, xem `docs/adr/0003`. Đừng "sửa" giúp.
- **Nghiệp vụ giữ tối giản.** Hệ demo tồn tại để pipeline có thứ để build và phát hành. Không thêm tính năng nghiệp vụ.
- **Trunk-based xuyên suốt**, không đổi chiến lược nhánh giữa chừng vì sẽ làm hỏng phép so sánh.
- **Mọi thay đổi đi qua issue rồi pull request**, theo `CONTRIBUTING.md`. Nhánh `main` được bảo vệ và từ chối push thẳng. Pull request thiếu dòng `Closes #<số>` sẽ làm gãy mắt xích truy vết dùng để tính lead time.
- **Ticket đóng thì thêm một mục vào `docs/nhat-ky-du-an.md`.** Đây là vật liệu để viết báo cáo và slide ở tuần 15, bỏ qua thì không dựng lại được.
- Ngôn ngữ duy nhất là TypeScript; triển khai bằng Docker Compose, không Kubernetes, không PaaS.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues, managed via the `gh` CLI.
External PRs are not a triage surface.
See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles use their default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`).
See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root.
See `docs/agents/domain.md`.
