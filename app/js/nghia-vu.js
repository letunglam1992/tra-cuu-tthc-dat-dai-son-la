/* Ước tính nghĩa vụ tài chính về đất đai (THAM KHẢO) — không phụ thuộc giao diện, dùng chung cho ứng dụng và kiểm thử.
 * Mỗi khoản tính trả về: số tiền, công thức đã áp dụng (có số liệu), căn cứ (mức văn bản) và cảnh báo.
 * Số liệu chính thức do cơ quan thuế xác định trên Thông báo nộp tiền; công cụ chỉ giúp dự trù.
 * Tỷ lệ, hệ số, mức thu cấu hình tại bo-sung.js › nghiaVuTaiChinh — người biên soạn chịu trách nhiệm đối chiếu văn bản hiện hành.
 */
window.TT = window.TT || {};
TT.nghiaVu = (function () {
  const so = v => { const x = typeof v === "number" ? v : parseFloat(String(v == null ? "" : v).replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")); return isFinite(x) ? x : NaN; };
  const tien = v => isFinite(v) ? Math.round(v).toLocaleString("vi-VN") + " đồng" : "—";
  const soVN = (v, le) => isFinite(v) ? v.toLocaleString("vi-VN", { maximumFractionDigits: le == null ? 2 : le }) : "—";

  // Đọc số tiền viết bằng chữ (đến hàng nghìn tỷ) — để in kèm số tiền
  const CHU = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  function docBa(n, day) {
    const tr = Math.floor(n / 100), ch = Math.floor((n % 100) / 10), dv = n % 10, ra = [];
    if (day || tr) ra.push(CHU[tr] + " trăm");
    if (ch === 0 && dv && (day || tr)) ra.push("lẻ");
    if (ch === 1) ra.push("mười"); else if (ch > 1) ra.push(CHU[ch] + " mươi");
    if (dv) ra.push(dv === 1 && ch > 1 ? "mốt" : dv === 5 && ch > 0 ? "lăm" : dv === 4 && ch > 1 ? "tư" : CHU[dv]);
    return ra.join(" ");
  }
  function docSo(v) {
    v = Math.round(Math.abs(v)); if (!v) return "Không đồng";
    const nhom = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ"], ds = [];
    let i = 0; while (v > 0) { ds.unshift([v % 1000, i]); v = Math.floor(v / 1000); i++; }
    const s = ds.map(([n, k], j) => n ? docBa(n, j > 0) + nhom[k] : "").filter(Boolean).join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1) + " đồng";
  }

  /* Tính một khoản. ts: { loai, dienTich, gia, giaTruoc, giaSau, heSo, tyLe, tyLeThu, giaTriChuyenNhuong, duocTru, mienGiamPhanTram }
   * cauHinh: B.nghiaVuTaiChinh (mức thu, căn cứ). */
  function tinh(ts, cauHinh) {
    const ch = cauHinh || {}, k = (ch.khoan || {})[ts.loai];
    if (!k) return { loi: "Loại khoản thu không hợp lệ" };
    const S = so(ts.dienTich), canhBao = [...(k.canhBao || [])];
    const heSo = isFinite(so(ts.heSo)) ? so(ts.heSo) : 1;
    let T = NaN, congThuc = "";
    if (ts.loai === "giao-dat") {
      const G = so(ts.gia);
      T = S * G * heSo;
      congThuc = `${soVN(S)} m² × ${soVN(G, 0)} đồng/m²${heSo !== 1 ? ` × hệ số ${soVN(heSo)}` : ""}`;
    } else if (ts.loai === "chuyen-muc-dich") {
      const G1 = so(ts.giaTruoc), G2 = so(ts.giaSau), r = isFinite(so(ts.tyLeThu)) ? so(ts.tyLeThu) : 100;
      const chenh = G2 * heSo - G1 * heSo;
      T = S * Math.max(0, chenh) * r / 100;
      congThuc = `${soVN(S)} m² × (${soVN(G2, 0)} − ${soVN(G1, 0)}) đồng/m²${heSo !== 1 ? ` × hệ số ${soVN(heSo)}` : ""}${r !== 100 ? ` × ${soVN(r)}%` : ""}`;
      if (chenh < 0) canhBao.push("Giá đất sau khi chuyển mục đích thấp hơn giá đất trước — chênh lệch âm, tạm tính 0.");
    } else if (ts.loai === "thue-hang-nam") {
      const G = so(ts.gia), r = so(ts.tyLe);
      if (!isFinite(r)) return { loi: "Nhập tỷ lệ phần trăm (%) tính đơn giá thuê đất do UBND tỉnh quy định" };
      T = S * G * heSo * r / 100;
      congThuc = `${soVN(S)} m² × ${soVN(G, 0)} đồng/m²${heSo !== 1 ? ` × hệ số ${soVN(heSo)}` : ""} × ${soVN(r, 3)}% (mỗi năm)`;
    } else if (ts.loai === "thue-mot-lan") {
      const G = so(ts.gia);
      T = S * G * heSo;
      congThuc = `${soVN(S)} m² × ${soVN(G, 0)} đồng/m² (giá đất tương ứng thời hạn thuê)${heSo !== 1 ? ` × hệ số ${soVN(heSo)}` : ""}`;
    } else if (ts.loai === "le-phi-truoc-ba") {
      const G = so(ts.gia), r = isFinite(so(ts.tyLe)) ? so(ts.tyLe) : k.mucMacDinh;
      T = S * G * r / 100;
      congThuc = `${soVN(S)} m² × ${soVN(G, 0)} đồng/m² (giá đất trong bảng giá) × ${soVN(r)}%`;
    } else if (ts.loai === "thue-tncn") {
      const V = so(ts.giaTriChuyenNhuong), r = isFinite(so(ts.tyLe)) ? so(ts.tyLe) : k.mucMacDinh;
      T = V * r / 100;
      congThuc = `${soVN(V, 0)} đồng (giá chuyển nhượng) × ${soVN(r)}%`;
    }
    if (!isFinite(T)) return { loi: "Thiếu hoặc sai số liệu (diện tích, giá đất)" };
    const tru = so(ts.duocTru), mg = so(ts.mienGiamPhanTram);
    let ghiTru = "";
    if (isFinite(mg) && mg > 0) { T = T * (1 - Math.min(100, mg) / 100); ghiTru += ` × (1 − ${soVN(mg)}% miễn, giảm)`; }
    if (isFinite(tru) && tru > 0) { const t0 = T; T = Math.max(0, T - tru); ghiTru += ` − ${soVN(tru, 0)} đồng được trừ`; if (tru > t0) canhBao.push("Khoản được trừ lớn hơn số phải nộp — tạm tính 0; phần chênh lệch xử lý theo quy định."); }
    return { loai: ts.loai, ten: k.ten, soTien: Math.round(T), bangChu: docSo(T), congThuc: congThuc + ghiTru, canCu: k.canCu, canhBao, xacMinh: !!k.canXacMinh };
  }

  // ---------- Phí thẩm định hồ sơ và lệ phí cấp Giấy chứng nhận (Nghị quyết số 155/2025/NQ-HĐND) ----------
  /* ts: { doiTuong: "ca-nhan" | "to-chuc", diaBan: "phuong" | "xa", hoSo: "lan-dau" | "bien-dong", hinhThuc: "cap-moi" | "xac-nhan",
   *       mucDich: "nha-o" | "kinh-doanh", dienTich (tổ chức), chiQSDD (bool), soTrichLuc, mien (bool) } — P: window.QD75_PHI */
  function tinhPhiGCN(ts, P) {
    const td = P.thamDinh, lp = P.lePhi, dong = [], canhBao = [];
    const toChuc = ts.doiTuong === "to-chuc", xa = ts.diaBan === "xa", bienDong = ts.hoSo === "bien-dong";
    const nguon = `${P.vanBan.ten} (hiệu lực ${P.vanBan.hieuLuc})`;
    if (ts.mien && !toChuc) return { dong: [{ ten: "Phí thẩm định và lệ phí cấp Giấy chứng nhận", soTien: 0, ghiChu: "Miễn nộp — " + td.mienNop }], tong: 0, canhBao, nguon };
    // Phí thẩm định
    let phi = null, dg = "";
    if (toChuc) {
      const S = so(ts.dienTich);
      if (!isFinite(S)) canhBao.push("Nhập diện tích dự án (m²) để xác định mức phí thẩm định đối với tổ chức.");
      else { const b = td.toChucLanDau.find(x => S >= x[0] && (x[1] == null || S < x[1])); phi = b[2]; dg = b[3]; }
    } else { phi = td.caNhanLanDau[ts.mucDich === "kinh-doanh" ? "kinh-doanh" : "nha-o"][xa ? "nong-thon" : "do-thi"]; dg = `${ts.mucDich === "kinh-doanh" ? "Sử dụng đất kinh doanh" : "Sử dụng đất làm nhà ở"}, khu vực ${xa ? "nông thôn" : "đô thị"}`; }
    if (phi != null) {
      const goc = phi; if (bienDong) phi = Math.round(phi * td.tyLeBienDong / 100);
      dong.push({ ten: td.ten, soTien: phi, ghiChu: `${dg}${bienDong ? ` — cấp lại, cấp đổi, đăng ký biến động: ${td.tyLeBienDong}% × ${goc.toLocaleString("vi-VN")}` : " — cấp lần đầu"} (${td.viTri})` });
    }
    // Lệ phí cấp Giấy chứng nhận
    const bang = toChuc ? lp.toChuc : lp.caNhanPhuong;
    let id;
    if (!bienDong) id = ts.chiQSDD ? "qsdd-lan-dau" : "lan-dau";
    else if (ts.hinhThuc === "xac-nhan") id = "chung-nhan-bien-dong";
    else id = ts.chiQSDD && !toChuc ? "qsdd-cap-moi-bien-dong" : "cap-moi-bien-dong";
    const muc = bang.find(x => x.id === id);
    if (muc) { let v = muc.mucThu; const heSoXa = !toChuc && xa; if (heSoXa) v = Math.round(v * lp.tyLeCaNhanXa / 100);
      dong.push({ ten: "Lệ phí cấp Giấy chứng nhận", soTien: v, ghiChu: `${muc.noiDung}${heSoXa ? ` — cá nhân tại xã: ${lp.tyLeCaNhanXa}% × ${muc.mucThu.toLocaleString("vi-VN")}` : toChuc ? " — tổ chức" : " — cá nhân tại phường"} (${lp.viTri})` }); }
    const n = Math.max(0, Math.floor(so(ts.soTrichLuc) || 0));
    if (n) { const tl = bang.find(x => x.id === "trich-luc"); let v = tl.mucThu; if (!toChuc && xa) v = Math.round(v * lp.tyLeCaNhanXa / 100); dong.push({ ten: "Lệ phí trích lục bản đồ, văn bản, số liệu hồ sơ địa chính", soTien: v * n, ghiChu: `${n} lần × ${v.toLocaleString("vi-VN")} đồng` }); }
    canhBao.push("Kiểm tra các trường hợp miễn lệ phí (thay đổi địa giới, thay đổi thông tin căn cước, cấp đổi do giấy hư hỏng hoặc lỗi cơ quan đăng ký…) tại " + lp.viTri + ".");
    canhBao.push("“Khu vực đô thị/nông thôn” (phí thẩm định) và “phường/xã” (lệ phí) là hai tiêu chí riêng trong Nghị quyết; phần mềm dùng chung một lựa chọn địa bàn — đối chiếu nếu khác.");
    return { dong, tong: dong.reduce((s, x) => s + x.soTien, 0), canhBao, nguon };
  }

  // ---------- Bảng giá đất (dán từ Excel hoặc CSV) ----------
  const COT = { xa: /^(xã|xa|phường|phuong|đơn vị|don vi|địa bàn)/i, tuyen: /(tuyến|tuyen|đường|duong|khu vực|khu vuc|đoạn|doan)/i, viTri: /(vị trí|vi tri)/i, loai: /(loại đất|loai dat|loại|mục đích)/i, gia: /(giá|gia|đồng)/i };
  function docBangGia(text) {
    const dong = String(text || "").replace(/^﻿/, "").split(/\r?\n/).filter(x => x.trim());
    if (dong.length < 2) return { loi: "Cần ít nhất một dòng tiêu đề và một dòng dữ liệu" };
    const tach = l => l.includes("\t") ? l.split("\t") : tachCsv(l);
    const dau = tach(dong[0]).map(x => x.trim());
    const viTriCot = {};
    for (const [k, re] of Object.entries(COT)) { const i = dau.findIndex((h, j) => re.test(h) && !Object.values(viTriCot).includes(j)); if (i >= 0) viTriCot[k] = i; }
    if (viTriCot.gia == null) return { loi: "Không thấy cột giá (tiêu đề chứa “Giá”)" };
    const ds = [];
    for (const l of dong.slice(1)) {
      const c = tach(l); const g = so(c[viTriCot.gia]);
      if (!isFinite(g) || g <= 0) continue;
      ds.push({ xa: (c[viTriCot.xa] || "").trim(), tuyen: (c[viTriCot.tuyen] || "").trim(), viTri: (c[viTriCot.viTri] || "").trim(), loai: (c[viTriCot.loai] || "").trim(), gia: g });
    }
    if (!ds.length) return { loi: "Không đọc được dòng giá nào" };
    return { ds, cot: Object.keys(viTriCot) };
  }
  function tachCsv(l) {
    const ra = []; let cur = "", q = false;
    for (let i = 0; i < l.length; i++) { const ch = l[i]; if (q) { if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; } else if (ch === '"') q = true; else if (ch === "," || ch === ";") { ra.push(cur); cur = ""; } else cur += ch; }
    ra.push(cur); return ra;
  }

  return { tinh, tinhPhiGCN, docBangGia, docSo, tien, so, soVN };
})();
