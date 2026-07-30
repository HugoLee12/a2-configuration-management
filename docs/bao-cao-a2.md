# Configuration Management và DevOps áp lên một hệ ba service, đo bằng bộ chỉ số DORA

**Học phần**: CNTT313E1 - Chuyên đề kỹ thuật phần mềm

**Thành phần đánh giá**: A2, chủ đề Chương 25 Configuration Management

**Kho mã**: https://github.com/HugoLee12/a2-configuration-management

**Ngày**: 2026-07-31

Báo cáo này là nguồn sự thật ở dạng Markdown; bản `.docx` và bản PDF nộp kèm được sinh ra từ chính file này.
Mọi con số đều **trích** từ một file trong kho mã hoặc từ một nguồn ngoài có ghi năm, và mỗi chỗ trích đều nói rõ file nguồn.
Báo cáo không giữ bản thứ hai của bất kỳ con số nào và không khai báo lại công thức đã có ở file nguồn.

## 1. Mở đầu: chọn Chương 25, và rủi ro của chính lựa chọn ấy

Đề cương CNTT313E1 cho phép chọn bất kỳ chủ đề nâng cao nào của Software Engineering cho A2.
Nhóm chọn Chương 25 Configuration Management, tương ứng buổi 14 "DevOps & Configuration Management", và chọn phủ đủ cả bốn mục 25.1 tới 25.4 thay vì đào sâu một mục.
Lý do và các phương án đã loại nằm ở `docs/adr/0001-chon-chuong-25-lam-de-tai-a2.md`: bốn mục của chương là bốn hoạt động của cùng một quy trình, nên một pipeline CI/CD chạy thật đã chạm trọn cả bốn mà không phát sinh thêm khối lượng công việc.

Lựa chọn ấy mang theo đúng một rủi ro, và nó được nêu ngay trong ADR chứ không phát hiện về sau.
Một đề tài về CI/CD rất dễ biến thành một bài khoe pipeline: dựng được workflow, chụp ảnh màn hình xanh, rồi kết luận rằng tự động hoá thì tốt hơn.
Kết luận đó không sai, nhưng nó không phải một kết quả; nó là một câu ai cũng đã đồng ý trước khi đọc.

Biện pháp là gắn cho đồ án một Luận điểm định lượng, và bắt pipeline trở thành đối tượng được đo chứ không phải đồ trang trí.
Luận điểm ấy phản trực giác, và nó là câu duy nhất mà toàn bộ số liệu của đồ án phục vụ:

> Pipeline **không** nhanh hơn con người ở phần làm việc.
> Chỗ nó thắng là khoảng chờ, và là việc không còn cần một người có mặt gõ lệnh.

Để có mốc so sánh thật thay vì trích từ báo cáo ngành, đồ án cố tình chia thành hai giai đoạn: Giai đoạn thủ công không có pipeline nào và ghi nhật ký thời gian từng lần triển khai tay, rồi Giai đoạn pipeline đo lại trên cùng loại thay đổi.
Quyết định này ở `docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md`, và nó là quyết định đắt nhất của đồ án: nó cấm dựng CI/CD trong mấy tuần đầu, tức cấm làm đúng thứ mà đề tài nói về.

Mục 2 mô tả hệ thống được quản lý cấu hình, mục 3 áp bốn hoạt động của Chương 25 lên nó, mục 4 và 5 nói về thiết kế thí nghiệm và các lựa chọn tái sử dụng, mục 6 trình bày số đo, mục 7 nói thẳng những gì chưa đo được.

## 2. Kiến trúc Hệ thống demo

Hệ thống demo là một dịch vụ rút gọn URL gồm ba service TypeScript do nhóm tự viết, tồn tại để pipeline có thứ để build, kiểm thử và phát hành.
Nghiệp vụ của nó cố ý tối giản, theo `docs/adr/0002-he-thong-demo-va-stack.md`.
Đây là lựa chọn có chủ đích chứ không phải sự thiếu thời gian: đề tài chấm năng lực Configuration Management, nên mọi giờ công đổ vào nghiệp vụ là giờ công lấy khỏi pipeline và đo lường.

### 2.1 Hình dạng của hệ

```
người dùng -> nginx -+-> /api/v1/    -> service link     -+
                     |                                    |
                     +-> /<mã>       -> service redirect -+-> Postgres
                     |                                    |
                     +-> /internal/  -> cả ba service ----+
```

| Thành phần | Vai trò | Nằm trên đường phục vụ request |
|---|---|---|
| `nginx` | Cửa vào duy nhất, định tuyến theo tiền tố đường dẫn | có |
| `link` | Tạo mã ngắn, trả thống kê qua `/api/v1/` | có |
| `redirect` | Nhận `/<mã>`, trả 302, ghi một dòng vào bảng `visits` | có |
| `stats` | Worker chạy nền, rút hàng đợi `visits` rồi cộng dồn vào `link_stats` | không |
| `postgres` | Lưu trữ, schema khai trong `infra/postgres/init.sql` | có |

nginx là cửa vào duy nhất: không service nào có mục `ports:` trong `compose.yaml`, nên ba service phía sau không gọi trực tiếp được từ bên ngoài, kể cả bởi bộ kiểm thử.

Service thứ ba là chỗ kiến trúc này đáng nói.
`stats` không nằm trên đường chuyển hướng: dừng nó thì chuyển hướng vẫn phục vụ bình thường, chỉ có số lượt là đứng yên cho tới khi nó sống lại.
Đây là một cặp thành phần ghép nối lỏng qua bảng cơ sở dữ liệu chứ không qua một lời gọi đồng bộ, và nó tạo ra tình huống mà mục 6 sẽ dùng tới: một phần của hệ hỏng mà phần còn lại vẫn xanh.

Ba service đều trả lời ba đường dẫn vận hành dưới `/internal/<service>/`, gồm `healthz`, `readyz` và `metrics`; chi tiết ở `README.md`.
Hai câu hỏi đầu cố ý tách bạch, vì tiến trình còn chạy không có nghĩa là nó phục vụ được: `/readyz` chạy `select 1` nên nó trả 503 khi mất cơ sở dữ liệu, và nó là cổng gác mà cả bộ kiểm thử lẫn job triển khai chờ trước khi chạy test đầu tiên.
Nhánh `/internal/` cũng là lối duy nhất hỏi được `stats`.

### 2.2 Ba ràng buộc kiến trúc kéo theo hệ quả lên pipeline

**Một image cho cả ba service.**
Ba service dùng chung đúng một `Dockerfile` ở gốc kho mã và một npm workspace; container nào chạy service nào là do `command` trong `compose.yaml` quyết định.
Hệ quả ở mục 5: ở mức CI không còn việc gì là riêng của từng service, nên trục tái sử dụng phải đặt ở chỗ khác.

**Một định nghĩa stack, nhiều môi trường.**
`compose.yaml` là định nghĩa duy nhất, và staging với prod khác nhau đúng một file trong `env/`: khác cổng, khác project name của Compose, nên khác container, khác network và khác volume.

**Kiểm thử chỉ đi qua nginx bằng HTTP.**
Bộ kiểm thử là hộp đen, không import mã service và không mở kết nối tới Postgres, nên stack phải đang chạy trước khi chạy nó.
Ràng buộc này có giá: phần ghi log không đi ra qua HTTP nên không kiểm tự động được, và mục 6 sẽ chỉ ra một mẫu đo không thêm được dòng test nào vì lý do đó.
Đổi lại nó bắt được đúng loại lỗi nằm ở chỗ ghép nối giữa các thành phần chứ không nằm trong thành phần nào, và nó khiến job triển khai không cần cài phụ thuộc gì ngoài Node.

TypeScript chạy thẳng trên Node 24, không có bước biên dịch: kiểu được kiểm bằng `tsc --noEmit`, còn lúc chạy thì kiểu bị bóc đi.
Cái giá là `tsconfig.json` phải bật `erasableSyntaxOnly`, nên `enum`, `namespace` và parameter property đều không dùng được.
Cái được là image không chứa bước build nào của ứng dụng, nên "dựng lại từ mã nguồn" và "chạy" là cùng một thứ.

## 3. Bốn hoạt động Configuration Management áp lên hệ này

