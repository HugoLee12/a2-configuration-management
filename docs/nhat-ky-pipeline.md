# Nhật ký pipeline

Bản ghi thời gian của Giai đoạn pipeline, và định nghĩa để đọc nó.

File này giữ đúng vai trò mà `docs/nhat-ky-thu-cong.md` giữ cho Giai đoạn thủ công: nó là **chỗ giữ mốc giờ thô** của giai đoạn, và nó cố ý không có cột nào chứa số đã tính sẵn.
Khác một chút ở chỗ nguồn phát sinh: mốc do GitHub Actions sinh ra và trong một thời gian còn tra lại được ở đó, nhưng khi hết hạn lưu giữ thì bảng dưới là bản duy nhất còn lại.
Việc tính bốn chỉ số DORA và dựng bảng so sánh hai giai đoạn thuộc về #22, không thuộc về file này.

Khác một điểm so với file kia, và khác vì hoàn cảnh chứ không vì lựa chọn.
Giai đoạn thủ công có một người bấm giờ, nên mốc chỉ tồn tại nếu người đó ghi lại.
Giai đoạn pipeline thì GitHub Actions ghi hộ, nên phần khó không phải là ghi mà là **chọn đúng trường** trong số nhiều trường gần giống nhau, rồi chép nó vào kho mã trước khi bên kia xoá đi.

## Vì sao chốt định nghĩa trước mẫu đo

Đây là bài học đắt nhất của #10, được áp dụng sớm một lần.

Mục nhật ký của #8 tính cột prod theo hai cách khác nhau mà không ai nhận ra, vì định nghĩa chưa bao giờ được viết ra.
Tới lúc #10 phát hiện thì cùng một mẫu cho ra 3 phút hay 1 phút tuỳ cách đọc, chênh gấp ba.
Lần đó cứu được là nhờ `docs/nhat-ky-thu-cong.md` chỉ giữ mốc thô và không có cột nào tính sẵn, nên cả năm mẫu dựng lại được theo định nghĩa mới.

Giai đoạn pipeline không có sẵn chỗ dựa đó, vì dữ liệu nằm ở phía GitHub và có hạn sử dụng.
Nếu tới #22 mới chọn trường thì log của các run đã bị xoá, và câu hỏi "lần chạy nào ứng với thay đổi nào" phải suy lại từ lịch sử chứ không đọc thẳng ra được.

## Cách đọc bảng, và mỗi mốc lấy từ trường nào

Mỗi workflow run trên `main` là một dòng.

Hôm nay một thay đổi sinh ra đúng một dòng, vì chuỗi mới có phần build.
Từ #12 và #13 trở đi, một thay đổi sẽ sinh thêm mốc của staging và của prod; lúc đó bảng nhận thêm cột chứ không đổi ý nghĩa của cột nào đang có.

Tên trường dưới đây là **tên của REST API**, không phải tên hiển thị trên giao diện Actions.
Giao diện gọi một thứ là "Total duration" và một thứ khác là "Started"; cả hai đều không phải trường nào trong bảng này.

| Cột | Nghĩa | Trường và endpoint |
|---|---|---|
| `Thay đổi` | Số issue, đọc từ dòng `Closes #<số>` của thân pull request. | `GET /repos/{owner}/{repo}/pulls` |
| `Commit` | SHA ngắn của commit squash trên `main`. | `merge_commit_sha`, cùng endpoint trên |
| `Merge` | Thời điểm pull request được merge. | `merged_at`, cùng endpoint trên |
| `Bắt đầu` | Thời điểm GitHub tạo workflow run cho cú push đó. | `created_at`, `GET /repos/{owner}/{repo}/actions/runs` |
| `Hoàn tất build` | Thời điểm job cuối cùng của run kết thúc. | lớn nhất của `completed_at`, `GET /repos/{owner}/{repo}/actions/runs/{id}/jobs` |
| `Kết luận` | Kết quả tổng của run. | `conclusion`, cùng endpoint runs |
| `Lần chạy` | Lần thử thứ mấy. Lớn hơn 1 thì bắt buộc có ghi chú. | `run_attempt`, cùng endpoint runs |

Mọi mốc giờ theo **UTC**, định dạng `YYYY-MM-DDTHH:MM:SSZ`, tức có giây, khác định dạng tới phút của `docs/nhat-ky-thu-cong.md`.

Ba lựa chọn trong bảng trên đều có một trường đối thủ trông cũng hợp lý, nên phần dưới ghi lại vì sao trường kia bị loại.

