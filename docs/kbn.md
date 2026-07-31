## Phần nói theo từng slide

### Slide 1 - Configuration Management và DevOps trên hệ ba service

Đồ án của em chọn Chương 25 Configuration Management trong giáo trình Software Engineering của Sommerville.
Chương này gồm bốn mục, và mỗi mục là một hoạt động của cùng một quy trình quản lý cấu hình: 25.1 quản lý phiên bản, tức việc kiểm soát mã nguồn và các phiên bản của nó; 25.2 dựng hệ thống, tức việc build ra một hệ chạy được từ mã, thư viện và dữ liệu cấu hình; 25.3 quản lý thay đổi, tức việc quyết định và theo dõi một thay đổi được chấp nhận ra sao; và 25.4 quản lý phát hành, tức việc đóng gói và gắn số hiệu cho một bản đem giao.
Áp dụng chương này vào đồ án, cụ thể em làm hai việc: dựng một pipeline CI/CD thật, chạy đúng bốn hoạt động đó trên một hệ ba service do em tự viết, rồi đo tác động của pipeline ấy bằng bộ chỉ số DORA, so sánh giữa một giai đoạn chưa có pipeline và một giai đoạn đã có.
DORA là viết tắt của DevOps Research and Assessment, một nhóm nghiên cứu đưa ra bốn chỉ số đo hiệu năng chuyển giao phần mềm mà giới DevOps dùng làm chuẩn: lead time, tần suất triển khai, tỷ lệ phát hành thất bại và thời gian phục hồi.
Điểm em muốn nói trước để thầy cô biết chỗ nghe: đây là một đồ án đo lường, không phải một đồ án dựng công cụ.
Em chọn phủ đủ bốn mục 25.1 tới 25.4 thay vì đào sâu một mục, vì bốn mục đó là bốn hoạt động của cùng một quy trình, và một pipeline chạy thật đã chạm trọn cả bốn mà không phát sinh thêm khối lượng công việc.
Nhưng lựa chọn ấy mang theo một rủi ro em ghi ngay trong ADR chứ không phát hiện về sau: một đề tài về CI/CD rất dễ biến thành một bài khoe pipeline, và kết luận "tự động hoá thì tốt hơn" không sai nhưng cũng không phải một kết quả, vì ai cũng đã đồng ý trước khi đọc.
Nên câu đồ án của em trả lời không phải là pipeline có tốt hơn làm tay hay không, mà là tốt hơn ở chỗ nào và tốt hơn bao nhiêu, hai câu hỏi mà chỉ nói suông thì không trả lời được.
Để trả lời được, em gắn cho đồ án một luận điểm định lượng, bắt pipeline trở thành đối tượng được đo, và toàn bộ số liệu trong bài là số em tự đo trên chính kho mã này, trừ đúng một đoạn trong slide Đọc số liệu, nơi em trích số của ngành để đối chiếu.


### Slide 2 - Hệ thống demo: Kiến trúc rút gọn để tối ưu đo lường

Hệ thống demo là một dịch vụ rút gọn URL: người dùng gửi lên một đường dẫn dài, hệ trả về một mã ngắn, và khi ai đó mở mã ngắn ấy thì hệ chuyển hướng về đúng đường dẫn gốc.
Hệ thống gồm đúng ba service TypeScript, mỗi service làm một việc trong luồng đó: `link` nhận đường dẫn dài và sinh mã; `redirect` nhận mã, trả về mã trạng thái 302 (HTTP 302 Found báo hiệu rằng tài nguyên yêu cầu đã được di chuyển tạm thời đến một URL khác được chỉ định) để trình duyệt tự chuyển hướng, đồng thời ghi lại một lượt truy cập; `stats` là một worker chạy nền, đọc lại các lượt truy cập vừa ghi và cộng dồn thành số liệu.
Ba service này không gọi thẳng vào nhau bằng API, mà ghép nối lỏng qua một cơ sở dữ liệu PostgreSQL dùng chung, và cả ba đều có mặt ở đó chứ không chỉ hai: `link` ghi bảng chứa mã và đường dẫn gốc khi tạo link; `redirect` đọc lại bảng đó để biết chuyển hướng về đâu, rồi ghi một bảng lượt truy cập riêng; `stats` đọc bảng lượt truy cập ấy, cộng dồn, rồi ghi vào một bảng thống kê.
Chỗ dễ hiểu lầm nhất: `stats` không trả lời trực tiếp cho client, nó chỉ cập nhật bảng thống kê; khi có ai hỏi một mã đã có bao nhiêu lượt thì người trả lời lại là `link`, qua đúng con đường nó đã dùng để tạo mã, chứ không phải `stats`.
Phía trước cả ba là nginx, cửa vào duy nhất của hệ; không service nào mở cổng ra ngoài, kể cả với bộ kiểm thử.
Nghiệp vụ như vậy cố ý tối giản, vì đề tài chấm năng lực Configuration Management, nên mọi giờ công đổ vào nghiệp vụ là giờ công lấy khỏi pipeline và đo lường.
Chỗ kiến trúc này đáng nói nhất là service thứ ba: `stats` nằm ngoài đường phục vụ request, nên dừng nó thì chuyển hướng vẫn chạy bình thường và chỉ có số lượt truy cập là đứng yên.
Em sẽ dùng lại chi tiết đó ở phần kết quả, vì nó tạo ra tình huống một phần của hệ hỏng mà phần còn lại vẫn xanh.


