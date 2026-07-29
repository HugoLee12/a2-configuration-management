# Nhật ký thủ công

Bản ghi thời gian của từng lần triển khai tay trong Giai đoạn thủ công.

File này là **dữ liệu nghiên cứu**, không phải ghi chú tường thuật.
Nó chỉ chứa mốc giờ và sự cố, không chứa lý do hay diễn giải; phần kể chuyện thuộc về `docs/nhat-ky-du-an.md`.

Cách triển khai và quy tắc bấm giờ nằm ở `docs/trien-khai-thu-cong.md`.
Đọc mục "Quy tắc bấm giờ" ở đó trước lần ghi đầu tiên, vì số đo sai không sửa lại được.

## Cách đọc bảng

Mỗi lần triển khai một môi trường là một dòng, nên một thay đổi bình thường sinh ra hai dòng: staging rồi prod.

| Cột | Nghĩa |
|---|---|
| `Thay đổi` | Số issue. Theo `CONTRIBUTING.md` thì mỗi issue tương ứng đúng một commit trên `main`, nên số này định danh duy nhất một thay đổi. |
| `Commit` | SHA ngắn của commit squash trên `main`. |
| `Môi trường` | `staging` hoặc `prod`. |
| `Merge` | Thời điểm pull request được merge, lấy từ GitHub. |
| `Bắt đầu` | Thời điểm gõ ký tự đầu tiên của bước 1. |
| `Hoàn tất` | Thời điểm bộ kiểm thử của môi trường đó xanh toàn bộ. |
| `Sự cố` | `không`, hoặc mô tả vắn tắt. Mô tả dài viết ở mục ghi chú cuối file. |

Mọi mốc giờ theo **UTC**, định dạng `YYYY-MM-DDTHH:MM`.

Cột `Merge` lặp lại giống nhau ở cả hai dòng của cùng một thay đổi, và như vậy là đúng: nó là mốc chung, còn hai dòng chỉ khác nhau ở phần triển khai.

Bảng cố ý không có cột nào chứa số phút đã tính sẵn.
Mốc thô là thứ không dựng lại được nếu ghi sai, còn số dẫn xuất thì tính lúc nào cũng được; việc tính lead time và các chỉ số DORA thuộc về #10 và #22.

**Giai đoạn thủ công đã đóng ngày 2026-07-29 khi #10 xong, và bảng dưới không nhận thêm dòng nào nữa.**
Số dẫn xuất từ năm mẫu này nằm ở `docs/so-lieu-giai-doan-thu-cong.md`, kèm công thức của từng đại lượng và ba chỗ phải trừ hao khi trích.

## Bảng

| Thay đổi | Commit | Môi trường | Merge | Bắt đầu | Hoàn tất | Sự cố |
|---|---|---|---|---|---|---|
| #5 | 49460b4 | staging | 2026-07-28T15:04 | 2026-07-28T15:13 | 2026-07-28T15:15 | bước xoá volume đã được làm trước khi bấm giờ, xem ghi chú |
| #5 | 49460b4 | prod | 2026-07-28T15:04 | 2026-07-28T15:13 | 2026-07-28T15:18 | phát hành thất bại, quên xoá volume, xem ghi chú và mục đính chính |
| #6 | 555bc78 | staging | 2026-07-28T16:05 | 2026-07-28T16:06 | 2026-07-28T16:08 | không |
| #6 | 555bc78 | prod | 2026-07-28T16:05 | 2026-07-28T16:06 | 2026-07-28T16:21 | phát hành thất bại, prod thiếu bảng từ #5, xem ghi chú |
| #7 | 5a60048 | staging | 2026-07-29T02:39 | 2026-07-29T02:40 | 2026-07-29T02:42 | không, nhưng dòng này có thêm một bước đo, xem ghi chú khác |
| #7 | 5a60048 | prod | 2026-07-29T02:39 | 2026-07-29T02:40 | 2026-07-29T02:43 | không |
| #8 | eda7968 | staging | 2026-07-29T03:30 | 2026-07-29T03:32 | 2026-07-29T03:34 | không |
| #8 | eda7968 | prod | 2026-07-29T03:30 | 2026-07-29T03:32 | 2026-07-29T03:34 | không, nhưng hai mốc `Hoàn tất` trùng phút, xem ghi chú khác |
| #9 | 805a55c | staging | 2026-07-29T09:13 | 2026-07-29T09:15 | 2026-07-29T09:17 | không, nhưng bước 3 có kéo lại hai image nền, xem ghi chú khác |
| #9 | 805a55c | prod | 2026-07-29T09:13 | 2026-07-29T09:15 | 2026-07-29T09:18 | không |

