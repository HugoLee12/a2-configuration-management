# Kịch bản thuyết trình A2

File này để chủ đồ án tập nói thành tiếng, và **không được nạp vào công cụ sinh slide**.
Lý do rất cụ thể: nó gồm câu văn hoàn chỉnh, mà công cụ sinh slide sẽ đưa nguyên câu lên slide.
File nạp vào công cụ là `docs/dan-y-slide.md`.

Nội dung ở đây lấy từ `docs/bao-cao-a2.md` và không sinh con số mới nào.
Số slide trong kịch bản khớp với **14 slide thật** trong file `Quantifying_Configuration_Management_and_DevOps.pptx` ở gốc kho mã, không còn khớp một một với 22 slide của `docs/dan-y-slide.md` nữa, vì chủ đồ án đã tự biên tập lại deck sau khi dựng từ dàn ý đó (xem #86).
Đổi deck thật thì phải mở lại file `.pptx`, đối chiếu tiêu đề từng slide, rồi mới sửa ở đây.

## Ngân sách thời gian

Đề cương không ghi thời lượng, nên kịch bản viết theo mốc **15 phút nói cộng phần demo và hỏi đáp**.
Bảng dưới là mức phân bổ, không phải luật; chỗ quan trọng là thứ tự ưu tiên khi phải cắt.

| Khối | Slide | Phút |
|---|---|---|
| Mở đầu và luận điểm | 1 tới 2 | 2,0 |
| Kiến trúc | 3 và 4 | 1,5 |
| Bốn hoạt động Chương 25 | 5 tới 10 | 4,5 |
| Thiết kế thí nghiệm | 11 | 1,0 |
| Reuse | 12 | 1,0 |
| Đọc số liệu | 13 | 4,0 |
| Kết luận | 14 | 1,0 |
| Demo | Bốn chặng demo | 3,0 |

Nếu bị cắt còn 10 phút thì gộp slide 7 vào slide 6, rút gọn đoạn đối chiếu ngưỡng ngành trong slide 13, và rút demo còn chặng 1 với chặng 4.
Hai slide và một đoạn **không được bỏ** trong mọi trường hợp là slide 2 luận điểm, slide 9 bốn lần tài liệu tự lệch, và đoạn ba kết luận trong slide 13.
Đó là ba chỗ duy nhất của bài nói mà một đồ án khác không nói được thay.

## Phần nói theo từng slide

### Slide 1 - Configuration Management và DevOps trên hệ ba service

Đồ án của em áp Chương 25 Configuration Management lên một hệ ba service do em tự viết, rồi đo tác động của nó bằng bộ chỉ số DORA.
Điểm em muốn nói trước để thầy cô biết chỗ nghe: đây là một đồ án đo lường, không phải một đồ án dựng công cụ.
Em chọn phủ đủ bốn mục 25.1 tới 25.4 thay vì đào sâu một mục, vì bốn mục đó là bốn hoạt động của cùng một quy trình, và một pipeline chạy thật đã chạm trọn cả bốn mà không phát sinh thêm khối lượng công việc.
Nhưng lựa chọn ấy mang theo một rủi ro em ghi ngay trong ADR chứ không phát hiện về sau: một đề tài về CI/CD rất dễ biến thành một bài khoe pipeline, và kết luận "tự động hoá thì tốt hơn" không sai nhưng cũng không phải một kết quả, vì ai cũng đã đồng ý trước khi đọc.
Nên em gắn cho đồ án một luận điểm định lượng, bắt pipeline trở thành đối tượng được đo, và toàn bộ số liệu trong bài là số em tự đo trên chính kho mã này, trừ đúng một đoạn trong slide Đọc số liệu, nơi em trích số của ngành để đối chiếu.

### Slide 2 - Luận điểm cốt lõi: Pipeline không nhanh hơn con người ở khâu làm việc

Luận điểm là pipeline không nhanh hơn con người ở phần làm việc.
Chỗ nó thắng là khoảng chờ, và là việc không còn cần một người có mặt gõ lệnh.
Đây là câu phản trực giác, nên nó chỉ đứng được nếu có số tự đo đỡ lưng, và số tự đo thì phải trả giá trước mới có.
Cái giá là em cấm chính mình dựng CI/CD trong mấy tuần đầu, tức cấm làm đúng thứ mà đề tài nói về.

### Slide 3 - Hệ thống demo: Kiến trúc rút gọn để tối ưu đo lường

Hệ thống là một dịch vụ rút gọn URL gồm ba service TypeScript, và nghiệp vụ của nó cố ý tối giản.
Đề tài chấm năng lực Configuration Management, nên mọi giờ công đổ vào nghiệp vụ là giờ công lấy khỏi pipeline và đo lường.
nginx là cửa vào duy nhất, không service nào mở cổng ra ngoài, kể cả với bộ kiểm thử.
Chỗ kiến trúc này đáng nói là service thứ ba: `stats` là worker nằm ngoài đường phục vụ request, nên dừng nó thì chuyển hướng vẫn chạy bình thường và chỉ có số lượt là đứng yên.
Em sẽ dùng lại chi tiết đó ở phần kết quả, vì nó tạo ra tình huống một phần của hệ hỏng mà phần còn lại vẫn xanh.

### Slide 4 - Ba ràng buộc kiến trúc định hình hình dáng pipeline

Ba ràng buộc này em nêu vì mỗi cái kéo theo một hệ quả lên pipeline chứ không phải để mô tả cho đủ.
Ba service dùng chung đúng một Dockerfile, nên ở mức CI không còn việc gì là riêng của từng service, và slide Reuse sẽ nói trục tái sử dụng phải đặt ở đâu.
Bộ kiểm thử là hộp đen chỉ đi qua nginx bằng HTTP, nên nó bắt được lỗi ở chỗ ghép nối giữa các thành phần, nhưng nó không kiểm được phần ghi log.
Và TypeScript chạy thẳng trên Node không có bước biên dịch, nên với hệ này thì dựng lại từ mã nguồn và chạy là cùng một thứ.

### Slide 5 - 25.1 Version Management: Baseline nằm gọn trong một commit

Em bắt đầu bằng một câu hỏi rất thực tế: muốn dựng lại đúng cái hệ đã chạy hôm qua thì quản lý mã nguồn thôi có đủ không.
Không đủ, vì thiếu một file cấu hình hay một dữ liệu môi trường thì phần mã còn lại không dựng thành một hệ chạy được.
Mục 25.1 gọi cái tập phiên bản đã cố định, đủ để dựng nên một hệ chạy được ấy là baseline, và chỗ dễ bỏ qua nhất nằm ngay trong định nghĩa: baseline gồm cả những thứ không phải mã.
Yêu cầu rút ra vì vậy là ranh giới của baseline phải rộng bằng ranh giới của hệ, nên cấu hình nginx, schema Postgres, định nghĩa stack, các file môi trường và cả ba workflow đều nằm trong cùng kho mã với mã nguồn.
Kết quả là baseline theo nghĩa của sách trùng đúng với một commit, không phải một commit cộng thêm một thứ nằm ở nơi khác.
Cái phải trả là hai hạng mục không nằm trong kho được, là rule bảo vệ nhánh trên GitHub và image trên GHCR, và em ghi cả hai ra thay vì làm mờ đi.

### Slide 6 - 25.2 System Building: Tính tái tạo và một đường build duy nhất

Yêu cầu trung tâm của mục 25.2 là một lần build phải tái tạo được, tức cùng một đầu vào cho ra cùng một hệ ở máy khác và thời điểm khác.
Em ghim phụ thuộc bằng `package-lock.json` với `npm ci`, và ghim ba image nền tới phiên bản nhỏ.
Hai mức ghim đó không mạnh bằng nhau và em nói rõ trong báo cáo: `package-lock.json` ghim tới đúng một bó byte, còn ba tag image nền thì vẫn di động, nên một bản vá của cùng phiên bản nhỏ đổi image nền mà không đổi một ký tự nào trong `Dockerfile`.
Mọi thay đổi đi qua đúng một đường, là job `kiem-tra` gồm bốn cổng theo thứ tự kiểm kiểu, lint, dựng stack, chạy toàn bộ kiểm thử.
Một chi tiết trông thừa mà không thừa: workflow chạy cả trên pull request và trên `main`.
Vì merge bằng squash sinh ra một commit mới, nên nếu chỉ chạy ở pull request thì commit thật sự nằm trên `main` sẽ là commit duy nhất không có image nào, mà đó lại đúng là commit phải đem triển khai.

### Slide 7 - 25.2 Ba món nợ kỹ thuật của bước Build

Yêu cầu tái tạo được thì em không đạt trọn, và em đo chỗ hụt chứ không đoán.
Thứ nhất, thứ tự build và kiểm thử bị đảo so với cách làm tay: `kiem-tra` dựng một image để có stack mà kiểm, rồi `dong-goi` dựng lại từ đầu ở một job khác và đẩy image đó đi.
Thứ hai, `docker build` không tái lập được, và em kiểm được bằng cách so digest của hai tag trỏ về cùng một commit; hai digest khác nhau.
Thứ ba, lint chạy không có file cấu hình nên chỉ bật nhóm rule mặc định, và nói "đã có lint" mà không nói ở mức nào là một câu đúng chữ mà sai nghĩa.
Hai món nợ đầu cùng một hình dạng, và hình dạng ấy đáng nói hơn cả hai chi tiết kỹ thuật: thứ được kiểm và thứ được phát hành là hai artefact khác nhau.

### Slide 8 - 25.3 Change Management: Cổng gác nghiệm thu tự động

Vấn đề mà mục 25.3 đặt ra không phải là ghi lại thay đổi, mà là phải có một chỗ từ chối được một thay đổi không đạt; thiếu chỗ đó thì hệ không phải đang tiến hoá mà là đang trôi.
Sommerville đặt chỗ từ chối ấy vào một hội đồng phê duyệt, xét từng yêu cầu thay đổi trước khi nó được hiện thực.
Hội đồng đó không chuyển thẳng sang một đồ án một người vì không có ai độc lập để duyệt, nên phần kiểm soát của em chuyển sang một cổng gác tự động: mọi thay đổi đi qua issue, nhánh, pull request có dòng `Closes`, rồi squash vào `main`.
Chuỗi ấy không phải để trang trí, nó là mắt xích em dùng để tính lead time, nên một pull request thiếu dòng đó làm hỏng số đo chứ không chỉ mất một liên kết.
Điều em muốn nhấn: em nghiệm thu cổng gác ở cả chiều đỏ, không chỉ chiều xanh.
Em cố ý thêm một test trượt vào một nhánh, và ba thứ xảy ra đúng như mong đợi: kiểm tra đỏ, pull request chuyển sang trạng thái bị chặn, và job đóng gói bị bỏ qua nên không có image nào được đẩy cho một commit hỏng.

### Slide 9 - 25.3 Bốn lần tài liệu tự lệch khỏi hệ thống (Drift)

Đây là phần em cho là đáng giá nhất của cả đồ án, và nó không mua được bằng cách viết thêm mã.
Bốn lần trong kho mã này, một thứ mô tả hệ thống đã tự lệch khỏi hệ thống sau một thay đổi.
Một định nghĩa số đo bị tính theo hai cách vì có số trước khi có định nghĩa, chênh gấp ba trên cùng một mẫu.
Một câu trong tài liệu tự nói sai về chính file chứa nó.
Hai tài liệu vẫn bảo người ta bấm một cái đồng hồ mà không còn ai bấm nữa.
Và lần thứ tư đáng kể nhất: một cột mốc đã chốt bằng văn bản, có lý lẽ, có bảng đối chiếu, vẫn đổi nghĩa chỉ vì có một job mới chạy sau job cũ.
Không lần nào có test đỏ, vì không lần nào hệ thống hỏng; thứ hỏng là những gì nói về hệ thống.
Đó chính là câu trả lời của em cho câu hỏi vì sao Configuration Management là một hoạt động riêng chứ không phải một phần của việc viết mã.

### Slide 10 - 25.4 Release Management: Kích hoạt bằng mã, không bằng nút bấm

Một bản build thì chỉ cần chạy được hôm nay, còn một bản đã phát hành thì có ngày phải dựng lại rất lâu về sau, có khi để quay về sau một sự cố.
Đó là lý do mục 25.4 tách release ra khỏi một bản build bất kỳ, và đòi hai thứ ở nó: mỗi bản phải được ghi lại đủ để dựng lại chính xác, và phải mang một số hiệu theo một sơ đồ nhất quán nói được nó đứng ở đâu so với các bản khác.
Yêu cầu thứ nhất kéo theo một chuyện dễ bỏ qua, là ngay cả việc chọn bản nào được phát hành cũng phải để lại dấu vết ở chỗ sống lâu bằng kho mã.
Nên bản phát hành của em được kích hoạt bằng một cú push tag, không bằng nút bấm cũng không theo lịch: tag nằm trong kho mã, còn một nút bấm thì chỉ để lại dấu vết trong lịch sử của công cụ, tức mất theo chính sách lưu giữ.
Workflow phát hành gọi lại workflow đóng gói, nên tag trong kho mã và tag của image là cùng một chuỗi ký tự đi qua hai chỗ, chứ không phải hai giá trị đặt cho khớp bằng tay.
Changelog thì GitHub dựng từ các pull request đã merge, nên em không giữ file `CHANGELOG.md` nào: một file chép lại cùng nội dung sẽ là bản thứ hai phải tự tay giữ cho khớp, tức đúng loại tài liệu tự lệch mà slide trước vừa đếm bốn lần.
Còn yêu cầu về số hiệu thì em trả bằng semver, và bản đầu là `v0.1.0` chứ không phải `v1.0.0`, đó là một tuyên bố: đặc tả semver dành dải không chấm y chấm z cho giai đoạn API công khai chưa ổn định, mà đó đúng là trạng thái của hệ này.

### Slide 11 - Thiết kế thí nghiệm hai giai đoạn: Cách ly một biến số

Ràng buộc trung tâm là giữa hai giai đoạn chỉ được đổi đúng một biến, là sự hiện diện của pipeline.
Từ ràng buộc ấy suy ra mấy thứ trông không liên quan: chiến lược nhánh cố định xuyên suốt, và staging của giai đoạn sau vẫn phải chạy trên đúng cái máy mà giai đoạn trước đã đo, nên job triển khai chạy trên một runner tự quản chứ không trên runner mây.
Bốn nguyên tắc đo trên slide đều dựng lên để chống một loại lỗi duy nhất, là số liệu bị làm đẹp.
Nguyên tắc thứ hai đã trả cổ tức và em đo được bằng công sức: khi phát hiện một cột bị tính theo hai cách, không dữ liệu nào phải bỏ và không lần triển khai nào phải làm lại, vì bảng chỉ giữ mốc thô nên cả năm mẫu dựng lại được trong vài phút.
Nếu bảng đã lưu sẵn số phút thì chỗ lệch ấy sẽ tốn năm lần triển khai tay để sửa, mà lúc đó giai đoạn đã hết thay đổi để triển khai.

### Slide 12 - Tái sử dụng (Reuse) & Nguyên tắc DRY trong quy trình

Ô Reuse rất dễ được đáp bằng một câu khen, nên em chỉ nhận những chỗ chỉ ra được bằng file.
Chỗ đáng nói nhất là chỗ em cố ý không tái sử dụng.
Ticket dựng pipeline của em viết rõ là workflow nhận tham số tên service, và bản merge không nhận tham số đó.
Lý do là ba service đã dùng chung một Dockerfile, nên một tham số như vậy chỉ đổi được cái tên trên tag trong khi ba image sinh ra giống nhau tới từng byte.
Đẩy ba tag như vậy là dẫn chứng sai cho ô Reuse, vì nó khoe một sự tái sử dụng ở đúng tầng mà kho mã đã không còn vấn đề đó nữa.
Nên em dịch trục tái sử dụng xuống một tầng, từ giữa ba service sang giữa các workflow, và ghi chỗ điều chỉnh vào nhật ký chứ không sửa đè lên ADR đã viết.

### Slide 13 - Đọc số liệu: Cái thắng là khoảng chờ và độ ổn định

Giai đoạn thủ công có năm thay đổi, mười lần triển khai một môi trường, cửa sổ đo mười tám giờ.
Lead time trung vị là năm phút, và đó là số chính chứ không phải trung bình, vì đây là hệ quả của dữ liệu chứ không phải sở thích thống kê.
Trong năm mẫu có một mẫu có tới hai cách đọc hợp lý, và giữa hai cách đọc đó thì trung bình lead time đổi từ tám phẩy sáu lên hai mươi mốt phẩy hai phút, trong khi trung vị đứng nguyên ở năm.
Với cỡ mẫu bằng năm thì một mẫu bất thường đủ sức lái trung bình đi bất cứ đâu, và bộ dữ liệu này vừa chứng minh chuyện đó bằng chính nó.
Một cảnh báo nữa: cột staging đứng yên ở hai phút suốt cả năm mẫu, nhưng đó là do đồng hồ chỉ phân giải tới phút, nên phải đọc nó như một dải quanh hai phút.
Tỷ lệ phát hành thất bại của giai đoạn này đọc trần là hai trên năm lần triển khai prod, tức bốn mươi phần trăm, và đọc trần thì sai.
Cả hai lần hỏng truy về đúng một nguyên nhân, là một thay đổi schema thiếu bước xoá volume, mà thay đổi schema thì chỉ có đúng một trong năm mẫu.
Nên phải đọc là một trên một thay đổi schema đã hỏng, và không thay đổi nào trong bốn thay đổi không đụng schema hỏng cả.
Sự cố đó là chỗ kiến trúc ở slide ba hiện ra thành hậu quả: prod chạy ở trạng thái hỏng một phần trong sáu mươi lăm phút, tạo link và chuyển hướng vẫn phục vụ, còn mọi lượt truy cập đều mất, và bốn test cũ vẫn xanh trong lúc đó vì đó đúng là hành vi đúng của chúng.
Đặt cạnh Giai đoạn pipeline, bảng so sánh này là chỗ luận điểm của em hoặc đứng hoặc đổ, nên em đọc chậm.
Khoảng chờ sau khi merge: làm tay là trung vị hai phút, pipeline là ba tới tám giây.
Phần kiểm thử và đóng gói: làm tay nằm trong hai phút của chặng staging, pipeline là sáu mươi tám tới tám mươi bốn giây.
Nghiệm thu trên môi trường thật thì pipeline có đúng một mẫu, sáu mươi tám giây.
Còn ô quan trọng nhất thì trống: lead time tới prod của pipeline chưa tính được, và phần hỏi đáp có nói thêm vì sao.
Dòng em cho là quan trọng nhất mà không phải một con số: làm tay thì mọi lần đều cần một người có mặt, còn pipeline thì không lần nào ở staging.
Từ bảng đó em rút ba kết luận.
Một, ở phần làm việc thì pipeline không nhanh hơn tay người: hai con số cùng cỡ nhau, khoảng hai phút, và pipeline còn cõng thêm những khoản mà tay người không có, gồm một quãng chờ runner nhận job, một lần kéo image từ registry, và một lần dựng lại image ở job đóng gói bên cạnh lần dựng của job kiểm thử.
Hai, chỗ thắng là khoảng chờ, nhưng nó thắng không phải vì máy chờ nhanh hơn: hai con số ấy đo hai hiện tượng khác nhau, một bên là thay đổi nằm trên trunk chờ một người rảnh tay, bên kia là độ trễ điều phối của GitHub, nên câu kết luận đúng là thứ biến mất là việc phải chờ người, không phải rằng máy chờ nhanh hơn người sáu mươi lần.
Ba, và đây là thứ số phút không thể hiện: bàn tay người phải tự quyết có cần xoá volume hay không, và một lần quyết sai đã tạo ra sáu mươi lăm phút hỏng, còn pipeline thì luôn xoá, luôn chạy đúng ba bước theo đúng thứ tự.
Cạnh bảng số em tự đo là một hàng số trích của ngành, không phải số của em, và em tách riêng đúng vì hai loại số có độ tin khác nhau.
Nguồn là báo cáo State of DevOps của DORA năm hai nghìn hai mươi bốn, và ngưỡng bốn nhóm hiệu năng đổi giữa các năm nên phải đọc kèm năm.
Giai đoạn thủ công của em rơi vào nhóm Elite ở hai chiều tốc độ, và High ở chiều ổn định.
Nhưng bảng này phải đọc ngược lại với cách nó trông: một đồ án chưa có pipeline nào mà đã Elite thì điều đó nói về kích thước của hệ, không nói về năng lực của quy trình; ba service nhỏ trên một máy cá nhân, không người dùng thật, không cửa sổ phát hành, không ai phải được thông báo trước.
Chiều dùng được là chiều thứ ba: thời gian phục hồi và tỷ lệ hỏng cho thấy chỗ yếu của làm tay nằm ở độ ổn định chứ không ở tốc độ, dù trực giác lại nói ngược.
Một chỉ số em cố ý bỏ khỏi bảng là change failure rate, vì bản PDF gốc không mở được trên máy em, và hai bản dẫn lại độc lập cho hai bộ giá trị khác nhau; em chọn thiếu hơn là đoán.

### Slide 14 - Kết luận: Giá trị của Configuration Management

Đồ án này không chứng minh rằng CI/CD thì tốt hơn làm tay, vì đó không phải một khẳng định cần chứng minh.
Nó đo xem cái tốt hơn ấy nằm ở đâu, và câu trả lời không nằm ở chỗ trực giác chỉ tới.
Ở phần làm việc thì pipeline và bàn tay người cùng cỡ nhau; chỗ pipeline thắng là khoảng chờ, và thắng ở đó không phải vì máy chờ nhanh hơn mà vì việc phải chờ một người rảnh tay đã biến mất.
Chỗ nó thắng đậm hơn nữa lại không đo được bằng giây: nó xoá cái bước mà con người phải tự quyết.
Còn thứ em học được nhiều nhất thì không mua được bằng cách viết thêm mã: bốn lần một thứ mô tả hệ thống đã tự lệch khỏi hệ thống, và không lần nào có test đỏ.
Với một đồ án đo lường thì những gì nói về hệ thống mới là sản phẩm, nên đó là chỗ em muốn để lại làm câu cuối.

### Chuyển sang demo

Thứ tự thao tác và những gì mở ở từng chặng nằm ở mục "Bốn chặng demo" dưới đây.
Câu mở của chặng demo: em sẽ không chạy pipeline trực tiếp, và đó là lựa chọn có lý do.
Chạy trực tiếp cần runner tự quản còn sống, và cộng hai chặng trong bảng so sánh ở slide 13 thì phải chờ hơn hai phút, chưa kể nó có thể đỏ vì lý do không liên quan tới đồ án như mạng hoặc registry.
Nên bốn chặng sau đều đọc chứng cứ đã tồn tại, và chặng cuối là chặng mạnh nhất vì nó chỉ đọc dữ liệu tĩnh.

## Bốn chặng demo

Chuẩn bị trước buổi nói: mở sẵn bốn tab theo đúng thứ tự dưới đây, đăng nhập GitHub xong, và xác nhận prod đang chạy.
Không chạy pipeline trực tiếp, không push gì trong lúc demo.

### Chặng 1 - Hệ thống demo thật trên prod

Prod ở `localhost:8080`, theo `env/prod.env`; staging ở `8081` nên đừng lẫn hai cổng.
Ba lệnh theo đúng thứ tự, chép từ mục "Dùng thử" của `README.md` và chỉ đổi cổng:

```sh
curl -X POST localhost:8080/api/v1/links -H 'content-type: application/json' \
     -d '{"url":"https://example.com/mot-duong-dan-rat-dai"}'
MA=aB3xY9z   # thay bằng mã mà lệnh trên vừa trả về
curl -i localhost:8080/$MA
curl localhost:8080/api/v1/links/$MA/stats
```

Đặt mã vào một biến chứ không chép trực tiếp vào đường dẫn, vì dấu ngoặc nhọn là toán tử chuyển hướng của shell nên một chỗ giữ chỗ dạng đó dán vào terminal sẽ lỗi ngay trước mặt giám khảo.

Nói trong lúc chờ: lệnh đầu đi qua nginx vào `link`, lệnh thứ hai đi qua nginx vào `redirect` và nhận về 302, còn `redirect` thì ghi một dòng vào bảng lượt truy cập.
Ở lệnh thứ ba, nói rằng số lượt do worker `stats` cộng dồn chứ không do `redirect` tính, nên nó tới muộn vài giây; nếu nó còn bằng không thì chạy lại lệnh đó một lần, đừng giải thích vòng.

Nếu prod không lên: bỏ chặng này và nói thẳng là bỏ, rồi chuyển sang chặng 2.
Đừng sửa tại chỗ trước mặt giám khảo, vì ba chặng còn lại không phụ thuộc chặng này.

### Chặng 2 - Trang Actions với một lần chạy xanh

Mở tab Actions của kho mã, chọn lần chạy gần nhất trên nhánh `main`.
Chỉ vào ba job theo thứ tự và nói tên chúng: kiểm tra, đóng gói, triển khai staging.
Nói một câu về thứ tự phụ thuộc: job đóng gói chỉ chạy khi job kiểm tra xanh, nên không có image nào được đẩy cho một commit hỏng.
Nếu còn thời gian thì mở job triển khai staging và chỉ vào bước smoke test.

### Chặng 3 - Trang Releases với bản phát hành và changelog tự sinh

Mở tab Releases và chọn `v0.1.0`.
Chỉ vào danh sách thay đổi và nói: danh sách này GitHub tự sinh từ các pull request đã merge, không ai chép tay, và nó liệt kê ba mươi sáu pull request vì đây là bản phát hành đầu tiên nên mốc so là toàn bộ lịch sử kho mã.
Nói một câu về chỗ em cố ý không làm: không có file `CHANGELOG.md` nào trong kho, vì trang này đã là changelog và một bản chép lại sẽ là bản thứ hai phải tự tay giữ cho khớp.

### Chặng 4 - Đi ngược chuỗi truy vết

Đây là chặng mạnh nhất và cũng là chặng không thể hỏng, vì nó chỉ đọc dữ liệu tĩnh.
Từ một dòng trong changelog của `v0.1.0`, bấm vào số pull request của dòng đó.
Trong pull request, chỉ vào commit squash và nói rằng tag của image trên registry là SHA của đúng commit này.
Rồi chỉ vào dòng `Closes` trong thân pull request và bấm sang issue.
Trong issue, cuộn tới danh sách tiêu chí nghiệm thu đã tick.
Câu chốt của cả phần demo: em vừa đi từ một bản phát hành về tới yêu cầu thay đổi ban đầu bằng bốn cú bấm, và mục 25.3 của sách yêu cầu đúng chuỗi này; đây là chuỗi em dùng để tính lead time, nên nó là một công cụ đo chứ không phải một tiện ích.

## Hỏi đáp

Mười một câu dưới đây là những câu dễ chọc vỡ nhất của một đồ án đo lường.
Câu trả lời viết dạng nói được, và mỗi câu đều dừng lại ở một chỗ kiểm được trong kho mã thay vì ở một lời khẳng định.

### 1. Vì sao dùng trung vị chứ không trung bình?

Vì với cỡ mẫu bằng năm thì trung bình không đủ vững để mang một kết luận, và em có bằng chứng bằng chính dữ liệu của mình.
Một mẫu trong năm mẫu có hai cách đọc hợp lý, và giữa hai cách đọc đó trung bình lead time đổi từ tám phẩy sáu lên hai mươi mốt phẩy hai phút, còn trung vị đứng nguyên ở năm phút.
Nếu em lấy trung bình thì toàn bộ so sánh hai giai đoạn phụ thuộc vào việc em đọc một mẫu duy nhất theo cách nào.
Em không bỏ mẫu đó và không sửa nó; em giữ cả hai cách đọc trong file số liệu, rồi chọn một đại lượng không bị nó lái.

### 2. Nếu pipeline chậm hơn tay người thì tự động hoá để làm gì?

Nó không chậm hơn, nó ngang nhau ở phần làm việc, và đó là chỗ trực giác sai chứ không phải chỗ tự động hoá vô ích.
Cái nó xoá là ba thứ khác.
Thứ nhất là khoảng chờ một người rảnh tay, từ dải phút xuống dải giây.
Thứ hai là sự cần thiết của một người có mặt gõ lệnh, và đó là ràng buộc thật của giai đoạn trước chứ không phải số phút.
Thứ ba, và là chỗ đáng nhất, là nó xoá cái bước mà con người phải tự quyết: một lần quyết sai về việc có cần xoá volume hay không đã tạo ra sáu mươi lăm phút prod hỏng, còn pipeline thì luôn xoá và luôn chạy đúng ba bước.
Nói cách khác, cái mua được là tính chắc chắn, không phải tốc độ, và đó chính là luận điểm của đồ án.

### 3. Tỷ lệ hỏng bốn mươi phần trăm nghĩa là hệ thống rất tệ?

Nghĩa là mẫu số bị đọc sai nếu trích trần con số đó.
Hai lần hỏng trên năm lần triển khai prod thì ra bốn mươi phần trăm, nhưng cả hai lần truy về đúng một nguyên nhân, là một thay đổi schema thiếu bước xoá volume.
Trong năm mẫu chỉ có đúng một thay đổi đụng schema.
Nên con số đúng phải đọc là một trên một thay đổi schema đã hỏng, và không thay đổi nào trong bốn thay đổi không đụng schema hỏng cả.
Em ghi cả cách đọc trần và cách đọc đúng vào file số liệu, vì bỏ cách đọc trần đi thì không ai kiểm được em có làm đẹp số hay không.
Và đây cũng là lý do em ghi rằng Giai đoạn pipeline còn nợ ít nhất một thay đổi chạm schema, vì thiếu nó thì hai tỷ lệ hỏng không so được với nhau.

### 4. Tự làm tự đo thì có khách quan không?

Không khách quan theo nghĩa có người thứ hai kiểm chứng, và em không giả vờ là có.
Thay vào đó em dựng bốn nguyên tắc để chống đúng loại lỗi này, và cả bốn nằm trong kho mã trước khi mẫu đầu tiên được ghi.
Đồng hồ không dừng giữa chừng vì bất cứ lý do gì, kể cả khi khoảng chờ rõ ràng không phải lỗi của quy trình.
Bảng mốc thô cố ý không có cột nào chứa số đã tính sẵn, nên bất kỳ ai cũng tính lại được từ mốc và ra cùng con số.
Mốc thô và số dẫn xuất nằm ở hai file khác nhau, và khi hai file mâu thuẫn thì file mốc thô đúng.
Mọi định nghĩa được chốt trước khi ghi mẫu, chứ không phải lúc ngồi tính.
Bằng chứng mạnh nhất là em giữ lại những chỗ số liệu nói ngược ý mình: một bản ghi cũ về sau bị chứng minh là sai, và em không sửa đè vì bản thân việc ghi nhầm là dữ liệu; nó cho thấy một quy trình thủ công có thể báo cáo thành công cho một bước chưa bao giờ chạy.

### 5. Lead time của Giai đoạn pipeline đâu?

Chưa tính được, và em nói thẳng chứ không lấp ô đó.
Lead time theo định nghĩa của em là từ lúc thay đổi vào trunk tới lúc nó chạy trên prod, mà chuỗi tự động hiện dừng ở lúc smoke test trên staging báo xanh vì triển khai prod vẫn làm tay.
Em có số cho phần chuỗi đã tự động, và em cố ý không trích nó như lead time, vì làm vậy là so một nửa của giai đoạn này với trọn vẹn giai đoạn kia.
Việc này thuộc ticket mười ba, và mục giới hạn của báo cáo xếp nó vào hướng phát triển gần nhất.
Em coi đây là giới hạn nặng nhất của báo cáo, và nó nằm trong mục giới hạn chứ không nằm ở chỗ nào bị làm mờ đi.

### 6. Vì sao chỉ có năm mẫu?

Vì mỗi mẫu là một lần triển khai tay thật, có bấm giờ, trên một thay đổi thật đã merge, và em không được phép sinh mẫu bằng cách chạy lặp lại một thay đổi cũ.
Cổng đóng Giai đoạn thủ công đòi ít nhất tám lần triển khai một môi trường được ghi đầy đủ; em có mười lần trên năm thay đổi, nên cổng đó đạt.
Nhưng năm mẫu là năm mẫu, và em xử lý bằng ba việc chứ không bằng cách nói nó đủ.
Em chọn trung vị làm số chính đúng vì cỡ mẫu nhỏ.
Em ghi ra ba mẫu có mốc giờ phải trừ hao, và ghi rằng cột staging phải đọc như một dải chứ không phải một hằng số.
Và em đưa cỡ mẫu vào mục giới hạn của báo cáo thay vì để người đọc tự phát hiện.

### 7. Vì sao không có ai review pull request?

Vì đồ án do một người thực hiện, và GitHub không cho tự duyệt pull request của chính mình, nên đòi người duyệt sẽ tự khoá tác giả.
Nên em chuyển phần kiểm soát sang chỗ kiểm được: nhánh chính từ chối push thẳng, và rule đòi một status check bắt buộc phải xanh trên chính commit sắp vào nhánh chính chứ không phải trên một commit trước đó.
Rule cũng bật chế độ strict, nên một pull request mở lâu sẽ bị chặn cho tới khi nhánh được cập nhật rồi check chạy lại.
Và em nghiệm thu cổng đó ở chiều nó chặn, không chỉ ở chiều nó cho qua: một test trượt cố ý làm pull request chuyển sang trạng thái bị chặn và job đóng gói bị bỏ qua.
Em cũng ghi cái giá của quy trình này: với một người làm thì phần lớn nghi thức không bắt được lỗi nào, và ngoại lệ mà em phải viết cho pull request ghi nhật ký là bằng chứng rằng khuôn quy trình có chỗ không vừa với thứ nó phải chứa.

### 8. Digest của image phát hành khác digest của image đã kiểm, vậy bản phát hành có đáng tin không?

Ở mức mã nguồn thì đáng tin, ở mức bó byte thì không, và em phân biệt hai mức đó chứ không nói gộp.
Từ một tag em lấy lại được đúng commit và đúng tập phụ thuộc đã ghim, nên nội dung nguồn của hai image là một.
Nhưng `docker build` không cho ra kết quả giống nhau giữa hai lần chạy, nên bản đem phát hành chưa từng chạy qua smoke test trên staging, dù một bản dựng từ đúng commit ấy thì có.
Em kiểm được chỗ lệch này bằng cách so digest, và em ghi nó ra chứ không để người đọc tự suy ra rằng hai tag trỏ cùng một image.
Cách chữa em đã biết và không cần viết lại logic build nào, là gắn thêm tag phiên bản vào chính image đã có thay vì dựng lại.
Lý do chưa làm cũng được ghi ra: đổi cách đóng gói sát ngày nộp đắt hơn cái nó mua, và thiết kế thí nghiệm của em cấm thêm biến vào giữa một giai đoạn đang đo.
Nếu thầy cô hỏi tiếp về mức ghim thì em nói luôn chỗ thứ hai cùng loại: ba tag image nền của em cũng chỉ ghim tới phiên bản nhỏ chứ không tới digest, nên chúng vẫn di động, và em ghi chỗ đó trong mục 3.2 thay vì để nó nằm im dưới chữ "đã ghim".

### 9. Vì sao Docker Compose mà không phải Kubernetes?

Vì đối tượng được đo là quy trình, không phải nền tảng chạy, và Kubernetes sẽ đổi kết quả đo theo hướng làm nó khó đọc hơn chứ không tốt hơn.
Thiết kế thí nghiệm của em đòi giữa hai giai đoạn chỉ đổi đúng một biến là sự hiện diện của pipeline, nên hạ tầng chạy phải giống nhau ở cả hai giai đoạn.
Giai đoạn thủ công là một người gõ lệnh trên một máy, và làm tay trên Kubernetes thì phần lớn số phút đo được sẽ là chi phí học và chi phí vận hành nền tảng, không phải chi phí của bốn hoạt động Chương 25.
Compose cũng cho em đúng thứ em cần cho mục 25.1, là một định nghĩa stack nằm trong kho mã và hai môi trường khác nhau đúng một file.
Nếu hệ có nhiều máy và có yêu cầu về khả năng chịu tải thì lựa chọn này sai; với một hệ ba service trên một máy thì nó đúng, và em ghi ranh giới đó trong ADR chứ không nói Compose tốt hơn.

### 10. Vì sao chọn GitHub Actions mà không Jenkins hay GitLab CI?

Sommerville nhắc Jenkins ngay trong mục 25.2, nên lựa chọn công cụ cần được so chứ không mặc định.
Em chọn GitHub Actions vì kho mã, issue, pull request và chuỗi truy vết đã ở đó, nên nối pipeline vào chuỗi ấy không tốn gì.
Jenkins bị loại không vì yếu, mà vì phần lớn thời gian sẽ đổ vào dựng và giữ một server, tức một chi phí không rơi vào ô điểm nào.
Hai cái giá em đã trả thật, và cả hai không xuất hiện trong bảng so sánh nào trên mạng.
Log của job bị xoá theo chính sách lưu giữ, và với một đồ án đo lường thì đó là rủi ro mất dữ liệu nghiên cứu, nên em chép mốc thô vào kho mã ngay khi còn đọc được.
Cái giá thứ hai là runner tự quản trên một kho công khai chạy được mã tuỳ ý từ một fork, và em chặn bằng một điều kiện khiến job triển khai chỉ tồn tại với commit đã merge, kèm lý do ghi ngay tại chỗ trong workflow.

### 11. Ngoài lead time, phép đo của Giai đoạn pipeline còn thiếu gì?

Hai chỗ nữa, và cả hai là giới hạn của phép đo chứ không phải chỗ thiếu tính năng; mỗi chỗ đã có một ticket nhận.
Tỷ lệ hỏng và thời gian phục hồi của Giai đoạn pipeline không có mẫu nào, và lý do đáng nói hơn con số: cổng gác chạy trên pull request nên phần lớn lỗi cùng loại chết trước mốc merge và không để lại dòng nào trong bảng, nên tỷ lệ hỏng sẽ thấp một phần vì pipeline tốt hơn và một phần vì tập lỗi bị chặn ở chỗ khác, mà hai phần đó không tách được bằng dữ liệu quan sát; ticket hai mươi mốt nhận việc tiêm lỗi có kiểm soát để có mẫu.
Em cũng không có ảnh biểu đồ nào, vì ba service đã phơi metrics theo định dạng Prometheus nhưng Prometheus và Grafana chưa vào stack; ticket mười lăm nhận việc đó.
Hướng phát triển gần nhất vì vậy không phải thêm tính năng, mà là đóng nốt hai mắt còn thiếu của phép đo.