Bốn mục con dưới đây mang đúng tên bốn mục 25.1 tới 25.4 của Sommerville, để đối chiếu được với sách.
Sommerville 10th ed không có mục DevOps trong Chương 25, chỉ có continuous integration nằm gọn trong 25.2; phần thiếu ấy được bổ sung bằng nguồn ngoài, xem mục 6.4.

Cả bốn mục con đi theo cùng một cấu trúc bốn phần: nguyên lý mà chương đưa ra, yêu cầu kỹ thuật rút ra từ nguyên lý ấy, cách đồ án hiện thực hoá, rồi kết quả và cái giá phải trả.
Cấu trúc này cố ý, vì phần đáng chấm của một đồ án không phải là danh sách những thứ đã dựng mà là đường đi từ một nguyên lý trong sách tới một quyết định kỹ thuật cụ thể trong kho mã.
Hai phần đầu của mỗi mục ngắn, vì chúng chỉ cần đủ để phần sau có chỗ neo, không nhằm chép lại sách.

### 3.1 Version management

**Nguyên lý trong Chương 25**

Mục 25.1 coi version management là việc theo dõi các phiên bản khác nhau của từng thành phần hệ thống, sao cho nhiều người sửa cùng lúc mà không ghi đè lên nhau và mọi phiên bản cũ đều lấy lại được.
Ba khái niệm trung tâm là codeline, tức dãy phiên bản nối tiếp của một thành phần; baseline, tức một tập phiên bản đã được chọn và cố định, đủ để dựng nên một hệ chạy được; và mainline, tức dãy các baseline nối tiếp nhau.
Chỗ dễ bỏ qua nhất nằm ở định nghĩa của baseline: nó gồm cả những thứ không phải mã, như thư viện, file cấu hình và dữ liệu môi trường, vì thiếu bất kỳ thứ nào trong đó thì phần còn lại không dựng lại được hệ.

**Yêu cầu kỹ thuật rút ra**

Yêu cầu thứ nhất là mọi thay đổi phải truy vết được theo cả hai chiều: từ một trạng thái bất kỳ của hệ nói được nó gồm phiên bản nào của cái gì, và từ một thay đổi bất kỳ nói được nó đã đi vào những trạng thái nào.
Yêu cầu thứ hai là ranh giới của baseline phải rộng bằng ranh giới của hệ, nghĩa là mọi hạng mục cấu hình phải nằm cùng chỗ với mã; hạng mục nào không nằm được thì phải được ghi ra chứ không được im lặng bỏ qua, vì một baseline khuyết mà không ai biết nó khuyết thì tệ hơn một baseline khuyết đã được ghi chú.
Yêu cầu thứ ba là mỗi trạng thái được chọn để phát hành phải có một tên gọi nói được điều gì đó kiểm chứng được, chứ không phải một nhãn tuỳ ý.

**Cách đồ án hiện thực hoá**

`main` là trunk duy nhất và luôn ở trạng thái phát hành được.
Không có nhánh `develop`, không có nhánh `release`; mỗi thay đổi mở một nhánh đặt tên `<số-issue>-<mô-tả-ngắn>`, sống vài giờ tới vài ngày rồi bị xoá.
Merge bằng squash, nên mỗi issue tương ứng đúng một commit trên `main`.
Toàn bộ quy ước ở `CONTRIBUTING.md`.

Việc bảo vệ nằm ở hai chỗ, và không chỗ nào là số lượng người duyệt.
Thứ nhất, `main` từ chối push thẳng và đòi mọi thay đổi đi qua pull request.
Thứ hai, rule đòi một status check bắt buộc tên `kiem-tra`, và check ấy phải xanh trên **chính commit** sắp vào `main` chứ không phải trên một commit trước đó của nhánh; rule cũng bật `strict`, nên một pull request mở lâu sẽ chuyển sang `BEHIND` và bị chặn cho tới khi nhánh được cập nhật rồi check chạy lại.
Không đòi người duyệt là lựa chọn có chủ đích: đồ án do một người thực hiện, mà GitHub không cho tự duyệt pull request của chính mình, nên yêu cầu người duyệt sẽ tự khoá tác giả.

Quản lý phiên bản ở đây không chỉ áp cho mã, và đó là chỗ dễ bỏ sót nhất của mục 25.1.
Định nghĩa hạ tầng ở `infra/nginx/nginx.conf` và `infra/postgres/init.sql`, định nghĩa stack ở `compose.yaml`, các file môi trường trong `env/`, và ba workflow trong `.github/workflows/` đều là hạng mục cấu hình và đều nằm trong cùng kho mã với mã nguồn.
Nhờ vậy một commit là một trạng thái đầy đủ của hệ, không phải trạng thái của phần mã cộng với một cấu hình nằm ở nơi khác.

Số phiên bản của bản phát hành đi theo semver, quy tắc ở `docs/quy-tac-phien-ban.md`.
Phần khó nhất của tài liệu ấy không phải bảng quy tắc mà là câu định nghĩa đứng trước nó: semver chỉ có nghĩa khi nói rõ tương thích **với ai**.
Hợp đồng công khai của hệ này được định nghĩa hẹp, chỉ gồm `/api/v1/...` và `/<mã>`; nhánh `/internal/` nằm ngoài vì người gọi nó là pipeline chứ không phải client, còn schema Postgres, tên biến môi trường, cấu trúc dòng log và tên các số đếm ở `/metrics` cũng nằm ngoài.
Không có định nghĩa ấy thì câu "thay đổi này có phá vỡ tương thích không" không kiểm được, và số major sẽ tăng theo cảm giác về độ lớn của thay đổi, mà độ lớn thì chẳng liên quan gì tới tương thích.
Hai ví dụ trong tài liệu chống lại đúng hai hướng hiểu sai, và cả hai lấy từ chính đồ án: một thay đổi viết lại toàn bộ cách triển khai staging mà không đụng một byte nào của hợp đồng thì là PATCH, còn đổi `201` thành `200` ở đường tạo link là một ký tự và nó là MAJOR.

**Kết quả và trade-off**

Cái thu được là baseline theo nghĩa của mục 25.1 trùng đúng với một commit: không có trạng thái nào của hệ phải mô tả bằng một commit cộng thêm một thứ nằm ở nơi khác.
Cái phải trả là hai hạng mục cấu hình **không** nằm trong kho mã được, và chúng được ghi ra thay vì làm mờ đi.
Rule bảo vệ nhánh là thiết lập trên GitHub, nên nó chỉ để lại dấu vết ở `docs/nhat-ky-du-an.md` và ở thân pull request đã đặt ra nó.
Image trên GHCR nằm ngoài kho mã, và mối nối giữa image với thay đổi được giữ bằng cách đặt tag là SHA đầy đủ của commit; chiều ngược lại thì không cứu được, vì một image mất tag là một image không truy được nguồn, như mục "Cái gì biến mất theo thời gian" của `docs/nhat-ky-pipeline.md` ghi.

Cái giá thứ hai nằm ở chỗ ít ai coi là cái giá: định nghĩa hẹp của hợp đồng công khai làm cho semver kiểm được, nhưng nó cũng đẩy `/internal/`, schema Postgres và tên các số đếm ra ngoài phạm vi bảo đảm.
Đổi một trong những thứ đó sẽ không làm số major tăng, dù nó phá pipeline của chính đồ án.
Đây là đánh đổi có ý thức chứ không phải kẽ hở: mở rộng hợp đồng ra tới chúng thì mỗi lần đổi tên một số đếm sẽ thành một bản phát hành major, và số hiệu phiên bản mất hết ý nghĩa cảnh báo.

### 3.2 System building

**Nguyên lý trong Chương 25**

Mục 25.2 định nghĩa system building là quá trình dựng một hệ chạy được từ mã nguồn, thư viện và dữ liệu cấu hình.
Danh sách việc mà Sommerville đòi hỏi ở một công cụ build phần lớn không phải là gọi trình biên dịch, mà là quản lý phụ thuộc, chọn đúng phiên bản của từng thứ được ghép vào, và lập được danh sách chính xác các thành phần cùng phiên bản đã đi vào một bản dựng.
Continuous integration nằm trong chính mục này chứ không phải một chủ đề riêng: tích hợp mỗi thay đổi ngay khi nó xong thay vì gom lại thành từng đợt, để chỗ hỏng lộ ra lúc còn nhỏ và còn biết nó do thay đổi nào gây ra.

**Yêu cầu kỹ thuật rút ra**

