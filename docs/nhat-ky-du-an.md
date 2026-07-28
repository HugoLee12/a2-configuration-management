# Nhật ký dự án

File này ghi lại từng chặng của đồ án A2 theo lối kể chuyện: việc gì đã làm, vì sao làm, nó phục vụ mục nào của Chương 25 hoặc ô nào của Rubric, và bằng chứng nằm ở đâu.

Mục đích là để tuần 15 viết báo cáo và dựng slide thì lấy thẳng từ đây, thay vì phải bới lại lịch sử commit và các issue đã đóng.
Vì vậy mỗi mục viết cho người chưa biết gì về việc đó, không viết theo lối gạch đầu dòng cho người đã biết.

Xếp theo thứ tự thời gian, mục mới thêm vào cuối file.
Mỗi ticket đóng lại thì thêm một mục, viết ngay lúc còn nhớ.

## File này khác Nhật ký thủ công ở chỗ nào

Đồ án có hai loại nhật ký, đừng lẫn.

**Nhật ký thủ công** (#4, chưa lập) là dữ liệu số: mỗi lần build và triển khai tay ghi thời điểm bắt đầu, thời điểm xong, các bước phải làm.
Nó là dữ liệu nghiên cứu để tính lead time của Giai đoạn thủ công, phải ghi ngay lúc làm vì không dựng lại được sau.

**Nhật ký dự án** là file này, ghi chú tường thuật để viết báo cáo.
Nó không chứa số đo nào, và không thay thế được Nhật ký thủ công.

---

## 2026-07-28 - Bảo vệ nhánh main và quy ước truy vết thay đổi

**Ticket**: #2 (A1), #24 (A4)
**Pull request**: #23, #25
**Phục vụ**: mục 25.3 Change management của báo cáo; đồng thời là điều kiện cần để tính lead time cho cả hai giai đoạn

### Ticket đòi cái gì

Mọi thay đổi vào nhánh `main` phải đi qua pull request, và mỗi pull request phải nối được về một issue.

Đây là ticket về quy trình, không phải về tính năng, nên sau khi làm xong repo vẫn chưa có dòng mã nào của Hệ thống demo.
Nó tương ứng với ba yêu cầu số 8, 9, 10 trong danh sách của #1.

Một điều kiện phụ nhưng quyết định cách làm: nhánh `main` bắt buộc pull request nhưng **không** được yêu cầu người duyệt.
Lý do là đồ án do một người thực hiện, mà GitHub không cho tự duyệt pull request của chính mình, nên bật yêu cầu người duyệt sẽ tự khoá tác giả lại.

### Đã thay đổi những gì

Đúng hai thứ.

Thứ nhất, bật branch protection cho `main` trên GitHub.
Cấu hình: bắt buộc pull request, số approval yêu cầu là 0, áp dụng cả với chủ repo (`enforce_admins`), chặn force push, chặn xoá nhánh.
Cố ý **không** gắn required status check nào, vì Giai đoạn thủ công không được có pipeline theo `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md`.
Trước thay đổi này, `main` nhận push thẳng không điều kiện.

Thứ hai, viết mới `CONTRIBUTING.md` ở gốc repo, ghi lại quy ước: một issue cho một thay đổi, nhánh đặt tên `<số-issue>-<mô-tả-ngắn>` và sống ngắn, pull request phải có dòng `Closes #<số>`, tiêu đề commit viết tiếng Việt có dấu dạng câu mệnh lệnh, merge bằng squash để mỗi issue tương ứng đúng một commit trên trunk.
File cũng nói rõ không có nhánh `develop`, không có nhánh `release`, vì chiến lược trunk-based phải cố định xuyên suốt cả hai giai đoạn.

### Vì sao việc này thuộc về đề tài

Chương 25 của Sommerville có bốn mục, và mục 25.3 Change management nói về việc kiểm soát yêu cầu thay đổi: một thay đổi phải được đề xuất, ghi nhận, xem xét, rồi mới vào sản phẩm.

Vấn đề là nếu báo cáo chỉ viết "đồ án có áp dụng change management" thì đó là chép lại định nghĩa trong sách, và Rubric không cho điểm kiểu đó.
Cái vừa dựng biến câu đó thành thứ chụp màn hình được, vì bây giờ mỗi thay đổi đi trọn một vòng đời quan sát được từ bên ngoài:

```
issue mô tả yêu cầu
  -> nhánh ngắn mang số issue
  -> pull request tham chiếu ngược về issue
  -> merge vào main
  -> nhánh bị xoá, issue tự đóng
```

Quan trọng hơn là vòng này bị **ép buộc** chứ không phải tự giác, và có bằng chứng cho điều đó ở phần dưới.
Khác biệt giữa "tôi có thói quen mở pull request" và "hệ thống không cho tôi làm khác" chính là nội dung của 25.3.

Còn một tác dụng thứ hai, cho phần đo lường.
Chỉ số lead time của DORA là khoảng thời gian từ lúc commit tới lúc thay đổi chạy trên môi trường thật, nên mỗi thay đổi phải có mốc bắt đầu và mốc kết thúc rõ ràng thì mới tính được.
Issue mở lúc nào, pull request merge lúc nào, GitHub ghi sẵn hết và trích ra được bằng API.
Nếu để push thẳng vào `main` thì không có mốc nào cả, và sang Giai đoạn pipeline sẽ không có gì cùng dạng để so sánh.
Vì vậy ticket này phải xong **trước** khi bắt đầu đếm giờ của Giai đoạn thủ công.

### Chuyện đáng kể lại

Lúc nghiệm thu có một tình huống ban đầu tưởng là lỗi, hoá ra là vật liệu tốt cho báo cáo.

Phép thử đầu tiên là đẩy commit của nhánh làm việc thẳng vào `main`, và nó **không** bị chặn.
Nhìn qua thì giống như branch protection không có hiệu lực.

Thật ra protection vẫn chạy đúng.
Commit được đẩy khi đó đang là head của pull request #23 đang mở, và pull request đó đã thoả mọi điều kiện của rule vì số approval yêu cầu là 0 và không có required status check nào.
Trong tình huống ấy GitHub hiểu cú push là "merge pull request này" chứ không phải "push thẳng", nên nhận, rồi ghi nhận #23 sang trạng thái merged.

Phép thử đúng phải dùng một commit không dính pull request nào.
Làm lại bằng một commit rỗng thì bị từ chối ngay:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)
```

Kết luận dùng được cho báo cáo: một rule bảo vệ nhánh ràng buộc **đường đi** của một thay đổi, chứ không phải là một cái khoá tuyệt đối lên nhánh.
Ngoại lệ ở trên không phá quy ước, vì thay đổi vẫn đi qua một pull request nối về issue, nó chỉ khiến pull request bị merge mà không qua nút Merge trên giao diện.
Nhận xét này về sau được ghi thẳng vào `CONTRIBUTING.md` qua #24, để tài liệu không khẳng định sai.

Phát hiện được chuyện này là vì phép thử đầu tiên bị thiết kế ẩu, không phải vì có chủ đích tìm.

### Dẫn chứng

- Log nghiệm thu đầy đủ, gồm JSON cấu hình protection và thông báo `GH006`: [comment trên #2](https://github.com/HugoLee12/a2-configuration-management/issues/2#issuecomment-5100951840)
- Vòng đời thay đổi thứ nhất: issue #2, pull request #23, merged lúc `2026-07-28T06:51:22Z`
- Vòng đời thay đổi thứ hai: issue #24, pull request #25, merge bằng squash rồi xoá nhánh
- Quy ước thành văn: `CONTRIBUTING.md`

### Đang ở đâu sau mục này

Repo có tài liệu bối cảnh, bốn ADR, quy ước truy vết thay đổi, và `main` được bảo vệ.
Chưa có dòng nào của ba service TypeScript.

Ticket tiếp theo là #3 (A2), đã hết blocker.

---

## 2026-07-28 - Lập nhật ký dự án và bắt phiên sau đọc được quy ước

**Ticket**: #26 (A5), #28 (A6), và chính mục này ghi trong #30 (A7)
**Pull request**: #27, #29
**Phục vụ**: không thuộc mục nào của Chương 25, đây là hạ tầng để viết báo cáo ở tuần 15 và để quy ước vừa dựng không bị bỏ quên

### Vấn đề

Sau khi #2 và #24 xong thì repo đã có quy trình, nhưng chưa có chỗ nào ghi **vì sao** một việc được làm và **nó phục vụ mục nào** của đề tài.

Issue và pull request ghi được cái gì đã đổi.
ADR ghi được quyết định kiến trúc và các phương án đã loại.
Phần tường thuật ở giữa thì không nằm ở đâu cả, mà đó lại đúng là thứ cần cho báo cáo 12-15 trang và cho slide.

Để nguyên thì tới tuần 15 phải dựng lại mạch chuyện từ lịch sử commit và các issue đã đóng, đúng vào lúc bận nhất, và những chi tiết kiểu "phép thử đầu tiên sai ở chỗ nào" sẽ mất hẳn vì không ai nhớ nổi sau vài tuần.

Vấn đề thứ hai lộ ra ngay sau đó: `CLAUDE.md` là file mọi phiên làm việc đọc đầu tiên, mà nó không nhắc tới `CONTRIBUTING.md` lẫn nhật ký.
Một quy ước không được nhắc trong file luật thì trên thực tế là không tồn tại.

### Đã thay đổi những gì

Ba thứ, qua hai pull request.

`docs/nhat-ky-du-an.md`: file này, xếp theo thứ tự thời gian, mục mới thêm vào cuối, mỗi ticket đóng thì ghi một mục.
Viết theo lối giải thích cho người chưa biết gì về việc đó, vì mục tiêu là lấy thẳng làm nội dung báo cáo chứ không phải để tra cứu.

`CONTEXT.md`: thêm thuật ngữ **Nhật ký dự án** vào từ điển.

`CLAUDE.md`: thêm hai ràng buộc, mọi thay đổi đi qua issue rồi pull request theo `CONTRIBUTING.md`, và ticket đóng thì thêm một mục vào nhật ký.
Chỉ trỏ tới hai file kia chứ không chép nội dung sang, để sau này sửa một chỗ không phải nhớ sửa chỗ thứ hai.

### Chuyện đáng kể lại

**Hai loại nhật ký suýt bị lẫn.**
Đồ án đã có sẵn khái niệm **Nhật ký thủ công** (#4, chưa lập): bản ghi thời điểm bắt đầu và kết thúc của từng lần build và triển khai tay, là dữ liệu số để tính lead time của Giai đoạn thủ công.
Cái vừa lập tên gần giống hệt nhưng bản chất khác hẳn, nó là ghi chú tường thuật và không chứa số đo nào.
Hai thứ này mà lẫn thì hỏng cả hai: nhật ký nghiên cứu bị pha văn xuôi, còn ghi chú tường thuật bị ép vào khuôn bảng biểu.
Vì vậy phải đưa thuật ngữ mới vào `CONTEXT.md` ngay, chứ không để tự phân biệt bằng trí nhớ.

**Repo vi phạm luật do chính nó vừa merge.**
Pull request #29 đưa vào `CLAUDE.md` câu "ticket đóng thì thêm một mục vào nhật ký", nhưng lúc nó được merge thì #26 và #28 đã đóng mà chưa có mục nào.
Phát hiện ngay nên sửa được bằng chính ticket #30 này.

Chuyện nhỏ nhưng đúng bài: một quy tắc chỉ có giá trị khi có cơ chế phát hiện lúc nó bị vi phạm.
Ở đây cơ chế đó vẫn là mắt người, và đó là hạn chế thật của Giai đoạn thủ công, cần nêu ra khi báo cáo bàn về giới hạn của phép đo.

**Tài liệu cũng là configuration item.**
Bốn thay đổi đầu tiên của repo đều không đụng tới dòng mã nào, nhưng tất cả đều đi qua đúng quy trình issue, nhánh, pull request, merge.
Đây là minh hoạ trực tiếp cho ý của mục 25.1: quản lý cấu hình đặt dưới kiểm soát mọi sản phẩm của dự án chứ không riêng mã nguồn.

### Dẫn chứng

- `docs/nhat-ky-du-an.md`, `CONTEXT.md` mục Nhật ký dự án, `CLAUDE.md` mục Ràng buộc phải tôn trọng
- Vòng đời thay đổi: issue #26 với pull request #27, issue #28 với pull request #29, issue #30 với mục này

### Đang ở đâu sau mục này

Phần dựng nền quy trình khép lại.
Repo có: tài liệu bối cảnh và từ điển thuật ngữ, bốn ADR, quy ước truy vết thay đổi có hiệu lực cưỡng chế, nhật ký dự án, và `main` được bảo vệ.

Vẫn chưa có dòng nào của ba service TypeScript.
Ticket tiếp theo là #3 (A2), chỗ bắt đầu viết mã của Hệ thống demo.

---

## 2026-07-28 - Đường đi đầu tiên xuyên toàn hệ, rút gọn link và chuyển hướng

**Ticket**: #3 (A2)
**Pull request**: #32
**Phục vụ**: ô Kiến trúc 25% của Rubric; mục 25.2 System building và 25.4 Release management của báo cáo; đồng thời là vật thể để Giai đoạn thủ công có cái mà triển khai tay

### Ticket đòi cái gì

Một đường đi hoàn chỉnh xuyên toàn bộ hệ: người dùng gửi một địa chỉ dài, nhận về mã ngắn, truy cập mã ngắn thì được chuyển hướng tới địa chỉ gốc.

Điểm quan trọng là chữ "xuyên toàn bộ".
Đây là kiểu ticket mà tài liệu thường gọi là tracer bullet: thay vì làm xong hẳn một tầng rồi mới sang tầng sau, ta bắn một viên đạn mỏng chạm hết mọi tầng cùng lúc, để biết các tầng có ghép được với nhau không.
Vì vậy nó phải chạm cơ sở dữ liệu, service quản lý vòng đời link, service chuyển hướng, nginx làm cửa vào, và bộ kiểm thử phải đi qua đúng cửa đó chứ không được đi tắt.

Đây cũng là ticket đầu tiên của repo có mã nguồn.
Bốn ticket trước đó đều chỉ đụng tới tài liệu và cấu hình.

### Đã thay đổi những gì

Hai service TypeScript trong `services/`.
Service `link` nhận `POST /api/v1/links`, sinh một mã bảy ký tự, ghi vào Postgres, trả về mã và địa chỉ ngắn.
Service `redirect` nhận `GET /<mã>`, tra Postgres, trả 302 tới địa chỉ gốc hoặc 404 nếu không có mã đó.

Hai service này không gọi nhau; cả hai cùng nói chuyện với Postgres.
Việc gọi nhau qua mạng sẽ xuất hiện ở #5, khi service thống kê ra đời.

`infra/nginx/nginx.conf` dựng nginx làm cửa vào duy nhất, `/api/` đi tới service link, mọi đường dẫn còn lại đi tới service redirect.
`infra/postgres/init.sql` tạo bảng `links`, được Postgres tự chạy lúc khởi tạo volume lần đầu.

Một `Dockerfile` duy nhất ở gốc cho cả hai service; container nào chạy service nào là do `command` trong `compose.yaml` quyết định.
Một `compose.yaml` duy nhất, chạy thành hai môi trường bằng cách đổi file trong `env/`.
Staging ở cổng 8081, prod ở cổng 8080, mỗi môi trường một project name của Compose nên tách riêng cả container, network lẫn volume dữ liệu.

`tests/rut-gon-va-chuyen-huong.test.ts` là bộ kiểm thử hộp đen, chỉ gửi HTTP vào nginx bằng `fetch` có sẵn của Node, không import dòng mã nào của service và không mở kết nối nào tới Postgres.

### Vì sao việc này thuộc về đề tài

Nghiệp vụ ở đây gần như bằng không, và đó là chủ ý, xem `docs/adr/0002-he-thong-demo-va-stack.md`.
Cái đáng nói không phải dịch vụ rút gọn URL, mà là từ lúc này trở đi đề tài có một **configuration item** thật để quản lý.

Mục 25.2 System building của Sommerville nói về việc biến mã nguồn thành một hệ chạy được, và nhấn mạnh rằng quá trình đó phải lặp lại được chứ không phụ thuộc vào máy của ai.
Trước ticket này, câu đó trong báo cáo sẽ không có gì để chỉ vào.
Bây giờ nó chỉ vào được một lệnh duy nhất dựng trọn cả stack, và cùng một lệnh ấy chỉ đổi file env là ra môi trường khác.

Mục 25.4 Release management thì cần khái niệm "một thay đổi đi từ nơi thử tới nơi thật".
Hai môi trường staging và prod tách biệt hoàn toàn là hình hài tối thiểu của đường đi đó.
Chúng chưa được nối bằng bất cứ thứ gì tự động, và đúng ra là chưa được phép nối, vì `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` cấm dựng pipeline ở giai đoạn này.

Còn một tác dụng nữa, thuộc về phần đo lường.
Từ ticket sau, mỗi thay đổi sẽ được triển khai tay lên hai môi trường này và bấm giờ.
Không có hệ để triển khai thì không có gì để bấm giờ, nên đây là điều kiện cần của toàn bộ Giai đoạn thủ công.

### Chuyện đáng kể lại

**Bộ kiểm thử xanh ngay lần đầu, và đó là cái bẫy.**

Dựng stack lên, chạy kiểm thử, bốn trên bốn xanh trên cả staging lẫn prod.
Nhìn thì xong rồi.

Lúc soát lại mới lộ ra một lỗi mà kiểu chạy đó không bao giờ chạm tới được.
Trong `nginx.conf` viết `proxy_pass http://link:3000` là cách thông thường nhất, nhưng nginx phân giải tên `link` thành địa chỉ IP **đúng một lần** lúc nạp config, rồi giữ nguyên địa chỉ ấy mãi mãi.
Docker thì cấp lại IP mỗi lần container được dựng lại.
Nghĩa là: dựng mới toàn bộ thì chạy tốt, còn triển khai lại chỉ một service thì nginx vẫn gõ cửa địa chỉ cũ và trả 502.

