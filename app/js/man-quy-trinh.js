/* Màn hình: quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính (Chương III) và trình tự thu hồi đất, BT-HT-TĐC (Phụ lục IV). */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;
  const TEN_LOAI = { batdau: "Bắt đầu", buoc: "Bước xử lý", nhanh: "Xử lý ngoại lệ", ketthuc: "Kết thúc" };
  const TEN_CANH = { "chinh": "Luồng chính", "dieu-kien": "Theo điều kiện", "tra-lai": "Trả lại / yêu cầu bổ sung", "dong-thoi": "Gửi đồng thời" };

  function hanVanBan(b) {
    if (!b.thoiHan) return '<span class="mo">—</span>';
    const h = b.thoiHan;
    return `${h.ngay != null ? `<b>${String(h.ngay).replace(".", ",")} ngày làm việc</b>` : `<b>${e(h.nguyenVan || "Không quy định")}</b>`}${h.nguyenVan && h.ngay != null ? `<div class="chu-nho mo">“${e(h.nguyenVan)}”</div>` : ""}${h.ghiChu ? `<div class="chu-nho mo">${e(h.ghiChu)}</div>` : ""}`;
  }

  function chiTietBuoc(mh, qt, b) {
    if (!b) return `<div class="the-than mo">Chọn một bước trên sơ đồ để xem chi tiết: cơ quan chủ trì, nguyên văn, thời hạn, đầu vào, đầu ra và căn cứ.</div>`;
    const vao = qt.canh.filter(c => c.den === b.id), ra = qt.canh.filter(c => c.tu === b.id);
    const tenBuoc = id => qt.buocTheoId[id].ten;
    const ds = a => a && a.length ? `<ul>${a.map(x => `<li>${e(x)}</li>`).join("")}</ul>` : '<span class="mo">Văn bản không nêu</span>';
    return `<div class="the-dau"><div style="min-width:0"><div class="nhan-trang">${e(TEN_LOAI[b.loai])} · chi tiết công đoạn</div><h3>${e(b.ten)} ${tp.dauNguon.dg()}</h3></div>
        <div class="phai khong-in"><button type="button" class="nut nut-nho" data-ve-so-do>↑ Về sơ đồ</button></div></div>
      <div class="the-than hai-cot"><div><dl>
        <dt>Chủ thể thực hiện</dt><dd>${tp.chipCoQuan(b.lane)}${b.phoiHop ? ` <span class="chu-nho mo">phối hợp:</span> ${b.phoiHop.map(tp.chipCoQuan).join(" ")}` : ""}</dd>
        <dt>Căn cứ</dt><dd>${tp.chipCanCu({ dieu: b.canCu.dieu, khoan: b.canCu.khoan }, `Khoản ${b.canCu.khoan} Điều ${b.canCu.dieu}`)} ${tp.lkPdf((mh.dieuTheoSo[b.canCu.dieu] || {}).trangDau)}</dd>
        <dt>Thời hạn</dt><dd>${hanVanBan(b)}${b.thoiHan && b.thoiHan.moc ? `<div class="chu-nho">Mốc tính: ${e(b.thoiHan.moc)}</div>` : ""}</dd>
        ${b.dieuKien ? `<dt>Điều kiện áp dụng</dt><dd>${e(b.dieuKien)}</dd>` : ""}
        ${b.dauVao ? `<dt>Hồ sơ đầu vào</dt><dd>${ds(b.dauVao)}</dd>` : ""}
        ${b.dauRa ? `<dt>Kết quả đầu ra</dt><dd>${ds(b.dauRa)}</dd>` : ""}
        ${b.mau ? `<dt>Mẫu liên quan</dt><dd>${b.mau.map(k => { const m = mh.mauTheoKhoa[ti.chuanKyHieu(k)]; return m ? `<a href="#/mau-bieu/${m.khoa}">Mẫu số ${e(m.kyHieu)}</a> <span class="chu-nho mo">${e(m.ten)}</span>` : e(k); }).join("<br>")}</dd>` : ""}
        <dt>Nhận từ</dt><dd>${vao.length ? vao.map(c => `<a href="#/quy-trinh/${qt.id}/${c.tu}">${e(tenBuoc(c.tu))}</a> <span class="chu-nho mo">(${e(TEN_CANH[c.loai])}${c.nhan ? ": " + e(c.nhan) : ""})</span>`).join("<br>") : '<span class="mo">Điểm bắt đầu</span>'}</dd>
        <dt>Chuyển tiếp</dt><dd>${ra.length ? ra.map(c => `<a href="#/quy-trinh/${qt.id}/${c.den}">${e(tenBuoc(c.den))}</a> <span class="chu-nho mo">(${e(TEN_CANH[c.loai])}${c.nhan ? ": " + e(c.nhan) : ""})</span>`).join("<br>") : '<span class="mo">Kết thúc quy trình</span>'}</dd>
      </dl></div><div>
      ${b.nguyenVan ? `<div class="khoi-nv"><div class="khoi-nv-dau">${tp.dauNguon.nv()} Khoản ${e(b.canCu.khoan)} Điều ${e(b.canCu.dieu)} Quy định</div>${tp.nguyenVan(b.nguyenVan)}</div>` : `<p class="chu-nho mo" style="margin-top:0">Nút ${b.loai === "batdau" ? "bắt đầu" : "kết thúc"} do phần mềm thể hiện để hoàn chỉnh sơ đồ; không có câu nguyên văn riêng.</p>`}
      ${b.ghiChuPhanMem ? `<div class="thong-bao thong-bao-xanh" style="margin-top:12px">${bt("thongTin")}<div>${tp.dauNguon.pm()} ${e(b.ghiChuPhanMem)}</div></div>` : ""}
      ${(b.vanDe || []).map(v => { const x = mh.vanDeNguon.find(y => y.ma === v); return x ? `<div class="thong-bao thong-bao-vang" style="margin-top:12px">${bt("canhBao")}<div><b>${e(x.ma)} — cần xác minh:</b> ${e(x.moTa)}</div></div>` : ""; }).join("")}
      </div></div>`;
  }

  TT.man["quy-trinh"] = function (ctx) {
    const { mh, thamSo } = ctx;
    if (thamSo[0] && !mh.quyTrinhTheoId[thamSo[0]]) return { tieuDe: "Không tìm thấy quy trình", html: `<div class="trang"><div class="the trong"><h1 class="sr">Không tìm thấy quy trình</h1><b>Không có quy trình mã “${e(thamSo[0])}”.</b><a href="#/quy-trinh">Về danh sách quy trình luân chuyển</a></div></div>` };
    const qt = mh.quyTrinhTheoId[thamSo[0]] || mh.quyTrinh[0];
    const b = thamSo[1] ? qt.buocTheoId[thamSo[1]] : null;
    const d = mh.dieuTheoSo[qt.dieu];
    const buocXuLy = qt.buoc.filter(x => x.loai === "buoc" || x.loai === "nhanh");
    const html = `<div class="trang">
      ${tp.dauIn(`Quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính — ${qt.ten}`)}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Chương III · Quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính về đất đai</div>
        <h1>${e(qt.ten)}</h1>
        <div class="mo-ta">${tp.dauNguon.dg()} ${e(qt.dienGiai)}</div></div>
        <div class="phai khong-in"><button class="nut" id="xuat-qt">${bt("taiXuong", 15)} Xuất CSV</button><button class="nut" onclick="window.print()">${bt("in", 15)} In quy trình</button></div></div>
      <div class="ds-qt khong-in" role="tablist" aria-label="Chọn quy trình">${mh.quyTrinh.map(x => `<a class="nut ${x.id === qt.id ? "chon" : ""}" role="tab" aria-selected="${x.id === qt.id}" href="#/quy-trinh/${x.id}" title="${e(x.ten)}"><b>${x.khoan ? `Điều ${x.dieu} k.${x.khoan}` : `Điều ${x.dieu}`}</b><span class="ds-qt-ten"> · ${e(x.ten.length > 46 ? x.ten.slice(0, 44) + "…" : x.ten)}</span></a>`).join("")}</div>
      <div class="khoi-nv" style="margin-bottom:12px"><div class="khoi-nv-dau">${tp.dauNguon.nv()} Tên Điều ${e(qt.dieu)} Quy định ${tp.chipCanCu({ dieu: qt.dieu }, "Xem toàn văn Điều " + qt.dieu)} ${tp.lkPdf(d && d.trangDau)}</div><div style="font-weight:600">Điều ${e(qt.dieu)}. ${e(d ? d.tieuDe : "")}</div></div>
      <div class="thong-bao thong-bao-xanh">${bt("thongTin")}<div>Thời hạn ghi trên từng bước là thời hạn văn bản quy định cho cơ quan thực hiện bước đó. <b>Văn bản không quy định tổng thời hạn cho quy trình luân chuyển; phần mềm không cộng dồn.</b>
        Việc luân chuyển hồ sơ xác định NVTC thực hiện qua phần mềm VBDLIS ${tp.chipCanCu({ dieu: "5", khoan: "3" }, "Khoản 3 Điều 5")}; thời gian thực hiện nghĩa vụ tài chính của người sử dụng đất không tính vào thời gian giải quyết thủ tục ${tp.chipCanCu({ dieu: "8", khoan: "1" }, "Khoản 1 Điều 8")}.</div></div>
      <div class="qt-che-do khong-in"><button type="button" class="nut nut-nho" data-che-do="ds">${bt("danhSach", 14)} Danh sách bước</button><button type="button" class="nut nut-nho" data-che-do="so-do">${bt("luong", 14)} Sơ đồ theo cơ quan</button></div>
      <ol class="qt-dong" id="qt-dong" aria-label="Các bước theo trình tự">${qt.buoc.slice().sort((a, c) => a.hang - c.hang || qt.lanes.indexOf(a.lane) - qt.lanes.indexOf(c.lane)).map(x => {
        const ra = qt.canh.filter(c => c.tu === x.id);
        return `<li class="qt-dong-buoc loai-${x.loai}"><a href="#/quy-trinh/${qt.id}/${x.id}" data-chon-buoc="${x.id}"><span class="qt-cq">${e(tp.tenCoQuan(x.lane))}</span><span class="qt-ten">${e(x.ten)}</span>
          <span class="qt-han">${x.thoiHan ? (x.thoiHan.ngay != null ? `${String(x.thoiHan.ngay).replace(".", ",")} ngày làm việc` : "Không quy định thời hạn") : TEN_LOAI[x.loai]}</span></a>
          ${ra.length ? `<div class="qt-ra">${ra.map(c => `<span class="qt-canh ${c.loai}">→ ${e(qt.buocTheoId[c.den].ten.length > 48 ? qt.buocTheoId[c.den].ten.slice(0, 46) + "…" : qt.buocTheoId[c.den].ten)}${c.nhan ? ` <i>(${e(c.nhan)})</i>` : ""}</span>`).join("")}</div>` : ""}</li>`; }).join("")}</ol>
      <div class="so-do-khung">
        <div class="so-do" id="so-do"><div class="so-do-cong-cu khong-in"><button class="nut nut-nho" id="sd-to" title="Phóng to" aria-label="Phóng to">${bt("phongTo", 15)}</button><button class="nut nut-nho" id="sd-nho" title="Thu nhỏ" aria-label="Thu nhỏ">${bt("thuNho", 15)}</button><button class="nut nut-nho" id="sd-vua" title="Xem toàn bộ sơ đồ" aria-label="Xem toàn bộ sơ đồ">${bt("vuaKhung", 15)}</button></div>
          <div id="sd-ve" style="height:100%"></div>
          <div class="chu-giai" aria-hidden="true">${Object.entries(TEN_CANH).map(([k, v]) => `<span><i class="${k}"></i>${v}</span>`).join("")}<span class="mo khong-in">Bấm một bước để xem chi tiết · kéo để di chuyển · Ctrl + cuộn chuột hoặc nút ± để phóng to</span></div></div>
        <div class="the chi-tiet-buoc" id="chi-tiet" aria-live="polite">${chiTietBuoc(mh, qt, b)}</div>
      </div>
      <div class="nhan-muc">Bảng các bước (${buocXuLy.length} bước xử lý)</div>
      <div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>#</th><th>Chủ thể thực hiện</th><th>Công việc</th><th>Thời hạn</th><th>Kết quả đầu ra</th><th>Căn cứ</th></tr></thead><tbody>
        ${qt.buoc.map((x, i) => `<tr class="co-the-chon" data-buoc="${x.id}"><td data-nhan="Loại" class="chu-nho">${e(TEN_LOAI[x.loai])}</td><td data-nhan="Chủ thể">${e(tp.tenCoQuan(x.lane))}</td>
          <td data-nhan="Công việc"><a href="#/quy-trinh/${qt.id}/${x.id}" style="font-weight:600">${e(x.ten)}</a>${x.dieuKien ? `<div class="chu-nho mo">${e(x.dieuKien)}</div>` : ""}</td>
          <td data-nhan="Thời hạn">${hanVanBan(x)}</td><td data-nhan="Đầu ra" class="chu-nho">${(x.dauRa || []).map(e).join("<br>") || '<span class="mo">—</span>'}</td>
          <td data-nhan="Căn cứ">${tp.chipCanCu({ dieu: x.canCu.dieu, khoan: x.canCu.khoan }, `K.${x.canCu.khoan} Đ.${x.canCu.dieu}`)}</td></tr>`).join("")}
      </tbody></table></div></div>
      ${qt.ghiChu.length ? `<div class="nhan-muc">Ghi chú theo văn bản</div>${qt.ghiChu.map(g => `<div class="khoi-nv" style="margin-bottom:8px"><div class="khoi-nv-dau">${tp.dauNguon.nv()} ${tp.chipCanCu({ dieu: g.canCu.dieu, khoan: g.canCu.khoan }, `Khoản ${g.canCu.khoan} Điều ${g.canCu.dieu}`)}</div>${tp.nguyenVan(g.nguyenVan, { lienKetMau: false })}</div>`).join("")}` : ""}
    </div>`;
    return {
      tieuDe: qt.ten, html, giuCuon: true,
      sau(root) {
        const ct = root.querySelector("#chi-tiet");
        // Điện thoại: mặc định danh sách bước; máy tính: sơ đồ. Người dùng có thể đổi.
        const trang = root.querySelector(".trang");
        const datCheDo = m => { trang.setAttribute("data-qt", m); root.querySelectorAll("[data-che-do]").forEach(n => n.setAttribute("aria-pressed", n.getAttribute("data-che-do") === m)); };
        let cheDo = null; try { cheDo = sessionStorage.getItem("tthc-qt-che-do"); } catch (_) { }
        datCheDo(cheDo || (matchMedia("(max-width: 700px)").matches ? "ds" : "so-do"));
        root.querySelectorAll("[data-che-do]").forEach(n => n.addEventListener("click", () => { const m = n.getAttribute("data-che-do"); try { sessionStorage.setItem("tthc-qt-che-do", m); } catch (_) { } datCheDo(m); if (m === "so-do") dk.vuaKhung(); }));
        root.querySelectorAll("[data-chon-buoc]").forEach(a => a.addEventListener("click", ev => { ev.preventDefault(); dk.chon(a.getAttribute("data-chon-buoc")); ct.scrollIntoView({ block: "start" }); }));
        let lanDau = true;
        const dk = TT.soDo.ve(root.querySelector("#sd-ve"), qt, mh, { khiChon: id => {
          history.replaceState(null, "", `#/quy-trinh/${qt.id}/${id}`);
          ct.innerHTML = chiTietBuoc(mh, qt, qt.buocTheoId[id]);
          if (!lanDau) ct.scrollIntoView({ block: "nearest" });
        } });
        ct.addEventListener("click", ev => { if (ev.target.closest("[data-ve-so-do]")) root.querySelector("#so-do").scrollIntoView({ block: "start" }); });
        if (b) dk.chon(b.id);
        lanDau = false;
        root.querySelector("#sd-to").addEventListener("click", dk.phongTo);
        root.querySelector("#sd-nho").addEventListener("click", dk.thuNho);
        root.querySelector("#sd-vua").addEventListener("click", dk.vuaKhung);
        root.querySelectorAll("tr[data-buoc]").forEach(tr => tr.addEventListener("click", ev => { if (ev.target.closest("a,button")) return; dk.chon(tr.getAttribute("data-buoc")); root.querySelector("#so-do").scrollIntoView({ block: "nearest" }); }));
        root.querySelector("#xuat-qt").addEventListener("click", () => tp.xuatCsv(`quy-trinh-${qt.id}.csv`, ["Mã bước", "Loại", "Chủ thể thực hiện", "Công việc (diễn giải)", "Thời hạn (số ngày làm việc)", "Thời hạn (nguyên văn)", "Mốc tính", "Ghi chú thời hạn", "Đầu vào", "Đầu ra", "Căn cứ", "Nguyên văn"],
          qt.buoc.map(x => [x.id, TEN_LOAI[x.loai], tp.tenCoQuan(x.lane), x.ten, x.thoiHan && x.thoiHan.ngay != null ? x.thoiHan.ngay : "", x.thoiHan && x.thoiHan.nguyenVan || "", x.thoiHan && x.thoiHan.moc || "", x.thoiHan && x.thoiHan.ghiChu || "", (x.dauVao || []).join("; "), (x.dauRa || []).join("; "), `Khoản ${x.canCu.khoan} Điều ${x.canCu.dieu}`, x.nguyenVan || ""])));
      }
    };
  };

  // ---------- Phụ lục IV ----------
  TT.man["thu-hoi"] = function (ctx) {
    const { mh, thamSo } = ctx;
    const m = mh.phuLucIV.find(x => x.so === thamSo[0]);
    if (!m) {
      const html = `<div class="trang">${tp.dauIn("Trình tự, thủ tục thu hồi, bồi thường, hỗ trợ, tái định cư")}
        <div class="dong-tieu-de"><div><div class="nhan-trang">Phụ lục IV</div><h1>Thu hồi đất, bồi thường, hỗ trợ, tái định cư</h1>
          <div class="mo-ta">${e(mh.N.phuLucIV.tieuDe)}. ${mh.phuLucIV.length} trình tự, ${mh.thongKe.khoanPLIV} khoản nguyên văn. Căn cứ: ${tp.chipCanCu({ dieu: "13" }, "Điều 13 Quy định")}</div></div></div>
        <div class="luoi luoi-2">${mh.phuLucIV.map(x => `<a class="the the-muc" href="#/thu-hoi/${x.so}"><div class="tang"><span class="nhan nhan-xanh">Mục ${x.so}</span><span class="nhan nhan-xam">${x.khoan.length} khoản</span><span class="mo chu-nho">tr. ${x.trangDau}–${x.trangCuoi}</span></div>
          <div class="tieu">${e(x.tieuDe)}</div></a>`).join("")}</div></div>`;
      return { tieuDe: "Thu hồi đất, bồi thường, hỗ trợ, tái định cư", html };
    }
    const khoanChon = thamSo[1];
    const html = `<div class="trang">${tp.dauIn(`Phụ lục IV mục ${m.so}: ${m.tieuDe}`)}
      <div class="duong-dan khong-in"><a href="#/thu-hoi">Thu hồi, bồi thường, TĐC</a>${bt("mui", 12)}<span>Mục ${m.so}</span></div>
      <div class="dong-tieu-de"><div><div class="nhan-trang">Phụ lục IV · Mục ${m.so}</div><h1 style="max-width:110ch">${e(m.tieuDe)}</h1>
        <div class="mo-ta tang">${tp.dauNguon.nv()} ${tp.chipCanCu({ loai: "pl4", muc: m.so }, "Toàn văn mục " + m.so)} ${tp.chipCanCu({ dieu: "13" }, "Điều 13 Quy định")} ${tp.lkPdf(m.trangDau, "Tr. " + m.trangDau + "–" + m.trangCuoi)}</div></div>
        <div class="phai khong-in"><button class="nut" onclick="window.print()">${bt("in", 15)} In</button></div></div>
      <div class="ds-qt khong-in">${mh.phuLucIV.map(x => `<a class="nut nut-nho ${x.so === m.so ? "chon" : ""}" href="#/thu-hoi/${x.so}">Mục ${x.so}</a>`).join("")}</div>
      <div class="thong-bao thong-bao-xanh">${bt("thongTin")}<div>Mỗi khoản là một bước theo thứ tự văn bản. Thời hạn và cơ quan dưới mỗi khoản ${tp.dauNguon.pm()} do phần mềm nhận diện từ nguyên văn để đọc nhanh; nội dung pháp lý là phần nguyên văn. Đơn vị thời hạn giữ đúng văn bản (“ngày” hoặc “ngày làm việc”).</div></div>
      <div class="the"><div class="the-than"><ol class="dong-buoc">${m.khoan.map(k => `<li id="khoan-${k.so}"><div class="tron ${khoanChon === k.so ? "" : "phu"}">${k.so}</div><div>
        <div class="tang" style="margin:8px 0 6px">${k.thoiHan ? `<span class="nhan nhan-vang" title="Cụm thời hạn nêu đầu tiên trong khoản (phần mềm nhận diện) — khoản có thể có nhiều thời hạn, xem nguyên văn">${bt("dongHo", 12)} ${e(k.thoiHan)}</span>` : ""}${k.coQuan.map(tp.chipCoQuan).join(" ")}${k.mau.filter(x => mh.mauTheoKhoa[x]).map(x => `<a class="nhan nhan-xanh" style="text-decoration:none" href="#/mau-bieu/${x}">Mẫu ${e(mh.mauTheoKhoa[x].kyHieu)}</a>`).join("")}
          ${tp.chipCanCu({ loai: "pl4", muc: m.so, khoan: k.so }, `Khoản ${k.so}`)} ${tp.lkPdf(k.trangDau)}</div>
        ${tp.nguyenVan(k.noiDung)}</div></li>`).join("")}</ol></div></div></div>`;
    return { tieuDe: "Phụ lục IV mục " + m.so, html, cuonDen: khoanChon ? "#khoan-" + khoanChon : null };
  };
})();
