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
