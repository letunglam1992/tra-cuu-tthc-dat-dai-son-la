/* Màn hình: danh mục thủ tục (lọc, tìm, xuất) và chi tiết thủ tục (tab theo nhóm thông tin). */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;

  const NHOM_HAN = [
    { id: "", ten: "Mọi thời hạn" },
    { id: "le5", ten: "Đến 5 ngày", f: n => n <= 5 },
    { id: "6-10", ten: "6–10 ngày", f: n => n > 5 && n <= 10 },
    { id: "11-15", ten: "11–15 ngày", f: n => n > 10 && n <= 15 },
    { id: "gt15", ten: "Trên 15 ngày", f: n => n > 15 },
    { id: "lich", ten: "Tính bằng “ngày” (không phải ngày làm việc)", f: (n, h) => h.donVi === "ngày" },
    { id: "kxd", ten: "Không nhận diện được số ngày" }
  ];

  function hanNgan(t) {
    const h = t.suyRa.thoiHan;
    if (!h) return `<span class="mo">Xem nguyên văn</span>`;
    return `<b>${String(h.ngay).replace(".", ",")}</b> ${h.donVi}${h.donVi === "ngày" ? ` <span class="nhan nhan-vang" style="padding:0 6px" title="Văn bản ghi “ngày”, không ghi “ngày làm việc”">ngày lịch?</span>` : ""}${h.nhieuTruongHop ? `<div class="phu">có nhiều trường hợp</div>` : ""}`;
  }
  function coQuanVaiTro(t, vai) { return [...new Set(t.suyRa.coQuan.filter(c => c.vaiTro === vai).map(c => c.id))]; }

  function locThuTuc(mh, tk, q) {
    let ds = mh.thuTuc;
    if (q.pl) ds = ds.filter(t => t.phuLuc === q.pl);
    if (q.cq) ds = ds.filter(t => t.suyRa.coQuan.some(c => c.id === q.cq));
    if (q.han) { const g = NHOM_HAN.find(x => x.id === q.han); if (g) ds = ds.filter(t => g.id === "kxd" ? !t.suyRa.thoiHan : t.suyRa.thoiHan && g.f(t.suyRa.thoiHan.ngay, t.suyRa.thoiHan)); }
    if (q.nvtc === "1") ds = ds.filter(t => t.suyRa.coNghiaVuTaiChinh);
    if (q.mau) ds = ds.filter(t => t.suyRa.mau.includes(q.mau));
    let tu = [];
    if (q.q) {
      const kq = tk.tim(q.q, { loai: "thu-tuc" });
      tu = kq.tu;
      const thuTuDiem = new Map(kq.ketQua.map((r, i) => [r.id, { i, r }]));
      ds = ds.filter(t => thuTuDiem.has(t.ma)).sort((a, b) => thuTuDiem.get(a.ma).i - thuTuDiem.get(b.ma).i).map(t => ({ ...t, _kq: thuTuDiem.get(t.ma).r }));
    }
    if (q.sx === "han") ds = ds.slice().sort((a, b) => (a.suyRa.thoiHan ? a.suyRa.thoiHan.ngay : 999) - (b.suyRa.thoiHan ? b.suyRa.thoiHan.ngay : 999));
    return { ds, tu };
  }

  TT.man["thu-tuc"] = function (ctx) {
    if (ctx.thamSo[0]) return chiTiet(ctx);
    const { mh, tk, q } = ctx;
    const { ds, tu } = locThuTuc(mh, tk, q);
    const cqCoMat = mh.coQuan.filter(c => mh.thuTuc.some(t => t.suyRa.coQuan.some(x => x.id === c.id)));
    const sel = (ten, gt, opts) => `<select name="${ten}" aria-label="${e(opts.nhan)}">${opts.ds.map(o => `<option value="${e(o[0])}" ${String(gt || "") === String(o[0]) ? "selected" : ""}>${e(o[1])}</option>`).join("")}</select>`;
    const coLoc = q.q || q.pl || q.cq || q.han || q.nvtc || q.mau;
    const html = `<div class="trang">
      ${tp.dauIn("Danh mục thủ tục hành chính về đất đai")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Tra cứu thủ tục</div><h1>Thủ tục hành chính về đất đai</h1>
        <div class="mo-ta">${mh.thongKe.thuTuc} thủ tục tại Phụ lục I (cấp tỉnh), Phụ lục II (cấp xã) và Phụ lục III (Văn phòng đăng ký đất đai). Mỗi thủ tục có đủ 9 mục nội dung nguyên văn theo văn bản.</div></div>
        <div class="phai khong-in"><button class="nut" id="xuat-csv">${bt("taiXuong", 15)} Xuất CSV</button><button class="nut" onclick="window.print()">${bt("in", 15)} In danh mục</button></div></div>
      <div class="the">
        <form class="thanh-loc" id="loc">
          <div class="o-tim">${bt("tim", 16)}<input type="search" name="q" value="${e(q.q || "")}" placeholder="Tìm trong tên và nội dung thủ tục" aria-label="Tìm thủ tục"></div>
          <button type="button" class="nut nut-loc" aria-expanded="false" aria-controls="loc">${bt("danhSach", 15)} Bộ lọc${[q.pl, q.cq, q.han, q.nvtc, q.mau].filter(Boolean).length ? ` <span class="dem-loc">${[q.pl, q.cq, q.han, q.nvtc, q.mau].filter(Boolean).length}</span>` : ""}</button>
          ${sel("pl", q.pl, { nhan: "Phụ lục", ds: [["", "Mọi cấp giải quyết"], ...mh.PL.map(p => [p.so, `Phụ lục ${p.so} — ${p.cap}`])] })}
          ${sel("cq", q.cq, { nhan: "Cơ quan", ds: [["", "Mọi cơ quan"], ...cqCoMat.map(c => [c.id, c.ten])] })}
          ${sel("han", q.han, { nhan: "Thời hạn", ds: NHOM_HAN.map(g => [g.id, g.ten]) })}
          ${sel("mau", q.mau, { nhan: "Mẫu đơn", ds: [["", "Mọi mẫu đơn"], ...mh.mauBieu.filter(m => m.thuTuc.length).map(m => [m.khoa, `Mẫu số ${m.kyHieu}`])] })}
          <label class="chu-nho" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="nvtc" value="1" ${q.nvtc === "1" ? "checked" : ""}> Có nội dung nghĩa vụ tài chính</label>
          ${sel("sx", q.sx, { nhan: "Sắp xếp", ds: [["", "Sắp xếp theo mã"], ["han", "Sắp xếp theo thời hạn"]] })}
        </form>
        ${q.q ? TT.giaiThichTim(tk.tim(q.q, { loai: "thu-tuc" }), q.q).replace('class="giai-thich-tim"', 'class="giai-thich-tim" style="padding:8px 14px 0;margin:0"') : ""}
        <div class="ket-loc"><b>${ds.length}</b> / ${mh.thuTuc.length} thủ tục${coLoc ? ` · <a href="#/thu-tuc">Bỏ lọc</a>` : ""}
          <span class="mo" style="margin-left:auto">${tp.dauNguon.pm()} Cột “Thời hạn” (số ngày nêu đầu tiên tại mục 3, giữ đơn vị văn bản) và “Cơ quan” là chỉ mục để lọc nhanh — luôn đối chiếu nguyên văn.</span></div>
        ${ds.length ? `<div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Mã</th><th>Thủ tục hành chính</th><th>Thời hạn</th><th>Cơ quan có thẩm quyền</th><th>Mẫu PL V</th><th class="so">Trang</th></tr></thead><tbody>
          ${ds.map(t => `<tr class="co-the-chon" data-href="#/thu-tuc/${t.ma}">
            <td class="ma" data-nhan="Mã">${t.ma}</td>
            <td data-nhan="Thủ tục"><a class="ten-tt" href="#/thu-tuc/${t.ma}">${tu.length ? ti.toSang(t.ten, tu) : e(t.ten)}</a>
              <div class="phu">Phụ lục ${t.phuLuc} · ${e(t.cap)}${t.maQuocGia && t.maQuocGia.mucDo === "khop" ? ` · Mã TTHC ${e(t.maQuocGia.ma)}` : ""}${t.suyRa.coNghiaVuTaiChinh ? ` · <span class="nhan nhan-lam" style="padding:0 7px">Có NVTC</span>` : ""}${!t.khopTen ? ` · <span class="nhan nhan-vang" style="padding:0 7px" title="Tên ở danh mục khác tên ở nội dung chi tiết">Tên A/B khác nhau</span>` : ""}</div>
              ${t._kq && t._kq.trich ? `<div class="phu" style="margin-top:4px">${e(t._kq.truongTrich)}: ${ti.toSang(t._kq.trich, tu)}</div>` : ""}</td>
            <td data-nhan="Thời hạn">${hanNgan(t)}</td>
            <td data-nhan="Có thẩm quyền" class="chu-nho">${coQuanVaiTro(t, "tham-quyen").map(id => e(tp.tenCoQuan(id))).join("<br>") || '<span class="mo">Xem mục (5)</span>'}</td>
            <td data-nhan="Mẫu" class="chu-nho">${t.suyRa.mau.map(k => `<a href="#/mau-bieu/${k}">${e(mh.mauTheoKhoa[k].kyHieu)}</a>`).join(", ") || '<span class="mo">—</span>'}</td>
            <td class="so" data-nhan="Trang">${tp.lkPdf(t.trangDau, t.trangDau + "–" + t.trangCuoi)}</td></tr>`).join("")}
          </tbody></table></div>`
        : `<div class="trong"><b>Không có thủ tục phù hợp.</b>Thử bỏ bớt điều kiện lọc, hoặc tìm bằng từ khóa ngắn hơn. Tìm kiếm không phân biệt có dấu / không dấu.<br><a href="#/thu-tuc">Bỏ toàn bộ điều kiện lọc</a></div>`}
      </div></div>`;
    return {
      tieuDe: "Thủ tục hành chính", html, giuCuon: true,
      sau(root) {
        const f = root.querySelector("#loc");
        const apDung = () => {
          const p = new URLSearchParams();
          for (const [k, v] of new FormData(f).entries()) if (v) p.set(k, v);
          const s = p.toString();
          location.hash = "#/thu-tuc" + (s ? "?" + s : "");
        };
        f.addEventListener("change", apDung);
        const nutLoc = f.querySelector(".nut-loc");
        nutLoc.addEventListener("click", () => { const mo = f.classList.toggle("mo-loc"); nutLoc.setAttribute("aria-expanded", mo); });
        f.addEventListener("submit", ev => { ev.preventDefault(); apDung(); });
        let hen; f.q.addEventListener("input", () => { clearTimeout(hen); hen = setTimeout(() => { apDung(); setTimeout(() => { const o = document.querySelector("#loc input[name=q]"); if (o) { o.focus(); o.setSelectionRange(o.value.length, o.value.length); } }, 0); }, 450); });
        root.querySelectorAll("tr[data-href]").forEach(tr => tr.addEventListener("click", ev => { if (!ev.target.closest("a")) location.hash = tr.getAttribute("data-href"); }));
        root.querySelector("#xuat-csv").addEventListener("click", () => tp.xuatCsv("danh-muc-thu-tuc.csv",
          ["Mã", "Mã TTHC quốc gia", "Phụ lục", "Cấp giải quyết", "Tên thủ tục (danh mục)", "Tên tại nội dung chi tiết", "Thời hạn - số (nêu đầu tiên, chỉ mục)", "Thời hạn - đơn vị", "Cơ quan có thẩm quyền (chỉ mục)", "Mẫu Phụ lục V", "Số lượng hồ sơ", "Trang PDF", "Thời hạn giải quyết (nguyên văn)"],
          ds.map(t => [t.ma, t.maQuocGia ? t.maQuocGia.ma + (t.maQuocGia.mucDo === "goi-y" ? " (gợi ý, cần xác minh)" : "") : "", t.phuLuc, t.cap, t.ten, t.tenNoiDung, t.suyRa.thoiHan ? t.suyRa.thoiHan.ngay : "", t.suyRa.thoiHan ? t.suyRa.thoiHan.donVi : "", coQuanVaiTro(t, "tham-quyen").map(tp.tenCoQuan).join("; "), t.suyRa.mau.map(k => mh.mauTheoKhoa[k].kyHieu).join(", "), t.suyRa.soLuongHoSo || "", `${t.trangDau}-${t.trangCuoi}`, t.muc[3] ? t.muc[3].noiDung : ""])));
      }
    };
  };

  // ---------- Chi tiết thủ tục ----------
  const TAB = [
    { id: "", ten: "Toàn bộ nội dung" },
    { id: "trinh-tu", ten: "Trình tự & luân chuyển" },
    { id: "ho-so", ten: "Thành phần hồ sơ" },
    { id: "thoi-han", ten: "Thời hạn" },
    { id: "co-quan", ten: "Cơ quan & trách nhiệm" },
    { id: "mau", ten: "Mẫu đơn, tờ khai" },
    { id: "can-cu", ten: "Căn cứ pháp lý" }
  ];

  function theMuc(mh, t, so, opts) {
    const m = t.muc[so]; opts = opts || {};
    if (!m) return `<section class="the muc-tt" id="muc-${so}"><div class="the-dau"><span class="so-muc">${so}</span><h3>${e(mh.TEN_MUC[so])}</h3></div><div class="the-than"><div class="thong-bao thong-bao-do">${bt("canhBao")}Không trích xuất được nội dung mục này — cần kiểm tra trang PDF.</div></div></section>`;
    const khongQD = /^Không quy định\.?$/i.test(m.noiDung.trim());
    const trong = !m.noiDung.trim();
    return `<section class="the muc-tt" id="muc-${so}">
      <div class="the-dau"><span class="so-muc">${so}</span><h3>${e(m.nhan || mh.TEN_MUC[so])}</h3>
        <div class="phai">${trong ? "" : tp.dauNguon.nv()} ${tp.chipCanCu({ loai: "muc", ma: t.ma, muc: so }, `PL ${t.phuLuc} · TT ${t.stt} · mục (${so})`)} ${tp.lkPdf(m.trangDau, "Tr. " + m.trangDau + (m.trangCuoi !== m.trangDau ? "–" + m.trangCuoi : ""))}</div></div>
      <div class="the-than">${trong ? `<div class="thong-bao thong-bao-vang" style="margin:0">${bt("canhBao")}<div><b>Ô nội dung để trống trong văn bản nguồn</b> (trang ${m.trangDau}). Phần mềm không tự điền và không coi là “không quy định” — cần xác minh với cơ quan ban hành.</div></div>`
        : khongQD ? `<p><b>Không quy định.</b> <span class="mo chu-nho">(nguyên văn tài liệu nguồn)</span></p>` : tp.nguyenVan(m.noiDung, { toSang: opts.toSang })}${opts.sau || ""}</div></section>`;
  }

  function chiTiet(ctx) {
    const { mh, thamSo, q } = ctx;
    const t = mh.thuTucTheoMa[thamSo[0]];
    if (!t) return { tieuDe: "Không tìm thấy thủ tục", html: `<div class="trang"><div class="the trong"><b>Không có thủ tục mã “${e(thamSo[0])}”.</b><a href="#/thu-tuc">Về danh mục thủ tục</a></div></div>` };
    const p2 = thamSo[1] || "";
    const soMuc = /^\d$/.test(p2) ? +p2 : null;
    const tab = soMuc ? "" : p2;
    const tu = q.tu ? TT.tk.tachTuKhoa(q.tu).tu : null;
    const thamQuyen = coQuanVaiTro(t, "tham-quyen"), trucTiep = coQuanVaiTro(t, "truc-tiep"), phoiHop = coQuanVaiTro(t, "phoi-hop");
    const h = t.suyRa.thoiHan;
    const cungPL = mh.thuTuc.filter(x => x.phuLuc === t.phuLuc);
    const iCung = cungPL.indexOf(t);
    const truoc = cungPL[iCung - 1], sau = cungPL[iCung + 1];
    const dvc = mh.B.dichVuCong || {};

    let than = "";
    if (tab === "") {
      than = `<div class="luoi luoi-chinh"><div>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(so => theMuc(mh, t, so, { toSang: tu, sau: so === 3 ? hopQuyTacThoiHan(mh) : so === 7 ? hopPhi(mh, t) : "" })).join("")}</div>
        <aside class="muc-luc khong-in"><div class="the"><div class="the-dau"><h3>Mục lục thủ tục</h3></div><nav class="the-than" style="padding:8px">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(so => `<a href="#/thu-tuc/${t.ma}/${so}"><b>(${so})</b>${e(mh.TEN_MUC[so])}</a>`).join("")}</nav></div>
          ${hopNVTC(mh, t)}</aside></div>`;
    } else if (tab === "trinh-tu") {
      const b = t.buoc;
      than = `<div class="luoi luoi-chinh"><div class="the"><div class="the-dau"><h3>Trình tự thực hiện theo từng bước</h3><div class="phai">${tp.dauNguon.nv()} ${tp.chipCanCu({ loai: "muc", ma: t.ma, muc: 1 }, "Mục (1)")} ${tp.lkPdf(t.muc[1] && t.muc[1].trangDau)}</div></div>
        <div class="the-than">${b.chung.length ? tp.nguyenVan(b.chung.join("\n")) : ""}
        ${b.buoc.length ? `<ol class="dong-buoc">${b.buoc.map(x => `<li><div class="tron">${x.so}</div><div><h4>Bước ${x.so}${x.tieuDe ? ": " + e(x.tieuDe) : ""}</h4>
          ${x.coQuan.length ? `<div class="cq">${x.coQuan.map(tp.chipCoQuan).join("")} <span class="mo chu-nho" title="Cơ quan được nhận diện trong tiêu đề/câu đầu của bước">${tp.dauNguon.pm()}</span></div>` : ""}
          ${x.noiDung ? tp.nguyenVan(x.noiDung) : ""}</div></li>`).join("")}</ol>` : `<div class="thong-bao thong-bao-vang">${bt("canhBao")}Mục (1) không chia theo “Bước”. Xem nguyên văn đầy đủ dưới đây.</div>${tp.nguyenVan(t.muc[1] && t.muc[1].noiDung)}`}
        </div></div>
        <aside class="muc-luc">${hopNVTC(mh, t)}<div class="the"><div class="the-dau"><h3>Quy định chung về luân chuyển</h3></div><div class="the-than chu-nho" style="display:grid;gap:8px">
          <div>${tp.chipCanCu({ dieu: "4", khoan: "2" }, "Điều 4.2 — Quy trình tiếp nhận, luân chuyển")}</div>
          <div>${tp.chipCanCu({ dieu: "5" }, "Điều 5 — Luân chuyển hồ sơ điện tử, giấy")}</div>
          <div>${tp.chipCanCu({ dieu: "6" }, "Điều 6 — Giải quyết, yêu cầu bổ sung")}</div>
          <div>${tp.chipCanCu({ dieu: "7" }, "Điều 7 — Trả kết quả")}</div></div></div></aside></div>`;
    } else if (tab === "ho-so") {
      const g = t.suyRa.giayTo;
      let nhomTruoc = null;
      than = `<div class="luoi luoi-2" style="align-items:start">
        <div class="the"><div class="the-dau"><h3>Danh mục giấy tờ (tách từ mục 2)</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than">
          ${t.suyRa.soLuongHoSo ? `<p><b>Số lượng hồ sơ:</b> ${e(t.suyRa.soLuongHoSo)}</p>` : ""}
          <p class="chu-nho mo">Danh mục tách tự động theo các dòng gạch đầu dòng để dễ kiểm tra hồ sơ. Điều kiện “nếu có”, “đối với trường hợp…” giữ nguyên trong từng dòng. Luôn đối chiếu nguyên văn bên cạnh.</p>
          ${g.length ? `<ul class="ds-giay-to">${g.map(x => { const tieu = x.nhom !== nhomTruoc && x.nhom ? `</ul><div class="nhom-giay-to">${e(x.nhom)}</div><ul class="ds-giay-to">` : ""; nhomTruoc = x.nhom; return tieu + `<li class="${x.cap === 2 ? "c2" : ""}"><span class="o" aria-hidden="true"></span><span>${e(x.ten)}${x.mau.filter(k => mh.mauTheoKhoa[k]).map(k => ` <a class="nhan nhan-xanh" style="text-decoration:none" href="#/mau-bieu/${k}">Mẫu ${e(mh.mauTheoKhoa[k].kyHieu)}</a>`).join("")}</span></li>`; }).join("")}</ul>` : `<p class="mo">Không tách được danh mục — xem nguyên văn.</p>`}
        </div></div>
        ${theMuc(mh, t, 2)}</div>`;
    } else if (tab === "thoi-han") {
      than = `<div class="luoi luoi-2" style="align-items:start">${theMuc(mh, t, 3)}
        <div class="the"><div class="the-dau"><h3>Cách tính thời hạn theo Quy định</h3><div class="phai">${tp.dauNguon.nv()}</div></div><div class="the-than">${noiDungQuyTac(mh)}</div></div></div>`;
    } else if (tab === "co-quan") {
      const dong = (ds, ten) => `<dt>${ten}</dt><dd>${ds.length ? ds.map(tp.chipCoQuan).join(" ") : '<span class="mo">Không nêu trong mục (5)</span>'}</dd>`;
      than = `<div class="luoi luoi-2" style="align-items:start"><div style="display:grid;gap:16px">
        <div class="the"><div class="the-dau"><h3>Vai trò các cơ quan</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than">
          <dl class="dl-gon">${dong(thamQuyen, "Có thẩm quyền quyết định")}${dong(trucTiep, "Trực tiếp thực hiện")}${dong(phoiHop, "Phối hợp")}</dl>
          <p class="chu-nho mo" style="margin:12px 0 0">Nhận diện tự động từ các dòng “Cơ quan có thẩm quyền…”, “Cơ quan trực tiếp thực hiện…”, “Cơ quan phối hợp…” của mục (5).</p></div></div>
        <div class="the"><div class="the-dau"><h3>Công việc của từng cơ quan theo bước</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than khit"><table class="bang"><thead><tr><th>Bước</th><th>Nội dung (tiêu đề bước, nguyên văn)</th><th>Cơ quan nêu tên</th></tr></thead><tbody>
          ${t.buoc.buoc.map(b => `<tr><td class="ma">${b.so}</td><td>${e(b.tieuDe || "(không có tiêu đề)")}</td><td>${b.coQuan.map(tp.chipCoQuan).join(" ") || '<span class="mo">—</span>'}</td></tr>`).join("") || `<tr><td colspan="3" class="mo">Mục (1) không chia bước.</td></tr>`}
        </tbody></table></div></div></div>
        <div style="display:grid;gap:16px">${theMuc(mh, t, 5)}${theMuc(mh, t, 4)}</div></div>`;
    } else if (tab === "mau") {
      than = `<div class="luoi luoi-2" style="align-items:start"><div style="display:grid;gap:16px">
        <div class="the"><div class="the-dau"><h3>Mẫu thuộc Phụ lục V</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than khit">
          ${t.suyRa.mau.length ? `<table class="bang"><thead><tr><th>Ký hiệu</th><th>Tên mẫu</th><th class="so">Trang</th></tr></thead><tbody>${t.suyRa.mau.map(k => { const m = mh.mauTheoKhoa[k]; return `<tr><td class="ma"><a href="#/mau-bieu/${k}">Mẫu ${e(m.kyHieu)}</a></td><td>${e(m.ten)}</td><td class="so">${tp.lkPdf(m.trangDau)}</td></tr>`; }).join("")}</tbody></table>` : `<p class="the-than mo">Thủ tục không viện dẫn mẫu của Phụ lục V.</p>`}</div></div>
        ${t.suyRa.mauNgoai.length ? `<div class="the"><div class="the-dau"><h3>Mẫu của văn bản khác được viện dẫn</h3></div><div class="the-than"><p class="chu-nho mo" style="margin-top:0">Không có trong tài liệu nguồn; phần mềm chỉ ghi nhận tên mẫu (xem VD11).</p><ul style="margin:0;padding-left:18px">${t.suyRa.mauNgoai.map(x => `<li>${e(x.ma)}${x.vanBan ? ` — ${e(x.vanBan)}` : ""}</li>`).join("")}</ul></div></div>` : ""}
        ${t.suyRa.mauKhongTimThay.length ? `<div class="thong-bao thong-bao-vang">${bt("canhBao")}Thủ tục viện dẫn mẫu không có trong Phụ lục V: ${t.suyRa.mauKhongTimThay.map(e).join(", ")}.</div>` : ""}
        </div>${theMuc(mh, t, 8)}</div>`;
    } else if (tab === "can-cu") {
      than = canCuThuTuc(mh, t);
    }

    const html = `<div class="trang">
      ${tp.dauIn(`Phiếu tra cứu thủ tục ${t.ma}: ${t.ten}`)}
      <div class="duong-dan khong-in"><a href="#/thu-tuc">Thủ tục hành chính</a>${bt("mui", 12)}<a href="#/thu-tuc?pl=${t.phuLuc}">Phụ lục ${t.phuLuc}</a>${bt("mui", 12)}<span>Thủ tục ${t.stt}</span></div>
      <div class="tt-dau" style="margin-bottom:16px">
        <div class="tt-ma"><span class="nhan nhan-xanh">Mã ${t.ma}</span><span class="nhan nhan-xam">Phụ lục ${t.phuLuc} · ${e(t.capDai)}</span>${t.suyRa.coNghiaVuTaiChinh ? `<span class="nhan nhan-lam" title="Nội dung thủ tục có nêu nghĩa vụ tài chính">Có nội dung nghĩa vụ tài chính</span>` : ""}
          <span class="mo chu-nho">Nguồn: PL ${t.phuLuc} mục A STT ${t.stt} (tr.${t.trangDanhMuc}) · mục B tr.${t.trangDau}–${t.trangCuoi}</span>
          <span class="tang khong-in" style="margin-left:auto">${truoc ? `<a class="nut nut-nho" href="#/thu-tuc/${truoc.ma}${tab ? "/" + tab : ""}" title="${e(truoc.ten)}">← ${truoc.ma}</a>` : ""}${sau ? `<a class="nut nut-nho" href="#/thu-tuc/${sau.ma}${tab ? "/" + tab : ""}" title="${e(sau.ten)}">${sau.ma} →</a>` : ""}
          <button class="nut nut-nho" onclick="window.print()">${bt("in", 14)} In phiếu tra cứu</button></span></div>
        <h1 class="tt-ten">${e(t.ten)}</h1>
        ${!t.khopTen ? `<div class="thong-bao thong-bao-vang">${bt("canhBao")}<div><b>Tên tại nội dung chi tiết (mục B) khác tên tại danh mục (mục A):</b> “${e(t.tenNoiDung)}”. Phần mềm hiển thị tên theo danh mục; cần xác minh với cơ quan ban hành.</div></div>` : ""}
        <div class="tom-tat">
          <div><div class="k">Thời hạn giải quyết</div><div class="v">${h ? `${mh.hienThiHan(h)}${h.donVi === "ngày" ? "<small>Văn bản ghi “ngày”, không ghi “ngày làm việc”</small>" : ""}${h.nhieuTruongHop ? "<small>Có nhiều trường hợp — xem mục (3)</small>" : "<small>Theo mục (3)</small>"}` : "Xem nguyên văn mục (3)"}${h && h.tangThemKhuVucIII ? "<small>Xã khu vực III: được tăng thêm (mục 3)</small>" : ""}</div></div>
          <div><div class="k">Có thẩm quyền quyết định</div><div class="v">${thamQuyen.map(id => e(tp.tenCoQuan(id))).join("; ") || "Xem mục (5)"}</div></div>
          <div><div class="k">Trực tiếp thực hiện</div><div class="v">${trucTiep.map(id => e(tp.tenCoQuan(id))).join("; ") || "Xem mục (5)"}</div></div>
          <div><div class="k">Hồ sơ · Mẫu đơn</div><div class="v">${e(t.suyRa.soLuongHoSo || "Xem mục (2)")}<small>${t.suyRa.mau.length} mẫu Phụ lục V${t.suyRa.mauNgoai.length ? ` · ${t.suyRa.mauNgoai.length} mẫu văn bản khác` : ""}</small></div></div>
        </div>
        <div class="tt-hanh-dong khong-in">
          <a class="nut nut-chinh" href="#/phieu/${t.ma}">${bt("kiem", 15)} Phiếu hướng dẫn hồ sơ</a>
          <a class="nut" href="#/tinh-han?ma=${t.ma}">${bt("dongHo", 15)} Tính ngày hẹn trả</a>
          ${dvc.congQuocGia ? `<a class="nut" href="${e(dvc.congQuocGia)}" target="_blank" rel="noopener" title="${e(dvc.ghiChu || "")}">${bt("ngoai", 15)} Nộp trực tuyến (Cổng DVC)</a>` : ""}
          ${t.maQuocGia ? `<span class="ma-qg ${t.maQuocGia.mucDo}" title="${e(t.maQuocGia.ghiChu || dvc.nguonMa || "")}">Mã TTHC: <b>${e(t.maQuocGia.ma)}</b>${t.maQuocGia.mucDo === "goi-y" ? ` <span class="nhan nhan-vang">gợi ý — cần xác minh</span>` : ""}<button type="button" class="nut-xoa" data-chep="${e(t.maQuocGia.ma)}" aria-label="Sao chép mã ${e(t.maQuocGia.ma)}" title="Sao chép mã">${bt("tep", 13)}</button></span>` : `<span class="nhan nhan-xam" title="${e(dvc.nguonMa || "")}">Chưa có mã TTHC trong danh mục công bố</span>`}
        </div>
        <div class="chu-nho mo">${tp.dauNguon.pm()} Ô tóm tắt rút từ nguyên văn để đọc nhanh; nội dung pháp lý là phần nguyên văn bên dưới.</div>
      </div>
      <nav class="tab khong-in" aria-label="Nhóm thông tin">${TAB.map(x => `<a href="#/thu-tuc/${t.ma}${x.id ? "/" + x.id : ""}" class="${x.id === tab ? "chon" : ""}" ${x.id === tab ? 'aria-current="page"' : ""}>${e(x.ten)}</a>`).join("")}</nav>
      ${than}</div>`;
    return { tieuDe: `${t.ma} ${t.ten}`, html, cuonDen: soMuc ? "#muc-" + soMuc : null, giuCuon: true,
      sau(root) { const c = root.querySelector("[data-chep]"); if (c) c.addEventListener("click", () => { const v = c.getAttribute("data-chep"); (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => { c.title = "Đã sao chép"; c.classList.add("da-chep"); }, () => { }); }); } };
  }

  function noiDungQuyTac(mh) {
    return mh.B.quyTacThoiHan.map(r => { const cc = mh.giaiCanCu({ dieu: r.dieu, khoan: r.khoan }); return `<div style="margin-bottom:14px"><div class="tang" style="margin-bottom:4px"><b>${e(r.tieuDe)}</b> ${tp.chipCanCu({ dieu: r.dieu, khoan: r.khoan }, `Khoản ${r.khoan} Điều ${r.dieu}`)}</div>${cc ? tp.nguyenVan(cc.noiDung) : ""}</div>`; }).join("") +
      `<div class="thong-bao thong-bao-xanh">${bt("thongTin")}<div>Phần mềm không cộng dồn thời hạn của các cơ quan thành “tổng thời hạn” khi văn bản không quy định; các khoảng thời gian không tính vào thời hạn (khoản 1 Điều 8) phải được loại trừ theo từng hồ sơ cụ thể.</div></div>`;
  }
  function hopQuyTacThoiHan(mh) {
    return `<details class="khong-in" style="margin-top:10px"><summary class="chu-nho" style="cursor:pointer;font-weight:600">Cách tính thời hạn chung (Điều 8, Điều 6, Điều 7 Quy định)</summary><div style="margin-top:10px">${noiDungQuyTac(mh)}</div></details>`;
  }
  // Mức phí, lệ phí tại tỉnh (Nghị quyết HĐND) gắn với thủ tục — mục (7) của Quyết định chỉ dẫn chiếu Luật Phí và lệ phí
  function hopPhi(mh, t) {
    const P = mh.P; if (!P) return "";
    const loai = P.theoThuTuc[t.ma], td = P.thamDinh, lp = P.lePhi;
    const vnd = v => v.toLocaleString("vi-VN");
    const phiDM = t.maQuocGia && t.maQuocGia.phiDanhMuc;
    if (loai === "khong") return `<div class="hop-phi">${tp.dauNguon.pm()} <b>Mức thu tại tỉnh Sơn La:</b> danh mục TTHC công bố ghi “${e(phiDM || "Không quy định")}”. Đối chiếu ${e(P.vanBan.ten)} nếu hồ sơ phát sinh cấp, chỉnh lý Giấy chứng nhận. <a href="#/phi-le-phi">Xem phí, lệ phí đất đai</a></div>`;
    const bd = loai === "bien-dong", ld = loai === "lan-dau" || loai === "ca-hai";
    const dongLP = (bang, ids) => bang.filter(x => ids.includes(x.id)).map(x => `<tr><td>${e(x.noiDung)}</td><td class="so">${vnd(x.mucThu)}</td><td class="chu-nho">${e(x.donVi)}</td></tr>`).join("");
    const idsLP = loai === "trich-luc" ? ["trich-luc"] : [...(ld ? ["lan-dau", "qsdd-lan-dau"] : []), ...(bd || loai === "ca-hai" ? ["cap-moi-bien-dong", "qsdd-cap-moi-bien-dong", "chung-nhan-bien-dong"] : []), "trich-luc"];
    return `<details class="hop-phi" open><summary><b>Mức thu tại tỉnh Sơn La</b> — ${e(P.vanBan.ten)} ngày ${e(P.vanBan.ngay)} (hiệu lực ${e(P.vanBan.hieuLuc)}) ${tp.dauNguon.nv()}</summary>
      ${loai !== "trich-luc" ? `<div class="chu-nho" style="margin:8px 0 4px"><b>${e(td.ten)}</b> (${e(td.viTri)})${bd ? ` — hồ sơ cấp lại, cấp đổi, đăng ký biến động: <b>bằng ${td.tyLeBienDong}%</b> mức cấp lần đầu dưới đây` : ""}</div>
      <table class="bang bang-gon"><tbody>
        <tr><td>Cá nhân — sử dụng đất làm nhà ở</td><td class="so">${vnd(td.caNhanLanDau["nha-o"]["do-thi"])} (đô thị) · ${vnd(td.caNhanLanDau["nha-o"]["nong-thon"])} (nông thôn)</td><td class="chu-nho">Bộ hồ sơ</td></tr>
        <tr><td>Cá nhân — sử dụng đất kinh doanh</td><td class="so">${vnd(td.caNhanLanDau["kinh-doanh"]["do-thi"])} (đô thị) · ${vnd(td.caNhanLanDau["kinh-doanh"]["nong-thon"])} (nông thôn)</td><td class="chu-nho">Bộ hồ sơ</td></tr>
        <tr><td>Tổ chức — theo quy mô diện tích dự án</td><td class="so">${vnd(td.toChucLanDau[0][2])} – ${vnd(td.toChucLanDau[td.toChucLanDau.length - 1][2])}</td><td class="chu-nho">Bộ hồ sơ</td></tr></tbody></table>` : ""}
      <div class="chu-nho" style="margin:10px 0 4px"><b>${e(lp.ten)}</b> (${e(lp.viTri)}) — cá nhân tại phường; <b>cá nhân tại xã bằng ${lp.tyLeCaNhanXa}%</b></div>
      <table class="bang bang-gon"><tbody>${dongLP(lp.caNhanPhuong, idsLP)}</tbody></table>
      <div class="chu-nho" style="margin:10px 0 4px"><b>Tổ chức</b></div><table class="bang bang-gon"><tbody>${dongLP(lp.toChuc, idsLP)}</tbody></table>
      <div class="chu-nho mo" style="margin-top:8px">${tp.dauNguon.pm()} Khoản thu gợi ý theo loại hồ sơ (${e({ "lan-dau": "cấp lần đầu", "bien-dong": "cấp lại, cấp đổi, đăng ký biến động", "ca-hai": "cấp lần đầu hoặc biến động tùy trường hợp", "trich-luc": "chỉ phát sinh lệ phí trích lục" }[loai] || "chưa phân loại")}). Có các trường hợp miễn nộp — <a href="#/phi-le-phi">xem đầy đủ</a>.
        <a class="nut nut-nho khong-in" href="#/nghia-vu?phi=${t.ma}">${bt("dongHo", 13)} Tính phí, lệ phí cho hồ sơ</a></div>
      ${phiDM ? `<details class="chu-nho" style="margin-top:8px"><summary>Mức thu ghi tại danh mục TTHC công bố 21/8/2025 <span class="nhan nhan-do">theo Nghị quyết 135/2020 — đã hết hiệu lực</span></summary><div class="mo" style="white-space:pre-line;margin-top:6px">${e(phiDM)}</div></details>` : ""}
    </details>`;
  }

  function hopNVTC(mh, t) {
    if (!t.suyRa.coNghiaVuTaiChinh) return "";
    return `<div class="the"><div class="the-dau"><h3>Luân chuyển hồ sơ NVTC</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than chu-nho">
      <p style="margin-top:0">Thủ tục có nội dung xác định nghĩa vụ tài chính. Quy trình luân chuyển giữa các cơ quan được quy định tại Chương III; chọn quy trình đúng với trường hợp của hồ sơ:</p>
      <div style="display:grid;gap:6px">${mh.quyTrinh.map(q => `<a href="#/quy-trinh/${q.id}">${e(q.id.replace("QT", "Điều ").replace("-", " khoản "))}: ${e(q.ten)}</a>`).join("")}</div></div></div>`;
  }

  function canCuThuTuc(mh, t) {
    const vb = mh.B.vanBan;
    const vd = Object.values(mh.vanBanDanChieu).filter(v => v.viTri.some(x => x.khoa === "tt" + t.ma));
    const chung = [["3", "Nguyên tắc thực hiện"], ["4", "Tiếp nhận hồ sơ"], ["5", "Luân chuyển hồ sơ"], ["6", "Giải quyết thủ tục hành chính"], ["7", "Trả kết quả"], ["8", "Thời gian thực hiện thủ tục hành chính"], ["9", "Thu phí, lệ phí"]];
    return `<div class="luoi luoi-2" style="align-items:start"><div style="display:grid;gap:16px">
      <div class="the"><div class="the-dau"><h3>Căn cứ trực tiếp</h3></div><div class="the-than"><table class="bang"><thead><tr><th>Văn bản</th><th>Vị trí</th><th>Nội dung</th></tr></thead><tbody>
        <tr><td>${e(vb.loai)} ${e(vb.soKyHieu.giaTri)} ${mh.daDoiChieuBanKy ? "" : tp.dauNguon.cxm()}</td><td>${tp.chipCanCu({ dieu: t.dieuCanCu }, "Điều " + t.dieuCanCu + " Quy định")}</td><td>Trình tự thủ tục thuộc ${e(t.capDai.toLowerCase())} thực hiện theo Phụ lục ${t.phuLuc}.</td></tr>
        <tr><td>Quy định ban hành kèm Quyết định</td><td>Phụ lục ${t.phuLuc}, mục A STT ${t.stt}; mục B thủ tục ${t.stt}</td><td>Toàn bộ nội dung thủ tục ${tp.lkPdf(t.trangDau, "tr. " + t.trangDau + "–" + t.trangCuoi)}</td></tr>
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(so => t.muc[so] ? `<tr><td class="mo">—</td><td>${tp.chipCanCu({ loai: "muc", ma: t.ma, muc: so }, `Mục (${so})`)}</td><td>${e(mh.TEN_MUC[so])} ${tp.lkPdf(t.muc[so].trangDau)}</td></tr>` : "").join("")}
      </tbody></table><p class="chu-nho mo">Tình trạng hiệu lực: <b>${e(mh.hieuLuc.nhan.toLowerCase())}</b>. ${e(mh.hieuLuc.ghiChu)}${mh.daDoiChieuBanKy ? "" : " Tệp PDF nguồn chưa ghi số, ngày ban hành (VD01)."}</p></div></div>
      <div class="the"><div class="the-dau"><h3>Quy định chung áp dụng cho mọi thủ tục</h3></div><div class="the-than" style="display:grid;gap:6px">${chung.map(([d, ten]) => `<div class="tang">${tp.chipCanCu({ dieu: d }, "Điều " + d)} <span>${e(ten)}</span></div>`).join("")}</div></div></div>
      <div class="the"><div class="the-dau"><h3>Văn bản được viện dẫn trong nội dung thủ tục</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than">
        <p class="chu-nho mo" style="margin-top:0">Liệt kê tự động các văn bản có tên trong 9 mục của thủ tục. Hiệu lực lấy từ phần căn cứ ban hành và Điều 2 Quyết định; tài liệu nguồn không kèm toàn văn các văn bản này.</p>
        ${vd.length ? `<ul style="margin:0;padding-left:18px;display:grid;gap:4px">${vd.map(v => `<li><a href="#/can-cu?vb=${encodeURIComponent(v.ten)}">${e(v.ten)}</a> ${TT.nhanHieuLucVB ? TT.nhanHieuLucVB(v.hieuLuc) : ""}</li>`).join("")}</ul>` : `<p class="mo">Không có văn bản khác được nêu tên.</p>`}</div></div></div>`;
  }
})();
