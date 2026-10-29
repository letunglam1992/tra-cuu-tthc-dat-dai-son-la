# Hướng dẫn cập nhật dữ liệu, biểu mẫu và căn cứ pháp lý

Dữ liệu tách hoàn toàn khỏi giao diện, gồm hai tệp:

| Tệp | Nội dung | Cách cập nhật |
|---|---|---|
| `app/du-lieu/nguon.js` | Nguyên văn trích từ PDF: Quyết định, 24 điều, 45 thủ tục × 9 mục, Phụ lục IV, 45 mẫu | **Sinh tự động** — không sửa tay |
| `app/du-lieu/bo-sung.js` | Thông tin văn bản (số, ngày, hiệu lực, văn bản hết hiệu lực, bản ký ban hành), vấn đề nguồn, danh mục cơ quan, 5 quy trình Chương III, quy tắc thời hạn; dữ liệu tra cứu: tình huống thường gặp, từ đồng nghĩa, lịch nghỉ, liên kết dịch vụ công | Sửa tay có kiểm soát |

## A. Khi có văn bản sửa đổi, bổ sung, thay thế (PDF mới)

Yêu cầu: **.NET SDK 8** và Node.js ≥ 18 (lần đầu cần Internet để tải gói PdfPig từ nuget.org). Chạy được trên Windows, Linux, macOS bằng `npm run cap-nhat-du-lieu` (hoặc trên Windows: `cong-cu/cap-nhat-du-lieu.ps1`).

1. Sao lưu thư mục `app/du-lieu/`.
2. Chép PDF mới thành `app/tai-nguyen/qd75.pdf` (hoặc chỉ định đường dẫn ở bước 3).
3. Chạy:
   ```bash
   powershell -ExecutionPolicy Bypass -File cong-cu/cap-nhat-du-lieu.ps1
   ```
   Đọc các dòng `CANH BAO` (thiếu mục, danh mục và nội dung lệch số lượng, mẫu thiếu trong danh mục…). Mỗi cảnh báo phải được xem xét trên PDF.
4. Mở `app/du-lieu/bo-sung.js` và rà soát:
   - `vanBan`: số, ký hiệu, ngày ban hành, ngày hiệu lực, `vanBanHetHieuLuc`. Giá trị `nguon`: `"pdf"` (có trong tệp PDF), `"ban-ky"` (đối chiếu bản ký ban hành), `"nguoi-dung"`, `"chua-xac-dinh"`. Tình trạng hiệu lực tự tính theo `ngayHieuLuc` (trước ngày đó hiển thị “chưa có hiệu lực”); chỉ đặt tay `tinhTrangHieuLuc: "het-hieu-luc"` khi văn bản bị thay thế.
   - `banKy`: ảnh bản ký ban hành và các chỗ trống trong PDF được điền theo bản ký (`dien`). Khi có tệp PDF bản ký số, thay `qd75.pdf`, chạy lại trích xuất và xóa các mục `dien` không còn cần.
   - `vanDeNguon`: xóa vấn đề đã được khắc phục trong văn bản mới, thêm vấn đề mới.
   - `quyTrinh`: nếu Chương III thay đổi, cập nhật `nguyenVan`, `thoiHan`, `canCu` của từng bước; thêm/bớt bước và `canh` tương ứng.
   - Tăng `phienBanDuLieu` và thêm một dòng vào `lichSu`.
5. Chạy kiểm thử (mục C). Kiểm thử **QT-02** sẽ báo lỗi nếu bất kỳ đoạn `nguyenVan` nào không còn khớp với văn bản mới — sửa đến khi đạt.
6. Mở màn hình *Đối soát dữ liệu*, kiểm tra tab *Kiểm tra tự động* không còn lỗi, xuất bảng đối soát lưu hồ sơ.

## B. Thêm hoặc sửa một bước quy trình (Chương III)

