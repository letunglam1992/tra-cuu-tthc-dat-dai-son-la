/* Khung ứng dụng: thanh bên, đầu trang, bộ định tuyến theo hash (#/man/tham-so?truy-van). */
// Thông tin phần mềm, tác giả, bản quyền (hiển thị tại hộp "Giới thiệu, bản quyền")
window.TT = window.TT || {};
TT.THONG_TIN_PM = {
  ten: "Phần mềm tra cứu thủ tục hành chính đất đai tỉnh Sơn La",
  moTa: "Tra cứu trình tự, thủ tục, hồ sơ, thời hạn và luân chuyển hồ sơ xác định nghĩa vụ tài chính về đất đai.",
  phienBan: "2.1", ngayCapNhat: "29/10/2026",
  tacGia: "Lê Tùng Lâm", donVi: "Sở Nông nghiệp và Môi trường tỉnh Sơn La", dienThoai: "0987559092",
  mucDich: "Tra cứu, hướng dẫn và hỗ trợ giải quyết thủ tục hành chính về đất đai, luân chuyển hồ sơ xác định nghĩa vụ tài chính về đất đai trên địa bàn tỉnh Sơn La.",
  namBanQuyen: "2026",
  loiBanQuyen: "Phần mềm được bảo hộ quyền tác giả. Nghiêm cấm sao chép, sửa đổi, phân phối, dịch ngược hoặc khai thác thương mại khi chưa được chủ sở hữu cho phép."
};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;
  const goc = document.getElementById("ung-dung");

  let mh, tk;
  try {
    mh = TT.taoMoHinh(window.QD75_NGUON, window.QD75_BO_SUNG, window.QD75_PHI);
    tk = TT.taoTimKiem(mh);
  } catch (err) {
    goc.innerHTML = `<div class="trang" style="grid-column:1/-1"><div class="thong-bao thong-bao-do">${bt("canhBao")}<div><b>Không tải được dữ liệu nghiệp vụ.</b><br>${e(err.message)}<br>
      Kiểm tra thư mục <code>du-lieu/</code> có đủ tệp <code>nguon.js</code> và <code>bo-sung.js</code>; nếu vừa cập nhật dữ liệu, chạy lại <code>cong-cu/cap-nhat-du-lieu.ps1</code>.</div></div></div>`;
    console.error(err);
    return;
  }
  TT.mh = mh; TT.tk = tk;
  tp.gan(mh);

  const kiemTra = mh.kiemTra();
  const soLoi = kiemTra.filter(k => k.mucDo === "loi").length;
  const soCanXacMinh = mh.vanDeNguon.filter(v => v.mucDo !== "thong-tin").length;
  TT.ketQuaKiemTra = kiemTra;

  // Chế độ kiểm soát dữ liệu (dành cho người biên soạn, quản trị): hiện màn hình đối soát, số vấn đề cần xác minh.
  // Người dùng thông thường không thấy các nội dung này. Bật/tắt tại "Giới thiệu, hướng dẫn" hoặc thêm ?quan-tri=1 vào địa chỉ.
  const KHOA_QT = "tthc-quan-tri";
  try { const u = new URLSearchParams(location.search); if (u.has("quan-tri")) localStorage.setItem(KHOA_QT, u.get("quan-tri") === "1" ? "1" : "0"); } catch (_) { }
  let quanTri = false; try { quanTri = localStorage.getItem(KHOA_QT) === "1"; } catch (_) { }
  TT.quanTri = quanTri;
  TT.datQuanTri = bat => { try { localStorage.setItem(KHOA_QT, bat ? "1" : "0"); } catch (_) { } location.reload(); };

  const MENU = [
    { nhom: "Tra cứu", muc: [
      { id: "tong-quan", ten: "Tổng quan", bt: "nha" },
      { id: "thu-tuc", ten: "Thủ tục hành chính", bt: "danhSach", dem: mh.thongKe.thuTuc },
      { id: "quy-trinh", ten: "Luân chuyển hồ sơ NVTC", bt: "luong", dem: mh.thongKe.quyTrinh },
      { id: "thu-hoi", ten: "Thu hồi, bồi thường, TĐC", bt: "thuHoi", dem: mh.thongKe.phuLucIV },
      { id: "mau-bieu", ten: "Hồ sơ và mẫu biểu", bt: "tep", dem: mh.thongKe.mauBieu },
      { id: "co-quan", ten: "Cơ quan và trách nhiệm", bt: "coQuan" },
      { id: "phi-le-phi", ten: "Phí, lệ phí", bt: "taiXuong" },
      { id: "can-cu", ten: "Căn cứ pháp lý", bt: "canCan" },
      { id: "tra-cuu", ten: "Tra cứu nhanh", bt: "tim" }
    ] },
    { nhom: "Công cụ", muc: [
      { id: "tinh-han", ten: "Tính thời hạn giải quyết", bt: "dongHo" },
      { id: "phieu", ten: "Phiếu hướng dẫn hồ sơ", bt: "kiem" },
      { id: "nghia-vu", ten: "Ước tính nghĩa vụ tài chính", bt: "canCan" },
      { id: "dien-mau", ten: "Điền mẫu đơn", bt: "tep" },
      { id: "so-theo-doi", ten: "Sổ theo dõi hạn hồ sơ", bt: "dongHo" },
      { id: "bao-cao", ten: "Báo cáo tổng hợp TTHC", bt: "danhSach" },
      { id: "hoi-dap", ten: "Hỏi đáp (trợ lý AI)", bt: "thongTin" },
      { id: "gioi-thieu", ten: "Giới thiệu, hướng dẫn", bt: "thongTin" }
    ] },
    ...(quanTri ? [{ nhom: "Kiểm soát dữ liệu", muc: [
      { id: "doi-soat", ten: "Đối soát dữ liệu", bt: "canhBao", dem: soLoi ? soLoi : soCanXacMinh, demVang: true }
    ] }] : [])
  ];

  const vb = mh.B.vanBan;
  goc.innerHTML = `
    <a class="bo-qua" href="#noi-dung" data-bo-qua>Bỏ qua menu, đến nội dung chính</a>
    <div class="nen-menu" id="nen-menu" hidden></div>
    <aside class="thanh-ben" id="thanh-ben" aria-label="Điều hướng chính">
      <a class="ben-logo" href="#/tong-quan"><span class="ben-logo-dau">${bt("sach", 20)}</span><span>TTHC đất đai<br>tỉnh Sơn La</span></a>
      ${MENU.map(g => `<nav class="ben-nhom" aria-label="${e(g.nhom)}"><div class="ben-nhan">${e(g.nhom)}</div>
        ${g.muc.map(m => `<a class="ben-muc" href="#/${m.id}" data-man="${m.id}">${bt(m.bt, 18)}<span>${e(m.ten)}</span>${m.dem != null && m.dem !== 0 ? `<span class="dem ${m.demVang ? "vang" : ""}" title="${m.demVang ? "Số vấn đề cần xác minh" : "Số mục"}">${m.dem}</span>` : ""}</a>`).join("")}</nav>`).join("")}
      <div class="ben-chan">
        <span class="chip" title="${e(mh.hieuLuc.ghiChu || mh.hieuLuc.nhan)}"><span class="cham ${mh.hieuLuc.ma === "co-hieu-luc" ? "xanh" : ""}"></span>${e(mh.hieuLuc.ngan)}</span>
        <span>Dữ liệu v${e(mh.B.phienBanDuLieu)} · cập nhật ${e(fmtNgay(mh.B.lichSu[0].ngay))}${quanTri ? ` · <b>chế độ kiểm soát</b>` : ""}</span>
        <button type="button" class="lk-ban-quyen" data-ban-quyen>© ${e(TT.THONG_TIN_PM.namBanQuyen)} ${e(TT.THONG_TIN_PM.tacGia)} · Bản quyền</button>
      </div>
    </aside>
    <header class="thanh-tren">
      <div class="thuong-hieu">
        <button class="nut-tren nut-tren-bt nut-menu" id="nut-menu" aria-label="Mở menu" aria-controls="thanh-ben" aria-expanded="false">${bt("menu", 18)}</button>
        <a class="thuong-hieu-dau" href="#/tong-quan" aria-label="Trang tổng quan">${bt("canCan", 22)}</a>
        <div><div class="to-chuc">Tỉnh Sơn La</div>
          <div class="ten-ung-dung">Thủ tục hành chính đất đai</div>
          <div class="phu-de">Theo ${e(vb.loai)} số <b>${e(vb.soKyHieu.giaTri)}</b> ngày ${e(vb.ngayBanHanh.giaTri)} của UBND tỉnh Sơn La · ${e(mh.hieuLuc.nhan.toLowerCase())}${vb.ngayHieuLuc && vb.ngayHieuLuc.giaTri ? " từ " + e(vb.ngayHieuLuc.giaTri) : ""}</div></div>
      </div>
      <div class="phai">
        <form class="o-tim-tren" id="form-tim" role="search">${bt("tim", 16)}<input type="search" id="o-tim" placeholder="Tìm thủ tục, mẫu, cơ quan, điều khoản… (phím /)" aria-label="Tìm kiếm nhanh" autocomplete="off"></form>
        <button class="nut-tren nut-tren-bt" id="nut-giao-dien" title="Đổi giao diện sáng/tối" aria-label="Đổi giao diện sáng/tối"></button>
      </div>
    </header>
    <main class="noi-dung" id="noi-dung" tabindex="-1"></main>`;
  // Chân trang nằm cuối nội dung (không cố định) — không chiếm chiều cao màn hình
  const chanTrang = `<footer class="chan">
      <span>Nguồn: ${e(mh.tenVanBan)}${mh.daDoiChieuBanKy ? "" : " (số, ngày ban hành do người dùng cung cấp; tệp PDF để trống)"}</span>
      <span>Phần mềm tra cứu — không tiếp nhận, không xử lý hồ sơ thực tế; khi giải quyết hồ sơ, đối chiếu văn bản gốc.</span>
      <span><button type="button" class="lk-ban-quyen" data-ban-quyen>© ${e(TT.THONG_TIN_PM.namBanQuyen)} ${e(TT.THONG_TIN_PM.tacGia)}. Bảo lưu mọi quyền.</button> · Phiên bản ${e(TT.THONG_TIN_PM.phienBan)}</span>
    </footer>`;

  // ---------- Hộp Giới thiệu, bản quyền ----------
  document.addEventListener("click", ev => {
    if (ev.target.closest("[data-ban-quyen]")) { ev.preventDefault(); moBanQuyen(); return; }
    const w = ev.target.closest("[data-word-mau]");
    if (w) { ev.preventDefault(); ev.stopPropagation(); const m = mh.mauTheoKhoa[w.getAttribute("data-word-mau")]; if (m) TT.word.xuatMau(m, vb, TT.THONG_TIN_PM.tacGia); }
  }, true);
  function moBanQuyen() {
    const p = TT.THONG_TIN_PM;
    const nen = document.createElement("div"); nen.className = "nen-mo";
    nen.innerHTML = `<div class="hop-thoai hop-ban-quyen" role="dialog" aria-modal="true" aria-labelledby="bq-tieu-de">
      <div class="the-dau"><h2 id="bq-tieu-de">Giới thiệu, bản quyền</h2><div class="phai"><button type="button" class="nut nut-chu" data-dong aria-label="Đóng">${bt("dong", 18)}</button></div></div>
      <div class="than">
        <div class="bq-dau"><span class="bq-bieu-tuong">${bt("coQuan", 30)}</span><div><div class="bq-ten">${e(p.ten)}</div><div class="bq-mo-ta">${e(p.moTa)}</div></div></div>
        <table class="bq-bang"><tbody>
          <tr><th>Phiên bản</th><td><b>${e(p.phienBan)}</b> · bản cập nhật ngày ${e(p.ngayCapNhat)} · dữ liệu v${e(mh.B.phienBanDuLieu)}</td></tr>
          <tr><th>Tác giả, bản quyền</th><td><b>${e(p.tacGia)}</b> – ${e(p.donVi)}</td></tr>
          <tr><th>Liên hệ</th><td>Điện thoại: <a href="tel:${e(p.dienThoai)}"><b>${e(p.dienThoai)}</b></a></td></tr>
          <tr><th>Mục đích sử dụng</th><td>${e(p.mucDich)}</td></tr>
          <tr><th>Căn cứ dữ liệu</th><td>${e(vb.loai)} số ${e(vb.soKyHieu.giaTri)} ngày ${e(vb.ngayBanHanh.giaTri)} của ${e(vb.coQuanBanHanh)}</td></tr>
        </tbody></table>
        <p class="bq-chan"><b>© ${e(p.namBanQuyen)} ${e(p.tacGia)}. Bảo lưu mọi quyền.</b><br>${e(p.loiBanQuyen)}</p>
      </div></div>`;
    document.body.appendChild(nen);
    const truoc = document.activeElement;
    const dong = () => { nen.remove(); document.removeEventListener("keydown", phim); if (truoc && truoc.focus) truoc.focus(); };
    const phim = ev => { if (ev.key === "Escape") dong(); };
    document.addEventListener("keydown", phim);
    nen.addEventListener("click", ev => { if (ev.target === nen || ev.target.closest("[data-dong]")) dong(); });
    nen.querySelector("[data-dong]").focus();
  }
  TT.moBanQuyen = moBanQuyen;

  function fmtNgay(s) { const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[3]}/${m[2]}/${m[1]}` : s; }
  TT.fmtNgay = fmtNgay;

  // ---------- Giao diện sáng/tối ----------
  const nutGD = document.getElementById("nut-giao-dien");
  const capNhatNutGD = () => { const toi = document.documentElement.getAttribute("data-theme") === "dark"; nutGD.innerHTML = bt(toi ? "trang" : "toi", 18); };
  nutGD.addEventListener("click", () => {
    const toi = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", toi ? "light" : "dark");
    try { localStorage.setItem("tthc-giao-dien", toi ? "light" : "dark"); } catch (_) { }
    capNhatNutGD();
  });
  capNhatNutGD();

  // ---------- Menu di động ----------
  const ben = document.getElementById("thanh-ben"), nutMenu = document.getElementById("nut-menu");
  const nenMenu = document.getElementById("nen-menu");
  const datMenu = mo => { ben.classList.toggle("mo", mo); nenMenu.hidden = !mo; nutMenu.setAttribute("aria-expanded", mo); if (mo) { const a = ben.querySelector(".ben-muc.chon") || ben.querySelector("a"); if (a) a.focus(); } };
  nutMenu.addEventListener("click", () => datMenu(!ben.classList.contains("mo")));
  nenMenu.addEventListener("click", () => { datMenu(false); nutMenu.focus(); });
  ben.addEventListener("click", ev => { if (ev.target.closest("a")) datMenu(false); });
  document.addEventListener("keydown", ev => { if (ev.key === "Escape" && ben.classList.contains("mo")) { datMenu(false); nutMenu.focus(); } });
  // Liên kết "Bỏ qua menu": không đổi hash (hash dùng cho định tuyến)
  goc.querySelector("[data-bo-qua]").addEventListener("click", ev => { ev.preventDefault(); document.getElementById("noi-dung").focus(); });

  // ---------- Tìm kiếm ở đầu trang ----------
  const oTim = document.getElementById("o-tim");
  document.getElementById("form-tim").addEventListener("submit", ev => { ev.preventDefault(); const q = oTim.value.trim(); if (q) location.hash = "#/tra-cuu?q=" + encodeURIComponent(q); });
  document.addEventListener("keydown", ev => {
    if (ev.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { ev.preventDefault(); oTim.focus(); oTim.select(); }
  });

  tp.khoiTaoNgan();

  // ---------- Bộ định tuyến ----------
  const noiDung = document.getElementById("noi-dung");
  function phanTichHash() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [duong, truyVan] = h.split("?");
    const phan = duong.split("/").filter(Boolean);
    const q = {};
    if (truyVan) for (const cap of truyVan.split("&")) { const [k, v] = cap.split("="); if (k) q[k] = decodeURIComponent((v || "").replace(/\+/g, " ")); }
    return { man: phan[0] || "tong-quan", thamSo: phan.slice(1), q };
  }
  let manTruoc = null, soBuocDieuHuong = 0;
  noiDung.addEventListener("click", ev => {
    if (!ev.target.closest("[data-quay-lai]")) return;
    if (soBuocDieuHuong > 1 && history.length > 1) history.back(); else location.hash = "#/tong-quan";
  });
  function veMan() {
    const { man, thamSo, q } = phanTichHash();
    const fn = TT.man && TT.man[man];
    document.querySelectorAll(".ben-muc").forEach(a => a.classList.toggle("chon", a.getAttribute("data-man") === man));
    document.querySelectorAll(".ben-muc").forEach(a => a.getAttribute("data-man") === man ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
    if (man === "tra-cuu" && q.q) oTim.value = q.q; else if (man !== "tra-cuu") oTim.value = "";
    let kq;
    try {
      kq = fn ? fn({ mh, tk, thamSo, q }) : { tieuDe: "Không tìm thấy trang", html: `<div class="trang"><div class="the trong"><b>Không có trang “${e(man)}”.</b>Đường dẫn không hợp lệ. <a href="#/tong-quan">Về trang tổng quan</a>.</div></div>` };
    } catch (err) {
      console.error(err);
      kq = { tieuDe: "Lỗi hiển thị", html: `<div class="trang"><div class="thong-bao thong-bao-do">${bt("canhBao")}<div><b>Không hiển thị được nội dung.</b><br>${e(err.message)}</div></div></div>` };
    }
    // Nút Quay lại (mọi màn hình trừ trang chính): về màn hình trước trong phần mềm, nếu không có thì về Tổng quan
    soBuocDieuHuong++;
    const thanhQuayLai = man === "tong-quan" ? "" : `<div class="thanh-quay-lai khong-in"><button type="button" class="nut nut-nho" data-quay-lai>${bt("muiTrai", 15)} Quay lại</button><a class="nut nut-nho nut-chu" href="#/tong-quan">${bt("nha", 15)} Màn hình chính</a></div>`;
    noiDung.innerHTML = thanhQuayLai + kq.html + chanTrang;
    const tieuDe = kq.tieuDe && kq.tieuDe.length > 64 ? kq.tieuDe.slice(0, 62).replace(/\s+\S*$/, "") + "…" : kq.tieuDe;
    document.title = (tieuDe ? tieuDe + " — " : "") + "TTHC đất đai Sơn La";
    if (kq.sau) kq.sau(noiDung);
    // Giữ vị trí cuộn khi chỉ đổi bộ lọc/bước trong cùng một trang (vd. chọn bước khác của cùng quy trình)
    const khoaCuon = man + "/" + (thamSo[0] || "");
    if (kq.cuonDen) { const el = noiDung.querySelector(kq.cuonDen); if (el) el.scrollIntoView({ block: "start" }); else noiDung.scrollTop = 0; }
    else if (manTruoc !== khoaCuon || !kq.giuCuon) noiDung.scrollTop = 0;
    manTruoc = khoaCuon;
    TT.soLanVe = (TT.soLanVe || 0) + 1; // bộ kiểm thử dùng để biết màn hình đã vẽ xong
  }
  window.addEventListener("hashchange", veMan);
  veMan();
  if (TT.bongBong) TT.bongBong.gan(mh); // bong bóng chat trợ lý AI

  // Thống kê truy cập ẩn danh (Vercel Web Analytics — không dùng cookie): chỉ nạp khi chạy trên Vercel, đã bật Analytics cho dự án
  if (mh.B.thongKeTruyCap && /\.vercel\.app$/.test(location.hostname)) {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const s = document.createElement("script"); s.defer = true; s.src = "/_vercel/insights/script.js"; document.head.appendChild(s);
    // Ghi nhận từ khóa tìm kiếm (ẩn danh) để bổ sung từ đồng nghĩa, tình huống
    window.addEventListener("hashchange", () => { const m = location.hash.match(/^#\/tra-cuu\?q=([^&]+)/); if (m) window.va("event", { name: "Tim kiem", data: { q: decodeURIComponent(m[1]).slice(0, 80) } }); });
  }

  // Chạy được khi mất mạng (sau lần mở đầu tiên): bộ nhớ đệm Service Worker — chỉ khi mở qua http(s)
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !/kiem-thu/.test(location.pathname)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(err => console.warn("Không đăng ký được bộ nhớ đệm ngoại tuyến:", err.message)));
  }
})();
