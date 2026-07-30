# Quy tắc đánh số phiên bản và cách phát hành

Tài liệu này trả lời hai câu hỏi: một bản phát hành được đặt số hiệu theo quy tắc nào, và cần gõ gì để phát hành nó.
Nó là vật liệu cho mục 25.4 Release management trong báo cáo A2.

Số phiên bản ở đây không phải nhãn trang trí.
Nó là mắt xích nối một bản đang chạy về đúng thay đổi sinh ra nó, tức thứ đầu tiên phải tra khi có sự cố, và là thứ cho phép nói câu "bản này phá vỡ tương thích, bản kia thì không" bằng một chuỗi ký tự thay vì bằng một đoạn văn.

## Một số hiệu cho cả hệ, không phải cho từng service

Ba service `link`, `redirect` và `stats` dùng chung đúng một `Dockerfile` và đúng một image, theo quyết định của #3.
Nên không có chỗ nào để treo ba số phiên bản khác nhau: một tag image là một bản của cả ba.

Hệ quả phải chấp nhận: một thay đổi chỉ chạm `stats` vẫn làm cả hệ tăng số phiên bản.
Đổi lại, không bao giờ phải trả lời câu "bản `link` 1.2.0 chạy được với bản `redirect` 1.1.0 không", vì tình huống đó không tồn tại được.
Đây là lựa chọn đúng với một hệ ba service triển khai cùng lúc bằng một `compose.yaml`; nó sẽ sai với một hệ mà các service phát hành độc lập, và lúc đó phải viết lại mục này chứ không lách.

## Hợp đồng công khai là cái gì

Semver chỉ có nghĩa khi nói rõ tương thích **với ai**.
Với hệ này, hợp đồng công khai là bề mặt HTTP đi qua nginx, và chỉ gồm hai nhánh:

| Nhánh | Thuộc hợp đồng công khai | Vì sao |
|---|---|---|
| `/api/v1/...` | Có | Đây là API mà client bên ngoài gọi. |
| `/<mã>` | Có | Một mã ngắn đã phát ra thì phải chuyển hướng được mãi. |
| `/internal/...` | Không | Đường dẫn vận hành, chỉ pipeline và người vận hành gọi; xem `README.md`. |

Mọi thứ không đi qua nginx thì nằm ngoài hợp đồng: schema của Postgres, tên biến môi trường, cấu trúc dòng log, tên các số đếm ở `/metrics`, bố cục thư mục mã nguồn.
Đổi chúng có thể rất đau khi vận hành, nhưng nó không phải chuyện tương thích của một client, nên nó không tự động làm tăng số major.

Chỗ này cố tình viết ra trước bảng quy tắc bên dưới.
Không có định nghĩa hợp đồng thì câu "thay đổi có phá vỡ tương thích hay không" không kiểm được, và số major sẽ tăng theo cảm giác về độ lớn của thay đổi chứ không theo hợp đồng.

## Vì sao bắt đầu ở `v0.1.0`

Đặc tả semver dành riêng dải `0.y.z` cho giai đoạn phát triển ban đầu, và nói rõ rằng trong dải đó API công khai chưa được coi là ổn định.
Đó đúng là trạng thái của hệ này: `/api/v1/` đã chạy và đã có kiểm thử, nhưng nó chưa từng có client nào ngoài bộ kiểm thử, và nó sẽ còn nhận thay đổi.

Bản phát hành đầu vì vậy là `v0.1.0`, không phải `v1.0.0`.
Chọn `v1.0.0` sẽ là một tuyên bố sai: nó nói rằng hợp đồng ở trên đã đóng băng, trong khi #18 còn chưa làm.

`v1.0.0` là chỗ dành cho lúc `/api/v1/` thật sự bất khả xâm phạm, và ticket đặt mốc đó là #18: sau khi phiên bản hai của API tồn tại và toàn bộ kiểm thử của phiên bản một chạy xanh không sửa một dòng, thì câu "phiên bản một không đổi nữa" mới có bằng chứng.

## Khi nào tăng số nào

Tag mang tiền tố `v`, dạng `vMAJOR.MINOR.PATCH`.
Tiền tố `v` là thứ mà workflow phát hành dùng để nhận ra một tag phiên bản, nên nó bắt buộc.

| Tăng | Khi | Ví dụ trong đồ án này |
|---|---|---|
| MAJOR | Một client đang chạy đúng theo hợp đồng cũ sẽ hỏng nếu không sửa gì. | Xoá `/api/v1/` sau khi #18 đã có phiên bản hai, hoặc đổi nghĩa một mã trạng thái mà `/api/v1/` đang trả về. |
| MINOR | Thêm khả năng mới mà hợp đồng cũ vẫn nguyên vẹn. | #18: thêm `/api/v2/` với thời hạn hết hiệu lực, trong khi `/api/v1/` hành xử y như cũ. |
| PATCH | Sửa lỗi hoặc thay đổi bên trong, không thêm khả năng nào nhìn thấy được từ ngoài. | #17: thêm giá trị phiên bản do pipeline tiêm vào, không đổi hành vi nào của hai nhánh công khai. |

Trong dải `0.y.z` thì MINOR đóng luôn vai của MAJOR: một thay đổi phá vỡ tương thích ở giai đoạn này làm `0.1.0` thành `0.2.0`, không thành `1.0.0`.
Đây là hành vi mà đặc tả semver mô tả, không phải cách đọc riêng của đồ án.

