/* Màn hình: văn bản pháp luật đất đai có nguyên văn trong phần mềm.
 * #/phap-luat — danh mục; #/phap-luat/<MÃ>?q= — mục lục, tìm trong văn bản; #/phap-luat/<MÃ>/<Điều>?k=<khoản> — nguyên văn Điều. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt, pl = TT.phapLuat;
  const NHOM = [["Luật", "Luật, nghị quyết của Quốc hội"], ["Nghị định", "Nghị định của Chính phủ"], ["Thông tư", "Thông tư của Bộ"], ["Tinh", "Văn bản của tỉnh Sơn La (HĐND, UBND tỉnh)"]];
  const dauTrang = (nhan, h1, moTa, phai) => `<div class="dong-tieu-de"><div><div class="nhan-trang">${nhan}</div><h1>${h1}</h1>${moTa ? `<div class="mo-ta">${moTa}</div>` : ""}</div>${phai ? `<div class="phai khong-in">${phai}</div>` : ""}</div>`;

  TT.man["phap-luat"] = function (ctx) {
    const { thamSo, q } = ctx, [ma, so] = thamSo, dm = pl.danhMuc;
    if (!ma) {
      const nhomCua = v => /HĐND|UBND/.test(v.soHieu) ? "Tinh" : v.loai === "Nghị quyết" && /QH/.test(v.soHieu) ? "Luật" : v.loai;
      const html = `<div class="trang">${dauTrang("Tra cứu", "Văn bản pháp luật đất đai", "Nguyên văn các văn bản được Quyết định 75 viện dẫn hoặc dùng khi giải quyết thủ tục, tính tiền sử dụng đất. Trong nguyên văn thủ tục, các cụm như “khoản 6 Điều 141 của Luật Đất đai” đã được gắn liên kết — bấm để xem ngay.")}
        <div class="thong-bao thong-bao-vang">${bt("canhBao")}<div>Văn bản dùng để tra cứu, soạn thảo nội bộ. Trừ Luật Đất đai (văn bản hợp nhất), các nghị định, thông tư là <b>bản gốc chưa hợp nhất</b> — phần mềm ghi chú các Điều đã được sửa đổi. Khi cần giá trị pháp lý, đối chiếu văn bản gốc trên cổng thông tin chính thức.</div></div>
        ${NHOM.filter(n => n[1]).map(([loai, ten]) => { const ds = Object.entries(dm).filter(([, v]) => nhomCua(v) === loai); return ds.length ? `<div class="dong-muc"><h2>${e(ten)}</h2></div><div class="luoi luoi-2">${ds.map(([m, v]) => `<a class="the the-muc" href="#/phap-luat/${m}"><div class="tang"><span class="nhan nhan-xanh">${e(v.loai)}</span><span class="nhan nhan-xam">${v.soDieu} Điều</span>${v.suaDoi ? `<span class="nhan nhan-vang" title="${e(v.suaDoi)}">Đã được sửa đổi</span>` : ""}</div><div class="tieu">${e(v.ten)}</div><div class="chu-nho mo">${e(v.trichYeu)}</div><div class="chu-nho"><b>Hiệu lực:</b> ${e(v.hieuLuc)}</div></a>`).join("")}</div>` : ""; }).join("")}
        <p class="chu-nho mo" style="margin-top:16px">Chưa có nguyên văn: Nghị định số 101/2024, 102/2024, 103/2024, 118/2025/NĐ-CP và một số văn bản khác được Quyết định 75 viện dẫn — các cụm viện dẫn này hiển thị bình thường, không có liên kết.</p></div>`;
      return { tieuDe: "Văn bản pháp luật", html };
    }
    const v = dm[ma];
    if (!v) return { tieuDe: "Văn bản pháp luật", html: `<div class="trang"><div class="the trong"><b>Không có văn bản “${e(ma)}”.</b><a href="#/phap-luat">Về danh mục</a></div></div>` };
    const duongDan = `<div class="duong-dan khong-in"><a href="#/phap-luat">Văn bản pháp luật</a>${bt("mui", 12)}${so ? `<a href="#/phap-luat/${ma}">${e(v.ten)}</a>${bt("mui", 12)}<span>Điều ${e(so)}</span>` : `<span>${e(v.ten)}</span>`}</div>`;
    const html = `<div class="trang">${duongDan}<div id="pl-than"><p class="mo">Đang tải nguyên văn ${e(v.ten)}…</p></div></div>`;
    return { tieuDe: so ? `Điều ${so} ${v.ten}` : v.ten, html, giuCuon: true,
      sau(root) {
        const than = root.querySelector("#pl-than");
        pl.nap(ma).then(() => {
          if (so) {
            const d = pl.dieu(ma, so);
            if (!d) { than.innerHTML = `<div class="the trong"><b>Không có Điều ${e(so)}.</b><a href="#/phap-luat/${ma}">Về mục lục</a></div>`; return; }
            const ds = pl.tim(ma, ""), i = ds.findIndex(x => x.so === so), truoc = ds[i - 1], sau = ds[i + 1];
            than.innerHTML = `${dauTrang(e(v.ten) + (d.chuong ? " · " + e(d.chuong) : ""), `Điều ${e(so)}. ${e(d.tieuDe)}`, "", `${truoc ? `<a class="nut nut-nho" href="#/phap-luat/${ma}/${truoc.so}">← Điều ${truoc.so}</a>` : ""}${sau ? `<a class="nut nut-nho" href="#/phap-luat/${ma}/${sau.so}">Điều ${sau.so} →</a>` : ""}<button class="nut nut-nho" onclick="window.print()">${bt("in", 14)} In</button>`)}
              ${pl.htmlSuaDoi(ma, so)}<div class="the"><div class="the-than">${pl.htmlDieu(ma, d, q.k, q.d)}</div></div><div style="margin-top:10px">${pl.ghiChuVB(v)}</div>`;
            const to = than.querySelector(".pl-to"); if (to) to.scrollIntoView({ block: "center" });
            return;
          }
          than.innerHTML = `${dauTrang(e(v.loai), e(v.ten), e(v.trichYeu))}
            <div class="the" style="margin-bottom:12px"><div class="the-than">${pl.ghiChuVB(v)}${v.suaDoi ? `<div class="chu-nho" style="margin-top:4px;color:var(--vang)"><b>Sửa đổi:</b> ${e(v.suaDoi)}</div>` : ""}
              <label class="truong" style="margin-top:10px"><span>Tìm trong văn bản (không dấu cũng được)</span><input type="search" id="pl-q" value="${e(q.q || "")}" placeholder="Ví dụ: hạn mức, cấp giấy chứng nhận lần đầu, giá đất cụ thể…"></label></div></div>
            <div id="pl-ds"></div>`;
          const oQ = than.querySelector("#pl-q"), dsEl = than.querySelector("#pl-ds");
          const ve = () => {
            const tu = oQ.value.trim(), kq = pl.tim(ma, tu); let chuong = null;
            dsEl.innerHTML = kq.length ? `${tu ? `<p class="chu-nho mo">${kq.length} Điều khớp — xếp theo mức độ phù hợp.</p>` : ""}<div class="the"><div class="the-than"><ul class="pl-muc-luc">${kq.map(d => { const dauC = !tu && d.chuong !== chuong ? `<li class="pl-chuong">${e(d.chuong || "")}</li>` : ""; chuong = d.chuong;
              const sd = pl.suaDoiCua(ma, d.so).length; const trich = tu ? ti.trichDoan ? ti.trichDoan(d.noiDung, tu.split(/\s+/), 160) : "" : "";
              return `${dauC}<li><a href="#/phap-luat/${ma}/${d.so}"><b>Điều ${e(d.so)}.</b> ${e(d.tieuDe)}</a>${sd ? ` <span class="nhan nhan-vang">đã sửa đổi</span>` : ""}${trich ? `<div class="chu-nho mo">${e(trich)}</div>` : ""}</li>`; }).join("")}</ul></div></div>`
              : `<div class="the trong"><b>Không có Điều nào khớp “${e(tu)}”.</b>Thử từ khóa khác.</div>`;
            history.replaceState(null, "", `#/phap-luat/${ma}` + (tu ? "?q=" + encodeURIComponent(tu) : ""));
          };
          oQ.addEventListener("input", ve); ve();
        }, err => { than.innerHTML = `<div class="thong-bao thong-bao-do">${bt("canhBao")}<div>${e(err.message)}</div></div>`; });
      } };
  };
})();
