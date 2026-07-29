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

Commit không gắn với pull request nào thì luôn bị từ chối:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
```

Có đúng một ngoại lệ.
Nếu commit được push chính là head của một pull request đang mở, và pull request đó đã thoả mọi điều kiện của rule, GitHub nhận cú push và ghi nhận nó là merge của chính pull request ấy.
Ngoại lệ này không phá quy ước, vì thay đổi vẫn đi qua một pull request nối về issue; nó chỉ khiến pull request bị merge mà không qua nút Merge trên giao diện, và bỏ mất phần mô tả merge do GitHub sinh.
Vì vậy rule bảo vệ nhánh nên được hiểu là ràng buộc đường đi của một thay đổi, không phải một cái khoá tuyệt đối lên nhánh.

Từ #11, lối đi này không còn tức thì nữa.
"Mọi điều kiện của rule" giờ gồm cả check `kiem-tra` nói ở mục dưới, và check ấy phải xanh trên **chính commit** được push chứ không phải trên một commit trước đó của nhánh.
Nghĩa là vẫn phải đẩy commit lên nhánh của pull request, chờ workflow chạy xong, rồi mới push thẳng vào `main` được; push ngay sau khi commit thì rule từ chối, vì lúc đó check còn đang chạy.

Phần mô tả pull request phải chứa một dòng `Closes #<số-issue>` để GitHub nối pull request với issue và tự đóng issue khi merge.
Nhờ đó truy được ngược từ một bản phát hành về commit, về pull request, rồi về yêu cầu thay đổi ban đầu.

Pull request merge được mà không cần approval của người khác.
Đây là lựa chọn có chủ đích: đồ án do một người thực hiện, mà GitHub không cho tự duyệt pull request của chính mình, nên yêu cầu người duyệt sẽ tự khoá tác giả.

Không đòi người duyệt không có nghĩa là không có ai gác.
Từ #11, rule bảo vệ `main` đòi thêm một status check bắt buộc tên `kiem-tra`, là job kiểm thử của `.github/workflows/ci.yml`; check ấy chưa xanh thì pull request không merge được.
Rule cũng bật `strict`, nghĩa là nhánh còn phải cập nhật tới ngọn `main` hiện tại.
Một pull request mở lâu, trong lúc đó `main` nhận commit mới, sẽ chuyển sang `BEHIND` và bị chặn cho tới khi nhánh được cập nhật rồi `kiem-tra` chạy lại và xanh trên commit mới ấy.
Đây là hành vi đúng của rule chứ không phải hỏng, và là chỗ dễ hiểu nhầm nhất khi gặp lần đầu.

Việc bảo vệ vì vậy nằm ở hai chỗ: bắt buộc pull request, và bắt buộc `kiem-tra` xanh trên đúng commit sắp vào `main`.
Không chỗ nào trong hai chỗ đó là số lượng người duyệt.

Merge bằng squash, để mỗi issue tương ứng đúng một commit trên `main`.

## Ngoại lệ: pull request ghi Nhật ký thủ công

Có đúng một loại pull request cố ý không mang dòng `Closes`, là loại chỉ thêm dòng vào `docs/nhat-ky-thu-cong.md`.

Lý do nằm ở thứ tự thời gian.
Số đo của một lần triển khai tay chỉ tồn tại **sau** khi thay đổi đã merge, mà đúng lúc merge thì issue tương ứng đã tự đóng.
Nên tới lúc có số để ghi thì không còn issue nào để đóng nữa.

Sâu hơn: bản ghi số đo không phải một thay đổi lên Hệ thống demo, nó là dữ liệu **về** một thay đổi đã xong.
Nó không có lead time của riêng nó để tính, nên nó không phải mắt xích trong chuỗi truy vết mà `Closes` dựng ra.

Thân pull request loại này ghi `Nhật ký thủ công cho #<số-issue>`, để vẫn truy ngược được về thay đổi đã đo, nhưng không ghi `Closes`.
Dùng `Closes` ở đây sẽ gắn hai pull request vào cùng một issue, và khi #10 với #22 trích dữ liệu để tính lead time thì không còn xác định được đâu là lần merge đưa thay đổi vào `main`.

Nhánh vẫn đặt tên theo số issue của thay đổi được đo, ví dụ `5-nhat-ky-thu-cong`.

Ngoại lệ chỉ áp dụng cho pull request **chỉ** chạm `docs/nhat-ky-thu-cong.md`.
Sửa kèm bất cứ file nào khác thì tách ra một issue riêng như thường lệ.

## Tiêu đề commit

Tiêu đề commit viết bằng tiếng Việt có dấu, dạng câu mệnh lệnh, không quá 72 ký tự và không có dấu chấm cuối câu.

```
Bảo vệ nhánh main và ghi quy ước truy vết thay đổi
```

Phần thân commit tuỳ chọn, dùng để giải thích lý do khi lý do không hiển nhiên.