### Slide 3 - 25.1 Version Management: Baseline nằm gọn trong một commit

Em bắt đầu bằng một câu hỏi rất thực tế: muốn dựng lại đúng cái hệ thống đã chạy hôm qua thì quản lý mã nguồn thôi có đủ không.
Không đủ, vì thiếu một file cấu hình hay một dữ liệu môi trường thì phần mã còn lại không dựng thành một hệ chạy được.
Đây là đúng nội dung mục 25.1: sách gọi việc theo dõi phiên bản của từng thành phần, sao cho nhiều người sửa cùng lúc mà không ghi đè lên nhau và mọi phiên bản cũ đều lấy lại được, là version management, rồi đặt tên ba khái niệm cho nó.
Codeline là một chuỗi các phiên bản mã nguồn, trong đó các phiên bản về sau trong chuỗi được tạo ra từ các phiên bản trước đó. Codeline thường áp dụng cho các thành phần của hệ thống, do đó mỗi thành phần đều có các phiên bản khác nhau. 
Baseline là định nghĩa của một hệ thống cụ thể. Đường cơ sở chỉ định các phiên bản thành phần được bao gồm trong hệ thống và xác định các thư viện được sử dụng, các tệp cấu hình và các thông tin hệ thống khác. 
Mainline là dãy các baseline nối tiếp nhau.
Chỗ dễ bỏ qua nhất nằm ngay trong định nghĩa của baseline: nó gồm cả những thứ không phải mã, như thư viện, file cấu hình và dữ liệu môi trường, vì thiếu bất kỳ thứ nào trong đó thì phần còn lại không dựng lại được hệ.
Từ định nghĩa đó sách rút ra hai yêu cầu kỹ thuật.
Yêu cầu thứ nhất là mọi thay đổi phải truy vết được theo cả hai chiều: từ một trạng thái bất kỳ của hệ thống nói được nó gồm phiên bản nào, và từ một thay đổi bất kỳ nói được nó đã đi vào những trạng thái nào.
Yêu cầu thứ hai là ranh giới của baseline phải rộng bằng ranh giới của hệ thống, nên mọi hạng mục cấu hình phải nằm cùng chỗ với mã, và hạng mục nào không nằm được thì phải ghi ra chứ không được im lặng bỏ qua.
Em trả lời hai yêu cầu đó bằng bốn quyết định cụ thể trong kho mã.
Một, `main` là trunk duy nhất, không có nhánh `develop` hay `release`; mỗi thay đổi mở một nhánh sống vài giờ tới vài ngày rồi merge bằng squash, nên mỗi issue tương ứng đúng một commit trên `main`.
Hai, nhánh chính từ chối push thẳng và đòi một status check bắt buộc phải xanh trên chính commit sắp vào nhánh chứ không phải trên một commit cũ hơn của nhánh, với chế độ strict để chặn một pull request đã lạc hậu so với nhánh chính; đây là chỗ trả lời trực tiếp cho yêu cầu truy vết hai chiều.
Ba, cấu hình nginx, schema Postgres, định nghĩa stack, các file môi trường và cả ba workflow đều nằm trong cùng kho mã với mã nguồn, nên ranh giới baseline trùng đúng ranh giới của hệ.
Bốn, số hiệu phát hành theo semver (một quy ước quốc tế cho việc đặt tên và quản lý phiên bản phần mềm), nhưng chỉ tính tương thích với một hợp đồng công khai định nghĩa hẹp, gồm đúng API và đường chuyển hướng, để câu "thay đổi này có phá vỡ tương thích không" kiểm được bằng kho mã thay vì đoán theo cảm giác về độ lớn của thay đổi.
Kết quả là baseline theo nghĩa của sách trùng đúng với một commit, không phải một commit cộng thêm một thứ nằm ở nơi khác.
Cái phải trả là hai hạng mục không nằm trong kho được, là rule bảo vệ nhánh trên GitHub và image trên GHCR, và em ghi cả hai ra thay vì làm mờ đi.

### Slide 4 - 25.2 System Building: Tính tái tạo và một đường build duy nhất

Mục 25.2 gọi system building là quá trình dựng một hệ chạy được từ mã nguồn, thư viện và dữ liệu cấu hình, và phần lớn việc của nó không phải là gọi trình biên dịch mà là quản lý phụ thuộc: chọn đúng phiên bản của từng thứ được ghép vào, rồi lập được danh sách chính xác thành phần nào, phiên bản nào, đã đi vào một bản dựng.
Continuous integration, tức tích hợp liên tục, nằm ngay trong mục này chứ không phải một chủ đề riêng: ý tưởng là tích hợp mỗi thay đổi ngay khi nó xong thay vì gom lại thành từng đợt, để chỗ hỏng lộ ra lúc còn nhỏ và còn biết nó do thay đổi nào gây ra.
Từ đó sách rút ra ba yêu cầu kỹ thuật.
Yêu cầu trung tâm là một lần build phải tái tạo được, tức cùng một đầu vào cho ra cùng một hệ ở máy khác và thời điểm khác; suy ra mọi thứ đi vào bản dựng phải ghim tới một phiên bản xác định, và định nghĩa của bản dựng phải nằm trong kho mã chứ không nằm trong trí nhớ của người dựng.
Yêu cầu thứ hai, tới từ phần continuous integration: mọi thay đổi phải đi qua đúng một đường build tự động, vì một đường thứ hai là một chỗ để chênh lệch sinh ra mà không ai nhìn thấy.

