/* Tính thời hạn giải quyết (tham khảo) — không phụ thuộc giao diện, dùng chung cho ứng dụng và kiểm thử.
 * Quy tắc áp dụng:
 *  - Mốc tính: kể từ ngày nhận được hồ sơ đầy đủ, hợp lệ (khoản 1 Điều 8 Quy định); ngày đầu tiên của thời hạn
 *    không tính, bắt đầu từ ngày tiếp theo liền kề (khoản 2 Điều 147 Bộ luật Dân sự 2015).
 *  - "Ngày làm việc": bỏ thứ Bảy, Chủ nhật, ngày nghỉ lễ, Tết; tính ngày làm bù theo thông báo.
 *  - "Ngày" (ngày lịch): tính liên tục; ngày cuối cùng rơi vào ngày nghỉ thì kết thúc vào ngày làm việc tiếp theo
 *    (Điều 148 Bộ luật Dân sự 2015).
 *  - Ngày nghỉ lễ (Điều 112 Bộ luật Lao động 2019): 1/1, Tết Âm lịch (5 ngày), 10/3 âm lịch, 30/4, 1/5, 2/9 và 01 ngày liền kề;
 *    ngày lễ trùng ngày nghỉ hằng tuần được nghỉ bù vào ngày làm việc kế tiếp.
 *    Kỳ nghỉ Tết, ngày liền kề Quốc khánh, hoán đổi ngày làm việc do Thủ tướng/Bộ Nội vụ thông báo hằng năm: nếu năm đó
 *    chưa nhập thông báo (B.lichNghi.theoNam), phần mềm TẠM TÍNH theo thông lệ và cảnh báo.
 */
