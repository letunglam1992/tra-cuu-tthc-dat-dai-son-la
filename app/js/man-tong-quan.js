/* Màn hình: tổng quan, đối soát dữ liệu, giới thiệu – hướng dẫn. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;

  // Chuỗi hiệu lực ngắn dùng chung: "có hiệu lực từ 22/10/2026"
  function moTaHieuLuc(mh) {
    const vb = mh.B.vanBan, nhl = vb.ngayHieuLuc && vb.ngayHieuLuc.giaTri;
    return `${mh.hieuLuc.nhan.toLowerCase()}${nhl ? (mh.hieuLuc.ma === "chua-co-hieu-luc" ? " (có hiệu lực từ " + nhl + ")" : " từ ngày " + nhl) : ""}`;
  }
  TT.moTaHieuLuc = moTaHieuLuc;

  function theTinhHuong(mh, th) {
    const ds = (th.thuTuc || []).map(ma => mh.thuTucTheoMa[ma]).filter(Boolean);
    const lk = th.lienKet || (ds.length === 1 ? "#/thu-tuc/" + ds[0].ma : null);
    const dsHtml = ds.length > 1 ? `<ul class="th-ds">${ds.map(t => `<li><a href="#/thu-tuc/${t.ma}"><span class="ma">${t.ma}</span> ${e(t.ten.length > 64 ? t.ten.slice(0, 62).replace(/\s+\S*$/, "") + "…" : t.ten)}</a>${t.suyRa.thoiHan ? `<span class="th-han">${e(mh.hienThiHan(t.suyRa.thoiHan))}</span>` : ""}</li>`).join("")}</ul>` : "";
    const phu = ds.length === 1 ? `<div class="th-phu"><span class="ma">${ds[0].ma}</span>${ds[0].suyRa.thoiHan ? ` · ${e(mh.hienThiHan(ds[0].suyRa.thoiHan))}` : ""} · ${e(ds[0].cap)}</div>` : "";
    const dau = `<div class="th-dau"><span class="th-bt">${bt(th.bieuTuong || "tep", 18)}</span><div><div class="th-ten">${e(th.ten)}</div><div class="th-mo-ta">${e(th.moTa)}</div>${phu}</div></div>`;
    return lk ? `<a class="the the-th" href="${lk}">${dau}</a>` : `<div class="the the-th">${dau}${dsHtml}</div>`;
  }

  TT.man["tong-quan"] = function (ctx) {
    const { mh } = ctx;
    const tk = mh.thongKe, vb = mh.B.vanBan;
    const kt = TT.ketQuaKiemTra;
    const soLoi = kt.filter(k => k.mucDo === "loi").length, soCB = kt.filter(k => k.mucDo === "canh-bao").length;
    const duMuc = mh.thuTuc.filter(t => Object.keys(t.muc).length === 9).length;
    const coHan = mh.thuTuc.filter(t => t.suyRa.thoiHan).length;
    const vdCan = mh.vanDeNguon.filter(v => v.mucDo !== "thong-tin").length;
    const theCS = (nhan, giaTri, phu, mau, lk, chuThich) => `<a class="the the-chi-so" style="--tong:${mau}" href="${lk}"><div class="nhan-chi-so">${e(nhan)}</div><div class="gia-tri">${giaTri}${phu ? ` <small>${phu}</small>` : ""}</div><div class="chu-thich">${chuThich}</div></a>`;
    const goiY = ["tách thửa", "sổ đỏ bị mất", "chuyển nhượng", "lên thổ cư", "Mẫu 19", "III.6"];
    const hetHL = vb.vanBanHetHieuLuc || [];
    const html = `<div class="trang">
      <section class="hero">
        <div class="nhan-trang">Tỉnh Sơn La · ${e(vb.loai)} số ${e(vb.soKyHieu.giaTri)}</div>
        <h1>Tra cứu thủ tục hành chính về đất đai</h1>
        <p class="hero-mo-ta">${tk.thuTuc} thủ tục, ${tk.quyTrinh} quy trình luân chuyển hồ sơ xác định nghĩa vụ tài chính, ${tk.mauBieu} mẫu biểu — nguyên văn từ văn bản, có liên kết tới trang gốc.</p>
        <form class="hero-tim" id="hero-tim" role="search"><label class="sr" for="hero-o">Tìm thủ tục</label>${bt("tim", 18)}<input id="hero-o" type="search" placeholder="Bạn cần làm gì? Ví dụ: tách thửa, cấp đổi sổ, chuyển nhượng…" autocomplete="off"><button class="nut nut-chinh">Tìm</button></form>
        <div class="hero-goi-y"><span class="mo">Thử:</span>${goiY.map(g => `<a href="#/tra-cuu?q=${encodeURIComponent(g)}">${e(g)}</a>`).join("")}</div>
      </section>
      <div class="thong-bao ${mh.hieuLuc.ma === "co-hieu-luc" ? "thong-bao-xanh" : "thong-bao-vang"}">${bt(mh.hieuLuc.ma === "co-hieu-luc" ? "kiem" : "canhBao")}<div>
        <b>${e(mh.tenVanBan)}</b> — ${e(moTaHieuLuc(mh))}.
        ${hetHL.length ? `<span class="chu-nho">Hết hiệu lực: ${hetHL.map(x => `${e(x.ten.replace(/ ngày .*$/, ""))}${x.phamVi !== "Toàn bộ" ? " (" + e(x.phamVi) + ")" : ""}`).join("; ")}.</span>` : ""}
        <a href="#/can-cu">Xem căn cứ pháp lý</a>${TT.quanTri && vdCan ? ` · <a href="#/doi-soat?tab=van-de">${vdCan} nội dung văn bản cần xác minh</a>` : ""}</div></div>

      <div class="dong-muc"><h2>Bạn cần làm thủ tục gì?</h2><span class="chu-nho mo">${tp.dauNguon.pm()} Gợi ý theo nhu cầu — đọc mục (4) “Đối tượng thực hiện” để chọn đúng thủ tục.</span></div>
      <div class="luoi luoi-th">${(mh.B.tinhHuong || []).map(th => theTinhHuong(mh, th)).join("")}</div>

      <div class="dong-muc"><h2>Công cụ</h2></div>
      <div class="luoi luoi-3">
        <a class="the the-cong-cu" href="#/tinh-han"><span class="th-bt">${bt("dongHo", 20)}</span><div><div class="th-ten">Tính thời hạn giải quyết</div><div class="th-mo-ta">Nhập ngày nhận hồ sơ hợp lệ → ngày hẹn trả kết quả, trừ ngày nghỉ, cộng thời gian xã khu vực III.</div></div></a>
        <a class="the the-cong-cu" href="#/phieu"><span class="th-bt">${bt("kiem", 20)}</span><div><div class="th-ten">Phiếu hướng dẫn hồ sơ</div><div class="th-mo-ta">Danh mục giấy tờ có ô đánh dấu, in 1 trang A4 kèm mã QR — đưa cho người dân chuẩn bị hồ sơ.</div></div></a>
        <a class="the the-cong-cu" href="#/quy-trinh"><span class="th-bt">${bt("luong", 20)}</span><div><div class="th-ten">Sơ đồ luân chuyển hồ sơ NVTC</div><div class="th-mo-ta">Ai làm gì, trong bao lâu, giữa cơ quan đất đai, thuế, kho bạc (Điều 15–18).</div></div></a>
      </div>

      <div class="dong-muc"><h2>Nội dung văn bản</h2></div>
      <div class="luoi luoi-4">
        ${theCS("Thủ tục hành chính", tk.thuTuc, "", "var(--chinh)", "#/thu-tuc", `PL I: ${tk.theoPhuLuc.I} · PL II: ${tk.theoPhuLuc.II} · PL III: ${tk.theoPhuLuc.III}`)}
        ${theCS("Quy trình luân chuyển NVTC", tk.quyTrinh, `/ ${tk.buocQuyTrinh} bước`, "var(--lam-to)", "#/quy-trinh", "Chương III, Điều 15–18 — sơ đồ theo cơ quan")}
        ${theCS("Mẫu biểu Phụ lục V", tk.mauBieu, "", "var(--xanh-duong-to)", "#/mau-bieu", "Xem, tải Word, mở trang PDF gốc")}
        ${theCS("Trình tự thu hồi, BT-HT-TĐC", tk.phuLucIV, `/ ${tk.khoanPLIV} khoản`, "var(--vang-to)", "#/thu-hoi", "Phụ lục IV — nguyên văn từng khoản")}
      </div>
      <div class="dong-muc"><h2>Tra cứu theo cấp giải quyết</h2></div>
      <div class="luoi luoi-3">${mh.PL.map(p => `<a class="the the-muc" href="#/thu-tuc?pl=${p.so}"><div class="tang"><span class="nhan nhan-xanh">Phụ lục ${p.so}</span><span class="nhan nhan-xam">${tk.theoPhuLuc[p.so]} thủ tục</span></div><div class="tieu">${e(p.capDai)}</div><div class="mo-ta">${mh.thuTuc.filter(t => t.phuLuc === p.so).slice(0, 3).map(t => "· " + e(t.ten.length > 80 ? t.ten.slice(0, 78) + "…" : t.ten)).join("<br>")}</div></a>`).join("")}</div>

      ${TT.quanTri ? `<div class="dong-muc"><h2>Mức độ hoàn thiện dữ liệu</h2><span class="nhan nhan-vang">Chế độ kiểm soát dữ liệu</span></div>
      <div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Nội dung</th><th class="so">Kết quả</th><th>Ghi chú</th></tr></thead><tbody>
        <tr><td data-nhan="Nội dung">Thủ tục có đủ 9 mục</td><td class="so" data-nhan="Kết quả"><b>${duMuc}/${tk.thuTuc}</b></td><td data-nhan="Ghi chú" class="chu-nho">Đối chiếu số thủ tục giữa danh mục (mục A) và nội dung (mục B): khớp.</td></tr>
        <tr><td data-nhan="Nội dung">Thủ tục tách được các bước trình tự</td><td class="so" data-nhan="Kết quả"><b>${mh.thuTuc.filter(t => t.buoc.buoc.length).length}/${tk.thuTuc}</b></td><td data-nhan="Ghi chú" class="chu-nho">${tk.buoc} bước theo “Bước n” trong mục (1).</td></tr>
        <tr><td data-nhan="Nội dung">Thủ tục nhận diện được số ngày</td><td class="so" data-nhan="Kết quả"><b>${coHan}/${tk.thuTuc}</b></td><td data-nhan="Ghi chú" class="chu-nho">${mh.thuTuc.filter(t => t.suyRa.thoiHan && t.suyRa.thoiHan.donVi === "ngày").length} thủ tục ghi “ngày”, còn lại ghi “ngày làm việc”.</td></tr>
        <tr><td data-nhan="Nội dung">Kiểm tra tự động dữ liệu</td><td class="so" data-nhan="Kết quả">${soLoi ? `<span class="nhan nhan-do">${soLoi} lỗi</span>` : `<span class="nhan nhan-xanh">0 lỗi</span>`} ${soCB ? `<span class="nhan nhan-vang">${soCB} cảnh báo</span>` : ""}</td><td data-nhan="Ghi chú" class="chu-nho"><a href="#/doi-soat">Xem chi tiết kiểm tra và bảng đối soát</a></td></tr>
      </tbody></table></div></div>` : ""}

      <details class="the pham-vi"><summary>Phạm vi phần mềm: làm gì, không làm gì</summary><div class="luoi luoi-2" style="padding:0 16px 16px">
        <div class="chu-nho"><b>Phần mềm làm</b><ul>
          <li>Tra cứu trình tự, thành phần hồ sơ, thời hạn, cơ quan, kết quả, phí, mẫu, điều kiện của ${tk.thuTuc} thủ tục — nguyên văn.</li>
          <li>Thể hiện quy trình luân chuyển hồ sơ NVTC giữa các cơ quan bằng sơ đồ, kèm thời hạn và căn cứ từng bước.</li>
          <li>Tính ngày hẹn trả (tham khảo), in phiếu hướng dẫn hồ sơ, tải mẫu Word, xuất CSV.</li></ul></div>
        <div class="chu-nho"><b>Phần mềm không làm</b><ul>
          <li>Không tiếp nhận hồ sơ chính thức, không theo dõi hồ sơ đang giải quyết thực tế.</li>
          <li>Không kết nối VBDLIS, Hệ thống thông tin giải quyết TTHC, Cổng dịch vụ công hay cơ quan thuế.</li>
          <li>Không thay thế văn bản gốc khi giải quyết hồ sơ; không cộng dồn thời hạn khi văn bản không quy định tổng thời hạn.</li></ul></div>
      </div></details>
      </div>`;
    return { tieuDe: "Tổng quan", html,
      sau(root) {
        const f = root.querySelector("#hero-tim");
        f.addEventListener("submit", ev => { ev.preventDefault(); const v = f.querySelector("input").value.trim(); if (v) location.hash = "#/tra-cuu?q=" + encodeURIComponent(v); });
      } };
  };

  // ---------- Đối soát dữ liệu ----------
  TT.man["doi-soat"] = function (ctx) {
    const { mh, q } = ctx;
    const tab = q.tab || "";
    const kt = TT.ketQuaKiemTra;
    let than = "";
    if (tab === "") {
      const nhomKQ = { loi: kt.filter(k => k.mucDo === "loi"), "canh-bao": kt.filter(k => k.mucDo === "canh-bao"), dat: kt.filter(k => k.mucDo === "dat") };
      than = `<div class="luoi luoi-3" style="margin-bottom:16px">
        <div class="the the-chi-so" style="--tong:var(--do-to)"><div class="nhan-chi-so">Lỗi dữ liệu</div><div class="gia-tri">${nhomKQ.loi.length}</div><div class="chu-thich">Thiếu dữ liệu, liên kết hỏng, nguyên văn không khớp</div></div>
        <div class="the the-chi-so" style="--tong:var(--vang-to)"><div class="nhan-chi-so">Cảnh báo</div><div class="gia-tri">${nhomKQ["canh-bao"].length}</div><div class="chu-thich">Bất thường cần xem lại (thường do văn bản nguồn)</div></div>
        <div class="the the-chi-so" style="--tong:var(--xanh-to)"><div class="nhan-chi-so">Kiểm tra đạt</div><div class="gia-tri">${nhomKQ.dat.length}</div><div class="chu-thich">Các phép kiểm tra tổng hợp đã đạt</div></div></div>
        <div class="the"><div class="the-dau"><h3>Kết quả kiểm tra tự động (chạy mỗi lần mở phần mềm)</h3></div><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Mức</th><th>Nhóm</th><th>Nội dung</th><th>Vị trí</th></tr></thead><tbody>
        ${[...nhomKQ.loi, ...nhomKQ["canh-bao"], ...nhomKQ.dat].map(k => `<tr><td data-nhan="Mức">${tp.nhanMucDo(k.mucDo)}</td><td data-nhan="Nhóm" class="chu-nho">${e(k.nhom)}</td><td data-nhan="Nội dung">${e(k.noiDung)}</td><td data-nhan="Vị trí" class="chu-nho">${k.viTri && k.viTri.startsWith("#") ? `<a href="${k.viTri}">Mở</a>` : e(k.viTri || "")}</td></tr>`).join("")}
        </tbody></table></div></div>`;
    } else if (tab === "bang") {
      const rows = mh.bangDoiSoat();
      const nhom = [...new Set(rows.map(r => r.nhom))];
      const loc = rows.filter(r => (!q.nhom || r.nhom === q.nhom) && (!q.kq || r.ketQua === q.kq));
      than = `<div class="the"><form class="thanh-loc" id="loc-ds"><input type="hidden" name="tab" value="bang">
        <select name="nhom" aria-label="Nhóm"><option value="">Mọi nhóm nội dung</option>${nhom.map(n => `<option ${q.nhom === n ? "selected" : ""}>${e(n)}</option>`).join("")}</select>
        <select name="kq" aria-label="Kết quả"><option value="">Mọi kết quả</option>${["Đạt", "Cần xác minh", "Lỗi"].map(n => `<option ${q.kq === n ? "selected" : ""}>${n}</option>`).join("")}</select>
        <span class="chu-nho mo" style="margin-left:auto">${loc.length}/${rows.length} dòng</span></form>
        <div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th class="so">#</th><th>Nhóm</th><th>Nội dung nguồn</th><th>Vị trí trong văn bản</th><th>Dữ liệu đã cấu trúc</th><th>Hiển thị</th><th>Kết quả</th><th>Ghi chú</th></tr></thead><tbody>
        ${loc.map(r => `<tr><td class="so" data-nhan="#">${r.stt}</td><td data-nhan="Nhóm" class="chu-nho">${e(r.nhom)}</td><td data-nhan="Nguồn">${e(r.nguon.length > 220 ? r.nguon.slice(0, 218) + "…" : r.nguon)}</td>
          <td data-nhan="Vị trí" class="chu-nho">${e(r.viTriNguon)}${r.trang ? "<br>" + tp.lkPdf(r.trang) : ""}</td><td data-nhan="Dữ liệu" class="chu-nho">${e(r.duLieu)}</td><td data-nhan="Hiển thị"><a href="${r.hienThi}">Mở</a></td>
          <td data-nhan="Kết quả">${tp.nhanKetQua(r.ketQua)}</td><td data-nhan="Ghi chú" class="chu-nho">${e(r.ghiChu)}</td></tr>`).join("")}
        </tbody></table></div></div>`;
    } else if (tab === "van-de") {
      than = `<div class="the"><div class="the-dau"><h3>Vấn đề phát hiện trong văn bản nguồn</h3><div class="phai chu-nho mo">Phần mềm giữ nguyên văn bản, không tự sửa; các mục dưới đây cần cơ quan ban hành/chuyên môn xác minh.</div></div>
        <div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Mã</th><th>Mức độ</th><th>Vị trí</th><th>Mô tả</th></tr></thead><tbody>
        ${mh.vanDeNguon.map(v => `<tr><td class="ma" data-nhan="Mã">${e(v.ma)}</td><td data-nhan="Mức độ">${tp.nhanMucDo(v.mucDo)}</td><td data-nhan="Vị trí" class="chu-nho">${e(v.viTri)}${v.trang ? "<br>" + tp.lkPdf(v.trang) : ""}${v.thuTuc ? `<br><a href="#/thu-tuc/${v.thuTuc}">Mở thủ tục</a>` : ""}</td><td data-nhan="Mô tả">${e(v.moTa)}</td></tr>`).join("")}
        </tbody></table></div></div>`;
    } else if (tab === "phien-ban") {
      const tt = mh.N.thongTinTrichXuat;
      than = `<div class="luoi luoi-2" style="align-items:start"><div class="the"><div class="the-dau"><h3>Phiên bản bộ dữ liệu</h3></div><div class="the-than"><dl class="dl-gon">
          <dt>Phiên bản</dt><dd>${e(mh.B.phienBanDuLieu)}</dd><dt>Tệp nguồn</dt><dd>${e(tt.tepNguon)} (${tt.soTrang} trang)</dd>
          <dt>SHA-256 tệp nguồn</dt><dd style="word-break:break-all">${e(tt.sha256)}</dd><dt>Ngày trích xuất</dt><dd>${e(TT.fmtNgay(tt.ngayTrichXuat))}</dd><dt>Công cụ</dt><dd>${e(tt.congCu)}</dd></dl>
          <div class="nhan-muc">Lịch sử cập nhật</div>${mh.B.lichSu.map(l => `<div style="margin-bottom:8px"><b>v${e(l.phienBan)}</b> · ${e(l.ngay)}<div class="chu-nho">${e(l.noiDung)}</div></div>`).join("")}</div></div>
        <div class="the"><div class="the-dau"><h3>Cập nhật khi văn bản sửa đổi, bổ sung, thay thế</h3></div><div class="the-than chu-nho"><ol style="margin:0;padding-left:18px;display:grid;gap:6px">
          <li>Đặt tệp PDF văn bản mới vào <code>app/tai-nguyen/qd75.pdf</code> (hoặc chỉ định đường dẫn).</li>
          <li>Chạy <code>cong-cu/cap-nhat-du-lieu.ps1</code> để trích xuất lại <code>app/du-lieu/nguon.js</code>; đọc cảnh báo trích xuất.</li>
          <li>Rà soát <code>app/du-lieu/bo-sung.js</code>: thông tin văn bản, vấn đề nguồn, quy trình Chương III; tăng số phiên bản và ghi lịch sử.</li>
          <li>Mở <code>kiem-thu.html</code>: mọi đoạn nguyên văn của quy trình phải khớp văn bản mới; sửa đến khi không còn lỗi.</li>
          <li>Kiểm tra màn hình Đối soát dữ liệu trước khi đưa vào sử dụng.</li></ol>
          <p>Phần mềm không có chức năng sửa dữ liệu trực tiếp trên giao diện (chưa có cơ chế phân quyền, xác thực); mọi thay đổi đi qua tệp dữ liệu và bộ kiểm thử.</p></div></div></div>`;
    }
    const html = `<div class="trang">${tp.dauIn("Đối soát dữ liệu nghiệp vụ với văn bản nguồn")}
      ${TT.quanTri ? "" : `<div class="thong-bao thong-bao-vang khong-in">${bt("thongTin")}<div>Màn hình dành cho người biên soạn, quản trị dữ liệu. <button type="button" class="nut nut-nho" onclick="TT.datQuanTri(true)">Bật chế độ kiểm soát dữ liệu</button></div></div>`}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Kiểm soát dữ liệu</div><h1>Đối soát dữ liệu với văn bản nguồn</h1>
        <div class="mo-ta">Kiểm tra tính đầy đủ, nhất quán của dữ liệu đã cấu trúc so với Quyết định và các phụ lục; ghi nhận các nội dung cần xác minh.</div></div>
        <div class="phai khong-in"><button class="nut" id="xuat-ds">${bt("taiXuong", 15)} Xuất bảng đối soát (CSV)</button><button class="nut" id="xuat-json">${bt("taiXuong", 15)} Xuất dữ liệu (JSON)</button><button class="nut" onclick="window.print()">${bt("in", 15)} In</button></div></div>
      <nav class="tab khong-in">${[["", "Kiểm tra tự động"], ["bang", "Bảng đối soát"], ["van-de", "Vấn đề văn bản nguồn"], ["phien-ban", "Phiên bản & cập nhật"]].map(([id, ten]) => `<a href="#/doi-soat${id ? "?tab=" + id : ""}" class="${tab === id ? "chon" : ""}">${ten}</a>`).join("")}</nav>
      ${than}</div>`;
    return { tieuDe: "Đối soát dữ liệu", html, giuCuon: true,
      sau(root) {
        const f = root.querySelector("#loc-ds");
        if (f) f.addEventListener("change", () => { const p = new URLSearchParams(); for (const [k, v] of new FormData(f).entries()) if (v) p.set(k, v); location.hash = "#/doi-soat?" + p.toString(); });
        root.querySelector("#xuat-ds").addEventListener("click", () => tp.xuatCsv("bang-doi-soat.csv", ["STT", "Nhóm", "Nội dung nguồn", "Vị trí trong văn bản", "Trang PDF", "Dữ liệu đã cấu trúc", "Vị trí hiển thị", "Kết quả kiểm tra", "Ghi chú / cần xác minh"], mh.bangDoiSoat().map(r => [r.stt, r.nhom, r.nguon, r.viTriNguon, r.trang || "", r.duLieu, r.hienThi, r.ketQua, r.ghiChu])));
        root.querySelector("#xuat-json").addEventListener("click", () => tp.xuatJson("du-lieu-tthc-dat-dai.json", {
          ghiChu: "Dữ liệu chuẩn hóa từ văn bản nguồn; trường 'suyRa' là chỉ mục do phần mềm lập, không phải nội dung pháp lý.", phienBan: mh.B.phienBanDuLieu, vanBan: mh.B.vanBan, thongTinTrichXuat: mh.N.thongTinTrichXuat,
          thuTuc: mh.thuTuc.map(t => ({ ma: t.ma, phuLuc: t.phuLuc, stt: t.stt, ten: t.ten, tenNoiDung: t.tenNoiDung, trang: [t.trangDau, t.trangCuoi], muc: t.muc, buoc: t.buoc, suyRa: t.suyRa })),
          quyTrinh: mh.B.quyTrinh, coQuan: mh.B.coQuan.map(({ re, ...c }) => c), dieu: mh.dieu, phuLucIV: mh.phuLucIV, mauBieu: mh.mauBieu, vanDeNguon: mh.vanDeNguon }));
      } };
  };

  // ---------- Giới thiệu ----------
  TT.man["gioi-thieu"] = function (ctx) {
    const { mh } = ctx;
    const html = `<div class="trang"><div class="dong-tieu-de"><div><div class="nhan-trang">Giới thiệu, hướng dẫn</div><h1>Cách sử dụng phần mềm tra cứu</h1></div></div>
      <div class="luoi luoi-2" style="align-items:start"><div style="display:grid;gap:16px">
        <div class="the"><div class="the-dau"><h3>Cách đọc nhãn nội dung</h3></div><div class="the-than"><dl class="dl-gon">
          <dt>${tp.dauNguon.nv()}</dt><dd>Trích nguyên văn từ văn bản nguồn — là nội dung có giá trị tra cứu pháp lý (đối chiếu trang PDF khi sử dụng chính thức).</dd>
          <dt>${tp.dauNguon.dg()}</dt><dd>Tên ngắn do phần mềm đặt cho bước, quy trình để dễ đọc trên sơ đồ — không thay thế nguyên văn.</dd>
          <dt>${tp.dauNguon.pm()}</dt><dd>Chỉ mục, tóm tắt, phân loại do phần mềm tự lập từ nguyên văn (cơ quan, số ngày, danh mục giấy tờ…) — có thể chưa đầy đủ.</dd>
          <dt>${tp.dauNguon.cxm()}</dt><dd>Thông tin chưa đối chiếu được trên văn bản (ví dụ số hiệu, ngày ban hành văn bản).</dd></dl></div></div>
        <div class="the"><div class="the-dau"><h3>Tra cứu nhanh</h3></div><div class="the-than chu-nho"><ul style="margin:0;padding-left:18px;display:grid;gap:4px">
          <li>Nhấn phím <b>/</b> ở bất kỳ màn hình nào để tìm kiếm. Gõ có dấu hoặc không dấu đều được.</li>
          <li>Nhiều từ khóa: kết quả phải chứa đủ các từ; đặt cụm trong ngoặc kép (“…”) để tìm đúng cụm.</li>
          <li>Bấm chip ${bt("canCan", 12)} để mở nguyên văn căn cứ ngay tại chỗ; bấm ${bt("pdf", 12)} để mở đúng trang PDF gốc.</li>
          <li>Trong thủ tục, “Mẫu số …” được gạch chân là liên kết tới mẫu tại Phụ lục V.</li>
          <li>Sơ đồ quy trình: kéo để di chuyển, cuộn chuột để phóng to, bấm vào một bước để xem chi tiết. Trên điện thoại, quy trình hiện dạng danh sách bước.</li>
          <li>Gõ cách gọi thông dụng (sổ đỏ, lên thổ cư, NVTC, QSDĐ…): phần mềm hiểu và ghi rõ “đã hiểu là…”.</li></ul></div></div></div>
        <div style="display:grid;gap:16px">
          <div class="the"><div class="the-dau"><h3>Phạm vi dữ liệu</h3></div><div class="the-than chu-nho">
            <p style="margin-top:0">Dữ liệu được trích xuất và chuẩn hóa từ tệp PDF “${e(mh.N.thongTinTrichXuat.tepNguon)}” (${mh.N.thongTinTrichXuat.soTrang} trang) gồm Quyết định, Quy định (24 điều) và Phụ lục I–V. Phần mềm không bổ sung thủ tục, thời hạn, biểu mẫu hay căn cứ nằm ngoài tài liệu này.</p>
            <p>Đây là phần mềm <b>tra cứu quy định và quy trình nghiệp vụ</b>, không phải hệ thống quản lý hồ sơ đang giải quyết; không có chức năng tiếp nhận hồ sơ chính thức hoặc liên thông dữ liệu với cơ quan nhà nước.</p>
            <p style="margin-bottom:0">Không gửi dữ liệu ra ngoài. Sau lần mở đầu tiên, phần mềm tiếp tục chạy khi mất mạng (bộ nhớ đệm trình duyệt); có thể cài như ứng dụng trên máy tính, điện thoại.</p></div></div>
          <div class="the"><div class="the-dau"><h3>Tác giả, bản quyền</h3><div class="phai"><button type="button" class="nut nut-nho" data-ban-quyen>Xem chi tiết</button></div></div><div class="the-than chu-nho">
            <b>© ${e(TT.THONG_TIN_PM.namBanQuyen)} ${e(TT.THONG_TIN_PM.tacGia)}</b> – ${e(TT.THONG_TIN_PM.donVi)}. Điện thoại: ${e(TT.THONG_TIN_PM.dienThoai)}.<br>${e(TT.THONG_TIN_PM.loiBanQuyen)}</div></div>
          <div class="the"><div class="the-dau"><h3>Chế độ kiểm soát dữ liệu</h3><div class="phai"><span class="nhan ${TT.quanTri ? "nhan-vang" : "nhan-xam"}">${TT.quanTri ? "Đang bật" : "Đang tắt"}</span></div></div><div class="the-than chu-nho">
            Dành cho người biên soạn, quản trị: hiện màn hình Đối soát dữ liệu, các vấn đề văn bản nguồn cần xác minh, mức độ hoàn thiện dữ liệu. Người tra cứu thông thường không cần bật.
            <div style="margin-top:8px"><button type="button" class="nut nut-nho" onclick="TT.datQuanTri(${!TT.quanTri})">${TT.quanTri ? "Tắt chế độ kiểm soát" : "Bật chế độ kiểm soát"}</button></div></div></div>
          <div class="the"><div class="the-dau"><h3>Ghi nhận</h3></div><div class="the-than chu-nho">Hệ thống thiết kế (màu sắc, phông chữ, bố cục thanh bên – đầu trang, hình nền núi) kế thừa từ phần mềm GPMB Sơn La. Phông chữ Be Vietnam Pro theo giấy phép SIL Open Font License 1.1 (tai-nguyen/fonts/OFL.txt).</div></div>
        </div></div></div>`;
    return { tieuDe: "Giới thiệu, hướng dẫn", html };
  };
})();
