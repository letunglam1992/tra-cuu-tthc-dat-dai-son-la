/* Nguyên văn văn bản pháp luật đất đai (Luật Đất đai, NQ 254/2025/QH15, các nghị định, thông tư, quyết định của tỉnh).
 * - Danh mục + bản đồ sửa đổi: du-lieu/phap-luat/danh-muc.js (nạp cùng phần mềm). Nội dung từng văn bản: du-lieu/phap-luat/<MÃ>.js, nạp khi mở.
 * - lienKet(): gắn liên kết cho cụm viện dẫn “khoản 6 Điều 141 của Luật Đất đai”, “Nghị quyết số 254/2025/QH15”… trong nguyên văn.
 * - Bấm liên kết: mở ngăn bên phải với nguyên văn Điều, tô khoản/điểm được viện dẫn, kèm ghi chú “đã được sửa đổi tại …”. */
window.TT = window.TT || {};
TT.phapLuat = (function () {
  const PL = () => window.QD75_PHAP_LUAT || { danhMuc: {}, suaDoi: {} };
  const kho = {}, dangNap = {};
  let reVB = null, maTheoMau = [];
  const e = s => TT.ti.e(s);

  function nhan(ma, vb) { kho[ma] = { ...vb, theoSo: Object.fromEntries(vb.dieu.map(d => [d[0], { so: d[0], tieuDe: d[1], noiDung: d[2], chuong: d[3] }])) }; }
  function nap(ma) {
    if (kho[ma]) return Promise.resolve(kho[ma]);
    if (!PL().danhMuc[ma]) return Promise.reject(new Error("Văn bản chưa có nguyên văn trong phần mềm"));
    return dangNap[ma] || (dangNap[ma] = new Promise((ok, loi) => {
      const s = document.createElement("script"); s.src = `du-lieu/phap-luat/${ma}.js`;
      s.onload = () => kho[ma] ? ok(kho[ma]) : loi(new Error("Tệp văn bản không hợp lệ"));
      s.onerror = () => { delete dangNap[ma]; loi(new Error("Không tải được văn bản (kiểm tra kết nối mạng)")); };
      document.head.appendChild(s);
    }));
  }
  const daNap = ma => !!kho[ma];
  const dieu = (ma, so) => kho[ma] && kho[ma].theoSo[so];
  const vanBan = ma => PL().danhMuc[ma];
  const suaDoiCua = (ma, so) => (PL().suaDoi[ma] || {})[so] || [];

  // ---------- Nhận diện viện dẫn ----------
  function dungRe() {
    const dm = PL().danhMuc; maTheoMau = Object.entries(dm).map(([ma, v]) => [ma, new RegExp("^" + v.mau + "$")]);
    const ten = Object.values(dm).map(v => v.mau).join("|");
    // [tiền tố điểm/khoản]  Điều N  [của|tại]  TÊN VĂN BẢN   — hoặc chỉ TÊN VĂN BẢN; “Luật này/Nghị định này…” khi đang xem chính văn bản đó
    reVB = new RegExp(`((?:(?:điểm|khoản)\\s+[0-9a-zđ]+(?:\\s*(?:,|và)\\s*[0-9a-zđ]+)*\\s+)*Điều\\s+(\\d+[a-zđ]?)\\s+(?:của\\s+|tại\\s+)?)?(${ten}|(?:Luật|Nghị quyết|Nghị định|Thông tư|Quyết định) này)`, "g");
  }
  function maCuaTen(ten, vbHienTai) {
    if (/ này$/.test(ten)) return vbHienTai || null;
    const x = maTheoMau.find(([, re]) => re.test(ten)); return x ? x[0] : null;
  }
  // html: văn bản đã thoát HTML (không chứa thẻ). opts.vbHienTai: mã văn bản đang xem (cho “Luật này”)
  function lienKet(html, opts) {
    if (!Object.keys(PL().danhMuc).length) return html;
    if (!reVB) dungRe();
    return html.replace(reVB, (m, tienTo, so, ten) => {
      const ma = maCuaTen(ten, opts && opts.vbHienTai); if (!ma) return m;
      if (!so && / này$/.test(ten)) return m; // “Luật này” đứng một mình: không gắn
      // “Điều N của Nghị định này” trong văn bản sửa đổi thường nằm trong phần trích văn bản được sửa — chỉ gắn khi Điều có thật
      if (so && kho[ma] && !kho[ma].theoSo[so]) return m;
      const khoan = tienTo && (tienTo.match(/khoản\s+(\d+)/) || [])[1], diem = tienTo && (tienTo.match(/điểm\s+([a-zđ])/) || [])[1];
      const dl = [ma, so || "", khoan || "", diem || ""].join("|");
      const tieuDe = so ? `Xem nguyên văn ${khoan ? "khoản " + khoan + " " : ""}Điều ${so} ${PL().danhMuc[ma].ten}` : `Xem ${PL().danhMuc[ma].ten}`;
      return `<a class="lk-pl" href="#/phap-luat/${ma}${so ? "/" + so : ""}" data-pl="${dl}" title="${e(tieuDe)}">${m}</a>`;
    });
  }

  // ---------- Hiển thị một Điều (tô khoản, điểm) ----------
  function htmlDieu(ma, d, khoan, diem) {
    const dong = d.noiDung.split("\n"); let trong = false, trongDiem = false;
    const doan = dong.map(l => {
      const mk = l.match(/^(\d+)\.\s/), md = l.match(/^([a-zđ])\)\s/);
      if (mk) { trong = khoan && mk[1] === String(khoan); trongDiem = false; }
      if (md && trong) trongDiem = !diem || md[1] === diem;
      const to = trong && (!diem || trongDiem || mk);
      let cls = md ? "c1" : /^[-+]/.test(l) ? "c2" : "";
      const html = lienKet(e(l), { vbHienTai: ma });
      return `<p class="${cls}${to ? " pl-to" : ""}"${mk ? ` id="pl-k${mk[1]}"` : ""}>${html}</p>`;
    }).join("");
    return `<div class="nguyen-van pl-dieu">${doan || `<p class="mo">Điều này không có nội dung ngoài tiêu đề.</p>`}</div>`;
  }
  function htmlSuaDoi(ma, so) {
    const ds = suaDoiCua(ma, so); if (!ds.length) return "";
    return `<div class="thong-bao thong-bao-vang" style="margin:0 0 10px">${TT.tp.bt("canhBao")}<div><b>Điều này đã được sửa đổi, bổ sung</b> — văn bản trong phần mềm là bản gốc chưa hợp nhất:<ul class="ds-gon">${ds.map(x => `<li><a class="lk-pl" href="#/phap-luat/${x.vb}/${x.dieu}" data-pl="${x.vb}|${x.dieu}|${x.khoan}|">Khoản ${x.khoan} Điều ${x.dieu} ${e(vanBan(x.vb).ten)}</a>: ${e(x.tom)}</li>`).join("")}</ul></div></div>`;
  }
  const ghiChuVB = v => `<div class="chu-nho mo">${e(v.trichYeu)}. <b>Hiệu lực:</b> ${e(v.hieuLuc)}${v.ghiChu ? ". " + e(v.ghiChu) : ""}</div>`;

  function moDieu(ma, so, khoan, diem) {
    const tp = TT.tp, bt = tp.bt, v = vanBan(ma);
    const dau = t => `<div class="ngan-dau"><div style="flex:1;min-width:0"><div class="nhan-trang">Văn bản pháp luật</div><h2 id="ngan-tieu-de">${t}</h2></div><button class="nut nut-nho" data-dong aria-label="Đóng">${bt("dong")}</button></div>`;
    if (!v) { tp.moNgan(dau("Chưa có nguyên văn") + `<div class="ngan-than">Văn bản này chưa có trong bộ nguyên văn của phần mềm.</div>`); return; }
    tp.moNgan(dau(e(v.ten)) + `<div class="ngan-than"><p class="mo">Đang tải nguyên văn…</p></div>`);
    nap(ma).then(() => {
      const d = so && dieu(ma, so);
      const than = !so ? `${ghiChuVB(v)}<p style="margin-top:12px"><a class="nut nut-nho" href="#/phap-luat/${ma}">Mở mục lục ${v.soDieu} Điều</a></p>`
        : !d ? `<p>Không tìm thấy Điều ${e(so)} trong ${e(v.ten)}.</p>`
        : `${htmlSuaDoi(ma, so)}<div class="khoi-nv"><div class="khoi-nv-dau">${tp.dauNguon.nv()} <span>${khoan ? `Khoản ${e(khoan)}${diem ? " điểm " + e(diem) : ""} · ` : ""}${e(d.chuong || "")}</span></div>${htmlDieu(ma, d, khoan, diem)}</div>${ghiChuVB(v)}`;
      tp.moNgan(dau(so ? `Điều ${e(so)}${d ? ". " + e(d.tieuDe) : ""}` : e(v.ten)) + `<div class="ngan-than"><div class="chu-nho mo" style="margin-bottom:8px">${e(v.ten)}</div>${than}
        <p class="chu-nho mo" style="margin-top:12px">Nguyên văn để tra cứu; khi cần giá trị pháp lý, đối chiếu văn bản gốc đăng trên cổng thông tin chính thức.</p></div>
        <div class="ngan-chan"><a class="nut nut-chinh nut-nho" href="#/phap-luat/${ma}${so ? "/" + so + (khoan ? "?k=" + khoan : "") : ""}">${bt("ngoai", 14)} Mở trong trang Văn bản pháp luật</a></div>`);
      const to = document.querySelector(".ngan .pl-to"); if (to) to.scrollIntoView({ block: "center" });
    }, err => tp.moNgan(dau(e(v.ten)) + `<div class="ngan-than"><div class="thong-bao thong-bao-do">${bt("canhBao")}<div>${e(err.message)}</div></div></div>`));
  }

  // Bấm liên kết viện dẫn → mở ngăn (giữ Ctrl/⌘ để mở trang)
  if (typeof document !== "undefined") document.addEventListener("click", ev => {
    const a = ev.target.closest && ev.target.closest("a[data-pl]"); if (!a || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
    ev.preventDefault(); const [ma, so, k, d] = a.getAttribute("data-pl").split("|"); moDieu(ma, so || null, k || null, d || null);
  });

  // Tìm trong một văn bản (đã nạp): khớp mọi từ (không dấu) trong tiêu đề + nội dung
  function tim(ma, q) {
    const ch = s => " " + TT.ti.chuanHoaManh(s) + " ", tu = TT.ti.chuanHoaManh(q || "").split(/\s+/).filter(Boolean).map(w => " " + w + " "), vb = kho[ma]; if (!vb) return [];
    const ds = vb.dieu.map(d => ({ so: d[0], tieuDe: d[1], noiDung: d[2], chuong: d[3] }));
    if (!tu.length) return ds;
    // Xếp hạng: cụm trong tiêu đề > đủ từ trong tiêu đề > cụm trong nội dung > số lần xuất hiện
    const cum = " " + tu.map(w => w.trim()).join(" ") + " ";
    return ds.map(d => { const t = ch(d.tieuDe), n = ch(d.noiDung); if (!tu.every(w => t.includes(w) || n.includes(w))) return null;
      const diem = (t.includes(cum) ? 100 : 0) + (tu.every(w => t.includes(w)) ? 50 : 0) + (n.includes(cum) ? 20 + Math.min(10, n.split(cum).length - 1) : 0) + tu.filter(w => t.includes(w)).length * 8;
      return { ...d, diem }; }).filter(Boolean).sort((a, b) => b.diem - a.diem);
  }
  return { nhan, nap, daNap, dieu, vanBan, suaDoiCua, lienKet, moDieu, htmlDieu, htmlSuaDoi, ghiChuVB, tim, get danhMuc() { return PL().danhMuc; } };
})();