Yêu cầu trung tâm là một lần build phải tái tạo được: cùng một đầu vào cho ra cùng một hệ, ở máy khác và ở thời điểm khác.
Suy ra hai điều kiện cụ thể là mọi thứ đi vào bản dựng phải được ghim tới một phiên bản xác định, và định nghĩa của bản dựng phải nằm trong kho mã chứ không nằm trong trí nhớ hay trong môi trường của người dựng.
Yêu cầu thứ hai đến từ phần continuous integration: mọi thay đổi phải đi qua đúng một đường build tự động, vì một đường thứ hai là một chỗ để chênh lệch sinh ra mà không ai nhìn thấy.
Yêu cầu thứ ba là một lần build phải đủ nhanh để không ai muốn bỏ qua nó, vì một cổng gác bị né thì không còn là cổng gác.

**Cách đồ án hiện thực hoá**

Một lần build được định nghĩa bằng đúng một `Dockerfile`, và nó cố ý không có bước biên dịch ứng dụng nào.
Thứ tự các lớp là một lựa chọn về chi phí: manifest được chép trước, mã nguồn chép sau, để sửa mã không phải cài lại dependency.
Phụ thuộc được ghim bằng `package-lock.json` và cài bằng `npm ci --omit=dev`, còn ba image nền đều ghim tới phiên bản nhỏ là `node:24-alpine`, `postgres:17-alpine` và `nginx:1.29-alpine`.

Continuous integration nằm ở `.github/workflows/ci.yml`, chạy trên mỗi pull request và trên mỗi lần `main` nhận commit mới.
Job `kiem-tra` chạy bốn cổng theo thứ tự: kiểm tra kiểu, lint, dựng stack staging bằng `compose up --build`, rồi chạy toàn bộ bộ kiểm thử qua nginx.
Job `dong-goi` chỉ chạy khi `kiem-tra` xanh, và nó đẩy image lên GHCR với tag là SHA của commit.

Lần chạy trên `main` không thừa, và lý do nằm ở chính cách merge: squash sinh ra một commit mới, nên nếu chỉ chạy ở pull request thì commit thật sự nằm trên `main` sẽ là commit duy nhất không có image nào, mà đó lại đúng là commit phải đem triển khai.
Đổi lại, mỗi thay đổi để lại hai lần chạy, và việc chọn lần nào được tính vào số đo phải nói rõ; mục 4 quay lại chỗ này.

**Kết quả và trade-off**

Hai yêu cầu về đường build duy nhất và về tốc độ thì đạt: mọi thay đổi đều đi qua `kiem-tra` và không có đường vòng nào, còn một lần chạy đủ ngắn để không ai phải chờ nó xong mới làm việc khác.
Yêu cầu tái tạo được thì **không** đạt trọn, và chỗ hụt được đo chứ không được đoán.
Có ba món nợ của bước build, cả ba đã ghi trong kho mã và cả ba là vật liệu thật cho mục 25.2 chứ không phải lời thú nhận thêm vào cho đẹp.

**Thứ tự build và kiểm thử bị đảo so với cách làm tay.**
`kiem-tra` chạy trước và `compose --build` dựng một image để có stack mà kiểm; rồi `dong-goi` dựng lại từ đầu ở một job khác và đẩy image đó đi.
Hai image cùng nội dung nguồn nên rủi ro thấp, nhưng mốc `Hoàn tất build` chỉ có nghĩa "một image cùng nội dung đã được đẩy", không phải "image đã được kiểm"; đây là chênh lệch 4 trong `docs/nhat-ky-pipeline.md`.

**`docker build` không tái lập được.**
Cùng một commit, hai lần build cho ra hai bó byte khác nhau, kiểm được bằng cách so `RepoDigests` của hai tag trỏ về cùng commit: bản phát hành `v0.1.0` có digest bắt đầu bằng `94aea155`, còn image mang tag SHA của đúng commit ấy có digest bắt đầu bằng `fb07ec32`.
Số liệu này ở mục "Cái gì chưa nằm ở đây" của `docs/quy-tac-phien-ban.md`.
Hệ quả phải mang theo: câu "tag trong kho mã và tag image khớp nhau" đúng ở mức chuỗi ký tự và ở mức commit nguồn, không đúng ở mức digest.

**`oxlint` chạy không có file cấu hình**, nên nó chỉ bật nhóm rule mặc định; nói "đã có lint" mà không nói ở mức nào là một câu đúng chữ và sai nghĩa.

Hai món nợ đầu cùng một hình dạng, và hình dạng ấy đáng đưa vào báo cáo hơn cả hai chi tiết kỹ thuật.
Thứ được kiểm và thứ được phát hành là hai artefact khác nhau; chừng nào còn dựng lại thay vì gắn thêm tag vào chính image đã có, thì chừng ấy còn một khoảng trống giữa "đã kiểm" và "đã phát hành".
Cách chữa đã biết và không cần viết lại logic build, là dùng `docker buildx imagetools create`; lý do chưa làm nằm ở mục 7.

### 3.3 Change management

**Nguyên lý trong Chương 25**

Mục 25.3 nói về việc quyết định thay đổi nào được làm và theo dõi thay đổi nào đã được áp vào đâu.
Sommerville mô tả nó thành một chuỗi thủ tục: một yêu cầu thay đổi được ghi lại, được phân tích về chi phí và tác động, được một hội đồng chấp nhận hoặc từ chối, rồi mới được hiện thực và kiểm tra.
Đi kèm là derivation history, tức bản ghi những thay đổi đã áp lên một thành phần cùng lý do của từng thay đổi, để về sau người khác đọc được vì sao thành phần ấy có hình dạng hiện tại.
Điểm cốt lõi của mục này không phải thủ tục mà là một khẳng định: thay đổi không kiểm soát được thì không phải một hệ đang tiến hoá, mà là một hệ đang trôi.

**Yêu cầu kỹ thuật rút ra**

Yêu cầu thứ nhất là mọi thay đổi phải có một hồ sơ tồn tại **trước** khi mã được viết và còn lại **sau** khi mã đã merge, và hồ sơ ấy phải nối được hai chiều với thứ đã thay đổi.
Yêu cầu thứ hai là phải có một chỗ từ chối được thay đổi không đạt.
Hội đồng phê duyệt của Sommerville không chuyển thẳng sang một đồ án một người, vì không có ai độc lập để duyệt; nên phần kiểm soát phải chuyển sang một cổng gác tự động, và bản thân cổng ấy phải được nghiệm thu ở chiều nó **chặn** chứ không chỉ ở chiều nó cho qua.
Yêu cầu thứ ba là những thứ mô tả hệ thống cũng phải đi qua cùng quy trình đó, vì chúng lệch khỏi hệ thống mà không có gì báo động.

**Cách đồ án hiện thực hoá**

Một thay đổi đi qua đúng một đường: issue, rồi nhánh, rồi pull request có dòng `Closes #<số>`, rồi squash vào `main`.
Nhờ dòng `Closes` mà truy được ngược từ một bản phát hành về commit, về pull request, rồi về yêu cầu thay đổi ban đầu kèm các tiêu chí nghiệm thu đã tick.
Chuỗi ấy không phải để trang trí: nó là mắt xích dùng để tính lead time, nên một pull request thiếu dòng đó làm hỏng số đo chứ không chỉ làm mất một liên kết.

Quy ước có đúng một ngoại lệ, và ngoại lệ ấy được viết ra kèm lý do.
Pull request chỉ thêm dòng vào `docs/nhat-ky-thu-cong.md` thì không mang dòng `Closes`, vì số đo của một lần triển khai chỉ tồn tại **sau** khi thay đổi đã merge, mà đúng lúc merge thì issue tương ứng đã tự đóng.
Sâu hơn: bản ghi số đo không phải một thay đổi lên hệ thống, nó là dữ liệu **về** một thay đổi đã xong, nên nó không có lead time của riêng nó để tính.

Cổng gác của quy trình này được nghiệm thu cả chiều đỏ chứ không chỉ chiều xanh, vì một lần chạy xanh chỉ chứng minh workflow chạy, không chứng minh nó chặn.
Commit `7269971` cố ý thêm một test trượt vào nhánh, và ba thứ xảy ra đúng như mong đợi: `kiem-tra` đỏ, pull request chuyển sang `mergeStateStatus: BLOCKED`, và job `dong-goi` bị `SKIPPED` nên không có image nào được đẩy cho một commit hỏng.
Hai commit ấy được giữ lại trong lịch sử nhánh vì lần chạy đỏ gắn với SHA của chúng chính là bằng chứng, còn squash merge thì không đưa chúng lên trunk.