### `created_at` chứ không `run_started_at`

Trên lần chạy đầu tiên, hai trường này bằng nhau; cả hai mẫu hiện có đều xác nhận điều đó.

Chúng chỉ tách nhau khi một run bị chạy lại.
Lúc đó `run_attempt` tăng, `run_started_at` nhảy tới thời điểm của lần thử mới, còn `created_at` đứng yên ở thời điểm GitHub nhận cú push.

Chọn `run_started_at` sẽ làm mọi lần thử hỏng biến mất khỏi số đo, mà lần thử hỏng thì thuộc về lead time theo đúng quy tắc "không dừng đồng hồ ở giữa vì bất cứ lý do gì" của `docs/trien-khai-thu-cong.md`.
Đó đúng là loại lỗi mà #10 phải trả giá để học: một con số trông hợp lý, sinh ra từ một trường chọn nhầm, và không có gì báo động.

Cột `Lần chạy` có mặt trong bảng chỉ để việc chạy lại không diễn ra âm thầm.
Dòng nào có `Lần chạy` lớn hơn 1 thì phải kèm một ghi chú.

### `max(jobs[].completed_at)` chứ không `updated_at` của run

`updated_at` là "lần sửa cuối" của bản ghi run, không phải "lúc run xong".
Nó nhích thêm khi GitHub cập nhật trạng thái tổng của run sau khi job cuối đã kết thúc, và bất cứ thứ gì đụng vào run về sau cũng đẩy nó đi tiếp.

Chênh lệch quan sát được trên hai mẫu hiện có là đúng 1 giây ở cả hai:

| Run | Job cuối `completed_at` | Run `updated_at` |
|---|---|---|
| `748e69e` | `2026-07-29T13:40:33Z` | `2026-07-29T13:40:34Z` |
| `a117d94` | `2026-07-29T13:18:56Z` | `2026-07-29T13:18:57Z` |

Một giây thì không đổi kết luận nào.
Điều đổi kết luận là `updated_at` không có định nghĩa gắn với công việc, nên nó không nói được câu "thay đổi này xong lúc mấy giờ", còn `completed_at` của job thì nói được.

### Run trên `main` chứ không run của pull request

Mỗi thay đổi để lại **hai** lần chạy, một trên pull request và một trên `main` sau khi squash.
Đây là món nợ mà pull request #68 để lại cho ticket này, và nó được trả ở đây.

Lần chạy được tính là lần chạy có `event` bằng `push`, `head_branch` bằng `main`, và `head_sha` bằng `merge_commit_sha` của pull request.

Hai lý do, cả hai đều nhìn từ phía phép so sánh chứ không từ phía tiện lợi.

Lần chạy trên pull request xảy ra **trước** mốc `Merge`, nên tính nó vào lead time sẽ cho ra một khoảng âm hoặc một khoảng chứa công việc làm trước khi thay đổi vào trunk.
Giai đoạn thủ công đo từ lúc thay đổi đã nằm trên `main`, và bốn cột của nó không có chỗ nào chứa công việc trước merge.

Lý do thứ hai nặng hơn: commit của pull request không phải commit sẽ được triển khai.
Squash sinh ra một commit mới trên `main`, và đó mới là commit mà #12 và #13 sẽ đem lên staging rồi prod.
Tag của image cũng đi theo commit đó, nên đây là chỗ duy nhất mà tag, nội dung và số issue cùng trỏ về một điểm.

## Tương ứng với Giai đoạn thủ công

| Cột của `docs/nhat-ky-thu-cong.md` | Đối ứng ở file này | Có tương ứng một một không |
|---|---|---|
| `Thay đổi` | `Thay đổi` | Có |
| `Commit` | `Commit` | Có |
| `Merge` | `Merge` | Có, cùng một trường của cùng một API |
| `Bắt đầu` | `Bắt đầu` | Gần đúng, xem chênh lệch 2 và 3 |
| `Hoàn tất` | `Hoàn tất build`, và sau #12 với #13 là mốc của bước triển khai | Chưa, xem chênh lệch 4 |
| `Môi trường` | chưa có, vì chưa có bước triển khai nào tự động | Chưa |
| `Sự cố` | `Kết luận` | Không, xem chênh lệch 5 |

Năm chênh lệch dưới đây phải mang theo mỗi khi so hai giai đoạn.
Ghi ra chứ không chọn đại một trường cho khớp, theo đúng ràng buộc của #67.

