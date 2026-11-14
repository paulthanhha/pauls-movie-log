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