**Kết quả và trade-off**

Cái giá của quy trình này phải nói trước, vì nó đắt một cách đều đặn: một thay đổi sửa một dòng cũng phải mở issue, mở nhánh, mở pull request và chờ `kiem-tra` chạy xong.
Với một người làm thì phần lớn nghi thức ấy không bắt được lỗi nào, và ngoại lệ dành cho Nhật ký thủ công ở trên là bằng chứng rằng khuôn quy trình có chỗ không vừa với thứ nó phải chứa.
Cái mua được đổi lại là chuỗi truy vết dùng để tính lead time ở mục 6, và nếu không có nó thì toàn bộ phần đo lường của đồ án không tồn tại.

Nhưng phần đáng giá nhất của mục 25.3 trong đồ án này lại không phải quy trình, mà là **bốn lần một thứ mô tả hệ thống tự lệch khỏi hệ thống sau một thay đổi mã**.
Cả bốn đều được ghi lại kèm lý do trong `docs/nhat-ky-du-an.md`, và điểm chung của cả bốn là không có test nào đỏ khi nó xảy ra.

| Lần | Thứ bị lệch | Nguyên nhân trực tiếp | Cách chữa đã dùng |
|---|---|---|---|
| 1 | Định nghĩa cột `prod` của số đo | Có số trước khi có định nghĩa, nên hai chỗ tính hai cách, chênh gấp ba trên cùng một mẫu | Chốt một định nghĩa, tính lại cả năm mẫu, giữ bảng cũ không sửa đè |
| 2 | Câu "Nhật ký dự án không chứa số đo nào" | Bốn mục gần nhất đều đã có phần số liệu | Làm rõ ý định thật thành "không chứa số đo **gốc**" thay vì siết thực tế cho khớp câu chữ cũ |
| 3 | Hai tài liệu vẫn bảo người ta bấm giờ | Ranh giới hai giai đoạn dịch chuyển khi build rời khỏi tay người | Sửa hai tài liệu, thu hẹp ràng buộc về đúng phạm vi còn đúng |
| 4 | Mốc `Hoàn tất build` định nghĩa là `max(jobs[].completed_at)` | Thêm một job chạy sau job đóng gói thì `max` đổi nghĩa mà không đổi tên cột | Neo mốc vào **tên của một job**, vì tên job đổi thì workflow gãy ngay còn thứ tự job thì đổi âm thầm |

Lần thứ tư đáng kể nhất, vì nó xảy ra sau khi định nghĩa đã được viết ra, có lý lẽ và có bảng đối chiếu.
Cột không đổi tên, số vẫn là một chuỗi thời gian hợp lệ, và mọi dòng trước với sau thay đổi ấy sẽ nằm chung một cột với hai nghĩa khác nhau.
Đây chính là configuration management theo nghĩa hẹp nhất: thứ hỏng trước tiên khi hệ thống lớn lên không phải mã, mà là những gì mô tả hệ thống.

Còn một dẫn chứng nữa, và nó là dẫn chứng về việc sửa **yêu cầu** thay vì sửa mã.
Ticket phát hành ban đầu có một tiêu chí đòi "phiên bản đang chạy trên mỗi môi trường khớp với phiên bản đã phát hành", nhưng tiêu chí ấy cần một endpoint báo phiên bản thuộc một ticket khác, mà ticket khác lại chờ chính ticket này.
Cách xử lý là thu hẹp ticket, chuyển tiêu chí sang ticket kia, và **viết lý do ngay lúc thu hẹp** chứ không viết lại về sau, rồi mới làm.
Sửa một yêu cầu rồi ghi lý do là bản tốt của change management, không phải một ngoại lệ với nó; cái không được phép là đóng ticket với một ô để trống mà không ai biết vì sao.

### 3.4 Release management

**Nguyên lý trong Chương 25**

Mục 25.4 tách một release ra khỏi một bản build bất kỳ: release là phiên bản được đưa ra ngoài cho người dùng, và nó không chỉ gồm phần chạy được mà còn gồm file cấu hình, dữ liệu khởi tạo, hướng dẫn cài đặt và tài liệu đi kèm.
Sommerville nhấn hai điều.
Một là mỗi release phải được ghi lại đủ để dựng lại chính xác về sau, kể cả khi phải quay về một bản đã phát hành từ lâu, nên phải lưu được cả phiên bản của công cụ build và của môi trường chứ không chỉ của mã.
Hai là số hiệu release phải theo một sơ đồ nhất quán, đủ để nói một bản là bản nào và nó đứng ở đâu so với bản khác.

**Yêu cầu kỹ thuật rút ra**

Yêu cầu thứ nhất là việc chọn "bản nào được phát hành" phải để lại dấu vết trong kho mã, chứ không phải là một thao tác trên giao diện chỉ còn sống trong lịch sử của công cụ.
Yêu cầu thứ hai là số hiệu phải sinh ra từ một quy tắc kiểm được, nghĩa là phải có một định nghĩa về cái gì được coi là phá vỡ tương thích trước khi có bản phát hành đầu tiên.
Yêu cầu thứ ba là mọi thứ đi kèm bản phát hành phải dẫn xuất từ dữ liệu đã có thay vì được chép tay thành một bản thứ hai, vì bản thứ hai là chỗ mà mục 3.3 vừa đếm được bốn lần tự lệch.

**Cách đồ án hiện thực hoá**

Một bản phát hành được kích hoạt bằng một cú push tag `v*`, không bằng nút bấm cũng không theo lịch.
Tag là thứ duy nhất trong git nói được câu "bản này là bản được chọn để phát hành", và nó nằm trong kho mã; chọn một nút bấm thủ công thì lựa chọn ấy chỉ sống trong lịch sử Actions, tức mất theo chính sách lưu giữ.
Workflow là `.github/workflows/phat-hanh.yml`, và nó làm hai việc theo đúng thứ tự đó.

Việc thứ nhất là gọi lại `.github/workflows/image.yml` với `tag` là tên tag, nên image trên GHCR mang **đúng chuỗi ký tự** của tag trong kho mã chứ không phải một giá trị thứ hai được đặt cho khớp bằng tay.
Hai giá trị đặt cho khớp thì có ngày lệch và không có gì báo động; một giá trị đi qua hai chỗ thì không lệch được.

Việc thứ hai là tạo bản phát hành trên GitHub với danh sách thay đổi tự sinh, và nó `needs` việc thứ nhất.
Ngược lại thì một lần build hỏng vẫn để lại một release trỏ tới một image không tồn tại, tức đúng loại mắt xích đứt mà việc đánh số phiên bản sinh ra để tránh.

Danh sách thay đổi được GitHub dựng từ các **pull request** đã merge kể từ bản phát hành trước, không từ commit thô.
Trong kho này hai cách nói ấy trùng nhau vì merge bằng squash, và chỗ tương đương đó được ghi ra ở `docs/quy-tac-phien-ban.md` chứ không coi là hiển nhiên: nếu về sau kho đổi sang merge commit thì hai tập tách nhau ngay.
Sinh từ pull request còn mạnh hơn ở một điểm không cố ý: mỗi dòng mang theo số pull request, mà thân pull request lại chứa dòng `Closes #<số>`, nên từ một dòng trong changelog đi ngược về được yêu cầu thay đổi ban đầu.

Không có `CHANGELOG.md` trong kho mã.
Trang Releases **là** changelog và nó sinh từ dữ liệu đã có; một file chép lại cùng nội dung sẽ là bản thứ hai phải tự tay giữ cho khớp, tức đúng loại tài liệu tự lệch mà mục 3.3 vừa đếm được bốn lần.

**Kết quả và trade-off**

Bản phát hành đầu là `v0.1.0`, không phải `v1.0.0`, và đó là một tuyên bố chứ không phải một con số nhỏ hơn.
Đặc tả semver dành riêng dải `0.y.z` cho giai đoạn phát triển ban đầu và nói rõ trong dải đó API công khai chưa được coi là ổn định, mà đó đúng là trạng thái của hệ này: `/api/v1/` đã chạy và đã có kiểm thử nhưng chưa từng có client nào ngoài bộ kiểm thử.
`v1.0.0` được để dành cho lúc có bằng chứng, là toàn bộ kiểm thử của phiên bản một chạy xanh trên hệ đã có phiên bản hai mà không sửa một dòng.