**1. Độ phân giải lệch nhau 60 lần.**
`docs/nhat-ky-thu-cong.md` ghi tới phút, Actions trả về tới giây.
Mọi khoảng ngắn hơn một phút của Giai đoạn thủ công đều rơi về 0, và mẫu #8 với cột prod bằng 0 phút là một trường hợp như vậy.
Giai đoạn pipeline không có sàn đó, nên khi so hai con số nhỏ thì con số của giai đoạn trước mang sai số lượng tử hoá tới ±1 phút còn con số của giai đoạn này thì không.
Cách xử lý thuộc về #22; ở đây chỉ ghi rằng chênh lệch này tồn tại và không khử được.

**2. Cột `Chờ` đo hai hiện tượng khác nhau.**
Ở Giai đoạn thủ công, `Bắt đầu` trừ `Merge` là khoảng thay đổi nằm trên `main` chờ một người rảnh tay, và nó dài từ 1 tới 9 phút.
Ở Giai đoạn pipeline, cùng phép trừ ấy cho ra 8 giây và 4 giây trên hai mẫu hiện có, và nó đo độ trễ điều phối của GitHub chứ không đo sự có mặt của con người.
Hai con số vẫn so được, nhưng câu kết luận phải nói rằng thứ biến mất là **việc phải chờ người**, chứ không phải rằng máy chờ nhanh hơn người 60 lần.

**3. `Bắt đầu` của pipeline chứa một khoảng mà giai đoạn trước không có.**
Từ lúc run được tạo tới lúc một runner nhận job còn một quãng nữa, đọc được bằng `started_at` của job đầu trừ `created_at` của run.
Trên run `748e69e` quãng đó là 10 giây, từ `13:39:17Z` tới `13:39:27Z`.
Người thao tác tay thì không có quãng này: `Bắt đầu` của họ là lúc gõ ký tự đầu tiên, tức công việc bắt đầu ngay.
Quãng chờ runner nằm trong đồng hồ, đúng theo quy tắc không dừng đồng hồ, nhưng nó là chi phí riêng của giai đoạn này và phải nói ra khi trích số.

**4. Thứ tự build và kiểm thử bị đảo, và image đẩy đi không phải image đã kiểm.**
Giai đoạn thủ công build image ở bước 3 rồi mới chạy kiểm thử ở bước 4, nên `Hoàn tất` của nó là "image này đã qua kiểm thử".
Pipeline hiện tại chạy `kiem-tra` trước, trong đó `compose --build` dựng một image để có stack mà kiểm; rồi `dong-goi` dựng lại từ đầu ở một job khác và đẩy image đó đi.
Hai image cùng nội dung nên rủi ro thấp, nhưng `Hoàn tất build` của file này là "một image cùng nội dung đã được đẩy", không phải "image đã được kiểm".
Đây là món nợ đã ghi ở pull request #68; nó không sửa được bằng cách đổi định nghĩa, nên nó được ghi lại ở đây thay vì bị làm mờ đi.

**5. Cột `Sự cố` dịch chỗ, và nó dịch theo hướng làm đẹp số liệu.**
`docs/trien-khai-thu-cong.md` định nghĩa phát hành thất bại là **đỏ ở prod**; đỏ ở staging là bắt được lỗi trước khi tới người dùng nên không tính.
Ở Giai đoạn thủ công, không có gì chặn giữa merge và prod, nên một thay đổi hỏng đi thẳng tới prod và vào thẳng change failure rate; cả hai lần hỏng của giai đoạn đó đều như vậy.
Ở Giai đoạn pipeline, `kiem-tra` chạy trên pull request và chặn merge, nên phần lớn lỗi cùng loại sẽ chết **trước** mốc `Merge` và không để lại dòng nào trong bảng dưới.
Nghĩa là change failure rate của giai đoạn này sẽ thấp một phần vì pipeline thật sự tốt hơn, và một phần vì tập lỗi bị chặn ở chỗ khác.
Không tách được hai phần đó bằng dữ liệu quan sát, và đó chính là lý do #21 tồn tại: chỉ có tiêm lỗi có kiểm soát mới cho một mẫu số so được.

## Công thức

Cùng khuôn với `docs/so-lieu-giai-doan-thu-cong.md`, để #22 không phải dịch qua lại giữa hai cách viết.

