# Số liệu mốc của Giai đoạn thủ công

File này chốt lại Giai đoạn thủ công thành một bảng số dùng được cho báo cáo A2 và cho phép so sánh ở #22.

Nó **không** phải nguồn sự thật của dữ liệu.
Mốc giờ thô chỉ nằm ở `docs/nhat-ky-thu-cong.md`; mọi con số dưới đây là số dẫn xuất, tính lại được từ đó bất cứ lúc nào.
Nếu hai file mâu thuẫn thì `docs/nhat-ky-thu-cong.md` đúng và file này sai.

Chốt ngày 2026-07-29 khi đóng #10.
Từ đây tới hết đồ án, năm mẫu này là mốc cố định và không được ghi thêm mẫu thủ công nào nữa.

## Định nghĩa dùng trong file này

Bảng ở `docs/nhat-ky-thu-cong.md` cố ý không có cột nào tính sẵn, nên mỗi con số dưới đây phải nói rõ nó trừ mốc nào cho mốc nào.

| Đại lượng | Công thức | Ý nghĩa |
|---|---|---|
| Chờ | `Bắt đầu` trừ `Merge` | Khoảng thay đổi đã nằm trên `main` nhưng chưa ai bắt tay triển khai. |
| staging | `Hoàn tất` của dòng staging trừ `Bắt đầu` | Chi phí đưa thay đổi lên môi trường đầu tiên, gồm cả build image. |
| prod | `Hoàn tất` của dòng prod trừ `Hoàn tất` của dòng staging | Chi phí biên của môi trường thứ hai. |
| Lead time | `Hoàn tất` của dòng prod trừ `Merge` | Lead time for changes theo DORA, tính từ lúc thay đổi vào trunk tới lúc nó chạy trên prod. |

Ba đại lượng đầu cộng lại đúng bằng lead time, không thừa không thiếu.

### Vì sao cột prod tính từ `Hoàn tất` staging

Đây là chỗ mà mục nhật ký của #8 tính theo hai cách khác nhau, và #10 phải chốt lấy một.

Hai dòng của cùng một thay đổi chia sẻ cùng một mốc `Bắt đầu`, vì người thao tác mở một phiên duy nhất rồi chạy bước 3 và 4 cho staging, sau đó chạy tiếp bước 5 và 6 cho prod.
Nếu cột prod cũng trừ từ `Bắt đầu` thì nó chứa trọn phần staging bên trong, và cộng hai cột lại sẽ đếm đôi khoảng chung.
Cách đang chọn là cách duy nhất giữ được đẳng thức `chờ + staging + prod = lead time`.

Nó cũng đúng ý định đã phát biểu trong ghi chú "#8 prod" của `docs/nhat-ky-thu-cong.md`.

**Cảnh báo phải mang theo mỗi khi trích cột này.**
Con số ở cột prod không phải chi phí của một lần triển khai prod độc lập.
Bước 5 chạy ngay sau bước 3 nên nó hưởng nguyên cache build mà bước 3 vừa tạo; mẫu #8 thấy rõ nhất, ở đó lớp `COPY services/ services/` báo `CACHED` và cột prod rơi về 0 phút.
Muốn có chi phí của một lần triển khai prod đứng một mình thì phải đo lại trên máy chưa có cache, và Giai đoạn thủ công không có mẫu nào như vậy.

## Bảng năm mẫu

Đơn vị là phút.

| Mẫu | Commit | Chờ | staging | prod | Lead time | Phát hành thất bại |
|---|---|---|---|---|---|---|
| #5 | `49460b4` | 9 | 2 | 3 | 14 | có |
| #6 | `555bc78` | 1 | 2 | 13 | 16 | có |
| #7 | `5a60048` | 1 | 2 | 1 | 4 | không |
| #8 | `eda7968` | 2 | 2 | 0 | 4 | không |
| #9 | `805a55c` | 2 | 2 | 1 | 5 | không |

| Đại lượng | Trung bình | Trung vị | Nhỏ nhất | Lớn nhất |
|---|---|---|---|---|
| Chờ | 3,0 | 2 | 1 | 9 |
| staging | 2,0 | 2 | 2 | 2 |
| prod | 3,6 | 1 | 0 | 13 |
| **Lead time** | **8,6** | **5** | **4** | **16** |

Bảng này thay cho bảng ở mục "2026-07-28 - Xác thực địa chỉ, và một bước phục hồi chưa bao giờ chạy" của `docs/nhat-ky-du-an.md`, mục đã tính cột prod theo hai cách.
Mục đó được giữ nguyên chứ không sửa đè, vì bản thân chỗ lệch là dữ liệu về quy trình.

### Ba chỗ phải trừ hao khi trích

Ba mẫu mang ghi chú riêng trong `docs/nhat-ky-thu-cong.md`, và bảng trên không thể hiện được chúng.

**Dòng staging của #5 không đại diện cho một lần triển khai đầy đủ.**
Volume của staging đã bị xoá và dựng lại trong lúc phát triển, trước khi đồng hồ chạy, nên bước 4 xanh mà không phải trả chi phí của `down -v`.
Con số 2 phút của mẫu này là cận dưới.

