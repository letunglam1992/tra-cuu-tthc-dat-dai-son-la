/* Màn hình: tra cứu nhanh, hồ sơ và mẫu biểu, cơ quan và trách nhiệm, căn cứ pháp lý. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;

  // ---------- Tra cứu nhanh ----------
  TT.man["tra-cuu"] = function (ctx) {
    const { tk, q } = ctx;
    const kq = q.q ? tk.tim(q.q) : null;
    const nhom = {};
    if (kq) for (const r of kq.ketQua) (nhom[r.nhom] = nhom[r.nhom] || []).push(r);
    const loaiChon = q.loai || "";
    const LOAI = [["", "Tất cả"], ["thu-tuc", "Thủ tục"], ["buoc-qt", "Bước luân chuyển NVTC"], ["mau", "Mẫu biểu"], ["dieu", "Điều khoản"], ["pl4", "Thu hồi, BT-HT-TĐC"], ["co-quan", "Cơ quan"], ["phi", "Phí, lệ phí"], ["van-ban", "Văn bản viện dẫn"]];
    const ds = kq ? kq.ketQua.filter(r => !loaiChon || r.loai === loaiChon) : [];
    const html = `<div class="trang">
      <div class="dong-tieu-de"><div><div class="nhan-trang">Tra cứu nhanh</div><h1>Tìm trong toàn bộ dữ liệu</h1>
        <div class="mo-ta">Tìm theo tên thủ tục, nội dung, cơ quan, mẫu đơn, điều khoản, thời hạn, công đoạn luân chuyển. Gõ không dấu thì tìm không dấu; gõ có dấu thì tìm đúng dấu. Hiểu cả cách gọi thông dụng (sổ đỏ, lên thổ cư, NVTC, QSDĐ…). Đặt cụm trong ngoặc kép để tìm chính xác cụm; gõ mã (III.3) hoặc “mẫu 19” để mở nhanh.</div></div></div>
      <form class="the thanh-loc" id="form-tc" style="border-radius:var(--r-lg);margin-bottom:14px"><div class="o-tim">${bt("tim", 16)}<input type="search" name="q" value="${e(q.q || "")}" placeholder="Ví dụ: tach thua; “phiếu chuyển thông tin”; 15 ngày làm việc; Mẫu số 18" aria-label="Từ khóa"></div><button class="nut nut-chinh">Tìm</button></form>
      ${!kq ? `<div class="the trong"><b>Nhập từ khóa để tra cứu.</b>Gợi ý thử: <a href="#/tra-cuu?q=t%C3%A1ch%20th%E1%BB%ADa">tách thửa</a> · <a href="#/tra-cuu?q=phieu%20chuyen%20thong%20tin">phieu chuyen thong tin</a> · <a href="#/tra-cuu?q=Kho%20b%E1%BA%A1c">Kho bạc</a> · <a href="#/tra-cuu?q=gia%20h%E1%BA%A1n%20s%E1%BB%AD%20d%E1%BB%A5ng%20%C4%91%E1%BA%A5t">gia hạn sử dụng đất</a></div>`
      : `${giaiThich(kq, q.q)}<div class="ds-qt">${LOAI.map(([id, ten]) => { const n = id ? kq.ketQua.filter(r => r.loai === id).length : kq.ketQua.length; return `<a class="nut nut-nho ${id === loaiChon ? "chon" : ""}" href="#/tra-cuu?q=${encodeURIComponent(q.q)}${id ? "&loai=" + id : ""}">${e(ten)} <span class="mo">${n}</span></a>`; }).join("")}</div>
        ${ds.length ? `<div class="the"><ul class="ket-qua-tim">${ds.slice(0, 200).map(r => `<li><a class="tieu" href="${r.lienKetTruong && r.loai === "thu-tuc" ? r.lienKetTruong + "?tu=" + encodeURIComponent(q.q) : r.lienKet}">${ti.toSang(r.tieuDe, kq.tu)}</a>
            <div class="phu"><span class="nhan nhan-xam" style="padding:0 7px">${e(r.nhom)}</span> ${e(r.phu)}</div>
            ${r.trich ? `<div class="trich"><span class="mo chu-nho">${e(r.truongTrich)}:</span> ${ti.toSang(r.trich, kq.tu)}</div>` : ""}</li>`).join("")}</ul>
            ${ds.length > 200 ? `<div class="ket-loc">Hiển thị 200/${ds.length} kết quả đầu tiên — hãy thêm từ khóa để thu hẹp.</div>` : ""}</div>`
        : `<div class="the trong"><b>Không tìm thấy kết quả cho “${e(q.q)}”${loaiChon ? " trong nhóm đã chọn" : ""}.</b>Phần mềm chỉ trả kết quả chứa đủ mọi từ khóa trong dữ liệu chuẩn hóa từ văn bản nguồn.
          ${kq.goiY.length ? `<div class="goi-y-bo">${kq.goiY.map(g => `<a class="nut nut-nho" href="#/tra-cuu?q=${encodeURIComponent(g.q)}">Bỏ “${e(g.bo)}”: ${g.soKetQua} kết quả</a>`).join("")}</div>` : "Thử bớt từ khóa hoặc kiểm tra chính tả."}</div>`}`}
    </div>`;
    return { tieuDe: q.q ? "Tra cứu: " + q.q : "Tra cứu nhanh", html,
      sau(root) {
        const f = root.querySelector("#form-tc");
        f.addEventListener("submit", ev => { ev.preventDefault(); const v = f.q.value.trim(); location.hash = "#/tra-cuu" + (v ? "?q=" + encodeURIComponent(v) : ""); });
        if (!q.q) f.q.focus();
      } };
  };

  // Giải thích cách phần mềm hiểu câu tìm (đồng nghĩa, sửa chính tả, nới dấu)
  function giaiThich(kq, q) {
    const g = kq.giaiThich || {}, ds = [];
    for (const x of g.dongNghia || []) ds.push(`“${e(x.tu)}” → <b>${e(x.thanh)}</b>`);
    for (const x of g.suaChinhTa || []) ds.push(`“${e(x.tu)}” → <b>${e(x.thanh)}</b> (sửa gần đúng)`);
    if (g.noiDau) ds.push("không tìm thấy đúng dấu, đã tìm không dấu");
    return ds.length ? `<div class="giai-thich-tim">${tp.dauNguon.pm()} Đã hiểu là: ${ds.join("; ")}. <a href="#/tra-cuu?q=${encodeURIComponent('"' + q.replace(/"/g, "") + '"')}">Tìm đúng nguyên cụm</a></div>` : "";
  }
  TT.giaiThichTim = giaiThich;

  // ---------- Hồ sơ và mẫu biểu ----------
  TT.man["mau-bieu"] = function (ctx) {
    const { mh, thamSo, q } = ctx;
    if (thamSo[0]) return chiTietMau(mh, thamSo[0]);
    const tab = q.tab || "";
    let than = "";
    if (tab === "") {
      const loc = q.q ? ti.chuanHoa(q.q) : "";
      const ds = mh.mauBieu.filter(m => !loc || ti.chuanHoa(`Mẫu số ${m.kyHieu} ${m.ten}`).includes(loc));
      than = `<div class="the"><form class="thanh-loc" id="loc-mau"><div class="o-tim">${bt("tim", 16)}<input type="search" name="q" value="${e(q.q || "")}" placeholder="Lọc theo ký hiệu hoặc tên mẫu" aria-label="Lọc mẫu"></div><input type="hidden" name="tab" value=""></form>
        <div class="ket-loc"><b>${ds.length}</b>/${mh.mauBieu.length} mẫu · ${tp.dauNguon.nv()} tên mẫu theo tiêu đề tại nội dung Phụ lục V</div>
        <div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Ký hiệu</th><th>Tên mẫu</th><th>Thủ tục sử dụng</th><th>Trong danh mục PL V</th><th class="so">Trang PDF</th><th class="so">Tải về</th></tr></thead><tbody>
        ${ds.map(m => `<tr class="co-the-chon" data-href="#/mau-bieu/${m.khoa}"><td class="ma" data-nhan="Ký hiệu">Mẫu ${e(m.kyHieu)}</td><td data-nhan="Tên mẫu"><a class="ten-tt" href="#/mau-bieu/${m.khoa}">${e(m.ten)}</a></td>
          <td data-nhan="Thủ tục" class="chu-nho">${m.thuTuc.length ? m.thuTuc.slice(0, 6).map(x => `<a href="#/thu-tuc/${x}">${x}</a>`).join(", ") + (m.thuTuc.length > 6 ? ` và ${m.thuTuc.length - 6} thủ tục khác` : "") : (m.quyTrinh.length || m.phuLucIV.length ? '<span class="mo">Dùng trong quy trình/PL IV</span>' : '<span class="mo">Không có thủ tục viện dẫn</span>')}</td>
          <td data-nhan="Danh mục">${m.coTrongDanhMuc ? '<span class="nhan nhan-xanh">Có</span>' : '<span class="nhan nhan-vang" title="Xem VD04">Không có</span>'}</td>
          <td class="so" data-nhan="Trang">${tp.lkPdf(m.trangDau, m.trangDau + (m.trangCuoi !== m.trangDau ? "–" + m.trangCuoi : ""))}</td>
          <td class="so" data-nhan="Tải về"><button type="button" class="nut nut-nho" data-word-mau="${e(m.khoa)}" title="Tải Mẫu số ${e(m.kyHieu)} dạng Word (.docx)">${bt("taiXuong", 13)} Word</button> <a class="nut nut-nho" href="#/dien-mau/${e(m.khoa)}" title="Điền Mẫu số ${e(m.kyHieu)} rồi tải Word">Điền</a></td></tr>`).join("") || `<tr><td colspan="6" class="trong">Không có mẫu phù hợp.</td></tr>`}
        </tbody></table></div></div>
        <div class="nhan-muc">Mẫu của văn bản khác được viện dẫn (không có trong tài liệu nguồn)</div>
        <div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Mẫu</th><th>Văn bản ban hành</th><th>Thủ tục viện dẫn</th></tr></thead><tbody>
          ${Object.values(mh.mauNgoai).sort((a, b) => b.thuTuc.length - a.thuTuc.length).map(x => `<tr><td data-nhan="Mẫu"><b>${e(x.ma)}</b></td><td data-nhan="Văn bản">${e(x.vanBan || "Không nêu cụ thể")}</td><td data-nhan="Thủ tục" class="chu-nho">${[...new Set(x.thuTuc)].map(m => `<a href="#/thu-tuc/${m}">${m}</a>`).join(", ")}</td></tr>`).join("")}
        </tbody></table></div><div class="ket-loc">${tp.dauNguon.pm()} Nhận diện tự động theo ký hiệu dạng “Mẫu số 02/TK-SDDPNN”. Phần mềm không cung cấp tệp các mẫu này (VD11).</div></div>`;
    } else {
      // Danh mục giấy tờ trong thành phần hồ sơ (mục 2) của mọi thủ tục
      const loc = q.q ? ti.chuanHoa(q.q) : "";
      const tat = [];
      for (const t of mh.thuTuc) for (const g of t.suyRa.giayTo) tat.push({ t, g });
      const ds = tat.filter(x => !loc || ti.chuanHoa(x.g.ten + " " + x.g.nhom).includes(loc));
      const gioiHan = +q.n || 150;
      than = `<div class="the"><form class="thanh-loc" id="loc-mau"><div class="o-tim">${bt("tim", 16)}<input type="search" name="q" value="${e(q.q || "")}" placeholder="Tìm giấy tờ: ví dụ “trích lục”, “giấy chứng nhận đã cấp”, “văn bản đại diện”" aria-label="Lọc giấy tờ"></div><input type="hidden" name="tab" value="giay-to"></form>
        <div class="ket-loc"><b>${ds.length}</b> dòng giấy tờ trong ${new Set(ds.map(x => x.t.ma)).size} thủ tục · ${tp.dauNguon.pm()} tách tự động từ mục (2) — đối chiếu nguyên văn trong thủ tục</div>
        <div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Thủ tục</th><th>Giấy tờ (nguyên văn dòng)</th><th>Trường hợp / nhóm</th></tr></thead><tbody>
        ${ds.slice(0, gioiHan).map(x => `<tr><td class="ma" data-nhan="Thủ tục"><a href="#/thu-tuc/${x.t.ma}/ho-so" title="${e(x.t.ten)}">${x.t.ma}</a></td><td data-nhan="Giấy tờ">${loc ? ti.toSang(x.g.ten, [loc]) : e(x.g.ten)}</td><td data-nhan="Nhóm" class="chu-nho mo">${e(x.g.nhom || "—")}</td></tr>`).join("") || `<tr><td colspan="3" class="trong">Không có giấy tờ phù hợp.</td></tr>`}
        </tbody></table></div>${ds.length > gioiHan ? `<div class="ket-loc">Đang hiển thị ${gioiHan}/${ds.length}. <a href="#/mau-bieu?tab=giay-to${q.q ? "&q=" + encodeURIComponent(q.q) : ""}&n=${gioiHan + 300}">Hiển thị thêm</a></div>` : ""}</div>`;
    }
    const html = `<div class="trang">${tp.dauIn("Hồ sơ và mẫu biểu")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Thành phần hồ sơ và biểu mẫu</div><h1>Hồ sơ và mẫu biểu</h1>
        <div class="mo-ta">${mh.mauBieu.length} mẫu đơn, tờ khai, quyết định, phiếu tại Phụ lục V và danh mục giấy tờ trong thành phần hồ sơ của ${mh.thuTuc.length} thủ tục. Mẫu chính thức để in: dùng trang PDF gốc.</div></div>
        <div class="phai khong-in"><button class="nut" id="xuat-mau">${bt("taiXuong", 15)} Xuất CSV</button></div></div>
      <nav class="tab khong-in"><a href="#/mau-bieu" class="${tab === "" ? "chon" : ""}">Mẫu biểu Phụ lục V</a><a href="#/mau-bieu?tab=giay-to" class="${tab === "giay-to" ? "chon" : ""}">Giấy tờ trong thành phần hồ sơ</a></nav>
      ${than}</div>`;
    return { tieuDe: "Hồ sơ và mẫu biểu", html, giuCuon: true,
      sau(root) {
        const f = root.querySelector("#loc-mau");
        let hen;
        const ap = () => { const v = f.q.value.trim(); const t = f.tab.value; location.hash = "#/mau-bieu?" + [t ? "tab=" + t : "", v ? "q=" + encodeURIComponent(v) : ""].filter(Boolean).join("&"); setTimeout(() => { const o = document.querySelector("#loc-mau input[name=q]"); if (o) { o.focus(); o.setSelectionRange(o.value.length, o.value.length); } }, 0); };
        f.addEventListener("submit", ev => { ev.preventDefault(); ap(); });
        f.q.addEventListener("input", () => { clearTimeout(hen); hen = setTimeout(ap, 450); });
        root.querySelectorAll("tr[data-href]").forEach(tr => tr.addEventListener("click", ev => { if (!ev.target.closest("a")) location.hash = tr.getAttribute("data-href"); }));
        root.querySelector("#xuat-mau").addEventListener("click", () => {
          if (tab === "giay-to") {
            const ds = []; for (const t of mh.thuTuc) for (const g of t.suyRa.giayTo) ds.push([t.ma, t.ten, g.nhom, g.ten, g.mau.join(", ")]);
            tp.xuatCsv("giay-to-thanh-phan-ho-so.csv", ["Mã thủ tục", "Tên thủ tục", "Trường hợp/nhóm", "Giấy tờ (nguyên văn dòng)", "Mẫu PL V nêu trong dòng"], ds);
          } else tp.xuatCsv("danh-muc-mau-bieu.csv", ["Ký hiệu", "Tên mẫu", "Trang PDF", "Có trong danh mục PL V", "Thủ tục viện dẫn"], mh.mauBieu.map(m => [m.kyHieu, m.ten, `${m.trangDau}-${m.trangCuoi}`, m.coTrongDanhMuc ? "Có" : "Không", m.thuTuc.join(", ")]));
        });
      } };
  };

  function chiTietMau(mh, khoa) {
    const m = mh.mauTheoKhoa[ti.chuanKyHieu(khoa)];
    if (!m) return { tieuDe: "Không tìm thấy mẫu", html: `<div class="trang"><div class="the trong"><b>Không có Mẫu số “${e(khoa)}” trong Phụ lục V.</b><a href="#/mau-bieu">Về danh mục mẫu biểu</a></div></div>` };
    const i = mh.mauBieu.indexOf(m), truoc = mh.mauBieu[i - 1], sau = mh.mauBieu[i + 1];
    const html = `<div class="trang">${tp.dauIn(`Mẫu số ${m.kyHieu}. ${m.ten} (nội dung trích xuất)`)}
      <div class="duong-dan khong-in"><a href="#/mau-bieu">Hồ sơ và mẫu biểu</a>${bt("mui", 12)}<span>Mẫu số ${e(m.kyHieu)}</span></div>
      <div class="dong-tieu-de"><div><div class="nhan-trang">Phụ lục V · Mẫu số ${e(m.kyHieu)}</div><h1 style="max-width:100ch">${e(m.ten)}</h1>
        <div class="mo-ta tang">${m.coTrongDanhMuc ? `<span class="nhan nhan-xanh">Có trong danh mục Phụ lục V</span>` : `<span class="nhan nhan-vang">Không có trong danh mục Phụ lục V (VD04)</span>`} <span>Trang ${m.trangDau}${m.trangCuoi !== m.trangDau ? "–" + m.trangCuoi : ""} tệp PDF nguồn</span></div></div>
        <div class="phai khong-in">${truoc ? `<a class="nut nut-nho" href="#/mau-bieu/${truoc.khoa}">← Mẫu ${e(truoc.kyHieu)}</a>` : ""}${sau ? `<a class="nut nut-nho" href="#/mau-bieu/${sau.khoa}">Mẫu ${e(sau.kyHieu)} →</a>` : ""}</div></div>
      <div class="luoi luoi-chinh"><div class="the"><div class="the-dau"><h3>Nội dung mẫu</h3><div class="phai">${tp.dauNguon.nv()}<a class="nut nut-nho" href="#/dien-mau/${e(m.khoa)}">${bt("kiem", 14)} Điền mẫu</a><button type="button" class="nut nut-nho" data-word-mau="${e(m.khoa)}">${bt("taiXuong", 14)} Tải Word (.docx)</button><a class="nut nut-chinh nut-nho" href="${mh.lienKetPdf(m.trangDau)}" target="_blank" rel="noopener">${bt("pdf", 14)} Mở mẫu chính thức (PDF tr. ${m.trangDau})</a></div></div>
        <div class="the-than"><div class="thong-bao thong-bao-vang">${bt("canhBao")}<div>Văn bản dưới đây được <b>trích tự động</b> từ PDF để tra cứu, tìm kiếm. Tệp Word tải về chứa đúng nội dung này (khổ A4, Times New Roman) để tiện điền; bảng, dòng chấm, ô đánh dấu có thể không giữ đúng định dạng — <b>đối chiếu với trang PDF gốc</b> trước khi sử dụng.</div></div>
        <div class="van-ban-mau">${e(m.noiDung)}</div></div></div>
        <aside class="muc-luc"><div class="the"><div class="the-dau"><h3>Được sử dụng tại</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than chu-nho" style="display:grid;gap:6px">
          ${m.thuTuc.map(x => `<a href="#/thu-tuc/${x}/mau">${x} — ${e(mh.thuTucTheoMa[x].ten.slice(0, 90))}${mh.thuTucTheoMa[x].ten.length > 90 ? "…" : ""}</a>`).join("")}
          ${m.quyTrinh.map(x => `<a href="#/quy-trinh/${x}">Quy trình ${e(mh.quyTrinhTheoId[x].ten)}</a>`).join("")}
          ${m.phuLucIV.map(x => `<a href="#/thu-hoi/${x.split(".")[0]}/${x.split(".")[1]}">Phụ lục IV mục ${x.split(".")[0]} khoản ${x.split(".")[1]}</a>`).join("")}
          ${!m.thuTuc.length && !m.quyTrinh.length && !m.phuLucIV.length ? '<span class="mo">Không có nội dung nào viện dẫn trực tiếp ký hiệu mẫu này.</span>' : ""}</div></div>
          ${m.danhMuc.length ? `<div class="the"><div class="the-dau"><h3>Tại danh mục Phụ lục V</h3></div><div class="the-than chu-nho">${m.danhMuc.map(d => `<div>STT ${d.stt}: Mẫu số ${e(d.kyHieu)} — ${e(d.ten)} (tr.${d.trang})</div>`).join("")}</div></div>` : ""}</aside></div></div>`;
    return { tieuDe: `Mẫu số ${m.kyHieu}`, html };
  }

  // ---------- Cơ quan và trách nhiệm ----------
  const VAI = { "tham-quyen": ["Có thẩm quyền", "nhan-do"], "truc-tiep": ["Trực tiếp thực hiện", "nhan-duong"], "phoi-hop": ["Phối hợp", "nhan-tim"], "uy-quyen": ["Ủy quyền/phân cấp", "nhan-xam"], "khac": ["Được nêu", "nhan-xam"] };
  TT.man["co-quan"] = function (ctx) {
    const { mh, thamSo } = ctx;
    const c = mh.coQuanTheoId[thamSo[0]];
    if (!c) {
      const nhom = {};
      for (const x of mh.coQuan) if (mh.chiMucCoQuan[x.id]) (nhom[x.nhom] = nhom[x.nhom] || []).push(x);
      const html = `<div class="trang"><div class="dong-tieu-de"><div><div class="nhan-trang">Cơ quan và trách nhiệm</div><h1>Cơ quan, chủ thể tham gia giải quyết</h1>
        <div class="mo-ta">Chỉ mục ${tp.dauNguon.pm()} do phần mềm lập bằng cách nhận diện tên cơ quan trong nguyên văn: mục (5) “Cơ quan thực hiện” và tiêu đề các bước của thủ tục, các điều của Quy định, quy trình Chương III, Phụ lục IV. Chọn một cơ quan để xem chi tiết trách nhiệm và nguyên văn.</div></div></div>
        ${Object.entries(nhom).map(([ten, ds]) => `<div class="nhan-muc">${e(ten)}</div><div class="luoi luoi-3">${ds.map(x => { const ix = mh.chiMucCoQuan[x.id]; const tq = ix.thuTucGop.filter(y => y.vaiTro.includes("tham-quyen")).length, tt = ix.thuTucGop.filter(y => y.vaiTro.includes("truc-tiep")).length, ph = ix.thuTucGop.filter(y => y.vaiTro.includes("phoi-hop")).length;
          return `<a class="the the-muc" href="#/co-quan/${x.id}"><div class="tieu">${e(x.ten)}</div><div class="chan-the">${tq ? `<span class="nhan nhan-do">Thẩm quyền: ${tq} TT</span>` : ""}${tt ? `<span class="nhan nhan-duong">Trực tiếp: ${tt} TT</span>` : ""}${ph ? `<span class="nhan nhan-tim">Phối hợp: ${ph} TT</span>` : ""}${ix.quyTrinh.length ? `<span class="nhan nhan-lam">${ix.quyTrinh.length} bước luân chuyển</span>` : ""}${ix.dieu.length ? `<span class="nhan nhan-xam">${ix.dieu.length} điều</span>` : ""}</div></a>`; }).join("")}</div>`).join("")}</div>`;
      return { tieuDe: "Cơ quan và trách nhiệm", html };
    }
    const ix = mh.chiMucCoQuan[c.id] || { thuTucGop: [], buoc: [], dieu: [], quyTrinh: [], phuLucIV: [] };
    const html = `<div class="trang">${tp.dauIn("Trách nhiệm của " + c.ten)}
      <div class="duong-dan khong-in"><a href="#/co-quan">Cơ quan và trách nhiệm</a>${bt("mui", 12)}<span>${e(c.ten)}</span></div>
      <div class="dong-tieu-de"><div><div class="nhan-trang">${e(c.nhom)}</div><h1>${e(c.ten)}</h1>
        <div class="mo-ta">${c.ghiChu ? e(c.ghiChu) + " " : ""}${tp.dauNguon.pm()} Danh sách do phần mềm lập bằng nhận diện tên trong nguyên văn; bấm vào từng mục để đọc nguyên văn.</div></div>
        <div class="phai khong-in"><button class="nut" onclick="window.print()">${bt("in", 15)} In</button></div></div>
      ${ix.dieu.length ? `<div class="nhan-muc">Trách nhiệm theo các điều của Quy định</div><div class="the"><div class="the-than tang">${[...new Set(ix.dieu.map(d => d.so))].map(so => tp.chipCanCu({ dieu: so }, `Điều ${so}. ${mh.dieuTheoSo[so].tieuDe.slice(0, 60)}${mh.dieuTheoSo[so].tieuDe.length > 60 ? "…" : ""}`)).join("")}</div></div>` : ""}
      ${ix.quyTrinh.length ? `<div class="nhan-muc">Công đoạn trong quy trình luân chuyển hồ sơ NVTC (Chương III)</div><div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Quy trình</th><th>Công đoạn</th><th>Thời hạn</th><th>Căn cứ</th></tr></thead><tbody>
        ${ix.quyTrinh.map(x => { const q = mh.quyTrinhTheoId[x.qt], b = q.buocTheoId[x.buoc]; return `<tr><td data-nhan="Quy trình" class="chu-nho">${e(q.ten)}</td><td data-nhan="Công đoạn"><a href="#/quy-trinh/${q.id}/${b.id}" style="font-weight:600">${e(b.ten)}</a></td><td data-nhan="Thời hạn">${b.thoiHan ? (b.thoiHan.ngay != null ? `${String(b.thoiHan.ngay).replace(".", ",")} ngày làm việc` : `<span class="mo">${e(b.thoiHan.nguyenVan || "Không quy định")}</span>`) : "—"}</td><td data-nhan="Căn cứ">${tp.chipCanCu({ dieu: b.canCu.dieu, khoan: b.canCu.khoan }, `K.${b.canCu.khoan} Đ.${b.canCu.dieu}`)}</td></tr>`; }).join("")}
      </tbody></table></div></div>` : ""}
      ${ix.thuTucGop.length ? `<div class="nhan-muc">Vai trò trong thủ tục hành chính (mục 5) — ${ix.thuTucGop.length} thủ tục</div><div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Mã</th><th>Thủ tục</th><th>Vai trò</th></tr></thead><tbody>
        ${ix.thuTucGop.map(x => `<tr><td class="ma" data-nhan="Mã">${x.ma}</td><td data-nhan="Thủ tục"><a class="ten-tt" href="#/thu-tuc/${x.ma}/co-quan">${e(mh.thuTucTheoMa[x.ma].ten)}</a></td><td data-nhan="Vai trò">${x.vaiTro.map(v => `<span class="nhan ${VAI[v][1]}">${VAI[v][0]}</span>`).join(" ")}</td></tr>`).join("")}
      </tbody></table></div></div>` : ""}
      ${ix.buoc.length ? `<div class="nhan-muc">Bước thủ tục có nêu tên cơ quan — ${ix.buoc.length} bước</div><div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Thủ tục</th><th>Bước</th><th>Tiêu đề bước (nguyên văn)</th></tr></thead><tbody>
        ${ix.buoc.map(x => `<tr><td class="ma" data-nhan="Thủ tục"><a href="#/thu-tuc/${x.ma}/trinh-tu">${x.ma}</a></td><td data-nhan="Bước">${x.buoc}</td><td data-nhan="Tiêu đề">${e(x.tieuDe || "(không có tiêu đề)")}</td></tr>`).join("")}
      </tbody></table></div></div>` : ""}
      ${ix.phuLucIV.length ? `<div class="nhan-muc">Trình tự thu hồi đất, BT-HT-TĐC (Phụ lục IV)</div><div class="the"><div class="the-than tang">${ix.phuLucIV.map(x => tp.chipCanCu({ loai: "pl4", muc: x.muc, khoan: x.khoan }, `Mục ${x.muc} khoản ${x.khoan}`)).join("")}</div></div>` : ""}
      ${!ix.dieu.length && !ix.quyTrinh.length && !ix.thuTucGop.length && !ix.buoc.length && !ix.phuLucIV.length ? `<div class="the trong"><b>Chưa có mục nào được nhận diện.</b>Tên cơ quan này không xuất hiện trong dữ liệu theo mẫu nhận diện hiện có.</div>` : ""}
    </div>`;
    return { tieuDe: c.ten, html };
  };

  // ---------- Căn cứ pháp lý ----------
  TT.man["can-cu"] = function (ctx) {
    const { mh, thamSo, q } = ctx;
    const vb = mh.B.vanBan;
    const ma = thamSo[0] || "";
    if (/^(dieu|qd)-\d+$/.test(ma)) return chiTietDieu(mh, ma);
    const tt = o => `${e(o.giaTri || "Không xác định")} ${o.nguon === "ban-ky" ? `<span class="nhan nhan-xanh" title="Đối chiếu bản ký ban hành">Theo bản ký</span>` : o.nguon === "pdf" ? "" : tp.dauNguon.cxm()}<div class="chu-nho mo">${e(o.ghiChu || "")}</div>`;
    const vdChon = q.vb ? mh.vanBanDanChieu[q.vb] : null;
    const html = `<div class="trang">${tp.dauIn("Căn cứ pháp lý")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Căn cứ pháp lý</div><h1>Văn bản nguồn và điều khoản</h1>
        <div class="mo-ta">Toàn văn Quyết định, Quy định (5 chương, ${mh.dieu.length} điều) và các phụ lục, trích từ tệp PDF nguồn. Mỗi điều có liên kết tới trang PDF gốc.</div></div></div>
      ${vdChon ? `<div class="the" style="margin-bottom:16px"><div class="the-dau"><h3>${e(vdChon.ten)}</h3><div class="phai">${tp.dauNguon.pm()}${nhanHL(vdChon.hieuLuc)}<a class="nut nut-nho" href="#/can-cu">Đóng</a></div></div><div class="the-than">${moTaHL(vdChon.hieuLuc)}
        <p class="chu-nho mo" style="margin-top:0">Văn bản này được nêu tên tại các vị trí sau trong tài liệu nguồn. Tài liệu nguồn không kèm toàn văn văn bản được viện dẫn.</p>
        <ul style="margin:0;padding-left:18px">${vdChon.viTri.map(v => `<li><a href="${v.lienKet}">${e(v.nhan)}</a></li>`).join("")}</ul></div></div>` : ""}
      <div class="luoi luoi-chinh"><div style="display:grid;gap:16px">
        <div class="the"><div class="the-dau"><h3>Thông tin văn bản</h3><div class="phai">${tp.lkPdf(1, "Trang 1 PDF")}</div></div><div class="the-than"><dl class="dl-gon">
          <dt>Loại văn bản</dt><dd>${e(vb.loai)} — ${e(vb.coQuanBanHanh)}</dd>
          <dt>Số, ký hiệu</dt><dd>${tt(vb.soKyHieu)}</dd>
          <dt>Ngày ban hành</dt><dd>${tt(vb.ngayBanHanh)}</dd>
          <dt>Ngày có hiệu lực</dt><dd>${tt(vb.ngayHieuLuc)}</dd>
          <dt>Tình trạng hiệu lực</dt><dd><span class="nhan nhan-${mh.hieuLuc.lop}">${e(mh.hieuLuc.nhan)}</span><div class="chu-nho mo">${e(mh.hieuLuc.ghiChu)} Phần mềm không tự kết luận các văn bản được viện dẫn còn hiệu lực hoặc nội dung đã cập nhật theo văn bản sửa đổi sau này.</div></dd>
          <dt>Trích yếu</dt><dd>${e(vb.trichYeu)}</dd>
          <dt>Người ký</dt><dd>${e(vb.nguoiKy.giaTri)} <span class="chu-nho mo">(theo tệp PDF, tr.${vb.nguoiKy.trang})</span></dd>
          <dt>Văn bản hết hiệu lực</dt><dd>${tp.chipCanCu({ loai: "qd", dieu: "2" }, "Khoản 2 Điều 2 Quyết định")}<ul class="ds-gon">${(vb.vanBanHetHieuLuc || []).map(x => `<li><b>${e(x.ten)}</b> — ${e(x.phamVi)}<div class="chu-nho mo">${e(x.noiDung)} (${e(x.canCu)})</div></li>`).join("")}</ul><div class="chu-nho">Hết hiệu lực kể từ ngày ${e(vb.ngayHieuLuc.giaTri || "Quyết định này có hiệu lực")}.</div></dd>
          ${mh.B.banKy ? `<dt>Bản ký ban hành</dt><dd><div class="chu-nho mo">${e(mh.B.banKy.moTa)}</div><div class="anh-ban-ky">${mh.B.banKy.anh.map(a => `<a href="${e(a.tep)}" target="_blank" rel="noopener"><img src="${e(a.tep)}" alt="${e(a.noiDung)}" loading="lazy"><span>${e(a.noiDung)}</span></a>`).join("")}</div></dd>` : ""}
          <dt>Tệp nguồn</dt><dd>${e(mh.N.thongTinTrichXuat.tepNguon)} · ${mh.N.thongTinTrichXuat.soTrang} trang<div class="chu-nho mo" style="word-break:break-all">SHA-256: ${e(mh.N.thongTinTrichXuat.sha256)}</div></dd>
        </dl></div></div>
        <div class="the"><div class="the-dau"><h3>Căn cứ ban hành Quyết định</h3><div class="phai">${tp.dauNguon.nv()} ${tp.lkPdf(1, "Tr. 1–2")}</div></div><div class="the-than">${tp.nguyenVan(mh.N.moDau.canCu.join("\n"), { lienKetMau: false })}</div></div>
        <div class="the"><div class="the-dau"><h3>Quyết định</h3></div><div class="the-than" style="display:grid;gap:6px">${mh.dieuQD.map(d => `<a href="#/can-cu/qd-${d.so}">Điều ${d.so}. ${e(d.tieuDe)}</a>`).join("")}</div></div>
        <div class="the"><div class="the-dau"><h3>Quy định (ban hành kèm theo Quyết định)</h3></div><div class="the-than">${mh.chuong.map(c => `<div style="margin-bottom:12px"><div style="font-weight:700;margin-bottom:4px">${e(c.ten)}</div>${c.dieu.map(so => { const d = mh.dieuTheoSo[so]; return `<div style="padding:2px 0 2px 12px"><a href="#/can-cu/dieu-${so}">Điều ${so}. ${e(d.tieuDe)}</a> <span class="mo chu-nho">tr.${d.trangDau}</span></div>`; }).join("")}</div>`).join("")}</div></div>
      </div>
      <aside style="display:grid;gap:16px;align-content:start">
        <div class="the"><div class="the-dau"><h3>Phụ lục</h3></div><div class="the-than" style="display:grid;gap:8px">
          ${mh.PL.map(p => `<a href="#/thu-tuc?pl=${p.so}">Phụ lục ${p.so}: ${e(mh.N[p.khoa].tieuDe)}</a>`).join("")}
          <a href="#/thu-hoi">Phụ lục IV: ${e(mh.N.phuLucIV.tieuDe)}</a><a href="#/mau-bieu">Phụ lục V: Mẫu biểu</a></div></div>
        <div class="the"><div class="the-dau"><h3>Văn bản được viện dẫn</h3><div class="phai">${tp.dauNguon.pm()}</div></div><div class="the-than khit"><table class="bang"><thead><tr><th>Văn bản</th><th>Hiệu lực</th><th class="so">Vị trí</th></tr></thead><tbody>
          ${Object.values(mh.vanBanDanChieu).sort((a, b) => b.viTri.length - a.viTri.length).map(v => `<tr><td><a href="#/can-cu?vb=${encodeURIComponent(v.ten)}">${e(v.ten)}</a></td><td>${nhanHL(v.hieuLuc)}</td><td class="so">${v.viTri.length}</td></tr>`).join("")}
        </tbody></table><div class="ket-loc">Nhận diện tự động theo tên, số ký hiệu. Hiệu lực lấy từ phần căn cứ ban hành và khoản 2 Điều 2 Quyết định (thời điểm ${e(vb.ngayBanHanh.giaTri)}); văn bản “chưa xác minh” cần tra Cơ sở dữ liệu quốc gia về văn bản pháp luật.</div></div></div>
      </aside></div></div>`;
    return { tieuDe: "Căn cứ pháp lý", html };
  };

  function nhanHL(h) { const lop = { "co-hieu-luc": "xanh", "het-hieu-luc": "do", "het-mot-phan": "vang" }[h && h.ma] || "xam"; return `<span class="nhan nhan-${lop}" title="${e(h && h.nguon || "")}">${e(h ? h.nhan : "Chưa xác minh")}</span>`; }
  function moTaHL(h) {
    if (!h) return "";
    return `<p class="chu-nho" style="margin-top:0"><b>${e(h.nhan)}${h.phamVi && h.phamVi !== "Toàn bộ" ? ": " + e(h.phamVi) : ""}${h.tuNgay ? " kể từ ngày " + e(h.tuNgay) : ""}.</b> Nguồn: ${e(h.nguon)}.${h.suaDoiBoi && h.suaDoiBoi.length ? ` Được sửa đổi, bổ sung bởi: ${h.suaDoiBoi.map(x => `<a href="#/can-cu?vb=${encodeURIComponent(x)}">${e(x)}</a>`).join(", ")}.` : ""}${h.suaDoi && h.suaDoi.length ? ` Sửa đổi, bổ sung: ${h.suaDoi.map(x => `<a href="#/can-cu?vb=${encodeURIComponent(x)}">${e(x)}</a>`).join(", ")}.` : ""}${h.ma === "co-hieu-luc" ? " Phần mềm không theo dõi văn bản sửa đổi ban hành sau thời điểm này." : ""}</p>`;
  }
  TT.nhanHieuLucVB = nhanHL;

  function chiTietDieu(mh, ma) {
    const [loai, so] = ma.split("-");
    const d = loai === "qd" ? mh.dieuQD.find(x => x.so === so) : mh.dieuTheoSo[so];
    if (!d) return { tieuDe: "Không tìm thấy", html: `<div class="trang"><div class="the trong"><b>Không có điều này.</b><a href="#/can-cu">Về căn cứ pháp lý</a></div></div>` };
    const ds = loai === "qd" ? mh.dieuQD : mh.dieu; const i = ds.indexOf(d);
    const apDung = loai === "qd" ? [] : [
      ...mh.quyTrinh.filter(q => q.dieu === so).map(q => `<a href="#/quy-trinh/${q.id}">Sơ đồ quy trình: ${e(q.ten)}</a>`),
      ...mh.PL.filter(p => p.dieu === so).map(p => `<a href="#/thu-tuc?pl=${p.so}">Danh mục thủ tục Phụ lục ${p.so}</a>`),
      ...(so === "13" ? [`<a href="#/thu-hoi">Trình tự Phụ lục IV</a>`] : []), ...(so === "14" ? [`<a href="#/mau-bieu">Mẫu biểu Phụ lục V</a>`] : [])];
    const html = `<div class="trang">${tp.dauIn(`Điều ${d.so} ${loai === "qd" ? "Quyết định" : "Quy định"}`)}
      <div class="duong-dan khong-in"><a href="#/can-cu">Căn cứ pháp lý</a>${bt("mui", 12)}<span>${loai === "qd" ? "Quyết định" : e(d.chuong)}</span></div>
      <div class="dong-tieu-de"><div><div class="nhan-trang">${loai === "qd" ? "Quyết định" : e(d.chuong)}</div><h1 style="max-width:100ch">Điều ${d.so}. ${e(d.tieuDe)}</h1>
        <div class="mo-ta tang">${tp.dauNguon.nv()} ${tp.lkPdf(d.trangDau, "Trang " + d.trangDau + (d.trangCuoi !== d.trangDau ? "–" + d.trangCuoi : ""))}</div></div>
        <div class="phai khong-in">${ds[i - 1] ? `<a class="nut nut-nho" href="#/can-cu/${loai}-${ds[i - 1].so}">← Điều ${ds[i - 1].so}</a>` : ""}${ds[i + 1] ? `<a class="nut nut-nho" href="#/can-cu/${loai}-${ds[i + 1].so}">Điều ${ds[i + 1].so} →</a>` : ""}<button class="nut nut-nho" onclick="window.print()">${bt("in", 14)} In</button></div></div>
      <div class="luoi luoi-chinh"><div class="the"><div class="the-than">${(d.dienBanKy || []).length ? `<div class="thong-bao thong-bao-xanh" style="margin-bottom:12px">${bt("thongTin")}<div>Chỗ trống trong tệp PDF đã được điền theo bản ký ban hành: ${d.dienBanKy.map(x => `“${e(x.thay)}”`).join("; ")}. <a href="#/can-cu">Xem ảnh bản ký</a>.</div></div>` : ""}${d.mo.length ? tp.nguyenVan(d.mo.join("\n")) : ""}
        ${d.khoan.map(k => `<div id="khoan-${k.so}" style="margin-top:6px">${tp.nguyenVan(k.noiDung)}</div>`).join("")}${!d.mo.length && !d.khoan.length ? '<p class="mo">Nội dung điều nằm trọn trong tiêu đề.</p>' : ""}</div></div>
        <aside class="muc-luc">${apDung.length ? `<div class="the"><div class="the-dau"><h3>Áp dụng trong phần mềm</h3></div><div class="the-than chu-nho" style="display:grid;gap:6px">${apDung.join("")}</div></div>` : ""}
          ${d.khoan.length ? `<div class="the"><div class="the-dau"><h3>Các khoản</h3></div><nav class="the-than" style="padding:8px">${d.khoan.map(k => `<a href="#/can-cu/${ma}" data-khoan="${k.so}"><b>${k.so}.</b>${e(k.noiDung.replace(/^\d+\.\s*/, "").slice(0, 70))}…</a>`).join("")}</nav></div>` : ""}</aside></div></div>`;
    return { tieuDe: `Điều ${d.so}`, html, sau(root) { root.querySelectorAll("[data-khoan]").forEach(a => a.addEventListener("click", ev => { ev.preventDefault(); const el = root.querySelector("#khoan-" + a.getAttribute("data-khoan")); if (el) el.scrollIntoView({ block: "start" }); })); } };
  }
})();
