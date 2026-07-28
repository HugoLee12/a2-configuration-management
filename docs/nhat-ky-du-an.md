# Nhật ký dự án

File này ghi lại từng chặng của đồ án A2 theo lối kể chuyện: việc gì đã làm, vì sao làm, nó phục vụ mục nào của Chương 25 hoặc ô nào của Rubric, và bằng chứng nằm ở đâu.

Mục đích là để tuần 15 viết báo cáo và dựng slide thì lấy thẳng từ đây, thay vì phải bới lại lịch sử commit và các issue đã đóng.
Vì vậy mỗi mục viết cho người chưa biết gì về việc đó, không viết theo lối gạch đầu dòng cho người đã biết.

Xếp theo thứ tự thời gian, mục mới thêm vào cuối file.
Mỗi ticket đóng lại phải có một mục nhắc tới nó, viết ngay lúc còn nhớ.

Một mục gộp được nhiều ticket khi chúng cùng kể một chuyện, và ticket quy trình mỏng thì gộp vào mục của ticket kế tiếp thay vì viết riêng.
Cái không được phép là để một ticket đóng mà không mục nào nhắc tới, vì lúc viết báo cáo sẽ không ai biết nó từng tồn tại.

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

## 2026-07-28 - Đếm lượt truy cập, service thứ ba và lần đổi schema đầu tiên

**Ticket**: #5 (B1)
**Pull request**: #38
**Phục vụ**: ô Kiến trúc 25% của Rubric; và là thay đổi cỡ chuẩn đầu tiên được bấm giờ, nên nó mở đầu phần dữ liệu của Giai đoạn thủ công

### Ticket đòi cái gì

Mỗi lần một mã ngắn được truy cập thì hệ ghi lại sự kiện, một worker tổng hợp các sự kiện đó theo chu kỳ, và số lượt của một mã tra cứu được qua API.

Ràng buộc quan trọng nhất không nằm ở chỗ đếm được, mà ở chỗ **phần tổng hợp không được nằm trên đường chuyển hướng**.
Dừng worker thì chuyển hướng vẫn phải chạy bình thường.
Đây chính là yêu cầu số 32 trong danh sách của #1: sự cố ở nhánh phụ không được kéo sập chức năng chính.

Ticket cũng là thay đổi cỡ chuẩn đầu tiên của Giai đoạn thủ công, nghĩa là nó phải được triển khai tay lên cả staging lẫn prod và sinh ra hai dòng đầu tiên của Nhật ký thủ công.

### Đã thay đổi những gì

Service thứ ba, `services/stats/`, là một worker chạy nền không phơi cổng nào và không nằm sau nginx.

Đường đi của một lượt truy cập bây giờ gồm hai chặng tách rời.
Service `redirect` ghi mỗi lượt thành một dòng trong bảng `visits` rồi trả 302 như cũ.
Worker `stats` cứ mỗi giây rút toàn bộ hàng đợi đó ra và cộng dồn vào bảng `link_stats`.
Service `link` phơi số đã cộng dồn qua `GET /api/v1/links/:code/stats`.

Việc tổng hợp gói trong đúng một câu lệnh SQL, dùng `delete ... returning` làm nguồn cho `insert ... on conflict do update`.
Nhờ vậy việc xoá hàng đợi và việc cộng số cùng thành công hoặc cùng bị huỷ, không có kẽ nào làm mất hay đếm đôi sự kiện, mà không phải tự quản lý con trỏ đọc hay đánh dấu dòng đã xử lý.

Bảng `visits` cố ý không có khoá chính, không có chỉ mục và không có cả cột thời gian.
Nó là hàng đợi chứ không phải kho lưu trữ: dòng vừa ghi vào đã bị rút ra trong vòng một giây, nên mọi thứ thêm vào đó đều là chi phí ghi mà không ai đọc.

Phần dùng chung của bộ kiểm thử được tách ra `tests/stack.ts`, vì cổng gác "chờ stack sẵn sàng" của #3 giờ có hai file cần tới.
Kéo theo một chỉnh nhỏ trong `tsconfig.json`: Node đòi đường dẫn import phải ghi đúng đuôi `.ts` vì nó bóc kiểu chứ không biên dịch, nên phải bật `allowImportingTsExtensions`.

