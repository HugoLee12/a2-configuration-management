# Dàn ý slide A2

File này là **đầu vào cho công cụ sinh slide**, không phải tài liệu để đọc.
Mỗi mục `## Slide` là đúng một slide; tiêu đề của mục là tiêu đề slide, các gạch đầu dòng là nội dung slide.
Không gộp hai mục vào một slide và không cắt một mục thành hai.

Các con số ở đây đã rút gọn sẵn thành dạng nói được, nên đừng đi tra lại bảng gốc để trích chi tiết hơn.
Không có câu văn hoàn chỉnh trong các slide, và đó là cố ý: câu hoàn chỉnh thuộc về `docs/kich-ban-noi.md`, và **file đó không được nạp vào công cụ sinh slide**.

Nguồn của mọi nội dung dưới đây là `docs/bao-cao-a2.md`.
Sửa nội dung thì sửa báo cáo trước, rồi sửa lại ở đây.

## Slide 1 - Configuration Management và DevOps trên một hệ ba service

- Đồ án A2, học phần CNTT313E1, chủ đề Chương 25 Configuration Management
- Ba service TypeScript tự viết, triển khai bằng Docker Compose
- Đo tác động của pipeline bằng bộ chỉ số DORA
- Kho mã: github.com/HugoLee12/a2-configuration-management

## Slide 2 - Vì sao Chương 25, và rủi ro tự mang theo

- Bốn mục 25.1 tới 25.4 là bốn hoạt động của cùng một quy trình
- Một pipeline chạy thật chạm trọn cả bốn, không phát sinh khối lượng
- Rủi ro nêu sẵn trong ADR 0001: đề tài CI/CD rất dễ thành bài khoe pipeline
- "Tự động hoá thì tốt hơn" - không sai, nhưng không phải một kết quả
- Biện pháp: một luận điểm định lượng, và pipeline thành đối tượng được đo

## Slide 3 - Luận điểm của đồ án

- Pipeline **không** nhanh hơn con người ở phần làm việc
- Chỗ nó thắng: khoảng chờ, và việc không còn cần một người có mặt gõ lệnh
- Phản trực giác, nên phải có số tự đo đỡ lưng
- Số tự đo chỉ có được nhờ một quyết định trả giá trước
- Cái giá: cấm dựng CI/CD trong mấy tuần đầu của đồ án

## Slide 4 - Hệ thống demo được quản lý cấu hình

- Dịch vụ rút gọn URL, ba service TypeScript, nghiệp vụ cố ý tối giản
- nginx là cửa vào duy nhất, không service nào mở cổng ra ngoài
- link tạo mã, redirect trả 302 và ghi lượt, stats là worker cộng dồn
- stats nằm ngoài đường phục vụ request: dừng nó thì chuyển hướng vẫn chạy
- Ghép nối lỏng qua bảng cơ sở dữ liệu, không qua lời gọi đồng bộ

## Slide 5 - Ba ràng buộc kiến trúc kéo hệ quả lên pipeline

- Một Dockerfile cho cả ba service, phân biệt bằng command trong compose
- Một compose.yaml, hai môi trường khác nhau đúng một file trong env/
- Kiểm thử hộp đen, chỉ đi qua nginx bằng HTTP, không import mã service
- TypeScript chạy thẳng trên Node, không có bước biên dịch ứng dụng
- Hệ quả: "dựng lại từ mã nguồn" và "chạy" là cùng một thứ

## Slide 6 - 25.1 Version management

- Nguyên lý: codeline, baseline, mainline; baseline gồm cả thứ không phải mã
- Trunk-based, một trunk main, squash merge, một issue một commit
- Cấu hình hạ tầng, compose, env/, workflow đều ở cùng kho với mã
- Kết quả: baseline theo nghĩa 25.1 trùng đúng một commit
- Hai chỗ không nằm trong kho được, và được ghi ra: rule bảo vệ nhánh, image trên GHCR

## Slide 7 - 25.2 System building

- Nguyên lý: dựng hệ chạy được từ mã, thư viện và dữ liệu cấu hình
- Yêu cầu trung tâm: một lần build phải tái tạo được
- Ghim bằng package-lock, npm ci, ba image nền ghim tới phiên bản nhỏ
- Một đường build duy nhất: job kiem-tra bốn cổng, rồi job dong-goi
- Lần chạy trên main không thừa: squash sinh commit mới, đó mới là commit đem triển khai

