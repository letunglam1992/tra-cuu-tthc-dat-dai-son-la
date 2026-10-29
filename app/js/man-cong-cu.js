/* Màn hình công cụ: tính thời hạn giải quyết (tham khảo), phiếu hướng dẫn chuẩn bị hồ sơ (in A4, mã QR). */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt, th = TT.thoiHan;
  const KHOA_NGHI = "tthc-ngay-nghi-them";
  const docNghiThem = () => { try { return JSON.parse(localStorage.getItem(KHOA_NGHI) || "[]").filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s)); } catch (_) { return []; } };
  const ghiNghiThem = ds => { try { localStorage.setItem(KHOA_NGHI, JSON.stringify([...new Set(ds)].sort())); } catch (_) { } };
  const rutTen = (s, n) => s.length > n ? s.slice(0, n - 2).replace(/\s+\S*$/, "") + "…" : s;
  const chonThuTuc = (mh, ma, ten) => `<select name="${ten || "ma"}" aria-label="Thủ tục" class="chon-tt"><option value="">— Chọn thủ tục —</option>${mh.PL.map(p => `<optgroup label="Phụ lục ${p.so} — ${e(p.cap)}">${mh.thuTuc.filter(t => t.phuLuc === p.so).map(t => `<option value="${t.ma}" ${t.ma === ma ? "selected" : ""}>${t.ma} · ${e(rutTen(t.ten, 90))}</option>`).join("")}</optgroup>`).join("")}</select>`;

  // ---------- Tính thời hạn ----------
  TT.man["tinh-han"] = function (ctx) {
    const { mh, q } = ctx;
    const t = q.ma ? mh.thuTucTheoMa[q.ma] : null;
    const h = t && t.suyRa.thoiHan;
    const kv3 = t ? th.tangThemKhuVucIII(t.muc[3] && t.muc[3].noiDung) : null;
    const homNay = th.khoa(new Date());
    const html = `<div class="trang">
      ${tp.dauIn("Tính thời hạn giải quyết (tham khảo)")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Công cụ</div><h1>Tính thời hạn giải quyết</h1>
        <div class="mo-ta">Nhập ngày nhận hồ sơ đầy đủ, hợp lệ để biết ngày hẹn trả kết quả. Phần mềm trừ thứ Bảy, Chủ nhật, ngày nghỉ lễ, Tết; cộng thời gian tăng thêm cho xã khu vực III và các khoảng thời gian không tính vào thời hạn.</div></div></div>
      <div class="luoi luoi-2" style="align-items:start">
        <form class="the" id="form-han" autocomplete="off"><div class="the-dau"><h3>Thông tin hồ sơ</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than form-luoi">
          <label class="truong"><span>Thủ tục</span>${chonThuTuc(mh, q.ma)}</label>
          <label class="truong"><span>Ngày nhận hồ sơ đầy đủ, hợp lệ</span><input type="date" name="nhan" value="${e(q.nhan || homNay)}" required></label>
          <div class="hai-cot">
            <label class="truong"><span>Thời hạn</span><input type="number" name="so" min="0" step="0.5" inputmode="decimal" value="${e(q.so || (h ? h.ngay : ""))}" required></label>
            <label class="truong"><span>Đơn vị</span><select name="dv"><option value="ngày làm việc" ${(q.dv || (h && h.donVi)) !== "ngày" ? "selected" : ""}>ngày làm việc</option><option value="ngày" ${(q.dv || (h && h.donVi)) === "ngày" ? "selected" : ""}>ngày (ngày lịch)</option></select></label>
          </div>
          <label class="o-chon"><input type="checkbox" name="kv3" value="1" ${q.kv3 === "1" ? "checked" : ""} ${t && !kv3 ? "disabled" : ""}> <span>Xã khu vực III — cộng thêm <input type="number" name="them" min="0" step="1" value="${e(q.them || (kv3 ? kv3.ngay : 10))}" aria-label="Số ngày làm việc tăng thêm" class="o-so"> ngày làm việc${kv3 ? ` <span class="mo">(mục 3: “…${e(kv3.nguyenVan.slice(-60))}”)</span>` : t ? ` <span class="mo">(mục 3 không nêu)</span>` : ""}</span></label>
          <label class="truong"><span>Số ngày làm việc không tính vào thời hạn <span class="mo">(xác định giá đất cụ thể, thực hiện NVTC, trích đo, niêm yết… — khoản 1 Điều 8)</span></span><input type="number" name="dung" min="0" step="1" value="${e(q.dung || "0")}"></label>
          <details class="chu-nho"><summary>Ngày nghỉ khác (nghỉ bù, nghỉ đột xuất do cơ quan thông báo)</summary>
            <div class="tang" style="margin-top:8px"><input type="date" id="nghi-moi" aria-label="Ngày nghỉ thêm"><button type="button" class="nut nut-nho" id="them-nghi">${bt("kiem", 14)} Thêm ngày nghỉ</button></div>
            <div id="ds-nghi" class="tang" style="margin-top:8px"></div>
            <p class="mo">Lưu trên trình duyệt này. Ngày Tết Âm lịch và ngày liền kề Quốc khánh của năm chưa có thông báo chính thức được tạm tính theo thông lệ.</p></details>
          <div><button class="nut nut-chinh">${bt("dongHo", 15)} Tính ngày hẹn trả</button></div>
        </div></form>
        <div id="ket-qua-han">${t ? `<div class="the"><div class="the-dau"><h3>Nguyên văn mục (3) — ${t.ma}</h3><div class="phai">${tp.dauNguon.nv()} ${tp.lkPdf(t.muc[3].trangDau)}</div></div><div class="the-than">${tp.nguyenVan(t.muc[3].noiDung)}${h && h.nhieuTruongHop ? `<div class="thong-bao thong-bao-vang" style="margin:10px 0 0">${bt("canhBao")}<div>Mục (3) có nhiều trường hợp thời hạn. Phần mềm điền số ngày nêu đầu tiên — sửa lại cho đúng trường hợp của hồ sơ.</div></div>` : ""}</div></div>` : `<div class="the trong"><b>Chọn thủ tục để điền sẵn thời hạn.</b>Hoặc nhập số ngày trực tiếp.</div>`}</div>
      </div>
      <div class="chu-nho mo" style="margin-top:14px">Căn cứ tính: ${tp.chipCanCu({ dieu: "8", khoan: "1" }, "Khoản 1 Điều 8 Quy định")} mốc tính và thời gian không tính vào thời hạn; ngày đầu tiên của thời hạn không tính (khoản 2 Điều 147 Bộ luật Dân sự 2015); ngày cuối là ngày nghỉ thì kết thúc vào ngày làm việc tiếp theo (Điều 148 Bộ luật Dân sự 2015); ngày nghỉ lễ, Tết theo Điều 112 Bộ luật Lao động 2019. <b>Kết quả chỉ để tham khảo</b> — ngày hẹn trả chính thức ghi trên Giấy tiếp nhận hồ sơ và hẹn trả kết quả.</div>
    </div>`;
    return { tieuDe: "Tính thời hạn giải quyết", html, giuCuon: true,
      sau(root) {
        const f = root.querySelector("#form-han"), kq = root.querySelector("#ket-qua-han");
        const nguyenVanMuc3 = kq.innerHTML;
        f.ma.addEventListener("change", () => { location.hash = "#/tinh-han" + (f.ma.value ? "?ma=" + f.ma.value : ""); });
        const veNghi = () => { root.querySelector("#ds-nghi").innerHTML = docNghiThem().map(s => `<span class="chip">${e(th.hienThi(th.tuKhoa(s)))} <button type="button" class="nut-xoa" data-xoa="${s}" aria-label="Xóa ngày nghỉ ${s}">${bt("dong", 12)}</button></span>`).join("") || `<span class="mo">Chưa có.</span>`; };
        root.querySelector("#them-nghi").addEventListener("click", () => { const v = root.querySelector("#nghi-moi").value; if (v) { ghiNghiThem([...docNghiThem(), v]); veNghi(); tinh(); } });
        root.querySelector("#ds-nghi").addEventListener("click", ev => { const b = ev.target.closest("[data-xoa]"); if (b) { ghiNghiThem(docNghiThem().filter(s => s !== b.getAttribute("data-xoa"))); veNghi(); tinh(); } });
        veNghi();
        function tinh(capNhatDiaChi) {
          const nhan = th.tuKhoa(f.nhan.value), so = parseFloat(String(f.so.value).replace(",", "."));
          if (!nhan || !(so >= 0)) { kq.innerHTML = nguyenVanMuc3; return; }
          const r = th.tinh({ ngayNhan: nhan, soNgay: so, donVi: f.dv.value, tangThem: f.kv3.checked ? +f.them.value || 0 : 0, tamDung: +f.dung.value || 0, lichNghi: mh.B.lichNghi, nghiThem: new Set(docNghiThem()) });
          const nghiKhac = r.nghiBiTru.filter(x => x.loai !== "cuoi-tuan");
          kq.innerHTML = `<div class="the ket-qua-han"><div class="the-than">
            <div class="k">Ngày hẹn trả kết quả (tham khảo)</div>
            <div class="ngay-hen">${e(th.hienThi(r.ngayHen))}</div>
            <div class="chu-nho">Nhận hồ sơ: ${e(th.hienThi(r.ngayNhan))} · ${String(r.tong.soNgay).replace(".", ",")} ${e(f.dv.value)}${r.tong.tangThem ? ` + ${r.tong.tangThem} ngày làm việc (xã khu vực III)` : ""}${r.tong.tamDung ? ` + ${r.tong.tamDung} ngày làm việc không tính vào thời hạn` : ""}</div>
            ${r.canhBao.map(c => `<div class="thong-bao thong-bao-vang" style="margin:10px 0 0">${bt("canhBao")}<div>${e(c)}</div></div>`).join("")}
            <div class="tang" style="margin-top:12px"><span class="nhan nhan-xam">${r.nghiBiTru.length} ngày nghỉ không tính</span>${nghiKhac.length ? `<span class="nhan nhan-vang">${nghiKhac.length} ngày lễ, Tết, nghỉ bù</span>` : ""}
              <button type="button" class="nut nut-nho khong-in" onclick="window.print()">${bt("in", 14)} In</button>
              <button type="button" class="nut nut-nho khong-in" id="chep-han">${bt("tep", 14)} Chép kết quả</button></div>
            ${nghiKhac.length ? `<details class="chu-nho" style="margin-top:10px" open><summary>Ngày lễ, Tết, nghỉ bù đã trừ</summary><ul class="ds-gon">${nghiKhac.map(x => `<li>${e(th.hienThi(x.ngay))} — ${e(x.ly)}${x.loai === "tam-tinh" ? ` <span class="nhan nhan-vang">tạm tính</span>` : ""}</li>`).join("")}</ul></details>` : ""}
            <details class="chu-nho" style="margin-top:6px"><summary>Lịch đếm từng ngày làm việc</summary><ol class="ds-gon lich-dem">${r.cacNgay.map(x => `<li>${e(th.hienThi(x.ngay))}</li>`).join("")}</ol></details>
          </div></div>${nguyenVanMuc3}`;
          const chep = kq.querySelector("#chep-han");
          if (chep) chep.addEventListener("click", () => { const s = `Ngày hẹn trả (tham khảo): ${th.hienThi(r.ngayHen)}. Nhận hồ sơ ${th.hienThi(r.ngayNhan)}; ${r.tong.soNgay} ${f.dv.value}${r.tong.tangThem ? " + " + r.tong.tangThem + " ngày làm việc (xã khu vực III)" : ""}${r.tong.tamDung ? " + " + r.tong.tamDung + " ngày không tính" : ""}.`; navigator.clipboard && navigator.clipboard.writeText(s).then(() => { chep.textContent = "Đã chép"; }, () => { }); });
          const p = new URLSearchParams(); if (f.ma.value) p.set("ma", f.ma.value); p.set("nhan", f.nhan.value); p.set("so", f.so.value); p.set("dv", f.dv.value); if (f.kv3.checked) { p.set("kv3", "1"); p.set("them", f.them.value); } if (+f.dung.value) p.set("dung", f.dung.value);
          if (capNhatDiaChi) history.replaceState(null, "", "#/tinh-han?" + p.toString());
        }
        f.addEventListener("submit", ev => { ev.preventDefault(); tinh(true); });
        f.addEventListener("input", ev => { if (ev.target !== f.ma && ev.target.id !== "nghi-moi") tinh(true); });
        if (f.so.value) tinh();
      } };
  };

  // ---------- Phiếu hướng dẫn chuẩn bị hồ sơ ----------
  function maQR(text, co) {
    if (typeof window.qrcode !== "function") return "";
    try { const qr = window.qrcode(0, "M"); qr.addData(unescape(encodeURIComponent(text))); qr.make(); return qr.createSvgTag({ cellSize: co || 3, margin: 2, scalable: true }); } catch (_) { return ""; }
  }
  function diaChiTrang(hash) { return location.href.split("#")[0].replace(/[?].*$/, "") + hash; }

  TT.man["phieu"] = function (ctx) {
    const { mh, thamSo } = ctx;
    const t = thamSo[0] ? mh.thuTucTheoMa[thamSo[0]] : null;
    if (!t) {
      return { tieuDe: "Phiếu hướng dẫn hồ sơ", html: `<div class="trang"><div class="dong-tieu-de"><div><div class="nhan-trang">Công cụ</div><h1>Phiếu hướng dẫn chuẩn bị hồ sơ</h1>
        <div class="mo-ta">Chọn thủ tục để tạo phiếu: danh mục giấy tờ có ô đánh dấu, thời hạn, nơi nộp, phí, mẫu đơn và mã QR dẫn tới trang thủ tục. In 1 trang A4 để hướng dẫn người dân chuẩn bị hồ sơ.</div></div></div>
        ${thamSo[0] ? `<div class="thong-bao thong-bao-vang">${bt("canhBao")}<div>Không có thủ tục mã “${e(thamSo[0])}”.</div></div>` : ""}
        <form class="the thanh-loc" id="chon-phieu" style="border-radius:var(--r-lg)">${chonThuTuc(mh, "")}<button class="nut nut-chinh">Tạo phiếu</button></form>
        <div class="dong-muc"><h2>Thủ tục thường gặp</h2></div>
        <div class="luoi luoi-3">${["III.3", "III.2", "II.6", "III.6", "III.7", "II.1"].map(ma => mh.thuTucTheoMa[ma]).filter(Boolean).map(x => `<a class="the the-muc" href="#/phieu/${x.ma}"><div class="tang"><span class="nhan nhan-xanh">${x.ma}</span><span class="nhan nhan-xam">${x.suyRa.giayTo.length} giấy tờ</span></div><div class="tieu">${e(rutTen(x.ten, 110))}</div></a>`).join("")}</div></div>`,
        sau(root) { const f = root.querySelector("#chon-phieu"); f.addEventListener("submit", ev => { ev.preventDefault(); if (f.ma.value) location.hash = "#/phieu/" + f.ma.value; }); } };
    }
    const h = t.suyRa.thoiHan, kv3 = th.tangThemKhuVucIII(t.muc[3] && t.muc[3].noiDung);
    const buoc1 = t.buoc.buoc[0];
    const noiNop = buoc1 ? (buoc1.tieuDe ? buoc1.tieuDe + ". " : "") + buoc1.noiDung.split("\n").slice(0, 3).join(" ") : (t.muc[1] ? t.muc[1].noiDung.split("\n").slice(0, 2).join(" ") : "");
    const phi = t.muc[7] ? ti.gopTrang(t.muc[7].noiDung) : "";
    let nhomTruoc = null;
    const giayTo = t.suyRa.giayTo.map(x => { const tieu = x.nhom !== nhomTruoc && x.nhom ? `<li class="nhom">${e(x.nhom)}</li>` : ""; nhomTruoc = x.nhom; return tieu + `<li class="${x.cap === 2 ? "c2" : ""}"><label><input type="checkbox"><span>${e(x.ten)}</span></label></li>`; }).join("");
    const lk = diaChiTrang("#/thu-tuc/" + t.ma);
    const dvc = mh.B.dichVuCong || {};
    const html = `<div class="trang phieu-trang">
      <div class="thanh-cong-cu khong-in"><a class="nut nut-nho" href="#/phieu">${bt("muiTrai", 14)} Chọn thủ tục khác</a><a class="nut nut-nho" href="#/thu-tuc/${t.ma}/ho-so">${bt("danhSach", 14)} Xem thủ tục</a><button class="nut nut-chinh nut-nho" onclick="window.print()">${bt("in", 14)} In phiếu (A4)</button>
        <span class="chu-nho mo">Có thể đánh dấu giấy tờ đã có trước khi in.</span></div>
      <article class="phieu">
        <header class="phieu-dau"><div><div class="phieu-to-chuc">Tỉnh Sơn La · Thủ tục hành chính về đất đai</div>
          <h1>PHIẾU HƯỚNG DẪN CHUẨN BỊ HỒ SƠ</h1>
          <div class="phieu-ten"><b>${t.ma}</b> — ${e(t.ten)}</div></div>
          <div class="phieu-qr" aria-label="Mã QR tới trang thủ tục">${maQR(lk, 3)}<div>Quét để xem toàn văn</div></div></header>
        <table class="phieu-bang"><tbody>
          <tr><th>Thời hạn giải quyết</th><td>${h ? `<b>${e(mh.hienThiHan(h))}</b> kể từ ngày nhận đủ hồ sơ hợp lệ${h.nhieuTruongHop ? " (có nhiều trường hợp — xem mục 3)" : ""}${kv3 ? `; xã khu vực III cộng thêm ${kv3.ngay} ${e(kv3.donVi)}` : ""}` : "Xem mục (3) của thủ tục"}</td></tr>
          <tr><th>Nơi nộp hồ sơ</th><td>${e(rutTen(ti.gopTrang(noiNop), 420))}</td></tr>
          <tr><th>Số lượng hồ sơ</th><td>${e(t.suyRa.soLuongHoSo || "Xem mục (2)")}</td></tr>
          <tr><th>Phí, lệ phí</th><td>${e(rutTen(phi, 360) || "Xem mục (7)")}</td></tr>
          ${t.suyRa.mau.length ? `<tr><th>Mẫu đơn (Phụ lục V)</th><td>${t.suyRa.mau.map(k => `Mẫu số ${e(mh.mauTheoKhoa[k].kyHieu)}`).join(", ")}</td></tr>` : ""}
        </tbody></table>
        <h2 class="phieu-muc">Giấy tờ cần chuẩn bị <span>(đánh dấu ☑ khi đã có)</span></h2>
        ${t.suyRa.giayTo.length ? `<ul class="phieu-giay-to">${giayTo}</ul>` : `<div class="phieu-nv">${tp.nguyenVan(t.muc[2] && t.muc[2].noiDung)}</div>`}
        <footer class="phieu-chan">Phiếu do phần mềm tra cứu lập từ mục (2), (3), (5), (7), (8) thủ tục ${t.ma} — ${e(mh.tenVanBan)} (Phụ lục ${t.phuLuc}, tr.${t.trangDau}–${t.trangCuoi}). Tài liệu hướng dẫn, <b>không phải</b> giấy tiếp nhận hồ sơ; danh mục giấy tờ có điều kiện “nếu có”, “trường hợp…” áp dụng theo từng hồ sơ. In ngày ${ti.ngayHienTai()}.${dvc.congQuocGia ? ` Nộp trực tuyến: ${e(dvc.congQuocGia.replace(/^https?:\/\//, ""))}.` : ""}</footer>
      </article></div>`;
    return { tieuDe: "Phiếu hướng dẫn " + t.ma, html };
  };
})();
