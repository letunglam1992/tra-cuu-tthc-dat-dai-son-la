/* Phí, lệ phí lĩnh vực đất đai trên địa bàn tỉnh Sơn La — trích NGUYÊN VĂN mức thu từ Nghị quyết số 155/2025/NQ-HĐND
 * ngày 29/12/2025 của HĐND tỉnh (tệp do người dùng cung cấp ngày 29/10/2026). Chỉ trích các khoản liên quan đến đất đai.
 * Trường "theoThuTuc" là phân loại do phần mềm lập (từ cột Phí, lệ phí của danh mục TTHC công bố 21/8/2025) — để gợi ý khoản thu.
 */
window.QD75_PHI = {
  vanBan: {
    ten: "Nghị quyết số 155/2025/NQ-HĐND", ngay: "29/12/2025", coQuan: "Hội đồng nhân dân tỉnh Sơn La", nguoiKy: "Lò Minh Hùng — Chủ tịch",
    trichYeu: "Quy định mức thu, miễn, giảm, thu, nộp, quản lý và sử dụng các khoản phí, lệ phí thuộc thẩm quyền quyết định của Hội đồng nhân dân tỉnh",
    hieuLuc: "08/01/2026", canCuHieuLuc: "Khoản 1 Điều 5",
    hetHieuLuc: [
      "Nghị quyết số 135/2020/NQ-HĐND ngày 31/7/2020 của Hội đồng nhân dân tỉnh",
      "Nghị quyết số 34/2022/NQ-HĐND ngày 13/7/2022 của Hội đồng nhân dân tỉnh",
      "Nghị quyết số 53/2023/NQ-HĐND ngày 18/4/2023 của Hội đồng nhân dân tỉnh",
      "Nghị quyết số 67/2023/NQ-HĐND ngày 04/10/2023 của Hội đồng nhân dân tỉnh",
      "Nghị quyết số 69/2023/NQ-HĐND ngày 07/12/2023 của Hội đồng nhân dân tỉnh"
    ],
    luatPhi: { ten: "Luật Phí và lệ phí", nguyenVan: "Luật Phí và lệ phí số 97/2015/QH13 được sửa đổi, bổ sung bởi Luật số 09/2017/QH14, Luật số 23/2018/QH14, Luật số 72/2020/QH14, Luật số 16/2023/QH15, Luật số 20/2023/QH15, Luật số 24/2023/QH15, Luật số 33/2024/QH15, Luật số 35/2024/QH15, Luật số 47/2024/QH15, Luật số 60/2024/QH15, Luật số 74/2025/QH15, Luật số 89/2025/QH15, Luật số 94/2025/QH15, Luật số 95/2025/QH15" }
  },

  // Phụ lục I, mục X — Phí thẩm định hồ sơ cấp giấy chứng nhận quyền sử dụng đất
  thamDinh: {
    ten: "Phí thẩm định hồ sơ cấp giấy chứng nhận quyền sử dụng đất", viTri: "Phụ lục I, mục X",
    mienNop: "Cá nhân đề nghị thẩm định hồ sơ cấp giấy chứng nhận quyền sử dụng đất thuộc hộ nghèo, người cao tuổi, người khuyết tất, người có công với cách mạng, đồng bào dân tộc thiểu số ở các xã có điều kiện kinh tế - xã hội đặc biệt khó khăn.",
    toChucLanDau: [ // [từ m², dưới m², mức thu đồng/bộ hồ sơ]
      [0, 1000, 1050000, "Dự án có quy mô diện tích dưới 1.000 m2 đất"],
      [1000, 5000, 2110000, "Dự án có quy mô diện tích từ 1.000 đến dưới 5.000m2 đất"],
      [5000, 10000, 3170000, "Dự án có quy mô diện tích từ 5.000 đến dưới 10.000m2 đất"],
      [10000, 100000, 5290000, "Dự án có quy mô diện tích từ 10.000 đến dưới 100.000m2 đất"],
      [100000, 300000, 6900000, "Dự án có quy mô diện tích từ 100.000 đến dưới 300.000m2 đất"],
      [300000, 500000, 8050000, "Dự án có quy mô diện tích từ 300.000 đến dưới 500.000m2 đất"],
      [500000, null, 8600000, "Dự án có quy mô diện tích từ 500.000m2 đất trở lên"]
    ],
    caNhanLanDau: { "nha-o": { "do-thi": 210000, "nong-thon": 100000 }, "kinh-doanh": { "do-thi": 310000, "nong-thon": 150000 } },
    tyLeBienDong: 50,
    bienDongNguyenVan: "Cấp lại, cấp đổi, đăng ký biến động đất đai (bao gồm chứng nhận (xác nhận) biến động vào giấy chứng nhận đã cấp và cấp mới giấy chứng nhận): Bằng 50% mức thu tương ứng đối với mỗi nội dung quy định tại điểm 1",
    tyLeDeLai: "Tổ chức thu phí (đơn vị sự nghiệp công lập, tổ chức được giao cung cấp dịch vụ công…, trừ tổ chức được giao thu phí là cơ quan nhà nước) được trích lại 90% số tiền phí thực thu được"
  },

  // Phụ lục II, mục III — Lệ phí cấp Giấy chứng nhận quyền sử dụng đất; quyền sở hữu nhà, tài sản gắn liền với đất
  lePhi: {
    ten: "Lệ phí cấp Giấy chứng nhận quyền sử dụng đất; quyền sở hữu nhà, tài sản gắn liền với đất", viTri: "Phụ lục II, mục III",
    mienNop: [
      "Cá nhân đề nghị cấp giấy chứng nhận quyền sử dụng đất thuộc hộ nghèo, người cao tuổi, người khuyết tất, người có công với cách mạng, đồng bào dân tộc thiểu số ở các xã có điều kiện kinh tế - xã hội đặc biệt khó khăn.",
      "Miễn nộp lệ phí cấp Giấy chứng nhận quyền sử dụng đất nông nghiệp (trong trường hợp nhận chuyển nhượng quyền sử dụng đất nông nghiệp) của cá nhân có liên quan đến nuôi trồng, khai thác dược liệu trên địa bàn tỉnh Sơn La.",
      "Miễn lệ phí cấp giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất đối với tổ chức, cá nhân khi thực hiện thủ tục chứng nhận đăng ký biến động về đất đai do thay đổi địa giới và tên gọi của đơn vị hành chính, thôn, tổ dân phố theo quy định của cấp có thẩm quyền trên địa bàn tỉnh.",
      "Miễn lệ phí cấp giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất đối với trường hợp đăng ký biến động về đất đai do thay đổi thông tin (thay đổi họ, chữ đệm và tên khai sinh, thông tin về thẻ căn cước công dân, thẻ căn cước) của người sử dụng đất, chủ sở hữu tài sản gắn liền với đất.",
      "Miễn lệ phí cấp đổi giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà tài sản gắn liền với đất do giấy chứng nhận đã cấp bị ố, nhòe, rách, hư hỏng hoặc do lỗi của cơ quan đăng ký đất đai."
    ],
    // Cá nhân tại phường (mục I); cá nhân tại xã = 50% (mục II); tổ chức (mục III)
    caNhanPhuong: [
      { id: "lan-dau", noiDung: "Cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất — Cấp lần đầu", donVi: "Đồng/Giấy", mucThu: 90000 },
      { id: "cap-moi-bien-dong", noiDung: "Cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất — Cấp lại, cấp đổi, đăng ký biến động đất đai (bao gồm chứng nhận (xác nhận) biến động vào giấy chứng nhận đã cấp và cấp mới giấy chứng nhận)", donVi: "Đồng/Giấy", mucThu: 30000 },
      { id: "qsdd-lan-dau", noiDung: "Trường hợp Giấy chứng nhận cấp cho cá nhân chỉ có quyền sử dụng đất (không có tài sản gắn liền với đất) — Cấp lần đầu", donVi: "Đồng/Giấy", mucThu: 25000 },
      { id: "qsdd-cap-moi-bien-dong", noiDung: "Trường hợp Giấy chứng nhận cấp cho cá nhân chỉ có quyền sử dụng đất (không có tài sản gắn liền với đất) — Cấp lại, cấp đổi, đăng ký biến động đất đai (bao gồm chứng nhận (xác nhận) biến động vào giấy chứng nhận đã cấp và cấp mới giấy chứng nhận)", donVi: "Đồng/Giấy", mucThu: 20000 },
      { id: "chung-nhan-bien-dong", noiDung: "Chứng nhận đăng ký biến động về đất đai", donVi: "Đồng/Lần", mucThu: 28000 },
      { id: "trich-luc", noiDung: "Trích lục bản đồ, văn bản, số liệu hồ sơ địa chính", donVi: "Đồng/Lần", mucThu: 15000 }
    ],
    tyLeCaNhanXa: 50,
    toChuc: [
      { id: "lan-dau", noiDung: "Cấp Giấy chứng nhận quyền sử dụng đất, tài sản gắn liền với đất", donVi: "Đồng/Giấy", mucThu: 400000 },
      { id: "qsdd-lan-dau", noiDung: "Trường hợp Giấy chứng nhận cấp cho tổ chức chỉ có quyền sử dụng đất (không có tài sản gắn liền với đất)", donVi: "Đồng/Giấy", mucThu: 100000 },
      { id: "cap-moi-bien-dong", noiDung: "Cấp lại, cấp đổi, đăng ký biến động đất đai (bao gồm chứng nhận (xác nhận) biến động vào giấy chứng nhận đã cấp và cấp mới giấy chứng nhận)", donVi: "Đồng/Giấy", mucThu: 40000 },
      { id: "chung-nhan-bien-dong", noiDung: "Chứng nhận đăng ký biến động về đất đai", donVi: "Đồng/Lần", mucThu: 30000 },
      { id: "trich-luc", noiDung: "Trích lục bản đồ địa chính, văn bản, số liệu hồ sơ địa chính", donVi: "Đồng/Lần", mucThu: 30000 }
    ]
  },

  // Các khoản phí khác thuộc lĩnh vực đất đai (Phụ lục I)
  khac: [
    { id: "khai-thac-tai-lieu", ten: "Phí khai thác và sử dụng tài liệu đất đai", viTri: "Phụ lục I, mục XIV",
      mienNop: "Cá nhân có nhu cầu khai thác và sử dụng tài liệu về đất đai thuộc hộ nghèo, người cao tuổi, người khuyết tất, người có công với cách mạng, đồng bào dân tộc thiểu số ở các xã có điều kiện kinh tế - xã hội đặc biệt khó khăn. Miễn phí khai thác và sử dụng tài liệu đất đai đối với trường hợp phục vụ cho mục đích quốc phòng, an ninh, phòng, chống thiên tai; miễn phí cho các bộ, ngành, địa phương khi kết nối, chia sẻ cơ sở dữ liệu quốc gia về đất đai…",
      bang: [
        ["Bản đồ giấy (Bản đồ địa chính) — Bản đồ cơ sở tỷ lệ 1/10.000", "Tờ", 45000], ["Bản đồ giấy — Bản đồ cơ sở tỷ lệ 1/25.000", "Tờ", 55000], ["Bản đồ giấy — Bản đồ tọa độ tỷ lệ 1/1.000", "Tờ", 35000], ["Bản đồ giấy — Bản đồ tọa độ tỷ lệ 1/5.000", "Tờ", 45000],
        ["Tọa độ cơ sở hạng 4", "Điểm", 35000], ["Độ cao cơ sở hạng 4", "Điểm", 25000],
        ["Bản đồ địa chính dạng số tỷ lệ 1/1.000 — lớp Thửa đất", "Lớp", 60000], ["Bản đồ địa chính dạng số tỷ lệ 1/5.000 — lớp Thửa đất", "Lớp", 90000], ["Bản đồ địa chính dạng số tỷ lệ 1/10.000 — lớp Thửa đất", "Lớp", 115000], ["Bản đồ địa chính dạng số tỷ lệ 1/25.000 — lớp Thửa đất", "Lớp", 165000],
        ["Thống kê các loại đất", "Xã", 20000],
        ["Hồ sơ (giao đất, cấp đất, thu hồi đất, chuyển nhượng đất, thanh tra) — Dưới 10 tờ", "Hồ sơ", 20000], ["Hồ sơ — Từ 11 đến 20 tờ", "Hồ sơ", 25000], ["Hồ sơ — Từ 21 đến 30 tờ", "Hồ sơ", 35000], ["Hồ sơ — Từ 31 đến 50 tờ", "Hồ sơ", 55000], ["Hồ sơ — Từ 51 tờ trở lên", "Hồ sơ", 65000]
      ], ghiChu: "Bản đồ dạng số còn các lớp khác (Điểm KCTĐ, Giao thông, Thủy hệ, Địa giới, Quy hoạch…) — xem toàn văn Nghị quyết. Phí khai thác các bản đồ chuyên đề áp dụng theo bản đồ cùng tỷ lệ.", tyLeDeLai: "90%" },
    { id: "thong-tin-gdbd", ten: "Phí cung cấp thông tin về giao dịch bảo đảm bằng quyền sử dụng đất, tài sản gắn liền với đất", viTri: "Phụ lục I, mục XV",
      bang: [["Cung cấp thông tin về giao dịch bảo đảm bằng quyền sử dụng đất, tài sản gắn liền với đất", "Trường hợp", 30000]], tyLeDeLai: "85%",
      mienNop: "Cá nhân yêu cầu cung cấp thông tin về biện pháp bảo đảm… thuộc hộ nghèo, người cao tuổi, người khuyết tật, người có công với cách mạng, đồng bào dân tộc thiểu số ở các xã có điều kiện kinh tế - xã hội đặc biệt khó khăn; cung cấp thông tin cho cơ quan, người có thẩm quyền quy định tại Điều 52 Nghị định số 99/2022/NĐ-CP." },
    { id: "dang-ky-gdbd", ten: "Phí đăng ký giao dịch bảo đảm", viTri: "Phụ lục I, mục XVI",
      bang: [["Phí đăng ký biện pháp bảo đảm lần đầu", "Hồ sơ", 80000], ["Phí đăng ký thông báo xử lý tài sản bảo đảm, đăng ký thay đổi thông báo xử lý tài sản bảo đảm", "Hồ sơ", 30000]],
      mienNop: "Cá nhân đăng ký biện pháp bảo đảm bằng quyền sử dụng đất, tài sản gắn liền với đất thuộc hộ nghèo, người cao tuổi…; cá nhân, hộ gia đình đăng ký biện pháp bảo đảm vay vốn tại tổ chức tín dụng theo khoản 4 Điều 1 Nghị định số 116/2018/NĐ-CP…; chỉnh lý thông tin có sai sót do lỗi của cơ quan đăng ký; cơ quan thi hành án dân sự… yêu cầu xóa đăng ký." }
  ],

  // Phân loại khoản thu theo thủ tục (Phần mềm lập từ cột “Phí, Lệ phí” của danh mục TTHC công bố 21/8/2025):
  // "lan-dau" cấp GCN lần đầu · "bien-dong" cấp lại, cấp đổi, đăng ký biến động · "ca-hai" tùy trường hợp · "trich-luc" chỉ lệ phí trích lục
  // "khong" danh mục ghi không thu / không quy định
  theoThuTuc: {
    "I.1": "lan-dau", "I.4": "ca-hai", "I.7": "lan-dau", "I.8": "lan-dau", "II.1": "lan-dau", "II.4": "ca-hai", "II.5": "lan-dau", "II.6": "lan-dau", "II.11": "lan-dau", "II.12": "lan-dau", "III.9": "lan-dau", "III.14": "lan-dau",
    "I.3": "bien-dong", "II.3": "bien-dong", "II.7": "bien-dong", "II.8": "bien-dong", "III.1": "bien-dong", "III.2": "bien-dong", "III.3": "bien-dong", "III.4": "bien-dong", "III.5": "bien-dong", "III.6": "bien-dong", "III.7": "bien-dong",
    "III.8": "bien-dong", "III.10": "bien-dong", "III.11": "bien-dong", "III.12": "bien-dong", "III.15": "bien-dong", "III.20": "bien-dong", "III.22": "bien-dong",
    "I.9": "trich-luc", "II.9": "trich-luc", "III.17": "trich-luc",
    "I.2": "khong", "II.2": "khong", "I.10": "khong", "II.10": "khong", "III.21": "khong", "III.13": "khong", "I.5": "khong", "I.6": "khong", "II.13": "khong", "III.18": "khong", "III.19": "khong"
  },
  vanDeDanhMuc: [
    "Cột “Phí, Lệ phí” của danh mục TTHC công bố (tệp 21/8/2025) ghi mức thu theo Nghị quyết số 135/2020/NQ-HĐND — văn bản đã hết hiệu lực từ 08/01/2026 (khoản 2 Điều 5 Nghị quyết số 155/2025/NQ-HĐND). Ví dụ phí thẩm định biến động đối với tổ chức, dự án dưới 1.000 m2: danh mục ghi 520.000 đồng; Nghị quyết 155 là 50% × 1.050.000 = 525.000 đồng.",
    "Danh mục, mã 1.013947 (Xác nhận tiếp tục sử dụng đất nông nghiệp): ghi “Chứng nhận đăng ký biến động đất đai: 28.000.000 đồng/giấy” — có khả năng lỗi đánh máy (mức thu theo Nghị quyết 155/2025 là 28.000 đồng/lần)."
  ]
};
