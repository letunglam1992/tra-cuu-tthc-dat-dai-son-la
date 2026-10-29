# Nhật ký thay đổi

## 2.1.0 — 29/10/2026

### Dữ liệu pháp lý
- **Mã TTHC quốc gia** theo danh mục TTHC lĩnh vực đất đai công bố (tệp ngày 21/8/2025): 39 thủ tục khớp (2 cặp dùng chung mã: I.9/III.17, I.10/III.21), 3 mã gợi ý cần xác minh (I.6, III.5, II.8), 4 thủ tục chưa có mã. Hiển thị tại trang thủ tục (nút sao chép), danh mục, phiếu hướng dẫn; tìm được theo mã (vd. 1.012784); tab đối soát “Mã TTHC”.
- **Tình trạng hiệu lực văn bản viện dẫn** lấy từ phần căn cứ ban hành Quyết định (33 văn bản có hiệu lực tại 22/10/2026, kèm văn bản sửa đổi, bổ sung), khoản 2 Điều 2 (Quyết định 45/2021 hết hiệu lực; Quyết định 106/2025 hết hiệu lực một phần) và căn cứ Nghị quyết 155/2025 (Luật Phí và lệ phí). Văn bản không có nguồn xác minh giữ “chưa xác minh”. Phát hiện ký hiệu “Nghị quyết số 254/2025/NQ-QH” không thống nhất.
- **Phí, lệ phí đất đai** theo Nghị quyết số 155/2025/NQ-HĐND ngày 29/12/2025 (hiệu lực 08/01/2026): phí thẩm định hồ sơ cấp GCN, lệ phí cấp GCN, phí khai thác tài liệu đất đai, phí giao dịch bảo đảm — hiển thị tại mục (7) từng thủ tục và trang “Phí, lệ phí”. Ghi nhận cột phí của danh mục công bố tính theo Nghị quyết 135/2020 (đã hết hiệu lực) và lỗi “28.000.000 đồng” ở mã 1.013947.

### Công cụ mới
- **Ước tính nghĩa vụ tài chính** (tham khảo): tiền sử dụng đất (giao đất, chuyển mục đích), tiền thuê đất (hằng năm, một lần), lệ phí trước bạ, thuế TNCN; phí thẩm định và lệ phí cấp GCN theo Nghị quyết 155/2025; công thức, căn cứ, số tiền bằng chữ; nhập bảng giá đất từ Excel/CSV và tra giá.
- **Điền mẫu đơn → Word**: 45 mẫu Phụ lục V, ô điền nhận diện từ dòng chấm, bản nháp lưu trên máy, tệp Word đã điền.
- **Báo cáo tổng hợp TTHC**: theo cấp, theo cơ quan có thẩm quyền, danh mục chi tiết (thời hạn, mã TTHC, NVTC); xuất Word đúng thể thức (phần đầu hai cột, nơi nhận, chữ ký) và CSV.
- **Sổ theo dõi hạn hồ sơ** (dùng cá nhân): tính hạn trả, cảnh báo sắp đến hạn/quá hạn, xuất Excel (.xlsx), sao lưu/khôi phục JSON; dữ liệu chỉ lưu trên máy.
- **Hỏi đáp (trợ lý AI)**: tìm đoạn nguyên văn liên quan ngay trên máy; Cloudflare Worker trung gian (`tro-ly-ai/`) gọi Google Gemini, dự phòng Cloudflare Workers AI; câu trả lời chỉ dựa trên đoạn trích, dẫn nguồn [n]. Khóa API nằm ở máy chủ.

### Vận hành
- Xác minh GitHub Actions chạy đạt; xóa nhánh `nang-cap-v2`.
- Gắn Vercel Web Analytics (ẩn danh, chỉ nạp trên Vercel; bật tại bảng điều khiển dự án).
- `cong-cu/cap-nhat-du-lieu.js`: cập nhật dữ liệu từ PDF trên mọi hệ điều hành (`npm run cap-nhat-du-lieu`).
- Kiểm thử: 54 kiểm thử dòng lệnh (gồm Worker giả lập), 82 kiểm thử giao diện.

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