Quyết định một trả lời yêu cầu tái tạo được.
`Dockerfile` là một file văn bản liệt kê từng bước để đóng gói một service thành image, tức một bản chứa sẵn mọi thứ cần để chạy nó ở bất kỳ máy nào; em chỉ giữ đúng một file này cho cả ba service, để một cách dựng duy nhất áp cho tất cả chứ không phải mỗi service một kiểu build riêng.
Bên trong đó, thư viện Node được ghim bằng `package-lock.json`, tức một file do chính npm sinh ra ghi lại chính xác phiên bản của từng thư viện và của cả thư viện con nằm sâu bên trong; lệnh cài đặt em dùng là `npm ci` chứ không phải `npm install` thông thường, vì `npm ci` cài đúng y những gì file khoá ấy liệt kê, còn `npm install` cho phép co giãn phiên bản trong một khoảng và có thể cài khác đi giữa hai lần chạy.

Quyết định hai trả lời yêu cầu một đường build duy nhất.
Toàn bộ quy trình tự động nằm trong một file định nghĩa tên `.github/workflows/ci.yml`; GitHub Actions, công cụ CI đi kèm sẵn với GitHub, đọc file này và tự động dựng một máy ảo tạm để thực thi nó mỗi khi có thay đổi, không cần em bấm tay.
File đó định nghĩa hai job, tức hai chuỗi bước chạy tách biệt: job `kiem-tra`, đúng nghĩa đen là "kiểm tra", và job `dong-goi`, đúng nghĩa đen là "đóng gói", chỉ được phép chạy khi `kiem-tra` đã xanh.
Mọi thay đổi, dù nhỏ tới đâu, đều phải chạy qua đúng job `kiem-tra`, và job này gồm bốn cổng chạy tuần tự bên trong nó, cổng sau chỉ chạy khi cổng trước xanh: kiểm tra kiểu dữ liệu bằng `tsc`, rồi lint để rà lỗi phong cách và lỗi thường gặp, rồi dựng cả stack thật bằng đúng `docker compose` như lúc chạy thật, rồi mới chạy toàn bộ kiểm thử tự động đi qua nginx.
Một thay đổi hỏng ở cổng đầu của `kiem-tra` vì vậy không bao giờ chạm tới ba cổng sau, và cũng không chạm tới job `dong-goi` phía sau nó; không có một đường build nào khác đi vòng qua được chuỗi này.

### Slide 5 - 25.3 Change Management: Cổng gác nghiệm thu tự động

Mục 25.3 nói về việc quyết định thay đổi nào được làm và theo dõi thay đổi đó đã áp vào đâu.
Tài liệu mô tả nó thành một chuỗi thủ tục cụ thể: một yêu cầu thay đổi được ghi lại thành văn bản trước, được phân tích chi phí và tác động, được một hội đồng chấp nhận hoặc từ chối, rồi mới được viết mã và kiểm tra.
Điểm cốt lõi không nằm ở thủ tục mà ở một khẳng định đứng sau nó: một hệ thống mà thay đổi không kiểm soát được thì không phải đang tiến hoá, mà là đang trôi dần khỏi thứ nó từng là.
Từ đó sách rút ra ba yêu cầu kỹ thuật.
Yêu cầu thứ nhất là mọi thay đổi phải có một hồ sơ tồn tại trước khi mã được viết và còn lại sau khi mã đã merge, và hồ sơ ấy phải nối được hai chiều với đúng đoạn mã đã đổi; sách gọi bản ghi này là derivation history, tức lịch sử vì sao một thành phần có hình dạng hiện tại, để người đọc sau này không phải đoán.
Yêu cầu thứ hai là phải có một chỗ từ chối được một thay đổi không đạt, không chuyển thẳng sang một đồ án một người được, vì GitHub không cho tự duyệt pull request của chính mình, nên phần kiểm soát ấy phải chuyển sang một cổng gác tự động, và bản thân cổng đó phải được nghiệm thu ở chiều nó chặn chứ không chỉ ở chiều nó cho qua.
Yêu cầu thứ ba: những thứ mô tả hệ thống, tức tài liệu, định nghĩa số đo, ghi chú vận hành, cũng phải đi qua cùng một quy trình kiểm soát thay đổi đó như mã, vì chúng hoàn toàn có thể lệch khỏi hệ thống thật sau một thay đổi mà không có gì báo động; slide sau là bằng chứng cho đúng yêu cầu này.

