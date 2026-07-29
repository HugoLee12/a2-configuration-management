# SoftwareEngineering

Repo này là đồ án A2 của học phần CNTT313E1 (Chuyên đề kỹ thuật phần mềm), không phải một sản phẩm thương mại.
Đề tài: Chương 25 Configuration Management và DevOps, áp dụng lên một hệ ba service TypeScript và đo tác động bằng bộ chỉ số DORA.

Đọc `CONTEXT.md` để dùng đúng thuật ngữ, `docs/adr/` trước khi đề xuất bất kỳ thay đổi kiến trúc nào, và `README.md` trước khi đụng vào mã của Hệ thống demo.

## Bắt đầu một phiên mới

File này là luật, không phải bảng theo dõi tiến độ.
Đồ án đang dở ở đâu thì **không** ghi vào đây, vì chép trạng thái vào một file luật thì nó sai ngay phiên sau mà không ai nhớ cập nhật.

Ba chỗ phải đọc, theo thứ tự:

1. **Mục cuối cùng của `docs/nhat-ky-du-an.md`**, phần "Đang ở đâu sau mục này". Đây là chỗ ghi việc vừa xong, việc còn dở và ticket kế tiếp.
2. **`gh issue list --state open`** để biết ticket nào còn mở, và `gh issue view <số>` để xem cái nào đã hết blocker.
3. **`docs/nhat-ky-thu-cong.md`** nếu việc sắp làm có triển khai tay, để biết đã có bao nhiêu mẫu đo và lần trước hỏng ở đâu.

Kết thúc một phiên thì cập nhật phần "Đang ở đâu sau mục này" của mục nhật ký mới nhất, không sửa file này.

## Ràng buộc phải tôn trọng

- **Rubric là trọng tài.** Mọi tranh luận về phạm vi giải quyết bằng năm tiêu chí chấm điểm trong `CONTEXT.md`, không bằng cái gì "đúng chuẩn công nghiệp".
- **Không dựng pipeline trong giai đoạn thủ công.** Đây là quyết định có chủ đích, xem `docs/adr/0003`. Đừng "sửa" giúp.
- **Nghiệp vụ giữ tối giản.** Hệ demo tồn tại để pipeline có thứ để build và phát hành. Không thêm tính năng nghiệp vụ.
- **Trunk-based xuyên suốt**, không đổi chiến lược nhánh giữa chừng vì sẽ làm hỏng phép so sánh.
- **Mọi thay đổi đi qua issue rồi pull request**, theo `CONTRIBUTING.md`. Nhánh `main` được bảo vệ và từ chối push thẳng. Pull request thiếu dòng `Closes #<số>` sẽ làm gãy mắt xích truy vết dùng để tính lead time, trừ đúng một ngoại lệ đã ghi trong `CONTRIBUTING.md` là pull request chỉ ghi Nhật ký thủ công.
- **Ticket đóng thì phải có một mục trong `docs/nhat-ky-du-an.md` nhắc tới nó.** Đây là vật liệu để viết báo cáo và slide ở tuần 15, bỏ qua thì không dựng lại được. Một mục gộp được nhiều ticket, và ticket quy trình mỏng thì gộp vào mục của ticket kế tiếp thay vì viết riêng; cái không được phép là để một ticket đóng mà không mục nào nhắc tới.
- **Merge xong một ticket có chạm `services/`, `infra/`, `compose.yaml` hay `Dockerfile` thì dừng lại và nhắc chủ đồ án triển khai prod bằng tay.** Chỉ còn prod: từ #12 staging tự cập nhật sau mỗi lần merge nên không còn gì để nhắc ở nửa đó. Nói rõ số pull request vừa merge và trỏ tới mục "Bảng lệnh" trong `docs/trien-khai-thu-cong.md`, kèm câu là chỉ chạy khối prod vì phần staging trong đó đã bị chú thích lại. Đừng chép các bước ra chỗ khác, và đừng chạy hộ: chạy hộ thì hai giai đoạn khác nhau ở hai biến chứ không phải một. #13 tự động hoá nốt prod và xoá hẳn ràng buộc này. Ticket chỉ đụng tài liệu thì không cần nhắc.
- Ngôn ngữ duy nhất là TypeScript; triển khai bằng Docker Compose, không Kubernetes, không PaaS.

## Hệ thống demo

Mã nguồn ở `services/`, hạ tầng ở `infra/` và `compose.yaml`, kiểm thử ở `tests/`.
Cách dựng, cách chạy và hình dạng của hệ nằm ở `README.md`; đừng chép lại vào đây.

Ba service là `link`, `redirect` và `stats`.
`stats` là worker chạy nền, không nằm trên đường phục vụ request nào, nhưng vẫn với tới được bằng HTTP qua các đường dẫn vận hành dưới `/internal/`; xem `README.md`.

Hai ràng buộc dễ vi phạm nếu không biết trước:

- **Kiểm thử chỉ đi qua nginx bằng HTTP.** Không import mã service, không mở kết nối thẳng tới Postgres. Đây là tiêu chí nghiệm thu của #3, và là cách duy nhất bắt được lỗi nằm ở chỗ ghép nối giữa các thành phần chứ không nằm trong thành phần nào.
- **TypeScript chạy thẳng trên Node, không có bước biên dịch.** `tsconfig.json` bật `erasableSyntaxOnly`, nên `enum`, `namespace` và parameter property đều không dùng được. Kiểm tra kiểu bằng `npm run typecheck`.

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