Tái hiện được: dừng service `link`, cho một container khác chiếm mất địa chỉ cũ, bật `link` lên lại thì nó nhận IP mới, và nginx trả về đúng như dự đoán.

```
HTTP/1.1 502 Bad Gateway
nginx/1.29.8
```

Chỗ này đáng kể lại vì hai lý do.

Thứ nhất, Giai đoạn thủ công sắp tới sẽ triển khai lại tám tới mười lần, tức là lỗi này chắc chắn bung ra, và bung ra vào đúng lúc đang bấm giờ.
Nó sẽ không hỏng theo kiểu dễ thấy mà theo kiểu "lúc được lúc không", tuỳ Docker có tình cờ cấp lại đúng IP cũ hay không.
Một lỗi ngắt quãng như vậy chen vào giữa dữ liệu đo là thứ tệ nhất có thể xảy ra với phép so sánh hai giai đoạn.

Thứ hai, #13 (blue-green cho prod) về bản chất chính là "nginx trỏ lại sang đám container vừa dựng".
Nếu nginx không phân giải lại tên thì blue-green không thể hoạt động, và lúc đó sẽ rất khó lần ra nguyên nhân vì triệu chứng nằm ở tầng khác hẳn.

Cách sửa là dùng DNS nội bộ của Docker kèm một biến trong `proxy_pass`, vì nginx chỉ chịu phân giải lại khi đích đến có chứa biến.
Kiểm chứng bằng cách ép cả hai service đổi IP rồi chạy lại kiểm thử mà không đụng vào nginx.