Em hiện thực hoá yêu cầu thứ nhất bằng một chuỗi bốn bước bắt buộc: mở một issue mô tả thay đổi, mở một nhánh từ đó, mở một pull request có dòng `Closes #<số issue>` trong thân, rồi squash-merge vào `main`.
Dòng `Closes` không phải chữ trang trí: GitHub đọc đúng cú pháp này để tự đóng issue ngay khi pull request được merge, và chính liên kết issue-pull request-commit đó là thứ em dùng để tính lead time ở phần đo lường; một pull request thiếu dòng này làm hỏng số đo chứ không chỉ mất một đường dẫn.
Em hiện thực hoá yêu cầu thứ hai bằng đúng cổng `kiem-tra` đã nói ở slide trước: nhánh `main` từ chối nhận thay đổi nào chưa qua job đó, đó là cổng gác thay cho hội đồng phê duyệt của sách.
Điều em muốn nhấn ở đây: em không chỉ nghiệm thu cổng gác ở chiều nó cho qua một thay đổi tốt, vì một lần chạy xanh chỉ chứng minh workflow chạy được, không chứng minh nó biết chặn.
Em cố ý thêm một test trượt vào một nhánh thử nghiệm, và ba thứ xảy ra đúng như một cổng gác thật phải làm: `kiem-tra` báo đỏ, pull request tự chuyển sang trạng thái bị chặn không cho bấm merge, và job `dong-goi` bị bỏ qua hoàn toàn nên không có image nào được đẩy lên registry cho một commit đang hỏng.
Còn yêu cầu thứ ba, về việc tài liệu cũng phải đi qua kiểm soát thay đổi, thì em chưa có công cụ tự động nào gác nó cả; do chưa đọc đến phần này mà lanh chanh làm trước nên trong quá trình làm đã bị mắc lỗi này nhiều.

### Slide 6 - 25.4 Release Management: Kích hoạt bằng mã, không bằng nút bấm

Mục 25.4 tách hẳn một release ra khỏi một bản build bất kỳ.
Một bản build chỉ cần chạy được hôm nay; một release là bản được đưa ra ngoài cho người dùng, nên nó phải có ngày dựng lại được rất lâu về sau, kể cả để quay về sau một sự cố, và nó gồm cả file cấu hình, dữ liệu khởi tạo, hướng dẫn cài đặt đi kèm chứ không chỉ phần chạy được.
Từ đó sách rút ra ba yêu cầu kỹ thuật.
Yêu cầu thứ nhất là việc chọn "bản nào được phát hành" phải để lại dấu vết trong kho mã, chứ không phải một thao tác trên giao diện chỉ còn sống trong lịch sử của công cụ.
Yêu cầu thứ hai là số hiệu phải sinh ra từ một quy tắc kiểm được, tức phải có định nghĩa về cái gì được coi là phá vỡ tương thích trước khi có bản phát hành đầu tiên, chứ không đặt số theo cảm giác.

Em trả lời yêu cầu thứ nhất bằng cơ chế kích hoạt.
Một bản phát hành chỉ bắt đầu khi có người đẩy lên kho mã một tag dạng `v*`, ví dụ `v0.1.0`, tức một nhãn Git gắn cố định vào đúng một commit; đây là thao tác duy nhất trong Git để nói được câu "bản này là bản được chọn để phát hành", và bản thân cú push đó đã nằm trong lịch sử kho mã, không cần ghi thêm gì.
Cụ thể ngoài đời trông như thế này: em đứng ở đúng commit đã squash-merge vào `main`, gõ `git tag v0.1.0` rồi `git push origin v0.1.0`; hai dòng lệnh đó là toàn bộ động tác phát hành, không có bước thứ ba nào khác.
Ai đọc lại kho mã sau này chỉ cần gõ `git tag` để thấy toàn bộ danh sách các lần phát hành, và `git show v0.1.0` để biết chính xác lần đó trỏ vào commit nào, không cần hỏi ai.
Nếu thay bằng một nút bấm thủ công trên giao diện Actions thì việc chọn ấy chỉ còn sống trong lịch sử của riêng công cụ đó, và mất theo đúng chính sách lưu giữ log đã nói ở slide trước.
Cú push tag đó chạy một workflow tên `.github/workflows/phat-hanh.yml`, và nó làm đúng hai việc theo một thứ tự bắt buộc.
Việc một: gọi lại chính workflow đóng gói đã build image, truyền tên tag vào làm tham số, để image trên GHCR mang đúng chuỗi ký tự của tag trong kho mã, chứ không phải một giá trị thứ hai do em gõ tay cho khớp.
Việc hai, chỉ chạy sau khi việc một xong: tạo một bản phát hành trên trang Releases của GitHub, kèm danh sách thay đổi tự sinh từ các pull request đã merge kể từ bản trước, không phải chép tay từ commit.
Thứ tự bắt buộc này quan trọng: nếu đảo ngược, một lần build hỏng vẫn có thể để lại một bản phát hành trỏ tới một image chưa từng tồn tại.

Em trả lời yêu cầu thứ hai bằng semver, tức quy ước quốc tế đặt số phiên bản dạng x.y.z để nói một bản thay đổi lớn tới đâu.
Bản đầu tiên em đặt là `v0.1.0`, không phải `v1.0.0`, và đây là một tuyên bố có chủ đích chứ không phải một con số khiêm tốn: đặc tả semver dành riêng dải `0.y.z` cho giai đoạn mà tác giả tự nhận API công khai chưa ổn định, và đó đúng là trạng thái thật của hệ này, vì `/api/v1/` tuy đã chạy và có kiểm thử nhưng chưa từng có một client thật nào ngoài chính bộ kiểm thử của em.

