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

**Nhật ký thủ công** là dữ liệu số: mỗi lần build và triển khai tay ghi thời điểm bắt đầu, thời điểm xong, các bước phải làm.
Nó là dữ liệu nghiên cứu để tính lead time của Giai đoạn thủ công, phải ghi ngay lúc làm vì không dựng lại được sau.

**Nhật ký dự án** là file này, ghi chú tường thuật để viết báo cáo.
Nó không chứa số đo gốc, và không thay thế được Nhật ký thủ công.

Ranh giới nằm ở chữ "gốc".
Một mục được phép trích số dẫn xuất khi con số đó là một phần của câu chuyện đang kể, nhưng mốc giờ thô thì chỉ nằm ở Nhật ký thủ công, và mục nào trích thì phải nói rõ nó lấy từ đâu.
Cái bị cấm là hai file cùng làm nguồn sự thật cho một con số, vì lúc đó không ai biết file nào đúng khi chúng lệch nhau.

Bảng số chốt lại của cả một giai đoạn thì không thuộc về file này, nó nằm ở `docs/so-lieu-giai-doan-thu-cong.md`.

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

## 2026-07-29 - Sức khoẻ, sẵn sàng, và một thiết kế đã chốt vẫn hỏng

**Ticket**: #7 (B3), #50, #56
**Pull request**: #53, #54, #55
**Phục vụ**: thay đổi cỡ chuẩn thứ ba của Giai đoạn thủ công, tức mẫu số liệu thứ ba; và là dẫn chứng cho mục bàn về giới hạn của thiết kế trên giấy trong báo cáo

Mục này gộp #50 vào cùng #7.
#50 là một thay đổi quy trình mỏng, chỉ thêm một dòng in ra địa chỉ mà bộ kiểm thử đang bắn vào, nên viết riêng một mục cho nó sẽ dài hơn chính thay đổi.
Theo `CLAUDE.md`, ticket quy trình mỏng thì gộp vào mục của ticket kế tiếp.

### Hai ticket đòi cái gì

#50 sinh ra từ chính lần triển khai của #6.
Bước 4 và bước 6 của quy trình tay là cùng một lệnh `npm test`, chỉ khác nhau ở biến `BASE_URL`, nên hai lần chạy để lại đầu ra giống hệt nhau.
Không có cách nào biết lần nào bắn vào đâu, và đó đúng là thứ đã che giấu sự cố của #5 suốt 65 phút.
Thay đổi là một dòng `console.log` lúc nạp module, đặt ở đó để nó có mặt cả khi bộ kiểm thử đỏ.

#7 đòi mỗi service cho biết hai chuyện khác nhau: tiến trình còn sống, và nó đã phục vụ được chưa.
Endpoint sẵn sàng phải phản ánh kết nối cơ sở dữ liệu, vì #13 sẽ dựa vào đúng tín hiệu này để quyết định chuyển lưu lượng hay huỷ bản mới.
Kèm theo là việc `waitForStack` chuyển sang chờ tín hiệu sẵn sàng thay vì chờ mã 400.

### Đã thay đổi những gì

Cả ba service phơi `/healthz` và `/readyz` qua một module dùng chung ở `services/shared/src/service.ts`, nginx chuyển tiếp chúng dưới `/internal/<service>/`.

`stats` vì vậy có máy chủ HTTP, thứ nó chưa từng có.
Đây không phải một quyết định kiến trúc mới nên không cần ADR: phần Consequences của `docs/adr/0004` đã viết rằng service phải phơi `/metrics` chuẩn Prometheus ngay từ đầu, mà "service" ở đó là cả ba, và `stats` không thể phơi `/metrics` nếu không nghe HTTP.
#7 chỉ làm việc đó đến sớm hơn #8 một ticket.
Hình dạng "chỉ có một cửa vào là nginx" không đổi, vì không service nào có mục `ports:`.

`waitForStack` giờ chờ `/readyz` của cả ba service.
Cổng gác cũ chờ service `link` đáp 400 cho một request thiếu `url`, mà nhánh 400 đó không chạm cơ sở dữ liệu, nên nó báo sẵn sàng trong lúc Postgres còn đang khởi động và test chạy ngay sau đó đỏ với mã 500.

### Chuyện đáng kể lại: thiết kế đã chốt vẫn hỏng

Thiết kế của #7 được chốt trọn vẹn trước khi viết dòng mã nào, ghi thành một comment trên ticket.
Nó đã lường trước cái bẫy khó nhất và viết hẳn ra:

> pg mặc định chờ vô hạn để lấy kết nối, nên khi Postgres bị `pause` thay vì `stop` thì `/readyz` sẽ treo chứ không trả 503. Với `stop` thì `ECONNREFUSED` về ngay, nên nếu chỉ thử `stop` sẽ tưởng là đã xong trong khi chưa.

Kết luận rút ra là đặt `connectionTimeoutMillis: 2000`.
Cài đúng như vậy, rồi đo, thì ra thế này:

| Kịch bản | link | redirect | stats |
|---|---|---|---|
| `stop postgres` | 503 sau 2.1s | 503 sau 2.1s | 503 sau 2.1s |
| `pause postgres` | **treo quá 30s** | 503 sau 2.1s | 503 sau 2.1s |

Thiết kế đúng ở chỗ nhận ra `pause` mới là kịch bản khó, và sai ở chỗ chẩn đoán nguyên nhân.
`connectionTimeoutMillis` chỉ chặn lúc pool phải **mở kết nối mới**.
Khi pool đang giữ sẵn một kết nối rỗi, câu lệnh được gửi đi trên socket cũ rồi chờ vô hạn một câu trả lời không bao giờ tới, và không có gì cắt nó.
Ba service khác nhau đúng ở chỗ đó: pool của `link` còn kết nối rỗi từ request nghiệp vụ ngay trước, hai service kia thì không.

Cách sửa là một pool riêng cho thăm dò, `max: 1`, có cả `connectionTimeoutMillis` lẫn `query_timeout`.
Hạn giờ cố ý không đặt lên pool nghiệp vụ, vì `query_timeout` sẽ chặt mọi câu lệnh ở 2 giây, trong đó có chu kỳ tổng hợp của `stats` quét cả bảng `visits`.
Với #21, nơi worker bị dừng có chủ đích rồi cho sống lại, chu kỳ đầu tiên phải xử lý cả đống tồn đọng; nếu nó bị chặt ở 2 giây thì lần nào cũng hết giờ và worker không bao giờ đuổi kịp.
Một cơ chế phục hồi tự khoá chính nó là thứ tệ hơn hẳn cái nó đổi lấy.

Cái giá của việc tách đã ghi thành chốt thứ tư trên #7, chứ không giấu: `/readyz` giờ báo sẵn sàng dựa trên một pool mà không request nghiệp vụ nào đi qua, nên pool nghiệp vụ cạn hoặc kẹt trong lúc Postgres vẫn khoẻ là kiểu hỏng mà tín hiệu này không bắt được.

### Vì sao việc này thuộc về đề tài

Đây không phải chuyện một thư viện có hành vi lạ.
Nó là dẫn chứng cho một luận điểm mà Chương 25 nói ở mức nguyên tắc: thiết kế trên giấy, dù kỹ tới đâu, cũng chỉ là giả thuyết cho tới khi có cái gì đó chạy thử nó.

Thiết kế này đã kỹ hơn mức thường thấy.
Nó nêu đúng kịch bản khó, nêu đúng lý do vì sao kịch bản dễ không đủ, và vẫn chốt sai một nửa nguyên nhân.
Cái bắt được sai không phải một lần đọc lại kỹ hơn, mà là hai câu lệnh `docker compose pause` rồi `curl`.

Từ đó ra một vế thứ ba cho Luận điểm, tiếp nối hai vế đã có:

- Mục của #5 nói tự động hoá thắng ở **tính lặp lại được**.
- Mục của #6 thêm **tính kiểm chứng được**: bản ghi thủ công do người thao tác tự khai, không có gì đối chiếu lời khai với thực tế.
- Mục này thêm **tính rẻ của phép thử**. Ở Giai đoạn thủ công, kiểm một tiêu chí như "ngắt cơ sở dữ liệu thì `/readyz` đổi trạng thái trong vài giây" tốn một bước tay, và tốn đủ để nó thành một dòng ghi chú riêng trong Nhật ký thủ công vì nó làm hỏng khả năng so sánh của mẫu đo. Sang Giai đoạn pipeline, cùng phép thử ấy chạy mỗi lần build mà không ai phải trả thêm gì. Chi phí của việc kiểm chứng chính là thứ quyết định người ta có kiểm chứng hay không.

### Mẫu đo thứ ba lớn hơn hai mẫu trước

Phải ghi rõ chỗ này, nếu không bảng lead time sẽ bị đọc sai.

#5 sửa một file service. #6 sửa một file service. #7 chạm ba service, `infra/nginx/nginx.conf`, `tests/`, và bốn file tài liệu.

Lối đi kia là tách phần `waitForStack` ra thành ticket riêng, nhưng chính #7 đã lập luận vì sao không nên: endpoint sẵn sàng mà #7 dựng lên chính là tín hiệu đúng mà cổng gác đang thiếu, nên tách ra thì ticket kia phải chờ #7 xong, và lúc đó chỉ còn vài dòng đổi địa chỉ, tức không đủ một việc có nghĩa.
Giữ nguyên và ghi rõ mẫu này lớn hơn thì lead time của nó vẫn dùng được, miễn là khi đọc bảng biết nó lớn hơn.

### Đã kiểm chứng thế nào

Vẫn theo bài học từ #5 và #6: việc kiểm chứng khi phát triển không được đụng vào chính môi trường sẽ được đo.

Bộ kiểm thử chạy trên stack thứ ba dựng riêng, project `a2-dev`, cổng 8099, file env nằm ngoài kho mã.
Xong việc thì `down -v` và xoá luôn image, xác nhận bằng mốc tạo của volume chứ không bằng việc lệnh chạy xong không báo lỗi.
Nhờ vậy `a2-staging` lẫn `a2-prod` không bị đụng tới trước lúc bấm giờ.

Chính stack dev này là nơi phát hiện `connectionTimeoutMillis` chưa đủ.
Nếu chỗ đó chỉ lộ ra lúc triển khai lên staging thì nó đã thành một lần phát hành thất bại, chứ không phải một lần sửa trước khi merge.

Hai tiêu chí nghiệm thu không có test tự động, và cả hai đều có lý do chứ không phải bỏ sót.
Tiêu chí "ngắt cơ sở dữ liệu" cần dừng Postgres, mà bộ kiểm thử chỉ được gửi HTTP theo tiêu chí nghiệm thu của #3; thêm nữa #13 sẽ dùng lại chính bộ test này làm smoke test cho blue-green, nơi một test tự dừng container là thứ không được phép tồn tại.
Tiêu chí triển khai tay thì thuộc về bước triển khai.

### Số liệu

| Mẫu | staging | prod | Sự cố |
|---|---|---|---|
| #5 | 2 phút | 5 phút | phát hành thất bại |
| #6 | 2 phút | 15 phút | phát hành thất bại |
| #7 | 2 phút | 1 phút | không |

Đây là **mẫu đầu tiên không có lần phát hành thất bại nào**.
Change failure rate của Giai đoạn thủ công đi từ 2/2 xuống 2/3.

Ba chỗ phải đọc kèm, không được lấy con số trần:

- **2 phút của staging đã gồm bước kiểm chứng tay dùng một lần.** Phần triển khai đúng nghĩa nhỏ hơn. Ghi chú nằm ở mục "Ghi chú khác" trong `docs/nhat-ky-thu-cong.md`.
- **1 phút của prod nhỏ hơn staging vì cache build của Docker đã nóng.** Lần build thứ hai chỉ chép lại `services/` chứ không chạy lại `npm ci`. Điều này đúng cho mọi mẫu, nhưng ở #7 nó lộ rõ vì không có sự cố nào che mất.
- **Mẫu này lớn hơn #5 và #6 về phạm vi thay đổi**, xem mục trên.

Con số 1 phút của prod là con số sạch nhất có được cho tới giờ về chi phí triển khai tay thuần tuý, khi không có sự cố và không có bước phụ.
Nó cũng là con số sẽ khó bị đánh bại ở Giai đoạn pipeline nếu chỉ nhìn thời gian tường: giá trị của pipeline không nằm ở chỗ nhanh hơn một phút, mà nằm ở ba vế đã nêu ở trên.

### Dẫn chứng

- Dòng in địa chỉ của #50: pull request #53
- Thay đổi mã và hai test mới của #7: pull request #54, commit `5a60048`
- Thiết kế chốt trước khi viết mã, và chốt thứ tư ghi sau khi đo: hai comment trên issue #7
- Số đo và ghi chú về bước phụ: pull request #55, `docs/nhat-ky-thu-cong.md`, mục "Ghi chú khác"
- Bằng chứng `/readyz` đổi trạng thái: bảng trong mục "#7 staging" của `docs/nhat-ky-thu-cong.md`

### Đang ở đâu sau mục này

Nhật ký thủ công có sáu dòng trên ba mẫu, và hai lần phát hành thất bại, cả hai đều thuộc về hai mẫu đầu.
Ba mẫu vẫn là ít, nhưng hình dạng đã bắt đầu đọc được: hai lần hỏng đầu đều do một bước trong quy trình tay bị bỏ sót, còn lần không hỏng là lần quy trình được chép nguyên khối và các dòng điều kiện được mở đúng.

Giai đoạn thủ công còn #8 (B4, endpoint metrics), #9 (B5, log có cấu trúc) và #10 (B6, đóng giai đoạn và tổng hợp số liệu mốc).

**#8 là ticket kế tiếp, và nó đã hết blocker.**
Nó gắn `/metrics` vào đúng máy chủ HTTP mà #7 vừa dựng lên cho cả ba service, nên phần dùng chung ở `services/shared/src/service.ts` sẽ lớn thêm chứ không phải viết lại.
Đây cũng là lý do #7 chọn viết module dùng chung thay vì chép ba lần.

Một chỗ cần để mắt khi làm #8: `services/shared/` hiện không phải một workspace npm và được import theo đường dẫn tương đối, vì Node không bóc kiểu cho file TypeScript nằm dưới `node_modules`.
Cách này chạy đúng và đã qua cả `npm ci` trong Docker, nhưng nếu #8 làm phần dùng chung phình lên đáng kể thì đây là chỗ đầu tiên nên xem lại.

## 2026-07-29 - Số liệu vận hành, và một lỗi mà hai mươi test xanh không thấy

**Ticket**: #8 (B4), #60
**Pull request**: #58, #59
**Phục vụ**: thay đổi cỡ chuẩn thứ tư của Giai đoạn thủ công, tức mẫu số liệu thứ tư; và là dẫn chứng cho mục bàn về giới hạn của cổng gác tự động trong báo cáo

Mục này gộp #60 vào cùng #8, theo đúng quy tắc mà chính #60 đi sửa trong `CONTEXT.md`.

### Ticket đòi cái gì

#8 đòi cả ba service phơi số liệu vận hành theo định dạng của Prometheus: số đếm request theo endpoint và mã trạng thái, phân bố độ trễ, và ít nhất hai số đếm nghiệp vụ.

Lý do làm ngay bây giờ, dù Prometheus phải tới #15 mới có, đã nằm sẵn trong phần Consequences của `docs/adr/0004`: gắn công cụ quan sát vào sau thì gần như miễn phí, còn làm ngược lại thì phải sửa cả ba service.
#7 đã trả trước một phần chi phí đó khi dựng máy chủ HTTP cho `stats`, nên #8 chỉ còn việc gắn thêm một đường dẫn vào chỗ đã có sẵn.

### Đã thay đổi những gì

Phần đo nằm ở `services/shared/src/metrics.ts`, cạnh module dùng chung mà #7 đã tạo: một registry, một middleware đếm request và đo độ trễ, và endpoint `/metrics`.
nginx nới khối regex `/internal/` để chuyển tiếp thêm `metrics`, nên `stats` vẫn với tới được dù nó không có mục `ports:` nào.

Ba quyết định đáng ghi.

**Nhãn `endpoint` lấy từ mẫu route, không lấy từ đường dẫn thô.**
Service `redirect` nhận `/:code`, nên nếu lấy `req.path` thì mỗi mã ngắn sinh một chuỗi thời gian riêng và Prometheus phình không giới hạn.
Lấy `req.route.path` thì mọi lượt chuyển hướng gom về đúng một nhãn, và request không khớp route nào gom về `unknown`, nên đường dẫn rác cũng không sinh nhãn mới.

**Counter nghiệp vụ khai báo ở từng service, không ở phần dùng chung.**
Ba service dùng chung một image, nên khai báo chung sẽ khiến cả ba cùng phơi cả ba số ở giá trị 0, và Prometheus gộp cùng một tên chỉ số từ ba job thì đếm đôi.

