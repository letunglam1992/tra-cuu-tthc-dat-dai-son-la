/* Màn hình: báo cáo tổng hợp thủ tục hành chính (phục vụ kiểm soát TTHC) — xem trên màn hình, xuất Word theo thể thức
 * văn bản hành chính (Nghị định số 30/2020/NĐ-CP: khổ A4, Times New Roman, phần đầu hai cột, nơi nhận, chữ ký) và CSV. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;
  const KHOA = "tthc-bao-cao-thong-tin";
  const MAC_DINH = { chuQuan: "ỦY BAN NHÂN DÂN TỈNH SƠN LA", coQuan: "SỞ NÔNG NGHIỆP VÀ MÔI TRƯỜNG", so: "", kyHieu: "BC-SNNMT", diaDanh: "Sơn La", trichYeu: "Tổng hợp thủ tục hành chính lĩnh vực đất đai theo Quyết định số 75/2026/QĐ-UBND", nguoiKy: "", chucVu: "GIÁM ĐỐC", noiNhan: "UBND tỉnh (b/c);\nVăn phòng UBND tỉnh;\nLưu: VT." };

  function soLieu(mh) {
    const han = t => t.suyRa.thoiHan;
    const theoCap = mh.PL.map(p => {
      const ds = mh.thuTuc.filter(t => t.phuLuc === p.so), lv = ds.map(han).filter(h => h && h.donVi === "ngày làm việc").map(h => h.ngay);
      return { pl: p.so, cap: p.capDai, so: ds.length, nvtc: ds.filter(t => t.suyRa.coNghiaVuTaiChinh).length, maQG: ds.filter(t => t.maQuocGia && t.maQuocGia.mucDo === "khop").length,
        hanMin: lv.length ? Math.min(...lv) : null, hanMax: lv.length ? Math.max(...lv) : null, ngayLich: ds.filter(t => han(t) && han(t).donVi === "ngày").length };
    });
    const cq = {};
    for (const t of mh.thuTuc) for (const id of new Set(t.suyRa.coQuan.filter(c => c.vaiTro === "tham-quyen").map(c => c.id))) (cq[id] = cq[id] || []).push(t.ma);
    const theoCQ = Object.entries(cq).map(([id, ds]) => ({ ten: tp.tenCoQuan(id), ds })).sort((a, b) => b.ds.length - a.ds.length);
    return { theoCap, theoCQ, tong: mh.thuTuc.length };
  }
  const hanTxt = (mh, t) => t.suyRa.thoiHan ? mh.hienThiHan(t.suyRa.thoiHan) + (t.suyRa.thoiHan.nhieuTruongHop ? " (nhiều trường hợp)" : "") : "Xem mục (3)";
  const cqTxt = t => [...new Set(t.suyRa.coQuan.filter(c => c.vaiTro === "tham-quyen").map(c => tp.tenCoQuan(c.id)))].join("; ") || "Xem mục (5)";

  TT.man["bao-cao"] = function (ctx) {
    const { mh } = ctx;
    let tt = { ...MAC_DINH }; try { tt = { ...tt, ...JSON.parse(localStorage.getItem(KHOA) || "{}") }; } catch (_) { }
    const sl = soLieu(mh);
    const truong = (k, nhan, rong) => `<label class="truong" ${rong ? 'style="grid-column:1/-1"' : ""}><span>${e(nhan)}</span>${k === "noiNhan" ? `<textarea name="${k}" rows="3" style="border:1px solid var(--vien-dam);border-radius:8px;padding:8px;background:var(--o-nhap)">${e(tt[k])}</textarea>` : `<input name="${k}" value="${e(tt[k])}">`}</label>`;
    const html = `<div class="trang">${tp.dauIn("Báo cáo tổng hợp thủ tục hành chính lĩnh vực đất đai")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Công cụ</div><h1>Báo cáo tổng hợp thủ tục hành chính</h1>
        <div class="mo-ta">Số liệu tính trực tiếp từ dữ liệu ${e(mh.tenVanBan)}: theo cấp giải quyết, theo cơ quan có thẩm quyền, danh mục chi tiết kèm thời hạn, mã TTHC, nghĩa vụ tài chính. Xuất Word theo thể thức văn bản hành chính.</div></div>
        <div class="phai khong-in"><button class="nut nut-chinh" id="bc-word">${bt("taiXuong", 15)} Xuất Word</button><button class="nut" id="bc-csv">${bt("taiXuong", 15)} Xuất CSV</button><button class="nut" onclick="window.print()">${bt("in", 15)} In</button></div></div>
      <details class="the khong-in" open><summary style="padding:12px 16px;cursor:pointer;font-weight:600">Thông tin văn bản báo cáo</summary><form class="the-than form-nv" id="bc-tt">
        ${truong("chuQuan", "Cơ quan chủ quản")}${truong("coQuan", "Cơ quan báo cáo")}${truong("so", "Số")}${truong("kyHieu", "Ký hiệu")}${truong("diaDanh", "Địa danh")}${truong("trichYeu", "Trích yếu", true)}${truong("chucVu", "Chức vụ người ký")}${truong("nguoiKy", "Họ tên người ký")}${truong("noiNhan", "Nơi nhận (mỗi dòng một nơi)", true)}</form></details>
      <div class="dong-muc"><h2>1. Tổng hợp theo cấp giải quyết</h2></div>
      <div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Phụ lục</th><th>Cấp, thẩm quyền</th><th class="so">Số TTHC</th><th class="so">Có NVTC</th><th class="so">Có mã TTHC</th><th>Thời hạn (ngày làm việc)</th><th class="so">Ghi “ngày”</th></tr></thead><tbody>
        ${sl.theoCap.map(r => `<tr><td data-nhan="Phụ lục">${r.pl}</td><td data-nhan="Cấp">${e(r.cap)}</td><td class="so" data-nhan="Số TTHC"><b>${r.so}</b></td><td class="so" data-nhan="Có NVTC">${r.nvtc}</td><td class="so" data-nhan="Mã TTHC">${r.maQG}</td><td data-nhan="Thời hạn">${r.hanMin != null ? `${r.hanMin} – ${r.hanMax}` : "—"}</td><td class="so" data-nhan="Ghi ngày">${r.ngayLich}</td></tr>`).join("")}
        <tr><td colspan="2"><b>Tổng cộng</b></td><td class="so"><b>${sl.tong}</b></td><td class="so"><b>${sl.theoCap.reduce((s, r) => s + r.nvtc, 0)}</b></td><td class="so"><b>${sl.theoCap.reduce((s, r) => s + r.maQG, 0)}</b></td><td></td><td class="so"><b>${sl.theoCap.reduce((s, r) => s + r.ngayLich, 0)}</b></td></tr></tbody></table></div>
        <div class="ket-loc">${tp.dauNguon.pm()} Thời hạn: số ngày nêu đầu tiên tại mục (3), chỉ tính thủ tục ghi “ngày làm việc”; cột “Ghi ngày” là số thủ tục văn bản ghi “ngày” (không ghi “ngày làm việc”).</div></div>
      <div class="dong-muc"><h2>2. Theo cơ quan có thẩm quyền quyết định</h2></div>
      <div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Cơ quan</th><th class="so">Số TTHC</th><th>Thủ tục</th></tr></thead><tbody>${sl.theoCQ.map(r => `<tr><td data-nhan="Cơ quan">${e(r.ten)}</td><td class="so" data-nhan="Số">${r.ds.length}</td><td data-nhan="Thủ tục" class="chu-nho">${r.ds.map(m => `<a href="#/thu-tuc/${m}">${m}</a>`).join(", ")}</td></tr>`).join("")}</tbody></table></div>
        <div class="ket-loc">${tp.dauNguon.pm()} Nhận diện từ dòng “Cơ quan có thẩm quyền quyết định” của mục (5); một thủ tục có thể có nhiều cơ quan.</div></div>
      <div class="dong-muc"><h2>3. Danh mục chi tiết</h2></div>
      <div class="the"><div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Mã</th><th>Tên thủ tục</th><th>Thời hạn</th><th>Cơ quan có thẩm quyền</th><th>Mã TTHC</th><th>NVTC</th></tr></thead><tbody>
        ${mh.thuTuc.map(t => `<tr><td class="ma" data-nhan="Mã"><a href="#/thu-tuc/${t.ma}">${t.ma}</a></td><td data-nhan="Tên">${e(t.ten)}</td><td data-nhan="Thời hạn" class="chu-nho">${e(hanTxt(mh, t))}</td><td data-nhan="Cơ quan" class="chu-nho">${e(cqTxt(t))}</td><td data-nhan="Mã TTHC" class="chu-nho">${t.maQuocGia ? e(t.maQuocGia.ma) + (t.maQuocGia.mucDo === "goi-y" ? "*" : "") : "—"}</td><td data-nhan="NVTC">${t.suyRa.coNghiaVuTaiChinh ? "Có" : ""}</td></tr>`).join("")}</tbody></table></div>
        <div class="ket-loc">* Mã gợi ý, cần xác minh.</div></div></div>`;
    return { tieuDe: "Báo cáo tổng hợp TTHC", html, giuCuon: true,
      sau(root) {
        const f = root.querySelector("#bc-tt");
        const doc = () => { const v = { ...MAC_DINH }; for (const [k, x] of new FormData(f).entries()) v[k] = x; try { localStorage.setItem(KHOA, JSON.stringify(v)); } catch (_) { } return v; };
        f.addEventListener("input", doc);
        root.querySelector("#bc-word").addEventListener("click", () => xuatWord(mh, doc(), sl));
        root.querySelector("#bc-csv").addEventListener("click", () => tp.xuatCsv("bao-cao-tthc-dat-dai.csv", ["Mã", "Phụ lục", "Tên thủ tục", "Thời hạn", "Cơ quan có thẩm quyền", "Mã TTHC quốc gia", "Có nghĩa vụ tài chính"],
          mh.thuTuc.map(t => [t.ma, t.phuLuc, t.ten, hanTxt(mh, t), cqTxt(t), t.maQuocGia ? t.maQuocGia.ma + (t.maQuocGia.mucDo === "goi-y" ? " (gợi ý)" : "") : "", t.suyRa.coNghiaVuTaiChinh ? "Có" : ""])));
      } };
  };

  // Xuất Word: phần đầu hai cột (cơ quan | quốc hiệu, tiêu ngữ), tên loại, trích yếu, nội dung, bảng, nơi nhận, chữ ký
  function xuatWord(mh, v, sl) {
    const W = TT.word, d = new Date(), nam = d.getFullYear();
    const ngay = `${v.diaDanh || "……"}, ngày ${String(d.getDate()).padStart(2, "0")} tháng ${String(d.getMonth() + 1).padStart(2, "0")} năm ${nam}`;
    const khoi = [
      { bang: { vien: false, cot: [3600, 5600], dong: [[
        [{ text: v.chuQuan, can: "giua", co: 12 }, { text: v.coQuan, can: "giua", dam: true, co: 12 }, { text: "________", can: "giua", co: 12 }, { text: `Số: ${v.so || "      "}/${v.kyHieu}`, can: "giua", co: 13 }],
        [{ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", can: "giua", dam: true, co: 12 }, { text: "Độc lập - Tự do - Hạnh phúc", can: "giua", dam: true, co: 13 }, { text: "____________________", can: "giua", co: 12 }, { text: ngay, can: "giua", nghieng: true, co: 13 }]
      ]] } },
      { text: "BÁO CÁO", can: "giua", dam: true, co: 14, truoc: 12, sau: 0 },
      { text: v.trichYeu, can: "giua", dam: true, co: 14, sau: 2 },
      { text: "____________", can: "giua", sau: 10 },
      { text: `Thực hiện nhiệm vụ kiểm soát thủ tục hành chính, ${v.coQuan.charAt(0) + v.coQuan.slice(1).toLowerCase()} tổng hợp các thủ tục hành chính lĩnh vực đất đai theo ${mh.tenVanBan} (có hiệu lực thi hành kể từ ngày ${mh.B.vanBan.ngayHieuLuc.giaTri}) như sau:`, can: "deu", thutLe: true, co: 14 },
      { text: `1. Tổng số thủ tục hành chính: ${sl.tong} thủ tục, trong đó: ${sl.theoCap.map(r => `Phụ lục ${r.pl} (${r.cap.charAt(0).toLowerCase() + r.cap.slice(1)}): ${r.so} thủ tục`).join("; ")}.`, can: "deu", thutLe: true, co: 14 },
      { text: `2. Số thủ tục có nội dung nghĩa vụ tài chính: ${sl.theoCap.reduce((s, r) => s + r.nvtc, 0)}; số thủ tục đã có mã trên Cơ sở dữ liệu quốc gia về thủ tục hành chính (theo danh mục công bố): ${sl.theoCap.reduce((s, r) => s + r.maQG, 0)}.`, can: "deu", thutLe: true, co: 14 },
      { text: "a) Tổng hợp theo cấp giải quyết:", can: "deu", thutLe: true, co: 14, dam: true },
      { bang: { cot: [800, 3400, 900, 900, 1000, 1900], dau: 1, co: 11, dong: [["Phụ lục", "Cấp, thẩm quyền", "Số TTHC", "Có NVTC", "Có mã TTHC", "Thời hạn (ngày làm việc)"],
        ...sl.theoCap.map(r => [{ text: r.pl, can: "giua" }, r.cap, { text: String(r.so), can: "giua" }, { text: String(r.nvtc), can: "giua" }, { text: String(r.maQG), can: "giua" }, { text: r.hanMin != null ? `${r.hanMin} – ${r.hanMax}` : "—", can: "giua" }]),
        [{ text: "Tổng cộng", dam: true, gop: 2 }, { text: String(sl.tong), dam: true, can: "giua" }, { text: String(sl.theoCap.reduce((s, r) => s + r.nvtc, 0)), dam: true, can: "giua" }, { text: String(sl.theoCap.reduce((s, r) => s + r.maQG, 0)), dam: true, can: "giua" }, ""]] } },
      { text: "b) Danh mục chi tiết:", can: "deu", thutLe: true, co: 14, dam: true, truoc: 6 },
      { bang: { cot: [700, 3500, 1500, 1900, 1100, 500], dau: 1, co: 10, dong: [["Mã", "Tên thủ tục hành chính", "Thời hạn giải quyết", "Cơ quan có thẩm quyền", "Mã TTHC", "NVTC"],
        ...mh.thuTuc.map(t => [{ text: t.ma, can: "giua" }, t.ten, hanTxt(mh, t), cqTxt(t), { text: t.maQuocGia ? t.maQuocGia.ma + (t.maQuocGia.mucDo === "goi-y" ? "*" : "") : "", can: "giua" }, { text: t.suyRa.coNghiaVuTaiChinh ? "x" : "", can: "giua" }])] } },
      { text: "(*) Mã gợi ý, cần xác minh. Thời hạn: số ngày nêu đầu tiên tại mục (3) của thủ tục; trường hợp có nhiều thời hạn xem nguyên văn.", nghieng: true, co: 11 },
      { bang: { vien: false, cot: [4400, 4800], dong: [[
        [{ text: "Nơi nhận:", dam: true, nghieng: true, co: 12 }, ...String(v.noiNhan || "").split("\n").filter(Boolean).map(x => ({ text: "- " + x.trim(), co: 11 }))],
        [{ text: v.chucVu, can: "giua", dam: true, co: 13 }, { text: "", co: 13 }, { text: "", co: 13 }, { text: "", co: 13 }, { text: v.nguoiKy, can: "giua", dam: true, co: 13 }]
      ]] } }
    ];
    W.taiVe(W.taoDocx(khoi, { tieuDe: "Báo cáo tổng hợp TTHC lĩnh vực đất đai", tacGia: TT.THONG_TIN_PM.tacGia }), `Bao-cao-TTHC-dat-dai-${nam}.docx`);
  }
  TT.baoCao = { soLieu };
})();