**Cổng gác readiness báo xanh cho một hệ đấu sai.**

Bộ kiểm thử có một bước chờ stack sẵn sàng trước khi chạy, và bước đó ban đầu chỉ hỏi "gọi một mã không tồn tại có trả về 404 không".
Vấn đề là 404 quá dễ có: trang lỗi mặc định của nginx cũng 404, service bị đấu nhầm cửa cũng 404.
Nên cái cổng gác ấy xác nhận một thứ nó không hề quan sát được.

Đổi sang bắt đúng mã 400 mà service `link` trả về khi thiếu trường `url`.
Mã 400 chỉ ra được nếu request đã đi qua nginx, tới đúng service link, và service ấy đã đọc được thân JSON.
Ngay sau khi đổi, chính cổng gác này bắt được một lần hỏng thật, khi nginx chưa nạp config mới.

**Sửa `nginx.conf` xong chạy lại lệnh dựng thì nginx không nạp config mới.**

File này được gắn vào container theo kiểu bind mount, nên nội dung trên đĩa đổi ngay, nhưng nginx đã đọc config vào bộ nhớ từ lúc khởi động.
Compose thì chỉ dựng lại container khi **định nghĩa** service đổi, mà định nghĩa ở đây không đổi, nên nó để yên.
Phải `docker compose restart nginx`.

