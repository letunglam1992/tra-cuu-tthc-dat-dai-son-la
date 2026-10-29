# Kết quả kiểm thử, nghiệm thu và bàn giao (Giai đoạn 5)

Ngày chạy: 29/10/2026 · Dữ liệu v1.0.0 · Tệp nguồn SHA-256 `692fcc23…f6e840` · Môi trường: Windows 11, Microsoft Edge (Chromium) chế độ không giao diện, máy chủ tĩnh cục bộ.

## 1. Kiểm thử tự động — 47/47 đạt

Chạy lại bằng `cong-cu/chay-kiem-thu.ps1` (hoặc mở `http://localhost:8686/kiem-thu.html`). Bản CSV: `ket-qua-kiem-thu.csv`.
| Mã kiểm thử | Nội dung | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Ghi chú |
|---|---|---|---|---|---|
| DL-01 | Số thủ tục theo phụ lục | PL I: 10, PL II: 13, PL III: 22 (tổng 45) | I: 10, II: 13, III: 22 (45) | **Đạt** | Đối chiếu danh mục mục A các phụ lục, tr.15, 42–43, 74–76 |
| DL-02 | Danh mục (mục A) khớp số lượng nội dung (mục B) từng phụ lục | Khớp cả 3 phụ lục | 10/10; 13/13; 22/22 | **Đạt** |  |
| DL-03 | Mỗi thủ tục trích đủ 9 mục (theo nhãn bảng) | 45/45 | 45/45 | **Đạt** |  |
| DL-04 | Mục để trống trong văn bản được ghi nhận, không tự điền | Chỉ III.13 mục (9) trống; có trong vấn đề nguồn | III.13(9) — đã ghi nhận | **Đạt** | Đã đối chiếu cấu trúc bảng trang 117 PDF |
| DL-05 | Mã thủ tục không trùng | 45 mã duy nhất | 45 mã | **Đạt** |  |
| DL-06 | Quy định: số điều và tên điều trọng tâm | 24 điều; Điều 15–18 thuộc Chương III | 24 điều | **Đạt** |  |
| DL-07 | Số khoản Điều 15, 16, 17, 18 | 6, 5, 4, 4 | 6, 5, 4, 4 | **Đạt** |  |
| DL-08 | Phụ lục IV: số mục và số khoản mỗi mục | 6 mục: 7, 5, 4, 16, 9, 2 khoản | 6 mục: 7, 5, 4, 16, 9, 2 | **Đạt** |  |
| DL-09 | Phụ lục V: số mẫu có nội dung; Mẫu 19 được ghi nhận thiếu trong danh mục | 45 mẫu; Mẫu 19 có cảnh báo | 45 mẫu; Mẫu 19 trong danh mục: false | **Đạt** |  |
| DL-10 | Mọi “Mẫu số …” viện dẫn trong thủ tục đều có trong Phụ lục V | 0 viện dẫn không tìm thấy | 0 | **Đạt** |  |
| DL-11 | Thời hạn giữ đúng đơn vị văn bản | I.1 = 15 ngày làm việc; I.5 = 30 ngày; II.11 = 35 ngày | 15 ngày làm việc; 30 ngày; 35 ngày | **Đạt** | Đối chiếu nguyên văn mục (3) tr.18, 29, 68 |
| DL-12 | Thủ tục ghi thời hạn bằng “ngày” được nêu là vấn đề cần xác minh | I.5, II.2, II.4, II.11 | I.5, II.2, II.4, II.11 | **Đạt** |  |
| DL-13 | Đánh số bước giữ nguyên theo văn bản (III.14 không có Bước 3) | III.14: 1, 2, 4, 5 và được ghi nhận | 1, 2, 4, 5 | **Đạt** |  |
| DL-14 | Đối chiếu nội dung mẫu: I.1 mục (5) nêu Chủ tịch UBND tỉnh có thẩm quyền | Chứa “Cơ quan có thẩm quyền quyết định: Chủ tịch Ủy ban nhân dân tỉnh” | - Cơ quan có thẩm quyền quyết định: Chủ tịch Ủy ban nhân dân tỉnh. | **Đạt** | tr.18 |
| DL-15 | Đối chiếu nội dung: Điều 5 khoản 3 (VBDLIS), Điều 8 khoản 3 (lấy ý kiến 03 ngày làm việc) | Có cả hai nội dung | VBDLIS: true; 03 ngày: true | **Đạt** |  |
| DL-16 | Phân biệt nội dung pháp lý và chỉ mục suy ra | Chỉ mục nằm trong trường suyRa, không ghi đè nguyên văn | thoiHan, mau, mauKhongTimThay, mauNgoai, coQuan, giayTo, soLuongHoSo, coNghiaVuTaiChinh | **Đạt** |  |
| QT-01 | Số quy trình được mô hình hóa | 5 (Điều 15, Điều 15 khoản 6, Điều 16, 17, 18) | QT15, QT15-6, QT16, QT17, QT18 | **Đạt** |  |
| QT-02 | Mọi đoạn nguyên văn của các bước khớp đúng khoản, điều được dẫn | 100% khớp | 35/35 đoạn nguyên văn trong quy trình Chương III khớp với văn bản trích xuất. | **Đạt** |  |
| QT-03 | Toàn vẹn sơ đồ: cạnh trỏ tới bước có thật, mọi bước có luồng vào/ra, làn khai báo | 0 lỗi | 0 lỗi | **Đạt** |  |
| QT-04 | Thời hạn từng bước theo văn bản (Điều 15) | Chuyển Phiếu 2; thuế 3; từ chối 2; thu NSNN 1 ngày làm việc | 2, 3, 2, 1 | **Đạt** |  |
| QT-05 | Bước văn bản không nêu thời hạn không bị gán số ngày | QT15/b8, QT16/b6 (thuế chuyển thông tin thu nộp) không có số ngày | null, null | **Đạt** |  |
| QT-06 | Nhánh ngoại lệ (từ chối/trả lại) được thể hiện | Mỗi quy trình Điều 15, 16, 17, 18 có cạnh trả lại | true, true, true, true | **Đạt** |  |
| QT-07 | Mọi căn cứ trích dẫn trong dữ liệu biên soạn giải được | 0 căn cứ hỏng | 0 | **Đạt** |  |
| TI-01 | Chuẩn hóa tiếng Việt bỏ dấu, chữ thường, gộp khoảng trắng | “  Đăng   KÝ Đất ” → “dang ky dat” | dang ky dat | **Đạt** |  |
| TI-02 | Chuẩn hóa ký hiệu mẫu | 04a → 4a; 4b → 4b; 19 → 19 | 4a,4b,19 | **Đạt** |  |
| TI-03 | Thoát ký tự HTML trong nội dung | <b>&" → &lt;b&gt;&amp;&quot; | &lt;b&gt;&amp;&quot; | **Đạt** |  |
| TI-04 | Tô sáng giữ nguyên văn gốc | “Tách thửa” tô sáng khi tìm “tach thua” | <mark>Tách thửa</mark> đất | **Đạt** |  |
| TI-05 | Khớp đầu từ, không khớp giữa từ | “an” không khớp “toàn”; khớp “an ninh” | false / true | **Đạt** |  |
| TI-06 | Nhận diện thời hạn phân số | “không quá 1/2 ngày làm việc” → 0,5 ngày làm việc | 0,5 ngày làm việc | **Đạt** |  |
| TK-01 | Tìm không dấu | “tach thua” → III.3 đứng đầu | III.3, III.10, III.11 | **Đạt** |  |
| TK-02 | Có dấu và không dấu cho cùng kết quả | “tách thửa” = “tach thua” | Giống nhau | **Đạt** |  |
| TK-03 | Khoảng trắng thừa và chữ hoa không ảnh hưởng | “  TÁCH   thửa ” = “tách thửa” | Giống nhau | **Đạt** |  |
| TK-04 | Không có kết quả giả | “xyzkhongco” → 0 kết quả | 0 | **Đạt** |  |
| TK-05 | Tìm cụm chính xác trong ngoặc kép | “"phiếu chuyển thông tin"” có Mẫu số 19 | 19, 25 | **Đạt** |  |
| TK-06 | Tìm theo tên cơ quan | “Kho bạc” → cơ quan KBNN | kbnn | **Đạt** |  |
| TK-07 | Mọi kết quả chứa đủ các từ khóa | 100% kết quả “giấy chứng nhận đính chính” chứa đủ 2 cụm từ | 70 kết quả | **Đạt** |  |
| TK-08 | Tìm theo thời hạn | “15 ngày làm việc” có I.1 | 17 thủ tục | **Đạt** |  |
| UI-01 | Mở các màn hình chính, mọi tab | 30/30 màn hình hiển thị đúng tiêu đề, không lỗi | 30/30 | **Đạt** |  |
| UI-02 | Trạng thái không tìm thấy (đường dẫn, mã thủ tục, mẫu sai) | Hiển thị thông báo rõ ràng, không lỗi | Không có trang “khong-ton-tai”. \| Không có thủ tục mã “IX.99”. \| Không có Mẫu số “99” trong Phụ lục V. | **Đạt** |  |
| UI-03 | Tra cứu không có kết quả | Thông báo không tìm thấy, không có kết quả giả | Không tìm thấy kết quả cho “xyzkhongco”. | **Đạt** |  |
| UI-04 | Lọc thủ tục theo phụ lục và thời hạn | 3 dòng (PL III, ≤ 5 ngày) | 3 dòng | **Đạt** |  |
| UI-05 | Duyệt toàn bộ liên kết nội bộ (thủ tục, mẫu, điều, cơ quan, quy trình…) | 0 liên kết dẫn tới trang lỗi/không tìm thấy; duyệt hết hàng đợi | 927 trang đã mở, 22539 lượt liên kết, 0 hỏng, còn 0 chưa mở | **Đạt** |  |
| UI-06 | Chip căn cứ pháp lý mở được nguyên văn | 100% giải được | 1892/1892 | **Đạt** |  |
| UI-07 | Liên kết trang PDF gốc nằm trong phạm vi tệp | Trang 1–225 | 1151/1151 hợp lệ | **Đạt** |  |
| UI-08 | Mở căn cứ tại chỗ (ngăn bên) và đóng bằng Esc | Mở có tiêu đề căn cứ; Esc đóng | Phụ lục I, mục B, thủ tục 1, mục (1) / đóng: true | **Đạt** |  |
| UI-09 | Sơ đồ Điều 17: đủ nút, cạnh; bấm nút hiển thị chi tiết bước | 6 nút, 6 cạnh; chi tiết bước n3 | 6 nút, 6 cạnh; Rà soát, xác nhận số tiền được trừ; gửi cơ quan thuế Diễn gi | **Đạt** |  |
| UI-10 | Không phát sinh lỗi JavaScript khi duyệt | 0 lỗi | 0 lỗi | **Đạt** |  |

