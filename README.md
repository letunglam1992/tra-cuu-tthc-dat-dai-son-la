# Tra cứu thủ tục hành chính đất đai – tỉnh Sơn La

Phần mềm tra cứu trình tự, thủ tục hành chính về đất đai và quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính (NVTC) về đất đai, xây dựng từ toàn văn **Quyết định số 75/2026/QĐ-UBND** của UBND tỉnh Sơn La và Phụ lục I–V kèm theo.

> **Văn bản nguồn.** Quyết định số **75/2026/QĐ-UBND ngày 22/10/2026** của UBND tỉnh Sơn La, **có hiệu lực thi hành kể từ ngày 22/10/2026** (khoản 1 Điều 2) — số, ngày, hiệu lực đối chiếu theo bản ký ban hành (`app/tai-nguyen/ban-ky/`). Tệp PDF nội dung (`qd75.pdf`) là bản để trống số, ngày; nên thay bằng bản ký số khi có. Dữ liệu phiên bản 2.0.0 — xem [CHANGELOG.md](CHANGELOG.md).

**Phạm vi:** đây là phần mềm *tra cứu quy định và quy trình nghiệp vụ*. Phần mềm **không** tiếp nhận hồ sơ, **không** theo dõi hồ sơ đang giải quyết, **không** kết nối VBDLIS, Hệ thống thông tin giải quyết TTHC tập trung, Cổng dịch vụ công hay cơ quan thuế.

## Nội dung dữ liệu (tính từ dữ liệu thực tế)

| Nội dung | Số lượng | Nguồn |
|---|---|---|
| Thủ tục hành chính, đủ 9 mục nguyên văn | 45 (PL I: 10, PL II: 13, PL III: 22) | Phụ lục I, II, III |
| Bước trình tự tách theo “Bước n” | 186 | mục (1) từng thủ tục |
| Quy trình luân chuyển hồ sơ NVTC (sơ đồ theo cơ quan) | 5 quy trình, 29 bước xử lý | Chương III, Điều 15–18 |
| Điều của Quy định | 24 điều, 5 chương | Văn bản chính |
| Trình tự thu hồi đất, bồi thường, hỗ trợ, TĐC | 6 mục, 43 khoản | Phụ lục IV |
| Mẫu biểu | 45 mẫu | Phụ lục V |
| Vấn đề phát hiện trong văn bản nguồn | 14 vấn đề biên soạn + các vấn đề tự phát hiện | Màn hình *Đối soát dữ liệu* |

## Địa chỉ sử dụng

- Phần mềm: **https://tra-cuu-tthc-dat-dai-son-la.vercel.app**
- Mã nguồn: https://github.com/letunglam1992/tra-cuu-tthc-dat-dai-son-la
- Triển khai: Vercel (dự án `tra-cuu-tthc-dat-dai-son-la`, thư mục gốc `app/`, không có bước build). Mỗi lần đẩy mã lên nhánh `main`, Vercel tự triển khai bản mới.

## Tính năng chính (phiên bản 2.0)

- **Tra cứu thông minh**: gõ có dấu hoặc không dấu, hiểu cách gọi thông dụng (sổ đỏ, lên thổ cư, NVTC, QSDĐ…), sửa lỗi gõ, gõ mã (III.3) hoặc “mẫu 19” để mở nhanh; gợi ý khi không có kết quả.
- **Trang chủ theo tình huống**: 15 nhu cầu thường gặp dẫn thẳng tới thủ tục.
- **Tính thời hạn giải quyết** (tham khảo): ngày hẹn trả, trừ ngày nghỉ lễ, Tết (âm lịch tự tính), cộng thời gian xã khu vực III.
- **Phiếu hướng dẫn chuẩn bị hồ sơ**: in 1 trang A4, có ô đánh dấu và mã QR.
- Tải mẫu biểu Phụ lục V dạng **Word (.docx)** đã ghép đoạn, căn quốc hiệu; in phiếu tra cứu; xuất CSV.
- **Chạy khi mất mạng** sau lần mở đầu, cài như ứng dụng trên máy tính, điện thoại.
- **Chế độ kiểm soát dữ liệu** (đối soát với văn bản nguồn) tách riêng cho người biên soạn: bật tại *Giới thiệu, hướng dẫn* hoặc thêm `?quan-tri=1` vào địa chỉ.

## Chạy phần mềm

Không cần cài đặt, không cần Internet, không có cơ sở dữ liệu hay tài khoản.

**Cách 1 – máy chủ cục bộ (khuyến nghị):**
```bash
npm start
```
(hoặc trên Windows không có Node.js: `powershell -ExecutionPolicy Bypass -File cong-cu/chay-may-chu.ps1`) rồi mở `http://localhost:8686/` bằng Edge/Chrome/Firefox/CốcCốc bản mới.

**Cách 2 – mở trực tiếp:** nhấp đúp `app/index.html`. Mọi chức năng tra cứu hoạt động; một số trình duyệt chặn nạp phông chữ nhúng từ `file://` nên sẽ dùng phông hệ thống thay thế.

## Triển khai

Thư mục `app/` là toàn bộ ứng dụng tĩnh (HTML, CSS, JavaScript, dữ liệu, PDF nguồn, phông chữ). Triển khai bằng cách sao chép `app/` lên bất kỳ máy chủ web tĩnh nào trong mạng nội bộ (IIS, Nginx, Apache, thư mục chia sẻ web của cơ quan):

