/* Mô hình dữ liệu nghiệp vụ: dựng từ nguon.js (nguyên văn trích từ PDF) và bo-sung.js (biên soạn).
 * Mọi chỉ mục suy ra (bước, cơ quan, mẫu viện dẫn, thời hạn rút gọn) đều được đánh dấu "suyRa" để giao diện
 * phân biệt với nội dung pháp lý nguyên văn. Không phụ thuộc DOM — dùng chung cho ứng dụng và bộ kiểm thử.
 */
window.TT = window.TT || {};
TT.taoMoHinh = function (N, B, P) {
  const ti = TT.ti;
  if (!N || !B) throw new Error("Thiếu dữ liệu nguồn (du-lieu/nguon.js) hoặc dữ liệu bổ sung (du-lieu/bo-sung.js).");
  const PDF = "tai-nguyen/qd75.pdf";
  const lienKetPdf = trang => trang ? `${PDF}#page=${trang}` : PDF;

  // ---------- Văn bản: Điều, khoản ----------
  function tachKhoan(noiDung) {
    const doan = String(noiDung || "").split("\n").filter(s => s.trim().length);
    const mo = [], khoan = [];
    for (const d of doan) {
      const m = d.match(/^(\d+)\.\s+(.*)$/);
      if (m) khoan.push({ so: m[1], doan: [d] });
      else if (khoan.length) khoan[khoan.length - 1].doan.push(d);
      else mo.push(d);
    }
    return { mo, khoan: khoan.map(k => ({ so: k.so, noiDung: k.doan.join("\n") })) };
  }
  function dungDieu(d, nguon) {
    const { mo, khoan } = tachKhoan(d.noiDung);
    // Tiêu đề điều kéo dài sang dòng sau (bắt đầu bằng chữ thường) → nối vào tiêu đề
    let tieuDe = d.tieuDe, moConLai = mo.slice();
    if (moConLai.length && /^[a-zđà-ỹ(]/.test(moConLai[0])) tieuDe = (tieuDe + " " + moConLai.shift()).trim();
    return { so: d.so, nguon, tieuDe, chuong: d.chuong || "", mo: moConLai, khoan, noiDung: d.noiDung, trangDau: d.trangDau, trangCuoi: d.trangCuoi };
  }
  // Điền chỗ trống của tệp PDF theo bản ký ban hành (B.banKy.dien); ghi lại để giao diện đánh dấu
  const dienBanKy = [];
  const quyetDinhDien = N.quyetDinh.map(d => {
    let noiDung = d.noiDung;
    for (const x of (B.banKy && B.banKy.dien) || []) {
      if (x.loai !== "qd" || x.dieu !== d.so) continue;
      const dong = noiDung.split("\n"), i = dong.findIndex(l => ti.gopTrang(l).includes(x.tim));
      if (i >= 0) { dong[i] = ti.gopTrang(dong[i]).replace(x.tim, x.thay); noiDung = dong.join("\n"); dienBanKy.push({ ...x, apDung: true }); }
      else dienBanKy.push({ ...x, apDung: false });
    }
    return { ...d, noiDung };
  });
  const dieuQD = quyetDinhDien.map(d => ({ ...dungDieu(d, "qd"), dienBanKy: dienBanKy.filter(x => x.dieu === d.so && x.apDung) }));
  const dieu = N.quyDinh.map(d => dungDieu(d, "qdinh"));
  const dieuTheoSo = Object.fromEntries(dieu.map(d => [d.so, d]));
  const chuong = [];
  for (const d of dieu) { if (!chuong.length || chuong[chuong.length - 1].ten !== d.chuong) chuong.push({ ten: d.chuong, dieu: [] }); chuong[chuong.length - 1].dieu.push(d.so); }

  // ---------- Thủ tục hành chính (Phụ lục I, II, III) ----------
  const TEN_MUC = { 1: "Trình tự thực hiện", 2: "Thành phần, số lượng hồ sơ", 3: "Thời hạn giải quyết", 4: "Đối tượng thực hiện", 5: "Cơ quan thực hiện", 6: "Kết quả thực hiện", 7: "Phí, lệ phí", 8: "Mẫu đơn, tờ khai", 9: "Yêu cầu, điều kiện" };
  const PL = [
    { so: "I", khoa: "phuLucI", dieu: "10", cap: "Cấp tỉnh", capDai: "Thẩm quyền của cơ quan, người có thẩm quyền cấp tỉnh" },
    { so: "II", khoa: "phuLucII", dieu: "11", cap: "Cấp xã", capDai: "Thẩm quyền của Chủ tịch Ủy ban nhân dân cấp xã" },
    { so: "III", khoa: "phuLucIII", dieu: "12", cap: "VP Đăng ký đất đai", capDai: "Thẩm quyền của Văn phòng đăng ký đất đai, Chi nhánh Văn phòng đăng ký đất đai" }
  ];
  const kyHieuMauPLV = new Set(N.phuLucV.mau.map(m => ti.chuanKyHieu(m.kyHieu)));

  // Mẫu viện dẫn trong văn bản: phân biệt mẫu của Phụ lục V với mẫu của văn bản khác
  function timMau(text) {
    const trong = new Map(), ngoai = new Map();
    const s = String(text || "");
    const re = /Mẫu(?:\s+số)?\s+(\d{1,2}[a-zđ]?)(\/[A-ZĐa-z0-9\-]+)?/g;
    let m;
    while ((m = re.exec(s))) {
      const sau = s.slice(m.index + m[0].length, m.index + m[0].length + 120).split(/[;.]/)[0];
      if (m[2]) {
        const vb = (s.slice(m.index, m.index + 260).match(/Thông tư\s+(?:số\s+)?\d+\/\d{4}\/TT-[A-ZĐ]+/) || [])[0] || "";
        ngoai.set(m[1] + m[2], vb);
        continue;
      }
      if (/Nghị định|Thông tư|Phụ lục (I|II|III|IV)\b(?! V)/.test(sau) && !/Phụ lục V\b/.test(sau)) {
        const vb = (sau.match(/(Nghị định|Thông tư)[^,;]*/) || [])[0] || "";
        ngoai.set("Mẫu số " + m[1] + (vb ? " — " + vb.trim() : ""), vb);
        continue;
      }
      trong.set(ti.chuanKyHieu(m[1]), true);
    }
    return { trong: [...trong.keys()], ngoai: [...ngoai.entries()].map(([k, v]) => ({ ma: k, vanBan: v })) };
  }

  function tachBuoc(text) {
    const doan = String(text || "").split("\n").filter(s => s.trim());
    const chung = [], buoc = [];
    for (const d of doan) {
      const m = d.match(/^Bước\s*(\d+)\s*[:.]?\s*(.*)$/);
      if (m) buoc.push({ so: +m[1], tieuDe: m[2].trim(), doan: [] });
      else if (buoc.length) buoc[buoc.length - 1].doan.push(d);
      else chung.push(d);
    }
    return { chung, buoc: buoc.map(b => ({ so: b.so, tieuDe: b.tieuDe, noiDung: b.doan.join("\n") })) };
  }

  // Thời hạn rút gọn: số ngày nêu đầu tiên trong mục (3) — chỉ dùng để lọc/sắp xếp, luôn kèm nguyên văn.
  // Giữ đúng đơn vị văn bản: "ngày làm việc" khác "ngày" (ngày lịch).
  function thoiHanRutGon(text) {
    const s = ti.gopTrang(text);
    const m = s.match(/(\d+(?:[.,]\d+)?|1\/2)\s*(?:\([^)]{1,25}\)\s*)?ngày( làm việc)?/i);
    if (!m) return null;
    const so = m[1] === "1/2" ? 0.5 : parseFloat(m[1].replace(",", "."));
    const nhieuMuc = (s.match(/\d+\s*(?:\([^)]{1,25}\)\s*)?ngày/gi) || []).length - (/khu vực III/i.test(s) ? 1 : 0) > 1;
    return { ngay: so, donVi: m[2] ? "ngày làm việc" : "ngày", nguyenVan: m[0], nhieuTruongHop: nhieuMuc, tangThemKhuVucIII: /khu vực III/i.test(s) };
  }
  const hienThiHan = h => h ? `${String(h.ngay).replace(".", ",")} ${h.donVi}` : null;

  // Danh mục giấy tờ tách từ mục (2): mỗi dòng gạch đầu dòng là một giấy tờ, gắn nhóm theo tiêu đề gần nhất
  function tachGiayTo(text) {
    const ds = []; let nhom = "";
    for (const d of String(text || "").split("\n")) {
      const t = d.trim();
      if (!t) continue;
      if (/^([a-zđ]\d?\)|\([ivx]+\))/.test(t) || /:$/.test(t) && !/^[-+]/.test(t)) { nhom = t.replace(/:$/, ""); continue; }
      if (/^[-+•]/.test(t)) {
        const noi = t.replace(/^[-+•]\s*/, "");
        if (/^(Thành phần hồ sơ|Số lượng hồ sơ)/i.test(noi)) { if (/^Số lượng/i.test(noi)) continue; nhom = ""; continue; }
        ds.push({ nhom, ten: noi, cap: t[0] === "+" ? 2 : 1, mau: timMau(noi).trong });
      }
    }
    return ds;
  }
  function soLuongHoSo(text) { const m = ti.gopTrang(text).match(/Số lượng hồ sơ\s*:?\s*([^.\n;]+)/i); return m ? m[1].trim() : null; }

  // ---------- Cơ quan ----------
  const coQuan = B.coQuan.map(c => ({ ...c, re: (c.mau || []).map(p => new RegExp("(^| )" + p + "( |$)")) }));
  const coQuanTheoId = Object.fromEntries(coQuan.map(c => [c.id, c]));
  function timCoQuan(text) {
    const s = " " + ti.chuanHoaManh(text) + " ";
    return coQuan.filter(c => c.chiMuc && c.re.some(r => r.test(s))).map(c => c.id);
  }
  // Vai trò theo mục (5): dòng "- Cơ quan có thẩm quyền quyết định", "- Cơ quan trực tiếp thực hiện", "- Cơ quan phối hợp"
  function vaiTroCoQuan(text) {
    const kq = []; let vaiTro = "khac";
    for (const d of String(text || "").split("\n")) {
      const n = ti.chuanHoa(d);
      if (/^- ?co quan co tham quyen/.test(n) || /^- ?nguoi co tham quyen/.test(n)) vaiTro = "tham-quyen";
      else if (/^- ?co quan truc tiep/.test(n)) vaiTro = "truc-tiep";
      else if (/^- ?co quan phoi hop/.test(n)) vaiTro = "phoi-hop";
      else if (/^- ?co quan duoc uy quyen|^- ?co quan duoc phan cap/.test(n)) vaiTro = "uy-quyen";
      else if (/^-/.test(n)) vaiTro = "khac";
      for (const id of timCoQuan(d)) kq.push({ id, vaiTro, dong: d });
    }
    return kq;
  }

  const thuTuc = [];
  const vanDeTuDong = [];
  for (const p of PL) {
    const pl = N[p.khoa];
    for (const t of pl.thuTuc) {
      const dm = pl.danhMuc.find(x => x.stt === t.stt);
      const ma = `${p.so}.${t.stt}`;
      const muc = {};
      for (const m of t.muc) muc[m.so] = { so: m.so, nhan: m.nhan.replace(/^\(\d\)\s*/, ""), noiDung: m.noiDung, trangDau: m.trangDau, trangCuoi: m.trangCuoi };
      const tatCa = t.muc.map(m => m.noiDung).join("\n");
      const tenDM = dm ? dm.ten.replace(/\s*\[Ghi chú:.*\]$/, "").replace(/\.$/, "") : null;
      const khopTen = tenDM && ti.chuanHoaManh(tenDM) === ti.chuanHoaManh(t.ten);
      const buoc = tachBuoc(muc[1] && muc[1].noiDung);
      buoc.buoc.forEach(b => { b.coQuan = timCoQuan(b.tieuDe + " " + b.noiDung.split("\n")[0]); });
      const mau = timMau(tatCa);
      const tt = {
        ma, phuLuc: p.so, stt: t.stt, cap: p.cap, capDai: p.capDai, dieuCanCu: p.dieu,
        ten: tenDM || t.ten, tenNoiDung: t.ten, tenDanhMuc: tenDM, khopTen: !!khopTen,
        trangDau: t.trangDau, trangCuoi: t.trangCuoi, trangDanhMuc: dm ? dm.trang : null,
        muc, buoc,
        suyRa: {
          thoiHan: thoiHanRutGon(muc[3] && muc[3].noiDung),
          mau: mau.trong.filter(k => kyHieuMauPLV.has(k)).sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b)),
          mauKhongTimThay: mau.trong.filter(k => !kyHieuMauPLV.has(k)),
          mauNgoai: mau.ngoai,
          coQuan: vaiTroCoQuan(muc[5] && muc[5].noiDung),
          giayTo: tachGiayTo(muc[2] && muc[2].noiDung),
          soLuongHoSo: soLuongHoSo(muc[2] && muc[2].noiDung),
          coNghiaVuTaiChinh: /nghĩa vụ tài chính/i.test(tatCa)
        }
      };
      thuTuc.push(tt);
      for (const so of [1, 2, 3, 4, 5, 6, 7, 8, 9]) if (muc[so] && !muc[so].noiDung.trim())
        vanDeTuDong.push({ ma: `TRONG-${ma}-${so}`, mucDo: "trung-binh", viTri: `Phụ lục ${p.so}, thủ tục ${t.stt}, mục (${so})`, trang: muc[so].trangDau, moTa: `Ô nội dung của mục (${so}) "${muc[so].nhan}" để trống trong văn bản nguồn (đã đối chiếu cấu trúc bảng trang ${muc[so].trangDau}). Phần mềm không tự điền; không suy ra là "không quy định".`, thuTuc: ma });
      const soBuoc = buoc.buoc.map(b => b.so);
      if (soBuoc.some((s, i) => s !== i + 1))
        vanDeTuDong.push({ ma: `BUOC-${ma}`, mucDo: "thap", viTri: `Phụ lục ${p.so}, thủ tục ${t.stt}, mục (1)`, trang: muc[1].trangDau, moTa: `Trình tự đánh số các bước không liên tục: ${soBuoc.map(s => "Bước " + s).join(", ")}. Phần mềm giữ nguyên số bước theo văn bản.`, thuTuc: ma });
      if (tt.suyRa.thoiHan && tt.suyRa.thoiHan.donVi === "ngày")
        vanDeTuDong.push({ ma: `DONVI-${ma}`, mucDo: "trung-binh", viTri: `Phụ lục ${p.so}, thủ tục ${t.stt}, mục (3)`, trang: muc[3].trangDau, moTa: `Thời hạn ghi “${tt.suyRa.thoiHan.nguyenVan}” (ngày), không ghi “ngày làm việc”, trong khi phần lớn thủ tục và phần tăng thêm trong cùng mục ghi “ngày làm việc”. Phần mềm giữ nguyên; cần xác minh cách tính.`, thuTuc: ma });
      if (!tt.khopTen) vanDeTuDong.push({ ma: "TEN-" + ma, mucDo: "thap", viTri: `Phụ lục ${p.so}, thủ tục ${t.stt}`, trang: t.trangDau, moTa: `Tên thủ tục tại danh mục (mục A, tr.${tt.trangDanhMuc}) khác tên tại nội dung chi tiết (mục B, tr.${t.trangDau}). Mục A: "${tenDM}". Mục B: "${t.ten}".`, thuTuc: ma });
    }
  }
  const thuTucTheoMa = Object.fromEntries(thuTuc.map(t => [t.ma, t]));
  // Mã TTHC quốc gia (B.dichVuCong.maQuocGia): "khop" dùng được; "goi-y" chỉ để tham khảo, cần xác minh
  for (const t of thuTuc) { const m = B.dichVuCong && B.dichVuCong.maQuocGia && B.dichVuCong.maQuocGia[t.ma]; t.maQuocGia = m ? { ...m } : null; }

  // ---------- Phụ lục IV ----------
  // Chỉ nhận cụm thời hạn có từ "thời hạn"/"thời gian" đứng trước (tránh nhầm số ngày đăng báo, niêm yết… là nội dung công việc)
  const reHanPL4 = /(?:trong )?thời (?:hạn|gian)(?: không quá)? \d+\s*\([^)]*\)\s*(?:ngày làm việc|ngày|tháng)/i;
  const phuLucIV = N.phuLucIV.muc.map(m => ({ ...m, khoan: m.khoan.map(k => ({ ...k, coQuan: timCoQuan(k.noiDung), thoiHan: (ti.gopTrang(k.noiDung).match(reHanPL4) || [])[0] || null, mau: timMau(k.noiDung).trong })) }));

  // ---------- Phụ lục V ----------
  const thamChieuMau = {};
  for (const t of thuTuc) for (const k of t.suyRa.mau) (thamChieuMau[k] = thamChieuMau[k] || []).push(t.ma);
  const mauBieu = N.phuLucV.mau.map(m => {
    const k = ti.chuanKyHieu(m.kyHieu);
    const dm = N.phuLucV.danhMuc.filter(d => ti.chuanKyHieu(d.kyHieu) === k);
    return { kyHieu: m.kyHieu, khoa: k, ten: m.tieuDe.replace(/\s+/g, " ").trim(), noiDung: m.noiDung, trangDau: m.trangDau, trangCuoi: m.trangCuoi,
      danhMuc: dm, coTrongDanhMuc: dm.length > 0, thuTuc: thamChieuMau[k] || [],
      quyTrinh: B.quyTrinh.filter(q => q.buoc.some(b => (b.mau || []).map(ti.chuanKyHieu).includes(k))).map(q => q.id),
      phuLucIV: phuLucIV.flatMap(mu => mu.khoan.filter(kh => kh.mau.includes(k)).map(kh => `${mu.so}.${kh.so}`)) };
  });
  const mauTheoKhoa = Object.fromEntries(mauBieu.map(m => [m.khoa, m]));
  const mauNgoai = {};
  for (const t of thuTuc) for (const x of t.suyRa.mauNgoai) (mauNgoai[x.ma] = mauNgoai[x.ma] || { ma: x.ma, vanBan: x.vanBan, thuTuc: [] }).thuTuc.push(t.ma);

  // ---------- Quy trình luân chuyển (Chương III) ----------
  const quyTrinh = B.quyTrinh.map(q => ({ ...q, buocTheoId: Object.fromEntries(q.buoc.map(b => [b.id, b])) }));
  const quyTrinhTheoId = Object.fromEntries(quyTrinh.map(q => [q.id, q]));

  // ---------- Văn bản được viện dẫn ----------
  const MAU_VB = [
    [/Luật Đất đai(?: số 31\/2024\/QH15)?/g, () => "Luật Đất đai số 31/2024/QH15"],
    [/Luật (Tổ chức chính quyền địa phương|Ban hành văn bản quy phạm pháp luật) số (\d+\/\d{4}\/QH\d+)/g, m => `Luật ${m[1]} số ${m[2]}`],
    [/Luật số (\d+\/\d{4}\/QH\d+)/g, m => "Luật số " + m[1]],
    [/Nghị định(?: số)? (\d+\/\d{4}\/NĐ-\s?CP)/g, m => "Nghị định số " + m[1].replace(/\s/g, "")],
    [/Thông tư(?: số)? (\d+\/\d{4}\/TT-[A-ZĐ]+)/g, m => "Thông tư số " + m[1]],
    [/Nghị quyết(?: số)? (\d+\/\d{4}\/[A-ZĐ0-9\-]+)/g, m => "Nghị quyết số " + m[1]],
    [/Quyết định số (\d+\/\d{4}\/QĐ-[A-ZĐ]+)/g, m => "Quyết định số " + m[1]],
    [/Luật [Pp]hí và lệ phí/g, () => "Luật Phí và lệ phí"],
    [/Luật Giao dịch điện tử/g, () => "Luật Giao dịch điện tử"]
  ];
  const vanBanDanChieu = {};
  function ghiVienDan(text, viTri) {
    for (const [re, ten] of MAU_VB) {
      re.lastIndex = 0; let m;
      while ((m = re.exec(text))) {
        const k = ten(m);
        const v = (vanBanDanChieu[k] = vanBanDanChieu[k] || { ten: k, viTri: [] });
        if (!v.viTri.some(x => x.khoa === viTri.khoa)) v.viTri.push(viTri);
      }
    }
  }
  N.moDau.canCu.forEach((c, i) => ghiVienDan(c, { khoa: "cc" + i, nhan: "Căn cứ ban hành Quyết định", lienKet: "#/can-cu" }));
  dieuQD.forEach(d => ghiVienDan(d.noiDung, { khoa: "qd" + d.so, nhan: `Điều ${d.so} Quyết định`, lienKet: "#/can-cu/qd-" + d.so }));
  dieu.forEach(d => ghiVienDan(d.tieuDe + "\n" + d.noiDung, { khoa: "d" + d.so, nhan: `Điều ${d.so} Quy định`, lienKet: "#/can-cu/dieu-" + d.so }));
  thuTuc.forEach(t => ghiVienDan(Object.values(t.muc).map(m => m.noiDung).join("\n"), { khoa: "tt" + t.ma, nhan: `Thủ tục ${t.ma}`, lienKet: "#/thu-tuc/" + t.ma }));
  phuLucIV.forEach(m => ghiVienDan(m.tieuDe + "\n" + m.khoan.map(k => k.noiDung).join("\n"), { khoa: "pl4" + m.so, nhan: `Phụ lục IV mục ${m.so}`, lienKet: "#/thu-hoi/" + m.so }));

  // ---------- Tình trạng hiệu lực văn bản được viện dẫn ----------
  // Nguồn 1 (chính thức): phần căn cứ ban hành Quyết định — văn bản được viện dẫn làm căn cứ có hiệu lực tại ngày ban hành,
  //   kèm văn bản sửa đổi, bổ sung nêu tại căn cứ. Nguồn 2: khoản 2 Điều 2 (văn bản hết hiệu lực). Nguồn 3: B.hieuLucVanBan (biên soạn, ghi nguồn).
  const tachTenVB = text => { const ds = []; for (const [re, ten] of MAU_VB) { re.lastIndex = 0; let m; while ((m = re.exec(text))) ds.push({ i: m.index, ten: ten(m) }); } return ds.sort((a, b) => a.i - b.i); };
  const ngayBH = B.vanBan.ngayBanHanh.giaTri;
  const hieuLucVB = {};
  for (const c of N.moDau.canCu) {
    const vt = c.search(/được sửa đổi, bổ sung bởi/);
    const ds = tachTenVB(c); if (!ds.length) continue;
    const goc = ds.find(x => vt < 0 || x.i < vt), sua = vt < 0 ? [] : ds.filter(x => x.i > vt).map(x => x.ten);
    if (goc) hieuLucVB[goc.ten] = { ma: "co-hieu-luc", nhan: "Có hiệu lực", nguon: `Căn cứ ban hành ${B.vanBan.loai} số ${B.vanBan.soKyHieu.giaTri} (ngày ${ngayBH})`, suaDoiBoi: sua };
    for (const x of sua) { const h = hieuLucVB[x] || (hieuLucVB[x] = { ma: "co-hieu-luc", nhan: "Có hiệu lực", nguon: `Căn cứ ban hành ${B.vanBan.loai} số ${B.vanBan.soKyHieu.giaTri} (ngày ${ngayBH})`, suaDoi: [] }); if (goc && h.suaDoi && !h.suaDoi.includes(goc.ten)) h.suaDoi.push(goc.ten); }
  }
  for (const x of B.vanBan.vanBanHetHieuLuc || []) {
    const t = tachTenVB(x.ten)[0]; if (!t) continue;
    hieuLucVB[t.ten] = { ma: x.phamVi === "Toàn bộ" ? "het-hieu-luc" : "het-mot-phan", nhan: x.phamVi === "Toàn bộ" ? "Hết hiệu lực" : "Hết hiệu lực một phần", phamVi: x.phamVi,
      nguon: `${x.canCu} ${B.vanBan.loai} số ${B.vanBan.soKyHieu.giaTri}`, tuNgay: B.vanBan.ngayHieuLuc.giaTri };
  }
  // Luật Phí và lệ phí: hiệu lực theo phần căn cứ của Nghị quyết HĐND tỉnh về phí, lệ phí (P), nếu có
  if (P && P.vanBan && P.vanBan.luatPhi) { const sua = tachTenVB(P.vanBan.luatPhi.nguyenVan).map(x => x.ten).filter(x => !/^Luật Phí/.test(x));
    hieuLucVB["Luật Phí và lệ phí"] = { ma: "co-hieu-luc", nhan: "Có hiệu lực", nguon: `Căn cứ ban hành ${P.vanBan.ten} ngày ${P.vanBan.ngay}: ${P.vanBan.luatPhi.nguyenVan}`, suaDoiBoi: [] }; }
  for (const x of B.hieuLucVanBan || []) hieuLucVB[x.ten] = { ...x };
  for (const v of Object.values(vanBanDanChieu)) v.hieuLuc = hieuLucVB[v.ten] || { ma: "chua-xac-minh", nhan: "Chưa xác minh", nguon: "Không có trong phần căn cứ ban hành; tài liệu nguồn không kèm toàn văn" };
  // Ký hiệu Nghị quyết của Quốc hội ghi lệch (…/NQ-QH thay vì …/QH15) → ghi nhận vấn đề nguồn
  for (const v of Object.values(vanBanDanChieu)) if (/Nghị quyết số \d+\/\d{4}\/NQ-QH$/.test(v.ten))
    vanDeTuDong.push({ ma: "KYHIEU-" + v.ten.replace(/\D+/g, "-"), mucDo: "thap", viTri: v.viTri.map(x => x.nhan).join("; "), trang: null, moTa: `Văn bản ghi “${v.ten}”; phần căn cứ ghi Nghị quyết số ${v.ten.match(/\d+\/\d{4}/)[0]}/QH15. Ký hiệu không thống nhất — phần mềm giữ nguyên văn.` });

  // ---------- Chỉ mục cơ quan ----------
  const chiMucCoQuan = {};
  const ghiCQ = (id, x) => { (chiMucCoQuan[id] = chiMucCoQuan[id] || { thuTuc: [], buoc: [], dieu: [], quyTrinh: [], phuLucIV: [] }); chiMucCoQuan[id][x.loai].push(x); };
  for (const t of thuTuc) {
    for (const v of t.suyRa.coQuan) ghiCQ(v.id, { loai: "thuTuc", ma: t.ma, vaiTro: v.vaiTro, dong: v.dong });
    for (const b of t.buoc.buoc) for (const id of b.coQuan) ghiCQ(id, { loai: "buoc", ma: t.ma, buoc: b.so, tieuDe: b.tieuDe });
  }
  for (const d of dieu) for (const id of timCoQuan(d.tieuDe + "\n" + d.noiDung)) ghiCQ(id, { loai: "dieu", so: d.so });
  for (const q of quyTrinh) for (const b of q.buoc) ghiCQ(b.lane, { loai: "quyTrinh", qt: q.id, buoc: b.id, ten: b.ten });
  for (const m of phuLucIV) for (const k of m.khoan) for (const id of k.coQuan) ghiCQ(id, { loai: "phuLucIV", muc: m.so, khoan: k.so });
  // Gộp trùng trong chỉ mục thủ tục (một cơ quan có thể xuất hiện ở nhiều dòng với cùng vai trò)
  for (const id in chiMucCoQuan) {
    const g = {};
    for (const x of chiMucCoQuan[id].thuTuc) { const k = x.ma; (g[k] = g[k] || { ma: x.ma, vaiTro: new Set() }).vaiTro.add(x.vaiTro); }
    chiMucCoQuan[id].thuTucGop = Object.values(g).map(x => ({ ma: x.ma, vaiTro: [...x.vaiTro] }));
  }

  // ---------- Tra cứu căn cứ (trích dẫn) ----------
  // dang: {loai:"dieu", dieu, khoan?} | {loai:"qd", dieu} | {loai:"muc", ma, muc} | {loai:"pl4", muc, khoan?} | {loai:"mau", kh}
  function giaiCanCu(c) {
    if (!c) return null;
    if (c.loai === "dieu" || (!c.loai && c.dieu)) {
      const d = dieuTheoSo[c.dieu]; if (!d) return null;
      if (c.khoan) {
        const k = d.khoan.find(x => x.so === String(c.khoan)); if (!k) return null;
        return { nhan: `Khoản ${c.khoan} Điều ${d.so} Quy định`, tieuDe: `Điều ${d.so}. ${d.tieuDe}`, noiDung: k.noiDung, trang: d.trangDau, trangCuoi: d.trangCuoi, lienKet: "#/can-cu/dieu-" + d.so };
      }
      return { nhan: `Điều ${d.so} Quy định`, tieuDe: `Điều ${d.so}. ${d.tieuDe}`, noiDung: [...d.mo, ...d.khoan.map(k => k.noiDung)].join("\n"), trang: d.trangDau, trangCuoi: d.trangCuoi, lienKet: "#/can-cu/dieu-" + d.so };
    }
    if (c.loai === "qd") {
      const d = dieuQD.find(x => x.so === String(c.dieu)); if (!d) return null;
      return { nhan: `Điều ${d.so} Quyết định`, tieuDe: `Điều ${d.so}. ${d.tieuDe}`, noiDung: [...d.mo, ...d.khoan.map(k => k.noiDung)].join("\n"), trang: d.trangDau, trangCuoi: d.trangCuoi, lienKet: "#/can-cu/qd-" + d.so };
    }
    if (c.loai === "muc") {
      const t = thuTucTheoMa[c.ma]; if (!t) return null; const m = t.muc[c.muc]; if (!m) return null;
      return { nhan: `Phụ lục ${t.phuLuc}, mục B, thủ tục ${t.stt}, mục (${c.muc})`, tieuDe: `${t.ma} — ${m.nhan}`, noiDung: m.noiDung, trang: m.trangDau, trangCuoi: m.trangCuoi, lienKet: `#/thu-tuc/${t.ma}/${c.muc}` };
    }
    if (c.loai === "pl4") {
      const m = phuLucIV.find(x => x.so === c.muc); if (!m) return null;
      if (c.khoan) { const k = m.khoan.find(x => x.so === String(c.khoan)); if (!k) return null; return { nhan: `Khoản ${k.so} Mục ${m.so} Phụ lục IV`, tieuDe: `${m.so}. ${m.tieuDe}`, noiDung: k.noiDung, trang: k.trangDau, trangCuoi: k.trangCuoi, lienKet: "#/thu-hoi/" + m.so }; }
      return { nhan: `Mục ${m.so} Phụ lục IV`, tieuDe: `${m.so}. ${m.tieuDe}`, noiDung: m.khoan.map(k => k.so + ". " + k.noiDung).join("\n"), trang: m.trangDau, trangCuoi: m.trangCuoi, lienKet: "#/thu-hoi/" + m.so };
    }
    if (c.loai === "mau") {
      const m = mauTheoKhoa[ti.chuanKyHieu(c.kh)]; if (!m) return null;
      return { nhan: `Mẫu số ${m.kyHieu} Phụ lục V`, tieuDe: `Mẫu số ${m.kyHieu}. ${m.ten}`, noiDung: m.noiDung, trang: m.trangDau, trangCuoi: m.trangCuoi, lienKet: "#/mau-bieu/" + m.khoa, laMau: true };
    }
    return null;
  }

  // ---------- Kiểm tra dữ liệu ----------
  function kiemTra() {
    const kq = [];
    const them = (mucDo, nhom, noiDung, viTri) => kq.push({ mucDo, nhom, noiDung, viTri });
    for (const p of PL) {
      const pl = N[p.khoa];
      if (pl.danhMuc.length !== pl.thuTuc.length) them("loi", "Số lượng", `Phụ lục ${p.so}: danh mục có ${pl.danhMuc.length} thủ tục, nội dung có ${pl.thuTuc.length}.`, `Phụ lục ${p.so}`);
      else them("dat", "Số lượng", `Phụ lục ${p.so}: ${pl.thuTuc.length} thủ tục — khớp giữa danh mục (mục A) và nội dung (mục B).`, `Phụ lục ${p.so}`);
      const stt = pl.thuTuc.map(t => t.stt);
      if (new Set(stt).size !== stt.length) them("loi", "Trùng lặp", `Phụ lục ${p.so}: số thứ tự thủ tục bị trùng.`, `Phụ lục ${p.so}`);
      stt.forEach((s, i) => { if (s !== i + 1) them("canh-bao", "Thứ tự", `Phụ lục ${p.so}: thủ tục thứ ${i + 1} mang số ${s}.`, `Phụ lục ${p.so}`); });
    }
    const maTrung = thuTuc.map(t => t.ma).filter((m, i, a) => a.indexOf(m) !== i);
    if (maTrung.length) them("loi", "Trùng lặp", "Mã thủ tục trùng: " + maTrung.join(", "), "Toàn bộ");
    let duMuc = 0;
    for (const t of thuTuc) {
      // Thiếu mục (không trích được nhãn) là lỗi trích xuất; mục có nhãn nhưng ô trống là đặc điểm văn bản nguồn
      const thieu = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => !t.muc[i]);
      const trong = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => t.muc[i] && !t.muc[i].noiDung.trim());
      if (thieu.length) them("loi", "Thiếu dữ liệu", `Thủ tục ${t.ma}: không trích xuất được mục ${thieu.map(i => "(" + i + ")").join(", ")}.`, "#/thu-tuc/" + t.ma); else duMuc++;
      if (trong.length) them("canh-bao", "Văn bản nguồn", `Thủ tục ${t.ma}: mục ${trong.map(i => "(" + i + ")").join(", ")} để trống trong văn bản nguồn (đã đối chiếu PDF).`, "#/thu-tuc/" + t.ma + "/" + trong[0]);
      if (!t.buoc.buoc.length) them("canh-bao", "Cấu trúc", `Thủ tục ${t.ma}: mục (1) không tách được bước (không có "Bước n").`, "#/thu-tuc/" + t.ma);
      else { const so = t.buoc.buoc.map(b => b.so); if (so.some((s, i) => s !== i + 1)) them("canh-bao", "Văn bản nguồn", `Thủ tục ${t.ma}: văn bản đánh số bước không liên tục (${so.join(", ")}).`, "#/thu-tuc/" + t.ma + "/trinh-tu"); }
      for (const k of t.suyRa.mauKhongTimThay) them("canh-bao", "Liên kết mẫu", `Thủ tục ${t.ma} viện dẫn "Mẫu số ${k}" nhưng Phụ lục V không có mẫu này.`, "#/thu-tuc/" + t.ma);
      if (!t.suyRa.thoiHan) them("canh-bao", "Thời hạn", `Thủ tục ${t.ma}: mục (3) không có số ngày nhận diện được — xem nguyên văn.`, "#/thu-tuc/" + t.ma + "/3");
    }
    them(duMuc === thuTuc.length ? "dat" : "loi", "Thiếu dữ liệu", `${duMuc}/${thuTuc.length} thủ tục trích xuất đủ 9 mục (theo nhãn bảng).`, "Toàn bộ");
    const theoDonVi = {}; for (const t of thuTuc) if (t.suyRa.thoiHan) theoDonVi[t.suyRa.thoiHan.donVi] = (theoDonVi[t.suyRa.thoiHan.donVi] || 0) + 1;
    them("dat", "Thời hạn", `Đơn vị thời hạn nêu đầu tiên tại mục (3): ${Object.entries(theoDonVi).map(([k, v]) => `${v} thủ tục tính bằng “${k}”`).join("; ")}. Phần mềm giữ nguyên đơn vị văn bản.`, "#/thu-tuc");
    // Phụ lục V
    for (const d of N.phuLucV.danhMuc) if (!mauTheoKhoa[ti.chuanKyHieu(d.kyHieu)]) them("canh-bao", "Mẫu biểu", `Danh mục Phụ lục V liệt kê Mẫu số ${d.kyHieu} nhưng không có nội dung.`, "#/mau-bieu");
    for (const m of mauBieu) if (!m.coTrongDanhMuc) them("canh-bao", "Mẫu biểu", `Mẫu số ${m.kyHieu} có nội dung (tr.${m.trangDau}) nhưng không có trong danh mục Phụ lục V.`, "#/mau-bieu/" + m.khoa);
    const sttV = N.phuLucV.danhMuc.map(d => d.stt); const trungV = sttV.filter((s, i) => sttV.indexOf(s) !== i);
    if (trungV.length) them("canh-bao", "Mẫu biểu", `Danh mục Phụ lục V có số thứ tự trùng: ${[...new Set(trungV)].join(", ")}.`, "#/mau-bieu");
    const khV = N.phuLucV.danhMuc.map(d => ti.chuanKyHieu(d.kyHieu)); const trungKh = khV.filter((s, i) => khV.indexOf(s) !== i);
    if (trungKh.length) them("canh-bao", "Mẫu biểu", `Danh mục Phụ lục V liệt kê trùng ký hiệu: Mẫu số ${[...new Set(trungKh)].join(", ")}.`, "#/mau-bieu");
    them("dat", "Mẫu biểu", `${mauBieu.length} mẫu biểu có nội dung trong Phụ lục V.`, "#/mau-bieu");
    // Quy trình Chương III
    const idCQ = new Set(coQuan.map(c => c.id)); const maVD = new Set(B.vanDeNguon.map(v => v.ma));
    let nvDat = 0, nvTong = 0;
    for (const q of quyTrinh) {
      for (const l of q.lanes) if (!idCQ.has(l)) them("loi", "Quy trình", `${q.id}: làn "${l}" không có trong danh mục cơ quan.`, "#/quy-trinh/" + q.id);
      for (const b of q.buoc) {
        if (!q.lanes.includes(b.lane)) them("loi", "Quy trình", `${q.id}/${b.id}: làn "${b.lane}" không khai báo trong quy trình.`, "#/quy-trinh/" + q.id);
        const cc = giaiCanCu({ loai: "dieu", dieu: b.canCu.dieu, khoan: b.canCu.khoan });
        if (!cc) them("loi", "Căn cứ", `${q.id}/${b.id}: căn cứ Điều ${b.canCu.dieu} khoản ${b.canCu.khoan} không tồn tại.`, "#/quy-trinh/" + q.id);
        if (b.nguyenVan) {
          nvTong++;
          const ok = cc && ti.gopTrang(cc.noiDung).includes(ti.gopTrang(b.nguyenVan));
          if (ok) nvDat++; else them("loi", "Nguyên văn", `${q.id}/${b.id}: đoạn nguyên văn không khớp với khoản ${b.canCu.khoan} Điều ${b.canCu.dieu}.`, "#/quy-trinh/" + q.id);
        }
        for (const v of b.vanDe || []) if (!maVD.has(v)) them("loi", "Quy trình", `${q.id}/${b.id}: mã vấn đề ${v} không tồn tại.`, "#/quy-trinh/" + q.id);
        for (const k of b.mau || []) if (!mauTheoKhoa[ti.chuanKyHieu(k)]) them("loi", "Liên kết mẫu", `${q.id}/${b.id}: Mẫu số ${k} không có trong Phụ lục V.`, "#/quy-trinh/" + q.id);
      }
      for (const g of q.ghiChu || []) {
        nvTong++;
        const cc = giaiCanCu({ loai: "dieu", dieu: g.canCu.dieu, khoan: g.canCu.khoan });
        if (cc && ti.gopTrang(cc.noiDung).includes(ti.gopTrang(g.nguyenVan))) nvDat++; else them("loi", "Nguyên văn", `${q.id}: ghi chú không khớp nguyên văn.`, "#/quy-trinh/" + q.id);
      }
      const ids = new Set(q.buoc.map(b => b.id));
      for (const c of q.canh) if (!ids.has(c.tu) || !ids.has(c.den)) them("loi", "Quy trình", `${q.id}: cạnh ${c.tu}→${c.den} trỏ tới bước không tồn tại.`, "#/quy-trinh/" + q.id);
      // mọi bước (trừ bắt đầu) phải có đường vào; mọi bước (trừ kết thúc) phải có đường ra
      for (const b of q.buoc) {
        if (b.loai !== "batdau" && !q.canh.some(c => c.den === b.id)) them("loi", "Quy trình", `${q.id}/${b.id}: không có luồng vào.`, "#/quy-trinh/" + q.id);
        if (b.loai !== "ketthuc" && !b.diemCuoi && !q.canh.some(c => c.tu === b.id)) them("canh-bao", "Quy trình", `${q.id}/${b.id}: không có luồng ra.`, "#/quy-trinh/" + q.id);
      }
    }
    them(nvDat === nvTong ? "dat" : "loi", "Nguyên văn", `${nvDat}/${nvTong} đoạn nguyên văn trong quy trình Chương III khớp với văn bản trích xuất.`, "#/quy-trinh");
    for (const t of B.quyTacThoiHan) if (!giaiCanCu({ loai: "dieu", dieu: t.dieu, khoan: t.khoan })) them("loi", "Căn cứ", `Quy tắc thời hạn: không tìm thấy khoản ${t.khoan} Điều ${t.dieu}.`, "#/can-cu");
    if (dieu.length !== 24) them("canh-bao", "Số lượng", `Quy định có ${dieu.length} điều (kỳ vọng 24 theo văn bản).`, "#/can-cu");
    else them("dat", "Số lượng", "Quy định: 24 điều, 5 chương — trích xuất đầy đủ.", "#/can-cu");
    return kq;
  }

  // ---------- Bảng đối soát ----------
  function bangDoiSoat() {
    const rows = [];
    const add = r => rows.push({ stt: rows.length + 1, ...r });
    for (const d of dieuQD) add({ nhom: "Quyết định", nguon: `Điều ${d.so}. ${d.tieuDe}`, viTriNguon: `Điều ${d.so} Quyết định`, trang: d.trangDau, duLieu: `Nguyên văn ${d.khoan.length || 1} đoạn`, hienThi: "#/can-cu/qd-" + d.so, ketQua: d.so === "2" && !d.dienBanKy.length ? "Cần xác minh" : "Đạt", ghiChu: d.so === "2" ? (d.dienBanKy.length ? "Ngày hiệu lực điền theo bản ký ban hành (VD02 đã xử lý)" : "Ngày hiệu lực để trống (VD02)") : "" });
    for (const d of dieu) add({ nhom: "Quy định", nguon: `Điều ${d.so}. ${d.tieuDe}`, viTriNguon: `${d.chuong.split(".")[0]}, Điều ${d.so}`, trang: d.trangDau, duLieu: `${d.khoan.length} khoản`, hienThi: "#/can-cu/dieu-" + d.so, ketQua: "Đạt", ghiChu: "" });
    for (const t of thuTuc) {
      const thieu = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => !t.muc[i]);
      const gc = [];
      if (!t.khopTen) gc.push("Tên mục A khác mục B");
      const trong = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => t.muc[i] && !t.muc[i].noiDung.trim());
      if (trong.length) gc.push(`Mục ${trong.map(i => "(" + i + ")").join(", ")} để trống trong văn bản nguồn`);
      const so = t.buoc.buoc.map(b => b.so); if (so.some((s, i) => s !== i + 1)) gc.push(`Văn bản đánh số bước không liên tục: ${so.join(", ")}`);
      if (t.suyRa.mauKhongTimThay.length) gc.push("Viện dẫn mẫu không có trong PL V: " + t.suyRa.mauKhongTimThay.join(", "));
      add({ nhom: `Phụ lục ${t.phuLuc}`, nguon: t.ten, viTriNguon: `PL ${t.phuLuc}: mục A STT ${t.stt} (tr.${t.trangDanhMuc}); mục B thủ tục ${t.stt} (tr.${t.trangDau}–${t.trangCuoi})`, trang: t.trangDau,
        duLieu: `${9 - thieu.length}/9 mục; ${t.buoc.buoc.length} bước; ${t.suyRa.mau.length} mẫu PL V; thời hạn: ${t.suyRa.thoiHan ? hienThiHan(t.suyRa.thoiHan) : "không nhận diện"}`,
        hienThi: "#/thu-tuc/" + t.ma, ketQua: thieu.length ? "Lỗi" : gc.length ? "Cần xác minh" : "Đạt", ghiChu: gc.join("; ") });
    }
    for (const m of phuLucIV) add({ nhom: "Phụ lục IV", nguon: `${m.so}. ${m.tieuDe}`, viTriNguon: `Phụ lục IV, mục ${m.so}`, trang: m.trangDau, duLieu: `${m.khoan.length} khoản (nguyên văn)`, hienThi: "#/thu-hoi/" + m.so, ketQua: "Đạt", ghiChu: "" });
    for (const m of mauBieu) add({ nhom: "Phụ lục V", nguon: `Mẫu số ${m.kyHieu}. ${m.ten}`, viTriNguon: `Phụ lục V (tr.${m.trangDau}–${m.trangCuoi})`, trang: m.trangDau, duLieu: `Văn bản trích xuất; ${m.thuTuc.length} thủ tục viện dẫn`, hienThi: "#/mau-bieu/" + m.khoa, ketQua: m.coTrongDanhMuc ? "Đạt" : "Cần xác minh", ghiChu: m.coTrongDanhMuc ? "Định dạng mẫu cần xem trên PDF gốc" : "Không có trong danh mục PL V (VD04)" });
    for (const q of quyTrinh) for (const b of q.buoc) {
      const cc = giaiCanCu({ loai: "dieu", dieu: b.canCu.dieu, khoan: b.canCu.khoan });
      const khop = !b.nguyenVan || (cc && ti.gopTrang(cc.noiDung).includes(ti.gopTrang(b.nguyenVan)));
      add({ nhom: "Chương III – quy trình", nguon: b.nguyenVan || `(Nút ${b.loai === "batdau" ? "bắt đầu" : "kết thúc"} do phần mềm thể hiện) ${b.ten}`, viTriNguon: `Khoản ${b.canCu.khoan} Điều ${b.canCu.dieu}`, trang: cc ? cc.trang : null,
        duLieu: `${q.id} / ${b.id}: ${b.ten}; thời hạn: ${b.thoiHan ? (b.thoiHan.ngay != null ? b.thoiHan.ngay + " ngày làm việc" : "không quy định") : "—"}`, hienThi: "#/quy-trinh/" + q.id + "/" + b.id,
        ketQua: !khop ? "Lỗi" : (b.vanDe && b.vanDe.length) ? "Cần xác minh" : "Đạt", ghiChu: [(b.vanDe || []).join(", "), b.nguyenVan ? "" : "Không có nguyên văn tương ứng (nút hiển thị)"].filter(Boolean).join("; ") });
    }
    return rows;
  }

  if (P && P.vanDeDanhMuc) P.vanDeDanhMuc.forEach((m, i) => vanDeTuDong.push({ ma: "PHI-" + (i + 1), mucDo: "trung-binh", viTri: "Danh mục TTHC công bố (21/8/2025) — cột Phí, lệ phí", trang: null, moTa: m }));
  const vanDeNguon = [...B.vanDeNguon, ...vanDeTuDong];

  // Tình trạng hiệu lực văn bản nguồn — một chỗ duy nhất để giao diện hiển thị
  const HIEU_LUC = {
    "co-hieu-luc": { nhan: "Có hiệu lực", lop: "xanh", ngan: "Hiệu lực: có hiệu lực" },
    "het-hieu-luc": { nhan: "Hết hiệu lực", lop: "do", ngan: "Hiệu lực: hết hiệu lực" },
    "chua-co-hieu-luc": { nhan: "Chưa có hiệu lực", lop: "vang", ngan: "Hiệu lực: chưa có hiệu lực" },
    "chua-xac-minh": { nhan: "Chưa xác minh", lop: "vang", ngan: "Hiệu lực: chưa xác minh" }
  };
  // Tình trạng tự tính theo ngày có hiệu lực (nếu có); "het-hieu-luc" do người biên soạn đặt khi có văn bản thay thế
  function tinhHieuLuc(homNay) {
    const vb = B.vanBan;
    let ma = vb.tinhTrangHieuLuc;
    const m = vb.ngayHieuLuc && String(vb.ngayHieuLuc.giaTri || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m && ma !== "het-hieu-luc") ma = (homNay || new Date()) >= new Date(+m[3], +m[2] - 1, +m[1]) ? "co-hieu-luc" : "chua-co-hieu-luc";
    return { ma, ...(HIEU_LUC[ma] || HIEU_LUC["chua-xac-minh"]), ghiChu: ma === "chua-co-hieu-luc" ? `Có hiệu lực thi hành kể từ ngày ${vb.ngayHieuLuc.giaTri}.` : (vb.hieuLucGhiChu || "") };
  }
  const hieuLuc = tinhHieuLuc();
  const daDoiChieuBanKy = B.vanBan.soKyHieu.nguon === "ban-ky" && B.vanBan.ngayBanHanh.nguon === "ban-ky";
  const tenVanBan = `${B.vanBan.loai} số ${B.vanBan.soKyHieu.giaTri} ngày ${B.vanBan.ngayBanHanh.giaTri} của ${B.vanBan.coQuanBanHanh}`;

  const thongKe = {
    thuTuc: thuTuc.length,
    theoPhuLuc: Object.fromEntries(PL.map(p => [p.so, thuTuc.filter(t => t.phuLuc === p.so).length])),
    mucNoiDung: thuTuc.reduce((s, t) => s + Object.keys(t.muc).length, 0),
    buoc: thuTuc.reduce((s, t) => s + t.buoc.buoc.length, 0),
    mauBieu: mauBieu.length,
    dieu: dieu.length,
    phuLucIV: phuLucIV.length,
    khoanPLIV: phuLucIV.reduce((s, m) => s + m.khoan.length, 0),
    quyTrinh: quyTrinh.length,
    buocQuyTrinh: quyTrinh.reduce((s, q) => s + q.buoc.filter(b => b.loai !== "batdau" && b.loai !== "ketthuc").length, 0),
    coQuan: Object.keys(chiMucCoQuan).length,
    vanBanDanChieu: Object.keys(vanBanDanChieu).length
  };

  return {
    N, B, P: P || null, PDF, lienKetPdf, TEN_MUC, PL, dieu, dieuQD, dieuTheoSo, chuong, thuTuc, thuTucTheoMa, phuLucIV, mauBieu, mauTheoKhoa, mauNgoai,
    quyTrinh, quyTrinhTheoId, coQuan, coQuanTheoId, chiMucCoQuan, vanBanDanChieu, vanDeNguon, thongKe, hieuLuc, tinhHieuLuc, daDoiChieuBanKy, tenVanBan, dienBanKy,
    giaiCanCu, kiemTra, bangDoiSoat, timCoQuan, timMau, thoiHanRutGon, hienThiHan, tachBuoc
  };
};
