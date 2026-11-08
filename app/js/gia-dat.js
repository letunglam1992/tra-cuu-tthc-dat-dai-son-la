/* Tra cứu Bảng giá đất tỉnh Sơn La (Nghị quyết số 152/2025/NQ-HĐND; bổ sung theo Nghị quyết số 28/2026/NQ-HĐND).
 * Dữ liệu app/du-lieu/bang-gia-dat.js (~0,8 MB) chỉ nạp khi mở công cụ cần đến. Không phụ thuộc giao diện — dùng chung cho kiểm thử.
 * Điều chỉnh giá theo vị trí, chênh cao, đường đất, đất nông nghiệp xen kẹt: Điều 4, Điều 6 Quy định kèm theo Nghị quyết 152
 * (cùng cách hiểu với phần mềm GPMB — packages/core/src/gia-dat.ts). */
window.TT = window.TT || {};
TT.giaDat = (function () {
  let D = null, chiMuc = null, dangNap = null;
  const LOAI_PNN = ["o", "tmdv", "skc"]; // khớp thứ tự D.loai
  const TEN_LOAI = { o: "Đất ở", tmdv: "Đất thương mại, dịch vụ", skc: "Đất cơ sở sản xuất, kinh doanh phi nông nghiệp" };

  function gan(du) {
    D = du; const ch = TT.ti.chuanHoa;
    chiMuc = D.tuyen.map((t, i) => ({ i, loai: LOAI_PNN[t[0]], xa: t[1], vb: t[2], bang: t[3], stt: t[4], nhom: D.nhom[t[5]], ten: t[6], vt: t[7], canhBao: t[8] || [], thayDoi: t[9] || null,
      tim: ch(D.nhom[t[5]] + " " + t[6] + (t[9] && t[9].doiTen ? " " + t[9].doiTen.ten : "") + (t[9] && t[9].doiNhom ? " " + t[9].doiNhom.ten : "")) }));
    return D;
  }
  // Nạp dữ liệu (trình duyệt): chèn thẻ script một lần
  function nap() {
    if (D) return Promise.resolve(D);
    if (window.QD75_BANG_GIA) return Promise.resolve(gan(window.QD75_BANG_GIA));
    if (!dangNap) dangNap = new Promise((ok, loi) => {
      const s = document.createElement("script"); s.src = "du-lieu/bang-gia-dat.js";
      s.onload = () => window.QD75_BANG_GIA ? ok(gan(window.QD75_BANG_GIA)) : loi(new Error("Tệp bảng giá đất không hợp lệ"));
      s.onerror = () => { dangNap = null; loi(new Error("Không tải được bảng giá đất (kiểm tra kết nối mạng)")); };
      document.head.appendChild(s);
    });
    return dangNap;
  }
  const daNap = () => !!D;
  const vanBan = i => D.vanBan[i];
  // Văn bản có hiệu lực tại ngày tính (chuỗi yyyy-mm-dd)
  const coHieuLuc = (vb, ngay) => !ngay || D.vanBan[vb].hieuLucTu <= ngay;
  // Tên tuyến, tên nhóm tại ngày tính (Phụ lục IV Nghị quyết 28/2026); ngày bỏ trống = tên hiện hành (theo hôm nay)
  const homNay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const sauNgay = (x, ngay) => x && (ngay || homNay()) >= x.tu;
  const tenTai = (t, ngay) => sauNgay(t.thayDoi && t.thayDoi.doiTen, ngay) ? t.thayDoi.doiTen.ten : t.ten;
  const nhomTai = (t, ngay) => sauNgay(t.thayDoi && t.thayDoi.doiNhom, ngay) ? t.thayDoi.doiNhom.ten : t.nhom;
  // Điều 2 Nghị quyết 28/2026: bãi bỏ khoản 3 Điều 4 (giảm 30% khi chênh cao ≥ 1,5 m) từ ngày Nghị quyết có hiệu lực
  const boChenhCao = ngay => D.vanBan[1] && (ngay || homNay()) >= D.vanBan[1].hieuLucTu;

  /* Tìm tuyến: loai "o" | "tmdv" | "skc"; xa: chỉ số xã (bỏ trống = toàn tỉnh); q: từ khóa (không dấu cũng được); ngay: ngày tính giá.
   * Trả về danh sách tuyến, kèm `chuaHieuLuc` nếu thuộc văn bản chưa có hiệu lực tại ngày tính. */
  function timTuyen({ loai, xa, q, ngay, toiDa }) {
    const tu = TT.ti.chuanHoa(q || "").split(/\s+/).filter(Boolean);
    const ra = [];
    for (const t of chiMuc) {
      if (loai && t.loai !== loai) continue;
      if (xa != null && xa !== "" && t.xa !== +xa) continue;
      if (tu.length && !tu.every(w => t.tim.includes(w))) continue;
      ra.push(t);
    }
    // Văn bản có hiệu lực lên trước; trong cùng xã giữ thứ tự bảng giá
    ra.sort((a, b) => (coHieuLuc(b.vb, ngay) - coHieuLuc(a.vb, ngay)) || (a.xa - b.xa) || (a.i - b.i));
    // Phụ lục IV, V Nghị quyết 28/2026: tại ngày tính, tuyến đổi tên hiện tên mới; tuyến bãi bỏ xếp cuối, không cho chọn giá
    const trangThai = t => { const td = t.thayDoi || {}, sau = x => x && (!ngay || ngay >= x.tu);
      return { ...t, chuaHieuLuc: !coHieuLuc(t.vb, ngay), daBaiBo: sau(td.baiBo) ? td.baiBo : null, tenCu: sau(td.doiTen) ? t.ten : null, ten: sau(td.doiTen) ? td.doiTen.ten : t.ten,
        nhomCu: sau(td.doiNhom) ? t.nhom : null, nhom: sau(td.doiNhom) ? td.doiNhom.ten : t.nhom }; };
    return ra.map(trangThai).sort((a, b) => !!a.daBaiBo - !!b.daBaiBo).slice(0, toiDa || 300);
  }
  const tuyen = i => chiMuc[i];
  // Giá đất nông nghiệp theo xã (Bảng 01–03), rừng sản xuất toàn tỉnh (Bảng 04)
  function giaNN(xa, ma) {
    const r = D.nn.find(x => x[0] === +xa && x[1] === ma);
    if (r) return { gia: r[2] * D.donVi, bang: r[3], ma, ten: D.tenNN[ma], xa: D.xa[r[0]] };
    const t = D.nnToanTinh.find(x => x[0] === ma);
    return t ? { gia: t[1] * D.donVi, bang: t[2], ma, ten: D.tenNN[ma], xa: "Toàn tỉnh" } : null;
  }
  const maNN = () => Object.keys(D.tenNN);

  /* Giá một vị trí của tuyến, áp điều chỉnh (thứ tự: vị trí → chênh cao / đường đất); dc.ngay: ngày tính giá.
   *  chenhCao: chênh cao bình quân ≥ 1,5 m → giảm 30% (khoản 3 Điều 4 — bị bãi bỏ tại Điều 2 Nghị quyết 28/2026 từ 01/11/2026);
   *  duongDat: vị trí 2–5 mặt đường đất → 70% (khoản 4 Điều 4). */
  function giaViTri(i, viTri, dc) {
    const t = chiMuc[i], g = t.vt[viTri - 1], ngay = dc && dc.ngay;
    if (g == null) return null;
    const goc = g * D.donVi, buoc = [];
    let gia = goc;
    if (dc && dc.chenhCao) {
      if (boChenhCao(ngay)) buoc.push("không giảm do chênh cao — khoản 3 Điều 4 đã bị bãi bỏ tại Điều 2 Nghị quyết 28/2026 từ 01/11/2026");
      else { gia *= 0.7; buoc.push("chênh cao ≥ 1,5 m: giảm 30% (khoản 3 Điều 4)"); }
    }
    if (dc && dc.duongDat && viTri >= 2) { gia *= 0.7; buoc.push(`vị trí ${viTri} mặt đường đất: 70% (khoản 4 Điều 4)`); }
    return { gia: Math.round(gia), goc, buoc, moTa: moTa(t, viTri, ngay), canhBao: t.canhBao };
  }
  // Đất nông nghiệp trong cùng thửa có đất ở hoặc xen kẹt đất ở: tăng 50% (khoản 1 Điều 6)
  function giaNNDieuChinh(xa, ma, xenKep) {
    const r = giaNN(xa, ma); if (!r) return null;
    const gia = xenKep ? Math.round(r.gia * 1.5) : r.gia;
    return { gia, goc: r.gia, buoc: xenKep ? ["đất nông nghiệp trong thửa có đất ở / xen kẹt đất ở: +50% (khoản 1 Điều 6)"] : [],
      moTa: `${r.ten} — ${r.xa} (Bảng ${r.bang}, ${tenVB(0)})`, canhBao: [] };
  }
  /* Khoản 8 Điều 7 Quy định kèm theo Nghị quyết 152/2025 (bổ sung tại khoản 6 Điều 1 Nghị quyết 28/2026, hiệu lực 01/11/2026):
   * “Đối với diện tích đất thương mại, dịch vụ của hộ gia đình, cá nhân đang sử dụng ổn định lâu dài có nguồn gốc từ đất ở (được công nhận,
   * giao đất ban đầu là đất ở hoặc được phép chuyển mục đích sử dụng đất từ đất ở) thì giá đất được xác định bằng 90% đơn giá đất ở cùng vị trí,
   * cùng tuyến đường quy định tại Bảng số 05”. i: chỉ số tuyến TM-DV. */
  function giaTMDVNguonGocDatO(i, viTri, dc) {
    const t = chiMuc[i]; if (!t || t.loai !== "tmdv") return null;
    const o = chiMuc.find(x => x.loai === "o" && x.xa === t.xa && x.vb === t.vb && x.ten === t.ten && x.stt === t.stt);
    if (!o) return null;
    const r = giaViTri(o.i, viTri, dc); if (!r) return null;
    return { ...r, gia: Math.round(r.gia * 0.9), goc: r.goc, buoc: [`đất thương mại, dịch vụ của hộ gia đình, cá nhân có nguồn gốc từ đất ở: 90% đơn giá đất ở cùng vị trí, cùng tuyến (khoản 8 Điều 7, bổ sung tại khoản 6 Điều 1 Nghị quyết 28/2026)`, ...r.buoc], moTa: "Đất thương mại, dịch vụ có nguồn gốc từ đất ở — 90% giá " + moTa(o, viTri, dc && dc.ngay), tuyenDatO: o.i };
  }
  const tenVB = vb => vb === 1 ? "Nghị quyết 28/2026/NQ-HĐND" : "Nghị quyết 152/2025/NQ-HĐND";
  function moTa(t, viTri, ngay) {
    const nh = nhomTai(t, ngay), ten = tenTai(t, ngay), doi = ten !== t.ten || nh !== t.nhom;
    return `${TEN_LOAI[t.loai]} — ${D.xa[t.xa]}${t.stt ? `, STT ${t.stt}` : ""}: ${nh ? nh.replace(/^\d+\.\s*/, "") + " — " : ""}${ten}${viTri ? `, vị trí ${viTri}` : ""} (Bảng ${t.bang}, ${tenVB(t.vb)}${doi ? "; tên điều chỉnh tại Phụ lục IV Nghị quyết 28/2026" : ""})`;
  }
  // Tỷ lệ phân lớp theo chiều sâu so với lớp 1 (khoản 6 Điều 4): đất ở 60% lớp trước (≤ 20, 40, 60, 80 m); đất PNN khác 50% (≤ 40, 80, 120 m)
  const PHAN_LOP = {
    o: { tyLe: 0.6, moc: ["đến 20 m", "trên 20 m đến 40 m", "trên 40 m đến 60 m", "trên 60 m đến 80 m", "trên 80 m"], canCu: "điểm a khoản 6 Điều 4" },
    pnn: { tyLe: 0.5, moc: ["đến 40 m", "trên 40 m đến 80 m", "trên 80 m đến 120 m", "trên 120 m"], canCu: "điểm b khoản 6 Điều 4" }
  };
  const tyLeLop = (loai, lop) => { const c = PHAN_LOP[loai === "o" ? "o" : "pnn"]; return Math.round(Math.pow(c.tyLe, Math.min(lop, c.moc.length) - 1) * 10000) / 100; };

  return { nap, gan, daNap, vanBan, timTuyen, tuyen, tenTai, nhomTai, boChenhCao, giaNN, maNN, giaViTri, giaNNDieuChinh, giaTMDVNguonGocDatO, moTa, coHieuLuc, PHAN_LOP, tyLeLop, TEN_LOAI, get D() { return D; } };
})();
