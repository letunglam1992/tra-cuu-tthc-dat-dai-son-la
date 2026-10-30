/* Thành phần chọn giá đất từ Bảng giá đất tỉnh: loại đất → tìm tuyến đường (trong xã đã chọn) → bấm vị trí để chọn giá.
 * Dùng chung cho công cụ Ước tính nghĩa vụ tài chính (giá trước/sau khi chuyển mục đích, giá các khoản khác) và trang Tra cứu giá đất.
 * cfg: { loaiCho: ["o","tmdv","skc","nn"], trangThai: { loai, q, tuyen, viTri, nn }, layXa(), layNgay(), onChon(trangThai), toiDa } */
window.TT = window.TT || {};
TT.chonGia = (function () {
  const e = s => TT.ti.e(s), ngayVN = d => String(d || "").split("-").reverse().join("/"), vnd = v => v == null ? "" : Math.round(v).toLocaleString("vi-VN");
  const TEN = { o: "Đất ở", tmdv: "Đất thương mại, dịch vụ", skc: "Đất SXKD phi nông nghiệp", nn: "Đất nông nghiệp" };

  function tao(el, cfg) {
    const gd = TT.giaDat, D = gd.D, tt = cfg.trangThai || (cfg.trangThai = {});
    const loaiCho = cfg.loaiCho || ["o", "tmdv", "skc", "nn"];
    if (!tt.loai || !loaiCho.some(l => tt.loai === l || (l === "nn" && /^nn:/.test(tt.loai)))) tt.loai = loaiCho[0] === "nn" ? "nn:" + gd.maNN()[0] : loaiCho[0];
    const id = "cg" + Math.random().toString(36).slice(2, 8);
    const tuyChon = loaiCho.flatMap(l => l === "nn" ? gd.maNN().map(m => [`nn:${m}`, D.tenNN[m]]) : [[l, TEN[l]]]);
    el.classList.add("cg");
    el.innerHTML = `<div class="cg-loc"><label class="truong"><span>Loại đất</span><select data-cg="loai">${tuyChon.map(([v, n]) => `<option value="${v}"${v === tt.loai ? " selected" : ""}>${e(n)}</option>`).join("")}</select></label>
      <label class="truong cg-tim"><span>Tìm tuyến đường, khu vực</span><input data-cg="q" type="search" value="${e(tt.q || "")}" placeholder="Ví dụ: Quốc lộ 6, Tô Hiệu, trung tâm xã…" autocomplete="off" aria-controls="${id}"></label></div>
      <div class="cg-ds" id="${id}" role="list"></div>`;
    const ds = el.querySelector(".cg-ds"), oQ = el.querySelector('[data-cg="q"]'), oLoai = el.querySelector('[data-cg="loai"]');

    function ve() {
      const xa = cfg.layXa(), ngay = cfg.layNgay ? cfg.layNgay() : "";
      const laNN = /^nn:/.test(tt.loai);
      el.querySelector(".cg-tim").hidden = laNN;
      if (laNN) {
        const ma = tt.loai.slice(3), r = xa === "" && ma !== "RSX" ? null : gd.giaNN(xa === "" ? -1 : xa, ma);
        ds.innerHTML = !r ? `<p class="mo chu-nho">Chọn xã, phường để xem giá ${e(D.tenNN[ma].toLowerCase())}.</p>`
          : `<div class="cg-tuyen" role="listitem"><div class="cg-ten"><b>${e(r.ten)}</b><span>${e(r.xa)} · Bảng ${e(r.bang)} · Nghị quyết 152/2025 · một vị trí (Điều 5)</span></div>
            <div class="cg-vt"><button type="button" class="cg-gia" data-nn="${ma}" aria-pressed="${tt.nn === ma}"><small>Giá</small>${vnd(r.gia)}</button></div></div>`;
        return;
      }
      const q = oQ.value.trim();
      if (xa === "" && q.length < 2) { ds.innerHTML = `<p class="mo chu-nho">Chọn xã, phường hoặc gõ ít nhất 2 ký tự tên tuyến đường để tìm trên toàn tỉnh.</p>`; return; }
      const kq = gd.timTuyen({ loai: tt.loai, xa: xa === "" ? null : xa, q, ngay, toiDa: cfg.toiDa || 60 });
      const tong = gd.timTuyen({ loai: tt.loai, xa: xa === "" ? null : xa, q, ngay, toiDa: 100000 }).length;
      ds.innerHTML = kq.length ? kq.map(t => `<div class="cg-tuyen${t.chuaHieuLuc ? " cg-chua" : ""}" role="listitem">
          <div class="cg-ten"><b>${e(t.ten)}</b><span>${xa === "" ? e(D.xa[t.xa]) + " · " : ""}${t.nhom ? e(t.nhom.replace(/^\d+\.\s*/, "")) + " · " : ""}${t.stt ? "STT " + e(t.stt) + " · " : ""}Bảng ${e(t.bang)} · ${t.vb === 1 ? "Nghị quyết 28/2026" : "Nghị quyết 152/2025"}${t.chuaHieuLuc ? ` · <b class="cg-nhan-vang">hiệu lực từ ${e(ngayVN(gd.vanBan(t.vb).hieuLucTu))}</b>` : ""}</span>
            ${t.canhBao.length ? `<span class="cg-canh-bao">⚠ ${e(t.canhBao.join("; "))} (đúng như văn bản)</span>` : ""}</div>
          <div class="cg-vt">${t.vt.map((g, j) => g == null ? `<span class="cg-gia cg-trong"><small>VT${j + 1}</small>—</span>` : `<button type="button" class="cg-gia" data-tuyen="${t.i}" data-vt="${j + 1}" aria-pressed="${tt.tuyen === t.i && tt.viTri === j + 1}" title="Chọn vị trí ${j + 1}: ${vnd(g * D.donVi)} đồng/m²"><small>VT${j + 1}</small>${vnd(g * D.donVi)}</button>`).join("")}</div></div>`).join("")
          + (tong > kq.length ? `<p class="mo chu-nho">Đang hiện ${kq.length}/${tong} tuyến — gõ thêm từ khóa để thu hẹp.</p>` : "")
        : `<p class="mo chu-nho">Không có tuyến phù hợp${q ? ` với “${e(q)}”` : ""}. Thử từ khóa khác (gõ không dấu cũng được).</p>`;
    }
    oLoai.addEventListener("change", () => { tt.loai = oLoai.value; tt.tuyen = tt.viTri = tt.nn = null; ve(); cfg.onDoiLoai && cfg.onDoiLoai(tt); });
    oQ.addEventListener("input", () => { tt.q = oQ.value; ve(); cfg.onDoi && cfg.onDoi(tt); });
    ds.addEventListener("click", ev => {
      const b = ev.target.closest("button.cg-gia"); if (!b) return;
      if (b.hasAttribute("data-nn")) { tt.nn = b.getAttribute("data-nn"); tt.tuyen = tt.viTri = null; }
      else { tt.tuyen = +b.getAttribute("data-tuyen"); tt.viTri = +b.getAttribute("data-vt"); tt.nn = null; }
      ds.querySelectorAll("button.cg-gia").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      cfg.onChon && cfg.onChon(tt);
    });
    ve();
    return { ve, trangThai: tt };
  }
  return { tao, TEN };
})();
