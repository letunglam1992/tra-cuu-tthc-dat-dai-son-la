/* Màn hình: ước tính nghĩa vụ tài chính về đất đai (tham khảo), bảng giá đất nhập từ Excel/CSV. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt, nv = TT.nghiaVu;
  const KHOA_BG = "tthc-bang-gia-dat", KHOA_DS = "tthc-du-tru-nvtc";
  const doc = (k, md) => { try { return JSON.parse(localStorage.getItem(k) || "null") || md; } catch (_) { return md; } };
  const ghi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { } };

  const TRUONG = {
    dienTich: ["Diện tích (m²)", "decimal"], gia: ["Giá đất (đồng/m²)", "gia"], giaTruoc: ["Giá đất trước khi chuyển mục đích (đồng/m²)", "gia"], giaSau: ["Giá đất sau khi chuyển mục đích (đồng/m²)", "gia"],
    heSo: ["Hệ số điều chỉnh giá đất (nếu có)", "decimal"], tyLe: ["Tỷ lệ (%)", "decimal"], tyLeThu: ["Tỷ lệ thu trên chênh lệch (%)", "decimal"],
    giaTriChuyenNhuong: ["Giá chuyển nhượng (đồng)", "gia"], duocTru: ["Khoản được trừ (đồng) — tiền bồi thường, GPMB đã ứng…", "gia"], mienGiamPhanTram: ["Miễn, giảm (%)", "decimal"]
  };
  const THEO_LOAI = {
    "giao-dat": ["dienTich", "gia", "heSo", "duocTru", "mienGiamPhanTram"],
    "chuyen-muc-dich": ["dienTich", "giaTruoc", "giaSau", "heSo", "tyLeThu", "duocTru", "mienGiamPhanTram"],
    "thue-hang-nam": ["dienTich", "gia", "heSo", "tyLe", "mienGiamPhanTram"],
    "thue-mot-lan": ["dienTich", "gia", "heSo", "duocTru", "mienGiamPhanTram"],
    "le-phi-truoc-ba": ["dienTich", "gia", "tyLe"],
    "thue-tncn": ["giaTriChuyenNhuong", "tyLe"]
  };

  // Thẻ phí thẩm định hồ sơ + lệ phí cấp Giấy chứng nhận (Nghị quyết HĐND tỉnh)
  function the_phi(mh, q) {
    const P = mh.P, t = q.phi ? mh.thuTucTheoMa[q.phi] : null, loai = t ? P.theoThuTuc[t.ma] : null;
    const chon = (ten, ds, gt) => `<select name="${ten}" class="chon-tt">${ds.map(([v, n]) => `<option value="${v}" ${v === gt ? "selected" : ""}>${e(n)}</option>`).join("")}</select>`;
    return `<section class="the" id="the-phi"><div class="the-dau"><span class="so-muc">₫</span><h3>Phí thẩm định hồ sơ, lệ phí cấp Giấy chứng nhận</h3><div class="phai chu-nho mo">${e(P.vanBan.ten)} · hiệu lực ${e(P.vanBan.hieuLuc)}</div></div>
      <div class="the-than">${t ? `<p class="chu-nho" style="margin-top:0">Thủ tục <a href="#/thu-tuc/${t.ma}/7">${t.ma}</a>: ${e(t.ten.length > 110 ? t.ten.slice(0, 108) + "…" : t.ten)}</p>` : ""}
        <div class="form-nv">
          <label class="truong"><span>Người nộp</span>${chon("doiTuong", [["ca-nhan", "Cá nhân"], ["to-chuc", "Tổ chức"]], "ca-nhan")}</label>
          <label class="truong"><span>Địa bàn</span>${chon("diaBan", [["phuong", "Phường (khu vực đô thị)"], ["xa", "Xã (khu vực nông thôn)"]], "xa")}</label>
          <label class="truong"><span>Loại hồ sơ</span>${chon("hoSo", [["lan-dau", "Cấp Giấy chứng nhận lần đầu"], ["bien-dong", "Cấp lại, cấp đổi, đăng ký biến động"]], loai === "bien-dong" ? "bien-dong" : "lan-dau")}</label>
          <label class="truong"><span>Hình thức (hồ sơ biến động)</span>${chon("hinhThuc", [["cap-moi", "Cấp mới Giấy chứng nhận"], ["xac-nhan", "Xác nhận biến động trên Giấy đã cấp"]], "cap-moi")}</label>
          <label class="truong"><span>Mục đích (cá nhân)</span>${chon("mucDich", [["nha-o", "Sử dụng đất làm nhà ở"], ["kinh-doanh", "Sử dụng đất kinh doanh"]], "nha-o")}</label>
          <label class="truong"><span>Diện tích dự án (m²) — tổ chức</span><input name="dienTich" inputmode="decimal"></label>
          <label class="truong"><span>Số lần trích lục (nếu có)</span><input name="soTrichLuc" inputmode="numeric" value="0"></label>
          <label class="o-chon"><input type="checkbox" name="chiQSDD"> <span>Giấy chứng nhận chỉ có quyền sử dụng đất (không có tài sản)</span></label>
          <label class="o-chon"><input type="checkbox" name="mien"> <span>Cá nhân thuộc đối tượng miễn (hộ nghèo, người cao tuổi, người khuyết tật, người có công, đồng bào DTTS ở xã ĐBKK)</span></label>
        </div>${loai === "khong" ? `<div class="thong-bao thong-bao-vang" style="margin:10px 0 0">${bt("thongTin")}<div>Danh mục TTHC công bố ghi thủ tục ${t.ma} không thu phí, lệ phí — chỉ tính nếu hồ sơ phát sinh cấp, chỉnh lý Giấy chứng nhận.</div></div>` : ""}
        <div class="kq-khoan" id="kq-phi" aria-live="polite"></div></div></section>`;
  }
  TT.man["nghia-vu"] = function (ctx) {
    const { mh } = ctx;
    const ch = mh.B.nghiaVuTaiChinh;
    const html = `<div class="trang">
      ${tp.dauIn("Dự trù nghĩa vụ tài chính về đất đai (tham khảo)")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Công cụ</div><h1>Ước tính nghĩa vụ tài chính</h1>
        <div class="mo-ta">Dự trù tiền sử dụng đất, tiền thuê đất, lệ phí trước bạ, thuế thu nhập cá nhân theo diện tích và giá đất. Mỗi khoản hiện công thức và căn cứ. Tra giá từ bảng giá đất đã nhập (dán từ Excel).</div></div>
        <div class="phai khong-in"><button class="nut" onclick="window.print()">${bt("in", 15)} In phiếu dự trù</button></div></div>
      <div class="thong-bao thong-bao-vang">${bt("canhBao")}<div><b>Chỉ để tham khảo.</b> ${e(ch.ghiChuChung)} Các mức thu gắn nhãn “cần đối chiếu” phải kiểm tra với văn bản hiện hành.</div></div>
      <div class="luoi luoi-chinh" style="align-items:start"><div>
        ${mh.P ? the_phi(mh, ctx.q) : ""}
        <div id="ds-khoan" style="display:grid;gap:12px;margin-top:12px"></div>
        <div class="tang khong-in" style="margin-top:12px"><select id="loai-moi" aria-label="Loại khoản thu" class="chon-tt" style="max-width:420px">${Object.entries(ch.khoan).map(([k, v]) => `<option value="${k}">${e(v.ten)}</option>`).join("")}</select><button type="button" class="nut nut-chinh" id="them-khoan">${bt("kiem", 15)} Thêm khoản</button></div>
        <div class="the tong-du-tru" id="tong"></div>
      </div>
      <aside class="khong-in" style="display:grid;gap:16px;align-content:start">
        <div class="the"><div class="the-dau"><h3>Bảng giá đất</h3><div class="phai" id="bg-dem"></div></div><div class="the-than chu-nho">
          <p style="margin-top:0">Dán bảng từ Excel (chọn vùng có dòng tiêu đề → Ctrl+C → dán vào ô dưới) hoặc chọn tệp CSV. Cột cần có: <b>Xã/Phường</b>, <b>Tuyến đường/Khu vực</b>, <b>Vị trí</b>, <b>Loại đất</b>, <b>Giá</b>. Lưu trên trình duyệt này.</p>
          <textarea id="bg-dan" rows="4" placeholder="Dán bảng giá đất tại đây" style="width:100%;border:1px solid var(--vien-dam);border-radius:8px;padding:8px;background:var(--o-nhap)"></textarea>
          <div class="tang" style="margin-top:8px"><button type="button" class="nut nut-nho" id="bg-nhap">Nhập bảng giá</button><label class="nut nut-nho">Chọn tệp CSV<input type="file" id="bg-tep" accept=".csv,.txt,.tsv" hidden></label><button type="button" class="nut nut-nho" id="bg-mau">${bt("taiXuong", 13)} Tệp mẫu</button><button type="button" class="nut nut-nho nut-chu" id="bg-xoa">Xóa bảng giá</button></div>
          <div id="bg-tb" style="margin-top:8px"></div></div></div>
        <div class="the"><div class="the-dau"><h3>Tài liệu liên quan</h3></div><div class="the-than chu-nho" style="display:grid;gap:6px">
          <a href="#/quy-trinh">Quy trình luân chuyển hồ sơ xác định NVTC (Điều 15–18)</a><a href="#/mau-bieu/19">Mẫu số 19 — Phiếu chuyển thông tin xác định NVTC</a><a href="#/mau-bieu/34">Mẫu số 34 — Đơn đề nghị tính, tính lại tiền sử dụng đất</a></div></div>
      </aside></div></div>`;
    return { tieuDe: "Ước tính nghĩa vụ tài chính", html, sau(root) { khoiTao(root, mh); } };
  };

  function khoiTao(root, mh) {
    const ch = mh.B.nghiaVuTaiChinh;
    let ds = doc(KHOA_DS, null) || [{ id: 1, loai: "chuyen-muc-dich", gt: {} }];
    let bangGia = doc(KHOA_BG, []);
    const dsEl = root.querySelector("#ds-khoan"), tongEl = root.querySelector("#tong");
    const thePhi = root.querySelector("#the-phi");
    let tongPhi = 0;
    function tinhPhi() {
      if (!thePhi) return;
      const g = n => thePhi.querySelector(`[name="${n}"]`), ts = { doiTuong: g("doiTuong").value, diaBan: g("diaBan").value, hoSo: g("hoSo").value, hinhThuc: g("hinhThuc").value, mucDich: g("mucDich").value, dienTich: g("dienTich").value, soTrichLuc: g("soTrichLuc").value, chiQSDD: g("chiQSDD").checked, mien: g("mien").checked };
      const tc = ts.doiTuong === "to-chuc"; g("mucDich").closest(".truong").hidden = tc; g("dienTich").closest(".truong").hidden = !tc; g("mien").closest(".o-chon").hidden = tc; g("hinhThuc").closest(".truong").hidden = ts.hoSo !== "bien-dong";
      const r = nv.tinhPhiGCN(ts, mh.P); tongPhi = r.tong;
      thePhi.querySelector("#kq-phi").innerHTML = `<div class="kq-nv"><div class="k">Phí, lệ phí ước tính</div><div class="v">${e(nv.tien(r.tong))}</div>
        <table class="bang bang-gon" style="margin-top:6px"><tbody>${r.dong.map(d => `<tr><td><b>${e(d.ten)}</b><div class="chu-nho mo">${e(d.ghiChu)}</div></td><td class="so">${e(nv.tien(d.soTien))}</td></tr>`).join("")}</tbody></table>
        <div class="chu-nho mo"><b>Căn cứ:</b> ${e(r.nguon)}</div>${r.canhBao.map(c => `<div class="chu-nho" style="color:var(--vang)">• ${e(c)}</div>`).join("")}</div>`;
      tinhTatCa();
    }
    if (thePhi) { thePhi.addEventListener("input", tinhPhi); thePhi.addEventListener("change", tinhPhi); }
    const luu = () => ghi(KHOA_DS, ds);
    const veBG = () => {
      root.querySelector("#bg-dem").innerHTML = bangGia.length ? `<span class="nhan nhan-xanh">${bangGia.length} dòng</span>` : `<span class="nhan nhan-xam">Chưa nhập</span>`;
    };
    function oTruong(k, khoan) {
      const [nhan, kieu] = TRUONG[k], gt = khoan.gt[k] ?? (k === "tyLe" && ch.khoan[khoan.loai].mucMacDinh != null ? String(ch.khoan[khoan.loai].mucMacDinh).replace(".", ",") : k === "tyLeThu" ? "100" : "");
      const traGia = kieu === "gia" && /^gia/.test(k) && bangGia.length && k !== "giaTriChuyenNhuong" ? `<button type="button" class="nut nut-nho" data-tra-gia="${k}">${bt("tim", 13)} Tra bảng giá</button>` : "";
      const goiY = k === "tyLeThu" ? `<select data-goi-y aria-label="Gợi ý tỷ lệ thu" class="goi-y-ty-le" title="Chọn để điền tỷ lệ theo căn cứ">${ch.tyLeChuyenMucDich.map(x => `<option value="${x.giaTri == null ? "" : x.giaTri}">${e(x.nhan)}</option>`).join("")}</select>` : "";
      return `<label class="truong"><span>${e(nhan)}${k === "tyLe" && ch.khoan[khoan.loai].mucMacDinh != null ? ` <span class="nhan nhan-vang">mặc định ${String(ch.khoan[khoan.loai].mucMacDinh).replace(".", ",")}% — cần đối chiếu</span>` : ""}</span>
        <span class="tang"><input name="${k}" inputmode="decimal" value="${e(gt)}" autocomplete="off" style="flex:1;min-width:140px">${traGia}</span>${goiY}
        ${kieu === "gia" ? `<span class="mo chu-nho" data-chu="${k}"></span>` : ""}</label>`;
    }
    function ve() {
      dsEl.innerHTML = ds.map((kh, i) => { const k = ch.khoan[kh.loai]; return `<section class="the khoan-nv" data-id="${kh.id}"><div class="the-dau"><span class="so-muc">${i + 1}</span><h3>${e(k.ten)}</h3>
        <div class="phai">${k.canXacMinh ? `<span class="nhan nhan-vang">Cần đối chiếu</span>` : ""}<button type="button" class="nut nut-nho nut-chu khong-in" data-xoa-khoan aria-label="Xóa khoản ${i + 1}">${bt("dong", 14)}</button></div></div>
        <div class="the-than"><div class="form-nv">${THEO_LOAI[kh.loai].map(f => oTruong(f, kh)).join("")}</div><div class="kq-khoan" aria-live="polite"></div></div></section>`; }).join("");
      tinhTatCa();
    }
    function tinhTatCa() {
      let tong = tongPhi, du = true;
      ds.forEach(kh => {
        const sec = dsEl.querySelector(`[data-id="${kh.id}"]`); if (!sec) return;
        const ts = { loai: kh.loai }; for (const f of THEO_LOAI[kh.loai]) ts[f] = sec.querySelector(`[name="${f}"]`).value;
        for (const el of sec.querySelectorAll("[data-chu]")) { const v = nv.so(ts[el.getAttribute("data-chu")]); el.textContent = isFinite(v) && v > 0 ? nv.tien(v) : ""; }
        const r = nv.tinh(ts, ch), kq = sec.querySelector(".kq-khoan");
        if (r.loi) { kq.innerHTML = `<p class="mo chu-nho">${e(r.loi)}</p>`; du = false; return; }
        tong += r.soTien;
        kq.innerHTML = `<div class="kq-nv"><div class="k">Số tiền ước tính${kh.loai === "thue-hang-nam" ? " (mỗi năm)" : ""}</div><div class="v">${e(nv.tien(r.soTien))}</div><div class="chu-nho"><i>${e(r.bangChu)}</i></div>
          <div class="chu-nho" style="margin-top:6px"><b>Công thức:</b> ${e(r.congThuc)}</div><div class="chu-nho mo"><b>Căn cứ:</b> ${e(r.canCu)}</div>
          ${r.canhBao.map(c => `<div class="chu-nho" style="color:var(--vang)">• ${e(c)}</div>`).join("")}</div>`;
      });
      tongEl.innerHTML = `<div class="the-than"><div class="k">Tổng dự trù ${ds.some(x => x.loai === "thue-hang-nam") ? "(tiền thuê hằng năm tính cho 1 năm)" : ""}</div><div class="ngay-hen">${e(nv.tien(tong))}</div><div class="chu-nho"><i>${e(nv.docSo(tong))}</i>${du ? "" : " · còn khoản thiếu số liệu"}</div><div class="chu-nho mo" style="margin-top:6px">Lập ngày ${ti.ngayHienTai()} bằng phần mềm tra cứu — không phải Thông báo nộp tiền.</div></div>`;
    }
    dsEl.addEventListener("input", ev => {
      const sec = ev.target.closest("[data-id]"); if (!sec) return;
      const kh = ds.find(x => String(x.id) === sec.getAttribute("data-id"));
      if (ev.target.name) kh.gt[ev.target.name] = ev.target.value;
      luu(); tinhTatCa();
    });
    dsEl.addEventListener("change", ev => {
      if (ev.target.matches("[data-goi-y]") && ev.target.value) { const o = ev.target.closest(".truong").querySelector("input"); o.value = ev.target.value; o.dispatchEvent(new Event("input", { bubbles: true })); }
    });
    dsEl.addEventListener("click", ev => {
      const sec = ev.target.closest("[data-id]"); if (!sec) return;
      if (ev.target.closest("[data-xoa-khoan]")) { ds = ds.filter(x => String(x.id) !== sec.getAttribute("data-id")); luu(); ve(); return; }
      const nut = ev.target.closest("[data-tra-gia]"); if (nut) moTraGia(nut, sec.querySelector(`[name="${nut.getAttribute("data-tra-gia")}"]`));
    });
    root.querySelector("#them-khoan").addEventListener("click", () => { ds.push({ id: Date.now(), loai: root.querySelector("#loai-moi").value, gt: {} }); luu(); ve(); });

    // Tra bảng giá: lọc theo xã → tuyến → vị trí → loại đất
    function moTraGia(nut, oNhap) {
      const cu = root.querySelector(".tra-gia"); if (cu) cu.remove();
      const hop = document.createElement("div"); hop.className = "tra-gia the";
      const gt = k => [...new Set(bangGia.map(x => x[k]).filter(Boolean))];
      hop.innerHTML = `<div class="the-than"><div class="tang"><select data-k="xa" aria-label="Xã, phường"><option value="">— Xã, phường —</option>${gt("xa").map(x => `<option>${e(x)}</option>`).join("")}</select>
        <input data-k="tim" placeholder="Lọc tuyến đường, khu vực…" aria-label="Lọc tuyến đường" style="flex:1;min-width:160px"><select data-k="loai" aria-label="Loại đất"><option value="">— Loại đất —</option>${gt("loai").map(x => `<option>${e(x)}</option>`).join("")}</select></div>
        <div class="bang-cuon" style="max-height:260px;margin-top:8px"><table class="bang"><thead><tr><th>Xã, phường</th><th>Tuyến đường, khu vực</th><th>Vị trí</th><th>Loại đất</th><th class="so">Giá (đồng/m²)</th><th></th></tr></thead><tbody></tbody></table></div></div>`;
      nut.closest(".truong").after(hop);
      const loc = () => {
        const xa = hop.querySelector('[data-k="xa"]').value, loai = hop.querySelector('[data-k="loai"]').value, q = ti.chuanHoa(hop.querySelector('[data-k="tim"]').value);
        const kq = bangGia.filter(x => (!xa || x.xa === xa) && (!loai || x.loai === loai) && (!q || ti.chuanHoa(x.tuyen + " " + x.viTri).includes(q))).slice(0, 200);
        hop.querySelector("tbody").innerHTML = kq.map((x, i) => `<tr><td>${e(x.xa)}</td><td>${e(x.tuyen)}</td><td>${e(x.viTri)}</td><td>${e(x.loai)}</td><td class="so">${nv.soVN(x.gia, 0)}</td><td><button type="button" class="nut nut-nho" data-chon="${x.gia}">Chọn</button></td></tr>`).join("") || `<tr><td colspan="6" class="mo">Không có dòng phù hợp.</td></tr>`;
      };
      hop.addEventListener("input", loc); hop.addEventListener("change", loc);
      hop.addEventListener("click", ev => { const b = ev.target.closest("[data-chon]"); if (b) { oNhap.value = nv.soVN(+b.getAttribute("data-chon"), 0); oNhap.dispatchEvent(new Event("input", { bubbles: true })); hop.remove(); } });
      loc();
    }

    // Nhập bảng giá
    const tb = root.querySelector("#bg-tb");
    const nhap = text => { const r = nv.docBangGia(text); if (r.loi) { tb.innerHTML = `<span style="color:var(--do)">${e(r.loi)}</span>`; return; } bangGia = r.ds; ghi(KHOA_BG, bangGia); tb.innerHTML = `<span style="color:var(--xanh)">Đã nhập ${r.ds.length} dòng giá (cột nhận diện: ${e(r.cot.join(", "))}).</span>`; veBG(); ve(); };
    root.querySelector("#bg-nhap").addEventListener("click", () => nhap(root.querySelector("#bg-dan").value));
    root.querySelector("#bg-tep").addEventListener("change", ev => { const f = ev.target.files[0]; if (f) f.text().then(nhap); });
    root.querySelector("#bg-xoa").addEventListener("click", () => { bangGia = []; ghi(KHOA_BG, []); tb.textContent = "Đã xóa bảng giá."; veBG(); ve(); });
    root.querySelector("#bg-mau").addEventListener("click", () => tp.xuatCsv("mau-bang-gia-dat.csv", ["Xã/Phường", "Tuyến đường/Khu vực", "Vị trí", "Loại đất", "Giá (đồng/m²)"], [["Phường …", "Đường …, đoạn từ … đến …", "1", "Đất ở", "0"]]));
    veBG(); ve(); tinhPhi();
  }

  // ---------- Trang tra cứu phí, lệ phí đất đai ----------
  TT.man["phi-le-phi"] = function (ctx) {
    const { mh } = ctx, P = mh.P;
    if (!P) return { tieuDe: "Phí, lệ phí", html: `<div class="trang"><div class="the trong"><b>Chưa có dữ liệu phí, lệ phí.</b></div></div>` };
    const vnd = v => v.toLocaleString("vi-VN"), td = P.thamDinh, lp = P.lePhi;
    const bang = (dau, dong) => `<div class="bang-cuon"><table class="bang dap-ung"><thead><tr>${dau.map(h => `<th${/Mức/.test(h) ? ' class="so"' : ""}>${e(h)}</th>`).join("")}</tr></thead><tbody>${dong.join("")}</tbody></table></div>`;
    const html = `<div class="trang">${tp.dauIn("Phí, lệ phí lĩnh vực đất đai — tỉnh Sơn La")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Phí, lệ phí</div><h1>Phí, lệ phí lĩnh vực đất đai tại tỉnh Sơn La</h1>
        <div class="mo-ta">Trích các khoản thuộc lĩnh vực đất đai từ ${e(P.vanBan.ten)} ngày ${e(P.vanBan.ngay)} của ${e(P.vanBan.coQuan)} ${e(P.vanBan.trichYeu.toLowerCase())}. Mục (7) các thủ tục tại Quyết định số 75/2026/QĐ-UBND dẫn chiếu “theo quy định của Luật Phí và lệ phí và các văn bản hướng dẫn”.</div></div>
        <div class="phai khong-in"><a class="nut nut-chinh" href="#/nghia-vu">${bt("dongHo", 15)} Tính phí cho hồ sơ</a><button class="nut" onclick="window.print()">${bt("in", 15)} In</button></div></div>
      <div class="thong-bao thong-bao-xanh">${bt("kiem")}<div><b>${e(P.vanBan.ten)} có hiệu lực thi hành từ ngày ${e(P.vanBan.hieuLuc)}</b> (${e(P.vanBan.canCuHieuLuc)}). Hết hiệu lực: ${P.vanBan.hetHieuLuc.map(e).join("; ")}. Người ký: ${e(P.vanBan.nguoiKy)}.</div></div>
      <div class="the"><div class="the-dau"><h3>${e(td.ten)}</h3><div class="phai">${tp.dauNguon.nv()} <span class="chu-nho mo">${e(td.viTri)}</span></div></div><div class="the-than">
        <p class="chu-nho"><b>Đối tượng miễn nộp:</b> ${e(td.mienNop)}</p>
        ${bang(["Đối tượng", "Nội dung thu", "Đơn vị tính", "Mức thu (đồng)"], [
          ...td.toChucLanDau.map(x => `<tr><td data-nhan="Đối tượng">Tổ chức — cấp lần đầu</td><td data-nhan="Nội dung">${e(x[3])}</td><td data-nhan="Đơn vị">Bộ hồ sơ</td><td class="so" data-nhan="Mức thu">${vnd(x[2])}</td></tr>`),
          ...[["nha-o", "Trường hợp sử dụng đất làm nhà ở"], ["kinh-doanh", "Trường hợp sử dụng đất kinh doanh"]].flatMap(([k, ten]) => [["do-thi", "khu vực đô thị"], ["nong-thon", "khu vực nông thôn"]].map(([kv, tkv]) => `<tr><td data-nhan="Đối tượng">Cá nhân — cấp lần đầu</td><td data-nhan="Nội dung">${e(ten)}, ${tkv}</td><td data-nhan="Đơn vị">Bộ hồ sơ</td><td class="so" data-nhan="Mức thu">${vnd(td.caNhanLanDau[k][kv])}</td></tr>`))])}
        <p class="chu-nho"><b>Cấp lại, cấp đổi, đăng ký biến động:</b> ${e(td.bienDongNguyenVan)} (áp dụng cho cả tổ chức và cá nhân).</p><p class="chu-nho mo">Tỷ lệ để lại: ${e(td.tyLeDeLai)}.</p></div></div>
      <div class="the" style="margin-top:16px"><div class="the-dau"><h3>${e(lp.ten)}</h3><div class="phai">${tp.dauNguon.nv()} <span class="chu-nho mo">${e(lp.viTri)}</span></div></div><div class="the-than">
        <div class="chu-nho"><b>Đối tượng miễn nộp:</b><ul class="ds-gon">${lp.mienNop.map(x => `<li>${e(x)}</li>`).join("")}</ul></div>
        ${bang(["Đối tượng", "Nội dung thu", "Đơn vị tính", "Mức thu (đồng)"], [
          ...lp.caNhanPhuong.map(x => `<tr><td data-nhan="Đối tượng">Cá nhân tại phường</td><td data-nhan="Nội dung">${e(x.noiDung)}</td><td data-nhan="Đơn vị">${e(x.donVi)}</td><td class="so" data-nhan="Mức thu">${vnd(x.mucThu)}</td></tr>`),
          `<tr><td data-nhan="Đối tượng">Cá nhân tại xã</td><td data-nhan="Nội dung" colspan="3">Bằng ${lp.tyLeCaNhanXa}% mức thu tương ứng đối với mỗi nội dung áp dụng cho cá nhân tại phường</td></tr>`,
          ...lp.toChuc.map(x => `<tr><td data-nhan="Đối tượng">Tổ chức</td><td data-nhan="Nội dung">${e(x.noiDung)}</td><td data-nhan="Đơn vị">${e(x.donVi)}</td><td class="so" data-nhan="Mức thu">${vnd(x.mucThu)}</td></tr>`)])}</div></div>
      ${P.khac.map(k => `<div class="the" style="margin-top:16px"><div class="the-dau"><h3>${e(k.ten)}</h3><div class="phai">${tp.dauNguon.nv()} <span class="chu-nho mo">${e(k.viTri)}</span></div></div><div class="the-than">
        ${k.mienNop ? `<p class="chu-nho"><b>Đối tượng miễn nộp:</b> ${e(k.mienNop)}</p>` : ""}
        ${bang(["Nội dung thu", "Đơn vị tính", "Mức thu (đồng)"], k.bang.map(x => `<tr><td data-nhan="Nội dung">${e(x[0])}</td><td data-nhan="Đơn vị">${e(x[1])}</td><td class="so" data-nhan="Mức thu">${vnd(x[2])}</td></tr>`))}
        ${k.ghiChu ? `<p class="chu-nho mo">${e(k.ghiChu)}</p>` : ""}${k.tyLeDeLai ? `<p class="chu-nho mo">Tỷ lệ để lại: ${e(k.tyLeDeLai)} số tiền phí thực thu (tổ chức thu không phải cơ quan nhà nước).</p>` : ""}</div></div>`).join("")}
      ${TT.quanTri ? `<div class="the" style="margin-top:16px"><div class="the-dau"><h3>Vấn đề phát hiện khi đối chiếu</h3><span class="nhan nhan-vang">Chế độ kiểm soát</span></div><div class="the-than chu-nho"><ul class="ds-gon">${P.vanDeDanhMuc.map(x => `<li>${e(x)}</li>`).join("")}</ul></div></div>` : ""}
    </div>`;
    return { tieuDe: "Phí, lệ phí đất đai", html };
  };
})();
