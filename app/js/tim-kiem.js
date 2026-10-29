/* Tìm kiếm toàn văn tiếng Việt.
 * - Gõ không dấu: so khớp không dấu. Gõ có dấu: từ nào có dấu thì so khớp đúng dấu ("sổ" không khớp "số");
 *   nếu không có kết quả mới nới sang không dấu và báo cho người dùng.
 * - Từ đồng nghĩa, viết tắt, cách gọi thông dụng (B.dongNghia): "sổ đỏ" → "giấy chứng nhận", "NVTC" → "nghĩa vụ tài chính".
 * - Xếp hạng BM25 theo trường (tiêu đề nặng hơn nội dung), thưởng khớp cả cụm, khớp mã thủ tục/mẫu.
 * - Từ không có trong dữ liệu: sửa gần đúng (khoảng cách 1–2 ký tự) và báo "đã hiểu là".
 * - Chỉ trả về tài liệu chứa đủ mọi nhóm từ khóa — không có kết quả "gợi ý" giả; khi không có kết quả,
 *   gợi ý bỏ bớt từ khóa kèm số kết quả thật.
 */
window.TT = window.TT || {};
TT.taoTimKiem = function (mh) {
  const ti = TT.ti;
  const K1 = 1.2, BM_B = 0.6;
  const tl = []; // { loai, nhom, id, tieuDe, phu, lienKet, truong:[{ten, goc, chuan, thuong, trongSo, lienKet, dai}] }
  const truong = (ten, goc, trongSo, lienKet) => {
    goc = String(goc || "").normalize("NFC");
    const chuan = ti.chuanHoa(goc);
    return { ten, goc, chuan, thuong: ti.thuong(goc), trongSo, lienKet, dai: chuan ? chuan.split(" ").length : 0 };
  };

  for (const t of mh.thuTuc) {
    const f = [truong("Tên thủ tục", t.ten, 10), truong("Mã", "Thủ tục " + t.ma + (t.maQuocGia && t.maQuocGia.mucDo === "khop" ? " Mã TTHC " + t.maQuocGia.ma : ""), 8)];
    if (!t.khopTen) f.push(truong("Tên tại nội dung", t.tenNoiDung, 6));
    for (const k of [1, 2, 3, 4, 5, 6, 7, 8, 9]) if (t.muc[k]) f.push(truong(mh.TEN_MUC[k], t.muc[k].noiDung, k === 4 || k === 5 || k === 8 ? 2 : 1, `#/thu-tuc/${t.ma}/${k}`));
    tl.push({ loai: "thu-tuc", nhom: "Thủ tục hành chính", id: t.ma, ma: t.ma, tieuDe: t.ten, phu: `Thủ tục ${t.ma} · Phụ lục ${t.phuLuc} · ${t.cap}`, lienKet: "#/thu-tuc/" + t.ma, truong: f });
  }
  for (const q of mh.quyTrinh) {
    for (const b of q.buoc) {
      tl.push({ loai: "buoc-qt", nhom: "Bước quy trình luân chuyển", id: q.id + "/" + b.id, tieuDe: b.ten, phu: `${q.ten} · Khoản ${b.canCu.khoan} Điều ${b.canCu.dieu}`, lienKet: `#/quy-trinh/${q.id}/${b.id}`,
        truong: [truong("Công đoạn", b.ten, 8), truong("Nguyên văn", b.nguyenVan, 2), truong("Cơ quan", (mh.coQuanTheoId[b.lane] || {}).ten, 3), truong("Thời hạn", b.thoiHan && (b.thoiHan.nguyenVan || b.thoiHan.ghiChu), 2)] });
    }
  }
  for (const m of mh.mauBieu) {
    tl.push({ loai: "mau", nhom: "Mẫu đơn, tờ khai, biểu mẫu", id: m.khoa, ma: "mau " + m.khoa, tieuDe: `Mẫu số ${m.kyHieu}. ${m.ten}`, phu: `Phụ lục V · trang ${m.trangDau}`, lienKet: "#/mau-bieu/" + m.khoa,
      truong: [truong("Tên mẫu", `Mẫu số ${m.kyHieu} ${m.ten}`, 10), truong("Nội dung mẫu", m.noiDung, 1)] });
  }
  for (const d of mh.dieuQD) tl.push({ loai: "dieu", nhom: "Căn cứ pháp lý", id: "qd-" + d.so, tieuDe: `Điều ${d.so} Quyết định. ${d.tieuDe}`, phu: `Quyết định · trang ${d.trangDau}`, lienKet: "#/can-cu/qd-" + d.so, truong: [truong("Tiêu đề", `Điều ${d.so} ${d.tieuDe}`, 8), truong("Nội dung", d.noiDung, 1)] });
  for (const d of mh.dieu) tl.push({ loai: "dieu", nhom: "Căn cứ pháp lý", id: "dieu-" + d.so, ma: "dieu " + d.so, tieuDe: `Điều ${d.so}. ${d.tieuDe}`, phu: `${d.chuong} · trang ${d.trangDau}`, lienKet: "#/can-cu/dieu-" + d.so, truong: [truong("Tiêu đề", `Điều ${d.so} ${d.tieuDe}`, 8), truong("Nội dung", d.noiDung, 1)] });
  for (const m of mh.phuLucIV) tl.push({ loai: "pl4", nhom: "Thu hồi đất, bồi thường, hỗ trợ, tái định cư (Phụ lục IV)", id: m.so, tieuDe: `${m.so}. ${m.tieuDe}`, phu: `Phụ lục IV · trang ${m.trangDau}–${m.trangCuoi}`, lienKet: "#/thu-hoi/" + m.so, truong: [truong("Tiêu đề", m.tieuDe, 8), ...m.khoan.map(k => truong("Khoản " + k.so, k.noiDung, 1, `#/thu-hoi/${m.so}/${k.so}`))] });
  // Phí, lệ phí (Nghị quyết HĐND tỉnh)
  if (mh.P) for (const k of [mh.P.thamDinh, mh.P.lePhi, ...mh.P.khac]) {
    const noi = [k.mienNop].concat(k.toChucLanDau ? k.toChucLanDau.map(x => x[3] + " " + x[2]) : [], k.caNhanPhuong ? k.caNhanPhuong.map(x => x.noiDung + " " + x.mucThu) : [], k.bang ? k.bang.map(x => x.join(" ")) : []).flat().join("\n");
    tl.push({ loai: "phi", nhom: "Phí, lệ phí", id: k.id || k.viTri, tieuDe: k.ten, phu: `${mh.P.vanBan.ten} · ${k.viTri}`, lienKet: "#/phi-le-phi", truong: [truong("Tên khoản thu", k.ten + " phí lệ phí", 10), truong("Nội dung", noi, 1)] });
  }
  for (const c of mh.coQuan) if (mh.chiMucCoQuan[c.id]) tl.push({ loai: "co-quan", nhom: "Cơ quan, chủ thể", id: c.id, tieuDe: c.ten, phu: c.nhom, lienKet: "#/co-quan/" + c.id, truong: [truong("Tên", c.ten, 10)] });
  for (const v of Object.values(mh.vanBanDanChieu)) tl.push({ loai: "van-ban", nhom: "Văn bản được viện dẫn", id: v.ten, tieuDe: v.ten, phu: `Được viện dẫn tại ${v.viTri.length} vị trí`, lienKet: "#/can-cu?vb=" + encodeURIComponent(v.ten), truong: [truong("Tên văn bản", v.ten, 10)] });

  // ---------- Thống kê cho BM25, từ vựng cho sửa gần đúng ----------
  const daiTB = {};
  { const tong = {}, dem = {}; for (const d of tl) for (const f of d.truong) { tong[f.ten] = (tong[f.ten] || 0) + f.dai; dem[f.ten] = (dem[f.ten] || 0) + 1; } for (const k in tong) daiTB[k] = tong[k] / dem[k] || 1; }
  const tuVung = new Map();
  for (const d of tl) for (const f of d.truong) for (const w of f.chuan.split(" ")) if (w.length > 1 && !/^\d+$/.test(w)) tuVung.set(w, (tuVung.get(w) || 0) + 1);

  // Bảng đồng nghĩa: cụm (bỏ dấu) → cụm văn bản; khớp cụm dài trước
  const dongNghia = [];
  // "thanh" là một cụm, hoặc mảng cụm (tài liệu phải chứa đủ các cụm), vd. "lên thổ cư" → ["chuyen muc dich", "dat o"]
  for (const g of (mh.B.dongNghia || [])) for (const t of g.tu) { const goc = [].concat(g.thanh), ds = goc.map(ti.chuanHoa); dongNghia.push({ tu: ti.chuanHoa(t), thanh: ds[0], them: ds.slice(1), hienThi: goc.join(" + ") }); }
  dongNghia.sort((a, b) => b.tu.length - a.tu.length);

  // ---------- Đếm số lần khớp ----------
  function demKhop(f, term) {
    if (term.re) { term.re.lastIndex = 0; return Math.min(50, (f.chuan.match(term.re) || []).length); }
    const t = term.dau ? f.thuong : f.chuan, vt = term.dau ? ti.viTriDauTuCoDau : ti.viTriDauTu;
    let n = 0, i = vt(t, term.c);
    while (i >= 0 && n < 50) { n++; i = vt(t, term.c, i + term.c.length); }
    return n;
  }

  // Khoảng cách ký tự nhỏ nhất giữa hai cụm trong một trường (−1 nếu thiếu một cụm); 0–1 là liền nhau
  function viTriKhop(f, term) {
    if (term.re) { const ds = []; term.re.lastIndex = 0; let m; while ((m = term.re.exec(f.chuan)) && ds.length < 40) ds.push([m.index, m.index + m[0].length]); return ds; }
    const t = ti.chuanHoa(term.c), ds = []; let i = ti.viTriDauTu(f.chuan, t);
    while (i >= 0 && ds.length < 40) { ds.push([i, i + t.length]); i = ti.viTriDauTu(f.chuan, t, i + t.length); }
    return ds;
  }
  function khoangCachGan(f, a, b) {
    const A = viTriKhop(f, a); if (!A.length) return -1;
    const Bv = viTriKhop(f, b); if (!Bv.length) return -1;
    let min = Infinity;
    for (const x of A) for (const y of Bv) min = Math.min(min, y[0] >= x[1] ? y[0] - x[1] : x[0] >= y[1] ? x[0] - y[1] + 5 : 0);
    return min;
  }

  // Khoảng cách Damerau–Levenshtein (giới hạn), dùng sửa lỗi gõ
  function khoangCach(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      let minDong = Infinity;
      for (let j = 1; j <= b.length; j++) {
        const c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        minDong = Math.min(minDong, d[i][j]);
      }
      if (minDong > max) return max + 1;
    }
    return d[a.length][b.length];
  }
  const coTrongDuLieu = w => { for (const k of tuVung.keys()) if (k.startsWith(w)) return true; return false; };
  function suaGanDung(w) {
    // Từ 3 ký tự chỉ sửa khi không có nguyên âm (rõ là gõ thiếu, vd. "nhn")
    if (w.length < 3 || (w.length === 3 && /[aeiouy]/.test(w)) || /\d/.test(w) || coTrongDuLieu(w)) return null;
    const max = w.length >= 8 ? 2 : 1;
    let tot = null;
    for (const [k, n] of tuVung) {
      if (Math.abs(k.length - w.length) > max) continue;
      const d = khoangCach(w, k, max);
      if (d <= max && (!tot || d < tot.d || (d === tot.d && n > tot.n))) tot = { tu: k, d, n };
    }
    if (tot) return tot.tu;
    // Hai từ bị viết liền: "tachthua" → "tach thua"
    for (let i = 2; i <= w.length - 2; i++) { const a = w.slice(0, i), b = w.slice(i); if (tuVung.has(a) && tuVung.has(b)) return a + " " + b; }
    return null;
  }

  // ---------- Phân tích câu tìm ----------
  // Trả về nhóm từ khóa; mỗi nhóm là danh sách phương án (term = { c, dau }); tài liệu phải khớp ít nhất một phương án của mọi nhóm
  function tachTuKhoa(q) {
    const goc = ti.thuong(q);
    const giaiThich = { dongNghia: [], suaChinhTa: [] };
    const nhom = [];
    // Cụm trong ngoặc kép giữ nguyên
    let du = goc.replace(/["“”]([^"“”]+)["“”]/g, (_, c) => { c = c.trim(); if (c) nhom.push({ nhan: c, pa: [ti.coDau(c) ? { c, dau: true } : { c: ti.chuanHoa(c) }], cum: true }); return " "; });
    // Mã thủ tục (I.1, II.13, III.3) và mẫu ("mẫu 19", "mẫu số 04a")
    const ma = [];
    du = du.replace(/(^|\s)(i{1,3})\.(\d{1,2})(?=\s|$)/g, (_, s, pl, so) => { ma.push(pl.toUpperCase() + "." + so); return " "; });
    // Mã TTHC quốc gia dạng 1.012784
    du = du.replace(/(^|\s)([12]\.0\d{5})(?=\s|$)/g, (_, s, m) => { for (const t of mh.thuTuc) if (t.maQuocGia && t.maQuocGia.mucDo === "khop" && t.maQuocGia.ma === m) ma.push(t.ma); if (!ma.length) ma.push("khong-co"); return " "; });
    du = du.replace(/(^|\s)mẫu(?:\s+số)?\s+(\d{1,2}[a-zđ]?)(?=\s|$)/gi, (_, s, k) => { ma.push("mau " + ti.chuanKyHieu(k)); return " "; });
    du = du.replace(/(^|\s)mau(?:\s+so)?\s+(\d{1,2}[a-z]?)(?=\s|$)/gi, (_, s, k) => { ma.push("mau " + ti.chuanKyHieu(k)); return " "; });
    du = du.replace(/[,;:!?()[\]]/g, " ").replace(/\s+/g, " ").trim();
    // Số + đơn vị thời gian ("15 ngày", "03 ngày làm việc") là một cụm
    du = du.replace(/(^|\s)0*(\d{1,3})\s+(ngày làm việc|ngay lam viec|ngày|ngay|tháng|thang)(?=\s|$)/gi, (_, s0, so, dv) => { const dvc = ti.chuanHoa(dv); nhom.push({ nhan: so + " " + dv, pa: [{ c: so + " " + dvc, re: new RegExp(`(^|[^0-9/])0*${so}\\s*(\\([^)]{1,25}\\)\\s*)?${dvc}(?![a-z])`, "g") }], cum: true, viTri: -0.5 }); return " "; }).trim();
    // Đồng nghĩa: tìm trên dạng bỏ dấu, theo ranh giới từ
    const tuGoc = du ? du.split(" ") : [], tuKD = tuGoc.map(ti.chuanHoa);
    const daDung = new Array(tuGoc.length).fill(false);
    for (const dn of dongNghia) {
      const p = dn.tu.split(" ");
      for (let i = 0; i + p.length <= tuKD.length; i++) {
        if (daDung.slice(i, i + p.length).some(Boolean)) continue;
        if (p.every((w, j) => tuKD[i + j] === w)) {
          const nhanGoc = tuGoc.slice(i, i + p.length).join(" ");
          const pa = [{ c: dn.thanh }];
          if (dn.thanh !== dn.tu) pa.push(ti.coDau(nhanGoc) ? { c: nhanGoc, dau: true } : { c: dn.tu });
          if (dn.them.length) pa.splice(1);
          nhom.push({ nhan: nhanGoc, pa, viTri: i });
          for (const c of dn.them) nhom.push({ nhan: nhanGoc, pa: [{ c }], viTri: i + 0.5, phu: true });
          if (dn.thanh !== dn.tu) giaiThich.dongNghia.push({ tu: nhanGoc, thanh: dn.hienThi });
          for (let j = 0; j < p.length; j++) daDung[i + j] = true;
        }
      }
    }
    tuGoc.forEach((w, i) => {
      if (daDung[i] || !w) return;
      const kd = tuKD[i];
      if (!kd) return;
      const pa = [ti.coDau(w) ? { c: w, dau: true } : { c: kd }];
      // Từ có dấu, ngắn (≤ 4 ký tự) là từ có nghĩa người dùng chủ động gõ: không tự sửa sang từ khác
      const sua = ti.coDau(w) && kd.length <= 4 ? null : suaGanDung(kd);
      if (sua) { pa.splice(0, 1, { c: sua }); giaiThich.suaChinhTa.push({ tu: w, thanh: sua }); }
      nhom.push({ nhan: w, pa, viTri: i });
    });
    nhom.sort((a, b) => (a.viTri ?? -1) - (b.viTri ?? -1));
    const tu = [...new Map(nhom.flatMap(g => g.pa).map(t => [(t.dau ? "1" : "0") + t.c, t])).values()].map(t => t.dau ? t : t.c);
    return { chuan: ti.chuanHoa(goc.replace(/["“”]/g, "")), nhom, ma, tu, giaiThich };
  }

  // ---------- Tìm ----------
  function chamDiem(d, nhom, chuan, idf) {
    let diem = 0, truongKhop = null, diemTruongMax = -1;
    const diemTruong = new Map();
    for (const g of nhom) {
      let tot = 0;
      for (const term of g.pa) {
        let s = 0, smax = 0;
        for (const f of d.truong) {
          const tf = demKhop(f, term);
          if (!tf) continue;
          const k1 = f.trongSo >= 8 ? 0.3 : K1; // tiêu đề: lặp từ không làm tăng điểm nhiều
          const v = f.trongSo * idf(term) * tf * (k1 + 1) / (tf + k1 * (1 - BM_B + BM_B * f.dai / (daiTB[f.ten] || 1)));
          s += v; smax = Math.max(smax, v); diemTruong.set(f, (diemTruong.get(f) || 0) + v);
        }
        // Trường khớp tốt nhất tính đủ, các trường khác tính một phần — tránh thủ tục dài lấn át thủ tục đúng tên
        tot = Math.max(tot, smax + 0.25 * (s - smax));
      }
      if (!tot) return null;
      diem += tot;
    }
    for (const [f, v] of diemTruong) if (v > diemTruongMax) { diemTruongMax = v; truongKhop = f; }
    // Thưởng cặp từ khóa liền nhau (gần nghĩa cụm), khớp cả cụm câu tìm, vị trí sớm trong tiêu đề
    for (let i = 0; i + 1 < nhom.length; i++) {
      const a = nhom[i].pa[0], b = nhom[i + 1].pa[0];
      let tot = 0;
      for (const f of d.truong) { if (f.trongSo <= tot) continue; const k = khoangCachGan(f, a, b); if (k >= 0 && k <= 40) tot = f.trongSo * (k <= 1 ? 1 : 0.6); }
      diem += tot * 1.5;
    }
    if (nhom.length > 1 && chuan) for (const f of d.truong) if (ti.chuaDauTu(f.chuan, chuan)) { diem += f.trongSo * 2; break; }
    const td = ti.chuanHoa(d.tieuDe);
    if (chuan && td.startsWith(chuan)) diem += 10;
    else if (chuan) { const vt = ti.viTriDauTu(td, chuan); if (vt >= 0) diem += 8 * (1 - Math.min(vt, 200) / 200); }
    return { diem, truongKhop };
  }

  function timVoiNhom(nhom, ma, chuan, boLoc) {
    const N = tl.length;
    const cacheIdf = new Map();
    const idf = term => {
      const k = (term.dau ? "1" : "0") + term.c;
      if (!cacheIdf.has(k)) { let df = 0; for (const d of tl) if (d.truong.some(f => demKhop(f, term))) df++; cacheIdf.set(k, Math.log(1 + (N - df + 0.5) / (df + 0.5))); }
      return cacheIdf.get(k);
    };
    const ketQua = [];
    for (const d of tl) {
      if (boLoc && boLoc.loai && boLoc.loai !== d.loai) continue;
      const khopMa = ma.length && d.ma && ma.some(m => m === d.ma);
      if (ma.length && !khopMa && !nhom.length) continue;
      if (ma.length && !khopMa) continue;
      let r = nhom.length ? chamDiem(d, nhom, chuan, idf) : { diem: 0, truongKhop: null };
      if (!r) continue;
      if (khopMa) r.diem += 100;
      const fTrich = r.truongKhop && r.truongKhop.trongSo < 8 ? r.truongKhop : d.truong.find(f => f.trongSo < 8 && nhom.length && nhom.every(g => g.pa.some(t => demKhop(f, t))));
      const tuTrich = nhom.flatMap(g => g.pa.map(t => t.re ? t.c.split(" ")[0] : t.dau ? t : t.c));
      ketQua.push({ ...d, diem: r.diem, truongTrich: fTrich ? fTrich.ten : null, trich: fTrich ? ti.trichDoan(fTrich.goc, tuTrich) : null, lienKetTruong: fTrich && fTrich.lienKet });
    }
    ketQua.sort((a, b) => b.diem - a.diem || a.tieuDe.localeCompare(b.tieuDe, "vi"));
    return ketQua;
  }

  function tim(q, boLoc) {
    const p = tachTuKhoa(q);
    if (!p.nhom.length && !p.ma.length) return { tu: [], ketQua: [], giaiThich: p.giaiThich, goiY: [] };
    let ketQua = timVoiNhom(p.nhom, p.ma, p.chuan, boLoc);
    let nhom = p.nhom, noiDau = false;
    // Không có kết quả khi so khớp có dấu → nới sang không dấu
    if (!ketQua.length && nhom.some(g => g.pa.some(t => t.dau))) {
      const nhomKD = nhom.map(g => ({ ...g, pa: g.pa.map(t => t.dau ? { c: ti.chuanHoa(t.c) } : t) }));
      const kq2 = timVoiNhom(nhomKD, p.ma, p.chuan, boLoc);
      if (kq2.length) { ketQua = kq2; nhom = nhomKD; noiDau = true; }
    }
    // Không có kết quả: gợi ý bỏ từng nhóm từ khóa (kèm số kết quả thật)
    const goiY = [];
    if (!ketQua.length && nhom.length > 1) {
      for (let i = 0; i < nhom.length; i++) {
        const con = nhom.filter((_, j) => j !== i);
        const n = timVoiNhom(con, p.ma, "", boLoc).length;
        if (n) goiY.push({ bo: nhom[i].nhan, q: con.map(g => g.cum ? `"${g.nhan}"` : g.nhan).join(" "), soKetQua: n });
      }
      goiY.sort((a, b) => b.soKetQua - a.soKetQua);
    }
    const tu = [...new Map(nhom.flatMap(g => g.pa).map(t => [(t.dau ? "1" : "0") + t.c, t])).values()].map(t => t.re ? t.c.split(" ")[0] : t.dau ? t : t.c);
    return { tu: [ti.coDau(q) ? null : p.chuan, ...tu].filter(Boolean), ketQua, giaiThich: { ...p.giaiThich, noiDau }, goiY: goiY.slice(0, 3) };
  }

  // Tìm ngữ cảnh cho hỏi đáp: câu hỏi tự nhiên, bỏ hư từ, không bắt buộc đủ mọi từ (≥ 50% nhóm từ khóa).
  // Trả về đoạn trích theo trường khớp tốt nhất của mỗi tài liệu — để gửi kèm câu hỏi cho mô hình ngôn ngữ.
  const HU_TU = new Set("thi la va cua cho voi cac nhung mot nay do khi nao gi bao nhieu co khong duoc phai can lam the nhu ra sao o tai tu den hay hoac neu ve trong theo de ma toi minh em anh chi ong ba ban xin hoi a a cung da se dang bi boi".split(" "));
  function timNguCanh(q, soLuong) {
    const p = tachTuKhoa(q);
    const nhom = p.nhom.filter(g => g.cum || g.pa.some(t => t.re) || !g.pa.every(t => !t.dau && HU_TU.has(t.c)) && !(g.pa.length === 1 && HU_TU.has(ti.chuanHoa(g.pa[0].c))));
    if (!nhom.length && !p.ma.length) return [];
    const N = tl.length, cache = new Map();
    const idf = term => { const k = (term.dau ? "1" : "0") + term.c; if (!cache.has(k)) { let df = 0; for (const d of tl) if (d.truong.some(f => demKhop(f, term))) df++; cache.set(k, Math.log(1 + (N - df + 0.5) / (df + 0.5))); } return cache.get(k); };
    const can = Math.max(1, Math.ceil(nhom.length * 0.5)), kq = [];
    for (const d of tl) {
      let diem = 0, khop = 0; const diemTruong = new Map();
      for (const g of nhom) {
        let tot = 0;
        for (const term of g.pa) for (const f of d.truong) { const tf = demKhop(f, term); if (!tf) continue; const v = f.trongSo * idf(term) * tf / (tf + 1); tot = Math.max(tot, v); diemTruong.set(f, (diemTruong.get(f) || 0) + v); }
        if (tot) { khop++; diem += tot; }
      }
      if (p.ma.length && d.ma && p.ma.includes(d.ma)) { diem += 100; khop = nhom.length; }
      if (khop < can || !diem) continue;
      const fTot = [...diemTruong].filter(([f]) => f.trongSo < 8).sort((a, b) => b[1] - a[1])[0];
      const tu = nhom.flatMap(g => g.pa.map(t => t.re ? t.c.split(" ")[0] : t.dau ? t : t.c));
      kq.push({ id: d.id, loai: d.loai, nhom: d.nhom, tieuDe: d.tieuDe, phu: d.phu, lienKet: (fTot && fTot[0].lienKet) || d.lienKet, truong: fTot ? fTot[0].ten : null,
        noiDung: fTot ? ti.trichDoan(fTot[0].goc, tu, 700) : d.truong.map(f => f.goc).join(" ").slice(0, 1400), diem: diem * (khop / nhom.length) });
    }
    return kq.sort((a, b) => b.diem - a.diem).slice(0, soLuong || 8);
  }

  return { tim, tachTuKhoa, timNguCanh, soTaiLieu: tl.length };
};
