# Quy trình triển khai thủ công

Tài liệu này mô tả cách đưa một thay đổi đã merge vào `main` lên hai môi trường của Hệ thống demo, hoàn toàn bằng tay, và cách bấm giờ trong lúc làm.

Từ #11, hai nửa ấy không còn cùng trạng thái, nên đọc phần nào là tuỳ việc đang làm.

**Các bước triển khai còn hiệu lực.**
Triển khai vẫn làm tay cho tới khi #12 tự động hoá staging và #13 tự động hoá prod.
"Bảng lệnh", "Chuẩn bị", "Các bước", "Khi có sự cố" và "Nếu prod hỏng" vì vậy vẫn là quy trình đang dùng.

**Kỷ luật bấm giờ thì đã đóng.**
`docs/nhat-ky-thu-cong.md` đóng sổ ngày 2026-07-29 khi #10 xong và không nhận thêm dòng nào, nên không còn mốc nào để lấy và không còn cột nào để điền.
Mọi chỗ nói tới việc bấm giờ hay điền nhật ký trong tài liệu này đều được đánh dấu **(đã đóng)** và giữ nguyên tại chỗ: chúng là bản ghi cách bộ dữ liệu của Giai đoạn thủ công được tạo ra, thứ mà báo cáo cần để nói về giới hạn của phép đo.
Đọc chúng như bản ghi, đừng làm theo.

Số đo thu được nằm ở `docs/nhat-ky-thu-cong.md`, số dẫn xuất ở `docs/so-lieu-giai-doan-thu-cong.md`, và cả hai là vế "trước khi có pipeline" của Luận điểm.

Cách chạy hệ và hình dạng của hệ nằm ở `README.md`; ở đây chỉ nói thứ tự các bước và kỷ luật ghi giờ.

## Bảng lệnh

Mục này là toàn bộ quy trình gói lại thành một khối chép được, dành cho người đã đọc phần "Các bước" ở dưới ít nhất một lần.
Nó không phải bản rút gọn có quyền khác phần dưới: mỗi dòng ở đây tương ứng đúng một dòng ở đó, và khi sửa quy trình thì phải sửa cả hai chỗ.

**Đọc hết mục này trước khi chép khối lệnh.**
Hai bước trong khối có điều kiện, và cả hai nằm sẵn ở dạng dòng bị chú thích, đúng chỗ phải chạy.
Bước 1 có một lệnh cho biết lần merge này đụng file nào; theo đó mà bỏ dấu `#` ở dòng tương ứng:

- đụng `infra/postgres/init.sql` thì mở hai dòng `down -v`, chúng nằm **trước** lệnh `up`
- đụng `infra/nginx/nginx.conf` thì mở hai dòng `restart nginx`, chúng nằm **sau** lệnh `up`

Bốn dòng còn lại bị chú thích vì lý do khác hẳn: ba lệnh lấy giờ và một lệnh `gh pr view` chỉ phục vụ việc điền `docs/nhat-ky-thu-cong.md`, mà file đó đã đóng sổ.
Chúng thuộc phần **(đã đóng)** và không bao giờ được mở lại; chúng nằm đó để thấy khối lệnh này từng có hình dạng nào lúc năm mẫu đo được tạo ra.

Chép cả khối mà không mở dòng nào là đúng cho thay đổi chỉ đụng mã service, và sai cho hai trường hợp trên.
Bỏ sót thì bước 4 hoặc bước 6 đỏ; đã xảy ra một lần ở lần triển khai của #5, xem mục "#5 prod" trong `docs/nhat-ky-thu-cong.md`.

```powershell
# (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm') #   đã đóng: mốc Bắt đầu

git checkout main                                           # bước 1
git pull
git log -1 --format='%h %s'                                 #   xác nhận đúng commit vừa merge
git --no-pager show --stat HEAD                             #   đụng init.sql hay nginx.conf?
# gh pr view <số-pr> --json mergedAt                        #   đã đóng: cột Merge

npm run typecheck                                           # bước 2

# docker compose --env-file env/staging.env down -v         #   chỉ khi đụng init.sql
docker compose --env-file env/staging.env up -d --build     # bước 3
# docker compose --env-file env/staging.env restart nginx   #   chỉ khi đụng nginx.conf
docker compose --env-file env/staging.env ps                #   phải thấy 5 dòng Up
npm test                                                    # bước 4, phải thấy pass 20

# (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm') #   đã đóng: Hoàn tất của staging

# docker compose --env-file env/prod.env down -v            #   chỉ khi đụng init.sql
docker compose --env-file env/prod.env up -d --build        # bước 5
# docker compose --env-file env/prod.env restart nginx      #   chỉ khi đụng nginx.conf
docker compose --env-file env/prod.env ps                   #   phải thấy 5 dòng Up
$env:BASE_URL = 'http://localhost:8080'; npm test           # bước 6, phải thấy pass 20
$env:BASE_URL = $null

# (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm') #   đã đóng: Hoàn tất của prod
```