Ghi chú về độ tin cậy của kiểm thử giao diện: trong quá trình làm, bộ kiểm thử từng báo “0 liên kết hỏng” do đọc DOM trước khi màn hình kịp vẽ lại. Lỗi này của bộ kiểm thử đã được sửa (ứng dụng phát bộ đếm lần vẽ, bộ kiểm thử chờ đúng lần vẽ mới và giãn nhịp điều hướng để tránh cơ chế chặn quá 200 lần đổi địa chỉ/10 giây của trình duyệt). Kết quả trên là lần chạy sau khi sửa.

## 2. Kiểm thử giao diện bằng ảnh chụp (đã xem trực tiếp)

Ảnh tại `tai-lieu/anh/` (chụp bằng `cong-cu/chup-man-hinh.ps1`).

| Mã | Nội dung | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| GD-01 | Tổng quan 1440×900 (01) | Số liệu tính từ dữ liệu, cảnh báo hiệu lực, không vỡ bố cục | Đúng | Đạt |
| GD-02 | Danh mục thủ tục, bộ lọc (02, 03) | Bảng đọc được, cột thời hạn có đơn vị, lọc đúng | Đúng | Đạt |
| GD-03 | Chi tiết thủ tục, mục lục, tab (04, 05, 06) | 9 mục nguyên văn, nhãn nguồn, liên kết mẫu | Đúng | Đạt |
| GD-04 | Sơ đồ quy trình Điều 15, 18 (07, 08) | Chữ đọc được, nhánh từ chối không đè nhãn | Đúng sau khi sửa bố cục (ban đầu sơ đồ quá nhỏ, nhãn chồng giữa hai làn kề nhau — đã sửa) | Đạt |
| GD-05 | Phụ lục IV, mẫu biểu, cơ quan, căn cứ, tra cứu, đối soát (09–15) | Hiển thị đủ, không tràn | Đúng | Đạt |
| GD-06 | Mục để trống III.13 (16) | Cảnh báo “để trống trong văn bản nguồn”, không tự điền | Đúng | Đạt |
| GD-07 | Điện thoại 375–390px (20–23) | Không tràn ngang, menu thu gọn, sơ đồ kéo được | Đúng sau khi sửa (ban đầu nhãn dài gây tràn 2px; nút menu hiện trên máy tính — đã sửa) | Đạt |
| GD-08 | Giao diện tối (30) | Tương phản đủ, sơ đồ đọc được | Đúng | Đạt |
| GD-09 | Ô tìm kiếm đầu trang | Chữ gợi ý hiển thị trên nền xanh | Đúng sau khi sửa (ban đầu nền trắng che chữ) | Đạt |

