/* Thành phần giao diện dùng chung: biểu tượng, hiển thị nguyên văn, chip căn cứ, ngăn xem căn cứ, xuất CSV, in. */
window.TT = window.TT || {};
TT.tp = (function () {
  const ti = TT.ti, e = ti.e;

  // Biểu tượng nét (24×24, stroke) — bộ thống nhất, vẽ tay theo phong cách nét mảnh
  const DUONG = {
    nha: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    danhSach: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    luong: '<rect x="3" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="16" width="7" height="5" rx="1.5"/><path d="M6.5 8v4.5a2 2 0 0 0 2 2h7a2 2 0 0 1 2 2V16"/>',
    tep: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    coQuan: '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-7h6v7M9 10h.01M15 10h.01"/>',
    canCan: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/>',
    tim: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    kiem: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
    canhBao: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    thongTin: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    in: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    taiXuong: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
    trang: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    toi: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    ngoai: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    dong: '<path d="M6 6l12 12M18 6 6 18"/>',
    xoa: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    phongTo: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    thuNho: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    vuaKhung: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    thuHoi: '<path d="M3 7h18M6 7v13h12V7"/><path d="M9 7V4h6v3M10 11v6M14 11v6"/>',
    dongHo: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sach: '<path d="M4 4h6a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h7z"/>',
    pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v5"/>',
    mui: '<path d="m9 6 6 6-6 6"/>',
    muiTrai: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    nguoi: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  const bt = (ten, co) => `<svg width="${co || 16}" height="${co || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DUONG[ten] || ""}</svg>`;

  // Nhãn phân biệt nguồn nội dung
  const dauNguon = {
    nv: () => `<span class="dau-nguon nv" title="Trích nguyên văn từ văn bản nguồn">Nguyên văn</span>`,
    dg: () => `<span class="dau-nguon dg" title="Diễn giải ngắn do phần mềm đặt để dễ tra cứu; không thay thế nguyên văn">Diễn giải</span>`,
    pm: () => `<span class="dau-nguon pm" title="Do phần mềm tự lập (chỉ mục, rút gọn, gợi ý) — không phải nội dung pháp lý">Phần mềm lập</span>`,
    cxm: () => `<span class="dau-nguon cxm" title="Thông tin chưa đối chiếu được trên văn bản nguồn">Chưa xác minh</span>`
  };

  let mh = null;
  function gan(moHinh) { mh = moHinh; }

  // Hiển thị nguyên văn: tách đoạn, thụt lề theo ký hiệu, gắn liên kết "Mẫu số n" (Phụ lục V), tô sáng từ khóa
  function nguyenVan(text, opts) {
    opts = opts || {};
    const doan = String(text || "").split("\n").filter(s => s.trim());
    if (!doan.length) return `<p class="mo">Không có nội dung trong tài liệu nguồn.</p>`;
    return `<div class="nguyen-van">${doan.map(d => {
      let cls = "";
      if (/^\+/.test(d)) cls = "c2";
      else if (/^-/.test(d)) cls = "c1";
      else if (/^Bước\s*\d/.test(d)) cls = "buoc-dau";
      else if (/^([a-zđ]\d?\)|\([ivx]+\))/.test(d) && d.length < 160 && !/[.;,]$/.test(d.trim())) cls = "tieu";
      let html = opts.toSang ? ti.toSang(d, opts.toSang) : e(d);
      if (mh && opts.lienKetMau !== false) html = ganLienKetMau(html);
      return `<p class="${cls}">${html}</p>`;
    }).join("")}</div>`;
  }
  function ganLienKetMau(html) {
    // Chỉ gắn với ký hiệu có trong Phụ lục V và không phải mẫu của văn bản khác (có dấu "/")
    return html.replace(/Mẫu(\s+số)?\s+(\d{1,2}[a-zđ]?)(?![\d\/a-zđ])/g, (m, _s, k) => {
      const kh = ti.chuanKyHieu(k);
      if (!mh.mauTheoKhoa[kh]) return m;
      return `<a class="lk-mau" href="#/mau-bieu/${kh}" data-mau="${kh}" title="Xem Mẫu số ${e(mh.mauTheoKhoa[kh].kyHieu)}: ${e(mh.mauTheoKhoa[kh].ten)}">${m}</a>`;
    });
  }

  function chipCanCu(c, nhan) {
    const cc = mh.giaiCanCu(c);
    if (!cc) return `<span class="nhan nhan-do" title="Không tìm thấy căn cứ trong dữ liệu">${e(nhan || "Căn cứ chưa xác định")}</span>`;
    return `<button type="button" class="can-cu-chip" data-can-cu='${e(JSON.stringify(c))}' title="Xem nguyên văn ${e(cc.nhan)} — trang ${cc.trang}">${bt("canCan", 13)}${e(nhan || cc.nhan)}</button>`;
  }
  function lkPdf(trang, nhan) {
    if (!trang) return "";
    return `<a class="lk-pdf" href="${mh.lienKetPdf(trang)}" target="_blank" rel="noopener" title="Mở trang ${trang} của tệp PDF nguồn">${bt("pdf", 13)}${e(nhan || "Tr. " + trang)}</a>`;
  }
  function tenCoQuan(id) { return (mh.coQuanTheoId[id] || { ten: id }).ten; }
  function chipCoQuan(id) { return `<a class="nhan nhan-xam" href="#/co-quan/${e(id)}" style="text-decoration:none">${e(tenCoQuan(id))}</a>`; }

  // ---------- Ngăn căn cứ ----------
  let ngan, nganNen;
  function khoiTaoNgan() {
    nganNen = document.createElement("div"); nganNen.className = "ngan-nen";
    ngan = document.createElement("aside"); ngan.className = "ngan"; ngan.setAttribute("role", "dialog"); ngan.setAttribute("aria-modal", "true"); ngan.setAttribute("aria-labelledby", "ngan-tieu-de");
    document.body.append(nganNen, ngan);
    nganNen.addEventListener("click", dongNgan);
    document.addEventListener("keydown", ev => { if (ev.key === "Escape" && ngan.classList.contains("mo")) dongNgan(); });
    document.addEventListener("click", ev => {
      const b = ev.target.closest("[data-can-cu]");
      if (b) { ev.preventDefault(); moCanCu(JSON.parse(b.getAttribute("data-can-cu"))); }
    });
  }
  let truocKhiMo = null;
  function moNgan(html) {
    truocKhiMo = document.activeElement;
    ngan.innerHTML = html; ngan.classList.add("mo"); nganNen.classList.add("mo");
    const d = ngan.querySelector("[data-dong]"); if (d) { d.addEventListener("click", dongNgan); d.focus(); }
    ngan.querySelectorAll("a[href^='#']").forEach(a => a.addEventListener("click", dongNgan));
  }
  function dongNgan() { ngan.classList.remove("mo"); nganNen.classList.remove("mo"); if (truocKhiMo && truocKhiMo.focus) truocKhiMo.focus(); }
  function moCanCu(c) {
    const cc = mh.giaiCanCu(c);
    if (!cc) { moNgan(`<div class="ngan-dau"><h2 id="ngan-tieu-de">Không tìm thấy căn cứ</h2><button class="nut nut-nho" data-dong aria-label="Đóng">${bt("dong")}</button></div><div class="ngan-than">Dữ liệu không có nội dung tương ứng.</div>`); return; }
    const vb = mh.B.vanBan;
    moNgan(`
      <div class="ngan-dau"><div style="flex:1;min-width:0"><div class="nhan-trang">Căn cứ pháp lý</div><h2 id="ngan-tieu-de">${e(cc.nhan)}</h2>
        <div class="chu-nho mo" style="margin-top:4px">${e(cc.tieuDe)}</div></div>
        <button class="nut nut-nho" data-dong aria-label="Đóng">${bt("dong")}</button></div>
      <div class="ngan-than">
        <div class="khoi-nv"><div class="khoi-nv-dau">${dauNguon.nv()} <span>${e(vb.loai)} số ${e(vb.soKyHieu.giaTri)} ${mh.daDoiChieuBanKy ? "" : dauNguon.cxm()} · trang ${cc.trang}${cc.trangCuoi && cc.trangCuoi !== cc.trang ? "–" + cc.trangCuoi : ""}</span></div>
        ${cc.laMau ? `<div class="van-ban-mau">${e(cc.noiDung)}</div>` : nguyenVan(cc.noiDung)}</div>
        <p class="chu-nho mo" style="margin-top:12px">Văn bản được trích tự động từ tệp PDF nguồn. Khi cần sử dụng chính thức, đối chiếu với trang PDF gốc. Tình trạng hiệu lực của Quyết định: <b>${e(mh.hieuLuc.nhan.toLowerCase())}</b>${mh.hieuLuc.ghiChu ? " — " + e(mh.hieuLuc.ghiChu) : ""}</p>
      </div>
      <div class="ngan-chan"><a class="nut nut-chinh nut-nho" href="${mh.lienKetPdf(cc.trang)}" target="_blank" rel="noopener">${bt("pdf", 14)} Mở trang ${cc.trang} PDF gốc</a>
        <a class="nut nut-nho" href="${cc.lienKet}">${bt("ngoai", 14)} Đến vị trí trong phần mềm</a></div>`);
  }

  // ---------- Xuất CSV (UTF-8 có BOM để Excel đọc đúng tiếng Việt) ----------
  function xuatCsv(tenTep, cot, dong) {
    const esc = v => { const s = String(v == null ? "" : v); return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const nguon = `Nguồn: ${mh.tenVanBan}${mh.daDoiChieuBanKy ? "" : " (số hiệu do người dùng cung cấp, chưa đối chiếu)"} — Dữ liệu v${mh.B.phienBanDuLieu} — Xuất ngày ${ti.ngayHienTai()}`;
    const csv = "﻿" + [esc(nguon), cot.map(esc).join(","), ...dong.map(r => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = tenTep;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function xuatJson(tenTep, duLieu) {
    const blob = new Blob([JSON.stringify(duLieu, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = tenTep;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // Đầu trang khi in: tiêu đề, ngày in, nguồn
  function dauIn(tieuDe) {
    const vb = mh.B.vanBan;
    return `<div class="chi-in dau-in"><b>${e(tieuDe)}</b><br>Nguồn: ${e(mh.tenVanBan)}${mh.daDoiChieuBanKy ? "" : " (số hiệu, ngày ban hành chưa đối chiếu trên tệp PDF)"}. Bộ dữ liệu v${e(mh.B.phienBanDuLieu)}. In ngày ${ti.ngayHienTai()}.<br>Tài liệu tra cứu — không thay thế văn bản gốc.</div>`;
  }

  function nhanMucDo(m) {
    return { "cao": '<span class="nhan nhan-do">Cao</span>', "trung-binh": '<span class="nhan nhan-vang">Trung bình</span>', "thap": '<span class="nhan nhan-xam">Thấp</span>', "thong-tin": '<span class="nhan nhan-duong">Thông tin</span>',
      "loi": '<span class="nhan nhan-do">Lỗi</span>', "canh-bao": '<span class="nhan nhan-vang">Cảnh báo</span>', "dat": '<span class="nhan nhan-xanh">Đạt</span>' }[m] || e(m);
  }
  function nhanKetQua(k) { return { "Đạt": '<span class="nhan nhan-xanh">Đạt</span>', "Cần xác minh": '<span class="nhan nhan-vang">Cần xác minh</span>', "Lỗi": '<span class="nhan nhan-do">Lỗi</span>' }[k] || e(k); }

  return { bt, dauNguon, gan, nguyenVan, chipCanCu, lkPdf, chipCoQuan, tenCoQuan, khoiTaoNgan, moNgan, dongNgan, moCanCu, xuatCsv, xuatJson, dauIn, nhanMucDo, nhanKetQua };
})();
