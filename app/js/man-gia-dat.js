/* Màn hình: tra cứu Bảng giá đất tỉnh Sơn La (Nghị quyết số 152/2025/NQ-HĐND; bổ sung theo Nghị quyết số 28/2026/NQ-HĐND).
 * Chọn xã → loại đất → tìm tuyến → bấm vị trí: xem giá, chuyển sang tính tiền chuyển mục đích với giá đã chọn. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;
  // Quy tắc xác định vị trí, điều chỉnh giá — Quy định kèm theo Nghị quyết 152/2025 (theo docs/07 phần mềm GPMB, đã đối chiếu nguyên văn)
  const QUY_TAC = [
    ["Khu vực", "Xác định theo từng xã, phường.", "khoản 2 Điều 3"],
    ["Vị trí 1", "Thửa đất tiếp giáp trục đường có tên trong bảng giá.", "điểm a khoản 1 Điều 4"],
    ["Vị trí 2", "Tiếp giáp ngõ ra trực tiếp trục đường chính, ngõ rộng từ 6,5 m trở lên.", "điểm a khoản 1 Điều 4"],
    ["Vị trí 3", "Ngõ rộng từ 5,5 m đến dưới 6,5 m; hoặc ngách rộng từ 6,5 m trở lên.", "điểm a khoản 1 Điều 4"],
    ["Vị trí 4", "Ngõ rộng từ 2,5 m đến dưới 5,5 m; hoặc ngách rộng từ 5,5 m đến dưới 6,5 m; hoặc hẻm rộng từ 6,5 m trở lên.", "điểm a khoản 1 Điều 4"],
    ["Vị trí 5", "Các thửa đất còn lại.", "điểm a khoản 1 Điều 4"],
    ["Chiều rộng ngõ", "Gồm lòng đường, vỉa hè, rãnh thoát nước (không có thì tính đến mép); không đều thì lấy mặt cắt nhỏ nhất từ đầu ngõ đến thửa đất.", "điểm b, c khoản 1 Điều 4"],
    ["Nhiều cách xác định", "Lấy vị trí có giá cao nhất.", "khoản 2 Điều 4"],
    ["Chênh cao", "Chênh cao bình quân so với mặt đường từ 1,5 m trở lên: giảm 30%.", "khoản 3 Điều 4"],
    ["Đường đất", "Vị trí 2–5 có mặt đường là đường đất: bằng 70% giá cùng vị trí.", "khoản 4 Điều 4"],
    ["Nhiều mặt tiếp giáp", "Tăng theo số mặt tiếp giáp (đường, ngõ, ngách, hẻm), tối đa 20%.", "khoản 5 Điều 4"],
    ["Phân lớp chiều sâu", "Đất ở (trừ lô đấu giá, đấu thầu): lớp 1 đến 20 m 100%, mỗi lớp 20 m tiếp theo bằng 60% lớp trước (đến lớp 5). Đất phi nông nghiệp khác (trừ KCN, CCN): đến 40 m 100%, mỗi lớp 40 m tiếp theo bằng 50% lớp trước. Giá bình quân sau phân lớp không thấp hơn giá vị trí thấp nhất của tuyến.", "khoản 6 Điều 4"],
    ["Khu quy hoạch 1/500", "Khu đô thị, khu dân cư, khu tái định cư có quy hoạch chi tiết 1/500: toàn khu là vị trí 1.", "khoản 7 Điều 4"],
    ["Đất nông nghiệp", "Một vị trí theo xã, phường. Đất nông nghiệp trong cùng thửa có đất ở hoặc xen kẹt với đất ở: tăng 50%.", "Điều 5; khoản 1 Điều 6"],
    ["Đất chưa sử dụng", "Bằng 20% giá đất nông nghiệp liền kề cao nhất.", "Điều 8"]
  ];

  TT.man["gia-dat"] = function (ctx) {
    const gd = TT.giaDat, q = ctx.q;
    const html = `<div class="trang">${tp.dauIn("Bảng giá đất tỉnh Sơn La")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Tra cứu</div><h1>Bảng giá đất tỉnh Sơn La</h1>
        <div class="mo-ta">Chọn xã, phường → loại đất → gõ tên tuyến đường → bấm vị trí để xem giá. Từ giá đã chọn có thể tính ngay tiền sử dụng đất khi chuyển mục đích.</div></div>
        <div class="phai khong-in"><a class="nut nut-chinh" href="#/nghia-vu">${bt("dongHo", 15)} Tính tiền chuyển mục đích</a></div></div>
      <div id="gd-vb"></div>
      <div class="luoi luoi-chinh" style="align-items:start"><div>
        <div class="the"><div class="the-than">
          <div class="form-nv"><label class="truong"><span>Xã, phường</span><select id="gd-xa"><option value="">— Toàn tỉnh —</option></select></label>
            <label class="truong"><span>Thời điểm áp dụng</span><input type="date" id="gd-ngay"></label></div>
          <div id="gd-chon" style="margin-top:10px"><p class="mo">Đang tải Bảng giá đất…</p></div></div></div>
      </div>
      <aside style="display:grid;gap:16px;align-content:start">
        <div class="the gd-da-chon" id="gd-kq" aria-live="polite"><div class="the-than chu-nho mo">Bấm một ô giá (VT1–VT5) để chọn.</div></div>
        <details class="the" open><summary style="padding:12px 16px;cursor:pointer;font-weight:600">Cách xác định vị trí, điều chỉnh giá</summary><div class="the-than chu-nho">
          <p class="mo" style="margin-top:0">Quy định kèm theo Nghị quyết số 152/2025/NQ-HĐND.</p>
          <dl class="gd-quy-tac">${QUY_TAC.map(([a, b, c]) => `<dt>${e(a)}</dt><dd>${e(b)} <span class="mo">(${e(c)})</span></dd>`).join("")}</dl></div></details>
      </aside></div></div>`;
    return { tieuDe: "Bảng giá đất", html, sau(root) {
      const oXa = root.querySelector("#gd-xa"), oNgay = root.querySelector("#gd-ngay"), kq = root.querySelector("#gd-kq");
      const d = new Date(); oNgay.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      gd.nap().then(D => {
        oXa.insertAdjacentHTML("beforeend", D.xa.map((x, j) => `<option value="${j}">${e(x)}</option>`).join(""));
        if (q.xa != null) oXa.value = q.xa;
        root.querySelector("#gd-vb").innerHTML = `<div class="thong-bao thong-bao-xanh">${bt("kiem")}<div>${D.vanBan.map(v => `<b>${e(v.ten)}</b> — hiệu lực từ ${e(v.hieuLucTu.split("-").reverse().join("/"))}.`).join("<br>")}
          <div class="chu-nho" style="margin-top:4px">${e(D.vanBan[1].chuaXuLy || "")} Giá trong bảng là giá đất có thời hạn tương ứng 70 năm (khoản 1 Điều 9), đơn vị đồng/m².</div></div></div>`;
        const w = TT.chonGia.tao(root.querySelector("#gd-chon"), { loaiCho: ["o", "tmdv", "skc", "nn"], trangThai: { loai: q.loai || "o", q: q.q || "" }, layXa: () => oXa.value, layNgay: () => oNgay.value, toiDa: 120,
          onChon: s => {
            const nn = /^nn:/.test(s.loai);
            const r = nn ? gd.giaNNDieuChinh(oXa.value === "" ? -1 : oXa.value, s.nn, false) : gd.giaViTri(s.tuyen, s.viTri);
            if (!r) return;
            const t = nn ? null : gd.tuyen(s.tuyen), chuaHL = t && !gd.coHieuLuc(t.vb, oNgay.value);
            kq.innerHTML = `<div class="the-dau"><h3>Giá đã chọn</h3></div><div class="the-than">
              <div class="ngay-hen">${e(TT.nghiaVu.tien(r.gia))}<span class="chu-nho">/m²</span></div><div class="chu-nho">${e(r.moTa)}</div>
              ${t ? `<div class="chu-nho mo" style="margin-top:6px">Giá các vị trí: ${t.vt.map((g, j) => g == null ? `VT${j + 1}: —` : `VT${j + 1}: ${(g * D.donVi).toLocaleString("vi-VN")}`).join(" · ")}</div>` : ""}
              ${chuaHL ? `<div class="chu-nho" style="color:var(--vang);margin-top:6px">⚠ Tuyến bổ sung theo ${e(gd.vanBan(t.vb).ten)}, hiệu lực từ ${e(gd.vanBan(t.vb).hieuLucTu.split("-").reverse().join("/"))}.</div>` : ""}
              ${(r.canhBao || []).map(x => `<div class="chu-nho" style="color:var(--vang)">⚠ ${e(x)} — đúng như văn bản.</div>`).join("")}
              <div class="tang khong-in" style="margin-top:10px">${t ? `<a class="nut nut-chinh nut-nho" href="#/nghia-vu?gia=${s.tuyen}-${s.viTri}">${bt("dongHo", 14)} Tính tiền chuyển mục đích sang loại đất này</a>` : ""}
                <button type="button" class="nut nut-nho" data-sao="${r.gia}">Sao chép giá</button></div></div>`;
          } });
        oXa.addEventListener("change", () => w.ve()); oNgay.addEventListener("change", () => w.ve());
        kq.addEventListener("click", ev => { const b = ev.target.closest("[data-sao]"); if (b && navigator.clipboard) navigator.clipboard.writeText(b.getAttribute("data-sao")).then(() => { b.textContent = "Đã sao chép"; }, () => { }); });
      }, err => { root.querySelector("#gd-chon").innerHTML = `<div class="thong-bao thong-bao-do">${bt("canhBao")}<div>${e(err.message)}</div></div>`; });
    } };
  };
})();