### Slide 7 - Thiết kế thí nghiệm hai giai đoạn: Cách ly một biến số

Toàn bộ số liệu của đồ án là số em tự đo trên chính kho mã này, và điều đó chỉ có được nhờ một quyết định phải trả giá trước khi có dòng số nào.
Em chia đồ án thành hai giai đoạn: Giai đoạn thủ công triển khai hoàn toàn bằng tay trước, ghi mốc giờ từng lần; rồi mới tới Giai đoạn pipeline, bật CI/CD lên và đo lại đúng những việc đó bằng máy.
Ràng buộc trung tâm, giống một thí nghiệm khoa học đối chứng: giữa hai giai đoạn chỉ được đổi đúng một biến, là sự có mặt của pipeline; mọi thứ khác phải giữ y nguyên, nếu không thì hai bảng số ở slide sau sẽ so sánh hai thứ khác nhau chứ không phải so sánh có pipeline hay không.
Ràng buộc ấy kéo theo ba việc.
Một, chiến lược nhánh phải cố định là trunk-based xuyên suốt cả hai giai đoạn, không được đổi sang một mô hình nhánh khác dù đã nói ở phần lý thuyết, vì đổi chiến lược nhánh giữa chừng là đổi luôn một biến khác ngoài ý muốn.
Hai, staging của Giai đoạn pipeline vẫn phải là cùng một địa chỉ, trên đúng cái máy vật lý mà Giai đoạn thủ công đã đo; vì máy ảo của GitHub ở xa không có đường vào máy đó, em phải tự đăng ký chính máy ấy làm một "self-hosted runner", tức để GitHub Actions gửi việc về chạy tại chỗ, thay vì chạy trên một máy ảo thuê ngoài đám mây như mặc định.
Ba, không được tự tay "sửa giúp" quy trình thủ công giữa lúc đang đo, kể cả khi đã biết rõ chỗ nào chậm, vì sửa nửa chừng cũng là đổi biến giữa giai đoạn.

Bốn nguyên tắc dưới đây đều dựng lên để chống đúng một loại lỗi: số liệu bị làm đẹp, tức chỉnh sửa hoặc bỏ bớt mẫu đo cho ra một kết luận đẹp hơn thực tế.
Nguyên tắc một: đồng hồ không dừng giữa chừng vì bất cứ lý do gì, kể cả khi khoảng chờ rõ ràng không phải lỗi của quy trình, ví dụ một lần phải kéo lại image nền bị lỗi mạng.
Nguyên tắc hai: bảng ghi mốc thô cố ý không có cột nào chứa số đã tính sẵn như lead time hay tỷ lệ phần trăm, mọi số dẫn xuất phải tính lại được từ đúng các mốc thô đó.
Nguyên tắc ba: mốc thô và số dẫn xuất phải nằm ở hai file khác nhau, và khi hai file mâu thuẫn nhau thì file mốc thô luôn là file đúng.
Nguyên tắc bốn: mọi định nghĩa cách tính phải được chốt trước khi ghi mẫu đầu tiên, chứ không phải chốt lúc ngồi tính sau khi đã có số.

Trước khi qua slide số liệu, em nói rõ một lần triển khai tay gồm những gì và đồng hồ bấm ở đâu, để slide sau khỏi phải dừng lại giải thích.
Một lần triển khai tay gồm sáu bước cố định: lấy thay đổi về, kiểm tra kiểu, triển khai staging, nghiệm thu staging, triển khai prod, nghiệm thu prod.
Em lấy giờ ba lần cộng thêm một mốc lấy sẵn từ GitHub: `Merge` là giờ pull request được merge, `Bắt đầu` là ngay trước khi gõ bước một, `Hoàn tất` staging là ngay sau khi bước nghiệm thu staging báo xanh, `Hoàn tất` prod là ngay sau khi bước nghiệm thu prod báo xanh.
Từ bốn mốc đó em trừ ra đúng ba cột sẽ xuất hiện ở bảng sau: `Chờ` là `Bắt đầu` trừ `Merge`, tức khoảng thay đổi đã nằm trên `main` mà chưa ai bắt tay làm; `staging` là `Hoàn tất` staging trừ `Bắt đầu`, tức chi phí đưa thay đổi lên môi trường đầu; `prod` là `Hoàn tất` prod trừ `Hoàn tất` staging, tức chi phí biên của môi trường thứ hai.
Ba cột đó cộng lại đúng bằng lead time, không thừa không thiếu, vì chúng chia đúng một quãng thời gian liên tục ra ba đoạn.


### Slide 8 - Đọc số liệu: Cái thắng là khoảng chờ và độ ổn định

Đây là slide dữ liệu trung tâm của cả bài nói, và nó tồn tại để trả lời đúng câu hỏi em đặt ra từ slide 1: không phải "pipeline có tốt hơn làm tay không", mà là "tốt hơn ở chỗ nào và tốt hơn bao nhiêu".
Slide gồm ba phần đọc theo đúng thứ tự này: trước hết là các con số của riêng Giai đoạn thủ công đứng một mình, để thấy ngay cả khi chưa có pipeline thì dữ liệu đã có chuyện đáng nói; sau đó là bảng đặt cạnh Giai đoạn pipeline để so trực tiếp; cuối cùng là đối chiếu với một ngưỡng của ngành để biết vị trí của cả hai giai đoạn đứng ở đâu.

