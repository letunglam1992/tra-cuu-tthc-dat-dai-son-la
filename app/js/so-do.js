/* Sơ đồ luồng công việc dạng làn (swimlane): mỗi cột là một cơ quan/chủ thể, mỗi hàng là một nấc trình tự.
 * Cạnh vẽ vuông góc; phân biệt luồng chính, điều kiện, trả lại, gửi đồng thời. Hỗ trợ phóng to/thu nhỏ/kéo, chọn nút. */
window.TT = window.TT || {};
TT.soDo = (function () {
  const ti = TT.ti, e = ti.e;
  const LANE_W = 210, DAU_H = 44, HANG_H = 124, NUT_W = 182, NUT_H = 84, LE = 14;

  function ngat(text, toiDa, soDong) {
    const tu = String(text).split(/\s+/); const dong = []; let cur = "";
    for (const w of tu) {
      if ((cur + " " + w).trim().length > toiDa && cur) { dong.push(cur); cur = w; } else cur = (cur + " " + w).trim();
    }
    if (cur) dong.push(cur);
    if (dong.length > soDong) { const d = dong.slice(0, soDong); d[soDong - 1] = d[soDong - 1].replace(/.{0,2}$/, "") + "…"; return d; }
    return dong;
  }
  function nhanLane(ten) { return ngat(ten, 26, 2); }

  function ve(khung, qt, mh, opts) {
    opts = opts || {};
    const lanes = qt.lanes;
    const soHang = Math.max(...qt.buoc.map(b => b.hang)) + 1;
    const W = lanes.length * LANE_W, H = DAU_H + soHang * HANG_H + 10;
    const viTri = {};
    for (const b of qt.buoc) {
      const c = lanes.indexOf(b.lane);
      const x = c * LANE_W + (LANE_W - NUT_W) / 2, y = DAU_H + b.hang * HANG_H + (HANG_H - NUT_H) / 2;
      viTri[b.id] = { x, y, w: NUT_W, h: NUT_H, cx: x + NUT_W / 2, cy: y + NUT_H / 2, cot: c, hang: b.hang };
    }
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Sơ đồ ${e(qt.ten)}">
      <defs>${["chinh", "tra-lai", "dieu-kien", "dong-thoi"].map(l => `<marker id="mui-${l}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="sd-mui-${l}" style="fill:${{ "chinh": "var(--chu-phu)", "tra-lai": "var(--do-to)", "dieu-kien": "var(--vang-to)", "dong-thoi": "var(--xanh-duong-to)" }[l]}"/></marker>`).join("")}</defs>`;
    // Làn
    lanes.forEach((id, i) => {
      const ten = (mh.coQuanTheoId[id] || { ten: id }).ten;
      s += `<rect class="sd-lane-nen ${i % 2 ? "le" : ""}" x="${i * LANE_W}" y="0" width="${LANE_W}" height="${H}"/>`;
      s += `<line class="sd-lane-vien" x1="${i * LANE_W}" y1="0" x2="${i * LANE_W}" y2="${H}"/>`;
      const dl = nhanLane(ten);
      dl.forEach((d, k) => { s += `<text class="sd-lane-ten" x="${i * LANE_W + LANE_W / 2}" y="${18 + k * 15 - (dl.length - 1) * 4}" text-anchor="middle">${e(d)}</text>`; });
    });
    s += `<line class="sd-lane-vien" x1="0" y1="${DAU_H - 6}" x2="${W}" y2="${DAU_H - 6}"/>`;
    // Cạnh
    const demCap = {};
    for (const c of qt.canh) {
      const a = viTri[c.tu], b = viTri[c.den]; if (!a || !b) continue;
      let d, lx, ly;
      if (a.hang === b.hang) {
        // cùng hàng: nối ngang giữa hai cạnh đối diện; lệch dọc để tách chiều đi/về
        const lech = c.loai === "tra-lai" ? 14 : c.loai === "dieu-kien" ? -14 : 0;
        const phai = b.cx > a.cx;
        const x1 = phai ? a.x + a.w : a.x, x2 = phai ? b.x : b.x + b.w;
        d = `M${x1} ${a.cy + lech} L${x2} ${b.cy + lech}`; lx = (x1 + x2) / 2; ly = a.cy + lech - 5;
      } else if (b.hang > a.hang) {
        const yGiua = b.y - (HANG_H - NUT_H) / 2;
        const k = `${c.tu}>${b.hang}`; demCap[k] = (demCap[k] || 0) + 1;
        const xRa = a.cot === b.cot ? a.cx : a.cx + (b.cx > a.cx ? 1 : -1) * Math.min(30, (demCap[k] - 1) * 18);
        if (Math.abs(xRa - b.cx) < 1) { d = `M${xRa} ${a.y + a.h} L${b.cx} ${b.y}`; lx = b.cx + 6; ly = (a.y + a.h + b.y) / 2 + 4; }
        else { d = `M${xRa} ${a.y + a.h} L${xRa} ${yGiua} L${b.cx} ${yGiua} L${b.cx} ${b.y}`; lx = (xRa + b.cx) / 2; ly = yGiua - 5; }
      } else {
        // đi ngược lên: vòng qua mép làn
        const xMep = Math.max(a.x + a.w, b.x + b.w) + LE;
        d = `M${a.x + a.w} ${a.cy + 10} L${xMep} ${a.cy + 10} L${xMep} ${b.cy + 10} L${b.x + b.w} ${b.cy + 10}`; lx = xMep + 4; ly = (a.cy + b.cy) / 2;
      }
      s += `<path class="sd-canh ${c.loai}" d="${d}" marker-end="url(#mui-${c.loai})"/>`;
      if (c.nhan) {
        const anchor = a.hang === b.hang || (b.hang > a.hang && Math.abs(lx - b.cx) > 1) ? "middle" : "start";
        s += `<text class="sd-nhan-canh" x="${lx}" y="${ly}" text-anchor="${anchor}">${e(c.nhan)}</text>`;
      }
    }
    // Nút
    let thuTu = 0;
    for (const b of qt.buoc) {
      const p = viTri[b.id];
      if (b.loai === "buoc" || b.loai === "nhanh") thuTu++;
      const so = b.loai === "nhanh" ? "Xử lý ngoại lệ" : b.loai === "batdau" ? "Bắt đầu" : b.loai === "ketthuc" ? "Kết thúc" : "Bước " + thuTu;
      const dong = ngat(b.ten, 27, b.thoiHan ? 2 : 3);
      const han = b.thoiHan ? (b.thoiHan.ngay != null ? `${String(b.thoiHan.ngay).replace(".", ",")} ngày làm việc` : (b.thoiHan.nguyenVan ? "Hạn: " + b.thoiHan.nguyenVan.replace(/^chậm nhất /, "") : "Không quy định thời hạn")) : "";
      s += `<g class="sd-nut ${b.loai}" data-buoc="${e(b.id)}" tabindex="0" role="button" aria-label="${e(so + ": " + b.ten + (han ? ". " + han : ""))}">
        <title>${e(b.ten)}</title>
        <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${b.loai === "batdau" || b.loai === "ketthuc" ? 22 : 9}"/>
        <text class="sd-so" x="${p.x + 10}" y="${p.y + 16}">${e(so.toUpperCase())}</text>
        ${dong.map((d, i) => `<text x="${p.x + 10}" y="${p.y + 33 + i * 15}">${e(d)}</text>`).join("")}
        ${han ? `<text class="sd-han ${b.thoiHan.ngay == null ? "khong" : ""}" x="${p.x + 10}" y="${p.y + p.h - 9}">${e(ngat(han, 30, 1)[0])}</text>` : ""}
      </g>`;
    }
    s += `</svg>`;
    khung.innerHTML = s;
    const svg = khung.querySelector("svg");
    const vb = { x: 0, y: 0, w: W, h: H };
    const datVB = () => svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    // Khung rộng: chiều cao khung co theo sơ đồ (xem trọn, chữ đủ lớn). Khung hẹp (điện thoại): giữ tỉ lệ ~0,8 và kéo để xem.
    let hep = false;
    const TI_LE_TOI_DA = 1.1; // không phóng sơ đồ ít làn quá to trên màn hình rộng
    function vuaKhung() {
      const bw = khung.clientWidth || 800;
      hep = bw < 760;
      if (hep) {
        khung.style.height = Math.round(Math.min(window.innerHeight * 0.7, (H + 12) * 0.8)) + "px";
        vb.w = bw / 0.8; vb.h = khung.clientHeight / 0.8; vb.x = -6; vb.y = -6;
      } else {
        const tiLe = Math.min(bw / (W + 20), TI_LE_TOI_DA);
        khung.style.height = Math.round((H + 12) * tiLe) + "px";
        vb.w = bw / tiLe; vb.h = H + 12; vb.x = -(vb.w - W) / 2; vb.y = -6;
      }
      datVB();
    }
    function toanBo() { vb.x = -10; vb.y = -6; vb.w = W + 20; vb.h = H + 12; datVB(); }
    function zoom(heSo, cx, cy) {
      const r = svg.getBoundingClientRect();
      const px = cx == null ? vb.x + vb.w / 2 : vb.x + (cx - r.left) / r.width * vb.w;
      const py = cy == null ? vb.y + vb.h / 2 : vb.y + (cy - r.top) / r.height * vb.h;
      const w2 = Math.min(W * 4, Math.max(W / 6, vb.w * heSo)), h2 = vb.h * (w2 / vb.w);
      vb.x = px - (px - vb.x) * (w2 / vb.w); vb.y = py - (py - vb.y) * (h2 / vb.h); vb.w = w2; vb.h = h2; datVB();
    }
    vuaKhung();
    let henCo; const coLai = () => { clearTimeout(henCo); henCo = setTimeout(() => { if (document.body.contains(khung)) vuaKhung(); }, 150); };
    window.addEventListener("resize", coLai);
    // Cuộn chuột giữ nguyên hành vi cuộn trang; Ctrl + cuộn để phóng to/thu nhỏ quanh con trỏ
    svg.addEventListener("wheel", ev => { if (!ev.ctrlKey && !ev.metaKey) return; ev.preventDefault(); zoom(ev.deltaY > 0 ? 1.12 : 1 / 1.12, ev.clientX, ev.clientY); }, { passive: false });
    let keo = null;
    svg.addEventListener("pointerdown", ev => { if (ev.target.closest(".sd-nut")) return; keo = { x: ev.clientX, y: ev.clientY, vx: vb.x, vy: vb.y }; svg.setPointerCapture(ev.pointerId); });
    svg.addEventListener("pointermove", ev => { if (!keo) return; const r = svg.getBoundingClientRect(); vb.x = keo.vx - (ev.clientX - keo.x) / r.width * vb.w; vb.y = keo.vy - (ev.clientY - keo.y) / r.height * vb.h; datVB(); });
    svg.addEventListener("pointerup", () => { keo = null; });
    svg.addEventListener("pointercancel", () => { keo = null; });
    const chon = id => {
      svg.querySelectorAll(".sd-nut").forEach(n => n.classList.toggle("chon", n.getAttribute("data-buoc") === id));
      if (opts.khiChon) opts.khiChon(id);
    };
    svg.querySelectorAll(".sd-nut").forEach(n => {
      n.addEventListener("click", () => chon(n.getAttribute("data-buoc")));
      n.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); chon(n.getAttribute("data-buoc")); } });
    });
    window.addEventListener("beforeprint", () => { if (document.body.contains(khung)) { khung.style.height = "auto"; toanBo(); } });
    window.addEventListener("afterprint", () => { if (document.body.contains(khung)) vuaKhung(); });
    return { phongTo: () => zoom(1 / 1.25), thuNho: () => zoom(1.25), vuaKhung: () => (hep ? toanBo() : vuaKhung()), datLai: vuaKhung, chon };
  }
  return { ve };
})();
