# Hướng dẫn cập nhật dữ liệu, biểu mẫu và căn cứ pháp lý

Dữ liệu tách hoàn toàn khỏi giao diện, gồm hai tệp:

| Tệp | Nội dung | Cách cập nhật |
|---|---|---|
| `app/du-lieu/nguon.js` | Nguyên văn trích từ PDF: Quyết định, 24 điều, 45 thủ tục × 9 mục, Phụ lục IV, 45 mẫu | **Sinh tự động** — không sửa tay |
| `app/du-lieu/bo-sung.js` | Thông tin văn bản (số, ngày, hiệu lực), vấn đề nguồn, danh mục cơ quan, 5 quy trình Chương III, quy tắc thời hạn | Sửa tay có kiểm soát |

## A. Khi có văn bản sửa đổi, bổ sung, thay thế (PDF mới)

Yêu cầu: Windows, PowerShell, **.NET SDK 8** (lần đầu cần Internet để tải gói PdfPig từ nuget.org).

1. Sao lưu thư mục `app/du-lieu/`.
2. Chép PDF mới thành `app/tai-nguyen/qd75.pdf` (hoặc chỉ định đường dẫn ở bước 3).
3. Chạy:
   ```bash
   powershell -ExecutionPolicy Bypass -File cong-cu/cap-nhat-du-lieu.ps1
   ```
   Đọc các dòng `CANH BAO` (thiếu mục, danh mục và nội dung lệch số lượng, mẫu thiếu trong danh mục…). Mỗi cảnh báo phải được xem xét trên PDF.
4. Mở `app/du-lieu/bo-sung.js` và rà soát:
   - `vanBan`: số, ký hiệu, ngày ban hành, ngày hiệu lực. Khi đã đối chiếu được trên văn bản chính thức, đổi `nguon` từ `"nguoi-dung"`/`"chua-xac-dinh"` thành `"pdf"` và `tinhTrangHieuLuc` cho phù hợp.
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

## C. Kiểm thử sau cập nhật

```bash
powershell -ExecutionPolicy Bypass -File cong-cu/chay-may-chu.ps1
powershell -ExecutionPolicy Bypass -File cong-cu/chay-kiem-thu.ps1
```

Lệnh thứ hai ghi lại `tai-lieu/ket-qua-kiem-thu.csv`, `bang-doi-soat.csv`, `danh-muc-thu-tuc.csv`, `van-de-van-ban-nguon.csv`. Chụp lại ảnh màn hình (tùy chọn): `cong-cu/chup-man-hinh.ps1`.

## D. Biểu mẫu

Phần mềm không tạo lại biểu mẫu. Mẫu chính thức là trang PDF gốc trong `app/tai-nguyen/qd75.pdf`. Khi cơ quan có tệp mẫu Word chính thức, có thể bổ sung: đặt tệp vào `app/tai-nguyen/mau/` và thêm liên kết tải trong màn hình mẫu (`app/js/man-tra-cuu.js`, hàm `chiTietMau`) — cần ghi rõ nguồn tệp.

## E. Về chức năng sửa dữ liệu trên giao diện

Chưa xây dựng, có chủ đích: chỉnh sửa trực tiếp cần cơ chế phân quyền, xác thực người dùng, ghi nhật ký thay đổi và máy chủ lưu trữ — hạ tầng chưa được yêu cầu. Quy trình cập nhật qua tệp + bộ kiểm thử bảo đảm mọi thay đổi được đối chiếu với văn bản nguồn.
