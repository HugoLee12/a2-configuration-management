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

## Ghi chú sự cố

Mỗi mục đặt tiêu đề là số issue và môi trường, để dòng trong bảng trỏ tới được.