**Câu lệnh tổng hợp của worker được viết lại.**
`stats_visits_aggregated_total` cần số lượt, còn `rowCount` của câu lệnh cũ là số mã.
Phần ghi chuyển vào một CTE mà truy vấn ngoài không đọc tới; PostgreSQL vẫn chạy mọi câu lệnh sửa dữ liệu trong `WITH` đúng một lần và luôn tới cùng, nên tính nguyên tử đã lập luận ở #6 không đổi.

### Chuyện đáng kể lại: hai mươi test xanh và một lỗi vẫn còn

Bản đầu của nhánh đặt phần đo **sau** `express.json()` ở service `link`.

Bộ kiểm thử xanh toàn bộ, 20 trên 20, kể cả tám test mới viết riêng cho `/metrics`.
Lỗi vẫn còn nguyên ở đó.

Body JSON hỏng hoặc quá cỡ bị chính body-parser từ chối bằng `next(err)`, mà `next(err)` nhảy thẳng tới error handler và bỏ qua mọi middleware đăng ký sau nó.
Hệ quả là mọi mã 400 và 413 sinh ra ở tầng phân giải body biến mất khỏi `http_requests_total` lẫn histogram độ trễ, tức là mất đúng phần mà một số đếm phân theo mã trạng thái cần thấy nhất.

Không test nào bắt được, và lý do đơn giản đến mức khó chịu: mọi test đang có đều gửi JSON hợp lệ.
Test `tạo link thiếu url thì bị từ chối` cũng gửi JSON hợp lệ, chỉ là thiếu trường; nó đi qua body-parser trót lọt rồi mới bị handler từ chối, nên nó đi qua cả phần đo.

Cái bắt được là một lượt review đối chiếu mã với đặc tả, chạy như một bước riêng sau khi bộ test đã xanh.
Sau khi biết, viết test tái hiện chỉ mất vài dòng, và test đó đã được xác nhận là đỏ với thứ tự cũ trước khi sửa.

### Vì sao việc này thuộc về đề tài

Ba mục trước đã dựng ba vế cho Luận điểm: tính lặp lại được ở #5, tính kiểm chứng được ở #6, tính rẻ của phép thử ở #7.
Cả ba đều nghiêng về phía tự động hoá.
Mục này thêm vế thứ tư, và nó đi ngược chiều: **cổng gác tự động chỉ bắt được thứ đã có ai đó nghĩ ra cách kiểm.**

Điều này quan trọng vì nó chặn một cách đọc sai rất dễ xảy ra trong báo cáo A2.
Khi bảng số liệu cho thấy Giai đoạn pipeline thắng ở cả bốn chỉ số DORA, kết luận hấp dẫn là "tự động hoá thay được việc con người xem xét".
Lỗi vừa rồi là một phản ví dụ nằm ngay trong dữ liệu của chính đồ án: bộ kiểm thử đã xanh, và sang Giai đoạn pipeline nó sẽ xanh hệt như vậy, nhanh hơn, ở mọi lần build, mà vẫn không thấy gì.

Cái pipeline mua được không phải là khả năng phát hiện.
Nó là việc chạy lại thứ đã biết cách kiểm, với chi phí gần bằng không, mãi mãi.
Việc nghĩ ra cái cần kiểm vẫn nằm ngoài, và đó là chỗ Chương 25 đặt review cạnh change management chứ không coi cái này thay cái kia.

Có một hệ quả nhỏ đi kèm, đáng ghi vì nó lộ ra một ràng buộc ngầm: mục "Bảng lệnh" trong `docs/trien-khai-thu-cong.md` ghi rõ bước 4 và bước 6 phải thấy `pass 12`, nên việc thêm tám test làm con số đó sai.
Nó được sửa ngay trong cùng pull request, vì nó là thứ chính thay đổi này làm hỏng.
Ở Giai đoạn pipeline, ràng buộc kiểu này biến mất cùng với người đọc con số.

### Đã kiểm chứng thế nào

Vẫn theo nếp từ #5, #6 và #7: việc kiểm chứng khi phát triển không được đụng vào chính môi trường sẽ được đo.

Bộ kiểm thử chạy trên stack thứ ba dựng riêng, project `a2-dev`, cổng 8099, file env nằm ngoài kho mã.
Xong việc thì `down -v` và xoá luôn image, xác nhận bằng việc liệt kê lại container và volume chứ không bằng việc lệnh chạy xong không báo lỗi.

Tám test mới bám sát bốn tiêu chí nghiệm thu kỹ thuật, cộng thêm hai test giữ chỗ cho hai quyết định thiết kế ở trên: một test liệt kê mọi nhãn `endpoint` mà `redirect` sinh ra và đòi chúng nằm trong một danh sách đóng, một test đòi mỗi service chỉ phơi số đếm nghiệp vụ của chính nó.
Hai test đó không kiểm một hành vi người dùng thấy được; chúng kiểm rằng hai cái bẫy đã nhận diện không quay lại.

Tiêu chí triển khai tay thuộc về bước triển khai, như mọi mẫu trước.

### Số liệu

| Mẫu | staging | prod | Sự cố |
|---|---|---|---|
| #5 | 2 phút | 5 phút | phát hành thất bại |
| #6 | 2 phút | 15 phút | phát hành thất bại |
| #7 | 2 phút | 1 phút | không |
| #8 | 2 phút | 0 phút | không |

Hai mẫu liên tiếp không có lần phát hành thất bại nào.
Change failure rate của Giai đoạn thủ công đi từ 2/3 xuống 2/4.

Con số 0 phút của prod không phải một phép đo bằng không.
Nó là sàn phân giải của đồng hồ: Nhật ký thủ công ghi mốc theo phút, nên mọi khoảng ngắn hơn một phút đều rơi về 0.
Bước 5 lần này không build lại lớp nào vì `COPY services/ services/` báo `CACHED`, do bước 3 vừa build đúng nội dung đó cho staging; phần còn lại chỉ là xuất image và dựng lại container.
Ghi chú đầy đủ nằm ở mục "#8 prod" trong `docs/nhat-ky-thu-cong.md`.

Cột staging đứng yên ở 2 phút suốt bốn mẫu.
Đó là con số ổn định nhất có được cho tới giờ, và nó sẽ là mốc so sánh chính ở #22 chứ không phải cột prod, vì cột prod bị cache build của Docker làm nhiễu theo chiều luôn có lợi cho Giai đoạn thủ công.

### Dẫn chứng

- Bốn chốt thiết kế ghi trước khi viết mã: comment trên issue #8
- Thay đổi mã, tám test mới, và commit sửa lỗi thứ tự middleware: pull request #58, commit `eda7968`
- Test tái hiện lỗi thứ tự middleware: `tests/metrics.test.ts`, test `request bị từ chối trước khi vào route vẫn được đếm`
- Số đo và ghi chú về sàn phân giải: pull request #59, `docs/nhat-ky-thu-cong.md`, mục "Ghi chú khác"

### Đang ở đâu sau mục này

Nhật ký thủ công có tám dòng trên bốn mẫu, và hai lần phát hành thất bại, cả hai vẫn thuộc về hai mẫu đầu.
Hình dạng đã rõ hơn: hai lần hỏng đầu đều do một bước trong quy trình tay bị bỏ sót, còn hai lần gần nhất, khi quy trình được chép nguyên khối và các dòng điều kiện được mở đúng, đều sạch.
Điều này có nghĩa là cái tự động hoá sắp thay thế không phải một quy trình hay hỏng, mà là một quy trình chỉ đúng khi người thao tác không mệt.

Giai đoạn thủ công còn #9 (B5, log có cấu trúc) và #10 (B6, đóng giai đoạn và tổng hợp số liệu mốc).

**#9 là ticket kế tiếp, và nó đã hết blocker.**
Nó sẽ đụng lại đúng chỗ #8 vừa mở rộng, vì log có cấu trúc và số đếm request cùng đọc một thứ: mỗi request đi qua thì ai gọi, mất bao lâu, trả về mã gì.
Nên cân nhắc trước một chuyện: `services/shared/` sau #8 đã có hai file và sẽ có ba, mà nó vẫn không phải một workspace npm và vẫn được import theo đường dẫn tương đối.
Cách này chạy đúng và đã qua cả `npm ci` trong Docker qua hai mẫu triển khai, nhưng #9 là lúc hợp lý để quyết định giữ hay đổi, chứ không phải để nó lớn thêm rồi mới xét.

Sau #10 là hết Giai đoạn thủ công.
Từ #11 trở đi pipeline mới được dựng, và mọi con số của bốn mẫu hiện có sẽ trở thành mốc so sánh cố định, không sửa lại được nữa.

## 2026-07-29 - Log có cấu trúc, và một phần mà bộ kiểm thử không thể chạm tới

**Ticket**: #9 (B5), #64
**Pull request**: #62, #63
**Phục vụ**: thay đổi cỡ chuẩn cuối của Giai đoạn thủ công, tức mẫu số liệu thứ năm; và là dẫn chứng chính cho mục bàn về giới hạn của cổng gác tự động trong báo cáo

### Ticket đòi cái gì

#9 đòi toàn bộ log của ba service ghi ở dạng có cấu trúc, mỗi bản ghi nói được service nào, thời điểm nào, request nào, kết quả ra sao và mất bao lâu.
Thêm hai ràng buộc: trích được số liệu từ log bằng một lệnh, và không ghi địa chỉ đích đầy đủ của người dùng ở mức thông tin, chỉ ghi mã ngắn.

Đây là nguồn dữ liệu thứ hai bên cạnh `/metrics` cho ô Demo và đo lường của Rubric.
Hai nguồn không thay thế nhau: `/metrics` cho số đã cộng dồn sẵn, còn log giữ từng sự kiện, nên nó trả lời được câu hỏi chưa nghĩ ra lúc dựng chỉ số.
Chỗ này sẽ có ích cụ thể ở #21, nơi cần biết thời điểm hệ bắt đầu hỏng và thời điểm nó phục hồi; một counter không nói được thời điểm.

### Một quyết định phải chốt trước khi viết dòng mã nào

Mục trước để lại một câu hỏi mở: `services/shared/` sau #8 đã có hai file và #9 sẽ làm nó thành ba, mà nó vẫn được import theo đường dẫn tương đối.

Khi mở ra xem thì hiện trạng không phải như câu hỏi đó mô tả.
`package.json` ở gốc **đã** khai báo `workspaces: ["services/*"]` từ trước, nhưng `services/shared/` không có `package.json` nên npm bỏ qua nó.
Nghĩa là thư mục này không phải "chưa được dựng thành workspace", nó đang **cố ý đứng ngoài** một workspace đã có, và lý do nằm sẵn trong chú thích đầu `services/shared/src/service.ts`: Node không bóc kiểu cho file TypeScript nằm dưới `node_modules`, mà workspace thì phân giải qua đó.

Quyết định là giữ nguyên.
Lý do kỹ thuật ở trên vẫn đúng, và cách hiện tại đã qua `npm ci` trong Docker suốt bốn mẫu triển khai.

Nhưng lý do quyết định là lý do thứ ba, và nó không thuộc về kỹ thuật: **#9 là thay đổi cỡ chuẩn cuối của Giai đoạn thủ công.**
Đổi cấu trúc build ở đúng mẫu đo cuối cùng sẽ làm thời gian build của mẫu thứ năm không so sánh được với bốn mẫu trước, mà cột staging đứng yên ở 2 phút suốt bốn mẫu chính là con số ổn định nhất đang có và là mốc so sánh chính ở #22.
Một cải thiện cấu trúc đáng giá vào lúc khác trở thành một biến nhiễu vào lúc này.

Đây là loại đánh đổi mà đề tài cần ghi lại, vì nó cho thấy quyết định kỹ thuật trong một dự án có đo lường không chỉ bị chi phối bởi chất lượng mã.

### Đã thay đổi những gì

Phần dùng chung nằm ở `services/shared/src/log.ts`, cạnh `service.ts` và `metrics.ts` mà #7 và #8 đã tạo.
Không thêm dependency nào: `console.log(JSON.stringify(...))` đủ cho cả năm tiêu chí nghiệm thu, còn một thư viện log sẽ thêm hai gói vào cả ba service cho một bản ghi chỉ có sáu trường.

Ba quyết định đáng ghi.

**Tên service đi qua biến môi trường `SERVICE_NAME`, không qua tham số hàm.**
Ba service dùng chung một image nên tên không suy ra được từ mã, mà chính phần dùng chung trong `service.ts` cũng cần tới nó khi ghi lỗi thăm dò; truyền bằng tham số thì phải lan nó qua cả `mountProbes`.
Tên nằm trong từng bản ghi chứ không chỉ ở prefix của `docker compose logs`, vì prefix đó biến mất ngay khi log được gom về một chỗ.

**Error handler tự trả response thay vì gọi `next(err)`.**
Error handler mặc định của express in `err.stack` thô ra stderr, tức là để lại đúng một loại bản ghi không đọc được bằng máy, trong khi tiêu chí đầu tiên của #9 đòi **toàn bộ** log có cấu trúc.
Đổi lại là một thay đổi hành vi thật: thân của các response lỗi chưa bắt được chuyển từ HTML sang JSON.
Điều đáng chú ý ở đây là một yêu cầu về quan sát đã ép một thay đổi lên hình dạng của API, chứ không dừng ở tầng ghi log.

**Thứ tự đăng ký lặp lại đúng bài học của #8.**
Phần ghi log phải đứng trước `express.json()` ở service `link`, vì `next(err)` của body-parser bỏ qua mọi middleware đăng ký sau nó, nên đặt sai thì các mã 400 và 413 biến mất khỏi log y như chúng từng biến mất khỏi số đếm.
Nó cũng phải đứng trước phần đo, vì `mountMetrics` đăng ký cả route `/metrics`, nên gọi sau thì chính request scrape không được ghi.

### Chuyện đáng kể lại: cổng gác không phải không thấy, mà không có đường để nhìn

Mục trước kết luận rằng cổng gác tự động chỉ bắt được thứ đã có ai đó nghĩ ra cách kiểm.
Mục này đẩy nhận định đó sang một bậc khác về chất, và bậc đó mới là cái đáng đưa vào báo cáo.

Bộ kiểm thử của đồ án là hộp đen: nó chỉ gửi HTTP vào nginx, không import mã service và không nói chuyện với Postgres.
Ràng buộc này là tiêu chí nghiệm thu của #3, và nó có lý do tốt: đó là cách duy nhất bắt được lỗi nằm ở chỗ ghép nối giữa các thành phần chứ không nằm trong thành phần nào.

Nhưng log không đi ra qua HTTP.
Vì vậy không một test nào trong bộ kiểm thử có thể quan sát được thứ mà #9 vừa xây, và con số `pass 20` không đổi một đơn vị nào sau khi #9 xong.

Khác biệt so với #8 nằm ở chỗ đó.
Ở #8, lỗi thoát ra vì mọi test đang có đều gửi JSON hợp lệ; viết thêm một test là bắt được, và test đó đã được viết.
Ở #9 thì không có test nào để viết cả, trừ khi phá bỏ ràng buộc hộp đen, mà ràng buộc ấy chính là thứ đang bảo vệ phần còn lại của hệ.

Toàn bộ bốn tiêu chí nghiệm thu kỹ thuật của #9 vì vậy được nghiệm thu bằng tay, trên một stack dựng riêng, bằng những lệnh không nằm trong `npm test` và sẽ không bao giờ nằm trong đó.

Điều này chặn một cách đọc sai thứ hai, khác với cách đọc sai mà mục trước đã chặn.
Mục trước chống lại kết luận "tự động hoá thay được việc con người xem xét".
Mục này chống lại một kết luận tinh vi hơn: rằng cứ đầu tư đủ vào bộ kiểm thử thì sẽ tới lúc nó phủ hết.
Nó không phủ hết được, vì **chọn ranh giới kiểm thử là chọn luôn tập lỗi có thể bắt**, và mọi ranh giới đều để lại một phần nằm ngoài tầm nhìn.

Sang Giai đoạn pipeline, hai mươi test đó sẽ chạy ở mọi lần push, nhanh hơn, rẻ hơn, không quên lần nào.
Số lượng thứ chúng không nhìn thấy vẫn y nguyên.
Đó là lý do Chương 25 đặt review cạnh change management thay vì coi công cụ thay được cả hai.

### Đã kiểm chứng thế nào

Vẫn theo nếp từ #5 trở đi: việc kiểm chứng khi phát triển không được đụng vào chính môi trường sẽ được đo.
Stack thứ ba dựng riêng, project `a2-dev`, cổng 8099, file env nằm ngoài kho mã; xong việc thì `down -v` và xoá image, xác nhận bằng cách liệt kê lại container, volume và image chứ không bằng việc lệnh chạy xong không báo lỗi.