### Vì sao việc này thuộc về đề tài

Nghiệp vụ vẫn nhạt như chủ ý của `docs/adr/0002-he-thong-demo-va-stack.md`, nhưng hình dạng của hệ thì vừa đổi thật.

Trước ticket này, hai service của Hệ thống demo chỉ khác nhau ở đường dẫn nginx đấu vào; cả hai đều là tiến trình HTTP đứng chờ request.
Bây giờ có một thành phần thuộc loại khác hẳn: không có cổng, không ai gọi được nó, vòng đời của nó là một vòng lặp nền.
Ô Kiến trúc 25% của Rubric đòi hệ phân tán thật, và một hệ chỉ gồm các service đối xứng nhau thì khó gọi là phân tán theo nghĩa thú vị.

Nó cũng tạo ra thứ mà các ticket sau cần tới.
`#7` phải trả lời câu hỏi "một worker không có cổng thì báo sức khoẻ kiểu gì".
`#13` triển khai blue-green phải quyết định worker đi theo stack nào khi hai stack chạy song song trên cùng một cơ sở dữ liệu.
Cả hai câu hỏi đó chỉ tồn tại vì thành phần này tồn tại.

### Chuyện đáng kể lại

**Cái bẫy schema, và nó tự lộ ra đúng lúc.**

Đây là lần đầu repo đổi `infra/postgres/init.sql`.
Postgres chỉ chạy file đó đúng một lần, lúc khởi tạo một volume rỗng.
Hai môi trường staging và prod đã có volume từ #3, nên hai bảng mới sẽ không bao giờ được tạo, dù file trên đĩa đã đúng và image đã build lại.

Tái hiện trước khi sửa: dựng staging trên volume cũ rồi chạy bộ kiểm thử.

```
ℹ tests 7
ℹ pass 4
ℹ fail 3
```

Ba test mới đỏ vì service trả 500, không phải vì một thông báo nào nói rằng thiếu bảng.
Triệu chứng nằm cách nguyên nhân đúng một tầng, và đây là loại lỗi sẽ tốn rất nhiều phút nếu bung ra giữa lúc đang bấm giờ.

Cách xử lý chọn đúng khuôn đã có sẵn trong `docs/trien-khai-thu-cong.md`: tài liệu đó vốn đã có một quy tắc dạng "nếu thay đổi đụng vào `nginx.conf` thì thêm `restart nginx`", nên thêm một quy tắc cùng dạng cho `init.sql` là `down -v` trước mỗi lệnh `up`.
Đổi lại là mất sạch dữ liệu của môi trường đó, chấp nhận được vì cả hai môi trường chỉ chứa dữ liệu thử.

Phương án còn lại đã cân nhắc là cho service tự chạy `create table if not exists` lúc khởi động, khỏi phải xoá volume.
Bị loại vì nó đặt schema vào hai chỗ, và vì bước thủ công thêm vào kia chính là chi phí thật của việc triển khai tay khi chưa có migration, tức là đúng thứ Giai đoạn thủ công sinh ra để đo.
Dựng hẳn cơ chế migration thì phình phạm vi ticket, và bản thân bước chạy migration tự động lại chạm vào lằn ranh "không tự động hoá" của giai đoạn này.

**Bốn test cũ vẫn xanh trong lúc ba test mới đỏ.**

Chỗ này ban đầu chỉ là một lần chạy hỏng, nhưng nhìn kỹ thì nó là bằng chứng cho đúng tiêu chí khó kiểm nhất của ticket.
Lúc đó bảng `visits` không tồn tại, nghĩa là mỗi lần chuyển hướng đều có một câu lệnh SQL ném lỗi.
Chuyển hướng vẫn 302, tạo link vẫn 201, vì lệnh ghi sự kiện được bọc `try/catch` và lỗi của nó không đi tới người dùng.