Đã ghi vào `README.md`, vì #4 sắp viết quy trình triển khai tay và đây đúng là loại bước dễ quên rồi ngồi tìm mãi không ra.

**Bài học chung của cả ba chuyện trên.**
Cả ba đều là hỏng ở tầng kết nối giữa các thành phần, không phải hỏng trong mã của thành phần nào.
Kiểm thử đơn vị của từng service sẽ xanh hết, vì mỗi service đều đúng.
Đây là lý do ticket đòi kiểm thử phải đi qua nginx thay vì gọi thẳng service, và cũng là lý do đáng nhắc trong báo cáo khi bàn về việc chọn tầng kiểm thử.

### Một quyết định vượt ra ngoài tiêu chí nghiệm thu

Đường dẫn được đặt là `/api/v1/links` chứ không phải `/api/links`, dù ticket không đòi.

Lý do là `docs/adr/0002-he-thong-demo-va-stack.md` đã chốt hệ quả rằng nghiệp vụ phải có chỗ tự nhiên cho API v1 và v2 chạy song song, và #18 sẽ dùng đúng chỗ đó.
Thêm số phiên bản bây giờ tốn ba ký tự, thêm về sau thì phải phá đường dẫn cũ, tức là tự tạo ra một thay đổi gãy tương thích ngay trong đề tài nói về release management.