Vì bộ kiểm thử không với tới được phần này, bằng chứng phải dựng bằng tay và được ghi lại thành từng phép kiểm rời:

- 86 trên 86 dòng log phân giải được thành JSON, tức không còn bản ghi nào lọt ra ngoài dạng có cấu trúc
- địa chỉ đích không xuất hiện trong bất kỳ dòng nào, kiểm bằng cách tạo link tới một địa chỉ mang chuỗi nhận dạng rồi tìm chuỗi đó trong log của cả ba service
- request có body hỏng để lại đủ hai bản ghi, một `error` và một `info` mang mã 400, tức bài học thứ tự middleware của #8 không tái diễn
- nhánh lỗi của `/readyz` kiểm bằng cách `pause` Postgres thật, ghi ra bản ghi `level: "error"` đúng dạng, và stack lỗi nằm gọn một dòng nhờ `JSON.stringify` escape ký tự xuống dòng
- lệnh trích số liệu ghi trong `README.md` chạy thật và trả về bảng đếm request theo mã trạng thái

Lệnh đó viết bằng PowerShell với `ConvertFrom-Json` chứ không bằng `jq`, vì máy làm đồ án không có `jq`, và một tiêu chí nghiệm thu chỉ nghiệm thu được bằng công cụ không có sẵn thì không phải một tiêu chí.

Hai mươi test cũ vẫn xanh ở cả hai môi trường, và đó là toàn bộ những gì chúng nói được về #9.

### Số liệu

| Mẫu | staging | Sự cố |
|---|---|---|
| #5 | 2 phút | phát hành thất bại |
| #6 | 2 phút | phát hành thất bại |
| #7 | 2 phút | không |
| #8 | 2 phút | không |
| #9 | 2 phút | không |

Ba mẫu liên tiếp không có lần phát hành thất bại nào.
Change failure rate của Giai đoạn thủ công đi từ 2/4 xuống 2/5.

Cột prod cố ý vắng mặt khỏi bảng trên, vì khi đối chiếu để ghi mẫu thứ năm thì lộ ra rằng bảng ở mục trước tính cột đó theo hai cách khác nhau:

| Mẫu | Bảng của mục trước ghi | Hoàn tất prod trừ Bắt đầu | Hoàn tất prod trừ Hoàn tất staging |
|---|---|---|---|
| #5 | 5 phút | **5** | 3 |
| #6 | 15 phút | **15** | 13 |
| #7 | 1 phút | 3 | **1** |
| #8 | 0 phút | 2 | **0** |

Hai mẫu đầu tính từ mốc `Bắt đầu`, hai mẫu sau tính từ mốc `Hoàn tất` của staging.
Ghi chú "#8 prod" trong `docs/nhat-ky-thu-cong.md` phát biểu rõ ý định là cách thứ hai, nên hai mẫu đầu là chỗ lệch.
Với #9 thì con số ra 3 phút hay 1 phút tuỳ định nghĩa, tức chênh gấp ba.

Chỗ lệch này **không** được sửa ở đây, vì hai lý do.
Mục nhật ký cũ là bản ghi của một thời điểm, sửa lại nó thì mất dấu việc chỗ lệch từng tồn tại.
Và việc thống nhất định nghĩa một chỉ số thuộc đúng phạm vi của #10, ticket có tên là đóng Giai đoạn thủ công và tổng hợp số liệu mốc.

Điều quan trọng là bảng trong `docs/nhat-ky-thu-cong.md` không bị ảnh hưởng: nó cố ý chỉ chứa mốc giờ thô và không có cột nào tính sẵn, nên năm mẫu đo vẫn dựng lại được theo bất kỳ định nghĩa nào #10 chọn.
Đây là lần đầu quyết định thiết kế đó của #5 trả cổ tức.

Dòng staging của #9 có một ghi chú riêng: bước 3 kéo lại hai image nền, `postgres:17-alpine` và `nginx:1.29-alpine`, mỗi cái hơn 11 giây và chạy song song.
Bốn mẫu trước không có phần này.
Hai khoảng đó nằm trong đồng hồ theo đúng quy tắc không dừng đồng hồ giữa chừng, nên con số 2 phút của mẫu này "đắt" hơn con số 2 phút của bốn mẫu trước, dù chúng bằng nhau trên giấy.

### Dẫn chứng

- Quyết định về `services/shared/` và ba quyết định thiết kế: pull request #62, và thân commit `805a55c`
- Phần dùng chung: `services/shared/src/log.ts`
- Hình dạng bản ghi, ràng buộc quyền riêng tư, và lệnh trích số liệu: mục "Log" trong `README.md`
- Số đo và ghi chú về hai image nền: pull request #63, `docs/nhat-ky-thu-cong.md`, mục "Ghi chú khác"

### Đang ở đâu sau mục này

Nhật ký thủ công có mười dòng trên năm mẫu, và hai lần phát hành thất bại, cả hai vẫn thuộc về hai mẫu đầu.
Ba mẫu gần nhất đều sạch, nên hình dạng đã rõ và không đổi so với mục trước: quy trình tay này không hay hỏng, nó chỉ đúng khi người thao tác không mệt.

**Giai đoạn thủ công đã hết thay đổi cỡ chuẩn.**
#9 là cái cuối cùng, và năm mẫu đo đã đủ để #22 làm phép so sánh.

Còn đúng **#10** (B6, đóng Giai đoạn thủ công và tổng hợp số liệu mốc), và nó đã hết blocker.
#10 phải giải một việc mà mục này cố ý để lại: chốt định nghĩa của cột prod, rồi tính lại cả năm mẫu theo đúng một cách.
Cho tới khi việc đó xong thì mọi con số về chi phí triển khai prod của Giai đoạn thủ công đều chưa dùng được để so sánh.

Sau #10 là hết giai đoạn.
Từ #11 trở đi pipeline mới được dựng, và mọi con số của năm mẫu hiện có sẽ trở thành mốc so sánh cố định, không sửa lại được nữa.

---

## 2026-07-29 - Đóng Giai đoạn thủ công, và cái giá của việc chốt một định nghĩa muộn

**Ticket**: #10 (B6)
**Pull request**: #66
**Phục vụ**: cổng chặn của cả đồ án, mọi việc thuộc pipeline chỉ được bắt đầu sau mục này; đồng thời là bảng số mốc cho mục so sánh hai giai đoạn trong báo cáo

### Ticket đòi cái gì

#10 đòi biến năm mẫu đo của Giai đoạn thủ công thành một bảng số dùng được, gồm lead time trung bình và trung vị, tần suất triển khai, và một nhận xét về mức độ đồng đều của kích thước các thay đổi.

Nó cũng là cổng chặn.
Nếu số mẫu chưa đủ hoặc các thay đổi lệch cỡ nhau quá nhiều thì phải bổ sung thêm thay đổi cỡ chuẩn trước khi đóng, và pipeline phải chờ.

Ngoài ra #10 nhận hai việc mà mục trước cố ý để lại: cột prod đang được tính theo hai cách khác nhau, và định nghĩa của chính file này đang nói sai về chính nó.

### Đã thay đổi những gì

Ba file, không đụng một dòng mã nào của Hệ thống demo.

`docs/so-lieu-giai-doan-thu-cong.md` là file mới, chứa toàn bộ bảng số của giai đoạn.
Nó mở đầu bằng một bảng định nghĩa nói rõ mỗi đại lượng trừ mốc nào cho mốc nào, rồi mới tới số; thứ tự đó là cố ý, vì việc phải sửa ở #10 sinh ra chính từ chỗ trước đây có số mà không có định nghĩa.

`CONTEXT.md` và phần đầu file này sửa cùng một câu, và thêm một mục từ vựng mới.

### Việc thứ nhất: cột prod, và vì sao chọn cách trừ từ staging

Bảng ở mục của #8, tức "2026-07-29 - Số liệu vận hành, và một lỗi mà hai mươi test xanh không thấy", tính cột prod cho #5 và #6 theo mốc `Bắt đầu`, còn cho #7 và #8 theo mốc `Hoàn tất` của staging.
Với #9 thì hai cách cho ra 3 phút và 1 phút, chênh gấp ba.

Bảng đó từ đây được thay bằng bảng năm mẫu trong `docs/so-lieu-giai-doan-thu-cong.md`, mục "Bảng năm mẫu".
Nó không bị sửa đè, nên khi báo cáo trích số thì phải trích từ file mới chứ không từ mục nhật ký cũ.

Chỗ này chọn cách trừ từ `Hoàn tất` của staging, vì một lý do kiểm chứng được chứ không phải vì nó nhỏ hơn.

Hai dòng của cùng một thay đổi dùng chung mốc `Bắt đầu`, bởi người thao tác mở đúng một phiên rồi chạy staging trước, prod sau.
Cách trừ từ staging là cách duy nhất giữ được đẳng thức `chờ + staging + prod = lead time`; cách kia làm cột prod nuốt trọn cột staging vào bên trong, nên hai cột cộng lại sẽ đếm đôi khoảng chung.
Đẳng thức đó không phải chuyện thẩm mỹ: nó là thứ khiến bảng tự kiểm được, và nó đã được kiểm cho cả năm mẫu.

Cái giá phải trả được ghi ngay cạnh bảng.
Con số ở cột prod là chi phí biên của môi trường thứ hai, không phải chi phí một lần triển khai prod độc lập, vì bước 5 hưởng nguyên cache build mà bước 3 vừa tạo.
Mẫu #8 cho thấy điều đó ở dạng thuần nhất, khi lớp `COPY services/ services/` báo `CACHED` và cột prod rơi về 0 phút.
Giai đoạn thủ công không có mẫu nào đo được chi phí prod đứng một mình, và đó là một giới hạn của bộ dữ liệu chứ không phải một con số cần đi tìm thêm.

### Chuyện đáng kể lại: hai con số cho cùng một mẫu, và vì sao trung vị thắng

Khi tính lại cả năm mẫu theo một luật thì #5 lộ ra một chỗ mà không luật nào xử lý được.

Bảng ghi prod của #5 xanh lúc `2026-07-28T15:18`, và mục đính chính trong Nhật ký thủ công đã chứng minh mốc đó sai: `down -v` chưa bao giờ chạy, prod hỏng liên tục, và schema của #5 chỉ thật sự có mặt trên prod lúc `2026-07-28T16:21`, trong lần triển khai của #6.
Đọc theo mốc đã ghi thì lead time của #5 là 14 phút; đọc theo nghĩa "thay đổi chạy được trên prod" thì là 77 phút.

Cả hai đều có lý, và không có cách nào chọn một mà không mất cái kia, nên bảng ghi cả hai.
Bảng chính giữ 14 phút, vì đó là con số duy nhất tính được bằng cùng một luật với bốn mẫu còn lại, và vì luật đo của đồ án định nghĩa `Hoàn tất` là lúc bộ kiểm thử báo xanh chứ không phải lúc hệ thật sự đúng.

Điều đáng kể lại là hệ quả lên hai chỉ số, trích từ mục "Lead time của #5 có một giá trị thứ hai" trong `docs/so-lieu-giai-doan-thu-cong.md`:

| Cách tính lead time của #5 | Trung bình | Trung vị |
|---|---|---|
| Theo mốc đã ghi, 14 phút | 8,6 | 5 |
| Theo mốc phục hồi thật, 77 phút | 21,2 | 5 |

Trung bình chênh gần hai lần rưỡi.
Trung vị không nhúc nhích.

Vì vậy #22 phải lấy trung vị làm số chính khi so sánh hai giai đoạn, còn trung bình chỉ đi kèm để nói về đuôi phân phối.
Với cỡ mẫu bằng năm thì một mẫu bất thường đủ sức lái trung bình đi bất cứ đâu, và bộ dữ liệu này vừa cho thấy chuyện đó bằng chính nó chứ không bằng lý thuyết.

### Việc thứ hai: một định nghĩa nói sai về chính nó

`CONTEXT.md` và phần đầu file này cùng viết rằng Nhật ký dự án "không chứa số đo nào".
Nhưng bốn mục gần nhất đều có phần `### Số liệu`, và mục của #9 có tới hai bảng số.
Thực tế đã lệch khỏi định nghĩa từ ngày 2026-07-28, và mục này thì sắp thêm một bảng nữa.

Đây cùng loại với chỗ lệch mà #60 đã gỡ trong đúng đoạn văn đó, chỉ là câu còn lại.

Cách sửa là làm rõ ý định thật thay vì siết thực tế cho khớp câu chữ cũ.
Điều cần chống không phải là con số xuất hiện trong file kể chuyện, mà là hai file cùng làm nguồn sự thật cho một con số, vì lúc chúng lệch nhau thì không ai biết file nào đúng.
Câu mới vì vậy là "không chứa số đo **gốc**", kèm ràng buộc rằng mốc giờ thô chỉ nằm ở Nhật ký thủ công và mục nào trích số dẫn xuất thì phải trỏ được về đó.

Đồ án bây giờ có ba file mang số, nên `CONTEXT.md` nhận thêm mục từ vựng **Số liệu mốc** để lần sau không ai phải đoán file nào giữ vai trò gì:

| File | Vai trò |
|---|---|
| `docs/nhat-ky-thu-cong.md` | Mốc giờ thô, không có cột tính sẵn. Nguồn sự thật. |
| `docs/so-lieu-giai-doan-thu-cong.md` | Số dẫn xuất, kèm công thức. Tính lại được từ file trên. |
| `docs/nhat-ky-du-an.md` | Kể chuyện, trích số khi câu chuyện cần. |

### Vì sao việc này thuộc về đề tài

Chương 25 gồm bốn phần, và phần dễ bị hiểu nhầm nhất là quản lý phiên bản không chỉ áp cho mã.

Hai việc mà #10 vừa giải đều không phải việc về mã, và cả hai đều là lỗi cấu hình theo đúng nghĩa của chương: một định nghĩa chỉ số bị hai chỗ hiểu khác nhau, và một tài liệu mô tả sai trạng thái của chính hệ mà nó mô tả.
Chúng không làm hệ thống hỏng, nên không cổng gác nào bắt được; chúng làm **số liệu** hỏng, mà số liệu mới là sản phẩm của giai đoạn này.

Có một điểm nữa đáng đưa vào báo cáo, và nó không hiển nhiên.
Bảng ở `docs/nhat-ky-thu-cong.md` được thiết kế từ #5 với đúng một quy tắc là không chứa cột nào tính sẵn.
Nhờ vậy khi phát hiện cột prod bị tính hai cách, không có dữ liệu nào phải bỏ và không lần triển khai nào phải làm lại: cả năm mẫu dựng lại được theo định nghĩa mới trong vài phút.
Nếu bảng đó đã lưu sẵn số phút thì chỗ lệch này sẽ tốn năm lần triển khai tay để sửa, mà giai đoạn thì đã hết thay đổi cỡ chuẩn để triển khai.
Tách dữ liệu thô khỏi số dẫn xuất là một quyết định rẻ lúc dựng và đắt lúc thiếu, và đây là lần thứ hai nó trả cổ tức.

### Cổng đóng giai đoạn

Bốn điều kiện của #10 đều đạt.

Nhật ký thủ công có 10 lần triển khai một môi trường trên 5 thay đổi, vượt mức tám mà tiêu chí nghiệm thu đòi.
Lead time trung bình 8,6 phút và trung vị 5 phút.
Tần suất là 5 lần lên prod trong cửa sổ 18 giờ.
Kích thước các thay đổi đủ đồng đều, với ba cảnh báo đã ghi.

Không cần bổ sung thay đổi cỡ chuẩn nào nữa, nên giai đoạn đóng tại đây.

### Số liệu

Bảng đầy đủ ở `docs/so-lieu-giai-doan-thu-cong.md`; phần dưới chỉ là bốn con số sẽ bị nhắc lại nhiều nhất.

| Chỉ số | Giai đoạn thủ công |
|---|---|
| Lead time, trung vị | 5 phút |
| Lead time, trung bình | 8,6 phút |
| Tần suất triển khai prod | 5 lần trong 18 giờ |
| Change failure rate | 2 trên 5, tức 40% |

Ba cảnh báo đi kèm, không được trích số mà bỏ chúng lại.

Cột staging đứng yên ở 2 phút suốt năm mẫu, nhưng đó là do đồng hồ chỉ phân giải tới phút, không phải do quy trình ổn định tới mức đó.
Tần suất triển khai trông cao vì mẫu số là thời gian của một đợt làm dồn; ràng buộc thật của giai đoạn này là mỗi lần triển khai đều cần một người có mặt gõ lệnh.
Và tỷ lệ 40% không có nghĩa là hai trong năm thay đổi bất kỳ sẽ hỏng, vì cả hai lần hỏng đều truy về đúng một thay đổi schema, mà #5 lại là thay đổi schema duy nhất của giai đoạn.

