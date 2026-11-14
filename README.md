# Paul's Movie Log

Nhật ký phim cá nhân. Chấm điểm, lưu ngày xem, comment, xuất PNG Instagram.
Giao diện SF Pro trên hệ thống có font này, kèm font dự phòng cho thiết bị khác.

## Chạy và publish

Cần Node.js 22 trở lên, không cần cài dependency.

```bash
npm test
npm run build
```

Thư mục `_site/` là bản web hoàn chỉnh, chạy được ở domain gốc hoặc đường dẫn repo.
Để xem trên máy, phục vụ `_site/` bằng một HTTP server, ví dụ:

```bash
python3 -m http.server 8080 --directory _site
```

### GitHub Pages

1. Đưa toàn bộ source vào repo của bạn, branch `main`, gồm cả `.github/workflows/pages.yml`.
2. Vào **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push lên `main` hoặc chạy workflow **Publish Movie Log** trong tab Actions.
4. Khi workflow thành công, mở URL ở bước deploy / Settings → Pages.

Workflow kiểm tra dữ liệu, build và publish tự động. Không cần GitHub token trong source hoặc Actions Secrets.
Với repo đã dùng branch khác, sửa `branches: [main]` trong workflow cho đúng.
Tài liệu GitHub: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Dữ liệu gốc là Markdown

- `content/films/<id>.md`: thông tin và điểm trong frontmatter; comment ở phần body.
- `assets/posters/`: poster cá nhân được xuất hoặc đồng bộ từ app.
- `dist/assets/`: poster mẫu và font đi kèm.
- `dist/`: source giao diện, không cần framework/server/database.
- `scripts/build-pages.cjs`: kiểm tra Markdown, tạo dữ liệu đọc và sao chép ảnh sang `_site/`.
- `_site/data.js`: bản sinh tự động để app đọc nhanh; không phải dữ liệu gốc.

Frontmatter dùng giá trị JSON hợp lệ sau mỗi dấu `:` (chuỗi trong dấu nháy kép, array/object dạng JSON).
Hãy lấy một file mẫu làm chuẩn. Tên file phải trùng `id`.
Bản source hiện có 5 phim mẫu, không phải dữ liệu cá nhân lấy từ trình duyệt của bạn.

### Chuyển dữ liệu từ web cũ

Dữ liệu trình duyệt không tự chuyển qua domain mới.

1. Ở web cũ: Cài đặt → Xuất Markdown + poster, giải nén ZIP.
2. Chép `content/films/` và `assets/posters/` trong ZIP vào repo này. Xóa các phim mẫu nếu không cần.
3. Push: Pages sẽ tự build lại từ Markdown.

Người mở web lần đầu sẽ thấy dữ liệu đã publish. Khi bản publish thay đổi, app cập nhật các phim chưa có chỉnh sửa cục bộ; các chỉnh sửa chưa đồng bộ được giữ lại. Nút xóa/ghi trong trình duyệt không tự ghi vào repo.

### Chỉnh sửa trực tiếp trong app và lưu GitHub

1. Cài đặt → GitHub: nhập `username/repository`, branch `main`, folder `content/films`.
2. Dùng fine-grained token chỉ cho repo đó với quyền **Contents: Read and write**.
3. Kết nối đọc Markdown; bấm **Đồng bộ** để lưu phim và poster vào repo.
4. Mỗi commit dữ liệu trên `main` chạy workflow và publish lại.

Token chỉ nằm trong bộ nhớ phiên, không ghi vào localStorage, source, file Markdown hay bản xuất.
App đọc lại SHA trước khi ghi để phát hiện dữ liệu bị đổi từ nơi khác. Nếu có xung đột, kết nối lại và chọn bản muốn giữ trước khi đồng bộ.
Tên/avatar người review được ghi trong từng file phim khi xuất/đồng bộ.

GitHub Pages là nơi phục vụ bản web và dữ liệu được build. Dữ liệu đưa vào bản publish có thể được người xem web đọc; không đưa token hoặc thông tin riêng tư vào Markdown/source.
Nếu chỉ cần giữ dữ liệu riêng, có thể dùng repo dữ liệu riêng và chỉ đọc qua kết nối GitHub trong app, không chép các phim đó vào repo publish.

## Khôi phục khi ngừng dùng app

