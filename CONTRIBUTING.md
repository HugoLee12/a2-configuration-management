# Quy ước truy vết thay đổi

Tài liệu này mô tả cách một thay đổi đi từ yêu cầu tới nhánh `main`.
Nó là vật liệu cho mục 25.3 Change management trong báo cáo A2, đồng thời là mốc để tính lead time của hai giai đoạn đo.

## Một issue cho một thay đổi

Mọi thay đổi bắt đầu bằng một issue, kể cả thay đổi nhỏ.
Issue mô tả cái cần đạt và tiêu chí nghiệm thu, không mô tả cách hiện thực.
Không gom nhiều việc rời rạc vào một issue, vì lead time được tính theo từng issue.

## Nhánh trunk-based, sống ngắn

`main` là trunk duy nhất và luôn ở trạng thái phát hành được.
Không có nhánh `develop`, không có nhánh `release`, không có nhánh dài hạn nào khác.
Mỗi thay đổi mở một nhánh riêng, đặt tên `<số-issue>-<mô-tả-ngắn>`, ví dụ `2-bao-ve-nhanh-main`.
Nhánh sống trong vài giờ tới vài ngày rồi bị xoá sau khi merge.

Chiến lược này cố định xuyên suốt cả Giai đoạn thủ công lẫn Giai đoạn pipeline.
Đổi chiến lược nhánh giữa chừng sẽ thêm một biến thứ hai vào phép so sánh và làm hỏng số liệu, xem `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md`.

## Pull request tham chiếu issue

Không push thẳng vào `main`; nhánh `main` được bảo vệ và sẽ từ chối.
Mọi thay đổi vào `main` đi qua pull request.

Phần mô tả pull request phải chứa một dòng `Closes #<số-issue>` để GitHub nối pull request với issue và tự đóng issue khi merge.
Nhờ đó truy được ngược từ một bản phát hành về commit, về pull request, rồi về yêu cầu thay đổi ban đầu.

Pull request merge được mà không cần approval của người khác.
Đây là lựa chọn có chủ đích: đồ án do một người thực hiện, mà GitHub không cho tự duyệt pull request của chính mình, nên yêu cầu người duyệt sẽ tự khoá tác giả.
Việc bảo vệ vì vậy nằm ở chỗ bắt buộc pull request, không nằm ở số lượng người duyệt.

Merge bằng squash, để mỗi issue tương ứng đúng một commit trên `main`.

## Tiêu đề commit

Tiêu đề commit viết bằng tiếng Việt có dấu, dạng câu mệnh lệnh, không quá 72 ký tự và không có dấu chấm cuối câu.

```
Bảo vệ nhánh main và ghi quy ước truy vết thay đổi
```

Phần thân commit tuỳ chọn, dùng để giải thích lý do khi lý do không hiển nhiên.
