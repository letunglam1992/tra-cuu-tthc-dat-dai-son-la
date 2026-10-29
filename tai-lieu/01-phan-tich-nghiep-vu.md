# Phân tích nghiệp vụ và chuẩn hóa dữ liệu (Giai đoạn 1–2)

## 1. Khả năng đọc tài liệu nguồn

| Hạng mục | Kết quả |
|---|---|
| Tệp | `QD 75-2026 QUY DINH TRINH TU THU TUC HANH CHINH DAT DAI.pdf.pdf`, 225 trang, 2,1 MB |
| Loại PDF | PDF văn bản (tạo từ Word qua Aspose.Words), có lớp chữ — không phải ảnh quét, không cần OCR |
| SHA-256 | `692fcc23ee9099c630288daed934934c6b9eed1b1bc7e40588a8e5bd95f6e840` |
| Đọc đầy đủ | Có. Quyết định (tr.1–2), Quy định 24 điều (tr.3–14), Phụ lục I (tr.15–41), II (tr.42–73), III (tr.74–136), IV (tr.137–146), V (tr.147–225) |
| Trang thiếu / không trích được | Không phát hiện. Mọi thủ tục trích đủ 9 nhãn mục; 1 ô nội dung để trống thực sự trong văn bản (III.13 mục 9, tr.117) |

## 2. Phương pháp trích xuất (không suy đoán nội dung)

1. **Trích chữ theo tọa độ** bằng thư viện PdfPig (.NET): mỗi dòng giữ trang, tọa độ trái/phải.
2. **Nhận diện bảng bằng đường kẻ thật của PDF**: các thủ tục ở Phụ lục I–III là bảng 2 cột (nhãn (1)–(9) | nội dung). Bộ phân tích lấy đường kẻ ngang/dọc trong PDF để xác định từng ô, gán đúng nội dung vào mục — kể cả khi ô bị ngắt trang hoặc nhãn nằm ở giữa ô.
3. **Ghép đoạn** theo ký hiệu đầu mục (-, +, a), Bước n…), dấu kết câu và độ dài dòng (dòng ngắn kết thúc sớm trước lề phải = hết đoạn/tiêu đề).
4. **Đối chiếu chéo tự động**: số thủ tục ở danh mục (mục A) với nội dung (mục B); danh mục Phụ lục V với nội dung mẫu; số điều, số khoản.
5. Toàn bộ nội dung pháp lý lưu **nguyên văn** (`app/du-lieu/nguon.js`), kèm số trang. Các chỉ mục do phần mềm lập (cơ quan, số ngày, giấy tờ, mẫu viện dẫn) lưu riêng trong trường `suyRa` và hiển thị với nhãn **“Phần mềm lập”**.

## 3. Phạm vi nghiệp vụ đã cấu trúc

| Phần văn bản | Cách cấu trúc | Màn hình |
|---|---|---|
| Quyết định (căn cứ, Điều 1–3) | Nguyên văn theo điều | Căn cứ pháp lý |
| Quy định Chương I–V (Điều 1–24) | Nguyên văn theo điều, khoản | Căn cứ pháp lý; ngăn căn cứ tại chỗ |
| Phụ lục I, II, III – 45 thủ tục | 9 mục nguyên văn/thủ tục: (1) trình tự (tách bước), (2) thành phần, số lượng hồ sơ (tách danh mục giấy tờ), (3) thời hạn, (4) đối tượng, (5) cơ quan (tách vai trò thẩm quyền/trực tiếp/phối hợp), (6) kết quả, (7) phí, lệ phí, (8) mẫu đơn, tờ khai (liên kết Phụ lục V), (9) yêu cầu, điều kiện | Thủ tục hành chính |
| Chương III – Điều 15–18 | Mô hình hóa thủ công thành 5 sơ đồ làn: mỗi bước có chủ thể, nguyên văn, thời hạn và mốc tính, đầu vào, đầu ra, nhánh từ chối/bổ sung, gửi đồng thời, căn cứ khoản | Luân chuyển hồ sơ NVTC |
| Phụ lục IV – 6 trình tự | Nguyên văn theo khoản, theo thứ tự bước | Thu hồi, bồi thường, TĐC |
| Phụ lục V – 45 mẫu | Danh mục + nội dung trích xuất + liên kết trang PDF gốc (mẫu chính thức) | Hồ sơ và mẫu biểu |

**Mô hình dữ liệu chính** (xem `app/js/mo-hinh.js`): `thuTuc` (mã, phụ lục, tên danh mục, tên nội dung, trang, `muc[1..9]`, `buoc`, `suyRa`), `dieu` (số, chương, tiêu đề, khoản), `quyTrinh` (làn, bước, cạnh, ghi chú), `coQuan` (mẫu nhận diện), `mauBieu`, `phuLucIV`, `vanDeNguon`. Mọi trích dẫn căn cứ dùng một bộ giải chung `giaiCanCu()` trả về nguyên văn + trang PDF.

**Quy ước mã thủ tục:** `<phụ lục>.<số thứ tự>` theo văn bản, ví dụ `I.1`, `II.13`, `III.22`.

## 4. Nguyên tắc pháp lý áp dụng trong phần mềm