- Không cần biến môi trường, không cần khóa API, không có dịch vụ trả phí.
- Không có dữ liệu cá nhân; ứng dụng không gửi dữ liệu ra ngoài. Trình duyệt chỉ lưu: giao diện sáng/tối, chế độ kiểm soát dữ liệu, ngày nghỉ nhập thêm ở công cụ tính thời hạn, bộ nhớ đệm ngoại tuyến.
- Trên Vercel, `app/vercel.json` đặt header bảo mật và cache; `app/.vercelignore` loại bộ kiểm thử khỏi bản công khai. Máy chủ khác (IIS, Nginx) nên đặt tương tự và trả `sw.js` với `Cache-Control: no-cache`.
- Khuyến nghị cấu hình máy chủ trả `Content-Type` đúng cho `.woff2` (`font/woff2`) và `.pdf`.

## Cấu trúc thư mục

```
app/                      Ứng dụng (triển khai thư mục này)
  index.html              Trang chính
  kiem-thu.html           Bộ kiểm thử tự động (mở qua máy chủ)
  css/giao-dien.css       Hệ giao diện kế thừa phần mềm GPMB (màu, phông, bố cục)
  du-lieu/nguon.js        Dữ liệu nguyên văn trích từ PDF — TỆP SINH TỰ ĐỘNG, không sửa tay
  du-lieu/bo-sung.js      Dữ liệu biên soạn: thông tin văn bản, quy trình Chương III, cơ quan, vấn đề nguồn
  js/tien-ich.js          Chuẩn hóa tiếng Việt, tô sáng, thoát HTML
  js/mo-hinh.js           Mô hình nghiệp vụ, chỉ mục, kiểm tra dữ liệu, bảng đối soát (không phụ thuộc giao diện)
  js/tim-kiem.js          Tìm kiếm: so khớp có dấu/không dấu, đồng nghĩa, BM25, sửa lỗi gõ
  js/thoi-han.js          Tính thời hạn: ngày làm việc, lễ, Tết (âm lịch), nghỉ bù (không phụ thuộc giao diện)
  js/xuat-word.js         Xuất mẫu Word (.docx): dựng lại đoạn văn từ dòng PDF
  js/thu-vien/            Thư viện mã QR qrcode-generator (MIT)
  js/thanh-phan.js        Thành phần dùng chung: nguyên văn, chip căn cứ, ngăn căn cứ, xuất CSV, in
  js/so-do.js             Sơ đồ luồng công việc dạng làn (swimlane)
  js/man-*.js             Các màn hình
  js/ung-dung.js          Khung ứng dụng, điều hướng
  js/kiem-thu.js          Kịch bản kiểm thử
  sw.js, manifest.webmanifest  Chạy ngoại tuyến, cài như ứng dụng
  vercel.json, .vercelignore   Header bảo mật, cache; loại bộ kiểm thử khỏi bản công khai
  tai-nguyen/             PDF nguồn (qd75.pdf), ảnh bản ký ban hành, phông Be Vietnam Pro (OFL), hình nền, biểu tượng
cong-cu/
  trich-pdf/              Công cụ .NET trích xuất PDF theo cấu trúc bảng (PdfPig)
  cap-nhat-du-lieu.ps1    Tái tạo app/du-lieu/nguon.js từ PDF
  chay-may-chu.ps1        Máy chủ tĩnh cục bộ
  chay-kiem-thu.ps1       Chạy kiểm thử tự động, ghi tệp kết quả vào tai-lieu/
  chup-man-hinh.ps1       Chụp ảnh các màn hình (kiểm thử giao diện)
kiem-thu/                 Kiểm thử Node (*.test.js), Playwright (giao-dien.js), máy chủ tĩnh (may-chu.js)
.github/workflows/        GitHub Actions chạy kiểm thử
tai-lieu/                 Tài liệu bàn giao, bảng đối soát, kết quả kiểm thử, ảnh màn hình
```

## Kiểm thử

```bash
npm test
```

```bash
npm install && npx playwright install chromium && npm run test:ui
```

Kết quả hiện tại: **42/42** kiểm thử dòng lệnh và **77/77** kiểm thử giao diện (71 trong trình duyệt + điện thoại, ngoại tuyến, in ấn) — xem `tai-lieu/ket-qua-kiem-thu.csv`. GitHub Actions chạy cả hai mỗi lần đẩy mã. Trên Windows vẫn dùng được `cong-cu/chay-kiem-thu.ps1` (mở thử tệp Word bằng Microsoft Word).

## Tài liệu

- `tai-lieu/01-phan-tich-nghiep-vu.md` — khảo sát tài liệu nguồn, mô hình dữ liệu, phương pháp trích xuất, phát hiện, rủi ro.
- `tai-lieu/02-huong-dan-cap-nhat-du-lieu.md` — cập nhật khi văn bản sửa đổi, bổ sung, thay thế.
- `tai-lieu/03-nghiem-thu.md` — bảng nghiệm thu, tự đánh giá, giới hạn, điều kiện đưa vào sử dụng.
- `tai-lieu/bang-doi-soat.csv`, `danh-muc-thu-tuc.csv`, `van-de-van-ban-nguon.csv`, `ket-qua-kiem-thu.csv` — mở bằng Excel.
