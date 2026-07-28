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