- Không cộng dồn thời hạn khi văn bản không quy định tổng thời hạn (Chương III không quy định tổng thời hạn cho quy trình luân chuyển).
- Giữ đúng đơn vị thời hạn: “ngày” khác “ngày làm việc”.
- Bước văn bản không nêu thời hạn hiển thị “Không quy định”, không gán số ngày.
- Ô để trống trong văn bản hiển thị “để trống trong văn bản nguồn”, không chuyển thành “không quy định”.
- Tên ngắn trên sơ đồ là **diễn giải**; nội dung pháp lý luôn là **nguyên văn** kèm khoản, điều, trang.
- Văn bản được viện dẫn (Luật Đất đai, các nghị định, thông tư…) chỉ được nhận diện tên; hiệu lực **chưa xác minh**; không có toàn văn trong tài liệu nguồn.

## 5. Phát hiện trong văn bản nguồn (cần cơ quan ban hành xác minh)

Đầy đủ tại màn hình *Đối soát dữ liệu › Vấn đề văn bản nguồn* và `van-de-van-ban-nguon.csv` (27 mục: 2 cao, 9 trung bình, 13 thấp, 3 thông tin). Các điểm đáng chú ý:

1. **Số, ngày ban hành, ngày hiệu lực để trống** trong PDF (tr.1, Điều 2 khoản 1).
2. **Kho bạc Nhà nước “khu vực X”** chưa xác định số khu vực.
3. **Mẫu số 19** (Phiếu chuyển thông tin xác định NVTC) có nội dung (tr.192), được nhiều thủ tục viện dẫn nhưng **không có trong danh mục Phụ lục V**; danh mục có STT 26 trùng và ký hiệu 18a ghi hai lần với hai tên khác nhau.
4. **Điều 15**: khoản 1 nêu cơ quan có chức năng quản lý đất đai chuyển Phiếu; khoản 3 lại ghi “Phiếu… do tổ chức Đăng ký đất đai chuyển đến”.
5. **Điều 15, 16 khoản 5** không nêu số ngày cơ quan thuế chuyển thông tin thu nộp; **Điều 17 khoản 2, 3** và **Điều 15 khoản 6** không nêu mốc bắt đầu tính thời hạn.
6. **Đơn vị thời hạn không thống nhất**: I.5 (30 ngày), II.2 (05 ngày), II.4 (10 ngày), II.11 (35 ngày) ghi “ngày”, trong khi thủ tục tương ứng ở Phụ lục I và phần tăng thêm trong cùng mục ghi “ngày làm việc”.
7. **III.13** mục (9) để trống; **III.14** đánh số Bước 1, 2, 4, 5 (không có Bước 3).
8. **Tên thủ tục ở danh mục (mục A) khác tên ở nội dung (mục B)**: I.9, I.10, II.6, II.7, II.8, II.12, III.15. Phần mềm hiển thị tên theo danh mục và nêu tên tại nội dung bên dưới.
9. Các mẫu tờ khai thuộc Thông tư 89/2026/TT-BTC, Mẫu số 06 Thông tư 03/2025/TT-VPCP, Mẫu số 04 Nghị định 103/2024/NĐ-CP được viện dẫn nhưng **không có trong tài liệu nguồn**.

## 6. Tài liệu tham chiếu giao diện (phần mềm GPMB)

Đã khảo sát mã nguồn công khai `github.com/letunglam1992/phanmemGPMB` (React + Tauri). Kế thừa: hệ biến màu sáng/tối (`--nen`, `--chinh`, 6 màu trạng thái…), thang chữ 12/13/14/16/20/24, bo góc 6/10/14, phông **Be Vietnam Pro** nhúng sẵn (OFL), bố cục thanh bên 250px + đầu trang nền núi (`nen-nui.svg`), thẻ chỉ số có vạch màu, bảng có tiêu đề cố định, nhãn trạng thái dạng viên. Không sửa đổi kho mã GPMB. Ứng dụng mới viết bằng HTML/CSS/JavaScript thuần (không cần Node.js/biên dịch) vì máy triển khai không có Node.js và nhu cầu là tra cứu tĩnh, dễ đặt lên máy chủ nội bộ.

## 7. Rủi ro và giả định kỹ thuật

| Rủi ro / giả định | Xử lý |
|---|---|
| Văn bản trong PDF có thể là bản trước khi ban hành chính thức (số, ngày để trống) | Gắn nhãn “chưa xác minh”; cơ chế cập nhật lại từ PDF chính thức bằng một lệnh |
| Trích xuất tự động có thể sai ngắt dòng, ghép đoạn | Nội dung chỉ sai về trình bày (không mất chữ); mọi mục có liên kết trang PDF gốc để đối chiếu; bảng đối soát 163 dòng |
| Chỉ mục suy ra (cơ quan, số ngày, giấy tờ) có thể chưa đầy đủ | Luôn gắn nhãn “Phần mềm lập”, hiển thị cạnh nguyên văn; không dùng làm căn cứ pháp lý |
| Nội dung mẫu biểu mất định dạng bảng | Không tái tạo mẫu; hướng dẫn in mẫu từ trang PDF gốc |
| Hiệu lực các văn bản được viện dẫn | Ngoài phạm vi tài liệu nguồn; ghi rõ “chưa xác minh” |
