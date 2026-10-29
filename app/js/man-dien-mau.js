/* Màn hình: điền mẫu đơn, tờ khai (Phụ lục V) trực tiếp trên màn hình rồi xuất Word (.docx) đã điền.
 * Ô điền = các dòng chấm của mẫu; bản nháp lưu trên trình duyệt (không gửi đi đâu). */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;
  const khoaNhap = k => "tthc-dien-mau-" + k;
  const MAU_HAY_DUNG = ["1", "4a", "15", "18", "22", "34", "9", "17"];

  TT.man["dien-mau"] = function (ctx) {
    const { mh, thamSo } = ctx;
    const m = thamSo[0] ? mh.mauTheoKhoa[thamSo[0]] : null;
    if (!m) return {
      tieuDe: "Điền mẫu đơn", html: `<div class="trang"><div class="dong-tieu-de"><div><div class="nhan-trang">Công cụ</div><h1>Điền mẫu đơn, tờ khai</h1>
        <div class="mo-ta">Chọn mẫu tại Phụ lục V, nhập thông tin vào các ô (tương ứng các dòng chấm của mẫu), rồi tải tệp Word đã điền. Bản nháp tự lưu trên trình duyệt này.</div></div></div>
        ${thamSo[0] ? `<div class="thong-bao thong-bao-vang">${bt("canhBao")}<div>Không có Mẫu số “${e(thamSo[0])}”.</div></div>` : ""}
        <div class="dong-muc"><h2>Mẫu hay dùng</h2></div>
        <div class="luoi luoi-3">${MAU_HAY_DUNG.map(k => mh.mauTheoKhoa[k]).filter(Boolean).map(x => the(mh, x)).join("")}</div>
        <div class="dong-muc"><h2>Tất cả mẫu</h2></div>
        <div class="luoi luoi-3">${mh.mauBieu.filter(x => !MAU_HAY_DUNG.includes(x.khoa)).map(x => the(mh, x)).join("")}</div></div>` };
    const o = TT.word.oDienMau(m), soO = o.reduce((s, d) => s + d.phan.filter(x => x.o).length, 0);
    let gt = []; try { gt = JSON.parse(localStorage.getItem(khoaNhap(m.khoa)) || "[]"); } catch (_) { }
    const html = `<div class="trang">
      <div class="duong-dan khong-in"><a href="#/dien-mau">Điền mẫu đơn</a>${bt("mui", 12)}<span>Mẫu số ${e(m.kyHieu)}</span></div>
      <div class="dong-tieu-de"><div><div class="nhan-trang">Phụ lục V · Mẫu số ${e(m.kyHieu)}</div><h1>${e(m.ten)}</h1>
        <div class="mo-ta">${soO} ô điền. Nội dung mẫu dựng lại từ PDF (trang ${m.trangDau}${m.trangCuoi !== m.trangDau ? "–" + m.trangCuoi : ""}) — bảng biểu, ô đánh dấu có thể khác bố cục gốc; đối chiếu ${tp.lkPdf(m.trangDau, "mẫu gốc")} trước khi nộp.</div></div>
        <div class="phai khong-in"><button class="nut nut-chinh" id="tai-dien">${bt("taiXuong", 15)} Tải Word đã điền</button><button class="nut" id="xoa-dien">Xóa nội dung đã nhập</button><a class="nut" href="#/mau-bieu/${m.khoa}">Xem mẫu</a></div></div>
      <div class="thong-bao thong-bao-xanh khong-in">${bt("thongTin")}<div>Thông tin bạn nhập chỉ lưu trên trình duyệt của máy này, không gửi đi đâu. Ô để trống sẽ giữ nguyên dòng chấm trong tệp Word để viết tay.</div></div>
      <article class="the mau-dien"><div class="the-than">${o.map(d => `<p class="${d.laHoa ? "hoa" : d.ngay ? "ngay" : ""}">${d.phan.map(x => x.o ? `<input class="o-dien" data-i="${x.i}" value="${e(gt[x.i] || "")}" size="${Math.max(6, Math.min(48, Math.round(x.goc.length * 0.7)))}" aria-label="Ô điền ${x.i + 1}" placeholder="${e(x.goc.slice(0, 6))}">` : e(x.t)).join("")}</p>`).join("")}</div></article>
    </div>`;
    return { tieuDe: "Điền Mẫu số " + m.kyHieu, html, giuCuon: true,
      sau(root) {
        const luu = () => { const v = []; root.querySelectorAll(".o-dien").forEach(x => { v[+x.getAttribute("data-i")] = x.value; }); try { localStorage.setItem(khoaNhap(m.khoa), JSON.stringify(v)); } catch (_) { } return v; };
        root.querySelector(".mau-dien").addEventListener("input", luu);
        root.querySelector("#tai-dien").addEventListener("click", () => TT.word.xuatMau(m, mh.B.vanBan, TT.THONG_TIN_PM.tacGia, luu()));
        root.querySelector("#xoa-dien").addEventListener("click", () => { root.querySelectorAll(".o-dien").forEach(x => { x.value = ""; }); luu(); });
      } };
  };
  function the(mh, m) {
    const soO = TT.word.oDienMau(m).reduce((s, d) => s + d.phan.filter(x => x.o).length, 0);
    return `<a class="the the-muc" href="#/dien-mau/${m.khoa}"><div class="tang"><span class="nhan nhan-xanh">Mẫu số ${e(m.kyHieu)}</span><span class="nhan nhan-xam">${soO} ô điền</span></div><div class="tieu">${e(m.ten.length > 110 ? m.ten.slice(0, 108) + "…" : m.ten)}</div></a>`;
  }
})();