Mở trực tiếp các file `.md` bằng trình soạn thảo bất kỳ. Poster là file ảnh độc lập.
Có thể chuyển cả repo/ZIP sang hosting tĩnh khác mà không cần ứng dụng hiện tại.

Các ghi chú triển khai cũ được lưu tại `docs/IMPLEMENTATION.md`.

## Khi gặp lỗi

Nếu test/build xanh nhưng deploy báo `Get Pages site failed`, bật **Settings → Pages → Source → GitHub Actions**, rồi chạy lại job deploy. Bước build vẫn tạo artifact ngay cả khi Pages chưa bật.

Khi trình duyệt hết dung lượng hoặc bản ghi trạng thái publish bị lỗi, app giữ danh sách phim và các chỉnh sửa đang mở, báo chưa lưu được, và không thay bằng dữ liệu mẫu. Xuất Markdown trước khi dọn bộ nhớ trình duyệt.

## Chỉ chủ sở hữu được quản lý

Khách mặc định chỉ xem, không có nút thêm/sửa/xóa/import hoặc đổi nhân vật. Vào Quản lý và xác thực bằng fine-grained token của tài khoản `paulthanhha` để mở chức năng quản lý. Repository được kiểm tra thuộc tài khoản này và tài khoản có quyền ghi. Token cần Contents: Read and write; chỉ giữ trong bộ nhớ tab, không lưu lâu dài. Bấm Ngắt kết nối hoặc tải lại trang để khóa lại.

Chế độ chỉ xem là giao diện cho khách; quyền ghi dữ liệu chung được GitHub thực thi qua token và quyền repo. Việc sửa JavaScript/localStorage ở máy của khách không cấp quyền sửa repo. Trang và nội dung đã publish vẫn công khai.

## Import nhiều phim

Sau khi xác thực, bấm **↑ Import** ở header hoặc **Import nhiều phim** trong Cài đặt. Chọn nhiều `.md`, một hoặc nhiều `.csv`/`.json`. Có thể tải CSV mẫu ngay trong hộp import để điền từ Excel/Google Sheets.

CSV dùng tên cột theo mẫu; tối thiểu `title`. `genres`, `cast` ngăn cách bằng `|`; `watchedOn` dùng YYYY-MM-DD. Cột `rating` điền chung cho bốn tiêu chí, hoặc điền riêng `story`, `visuals`, `performances`, `impact`. Điểm nguyên 1–5, có thể để trống. `review` không bắt buộc. Nếu không điền `id`, app tạo từ tên và năm để nhận diện khi nhập lại.

JSON nhận array phim hoặc object `{ "films": [...] }`. Markdown giữ đúng schema hiện có. Tối đa 1.000 phim, mỗi file 4 MB và tổng 20 MB một lần nhập. Lỗi được hiển thị trước khi ghi; ID trùng trong cùng đợt nhập bị từ chối. Có xem trước, mặc định bỏ qua phim đã có; tick Thay thế để cập nhật theo ID.

Import lưu cục bộ trước; bấm **Đồng bộ** để lưu Markdown và poster vào GitHub. Tất cả phim trong mỗi lần đồng bộ được ghi trong một commit, tránh chạy workflow hàng trăm lần khi import lớn. Nếu branch hoặc file đã thay đổi từ nơi khác, thao tác ghi bị từ chối để đọc lại dữ liệu trước.

## Thêm, sửa và xóa phim

Form dùng ba tab: Thông tin phim → Lần xem & điểm → Nhận xét. Chỉ tên phim bắt buộc; có thể Lưu phim từ bất kỳ tab nào. Đoàn phim và lịch sử xem lại là các phần mở rộng. Chấm bằng nút 1–5, có thể bỏ điểm từng tiêu chí. Nhận xét trống sẽ không hiện.

Sau khi xác thực chủ sở hữu, mở một phim và bấm **Xóa phim** trên thanh công cụ, hoặc mở Chỉnh sửa rồi bấm **Xóa phim** ở chân form. Có xác nhận trước khi xóa. Khi đang kết nối, file Markdown tương ứng được xóa khỏi GitHub; app chỉ xóa bản cục bộ sau khi GitHub chấp nhận. Xung đột SHA sẽ dừng thao tác để đọc lại dữ liệu trước. Xóa entry không xóa poster dùng chung; file Markdown cũ vẫn có thể lấy lại qua lịch sử Git.