Bất kỳ bước nào không cho ra kết quả như ghi ở trên thì dừng lại, xem mục "Khi có sự cố"; ở Giai đoạn thủ công thì đồng hồ vẫn chạy trong lúc đó.

## Vì sao làm tay, và làm tay tới mức nào

Giai đoạn thủ công **cố ý không có pipeline**, theo `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md`.
Đây là quyết định có chủ đích, không phải việc còn nợ.
Toàn bộ giá trị của Giai đoạn thủ công nằm ở chỗ nó đo được chi phí thật của con người khi chưa có gì tự động, để về sau so với Giai đoạn pipeline mà chỉ khác đúng một biến.

Vì vậy trong giai đoạn này **không được viết script, alias, Makefile, task runner hay bất cứ thứ gì gộp nhiều bước lại thành một lệnh**.
Một script gộp sáu lệnh thành một chính là pipeline thu nhỏ.
Nó sẽ kéo số của Giai đoạn thủ công xuống gần Giai đoạn pipeline và làm phép so sánh mất ý nghĩa, mà lại không lộ ra ở đâu cả vì nhật ký chỉ ghi thời gian chứ không ghi cách gõ lệnh.

Ranh giới cụ thể:

- **Được**: gõ tay từng lệnh, dùng lịch sử shell, chép lệnh từ tài liệu này ra dán vào terminal, mở nhiều terminal.
- **Không được**: script hoá, đặt alias, thêm lệnh mới vào `scripts` của `package.json`, dùng GitHub Actions hay bất kỳ CI nào.

Các lệnh `npm test` và `npm run typecheck` đã có sẵn từ #3 thì vẫn dùng, vì chúng là một bước chứ không phải một chuỗi bước được gộp.

Ranh giới trên là luật **của Giai đoạn thủ công**, không phải luật đang có hiệu lực.
Nó chi phối đúng khoảng thời gian năm mẫu đo được tạo ra, và khoảng đó đã khép lại ở #10.
Vì vậy `.github/workflows/ci.yml` dựng ở #11 không mâu thuẫn với dòng "không được dùng GitHub Actions" ở trên: cấm CI là điều kiện của thí nghiệm, và thí nghiệm ấy đã chạy xong phần của nó.

Cái còn hiệu lực là các bước ở dưới vẫn gõ tay cho tới khi #12 và #13 tự động hoá chúng.
Lý do bây giờ chỉ còn là chưa có ai làm thay, không còn là kỷ luật đo lường.

## Quy tắc bấm giờ (đã đóng)

Mục này mô tả kỷ luật đã áp dụng cho năm mẫu đo của Giai đoạn thủ công, không phải việc phải làm bây giờ.
`docs/nhat-ky-thu-cong.md` đóng sổ ở #10, nên không còn dòng nào để ghi và không còn đồng hồ nào để bấm.
Giữ nguyên vì báo cáo chỉ nói được bộ dữ liệu ấy đo cái gì và bỏ sót cái gì khi biết nó được tạo ra theo luật nào.

Nguyên văn luật cũ, ở thì hiện tại như lúc nó còn hiệu lực:

Đọc kỹ mục này trước lần triển khai đầu tiên, vì số đo sai không sửa lại được.

Một lần triển khai cần lấy giờ **ba lần**, cộng thêm một mốc lấy từ GitHub:

| Mốc | Lấy ở đâu | Điền vào |
|---|---|---|
| `Merge` | `gh pr view <số> --json mergedAt`, không phải giờ hiện tại | cả hai dòng |
| `Bắt đầu` | ngay trước bước 1 | cả hai dòng |
| `Hoàn tất` | ngay sau khi bước 4 xanh | dòng staging |
| `Hoàn tất` | ngay sau khi bước 6 xanh | dòng prod |

**Đồng hồ chạy từ lúc gõ ký tự đầu tiên của bước 1, và dừng khi bước 6 xanh.**
Không dừng đồng hồ ở giữa vì bất cứ lý do gì: đọc lại tài liệu, tra lỗi, chờ image build, sửa sự cố, đi lấy nước.
Toàn bộ khoảng đó là chi phí thật của việc triển khai tay, và đó chính là thứ cần đo.