Cảnh báo thứ ba kéo theo một yêu cầu lên Giai đoạn pipeline: phải có ít nhất một thay đổi đụng `infra/postgres/init.sql`, nếu không thì change failure rate của hai giai đoạn không so được với nhau.

### Dẫn chứng

- Bảng số và toàn bộ công thức: `docs/so-lieu-giai-doan-thu-cong.md`
- Mốc giờ thô của cả năm mẫu: `docs/nhat-ky-thu-cong.md`, mục "Bảng"
- Bằng chứng cho lead time 77 phút của #5: cùng file, mục "Đính chính, phát hiện lúc triển khai #6"
- Bảng cũ tính cột prod theo hai cách, giữ nguyên không sửa đè và đã bị thay: mục "2026-07-29 - Số liệu vận hành, và một lỗi mà hai mươi test xanh không thấy" của file này, tức mục của #8

### Đang ở đâu sau mục này

**Giai đoạn thủ công đã đóng.**
Năm mẫu đo là mốc cố định từ đây tới hết đồ án, và không được ghi thêm dòng nào vào `docs/nhat-ky-thu-cong.md` nữa.
Nhóm B hết ticket.

Từ đây pipeline được phép dựng, bắt đầu ở **#11** (C1, reusable workflow kiểm thử và đóng gói image), ticket đã hết blocker.
#15 (D1, Prometheus và Grafana trong compose) cũng vừa được gỡ chặn bởi mục này.

Hai thứ mục này để lại cho các ticket sau, cả hai đều đã ghi vào `docs/so-lieu-giai-doan-thu-cong.md` chứ không chỉ nằm ở đây.

Thứ nhất, Giai đoạn pipeline cần ít nhất một thay đổi đụng `infra/postgres/init.sql`, nếu không thì change failure rate của hai giai đoạn không so được.
Thứ hai, #22 phải lấy trung vị làm số chính chứ không phải trung bình, vì lý do đã trình bày ở phần về #5.

Còn một điều cần nhớ khi sang giai đoạn sau, và nó không nằm trong ticket nào.
Từ #11 trở đi sẽ không còn ai gõ lệnh triển khai nữa, nên cũng không còn ai bấm giờ.
Mốc thời gian của Giai đoạn pipeline phải lấy từ GitHub Actions, và cách lấy nó cần được chốt sớm chứ không phải lúc #22 ngồi tính.

---

## 2026-07-29 - Mốc đầu của Giai đoạn pipeline, và một cái tag nói dối

**Ticket**: #11 (C1)
**Pull request**: #68
**Phục vụ**: mục 25.2 và 25.4 của báo cáo, phần continuous integration và build; đồng thời là dẫn chứng chính cho ô Reuse & trade-off của rubric

### Ticket đòi cái gì

#11 đòi một workflow dùng chung cho cả ba service, chạy trên mỗi pull request: cài phụ thuộc, kiểm tra kiểu, lint, chạy bộ kiểm thử qua nginx, rồi đóng gói image và đẩy lên registry với tag theo commit.
Kèm theo là hai tiêu chí không nói về việc chạy được: pull request có kiểm thử trượt thì không merge được, và thời gian chạy từng bước phải đọc được từ giao diện Actions để về sau còn đo lead time.

Đây là thay đổi mở màn Giai đoạn pipeline, tức thay đổi đầu tiên sau khi #10 đóng sổ Giai đoạn thủ công.
Nó cũng là ticket đầu tiên mà cả hai giai đoạn cùng tồn tại trong repo, nên phần khó nhất không phải viết YAML mà là nói rõ biến nào vừa đổi và biến nào cố tình giữ nguyên.

### Đã thay đổi những gì

Bốn thứ, không đụng một dòng nào trong `services/`.

`.github/workflows/ci.yml` là cổng gác của mọi pull request.
Job `kiem-tra` chạy `npm run typecheck`, `npm run lint`, `docker compose up --build` rồi `npm test`; job `dong-goi` chỉ chạy khi `kiem-tra` xanh.
Workflow chạy trên cả `push` vào `main`, vì merge bằng squash sinh ra một commit mới chứ không phải commit head của pull request, mà commit mới ấy lại đúng là commit #12 sẽ phải triển khai.

`.github/workflows/image.yml` là đơn vị dùng lại, khai báo `workflow_call`, nhận vào một input `tag` và đẩy `ghcr.io/hugolee12/a2-configuration-management:<sha>`.

`oxlint` được thêm vào vì repo chưa có linter nào, mà tiêu chí nghiệm thu đòi lint là một cổng gác riêng bên cạnh `tsc`.
Chọn oxlint vì nó là đúng một devDependency và chạy được không cần file cấu hình; bộ mã hiện tại sạch nên không phải sửa dòng nào.

Branch protection của `main` nhận thêm `required_status_checks` với context `kiem-tra` và `strict: true`.
Đây là thay đổi cấu hình trên GitHub chứ không nằm trong file nào của repo, giống hệt tình huống của #2, nên nó chỉ để lại dấu vết ở mục này và ở thân pull request #68.

### Chỗ đi lệch khỏi ticket, và vì sao tham số hoá theo service là dẫn chứng sai

#11 viết rõ là workflow "nhận tham số là tên service".
Bản merge không nhận tham số đó, và đây là lựa chọn có chủ đích chứ không phải bỏ sót.

Lý do nằm ở một quyết định cũ hơn, từ #3.
Ba service đã dùng chung đúng một `Dockerfile`, một image và một npm workspace; container nào chạy service nào là do `command` trong `compose.yaml` quyết định.
Bộ kiểm thử thì là hộp đen chạy trên cả stack và không tách theo service được.
Nghĩa là ở mức CI không còn việc gì là riêng của từng service nữa: một input `service` sẽ chỉ đổi được cái tên trên tag, trong khi ba image sinh ra giống nhau tới từng byte.

Đẩy ba tag như vậy sẽ là **dẫn chứng sai** cho ô Reuse của rubric, vì nó khoe một sự tái sử dụng ở đúng tầng mà repo đã không còn vấn đề đó nữa.
Ba bản sao chép chỉ là lãng phí khi chúng thật sự khác nhau; ở đây chúng sẽ giống nhau, nên việc gộp chúng lại không chứng minh được điều gì.

Chỗ tái sử dụng thật vì vậy được đặt **giữa các workflow** thay vì giữa ba service.
`image.yml` là `workflow_call`, `ci.yml` gọi nó hôm nay, và #12 với #13 sẽ gọi lại chính file đó thay vì chép bước build sang chỗ khác.
Hai tiêu chí nghiệm thu liên quan vẫn đạt nguyên văn: ba service dùng chung một base image, và image được đẩy lên GHCR với tag theo commit.

Đây là vật liệu cho vế "phân tích lựa chọn" của ô Reuse & trade-off, đi cạnh `docs/adr/0004-ha-tang-phat-hanh-va-do-luong.md`.
ADR đó viết trước khi có mã, và câu của nó là "ba service dùng chung một reusable workflow"; mục này là chỗ ghi lại rằng khi đi vào chi tiết thì trục tái sử dụng đã dịch một tầng, và vì sao dịch.
Báo cáo nên trích cả hai chứ không chỉ trích ADR, vì một quyết định kiến trúc được kiểm chứng rồi điều chỉnh thì đáng kể hơn một quyết định được chép lại y nguyên.

### Một cái tag nói dối, cùng họ với hai việc của #10

Bản đầu của pull request #68 để `actions/checkout` chạy với thiết lập mặc định.

Trên sự kiện `pull_request`, mặc định ấy lấy `refs/pull/N/merge`, tức commit merge tạm mà GitHub dựng ra để thử ghép nhánh vào `main`.
Commit đó không tồn tại trên nhánh nào và sẽ biến mất.
Hệ quả là image mang nội dung của commit tạm, nhưng lại đeo tag là SHA của commit thật trên nhánh.

Điều đáng nói là không có gì báo động cả.
Toàn bộ hai mươi test vẫn xanh, image vẫn dựng được, vẫn đẩy được lên GHCR, vẫn chạy được nếu đem ra kéo về.
Thứ hỏng là **mối tương ứng giữa cái tag và nội dung bên trong**, tức đúng mắt xích truy vết mà #22 cần để nối một thay đổi với lần triển khai của nó.

Lỗi này được bắt bởi code review, không bởi test, và không có cổng gác tự động nào trong repo có khả năng bắt nó.
Đó là điều làm nó cùng họ với hai việc mà #10 vừa gỡ: một định nghĩa chỉ số bị hai chỗ hiểu khác nhau, và một tài liệu mô tả sai trạng thái của chính hệ mà nó mô tả.
Cả ba đều không làm hệ thống hỏng, nên không test nào đỏ; cả ba đều làm **số liệu** hỏng, mà số liệu mới là sản phẩm của đồ án này.

Cách sửa là chỉ đích danh ref trong `image.yml`, `ref: ${{ inputs.tag }}`, và lấy tag từ `github.event.pull_request.head.sha` chứ không từ `github.sha`.
Cả hai chỗ đều có comment giải thích ngay tại chỗ, vì đây là loại lỗi mà lần sau nhìn vào sẽ thấy dòng `ref:` là thừa.

Có một chi tiết nhỏ hơn cùng lúc: giá trị của biểu thức đi vào thân script qua `env:` chứ không nội suy thẳng, vì `tag` là đầu vào do phía gọi truyền vào và một reusable workflow thì không được tin đầu vào của nó.

### Cổng gác phải kiểm cả chiều đỏ

Tiêu chí "pull request có kiểm thử trượt thì không merge được" không nghiệm thu được bằng cách nhìn một lần chạy xanh.
Một lần chạy xanh chỉ chứng minh workflow chạy, không chứng minh nó chặn.

Nên nó được kiểm bằng cách làm hỏng thật.
Commit `7269971` cố ý thêm một test trượt vào nhánh, và ba thứ xảy ra đúng như mong đợi: `kiem-tra` đỏ, pull request chuyển sang `mergeStateStatus: BLOCKED`, và job `dong-goi` bị `SKIPPED` nên không có image nào được đẩy cho một commit hỏng.
Commit `7e2744a` gỡ file đó ra và pull request trở lại `CLEAN`.

Hai commit ấy cố ý được giữ lại trong lịch sử nhánh, vì lần chạy đỏ gắn với SHA của chúng chính là bằng chứng; squash merge thì không đưa chúng lên `main` nên lịch sử trunk vẫn sạch.

Cách nghiệm thu này cần được lặp lại chứ không chỉ ghi lại.
#13 phải chứng minh rollback tự động **có chạy** khi phát hành hỏng, và #21 thì cả bài toán là tiêm lỗi rồi đo thời gian phục hồi.
Cả hai đều không nghiệm thu được bằng một lần chạy thành công, đúng như ở đây.

### Vì sao việc này thuộc về đề tài

Chương 25 đặt continuous integration ở 25.2 và build ở 25.4, và cả hai phần đều nói về cùng một ý: tự động hoá không có giá trị nếu không ai tin được đầu ra của nó.

Ba việc trong mục này đều là về chữ "tin" đó chứ không về chữ "tự động".
Cổng gác được kiểm cả chiều đỏ thì mới tin được là nó chặn.
Tag được buộc chặt vào nội dung thì mới tin được là image nào ứng với thay đổi nào.
Và trục tái sử dụng được đặt đúng chỗ thì con số về công sức tiết kiệm được mới có nghĩa.

Bài học của #10 lặp lại ở đây với một hình dạng khác.
Lần đó, thứ hỏng là một định nghĩa; lần này, thứ suýt hỏng là một tham chiếu.
Cả hai đều nằm ngoài tầm với của bộ kiểm thử, và cả hai đều được bắt bởi một người đọc lại chính thứ mình vừa viết.

### Biến vừa đổi, và ba món nợ

Đây là chỗ phải nói cho chính xác, nếu không thì phép so sánh ở #22 không giải thích được.

Từ mục này, **build không còn làm tay nữa**.
Nhưng **triển khai thì vẫn làm tay**, theo `docs/trien-khai-thu-cong.md`, cho tới khi #12 tự động hoá staging và #13 tự động hoá prod.
Nghĩa là hai giai đoạn hiện đang khác nhau ở **một phần** của biến chứ chưa khác trọn vẹn, và mọi con số đo trong khoảng giữa này đều là số của một trạng thái lai.

Ba món nợ, đều đã ghi trong pull request #68 và nhắc lại ở đây vì thân pull request không phải nơi người viết báo cáo tìm tới.

**Image được đẩy không phải image đã qua kiểm thử.**
`kiem-tra` dựng bằng `compose --build` để có stack mà chạy test, còn `dong-goi` dựng lại từ đầu ở một job khác.
Cùng nội dung nên rủi ro thấp, nhưng về nguyên tắc thì thứ được kiểm và thứ được phát hành là hai artefact khác nhau, và nó tốn thêm thời gian trên mỗi lần chạy.

**Mỗi thay đổi để lại hai lần chạy**, một ở pull request và một trên `main` sau khi squash.
#67 phải nói rõ lần nào được tính vào lead time, vì chọn nhầm thì con số lệch đi cả một vòng chạy mà vẫn trông hợp lý.

**`oxlint` chạy không có file cấu hình** nên chỉ bật nhóm rule mặc định.
Báo cáo đừng trích "đã có lint" mà không nói là ở mức nào.

### Số liệu

Mục này cố ý không có bảng số, và lý do của việc đó đáng ghi lại.

Giai đoạn pipeline đã có mẫu đo đầu tiên chạy thật trên runner, nhưng chưa có định nghĩa để đọc nó.
GitHub Actions phơi ra `created_at`, `run_started_at`, `updated_at` của một workflow run và `started_at`, `completed_at` của từng job, mỗi trường cho ra một con số trông hợp lý.
Chốt trường nào là mốc chính thức thuộc phạm vi #67, và đó chính là bài học của #10 được áp dụng sớm một lần: định nghĩa phải có mặt trước mẫu đo, không phải sau.

Con số duy nhất trích ở đây là con số không cần định nghĩa mới đọc được.
Bộ kiểm thử chạy trên runner cho `tests 20 / pass 20 / fail 0`, đúng bằng con số của Giai đoạn thủ công, nên việc chuyển sang chạy tự động không đổi tập lỗi mà nó nhìn thấy.
Ranh giới hộp đen của #3 vẫn nguyên, và nhận xét ở mục của #9 vẫn đúng nguyên văn: chúng chạy nhanh hơn, rẻ hơn, không quên lần nào, còn số lượng thứ chúng không nhìn thấy thì y nguyên.

### Dẫn chứng

- Lập luận về việc không tham số hoá theo service: comment đầu file `.github/workflows/image.yml`, và thân pull request #68
- Lỗi tag không khớp nội dung và cách sửa: comment tại bước `actions/checkout` trong `.github/workflows/image.yml`, và tại input `tag` trong `.github/workflows/ci.yml`
- Bằng chứng cổng gác chặn được: các lần chạy Actions gắn với commit `7269971` và `7e2744a` trên nhánh của pull request #68
- Lần chạy xanh đầu tiên và image tương ứng: commit `53fd4f5`, log của job xác nhận `HEAD is now at 53fd4f5`
- Quyết định kiến trúc gốc: `docs/adr/0004-ha-tang-phat-hanh-va-do-luong.md`
- Trạng thái pipeline hiện tại theo góc nhìn người dùng repo: mục "Pipeline" trong `README.md`

### Đang ở đâu sau mục này

**Giai đoạn pipeline đã mở**, và build là phần đầu tiên rời khỏi tay người.
Triển khai vẫn làm tay, nên `docs/trien-khai-thu-cong.md` vẫn còn hiệu lực; `docs/nhat-ky-thu-cong.md` thì không, nó đã đóng sổ ở #10 và không nhận thêm dòng nào.

Ticket kế tiếp là **#67** (C0, chốt cách lấy mốc thời gian của Giai đoạn pipeline từ GitHub Actions), đã hết blocker nhờ mục này vì nó cần ít nhất một workflow run thật để kiểm chứng các trường.
Nó nên được làm trước #12, vì #12 sẽ sinh thêm mẫu đo và mọi mẫu chạy trước khi định nghĩa được chốt đều mang rủi ro phải đọc lại.

**#12** (C2, triển khai staging tự động kèm smoke test) cũng đã hết blocker và sẽ là chỗ gọi lại `image.yml` lần đầu, tức phép thử thật cho quyết định về trục tái sử dụng ở trên.