**Phần một, số của riêng Giai đoạn thủ công.**
Năm thay đổi, mười lần triển khai tính trên cả hai môi trường, trong một cửa sổ đo dài mười tám giờ; số hiệu năm mẫu là `#5` tới `#9` vì đó là số issue GitHub, không phải thứ tự đếm mẫu.
Ba con số cần nhớ: lead time trung vị năm phút, tỷ lệ phát hành thất bại bốn mươi phần trăm đọc trần, và một sự cố sáu mươi lăm phút ở prod.
Cả ba con số này đọc nhanh sẽ hiểu sai, nên em chỉ nêu đúng cái bẫy của từng con số ở đây, còn mổ xẻ đầy đủ để dành cho phần hỏi đáp nếu có ai hỏi tới.
Bẫy của con số đầu: trung vị được chọn thay vì trung bình vì trung bình dễ bị một mẫu bất thường lái đi rất xa, trong khi trung vị đứng yên bất kể mẫu đó đọc theo cách nào.
Bẫy của con số hai: bốn mươi phần trăm nghe như hệ rất tệ, nhưng cả hai lần hỏng đều truy về đúng một nguyên nhân, quên một bước xoá dữ liệu cũ khi đổi cấu trúc database, và trong năm thay đổi chỉ đúng một thay đổi có đổi cấu trúc database.
Bẫy của con số ba: sự cố sáu mươi lăm phút đó không làm sập cả hệ, đúng như kiến trúc đã nói ở slide 2, `stats` nằm ngoài đường phục vụ request nên tạo link và chuyển hướng vẫn chạy bình thường, chỉ số lượt truy cập đứng yên.

*(Bảng neo; nguồn `docs/so-lieu-giai-doan-thu-cong.md`.)*

Năm mẫu của Giai đoạn thủ công, đơn vị phút:

| Mẫu | Chờ | staging | prod | Lead time | Phát hành thất bại |
|---|---|---|---|---|---|
| #5 | 9 | 2 | 3 | 14 | có |
| #6 | 1 | 2 | 13 | 16 | có |
| #7 | 1 | 2 | 1 | 4 | không |
| #8 | 2 | 2 | 0 | 4 | không |
| #9 | 2 | 2 | 1 | 5 | không |
| **Trung bình / Trung vị** | 3,0 / 2 | 2,0 / 2 | 3,6 / 1 | **8,6 / 5** | 2 trên 5, tức 40% đọc trần |

**Phần hai, đặt cạnh Giai đoạn pipeline.**
Một điều phải nói thẳng trước khi vào bảng: sáu lần chạy CI/CD hiện có đều là thay đổi tài liệu, cấu hình hoặc chính pipeline, chưa lần nào là một thay đổi nghiệp vụ cỡ chuẩn như năm mẫu tay, nên đây là chi phí vận hành của chuỗi tự động chứ chưa phải một phép so sánh ngang hàng đầy đủ; phép so sánh đầy đủ đó chờ ticket kế tiếp khi pipeline chạm tới prod.
Dù vậy sáu con số này vẫn đọc được xu hướng, vì em so theo từng khúc của một lần triển khai, không so hai con số tổng gộp lại.
Ba khúc, đọc nhanh: khoảng chờ sau merge thì làm tay hai phút còn pipeline chỉ vài giây; khâu làm việc thật, tức kiểm thử và đóng gói, thì làm tay và pipeline cùng cỡ khoảng một tới hai phút, pipeline không nhanh hơn; lead time tới tận prod của pipeline thì chưa đo được, vì chuỗi tự động mới dừng ở staging, prod vẫn làm tay.
Rút gọn thành một câu: cái pipeline xoá không phải thời gian làm việc, mà là việc phải có người ngồi chờ rảnh tay để gõ lệnh, và việc con người phải tự quyết có xoá dữ liệu cũ hay không trước mỗi lần triển khai, đúng cái quyết định mà một lần sai đã gây ra sự cố sáu mươi lăm phút ở phần một.
Phần hỏi đáp mổ xẻ kỹ hơn ba ý này nếu được hỏi tới, ở đây em dừng ở mức đọc bảng.

*(Bảng neo; nguồn `docs/nhat-ky-pipeline.md`, mục "Sáu dòng đầu không phải mẫu đo của giai đoạn".)*