## Ghi chú sự cố

Mỗi mục đặt tiêu đề là số issue và môi trường, để dòng trong bảng trỏ tới được.

### #5 staging

Dòng này xanh nhưng không đại diện cho một lần triển khai đầy đủ, và phải trừ hao khi tổng hợp ở #10.

#5 là thay đổi đầu tiên đụng `infra/postgres/init.sql`, nên bước 3 lẽ ra phải gồm cả `down -v`.
Volume `a2-staging_postgres-data` được tạo lúc `2026-07-28T14:49:57Z`, tức đã bị xoá và dựng lại trong lúc kiểm chứng khi phát triển, trước khi đồng hồ bắt đầu lúc 15:13.
Vì vậy schema mới đã có sẵn ở staging, bước 4 xanh mà không phải trả chi phí của bước xoá volume, và cái bẫy không hề bung ra ở môi trường này.

Prod thì không được chuẩn bị sẵn như vậy, và nó hỏng ngay, xem mục dưới.

### #5 prod

Bước 5 thiếu `docker compose --env-file env/prod.env down -v`.

Volume `a2-prod_postgres-data` tạo lúc `2026-07-28T07:51:35Z`, từ lần triển khai của #3, và chưa bao giờ bị xoá.
Postgres chỉ chạy `init.sql` khi khởi tạo một volume rỗng, nên hai bảng `visits` và `link_stats` không được tạo, dù image đã build lại đúng và container đã dựng lại.

Triệu chứng ở bước 6: bốn test của #3 xanh, ba test thống kê đỏ vì service `link` trả 500.
Log của container `link` chỉ ra nguyên nhân trực tiếp:

```
error: relation "link_stats" does not exist
```

Bốn test cũ xanh trong lúc đó là hành vi đúng: phần thống kê hỏng nhưng chuyển hướng và tạo link vẫn phục vụ bình thường.

Mốc phục hồi:

| Mốc | Thời điểm |
|---|---|
| phát hiện prod hỏng | 2026-07-28T15:16 |
| prod xanh trở lại | 2026-07-28T15:18 |

Cách sửa là `down -v` rồi `up -d --build` lại, sau đó chạy lại bước 6.
Đồng hồ không dừng trong suốt khoảng này.

Đây tính là một lần phát hành thất bại, theo định nghĩa ở mục "Khi có sự cố" của `docs/trien-khai-thu-cong.md`: đỏ ở staging là bắt được lỗi trước khi tới người dùng, đỏ ở prod mới vào change failure rate.

Nguyên nhân gốc không nằm ở người thao tác.
Trong mục "Bảng lệnh" của `docs/trien-khai-thu-cong.md`, dòng nhắc `down -v` nằm **dưới** khối lệnh chép được, nên người chép cả khối ra dán chỉ đọc thấy nó sau khi đã gõ xong.
Ràng buộc đó phải nằm trong hoặc nằm trên khối lệnh; đã mở #41 để sửa.

#### Đính chính, phát hiện lúc triển khai #6

Hai câu ở trên nói prod xanh trở lại lúc `2026-07-28T15:18` nhờ `down -v`.
Cả hai đều sai, và lần triển khai của #6 mới làm lộ ra.

Bản ghi cũ được giữ nguyên ở trên thay vì sửa đè, vì bản thân việc ghi nhầm là dữ liệu: nó cho thấy một quy trình thủ công có thể báo cáo thành công cho một bước chưa bao giờ chạy, mà không có gì chặn lại.