Còn **#70**, một ticket mở sau pull request #68: `CONTRIBUTING.md` và `docs/trien-khai-thu-cong.md` đều bị lệch khi ranh giới giai đoạn dịch chuyển, và cả hai đều mô tả đường đi của một thay đổi nên để lệch thì #22 dựng lại sai.

Một yêu cầu từ mục trước vẫn còn nguyên và chưa ticket nào nhận: Giai đoạn pipeline cần ít nhất một thay đổi đụng `infra/postgres/init.sql`, nếu không thì change failure rate của hai giai đoạn không so được với nhau.

---

## 2026-07-29 - Không còn ai bấm giờ, và hai tài liệu vẫn bảo bấm

**Ticket**: #67 (C0) và #70
**Pull request**: #72 và #73
**Phục vụ**: điều kiện tiên quyết của #22, tức ô Demo & đo lường của rubric và phần đo lường của báo cáo; #70 phục vụ thêm mục 25.3 Change management

### Vì sao hai ticket đi chung một mục

Hai ticket này là hai nửa của cùng một sự kiện, nên tách ra hai mục thì phải kể lại cùng một bối cảnh hai lần.

Sự kiện là ranh giới giai đoạn dịch chuyển ở #10 và #11.
Từ đó không còn ai gõ lệnh build nên cũng không còn ai bấm giờ, mà đồng hồ thì vẫn phải chạy tiếp bằng cách khác.
#67 chốt cách đọc đồng hồ mới.
#70 gỡ chỗ tài liệu vẫn còn bảo người ta bấm cái đồng hồ cũ.

#70 lại là ticket quy trình mỏng, chỉ sửa hai file tài liệu, nên luật ở đầu file này cho phép gộp nó vào mục của ticket kế tiếp thay vì viết riêng.

### Ticket đòi cái gì

#67 đòi chốt bằng văn bản xem mốc thời gian của Giai đoạn pipeline lấy từ trường nào của GitHub Actions, mốc nào của giai đoạn này ứng với cột nào của `docs/nhat-ky-thu-cong.md`, và chỗ nào không ứng được thì phải ghi rõ chênh lệch.
Nó chỉ chốt định nghĩa và kiểm chứng rằng trích được thật; việc tính bốn chỉ số DORA thuộc về #22.

#70 đòi sửa hai tài liệu mô tả đường đi của một thay đổi, cả hai đều lệch sau khi ranh giới dịch chuyển.
`CONTRIBUTING.md` mô tả việc bảo vệ `main` như thể chỉ có một cổng gác.
`docs/trien-khai-thu-cong.md` thì nửa còn hiệu lực nửa đã chết, và cái nửa đã chết đang chỉ người đọc ghi vào một file cấm ghi.

### Đã thay đổi những gì

Bốn file, trong đó một file mới, và không đụng một dòng mã nào của Hệ thống demo.

`docs/nhat-ky-pipeline.md` là file mới, giữ đúng vai trò mà `docs/nhat-ky-thu-cong.md` giữ cho giai đoạn trước: nó là chỗ giữ mốc giờ thô, và nó cố ý không có cột nào chứa số đã tính sẵn.
Khác một điểm, và khác vì hoàn cảnh chứ không vì lựa chọn.
Giai đoạn thủ công có một người bấm giờ nên mốc chỉ tồn tại nếu người đó ghi lại; Giai đoạn pipeline thì máy ghi hộ, nên phần khó không phải là ghi mà là chọn đúng trường trong số nhiều trường gần giống nhau, rồi chép nó vào kho mã trước khi GitHub xoá đi.

`CONTEXT.md` nhận thêm một mục từ vựng cho file mới.

`CONTRIBUTING.md` và `docs/trien-khai-thu-cong.md` là phần của #70.

### Bài học của #10, lần này áp dụng trước chứ không phải sau

Đây là điểm đáng kể nhất của #67, và nó không nằm trong bất kỳ dòng nào của tài liệu mới.

Mục của #8 tính cột prod theo hai cách khác nhau mà không ai nhận ra, vì định nghĩa chưa bao giờ được viết ra.
Tới lúc #10 phát hiện thì cùng một mẫu cho ra 3 phút hay 1 phút tuỳ cách đọc.
Lần đó cứu được là nhờ `docs/nhat-ky-thu-cong.md` chỉ giữ mốc thô, nên cả năm mẫu dựng lại được theo định nghĩa mới.

Giai đoạn pipeline không có sẵn chỗ dựa đó, vì dữ liệu nằm ở phía GitHub và có hạn sử dụng.
Log của job bị xoá theo chính sách lưu giữ, mặc định 90 ngày với kho công khai, và con số đó là trần chứ không phải cam kết.
Nếu để tới #22 mới chọn trường thì log đã mất, còn câu hỏi lần chạy nào ứng với thay đổi nào thì phải suy lại từ lịch sử chứ không đọc thẳng ra được.

Nên #67 được làm khi Giai đoạn pipeline mới có đúng hai workflow run.
Định nghĩa có mặt trước mẫu đo, không phải sau.
Đây là chỗ báo cáo nói được về configuration management như một kỷ luật chứ không phải một bộ công cụ: cùng một bài học, lần đầu phải trả giá, lần sau trả trước.

### Ba trường trông đều hợp lý, và vì sao hai trường kia bị loại

GitHub Actions phơi ra nhiều trường thời gian gần giống nhau, và chọn nhầm trường nào cũng cho ra một con số trông hợp lý.
Ba lựa chọn dưới đây đều có một trường đối thủ, nên chúng được chốt kèm lý do chứ không kèm lời khẳng định.

**`created_at` chứ không `run_started_at`.**
Trên lần chạy đầu tiên hai trường này bằng nhau, và cả hai mẫu hiện có đều xác nhận.
Chúng chỉ tách nhau khi một run bị chạy lại: lúc đó `run_started_at` nhảy tới thời điểm của lần thử mới, còn `created_at` đứng yên ở thời điểm GitHub nhận cú push.
Chọn `run_started_at` sẽ làm mọi lần thử hỏng biến mất khỏi số đo, mà lần thử hỏng thì thuộc về lead time theo đúng quy tắc không dừng đồng hồ ở giữa của Giai đoạn thủ công.

**`max(jobs[].completed_at)` chứ không `updated_at` của run.**
`updated_at` là lần sửa cuối của bản ghi run, không phải lúc run xong, và bất cứ thứ gì đụng vào run về sau cũng đẩy nó đi tiếp.
Chênh lệch quan sát được trên cả hai mẫu là đúng 1 giây, tức không đổi kết luận nào.
Thứ đổi kết luận là `updated_at` không có định nghĩa gắn với công việc, nên nó không trả lời được câu "thay đổi này xong lúc mấy giờ", còn `completed_at` của job thì trả lời được.

**Run trên `main` chứ không run của pull request.**
Mỗi thay đổi để lại hai lần chạy, và đây chính là món nợ mà pull request #68 để lại cho #67.
Lần chạy trên pull request xảy ra trước mốc `Merge`, nên tính nó vào lead time sẽ cho ra một khoảng âm hoặc một khoảng chứa công việc làm trước khi thay đổi vào trunk.
Nặng hơn: commit của pull request không phải commit sẽ được triển khai, vì squash sinh ra một commit mới trên `main` và tag của image đi theo commit đó.

Cả ba đều cùng một họ với hai việc mà #10 phải gỡ.
Không cái nào làm hệ thống hỏng, không cái nào làm test đỏ, và cả ba đều cho ra một con số đọc được mà không có gì báo động.

### Năm chỗ hai giai đoạn không khớp nhau

Ràng buộc của #67 nói rõ: một mốc không ứng được thì ghi lại chênh lệch, đừng chọn đại một trường cho khớp.
Năm chênh lệch dưới đây phải mang theo mỗi khi so hai giai đoạn, và không cái nào khử được.

**Độ phân giải lệch nhau 60 lần.**
Giai đoạn thủ công ghi tới phút, Actions trả về tới giây.
Mọi khoảng ngắn hơn một phút của giai đoạn trước đều rơi về 0, và mẫu #8 với cột prod bằng 0 phút là một trường hợp như vậy.

**Cột `Chờ` đo hai hiện tượng khác nhau.**
Ở Giai đoạn thủ công, `Bắt đầu` trừ `Merge` là khoảng thay đổi nằm chờ một người rảnh tay, dài từ 1 tới 9 phút.
Ở Giai đoạn pipeline, cùng phép trừ ấy cho ra 8 giây và 4 giây, và nó đo độ trễ điều phối của GitHub.
Hai con số vẫn so được, nhưng câu kết luận phải nói rằng thứ biến mất là việc phải chờ người, chứ không phải rằng máy chờ nhanh hơn người 60 lần.

**`Bắt đầu` của pipeline chứa một khoảng mà giai đoạn trước không có.**
Từ lúc run được tạo tới lúc một runner nhận job còn 10 giây nữa trên mẫu `748e69e`.
Người thao tác tay thì không có quãng này, vì `Bắt đầu` của họ là lúc gõ ký tự đầu tiên.

**`Hoàn tất build` không có nghĩa là image đã được kiểm.**
Giai đoạn thủ công build rồi mới kiểm, nên `Hoàn tất` của nó là "image này đã qua kiểm thử".
Pipeline chạy `kiem-tra` trước, trong đó `compose --build` dựng một image để có stack mà kiểm, rồi `dong-goi` dựng lại từ đầu ở job khác và đẩy image đó đi.
Hai image cùng nội dung nên rủi ro thấp, nhưng đây là món nợ của #68 và nó được ghi lại thay vì bị làm mờ đi.

**Cột `Sự cố` dịch chỗ, và nó dịch theo hướng làm đẹp số liệu.**
Đây là chênh lệch nặng nhất trong năm cái.
Ở Giai đoạn thủ công không có gì chặn giữa merge và prod, nên một thay đổi hỏng đi thẳng tới prod và vào thẳng change failure rate; cả hai lần hỏng của giai đoạn đó đều như vậy.
Ở Giai đoạn pipeline, `kiem-tra` chạy trên pull request và chặn merge, nên phần lớn lỗi cùng loại sẽ chết trước mốc `Merge` và không để lại dòng nào trong bảng.
Nghĩa là change failure rate của giai đoạn này sẽ thấp một phần vì pipeline thật sự tốt hơn, và một phần vì tập lỗi bị chặn ở chỗ khác.
Hai phần đó không tách được bằng dữ liệu quan sát, và đó chính là lý do #21 tồn tại: chỉ có tiêm lỗi có kiểm soát mới cho một mẫu số so được.

Nếu báo cáo chỉ trích con số change failure rate mà bỏ đoạn này thì nó đang khoe một thành tích mà một nửa là do đổi chỗ đếm.

### Một tài liệu phục vụ hai người đọc

Đây là phần của #70, và cái khó của nó không phải viết mà là quyết định giữ lại cái gì.

`docs/trien-khai-thu-cong.md` từ #11 rơi vào trạng thái nửa sống nửa chết.
Các bước triển khai vẫn còn hiệu lực, vì triển khai vẫn làm tay cho tới #12 và #13, và `CLAUDE.md` vẫn trỏ người ta tới mục "Bảng lệnh" của nó sau mỗi lần merge có chạm mã.
Kỷ luật bấm giờ thì đã chết, vì nó bảo ghi vào `docs/nhat-ky-thu-cong.md`, mà file đó đóng sổ ở #10.
Tức là tài liệu đang chỉ người ta ghi vào một file cấm ghi.

Có hai cách sai và một cách đúng.

Viết lại thành tài liệu lịch sử thuần tuý thì sai, vì các bước vẫn đang được dùng.
Xoá phần bấm giờ đi thì cũng sai, và sai nặng hơn: phần đó là bản ghi cách bộ dữ liệu của Giai đoạn thủ công được tạo ra, thứ mà báo cáo cần để nói về giới hạn của phép đo.
Một bộ số liệu không kèm cách nó được sinh ra thì không phản biện được.

Cách đúng là tách chứ không cắt.
Phần mở đầu khai báo một quy ước duy nhất: mọi chỗ đã chết đều mang dấu **(đã đóng)** và nằm nguyên chỗ cũ, đọc như bản ghi chứ không làm theo.
Trong mục "Bảng lệnh", ba lệnh lấy giờ và lệnh `gh pr view` bị chú thích lại, kèm cảnh báo đừng nhầm chúng với hai dòng có điều kiện vốn được phép mở dấu `#`.
Hai mục về bấm giờ đổi tiêu đề thành `(đã đóng)` nhưng giữ nguyên văn bên trong.

Dòng "không được dùng GitHub Actions hay bất kỳ CI nào" cũng được xử lý theo cùng lối.
Nó vẫn đúng với tư cách luật của Giai đoạn thủ công, và đọc lướt thì thành ra mâu thuẫn với thứ #11 vừa merge.
Nên nó không bị xoá mà được nói rõ là điều kiện của thí nghiệm, chi phối đúng khoảng thời gian năm mẫu đo được tạo ra, và khoảng đó đã khép lại.

### Cổng gác thứ hai, và một lối đi không còn tức thì

Phần còn lại của #70 nằm ở `CONTRIBUTING.md`, và nó quan trọng hơn vẻ ngoài vì đây chính là file định nghĩa mắt xích truy vết mà #22 dùng để tính lead time.

Trước #11, việc bảo vệ `main` nằm ở đúng một chỗ là bắt buộc pull request, và file này kết lại bằng câu "không nằm ở số lượng người duyệt".
Từ #11 rule có thêm một status check bắt buộc tên `kiem-tra` và bật `strict`, nên việc bảo vệ nằm ở hai chỗ.
Lập luận vì sao không đòi approval được giữ nguyên chữ, vì lập luận đó không phụ thuộc vào #11: đồ án do một người làm, mà GitHub không cho tự duyệt pull request của chính mình.

Hai hệ quả thực tế trước đó chưa được ghi ở đâu.

`strict` chặn một nhánh đã cũ so với `main` ở trạng thái `BEHIND` cho tới khi nhánh được cập nhật rồi `kiem-tra` chạy lại và xanh trên commit mới.
Đây là hành vi đúng của rule, nhưng lần đầu gặp thì rất dễ bị hiểu là hỏng.

Và ngoại lệ push thẳng vào `main` không còn tức thì nữa.
`CONTRIBUTING.md` vốn mô tả một lối đi hợp lệ: commit được push chính là head của một pull request đang mở và pull request ấy đã thoả mọi điều kiện của rule.
Từ #11, "mọi điều kiện" bao gồm cả việc `kiem-tra` đã xanh trên chính commit đó, nên vẫn phải đẩy lên nhánh, chờ workflow chạy xong, rồi mới push được.
Câu chữ cũ vẫn đúng về logic nhưng che mất thay đổi về hành vi, và đó là kiểu lệch khó thấy nhất khi đọc lại tài liệu.

### Vì sao việc này thuộc về đề tài

Chương 25 đặt đo lường ở chỗ cuối cùng của chuỗi, sau khi mọi thứ khác đã tự động.
Mục này là về chỗ nối giữa cái tự động và cái đo được, và nó cho thấy chỗ nối đó không tự có.

Máy ghi lại nhiều hơn người rất nhiều, nhưng máy không nói cho biết trường nào có nghĩa.
Người bấm giờ có đúng một cách hiểu về "lúc xong"; GitHub Actions có ít nhất ba, và cả ba đều trả về một chuỗi thời gian hợp lệ.
Tự động hoá vì vậy không xoá bỏ việc phải định nghĩa, nó chỉ đẩy việc ấy sang một chỗ khác và làm nó khó thấy hơn.

Phần của #70 thì nói một chuyện khác, về configuration management theo nghĩa hẹp nhất của từ đó.
Khi một ranh giới dịch chuyển, thứ hỏng trước tiên không phải mã mà là tài liệu mô tả cách làm việc, và không có test nào đỏ khi điều đó xảy ra.
Hai file của #70 đều mô tả đường đi của một thay đổi, nên để chúng lệch thì #22 dựng lại sai một mắt xích mà vẫn ra được một con số.

### Số liệu

Mục này trích đúng một đại lượng, và nói rõ nó không phải lead time.

Hai workflow run hiện có trên `main` cho `Hoàn tất build` trừ `Bắt đầu` bằng **76 giây ở cả hai**, tính từ bảng trong `docs/nhat-ky-pipeline.md`.
Cột `Chờ` là 4 giây và 8 giây.

Ba lý do khiến con số này chưa nói được gì về Luận điểm.

Chuỗi của Giai đoạn pipeline hôm nay dừng ở `Hoàn tất build`, vì triển khai vẫn làm tay.
Lead time chỉ tính được khi #13 xong, và trích con số 76 giây như lead time sẽ là so một phần của giai đoạn này với trọn vẹn giai đoạn kia.