| Đại lượng | Công thức | Ý nghĩa |
|---|---|---|
| Chờ | `Bắt đầu` trừ `Merge` | Độ trễ điều phối, xem chênh lệch 2. |
| build | `Hoàn tất build` trừ `Bắt đầu` | Chi phí kiểm thử và đóng gói, gồm cả thời gian chờ runner. |
| staging | `Hoàn tất` của bước triển khai staging trừ `Hoàn tất build` | Chưa tồn tại, sẽ có ở #12. |
| prod | `Hoàn tất` của bước triển khai prod trừ `Hoàn tất` của bước staging | Chưa tồn tại, sẽ có ở #13. |
| **Lead time** | `Hoàn tất` của bước triển khai prod trừ `Merge` | Lead time for changes theo DORA, cùng định nghĩa với Giai đoạn thủ công. |

Bốn đại lượng đầu cộng lại đúng bằng lead time, giống hệt đẳng thức `chờ + staging + prod = lead time` của giai đoạn trước.
Đẳng thức này không phải chuyện thẩm mỹ: nó là thứ khiến bảng tự kiểm được, và nó là lý do cột prod được trừ từ mốc trước nó chứ không từ `Bắt đầu`.

**Lead time của Giai đoạn pipeline chưa tính được, và sẽ chưa tính được cho tới khi #13 xong.**
Hôm nay chuỗi dừng ở `Hoàn tất build`, vì triển khai vẫn làm tay theo `docs/trien-khai-thu-cong.md`.
Mọi con số trích từ bảng dưới trong khoảng này là số của **một phần** quy trình, và trích nó như lead time sẽ so một nửa của giai đoạn này với trọn vẹn giai đoạn kia.

## Lệnh trích mốc thô

Chạy trong PowerShell ở gốc kho mã, cần `gh` đã đăng nhập.
Không cần `jq`: `gh` mang sẵn một bản jq bên trong và dùng qua cờ `--jq`.

```powershell
$merge = @{}
gh pr list --state merged --base main --limit 50 --json mergeCommit,mergedAt,body `
  --jq '.[] | [.mergeCommit.oid, .mergedAt, ((.body // "") | [scan("Closes #([0-9]+)")] | flatten | first // "-")] | @tsv' |
  ForEach-Object { $sha, $luc, $issue = $_ -split "`t"; $merge[$sha] = @($issue, $luc) }

gh api "repos/{owner}/{repo}/actions/runs?event=push&branch=main&status=completed&per_page=50" `
  --jq '.workflow_runs[] | [.id, .head_sha, .created_at, .conclusion, .run_attempt] | @tsv' |
  ForEach-Object {
    $id, $sha, $batdau, $ketluan, $lan = $_ -split "`t"
    $xong = gh api "repos/{owner}/{repo}/actions/runs/$id/jobs" --jq '[.jobs[].completed_at] | max'
    $pr = $merge[$sha] ?? @("-", "-")
    "#$($pr[0])`t$($sha.Substring(0,7))`t$($pr[1])`t$batdau`t$xong`t$ketluan`t$lan"
  }
```

Đầu ra là bảy cột đúng thứ tự của bảng dưới, ngăn nhau bằng tab, mới nhất trước, nên chép sang bảng thì không phải đảo cột nào.

Lệnh đã chạy thật lúc chốt ticket này, và đầu ra nguyên văn là:

```text
#69	748e69e	2026-07-29T13:39:09Z	2026-07-29T13:39:17Z	2026-07-29T13:40:33Z	success	1
#11	a117d94	2026-07-29T13:17:36Z	2026-07-29T13:17:40Z	2026-07-29T13:18:56Z	success	1
```

Ba chi tiết trong khối lệnh là lựa chọn chứ không phải mặc định.

`status=completed` loại các run đang chạy, vì một run chưa xong sẽ cho cột `Hoàn tất build` một giá trị chưa phải mốc kết thúc.

Số issue lấy từ dòng `Closes #<số>` của thân pull request, tức đúng mắt xích truy vết mà `CONTRIBUTING.md` quy định.
Dòng nào hiện `#-` là một cú push vào `main` không truy được về pull request nào, và những dòng đó **cố ý được giữ lại** chứ không lọc đi: `CONTRIBUTING.md` có mô tả một lối push thẳng hợp lệ, nên `#-` là thứ cần nhìn thấy để kiểm chứ không phải rác cần giấu.