## 3. Nội dung chưa kiểm tra được trong môi trường hiện tại

| Mã | Nội dung | Lý do | Cách kiểm tra |
|---|---|---|---|
| CK-01 | In thực tế ra giấy (phiếu tra cứu, quy trình) | Không có máy in; đã kiểm tra mã CSS in (ẩn điều hướng, đầu trang in có nguồn và ngày in) nhưng chưa xem bản in | Mở màn hình, Ctrl+P, xem bản xem trước |
| CK-02 | Firefox, Safari, thiết bị di động thật | Chỉ có Edge (Chromium) trên máy | Mở trên các trình duyệt đích |
| CK-03 | Mở trực tiếp `index.html` (file://) | Không chụp được trong môi trường kiểm thử; một số trình duyệt chặn phông nhúng qua file:// | Nhấp đúp `app/index.html` |
| CK-04 | Triển khai trên máy chủ nội bộ của cơ quan (IIS/Nginx) | Không có quyền truy cập hạ tầng | Sao chép `app/`, mở qua địa chỉ nội bộ |
| CK-05 | Mở liên kết “trang PDF” đúng trang trong mọi trình duyệt | Đã kiểm tra số trang hợp lệ (1–225); việc nhảy đúng trang phụ thuộc trình đọc PDF của trình duyệt | Bấm “Mở trang PDF” trên trình duyệt đích |
| CK-06 | Tính đúng đắn pháp lý của nội dung so với bản ký ban hành chính thức | Tệp PDF chưa có số, ngày; không có bản chính thức để đối chiếu | Cán bộ chuyên môn đối chiếu bảng `bang-doi-soat.csv` với bản chính thức |
| CK-07 | Xuất CSV/JSON tải xuống trên trình duyệt người dùng | Chạy trong khung kiểm thử không lưu tệp; mã xuất được dùng chung với công cụ dòng lệnh đã sinh các CSV trong thư mục này | Bấm nút “Xuất CSV” trên từng màn hình |

## 4. Bảng đối soát dữ liệu với văn bản nguồn

`bang-doi-soat.csv` — 163 dòng: Quyết định (3 điều), Quy định (24 điều), 45 thủ tục, 6 mục Phụ lục IV, 45 mẫu, 40 nút quy trình Chương III. Kết quả: **143 Đạt, 20 Cần xác minh, 0 Lỗi**. Các dòng “Cần xác minh” xuất phát từ văn bản nguồn (tên mục A/B khác nhau, ô để trống, đánh số bước, Mẫu 19 thiếu trong danh mục, bước có thời hạn không rõ mốc) — chi tiết trong `van-de-van-ban-nguon.csv` (27 vấn đề).

## 5. Tự đánh giá theo 9 tiêu chí

| Tiêu chí | Đánh giá | Căn cứ |
|---|---|---|
| Accuracy | Tốt trong phạm vi tài liệu | Nguyên văn trích theo cấu trúc bảng thật; 35/35 đoạn nguyên văn quy trình khớp; giữ đơn vị “ngày”/“ngày làm việc”; không gán thời hạn khi văn bản không nêu. Chưa đối chiếu được với bản ký chính thức (CK-06). |
| Completeness | Đủ | 45/45 thủ tục × 9 mục, 24/24 điều, 6/6 mục PL IV, 45/45 mẫu, Điều 15–18 đủ khoản. |
| Clarity | Tốt | Tách bước, danh mục giấy tờ, tóm tắt 4 ô, nhãn Nguyên văn/Diễn giải/Phần mềm lập/Chưa xác minh. |
| Hierarchy | Tốt | Thủ tục → tab → mục; quy trình → sơ đồ → chi tiết bước → nguyên văn. |
| Consistency | Tốt | Một bộ giải căn cứ dùng chung; mã thủ tục, ký hiệu mẫu chuẩn hóa thống nhất. |
| Usability | Tốt | Tìm có dấu/không dấu (phím /), lọc, mở căn cứ tại chỗ, liên kết trang PDF, in, xuất CSV. |
| Accessibility | Khá | Đáp ứng 375px–1440px, sáng/tối, điều hướng bàn phím trên sơ đồ, nhãn aria; chưa kiểm định bằng công cụ trợ năng chuyên dụng. |
| Performance | Tốt | Toàn bộ dữ liệu ~0,8 MB nạp một lần, không cần mạng; 927 màn hình được duyệt trong kiểm thử không lỗi. |
| Maintainability | Tốt | Dữ liệu tách khỏi giao diện; tái tạo dữ liệu bằng một lệnh; bộ kiểm thử phát hiện nguyên văn lệch khi văn bản thay đổi. |

## 6. Giới hạn và vấn đề cần xử lý bổ sung

1. **Tệp PDF nguồn chưa ghi số, ngày ban hành, ngày hiệu lực.** Người dùng đã xác nhận (29/10/2026) Quyết định 75/2026/QĐ-UBND ngày 22/10/2026 có hiệu lực; dữ liệu v1.1.0 đã cập nhật tình trạng này. Nên thay tệp nguồn bằng bản đã ký ban hành và chạy lại cập nhật dữ liệu để đối chiếu nội dung.
2. **27 vấn đề trong văn bản nguồn** cần cơ quan soạn thảo (Sở Nông nghiệp và Môi trường) xác minh — xem `van-de-van-ban-nguon.csv`.
3. **Mẫu biểu**: phần mềm chỉ hiển thị nội dung trích xuất và mở trang PDF gốc; không có tệp Word mẫu chính thức. Các mẫu thuộc Thông tư 89/2026/TT-BTC, Thông tư 03/2025/TT-VPCP, Nghị định 103/2024/NĐ-CP không có trong tài liệu.
4. **Văn bản được viện dẫn** (Luật Đất đai, NĐ 101/102/103/2024, NQ 254/2025/QH15…): chỉ nhận diện tên, chưa xác minh hiệu lực, không có toàn văn.
5. **Chỉ mục do phần mềm lập** (cơ quan theo bước, số ngày nêu đầu tiên, danh mục giấy tờ) dựa trên quy tắc nhận diện, có thể bỏ sót trường hợp diễn đạt khác thường — luôn có nguyên văn đi kèm.
6. **Không có chức năng sửa dữ liệu trên giao diện** (cần phân quyền, xác thực, lưu trữ máy chủ — chưa được yêu cầu).
7. **Không quản lý hồ sơ thực tế**, không tích hợp VBDLIS, Hệ thống giải quyết TTHC tập trung, Cổng dịch vụ công, cơ quan thuế.
8. Phần mềm GPMB chỉ được dùng làm tham chiếu thiết kế (đọc mã nguồn công khai); không sửa kho mã GPMB.

## 7. Điều kiện đưa vào sử dụng

- Thay `app/tai-nguyen/qd75.pdf` bằng bản đã ký ban hành, chạy `cap-nhat-du-lieu.ps1`, cập nhật thông tin văn bản trong `bo-sung.js`, chạy kiểm thử đạt 100%.
- Cán bộ chuyên môn rà soát bảng đối soát và danh sách vấn đề nguồn, ghi nhận kết quả xác minh vào `bo-sung.js`.
- Đặt thư mục `app/` lên máy chủ web nội bộ; thông báo người dùng đây là công cụ tra cứu, không thay thế văn bản gốc.