Bằng chứng là mốc tạo của volume, thứ `down -v` bắt buộc phải làm mới:

| Volume | Tạo lúc | Nghĩa |
|---|---|---|
| `a2-prod_postgres-data` | `2026-07-28T07:51:35Z` | vẫn là volume của lần triển khai #3, chưa từng bị xoá |
| `a2-staging_postgres-data` | `2026-07-28T14:49:57Z` | đã dựng lại sau khi #5 đổi `init.sql` |

Đọc được như sau.
Lệnh chạy lúc 15:17 là `up -d --build`, hoặc `down` không kèm `-v`: nó dựng lại container nhưng giữ nguyên volume, nên `init.sql` vẫn không chạy và hai bảng `visits` cùng `link_stats` vẫn không tồn tại.
Tới `2026-07-28T16:08`, prod vẫn chỉ có đúng một bảng `links`, và log của cả ba service vẫn báo thiếu bảng.

Vậy dòng "prod xanh trở lại 15:18" không thể đúng.
Khả năng cao nhất là bước 6 lúc đó bắn vào staging chứ không phải prod, vì `$env:BASE_URL` đã bị xoá hoặc chưa từng được đặt; đây đúng là cái bẫy mà mục "Bước 6" của `docs/trien-khai-thu-cong.md` cảnh báo, chỉ khác chiều.
Không có bằng chứng nào còn lại để xác nhận giả thuyết đó, nên nó dừng ở mức giả thuyết.

Hệ quả lên số liệu, phải phản ánh khi tổng hợp ở #10:

- MTTR của #5 **không** phải 2 phút. Prod hỏng liên tục từ `2026-07-28T15:16`, và mốc phục hồi thật là cột `Hoàn tất` của dòng `#6` `prod` trong bảng, vì chính lần triển khai của #6 mới xoá volume và tạo lại schema.
- Trong suốt khoảng đó prod chạy ở trạng thái hỏng một phần: tạo link và chuyển hướng vẫn phục vụ, còn mọi lượt truy cập đều mất vì `redirect` ghi vào bảng `visits` không tồn tại theo kiểu bắn rồi quên.
- Bốn test cũ xanh nên không có gì báo động. Bộ kiểm thử chỉ đỏ ở phần thống kê, mà phần đó lại là phần duy nhất đọc ngược ra dữ liệu bị mất.

Bài học cho quy trình: bước 4 và bước 6 chỉ kiểm bằng mắt người, nên một lần chạy bắn nhầm môi trường không để lại dấu vết nào.
Bộ kiểm thử nên in ra địa chỉ nó đang bắn vào trước khi chạy, và đó là một thay đổi cần issue riêng.

### #6 prod

Bước 6 đỏ ba test thống kê, triệu chứng và log giống hệt mục "#5 prod" ở trên: `relation "link_stats" does not exist`.

Nguyên nhân không nằm ở thay đổi lần này.
#6 chỉ chạm `services/link/src/index.ts`, không chạm `infra/postgres/init.sql`, nên khối lệnh chép ra không có dòng `down -v` là **đúng** theo quy trình.
Cái đỏ ở đây là nợ còn lại của #5, mà bản ghi của #5 tưởng đã trả xong; chi tiết ở mục đính chính bên trên.

Mốc phục hồi:

| Mốc | Thời điểm |
|---|---|
| phát hiện prod hỏng | 2026-07-28T16:08 |
| prod xanh trở lại | 2026-07-28T16:21 |

Cách sửa vẫn là `down -v` rồi `up -d --build`, lần này chạy thật.
Volume `a2-prod_postgres-data` mang mốc tạo mới `2026-07-28T16:20:42Z`, và prod có đủ ba bảng `links`, `visits`, `link_stats`.
Đây là phép kiểm chứng mà lần #5 thiếu, nên từ nay `down -v` phải xác nhận bằng mốc tạo của volume chứ không bằng việc lệnh chạy xong không báo lỗi.