Một số hiệu cho cả hệ, không phải một số cho mỗi service, vì ba service dùng chung một image nên không có chỗ nào để treo ba số khác nhau.
Cái giá là một thay đổi chỉ chạm `stats` vẫn làm cả hệ tăng số; cái được là câu hỏi "bản `link` 1.2.0 chạy được với bản `redirect` 1.1.0 không" không tồn tại được.
Lựa chọn này đúng với một hệ triển khai cùng lúc bằng một `compose.yaml` và sẽ sai với một hệ mà các service phát hành độc lập.

Yêu cầu dựng lại một bản đã phát hành thì chỉ đạt tới mức mã nguồn.
Từ một tag lấy lại được đúng commit và đúng tập phụ thuộc đã ghim, nhưng dựng lại thì ra một bó byte khác với bó byte đã phát hành, vì lý do ở mục 3.2.
Với một hệ có người dùng thật thì khoảng cách ấy đủ để một lần khôi phục sau sự cố không khôi phục đúng thứ đã chạy; ở đây nó chưa gây hậu quả nào, nhưng nó vẫn là chỗ mục 25.4 đòi mà đồ án chưa trả.

Số phiên bản hiện nối được hai mắt: tag trong kho mã và tag của image trên GHCR.
Mắt thứ ba, là bản đang chạy trên một môi trường tự khai nó là bản nào, chưa có; cho tới lúc ấy câu hỏi "prod đang chạy bản nào" vẫn phải trả lời bằng cách tra tag của image trong `compose.yaml` đang dùng.

## 4. Thiết kế thí nghiệm hai giai đoạn

Toàn bộ số liệu của đồ án là số của chính nhóm, không trích từ báo cáo ngành, và điều đó chỉ có được nhờ một quyết định phải trả giá trước.
`docs/adr/0003-thiet-ke-thi-nghiem-hai-giai-doan.md` chia đồ án thành hai giai đoạn và cấm dựng CI/CD từ commit đầu tiên.
Giai đoạn thủ công build và triển khai hoàn toàn bằng tay theo quy trình ở `docs/trien-khai-thu-cong.md`, ghi mốc giờ từng lần vào `docs/nhat-ky-thu-cong.md`; Giai đoạn pipeline bật pipeline lên và đo lại, ghi mốc vào `docs/nhat-ky-pipeline.md`.

Ràng buộc trung tâm là giữa hai giai đoạn chỉ được đổi **đúng một biến**, là sự hiện diện của pipeline.
Từ ràng buộc ấy suy ra ba thứ trông không liên quan.
Chiến lược nhánh cố định là trunk-based xuyên suốt, dù GitFlow vẫn được phân tích ở phần lý thuyết.
Staging của Giai đoạn pipeline vẫn phải là `localhost:8081` trên đúng máy mà Giai đoạn thủ công đã đo, nên job triển khai chạy trên một self-hosted runner đăng ký ở chính máy ấy thay vì trên runner mây của GitHub.
Và không được "sửa giúp" quy trình tay ở giữa giai đoạn đo, kể cả khi đã biết chỗ nào chậm.

Bốn nguyên tắc đo, đều ở `docs/trien-khai-thu-cong.md` và `docs/nhat-ky-thu-cong.md`, và cả bốn dựng lên để chống lại đúng một loại lỗi là số liệu bị làm đẹp.
Đồng hồ **không dừng giữa chừng vì bất cứ lý do gì**, kể cả khi khoảng chờ rõ ràng không phải lỗi của quy trình, ví dụ một lần kéo lại image nền.
Bảng mốc thô cố ý **không có cột nào chứa số đã tính sẵn**, nên số dẫn xuất luôn tính lại được từ mốc.
Mốc thô và số dẫn xuất nằm ở hai file khác nhau, và khi hai file mâu thuẫn thì file mốc thô đúng.
Mọi định nghĩa được chốt **trước** khi ghi mẫu, chứ không phải lúc ngồi tính.

Nguyên tắc thứ hai đã trả cổ tức, và lần đầu thì đo được bằng công sức.
Khi phát hiện cột `prod` bị tính theo hai cách, không có dữ liệu nào phải bỏ và không lần triển khai nào phải làm lại: cả năm mẫu dựng lại được theo định nghĩa mới trong vài phút.
Nếu bảng đã lưu sẵn số phút thì chỗ lệch ấy sẽ tốn năm lần triển khai tay để sửa, mà giai đoạn thì đã hết thay đổi cỡ chuẩn để triển khai.

Giai đoạn thủ công được đóng bằng một cổng có bốn điều kiện kiểm được bằng cách đọc, ở mục "Cổng đóng giai đoạn" của `docs/so-lieu-giai-doan-thu-cong.md`.
Ba điều kiện Đạt, một điều kiện ghi **Đạt với cảnh báo** kèm ba ngoại lệ; cách ghi ấy là cố ý, vì một cổng chỉ có hai trạng thái sẽ buộc người ghi phải chọn giữa nói quá và nói thiếu.

## 5. Reuse và trade-off

Ô Reuse của rubric dễ được đáp bằng một câu khen, nên mục này chỉ nhận những chỗ tái sử dụng chỉ ra được bằng file và nói được cái giá của nó.

### 5.1 Bốn chỗ tái sử dụng, và một chỗ cố ý không tái sử dụng

| Chỗ | Đơn vị được dùng lại | Ai gọi lại |
|---|---|---|
| Đóng gói image | `.github/workflows/image.yml`, khai `workflow_call` | `ci.yml` và `phat-hanh.yml` |
| Build ba service | Một `Dockerfile` và một npm workspace | Cả ba service, phân biệt bằng `command` |
| Hai môi trường | Một `compose.yaml` cộng một file trong `env/` | staging và prod |
| Nghiệm thu một lần triển khai | Chính bộ kiểm thử của hệ, chạy tập con qua `npm run smoke` | Job triển khai staging |

Chỗ thứ tư dễ sinh ra một bản sao nhất, nên nó đáng nói.
Tiêu chí "smoke test sau khi triển khai" được đáp bằng đúng một dòng trong `package.json` chọn hai trong năm file test có sẵn, không có file test mới nào.
Hai file được chọn là sẵn sàng của cả ba service và đường tạo link rồi chuyển hướng; ba file còn lại nằm ngoài vì mỗi cái kiểm một thứ không phải "hệ còn phục vụ được hay không".
Cả năm file vẫn chạy đủ ở job `kiem-tra` trên mỗi pull request, nên không test nào bị bỏ.

Chỗ cố ý **không** tái sử dụng lại nói được nhiều nhất về ô này.
Ticket dựng pipeline viết rõ là workflow "nhận tham số là tên service", và bản merge không nhận tham số đó.
Lý do: ba service đã dùng chung một `Dockerfile` và một image, nên một input `service` sẽ chỉ đổi được cái tên trên tag trong khi ba image sinh ra giống nhau tới từng byte.
Đẩy ba tag như vậy là **dẫn chứng sai** cho ô Reuse, vì nó khoe một sự tái sử dụng ở đúng tầng mà kho mã đã không còn vấn đề đó nữa; ba bản sao chỉ là lãng phí khi chúng thật sự khác nhau.

Nên trục tái sử dụng được dịch một tầng, từ giữa ba service sang giữa các workflow.
`docs/adr/0004-ha-tang-phat-hanh-va-do-luong.md` viết trước khi có mã và câu của nó là "ba service dùng chung một reusable workflow"; chỗ điều chỉnh được ghi lại trong `docs/nhat-ky-du-an.md` chứ không sửa đè lên ADR, vì một quyết định kiến trúc được kiểm chứng rồi điều chỉnh thì đáng kể hơn một quyết định được chép lại y nguyên.

Vòng ấy khép lại ở bản phát hành.
`image.yml` được viết dạng `workflow_call` để chỗ khác gọi lại; ticket triển khai staging hoá ra không cần vì nó dùng image đã có sẵn tag chứ không đóng gói lại; và workflow phát hành mới là chỗ gọi lại thật.
Cái thu được không phải mấy dòng YAML tiết kiệm, mà là chỗ tag trong kho mã và tag của image trở thành cùng một chuỗi ký tự.