window.TT = window.TT || {};
TT.thoiHan = (function () {
  // ---------- Âm lịch (thuật toán Hồ Ngọc Đức, múi giờ +7) ----------
  const PI = Math.PI, TZ = 7, INT = Math.floor;
  function jdTuNgay(d, m, y) {
    const a = INT((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + INT((153 * mm + 2) / 5) + 365 * yy + INT(yy / 4) - INT(yy / 100) + INT(yy / 400) - 32045;
  }
  function ngayTuJd(jd) {
    const a = jd + 32044, b = INT((4 * a + 3) / 146097), c = a - INT((b * 146097) / 4);
    const d = INT((4 * c + 3) / 1461), e = c - INT((1461 * d) / 4), m = INT((5 * e + 2) / 153);
    return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
  }
  function trangMoi(k) {
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr) - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr)) - 0.0074 * Math.sin(dr * (M - Mpr));
    C1 = C1 + 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    const deltat = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return INT(Jd1 + C1 - deltat + 0.5 + TZ / 24);
  }
  function kinhDoMatTroi(jdn) {
    const T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    const DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr; L = L - PI * 2 * INT(L / (PI * 2));
    return INT(L / PI * 6);
  }
  function thang11(y) {
    const off = jdTuNgay(31, 12, y) - 2415021, k = INT(off / 29.530588853);
    let nm = trangMoi(k);
    if (kinhDoMatTroi(nm) >= 9) nm = trangMoi(k - 1);
    return nm;
  }
  function viTriThangNhuan(a11) {
    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last, i = 1, arc = kinhDoMatTroi(trangMoi(k + i));
    do { last = arc; i++; arc = kinhDoMatTroi(trangMoi(k + i)); } while (arc !== last && i < 14);
    return i - 1;
  }
  // Âm lịch → dương lịch (tháng không nhuận); trả về Date
  function amSangDuong(ngay, thang, nam) {
    let a11, b11;
    if (thang < 11) { a11 = thang11(nam - 1); b11 = thang11(nam); } else { a11 = thang11(nam); b11 = thang11(nam + 1); }
    const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    let off = thang - 11; if (off < 0) off += 12;
    if (b11 - a11 > 365) { const leapOff = viTriThangNhuan(a11); if (off >= leapOff) off += 1; }
    const [d, m, y] = ngayTuJd(trangMoi(k + off) + ngay - 1);
    return new Date(y, m - 1, d);
  }

  // ---------- Ngày ----------
  const khoa = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const tuKhoa = s => { const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const cong = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const laCuoiTuan = d => d.getDay() === 0 || d.getDay() === 6;
  const THU = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const hienThi = d => d ? `${THU[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` : "";

  // Lịch nghỉ một năm: Map khoa → { ten, loai: "le" | "bu" | "tam-tinh" | "thong-bao" }; ngayLamBu: Set khoa
  const boNho = new Map();
  function lichNam(nam, lichNghi) {
    const ck = nam + JSON.stringify(lichNghi || {});
    if (boNho.has(ck)) return boNho.get(ck);
    const nghi = new Map(), lamBu = new Set();
    const tb = ((lichNghi && lichNghi.theoNam) || []).find(x => +x.nam === nam);
    const them = (d, ten, loai) => { const k = khoa(d); if (!nghi.has(k)) nghi.set(k, { ten, loai }); };
    // Ngày lễ dương lịch cố định + nghỉ bù
    const coDinh = [[1, 1, "Tết Dương lịch"], [30, 4, "Ngày Chiến thắng"], [1, 5, "Ngày Quốc tế lao động"], [2, 9, "Quốc khánh"]];
    for (const [d, m, ten] of coDinh) them(new Date(nam, m - 1, d), ten, "le");
    // Giỗ Tổ Hùng Vương 10/3 âm lịch
    them(amSangDuong(10, 3, nam), "Giỗ Tổ Hùng Vương (10/3 âm lịch)", "le");
    if (tb) {
      for (const s of tb.ngayNghi || []) { const d = tuKhoa(s); if (d) nghi.set(s, { ten: "Nghỉ theo thông báo" + (tb.nguon ? " (" + tb.nguon + ")" : ""), loai: "thong-bao" }); }
      for (const s of tb.ngayLamBu || []) lamBu.add(s);
    } else {
      // Tạm tính theo thông lệ: Tết = ngày cuối năm âm lịch + mùng 1–4; Quốc khánh thêm 01 ngày liền kề (1/9, hoặc 3/9 khi 2/9 là thứ Hai)
      const tet = amSangDuong(1, 1, nam);
      for (let i = -1; i <= 3; i++) them(cong(tet, i), i < 0 ? "Tết Âm lịch (tạm tính: ngày cuối năm)" : `Tết Âm lịch (tạm tính: mùng ${i + 1})`, "tam-tinh");
      const qk = new Date(nam, 8, 2);
      them(qk.getDay() === 1 ? new Date(nam, 8, 3) : new Date(nam, 8, 1), "Ngày liền kề Quốc khánh (tạm tính)", "tam-tinh");
    }
    // Nghỉ bù: ngày lễ cố định trùng thứ Bảy/Chủ nhật → ngày làm việc kế tiếp
    for (const [k, v] of [...nghi]) {
      if (v.loai !== "le" && !(v.loai === "tam-tinh" && /^Tết/.test(v.ten))) continue;
      const d = tuKhoa(k);
      if (!laCuoiTuan(d)) continue;
      let b = cong(d, 1);
      while (laCuoiTuan(b) || nghi.has(khoa(b))) b = cong(b, 1);
      nghi.set(khoa(b), { ten: "Nghỉ bù " + v.ten, loai: v.loai === "tam-tinh" ? "tam-tinh" : "bu" });
    }
    const kq = { nghi, lamBu, coThongBao: !!tb };
    boNho.set(ck, kq);
    return kq;
  }
  function thongTinNgay(d, lichNghi, nghiThem) {
    const k = khoa(d), l = lichNam(d.getFullYear(), lichNghi);
    if (nghiThem && nghiThem.has(k)) return { lam: false, ly: "Ngày nghỉ do người dùng nhập", loai: "nguoi-dung" };
    if (l.lamBu.has(k)) return { lam: true, ly: "Ngày làm bù theo thông báo" };
    if (l.nghi.has(k)) return { lam: false, ly: l.nghi.get(k).ten, loai: l.nghi.get(k).loai };
    if (laCuoiTuan(d)) return { lam: false, ly: THU[d.getDay()], loai: "cuoi-tuan" };
    return { lam: true };
  }

  /* Tính ngày hẹn trả.
   * tham số: { ngayNhan: Date, soNgay: số (có thể 0,5), donVi: "ngày làm việc" | "ngày", tangThem: số ngày làm việc cộng thêm (xã khu vực III),
   *            tamDung: số ngày làm việc không tính vào thời hạn (khoản 1 Điều 8), lichNghi, nghiThem: Set khoa }
   */
  function tinh(ts) {
    const nghiThem = ts.nghiThem || new Set();
    const canhBao = [];
    const ngayNhan = new Date(ts.ngayNhan.getFullYear(), ts.ngayNhan.getMonth(), ts.ngayNhan.getDate());
    const n0 = Math.max(0, +ts.soNgay || 0), them = Math.max(0, +ts.tangThem || 0), dung = Math.max(0, +ts.tamDung || 0);
    const nhanTT = thongTinNgay(ngayNhan, ts.lichNghi, nghiThem);
    if (!nhanTT.lam) canhBao.push(`Ngày nhận hồ sơ (${hienThi(ngayNhan)}) là ngày nghỉ (${nhanTT.ly}); kiểm tra lại ngày tiếp nhận.`);
    const cacNgay = [], nghiBiTru = [];
    let ngayHen;
    const nam = new Set();
    if (ts.donVi === "ngày") {
      // Ngày lịch: cộng liên tục; phần tăng thêm, tạm dừng vẫn tính bằng ngày làm việc nối tiếp
      let d = cong(ngayNhan, Math.ceil(n0));
      for (let i = 1; i <= Math.ceil(n0); i++) { const x = cong(ngayNhan, i); nam.add(x.getFullYear()); cacNgay.push({ ngay: x, dem: i, lam: true }); }
      let tt = thongTinNgay(d, ts.lichNghi, nghiThem);
      if (!tt.lam) { const goc = d; while (!thongTinNgay(d, ts.lichNghi, nghiThem).lam) d = cong(d, 1); canhBao.push(`Ngày cuối của thời hạn (${hienThi(goc)}) là ngày nghỉ (${tt.ly}) → kết thúc vào ngày làm việc tiếp theo (Điều 148 Bộ luật Dân sự 2015).`); }
      ngayHen = d;
      let conLai = them + dung;
      while (conLai > 0) { d = cong(d, 1); nam.add(d.getFullYear()); const t = thongTinNgay(d, ts.lichNghi, nghiThem); if (t.lam) { conLai--; cacNgay.push({ ngay: d, dem: "+", lam: true }); } else nghiBiTru.push({ ngay: d, ly: t.ly, loai: t.loai }); }
      ngayHen = d;
    } else {
      const tong = Math.ceil(n0) + them + dung;
      if (n0 % 1) canhBao.push(`Thời hạn có phần lẻ (${String(n0).replace(".", ",")} ngày làm việc): phần mềm làm tròn lên ${Math.ceil(n0)} ngày làm việc.`);
      let d = ngayNhan, dem = 0;
      while (dem < tong) {
        d = cong(d, 1); nam.add(d.getFullYear());
        const t = thongTinNgay(d, ts.lichNghi, nghiThem);
        if (t.lam) { dem++; cacNgay.push({ ngay: d, dem, lam: true }); } else nghiBiTru.push({ ngay: d, ly: t.ly, loai: t.loai });
        if (cacNgay.length + nghiBiTru.length > 2000) break;
      }
      ngayHen = d;
    }
    // Cảnh báo năm chưa có thông báo lịch nghỉ
    const tamTinh = nghiBiTru.filter(x => x.loai === "tam-tinh");
    if (tamTinh.length) canhBao.push(`Có ${tamTinh.length} ngày nghỉ TẠM TÍNH theo thông lệ (Tết Âm lịch, ngày liền kề Quốc khánh) vì chưa nhập thông báo lịch nghỉ chính thức của năm ${[...new Set(tamTinh.map(x => x.ngay.getFullYear()))].join(", ")}. Đối chiếu thông báo nghỉ lễ, Tết và nhập ngày nghỉ thực tế nếu khác.`);
    return { ngayNhan, ngayHen, cacNgay, nghiBiTru, canhBao, tong: { soNgay: n0, tangThem: them, tamDung: dung }, nam: [...nam] };
  }

  // Số ngày tăng thêm cho xã khu vực III nêu trong mục (3) (nếu có)
  function tangThemKhuVucIII(text) {
    const s = String(text || "").replace(/\s+/g, " ");
    const m = s.match(/khu vực III[^.]*?(?:tăng|cộng) thêm(?: không quá)? (\d+)\s*(?:\([^)]*\)\s*)?(ngày làm việc|ngày)/i);
    return m ? { ngay: +m[1], donVi: m[2], nguyenVan: m[0] } : null;
  }

  return { tinh, lichNam, thongTinNgay, amSangDuong, tangThemKhuVucIII, khoa, tuKhoa, hienThi, cong };
})();