## Slide 8 - 25.2 và ba món nợ của bước build

- Thứ tự build với kiểm thử bị đảo so với cách làm tay
- kiem-tra dựng một image để có stack mà kiểm, dong-goi dựng lại rồi đẩy image khác
- docker build không tái lập được: cùng một commit, hai digest khác nhau
- oxlint chạy không có file cấu hình, nên chỉ nhóm rule mặc định
- Hình dạng chung: thứ được kiểm và thứ được phát hành là hai artefact khác nhau

## Slide 9 - 25.3 Change management

- Nguyên lý: quyết định thay đổi nào được làm, và theo dõi nó đã áp vào đâu
- Hội đồng phê duyệt không chuyển được sang một đồ án một người
- Kiểm soát chuyển sang cổng gác tự động: issue, nhánh, PR có Closes, squash
- Cổng gác nghiệm thu cả chiều đỏ: một test trượt cố ý, PR chuyển BLOCKED, dong-goi bị SKIPPED
- Đúng một ngoại lệ của quy ước, và nó được viết ra kèm lý do

## Slide 10 - 25.3 và bốn lần tài liệu tự lệch khỏi hệ thống

- Định nghĩa một cột số đo: có số trước khi có định nghĩa, hai chỗ tính hai cách, chênh gấp ba
- Một câu tự nói sai về chính file chứa nó
- Hai tài liệu vẫn bảo bấm một cái đồng hồ không còn ai bấm
- Một cột mốc đổi nghĩa chỉ vì có một job mới chạy sau job cũ
- Không lần nào có test đỏ; thứ hỏng là những gì mô tả hệ thống

## Slide 11 - 25.4 Release management

- Nguyên lý: release khác một bản build bất kỳ, và phải dựng lại được về sau
- Kích hoạt bằng một cú push tag, không bằng nút bấm, nên lựa chọn nằm trong kho mã
- Workflow phát hành gọi lại image.yml, nên tag trong kho và tag image là cùng một chuỗi
- Changelog sinh từ pull request đã merge, và không có CHANGELOG.md trong kho
- v0.1.0 chứ không v1.0.0: dải 0.y.z là tuyên bố API công khai chưa ổn định

## Slide 12 - Thiết kế thí nghiệm hai giai đoạn

- ADR 0003: cấm dựng CI/CD từ commit đầu, để có mốc so sánh tự đo
- Giữa hai giai đoạn chỉ đổi đúng một biến, là sự hiện diện của pipeline
- Suy ra trunk-based xuyên suốt, và staging vẫn phải ở đúng máy đã đo trước
- Bốn nguyên tắc đo: đồng hồ không dừng giữa chừng, bảng thô không có cột tính sẵn, mốc thô tách khỏi số dẫn xuất, định nghĩa chốt trước khi ghi mẫu
- Nguyên tắc thứ hai đã trả cổ tức: năm mẫu tính lại trong vài phút thay vì đo lại

## Slide 13 - Reuse, và một chỗ cố ý không tái sử dụng

- image.yml khai workflow_call; ci.yml và phat-hanh.yml cùng gọi lại
- Một Dockerfile cho ba service, một compose cho hai môi trường
- Smoke test là một dòng trong package.json chọn hai trong năm file test có sẵn, không file test mới
- Chỗ cố ý không: workflow "nhận tham số tên service" bị bỏ, vì ba image sẽ giống nhau tới từng byte
- Trục tái sử dụng dịch một tầng, từ giữa ba service sang giữa các workflow

## Slide 14 - Chọn GitHub Actions, và cái giá đã trả

- Sommerville nhắc Jenkins ở 25.2, nên lựa chọn cần được so chứ không mặc định
- Jenkins bị loại vì chi phí vận hành không rơi vào ô điểm nào của rubric
- GitLab CI tương đương, nhưng đổi kho là thêm một biến vào giữa thí nghiệm
- Giá đã trả: log job hết hạn lưu giữ, trần 90 ngày với kho công khai
- Giá thứ hai: self-hosted runner trên kho công khai, chặn bằng một dòng if trong ci.yml

## Slide 15 - Số của Giai đoạn thủ công

- Năm thay đổi, mười lần triển khai một môi trường, cửa sổ đo 18 giờ
- Lead time trung vị 5 phút, trung bình 8,6 phút
- Chờ trung vị 2 phút, staging 2 phút, prod trung vị 1 phút
- Trung vị là số chính: một mẫu duy nhất kéo trung bình từ 8,6 lên 21,2, trung vị đứng nguyên ở 5
- Cột staging đọc như một dải quanh 2 phút, vì đồng hồ chỉ phân giải tới phút