Đồng hồ không dừng trong suốt khoảng này, nên 13 phút sửa sự cố nằm trong lead time của #6.

Hai con số phải tách bạch khi tổng hợp ở #10, vì cùng một sự cố nhưng thuộc hai chỉ số khác nhau:

- Change failure rate: tính **một** lần phát hành thất bại cho #6, theo đúng định nghĩa ở `docs/trien-khai-thu-cong.md` là đỏ ở prod. Quy tắc đó cố ý không hỏi nguyên nhân thuộc về ai.
- MTTR: khoảng hỏng thật kéo từ `2026-07-28T15:16` tới `2026-07-28T16:21`, tức 65 phút, và nó thuộc về sự cố của #5 chứ không phải của #6. Gán 13 phút vào đây là đếm thiếu gần năm lần.

## Ghi chú khác

Mục này dành cho chuyện làm một dòng trong bảng không so sánh trực tiếp được với dòng khác, dù dòng đó không có sự cố nào.

### #7 staging

Dòng này có thêm một bước không nằm trong "Bảng lệnh", nên cột `Hoàn tất` của nó cao hơn một lần triển khai chỉ chạy đúng quy trình.

Tiêu chí nghiệm thu của #7 đòi kiểm rằng `/readyz` đổi trạng thái trong vài giây khi mất cơ sở dữ liệu, mà bộ kiểm thử chỉ gửi HTTP nên không có cách nào dừng Postgres.
Việc đó thành một bước tay chạy đúng một lần, đặt sau bước 4 và trước mốc `Hoàn tất` của staging.
Bước này cố ý **không** được thêm vào "Bảng lệnh", vì nó chỉ đúng cho thay đổi này; thủ tục ghi ở issue #7.

Kết quả quan sát được, trên `link`:

| Trạng thái Postgres | `/readyz` | `/healthz` |
|---|---|---|
| `pause` | 503 | 200 |
| `unpause` | 200 | - |

Prod không chạy bước này, nên cột `Hoàn tất` của dòng `#7` `prod` so sánh trực tiếp được với các mẫu trước.
Khi tổng hợp ở #10, dòng staging của #7 phải trừ hao, hoặc dùng dòng prod làm đại diện cho mẫu này.

### #8 prod

Cột `Hoàn tất` của dòng này trùng phút với cột `Hoàn tất` của dòng staging cùng thay đổi, nên phần triển khai prod đo ra 0 phút.

Con số đó là sàn phân giải của đồng hồ, không phải một phép đo bằng không.
Định dạng mốc giờ của file này là `YYYY-MM-DDTHH:MM`, nên mọi khoảng ngắn hơn một phút đều rơi về 0.

Bước 5 của lần này không build lại lớp nào: `COPY services/ services/` báo `CACHED`, vì bước 3 vừa build đúng nội dung đó cho staging.
Bước 5 vì vậy chỉ còn xuất image và dựng lại container.

Khi tổng hợp ở #10, dòng này dùng được làm cận trên của chi phí triển khai tay thuần tuý, không dùng được làm giá trị điểm.

### #9 staging

Bước 3 của dòng này kéo lại hai image nền trước khi build: `postgres:17-alpine` mất 11,6 giây và `nginx:1.29-alpine` mất 11,5 giây, chạy song song.
Bốn mẫu trước không có phần này trong đầu ra của bước 3.

Nguyên nhân không xác định được từ chỗ đứng của bản ghi này, nên không ghi ra đây.
Điều xác định được là hai khoảng đó nằm trong đồng hồ, theo đúng quy tắc "không dừng đồng hồ ở giữa vì bất cứ lý do gì".

Cột `Hoàn tất` của dòng này vì vậy cao hơn một lần triển khai không phải kéo image, dù nó vẫn rơi vào cùng con số 2 phút như bốn mẫu trước.
Khi tổng hợp ở #10, đây là một lý do nữa để đọc cột staging như một dải giá trị chứ không phải một hằng số.