Hai chỗ dễ sai, ghi ra vì cả hai đều đã suýt xảy ra ở nhóm B:

Một thay đổi lớn về lượng mã không có nghĩa là MAJOR.
#12 viết lại cả cách triển khai staging mà không đụng một byte nào của hợp đồng công khai, nên nếu nó phát hành thì nó là PATCH.

Một thay đổi rất nhỏ vẫn có thể là MAJOR.
Đổi `201` thành `200` ở đường tạo link là một ký tự, và nó làm hỏng mọi client kiểm mã trạng thái.

## Cách phát hành

Ba lệnh, chạy ở gốc kho mã, trên một commit đã nằm trên `main`.

```sh
git checkout main
git pull
git tag v0.1.0
git push origin v0.1.0
```

Không dùng `git tag -f` để dịch một tag đã đẩy.
Một tag đã đẩy là một tên đã phát ra ngoài; dịch nó đi thì image trên GHCR mang tag ấy không còn ứng với commit ấy nữa, và mắt xích truy vết đứt đúng ở chỗ nó tồn tại để không đứt.
Phát hành sai thì đẩy một tag mới với số cao hơn, và nếu cần thì đánh dấu bản cũ là pre-release trên giao diện Releases.

Cú push tag kích hoạt `.github/workflows/phat-hanh.yml`, và nó làm hai việc theo đúng thứ tự đó:

1. Gọi `.github/workflows/image.yml` với `tag` là tên tag, nên image đẩy lên GHCR là `ghcr.io/hugolee12/a2-configuration-management:v0.1.0`.
2. Tạo bản phát hành trên GitHub bằng `gh release create --generate-notes`, tức danh sách thay đổi do GitHub dựng.

Việc thứ hai chỉ chạy nếu việc thứ nhất xanh.
Ngược lại thì một lần build hỏng vẫn để lại một release trỏ tới một image không tồn tại.

Kiểm sau khi phát hành:

```sh
gh release view v0.1.0
docker pull ghcr.io/hugolee12/a2-configuration-management:v0.1.0
```

## Danh sách thay đổi sinh từ đâu

`--generate-notes` dựng danh sách từ các **pull request** đã merge kể từ bản phát hành trước, không từ các commit thô.

Tiêu chí của #14 lại nói "sinh tự động từ lịch sử commit".
Hai cách nói ấy trùng nhau trong kho này, và nó trùng vì một lý do cụ thể chứ không vì chúng gần giống nhau: `CONTRIBUTING.md` bắt merge bằng squash, nên một pull request để lại đúng một commit trên `main`.
Nếu về sau kho đổi sang merge commit thì hai tập tách nhau ngay, và lúc đó phải chọn lại chứ không coi là vẫn tương đương.

Lợi thế của việc sinh từ pull request là mỗi dòng mang theo số pull request, mà thân pull request lại chứa dòng `Closes #<số>`.
Nên từ một dòng trong danh sách thay đổi đi ngược về được yêu cầu thay đổi ban đầu, đúng chuỗi truy vết mà `CONTRIBUTING.md` dựng ra.

Không có `CHANGELOG.md` trong kho mã.
Trang Releases trên GitHub **là** changelog, và nó sinh từ dữ liệu đã có; một file chép lại cùng nội dung sẽ là bản thứ hai phải tự tay giữ cho khớp, tức đúng loại tài liệu tự lệch mà đồ án này đã ghi lại ba lần.

## Cái gì chưa nằm ở đây

**Image của bản phát hành là một lần dựng lại, không phải cùng bó byte đã qua smoke test.**
Một commit trên `main` được đóng gói hai lần: một lần bởi `ci.yml` với tag là SHA, rồi một lần nữa bởi `phat-hanh.yml` với tag là số phiên bản.
Hai image ấy cùng nội dung nguồn nhưng khác digest, vì `docker build` không cho ra byte giống nhau giữa hai lần chạy.
Kiểm được bằng cách so `RepoDigests` của hai tag; với `v0.1.0` thì digest là `94aea155…` còn image tag SHA `2cb5e88…` là `fb07ec32…`.

Hệ quả phải mang theo: câu "tag trong kho mã và tag image khớp nhau" đúng ở mức chuỗi ký tự và ở mức commit nguồn, không đúng ở mức digest.
Nghĩa là bản đem phát hành chưa từng chạy qua smoke test trên staging, dù một bản dựng từ đúng commit ấy thì có.
Đây cùng loại với món nợ đã ghi ở chênh lệch 4 của `docs/nhat-ky-pipeline.md`, và nó chữa được mà không viết lại logic build: thay vì dựng lại, gắn thêm tag phiên bản vào chính image đã có bằng `docker buildx imagetools create`.
Chưa làm vì đổi cách đóng gói sát ngày nộp đắt hơn cái nó mua, và vì `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` cấm thêm biến vào giữa một giai đoạn đang đo.

Số phiên bản hiện nối được hai thứ: tag trong kho mã và tag của image trên GHCR.
Mắt thứ ba, là bản đang chạy trên môi trường tự khai nó là bản nào, thuộc về #17; cho tới lúc ấy câu hỏi "prod đang chạy bản nào" vẫn phải trả lời bằng cách tra tag của image trong `compose.yaml` đang dùng.

Phát hành lên prod vẫn là thao tác tay theo `docs/trien-khai-thu-cong.md` cho tới khi #13 xong.
Nghĩa là một tag đã đẩy có nghĩa "bản này đã được đóng gói và đã có tên", chưa có nghĩa "bản này đang phục vụ".