**Dòng staging của #7 chứa một bước không nằm trong "Bảng lệnh".**
Tiêu chí nghiệm thu của #7 đòi kiểm `/readyz` bằng cách dừng Postgres thật, việc mà bộ kiểm thử HTTP không làm được, nên nó thành một bước tay chạy đúng một lần.
Con số 2 phút của mẫu này là cận trên.

**Dòng staging của #9 kéo lại hai image nền trước khi build.**
`postgres:17-alpine` và `nginx:1.29-alpine`, mỗi cái hơn 11 giây, chạy song song, và nằm trong đồng hồ theo đúng quy tắc không dừng đồng hồ giữa chừng.
Con số 2 phút của mẫu này "đắt" hơn con số 2 phút của bốn mẫu trước dù bằng nhau trên giấy.

Hệ quả chung: cột staging phải đọc như một dải quanh 2 phút, không phải một hằng số bằng 2.
Việc năm mẫu đều rơi về đúng một con số là do độ phân giải của đồng hồ là phút, chứ không phải do quy trình ổn định tới mức đó.

### Lead time của #5 có một giá trị thứ hai

Bảng trên ghi 14 phút cho #5, lấy theo cột `Hoàn tất` của dòng prod là `2026-07-28T15:18`.

Mốc đó về sau bị chứng minh là sai.
Mục đính chính trong `docs/nhat-ky-thu-cong.md` cho thấy `down -v` chưa bao giờ chạy ở lần đó, prod hỏng liên tục, và schema của #5 chỉ thật sự có mặt trên prod lúc `2026-07-28T16:21`, tức trong lần triển khai của #6.
Đọc theo nghĩa "thay đổi chạy được trên prod" thì lead time của #5 là **77 phút**.

Ảnh hưởng lên hai chỉ số:

| Cách tính lead time của #5 | Trung bình | Trung vị |
|---|---|---|
| Theo mốc đã ghi, 14 phút | 8,6 | 5 |
| Theo mốc phục hồi thật, 77 phút | 21,2 | 5 |

Bảng chính giữ giá trị 14 phút, vì đó là con số duy nhất tính được bằng cùng một luật với bốn mẫu còn lại, và vì luật đo của đồ án định nghĩa `Hoàn tất` là lúc bộ kiểm thử báo xanh chứ không phải lúc hệ thật sự đúng.

Khi so sánh với Giai đoạn pipeline ở #22 thì phải dùng trung vị làm số chính.
Trung vị không đổi giữa hai cách tính, còn trung bình chênh gần hai lần rưỡi chỉ vì một mẫu; với cỡ mẫu bằng năm thì trung bình không đủ vững để mang một kết luận.

## Tần suất triển khai

| Đại lượng | Giá trị |
|---|---|
| Số lần triển khai một môi trường | 10 |
| Số lần triển khai prod | 5 |
| Cửa sổ đo | `2026-07-28T15:18` tới `2026-07-29T09:18`, đúng 18 giờ 00 |
| Tần suất | 1 lần lên prod mỗi 3 giờ 36 phút, quy đổi 6,7 lần một ngày |

Khoảng cách giữa hai lần lên prod liên tiếp, theo thứ tự: 63, 622, 51, 344 phút.
Trung vị là 203,5 phút.

Con số này phải trích kèm cảnh báo, nếu không nó sẽ nói ngược điều cần nói.

Tần suất trên trông cao, nhưng nó không đo năng lực của quy trình.
Mẫu số là thời gian đồng hồ của một đợt làm việc dồn, còn hai khoảng cách lớn nhất là 622 phút và 344 phút, tức những lúc không có ai ngồi trước máy.
Ràng buộc thật của Giai đoạn thủ công là **mỗi lần triển khai đều cần một người có mặt gõ lệnh**, chứ không phải quy trình chỉ chịu được ngần ấy lần một ngày.

Vì vậy khi so sánh ở #22, tần suất triển khai chỉ có nghĩa nếu Giai đoạn pipeline được đo trên một cửa sổ tương đương và bằng cùng cách xác định mẫu số.
So một đợt làm dồn của giai đoạn này với một đợt làm dồn của giai đoạn kia là so được; so với "số lần deploy trung bình mỗi ngày" của cả tuần thì không.

## Kích thước các thay đổi

Cột "Mã và hạ tầng" đếm dòng thêm và dòng xoá ở `services/`, `infra/`, `compose.yaml`, `Dockerfile` và các file `package.json`, tức đúng phần mà một lần triển khai phải build lại.
Hai cột còn lại tách riêng vì chúng không đi vào image.

| Mẫu | Mã và hạ tầng | File mã chạm | Kiểm thử | Tài liệu |
|---|---|---|---|---|
| #5 | +108 / -1 | 7 | +118 / -33 | +193 / -12 |
| #6 | +18 / -3 | 1 | +51 / -0 | +2 / -2 |
| #7 | +95 / -14 | 7 | +52 / -5 | +26 / -7 |
| #8 | +199 / -19 | 9 | +206 / -2 | +10 / -6 |
| #9 | +120 / -12 | 6 | +0 / -0 | +25 / -0 |

