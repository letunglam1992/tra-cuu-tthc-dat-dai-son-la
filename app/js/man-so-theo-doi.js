/* Màn hình: sổ theo dõi hạn giải quyết hồ sơ (dùng cá nhân cho cán bộ tiếp nhận, giải quyết).
 * Dữ liệu chỉ lưu trên trình duyệt của máy đang dùng (localStorage) — không gửi đi đâu; sao lưu/khôi phục bằng tệp JSON, xuất Excel.
 * Hạn giải quyết tính bằng TT.thoiHan (cùng quy tắc với công cụ Tính thời hạn) — kết quả tham khảo. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt, th = TT.thoiHan;
  const KHOA = "tthc-so-theo-doi";
  const docSo = () => { try { const v = JSON.parse(localStorage.getItem(KHOA) || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
  const ghiSo = ds => { try { localStorage.setItem(KHOA, JSON.stringify(ds)); return true; } catch (_) { return false; } };
  const docNghiThem = () => { try { return new Set(JSON.parse(localStorage.getItem("tthc-ngay-nghi-them") || "[]")); } catch (_) { return new Set(); } };

  // Số ngày làm việc từ hôm nay đến hạn (âm: quá hạn)
  function conLai(han, homNay, lichNghi, nghiThem) {
    if (+han === +homNay) return 0;
    const sau = han > homNay; let d = homNay, n = 0, gioi = 0;
    while ((sau ? d < han : d > han) && gioi++ < 2000) { d = th.cong(d, sau ? 1 : -1); if (th.thongTinNgay(d, lichNghi, nghiThem).lam) n++; }
    return sau ? n : -n;
  }
  function tinhHoSo(h, mh) {
    const nhan = th.tuKhoa(h.ngayNhan); if (!nhan) return { loi: true };
    const r = th.tinh({ ngayNhan: nhan, soNgay: +h.soNgay || 0, donVi: h.donVi || "ngày làm việc", tangThem: h.kv3 ? +h.tangThem || 0 : 0, tamDung: +h.tamDung || 0, lichNghi: mh.B.lichNghi, nghiThem: docNghiThem() });
    const homNay = new Date(); homNay.setHours(0, 0, 0, 0);
    const cl = conLai(r.ngayHen, homNay, mh.B.lichNghi, docNghiThem());
    let tt;
    if (h.daTra) { const tra = th.tuKhoa(h.ngayTra) || homNay; tt = tra > r.ngayHen ? { ma: "tra-tre", nhan: "Đã trả — trễ hạn", lop: "do" } : { ma: "tra-dung", nhan: "Đã trả đúng hạn", lop: "xanh" }; }
    else if (cl < 0) tt = { ma: "qua-han", nhan: `Quá hạn ${-cl} ngày làm việc`, lop: "do" };
    else if (cl === 0) tt = { ma: "den-han", nhan: "Đến hạn hôm nay", lop: "do" };
    else if (cl <= 2) tt = { ma: "sap-han", nhan: `Còn ${cl} ngày làm việc`, lop: "vang" };
    else tt = { ma: "dang", nhan: `Còn ${cl} ngày làm việc`, lop: "xam" };
    return { han: r.ngayHen, conLai: cl, tt, canhBao: r.canhBao };
  }

  TT.man["so-theo-doi"] = function (ctx) {
    const { mh, q } = ctx;
    const ds = docSo().map(h => ({ h, k: tinhHoSo(h, mh) }));
    const loc = q.tt || "";
    const dem = m => ds.filter(x => x.k.tt && x.k.tt.ma === m).length;
    const hien = ds.filter(x => !loc || (loc === "chua-tra" ? !x.h.daTra : x.k.tt && x.k.tt.ma === loc)).sort((a, b) => (a.h.daTra - b.h.daTra) || (a.k.han || 0) - (b.k.han || 0));
    const chonTT = `<select name="ma" class="chon-tt" aria-label="Thủ tục"><option value="">— Chọn thủ tục (điền sẵn thời hạn) —</option>${mh.PL.map(p => `<optgroup label="Phụ lục ${p.so}">${mh.thuTuc.filter(t => t.phuLuc === p.so).map(t => `<option value="${t.ma}">${t.ma} · ${e(t.ten.length > 80 ? t.ten.slice(0, 78) + "…" : t.ten)}</option>`).join("")}</optgroup>`).join("")}</select>`;
    const html = `<div class="trang">${tp.dauIn("Sổ theo dõi hạn giải quyết hồ sơ")}
      <div class="dong-tieu-de"><div><div class="nhan-trang">Công cụ</div><h1>Sổ theo dõi hạn giải quyết hồ sơ</h1>
        <div class="mo-ta">Ghi hồ sơ đã tiếp nhận, phần mềm tính hạn trả và cảnh báo hồ sơ sắp đến hạn, quá hạn. Dùng cho cá nhân cán bộ — không thay thế Hệ thống thông tin giải quyết TTHC.</div></div>
        <div class="phai khong-in"><button class="nut" id="so-xlsx">${bt("taiXuong", 15)} Xuất Excel</button><button class="nut" id="so-sao-luu">${bt("taiXuong", 15)} Sao lưu (JSON)</button><label class="nut">Khôi phục<input type="file" id="so-khoi-phuc" accept=".json" hidden></label></div></div>
      <div class="thong-bao thong-bao-xanh khong-in">${bt("thongTin")}<div><b>Dữ liệu chỉ lưu trên trình duyệt của máy này</b> (không gửi lên máy chủ). Xóa dữ liệu trình duyệt sẽ mất sổ — hãy <b>Sao lưu</b> định kỳ. Chỉ ghi thông tin cần thiết để theo dõi.</div></div>
      <div class="luoi luoi-4" style="margin-bottom:14px">
        ${[["qua-han", "Quá hạn", "var(--do-to)"], ["den-han", "Đến hạn hôm nay", "var(--do-to)"], ["sap-han", "Sắp đến hạn (≤ 2 ngày)", "var(--vang-to)"], ["dang", "Đang giải quyết", "var(--chinh)"]].map(([m, n, c]) => `<a class="the the-chi-so" style="--tong:${c}" href="#/so-theo-doi?tt=${m}"><div class="nhan-chi-so">${n}</div><div class="gia-tri">${dem(m)}</div><div class="chu-thich">Bấm để lọc</div></a>`).join("")}
      </div>
      <details class="the khong-in" ${ds.length ? "" : "open"} id="hop-them"><summary style="padding:12px 16px;cursor:pointer;font-weight:600">${bt("kiem", 15)} Thêm / sửa hồ sơ</summary>
        <form class="the-than form-nv" id="so-form" autocomplete="off"><input type="hidden" name="id">
          <label class="truong"><span>Số hồ sơ / mã biên nhận</span><input name="soHoSo" required></label>
          <label class="truong"><span>Người nộp (tên viết tắt nếu cần)</span><input name="nguoiNop"></label>
          <label class="truong" style="grid-column:1/-1"><span>Thủ tục</span>${chonTT}</label>
          <label class="truong"><span>Ngày nhận hồ sơ đầy đủ, hợp lệ</span><input type="date" name="ngayNhan" value="${th.khoa(new Date())}" required></label>
          <label class="truong"><span>Thời hạn</span><input name="soNgay" inputmode="decimal" required></label>
          <label class="truong"><span>Đơn vị</span><select name="donVi"><option>ngày làm việc</option><option value="ngày">ngày (ngày lịch)</option></select></label>
          <label class="o-chon"><input type="checkbox" name="kv3"> <span>Xã khu vực III, cộng thêm <input name="tangThem" class="o-so" value="10" inputmode="numeric"> ngày làm việc</span></label>
          <label class="truong"><span>Ngày làm việc không tính vào thời hạn</span><input name="tamDung" value="0" inputmode="numeric"></label>
          <label class="truong" style="grid-column:1/-1"><span>Ghi chú</span><input name="ghiChu"></label>
          <div style="grid-column:1/-1" class="tang"><button class="nut nut-chinh">${bt("kiem", 15)} Lưu hồ sơ</button><button type="reset" class="nut">Nhập lại</button><span class="chu-nho mo" id="so-tb"></span></div>
        </form></details>
      <div class="the" style="margin-top:14px"><div class="thanh-loc khong-in">${[["", "Tất cả"], ["chua-tra", "Chưa trả"], ["qua-han", "Quá hạn"], ["sap-han", "Sắp đến hạn"], ["tra-dung", "Đã trả đúng hạn"], ["tra-tre", "Đã trả trễ"]].map(([m, n]) => `<a class="nut nut-nho ${m === loc ? "chon" : ""}" href="#/so-theo-doi${m ? "?tt=" + m : ""}">${n}</a>`).join("")}<span class="chu-nho mo" style="margin-left:auto">${hien.length}/${ds.length} hồ sơ</span></div>
        ${hien.length ? `<div class="bang-cuon"><table class="bang dap-ung"><thead><tr><th>Số hồ sơ</th><th>Thủ tục</th><th>Ngày nhận</th><th>Hạn trả</th><th>Trạng thái</th><th class="khong-in"></th></tr></thead><tbody>
          ${hien.map(({ h, k }) => `<tr data-id="${e(h.id)}"><td data-nhan="Số hồ sơ"><b>${e(h.soHoSo)}</b>${h.nguoiNop ? `<div class="chu-nho mo">${e(h.nguoiNop)}</div>` : ""}${h.ghiChu ? `<div class="chu-nho mo">${e(h.ghiChu)}</div>` : ""}</td>
            <td data-nhan="Thủ tục" class="chu-nho">${h.ma ? `<a href="#/thu-tuc/${e(h.ma)}">${e(h.ma)}</a> ` : ""}${e(h.soNgay)} ${e(h.donVi || "ngày làm việc")}${h.kv3 ? ` + ${e(h.tangThem)} (KV III)` : ""}${+h.tamDung ? ` + ${e(h.tamDung)} không tính` : ""}</td>
            <td data-nhan="Ngày nhận">${e(TT.fmtNgay(h.ngayNhan))}</td><td data-nhan="Hạn trả"><b>${k.han ? e(th.hienThi(k.han)) : "—"}</b>${k.canhBao && k.canhBao.some(c => /TẠM TÍNH/.test(c)) ? ` <span class="nhan nhan-vang" title="Có ngày nghỉ Tết tạm tính">tạm tính</span>` : ""}</td>
            <td data-nhan="Trạng thái"><span class="nhan nhan-${k.tt ? k.tt.lop : "xam"}">${e(k.tt ? k.tt.nhan : "Lỗi ngày")}</span>${h.daTra ? `<div class="chu-nho mo">Trả ${e(TT.fmtNgay(h.ngayTra))}</div>` : ""}</td>
            <td class="khong-in"><span class="tang">${h.daTra ? `<button class="nut nut-nho" data-hanh-dong="mo-lai">Mở lại</button>` : `<button class="nut nut-nho nut-chinh" data-hanh-dong="tra">Đã trả</button>`}<button class="nut nut-nho" data-hanh-dong="sua">Sửa</button><button class="nut nut-nho nut-chu" data-hanh-dong="xoa" aria-label="Xóa hồ sơ ${e(h.soHoSo)}">${bt("dong", 13)}</button></span></td></tr>`).join("")}
        </tbody></table></div>` : `<div class="trong"><b>${ds.length ? "Không có hồ sơ phù hợp bộ lọc." : "Sổ chưa có hồ sơ."}</b>${ds.length ? `<a href="#/so-theo-doi">Bỏ lọc</a>` : "Nhập hồ sơ đầu tiên ở khung “Thêm / sửa hồ sơ”."}</div>`}</div></div>`;
    return { tieuDe: "Sổ theo dõi hạn hồ sơ", html, giuCuon: true,
      sau(root) {
        const f = root.querySelector("#so-form");
        f.ma.addEventListener("change", () => { const t = mh.thuTucTheoMa[f.ma.value]; if (!t) return; const h = t.suyRa.thoiHan; if (h) { f.soNgay.value = String(h.ngay).replace(".", ","); f.donVi.value = h.donVi; } const kv = th.tangThemKhuVucIII(t.muc[3] && t.muc[3].noiDung); if (kv) f.tangThem.value = kv.ngay; });
        f.addEventListener("submit", ev => {
          ev.preventDefault();
          const v = Object.fromEntries(new FormData(f).entries()); v.kv3 = !!f.kv3.checked; v.soNgay = String(v.soNgay).replace(",", ".");
          const ds0 = docSo(); const i = ds0.findIndex(x => x.id === v.id);
          if (i >= 0) ds0[i] = { ...ds0[i], ...v }; else ds0.push({ ...v, id: String(Date.now()), taoLuc: new Date().toISOString(), daTra: false });
          if (!ghiSo(ds0)) { root.querySelector("#so-tb").textContent = "Không lưu được (trình duyệt chặn lưu trữ)."; return; }
          dispatchEvent(new HashChangeEvent("hashchange"));
        });
        root.querySelector("tbody") && root.querySelector("tbody").addEventListener("click", ev => {
          const b = ev.target.closest("[data-hanh-dong]"); if (!b) return;
          const id = b.closest("tr").getAttribute("data-id"), ds0 = docSo(), h = ds0.find(x => x.id === id); if (!h) return;
          const hd = b.getAttribute("data-hanh-dong");
          if (hd === "xoa") { if (!confirm(`Xóa hồ sơ “${h.soHoSo}” khỏi sổ theo dõi?`)) return; ghiSo(ds0.filter(x => x.id !== id)); }
          else if (hd === "tra") { const d = prompt("Ngày trả kết quả (YYYY-MM-DD):", th.khoa(new Date())); if (!d || !th.tuKhoa(d)) return; h.daTra = true; h.ngayTra = d; ghiSo(ds0); }
          else if (hd === "mo-lai") { h.daTra = false; delete h.ngayTra; ghiSo(ds0); }
          else if (hd === "sua") { const hop = root.querySelector("#hop-them"); hop.open = true; for (const [k, v] of Object.entries(h)) if (f[k]) { if (f[k].type === "checkbox") f[k].checked = !!v; else f[k].value = v; } hop.scrollIntoView({ block: "start" }); return; }
          dispatchEvent(new HashChangeEvent("hashchange"));
        });
        root.querySelector("#so-xlsx").addEventListener("click", () => TT.excel.xuat(`So-theo-doi-ho-so-${th.khoa(new Date())}.xlsx`, [{
          ten: "Sổ theo dõi", rong: [16, 22, 10, 50, 12, 14, 14, 22, 12, 30],
          cot: ["Số hồ sơ", "Người nộp", "Mã thủ tục", "Tên thủ tục", "Ngày nhận", "Thời hạn", "Hạn trả", "Trạng thái", "Ngày trả", "Ghi chú"],
          dong: ds.map(({ h, k }) => [h.soHoSo, h.nguoiNop || "", h.ma || "", h.ma && mh.thuTucTheoMa[h.ma] ? mh.thuTucTheoMa[h.ma].ten : "", TT.fmtNgay(h.ngayNhan), `${h.soNgay} ${h.donVi || "ngày làm việc"}${h.kv3 ? " + " + h.tangThem + " KV III" : ""}${+h.tamDung ? " + " + h.tamDung + " không tính" : ""}`, k.han ? th.khoa(k.han).split("-").reverse().join("/") : "", k.tt ? k.tt.nhan : "", h.daTra ? TT.fmtNgay(h.ngayTra) : "", h.ghiChu || ""])
        }]));
        root.querySelector("#so-sao-luu").addEventListener("click", () => tp.xuatJson(`so-theo-doi-sao-luu-${th.khoa(new Date())}.json`, { phanMem: "tra-cuu-tthc-dat-dai-son-la", loai: "so-theo-doi", ngay: new Date().toISOString(), hoSo: docSo() }));
        root.querySelector("#so-khoi-phuc").addEventListener("change", ev => {
          const tep = ev.target.files[0]; if (!tep) return;
          tep.text().then(s => { const d = JSON.parse(s); const moi = Array.isArray(d) ? d : d.hoSo; if (!Array.isArray(moi)) throw new Error("Tệp không đúng định dạng sao lưu");
            const cu = docSo(), id = new Set(cu.map(x => x.id)); const gop = [...cu, ...moi.filter(x => x && x.soHoSo && !id.has(x.id))];
            if (confirm(`Khôi phục ${gop.length - cu.length} hồ sơ mới (giữ ${cu.length} hồ sơ đang có)?`)) { ghiSo(gop); dispatchEvent(new HashChangeEvent("hashchange")); } })
            .catch(err => alert("Không khôi phục được: " + err.message));
        });
      } };
  };
  TT.soTheoDoi = { tinhHoSo, conLai };
})();
