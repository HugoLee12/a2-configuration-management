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

## Bảng

| Thay đổi | Commit | Môi trường | Merge | Bắt đầu | Hoàn tất | Sự cố |
|---|---|---|---|---|---|---|
| #5 | 49460b4 | staging | 2026-07-28T15:04 | 2026-07-28T15:13 | 2026-07-28T15:15 | bước xoá volume đã được làm trước khi bấm giờ, xem ghi chú |
| #5 | 49460b4 | prod | 2026-07-28T15:04 | 2026-07-28T15:13 | 2026-07-28T15:18 | phát hành thất bại, quên xoá volume, xem ghi chú |

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