### 5.2 Chọn GitHub Actions, và cái giá đã trả

Sommerville nhắc Jenkins ở mục 25.2, nên lựa chọn cần được so chứ không mặc định.

| Tiêu chí | GitHub Actions | Jenkins | GitLab CI |
|---|---|---|---|
| Chỗ chạy | Runner mây sẵn có, cộng self-hosted khi cần | Phải tự dựng và tự vận hành một server | Runner mây sẵn có, cộng self-hosted |
| Nơi ở của định nghĩa pipeline | Trong kho mã, cùng commit với mã | Ngoài kho mã nếu dùng UI job, trong kho nếu Jenkinsfile | Trong kho mã |
| Nối với issue và pull request | Cùng một nền tảng, `Closes #<số>` chạy sẵn | Phải nối bằng plugin hoặc webhook | Cùng nền tảng, nếu kho ở GitLab |
| Chi phí học và vận hành cho một đồ án | Thấp nhất | Cao nhất, và phần cao rơi vào vận hành chứ không vào Chương 25 | Tương đương, nhưng phải chuyển kho |
| Rủi ro đã gặp thật | Log job hết hạn lưu giữ; self-hosted runner trên kho công khai | Chưa dựng nên chưa đo được | Chưa dùng |

Chọn GitHub Actions vì kho mã, issue, pull request và chuỗi truy vết của mục 3.3 đã ở đó, nên nối pipeline vào chuỗi ấy không tốn gì.
Jenkins bị loại không vì yếu mà vì nó bắt trả một chi phí vận hành không rơi vào ô điểm nào: phần lớn thời gian sẽ đổ vào dựng và giữ một server, chứ không vào bốn hoạt động của Chương 25.
GitLab CI tương đương về năng lực, nhưng đổi sang nó là chuyển kho, tức thêm một biến vào giữa một thí nghiệm đang đo.

Hai cái giá đã trả thật, và cả hai đáng kể lại vì chúng không xuất hiện trong bảng so sánh nào trên mạng.

**Log của job bị xoá theo chính sách lưu giữ.**
Mặc định là 90 ngày, và với kho công khai thì đó cũng là mức trần không nâng được; con số ấy là trần chứ không phải cam kết, vì thiết lập ở mức kho hay tổ chức đều hạ nó xuống được.
Với một đồ án đo lường thì đây là rủi ro mất **dữ liệu nghiên cứu**, không phải chuyện tiện lợi, vì mọi câu trả lời dạng "vì sao bước này chậm" nằm trong log.
Cách chống là chép mốc thô vào kho mã ngay khi còn đọc được, và đó là lý do `docs/nhat-ky-pipeline.md` tồn tại kèm một lệnh trích viết sẵn.

**Self-hosted runner trên một kho công khai là rủi ro có thật**, vì một pull request từ fork chạy được mã tuỳ ý trên máy thật.
Chỗ chặn là điều kiện `if: github.event_name == 'push'` ở job triển khai, nghĩa là job chỉ tồn tại với commit đã qua `kiem-tra` và đã được merge, không bao giờ với mã của một pull request.
Một dòng bảo vệ mà không ai biết nó bảo vệ cái gì thì lần dọn dẹp sau sẽ có người gỡ nó đi, nên lý do được ghi ngay tại chỗ trong `ci.yml` và nhắc lại ở `README.md`.

## 6. Kết quả đo và so sánh hai giai đoạn

### 6.1 Cách đọc các con số dưới đây

Mọi số trong mục này là **số của nhóm tự đo**, trừ mục 6.4 nói rõ là số trích của ngành.
Mốc giờ thô của Giai đoạn thủ công ở `docs/nhat-ky-thu-cong.md`, số dẫn xuất cùng công thức của từng đại lượng ở `docs/so-lieu-giai-doan-thu-cong.md`; mốc giờ thô của Giai đoạn pipeline ở `docs/nhat-ky-pipeline.md`.
Báo cáo không khai báo lại công thức nào; muốn biết một đại lượng trừ mốc nào cho mốc nào thì tra mục "Định nghĩa" của hai file ấy.

**Số chính khi so sánh là trung vị, không phải trung bình**, và đây là hệ quả của dữ liệu chứ không phải sở thích thống kê.
Giai đoạn thủ công có năm mẫu, và một mẫu duy nhất có tới hai cách đọc hợp lý: theo mốc đã ghi thì lead time của nó là 14 phút, theo mốc phục hồi thật thì là 77 phút.
Bảng ở `docs/so-lieu-giai-doan-thu-cong.md` cho thấy trung bình lead time đổi từ 8,6 lên 21,2 phút giữa hai cách đọc, trong khi trung vị đứng nguyên ở 5 phút.
Với cỡ mẫu bằng năm thì một mẫu bất thường đủ sức lái trung bình đi bất cứ đâu, và bộ dữ liệu này vừa chứng minh chuyện đó bằng chính nó.

### 6.2 Giai đoạn thủ công

Năm thay đổi, mười lần triển khai một môi trường, cửa sổ đo 18 giờ.
Bảng đầy đủ ở `docs/so-lieu-giai-doan-thu-cong.md`; dưới đây là các con số bị nhắc nhiều nhất, đơn vị là phút.

| Đại lượng | Trung vị | Trung bình | Nhỏ nhất | Lớn nhất |
|---|---|---|---|---|
| Chờ | 2 | 3,0 | 1 | 9 |
| staging | 2 | 2,0 | 2 | 2 |
| prod | 1 | 3,6 | 0 | 13 |
| **Lead time** | **5** | **8,6** | **4** | **16** |

Ba cảnh báo phải đi kèm mỗi lần trích bảng này, và cả ba đều ở file nguồn.

Cột `staging` đứng yên ở 2 phút suốt cả năm mẫu, nhưng đó là do đồng hồ chỉ phân giải tới phút, không phải do quy trình ổn định tới mức đó.
Ba trong năm mẫu mang ghi chú riêng mà bảng không thể hiện được: một mẫu không phải trả chi phí xoá volume vì việc đó đã làm trước khi bấm giờ, một mẫu chứa thêm một bước kiểm tay không nằm trong quy trình, và một mẫu phải kéo lại hai image nền trong lúc đồng hồ đang chạy.
Vì vậy cột ấy phải đọc như một dải quanh 2 phút.

Cột `prod` không phải chi phí của một lần triển khai prod độc lập, mà là chi phí biên của môi trường thứ hai, vì nó hưởng nguyên cache build mà bước triển khai staging vừa tạo.
Mẫu có cột `prod` bằng 0 phút cho thấy điều đó ở dạng thuần nhất, khi lớp `COPY services/ services/` báo `CACHED`.

Tần suất triển khai là 5 lần lên prod trong 18 giờ, quy đổi 6,7 lần một ngày.
Con số ấy trông cao, và nó nói ngược điều cần nói nếu trích trần.
Mẫu số là thời gian đồng hồ của một đợt làm việc dồn; năm lần triển khai chỉ tạo ra bốn khoảng cách, và hai khoảng lớn nhất là 622 phút với 344 phút, tức những lúc không có ai ngồi trước máy.
Ràng buộc thật của giai đoạn này không phải quy trình chỉ chịu được ngần ấy lần một ngày, mà là **mỗi lần triển khai đều cần một người có mặt gõ lệnh**.

Về độ ổn định: tỷ lệ phát hành thất bại là 2 trên 5 lần triển khai prod, tức 40%, và thời gian phục hồi là một sự cố duy nhất kéo 65 phút.
Con số 40% trông rất xấu, và đọc trần thì nó sai.
Cả hai lần hỏng truy về đúng một nguyên nhân là một thay đổi schema thiếu bước xoá volume, mà thay đổi schema thì chỉ có đúng một trong năm mẫu.
Nên 40% phải đọc là **một trên một thay đổi schema đã hỏng, và không thay đổi nào trong bốn thay đổi không đụng schema hỏng cả**.

Sự cố ấy cũng là chỗ kiến trúc ở mục 2.1 hiện ra thành hậu quả.
Prod chạy ở trạng thái hỏng một phần trong suốt 65 phút: tạo link và chuyển hướng vẫn phục vụ, còn mọi lượt truy cập đều mất vì `redirect` ghi vào một bảng không tồn tại theo kiểu bắn rồi quên.
Bốn test cũ xanh trong lúc đó là hành vi đúng, và chính vì vậy không có gì báo động.