### Dẫn chứng

- Mã nguồn: `services/link/`, `services/redirect/`, `infra/nginx/nginx.conf`, `compose.yaml`, `Dockerfile`
- Cách chạy và cách kiểm thử: `README.md`
- Vòng đời thay đổi: issue #3 với pull request #32
- Nghiệm thu tách biệt hai môi trường: mã tạo trên staging trả 404 khi gọi ở prod, volume là `a2-staging_postgres-data` và `a2-prod_postgres-data`

### Đang ở đâu sau mục này

Hệ thống demo đã chạy được đầu cuối trên hai môi trường, dựng bằng một lệnh mỗi bên, có bộ kiểm thử hộp đen đi qua nginx.
Vẫn chưa có service thứ ba, chưa có endpoint sức khoẻ, chưa có metrics, và cố ý chưa có pipeline.

Ticket tiếp theo là #4 (A3), viết quy trình triển khai tay và mẫu Nhật ký thủ công.
Từ đó trở đi mới bắt đầu bấm giờ, nên số liệu mốc của Giai đoạn thủ công chưa có dòng nào.

---

## 2026-07-28 - Trỏ CLAUDE.md tới Hệ thống demo

**Ticket**: #33 (A8)
**Pull request**: #34
**Phục vụ**: không thuộc mục nào của Chương 25, đây là việc giữ cho file luật khớp với repo sau khi repo có mã nguồn