Nói cho chính xác thì việc **ghi** sự kiện vẫn nằm trên đường chuyển hướng: service `redirect` chờ câu lệnh `insert` xong rồi mới trả 302, nên mỗi lượt chuyển hướng gánh thêm một vòng đi về cơ sở dữ liệu.
Cái được đẩy ra khỏi đường đó là việc **tổng hợp**, thứ tốn kém và cần chạy theo chu kỳ.
Ghi kiểu bắn rồi quên sẽ nhanh hơn nhưng mất sự kiện mỗi khi tiến trình chết giữa chừng, và ở quy mô này thì một lần `insert` không đáng để đổi lấy chuyện đó.

**Một khoá ngoại đúng sách vở suýt thành cái bẫy đóng băng toàn bộ thống kê.**

Bảng `link_stats` ban đầu có `references links (code) on delete cascade`, vì một mã không còn tồn tại thì số lượt của nó cũng vô nghĩa.
Soát lại mới thấy nó đá vào chính chỗ mạnh của cách tổng hợp: cả chu kỳ nằm trong một câu lệnh, nên nếu có một dòng `visits` trỏ tới mã vừa bị xoá thì câu lệnh đó hỏng, việc rút hàng đợi bị huỷ theo, và chu kỳ sau gặp lại đúng dòng ấy.
Hỏng vĩnh viễn, và hỏng cho **mọi** mã chứ không riêng mã có vấn đề.

Hôm nay chưa có đường nào xoá link nên chưa với tới được, nhưng #19 sinh ra đúng để dọn link hết hạn.
Bỏ khoá ngoại đi, đổi lại là `link_stats` có thể còn sót dòng của mã đã xoá, thứ mà #19 dọn kèm được trong cùng một thao tác.
Ghi lý do thẳng vào `init.sql`, vì đây là loại thiếu sót mà người đọc sau sẽ tưởng là quên rồi thêm lại.

**Tiêu chí "dừng worker thì chuyển hướng vẫn chạy" không kiểm tự động được.**

Bộ kiểm thử chỉ được đi qua nginx bằng HTTP, mà worker cố ý không nằm sau nginx, nên không có đường nào từ trong test với tới nó.
Viết một test tự gọi `docker compose stop` thì phá seam đó, và tệ hơn là `#13` định dùng lại chính bộ test này làm smoke test cho blue-green: một smoke test tự dừng container của stack vừa dựng là thứ không được phép tồn tại.

Nên tiêu chí này kiểm bằng tay, và log để ở ngay đây:

```
--- worker đã dừng ---
a2-staging-link-1       running
a2-staging-nginx-1      running
a2-staging-postgres-1   running
a2-staging-redirect-1   running
--- chuyển hướng khi worker chết ---
GET /qQI0v0l -> 302 https://example.com/kiem-chung-worker
GET /qQI0v0l -> 302 https://example.com/kiem-chung-worker
--- tạo link mới khi worker chết ---
POST /api/v1/links -> 201
--- thống kê lúc worker còn chết ---
{"code":"qQI0v0l","visits":0}
--- thống kê sau khi worker sống lại ---
{"code":"qQI0v0l","visits":2}
```

Hai dòng cuối nói thêm một điều không nằm trong tiêu chí: hai lượt truy cập lúc worker chết không mất, chúng nằm chờ trong bảng `visits` và được cộng vào ngay chu kỳ đầu tiên sau khi worker sống lại.
Tức là dừng worker làm số lượt **chậm**, chứ không làm nó **sai**.
Đây là khác biệt đáng nêu trong báo cáo khi bàn về việc tách một chức năng ra khỏi đường đi chính.

### Đã kiểm chứng thế nào

Kiểm tra kiểu sạch, bộ kiểm thử 7/7 xanh trên staging sau khi xoá volume và dựng lại.

Lần chạy này là kiểm chứng lúc phát triển, không phải triển khai một thay đổi đã merge, nên không ghi vào Nhật ký thủ công.
File dữ liệu đó chỉ chứa số đo của những lần triển khai thật, theo đúng cách #4 đã xử lý.

### Dẫn chứng