Còn một chi tiết về chất lượng dữ liệu mà đồ án chọn ghi ra thay vì dọn đi.
Bản ghi của lần hỏng đầu nói rằng prod đã xanh trở lại sau khi xoá volume, và câu đó về sau bị chứng minh là sai bằng mốc tạo của volume; bản ghi cũ được giữ nguyên chứ không sửa đè, vì bản thân việc ghi nhầm là dữ liệu.
Nó cho thấy một quy trình thủ công có thể báo cáo thành công cho một bước chưa bao giờ chạy, mà không có gì chặn lại.

### 6.3 Giai đoạn pipeline, và chỗ chuỗi đang dừng

Đây là chỗ phải nói thẳng trước khi đưa bất kỳ con số nào ra.

**Lead time của Giai đoạn pipeline chưa tính được.**
Chuỗi hiện đi từ merge tới lúc smoke test trên staging báo xanh rồi dừng, vì triển khai prod vẫn làm tay.
Mọi con số trích từ `docs/nhat-ky-pipeline.md` trong khoảng này là số của **một phần** quy trình, và trích nó như lead time sẽ so một nửa của giai đoạn này với trọn vẹn giai đoạn kia.

Bảng mốc của giai đoạn này hiện có sáu dòng, và **không dòng nào là mẫu đo theo nghĩa đầy đủ**: cả sáu đều là thay đổi chỉ chạm tài liệu, cấu hình và pipeline, không đổi một dòng nào trong `services/`.
Đại lượng nghiệm thu trên môi trường thật có đúng một mẫu, là 68 giây của dòng đầu tiên có job triển khai.

| Chặng | Giai đoạn thủ công | Giai đoạn pipeline |
|---|---|---|
| Chờ sau khi merge | trung vị 2 phút, dải 1 tới 9 | 3 tới 8 giây |
| Kiểm thử và đóng gói | nằm trong 2 phút của chặng staging | 68 tới 84 giây trên sáu dòng |
| Nghiệm thu trên môi trường thật | nằm trong 2 phút của chặng staging | 68 giây, một mẫu |
| Đưa lên prod | trung vị 1 phút | chưa tự động, chưa đo được |
| **Lead time tới prod** | **trung vị 5 phút** | **chưa tính được** |
| Cần một người có mặt | mọi lần, cả hai môi trường | không lần nào ở staging |
| Tỷ lệ phát hành thất bại | 40%, hai lần trên năm | chưa có mẫu |
| Thời gian phục hồi | 65 phút, một sự cố | chưa có mẫu |

Con số 68 tới 84 giây là số dẫn xuất tính tại chỗ từ bảng mốc thô để bảng trên có một ô so được, không phải một đại lượng đã chốt; việc dựng bảng bốn chỉ số DORA đầy đủ cho cả hai giai đoạn vẫn là việc chưa làm, xem mục 7.

Đọc bảng ấy đúng thì được ba kết luận, và không kết luận nào là "pipeline nhanh hơn".

**Thứ nhất, ở phần làm việc thì pipeline không nhanh hơn tay người.**
Một lần chạy kiểm thử cộng đóng gói cộng dựng lại staging cộng smoke test rơi vào khoảng hơn hai phút, còn cả chặng staging làm tay là khoảng 2 phút.
Hai con số ấy cùng cỡ, và pipeline còn cõng thêm những khoản mà tay người không có: một quãng chờ runner nhận job, một lần `docker pull` từ GHCR, và một lần dựng lại image ở job đóng gói bên cạnh lần dựng của job kiểm thử.

**Thứ hai, chỗ thắng là khoảng chờ, và nó thắng không phải vì máy chờ nhanh hơn.**
Khoảng chờ tụt từ dải 1 tới 9 phút xuống dải 3 tới 8 giây, nhưng hai con số ấy đo hai hiện tượng khác nhau: một bên là thay đổi nằm trên `main` chờ một người rảnh tay, bên kia là độ trễ điều phối của GitHub.
Câu kết luận đúng là **thứ biến mất là việc phải chờ người**, không phải rằng máy chờ nhanh hơn người 60 lần.

**Thứ ba, thứ pipeline mua được mà số phút không thể hiện là tính chắc chắn của quy trình.**
Bàn tay người đọc `git show --stat` rồi tự quyết có cần xoá volume hay không, và một lần quyết sai đã tạo ra 65 phút hỏng ở mục 6.2.
Pipeline luôn xoá volume, luôn chạy đúng ba bước theo đúng thứ tự, và dựng staging từ **chính image đã đóng gói** thay vì build lại từ mã nguồn.
Chi tiết cuối là chỗ pipeline chặt hơn tay người, không phải chỗ nó nhanh hơn: mốc nghiệm thu của nó thật sự có nghĩa "image đã đóng gói đã được kiểm trên môi trường thật".

Phần phát hành thì đo được trọn vẹn, vì nó không phụ thuộc mắt prod.
Từ lúc GitHub nhận cú push tag `v0.1.0` tới lúc bản phát hành được công bố là 30 giây, gồm 22 giây đóng gói image và 4 giây tạo release; danh sách thay đổi tự sinh liệt kê 36 pull request, tức toàn bộ lịch sử kho mã vì chưa có bản phát hành nào trước nó.
Số liệu này trích từ mục cuối của `docs/nhat-ky-du-an.md`, và nó cố ý không đi vào bảng nào của `docs/nhat-ky-pipeline.md`: bảng đó ghi mốc của các run sinh ra bởi một cú push commit, còn run phát hành sinh ra bởi một cú push tag nên nó không phải một dòng cùng loại.

Một con số nữa đáng kể lại, vì nó nói về cái pipeline **không** đổi.
Bộ kiểm thử vẫn là đúng 20 test, y hệt con số của Giai đoạn thủ công, và cả năm file test đều chạy ở job `kiem-tra` trên mỗi thay đổi; con số ấy trích từ mục nhật ký của #12 trong `docs/nhat-ky-du-an.md`, ở chỗ đối chiếu tập smoke test với toàn bộ bộ kiểm thử.
Chuyển sang chạy tự động không đổi tập lỗi mà nó nhìn thấy: các test chạy nhanh hơn, rẻ hơn, không quên lần nào, còn số lượng thứ chúng không nhìn thấy thì y nguyên.
Một mẫu đo của Giai đoạn thủ công không thêm được dòng test nào chính vì lý do đó, vì nó xây phần ghi log mà log không đi ra qua HTTP.

### 6.4 Đối chiếu với ngưỡng của báo cáo ngành

Phần này là **số trích của ngành**, không phải số của nhóm, và nó được tách riêng đúng vì hai loại số ấy có độ tin khác nhau.
Nguồn là DORA, *Accelerate State of DevOps Report 2024*, công bố tại `dora.dev/research/2024/dora-report/`.
Ngưỡng của bốn nhóm hiệu năng đổi giữa các năm, nên mọi con số dưới đây phải đọc kèm năm 2024 chứ không đọc như một hằng số.

| Nhóm | Tần suất triển khai | Lead time for changes | Thời gian phục hồi sau một lần phát hành hỏng |
|---|---|---|---|
| Elite | theo yêu cầu, nhiều lần một ngày | dưới một ngày | dưới một giờ |
| High | từ một lần một ngày tới một lần một tuần | từ một ngày tới một tuần | dưới một ngày |
| Medium | từ một lần một tuần tới một lần một tháng | từ một tuần tới một tháng | từ một ngày tới một tuần |
| Low | từ một lần một tháng tới một lần nửa năm | từ một tháng tới nửa năm | từ một tuần tới một tháng |

Cột change failure rate cố ý không có trong bảng.
Bản PDF của báo cáo không mở ra được trên máy làm đồ án, nên ngưỡng phải lấy qua các bản dẫn lại, và hai bản dẫn lại độc lập cho hai bộ giá trị khác nhau cho đúng chỉ số này: một bản ghi 5% cho Elite và 20% cho High, bản kia ghi 0-15% cho Elite và 16-30% cho High.
Trích một trong hai mà không biết bản nào đúng thì con số trong báo cáo học thuật sẽ là con số không kiểm được, nên phần đối chiếu cho chỉ số ấy bị bỏ, theo đúng nguyên tắc thà thiếu hơn đoán.

