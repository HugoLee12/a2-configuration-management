# Hệ thống demo A2

Dịch vụ rút gọn URL, tồn tại để pipeline Configuration Management có thứ để build, kiểm thử và phát hành.
Nghiệp vụ cố ý tối giản, xem `CONTEXT.md` và `docs/adr/0002-he-thong-demo-va-stack.md`.

Bối cảnh đồ án nằm ở `CONTEXT.md`, quy ước đóng góp ở `CONTRIBUTING.md`, nhật ký ở `docs/nhat-ky-du-an.md`.

## Hình dạng của hệ

```
người dùng -> nginx -+-> /api/  -> service link     -+-> Postgres
                     |                               |
                     +-> /<mã>  -> service redirect -+
```

nginx là cửa vào duy nhất.
Hai service không bao giờ được gọi trực tiếp từ bên ngoài, kể cả bởi bộ kiểm thử.

## Chạy hệ

Cần Docker Compose. Mỗi môi trường là một file trong `env/`.

```sh
docker compose --env-file env/staging.env up -d --build   # staging, cổng 8081
docker compose --env-file env/prod.env    up -d --build   # prod, cổng 8080
```

Hai môi trường tách biệt hoàn toàn: khác cổng, khác project name của Compose, nên khác container, khác network và khác volume dữ liệu.
Dựng cả hai cùng lúc được.

Dừng lại:

```sh
docker compose --env-file env/staging.env down            # thêm -v nếu muốn xoá luôn dữ liệu
```

Mật khẩu Postgres nằm thẳng trong `env/` vì hệ chỉ chạy trên máy cá nhân và không có gì thật để mất.
Khi nào hệ chạy ở nơi khác thì phải chuyển sang secret của nơi đó.

## Dùng thử

```sh
curl -X POST localhost:8081/api/links -H 'content-type: application/json' \
     -d '{"url":"https://example.com/mot-duong-dan-rat-dai"}'
# {"code":"aB3xY9z","shortUrl":"http://localhost:8081/aB3xY9z"}

curl -i localhost:8081/aB3xY9z
# HTTP/1.1 302 Found
# Location: https://example.com/mot-duong-dan-rat-dai
```

## Kiểm thử

Bộ kiểm thử là hộp đen: nó chỉ gửi HTTP vào nginx, không import mã service và không nói chuyện với Postgres.
Vì vậy stack phải đang chạy trước khi chạy nó.

```sh
npm install
npm test                                   # mặc định bắn vào staging, http://localhost:8081
BASE_URL=http://localhost:8080 npm test    # hoặc bắn vào prod
```

Kiểm tra kiểu:

```sh
npm run typecheck
```

## Ghi chú về mã nguồn

Hai service nằm trong `services/`, dùng chung một `Dockerfile` ở gốc; container nào chạy service nào là do `command` trong `compose.yaml` quyết định.

Node 24 chạy thẳng TypeScript nên không có bước biên dịch riêng: kiểu được kiểm bằng `tsc --noEmit`, còn lúc chạy thì kiểu bị bóc đi.
Đổi lại `tsconfig.json` bật `erasableSyntaxOnly`, nghĩa là không dùng được `enum`, `namespace` hay parameter property.

Giai đoạn này **cố tình chưa có pipeline**, xem `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md`.
Mọi lần build và triển khai đều làm tay và được ghi giờ.
