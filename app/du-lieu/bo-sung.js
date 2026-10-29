/* Dữ liệu biên soạn bổ sung (sửa tay, có kiểm soát).
 * - Mọi trường "nguyenVan" phải là đoạn trích NGUYÊN VĂN từ văn bản nguồn; bộ kiểm thử (kiem-thu.html)
 *   tự đối chiếu từng đoạn với nội dung trích xuất trong nguon.js và báo lỗi nếu không khớp.
 * - Trường "ten", "dienGiai" là diễn giải ngắn do phần mềm đặt để hiển thị, KHÔNG phải nội dung pháp lý.
 * - Khi văn bản sửa đổi: cập nhật nguon.js bằng cong-cu/cap-nhat-du-lieu.ps1, rồi rà lại tệp này,
 *   tăng "phienBanDuLieu" và ghi "lichSu".
 */
window.QD75_BO_SUNG = {
  phienBanDuLieu: "1.1.0",
  lichSu: [
    { phienBan: "1.1.0", ngay: "2026-10-29", noiDung: "Cập nhật tình trạng hiệu lực: người dùng xác nhận Quyết định số 75/2026/QĐ-UBND ngày 22/10/2026 đã có hiệu lực. Ngày có hiệu lực cụ thể chưa được cung cấp; tệp PDF vẫn để trống số, ngày." },
    { phienBan: "1.0.0", ngay: "2026-10-29", noiDung: "Khởi tạo bộ dữ liệu: trích xuất toàn văn Quyết định, Quy định (24 điều) và Phụ lục I–V từ tệp PDF do người dùng cung cấp; mô hình hóa quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính tại Chương III (Điều 15–18)." }
  ],

  vanBan: {
    loai: "Quyết định",
    coQuanBanHanh: "Ủy ban nhân dân tỉnh Sơn La",
    trichYeu: "Ban hành Quy định về trình tự, thủ tục hành chính về đất đai và quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính về đất đai áp dụng trên địa bàn tỉnh Sơn La",
    // Số hiệu và ngày ban hành: tệp PDF để trống; giá trị dưới đây do người dùng cung cấp khi giao việc
    soKyHieu: { giaTri: "75/2026/QĐ-UBND", nguon: "nguoi-dung", ghiChu: "Tệp PDF ghi \"Số: /2026/QĐ-UBND\" (để trống số). Số hiệu do người dùng cung cấp, chưa đối chiếu được trên văn bản." },
    ngayBanHanh: { giaTri: "22/10/2026", nguon: "nguoi-dung", ghiChu: "Tệp PDF ghi \"Sơn La, ngày tháng năm\" (để trống). Ngày do người dùng cung cấp, chưa đối chiếu được trên văn bản." },
    ngayHieuLuc: { giaTri: null, nguon: "chua-xac-dinh", ghiChu: "Điều 2 khoản 1 Quyết định ghi \"có hiệu lực thi hành kể từ ngày tháng năm 2026\" (để trống ngày, tháng)." },
    // "co-hieu-luc" | "chua-xac-minh" | "het-hieu-luc"
    tinhTrangHieuLuc: "co-hieu-luc",
    hieuLucGhiChu: "Người dùng xác nhận ngày 29/10/2026 văn bản đã có hiệu lực. Ngày có hiệu lực cụ thể chưa xác định (Điều 2 khoản 1 trong tệp PDF để trống ngày, tháng).",
    nguoiKy: { giaTri: "Nguyễn Thành Công — KT. Chủ tịch, Phó Chủ tịch", nguon: "pdf", trang: 2 }
  },

  // Các vấn đề phát hiện trong văn bản nguồn khi chuẩn hóa — hiển thị tại màn hình Đối soát và tại vị trí liên quan.
  vanDeNguon: [
    { ma: "VD01", mucDo: "trung-binh", viTri: "Trang 1 – phần mở đầu Quyết định", trang: 1, moTa: "Tệp PDF không ghi số và ngày ban hành (\"Số: /2026/QĐ-UBND\", \"Sơn La, ngày tháng năm\"). Phần mềm hiển thị số 75/2026/QĐ-UBND ngày 22/10/2026 theo thông tin người dùng cung cấp. Nên thay tệp nguồn bằng bản đã ký ban hành để đối chiếu nội dung." },
    { ma: "VD02", mucDo: "thap", viTri: "Điều 2 khoản 1 Quyết định", trang: 2, moTa: "Ngày có hiệu lực thi hành để trống trong tệp PDF. Người dùng đã xác nhận văn bản có hiệu lực (29/10/2026); ngày có hiệu lực cụ thể chưa được ghi nhận." },
    { ma: "VD03", mucDo: "trung-binh", viTri: "Điều 3 Quyết định; Điều 15, 16, 18, 23 Quy định", trang: 2, moTa: "Văn bản ghi \"Kho bạc Nhà nước khu vực X\" — chưa xác định cụ thể số khu vực. Phần mềm giữ nguyên cách ghi." },
    { ma: "VD04", mucDo: "trung-binh", viTri: "Phụ lục V – danh mục mẫu biểu", trang: 148, moTa: "Danh mục mẫu biểu không liệt kê Mẫu số 19 (Phiếu chuyển thông tin để xác định nghĩa vụ tài chính về đất đai), trong khi nội dung Mẫu số 19 có tại trang 192 và được viện dẫn ở nhiều thủ tục." },
    { ma: "VD05", mucDo: "thap", viTri: "Phụ lục V – danh mục mẫu biểu", trang: 148, moTa: "Số thứ tự 26 được dùng hai lần; ký hiệu Mẫu số 18a xuất hiện hai lần với hai tên khác nhau (\"Đơn đăng ký biến động đất đai, tài sản gắn liền với đất\" và \"Danh sách những người sử dụng chung thửa đất, sở hữu chung tài sản gắn liền với đất\"). Nội dung mẫu 18a tại trang 191 là Danh sách những người sử dụng chung." },
    { ma: "VD06", mucDo: "trung-binh", viTri: "Điều 15 khoản 1 và khoản 3", trang: 9, moTa: "Khoản 1 quy định cơ quan có chức năng quản lý đất đai chuyển Phiếu chuyển thông tin; khoản 3 lại ghi \"Phiếu chuyển thông tin do tổ chức Đăng ký đất đai chuyển đến\" và yêu cầu cơ quan thuế thông báo đến Cơ quan có chức năng quản lý đất đai. Sơ đồ thể hiện theo khoản 1; cần xác minh." },
    { ma: "VD07", mucDo: "trung-binh", viTri: "Điều 15 khoản 5; Điều 16 khoản 5", trang: 9, moTa: "Văn bản không nêu số ngày để cơ quan thuế chuyển thông tin thu nộp cho cơ quan có chức năng quản lý đất đai (chỉ ghi \"Kể từ ngày nhận được thông tin thu nộp...\"). Phần mềm không tự gán thời hạn." },
    { ma: "VD08", mucDo: "thap", viTri: "Điều 17 khoản 2, khoản 3", trang: 11, moTa: "Thời hạn 03 ngày làm việc (khoản 2) và 15 ngày làm việc (khoản 3) không nêu rõ mốc bắt đầu tính." },
    { ma: "VD09", mucDo: "thap", viTri: "Điều 15 khoản 6", trang: 10, moTa: "Các thời hạn 1/2 ngày, 05 ngày, 03 ngày làm việc không nêu rõ mốc bắt đầu tính. Văn bản ghi \"theo mẫu ban hành kèm theo Quyết định này\" mà không nêu số mẫu; Phụ lục V có Mẫu số 34 \"Đơn đề nghị tính hoặc tính lại tiền sử dụng đất\" (phần mềm gợi ý liên kết, chưa xác nhận)." },
    { ma: "VD10", mucDo: "thap", viTri: "Phụ lục I, thủ tục 1 và 2, mục (8); Phụ lục V", trang: 18, moTa: "Ký hiệu mẫu ghi không thống nhất: \"Mẫu số 4a\"/\"Mẫu số 04a\", \"Mẫu số 4b\"/\"Mẫu số 04b\". Phần mềm coi là cùng một mẫu khi liên kết." },
    { ma: "VD11", mucDo: "thong-tin", viTri: "Nhiều thủ tục – mục (2), (8)", trang: null, moTa: "Các mẫu tờ khai ban hành kèm Thông tư 89/2026/TT-BTC (01/TK-SDDPNN, 02/TK-SDDPNN, 01/SDDNN, 03/SDDNN, 01/TMĐN, 01/LPTB...) không có trong tài liệu nguồn. Phần mềm chỉ ghi nhận tên, không cung cấp tệp mẫu." },
    { ma: "VD12", mucDo: "thong-tin", viTri: "Điều 5 khoản 2; Điều 15–16 khoản 5", trang: 5, moTa: "Các mẫu viện dẫn từ văn bản khác (Mẫu số 06 Thông tư 03/2025/TT-VPCP; Mẫu số 04 Phụ lục II Nghị định 103/2024/NĐ-CP) không có trong tài liệu nguồn." },
    { ma: "VD13", mucDo: "thap", viTri: "Tiêu đề Điều 16", trang: 9, moTa: "Tiêu đề Điều 16 có cụm từ \"gia hạn sử dụng đất sử dụng đất theo đối với trường hợp\" — lỗi diễn đạt trong văn bản nguồn; phần mềm giữ nguyên văn." },
    { ma: "VD14", mucDo: "thong-tin", viTri: "Phụ lục V – nội dung mẫu biểu", trang: 149, moTa: "Nội dung mẫu biểu được trích tự động dạng văn bản; bảng biểu, dòng chấm, ô đánh dấu có thể không giữ nguyên định dạng. Bản in chính thức cần lấy từ trang PDF gốc (nút \"Mở trang PDF\")." }
  ],

  // Danh mục cơ quan, chủ thể. "mau": biểu thức chính quy áp dụng trên văn bản đã bỏ dấu, chữ thường, bỏ dấu câu.
  // "chiMuc": có lập chỉ mục tự động trong nội dung thủ tục hay không.
  coQuan: [
    { id: "ttpvhcc-tinh", ten: "Trung tâm phục vụ hành chính công tỉnh", nhom: "Tiếp nhận, trả kết quả", mau: ["trung tam phuc vu hanh chinh cong tinh"], chiMuc: true },
    { id: "ttpvhcc-xa", ten: "Trung tâm phục vụ hành chính công cấp xã", nhom: "Tiếp nhận, trả kết quả", mau: ["trung tam phuc vu hanh chinh cong cap xa"], chiMuc: true },
    { id: "bo-phan-mot-cua", ten: "Bộ phận một cửa (cấp xã)", nhom: "Tiếp nhận, trả kết quả", mau: ["bo phan mot cua"], chiMuc: true, ghiChu: "Văn bản dùng các cách gọi \"Bộ phận Một cửa\", \"Bộ phận một cửa cấp xã\", \"Bộ phận một cửa liên thông\"." },
    { id: "so-nnmt", ten: "Sở Nông nghiệp và Môi trường", nhom: "Cơ quan cấp tỉnh", mau: ["so nong nghiep va moi truong"], chiMuc: true },
    { id: "vpdkdd", ten: "Văn phòng đăng ký đất đai", nhom: "Đăng ký đất đai", mau: ["(?<!chi nhanh )van phong dang ky dat dai"], chiMuc: true },
    { id: "cn-vpdkdd", ten: "Chi nhánh Văn phòng đăng ký đất đai", nhom: "Đăng ký đất đai", mau: ["chi nhanh van phong dang ky dat dai"], chiMuc: true },
    { id: "to-chuc-dkdd", ten: "Tổ chức đăng ký đất đai", nhom: "Đăng ký đất đai", mau: ["to chuc dang ky dat dai"], chiMuc: true },
    { id: "cq-qldd", ten: "Cơ quan có chức năng quản lý đất đai", nhom: "Quản lý đất đai", mau: ["co quan co chuc nang quan ly dat dai(?! cap xa)(?! cap tinh)(?! tinh)"], chiMuc: true, ghiChu: "Văn bản dùng không kèm cấp (tỉnh hoặc xã) tại Chương III." },
    { id: "cq-qldd-tinh", ten: "Cơ quan có chức năng quản lý đất đai cấp tỉnh", nhom: "Quản lý đất đai", mau: ["co quan co chuc nang quan ly dat dai (cap )?tinh"], chiMuc: true },
    { id: "cq-qldd-xa", ten: "Cơ quan có chức năng quản lý đất đai cấp xã", nhom: "Quản lý đất đai", mau: ["co quan co chuc nang quan ly dat dai cap xa"], chiMuc: true },
    { id: "chu-tich-ubnd-tinh", ten: "Chủ tịch Ủy ban nhân dân tỉnh", nhom: "Người có thẩm quyền", mau: ["chu tich (uy ban nhan dan|ubnd) (cap )?tinh"], chiMuc: true },
    { id: "ubnd-tinh", ten: "Ủy ban nhân dân tỉnh", nhom: "Người có thẩm quyền", mau: ["(?<!chu tich )(uy ban nhan dan|ubnd) (cap )?tinh"], chiMuc: true },
    { id: "hdnd-tinh", ten: "Hội đồng nhân dân tỉnh", nhom: "Người có thẩm quyền", mau: ["hoi dong nhan dan (cap )?tinh", "hoi dong nhan dan cung cap"], chiMuc: true },
    { id: "chu-tich-ubnd-xa", ten: "Chủ tịch Ủy ban nhân dân cấp xã", nhom: "Người có thẩm quyền", mau: ["chu tich (uy ban nhan dan|ubnd) cap xa"], chiMuc: true },
    { id: "ubnd-xa", ten: "Ủy ban nhân dân cấp xã", nhom: "Người có thẩm quyền", mau: ["(?<!chu tich )(uy ban nhan dan|ubnd) cap xa"], chiMuc: true },
    { id: "co-quan-thue", ten: "Cơ quan thuế", nhom: "Tài chính, thuế", mau: ["co quan thue", "thue tinh son la"], chiMuc: true },
    { id: "kbnn", ten: "Kho bạc Nhà nước khu vực X", nhom: "Tài chính, thuế", mau: ["kho bac nha nuoc"], chiMuc: true, ghiChu: "Văn bản ghi \"khu vực X\" (xem VD03)." },
    { id: "co-quan-tai-chinh", ten: "Cơ quan tài chính", nhom: "Tài chính, thuế", mau: ["co quan tai chinh", "so tai chinh"], chiMuc: true },
    { id: "co-quan-thu-nsnn", ten: "Cơ quan, tổ chức thu ngân sách nhà nước", nhom: "Tài chính, thuế", mau: ["co quan to chuc thu ngan sach nha nuoc"], chiMuc: true },
    { id: "ngan-hang", ten: "Ngân hàng được ủy quyền thu", nhom: "Tài chính, thuế", mau: ["ngan hang duoc uy quyen thu"], chiMuc: true },
    { id: "so-xay-dung", ten: "Sở Xây dựng", nhom: "Cơ quan cấp tỉnh", mau: ["so xay dung"], chiMuc: true },
    { id: "don-vi-bthttdc", ten: "Đơn vị, tổ chức thực hiện nhiệm vụ bồi thường, hỗ trợ, tái định cư", nhom: "Bồi thường, hỗ trợ, tái định cư", mau: ["don vi to chuc (co trach nhiem )?thuc hien nhiem vu boi thuong"], chiMuc: true },
    { id: "to-chuc-ptqd", ten: "Tổ chức phát triển quỹ đất", nhom: "Bồi thường, hỗ trợ, tái định cư", mau: ["to chuc phat trien quy dat"], chiMuc: true },
    { id: "ubmttq", ten: "Ủy ban Mặt trận Tổ quốc Việt Nam (cấp xã)", nhom: "Bồi thường, hỗ trợ, tái định cư", mau: ["uy ban mat tran to quoc"], chiMuc: true },
    { id: "buu-chinh", ten: "Đơn vị cung cấp dịch vụ bưu chính công ích", nhom: "Tiếp nhận, trả kết quả", mau: ["buu chinh cong ich"], chiMuc: true },
    { id: "cap-co-tham-quyen", ten: "Cấp có thẩm quyền (ban hành quyết định)", nhom: "Người có thẩm quyền", mau: [], chiMuc: false, ghiChu: "Cách gọi chung tại Chương III; cấp cụ thể theo thẩm quyền tại Phụ lục I, II." },
    { id: "nguoi-su-dung-dat", ten: "Người sử dụng đất / người nộp hồ sơ", nhom: "Người thực hiện thủ tục", mau: [], chiMuc: false }
  ],

  // Quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính — Chương III Quy định.
  // buoc.loai: "batdau" | "buoc" | "nhanh" (xử lý ngoại lệ) | "ketthuc"
  // canh.loai: "chinh" | "dieu-kien" | "tra-lai" | "dong-thoi"
  quyTrinh: [
    {
      id: "QT15", dieu: "15", ten: "Giao đất, cho thuê đất, chuyển mục đích… tính theo bảng giá đất",
      dienGiai: "Áp dụng khi tiền sử dụng đất, tiền thuê đất tính theo giá đất trong bảng giá đất, hệ số điều chỉnh (khoản 1 Điều 159 Luật Đất đai và Nghị quyết số 254/2025/QH15).",
      lanes: ["cq-qldd", "cap-co-tham-quyen", "co-quan-thue", "kbnn", "nguoi-su-dung-dat", "co-quan-thu-nsnn"],
      buoc: [
        { id: "a", loai: "batdau", lane: "cq-qldd", hang: 0, ten: "Hồ sơ giao đất, cho thuê đất, chuyển mục đích sử dụng đất", canCu: { dieu: "15", khoan: "1" } },
        { id: "b1", loai: "buoc", lane: "cq-qldd", hang: 1, ten: "Kiểm tra hồ sơ, trình cấp có thẩm quyền", canCu: { dieu: "15", khoan: "1" },
          nguyenVan: "Cơ quan có chức năng quản lý đất đai kiểm tra hồ sơ và trình cấp có thẩm quyền ban hành quyết định giao đất, cho thuê đất, chuyển mục đích sử dụng đất, xác định hình thức sử dụng đất theo quy định.",
          thoiHan: { ngay: null, nguyenVan: null, ghiChu: "Điều 15 không quy định thời hạn cho công việc này; thời hạn giải quyết thủ tục theo mục (3) của thủ tục tương ứng tại Phụ lục I, II." },
          dauVao: ["Hồ sơ giao đất, cho thuê đất, chuyển mục đích sử dụng đất"], dauRa: ["Hồ sơ trình cấp có thẩm quyền"] },
        { id: "b2", loai: "buoc", lane: "cap-co-tham-quyen", hang: 2, ten: "Ban hành quyết định giao đất, cho thuê đất, chuyển mục đích sử dụng đất", canCu: { dieu: "15", khoan: "1" },
          nguyenVan: "trình cấp có thẩm quyền ban hành quyết định giao đất, cho thuê đất, chuyển mục đích sử dụng đất, xác định hình thức sử dụng đất theo quy định",
          thoiHan: { ngay: null, ghiChu: "Không quy định tại Điều 15." }, dauRa: ["Quyết định giao đất, cho thuê đất, chuyển mục đích sử dụng đất"] },
        { id: "b3", loai: "buoc", lane: "cq-qldd", hang: 3, ten: "Chuyển Phiếu chuyển thông tin để xác định nghĩa vụ tài chính", canCu: { dieu: "15", khoan: "1" },
          nguyenVan: "Trong thời hạn 02 (hai) ngày làm việc kể từ ngày nhận được quyết định giao đất, cho thuê đất, chuyển mục đích sử dụng đất của cấp có thẩm quyền thì cơ quan có chức năng quản lý đất đai có trách nhiệm chuyển đầy đủ thông tin địa chính thửa đất tại Phiếu chuyển thông tin để xác định nghĩa vụ tài chính về đất đai (sau đây gọi là Phiếu chuyển thông tin).",
          thoiHan: { ngay: 2, nguyenVan: "Trong thời hạn 02 (hai) ngày làm việc kể từ ngày nhận được quyết định", moc: "Kể từ ngày nhận được quyết định của cấp có thẩm quyền" },
          dauVao: ["Quyết định của cấp có thẩm quyền"], dauRa: ["Phiếu chuyển thông tin để xác định nghĩa vụ tài chính về đất đai"], mau: ["19"],
          ghiChuPhanMem: "Tên phiếu trùng với tên Mẫu số 19 tại Phụ lục V; Điều 15 không viện dẫn số mẫu. Cơ quan nhận Phiếu (cơ quan thuế) xác định theo khoản 2." },
        { id: "b4", loai: "buoc", lane: "co-quan-thue", hang: 4, ten: "Xác định nghĩa vụ tài chính, ban hành Thông báo nộp tiền", canCu: { dieu: "15", khoan: "2" },
          nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin do cơ quan có chức năng quản lý đất đai chuyển đến, cơ quan thuế xác định tiền sử dụng đất, đơn giá thuê đất, tiền thuê đất phải nộp, số tiền sử dụng đất được giảm, số tiền thuê đất được giảm, ban hành Thông báo nộp tiền sử dụng đất, tiền thuê đất theo quy định của Chính phủ tại Nghị định số 103/2024/NĐ-CP gửi cho người sử dụng đất và cơ quan có chức năng quản lý đất đai.",
          thoiHan: { ngay: 3, nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin", moc: "Kể từ ngày nhận được Phiếu chuyển thông tin" },
          dauVao: ["Phiếu chuyển thông tin"], dauRa: ["Thông báo nộp tiền sử dụng đất, tiền thuê đất — gửi người sử dụng đất và cơ quan có chức năng quản lý đất đai"] },
        { id: "x4", loai: "nhanh", lane: "co-quan-thue", hang: 3, ten: "Từ chối Phiếu có sai sót hoặc chưa đủ căn cứ", canCu: { dieu: "15", khoan: "3" },
          nguyenVan: "Trường hợp Phiếu chuyển thông tin do tổ chức Đăng ký đất đai chuyển đến có sai sót hoặc chưa đủ căn cứ để xác định nghĩa vụ tài chính thì trong thời hạn không quá 02 (hai) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin điện tử, Cơ quan thuế thực hiện gửi trạng thái “Từ chối” trên hệ thống, đồng thời ghi rõ lý do từ chối hoặc thông báo bằng văn bản đến Cơ quan có chức năng quản lý đất đai để đề nghị cung cấp, bổ sung thông tin làm căn cứ xác định nghĩa vụ tài chính.",
          thoiHan: { ngay: 2, nguyenVan: "trong thời hạn không quá 02 (hai) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin điện tử", moc: "Kể từ ngày nhận được Phiếu chuyển thông tin điện tử" },
          dauRa: ["Trạng thái “Từ chối” trên hệ thống kèm lý do, hoặc văn bản đề nghị cung cấp, bổ sung thông tin"], vanDe: ["VD06"] },
        { id: "b5", loai: "buoc", lane: "kbnn", diemCuoi: true, hang: 5, ten: "Nhận Thông báo để theo dõi, hạch toán", canCu: { dieu: "15", khoan: "2" },
          nguyenVan: "Thông báo nộp tiền sử dụng đất, tiền thuê đất được gửi đồng thời cho Kho bạc Nhà nước khu vực X để theo dõi, hạch toán theo quy định.",
          thoiHan: { ngay: null, ghiChu: "Gửi đồng thời với Thông báo nộp tiền." }, vanDe: ["VD03"] },
        { id: "b6", loai: "buoc", lane: "nguoi-su-dung-dat", hang: 5, ten: "Nộp tiền vào ngân sách nhà nước theo Thông báo", canCu: { dieu: "15", khoan: "4" },
          nguyenVan: "Người sử dụng đất thực hiện nộp tiền sử dụng đất vào ngân sách Nhà nước theo thông báo của cơ quan thuế theo quy định của pháp luật về quản lý thuế.",
          thoiHan: { ngay: null, ghiChu: "Theo quy định của pháp luật về quản lý thuế; Quy định này không nêu số ngày. Thời gian thực hiện nghĩa vụ tài chính không tính vào thời gian giải quyết thủ tục (Điều 8 khoản 1)." } },
        { id: "b7", loai: "buoc", lane: "co-quan-thu-nsnn", hang: 6, ten: "Chuyển thông tin thu nộp ngân sách cho cơ quan thuế", canCu: { dieu: "15", khoan: "5" },
          nguyenVan: "Đối với trường hợp giao đất có thu tiền sử dụng đất, cho thuê đất trả tiền một lần cho cả thời gian thuê, sau khi thu tiền sử dụng đất, tiền thuê đất trả tiền một lần cho cả thời gian thuê, trong thời hạn 01 (một) ngày làm việc cơ quan, tổ chức thu ngân sách nhà nước chuyển thông tin thu nộp ngân sách cho cơ quan thuế theo quy định của pháp luật về quản lý thuế.",
          thoiHan: { ngay: 1, nguyenVan: "trong thời hạn 01 (một) ngày làm việc", moc: "Sau khi thu tiền sử dụng đất, tiền thuê đất" },
          dieuKien: "Chỉ áp dụng đối với trường hợp giao đất có thu tiền sử dụng đất, cho thuê đất trả tiền một lần cho cả thời gian thuê." },
        { id: "b8", loai: "buoc", lane: "co-quan-thue", hang: 7, ten: "Chuyển thông tin thu nộp cho cơ quan quản lý đất đai", canCu: { dieu: "15", khoan: "5" },
          nguyenVan: "Kể từ ngày nhận được thông tin thu nộp của cơ quan, tổ chức thu ngân sách nhà nước, cơ quan thuế có trách nhiệm thực hiện chuyển cho cơ quan có chức năng quản lý đất đai để làm căn cứ báo cáo cơ quan nhà nước có thẩm quyền giao đất, cho thuê đất theo quy định.",
          thoiHan: { ngay: null, ghiChu: "Văn bản không nêu số ngày." }, vanDe: ["VD07"] },
        { id: "z", loai: "ketthuc", lane: "cq-qldd", hang: 8, ten: "Báo cáo cơ quan có thẩm quyền giao đất, cho thuê đất", canCu: { dieu: "15", khoan: "5" },
          nguyenVan: "Việc giao đất, cho thuê đất trả tiền một lần cho cả thời gian thuê chỉ được thực hiện khi người sử dụng đất đã nộp đủ tiền sử dụng đất, tiền thuê đất trả một lần cho cả thời gian thuê theo quy định.",
          ghiChuPhanMem: "Điều kiện bắt buộc trước khi giao đất, cho thuê đất trả tiền một lần." }
      ],
      canh: [
        { tu: "a", den: "b1", loai: "chinh" },
        { tu: "b1", den: "b2", loai: "chinh", nhan: "Trình" },
        { tu: "b2", den: "b3", loai: "chinh", nhan: "Quyết định" },
        { tu: "b3", den: "b4", loai: "chinh", nhan: "Phiếu chuyển thông tin" },
        { tu: "b3", den: "x4", loai: "dieu-kien", nhan: "Phiếu sai sót / chưa đủ căn cứ" },
        { tu: "x4", den: "b3", loai: "tra-lai", nhan: "Từ chối, đề nghị bổ sung" },
        { tu: "b4", den: "b5", loai: "dong-thoi", nhan: "Gửi đồng thời" },
        { tu: "b4", den: "b6", loai: "chinh", nhan: "Thông báo nộp tiền" },
        { tu: "b6", den: "b7", loai: "dieu-kien", nhan: "Giao đất có thu tiền / thuê trả một lần" },
        { tu: "b7", den: "b8", loai: "chinh", nhan: "Thông tin thu nộp" },
        { tu: "b8", den: "z", loai: "chinh", nhan: "Thông tin thu nộp" }
      ],
      ghiChu: [
        { nguyenVan: "Sổ giao thông báo nộp các khoản nghĩa vụ tài chính về đất đai theo Mẫu số 04 tại Phụ lục II ban hành kèm theo Nghị định số 103/2024/NĐ-CP.", canCu: { dieu: "15", khoan: "5" } }
      ]
    },
    {
      id: "QT15-6", dieu: "15", khoan: "6", ten: "Tính hoặc tính lại tiền sử dụng đất (khoản 2 Điều 12 Nghị định 50/2026/NĐ-CP)",
      dienGiai: "Quy trình riêng tại khoản 6 Điều 15 đối với hộ gia đình, cá nhân đề nghị tính hoặc tính lại tiền sử dụng đất.",
      lanes: ["nguoi-su-dung-dat", "bo-phan-mot-cua", "cq-qldd-xa", "co-quan-thue", "ubnd-xa"],
      buoc: [
        { id: "m1", loai: "batdau", lane: "nguoi-su-dung-dat", hang: 0, ten: "Nộp văn bản đề nghị tính hoặc tính lại tiền sử dụng đất", canCu: { dieu: "15", khoan: "6" },
          nguyenVan: "Hộ gia đình, cá nhân nộp văn bản đề nghị tính hoặc tính lại tiền sử dụng đất theo quy định tại điểm a, b, c, d khoản 2 Điều 12 Nghị định số 50/2026/NĐ- CP theo mẫu ban hành kèm theo Quyết định này chậm nhất trước ngày 01 tháng 01 năm 2027 đến Bộ phận một cửa cấp xã bằng hình thức nộp trực tiếp hoặc trực tuyến.",
          thoiHan: { ngay: null, nguyenVan: "chậm nhất trước ngày 01 tháng 01 năm 2027", ghiChu: "Hạn cuối nộp văn bản đề nghị." },
          mau: ["34"], ghiChuPhanMem: "Văn bản không nêu số mẫu; Mẫu số 34 Phụ lục V có tên trùng (xem VD09).", vanDe: ["VD09"] },
        { id: "m2", loai: "buoc", lane: "bo-phan-mot-cua", hang: 1, ten: "Chuyển hồ sơ đến cơ quan quản lý đất đai cấp xã; chuyển thông tin đến cơ quan thuế", canCu: { dieu: "15", khoan: "6" },
          nguyenVan: "Trong thời gian không quá 1/2 ngày làm việc, Bộ phận một cửa liên thông chuyển hồ sơ đến Cơ quan có chức năng quản lý đất đai cấp xã nơi có đất để thực hiện việc xác định hạn mức giao đất ở của thửa đất được lựa chọn để tính hoặc tính lại tiền sử dụng đất; chuyển thông tin đến cơ quan thuế.",
          thoiHan: { ngay: 0.5, nguyenVan: "Trong thời gian không quá 1/2 ngày làm việc", moc: "Văn bản không nêu mốc bắt đầu" } },
        { id: "m3", loai: "buoc", lane: "cq-qldd-xa", hang: 2, ten: "Xác định hạn mức giao đất ở của thửa đất được lựa chọn", canCu: { dieu: "15", khoan: "6" },
          nguyenVan: "Trong thời gian không quá 05 (năm) ngày làm việc, cơ quan có chức năng quản lý đất đai cấp xã xác định hạn mức giao đất ở của thửa đất được lựa chọn để tính hoặc tính lại tiền sử dụng đất đồng thời chuyển thông tin đến cơ quan thuế.",
          thoiHan: { ngay: 5, nguyenVan: "Trong thời gian không quá 05 (năm) ngày làm việc", moc: "Văn bản không nêu mốc bắt đầu" } },
        { id: "m4", loai: "buoc", lane: "co-quan-thue", hang: 3, ten: "Tính hoặc tính lại tiền sử dụng đất, ban hành thông báo", canCu: { dieu: "15", khoan: "6" },
          nguyenVan: "Trong thời gian 03 (ba) ngày làm việc, cơ quan thuế thực hiện việc tính hoặc tính lại tiền sử dụng đất theo quy định tại Nghị định số 50/2026/NĐ-CP; ban hành thông báo nộp tiền sử dụng đất hoặc thông báo điều chỉnh thông báo nộp tiền sử dụng đất gửi cho người sử dụng đất; đồng thời gửi thông tin đến Ủy ban nhân dân cấp xã theo quy định.",
          thoiHan: { ngay: 3, nguyenVan: "Trong thời gian 03 (ba) ngày làm việc", moc: "Văn bản không nêu mốc bắt đầu" },
          dauRa: ["Thông báo nộp tiền sử dụng đất hoặc thông báo điều chỉnh thông báo nộp tiền sử dụng đất"] },
        { id: "m5", loai: "ketthuc", lane: "nguoi-su-dung-dat", hang: 4, ten: "Nhận thông báo nộp tiền / thông báo điều chỉnh", canCu: { dieu: "15", khoan: "6" } },
        { id: "m6", loai: "ketthuc", lane: "ubnd-xa", hang: 4, ten: "Nhận thông tin từ cơ quan thuế", canCu: { dieu: "15", khoan: "6" } }
      ],
      canh: [
        { tu: "m1", den: "m2", loai: "chinh", nhan: "Văn bản đề nghị" },
        { tu: "m2", den: "m3", loai: "chinh", nhan: "Hồ sơ" },
        { tu: "m2", den: "m4", loai: "dong-thoi", nhan: "Chuyển thông tin" },
        { tu: "m3", den: "m4", loai: "chinh", nhan: "Thông tin hạn mức" },
        { tu: "m4", den: "m5", loai: "chinh", nhan: "Thông báo" },
        { tu: "m4", den: "m6", loai: "dong-thoi", nhan: "Gửi thông tin" }
      ],
      ghiChu: []
    },
    {
      id: "QT16", dieu: "16", ten: "Giao đất, cho thuê đất, chuyển mục đích… tính theo giá đất cụ thể",
      dienGiai: "Áp dụng đối với trường hợp quy định tại khoản 1 Điều 160 Luật Đất đai và Nghị quyết số 254/2025/QH15 (phải xác định giá đất cụ thể).",
      lanes: ["cap-co-tham-quyen", "cq-qldd", "co-quan-thue", "kbnn", "nguoi-su-dung-dat", "co-quan-thu-nsnn"],
      buoc: [
        { id: "a", loai: "batdau", lane: "cap-co-tham-quyen", hang: 0, ten: "Quyết định phê duyệt giá đất cụ thể của cấp có thẩm quyền", canCu: { dieu: "16", khoan: "1" } },
        { id: "b1", loai: "buoc", lane: "cq-qldd", hang: 1, ten: "Xác định thời điểm tính tiền, lập Phiếu chuyển thông tin", canCu: { dieu: "16", khoan: "1" },
          nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được quyết định phê duyệt giá đất cụ thể của cấp có thẩm quyền, cơ quan có chức năng quản lý đất đai xác định thời điểm tính tiền sử dụng đất, tiền thuê đất đối với khoản nộp bổ sung theo quy định tại khoản 2 Điều 50, khoản 9 Điều 51 Nghị định số 103/2024/NĐ-CP (nếu có) và lập Phiếu chuyển thông tin cho cơ quan thuế.",
          thoiHan: { ngay: 3, nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được quyết định phê duyệt giá đất cụ thể", moc: "Kể từ ngày nhận được quyết định phê duyệt giá đất cụ thể" },
          dauVao: ["Quyết định phê duyệt giá đất cụ thể"], dauRa: ["Phiếu chuyển thông tin"], mau: ["19"] },
        { id: "b2", loai: "buoc", lane: "co-quan-thue", hang: 3, ten: "Xác định nghĩa vụ tài chính, ban hành Thông báo nộp tiền", canCu: { dieu: "16", khoan: "2" },
          nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin do cơ quan có chức năng quản lý đất đai chuyển đến, cơ quan thuế xác định tiền sử dụng đất, đơn giá thuê đất, tiền thuê đất phải nộp, số tiền sử dụng đất được giảm, số tiền thuê đất được giảm, ban hành Thông báo nộp tiền sử dụng đất, tiền thuê đất theo quy định của Chính phủ tại Nghị định số 103/2024/NĐ-CP gửi cho người sử dụng đất và cơ quan có chức năng quản lý đất đai.",
          thoiHan: { ngay: 3, nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin", moc: "Kể từ ngày nhận được Phiếu chuyển thông tin" },
          dauRa: ["Thông báo nộp tiền sử dụng đất, tiền thuê đất"] },
        { id: "x2", loai: "nhanh", lane: "co-quan-thue", hang: 2, ten: "Từ chối Phiếu có sai sót hoặc chưa đủ căn cứ", canCu: { dieu: "16", khoan: "3" },
          nguyenVan: "Trường hợp Phiếu chuyển thông tin do cơ quan có chức năng quản lý đất đai chuyển đến có sai sót hoặc chưa đủ căn cứ để xác định nghĩa vụ tài chính thì trong thời hạn không quá 02 (hai) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin điện tử, Cơ quan thuế thực hiện gửi trạng thái “Từ chối” trên hệ thống, đồng thời ghi rõ lý do từ chối hoặc thông báo bằng văn bản đến Cơ quan có chức năng quản lý đất đai để đề nghị cung cấp, bổ sung thông tin làm căn cứ xác định nghĩa vụ tài chính.",
          thoiHan: { ngay: 2, nguyenVan: "trong thời hạn không quá 02 (hai) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin điện tử", moc: "Kể từ ngày nhận được Phiếu chuyển thông tin điện tử" } },
        { id: "b3", loai: "buoc", lane: "kbnn", diemCuoi: true, hang: 4, ten: "Nhận Thông báo để theo dõi, hạch toán", canCu: { dieu: "16", khoan: "2" },
          nguyenVan: "Thông báo nộp tiền sử dụng đất, tiền thuê đất được gửi đồng thời cho Kho bạc Nhà nước khu vực X để theo dõi, hạch toán theo quy định.",
          thoiHan: { ngay: null, ghiChu: "Gửi đồng thời với Thông báo nộp tiền." }, vanDe: ["VD03"] },
        { id: "b4", loai: "buoc", lane: "nguoi-su-dung-dat", hang: 4, ten: "Nộp tiền vào ngân sách nhà nước theo Thông báo", canCu: { dieu: "16", khoan: "4" },
          nguyenVan: "Người sử dụng đất thực hiện nộp tiền sử dụng đất, tiền thuê đất vào ngân sách nhà nước theo thông báo của cơ quan thuế theo quy định của pháp luật về quản lý thuế.",
          thoiHan: { ngay: null, ghiChu: "Theo quy định của pháp luật về quản lý thuế; Quy định này không nêu số ngày." } },
        { id: "b5", loai: "buoc", lane: "co-quan-thu-nsnn", hang: 5, ten: "Chuyển thông tin thu nộp ngân sách cho cơ quan thuế", canCu: { dieu: "16", khoan: "5" },
          nguyenVan: "Đối với trường hợp giao đất có thu tiền sử dụng đất, cho thuê trả tiền một lần cho cả thời gian thuê, sau khi thu tiền sử dụng đất, tiền thuê đất, trong thời hạn 01 (một) ngày làm việc cơ quan, tổ chức thu ngân sách nhà nước chuyển thông tin thu nộp ngân sách cho cơ quan thuế theo quy định của pháp luật về quản lý thuế.",
          thoiHan: { ngay: 1, nguyenVan: "trong thời hạn 01 (một) ngày làm việc", moc: "Sau khi thu tiền sử dụng đất, tiền thuê đất" },
          dieuKien: "Chỉ áp dụng đối với trường hợp giao đất có thu tiền sử dụng đất, cho thuê trả tiền một lần cho cả thời gian thuê." },
        { id: "b6", loai: "buoc", lane: "co-quan-thue", hang: 6, ten: "Chuyển thông tin thu nộp cho cơ quan quản lý đất đai", canCu: { dieu: "16", khoan: "5" },
          nguyenVan: "Kể từ ngày nhận được thông tin thu nộp của cơ quan, tổ chức thu ngân sách nhà nước, cơ quan thuế có trách nhiệm thực hiện chuyển cho cơ quan có chức năng quản lý đất đai để làm căn cứ báo cáo cơ quan nhà nước có thẩm quyền giao đất, cho thuê đất theo quy định.",
          thoiHan: { ngay: null, ghiChu: "Văn bản không nêu số ngày." }, vanDe: ["VD07"] },
        { id: "z", loai: "ketthuc", lane: "cq-qldd", hang: 7, ten: "Báo cáo cơ quan có thẩm quyền giao đất, cho thuê đất", canCu: { dieu: "16", khoan: "5" },
          nguyenVan: "Việc giao đất, cho thuê đất trả tiền một lần cho cả thời gian thuê chỉ được thực hiện khi người sử dụng đất đã nộp đủ tiền sử dụng đất, tiền thuê đất trả một lần cho cả thời gian thuê theo quy định." }
      ],
      canh: [
        { tu: "a", den: "b1", loai: "chinh", nhan: "Quyết định phê duyệt giá đất" },
        { tu: "b1", den: "b2", loai: "chinh", nhan: "Phiếu chuyển thông tin" },
        { tu: "b1", den: "x2", loai: "dieu-kien", nhan: "Phiếu sai sót / chưa đủ căn cứ" },
        { tu: "x2", den: "b1", loai: "tra-lai", nhan: "Từ chối, đề nghị bổ sung" },
        { tu: "b2", den: "b3", loai: "dong-thoi", nhan: "Gửi đồng thời" },
        { tu: "b2", den: "b4", loai: "chinh", nhan: "Thông báo nộp tiền" },
        { tu: "b4", den: "b5", loai: "dieu-kien", nhan: "Giao đất có thu tiền / thuê trả một lần" },
        { tu: "b5", den: "b6", loai: "chinh", nhan: "Thông tin thu nộp" },
        { tu: "b6", den: "z", loai: "chinh", nhan: "Thông tin thu nộp" }
      ],
      ghiChu: [
        { nguyenVan: "Sổ giao thông báo nộp các khoản nghĩa vụ tài chính về đất đai theo Mẫu số 04 tại Phụ lục II ban hành kèm theo Nghị định số 103/2024/NĐ-CP.", canCu: { dieu: "16", khoan: "5" } }
      ]
    },
    {
      id: "QT17", dieu: "17", ten: "Khấu trừ kinh phí bồi thường, hỗ trợ, tái định cư ứng trước",
      dienGiai: "Áp dụng khi được Nhà nước giao đất có thu tiền sử dụng đất, cho thuê đất mà người thực hiện dự án tự nguyện ứng trước kinh phí bồi thường, hỗ trợ, tái định cư (khoản 2 Điều 94 Luật Đất đai).",
      lanes: ["nguoi-su-dung-dat", "don-vi-bthttdc", "cq-qldd", "chu-tich-ubnd-xa", "ubnd-xa", "co-quan-thue"],
      buoc: [
        { id: "n1", loai: "batdau", lane: "nguoi-su-dung-dat", hang: 0, ten: "Lập, nộp hồ sơ đề nghị khấu trừ cùng hồ sơ xác định nghĩa vụ tài chính", canCu: { dieu: "17", khoan: "1" },
          nguyenVan: "Người sử dụng đất phối hợp với đơn vị, tổ chức thực hiện nhiệm vụ bồi thường, hỗ trợ, tái định cư lập và nộp hồ sơ đề nghị khấu trừ kinh phí bồi thường, hỗ trợ, tái định cư cùng với hồ sơ xác định nghĩa vụ tài chính theo quy định tại khoản 2 Điều 16 Nghị định số 103/2024/NĐ-CP cho cơ quan có chức năng quản lý đất đai.",
          thoiHan: { ngay: null, ghiChu: "Không quy định thời hạn." }, phoiHop: ["don-vi-bthttdc"] },
        { id: "n2", loai: "buoc", lane: "cq-qldd", hang: 1, ten: "Chuyển hồ sơ cho Chủ tịch UBND cấp xã", canCu: { dieu: "17", khoan: "2" },
          nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc, cơ quan có chức năng quản lý đất đai chuyển hồ sơ quy định cho Chủ tịch Ủy ban nhân dân cấp xã.",
          thoiHan: { ngay: 3, nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc", moc: "Văn bản không nêu mốc bắt đầu" }, vanDe: ["VD08"] },
        { id: "n3", loai: "buoc", lane: "chu-tich-ubnd-xa", hang: 2, ten: "Rà soát, xác nhận số tiền được trừ; gửi cơ quan thuế", canCu: { dieu: "17", khoan: "3" },
          nguyenVan: "Trong thời hạn 15 (mười lăm) ngày làm việc, Chủ tịch Ủy ban nhân dân cấp xã chỉ đạo thực hiện rà soát và có văn bản xác nhận số tiền bồi thường, hỗ trợ, tái định cư được trừ vào tiền sử dụng đất, tiền thuê đất gửi cho cơ quan thuế thực hiện việc trừ số tiền ứng trước vào tiền sử dụng đất, tiền thuê đất",
          thoiHan: { ngay: 15, nguyenVan: "Trong thời hạn 15 (mười lăm) ngày làm việc", moc: "Văn bản không nêu mốc bắt đầu" },
          dauRa: ["Văn bản xác nhận số tiền bồi thường, hỗ trợ, tái định cư được trừ"], vanDe: ["VD08"] },
        { id: "x3", loai: "nhanh", lane: "ubnd-xa", hang: 1, ten: "Thông báo hồ sơ không đủ thông tin hoặc sai sót", canCu: { dieu: "17", khoan: "3" },
          nguyenVan: "trường hợp hồ sơ không đủ thông tin hoặc sai sót, trong thời hạn 02 (hai) ngày làm việc, Ủy ban nhân dân cấp xã có trách nhiệm thông báo bằng văn bản cho cơ quan có chức năng quản lý đất đai để bổ sung thông tin và hồ sơ",
          thoiHan: { ngay: 2, nguyenVan: "trong thời hạn 02 (hai) ngày làm việc", moc: "Văn bản không nêu mốc bắt đầu" } },
        { id: "n4", loai: "buoc", lane: "co-quan-thue", hang: 3, ten: "Xác định, ban hành thông báo về nghĩa vụ tài chính", canCu: { dieu: "17", khoan: "4" },
          nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận hồ sơ từ Ủy ban nhân dân cấp xã, cơ quan thuế có trách nhiệm xác định và ban hành thông báo về nghĩa vụ tài chính theo quy định của pháp luật quản lý thuế.",
          thoiHan: { ngay: 3, nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận hồ sơ từ Ủy ban nhân dân cấp xã", moc: "Kể từ ngày nhận hồ sơ từ Ủy ban nhân dân cấp xã" },
          dauRa: ["Thông báo về nghĩa vụ tài chính"] },
        { id: "z", loai: "ketthuc", lane: "nguoi-su-dung-dat", hang: 4, ten: "Nhận thông báo về nghĩa vụ tài chính", canCu: { dieu: "17", khoan: "4" } }
      ],
      canh: [
        { tu: "n1", den: "n2", loai: "chinh", nhan: "Hồ sơ đề nghị khấu trừ" },
        { tu: "n2", den: "n3", loai: "chinh", nhan: "Hồ sơ" },
        { tu: "n2", den: "x3", loai: "dieu-kien", nhan: "Hồ sơ thiếu / sai sót" },
        { tu: "x3", den: "n2", loai: "tra-lai", nhan: "Đề nghị bổ sung" },
        { tu: "n3", den: "n4", loai: "chinh", nhan: "Văn bản xác nhận" },
        { tu: "n4", den: "z", loai: "chinh", nhan: "Thông báo" }
      ],
      ghiChu: []
    },
    {
      id: "QT18", dieu: "18", ten: "Xác định nghĩa vụ tài chính khi đăng ký biến động đất đai",
      dienGiai: "Áp dụng đối với các trường hợp đăng ký biến động đất đai (thủ tục tại Phụ lục III có phát sinh nghĩa vụ tài chính).",
      lanes: ["to-chuc-dkdd", "co-quan-thue", "kbnn", "nguoi-su-dung-dat"],
      buoc: [
        { id: "a", loai: "batdau", lane: "to-chuc-dkdd", hang: 0, ten: "Nhận đủ hồ sơ hợp lệ đăng ký biến động", canCu: { dieu: "18", khoan: "1" } },
        { id: "b1", loai: "buoc", lane: "to-chuc-dkdd", hang: 1, ten: "Chuyển Phiếu chuyển thông tin kèm hồ sơ cho cơ quan thuế", canCu: { dieu: "18", khoan: "1" },
          nguyenVan: "Trong thời hạn 02 (hai) ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ, Tổ chức đăng ký đất đai có trách nhiệm chuyển đầy đủ thông tin địa chính thửa đất tại Phiếu chuyển thông tin kèm theo hồ sơ theo quy định (hồ sơ đối với từng trường hợp đăng ký biến động; tờ khai lệ phí trước bạ, tờ khai thuế sử dụng đất phi nông nghiệp, tờ khai thuế thu nhập từ chuyển nhượng bất động sản; văn bản của người sử dụng đất đề nghị được miễn, giảm các khoản nghĩa vụ tài chính về đất đai; bản sao các giấy tờ chứng minh thuộc đối tượng được miễn, giảm theo quy định của pháp luật; giấy tờ chứng minh thuộc đối tượng không phải nộp nghĩa vụ tài chính theo quy định của pháp luật và các giấy tờ khác có liên quan).",
          thoiHan: { ngay: 2, nguyenVan: "Trong thời hạn 02 (hai) ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ", moc: "Kể từ ngày nhận đủ hồ sơ hợp lệ" },
          dauVao: ["Hồ sơ đối với từng trường hợp đăng ký biến động", "Tờ khai lệ phí trước bạ", "Tờ khai thuế sử dụng đất phi nông nghiệp", "Tờ khai thuế thu nhập từ chuyển nhượng bất động sản", "Văn bản của người sử dụng đất đề nghị được miễn, giảm các khoản nghĩa vụ tài chính về đất đai", "Bản sao các giấy tờ chứng minh thuộc đối tượng được miễn, giảm", "Giấy tờ chứng minh thuộc đối tượng không phải nộp nghĩa vụ tài chính", "Các giấy tờ khác có liên quan"],
          dauRa: ["Phiếu chuyển thông tin kèm hồ sơ"], mau: ["19"] },
        { id: "b2", loai: "buoc", lane: "co-quan-thue", hang: 3, ten: "Xác định nghĩa vụ tài chính, ban hành Thông báo", canCu: { dieu: "18", khoan: "2" },
          nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin do tổ chức đăng ký đất đai chuyển đến, cơ quan thuế xác định tiền sử dụng đất, đơn giá thuê đất, tiền thuê đất phải nộp Thuế thu nhập cá nhân, lệ phí trước bạ và các khoản nghĩa vụ tài chính khác (nếu có); số tiền sử dụng đất được giảm, số tiền thuê đất được giảm; ban hành Thông báo nộp tiền sử dụng đất, tiền thuê đất theo quy định của Chính phủ tại Nghị định số 103/2024/NĐ-CP, Thuế thu nhập cá nhân, lệ phí trước bạ và các khoản nghĩa vụ tài chính khác (nếu có) gửi cho người sử dụng đất và cơ quan có chức năng quản lý đất đai.",
          thoiHan: { ngay: 3, nguyenVan: "Trong thời hạn 03 (ba) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin", moc: "Kể từ ngày nhận được Phiếu chuyển thông tin" },
          dauRa: ["Thông báo nộp tiền sử dụng đất, tiền thuê đất, thuế thu nhập cá nhân, lệ phí trước bạ và các khoản nghĩa vụ tài chính khác (nếu có)"] },
        { id: "x2", loai: "nhanh", lane: "co-quan-thue", hang: 2, ten: "Từ chối Phiếu có sai sót hoặc chưa đủ căn cứ", canCu: { dieu: "18", khoan: "3" },
          nguyenVan: "Trường hợp Phiếu chuyển thông tin do tổ chức Đăng ký đất đai chuyển đến có sai sót hoặc chưa đủ căn cứ để xác định nghĩa vụ tài chính thì trong thời hạn không quá 02 (hai) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin điện tử, Cơ quan thuế thực hiện gửi trạng thái “Từ chối” trên hệ thống, đồng thời ghi rõ lý do từ chối hoặc thông báo bằng văn bản cho tổ chức đăng ký đất đai để đề nghị cung cấp, bổ sung thông tin làm căn cứ xác định nghĩa vụ tài chính.",
          thoiHan: { ngay: 2, nguyenVan: "trong thời hạn không quá 02 (hai) ngày làm việc kể từ ngày nhận được Phiếu chuyển thông tin điện tử", moc: "Kể từ ngày nhận được Phiếu chuyển thông tin điện tử" } },
        { id: "b3", loai: "buoc", lane: "kbnn", diemCuoi: true, hang: 4, ten: "Nhận Thông báo để theo dõi, hạch toán", canCu: { dieu: "18", khoan: "2" },
          nguyenVan: "Thông báo nộp tiền sử dụng đất, tiền thuê đất được gửi đồng thời cho Kho bạc Nhà nước khu vực X để theo dõi, hạch toán theo quy định.",
          thoiHan: { ngay: null, ghiChu: "Gửi đồng thời với Thông báo." }, vanDe: ["VD03"] },
        { id: "b4", loai: "buoc", lane: "nguoi-su-dung-dat", hang: 4, ten: "Hoàn thành nộp nghĩa vụ tài chính vào ngân sách nhà nước", canCu: { dieu: "18", khoan: "4" },
          nguyenVan: "sau khi người sử dụng đất hoàn thành nộp nghĩa vụ tài chính vào ngân sách Nhà nước",
          thoiHan: { ngay: null, ghiChu: "Không quy định tại Điều 18. Thời gian thực hiện nghĩa vụ tài chính không tính vào thời gian giải quyết thủ tục (Điều 8 khoản 1)." } },
        { id: "b5", loai: "buoc", lane: "co-quan-thue", hang: 5, ten: "Thông báo xác nhận đã hoàn thành nghĩa vụ tài chính", canCu: { dieu: "18", khoan: "4" },
          nguyenVan: "Trong thời gian không quá 01 (một) ngày làm việc, cơ quan thuế thực hiện thông báo xác nhận đã hoàn thành nghĩa vụ tài chính sau khi người sử dụng đất hoàn thành nộp nghĩa vụ tài chính vào ngân sách Nhà nước cho tổ chức đăng ký đất đai theo quy định.",
          thoiHan: { ngay: 1, nguyenVan: "Trong thời gian không quá 01 (một) ngày làm việc", moc: "Sau khi người sử dụng đất hoàn thành nộp nghĩa vụ tài chính" },
          dauRa: ["Thông báo xác nhận đã hoàn thành nghĩa vụ tài chính"] },
        { id: "z", loai: "ketthuc", lane: "to-chuc-dkdd", hang: 6, ten: "Tiếp tục giải quyết thủ tục đăng ký biến động", canCu: { dieu: "18", khoan: "4" },
          ghiChuPhanMem: "Nút kết thúc do phần mềm thể hiện: tổ chức đăng ký đất đai nhận thông báo xác nhận; các bước tiếp theo theo thủ tục tương ứng tại Phụ lục III." }
      ],
      canh: [
        { tu: "a", den: "b1", loai: "chinh" },
        { tu: "b1", den: "b2", loai: "chinh", nhan: "Phiếu chuyển thông tin + hồ sơ" },
        { tu: "b1", den: "x2", loai: "dieu-kien", nhan: "Phiếu sai sót / chưa đủ căn cứ" },
        { tu: "x2", den: "b1", loai: "tra-lai", nhan: "Từ chối, đề nghị bổ sung" },
        { tu: "b2", den: "b3", loai: "dong-thoi", nhan: "Gửi đồng thời" },
        { tu: "b2", den: "b4", loai: "chinh", nhan: "Thông báo nộp tiền" },
        { tu: "b4", den: "b5", loai: "chinh", nhan: "Đã nộp NSNN" },
        { tu: "b5", den: "z", loai: "chinh", nhan: "Xác nhận hoàn thành" }
      ],
      ghiChu: []
    }
  ],

  // Quy tắc chung về thời hạn — trích dẫn để hiển thị cạnh thời hạn của mọi thủ tục
  quyTacThoiHan: [
    { dieu: "8", khoan: "1", tieuDe: "Mốc tính và các khoảng thời gian không tính vào thời hạn" },
    { dieu: "8", khoan: "2", tieuDe: "Trích lục bản đồ (song song) và đo đạc thửa đất" },
    { dieu: "8", khoan: "3", tieuDe: "Lấy ý kiến đơn vị liên quan" },
    { dieu: "8", khoan: "4", tieuDe: "Trách nhiệm về thời hạn của từng cơ quan" },
    { dieu: "6", khoan: "3", tieuDe: "Yêu cầu bổ sung hồ sơ (một lần)" },
    { dieu: "7", khoan: "4", tieuDe: "Chậm trả kết quả, gia hạn" },
    { dieu: "4", khoan: "2", tieuDe: "Hồ sơ chưa đầy đủ: phiếu yêu cầu bổ sung, phiếu từ chối" }
  ]
};