Đối chiếu ba chiều còn lại, và chỉ đối chiếu được cho Giai đoạn thủ công vì giai đoạn sau chưa có lead time:

| Chỉ số | Số của nhóm, Giai đoạn thủ công | Nhóm tương ứng theo ngưỡng 2024 |
|---|---|---|
| Lead time for changes | trung vị 5 phút | Elite, dưới một ngày |
| Tần suất triển khai prod | 5 lần trong 18 giờ | Elite, theo yêu cầu |
| Thời gian phục hồi | 65 phút | High, dưới một ngày |

Bảng này phải đọc ngược lại với cách nó trông.
Một đồ án chưa có pipeline nào mà đã rơi vào nhóm Elite ở hai chiều tốc độ thì điều đó nói về **kích thước của hệ**, không nói về năng lực của quy trình: hệ có ba service nhỏ chạy trên một máy cá nhân, không có người dùng thật, không có cửa sổ phát hành, không có ai phải được thông báo trước.
Ngưỡng của báo cáo ngành được tính trên những tổ chức mà một lần triển khai phải qua nhiều môi trường và nhiều người, nên định vị tuyệt đối của đồ án này vào bảng đó gần như không mang thông tin.

Điều bảng ấy dùng được là chiều thứ ba.
Thời gian phục hồi 65 phút và tỷ lệ hỏng 40% cho thấy chỗ yếu của Giai đoạn thủ công nằm ở **độ ổn định**, không ở tốc độ, dù trực giác về "làm tay thì chậm" lại nói ngược.
Và đó đúng là chỗ mà mục 6.3 nói pipeline mua được nhiều nhất: nó không rút ngắn hai phút làm việc, nó xoá cái bước mà một lần quyết sai đã tạo ra 65 phút hỏng.

Ngoài DORA, phần lý thuyết dựa vào Sommerville, *Software Engineering*, 10th ed., Chương 25 cho bốn hoạt động ở mục 3; Humble & Farley, *Continuous Delivery* (2010) cho khái niệm deployment pipeline và nguyên tắc đưa mỗi thay đổi qua cùng một đường tự động; và Beyer et al., *Site Reliability Engineering* (Google, 2016) cho cách nhìn công việc thủ công lặp lại như một khoản chi phí phải đo.
Quy tắc đánh số phiên bản ở mục 3.4 dẫn *Semantic Versioning 2.0.0*, công bố tại `semver.org`, và đó là nguồn ngoài duy nhất mà mục 3 dùng ngoài Sommerville.

## 7. Giới hạn và hướng phát triển

Ba chỗ chưa đo được, và cả ba là giới hạn của **phép đo** chứ không phải chỗ thiếu tính năng.
Mỗi chỗ đã có một ticket nhận, nên chúng là việc còn lại chứ không phải chỗ vừa phát hiện lúc viết báo cáo.

**Lead time của Giai đoạn pipeline chưa tính được, vì chuỗi còn thiếu mắt prod.**
Triển khai prod vẫn làm tay, nên chuỗi tự động dừng ở lúc smoke test trên staging báo xanh.
Việc này thuộc ticket #13, và cho tới khi nó xong thì bảng so sánh hai giai đoạn ở mục 6.3 còn một ô trống ở đúng chỉ số quan trọng nhất.
Đây là giới hạn nặng nhất của báo cáo, và nó được nói ra thay vì lấp bằng con số của một phần quy trình.

**Tỷ lệ phát hành thất bại và thời gian phục hồi của Giai đoạn pipeline chưa có mẫu nào.**
Không phải vì pipeline chưa từng hỏng, mà vì hai lý do khác nhau cộng lại.
Số lần hỏng tự nhiên trong một đồ án là quá ít để có nghĩa, và cổng gác `kiem-tra` chạy trên pull request nên phần lớn lỗi cùng loại sẽ chết **trước** mốc merge và không để lại dòng nào trong bảng mốc.
Nghĩa là tỷ lệ hỏng của giai đoạn này sẽ thấp một phần vì pipeline thật sự tốt hơn, và một phần vì tập lỗi bị chặn ở chỗ khác; hai phần đó không tách được bằng dữ liệu quan sát.
Chỉ một thí nghiệm tiêm lỗi có kiểm soát mới cho một mẫu số so được, và đó là ticket #21.

**Không có ảnh biểu đồ nào từ một hệ đo lường.**
Ba service đã phơi `/metrics` theo định dạng của Prometheus ngay từ đầu, nhưng Prometheus và Grafana chưa được thêm vào stack; việc đó là ticket #15.
Vì vậy mọi số trong mục 6 đọc từ mốc giờ và từ API của GitHub, không đọc từ một dashboard.

Còn ba chỗ nhỏ hơn nhưng cùng loại, và chúng ảnh hưởng tới độ tin của phép so sánh.
Cỡ mẫu của Giai đoạn thủ công là năm, và của Giai đoạn pipeline hiện là sáu dòng mà không dòng nào là thay đổi cỡ chuẩn.
Độ phân giải đồng hồ của hai giai đoạn lệch nhau 60 lần, nên mọi khoảng ngắn hơn một phút của giai đoạn trước rơi về 0 trong khi giai đoạn sau thì không, và sai số lượng tử hoá ấy không khử được.
Và Giai đoạn pipeline còn nợ ít nhất một thay đổi chạm `infra/postgres/init.sql`, vì cả hai lần hỏng của giai đoạn trước đều truy về một thay đổi schema, nên không có mẫu schema ở giai đoạn này thì hai tỷ lệ hỏng không so được với nhau.
Sáu chênh lệch phải mang theo mỗi khi so hai giai đoạn được ghi đầy đủ ở mục "Tương ứng với Giai đoạn thủ công" của `docs/nhat-ky-pipeline.md`, và chúng được ghi ra chứ không chọn đại một trường cho khớp.

Hướng phát triển gần nhất vì vậy không phải thêm tính năng, mà là đóng nốt ba mắt của phép đo: tự động hoá prod với rollback, tiêm lỗi có kiểm soát để có mẫu độ ổn định, và một hệ đo lường có biểu đồ.
Một việc kỹ thuật nữa đã biết cách làm và cố ý hoãn là gắn tag phiên bản vào chính image đã qua smoke test thay vì dựng lại, để xoá chỗ lệch digest ở mục 3.2; lý do hoãn là đổi cách đóng gói sát ngày nộp đắt hơn cái nó mua, và vì thiết kế thí nghiệm cấm thêm biến vào giữa một giai đoạn đang đo.

## 8. Kết luận

Đồ án này không chứng minh rằng CI/CD thì tốt hơn làm tay, vì đó không phải một khẳng định cần chứng minh.
Nó đo xem cái tốt hơn ấy nằm ở đâu, và câu trả lời không nằm ở chỗ trực giác chỉ tới.

Ở phần làm việc, pipeline và bàn tay người cùng cỡ nhau: khoảng hai phút cho một chặng đưa thay đổi lên môi trường đầu tiên, và pipeline còn cõng thêm những khoản mà tay người không có.
Chỗ pipeline thắng là khoảng chờ, tụt từ dải phút xuống dải giây, và thắng ở đó không phải vì máy chờ nhanh hơn mà vì **việc phải chờ một người rảnh tay đã biến mất**.
Chỗ nó thắng đậm hơn nữa lại không đo được bằng giây: nó xoá cái bước mà con người phải tự quyết, và một lần quyết sai của bước ấy đã tạo ra 65 phút hỏng trong Giai đoạn thủ công.

Thứ đồ án học được nhiều nhất thì không mua được bằng cách viết thêm mã.
Bốn lần trong kho mã này, một thứ mô tả hệ thống đã tự lệch khỏi hệ thống sau một thay đổi: một định nghĩa chỉ số, một câu tự nói sai về chính file chứa nó, hai tài liệu vẫn bảo bấm một cái đồng hồ không còn ai bấm, và một cột mốc đổi nghĩa chỉ vì có một job mới chạy sau job cũ.
Không lần nào có test đỏ, vì không lần nào hệ thống hỏng; thứ hỏng là những gì nói về hệ thống, mà với một đồ án đo lường thì đó mới là sản phẩm.

Đó là câu trả lời của báo cáo cho câu hỏi vì sao Configuration Management là một hoạt động riêng chứ không phải một phần của việc viết mã.