Mỗi bước trong `quyTrinh[].buoc`:

```js
{ id: "b3", loai: "buoc",            // batdau | buoc | nhanh (ngoại lệ) | ketthuc
  lane: "cq-qldd", hang: 3,          // làn = id trong danh mục coQuan; hang = vị trí dọc trên sơ đồ
  ten: "Chuyển Phiếu chuyển thông tin…",   // diễn giải ngắn (không phải nội dung pháp lý)
  canCu: { dieu: "15", khoan: "1" },
  nguyenVan: "Trong thời hạn 02 (hai) ngày làm việc…",   // PHẢI là đoạn nguyên văn có trong khoản đã dẫn
  thoiHan: { ngay: 2, nguyenVan: "…", moc: "Kể từ ngày …", ghiChu: "…" },  // ngay: null nếu văn bản không nêu
  dauVao: ["…"], dauRa: ["…"], mau: ["19"], vanDe: ["VD06"], ghiChuPhanMem: "…" }
```

Luồng giữa các bước khai báo trong `canh`: `{ tu: "b3", den: "b4", loai: "chinh" | "dieu-kien" | "tra-lai" | "dong-thoi", nhan: "…" }`.

Bộ kiểm tra tự động bảo đảm: làn có trong danh mục, cạnh trỏ tới bước có thật, mọi bước có luồng vào/ra, căn cứ khoản tồn tại, nguyên văn khớp.

## B2. Dữ liệu phục vụ tra cứu (Phần mềm lập)

| Khóa trong `bo-sung.js` | Dùng cho | Ghi chú cập nhật |
|---|---|---|
| `tinhHuong` | Trang chủ “Bạn cần làm thủ tục gì?” | Mỗi mục: `ten`, `moTa`, `thuTuc: ["III.3", …]` hoặc `lienKet`. Kiểm thử báo lỗi nếu mã thủ tục không tồn tại. |
| `dongNghia` | Tìm kiếm hiểu cách gọi thông dụng | `{ tu: ["so do", "gcn"], thanh: "giấy chứng nhận" }`; `thanh` có thể là mảng cụm (tài liệu phải chứa đủ). Viết `tu` không dấu. |
| `lichNghi.theoNam` | Tính thời hạn | Mỗi năm, khi có thông báo nghỉ lễ, Tết của Thủ tướng/Bộ Nội vụ: `{ nam: 2027, ngayNghi: ["2027-02-05", …], ngayLamBu: ["2027-…"], nguon: "Thông báo số …" }`. Năm chưa nhập: phần mềm tạm tính Tết, ngày liền kề Quốc khánh theo thông lệ và cảnh báo người dùng. Ngày lễ dương lịch cố định và Giỗ Tổ (âm lịch) luôn tự tính, kể cả nghỉ bù. |
| `dichVuCong.maQuocGia` | Mã TTHC quốc gia ở trang thủ tục, tìm kiếm, báo cáo | `{ "III.3": { ma: "1.012784", mucDo: "khop" \| "goi-y", tenDanhMuc, phiDanhMuc, ghiChu } }`. Khi UBND tỉnh công bố danh mục mới: cập nhật mã, `nguonMa`; mã “goi-y” chỉ hiển thị kèm nhãn cần xác minh. |
| `hieuLucVanBan` | Tình trạng hiệu lực văn bản viện dẫn ngoài phần căn cứ | `{ ten, ma: "co-hieu-luc" \| "het-hieu-luc" \| "het-mot-phan", nhan, nguon }` — ghi rõ nguồn tra cứu (Cơ sở dữ liệu quốc gia về VBPL, ngày tra). |
| `nghiaVuTaiChinh` | Công cụ ước tính nghĩa vụ tài chính | Căn cứ, mức mặc định (lệ phí trước bạ, thuế TNCN), gợi ý tỷ lệ thu khi chuyển mục đích — các mục `canXacMinh` phải được đối chiếu văn bản hiện hành. |
| `troLyAI.diaChi` | Trợ lý hỏi đáp | Địa chỉ Worker sau khi triển khai `tro-ly-ai/` (xem README trong thư mục đó). Để trống: chỉ hiện đoạn nguyên văn liên quan. |

