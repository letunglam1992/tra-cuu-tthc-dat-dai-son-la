# Nhật ký thay đổi

## 2.0.0 — 29/10/2026

### Văn bản nguồn, hiệu lực
- Đối chiếu bản ký ban hành (ảnh trang 1 và Điều 2 do người dùng cung cấp): **Quyết định số 75/2026/QĐ-UBND ngày 22/10/2026**, có hiệu lực thi hành **kể từ ngày 22/10/2026** (khoản 1 Điều 2). Ảnh bản ký lưu tại `app/tai-nguyen/ban-ky/`, hiển thị ở màn hình Căn cứ pháp lý.
- Chỗ trống ngày hiệu lực trong tệp PDF được điền theo bản ký và đánh dấu “Điền theo bản ký” tại Điều 2 Quyết định.
- Ghi nhận văn bản hết hiệu lực theo khoản 2 Điều 2: Quyết định số 45/2021/QĐ-UBND; Điều 6, Điều 7 Phụ lục III và Phụ lục IV kèm Quyết định số 106/2025/QĐ-UBND.
- Tình trạng hiệu lực tự tính theo ngày hiệu lực. Vấn đề nguồn VD01, VD02 chuyển sang “đã xử lý”.

### Tra cứu
- Tìm kiếm viết lại: gõ có dấu thì so khớp đúng dấu (“sổ” không khớp “số”), không có kết quả mới nới sang không dấu; hiểu cách gọi thông dụng và viết tắt (sổ đỏ, GCN, QSDĐ, NVTC, lên thổ cư, chi cục thuế…); sửa lỗi gõ và từ viết liền; xếp hạng BM25 theo trường, thưởng cụm liền nhau; nhận mã thủ tục (III.3), mẫu (“mẫu 19”), cụm số ngày (“15 ngày làm việc” khớp “15 (mười lăm) ngày làm việc”); khi không có kết quả, gợi ý bỏ từ kèm số kết quả thật. Màn hình ghi rõ “Đã hiểu là…”.
- Trang chủ mới: ô tìm kiếm lớn, 15 tình huống thường gặp dẫn thẳng tới thủ tục, lối vào công cụ.

### Công cụ mới
- **Tính thời hạn giải quyết** (tham khảo): ngày hẹn trả từ ngày nhận hồ sơ hợp lệ; trừ thứ Bảy, Chủ nhật, ngày lễ, Tết (âm lịch tính tự động), nghỉ bù; cộng thời gian xã khu vực III (nhận diện từ mục 3); cộng thời gian không tính vào thời hạn (khoản 1 Điều 8); thời hạn bằng “ngày” lịch; nhập thêm ngày nghỉ.
- **Phiếu hướng dẫn chuẩn bị hồ sơ**: danh mục giấy tờ có ô đánh dấu, thời hạn, nơi nộp, phí, mẫu đơn, mã QR; in 1 trang A4.
- Trang thủ tục có nút Phiếu hướng dẫn, Tính ngày hẹn trả, Nộp trực tuyến (Cổng Dịch vụ công quốc gia).

### Giao diện
- Tách **chế độ kiểm soát dữ liệu** (đối soát, vấn đề nguồn, mức độ hoàn thiện) khỏi giao diện người tra cứu; bật tại Giới thiệu hoặc `?quan-tri=1`.
- Điện thoại: bỏ chân trang cố định; bộ lọc thủ tục thu gọn sau nút “Bộ lọc”; quy trình NVTC hiện dạng danh sách bước (có thể chuyển sang sơ đồ); thanh chọn quy trình cuộn ngang; menu trượt có lớp phủ, đóng bằng chạm ngoài hoặc Esc.
- Tiếp cận: liên kết “Bỏ qua menu”; đạt độ tương phản WCAG AA ở cả giao diện sáng và tối; vùng bấm liên kết trong bảng ≥ 24 px; sơ đồ khai báo đúng vai trò.
- Tiêu đề tab trình duyệt rút gọn; mã quy trình sai báo “không tìm thấy”; bản in không còn bỏ trống nửa trang đầu.

### Xuất Word
- Dựng lại đoạn văn từ dòng PDF (ghép dòng bị ngắt, nối dòng chấm điền), khôi phục “m²”, quốc hiệu – tiêu ngữ căn giữa, chú thích cuối mẫu, dòng ngày tháng căn phải.

### Triển khai, vận hành
- Chạy khi mất mạng (PWA, Service Worker) và cài như ứng dụng (manifest, biểu tượng).
- `app/vercel.json`: header bảo mật (CSP, nosniff, Referrer-Policy, Permissions-Policy), cache dài cho phông chữ; `app/.vercelignore` không đưa bộ kiểm thử lên bản công khai.
- Kiểm thử chạy được trên mọi hệ điều hành: `npm test` (Node, 42 kiểm thử) và `npm run test:ui` (Playwright: 71 kiểm thử trong trình duyệt + điện thoại, ngoại tuyến, in ấn); GitHub Actions chạy mỗi lần đẩy mã.

## 1.1.0 — 29/10/2026
- Tải mẫu biểu Phụ lục V dạng Word; nút Quay lại / Màn hình chính; hộp Giới thiệu, bản quyền.

## 1.0.0 — 29/10/2026
- Phiên bản đầu: 45 thủ tục, 5 quy trình luân chuyển NVTC, Phụ lục IV, 45 mẫu biểu, căn cứ pháp lý, đối soát dữ liệu.
