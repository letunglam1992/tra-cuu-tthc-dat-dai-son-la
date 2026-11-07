/* Màn hình: chọn đúng thủ tục khi các thủ tục gần giống nhau (khác cấp thẩm quyền, khác trường hợp Giấy chứng nhận).
 * Dữ liệu: bo-sung.js › phanDinh (tiêu chí rút từ mục 4, mục 5 và tên thủ tục tại Quyết định 75). Khung “Dễ nhầm với” dùng ở trang thủ tục. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;
  const rut = (s, n) => s.length > n ? s.slice(0, n - 2).replace(/\s+\S*$/, "") + "…" : s;
  const lkTT = (mh, ma) => { const t = mh.thuTucTheoMa[ma]; return t ? `<a class="pd-tt" href="#/thu-tuc/${ma}"><b>${ma}</b> ${e(rut(t.ten, 90))}</a>` : ""; };

  function the(mh, g, mo) {
    return `<details class="the pd-nhom" id="pd-${g.id}"${mo ? " open" : ""}><summary><span class="pd-ten">${e(g.ten)}</span><span class="chu-nho mo">${[...new Set(g.luaChon.flatMap(l => l.ma))].join(" · ")}</span></summary>
      <div class="the-than">
        <p class="pd-hoi">${bt("thongTin", 15)} <b>${e(g.cauHoi)}</b></p>
        <div class="pd-ds">${g.luaChon.map(l => `<div class="pd-lc"><div class="pd-dk">${e(l.nhan)}</div><div class="pd-kq">${bt("mui", 13)} <span class="nhan nhan-xanh">${e(l.ketQua)}</span></div><div class="pd-tts">${l.ma.map(m => lkTT(mh, m)).join("")}</div></div>`).join("")}</div>
        <p class="chu-nho mo"><b>Tiêu chí:</b> ${e(g.tieuChi)}</p>
        ${(g.canhBao || []).map(c => `<div class="thong-bao thong-bao-vang" style="margin:8px 0 0">${bt("canhBao")}<div>${e(c)}</div></div>`).join("")}
      </div></details>`;
  }

  TT.man["chon-thu-tuc"] = function (ctx) {
    const { mh, thamSo } = ctx, ds = mh.B.phanDinh || [];
    const html = `<div class="trang">
      <div class="dong-tieu-de"><div><div class="nhan-trang">Tra cứu</div><h1>Chọn đúng thủ tục</h1>
        <div class="mo-ta">Nhiều thủ tục cùng tên hoặc gần giống nhau nhưng khác cơ quan giải quyết. Trả lời câu hỏi của từng nhóm để biết thủ tục, cơ quan có thẩm quyền đúng. Tiêu chí rút từ mục (4) đối tượng thực hiện, mục (5) cơ quan thực hiện và tên thủ tục tại Quyết định 75.</div></div></div>
      <div style="display:grid;gap:12px">${ds.map(g => the(mh, g, thamSo[0] === g.id || ds.length === 1)).join("")}</div>
    </div>`;
    return { tieuDe: "Chọn đúng thủ tục", html, cuonDen: thamSo[0] ? "#pd-" + thamSo[0] : null };
  };

  // Khung “Dễ nhầm với” cho trang thủ tục: các nhóm có chứa mã này
  TT.phanDinh = {
    hop(mh, ma) {
      const nhom = (mh.B.phanDinh || []).filter(g => (g.cap || []).some(c => c.includes(ma)));
      if (!nhom.length) return "";
      return nhom.map(g => {
        const khac = [...new Set(g.cap.filter(c => c.includes(ma)).flat())].filter(m => m !== ma);
        const lc = g.luaChon.find(l => l.ma.includes(ma));
        return `<div class="thong-bao thong-bao-xanh pd-hop khong-in">${bt("luong")}<div><b>Dễ nhầm với:</b> ${khac.map(m => `<a href="#/thu-tuc/${m}">${m}</a>`).join(", ")}${lc ? `. Thủ tục này dành cho: <i>${e(lc.nhan)}</i> → ${e(lc.ketQua)}` : ""}. <a href="#/chon-thu-tuc/${g.id}">Xem cách phân định</a>${(g.canhBao || []).some(c => c.includes(ma)) ? ` <span class="nhan nhan-vang">QĐ 75 chưa phân định rõ</span>` : ""}</div></div>`;
      }).join("");
    }
  };
})();
