# Hệ thống demo A2

Dịch vụ rút gọn URL, tồn tại để pipeline Configuration Management có thứ để build, kiểm thử và phát hành.
Nghiệp vụ cố ý tối giản, xem `CONTEXT.md` và `docs/adr/0002-he-thong-demo-va-stack.md`.

Bối cảnh đồ án nằm ở `CONTEXT.md`, quy ước đóng góp ở `CONTRIBUTING.md`, Nhật ký dự án ở `docs/nhat-ky-du-an.md`.
Số liệu mốc của Giai đoạn thủ công nằm ở `docs/so-lieu-giai-doan-thu-cong.md`.

## Hình dạng của hệ

```
người dùng -> nginx -+-> /api/v1/  -> service link     -+
                     |                                  |
                     +-> /<mã>     -> service redirect -+-> Postgres
                     |                                  |
                     +-> /internal/ -> cả ba service ---+
```

nginx là cửa vào duy nhất.
Ba service phía sau nó không bao giờ được gọi trực tiếp từ bên ngoài, kể cả bởi bộ kiểm thử; không service nào có mục `ports:` trong `compose.yaml`.

Service thứ ba là `stats`, một worker chạy nền.
Mỗi lượt truy cập một mã ngắn được service `redirect` ghi thành một dòng trong bảng `visits`, rồi worker rút hàng đợi đó ra theo chu kỳ và cộng dồn vào bảng `link_stats`.
Vì vậy worker không nằm trên đường chuyển hướng: dừng nó thì chuyển hướng vẫn chạy bình thường, chỉ có số lượt là đứng yên cho tới khi nó sống lại.

## Sức khoẻ, sẵn sàng và số liệu

Cả ba service, kể cả worker, trả lời ba đường dẫn vận hành dưới `/internal/<service>/`, với `<service>` là `link`, `redirect` hoặc `stats`.

| Đường dẫn | Trả lời gì | Chạm cơ sở dữ liệu |
|---|---|---|
| `/internal/<service>/healthz` | 200 chừng nào tiến trình còn nhận được request | không |
| `/internal/<service>/readyz` | 200 nếu chạy được `select 1`, 503 nếu không | có |
| `/internal/<service>/metrics` | số liệu vận hành theo định dạng phơi bày của Prometheus | không |

```sh
curl localhost:8081/internal/stats/readyz
# {"status":"sẵn sàng"}
```

Hai câu hỏi đầu cố ý tách bạch: tiến trình còn chạy không có nghĩa là nó phục vụ được.
`/readyz` là tín hiệu mà cơ chế phát hành blue-green dùng để quyết định chuyển lưu lượng hay huỷ bản mới, và cũng là cổng gác mà bộ kiểm thử chờ trước khi chạy test đầu tiên.

`/metrics` phơi số đếm request theo endpoint và mã trạng thái, phân bố độ trễ, các số đếm tiến trình Node, cùng số đếm nghiệp vụ riêng của từng service: `links_created_total` ở `link`, `redirects_total` ở `redirect`, `stats_aggregation_cycles_total` và `stats_visits_aggregated_total` ở `stats`.
Nhãn `endpoint` là mẫu route chứ không phải đường dẫn thô, nên mọi lượt chuyển hướng gom về một nhãn `/:code` thay vì mỗi mã ngắn một chuỗi thời gian.

Nhánh `/internal/` là lối duy nhất hỏi được `stats`, vì worker không nằm trên đường phục vụ request nào.

## Log

Cả ba service ghi log ra stdout và stderr, mỗi bản ghi là đúng một dòng JSON.

```json
{"time":"2026-07-29T04:12:07.481Z","level":"info","service":"link","msg":"request","method":"POST","path":"/api/v1/links","status":201,"duration_ms":8.4}
```

Mỗi request phục vụ xong để lại một bản ghi `msg: "request"`, và mỗi lỗi để lại một bản ghi `level: "error"` mang theo stack.
Chu kỳ tổng hợp của worker `stats` chỉ để lại bản ghi khi thất bại, vì nó lặp mỗi giây.

Trường `path` là đường dẫn thô, nên với service `redirect` nó chính là mã ngắn.
Địa chỉ đích mà mã ngắn trỏ tới không xuất hiện trong bản ghi nào.

Vì mỗi dòng là JSON nên trích số liệu được bằng một lệnh, chẳng hạn đếm request theo mã trạng thái:

```powershell
docker compose --env-file env/staging.env logs --no-log-prefix link |
  ForEach-Object { $_ | ConvertFrom-Json } | Where-Object msg -eq request |
  Group-Object status | Select-Object Name, Count
```

Đổi `Group-Object status` thành `Measure-Object duration_ms -Average -Maximum` thì ra độ trễ thay vì số lượt.
Đây là nguồn dữ liệu thứ hai bên cạnh `/metrics`: `/metrics` cho số đã cộng dồn sẵn, còn log giữ từng sự kiện nên trả lời được câu hỏi chưa nghĩ ra lúc dựng chỉ số.

## Chạy hệ

Cần Docker Compose.
Mỗi môi trường là một file trong `env/`.

```sh
docker compose --env-file env/staging.env up -d --build   # staging, cổng 8081
docker compose --env-file env/prod.env    up -d --build   # prod, cổng 8080
```

Hai môi trường tách biệt hoàn toàn: khác cổng, khác project name của Compose, nên khác container, khác network và khác volume dữ liệu.
Dựng cả hai cùng lúc được.

Lệnh staging ở trên là để chạy thử tại chỗ.
Staging **sau mỗi lần merge** thì do pipeline dựng lại, xem mục "Pipeline"; gõ tay lệnh trên sau khi merge sẽ đè lên bản pipeline vừa triển khai.

Hai cái bẫy khi triển khai tay.

Sửa `infra/nginx/nginx.conf` rồi chạy lại lệnh trên thì nginx **không** nạp config mới, vì định nghĩa service không đổi nên Compose không dựng lại container.
Phải `docker compose --env-file env/staging.env restart nginx`.

Sửa `infra/postgres/init.sql` thì schema mới **không** tới được cơ sở dữ liệu đang có, vì Postgres chỉ chạy file này lúc khởi tạo một volume rỗng.
Phải xoá volume trước: `docker compose --env-file env/staging.env down -v` rồi `up` lại.

Dừng lại:

```sh
docker compose --env-file env/staging.env down            # thêm -v nếu muốn xoá luôn dữ liệu
```

Mật khẩu Postgres nằm thẳng trong `env/` vì hệ chỉ chạy trên máy cá nhân và không có gì thật để mất.
Khi nào hệ chạy ở nơi khác thì phải chuyển sang secret của nơi đó.

## Dùng thử

```sh
curl -X POST localhost:8081/api/v1/links -H 'content-type: application/json' \
     -d '{"url":"https://example.com/mot-duong-dan-rat-dai"}'
# {"code":"aB3xY9z","shortUrl":"http://localhost:8081/aB3xY9z"}

curl -i localhost:8081/aB3xY9z
# HTTP/1.1 302 Found
# Location: https://example.com/mot-duong-dan-rat-dai

curl localhost:8081/api/v1/links/aB3xY9z/stats
# {"code":"aB3xY9z","visits":1}
```

Số lượt tới muộn hơn lượt truy cập vài giây, vì worker `stats` tổng hợp theo chu kỳ chứ không đếm ngay lúc chuyển hướng.

Số phiên bản nằm sẵn trong đường dẫn ngay từ v1.
Lý do là `docs/adr/0002-he-thong-demo-va-stack.md` đòi nghiệp vụ phải có chỗ cho API v1 và v2 chạy song song, mà thêm số phiên bản về sau thì phải phá đường dẫn cũ.

## Kiểm thử

Bộ kiểm thử là hộp đen: nó chỉ gửi HTTP vào nginx, không import mã service và không nói chuyện với Postgres.
Vì vậy stack phải đang chạy trước khi chạy nó.

```sh
npm install
npm test                                   # mặc định bắn vào staging, http://localhost:8081
BASE_URL=http://localhost:8080 npm test    # hoặc bắn vào prod
npm run smoke                              # chỉ các đường sống còn, cùng bộ test
```

`npm run smoke` chạy đúng hai file trong `tests/` thay vì cả năm.
Nó là thứ pipeline dùng để nghiệm thu một lần triển khai staging, nên nó phải nhanh và chỉ gồm những đường mà hỏng là hệ coi như không phục vụ được.
Không có bộ kiểm thử thứ hai viết riêng cho việc đó.

Kiểm tra kiểu và lint:

```sh
npm run typecheck
npm run lint
```

## Ghi chú về mã nguồn

