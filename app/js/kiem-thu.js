/* Bộ kiểm thử tự động. Kết quả: bảng trên trang và window.KET_QUA_KIEM_THU (cho chạy tự động). */
(async function () {
  const ti = TT.ti;
  const kq = [];
  const tbody = document.getElementById("kq");
  function ghi(ma, nhom, noiDung, mongDoi, thucTe, dat, ghiChu) {
    const r = { ma, nhom, noiDung, mongDoi: String(mongDoi), thucTe: String(thucTe), trangThai: dat === null ? "Không kiểm tra được" : dat ? "Đạt" : "Không đạt", ghiChu: ghiChu || "" };
    kq.push(r);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="ma">${ti.e(ma)}</td><td class="chu-nho">${ti.e(nhom)}</td><td>${ti.e(noiDung)}</td><td class="chu-nho">${ti.e(r.mongDoi)}</td><td class="chu-nho">${ti.e(r.thucTe)}</td><td class="${dat ? "dat" : "truot"}">${r.trangThai}</td><td class="chu-nho">${ti.e(r.ghiChu)}</td>`;
    tbody.appendChild(tr);
  }
  const kiem = (ma, nhom, noiDung, mongDoi, fn, ghiChu) => {
    try { const [thucTe, dat] = fn(); ghi(ma, nhom, noiDung, mongDoi, thucTe, dat, ghiChu); }
    catch (err) { ghi(ma, nhom, noiDung, mongDoi, "Lỗi: " + err.message, false, ghiChu); }
  };

  let mh, tk;
  try { mh = TT.taoMoHinh(window.QD75_NGUON, window.QD75_BO_SUNG); tk = TT.taoTimKiem(mh); }
  catch (err) { ghi("KT-00", "Khởi tạo", "Dựng mô hình dữ liệu", "Không lỗi", err.message, false); return; }
  const loi = mh.kiemTra();
  const T = m => mh.thuTucTheoMa[m];

  // ---------- Dữ liệu ----------
  kiem("DL-01", "Dữ liệu", "Số thủ tục theo phụ lục", "PL I: 10, PL II: 13, PL III: 22 (tổng 45)", () => { const s = mh.thongKe.theoPhuLuc; return [`I: ${s.I}, II: ${s.II}, III: ${s.III} (${mh.thuTuc.length})`, s.I === 10 && s.II === 13 && s.III === 22]; }, "Đối chiếu danh mục mục A các phụ lục, tr.15, 42–43, 74–76");
  kiem("DL-02", "Dữ liệu", "Danh mục (mục A) khớp số lượng nội dung (mục B) từng phụ lục", "Khớp cả 3 phụ lục", () => { const s = ["phuLucI", "phuLucII", "phuLucIII"].map(k => `${mh.N[k].danhMuc.length}/${mh.N[k].thuTuc.length}`); return [s.join("; "), ["phuLucI", "phuLucII", "phuLucIII"].every(k => mh.N[k].danhMuc.length === mh.N[k].thuTuc.length)]; });
  kiem("DL-03", "Dữ liệu", "Mỗi thủ tục trích đủ 9 mục (theo nhãn bảng)", "45/45", () => { const n = mh.thuTuc.filter(t => [1, 2, 3, 4, 5, 6, 7, 8, 9].every(i => t.muc[i])).length; return [`${n}/45`, n === 45]; });
  kiem("DL-04", "Dữ liệu", "Mục để trống trong văn bản được ghi nhận, không tự điền", "Chỉ III.13 mục (9) trống; có trong vấn đề nguồn", () => { const trong = mh.thuTuc.flatMap(t => Object.values(t.muc).filter(m => !m.noiDung.trim()).map(m => t.ma + "(" + m.so + ")")); return [trong.join(", ") + (mh.vanDeNguon.some(v => v.ma === "TRONG-III.13-9") ? " — đã ghi nhận" : " — CHƯA ghi nhận"), trong.join() === "III.13(9)" && mh.vanDeNguon.some(v => v.ma === "TRONG-III.13-9")]; }, "Đã đối chiếu cấu trúc bảng trang 117 PDF");
  kiem("DL-05", "Dữ liệu", "Mã thủ tục không trùng", "45 mã duy nhất", () => { const s = new Set(mh.thuTuc.map(t => t.ma)); return [s.size + " mã", s.size === 45]; });
  kiem("DL-06", "Dữ liệu", "Quy định: số điều và tên điều trọng tâm", "24 điều; Điều 15–18 thuộc Chương III", () => { const ok = mh.dieu.length === 24 && ["15", "16", "17", "18"].every(s => /^Chương III/.test(mh.dieuTheoSo[s].chuong)); return [`${mh.dieu.length} điều`, ok]; });
  kiem("DL-07", "Dữ liệu", "Số khoản Điều 15, 16, 17, 18", "6, 5, 4, 4", () => { const s = ["15", "16", "17", "18"].map(x => mh.dieuTheoSo[x].khoan.length); return [s.join(", "), s.join() === "6,5,4,4"]; });
  kiem("DL-08", "Dữ liệu", "Phụ lục IV: số mục và số khoản mỗi mục", "6 mục: 7, 5, 4, 16, 9, 2 khoản", () => { const s = mh.phuLucIV.map(m => m.khoan.length); return [`${mh.phuLucIV.length} mục: ${s.join(", ")}`, s.join() === "7,5,4,16,9,2"]; });
  kiem("DL-09", "Dữ liệu", "Phụ lục V: số mẫu có nội dung; Mẫu 19 được ghi nhận thiếu trong danh mục", "45 mẫu; Mẫu 19 có cảnh báo", () => { const m19 = mh.mauTheoKhoa["19"]; return [`${mh.mauBieu.length} mẫu; Mẫu 19 trong danh mục: ${m19 && m19.coTrongDanhMuc}`, mh.mauBieu.length === 45 && m19 && !m19.coTrongDanhMuc]; });
  kiem("DL-10", "Dữ liệu", "Mọi “Mẫu số …” viện dẫn trong thủ tục đều có trong Phụ lục V", "0 viện dẫn không tìm thấy", () => { const x = mh.thuTuc.flatMap(t => t.suyRa.mauKhongTimThay.map(k => t.ma + ":" + k)); return [x.length ? x.join(", ") : "0", x.length === 0]; });
  kiem("DL-11", "Dữ liệu", "Thời hạn giữ đúng đơn vị văn bản", "I.1 = 15 ngày làm việc; I.5 = 30 ngày; II.11 = 35 ngày", () => { const s = ["I.1", "I.5", "II.11"].map(m => mh.hienThiHan(T(m).suyRa.thoiHan)); return [s.join("; "), s.join("|") === "15 ngày làm việc|30 ngày|35 ngày"]; }, "Đối chiếu nguyên văn mục (3) tr.18, 29, 68");
  kiem("DL-12", "Dữ liệu", "Thủ tục ghi thời hạn bằng “ngày” được nêu là vấn đề cần xác minh", "I.5, II.2, II.4, II.11", () => { const s = mh.vanDeNguon.filter(v => v.ma.startsWith("DONVI-")).map(v => v.thuTuc); return [s.join(", "), s.join() === "I.5,II.2,II.4,II.11"]; });
  kiem("DL-13", "Dữ liệu", "Đánh số bước giữ nguyên theo văn bản (III.14 không có Bước 3)", "III.14: 1, 2, 4, 5 và được ghi nhận", () => { const s = T("III.14").buoc.buoc.map(b => b.so).join(", "); return [s, s === "1, 2, 4, 5" && mh.vanDeNguon.some(v => v.ma === "BUOC-III.14")]; });
  kiem("DL-14", "Dữ liệu", "Đối chiếu nội dung mẫu: I.1 mục (5) nêu Chủ tịch UBND tỉnh có thẩm quyền", "Chứa “Cơ quan có thẩm quyền quyết định: Chủ tịch Ủy ban nhân dân tỉnh”", () => { const s = T("I.1").muc[5].noiDung; return [s.split("\n")[0], s.includes("Cơ quan có thẩm quyền quyết định: Chủ tịch Ủy ban nhân dân tỉnh")]; }, "tr.18");
  kiem("DL-15", "Dữ liệu", "Đối chiếu nội dung: Điều 5 khoản 3 (VBDLIS), Điều 8 khoản 3 (lấy ý kiến 03 ngày làm việc)", "Có cả hai nội dung", () => { const a = mh.giaiCanCu({ dieu: "5", khoan: "3" }).noiDung, b = mh.giaiCanCu({ dieu: "8", khoan: "3" }).noiDung; return [`VBDLIS: ${a.includes("VBDLIS")}; 03 ngày: ${b.includes("03 (ba) ngày làm việc")}`, a.includes("VBDLIS") && b.includes("03 (ba) ngày làm việc")]; });
  kiem("DL-16", "Dữ liệu", "Phân biệt nội dung pháp lý và chỉ mục suy ra", "Chỉ mục nằm trong trường suyRa, không ghi đè nguyên văn", () => { const t = T("I.1"); return [Object.keys(t.suyRa).join(", "), t.muc[3].noiDung.length > 0 && t.suyRa.thoiHan && !("thoiHan" in t.muc)]; });

  // ---------- Quy trình Chương III ----------
  kiem("QT-01", "Quy trình NVTC", "Số quy trình được mô hình hóa", "5 (Điều 15, Điều 15 khoản 6, Điều 16, 17, 18)", () => [mh.quyTrinh.map(q => q.id).join(", "), mh.quyTrinh.length === 5]);
  kiem("QT-02", "Quy trình NVTC", "Mọi đoạn nguyên văn của các bước khớp đúng khoản, điều được dẫn", "100% khớp", () => { const x = loi.find(k => k.nhom === "Nguyên văn" && k.mucDo === "dat"); const sai = loi.filter(k => k.nhom === "Nguyên văn" && k.mucDo === "loi"); return [x ? x.noiDung : sai.map(s => s.noiDung).join("; "), !!x && !sai.length]; });
  kiem("QT-03", "Quy trình NVTC", "Toàn vẹn sơ đồ: cạnh trỏ tới bước có thật, mọi bước có luồng vào/ra, làn khai báo", "0 lỗi", () => { const s = loi.filter(k => k.nhom === "Quy trình" && k.mucDo !== "dat"); return [s.length ? s.map(x => x.noiDung).join("; ") : "0 lỗi", !s.length]; });
  kiem("QT-04", "Quy trình NVTC", "Thời hạn từng bước theo văn bản (Điều 15)", "Chuyển Phiếu 2; thuế 3; từ chối 2; thu NSNN 1 ngày làm việc", () => { const q = mh.quyTrinhTheoId.QT15; const s = ["b3", "b4", "x4", "b7"].map(id => q.buocTheoId[id].thoiHan.ngay); return [s.join(", "), s.join() === "2,3,2,1"]; });
  kiem("QT-05", "Quy trình NVTC", "Bước văn bản không nêu thời hạn không bị gán số ngày", "QT15/b8, QT16/b6 (thuế chuyển thông tin thu nộp) không có số ngày", () => { const a = mh.quyTrinhTheoId.QT15.buocTheoId.b8.thoiHan.ngay, b = mh.quyTrinhTheoId.QT16.buocTheoId.b6.thoiHan.ngay; return [`${a}, ${b}`, a === null && b === null]; });
  kiem("QT-06", "Quy trình NVTC", "Nhánh ngoại lệ (từ chối/trả lại) được thể hiện", "Mỗi quy trình Điều 15, 16, 17, 18 có cạnh trả lại", () => { const s = ["QT15", "QT16", "QT17", "QT18"].map(id => mh.quyTrinhTheoId[id].canh.some(c => c.loai === "tra-lai")); return [s.join(", "), s.every(Boolean)]; });
  kiem("QT-07", "Quy trình NVTC", "Mọi căn cứ trích dẫn trong dữ liệu biên soạn giải được", "0 căn cứ hỏng", () => { const hong = []; for (const q of mh.quyTrinh) for (const b of q.buoc) if (!mh.giaiCanCu({ dieu: b.canCu.dieu, khoan: b.canCu.khoan })) hong.push(q.id + "/" + b.id); for (const r of mh.B.quyTacThoiHan) if (!mh.giaiCanCu({ dieu: r.dieu, khoan: r.khoan })) hong.push("quyTac " + r.dieu + "." + r.khoan); return [hong.length ? hong.join(", ") : "0", !hong.length]; });

  // ---------- Tiện ích, tìm kiếm ----------
  kiem("TI-01", "Tiện ích", "Chuẩn hóa tiếng Việt bỏ dấu, chữ thường, gộp khoảng trắng", "“  Đăng   KÝ Đất ” → “dang ky dat”", () => { const s = ti.chuanHoa("  Đăng   KÝ Đất "); return [s, s === "dang ky dat"]; });
  kiem("TI-02", "Tiện ích", "Chuẩn hóa ký hiệu mẫu", "04a → 4a; 4b → 4b; 19 → 19", () => { const s = ["04a", "4b", "19"].map(ti.chuanKyHieu).join(","); return [s, s === "4a,4b,19"]; });
  kiem("TI-03", "Tiện ích", "Thoát ký tự HTML trong nội dung", "<b>&\" → &lt;b&gt;&amp;&quot;", () => { const s = ti.e('<b>&"'); return [s, s === "&lt;b&gt;&amp;&quot;"]; });
  kiem("TI-04", "Tiện ích", "Tô sáng giữ nguyên văn gốc", "“Tách thửa” tô sáng khi tìm “tach thua”", () => { const s = ti.toSang("Tách thửa đất", ["tach thua"]); return [s, s === "<mark>Tách thửa</mark> đất"]; });
  kiem("TI-05", "Tiện ích", "Khớp đầu từ, không khớp giữa từ", "“an” không khớp “toàn”; khớp “an ninh”", () => [`${ti.chuaDauTu("toan bo", "an")} / ${ti.chuaDauTu("quoc phong an ninh", "an")}`, !ti.chuaDauTu("toan bo", "an") && ti.chuaDauTu("quoc phong an ninh", "an")]);
  kiem("TI-06", "Tiện ích", "Nhận diện thời hạn phân số", "“không quá 1/2 ngày làm việc” → 0,5 ngày làm việc", () => { const h = mh.thoiHanRutGon("Trong thời gian không quá 1/2 ngày làm việc"); return [mh.hienThiHan(h), h.ngay === 0.5 && h.donVi === "ngày làm việc"]; });
  const timThuTuc = q => tk.tim(q, { loai: "thu-tuc" }).ketQua.map(r => r.id);
  kiem("TK-01", "Tìm kiếm", "Tìm không dấu", "“tach thua” → III.3 đứng đầu", () => { const r = timThuTuc("tach thua"); return [r.slice(0, 3).join(", "), r[0] === "III.3"]; });
  kiem("TK-02", "Tìm kiếm", "Có dấu và không dấu cho cùng kết quả", "“tách thửa” = “tach thua”", () => { const a = timThuTuc("tách thửa").join(), b = timThuTuc("tach thua").join(); return [a === b ? "Giống nhau" : "Khác nhau", a === b && a.length > 0]; });
  kiem("TK-03", "Tìm kiếm", "Khoảng trắng thừa và chữ hoa không ảnh hưởng", "“  TÁCH   thửa ” = “tách thửa”", () => { const a = timThuTuc("  TÁCH   thửa ").join(), b = timThuTuc("tách thửa").join(); return [a === b ? "Giống nhau" : "Khác nhau", a === b]; });
  kiem("TK-04", "Tìm kiếm", "Không có kết quả giả", "“xyzkhongco” → 0 kết quả", () => { const n = tk.tim("xyzkhongco").ketQua.length; return [n, n === 0]; });
  kiem("TK-05", "Tìm kiếm", "Tìm cụm chính xác trong ngoặc kép", "“\"phiếu chuyển thông tin\"” có Mẫu số 19", () => { const r = tk.tim('"phiếu chuyển thông tin"', { loai: "mau" }).ketQua.map(x => x.id); return [r.join(", "), r.includes("19")]; });
  kiem("TK-06", "Tìm kiếm", "Tìm theo tên cơ quan", "“Kho bạc” → cơ quan KBNN", () => { const r = tk.tim("Kho bạc", { loai: "co-quan" }).ketQua.map(x => x.id); return [r.join(", "), r.includes("kbnn")]; });
  kiem("TK-07", "Tìm kiếm", "Mọi kết quả chứa đủ các từ khóa", "100% kết quả “giấy chứng nhận đính chính” chứa đủ 2 cụm từ", () => { const { ketQua } = tk.tim("đính chính giấy chứng nhận"); const ok = ketQua.every(r => ["dinh", "chinh", "giay", "chung", "nhan"].every(w => r.truong.some(f => ti.chuaDauTu(f.chuan, w)))); return [`${ketQua.length} kết quả`, ok && ketQua.length > 0]; });
  kiem("TK-08", "Tìm kiếm", "Tìm theo thời hạn", "“15 ngày làm việc” có I.1", () => { const r = timThuTuc("15 ngày làm việc"); return [`${r.length} thủ tục`, r.includes("I.1")]; });
  const top = (q, n) => tk.tim(q, { loai: "thu-tuc" }).ketQua.slice(0, n || 3).map(r => r.id);
  kiem("TK-09", "Tìm kiếm", "Gõ có dấu thì so khớp đúng dấu", "“thừa kế” không khớp “thừa” + “kê”; ít kết quả hơn “thua ke”", () => { const a = tk.tim("thừa kế").ketQua.length, b = tk.tim("thua ke").ketQua.length; return [`có dấu ${a} / không dấu ${b}`, a > 0 && a < b]; });
  kiem("TK-10", "Tìm kiếm", "Từ đồng nghĩa, cách gọi thông dụng", "“sổ đỏ”, “GCN” → Giấy chứng nhận; “QSDĐ”; “chi cục thuế” → Cơ quan thuế; “NVTC”", () => { const a = tk.tim("sổ đỏ").ketQua.length, b = tk.tim("QSDĐ").ketQua.length, c = tk.tim("chi cục thuế", { loai: "co-quan" }).ketQua.map(x => x.id), d = tk.tim("NVTC").ketQua.length; return [`sổ đỏ ${a}; QSDĐ ${b}; chi cục thuế → ${c[0]}; NVTC ${d}`, a > 10 && b > 10 && c[0] === "co-quan-thue" && d > 10]; });
  kiem("TK-11", "Tìm kiếm", "Sửa lỗi gõ, từ viết liền", "“chuyen nhuog” ≈ “chuyển nhượng”; “tachthua” → III.3", () => { const a = tk.tim("chuyen nhuog"), b = top("tachthua", 1); return [`${a.ketQua.length} kết quả, sửa: ${a.giaiThich.suaChinhTa.map(x => x.thanh).join(",")}; tachthua → ${b[0]}`, a.ketQua.length > 0 && b[0] === "III.3"]; });
  kiem("TK-12", "Tìm kiếm", "Mã thủ tục, mẫu biểu", "“III.3” → III.3; “mẫu 19” → Mẫu số 19", () => { const a = tk.tim("III.3").ketQua[0], b = tk.tim("mẫu 19").ketQua[0]; return [`${a && a.id}; ${b && b.id}`, a && a.id === "III.3" && b && b.id === "19"]; });
  kiem("TK-13", "Tìm kiếm", "Số + đơn vị thời gian khớp cách viết văn bản", "“15 ngày làm việc” khớp “15 (mười lăm) ngày làm việc” ở I.1", () => { const r = timThuTuc("15 ngày làm việc"); return [`${r.length} thủ tục`, r.includes("I.1")]; });
  kiem("TK-14", "Tìm kiếm", "Không có kết quả: gợi ý bỏ từ kèm số kết quả thật", "“sổ đỏ xe máy” → 0 kết quả, có gợi ý", () => { const r = tk.tim("sổ đỏ xe máy"); return [`${r.ketQua.length} kết quả; gợi ý: ${r.goiY.map(g => g.q + " (" + g.soKetQua + ")").join("; ")}`, r.ketQua.length === 0 && r.goiY.length > 0 && r.goiY.every(g => tk.tim(g.q).ketQua.length === g.soKetQua)]; });
  kiem("TK-15", "Tìm kiếm", "Thứ hạng theo tình huống thường gặp", "tách thửa → III.3; cấp lại GCN bị mất → III.7; đính chính → I.9/II.9/III.17; cấp lần đầu → II.6 trong top 3", () => { const a = top("tách thửa", 1)[0], b = top("cấp lại giấy chứng nhận bị mất", 1)[0], c = top("đính chính"), d = top("cap giay chung nhan lan dau"); return [`${a}; ${b}; ${c.join(",")}; ${d.join(",")}`, a === "III.3" && b === "III.7" && ["I.9", "II.9", "III.17"].every(x => c.includes(x)) && d.includes("II.6")]; });
  // ---------- Hiệu lực văn bản ----------
  kiem("HL-01", "Hiệu lực", "Số, ngày ban hành, ngày hiệu lực theo bản ký ban hành", "75/2026/QĐ-UBND; 22/10/2026; hiệu lực 22/10/2026", () => { const vb = mh.B.vanBan; return [`${vb.soKyHieu.giaTri}; ${vb.ngayBanHanh.giaTri}; ${vb.ngayHieuLuc.giaTri}; ${mh.daDoiChieuBanKy ? "đã đối chiếu bản ký" : "chưa đối chiếu"}`, vb.soKyHieu.giaTri === "75/2026/QĐ-UBND" && vb.ngayBanHanh.giaTri === "22/10/2026" && vb.ngayHieuLuc.giaTri === "22/10/2026" && mh.daDoiChieuBanKy]; });
  kiem("HL-02", "Hiệu lực", "Tình trạng tự tính theo ngày hiệu lực", "21/10/2026: chưa có hiệu lực; 22/10/2026: có hiệu lực", () => { const a = mh.tinhHieuLuc(new Date(2026, 9, 21)).ma, b = mh.tinhHieuLuc(new Date(2026, 9, 22)).ma; return [`${a} / ${b}`, a === "chua-co-hieu-luc" && b === "co-hieu-luc"]; });
  kiem("HL-03", "Hiệu lực", "Điều 2 khoản 1 điền ngày theo bản ký; văn bản hết hiệu lực theo khoản 2", "“kể từ ngày 22 tháng 10 năm 2026”; QĐ 45/2021 và QĐ 106/2025", () => { const k1 = mh.dieuQD.find(d => d.so === "2").khoan[0].noiDung, ds = mh.B.vanBan.vanBanHetHieuLuc.map(x => x.ten).join("; "); return [k1, k1.includes("kể từ ngày 22 tháng 10 năm 2026") && /45\/2021/.test(ds) && /106\/2025/.test(ds)]; });
  // ---------- Thời hạn ----------
  const th = TT.thoiHan, kh = th.khoa;
  kiem("TH-01", "Thời hạn", "Âm lịch: Tết Nguyên đán, Giỗ Tổ Hùng Vương", "Tết 2025: 29/01; 2026: 17/02; 2027: 06/02 · Giỗ Tổ 2026: 26/04", () => { const s = [2025, 2026, 2027].map(y => kh(th.amSangDuong(1, 1, y))).join(", ") + " · " + kh(th.amSangDuong(10, 3, 2026)); return [s, s === "2025-01-29, 2026-02-17, 2027-02-06 · 2026-04-26"]; });
  kiem("TH-02", "Thời hạn", "Đếm ngày làm việc từ ngày tiếp theo, bỏ thứ Bảy, Chủ nhật", "Nhận 29/10/2026 (thứ Năm), 12 ngày làm việc → 16/11/2026", () => { const r = th.tinh({ ngayNhan: new Date(2026, 9, 29), soNgay: 12, donVi: "ngày làm việc" }); return [th.hienThi(r.ngayHen), kh(r.ngayHen) === "2026-11-16"]; });
  kiem("TH-03", "Thời hạn", "Cộng thời gian xã khu vực III", "III.3 nhận 29/10/2026: 12 + 10 ngày làm việc → 30/11/2026", () => { const r = th.tinh({ ngayNhan: new Date(2026, 9, 29), soNgay: 12, donVi: "ngày làm việc", tangThem: 10 }); return [th.hienThi(r.ngayHen), kh(r.ngayHen) === "2026-11-30"]; });
  kiem("TH-04", "Thời hạn", "Trừ ngày lễ, nghỉ bù khi lễ trùng cuối tuần", "Nhận 31/12/2026, 1 ngày làm việc → 04/01/2027 (1/1 nghỉ lễ); 1/5/2027 thứ Bảy → nghỉ bù 3/5", () => { const r = th.tinh({ ngayNhan: new Date(2026, 11, 31), soNgay: 1, donVi: "ngày làm việc" }); const bu = th.thongTinNgay(new Date(2027, 4, 3)); return [`${th.hienThi(r.ngayHen)}; 03/05/2027: ${bu.ly || "ngày làm việc"}`, kh(r.ngayHen) === "2027-01-04" && !bu.lam]; });
  kiem("TH-05", "Thời hạn", "Thời hạn tính bằng “ngày”: ngày cuối là ngày nghỉ thì lùi sang ngày làm việc tiếp theo", "Nhận 23/10/2026, 30 ngày → 22/11 (Chủ nhật) → 23/11/2026", () => { const r = th.tinh({ ngayNhan: new Date(2026, 9, 23), soNgay: 30, donVi: "ngày" }); return [th.hienThi(r.ngayHen), kh(r.ngayHen) === "2026-11-23" && r.canhBao.length > 0]; });
  kiem("TH-06", "Thời hạn", "Năm chưa có thông báo lịch nghỉ: tạm tính Tết và cảnh báo", "Hồ sơ qua Tết 2027 có cảnh báo “tạm tính”", () => { const r = th.tinh({ ngayNhan: new Date(2027, 0, 25), soNgay: 15, donVi: "ngày làm việc" }); return [r.canhBao.join(" ").slice(0, 80), r.canhBao.some(c => /TẠM TÍNH/.test(c)) && r.nghiBiTru.some(x => x.loai === "tam-tinh")]; });
  kiem("TH-07", "Thời hạn", "Nhận diện số ngày tăng thêm cho xã khu vực III ở mục (3)", "45/45 thủ tục có nêu khu vực III đều nhận diện được", () => { const co = mh.thuTuc.filter(t => /khu vực III/i.test(t.muc[3].noiDung)), ok = co.filter(t => th.tangThemKhuVucIII(t.muc[3].noiDung)); return [`${ok.length}/${co.length}`, ok.length === co.length && co.length > 0]; });

  // ---------- Xuất Word ----------
  let docxMau19 = null;
  try {
    let hong = [];
    for (const m of mh.mauBieu) {
      const b = new Uint8Array(await TT.word.taoDocx(TT.word.khoiMau(m, mh.B.vanBan), { tieuDe: m.ten, tacGia: "kiem thu" }).arrayBuffer());
      // Đọc lại gói ZIP: chữ ký, CRC từng tệp, document.xml là XML hợp lệ
      const dv = new DataView(b.buffer); let p = 0, so = 0, docXml = null;
      while (dv.getUint32(p, true) === 0x04034b50) {
        const crc = dv.getUint32(p + 14, true), co = dv.getUint32(p + 18, true), dt = dv.getUint16(p + 26, true);
        const ten = new TextDecoder().decode(b.subarray(p + 30, p + 30 + dt)); const du = b.subarray(p + 30 + dt, p + 30 + dt + co);
        if (TT.word.crc32(du) !== crc) hong.push(`${m.kyHieu}:${ten} CRC`);
        if (ten === "word/document.xml") docXml = new TextDecoder().decode(du);
        p += 30 + dt + co; so++;
      }
      if (so !== 4 || !docXml) hong.push(`${m.kyHieu}: ${so} tệp con`);
      else if (new DOMParser().parseFromString(docXml, "application/xml").querySelector("parsererror")) hong.push(`${m.kyHieu}: XML lỗi`);
      if (m.khoa === "19") docxMau19 = btoa(Array.from(b, c => String.fromCharCode(c)).join(""));
    }
    ghi("WD-01", "Xuất Word", "Tạo tệp .docx cho toàn bộ mẫu biểu Phụ lục V", "45/45 tệp: ZIP đúng chữ ký, CRC khớp, document.xml hợp lệ", hong.length ? hong.join(", ") : `${mh.mauBieu.length}/${mh.mauBieu.length} hợp lệ`, !hong.length, "Mở thử bằng Microsoft Word: kiểm thử WD-03 (chỉ có khi chạy cong-cu/chay-kiem-thu.ps1 trên máy có Word)");
    const khoi = TT.word.khoiMau(mh.mauTheoKhoa["19"], mh.B.vanBan);
    const tuNguon = new Set((mh.mauTheoKhoa["19"].noiDung.match(/[\p{L}]{3,}/gu) || []).map(x => x.toLowerCase()));
    const vanBanWord = khoi.map(k => k.text).join(" ").toLowerCase();
    const giuDuoc = [...tuNguon].filter(w => vanBanWord.includes(w)).length;
    ghi("WD-02", "Xuất Word", "Nội dung tệp Word giữ nguyên văn mẫu, ghép dòng thành đoạn và ghi nguồn", "Tiêu đề Mẫu số 19; ≥ 99% từ của mẫu có trong tệp; số đoạn < số dòng PDF; có dòng nguồn", `${khoi.length} đoạn / ${mh.mauTheoKhoa["19"].noiDung.split("\n").length} dòng PDF; giữ ${giuDuoc}/${tuNguon.size} từ`, khoi[0].text.startsWith("Mẫu số 19") && giuDuoc / tuNguon.size >= 0.99 && khoi.length < mh.mauTheoKhoa["19"].noiDung.split("\n").length && /^Nguồn:/.test(khoi[khoi.length - 1].text));
    { const d = TT.word.dungDoan(mh.mauTheoKhoa["1"].noiDung); const vb = d.doan.map(x => x.text).join("\n");
      ghi("WD-04", "Xuất Word", "Mẫu 01: ghép dòng bị ngắt, khôi phục m², tách quốc hiệu và chú thích", "“1. Người đề nghị” liền một đoạn; có “(m²)”; quốc hiệu riêng; ≥ 4 chú thích", `quốc hiệu: ${d.quocHieu}; chú thích: ${d.chuThich.length}; m²: ${vb.includes("(m²)")}; đoạn 1: ${vb.includes("1. Người đề nghị")}`, d.quocHieu && d.chuThich.length >= 4 && vb.includes("(m²)") && vb.includes("1. Người đề nghị")); }
  } catch (err) { ghi("WD-01", "Xuất Word", "Tạo tệp .docx", "Không lỗi", "Lỗi: " + err.message, false); }

  // ---------- Ngoại tuyến (PWA) ----------
  if (location.protocol !== "file:") {
    try {
      const sw = await (await fetch("sw.js", { cache: "no-store" })).text();
      const ds = JSON.parse("[" + sw.split("const TEP = [")[1].split("];")[0] + "]");
      const thieu = [];
      for (const f of ds) { const r = await fetch(f, { method: "HEAD", cache: "no-store" }); if (!r.ok) thieu.push(f + " (" + r.status + ")"); }
      const tepTrang = [...document.querySelectorAll("script[src]")].map(x => x.getAttribute("src")).filter(x => !/kiem-thu/.test(x));
      const trangChinh = await (await fetch("index.html", { cache: "no-store" })).text();
      const scriptChinh = [...trangChinh.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
      const ngoaiDS = scriptChinh.filter(x => !ds.includes(x));
      ghi("PW-01", "Ngoại tuyến", "Danh sách tệp lưu ngoại tuyến (sw.js) đầy đủ, tồn tại", "Mọi tệp trong danh sách tải được; mọi script của index.html có trong danh sách", `${ds.length} tệp; thiếu: ${thieu.join(", ") || "0"}; script ngoài danh sách: ${ngoaiDS.join(", ") || "0"}`, !thieu.length && !ngoaiDS.length, `Script của trang kiểm thử: ${tepTrang.length}`);
      const mf = await (await fetch("manifest.webmanifest", { cache: "no-store" })).json();
      ghi("PW-02", "Ngoại tuyến", "Tệp manifest cài đặt ứng dụng", "Có tên, biểu tượng 192/512, start_url", `${mf.short_name}; ${mf.icons.map(i => i.sizes).join(", ")}`, !!(mf.name && mf.start_url && mf.icons.some(i => i.sizes === "192x192") && mf.icons.some(i => i.sizes === "512x512")));
    } catch (err) { ghi("PW-01", "Ngoại tuyến", "Danh sách tệp ngoại tuyến", "Không lỗi", "Lỗi: " + err.message, false); }
  }

  // ---------- Giao diện (khung ẩn) ----------
  const khung = document.getElementById("khung-ui");
  if (location.protocol === "file:") {
    ghi("UI-00", "Giao diện", "Kiểm thử giao diện trong khung", "Chạy qua máy chủ http", "Đang mở bằng file://", null, "Chạy cong-cu/chay-may-chu.ps1 rồi mở http://localhost:8686/kiem-thu.html");
  } else {
    await new Promise(r => { khung.onload = r; khung.src = "index.html#/tong-quan"; });
    const w = khung.contentWindow;
    const cho = ms => new Promise(r => setTimeout(r, ms));
    // Mở một màn hình và chờ đúng lần vẽ mới (không đọc nhầm DOM của màn hình trước)
    let lanCuoi = null, moTruoc = null;
    async function mo(hash) {
      const truoc = w.TT.soLanVe;
      let khongVe = false;
      if (lanCuoi !== hash || decodeURIComponent(w.location.hash) !== hash) {
        // Trình duyệt chặn khi đổi địa chỉ quá 200 lần/10 giây: giãn nhịp ~9 lần/giây
        const cach = Date.now() - (mo.lanTruoc || 0); if (cach < 110) await cho(110 - cach); mo.lanTruoc = Date.now();
        // Trang có thể đã đổi địa chỉ bằng replaceState (chọn bước sơ đồ): khi trùng hash thì phát sự kiện thủ công
        if (decodeURIComponent(w.location.hash) === hash) w.dispatchEvent(new w.HashChangeEvent("hashchange"));
        else w.location.hash = hash;
        for (let i = 0; i < 200 && w.TT.soLanVe === truoc; i++) await cho(10);
        // Trình duyệt không giao diện đôi khi giao sự kiện hashchange trễ: thử phát lại một lần
        if (w.TT.soLanVe === truoc) { w.dispatchEvent(new w.HashChangeEvent("hashchange")); for (let i = 0; i < 200 && w.TT.soLanVe === truoc; i++) await cho(10); }
        khongVe = w.TT.soLanVe === truoc || decodeURIComponent(w.location.hash) !== decodeURIComponent(hash);
      }
      lanCuoi = hash;
      const d = w.document;
      if (khongVe) return { h1: "", loi: `Màn hình không vẽ lại: ${hash} (địa chỉ khung: ${w.location.hash}, lần vẽ ${truoc}→${w.TT.soLanVe}, trước đó: ${moTruoc})`, khongCo: null, d };
      moTruoc = hash;
      const loiHien = d.querySelector("#noi-dung .thong-bao-do");
      const khongCo = d.querySelector("#noi-dung .trong b");
      return { h1: (d.querySelector("#noi-dung h1") || {}).textContent || "", loi: loiHien ? loiHien.textContent.trim() : null, khongCo: khongCo ? khongCo.textContent : null, d };
    }
    const tuyen = [
      ["#/tong-quan", "Tra cứu thủ tục hành chính về đất đai"], ["#/tinh-han?ma=III.3", "Tính thời hạn"], ["#/phieu", "Phiếu hướng dẫn"], ["#/phieu/III.3", "PHIẾU HƯỚNG DẪN"], ["#/thu-tuc", "Thủ tục hành chính về đất đai"], ["#/thu-tuc/I.1", "Giao đất, cho thuê đất"],
      ["#/thu-tuc/II.6/trinh-tu", "Đăng ký đất đai"], ["#/thu-tuc/III.2/ho-so", "Đăng ký biến động"], ["#/thu-tuc/I.5/thoi-han", "Thẩm định, phê duyệt phương án sử dụng đất"], ["#/thu-tuc/III.1/co-quan", "Đăng ký biến động"],
      ["#/thu-tuc/I.1/mau", "Giao đất"], ["#/thu-tuc/I.1/can-cu", "Giao đất"], ["#/quy-trinh/QT15", "tính theo bảng giá đất"], ["#/quy-trinh/QT15-6", "Tính hoặc tính lại"], ["#/quy-trinh/QT16/b1", "giá đất cụ thể"],
      ["#/quy-trinh/QT17", "Khấu trừ kinh phí"], ["#/quy-trinh/QT18", "đăng ký biến động"], ["#/thu-hoi", "Thu hồi đất"], ["#/thu-hoi/IV", "Trình tự, thủ tục bồi thường"], ["#/mau-bieu", "Hồ sơ và mẫu biểu"],
      ["#/mau-bieu?tab=giay-to", "Hồ sơ và mẫu biểu"], ["#/mau-bieu/19", "Phiếu chuyển thông tin"], ["#/co-quan", "Cơ quan"], ["#/co-quan/co-quan-thue", "Cơ quan thuế"], ["#/can-cu", "Văn bản nguồn"],
      ["#/can-cu/dieu-15", "Điều 15"], ["#/can-cu/qd-2", "Điều 2"], ["#/tra-cuu?q=tach%20thua", "Tìm trong toàn bộ dữ liệu"], ["#/doi-soat", "Đối soát"], ["#/doi-soat?tab=bang", "Đối soát"],
      ["#/doi-soat?tab=van-de", "Đối soát"], ["#/doi-soat?tab=phien-ban", "Đối soát"], ["#/gioi-thieu", "Cách sử dụng"]
    ];
    let datTuyen = 0; const saiTuyen = [];
    for (const [h, mong] of tuyen) { const r = await mo(h); if (!r.loi && r.h1.includes(mong)) datTuyen++; else saiTuyen.push(`${h}: h1="${r.h1.slice(0, 50)}" ${r.loi || ""}`); }
    ghi("UI-01", "Giao diện", "Mở các màn hình chính, mọi tab", `${tuyen.length}/${tuyen.length} màn hình hiển thị đúng tiêu đề, không lỗi`, `${datTuyen}/${tuyen.length}`, datTuyen === tuyen.length, saiTuyen.join(" | "));
    const r404 = await mo("#/khong-ton-tai"), rMa = await mo("#/thu-tuc/IX.99"), rMau = await mo("#/mau-bieu/99"), rQT = await mo("#/quy-trinh/QT99");
    ghi("UI-02", "Giao diện", "Trạng thái không tìm thấy (đường dẫn, mã thủ tục, mẫu sai)", "Hiển thị thông báo rõ ràng, không lỗi", [r404.khongCo, rMa.khongCo, rMau.khongCo, rQT.khongCo].join(" | "), !!(r404.khongCo && rMa.khongCo && rMau.khongCo && rQT.khongCo));
    const rRong = await mo("#/tra-cuu?q=xyzkhongco");
    ghi("UI-03", "Giao diện", "Tra cứu không có kết quả", "Thông báo không tìm thấy, không có kết quả giả", rRong.khongCo || "(không có thông báo)", !!(rRong.khongCo && !rRong.d.querySelector(".ket-qua-tim li")));
    const rLoc = await mo("#/thu-tuc?pl=III&han=le5");
    const soDong = rLoc.d.querySelectorAll("#noi-dung tbody tr").length;
    const mongLoc = mh.thuTuc.filter(t => t.phuLuc === "III" && t.suyRa.thoiHan && t.suyRa.thoiHan.ngay <= 5).length;
    ghi("UI-04", "Giao diện", "Lọc thủ tục theo phụ lục và thời hạn", `${mongLoc} dòng (PL III, ≤ 5 ngày)`, `${soDong} dòng`, soDong === mongLoc);
    // Duyệt mọi đường dẫn nội bộ xuất hiện trên các màn hình: không được dẫn tới trang lỗi / không tìm thấy
    const daMo = new Set(), hang = tuyen.map(t => t[0]); const hong = []; let soLk = 0;
    const thuTucMa = mh.thuTuc.map(t => "#/thu-tuc/" + t.ma); hang.push(...thuTucMa, ...mh.mauBieu.map(m => "#/mau-bieu/" + m.khoa), ...mh.dieu.map(d => "#/can-cu/dieu-" + d.so), ...mh.coQuan.map(c => "#/co-quan/" + c.id));
    const GIOI_HAN = 3000;
    while (hang.length && daMo.size < GIOI_HAN) {
      const h = hang.shift(); if (daMo.has(h)) continue; daMo.add(h);
      const r = await mo(h);
      if (r.loi || (r.khongCo && /Không có|Không tìm thấy/.test(r.khongCo) && !/tra-cuu|q=|tab=giay-to/.test(h))) hong.push(h + " → " + (r.loi || r.khongCo));
      for (const a of r.d.querySelectorAll('#noi-dung a[href^="#/"]')) { const href = a.getAttribute("href"); soLk++; if (!daMo.has(href) && !/[?&]n=\d/.test(href)) hang.push(href); }
    }
    ghi("UI-05", "Giao diện", "Duyệt toàn bộ liên kết nội bộ (thủ tục, mẫu, điều, cơ quan, quy trình…)", "0 liên kết dẫn tới trang lỗi/không tìm thấy; duyệt hết hàng đợi", `${daMo.size} trang đã mở, ${soLk} lượt liên kết, ${hong.length} hỏng, còn ${hang.length} chưa mở`, hong.length === 0 && hang.length === 0, hong.slice(0, 10).join(" | "));
    // Chip căn cứ và liên kết PDF trên mọi trang đã mở: phải giải được và trỏ trang hợp lệ
    let chip = 0, chipHong = 0, pdf = 0, pdfHong = 0; const soTrang = mh.N.thongTinTrichXuat.soTrang;
    for (const h of [...daMo].slice(0, 260)) {
      const r = await mo(h);
      for (const b of r.d.querySelectorAll("[data-can-cu]")) { chip++; if (!mh.giaiCanCu(JSON.parse(b.getAttribute("data-can-cu")))) chipHong++; }
      for (const a of r.d.querySelectorAll('a[href*="qd75.pdf#page="]')) { pdf++; const p = +a.getAttribute("href").split("page=")[1]; if (!(p >= 1 && p <= soTrang)) pdfHong++; }
    }
    ghi("UI-06", "Giao diện", "Chip căn cứ pháp lý mở được nguyên văn", "100% giải được", `${chip - chipHong}/${chip}`, chipHong === 0 && chip > 0);
    ghi("UI-07", "Giao diện", "Liên kết trang PDF gốc nằm trong phạm vi tệp", `Trang 1–${soTrang}`, `${pdf - pdfHong}/${pdf} hợp lệ`, pdfHong === 0 && pdf > 0);
    // Ngăn căn cứ mở/đóng
    const rCC = await mo("#/thu-tuc/I.1"); const nut = rCC.d.querySelector("[data-can-cu]"); nut.click(); await cho(20);
    const mo1 = rCC.d.querySelector(".ngan.mo"); const tieuDeNgan = mo1 ? mo1.querySelector("h2").textContent : "";
    rCC.d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); await cho(20);
    ghi("UI-08", "Giao diện", "Mở căn cứ tại chỗ (ngăn bên) và đóng bằng Esc", "Mở có tiêu đề căn cứ; Esc đóng", `${tieuDeNgan} / đóng: ${!rCC.d.querySelector(".ngan.mo")}`, !!mo1 && !rCC.d.querySelector(".ngan.mo"));
    // Sơ đồ: số nút, chọn bước
    try {
      const rSD = await mo("#/quy-trinh/QT17"); const nutSD = rSD.d.querySelectorAll(".sd-nut"); const canh = rSD.d.querySelectorAll(".sd-canh");
      const q = mh.quyTrinhTheoId.QT17;
      const dich = [...nutSD].find(n => n.getAttribute("data-buoc") === "n3");
      if (dich) { dich.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await cho(20); }
      const ct = rSD.d.querySelector("#chi-tiet h3");
      ghi("UI-09", "Giao diện", "Sơ đồ Điều 17: đủ nút, cạnh; bấm nút hiển thị chi tiết bước", `${q.buoc.length} nút, ${q.canh.length} cạnh; chi tiết bước n3`, `${nutSD.length} nút, ${canh.length} cạnh; ${ct ? ct.textContent.trim().slice(0, 60) : "không có chi tiết"}`, nutSD.length === q.buoc.length && canh.length === q.canh.length && !!ct && ct.textContent.includes(q.buocTheoId.n3.ten));
    } catch (err) { ghi("UI-09", "Giao diện", "Sơ đồ quy trình: đủ nút, cạnh; bấm nút hiển thị chi tiết", "Không lỗi", "Lỗi: " + err.message, false); }
    // Nút Quay lại, hộp bản quyền
    try {
      await mo("#/thu-tuc"); const rQL = await mo("#/thu-tuc/II.4");
      const coNut = !!rQL.d.querySelector("[data-quay-lai]");
      const truocQL = w.TT.soLanVe; rQL.d.querySelector("[data-quay-lai]").click();
      for (let i = 0; i < 100 && w.TT.soLanVe === truocQL; i++) await cho(10);
      const veDau = decodeURIComponent(w.location.hash); lanCuoi = veDau;
      const rTQ = await mo("#/tong-quan");
      ghi("UI-11", "Giao diện", "Nút “Quay lại” trên mọi màn hình (trừ trang chính) đưa về màn hình trước", "Có nút; từ II.4 quay về #/thu-tuc; trang chính không có nút", `nút: ${coNut}; về: ${veDau}; trang chính có nút: ${!!rTQ.d.querySelector("[data-quay-lai]")}`, coNut && veDau === "#/thu-tuc" && !rTQ.d.querySelector("[data-quay-lai]"));
      rTQ.d.querySelector("[data-ban-quyen]").click(); await cho(20);
      const hop = rTQ.d.querySelector(".hop-ban-quyen"); const nd = hop ? hop.innerText : "";
      rTQ.d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); await cho(20);
      ghi("UI-12", "Giao diện", "Hộp “Giới thiệu, bản quyền”: tác giả, đơn vị, liên hệ, phiên bản, lời bản quyền; đóng bằng Esc", "Đủ thông tin; Esc đóng", `${["Lê Tùng Lâm", "Sở Nông nghiệp và Môi trường tỉnh Sơn La", "0987559092", "Bảo lưu mọi quyền", "Phiên bản"].filter(s => nd.includes(s)).length}/5 thông tin; đóng: ${!rTQ.d.querySelector(".hop-ban-quyen")}`, ["Lê Tùng Lâm", "Sở Nông nghiệp và Môi trường tỉnh Sơn La", "0987559092", "Bảo lưu mọi quyền", "Phiên bản"].every(s => nd.includes(s)) && !rTQ.d.querySelector(".hop-ban-quyen"));
    } catch (err) { ghi("UI-11", "Giao diện", "Nút Quay lại, hộp bản quyền", "Không lỗi", "Lỗi: " + err.message, false); }
    // Lỗi JavaScript trong khung
    ghi("UI-10", "Giao diện", "Không phát sinh lỗi JavaScript khi duyệt", "0 lỗi", `${loiJs.length} lỗi`, loiJs.length === 0, loiJs.slice(0, 5).join(" | "));
  }

  const dat = kq.filter(r => r.trangThai === "Đạt").length, truot = kq.filter(r => r.trangThai === "Không đạt").length, kkt = kq.filter(r => r.trangThai === "Không kiểm tra được").length;
  const tt = document.getElementById("tom-tat");
  tt.className = "thong-bao " + (truot ? "thong-bao-do" : "thong-bao-xanh");
  tt.innerHTML = `<div><b>${dat}/${kq.length} kiểm thử đạt</b>${truot ? `, <b>${truot} không đạt</b>` : ""}${kkt ? `, ${kkt} không kiểm tra được` : ""}. Thời điểm chạy: ${ti.ngayHienTai()}. Dữ liệu v${mh.B.phienBanDuLieu}, nguồn SHA-256 ${mh.N.thongTinTrichXuat.sha256.slice(0, 16)}…</div>`;
  window.KET_QUA_KIEM_THU = { dat, truot, kkt, tong: kq.length, chiTiet: kq, thoiDiem: new Date().toISOString() };
  // Xuất dữ liệu bàn giao (bảng đối soát, vấn đề nguồn, danh mục thủ tục) để công cụ dòng lệnh ghi thành tệp CSV
  const xuat = document.createElement("script"); xuat.type = "application/json"; xuat.id = "du-lieu-ban-giao";
  xuat.textContent = JSON.stringify({
    ketQua: kq, doiSoat: mh.bangDoiSoat(), vanDe: mh.vanDeNguon, docxMau19,
    thuTuc: mh.thuTuc.map(t => ({ ma: t.ma, phuLuc: t.phuLuc, cap: t.cap, ten: t.ten, tenNoiDung: t.tenNoiDung, trang: `${t.trangDau}-${t.trangCuoi}`, thoiHan: t.suyRa.thoiHan ? mh.hienThiHan(t.suyRa.thoiHan) : "", thoiHanNguyenVan: t.muc[3] ? t.muc[3].noiDung : "", soBuoc: t.buoc.buoc.length, mau: t.suyRa.mau.map(k => mh.mauTheoKhoa[k].kyHieu).join(", "), giayTo: t.suyRa.giayTo.length }))
  }).replace(/</g, "\\u003c");
  document.body.appendChild(xuat);
  document.title = `${truot ? "KHÔNG ĐẠT" : "ĐẠT"} ${dat}/${kq.length} – Kiểm thử`;
  const nut = document.getElementById("xuat"); nut.disabled = false;
  nut.onclick = () => {
    const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = "﻿" + ["Mã kiểm thử,Nhóm,Nội dung,Kết quả mong đợi,Kết quả thực tế,Trạng thái,Ghi chú", ...kq.map(r => [r.ma, r.nhom, r.noiDung, r.mongDoi, r.thucTe, r.trangThai, r.ghiChu].map(esc).join(","))].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "ket-qua-kiem-thu.csv"; a.click();
  };
})();
var loiJs = [];
document.getElementById("khung-ui").addEventListener("load", function () { try { this.contentWindow.addEventListener("error", ev => loiJs.push(ev.message)); } catch (_) { } });