**Phí, lệ phí** (`app/du-lieu/phi-le-phi.js`): mức thu trích nguyên văn từ Nghị quyết HĐND tỉnh hiện hành. Khi HĐND ban hành nghị quyết mới: cập nhật `vanBan` (số, ngày, hiệu lực, văn bản hết hiệu lực), các bảng mức thu; `theoThuTuc` là phân loại khoản thu theo thủ tục (lan-dau, bien-dong, ca-hai, trich-luc, khong).

Sau khi sửa, tăng `phienBanDuLieu` **và** `PHIEN_BAN` trong `app/sw.js` (kiểm thử bắt buộc hai số trùng nhau) để trình duyệt người dùng nhận bản mới thay vì bản lưu ngoại tuyến.

## C. Kiểm thử sau cập nhật

Trên mọi hệ điều hành có Node.js ≥ 18:

```bash
npm test
```

```bash
npm install && npx playwright install chromium && npm run test:ui
```

Lệnh thứ nhất (vài giây) kiểm tra dữ liệu, hiệu lực, tìm kiếm (bảng hồi quy 27 câu), thời hạn, xuất Word, cấu hình ngoại tuyến và triển khai. Lệnh thứ hai chạy bộ kiểm thử trong trình duyệt (`kiem-thu.html`), kiểm tra khổ điện thoại, ngoại tuyến, in phiếu A4 và ghi `tai-lieu/ket-qua-kiem-thu.csv`. Hai lệnh cũng chạy tự động trên GitHub Actions mỗi lần đẩy mã (`.github/workflows/kiem-thu.yml`).

Trên Windows vẫn dùng được cách cũ (ghi thêm `bang-doi-soat.csv`, `danh-muc-thu-tuc.csv`, `van-de-van-ban-nguon.csv` và mở thử tệp Word bằng Microsoft Word):

```bash
powershell -ExecutionPolicy Bypass -File cong-cu/chay-may-chu.ps1
powershell -ExecutionPolicy Bypass -File cong-cu/chay-kiem-thu.ps1
```

Lệnh thứ hai ghi lại `tai-lieu/ket-qua-kiem-thu.csv`, `bang-doi-soat.csv`, `danh-muc-thu-tuc.csv`, `van-de-van-ban-nguon.csv`. Chụp lại ảnh màn hình (tùy chọn): `cong-cu/chup-man-hinh.ps1`.

## D. Biểu mẫu

Nút “Tải Word” dựng lại nội dung mẫu từ PDF: ghép các dòng thành đoạn, khôi phục “m²”, tách quốc hiệu – tiêu ngữ và phần chú thích (`app/js/xuat-word.js`, hàm `dungDoan`). Bảng biểu, ô đánh dấu có thể khác bố cục gốc. Mẫu chính thức là trang PDF gốc trong `app/tai-nguyen/qd75.pdf`. Khi cơ quan có tệp mẫu Word chính thức, có thể bổ sung: đặt tệp vào `app/tai-nguyen/mau/` và thêm liên kết tải trong màn hình mẫu (`app/js/man-tra-cuu.js`, hàm `chiTietMau`) — cần ghi rõ nguồn tệp.

## E. Về chức năng sửa dữ liệu trên giao diện

Chưa xây dựng, có chủ đích: chỉnh sửa trực tiếp cần cơ chế phân quyền, xác thực người dùng, ghi nhật ký thay đổi và máy chủ lưu trữ — hạ tầng chưa được yêu cầu. Quy trình cập nhật qua tệp + bộ kiểm thử bảo đảm mọi thay đổi được đối chiếu với văn bản nguồn.