- Mã nguồn: `services/stats/`, `services/redirect/src/index.ts`, `services/link/src/index.ts`, `infra/postgres/init.sql`
- Kiểm thử: `tests/thong-ke-luot-truy-cap.test.ts`, phần dùng chung ở `tests/stack.ts`
- Quy tắc xoá volume khi đổi schema: `docs/trien-khai-thu-cong.md` bước 3 và bước 5
- Vòng đời thay đổi: issue #5 với pull request #38

### Đang ở đâu sau mục này

Hệ thống demo đủ ba service, và lần đầu tiên có một thành phần không phơi cổng.
Vẫn chưa có endpoint sức khoẻ, chưa có metrics, và cố ý chưa có pipeline.

Hai dòng đầu tiên của Nhật ký thủ công sinh ra từ lần triển khai tay của chính thay đổi này, làm sau khi pull request được merge.
Ticket tiếp theo là #6 (B2), xác thực địa chỉ đầu vào.

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

---

## 2026-07-28 - Lần triển khai tay đầu tiên, và tài liệu tự làm hỏng nó

**Ticket**: #41 (A11), và số đo được ghi trong pull request #42
**Pull request**: #43
**Phục vụ**: mục 25.2 System building và 25.4 Release management; đây là mẫu dữ liệu đầu tiên của Giai đoạn thủ công, và cũng là mẫu thất bại đầu tiên

### Chuyện đã xảy ra

#38 merge lúc `15:04`, đồng hồ bắt đầu lúc `15:13`, staging xanh lúc `15:15`.

Prod thì đỏ.
Bốn kiểm thử của #3 xanh, ba kiểm thử thống kê trả 500, và log của service `link` nói thẳng nguyên nhân:

```
error: relation "link_stats" does not exist
```

Bước 5 thiếu `docker compose --env-file env/prod.env down -v`.
Volume của prod tạo từ #3 lúc `07:51:35Z` và chưa bao giờ bị xoá, mà Postgres chỉ chạy `init.sql` khi khởi tạo một volume rỗng, nên hai bảng mới không tồn tại dù image đã build lại đúng.
Sửa bằng `down -v` rồi dựng lại, prod xanh lúc `15:18`.

Tính theo định nghĩa trong `docs/trien-khai-thu-cong.md` thì đây là **một lần phát hành thất bại**, và nó vào change failure rate của Giai đoạn thủ công.

### Vì sao lỗi này không phải lỗi thao tác

Quy tắc `down -v` đã có sẵn trong tài liệu từ chính #5, ở ba chỗ: mục "Bảng lệnh", bước 3 và bước 5.
Vậy mà nó vẫn bị bỏ sót, nên câu hỏi đúng không phải "ai quên" mà "vì sao tài liệu có mà vẫn quên".

Câu trả lời nằm ở vị trí.
Mục "Bảng lệnh" tự mô tả nó là "toàn bộ quy trình gói lại thành một khối chép được", nên cách dùng đúng của nó là chép cả khối ra dán vào terminal.
Hai dòng nhắc điều kiện lại nằm **dưới** khối đó.
Người chép khối sẽ đọc chúng sau khi đã gõ xong, tức là đọc để biết mình vừa làm sai chứ không phải để làm đúng.

Cái sai ở đây là một cái bẫy do chính tài liệu bày ra: nó mời người đọc chép cả khối, rồi đặt điều kiện ở nơi hành vi đó không đi qua.

### Đã sửa thế nào

Hai dòng nhắc chuyển lên **trên** khối lệnh, và bản thân hai lệnh có điều kiện được đặt thẳng vào trong khối ở dạng dòng bị chú thích, đúng vị trí phải chạy.
Chép cả khối bây giờ vẫn ra hành vi đúng cho trường hợp thường gặp, còn hai trường hợp có điều kiện thì chỉ cần bỏ dấu `#` chứ không phải nhớ ra rằng có một lệnh cần chèn và chèn vào đâu.

Bước 1 có thêm một lệnh trả lời đúng câu hỏi quyết định:

```sh
git --no-pager show --stat HEAD
```

Trước đây người thao tác phải tự nhớ lần merge này đụng file nào, mà thời điểm cần nhớ lại là lúc đang đứng trước lệnh `up` ở bước 3.
Bây giờ danh sách file hiện ra ngay ở bước 1, trước khi nó cần tới.

