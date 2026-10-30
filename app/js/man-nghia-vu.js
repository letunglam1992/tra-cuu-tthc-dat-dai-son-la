/* Màn hình: ước tính nghĩa vụ tài chính về đất đai (tham khảo) — giá đất tra từ Bảng giá đất tỉnh (TT.giaDat, TT.chonGia); bảng giá tự nhập từ Excel/CSV (tùy chọn). */
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
    "chuyen-muc-dich": ["giaTruoc", "giaSau", "heSo", "tyLeThu", "duocTru", "mienGiamPhanTram"], // diện tích: bảng lớp/vị trí
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
        <div class="mo-ta">Dự trù tiền sử dụng đất, tiền thuê đất, lệ phí trước bạ, thuế thu nhập cá nhân theo diện tích và giá đất. Mỗi khoản hiện công thức và căn cứ. Giá đất tra trực tiếp từ Bảng giá đất tỉnh Sơn La (Nghị quyết số 152/2025/NQ-HĐND, bổ sung theo Nghị quyết số 28/2026/NQ-HĐND): chọn xã, tuyến đường, vị trí.</div></div>
        <div class="phai khong-in"><button class="nut" onclick="window.print()">${bt("in", 15)} In phiếu dự trù</button></div></div>
      <div class="thong-bao thong-bao-vang">${bt("canhBao")}<div><b>Chỉ để tham khảo.</b> ${e(ch.ghiChuChung)} Các mức thu gắn nhãn “cần đối chiếu” phải kiểm tra với văn bản hiện hành.</div></div>
      <div class="luoi luoi-chinh" style="align-items:start"><div>
        ${mh.P ? the_phi(mh, ctx.q) : ""}
        <div id="ds-khoan" style="display:grid;gap:12px;margin-top:12px"></div>
        <div class="tang khong-in" style="margin-top:12px"><select id="loai-moi" aria-label="Loại khoản thu" class="chon-tt" style="max-width:420px">${Object.entries(ch.khoan).map(([k, v]) => `<option value="${k}">${e(v.ten)}</option>`).join("")}</select><button type="button" class="nut nut-chinh" id="them-khoan">${bt("kiem", 15)} Thêm khoản</button></div>
        <div class="the tong-du-tru" id="tong"></div>
      </div>
      <aside class="khong-in" style="display:grid;gap:16px;align-content:start">
        <div class="the"><div class="the-dau"><h3>Bảng giá đất tỉnh</h3><div class="phai" id="bgt-tt"></div></div><div class="the-than chu-nho" id="bgt"></div></div>
        <details class="the"><summary style="padding:12px 16px;cursor:pointer;font-weight:600">Bảng giá tự nhập (tùy chọn) <span id="bg-dem"></span></summary><div class="the-than chu-nho">
          <p style="margin-top:0">Dùng khi cần bảng giá khác (giá đất cụ thể, bảng giá đã sửa đổi…). Dán bảng từ Excel (có dòng tiêu đề) hoặc chọn tệp CSV. Cột cần có: <b>Xã/Phường</b>, <b>Tuyến đường/Khu vực</b>, <b>Vị trí</b>, <b>Loại đất</b>, <b>Giá</b>. Lưu trên trình duyệt này.</p>
          <textarea id="bg-dan" rows="4" placeholder="Dán bảng giá đất tại đây" style="width:100%;border:1px solid var(--vien-dam);border-radius:8px;padding:8px;background:var(--o-nhap)"></textarea>
          <div class="tang" style="margin-top:8px"><button type="button" class="nut nut-nho" id="bg-nhap">Nhập bảng giá</button><label class="nut nut-nho">Chọn tệp CSV<input type="file" id="bg-tep" accept=".csv,.txt,.tsv" hidden></label><button type="button" class="nut nut-nho" id="bg-mau">${bt("taiXuong", 13)} Tệp mẫu</button><button type="button" class="nut nut-nho nut-chu" id="bg-xoa">Xóa bảng giá</button></div>
          <div id="bg-tb" style="margin-top:8px"></div></div></details>
        <div class="the"><div class="the-dau"><h3>Tài liệu liên quan</h3></div><div class="the-than chu-nho" style="display:grid;gap:6px">
          <a href="#/gia-dat">Tra cứu Bảng giá đất tỉnh Sơn La</a><a href="#/quy-trinh">Quy trình luân chuyển hồ sơ xác định NVTC (Điều 15–18)</a><a href="#/mau-bieu/19">Mẫu số 19 — Phiếu chuyển thông tin xác định NVTC</a><a href="#/mau-bieu/34">Mẫu số 34 — Đơn đề nghị tính, tính lại tiền sử dụng đất</a></div></div>
      </aside></div></div>`;
    return { tieuDe: "Ước tính nghĩa vụ tài chính", html, sau(root) { khoiTao(root, mh, ctx.q); } };
  };

  function khoiTao(root, mh, q) {
    const ch = mh.B.nghiaVuTaiChinh, gd = TT.giaDat;
    let ds = doc(KHOA_DS, null) || [{ id: 1, loai: "chuyen-muc-dich", gt: {} }];
    let loiNap = "";
    const boChon = new Map(); // id khoản → { sau, truoc } (thành phần chọn giá)
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
      root.querySelector("#bg-dem").innerHTML = bangGia.length ? `<span class="nhan nhan-xanh">${bangGia.length} dòng</span>` : "";
    };
    function oTruong(k, khoan) {
      const [nhan, kieu] = TRUONG[k], gt = khoan.gt[k] ?? (k === "tyLe" && ch.khoan[khoan.loai].mucMacDinh != null ? String(ch.khoan[khoan.loai].mucMacDinh).replace(".", ",") : k === "tyLeThu" ? "100" : "");
      const coTra = kieu === "gia" && /^gia/.test(k) && k !== "giaTriChuyenNhuong" && khoan.loai !== "chuyen-muc-dich";
      const traGia = coTra ? `<button type="button" class="nut nut-nho" data-tra-gia="${k}">${bt("tim", 13)} Tra bảng giá</button>${bangGia.length ? `<button type="button" class="nut nut-nho nut-chu" data-tra-gia-tu-nhap="${k}">Bảng tự nhập</button>` : ""}` : "";
      const goiY = k === "tyLeThu" ? `<select data-goi-y aria-label="Gợi ý tỷ lệ thu" class="goi-y-ty-le" title="Chọn để điền tỷ lệ theo căn cứ">${ch.tyLeChuyenMucDich.map(x => `<option value="${x.giaTri == null ? "" : x.giaTri}">${e(x.nhan)}</option>`).join("")}</select>` : "";
      return `<label class="truong"><span>${e(nhan)}${k === "tyLe" && ch.khoan[khoan.loai].mucMacDinh != null ? ` <span class="nhan nhan-vang">mặc định ${String(ch.khoan[khoan.loai].mucMacDinh).replace(".", ",")}% — cần đối chiếu</span>` : ""}</span>
        <span class="tang"><input name="${k}" inputmode="decimal" value="${e(gt)}" autocomplete="off" style="flex:1;min-width:140px">${traGia}</span>${goiY}
        ${kieu === "gia" ? `<span class="mo chu-nho" data-chu="${k}"></span>` : ""}</label>`;
    }
    // ---------- Khoản chuyển mục đích: 4 bước (thửa đất → giá sau → giá trước → diện tích theo lớp) ----------
    const homNay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
    function cmd(kh) {
      const c = kh.gt.cmd || (kh.gt.cmd = {});
      c.ngay = c.ngay || homNay(); if (c.xa == null) c.xa = "";
      c.sau = c.sau || { loai: "o" }; c.truoc = c.truoc || { loai: "nn:HNK" };
      c.dc = c.dc || {}; c.truongHop = c.truongHop || "nn-giao-khong-thu";
      if (!Array.isArray(c.lop) || !c.lop.length) c.lop = [{ ten: "", dienTich: kh.gt.dienTich || "", pSau: "100", pTruoc: "100" }];
      return c;
    }
    const thHienTai = c => ch.truongHopChuyenMucDich.find(x => x.id === c.truongHop) || {};
    function veCMD(kh) {
      const c = cmd(kh), D = gd.D, th = thHienTai(c), bang0 = th.cachTinh === "bang-0";
      const nhomTH = [...new Set(ch.truongHopChuyenMucDich.map(x => x.nhom))];
      const oLop = (l, j) => `<tr data-lop="${j}"><td data-nhan="Lớp, vị trí"><input data-k="ten" value="${e(l.ten || "")}" placeholder="${c.lop.length > 1 ? "Lớp " + (j + 1) : "Toàn bộ diện tích"}" aria-label="Tên lớp ${j + 1}"></td>
        <td data-nhan="Diện tích (m²)"><input data-k="dienTich" inputmode="decimal" value="${e(l.dienTich || "")}" aria-label="Diện tích lớp ${j + 1} (m²)"></td>
        <td data-nhan="% giá sau"><input data-k="pSau" inputmode="decimal" value="${e(l.pSau ?? "100")}" aria-label="Tỷ lệ % giá sau, lớp ${j + 1}"></td>
        <td data-nhan="% giá trước"><input data-k="pTruoc" inputmode="decimal" value="${e(l.pTruoc ?? "100")}" aria-label="Tỷ lệ % giá trước, lớp ${j + 1}"></td>
        <td class="so" data-gia-lop="${j}"></td><td>${c.lop.length > 1 ? `<button type="button" class="nut nut-nho nut-chu" data-xoa-lop="${j}" aria-label="Xóa lớp ${j + 1}">${bt("dong", 13)}</button>` : ""}</td></tr>`;
      return `<div class="cmd">
        <div class="cmd-buoc"><div class="cmd-so">1</div><div class="cmd-noi"><h4>Thửa đất và trường hợp chuyển mục đích</h4>
          <div class="form-nv">
            <label class="truong"><span>Xã, phường nơi có thửa đất</span><select data-cmd="xa"><option value="">— Chọn xã, phường —</option>${D.xa.map((x, j) => `<option value="${j}"${String(c.xa) === String(j) ? " selected" : ""}>${e(x)}</option>`).join("")}</select></label>
            <label class="truong"><span>Thời điểm tính giá</span><input type="date" data-cmd="ngay" value="${e(c.ngay)}"></label>
            <label class="truong cmd-rong"><span>Trường hợp đất trước khi chuyển mục đích</span><select data-cmd="truongHop">${nhomTH.map(n => `<optgroup label="${e(n)}">${ch.truongHopChuyenMucDich.filter(x => x.nhom === n).map(x => `<option value="${x.id}"${x.id === c.truongHop ? " selected" : ""}>${e(x.nhan)}</option>`).join("")}</optgroup>`).join("")}</select></label>
            <label class="truong" data-th${th.cachTinh === "theo-thoi-han" ? "" : " hidden"}><span>Thời hạn giao, thuê đất trước khi chuyển (năm)</span><input data-cmd="thoiHanGoc" inputmode="decimal" value="${e(c.thoiHanGoc || "")}"></label>
            <label class="truong" data-th${th.cachTinh === "theo-thoi-han" ? "" : " hidden"}><span>Thời gian đã sử dụng (năm)</span><input data-cmd="daSuDung" inputmode="decimal" value="${e(c.daSuDung || "")}"></label>
          </div><p class="chu-nho mo cmd-can-cu">${e(th.canCu || "")}</p></div></div>
        <div class="cmd-buoc"><div class="cmd-so">2</div><div class="cmd-noi"><h4>Giá đất sau khi chuyển mục đích</h4>
          <div class="cg-sau"></div>
          <div class="cmd-dc"><label class="o-chon"><input type="checkbox" data-dc="chenhCao"${c.dc.chenhCao ? " checked" : ""}> <span>Chênh cao bình quân so với mặt đường ≥ 1,5 m — giảm 30% (khoản 3 Điều 4)</span></label>
            <label class="o-chon"><input type="checkbox" data-dc="duongDat"${c.dc.duongDat ? " checked" : ""}> <span>Vị trí 2–5, mặt đường là đường đất — 70% (khoản 4 Điều 4)</span></label></div>
          <div class="cmd-gia"><label class="truong"><span>Giá đất sau (đồng/m²) — chọn ở trên hoặc nhập</span><input name="giaSau" inputmode="decimal" value="${e(kh.gt.giaSau || "")}" autocomplete="off"></label><div class="cmd-nguon" data-nguon="sau"></div></div></div></div>
        <div class="cmd-buoc"><div class="cmd-so">3</div><div class="cmd-noi"><h4>Giá đất trước khi chuyển mục đích</h4>
          <div data-bang0${bang0 ? "" : " hidden"} class="thong-bao thong-bao-xanh" style="margin:0 0 8px">${bt("thongTin")}<div>Trường hợp này tiền đất trước khi chuyển mục đích bằng 0 — không cần giá đất trước.</div></div>
          <div data-khoi-truoc${bang0 ? " hidden" : ""}>
            <div class="tang" style="margin-bottom:8px"><button type="button" class="nut nut-nho" data-cung>${bt("luong", 13)} Cùng tuyến, cùng vị trí với giá sau</button><span class="chu-nho mo">— khi đất trước là đất phi nông nghiệp cùng tuyến (ví dụ đất thương mại, dịch vụ → đất ở).</span></div>
            <div class="cg-truoc"></div>
            <label class="o-chon" data-xen-kep${/^nn:/.test(c.truoc.loai) ? "" : " hidden"}><input type="checkbox" data-dc="xenKep"${c.dc.xenKep ? " checked" : ""}> <span>Đất nông nghiệp trong cùng thửa có đất ở hoặc xen kẹt với đất ở — tăng 50% (khoản 1 Điều 6)</span></label>
            <div class="cmd-gia"><label class="truong"><span>Giá đất trước (đồng/m²) — chọn ở trên hoặc nhập</span><input name="giaTruoc" inputmode="decimal" value="${e(kh.gt.giaTruoc || "")}" autocomplete="off"></label><div class="cmd-nguon" data-nguon="truoc"></div></div></div></div></div>
        <div class="cmd-buoc"><div class="cmd-so">4</div><div class="cmd-noi"><h4>Diện tích chuyển mục đích</h4>
          <p class="chu-nho mo" style="margin-top:0">Chia lớp khi các phần diện tích có giá khác nhau (phân lớp theo chiều sâu, khác vị trí…). Giá từng lớp = giá đã chọn × tỷ lệ %.</p>
          <div class="bang-cuon"><table class="bang bang-gon dap-ung cmd-lop"><thead><tr><th>Lớp, vị trí</th><th>Diện tích (m²)</th><th>% giá sau</th><th>% giá trước</th><th class="so">Giá sau / trước (đồng/m²)</th><th></th></tr></thead><tbody>${c.lop.map(oLop).join("")}</tbody></table></div>
          <div class="tang" style="margin-top:8px"><button type="button" class="nut nut-nho" data-them-lop>${bt("kiem", 13)} Thêm lớp</button><button type="button" class="nut nut-nho" data-phan-lop title="Điền tỷ lệ % theo khoản 6 Điều 4 Nghị quyết 152/2025">Áp tỷ lệ phân lớp chiều sâu (khoản 6 Điều 4)</button><span class="chu-nho mo" data-tong-dt></span></div></div></div>
        <div class="form-nv" style="margin-top:4px">${["heSo", "tyLeThu", "duocTru", "mienGiamPhanTram"].map(f => oTruong(f, kh)).join("")}</div>
      </div>`;
    }
    // Giá từ lựa chọn trong bảng giá (đã áp điều chỉnh) → ô giá + dòng nguồn
    function giaTuChon(c, phia) {
      const t = c[phia], dc = c.dc;
      if (/^nn:/.test(t.loai)) return t.nn && c.xa !== "" || t.nn === "RSX" ? gd.giaNNDieuChinh(c.xa === "" ? -1 : c.xa, t.nn, dc.xenKep) : null;
      if (t.tuyen == null || !t.viTri) return null;
      const r = gd.giaViTri(t.tuyen, t.viTri, dc); if (!r) return null;
      const tu = gd.tuyen(t.tuyen); r.vb = tu.vb; r.chuaHieuLuc = !gd.coHieuLuc(tu.vb, c.ngay); r.xaKhac = c.xa !== "" && tu.xa !== +c.xa;
      return r;
    }
    function apGia(sec, kh, phia, giuNhap) {
      const c = cmd(kh), r = giaTuChon(c, phia), o = sec.querySelector(`[name="${phia === "sau" ? "giaSau" : "giaTruoc"}"]`);
      if (r && !giuNhap) { o.value = nv.soVN(r.gia, 0); kh.gt[o.name] = o.value; c["nguon" + phia] = true; }
      veNguon(sec, kh, phia);
    }
    function veNguon(sec, kh, phia) {
      const c = cmd(kh), el = sec.querySelector(`[data-nguon="${phia}"]`); if (!el) return;
      const r = c["nguon" + phia] ? giaTuChon(c, phia) : null;
      if (!r) { el.innerHTML = kh.gt[phia === "sau" ? "giaSau" : "giaTruoc"] ? `<span class="nhan nhan-xam">Nhập tay</span>` : ""; return; }
      el.innerHTML = `<div class="chu-nho"><b>Nguồn:</b> ${e(r.moTa)}${r.buoc.length ? ` · giá bảng ${e(nv.tien(r.goc))}/m², ${e(r.buoc.join("; "))}` : ""}</div>
        ${r.chuaHieuLuc ? `<div class="chu-nho" style="color:var(--vang)">⚠ Tuyến thuộc ${e(gd.vanBan(r.vb).ten)} — có hiệu lực từ ${e(r.vb != null ? gd.vanBan(r.vb).hieuLucTu.split("-").reverse().join("/") : "")}, sau thời điểm tính giá đã chọn.</div>` : ""}
        ${r.vb === 1 && gd.vanBan(1).chuaXuLy ? `<div class="chu-nho mo">${e(gd.vanBan(1).chuaXuLy)}</div>` : ""}
        ${r.xaKhac ? `<div class="chu-nho" style="color:var(--vang)">⚠ Tuyến thuộc xã, phường khác với xã đã chọn ở bước 1.</div>` : ""}
        ${(r.canhBao || []).map(x => `<div class="chu-nho" style="color:var(--vang)">⚠ ${e(x)} — đúng như văn bản, đề nghị đối chiếu.</div>`).join("")}`;
    }
    function ganCMD(sec, kh) {
      const c = cmd(kh), cu = boChon.get(kh.id);
      const sau = TT.chonGia.tao(sec.querySelector(".cg-sau"), { loaiCho: ["o", "tmdv", "skc"], trangThai: c.sau, layXa: () => c.xa, layNgay: () => c.ngay,
        onChon: () => { apGia(sec, kh, "sau"); luu(); tinhTatCa(); }, onDoi: luu, onDoiLoai: () => { c.nguonsau = false; luu(); } });
      const truoc = TT.chonGia.tao(sec.querySelector(".cg-truoc"), { loaiCho: ["nn", "tmdv", "skc", "o"], trangThai: c.truoc, layXa: () => c.xa, layNgay: () => c.ngay,
        onChon: () => { apGia(sec, kh, "truoc"); luu(); tinhTatCa(); }, onDoi: luu,
        onDoiLoai: tt => { c.nguontruoc = false; sec.querySelector("[data-xen-kep]").hidden = !/^nn:/.test(tt.loai); luu(); } });
      boChon.set(kh.id, { sau, truoc, cu });
      veNguon(sec, kh, "sau"); veNguon(sec, kh, "truoc"); veLop(sec, kh);
    }
    function veLop(sec, kh) {
      const c = cmd(kh), gs = nv.so(kh.gt.giaSau), gt = nv.so(kh.gt.giaTruoc), bang0 = thHienTai(c).cachTinh === "bang-0";
      let tong = 0;
      c.lop.forEach((l, j) => {
        const o = sec.querySelector(`[data-gia-lop="${j}"]`); if (!o) return;
        const ps = nv.so(l.pSau), pt = nv.so(l.pTruoc), s1 = nv.so(l.dienTich); if (isFinite(s1)) tong += s1;
        o.textContent = `${isFinite(gs) && isFinite(ps) ? nv.soVN(Math.round(gs * ps / 100), 0) : "—"} / ${bang0 ? "0" : isFinite(gt) && isFinite(pt) ? nv.soVN(Math.round(gt * pt / 100), 0) : "—"}`;
      });
      const el = sec.querySelector("[data-tong-dt]"); if (el) el.textContent = c.lop.length > 1 ? `Tổng diện tích: ${nv.soVN(tong)} m²` : "";
    }
    function tsCMD(kh, ts) {
      const c = cmd(kh), gs = nv.so(ts.giaSau), gt = nv.so(ts.giaTruoc), bang0 = thHienTai(c).cachTinh === "bang-0";
      ts.truongHop = c.truongHop; ts.thoiHanGoc = c.thoiHanGoc; ts.daSuDung = c.daSuDung;
      ts.lop = c.lop.map((l, j) => {
        const ps = isFinite(nv.so(l.pSau)) ? nv.so(l.pSau) : 100, pt = isFinite(nv.so(l.pTruoc)) ? nv.so(l.pTruoc) : 100;
        return { ten: l.ten || (c.lop.length > 1 ? "Lớp " + (j + 1) : ""), dienTich: l.dienTich, giaSau: isFinite(gs) ? Math.round(gs * ps / 100) : NaN, giaTruoc: bang0 ? "" : isFinite(gt) ? Math.round(gt * pt / 100) : NaN };
      });
      return ts;
    }
    const nguonCMD = kh => { const c = cmd(kh); return ["sau", "truoc"].map(p => c["nguon" + p] ? giaTuChon(c, p) : null).map((r, i) => r ? `<div class="chu-nho mo"><b>Giá đất ${i ? "trước" : "sau"}:</b> ${e(r.moTa)}${r.buoc.length ? "; " + e(r.buoc.join("; ")) : ""}</div>` : "").join(""); };

    function ve() {
      if (!gd.daNap() && ds.some(x => x.loai === "chuyen-muc-dich")) {
        dsEl.innerHTML = loiNap ? `<div class="thong-bao thong-bao-do">${bt("canhBao")}<div>${e(loiNap)} <button type="button" class="nut nut-nho" data-nap-lai>Thử lại</button></div></div>` : `<div class="the"><div class="the-than mo">Đang tải Bảng giá đất tỉnh…</div></div>`;
        return;
      }
      dsEl.innerHTML = ds.map((kh, i) => { const k = ch.khoan[kh.loai]; return `<section class="the khoan-nv" data-id="${kh.id}"><div class="the-dau"><span class="so-muc">${i + 1}</span><h3>${e(k.ten)}</h3>
        <div class="phai">${k.canXacMinh ? `<span class="nhan nhan-vang">Cần đối chiếu</span>` : ""}<button type="button" class="nut nut-nho nut-chu khong-in" data-xoa-khoan aria-label="Xóa khoản ${i + 1}">${bt("dong", 14)}</button></div></div>
        <div class="the-than">${kh.loai === "chuyen-muc-dich" ? veCMD(kh) : `<div class="form-nv">${THEO_LOAI[kh.loai].map(f => oTruong(f, kh)).join("")}</div>`}<div class="kq-khoan" aria-live="polite"></div></div></section>`; }).join("");
      ds.forEach(kh => { if (kh.loai === "chuyen-muc-dich") ganCMD(dsEl.querySelector(`[data-id="${kh.id}"]`), kh); });
      tinhTatCa();
    }
    function tinhTatCa() {
      let tong = tongPhi, du = true;
      ds.forEach(kh => {
        const sec = dsEl.querySelector(`[data-id="${kh.id}"]`); if (!sec) return;
        let ts = { loai: kh.loai }; for (const f of THEO_LOAI[kh.loai]) { const o = sec.querySelector(`[name="${f}"]`); ts[f] = o ? o.value : ""; }
        if (kh.loai === "chuyen-muc-dich") { ts = tsCMD(kh, ts); veLop(sec, kh); }
        for (const el of sec.querySelectorAll("[data-chu]")) { const v = nv.so(ts[el.getAttribute("data-chu")]); el.textContent = isFinite(v) && v > 0 ? nv.tien(v) : ""; }
        const r = nv.tinh(ts, ch), kq = sec.querySelector(".kq-khoan");
        if (r.loi) { kq.innerHTML = `<p class="mo chu-nho">${e(r.loi)}</p>`; du = false; return; }
        tong += r.soTien;
        const bangLop = r.chiTiet && r.chiTiet.length > 1 ? `<table class="bang bang-gon" style="margin-top:6px"><thead><tr><th>Lớp</th><th class="so">Diện tích</th><th class="so">Tiền đất sau</th><th class="so">Tiền đất trước</th></tr></thead><tbody>${r.chiTiet.map(x => `<tr><td>${e(x.ten)}</td><td class="so">${nv.soVN(x.dienTich)} m²</td><td class="so">${e(nv.tien(x.tienSau))}</td><td class="so">${e(nv.tien(x.tienTruoc))}</td></tr>`).join("")}<tr><td><b>Cộng</b></td><td></td><td class="so"><b>${e(nv.tien(r.tienSau))}</b></td><td class="so"><b>${e(nv.tien(r.tienTruoc))}</b></td></tr></tbody></table>` : "";
        kq.innerHTML = `<div class="kq-nv"><div class="k">Số tiền ước tính${kh.loai === "thue-hang-nam" ? " (mỗi năm)" : ""}</div><div class="v">${e(nv.tien(r.soTien))}</div><div class="chu-nho"><i>${e(r.bangChu)}</i></div>
          ${bangLop}<div class="chu-nho" style="margin-top:6px"><b>Công thức:</b> ${e(r.congThuc)}</div>
          ${r.truongHop ? `<div class="chu-nho"><b>Trường hợp:</b> ${e(r.truongHop)} (${e(r.canCuTruongHop)})</div>` : ""}
          ${kh.loai === "chuyen-muc-dich" ? nguonCMD(kh) : ""}
          <div class="chu-nho mo"><b>Căn cứ:</b> ${e(r.canCu)}</div>
          ${r.canhBao.map(c => `<div class="chu-nho" style="color:var(--vang)">• ${e(c)}</div>`).join("")}</div>`;
      });
      tongEl.innerHTML = `<div class="the-than"><div class="k">Tổng dự trù ${ds.some(x => x.loai === "thue-hang-nam") ? "(tiền thuê hằng năm tính cho 1 năm)" : ""}</div><div class="ngay-hen">${e(nv.tien(tong))}</div><div class="chu-nho"><i>${e(nv.docSo(tong))}</i>${du ? "" : " · còn khoản thiếu số liệu"}</div><div class="chu-nho mo" style="margin-top:6px">Lập ngày ${ti.ngayHienTai()} bằng phần mềm tra cứu — không phải Thông báo nộp tiền.</div></div>`;
    }
    const khoanCua = sec => ds.find(x => String(x.id) === sec.getAttribute("data-id"));
    function suaCMD(ev, sec, kh) {
      const c = cmd(kh), t = ev.target;
      if (t.hasAttribute("data-cmd")) {
        const k = t.getAttribute("data-cmd"); c[k] = t.value;
        if (k === "xa" || k === "ngay") { const b = boChon.get(kh.id); b.sau.ve(); b.truoc.ve(); veNguon(sec, kh, "sau"); veNguon(sec, kh, "truoc"); }
        if (k === "truongHop") {
          const th = thHienTai(c); sec.querySelectorAll("[data-th]").forEach(x => { x.hidden = th.cachTinh !== "theo-thoi-han"; });
          sec.querySelector("[data-bang0]").hidden = th.cachTinh !== "bang-0"; sec.querySelector("[data-khoi-truoc]").hidden = th.cachTinh === "bang-0";
          sec.querySelector(".cmd-can-cu").textContent = th.canCu || "";
        }
        return true;
      }
      if (t.hasAttribute("data-dc")) { c.dc[t.getAttribute("data-dc")] = t.checked; apGia(sec, kh, "sau", !c.nguonsau); apGia(sec, kh, "truoc", !c.nguontruoc); return true; }
      const tr = t.closest("[data-lop]");
      if (tr && t.getAttribute("data-k")) { c.lop[+tr.getAttribute("data-lop")][t.getAttribute("data-k")] = t.value; return true; }
      if (t.name === "giaSau" || t.name === "giaTruoc") { c["nguon" + (t.name === "giaSau" ? "sau" : "truoc")] = false; veNguon(sec, kh, t.name === "giaSau" ? "sau" : "truoc"); }
      return false;
    }
    dsEl.addEventListener("input", ev => {
      const sec = ev.target.closest("[data-id]"); if (!sec) return;
      const kh = khoanCua(sec);
      if (ev.target.closest(".cg")) return; // ô tìm trong thành phần chọn giá tự xử lý
      if (kh.loai === "chuyen-muc-dich" && (ev.target.type === "checkbox" || ev.target.tagName === "SELECT")) return; // xử lý ở sự kiện change
      const daXuLy = kh.loai === "chuyen-muc-dich" && suaCMD(ev, sec, kh);
      if (!daXuLy && ev.target.name) kh.gt[ev.target.name] = ev.target.value;
      luu(); tinhTatCa();
    });
    dsEl.addEventListener("change", ev => {
      const sec = ev.target.closest("[data-id]");
      if (ev.target.matches("[data-goi-y]") && ev.target.value) { const o = ev.target.closest(".truong").querySelector("input"); o.value = ev.target.value; o.dispatchEvent(new Event("input", { bubbles: true })); return; }
      if (!sec || ev.target.closest(".cg")) return;
      const kh = khoanCua(sec);
      if (kh.loai === "chuyen-muc-dich" && (ev.target.type === "checkbox" || ev.target.tagName === "SELECT") && suaCMD(ev, sec, kh)) { luu(); tinhTatCa(); }
    });
    dsEl.addEventListener("click", ev => {
      if (ev.target.closest("[data-nap-lai]")) { loiNap = ""; ve(); napBangGia(); return; }
      const sec = ev.target.closest("[data-id]"); if (!sec) return;
      const kh = khoanCua(sec);
      if (ev.target.closest("[data-xoa-khoan]")) { ds = ds.filter(x => x !== kh); boChon.delete(kh.id); luu(); ve(); return; }
      const nut = ev.target.closest("[data-tra-gia]"); if (nut) { moTraGiaTinh(nut, sec.querySelector(`[name="${nut.getAttribute("data-tra-gia")}"]`)); return; }
      const nutTN = ev.target.closest("[data-tra-gia-tu-nhap]"); if (nutTN) { moTraGia(nutTN, sec.querySelector(`[name="${nutTN.getAttribute("data-tra-gia-tu-nhap")}"]`)); return; }
      if (kh.loai !== "chuyen-muc-dich") return;
      const c = cmd(kh);
      if (ev.target.closest("[data-them-lop]")) { c.lop.push({ ten: "", dienTich: "", pSau: "100", pTruoc: "100" }); luu(); ve(); return; }
      const xl = ev.target.closest("[data-xoa-lop]"); if (xl) { c.lop.splice(+xl.getAttribute("data-xoa-lop"), 1); luu(); ve(); return; }
      if (ev.target.closest("[data-phan-lop]")) {
        const loaiSau = c.sau.loai, laNNTruoc = /^nn:/.test(c.truoc.loai);
        c.lop.forEach((l, j) => { l.pSau = String(gd.tyLeLop(loaiSau, j + 1)).replace(".", ","); l.pTruoc = laNNTruoc ? "100" : String(gd.tyLeLop(c.truoc.loai, j + 1)).replace(".", ","); if (!l.ten) l.ten = `Lớp ${j + 1} (${gd.PHAN_LOP[loaiSau === "o" ? "o" : "pnn"].moc[Math.min(j, gd.PHAN_LOP[loaiSau === "o" ? "o" : "pnn"].moc.length - 1)]})`; });
        luu(); ve(); return;
      }
      if (ev.target.closest("[data-cung]")) {
        const s0 = c.sau; if (s0.tuyen == null) { alert("Chọn giá đất sau (tuyến, vị trí) trước."); return; }
        const tu = gd.tuyen(s0.tuyen), loaiT = /^nn:/.test(c.truoc.loai) || c.truoc.loai === s0.loai ? (s0.loai === "o" ? "tmdv" : "o") : c.truoc.loai;
        const cung = gd.timTuyen({ loai: loaiT, xa: tu.xa, toiDa: 100000 }).find(x => x.ten === tu.ten && x.stt === tu.stt && x.vb === tu.vb);
        if (!cung) { alert("Không tìm thấy tuyến tương ứng trong bảng giá " + gd.TEN_LOAI[loaiT].toLowerCase() + "."); return; }
        Object.assign(c.truoc, { loai: loaiT, tuyen: cung.i, viTri: s0.viTri, nn: null, q: tu.ten.slice(0, 40) });
        luu(); ve(); const s2 = dsEl.querySelector(`[data-id="${kh.id}"]`); apGia(s2, kh, "truoc"); luu(); tinhTatCa();
      }
    });
    root.querySelector("#them-khoan").addEventListener("click", () => { ds.push({ id: Date.now(), loai: root.querySelector("#loai-moi").value, gt: {} }); luu(); ve(); });

    // Tra Bảng giá đất tỉnh cho ô giá của các khoản khác (giao đất, thuê đất, lệ phí trước bạ)
    function moTraGiaTinh(nut, oNhap) {
      const cu = root.querySelector(".tra-gia"); if (cu) cu.remove();
      if (!gd.daNap()) { napBangGia().then(() => moTraGiaTinh(nut, oNhap)); return; }
      const hop = document.createElement("div"); hop.className = "tra-gia the";
      const tt = { xa: "" };
      hop.innerHTML = `<div class="the-than"><div class="tang" style="justify-content:space-between"><label class="truong" style="flex:1;min-width:200px"><span>Xã, phường</span><select data-xa><option value="">— Toàn tỉnh —</option>${gd.D.xa.map((x, j) => `<option value="${j}">${e(x)}</option>`).join("")}</select></label><button type="button" class="nut nut-nho nut-chu" data-dong-tra aria-label="Đóng">${bt("dong", 14)}</button></div><div class="cg-o"></div></div>`;
      nut.closest(".truong").after(hop);
      const w = TT.chonGia.tao(hop.querySelector(".cg-o"), { loaiCho: ["o", "tmdv", "skc", "nn"], trangThai: {}, layXa: () => tt.xa, layNgay: homNay,
        onChon: s => { const r = /^nn:/.test(s.loai) ? gd.giaNNDieuChinh(tt.xa === "" ? -1 : tt.xa, s.nn, false) : gd.giaViTri(s.tuyen, s.viTri); if (!r) return; oNhap.value = nv.soVN(r.gia, 0); oNhap.dispatchEvent(new Event("input", { bubbles: true })); hop.remove(); } });
      hop.querySelector("[data-xa]").addEventListener("change", ev => { tt.xa = ev.target.value; w.ve(); });
      hop.querySelector("[data-dong-tra]").addEventListener("click", () => hop.remove());
    }

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
    // Bảng giá đất tỉnh: nạp khi mở công cụ; thẻ bên phải tóm tắt nguồn, hiệu lực
    function veBGT() {
      const el = root.querySelector("#bgt"), tt = root.querySelector("#bgt-tt"); if (!el) return;
      if (!gd.daNap()) { tt.innerHTML = loiNap ? `<span class="nhan nhan-do">Lỗi tải</span>` : `<span class="nhan nhan-xam">Đang tải…</span>`; el.innerHTML = loiNap ? e(loiNap) : "Đang tải dữ liệu…"; return; }
      const D = gd.D, so = l => D.tuyen.filter(t => t[0] === l).length;
      tt.innerHTML = `<span class="nhan nhan-xanh">${D.xa.length} xã, phường</span>`;
      el.innerHTML = `<p style="margin-top:0">${D.vanBan.map(v => `<b>${e(v.ten)}</b> — hiệu lực từ ${e(v.hieuLucTu.split("-").reverse().join("/"))}`).join("<br>")}</p>
        <p>${so(0).toLocaleString("vi-VN")} tuyến đất ở · ${so(1).toLocaleString("vi-VN")} tuyến TM-DV · ${so(2).toLocaleString("vi-VN")} tuyến SXKD phi nông nghiệp · giá đất nông nghiệp ${D.xa.length} xã, phường.</p>
        <p class="mo">${e(D.vanBan[1].chuaXuLy || "")}</p><p class="mo">Nguồn dữ liệu: phần mềm GPMB và phần mềm Tính tiền đất đai và môi trường (cùng tác giả). <a href="#/gia-dat">Mở trang tra cứu giá đất</a></p>`;
    }
    function napBangGia() {
      return gd.nap().then(() => { veBGT(); ve(); }, err => { loiNap = err.message; veBGT(); ve(); });
    }
    // Mở từ trang Tra cứu giá đất: #/nghia-vu?gia=<tuyến>-<vị trí> → thêm khoản chuyển mục đích có sẵn giá sau
    if (q && q.gia) {
      const [i, vt] = String(q.gia).split("-").map(Number);
      napBangGia().then(() => {
        const t = gd.tuyen(i); if (!t) return;
        const kh = { id: Date.now(), loai: "chuyen-muc-dich", gt: {} }, c = cmd(kh);
        c.xa = String(t.xa); Object.assign(c.sau, { loai: t.loai, tuyen: i, viTri: vt || 1, q: t.ten.slice(0, 40) });
        ds = ds.filter(x => !(x.loai === "chuyen-muc-dich" && !x.gt.giaSau)); ds.unshift(kh);
        ve(); apGia(dsEl.querySelector(`[data-id="${kh.id}"]`), kh, "sau"); luu(); tinhTatCa();
        history.replaceState(null, "", "#/nghia-vu");
      });
    }
    veBG(); veBGT(); ve(); tinhPhi();
    if (!gd.daNap()) napBangGia();
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