Sau #3 thì repo có mã, nhưng `CLAUDE.md` vẫn viết như thể chưa có dòng nào.
Thêm một mục `Hệ thống demo` chỉ gồm con trỏ: mã ở đâu, hạ tầng ở đâu, cách chạy đọc ở `README.md`.

Kèm hai ràng buộc mà một phiên làm việc mới chắc chắn vi phạm nếu không được nói trước: kiểm thử chỉ đi qua nginx bằng HTTP, và `erasableSyntaxOnly` cấm `enum`, `namespace` cùng parameter property.
Cả hai đều là loại luật mà vi phạm xong mới biết, nên phải nằm ở file được đọc đầu tiên chứ không phải ở chỗ nào đó trong `README.md`.

Cũng ghi rõ hiện mới có hai service, vì dòng mở đầu của file nói "hệ ba service" và người đọc sẽ đi tìm service thứ ba.

Đây là lần thứ ba `CLAUDE.md` được cập nhật theo kiểu chỉ thêm con trỏ chứ không chép nội dung, sau #28 và #29.
Cách này giữ được một chỗ duy nhất cho mỗi thứ, đổi lại là file luật gần như không tự đứng một mình đọc được, luôn phải mở kèm hai ba file khác.

---

## 2026-07-28 - Quy trình triển khai tay và chỗ ghi mốc giờ

**Ticket**: #4 (A3)
**Pull request**: #35
**Phục vụ**: mục 25.2 System building và 25.4 Release management; và là điều kiện cần của toàn bộ phần đo lường, vì đây là chỗ sinh ra vế "trước khi có pipeline" của Luận điểm

### Ticket đòi cái gì

Một tài liệu ghi từng bước triển khai Hệ thống demo hoàn toàn bằng tay, đủ chi tiết để mọi lần làm đều giống nhau, kèm một chỗ để ghi mốc thời gian.

Chữ "giống nhau" là điểm mấu chốt chứ không phải chữ "bằng tay".
Nếu lần này quên một bước, lần sau nhớ, lần thứ ba làm theo thứ tự khác, thì các con số thu được không so sánh với nhau được, và cũng không so với Giai đoạn pipeline được.
Lúc đó toàn bộ phần đo lường của đồ án mất chỗ dựa.

Ticket cũng cấm tuyệt đối việc tự động hoá bất kỳ bước nào.

### Đã thay đổi những gì

Hai file mới trong `docs/`, và một dòng trỏ trong `README.md`.

`docs/trien-khai-thu-cong.md` là quy trình: sáu bước, từ `git pull` cho tới lúc bộ kiểm thử bắn vào prod xanh toàn bộ.
Mỗi bước ghi kèm thứ phải nhìn thấy thì mới được đi tiếp, để không có chỗ nào phải tự suy đoán.
File cũng chứa quy tắc bấm giờ, cách xử lý khi có sự cố, và cách quay về bản cũ nếu prod hỏng.

`docs/nhat-ky-thu-cong.md` là chỗ chứa dữ liệu: một bảng, mỗi lần triển khai một môi trường là một dòng, nên một thay đổi bình thường sinh ra hai dòng là staging và prod.
Bảng ghi số issue, SHA commit, môi trường, thời điểm merge, thời điểm bắt đầu, thời điểm hoàn tất, và sự cố.
Bảng hiện còn rỗng vì chưa có lần triển khai thật nào.