Lệnh này không phải tự động hoá theo nghĩa mà `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` cấm: nó không gộp bước nào lại với nhau và không làm hộ bước nào, nó chỉ hiển thị thông tin.
Ranh giới bị cấm là script gộp nhiều bước thành một lệnh, không phải việc nhìn vào kho mã.

### Vì sao việc này thuộc về đề tài

Đây là chỗ Giai đoạn thủ công bắt đầu trả cổ tức, sớm hơn dự tính.

Luận điểm của đồ án cần chênh lệch số giữa hai giai đoạn, nhưng bản thân lần hỏng này còn nói được một điều mà bảng số không nói: quy trình thủ công hỏng ở chỗ **tài liệu**, chứ không hỏng ở chỗ máy móc.
Một bước có điều kiện, chỉ áp dụng cho vài phần trăm số lần triển khai, phụ thuộc vào việc người thao tác nhớ ra đúng lúc, là loại bước mà con người sẽ bỏ sót còn máy thì không.
Sang Giai đoạn pipeline, cùng ràng buộc đó sẽ nằm trong một bước của workflow và chạy hoặc không chạy theo điều kiện được viết ra, không theo trí nhớ ai cả.

Đó là dẫn chứng cụ thể cho một câu mà nếu chỉ chép từ sách thì rất nhạt: giá trị của tự động hoá không nằm ở tốc độ mà nằm ở tính lặp lại được.
Ở đây có cả hai vế đo được, năm phút và một lần hỏng, trên cùng một thay đổi.

Còn một ý cho mục bàn về giới hạn của phép đo.
Chi phí sửa tài liệu này không nằm trong đồng hồ, và cũng sẽ không có gì tương ứng ở Giai đoạn pipeline.
Nó là chi phí thật của cách làm thủ công nhưng không được tính vào, nên chênh lệch giữa hai giai đoạn đang bị ước lượng **thấp hơn** thực tế chứ không phải cao hơn.

### Một vết bẩn trong dữ liệu, đã ghi rõ chứ không giấu

Dòng staging của #5 xanh, nhưng nó xanh vì volume staging đã bị xoá và dựng lại lúc `14:49:57Z`, trong lúc kiểm chứng khi phát triển, tức là trước khi đồng hồ chạy.
Nếu lúc `15:13` volume staging còn nguyên như prod thì bước 4 đã đỏ y hệt.

Nghĩa là dòng đó thiếu chi phí của bước xoá volume, và không so thẳng được với các lần triển khai sau.
Đã ghi vào cột `Sự cố` và mục ghi chú của `docs/nhat-ky-thu-cong.md`, để #10 trừ hao chứ không phát hiện muộn.

Bài học cho các ticket sau: việc kiểm chứng khi phát triển đụng vào chính môi trường sẽ được đo, nên nó phải được coi là một biến của phép đo chứ không phải chuyện bên lề.

### Dẫn chứng

- Số đo và hai ghi chú sự cố: `docs/nhat-ky-thu-cong.md`, mục "#5 staging" và "#5 prod"
- Quy trình sau khi sửa: `docs/trien-khai-thu-cong.md` mục "Bảng lệnh" và bước 1
- Vòng đời thay đổi: issue #41 với pull request #43
- Lần triển khai được nói tới: pull request #38, merged lúc `2026-07-28T15:04:46Z`, commit `49460b4`

### Đang ở đâu sau mục này

Nhật ký thủ công có hai dòng và một lần phát hành thất bại.
Quy trình đã bịt cái bẫy vừa lộ ra, nên lần triển khai của #6 sẽ là mẫu đầu tiên đo trên quy trình không còn lỗi đã biết.

Ticket tiếp theo là #6 (B2), xác thực địa chỉ đầu vào.

---

## 2026-07-28 - Xác thực địa chỉ, và một bước phục hồi chưa bao giờ chạy

**Ticket**: #6 (B2), #48
**Pull request**: #46, #47
**Phục vụ**: thay đổi cỡ chuẩn thứ hai của Giai đoạn thủ công, tức mẫu số liệu thứ hai; và là dẫn chứng cho mục bàn về giới hạn của phép đo trong báo cáo

