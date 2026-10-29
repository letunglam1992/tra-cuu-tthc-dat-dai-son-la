# Tra cứu thủ tục hành chính đất đai – tỉnh Sơn La

Phần mềm tra cứu trình tự, thủ tục hành chính về đất đai và quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính (NVTC) về đất đai, xây dựng từ toàn văn **Quyết định số 75/2026/QĐ-UBND** của UBND tỉnh Sơn La và Phụ lục I–V kèm theo.

> **Lưu ý về văn bản nguồn.** Tệp PDF được cung cấp để trống số, ngày ban hành và ngày có hiệu lực (“Số: /2026/QĐ-UBND”, “ngày tháng năm”). Số hiệu 75/2026/QĐ-UBND ngày 22/10/2026 được hiển thị theo thông tin người dùng cung cấp. Tình trạng hiệu lực: **có hiệu lực** (người dùng xác nhận ngày 29/10/2026; ngày có hiệu lực cụ thể chưa ghi nhận). Dữ liệu phiên bản 1.1.0.

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

## Tính năng bổ sung (phiên bản 1.1)

- Tải mẫu biểu Phụ lục V dạng **Word (.docx)** — khổ A4, Times New Roman 13, ghi rõ nguồn trang PDF (tạo ngay trong trình duyệt, không cần máy chủ).
- Nút **Quay lại** / **Màn hình chính** trên mọi màn hình.
- Hộp **Giới thiệu, bản quyền**: © 2026 Lê Tùng Lâm – Sở Nông nghiệp và Môi trường tỉnh Sơn La.

## Chạy phần mềm

Không cần cài đặt, không cần Internet, không có cơ sở dữ liệu hay tài khoản.

**Cách 1 – máy chủ cục bộ (khuyến nghị):**
```bash
powershell -ExecutionPolicy Bypass -File cong-cu/chay-may-chu.ps1
```
rồi mở `http://localhost:8686/` bằng Edge/Chrome/Firefox/CốcCốc bản mới.

**Cách 2 – mở trực tiếp:** nhấp đúp `app/index.html`. Mọi chức năng tra cứu hoạt động; một số trình duyệt chặn nạp phông chữ nhúng từ `file://` nên sẽ dùng phông hệ thống thay thế.

## Triển khai

Thư mục `app/` là toàn bộ ứng dụng tĩnh (HTML, CSS, JavaScript, dữ liệu, PDF nguồn, phông chữ). Triển khai bằng cách sao chép `app/` lên bất kỳ máy chủ web tĩnh nào trong mạng nội bộ (IIS, Nginx, Apache, thư mục chia sẻ web của cơ quan):

- Không cần biến môi trường, không cần khóa API, không có dịch vụ trả phí.
- Không có dữ liệu cá nhân; ứng dụng không gửi dữ liệu ra ngoài. Chỉ lưu lựa chọn giao diện sáng/tối trong trình duyệt.
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
  js/tim-kiem.js          Tìm kiếm toàn văn có dấu/không dấu
  js/thanh-phan.js        Thành phần dùng chung: nguyên văn, chip căn cứ, ngăn căn cứ, xuất CSV, in
  js/so-do.js             Sơ đồ luồng công việc dạng làn (swimlane)
  js/man-*.js             Các màn hình
  js/ung-dung.js          Khung ứng dụng, điều hướng
  js/kiem-thu.js          Kịch bản kiểm thử
  tai-nguyen/             PDF nguồn (qd75.pdf), phông Be Vietnam Pro (OFL), hình nền
cong-cu/
  trich-pdf/              Công cụ .NET trích xuất PDF theo cấu trúc bảng (PdfPig)
  cap-nhat-du-lieu.ps1    Tái tạo app/du-lieu/nguon.js từ PDF
  chay-may-chu.ps1        Máy chủ tĩnh cục bộ
  chay-kiem-thu.ps1       Chạy kiểm thử tự động, ghi tệp kết quả vào tai-lieu/
  chup-man-hinh.ps1       Chụp ảnh các màn hình (kiểm thử giao diện)
tai-lieu/                 Tài liệu bàn giao, bảng đối soát, kết quả kiểm thử, ảnh màn hình
```

## Kiểm thử

```bash
powershell -ExecutionPolicy Bypass -File cong-cu/chay-kiem-thu.ps1
```
(cần máy chủ đang chạy). Hoặc mở `http://localhost:8686/kiem-thu.html`. Kết quả hiện tại: **52/52 đạt** (gồm mở thử tệp Word bằng Microsoft Word) — xem `tai-lieu/03-nghiem-thu.md`.

## Tài liệu

- `tai-lieu/01-phan-tich-nghiep-vu.md` — khảo sát tài liệu nguồn, mô hình dữ liệu, phương pháp trích xuất, phát hiện, rủi ro.
- `tai-lieu/02-huong-dan-cap-nhat-du-lieu.md` — cập nhật khi văn bản sửa đổi, bổ sung, thay thế.
- `tai-lieu/03-nghiem-thu.md` — bảng nghiệm thu, tự đánh giá, giới hạn, điều kiện đưa vào sử dụng.
- `tai-lieu/bang-doi-soat.csv`, `danh-muc-thu-tuc.csv`, `van-de-van-ban-nguon.csv`, `ket-qua-kiem-thu.csv` — mở bằng Excel.