Giới hạn 50 là trần cứng ở cả hai lệnh.
Giai đoạn pipeline sẽ không tới ngần ấy thay đổi, nhưng nếu có thì các mẫu cũ nhất rơi ra ngoài mà không báo gì, nên khi số dòng trích được chạm 50 thì phải nâng `--limit` và `per_page` chứ đừng đọc tiếp.

Lệnh này chỉ **trích**, không ghi.
Bảng dưới vẫn phải chép tay, vì đó là bản duy nhất sống lâu hơn chính sách lưu giữ của GitHub.

## Cái gì biến mất theo thời gian

Đây là chỗ Giai đoạn pipeline dễ mất dữ liệu hơn giai đoạn trước, dù trông thì có vẻ ngược lại.

**Log của job bị xoá theo chính sách lưu giữ.**
Mặc định là 90 ngày, và với kho công khai thì 90 ngày cũng là mức trần không nâng được.
Con số đó là trần chứ không phải cam kết: thiết lập ở mức kho, tổ chức hay doanh nghiệp đều hạ nó xuống được, nên khi cần một mốc chắc chắn thì phải tra thiết lập thật của kho chứ không trích lại con số này.
Đồ án nộp trước hạn đó, nhưng mọi câu trả lời dạng "vì sao bước này chậm" hay "test nào đỏ" đều nằm trong log, nên cái gì cần cho báo cáo thì phải chép ra lúc còn đọc được.

**Mốc thô thì phải chép vào kho mã.**
Bảng dưới tồn tại chính vì lý do này.
Bản ghi JSON của một workflow run sống lâu hơn log của nó, nhưng không có cam kết nào nói nó sống mãi, và một mốc giờ mất đi thì không dựng lại được bằng cách suy luận.

**Bằng chứng của một lần chạy đỏ mong manh hơn bằng chứng của một lần chạy xanh.**
Lần chạy đỏ cố ý của #11, ở commit `7269971`, là bằng chứng cho tiêu chí "pull request có kiểm thử trượt thì không merge được".
Nó không nằm trên `main`, vì squash merge không đưa các commit đó lên trunk, nên nó chỉ còn sống trong lịch sử Actions và trong ref của pull request #68.
Kết luận đọc được từ nó đã được chép vào mục nhật ký của #11; bản thân lần chạy thì không cứu được.

**Image trên GHCR nằm ngoài kho mã.**
Tag là SHA đầy đủ của commit, nên mối nối giữa image và thay đổi vẫn dựng lại được từ bảng dưới ngay cả khi image đã bị xoá.
Chiều ngược lại thì không: một image mất tag là một image không truy được nguồn.

## Bảng

Bảng cố ý không có cột nào chứa số phút đã tính sẵn, đúng kỷ luật đã cứu Giai đoạn thủ công một lần ở #10.

| Thay đổi | Commit | Merge | Bắt đầu | Hoàn tất build | Kết luận | Lần chạy |
|---|---|---|---|---|---|---|
| #11 | `a117d94` | 2026-07-29T13:17:36Z | 2026-07-29T13:17:40Z | 2026-07-29T13:18:56Z | success | 1 |
| #69 | `748e69e` | 2026-07-29T13:39:09Z | 2026-07-29T13:39:17Z | 2026-07-29T13:40:33Z | success | 1 |

## Ghi chú

### Hai dòng đầu không phải mẫu đo của giai đoạn

Cả hai dòng trên đều là thay đổi chỉ chạm tài liệu và cấu hình, không phải thay đổi cỡ chuẩn theo cách `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` dùng từ này.

Dòng `#11` còn đặc biệt hơn: nó là lần chạy của chính commit dựng nên pipeline, tức lần đầu tiên workflow chạy trên `main`.
Nó ở đây để chứng minh các trường trích được thật, không phải để vào phép so sánh.

Mẫu đo thật của Giai đoạn pipeline chỉ bắt đầu khi có thay đổi chạm `services/` đi qua chuỗi đầy đủ, và chuỗi đó chưa đầy đủ cho tới #13.

### Một yêu cầu còn nợ từ Giai đoạn thủ công

Giai đoạn pipeline cần ít nhất một thay đổi chạm `infra/postgres/init.sql`.
Cả hai lần phát hành thất bại của giai đoạn trước đều truy về đúng một thay đổi schema, nên không có mẫu schema nào ở giai đoạn này thì change failure rate của hai bên không so được.
Yêu cầu này đã ghi ở `docs/so-lieu-giai-doan-thu-cong.md` và chưa ticket nào nhận.