### Ticket đòi cái gì

Địa chỉ không hợp lệ bị từ chối ngay lúc tạo link, kèm lý do cho biết sai ở đâu, thay vì sinh ra một mã ngắn dẫn tới chỗ vô nghĩa.
Chỉ chấp nhận giao thức `http` và `https`.

Ràng buộc quan trọng không nằm ở phần nghiệp vụ mà nằm ở phần đo: kích thước phải tương đương #5 thì bảng so sánh lead time mới còn nghĩa.
Kèm theo đó, bảy test đã có không được phép sửa, vì sửa test cũ là cách âm thầm nhất để làm hai mẫu đo không so được với nhau.

### Đã thay đổi những gì

Trong `services/link/src/index.ts`, phép kiểm tra "chuỗi không rỗng" được thay bằng `URL.parse()` của thư viện chuẩn, rồi lọc giao thức qua một tập hai phần tử.
Không thêm phụ thuộc nào, và không viết lấy một dòng nào để tự phân tích địa chỉ.

Ba test mới nằm ở `tests/xac-thuc-dia-chi.test.ts`, vẫn đi qua nginx bằng HTTP đúng như seam mà #3 đặt ra.
Bảy test cũ không phải sửa một dòng nào, đúng tiêu chí nghiệm thu.

Ràng buộc giao thức không chỉ để dữ liệu sạch.
Nhận mọi giao thức thì service `redirect` trở thành chỗ phát tán `javascript:` và `data:` dưới một địa chỉ trông sạch sẽ, tức là chính hệ demo tự biến thành công cụ tấn công.
Đây là loại lỗi mà một dịch vụ rút gọn URL thật sẽ gặp ngay ngày đầu, nên chặn nó không phải là thêm tính năng nghiệp vụ.

Bộ kiểm thử lên 10 test, kéo theo một chỗ phải sửa ở nơi không ai nghĩ tới: hai dòng `phải thấy pass 7` trong mục "Bảng lệnh" của `docs/trien-khai-thu-cong.md`.
Con số kiểm chứng của quy trình bị neo cứng vào số lượng test, nên mỗi ticket thêm test đều phải nhớ sửa nó.
Đó là một mối nối dễ mục, đã ghi lại chứ chưa sửa vì sửa nó là thay đổi quy trình, cần ticket riêng.

### Chuyện đáng kể lại

Bước 6 đỏ ba test thống kê, với đúng triệu chứng của #5: `relation "link_stats" does not exist`.

Điều này lẽ ra không được phép xảy ra.
Mục trước vừa kết lại rằng #6 sẽ là mẫu đầu tiên đo trên quy trình không còn lỗi đã biết.
#6 chỉ chạm mã service, không chạm `infra/postgres/init.sql`, nên khối lệnh chép ra không có `down -v` là **đúng** quy trình, và lần này quy trình không bẫy ai cả.

Cái đỏ ở đây là nợ của #5, mà bản ghi của #5 tưởng đã trả xong.

Mục "#5 prod" trong Nhật ký thủ công ghi rằng prod xanh trở lại lúc `15:18` nhờ `down -v` rồi `up -d --build`.
Bước `down -v` đó chưa bao giờ chạy.

Bằng chứng là mốc tạo của volume, thứ mà `down -v` bắt buộc phải làm mới:

| Volume | Mốc tạo, đo lúc 16:08 | Nghĩa |
|---|---|---|
| `a2-prod_postgres-data` | `2026-07-28T07:51:35Z` | vẫn là volume của lần triển khai #3 |
| `a2-staging_postgres-data` | `2026-07-28T14:49:57Z` | đã dựng lại sau khi #5 đổi schema |

Nếu `down -v` chạy lúc 15:17 thì volume prod phải mang mốc của lúc đó.
Nó mang mốc của tám tiếng trước.
Lệnh thật sự chạy lúc ấy chỉ dựng lại container mà giữ nguyên volume, nên `init.sql` vẫn nằm im và hai bảng vẫn không tồn tại.

Prod do đó hỏng liên tục từ `15:16` tới `16:21`, tức 65 phút, chứ không phải 2 phút như bản ghi nói.