### Vì sao việc này thuộc về đề tài

`docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` chốt rằng giữa hai giai đoạn chỉ được đổi đúng một biến, là sự hiện diện của pipeline.
Câu đó nghe thì gọn, nhưng nó đặt ra một yêu cầu nặng lên giai đoạn đầu: cách làm tay phải cố định, chứ không phải muốn làm thế nào cũng được miễn là không có CI.

Một quy trình chỉ nằm trong đầu người làm thì không cố định, vì nó trôi dần theo từng lần và không ai phát hiện ra.
Viết ra thành văn bản là cách rẻ nhất để giữ nó đứng yên, và cũng là thứ đưa vào phụ lục báo cáo được.

Còn một vai trò thứ hai, thuộc về mục 25.2 System building.
Sommerville nhấn mạnh rằng quá trình biến mã nguồn thành hệ chạy được phải lặp lại được và không phụ thuộc vào máy của ai.
Tài liệu này chính là bản mô tả quá trình đó ở dạng thủ công, và ở tuần sau nó sẽ được đặt cạnh workflow của Giai đoạn pipeline để thấy cùng một việc được diễn đạt bằng hai cách.

### Ba quyết định đáng kể lại

**Ranh giới của chữ "làm tay" phải viết thẳng ra, không để tự hiểu.**

Ticket cấm tự động hoá, nhưng cấm tới đâu thì không hiển nhiên.
Viết một script gộp sáu lệnh thành một có phải là tự động hoá không?
Về mặt chữ nghĩa thì đó không phải CI, nhưng về mặt số liệu thì nó chính là pipeline thu nhỏ, và nó sẽ kéo thời gian của Giai đoạn thủ công xuống gần Giai đoạn pipeline.

Điều tệ nhất là chuyện đó không lộ ra ở đâu cả.
Nhật ký chỉ ghi mốc giờ, không ghi cách gõ lệnh, nên khi tổng hợp số ở #10 sẽ không có cách nào biết một dòng nào đó nhanh bất thường vì đã được script hoá.
Vì vậy tài liệu ghi rõ hai danh sách: được dùng lịch sử shell và chép lệnh từ tài liệu ra dán; không được viết script, đặt alias, hay thêm lệnh mới vào `scripts` của `package.json`.

**Nhật ký cố ý không có cột nào chứa số phút đã tính sẵn.**

Ban đầu định thêm một cột "số phút" cho tiện đọc.
Bỏ đi, vì hai lý do.

Thứ nhất, cột đó mơ hồ: từ merge tới hoàn tất là một con số, từ lúc bắt đầu gõ tới hoàn tất là một con số khác, và cả hai đều có tên gọi hợp lý là "số phút".
Một cột mang hai nghĩa trong bảng dữ liệu là thứ sẽ gây tranh cãi đúng vào lúc viết báo cáo.

Thứ hai, mốc thô là thứ không dựng lại được nếu ghi sai, còn số dẫn xuất thì tính lúc nào cũng được.
Nên nhật ký chỉ giữ mốc thô, việc tính toán để cho #10 và #22.

**Việc ghi nhật ký nằm ngoài đồng hồ, và đó là một lựa chọn có lợi cho phe đối lập.**

Ghi nhật ký cũng tốn thời gian, và nó chỉ tốn vì đang ở Giai đoạn thủ công.
Tính nó vào thì con số của giai đoạn này to lên, tức là chênh lệch giữa hai giai đoạn to lên, tức là luận điểm trông thuyết phục hơn.

Đúng ra không được làm vậy.
Giai đoạn pipeline sẽ không có công việc tương ứng, nên tính vào là tự thổi phồng kết quả bằng một khoản chi phí do chính phương pháp đo sinh ra chứ không phải do việc thiếu pipeline sinh ra.
Quyết định là để ngoài đồng hồ, và ghi lý do vào tài liệu để báo cáo nhắc lại được ở phần bàn về giới hạn của phép đo.

### Đã kiểm chứng thế nào

Tài liệu quy trình mà sai một lệnh thì lần bấm giờ đầu tiên sẽ bị nhiễu bởi chính lỗi tài liệu, mà lần đó thì không đo lại được.
Vì vậy trước khi đóng ticket đã chạy thử trọn sáu bước một lượt: kiểm tra kiểu sạch, staging và prod đều dựng được, bộ kiểm thử 4/4 xanh ở cả hai môi trường.
Hai lệnh lấy giờ UTC, một cho Git Bash và một cho PowerShell, cũng được chạy thử và cho ra cùng một giá trị.

