/* Tiện ích dùng chung: chuẩn hóa tiếng Việt, thoát HTML, định dạng. Không phụ thuộc giao diện. */
window.TT = window.TT || {};
TT.ti = (function () {
  const reDau = /[̀-ͯ]/g;

  // Bỏ dấu một ký tự (giữ 1 ký tự → 0..1 ký tự)
  function boDauKyTu(c) {
    if (c === "đ" || c === "Đ") return "d";
    return c.normalize("NFD").replace(reDau, "").toLowerCase();
  }

  // Chuẩn hóa để tìm kiếm: chữ thường, bỏ dấu, gộp khoảng trắng. Trả về chuỗi và bảng ánh xạ vị trí về chuỗi gốc.
  function chuanHoaCoMap(s) {
    let t = "", map = [], truocLaTrang = true;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (/\s/.test(c)) {
        if (!truocLaTrang) { t += " "; map.push(i); truocLaTrang = true; }
        continue;
      }
      const d = boDauKyTu(c);
      for (const ch of d) { t += ch; map.push(i); }
      truocLaTrang = false;
    }
    return { t, map };
  }
  function chuanHoa(s) { return chuanHoaCoMap(String(s || "")).t.trim(); }
  // Chuẩn hóa mạnh: thêm bỏ dấu câu (dùng nhận diện tên cơ quan)
  function chuanHoaManh(s) { return chuanHoa(s).replace(/[^a-z0-9/ ]+/g, " ").replace(/\s+/g, " ").trim(); }
  function gopTrang(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

  // Tìm cụm (đã chuẩn hóa) bắt đầu tại đầu một từ — tránh khớp giữa từ (vd. "an" trong "toan")
  const laChuSo = ch => /[a-z0-9]/.test(ch);
  function viTriDauTu(t, c, tu) {
    let i = t.indexOf(c, tu || 0);
    while (i > 0 && laChuSo(t[i - 1]) && laChuSo(c[0])) i = t.indexOf(c, i + 1);
    return i;
  }
  function chuaDauTu(t, c) { return viTriDauTu(t, c) >= 0; }

  const bangThoat ={ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function e(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => bangThoat[c]); }

  // Tô sáng các cụm (đã chuẩn hóa) trong văn bản gốc; trả về HTML an toàn
  function toSang(goc, cum) {
    goc = String(goc || "");
    const ds = (cum || []).filter(Boolean);
    if (!ds.length) return e(goc);
    const { t, map } = chuanHoaCoMap(goc);
    const vung = [];
    for (const c of ds) {
      let i = viTriDauTu(t, c);
      while (i >= 0) { vung.push([map[i], map[i + c.length - 1] + 1]); i = viTriDauTu(t, c, i + c.length); }
    }
    if (!vung.length) return e(goc);
    vung.sort((a, b) => a[0] - b[0]);
    const gop = [];
    for (const v of vung) { if (gop.length && v[0] <= gop[gop.length - 1][1]) gop[gop.length - 1][1] = Math.max(gop[gop.length - 1][1], v[1]); else gop.push(v.slice()); }
    let out = "", p = 0;
    for (const [a, b] of gop) { out += e(goc.slice(p, a)) + "<mark>" + e(goc.slice(a, b)) + "</mark>"; p = b; }
    return out + e(goc.slice(p));
  }

  // Trích đoạn quanh vị trí khớp đầu tiên
  function trichDoan(goc, cum, rong) {
    goc = gopTrang(goc); rong = rong || 90;
    const { t, map } = chuanHoaCoMap(goc);
    let vt = -1;
    for (const c of cum) { const i = viTriDauTu(t, c); if (i >= 0 && (vt < 0 || i < vt)) vt = i; }
    if (vt < 0) return goc.length > rong * 2 ? goc.slice(0, rong * 2) + "…" : goc;
    const g = map[vt];
    const a = Math.max(0, g - rong), b = Math.min(goc.length, g + rong);
    return (a > 0 ? "…" : "") + goc.slice(a, b) + (b < goc.length ? "…" : "");
  }

  function ngayHienTai() {
    const d = new Date();
    const p = n => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  // Chuẩn hóa ký hiệu mẫu: "04a" → "4a", "4B" → "4b"
  function chuanKyHieu(k) {
    k = String(k || "").trim().replace(/\.$/, "").toLowerCase();
    const m = k.match(/^0*(\d+)(.*)$/);
    return m ? m[1] + m[2] : k;
  }

  return { boDauKyTu, chuanHoa, chuanHoaCoMap, chuanHoaManh, gopTrang, e, toSang, trichDoan, ngayHienTai, chuanKyHieu, viTriDauTu, chuaDauTu };
})();