Hai mẫu đều là thay đổi chỉ chạm tài liệu và cấu hình, không phải thay đổi cỡ chuẩn theo cách `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` dùng từ này.
Dòng `#11` còn đặc biệt hơn, vì nó là lần chạy của chính commit dựng nên pipeline.

Và hai mẫu thì không đủ để nói về độ ổn định, kể cả khi chúng bằng nhau tới từng giây.

### Dẫn chứng

- Định nghĩa từng mốc, ba trường bị loại và năm chênh lệch: `docs/nhat-ky-pipeline.md`
- Lệnh trích mốc thô và đầu ra nguyên văn của lần chạy thật: cùng file, mục "Lệnh trích mốc thô"
- Bảng mốc thô hai dòng hiện có: cùng file, mục "Bảng"
- Bài học gốc về định nghĩa chốt muộn: mục "2026-07-29 - Đóng Giai đoạn thủ công, và cái giá của việc chốt một định nghĩa muộn" của file này
- Quy ước tách phần còn hiệu lực và phần đã đóng: phần mở đầu của `docs/trien-khai-thu-cong.md`
- Cổng gác thứ hai và hệ quả lên ngoại lệ push thẳng: mục "Pull request tham chiếu issue" của `CONTRIBUTING.md`
- Từ vựng cho file nhật ký mới: mục "Nhật ký pipeline" trong `CONTEXT.md`

### Đang ở đâu sau mục này

**Định nghĩa đo lường của Giai đoạn pipeline đã chốt**, và mốc thô từ nay chép vào `docs/nhat-ky-pipeline.md` chứ không chép đi đâu khác.
Nhóm C còn #12, #13 và #14.

Ticket kế tiếp là **#12** (C2, triển khai staging tự động kèm smoke test), đã hết blocker.
Nó là chỗ gọi lại `image.yml` lần đầu, tức phép thử thật cho quyết định về trục tái sử dụng ở mục trước.
Nó cũng sẽ làm bảng của `docs/nhat-ky-pipeline.md` nhận thêm cột, và làm phần "còn hiệu lực" của `docs/trien-khai-thu-cong.md` co lại đúng một nửa.

Hai yêu cầu còn nợ, cả hai đều chưa ticket nào nhận, và cả hai đã được ghi ở `docs/nhat-ky-pipeline.md` chứ không chỉ nằm ở đây.

Thứ nhất, Giai đoạn pipeline cần ít nhất một thay đổi chạm `infra/postgres/init.sql`, vì cả hai lần phát hành thất bại của giai đoạn trước đều truy về đúng một thay đổi schema.
Thứ hai, mẫu đo thật của giai đoạn này chỉ bắt đầu khi có một thay đổi chạm `services/` đi qua chuỗi đầy đủ, mà chuỗi đó chưa đầy đủ cho tới #13.

## 2026-07-29 - Staging tự cập nhật, và một cột mốc suýt đổi nghĩa mà không ai biết

**Ticket**: #12 (C2)
**Pull request**: #76
**Phục vụ**: ô Hiện thực & CI/CD của rubric, mục 25.4 Continuous delivery của sách; và là điều kiện tiên quyết của #13

### Ticket đòi cái gì

Merge vào `main` thì staging tự cập nhật, không ai gõ lệnh nào, và sau khi cập nhật thì một bộ smoke test chạy từ ngoài vào để khẳng định hệ thật sự phục vụ được.
Smoke test phải là tập con của chính bộ kiểm thử đang có chứ không phải bộ thứ hai viết riêng, phải nhanh, và trượt thì lần triển khai phải đỏ ở chỗ nhìn thấy được.

Kèm theo là một việc tài liệu đã ghi sẵn từ khi đóng #10: ràng buộc "merge xong thì nhắc triển khai tay" trong `CLAUDE.md` sẽ sai với staging, và việc phải làm là **thu hẹp** nó lại còn prod chứ không xoá.

### Chỗ khó không phải viết workflow, mà là staging sống ở đâu

Câu "staging tự cập nhật" không có nghĩa xác định cho tới khi trả lời được staging nằm trên máy nào.

Giai đoạn thủ công định nghĩa staging là `localhost:8081` trên máy chủ đồ án.
Runner của GitHub là máy ảo dùng một lần trên mây và không có đường nào tới máy ấy: không mở được cổng, không nối ngược được, còn VPS lẫn PaaS thì `docs/adr/0004-ha-tang-phat-hanh-va-do-luong.md` đã loại từ đầu.

Hai lối đi, và chúng khác nhau ở thứ được chứng minh chứ không ở công sức.

Lối thứ nhất là dựng stack ngay trên runner của GitHub, smoke test xong thì runner biến mất cùng stack.
Không phải cài gì, nhưng nó gần như trùng với job `kiem-tra` đã có, không để lại môi trường nào còn sống, và tiêu chí cuối của ticket sẽ thành một câu nói dối: muốn có staging trên máy thì vẫn phải gõ tay đúng như cũ.

Lối thứ hai là đăng ký một self-hosted runner ở chính máy ấy, và job triển khai chạy tại chỗ.
Chọn lối này, vì ba lý do xếp theo sức nặng.

`docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` đòi giữa hai giai đoạn chỉ được đổi **đúng một biến**.
Đổi luôn cả chỗ staging sống là biến thứ hai, và nó rơi đúng vào đại lượng đang đo.

#13 với blue-green, #15 với Prometheus và Grafana, #21 với tiêm lỗi rồi đo thời gian phục hồi: cả ba đều cần một môi trường còn sống sau khi workflow kết thúc.
Lối thứ nhất không xây tiếp lên được, nên chọn nó là mua rẻ hôm nay rồi làm lại ở #13.

Và một staging chỉ tồn tại trong lòng một workflow run thì không ai mở trình duyệt nhìn được nó, mà phần Demo của A2 thì cần nhìn được.

Cái giá phải trả được ghi ra chứ không giấu: phải cài runner một lần, và runner không chạy thì lần triển khai xếp hàng chờ chứ không hỏng.

### Kho công khai cộng self-hosted runner là một rủi ro có thật

Đây là chỗ dễ làm sai nhất của lựa chọn trên, nên nó được xử lý ngay chứ không để lại.

GitHub cảnh báo sẵn: self-hosted runner trên kho công khai cho phép một pull request từ fork chạy mã tuỳ ý trên máy thật.
Chỗ chặn là `if: github.event_name == 'push'` ở job triển khai, nghĩa là job chỉ tồn tại với commit đã qua `kiem-tra` và đã được merge, không bao giờ với mã của một pull request.

Điều kiện ấy trông như một dòng cho gọn, nên nó được ghi lý do ngay tại chỗ trong `ci.yml` và nhắc lại ở `README.md`.
Một dòng bảo vệ mà không ai biết nó bảo vệ cái gì thì lần dọn dẹp sau sẽ có người gỡ nó đi.

### Một cột mốc suýt đổi nghĩa mà không có gì báo động

Đây là phần đáng giá nhất của ticket này, và nó không nằm trong tiêu chí nghiệm thu nào.

`docs/nhat-ky-pipeline.md` vừa chốt ở #67 rằng `Hoàn tất build` là `max(jobs[].completed_at)` của workflow run.
Lúc chốt, định nghĩa ấy đúng, vì `dong-goi` là job cuối cùng.

Thêm job `trien-khai-staging` chạy sau nó thì `max` lập tức đổi nghĩa: nó thành mốc kết thúc của bước triển khai chứ không còn là mốc kết thúc của bước đóng gói.
Cột không đổi tên, số vẫn là một chuỗi thời gian hợp lệ, không test nào đỏ, và mọi dòng trước với sau #12 nằm chung một cột với hai nghĩa khác nhau.

Đây đúng là hình dạng của lỗi mà #10 đã trả giá để học, chỉ khác đường vào: lần đó là chọn nhầm một trường, lần này là thêm một job.
Cách chữa là neo mốc vào **tên của một job** chứ không vào thứ tự: `dong-goi / image` cho build, `trien-khai-staging` cho staging.
Tên job đổi thì workflow gãy ngay và có người biết; thứ tự job đổi thì không ai biết.

Chi tiết dễ vấp: tên job của một reusable workflow là `<job gọi> / <job được gọi>`, nên job đóng gói hiện ra trong API là `dong-goi / image` chứ không phải `dong-goi`, dù `dong-goi` là tên duy nhất nhìn thấy khi đọc `ci.yml`.

Lệnh trích mốc thô được viết lại theo tên job và đã chạy thật; đầu ra nguyên văn nằm trong `docs/nhat-ky-pipeline.md`.
Nó lộ ra thêm một chuyện: bảng ở đó mới có hai dòng trong khi `main` đã nhận năm run, vì #67, #70 và #74 merge sau lúc file được viết.
Ba dòng ấy được chép nốt trong chính lần sửa này, đúng lý do file đó tồn tại là mốc bên GitHub có hạn sử dụng.

### Smoke test là tập con, không phải bộ thứ hai

Tiêu chí "dùng lại chính bộ kiểm thử của hệ" được đáp bằng một dòng trong `package.json`:

```json
"smoke": "node --test tests/suc-khoe-va-san-sang.test.ts tests/rut-gon-va-chuyen-huong.test.ts"
```

Không có file test mới nào.
Hai file được chọn là sẵn sàng của cả ba service, và đường tạo link rồi chuyển hướng.
Ba file còn lại nằm ngoài vì lý do khác nhau: `thong-ke-luot-truy-cap` phải chờ worker chạy vài chu kỳ tổng hợp nên nó chậm theo thiết kế, `metrics` kiểm chuyện đo đạc chứ không kiểm chuyện phục vụ được, `xac-thuc-dia-chi` kiểm các nhánh từ chối đầu vào.

Cả năm file vẫn chạy đủ ở job `kiem-tra` trên mỗi pull request, nên không test nào bị bỏ.
Việc chọn lại chỉ trả lời một câu hỏi khác: cái gì hỏng thì hệ coi như không phục vụ được, và đó mới là thứ đáng đứng chắn trên đường phát hành.

Một chi tiết hoá ra là hệ quả trực tiếp của ràng buộc hộp đen ở #3: job triển khai không cần `npm ci`, vì bộ kiểm thử chỉ gửi HTTP nên nó không import gì ngoài `node:`.

### Ba chỗ pipeline làm khác bàn tay người

Ghi ở `docs/trien-khai-thu-cong.md` ngay dưới bước 3 và bước 4, vì đây là chênh lệch phải mang theo khi so số của hai giai đoạn.

Pipeline luôn chạy `down -v` chứ không đọc `git show --stat` rồi tự quyết như người.
Hai nhánh có điều kiện của bước làm tay vì thế biến mất: nhánh `restart nginx` cũng không cần vì container được dựng lại từ đầu.
Đổi lại staging mất sạch dữ liệu sau mỗi lần merge, chấp nhận được vì nó chỉ chứa dữ liệu thử, và rẻ hơn nhiều so với một nhánh điều kiện không ai kiểm được.

Pipeline chạy `up` **không kèm** `--build`, và dựng từ image đã đóng gói thay vì build lại từ mã nguồn.
Đây là chỗ nó chặt hơn tay người, và nó trả một nửa món nợ mà pull request #68 để lại: `Hoàn tất staging` **là** "image đã đóng gói đã được kiểm trên môi trường thật", đúng nghĩa mà `Hoàn tất` của Giai đoạn thủ công mang.
Nửa còn nợ vẫn nợ: `Hoàn tất build` vẫn chỉ có nghĩa "đã đẩy".

Để làm được điều đó, `compose.yaml` nhận thêm biến `SERVICE_IMAGE` với mặc định khai trong từng file env, và job triển khai đè biến ấy bằng tham chiếu GHCR theo commit.
`--no-build` không phải cho gọn mà là chốt chặn: thiếu nó thì Compose lặng lẽ dựng lại image từ mã nguồn thay vì báo là không có image, và staging chạy một bản không phải bản đã đóng gói, đúng loại lệch mà việc tag theo commit sinh ra để tránh.

Ba lệnh ấy còn phải đúng thứ tự, và bản đầu tiên viết sai: `docker pull` phải đứng **trước** `down -v`.
`pull` là bước duy nhất phụ thuộc vào mạng và vào GHCR, tức bước hỏng được vì lý do chẳng liên quan gì tới thay đổi vừa merge; hạ staging trước rồi mới kéo thì một lần GHCR trục trặc biến thành sự cố tự gây ra, với staging đã tắt và volume đã xoá.
Kéo trước thì hỏng ở đó chỉ làm job đỏ, còn staging cũ vẫn đứng nguyên, đúng với chính sách "không dọn khi đỏ" mà job tự tuyên bố ở bước cuối.

Và pipeline không có bước `ps` để mắt người nhìn năm dòng `Up`; câu hỏi ấy do smoke test trả lời bằng `/readyz` của cả ba service.

### Một ràng buộc bị thu hẹp, và ba tài liệu co theo

Ràng buộc trong `CLAUDE.md` không bị xoá mà bị thu về đúng phạm vi nó còn đúng: nhắc triển khai **prod** bằng tay, kèm câu là chỉ chạy khối prod của "Bảng lệnh".
Lý do gốc của nó được giữ nguyên chữ, vì lý do ấy vẫn còn giá trị với phần còn làm tay: chạy hộ thì hai giai đoạn khác nhau ở hai biến chứ không phải một.

`docs/trien-khai-thu-cong.md` nhận thêm một dấu thứ hai bên cạnh **(đã đóng)** đã có từ #70, là **(tự động từ #12)**, và giữ nguyên văn phần bên trong.
Hai dấu ấy có ý nghĩa khác hẳn nhau, nên phần mở đầu mục "Bảng lệnh" được viết lại thành ba loại dòng bị chú thích: loại được phép mở dấu `#`, loại đã đóng, và loại đã tự động.
Năm dòng staging trong khối lệnh bị chú thích lại, vì mở chúng ra không chỉ thừa mà còn phá: chúng dựng lại staging từ mã nguồn đè lên bản mà pipeline vừa triển khai từ image.

`README.md` bỏ câu "triển khai vẫn làm tay", mô tả job thứ ba, và nhận một mục mới về runner tự quản.

### Vì sao việc này thuộc về đề tài

Chương 25 nói continuous delivery là đưa mỗi thay đổi tới một môi trường giống production càng sớm càng tốt, rồi để một bộ kiểm thử tự động quyết định nó đi tiếp hay dừng lại.
Ticket này dựng đúng mắt xích ấy, nhưng thứ học được lại nằm ở hai chỗ mà mô tả trong sách không nhắc.

Chỗ thứ nhất là tự động hoá không xoá được câu hỏi "chạy ở đâu".
Nửa ngày của ticket này rơi vào việc nhận ra rằng "staging tự cập nhật" là một câu chưa có nghĩa cho tới khi biết staging sống trên máy nào, và rằng trả lời sai câu đó sẽ làm hỏng phép so sánh chứ không chỉ làm phiền lúc cài đặt.

Chỗ thứ hai là mỗi lần chuỗi dài thêm một mắt, định nghĩa đo lường phải được đọc lại.
Một cột mốc đã chốt bằng văn bản, có lý lẽ, có bảng đối chiếu, vẫn đổi nghĩa chỉ vì có một job mới chạy sau job cũ.
Đây chính là configuration management theo nghĩa hẹp nhất: thứ hỏng trước tiên khi hệ thống lớn lên không phải mã, mà là những gì mô tả hệ thống, và không có test nào đỏ khi điều đó xảy ra.

### Số liệu

Chưa có mẫu nào cho cột `Hoàn tất staging`, vì run đầu tiên có job triển khai chính là run của pull request đóng ticket này.
Năm dòng đang có trong `docs/nhat-ky-pipeline.md` đều chạy trước #12 nên cột ấy rỗng ở cả năm, và chúng không dùng được cho đại lượng `staging` của mục "Công thức".

Con số duy nhất trích được lúc này vẫn là `Hoàn tất build` trừ `Bắt đầu`, nay có năm mẫu thay vì hai, và cột `Chờ` dao động từ 3 tới 8 giây.
Lead time thì vẫn chưa tính được và sẽ chưa tính được cho tới khi #13 xong, vì chuỗi còn thiếu mắt prod.

Riêng tiêu chí "smoke test xong trong vài giây" thì đo được ngay tại chỗ, trên staging cục bộ: 6 test, `duration_ms` 240, khoảng 7 giây tính cả lúc npm khởi động và lúc chờ ba service báo `/readyz`.
Cả năm file là 20 test và `duration_ms` 1136, nên phần tiết kiệm được không nằm ở số giây của test mà ở chỗ không phải chờ worker `stats` chạy vài chu kỳ tổng hợp.

### Dẫn chứng