Nếu buộc phải bỏ dở giữa chừng và quay lại sau, không ghi một dòng bị ngắt quãng.
Ghi dòng đó là **bỏ dở** ở cột sự cố, rồi làm lại từ đầu thành một dòng mới.

**Ghi ngay lúc làm, không ghi sau.**
Mốc giờ không dựng lại được từ trí nhớ hay từ lịch sử shell.
Thực tế nên mở sẵn `docs/nhat-ky-thu-cong.md` ở một cửa sổ khác và điền dần từng cột.

**Thời gian ghi theo UTC, định dạng `YYYY-MM-DDTHH:MM`.**
Chọn UTC vì mốc merge lấy thẳng từ GitHub, mà GitHub trả về UTC.
Trộn hai múi giờ trong một bảng là cách chắc chắn nhất để hỏng dữ liệu.

Lấy giờ UTC hiện tại:

```sh
date -u +%Y-%m-%dT%H:%M                                    # Git Bash
```

```powershell
(Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm')  # PowerShell
```

## Chuẩn bị, làm một lần

Docker Desktop phải đang chạy, và `npm install` phải đã chạy ít nhất một lần trong repo.
Hai việc này nằm **ngoài** đồng hồ, vì chúng không lặp lại theo từng lần triển khai.

## Các bước

Sáu bước, theo đúng thứ tự này mỗi lần.
Mỗi bước ghi kèm thứ phải nhìn thấy thì mới được đi tiếp.

### Bước 1: lấy thay đổi về

```sh
git checkout main
git pull
git log -1 --format='%h %s'
```

SHA ngắn vừa hiện ra xác nhận đây đúng là commit vừa merge.
**(Đã đóng)** Nó cũng từng được ghi vào cột `Commit` của `docs/nhat-ky-thu-cong.md`.

Rồi xem lần merge này đụng những file nào:

```sh
git --no-pager show --stat HEAD
```

Danh sách đó quyết định hai bước có điều kiện ở bước 3 và bước 5, nên phải biết ngay từ đây chứ không phải lúc đã đứng trước lệnh `up`.
Thấy `infra/postgres/init.sql` thì bước 3 và bước 5 có thêm `down -v`, thấy `infra/nginx/nginx.conf` thì có thêm `restart nginx`.

**(Đã đóng)** Mốc merge được lấy từ GitHub chứ không từ `git log`, vì thời điểm tác giả commit không phải thời điểm thay đổi vào `main`:

```sh
gh pr view <số-pr> --json mergedAt
```

Giá trị đó được ghi vào cột `Merge`, cắt bớt phần giây.

### Bước 2: kiểm tra kiểu

```sh
npm run typecheck
```

Đây là bước build duy nhất của hệ, vì Node chạy thẳng TypeScript và không có bước biên dịch.
Phải không có lỗi nào thì mới đi tiếp.

### Bước 3: triển khai staging

Nếu thay đổi lần này có đụng vào `infra/postgres/init.sql` thì phải xoá volume **trước**:

```sh
docker compose --env-file env/staging.env down -v
```

Postgres chỉ chạy `init.sql` đúng một lần, lúc khởi tạo một volume rỗng.
Volume đã có dữ liệu thì file mới nằm im, bảng mới không bao giờ được tạo, và triệu chứng là service trả 500 chứ không phải một lỗi nói rõ nguyên nhân.
Bỏ qua bước này thì bước 4 chắc chắn đỏ.

Giai đoạn này chưa có cơ chế migration, nên đổi schema đồng nghĩa với mất toàn bộ dữ liệu của môi trường đó.
Chấp nhận được vì cả hai môi trường chỉ chứa dữ liệu thử.

```sh
docker compose --env-file env/staging.env up -d --build
```

Chờ tới khi lệnh trả về, rồi kiểm tra năm container đều `Up`:

```sh
docker compose --env-file env/staging.env ps
```

Nếu thay đổi lần này có đụng vào `infra/nginx/nginx.conf` thì phải thêm:

```sh
docker compose --env-file env/staging.env restart nginx
```

Bước này bắt buộc và rất dễ quên.
File config được gắn vào container theo kiểu bind mount nên nội dung trên đĩa đổi ngay, nhưng nginx đã đọc config vào bộ nhớ từ lúc khởi động, còn Compose thì không dựng lại container vì định nghĩa service không đổi.

### Bước 4: nghiệm thu staging

```sh
npm test
```

Bộ kiểm thử mặc định bắn vào `http://localhost:8081`.
Phải xanh toàn bộ thì mới được đụng tới prod.

