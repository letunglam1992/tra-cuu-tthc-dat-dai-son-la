/* Bong bóng chat trợ lý AI: nút tròn góc phải dưới, mở khung hội thoại trên mọi màn hình (trừ trang Hỏi đáp đầy đủ).
 * Mỗi câu hỏi: tìm đoạn nguyên văn trên máy (TT.hoiDap.nguCanh) → gửi Worker (TT.troLy.hoi) → trả lời dẫn nguồn [n].
 * Hội thoại lưu tạm trong sessionStorage của thẻ trình duyệt (đóng thẻ là mất), không gửi đi đâu ngoài câu hỏi + đoạn trích. */
window.TT = window.TT || {};
TT.bongBong = (function () {
  const KHOA = "tthc-bb-hoi-thoai", TOI_DA = 40;
  const GOI_Y = ["Tách thửa đất mất bao nhiêu ngày làm việc?", "Cấp lại Giấy chứng nhận bị mất cần giấy tờ gì?", "Lệ phí cấp Giấy chứng nhận lần đầu cho cá nhân ở xã?", "Ai có thẩm quyền cho phép chuyển mục đích sang đất ở?"];
  const ROBOT = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.2v3"/><circle cx="12" cy="2.6" r=".9" fill="currentColor"/><rect x="4.5" y="6.5" width="15" height="12" rx="3.5"/><circle cx="9.3" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="14.7" cy="12" r="1.4" fill="currentColor" stroke="none"/><path d="M9.8 15.6h4.4M2.5 11v3.5M21.5 11v3.5"/></svg>';
  let mh, ds = [], dangHoi = false, nut, khung, than, o, nutGui;
  const e = s => TT.ti.e(s), bt = (t, c) => TT.tp.bt(t, c);
  const doc = () => { try { ds = JSON.parse(sessionStorage.getItem(KHOA) || "[]"); } catch (_) { ds = []; } };
  const ghi = () => { ds = ds.slice(-TOI_DA); try { sessionStorage.setItem(KHOA, JSON.stringify(ds)); } catch (_) { } };

  function veNguon(nguon) {
    if (!nguon || !nguon.length) return "";
    return `<details class="bb-nguon"><summary>Nguồn nguyên văn (${nguon.length})</summary><ol>${nguon.map((x, i) => `<li><a href="${x.lienKet}" data-lk>[${i + 1}] ${e(x.tieuDe.length > 110 ? x.tieuDe.slice(0, 108) + "…" : x.tieuDe)}</a>${x.nguon ? `<span>${e(x.nguon)}</span>` : ""}</li>`).join("")}</ol></details>`;
  }
  function veTin(t) {
    if (t.vai === "nguoi") return `<div class="bb-dong bb-nguoi"><div class="bb-bong">${e(t.noiDung).replace(/\n/g, "<br>")}</div></div>`;
    const noi = t.traLoi ? `<div class="hd-noi-dung">${TT.hoiDap.veTraLoi(t.traLoi, t.nguon || [])}</div>` : `<p>${e(t.thongBao || "")}</p>`;
    const nhan = t.traLoi ? `<div class="bb-nhan">AI · ${e(t.nhaCungCap || "")}${t.tenMoHinh ? " · " + e(t.tenMoHinh) : ""} — đối chiếu nguyên văn trước khi giải quyết hồ sơ</div>` : "";
    return `<div class="bb-dong bb-tro-ly"><span class="bb-anh" aria-hidden="true">${ROBOT}</span><div class="bb-bong${t.loi ? " bb-loi" : ""}">${noi}${veNguon(t.nguon)}${nhan}</div></div>`;
  }
  function ve() {
    const chao = `<div class="bb-dong bb-tro-ly"><span class="bb-anh" aria-hidden="true">${ROBOT}</span><div class="bb-bong"><p>Xin chào! Tôi trả lời câu hỏi về thủ tục hành chính đất đai <b>dựa trên nguyên văn</b> Quyết định số ${e(mh.B.vanBan.soKyHieu.giaTri)} của UBND tỉnh và ghi nguồn [n] để bạn bấm mở đúng chỗ.</p></div></div>`;
    const goiY = ds.length ? "" : `<div class="bb-goi-y">${GOI_Y.map(g => `<button type="button" data-goi-y="${e(g)}">${e(g)}</button>`).join("")}</div>`;
    const go = dangHoi ? `<div class="bb-dong bb-tro-ly"><span class="bb-anh" aria-hidden="true">${ROBOT}</span><div class="bb-bong bb-dang-go" aria-label="Đang soạn câu trả lời"><i></i><i></i><i></i></div></div>` : "";
    than.innerHTML = chao + ds.map(veTin).join("") + go + goiY;
    than.scrollTop = than.scrollHeight;
  }

  async function hoi(cauHoi) {
    cauHoi = cauHoi.trim().slice(0, 600); if (!cauHoi || dangHoi) return;
    ds.push({ vai: "nguoi", noiDung: cauHoi }); ghi();
    const nguon = TT.hoiDap.nguCanh(mh, cauHoi), ch = TT.hoiDap.cauHinh(mh);
    const traVe = t => { ds.push({ vai: "tro-ly", nguon, ...t }); ghi(); dangHoi = false; ve(); nutGui.disabled = false; if (!khung.hidden) o.focus(); };
    if (!nguon.length) return traVe({ thongBao: "Không tìm thấy đoạn văn bản liên quan. Thử diễn đạt khác hoặc dùng tên thủ tục, từ khóa (tách thửa, cấp đổi, lệ phí…).", loi: true });
    if (!ch.diaChi) return traVe({ thongBao: "Trợ lý AI chưa được cấu hình. Dưới đây là các đoạn nguyên văn liên quan nhất." });
    if (!navigator.onLine) return traVe({ thongBao: "Đang mất mạng — trợ lý AI cần kết nối. Các đoạn nguyên văn liên quan vẫn xem được bên dưới.", loi: true });
    dangHoi = true; nutGui.disabled = true; ve(); o.focus();
    try {
      const d = await TT.troLy.hoi(ch, cauHoi, nguon.map(({ tieuDe, nguon, noiDung }) => ({ tieuDe, nguon, noiDung })));
      traVe({ traLoi: d.traLoi, nhaCungCap: d.nhaCungCap, tenMoHinh: d.tenMoHinh });
    } catch (err) { traVe({ thongBao: `Trợ lý chưa trả lời được (${err.message}). Các đoạn nguyên văn liên quan vẫn xem được bên dưới.`, loi: true }); }
  }

  const laTrangHoiDap = () => /^#\/hoi-dap(\?|$)/.test(location.hash);
  function mo() { khung.hidden = false; nut.setAttribute("aria-expanded", "true"); document.body.classList.add("bb-dang-mo"); ve(); requestAnimationFrame(() => { khung.classList.add("mo"); o.focus(); }); }
  function dong(traTieuDiem) { khung.classList.remove("mo"); nut.setAttribute("aria-expanded", "false"); document.body.classList.remove("bb-dang-mo"); khung.hidden = true; if (traTieuDiem) nut.focus(); }
  const capNhatHien = () => { const an = laTrangHoiDap(); nut.hidden = an; if (an && !khung.hidden) dong(false); };

  function gan(moHinh) {
    mh = moHinh; doc();
    nut = document.createElement("button");
    nut.type = "button"; nut.className = "bb-nut khong-in"; nut.innerHTML = ROBOT;
    nut.setAttribute("aria-label", "Mở trợ lý hỏi đáp AI"); nut.title = "Trợ lý hỏi đáp AI"; nut.setAttribute("aria-expanded", "false"); nut.setAttribute("aria-controls", "bb-khung");
    khung = document.createElement("section");
    khung.id = "bb-khung"; khung.className = "bb-khung khong-in"; khung.hidden = true;
    khung.setAttribute("role", "dialog"); khung.setAttribute("aria-label", "Trợ lý hỏi đáp AI");
    khung.innerHTML = `<header class="bb-dau"><span class="bb-anh" aria-hidden="true">${ROBOT}</span><div class="bb-ten"><b>Trợ lý TTHC đất đai</b><span>Trả lời từ nguyên văn, có dẫn nguồn</span></div>
        <a class="nut nut-chu nut-nho" href="#/hoi-dap" title="Mở trang Hỏi đáp đầy đủ" aria-label="Mở trang Hỏi đáp đầy đủ">${bt("tep", 17)}</a>
        <button type="button" class="nut nut-chu nut-nho" data-xoa title="Xóa hội thoại" aria-label="Xóa hội thoại">${bt("xoa", 17)}</button>
        <button type="button" class="nut nut-chu nut-nho" data-dong title="Thu nhỏ (Esc)" aria-label="Đóng trợ lý">${bt("dong", 18)}</button></header>
      <div class="bb-than" aria-live="polite"></div>
      <form class="bb-nhap"><label class="sr" for="bb-o">Câu hỏi cho trợ lý</label><textarea id="bb-o" rows="1" maxlength="600" placeholder="Nhập câu hỏi…"></textarea><button class="bb-gui" aria-label="Gửi câu hỏi" title="Gửi (Enter)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>
      <div class="bb-chu-thich">AI có thể sai — không nhập thông tin cá nhân.</div>`;
    document.body.append(nut, khung);
    than = khung.querySelector(".bb-than"); o = khung.querySelector("#bb-o"); nutGui = khung.querySelector(".bb-gui");
    nut.addEventListener("click", () => khung.hidden ? mo() : dong(true));
    khung.querySelector("[data-dong]").addEventListener("click", () => dong(true));
    khung.querySelector("[data-xoa]").addEventListener("click", () => { ds = []; ghi(); ve(); o.focus(); });
    khung.querySelector(".bb-nhap").addEventListener("submit", ev => { ev.preventDefault(); const v = o.value; o.value = ""; o.style.height = ""; hoi(v); });
    o.addEventListener("keydown", ev => { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); khung.querySelector(".bb-nhap").requestSubmit(); } });
    o.addEventListener("input", () => { o.style.height = ""; o.style.height = Math.min(o.scrollHeight, 120) + "px"; });
    document.addEventListener("keydown", ev => { if (ev.key === "Escape" && !khung.hidden) { ev.stopPropagation(); dong(true); } }, true);
    khung.addEventListener("click", ev => {
      const g = ev.target.closest("[data-goi-y]"); if (g) return hoi(g.getAttribute("data-goi-y"));
      // Mở nguồn: trên màn hình hẹp thu nhỏ khung để thấy nội dung
      if (ev.target.closest("a[href^='#/']") && matchMedia("(max-width: 640px)").matches) dong(false);
    });
    window.addEventListener("hashchange", capNhatHien); capNhatHien();
  }
  return { gan, hoi, mo, dong };
})();