## Slide 16 - Con số 40% và cách đọc đúng nó

- Tỷ lệ phát hành thất bại: hai trên năm lần lên prod, tức 40%
- Cả hai lần hỏng truy về đúng một nguyên nhân: thay đổi schema thiếu bước xoá volume
- Chỉ một trong năm mẫu đụng schema
- Đọc đúng: một trên một thay đổi schema đã hỏng, bốn thay đổi không đụng schema không hỏng lần nào
- Thời gian phục hồi 65 phút, prod hỏng một phần mà bốn test cũ vẫn xanh

## Slide 17 - So sánh hai giai đoạn

- Chờ sau khi merge: tay trung vị 2 phút, máy 3 tới 8 giây
- Kiểm thử và đóng gói: tay nằm trong 2 phút của chặng staging, máy 68 tới 84 giây
- Nghiệm thu trên môi trường thật: máy 68 giây, đúng một mẫu
- Lead time tới prod: tay trung vị 5 phút, máy chưa tính được
- Cần một người có mặt: tay mọi lần, máy không lần nào ở staging

## Slide 18 - Ba kết luận đọc được từ bảng so sánh

- Ở phần làm việc thì ngang nhau: khoảng hai phút so khoảng hai phút
- Máy còn cõng thêm chờ runner, một lần pull từ GHCR, và một lần dựng lại image
- Chỗ thắng là khoảng chờ, từ dải phút xuống dải giây, nhưng hai số ấy đo hai hiện tượng
- Chờ người rảnh tay so với độ trễ điều phối của GitHub: thứ biến mất là việc phải chờ người
- Thứ pipeline mua được mà giây không thể hiện: luôn xoá volume, luôn đúng ba bước, dựng staging từ chính image đã đóng gói

## Slide 19 - Đối chiếu ngưỡng ngành, đây là số trích không phải số nhóm

- Nguồn: DORA, Accelerate State of DevOps Report 2024
- Ngưỡng bốn nhóm hiệu năng đổi giữa các năm, nên phải đọc kèm năm 2024
- Giai đoạn thủ công: lead time và tần suất rơi vào Elite, thời gian phục hồi rơi vào High
- Đọc ngược cách nó trông: nói về kích thước của hệ, không về năng lực của quy trình
- Change failure rate bị bỏ khỏi bảng: hai bản dẫn lại độc lập cho hai bộ giá trị khác nhau

## Slide 20 - Giới hạn, ba chỗ chưa đo được

- Lead time của Giai đoạn pipeline: chuỗi còn thiếu mắt prod, ticket #13
- Tỷ lệ hỏng và thời gian phục hồi của Giai đoạn pipeline: không mẫu nào, cần tiêm lỗi có kiểm soát, ticket #21
- Không ảnh biểu đồ nào: /metrics đã phơi, Prometheus với Grafana chưa vào stack, ticket #15
- Cỡ mẫu: năm mẫu tay, sáu dòng máy mà không dòng nào là thay đổi cỡ chuẩn
- Độ phân giải đồng hồ hai giai đoạn lệch 60 lần, sai số lượng tử hoá không khử được

## Slide 21 - Demo, bốn chặng đọc chứng cứ đã có

- Hệ thống demo thật trên prod: tạo một link rồi bấm vào nó
- Trang Actions: một lần chạy xanh đủ ba job
- Trang Releases: v0.1.0 với changelog tự sinh, 36 pull request
- Đi ngược chuỗi truy vết: từ release về commit, về pull request, về issue và các tiêu chí đã tick
- Cả bốn chặng chỉ đọc dữ liệu đã có, không chạy pipeline trực tiếp

## Slide 22 - Kết luận

- Không chứng minh CI/CD tốt hơn làm tay, mà đo xem cái tốt hơn nằm ở đâu
- Ở phần làm việc thì cùng cỡ nhau, khoảng hai phút cho môi trường đầu tiên
- Chỗ thắng là khoảng chờ, và thắng vì việc phải chờ một người rảnh tay đã biến mất
- Chỗ thắng đậm nhất không đo được bằng giây: xoá cái bước mà con người phải tự quyết
- Thứ học được nhiều nhất: bốn lần một thứ mô tả hệ thống tự lệch, không lần nào có test đỏ