**(Đã đóng)** Xanh thì lấy giờ ngay và ghi vào cột `Hoàn tất` của **dòng staging**.
Đây là mốc giữa, dễ quên nhất trong cả quy trình, vì cảm giác lúc đó là mới làm được nửa việc chứ chưa xong cái gì.
Bỏ mốc này thì về sau không tách được thời gian triển khai staging khỏi thời gian triển khai prod, mà #10 cần cả hai để nói được rằng phần lớn thời gian rơi vào đâu.
Đồng hồ **không** dừng ở đây, nó chạy tiếp sang bước 5.

Nếu đỏ, xem mục sự cố ở dưới.

### Bước 5: triển khai prod

Cũng như bước 3, nếu có đụng `init.sql` thì xoá volume trước:

```sh
docker compose --env-file env/prod.env down -v
```

```sh
docker compose --env-file env/prod.env up -d --build
docker compose --env-file env/prod.env ps
```

Và cũng như bước 3, nếu có đụng `nginx.conf`:

```sh
docker compose --env-file env/prod.env restart nginx
```

### Bước 6: nghiệm thu prod

```sh
BASE_URL=http://localhost:8080 npm test                    # Git Bash
```

```powershell
$env:BASE_URL = 'http://localhost:8080'; npm test          # PowerShell
$env:BASE_URL = $null                                      # xoá ngay sau khi chạy xong
```

Dòng thứ hai của bản PowerShell là bắt buộc, không phải cho gọn.
Bash đặt biến cho đúng một lệnh rồi thôi, còn PowerShell giữ biến cho tới hết phiên terminal.
Quên xoá thì lần triển khai sau, bước 4 tưởng là đang kiểm thử staging nhưng thật ra vẫn bắn vào prod, và nó sẽ xanh nên không có gì báo cho biết.

Xanh toàn bộ thì xong lần triển khai.
**(Đã đóng)** Đây cũng là chỗ **dừng đồng hồ** và ghi vào cột `Hoàn tất`.

### Sau khi dừng đồng hồ (đã đóng)

Cả mục này thuộc phần đã đóng: không còn nhật ký nào để điền sau khi bước 6 xanh.

Điền nốt các cột còn thiếu của cả hai dòng trong `docs/nhat-ky-thu-cong.md`, rồi commit file nhật ký.

Việc ghi và commit nhật ký nằm ngoài đồng hồ.
Lý do là ở Giai đoạn pipeline sẽ không có công việc tương ứng, nên tính vào sẽ thổi phồng chênh lệch giữa hai giai đoạn theo hướng có lợi cho luận điểm.
Đây là thứ phải nói rõ trong báo cáo khi bàn về giới hạn của phép đo.

## Khi có sự cố

Sự cố không phải chuyện bất thường cần giấu đi, nó là dữ liệu.
Change failure rate của Giai đoạn thủ công được tính từ chính cột này.

**(Đã đóng)** Quy tắc lúc đó: **đồng hồ không dừng, và mô tả sự cố được ghi ngay ở cột `Sự cố`**.
Nếu mô tả dài hơn một dòng bảng thì ghi vắn tắt ở cột đó và viết đầy đủ ở mục ghi chú cuối file nhật ký.

Hai sự cố đã gặp ở #3 và nhiều khả năng gặp lại, phần này vẫn còn hiệu lực:

**nginx trả 502 sau khi dựng lại một service.**
Docker cấp lại địa chỉ IP mỗi lần container được dựng lại.
Đã sửa ở #3 bằng cách cho nginx phân giải lại tên qua DNS nội bộ, nên nếu triệu chứng này quay lại thì tức là có gì đó đã hỏng ở `nginx.conf`, không phải chuyện phải chịu đựng.

**Kiểm thử đỏ ở bước 4 hoặc bước 6.**
Phân biệt hai trường hợp, vì chúng cho hai con số khác nhau.
Đỏ ở staging là bắt được lỗi trước khi tới người dùng, ghi sự cố rồi sửa.
Đỏ ở prod là một lần phát hành thất bại, và đây mới là thứ tính vào change failure rate.

## Nếu prod hỏng

Giai đoạn này chưa có blue-green và chưa có rollback tự động; #13 mới làm việc đó.
Cách quay về bản cũ là `git checkout` commit trước rồi chạy lại bước 5 và 6.

**(Đã đóng)** Thời điểm prod bắt đầu hỏng và thời điểm nó chạy lại được ghi vào cột `Sự cố`, vì đó là dữ liệu để tính MTTR của Giai đoạn thủ công.