Khả năng cao nhất là bước 6 lúc đó bắn vào staging chứ không phải prod, vì `$env:BASE_URL` đã bị xoá hoặc chưa từng được đặt.
Đó đúng là cái bẫy mà `docs/trien-khai-thu-cong.md` cảnh báo, chỉ khác chiều: tài liệu lo người quên xoá biến rồi tưởng đang thử staging, còn ở đây là quên đặt biến rồi tưởng đang thử prod.
Không còn bằng chứng nào để xác nhận, nên nó dừng ở mức giả thuyết và đã được ghi đúng như vậy.

Bản ghi sai được **giữ nguyên** trong Nhật ký thủ công, kèm một mục đính chính bên dưới.
Sửa đè lên nó sẽ xoá mất thứ có giá trị nhất ở đây: bằng chứng rằng một quy trình thủ công có thể báo cáo thành công cho một bước chưa bao giờ chạy, mà không có gì chặn lại.

### Vì sao việc này thuộc về đề tài

Mục của #5 đã nói tự động hoá thắng ở tính lặp lại được.
Lần này lộ ra một vế nữa, sắc hơn: **tính kiểm chứng được**.

Ở Giai đoạn thủ công, bản ghi là do chính người thao tác tự khai.
Người khai hoàn toàn thành thật, tin rằng mình đã chạy `down -v`, và viết ra một dòng nhật ký sai mà không hề biết.
Không có gì trong quy trình đối chiếu lời khai đó với thực tế, nên sai lệch sống được 65 phút và chỉ lộ ra nhờ một ticket khác tình cờ chạm vào cùng chỗ.

Sang Giai đoạn pipeline, cùng bước đó để lại log của máy, gắn với số hiệu lần chạy, không do ai gõ tay vào.
Một bước không chạy thì không có log, chứ không phải có một dòng nói rằng nó đã chạy.

Đây là dẫn chứng cụ thể cho một luận điểm mà nếu chỉ chép từ Chương 25 thì rất trừu tượng: giá trị của Configuration Management không chỉ là làm nhanh hơn, mà là làm cho trạng thái hệ thống thành thứ **đọc ra được** thay vì thứ phải tin lời ai đó.

Còn một chi tiết đáng đưa vào báo cáo.
Suốt 65 phút đó prod không sập, nó hỏng một phần: tạo link và chuyển hướng vẫn phục vụ bình thường, còn mọi lượt truy cập đều mất trắng vì `redirect` ghi vào bảng `visits` không tồn tại theo kiểu bắn rồi quên.
Bốn test cũ xanh trong suốt thời gian đó, nên không có gì báo động.
Một hệ hỏng lặng lẽ mà vẫn trả lời như thường là thứ khó phát hiện hơn nhiều so với một hệ sập hẳn, và đó chính là lý do #8 và #9 tồn tại trong kế hoạch.

### Đã kiểm chứng thế nào

Mục của #5 rút ra rằng việc kiểm chứng khi phát triển đụng vào chính môi trường sẽ được đo là một biến của phép đo, không phải chuyện bên lề.
#6 là ticket đầu tiên áp dụng bài học đó.

Bộ kiểm thử được chạy trên một stack thứ ba dựng riêng cho việc phát triển, project `a2-dev`, cổng 8099, file env nằm ngoài kho mã.
Nó có container riêng, network riêng và volume riêng, nên `a2-staging` lẫn `a2-prod` không bị đụng tới trước lúc bấm giờ.
Xong việc thì `down -v` và xoá luôn image.

Nhờ vậy dòng staging của #6 không mang vết bẩn mà dòng staging của #5 mang.
Phần còn chung là cache build của Docker, nên lần build có nhanh hơn một chút; điều này áp dụng cho mọi lần triển khai sau chứ không riêng lần này.

Từ lần này trở đi, `down -v` được coi là đã chạy khi và chỉ khi mốc tạo của volume đổi.
Lệnh chạy xong mà không báo lỗi không phải là bằng chứng, vì `down` không kèm `-v` cũng chạy xong mà không báo lỗi.

### Số liệu