Trung vị của cột mã là 108 dòng thêm, trung bình 108, dải từ 18 tới 199.

### Nhận xét về mức độ đồng đều

Bốn trong năm mẫu nằm trong dải 95 tới 199 dòng và chạm từ 6 tới 9 file mã.
Đó là một nhóm đủ đồng đều để gọi là "thay đổi cỡ chuẩn" theo cách `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` dùng từ này.

Điểm quan trọng hơn con số: kích thước thay đổi **không** kéo theo chi phí triển khai.
#6 nhỏ hơn #8 mười một lần về số dòng mã, nhưng cột staging của cả hai đều là 2 phút.
Chi phí của một lần triển khai tay ở đây gần như toàn bộ là chi phí cố định, gồm build image, dựng lại container và chạy bộ kiểm thử, chứ không phải chi phí tỷ lệ với lượng mã.
Đây là điều làm phép so sánh với Giai đoạn pipeline vững hơn tưởng, vì lệch cỡ giữa hai giai đoạn không tự động làm lệch số đo.

### Ba ngoại lệ phải cảnh báo

**#6 là mẫu nhỏ nhất và lệch hẳn nhóm.**
18 dòng mã trên đúng một file, không chạm hạ tầng.
Nó vẫn nằm trong tập mẫu vì cột staging của nó bằng bốn mẫu còn lại, tức nó không kéo trung vị đi đâu cả.
Nhưng nếu #22 cần một cặp thay đổi thật sự so được một một giữa hai giai đoạn thì đừng chọn mẫu này.

**#9 là mẫu duy nhất không thêm dòng kiểm thử nào.**
Không phải do bỏ sót.
#9 xây phần ghi log, mà log không đi ra qua HTTP, trong khi bộ kiểm thử của đồ án bị ràng buộc chỉ nói chuyện qua HTTP theo tiêu chí nghiệm thu của #3.
Toàn bộ nghiệm thu của #9 làm bằng tay, và chuyện này được kể ở mục nhật ký ngày 2026-07-29 về log có cấu trúc.

**#5 là mẫu duy nhất đụng `infra/postgres/init.sql`.**
Đây là ngoại lệ nặng nhất, vì nó chi phối cả hai lần phát hành thất bại của giai đoạn.
Chỉ thay đổi schema mới cần bước `down -v`, và chính bước đó bị bỏ sót.
Nghĩa là tỷ lệ phát hành thất bại 2/5 không phải "hai trong năm thay đổi bất kỳ đều có thể hỏng", mà là "một trong một thay đổi schema đã hỏng, và không thay đổi nào trong bốn thay đổi không đụng schema hỏng cả".
Giai đoạn pipeline phải có ít nhất một thay đổi schema thì con số change failure rate của hai giai đoạn mới so được với nhau.

## Hai chỉ số DORA còn lại

Hai chỉ số này thuộc về #21 và #22; phần dưới chỉ chốt cái Giai đoạn thủ công đã quan sát được, để hai ticket đó không phải dựng lại từ mốc thô.

| Chỉ số | Giá trị của Giai đoạn thủ công | Ghi chú |
|---|---|---|
| Change failure rate | 2 trên 5 lần triển khai prod, tức 40% | Đếm theo định nghĩa ở `docs/trien-khai-thu-cong.md`, là đỏ ở prod. Đỏ ở staging không tính. |
| Thời gian phục hồi | Một sự cố duy nhất, từ `2026-07-28T15:16` tới `2026-07-28T16:21`, tức 65 phút | Hai lần phát hành thất bại nhưng chỉ một khoảng hỏng, vì lần thứ hai là cùng một nguyên nhân chưa được sửa. |

Chỗ dễ đếm sai: 13 phút mà #6 bỏ ra để sửa **không** phải thời gian phục hồi.
Prod đã hỏng từ 15:16, và gán 13 phút vào đây là đếm thiếu năm lần.
13 phút đó nằm trong lead time của #6, và đó là lý do #6 có cột prod bằng 13 trong khi bốn mẫu còn lại đều dưới 4.

Cỡ mẫu bằng một cho thời gian phục hồi là quá nhỏ để so sánh, và đó chính là lý do #21 tồn tại.

## Cổng đóng giai đoạn

| Điều kiện | Trạng thái |
|---|---|
| Ít nhất tám lần triển khai tay được ghi đầy đủ | Đạt, có 10 dòng trên 5 thay đổi |
| Lead time trung bình và trung vị tính được | Đạt, 8,6 và 5 phút |
| Tần suất triển khai tính được | Đạt, 5 lần lên prod trong 18 giờ |
| Kích thước thay đổi đủ đồng đều | Đạt với cảnh báo, xem ba ngoại lệ ở trên |

Không cần bổ sung thay đổi cỡ chuẩn nào nữa.
Giai đoạn thủ công đóng tại đây, và #11 trở đi được phép dựng pipeline.