Lần chạy này không ghi vào Nhật ký thủ công.
Nó là phép thử tài liệu chứ không phải triển khai một thay đổi thật, và file dữ liệu chỉ nên chứa dữ liệu thật.

### Dẫn chứng

- `docs/trien-khai-thu-cong.md`, `docs/nhat-ky-thu-cong.md`
- Vòng đời thay đổi: issue #4 với pull request #35

### Đang ở đâu sau mục này

Phần chuẩn bị của Giai đoạn thủ công đã xong: có hệ để triển khai, có quy trình để làm, có chỗ để ghi.
Từ ticket sau, mỗi thay đổi merge vào `main` sẽ được triển khai tay lên hai môi trường và bấm giờ, nên Nhật ký thủ công bắt đầu có dòng.

Ticket tiếp theo là #5 (B1), service thống kê lượt truy cập.
Đây là ticket đầu tiên có số đo, và cũng là ticket đầu tiên có hai service gọi nhau qua mạng.

---

## 2026-07-28 - Số đo về đích sau khi issue đã đóng

**Ticket**: #39 (A10)
**Pull request**: #40
**Phục vụ**: mục 25.3 Change management, ở chỗ nói về giới hạn của quy trình chứ không phải ở chỗ khoe quy trình

### Vấn đề

Lộ ra lúc chuẩn bị triển khai tay cho #5, tức là ngay lần đầu quy trình của #4 chạy thật.

`CONTRIBUTING.md` đòi mọi pull request phải có dòng `Closes #<số-issue>`, và `main` được bảo vệ nên không có đường nào khác để đưa file lên.
Nhưng số đo của một lần triển khai tay chỉ tồn tại **sau** khi thay đổi đã merge, mà đúng lúc merge thì issue tương ứng đã tự đóng.
Nên tới lúc có số để ghi thì không còn issue nào để đóng nữa.

Chuyện này sẽ lặp lại ở cả tám tới mười lần triển khai còn lại của Giai đoạn thủ công, nên chốt một lần rẻ hơn là mỗi lần lách một kiểu.

### Đã thay đổi những gì

`CONTRIBUTING.md` có thêm mục ngoại lệ: pull request **chỉ** chạm `docs/nhat-ky-thu-cong.md` thì thân ghi `Nhật ký thủ công cho #<số-issue>` và không ghi `Closes`.
`CLAUDE.md` bỏ chữ tuyệt đối trong câu nói thiếu `Closes` là gãy truy vết, và trỏ sang ngoại lệ đó.

### Vì sao không chọn cách kia

Phương án còn lại là mở một issue con cho mỗi lần ghi nhật ký, đúng luật hơn vì không phải đặt ngoại lệ nào.
Bỏ vì nó đẻ thêm khoảng mười issue thuần thủ tục, làm loãng danh sách issue mà giảng viên sẽ mở ra xem, và làm hỏng luôn phép đếm "một issue là một thay đổi" mà #10 dựa vào.

Lý do sâu hơn để đặt ngoại lệ chứ không nắn dữ liệu cho vừa luật: bản ghi số đo không phải một thay đổi lên Hệ thống demo, nó là dữ liệu **về** một thay đổi đã xong.
Nó không có lead time của riêng nó, nên nó vốn không thuộc chuỗi truy vết mà `Closes` dựng ra.
Ép nó vào chuỗi đó bằng `Closes` sẽ gắn hai pull request vào cùng một issue và làm mờ đúng cái mốc mà #10 với #22 cần.

### Đáng kể lại ở chỗ nào

Đây là lần thứ hai một quy ước của repo phải sửa vì thực tế không vừa với nó, sau #24.
Cả hai lần đều phát hiện lúc quy ước bị dùng thật chứ không phải lúc viết ra nó.

Nhận xét này dùng được cho báo cáo khi bàn về 25.3: một quy trình thay đổi được thiết kế trên giấy luôn có chỗ hở, và giá trị của nó không nằm ở chỗ không bao giờ hở, mà ở chỗ chỗ hở được phát hiện, ghi lại và sửa thành văn thay vì lặng lẽ đi vòng qua.

### Dẫn chứng

- `CONTRIBUTING.md` mục "Ngoại lệ: pull request ghi Nhật ký thủ công", `CLAUDE.md` mục Ràng buộc phải tôn trọng
- Vòng đời thay đổi: issue #39 với pull request #40
- Tiền lệ cùng dạng: #24 với pull request #25