- Job triển khai và lý do của từng lựa chọn: `.github/workflows/ci.yml`, job `trien-khai-staging`
- Cách đăng ký runner tự quản và chỗ chặn rủi ro: mục "Runner tự quản cho staging" của `README.md`
- Định nghĩa mốc mới, vì sao định nghĩa cũ đổi nghĩa, và lệnh trích viết lại: `docs/nhat-ky-pipeline.md`
- Ba chỗ pipeline làm khác tay người: bước 3 và bước 4 của `docs/trien-khai-thu-cong.md`
- Ràng buộc đã thu hẹp: mục "Ràng buộc phải tôn trọng" của `CLAUDE.md`
- Bài học gốc về định nghĩa đổi nghĩa âm thầm: mục "2026-07-29 - Đóng Giai đoạn thủ công, và cái giá của việc chốt một định nghĩa muộn" của file này

### Đang ở đâu sau mục này

**Staging đã tự triển khai; prod vẫn làm tay.**
Chuỗi của Giai đoạn pipeline hiện đi từ merge tới `Hoàn tất staging`, còn thiếu đúng mắt prod.

Việc phải làm ngay sau khi merge pull request này là **đăng ký self-hosted runner** trên máy chủ đồ án, theo mục "Runner tự quản cho staging" của `README.md`.
Chưa có runner thì job `trien-khai-staging` xếp hàng chờ và lần chạy trên `main` không kết thúc; đây là lần duy nhất việc ấy cần làm.

Ticket kế tiếp là **#13** (C3, blue-green cho prod và rollback tự động), đã hết blocker.
Nó đóng nốt chuỗi, làm lead time tính được lần đầu, và xoá hẳn ràng buộc nhắc triển khai tay trong `CLAUDE.md`.
Nó cũng là chỗ gọi lại `image.yml`, thứ mà #12 hoá ra không cần vì job triển khai dùng image đã có sẵn tag chứ không đóng gói lại.

Nhóm C sau đó còn #14.
Hai yêu cầu còn nợ từ Giai đoạn thủ công vẫn nguyên và vẫn chưa ticket nào nhận: cần ít nhất một thay đổi chạm `infra/postgres/init.sql`, và cần một thay đổi chạm `services/` đi qua chuỗi đầy đủ.

## 2026-07-30 - Bản phát hành đầu tiên có tên, và hai image của cùng một commit

**Ticket**: #14 (C4), #79
**Pull request**: #78
**Phục vụ**: mục 25.4 Release management của sách, ô Hiện thực & CI/CD và ô Reuse & trade-off của rubric

### Ticket đòi cái gì

Mỗi bản phát hành có số hiệu theo semantic versioning và một danh sách thay đổi được sinh ra chứ không viết tay, thay vì chỉ có một mã commit.
Kèm một tài liệu ngắn nêu quy tắc khi nào tăng major, minor hay patch, gắn với việc thay đổi có phá vỡ tương thích hay không.

### Vì sao ticket này chứ không #13

Đây là lựa chọn của một buổi tối cuối, nên lý do được ghi ra chứ không để nó trông như thứ tự tự nhiên.

Đối chiếu bốn mục 25.1 tới 25.4 của Chương 25 với vật liệu đang có cho một bức tranh lệch: 25.2 System building và 25.3 Change management đã mạnh, 25.1 Version management đủ, còn 25.4 Release management thì mỏng.
Có triển khai, nhưng không có số phiên bản, không có danh sách thay đổi, không có release notes, và không có đường quay lại.
#14 vá đúng chỗ mỏng đó.

#13 bị hoãn vì nó đụng `nginx.conf` và `compose.yaml`, cần một ADR, và làm dở thì sáng hôm sau không còn gì đem demo.
#14 thì chỉ thêm một workflow và tài liệu, nên nó không thể làm hỏng thứ sắp đem ra trình bày.
Nói cách khác, cả hai đều đáng làm, nhưng chỉ một trong hai làm được mà không đặt phần Demo vào thế rủi ro.

### Ticket bị thu hẹp trước khi làm, và vì sao không đóng với một ô chưa tick

Hai chỗ trong #14 được sửa trước khi viết dòng mã đầu tiên, và cả hai đều để lại vết trên GitHub thay vì sửa lặng lẽ.

Liên kết `blocked-by #13` bị bỏ.
Thứ tự #13 trước #14 là thứ tự thiết kế chứ không phải rào kỹ thuật: đánh số phiên bản và sinh danh sách thay đổi không cần blue-green, không cần rollback.
Liên kết được bỏ bằng API chứ không chỉ xoá dòng trong thân bài, vì thân bài là chữ còn liên kết là dữ liệu mà bảng truy vết đọc.

Tiêu chí "Tag trong kho mã, tag image và phiên bản đang chạy khớp nhau" chuyển sang #17.
Chỗ này là một vòng tham chiếu thật sự: đọc được "phiên bản đang chạy" đòi một endpoint mà #17 mới dựng, trong khi #14 lại đang `blocking #17`.
Giữ nguyên thì #14 không đóng được cho tới khi #17 xong, mà #17 lại chờ #14, và không có thứ tự làm việc nào thoát ra được.

Cách xử lý có hai lối, và lối được chọn không phải lối nhanh hơn.
Lối nhanh là đóng #14 với ba ô tick và một ô để trống, kèm một câu giải thích.
Lối được chọn là sửa yêu cầu: thu tiêu chí ở #14 về đúng phần kiểm được ngay, và chuyển nửa còn lại sang #17 kèm câu ghi rõ nó từ đâu tới.

Lý do nằm ở chỗ 29 ticket trước đều đóng với đủ ô đã tick.
Phá tiền lệ đó một lần thì mất chính thứ mà bảng truy vết dùng để chứng minh quy trình được tôn trọng, và đó là chỗ giám khảo chọc được bằng một câu hỏi.
Còn sửa một yêu cầu thay đổi rồi ghi lại lý do thì đúng là bản tốt của 25.3 Change management, không phải một ngoại lệ với nó.

### Semver không có nghĩa cho tới khi nói rõ tương thích với ai

Đây là phần khó nhất của ticket, và nó không nằm trong tiêu chí nào.

Câu "tăng major khi phá vỡ tương thích" đọc thì rõ, nhưng nó không kiểm được cho tới khi trả lời được "tương thích với cái gì".
Không có câu trả lời ấy thì số major sẽ tăng theo cảm giác về độ lớn của thay đổi, mà độ lớn của thay đổi thì chẳng liên quan gì tới tương thích.

`docs/quy-tac-phien-ban.md` vì vậy định nghĩa hợp đồng công khai trước bảng quy tắc, và định nghĩa nó hẹp: chỉ `/api/v1/...` và `/<mã>`.
Nhánh `/internal/` nằm ngoài, vì nó là đường dẫn vận hành và người gọi nó là pipeline chứ không phải client.
Schema của Postgres, tên biến môi trường, cấu trúc dòng log, tên các số đếm ở `/metrics`: tất cả nằm ngoài hợp đồng, dù đổi chúng có thể rất đau khi vận hành.

Hai ví dụ trong tài liệu là để chống lại đúng hai hướng hiểu sai, và cả hai đều lấy từ chính đồ án này.
#12 viết lại toàn bộ cách triển khai staging mà không đụng một byte nào của hợp đồng, nên nếu nó phát hành thì nó là một bản PATCH.
Đổi `201` thành `200` ở đường tạo link là một ký tự, và nó là MAJOR.

### Vì sao `v0.1.0` chứ không `v1.0.0`

Đặc tả semver dành riêng dải `0.y.z` cho giai đoạn phát triển ban đầu và nói rõ rằng trong dải đó API công khai chưa được coi là ổn định.
Đó đúng là trạng thái của hệ này: `/api/v1/` đã chạy và đã có kiểm thử, nhưng nó chưa từng có client nào ngoài bộ kiểm thử.

Chọn `v1.0.0` sẽ là một tuyên bố sai, không phải một con số đẹp hơn: nó nói rằng hợp đồng đã đóng băng, trong khi #18 còn chưa làm.
`v1.0.0` được để dành cho sau #18, vì lúc ấy câu "phiên bản một không đổi nữa" mới có bằng chứng, là toàn bộ kiểm thử của phiên bản một chạy xanh trên hệ đã có phiên bản hai mà không sửa một dòng.

Một quyết định nữa đi kèm: đúng một số hiệu cho cả hệ, không phải một số cho mỗi service.
Ba service dùng chung một `Dockerfile` và một image từ #3, nên không có chỗ nào để treo ba số khác nhau.
Cái giá là một thay đổi chỉ chạm `stats` vẫn làm cả hệ tăng số; cái được là câu hỏi "bản `link` 1.2.0 chạy được với bản `redirect` 1.1.0 không" không tồn tại được.

### Một vòng khép lại, và nó khép mà không viết thêm logic nào

`image.yml` được viết ở #11 dưới dạng `workflow_call` với lý do ghi thẳng trong file: để #12 và #13 gọi lại nó thay vì chép bước build sang chỗ khác.
Rồi #12 hoá ra không cần, vì job triển khai dùng image đã có sẵn tag chứ không đóng gói lại, và món nợ ấy được ghi vào mục nhật ký của #12.

`phat-hanh.yml` là chỗ gọi lại đó.
Nó truyền `tag` là tên tag phiên bản, và chạy được vì `image.yml` nhận `tag` rồi `checkout` đúng ref ấy, mà một git tag là một ref hợp lệ.

Chỗ đáng nói không phải là tiết kiệm được mấy dòng.
Nó là chỗ tag trong kho mã và tag của image trở thành **cùng một chuỗi ký tự**, chứ không phải hai giá trị được đặt cho khớp nhau bằng tay ở hai nơi.
Hai giá trị đặt cho khớp thì có ngày lệch và không có gì báo động; một giá trị đi qua hai chỗ thì không lệch được.

Bù lại `image.yml` phải sửa một chỗ nhỏ mà nếu bỏ qua thì nó sai: mô tả của đầu vào `tag` viết rằng nó "là SHA đầy đủ của commit được đóng gói", trong khi từ nay nó là bất cứ ref nào.

### Danh sách thay đổi sinh từ pull request, còn tiêu chí nói từ commit

`--generate-notes` của `gh release create` dựng danh sách từ các pull request đã merge kể từ bản phát hành trước, không từ các commit thô.
Tiêu chí của #14 thì nói "sinh tự động từ lịch sử commit".

Hai cách nói ấy trùng nhau trong kho này, và chỗ tương đương được viết ra chứ không lặng lẽ coi là giống nhau.
Nó trùng vì `CONTRIBUTING.md` bắt merge bằng squash, nên một pull request để lại đúng một commit trên `main`.
Nếu về sau kho đổi sang merge commit thì hai tập tách nhau ngay, và lúc đó phải chọn lại; câu này đã ghi vào `docs/quy-tac-phien-ban.md` để lần sau không phải suy lại.

Sinh từ pull request còn tình cờ mạnh hơn ở một điểm.
Mỗi dòng mang theo số pull request, mà thân pull request lại chứa dòng `Closes #<số>`.
Nên từ một dòng trong danh sách thay đổi đi ngược về được yêu cầu thay đổi ban đầu, đúng chuỗi truy vết mà `CONTRIBUTING.md` dựng ra, và đó là thứ mà một danh sách sinh từ commit thô không cho.

Bản phát hành cũng do workflow tạo chứ không gõ tay, và nó `needs` job đóng gói.
Ngược lại thì một lần build hỏng vẫn để lại một release trỏ tới một image không tồn tại, tức đúng loại mắt xích đứt mà việc đánh số phiên bản sinh ra để tránh.

Không thêm `CHANGELOG.md` vào kho mã.
Trang Releases đã là changelog và nó sinh từ dữ liệu đã có; một file chép lại cùng nội dung sẽ là bản thứ hai phải tự tay giữ cho khớp, tức đúng loại tài liệu tự lệch mà đồ án này đã ghi lại ba lần.

### Hai tag, một commit, hai image khác nhau

Đây là thứ chỉ lộ ra vì bước nghiệm thu đi thêm một câu hỏi nữa, và nó là phần đáng giá nhất của mục này.

Tiêu chí nói tag trong kho mã và tag image phải khớp nhau.
Cách kiểm dễ nhất là mở trang packages ra nhìn thấy tag `v0.1.0`, và làm vậy thì tick được ô ngay.
Câu hỏi đi thêm một bước là: image mang tag `v0.1.0` có phải cùng một image với image mang tag SHA của đúng commit ấy không.

Câu trả lời là không.
Digest của `v0.1.0` là `94aea155…`, còn digest của tag `2cb5e88…` là `fb07ec32…`.
Cùng một commit, hai lần `docker build`, hai bó byte khác nhau, vì `docker build` không cho ra kết quả giống nhau giữa hai lần chạy.

Nghĩa là câu "tag khớp nhau" đúng ở mức chuỗi ký tự và ở mức commit nguồn, không đúng ở mức digest.
Và hệ quả nặng hơn cách nói đó: bản đem phát hành chưa từng chạy qua smoke test trên staging, dù một bản dựng từ đúng commit ấy thì có.

Đây cùng hình dạng với món nợ đã ghi ở chênh lệch 4 của `docs/nhat-ky-pipeline.md`, chỉ ở một mắt khác của chuỗi: chỗ đó là "image đã đẩy không phải image đã kiểm", chỗ này là "image đã phát hành không phải image đã kiểm trên staging".
Nó chữa được mà không viết lại logic build nào, bằng cách gắn thêm tag phiên bản vào chính image đã có thay vì dựng lại, tức `docker buildx imagetools create`.

Không làm bây giờ, và lý do được ghi ra thay vì để trống.
Đổi cách đóng gói vào tối trước hôm nộp đắt hơn cái nó mua, và `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` cấm thêm biến vào giữa một giai đoạn đang đo.
Cái phải làm ngay là ghi nó ra, vì thứ nguy hiểm không phải bản thân chỗ lệch mà là việc người đọc tự suy ra rằng hai tag trỏ cùng một image.

### Món nợ số đo của #12 được trả ở đây

`docs/nhat-ky-pipeline.md` nhận dòng của run #12, là dòng đầu tiên trong bảng có đủ sáu mốc kể cả `Hoàn tất staging`.

Nó phải trả ở ticket sau chứ không ở chính #12, và lý do là thứ tự thời gian chứ không phải sự lơ là.
Run của một pull request chỉ tồn tại **sau** khi pull request ấy merge, tức sau khi mọi file trong nó đã chốt.
Đây đúng cùng hình dạng với ngoại lệ mà `CONTRIBUTING.md` mô tả cho `docs/nhat-ky-thu-cong.md`: số đo của một thay đổi luôn ra đời muộn hơn thay đổi ấy, nên nó không bao giờ nằm được trong cùng một pull request.

Tiền lệ đã có: #12 điền bù cho #67, #70 và #74.
Việc điền bù này cũng lộ ra một câu trong file đã thành sai từ #12 mà không ai sửa, là câu "hôm nay chuỗi dừng ở `Hoàn tất build`, vì triển khai vẫn làm tay".
Nó đúng khi được viết và sai ngay khi #12 merge; đây là lần thứ tư trong đồ án này một tài liệu tự lệch sau một thay đổi mã, và cả bốn lần đều đã được ghi lại.

### Số liệu

Dòng của #12: `Chờ` 3 giây, `Hoàn tất build` cách `Bắt đầu` 71 giây, `Hoàn tất staging` cách `Hoàn tất build` 68 giây nữa.
Đại lượng `staging` của mục "Công thức" vì vậy có mẫu đầu tiên, và nó có đúng một mẫu.
Lead time thì vẫn chưa tính được và sẽ chưa tính được cho tới khi #13 xong, vì chuỗi còn thiếu mắt prod.

Bản phát hành `v0.1.0`: từ lúc GitHub nhận cú push tag tới lúc release được công bố là 30 giây, gồm 22 giây đóng gói image và 4 giây tạo release.
Danh sách thay đổi tự sinh liệt kê 36 pull request, tức toàn bộ lịch sử kho mã, vì không có bản phát hành nào trước nó để làm mốc.

Con số 30 giây ấy không đi vào bảng nào của `docs/nhat-ky-pipeline.md`, và đó là chủ ý.
Bảng đó ghi mốc của các run trên `main` sinh ra bởi một cú push commit; run phát hành sinh ra bởi một cú push tag, nên nó không phải một dòng cùng loại.
Phát hành cũng không phải một thay đổi có lead time của riêng nó, nó là một hành động **lên** các thay đổi đã merge.

### Dẫn chứng