Ba service nằm trong `services/`, dùng chung một `Dockerfile` ở gốc.
Container nào chạy service nào là do `command` trong `compose.yaml` quyết định.

Node 24 chạy thẳng TypeScript nên không có bước biên dịch riêng: kiểu được kiểm bằng `tsc --noEmit`, còn lúc chạy thì kiểu bị bóc đi.
Đổi lại `tsconfig.json` bật `erasableSyntaxOnly`, nghĩa là không dùng được `enum`, `namespace` hay parameter property.

## Pipeline

`.github/workflows/ci.yml` chạy trên mỗi pull request và trên mỗi lần `main` nhận commit mới: cài phụ thuộc, kiểm tra kiểu, lint, dựng stack staging rồi chạy bộ kiểm thử qua nginx, sau đó đóng gói image và đẩy lên GHCR với tag là SHA của commit.
Lần chạy trên `main` không thừa: merge bằng squash sinh ra một commit mới, nên nếu chỉ chạy ở pull request thì commit thật sự nằm trên `main` sẽ là commit duy nhất không có image nào.
Bước đóng gói nằm riêng ở `.github/workflows/image.yml` dạng `workflow_call`, để chỗ khác gọi lại chính nó thay vì chép bước build sang nơi mới.

Trên `main` có thêm job thứ ba là `trien-khai-staging`: nó kéo image vừa đẩy về, dựng lại staging từ đúng image ấy, rồi chạy `npm run smoke` qua nginx để nghiệm thu.
Smoke test là tập con của chính bộ kiểm thử, gồm hai file kiểm sẵn sàng của cả ba service và đường tạo link với chuyển hướng; chi tiết ở bước 4 của `docs/trien-khai-thu-cong.md`.
Smoke test đỏ thì job đỏ, và lần chạy trên `main` mang dấu X.

Build và triển khai staging vì vậy không còn làm tay nữa.
**Triển khai prod thì vẫn làm tay** theo bước 5 và bước 6 của `docs/trien-khai-thu-cong.md`, cho tới khi #13 tự động hoá nốt.

`.github/workflows/phat-hanh.yml` là workflow thứ ba, và nó chạy theo một tín hiệu khác: một cú push tag `v*`, không phải một cú push commit.
Nó gọi lại `image.yml` với `tag` là tên tag, nên image trên GHCR mang đúng chuỗi ký tự của tag trong kho mã, rồi tạo bản phát hành trên GitHub với danh sách thay đổi tự sinh từ các pull request đã merge.
Quy tắc chọn số phiên bản, cái gì được coi là hợp đồng công khai, và ba lệnh để phát hành: `docs/quy-tac-phien-ban.md`.

### Runner tự quản cho staging

Staging là `localhost:8081` trên máy chủ đồ án, đúng môi trường mà Giai đoạn thủ công đã đo.
Runner của GitHub nằm trên mây và không có đường nào tới đó, nên job `trien-khai-staging` chạy trên một self-hosted runner đăng ký ở chính máy ấy.
Đây là việc cài một lần, theo `Settings > Actions > Runners > New self-hosted runner` của kho mã; nhãn mặc định `self-hosted` là nhãn mà workflow đang chọn.

Máy đó cần Docker Desktop đang chạy, cần `git`, và cần PowerShell 7 vì job chạy mọi bước bằng `pwsh`.
PowerShell 7 không có sẵn trên Windows: bản dựng sẵn là Windows PowerShell 5.1, một chương trình khác tên `powershell`.
Node thì workflow tự cài bản 24 nên không cần sẵn.
Runner không chạy thì lần triển khai xếp hàng chờ chứ không hỏng, và nó chạy tiếp khi runner sống lại.

Kho mã này công khai, mà self-hosted runner trên kho công khai là rủi ro có thật: một pull request từ fork chạy được mã tuỳ ý trên máy thật.
Chỗ chặn nằm ở `if: github.event_name == 'push'` của job, nghĩa là job chỉ tồn tại với commit đã qua `kiem-tra` và đã được merge, không bao giờ với mã của một pull request.
Đừng nới điều kiện ấy.

Giai đoạn nào đang chạy thì tra ở mục cuối `docs/nhat-ky-du-an.md`; đừng tra ở đây, vì file này mô tả hệ chứ không theo dõi tiến độ.
Vì sao Giai đoạn thủ công cố tình không có pipeline: `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md`.