| Mẫu | staging | prod | Sự cố |
|---|---|---|---|
| #5 | 2 phút | 5 phút | phát hành thất bại |
| #6 | 2 phút | 15 phút | phát hành thất bại |

Hai con số của #6 phải đọc kèm nhau chứ không tách rời.
13 trong 15 phút của prod là thời gian chẩn đoán và sửa một sự cố mà nguyên nhân thuộc về #5, còn phần triển khai đúng nghĩa chỉ mất khoảng 2 phút như staging.

Khi tổng hợp ở #10, hai chỉ số này thuộc về hai ticket khác nhau dù sinh ra từ cùng một sự cố:

- **Change failure rate** tính một lần phát hành thất bại cho #6, theo đúng định nghĩa "đỏ ở prod" trong `docs/trien-khai-thu-cong.md`. Quy tắc đó cố ý không hỏi nguyên nhân thuộc về ai, và giữ nguyên như vậy tốt hơn là mở ra chỗ để tranh cãi từng ca.
- **MTTR** là 65 phút và thuộc về sự cố của #5. Lấy 13 phút của #6 làm MTTR là đếm thiếu gần năm lần.

### Dẫn chứng

- Thay đổi mã và ba test mới: pull request #46, commit `555bc78`
- Số đo, mục đính chính và ghi chú sự cố: pull request #47, `docs/nhat-ky-thu-cong.md` mục "Đính chính, phát hiện lúc triển khai #6" và "#6 prod"
- Bằng chứng volume sau khi sửa: `a2-prod_postgres-data` mang mốc `2026-07-28T16:20:42Z`, và prod có đủ ba bảng `links`, `visits`, `link_stats`
- Bản ghi bị đính chính: `docs/nhat-ky-thu-cong.md` mục "#5 prod"

### Đang ở đâu sau mục này

Nhật ký thủ công có bốn dòng và hai lần phát hành thất bại trên hai mẫu, tức change failure rate của Giai đoạn thủ công tới giờ là 100%.
Con số đó sẽ dịu đi khi có thêm mẫu, nhưng bản thân việc hai lần đầu đều hỏng đã là một dữ kiện đáng nói chứ không phải xui rủi.

Hai chỗ mỏng đã lộ ra, và đã thành ticket ngay trong phiên:

- Bộ kiểm thử không in ra địa chỉ nó đang bắn vào, nên một lần chạy nhầm môi trường không để lại dấu vết nào. Đây chính là thứ đã che giấu sự cố của #5 suốt 65 phút. Thành **#50**, tách riêng vì nó là chuyện bộ kiểm thử tự nói ra nó đang chạy ở đâu, không dính gì tới endpoint sức khoẻ.
- `waitForStack` trả về ngay khi service `link` đáp 400, mà 400 không chạm cơ sở dữ liệu, nên nó báo sẵn sàng trong lúc Postgres còn đang khởi động. Lỗi này đã vấp phải một lần trong lúc phát triển #6, và nó sẽ thành test chập chờn khi #13 dùng lại bộ test này làm smoke test cho blue-green. **Gộp vào #7** thành một tiêu chí nghiệm thu, vì endpoint sẵn sàng mà #7 dựng lên chính là tín hiệu đúng mà cổng gác đang thiếu.

Chỗ gộp và chỗ tách ở trên là một quyết định có cân nhắc, không phải tuỳ hứng.
`CONTRIBUTING.md` cấm gom nhiều việc rời rạc vào một issue vì lead time tính theo từng issue, nên gộp cả hai vào #7 sẽ làm hỏng mẫu đo "cỡ chuẩn thứ ba".
Ngược lại, tách `waitForStack` ra riêng thì nó phải chờ #7 xong mới làm được, và lúc đó chỉ còn là vài dòng đổi chỗ cổng gác trỏ tới, tức một issue không đủ một việc có nghĩa.

Thứ tự đề nghị cho phiên sau là **#50 trước, rồi #7**.
#50 mỏng và chỉ chạm `tests/`, làm xong thì lần triển khai kế tiếp đã có dấu vết môi trường trong đầu ra, thay vì lại phải suy đoán như lần này.