- Workflow phát hành và lý do của từng lựa chọn: `.github/workflows/phat-hanh.yml`
- Quy tắc tăng số, định nghĩa hợp đồng công khai, ba lệnh phát hành, và chỗ lệch digest: `docs/quy-tac-phien-ban.md`
- Lý do thu hẹp #14, viết lúc thu hẹp chứ không viết lại về sau: comment trên #14
- Bản phát hành đầu tiên và danh sách thay đổi tự sinh: https://github.com/HugoLee12/a2-configuration-management/releases/tag/v0.1.0
- Dòng đo của #12 và lý do nó tới muộn: mục "Lệnh trích mốc thô" của `docs/nhat-ky-pipeline.md`
- Món nợ cùng loại ở một mắt khác của chuỗi: chênh lệch 4 của `docs/nhat-ky-pipeline.md`

### Đang ở đâu sau mục này

**Bản phát hành có tên rồi, nhưng nó chưa tự tới prod.**
`v0.1.0` đã tồn tại trên GHCR và trên trang Releases; đưa nó lên prod vẫn là thao tác tay theo bước 5 và 6 của `docs/trien-khai-thu-cong.md`.

Nhóm C còn đúng #13, và nó đã hết blocker.
Nó đóng nốt chuỗi, làm lead time tính được lần đầu, xoá hẳn ràng buộc nhắc triển khai prod bằng tay trong `CLAUDE.md`, và là chỗ tự nhiên để sửa luôn chỗ lệch digest nói ở trên.

Việc đang làm ngay sau mục này là **#77**, tức báo cáo A2, dàn ý slide và kịch bản thuyết trình; buổi thuyết trình là 2026-07-31.
#77 đã hết blocker sau khi #14 đóng.

Hai yêu cầu còn nợ từ Giai đoạn thủ công vẫn nguyên và vẫn chưa ticket nào nhận: cần ít nhất một thay đổi chạm `infra/postgres/init.sql`, và cần một thay đổi chạm `services/` đi qua chuỗi đầy đủ.

## 2026-07-30 - Ba tài liệu cho ba người đọc, và lần thứ năm một tài liệu tự lệch

### Ticket đòi cái gì

#77 đòi ba sản phẩm: báo cáo A2, dàn ý slide, và kịch bản thuyết trình.
Trước ticket này hai trong ba sản phẩm của A2 không tồn tại ở bất kỳ đâu, không trong kho mã, không trên đĩa, không trên Drive.
Rubric cho ô "Báo cáo & trình bày" 20%, nên riêng chỗ trống ấy đã là một phần năm điểm; nhưng chỗ nặng hơn là 80% còn lại chỉ đến được tay giám khảo **thông qua** báo cáo và bài nói.
Kiến trúc, pipeline, bốn ADR và toàn bộ Số liệu mốc đều đã tồn tại và đã được nghiệm thu, mà không ai chấm được một kho mã bằng cách đọc kho mã.

Ticket đóng qua pull request #81, commit `2bc8df8`.

### Ba tài liệu, ba người đọc, và vì sao không gộp hai cái sau

Đây là quyết định dễ bị coi là thẩm mỹ, nên lý do phải ghi ra: nó là lý do về công cụ.

Chủ đồ án dựng slide bằng NotebookLM hoặc Kimi, và chất lượng đầu ra của loại công cụ ấy phụ thuộc gần như hoàn toàn vào việc đầu vào đã chia sẵn theo slide hay chưa.
Nạp một báo cáo văn xuôi thì công cụ phải tự đoán đâu là một slide, và nó thường cắt theo tiêu đề rồi nhồi cả đoạn vào một slide.
Nên `docs/dan-y-slide.md` viết cho công cụ chứ không cho người: một slide một tiêu đề kèm bốn tới năm gạch đầu dòng, số đã rút gọn sẵn thành dạng nói được, và không một câu văn hoàn chỉnh nào.

`docs/kich-ban-noi.md` tách ra thành file riêng đúng vì điều trên.
Một file có sẵn câu hoàn chỉnh mà nạp vào công cụ sinh slide thì công cụ sẽ đưa nguyên câu lên slide, tức phá đúng thứ mà dàn ý được viết để tránh.
Cả hai file đều mang một câu ở đầu nói rõ file nào được nạp và file nào không, vì ràng buộc này chỉ tồn tại trong đầu người viết chứ không có gì kiểm được nó.

### Báo cáo sống trong kho mã, và bản `.docx` là sản phẩm dẫn xuất

Nguồn sự thật là `docs/bao-cao-a2.md`; `tools/bao-cao-sang-docx.py` sinh `bao-cao-a2.docx` ở gốc kho để đếm trang thật và xuất PDF.

Hai lý do, và cả hai đều cụ thể chứ không phải sở thích định dạng.
Thứ nhất, mỗi con số báo cáo trích trỏ được về một file nguồn ở cùng kho, và `CONTEXT.md` cấm giữ bản sao thứ hai của cùng một con số; nên báo cáo phải là chỗ **trích** số kèm đường trỏ, không phải chỗ chép lại số.
Thứ hai, một báo cáo về Configuration Management mà bản thân nó không được quản lý cấu hình là chỗ tự mâu thuẫn.

Bản `.docx` vì vậy không được commit, và `.gitignore` nhận nó cùng với hai thứ đi kèm mà lần đầu bị bỏ sót: file chủ sở hữu `~$*.docx` mà Word tạo bên cạnh một `.docx` đang mở, và `__pycache__/` vì kho mã giờ có một file Python.
Cả hai đang nằm untracked ở gốc kho chờ một lần `git add -A`, đúng như bản `.docx` từng chờ trước khi ticket này bắt đầu.

### Cấu trúc báo cáo phải cân hai ràng buộc kéo ngược nhau

`docs/adr/0001-chon-chuong-25-lam-de-tai-a2.md` cam kết phủ đủ bốn mục 25.1 tới 25.4, nhưng Rubric lại chấm theo năm tiêu chí khác, trong đó ô Kiến trúc 25% không thuộc mục nào của Chương 25.

Cách giải là một cấu trúc hợp nhất tám mục.
Nửa đầu đi theo kiến trúc Hệ thống demo rồi bốn mục con mang **đúng tên** 25.1 tới 25.4, để giám khảo có chỗ đối chiếu với sách và để cam kết trong ADR không bị phá.
Nửa sau đi theo thiết kế thí nghiệm và kết quả đo, để Luận điểm có chỗ liền mạch mà triển khai.
Bốn mục con mang tên sách là quyết định có chủ đích, không phải thói quen đặt tiêu đề.

### Bốn phần của mục 3, thêm sau khi đọc lại bản nháp đầu

Bốn mục con của mục 3 đi theo cùng một cấu trúc bốn phần: nguyên lý mà chương đưa ra, yêu cầu kỹ thuật rút ra từ nguyên lý ấy, cách đồ án hiện thực hoá, rồi kết quả và cái giá phải trả.

Cấu trúc này thêm **sau** khi bản nháp đầu đã viết xong, và lý do là đọc lại thấy nó chỉ trả lời được "nhóm đã làm gì" chứ không trả lời được "vì sao phải làm như vậy".
Hai phần sau đã có sẵn trong bản nháp và chỉ cần sắp lại; hai phần đầu là phần viết mới, và chúng cố ý ngắn vì chúng chỉ cần đủ để phần sau có chỗ neo, không nhằm chép lại sách.
Cấu trúc chỉ áp cho bốn mục con của mục 3: mục 2 là kiến trúc và mục 4 là thiết kế thí nghiệm, cả hai không có nguyên lý nào của Chương 25 tương ứng, nên ép khuôn lên chúng sẽ sinh ra những đoạn lý thuyết viết cho đủ chỗ.

### Lần thứ năm một tài liệu tự lệch, và nó xảy ra trên chính tài liệu nói về hiện tượng đó

Mục 3.3 của báo cáo đếm được bốn lần một thứ mô tả hệ thống tự lệch khỏi hệ thống sau một thay đổi.
Trong lúc rà nghiệm thu chính báo cáo ấy thì lần thứ năm lộ ra, cùng hình dạng.

Comment thứ nhất của #77 sửa ô nghiệm thu về số trang, từ "khoảng 12 tới 15" thành "ít nhất 12", vì khoảng của đề cương là mức tối thiểu chứ không phải trần.
Nhưng docstring của `tools/bao-cao-sang-docx.py` vẫn bảo người dùng siết báo cáo về khoảng cũ, tức bảo siết một báo cáo 16 trang đã đạt.
Tiêu chí đổi, hướng dẫn dùng công cụ không đổi theo, và không có gì báo động vì cả hai câu đều đọc hợp lý khi đứng một mình.

Điểm khác so với bốn lần trước đáng ghi lại.
Bốn lần kia, thứ lệch là một định nghĩa số đo hoặc một câu mô tả quy trình.
Lần này thứ lệch là **hướng dẫn dùng một công cụ**, và nó lệch khỏi một tiêu chí nghiệm thu chứ không khỏi một hệ thống, nên nó nằm ở một tầng mà không ai nghĩ tới khi đi tìm chỗ lệch.

Báo cáo cố ý **không** sửa thành "năm lần".
Bảng bốn dòng ở mục 3.3, slide 10 và phần kịch bản tương ứng đều đã chốt, nên đổi con số sát ngày nộp là sửa ba file để mua một chỗ không ai hỏi.
Đây là chỗ đúng để ghi nó, và ghi ở đây thì nó vẫn là vật liệu dùng được nếu phần hỏi đáp đi tới đó.

### Ba chỗ mà việc nghiệm thu bắt được, và loại lỗi của từng chỗ

Ticket quyết định **không** thêm công cụ kiểm nào, và nghiệm thu bằng đối chiếu tay theo một danh sách mười ba ô.
Một script trích mọi con số rồi đối chiếu với file nguồn là hình dung được, nhưng nó là công cụ mới cho đúng một tài liệu, phải bảo trì, mà cái nó bắt được thì đọc mắt cũng bắt được trên 16 trang.

Quyết định ấy được kiểm chứng: hai ô nặng nhất của danh sách bắt được hai chỗ thật.
Con số 20 test ở mục 6.3 không có câu trỏ nguồn, giờ trỏ về mục nhật ký của #12.
Mục 3.4 dẫn đặc tả semver mà không chỗ nào trong chuỗi trích nó, kể cả `docs/quy-tac-phien-ban.md`, nên `semver.org` được ghi vào danh sách nguồn ngoài ở mục 6.4.

Nhưng review tự động trên pull request #81 bắt được một chỗ mà đọc mắt **không** bắt, và loại lỗi ấy đáng ghi lại.
Khối lệnh của chặng demo thứ nhất dùng chỗ giữ chỗ dạng dấu ngoặc nhọn, mà dấu ngoặc nhọn là toán tử chuyển hướng của shell, nên dán vào terminal là lỗi ngay.
Nó đọc hoàn toàn hợp lý trên trang và chỉ hỏng lúc thực thi, tức đúng loại lỗi mà một cổng gác tự động bắt được còn một lượt đọc thì không; và chỗ nó hỏng là chặng duy nhất có thao tác thật trước mặt giám khảo.

Review cũng chỉ ra một khẳng định quá mức ở mục 3.2.
Báo cáo viết "ba image nền đều ghim tới phiên bản nhỏ" ngay dưới một yêu cầu đòi phiên bản **xác định**, nhưng `node:24-alpine` là tag di động chứ không phải digest, nên hai mức ghim trong cùng một câu không mạnh bằng nhau.
Chỗ đó được nói rõ ở báo cáo, slide 7, kịch bản và hỏi đáp số 8.
Đề xuất kèm theo là ghim theo digest, và nó bị từ chối: nó đổi `Dockerfile`, tức thêm một biến vào giữa một giai đoạn đang đo, mà #77 không xây gì cho pipeline.

### Phần demo dựa vào chứng cứ đã tồn tại

Bốn chặng: Hệ thống demo thật trên prod, trang Actions với một lần chạy xanh đủ ba job, trang Releases với `v0.1.0` và changelog tự sinh, rồi một đoạn đi ngược chuỗi truy vết từ bản phát hành về commit, về pull request, về issue và các tiêu chí đã tick.

Chặng thứ tư là chặng mạnh nhất và cũng là chặng không thể hỏng, vì nó chỉ đọc dữ liệu tĩnh.
Chạy pipeline trực tiếp bị loại vì nó cần runner tự quản còn sống, phải chờ hơn hai phút theo bảng so sánh của chính báo cáo, và có thể đỏ vì lý do không liên quan tới đồ án như mạng hoặc GHCR.
Kịch bản còn ghi sẵn cách xử lý nếu prod không lên: bỏ chặng một và nói thẳng là bỏ, vì ba chặng còn lại không phụ thuộc nó.

### Số liệu

`docs/bao-cao-a2.md`: tám mục, bốn mục con mang tên 25.1 tới 25.4, mỗi mục con đủ bốn phần.
Bản `.docx` sau khi sửa review: 10748 từ, số ước mà script in ra là 17,0 trang.
Lần đếm thật gần nhất là **16 trang**, đo trong Word trên bản trước khi sửa review, lúc đó số ước là 16,8; bản sau chưa đếm lại.
Mô hình đếm dòng của script vì vậy lệch chưa tới một trang trên bản này, và số ước vẫn chỉ dùng để biết cần siết hay nới chứ không dùng để nghiệm thu.

`docs/dan-y-slide.md`: 22 slide, nằm trong khoảng 18 tới 22 mà ticket đòi.
`docs/kich-ban-noi.md`: phần nói theo 22 slide, bốn chặng demo, và chín câu hỏi đáp, tức nhiều hơn sáu câu mà ticket liệt kê.
Ba câu thêm là về việc không có ai review pull request, về chỗ lệch digest, và về vì sao Docker Compose chứ không Kubernetes.

Mười ba ô nghiệm thu đều tick.
Review tự động nêu bốn chỗ; nhận ba chỗ nguyên vẹn và một chỗ nhận phần chẩn đoán mà từ chối phần đề xuất.

### Dẫn chứng

- Ba tài liệu: `docs/bao-cao-a2.md`, `docs/dan-y-slide.md`, `docs/kich-ban-noi.md`
- Công cụ sinh bản `.docx`, kèm giới hạn cú pháp Markdown mà nó hiểu: `tools/bao-cao-sang-docx.py`
- Cấu trúc báo cáo đã chốt, danh sách nghiệm thu, và lý do không thêm công cụ kiểm: mục Implementation Decisions và Testing Decisions của #77
- Lý do sửa ô nghiệm thu về số trang giữa chừng ticket: comment thứ nhất trên #77
- Bốn chỗ review bắt được và cách xử lý từng chỗ: pull request #81
- Bốn lần tài liệu tự lệch trước lần này: mục 3.3 của `docs/bao-cao-a2.md`, và mục "2026-07-29 - Đóng Giai đoạn thủ công, và cái giá của việc chốt một định nghĩa muộn" cùng mục "2026-07-29 - Staging tự cập nhật, và một cột mốc suýt đổi nghĩa mà không ai biết" của file này

### Đang ở đâu sau mục này

**Phần thuộc kho mã của A2 đã xong.**
Ba sản phẩm nộp là báo cáo, ứng dụng chạy được và bài thuyết trình; hai cái đầu đã tồn tại và nghiệm thu được, còn cái thứ ba giờ đã có đủ vật liệu.

Việc còn lại trước buổi thuyết trình ngày 2026-07-31 **không thuộc kho mã** và không ticket nào nhận, vì chúng là thao tác của chủ đồ án chứ không phải thay đổi lên hệ thống.
Nạp `docs/dan-y-slide.md` vào NotebookLM hoặc Kimi để dựng slide, và tuyệt đối không nạp `docs/kich-ban-noi.md` vào cùng chỗ.
Xuất PDF từ `bao-cao-a2.docx` bằng Word, và đếm lại số trang thật của bản đã sửa review.
Dựng prod lên rồi chạy thử ba lệnh của chặng demo thứ nhất trước khi vào phòng.
Tập nói ít nhất một lượt thành tiếng, vì kịch bản viết theo mốc 15 phút mà đề cương không ghi thời lượng, nên mốc ấy là giả định chứ không phải số biết trước.

Nhóm C còn đúng **#13**, và nó vẫn đã hết blocker.
Nó đóng nốt chuỗi, làm lead time của Giai đoạn pipeline tính được lần đầu, xoá hẳn ràng buộc nhắc triển khai prod bằng tay trong `CLAUDE.md`, và là chỗ tự nhiên để sửa luôn chỗ lệch digest.
Nếu nó xong trước buổi nói thì mục 6.3 và mục 7 của báo cáo phải sửa theo, vì cả hai đang nói rằng ô lead time còn trống.

Hai yêu cầu còn nợ từ Giai đoạn thủ công vẫn nguyên và vẫn chưa ticket nào nhận: cần ít nhất một thay đổi chạm `infra/postgres/init.sql`, và cần một thay đổi chạm `services/` đi qua chuỗi đầy đủ.