So sánh theo khúc, Giai đoạn thủ công so sáu lần chạy CI/CD đã có (gồm cả #12 là lần duy nhất có cột staging; không lần nào trong sáu lần này là thay đổi nghiệp vụ, nên bảng dưới đọc như chi phí vận hành sơ bộ chứ không phải mẫu đo chính thức):

| Khúc | Làm tay | Pipeline |
|---|---|---|
| Chờ sau merge | trung vị 2 phút (1-9 phút) | 3-8 giây |
| Kiểm thử + đóng gói | nằm trong 2 phút của staging | 68-84 giây |
| Nghiệm thu trên staging thật | 2 phút (gộp trong dòng trên) | 68 giây, đúng một mẫu (#12) |
| Lead time tới prod | 4-16 phút, trung vị 5 | chưa đo được, chuỗi tự động còn dừng ở staging |

### Slide 9 - Luận điểm cốt lõi: Pipeline không nhanh hơn con người ở khâu làm việc

Luận điểm là pipeline không nhanh hơn con người ở phần làm việc.
Chỗ nó thắng là khoảng chờ, và là việc không còn cần một người có mặt gõ lệnh.
Đây là câu phản trực giác, nên nó chỉ đứng được nếu có số tự đo đỡ lưng, và số tự đo thì phải trả giá trước mới có.
Cái giá là em cấm chính mình dựng CI/CD trong mấy tuần đầu, tức cấm làm đúng thứ mà đề tài nói về.

### Slide 10 - Kết luận: Giá trị của Configuration Management

Đồ án này không chứng minh rằng CI/CD thì tốt hơn làm tay, vì đó không phải một khẳng định cần chứng minh.
Nó đo xem cái tốt hơn ấy nằm ở đâu, và câu trả lời không nằm ở chỗ trực giác chỉ tới.
Ở phần làm việc thì pipeline và bàn tay người cùng cỡ nhau; chỗ pipeline thắng là khoảng chờ, và thắng ở đó không phải vì máy chờ nhanh hơn mà vì việc phải chờ một người rảnh tay đã biến mất.
Chỗ nó thắng đậm hơn nữa lại không đo được bằng giây: nó xoá cái bước mà con người phải tự quyết.
Còn thứ em học được nhiều nhất thì không mua được bằng cách viết thêm mã: bốn lần một thứ mô tả hệ thống đã tự lệch khỏi hệ thống, và không lần nào có test đỏ.
Với một đồ án đo lường thì những gì nói về hệ thống mới là sản phẩm, nên đó là chỗ em muốn để lại làm câu cuối.

### Chuyển sang demo

Câu mở của phần demo: "Em sẽ không bắt mọi người ngồi chờ chạy pipeline trực tiếp. Thay vào đó, em sẽ đi một luồng ngược để xâu chuỗi toàn bộ câu chuyện: chúng ta sẽ bắt đầu từ hệ thống thật đang chạy, nhìn xem nó được tự động test và build ra sao, cách nó được đóng gói thành một release, và cuối cùng từ đúng release đó, em sẽ mò ngược vết lại xem ai đã yêu cầu sửa và sửa vì lý do gì."
Chạy trực tiếp cần runner tự quản còn sống, mất hơn hai phút và có thể đỏ vì mạng hoặc registry, nên không phù hợp với một buổi bảo vệ ngắn.
Bốn chặng dưới đây thể hiện luồng đi ngược đó.

## Bốn chặng demo

### Chuẩn bị trước khi trình bày

Chuẩn bị xong trước khi thầy cô vào phòng, không làm các bước này trong lúc thuyết trình.

Mở PowerShell ở thư mục gốc của kho mã và chạy kiểm tra prod.

```powershell
curl.exe -sS http://localhost:8080/internal/link/readyz
curl.exe -sS http://localhost:8080/internal/redirect/readyz
curl.exe -sS http://localhost:8080/internal/stats/readyz
```

Cả ba lệnh phải trả về `{"status":"sẵn sàng"}`.
Nếu một lệnh không trả về kết quả đó, không sửa hệ thống trong phòng bảo vệ.
Chỉ bỏ Chặng 1 và vẫn thực hiện ba chặng còn lại, vì chúng chỉ đọc chứng cứ đã tồn tại trên GitHub.

Đăng nhập GitHub trước và mở sẵn năm tab theo đúng thứ tự này.

1. PowerShell cho Chặng 1.
2. [Trang Actions](https://github.com/HugoLee12/a2-configuration-management/actions).
3. [Trang Releases](https://github.com/HugoLee12/a2-configuration-management/releases).
4. Một pull request đã xuất hiện trong release `v0.1.0`.
5. Issue được pull request đó đóng.

Phóng to chữ trình duyệt khoảng 125% và đóng các tab không liên quan.
Không chạy workflow, không push commit, không tạo tag và không sửa code trong lúc demo.

### Lộ trình và thời lượng

Giữ mỗi chặng dưới một phút, tổng thời gian khoảng bốn phút.

| Chặng | Màn hình chính | Điều cần chứng minh | Thời lượng |
|---|---|---|---|
| 1 | PowerShell và prod | Ba service ghép thành một luồng nghiệp vụ thật | 60 giây |
| 2 | GitHub Actions | Mỗi thay đổi qua cổng kiểm tra, đóng gói và triển khai staging | 45 giây |
| 3 | GitHub Releases | Release được kích hoạt bằng tag và có changelog tự sinh | 35 giây |
| 4 | Release, pull request, issue | Truy vết được từ release về yêu cầu thay đổi | 60 giây |

### Chặng 1 - Hệ thống demo thật trên prod

Mở PowerShell và nói: "Đây là prod ở cổng 8080, còn staging là 8081, nên em sẽ chỉ dùng 8080 trong chặng này."

Tạo một link mới và lấy mã trả về bằng đúng khối lệnh sau.

```powershell
$response = curl.exe -sS -X POST http://localhost:8080/api/v1/links `
  -H 'content-type: application/json' `
  -d '{"url":"https://example.com/mot-duong-dan-rat-dai"}' | ConvertFrom-Json
$ma = $response.code
$response
```

Kết quả cần thấy là JSON có `code` và `shortUrl`.
Nói: "Request này đi qua nginx vào service `link`, service này lưu đường dẫn dài và trả về mã ngắn."

Gọi đường chuyển hướng bằng mã vừa tạo.

```powershell
curl.exe -i "http://localhost:8080/$ma"
```

Kết quả cần thấy là `HTTP/1.1 302 Found` và header `Location` trỏ tới `https://example.com/mot-duong-dan-rat-dai`.
Nói: "Request thứ hai lại đi qua nginx, nhưng lần này vào `redirect`; nó trả 302 và ghi một lượt truy cập."

Đợi hai giây rồi xem số lượt.

```powershell
Start-Sleep -Seconds 2
curl.exe -sS "http://localhost:8080/api/v1/links/$ma/stats"
```

Kết quả cần thấy là JSON có đúng mã vừa tạo và `"visits":1` hoặc lớn hơn.
Nếu số lượt còn là `0`, chạy lại duy nhất lệnh cuối sau hai giây.
Nói: "Số lượt đến muộn vì worker `stats` mới là service cộng dồn; `redirect` không nằm chờ worker nên chuyển hướng vẫn phản hồi ngay."

Chuyển tiếp: "Đó là hệ thống thật đang chạy ổn định. Vậy để bản chạy này có mặt ở đây, mã nguồn của nó đã phải đi qua những bước kiểm tra nào? Em xin chuyển sang phần GitHub Actions."

### Chặng 2 - Trang Actions với một lần chạy xanh

Mở tab Actions và chọn một lần chạy xanh trên nhánh `main` có đủ ba job.
Nếu lần chạy mới nhất không có đủ ba job, chọn lần chạy xanh gần nhất có nhãn `push` và commit trên `main`.

Chỉ lần lượt vào `kiem-tra`, `dong-goi` và `trien-khai-staging`.
Nói: "Đây là ba chặng nối tiếp nhau: kiểm tra kiểu, lint, dựng stack và test qua nginx; chỉ khi chặng đó xanh mới đóng gói image; rồi staging kéo đúng image vừa đóng gói và chạy smoke test."

Chuyển tiếp: "Khi hệ thống đã được build và test xanh như vậy, bước tiếp theo là đóng gói nó lại để phát hành cho người dùng. Dấu vết này được lưu ở trang Releases."

### Chặng 3 - Trang Releases với bản phát hành và changelog tự sinh

Mở tab Releases, chọn `v0.1.0` và chỉ vào tag của release.
Nói: "Tag là dấu vết trong Git để xác định commit nào được chọn làm release, không phải một lần bấm triển khai chỉ còn trong lịch sử giao diện."

Chỉ vào phần danh sách thay đổi.
Nói: "Danh sách này được GitHub tự sinh từ pull request đã merge, không ai chép tay; vì đây là release đầu tiên nên nó bao gồm toàn bộ pull request trước mốc này."

Nói thêm một câu: "Kho không có `CHANGELOG.md` thứ hai, vì release này đã là nguồn changelog và chép lại sẽ tạo thêm một bản phải giữ đồng bộ."

Chuyển tiếp: "Chúng ta đang có một bản phát hành hoàn chỉnh. Giả sử bây giờ có lỗi xảy ra hoặc ai đó thắc mắc vì sao dòng code này lại tồn tại trong bản phát hành. Từ đúng một dòng trong changelog ở đây, em sẽ đi ngược chuỗi truy vết để tìm ra nguyên nhân gốc."

### Chặng 4 - Đi ngược chuỗi truy vết

Đây là chặng mạnh nhất vì chỉ đọc dữ liệu tĩnh, nên không phụ thuộc máy local, runner hay mạng tới registry.

Từ một dòng trong changelog của `v0.1.0`, bấm vào số pull request.
Trong pull request, chỉ vào commit squash và nói: "Commit này là bản đi vào `main`; image được gắn tag bằng SHA của chính commit này."

Chỉ vào dòng `Closes #...` trong thân pull request rồi bấm vào issue đó.
Trong issue, cuộn đến tiêu chí nghiệm thu đã tick và nói: "Issue có trước code, nêu rõ yêu cầu và tiêu chí để biết khi nào thay đổi được chấp nhận."

Câu chốt: "Như vậy, em vừa dẫn mọi người đi một mạch từ hệ thống đang chạy, qua cách nó được kiểm thử và đóng gói, cho đến khi truy vết ngược về đúng yêu cầu thay đổi ban đầu chỉ bằng vài cú bấm chuột. Đây chính là chuỗi truy vết hai chiều mà mục 25.3 yêu cầu. Dữ liệu này không chỉ là tiện ích quản lý mà chính là nguồn gốc để em tính ra chỉ số Lead Time trong đồ án."

### Khi thời gian bị rút ngắn

Nếu chỉ còn hai phút, bỏ Chặng 1 và đi thẳng từ Releases sang pull request rồi issue.
Nói rõ: "Em rút gọn phần hệ đang chạy để tập trung vào chuỗi truy vết, vì đây là bằng chứng trực tiếp nhất cho Configuration Management."

Không chạy lệnh khắc phục, không mở log dài và không đổi sang staging để cứu demo.
Một chặng local có lỗi không phủ định ba chặng dùng chứng cứ bất biến trên GitHub.

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
