#!/usr/bin/env node
/* Dựng app/du-lieu/bang-gia-dat.js từ dữ liệu bảng giá đất của hai phần mềm cùng tác giả:
 *   1) Phần mềm GPMB (letunglam1992/phanmemGPMB): policy/nguon/nq152-2025-bang-gia-dat.json
 *      — Bảng giá đất ban hành kèm Nghị quyết số 152/2025/NQ-HĐND (trích từ bản Word, có cảnh báo dòng bất thường). Dùng làm NGUỒN CHÍNH.
 *   2) Nghị quyết số 28/2026/NQ-HĐND: cong-cu/du-lieu/nq28-2026.json (dựng từ phụ biểu Excel bằng cong-cu/nq28-excel-sang-json.py) —
 *      Phụ lục I–III bổ sung giá, Phụ lục IV điều chỉnh tên tuyến, Phụ lục V bãi bỏ tuyến.
 *   3) Phần mềm Tính tiền đất đai và môi trường (letunglam1992/tinhtiendatdai): chỉ để đối chiếu chéo giá.
 * Đồng thời ghi tai-lieu/doi-chieu-bang-gia-dat.md: các ô giá Nghị quyết 152 hai phần mềm ghi khác nhau, để tác giả rà soát.
 *
 * Cách dùng: node cong-cu/nhap-bang-gia-dat.js <đường dẫn phanmemGPMB> <đường dẫn tinhtiendatdai> [nq28-2026.json]
 */
const fs = require("fs"), path = require("path");
const [gpmbDir, ttddDir, nq28Arg] = process.argv.slice(2);
const nq28Json = nq28Arg || path.join(__dirname, "du-lieu", "nq28-2026.json");
if (!gpmbDir || !ttddDir) { console.error("Cách dùng: node cong-cu/nhap-bang-gia-dat.js <phanmemGPMB> <tinhtiendatdai>"); process.exit(1); }
const GOC = path.join(__dirname, "..");

const G = JSON.parse(fs.readFileSync(path.join(gpmbDir, "policy/nguon/nq152-2025-bang-gia-dat.json"), "utf8"));
const html = fs.readFileSync(path.join(ttddDir, "index.html"), "utf8");
const m = html.match(/<script id="seed-data" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) throw new Error("Không thấy khối seed-data trong tinhtiendatdai/index.html");
const seed = JSON.parse(m[1]).data;
const L = seed.landfine_landprice_v1, nhatKy = seed.landfine_decree_log_v1 || [];
const nk28 = nhatKy.find(x => /28\/2026\/NQ-HĐND/.test(x.name));
if (!nk28) throw new Error("Nhật ký văn bản của tinhtiendatdai không có Nghị quyết 28/2026");
const soDong28 = +((nk28.note.match(/bổ sung (\d+) dòng/) || [])[1]);
if (!soDong28) throw new Error("Không đọc được số dòng bổ sung theo Nghị quyết 28/2026");

const LOAI = [["dat_o", "Đất ở"], ["dat_tmdv", "Đất thương mại, dịch vụ"], ["dat_skc", "Đất cơ sở sản xuất phi nông nghiệp"]];
const xa = [...G.danh_muc_xa], xaIdx = new Map(xa.map((x, i) => [x, i]));
const nhom = [], nhomIdx = new Map();
const layNhom = s => { s = s || ""; if (!nhomIdx.has(s)) { nhomIdx.set(s, nhom.length); nhom.push(s); } return nhomIdx.get(s); };
const tuyen = [];

// 1) Nghị quyết 152/2025 (GPMB)
LOAI.forEach(([k], li) => {
  for (const r of G[k]) {
    if (!xaIdx.has(r.xa)) throw new Error("Xã ngoài danh mục: " + r.xa);
    const dong = [li, xaIdx.get(r.xa), 0, r.bang, String(r.stt), layNhom(r.nhom), r.tuyen, r.vt.map(v => v == null ? null : v)];
    if (r.canh_bao && r.canh_bao.length) dong.push(r.canh_bao);
    tuyen.push(dong);
  }
});
const BANG_LOAI = ["05", "06", "07"];
// 2) Nghị quyết 28/2026 — Phụ lục I–III (bổ sung giá) từ phụ biểu Excel (cong-cu/du-lieu/nq28-2026.json, dựng bằng cong-cu/nq28-excel-sang-json.py)
const N28 = JSON.parse(fs.readFileSync(nq28Json, "utf8"));
let stt28 = 0;
[N28.plI, N28.plII, N28.plIII].forEach((ds, li) => {
  for (const r of ds) {
    if (!xaIdx.has(r.xa)) throw new Error("Nghị quyết 28: xã ngoài danh mục: " + r.xa);
    const vt = r.vt.map(v => v == null ? null : v), n = vt.length;
    const dong = [li, xaIdx.get(r.xa), 1, BANG_LOAI[li], "", layNhom(r.nhom || ""), r.ten, vt];
    const cb = []; for (let j = 1; j < n; j++) if (vt[j] != null && vt[j - 1] != null && vt[j] > vt[j - 1]) { cb.push("Giá vị trí sau cao hơn vị trí trước"); break; }
    if (vt.some(v => v == null)) cb.push("Có vị trí trống");
    if (cb.length) dong.push(cb);
    tuyen.push(dong); stt28++;
  }
});
// Đối chiếu với phần bổ sung đã nhập ở phần mềm Tính tiền đất đai (kiểm tra chéo giá)
const bs = L.slice(-soDong28), giaTTDD = new Map();
for (const r of bs) { const mm = r.zone.match(/^((?:Xã|Phường) [^,]+), (.*), Vị trí (\d)$/); if (mm) giaTTDD.set(`${r.type}|${mm[1]}|${mm[2]}|${mm[3]}`, r.price / 1000); }
let khopTTDD = 0, khacTTDD = 0;
tuyen.filter(t => t[2] === 1).forEach(t => t[7].forEach((v, j) => { const k = [LOAI[t[0]][1], xa[t[1]], (nhom[t[5]] ? nhom[t[5]] + ": " : "") + t[6], j + 1].join("|"), k2 = [LOAI[t[0]][1], xa[t[1]], t[6], j + 1].join("|"); const g = giaTTDD.has(k) ? giaTTDD.get(k) : giaTTDD.get(k2); if (g == null || v == null) return; g === v ? khopTTDD++ : khacTTDD++; }));
console.log(`Nghị quyết 28 Phụ lục I–III: ${stt28} tuyến; đối chiếu phần mềm Tính tiền: ${khopTTDD} ô khớp, ${khacTTDD} ô khác`);

// Đất nông nghiệp, khu/cụm công nghiệp (Nghị quyết 152)
const TEN_NN = { LUC: "Đất chuyên trồng lúa (lúa hai vụ)", LUK: "Đất trồng lúa còn lại (lúa một vụ, lúa nương)", HNK: "Đất trồng cây hàng năm khác", CLN: "Đất trồng cây lâu năm", NTS: "Đất nuôi trồng thủy sản", RSX: "Đất rừng sản xuất" };
const nn = G.dat_nong_nghiep.filter(r => r.xa !== "Toàn tỉnh").map(r => [xaIdx.get(r.xa), r.loai_dat, r.gia, r.bang]);
const nnToanTinh = G.dat_nong_nghiep.filter(r => r.xa === "Toàn tỉnh").map(r => [r.loai_dat, r.gia, r.bang]);
const kcn = G.dat_kcn_ccn.map(r => [r.ten, xaIdx.has(r.xa) ? xaIdx.get(r.xa) : -1, r.gia, r.bang]);

// Phụ lục IV (điều chỉnh tên tuyến), Phụ lục V (bãi bỏ tuyến) Nghị quyết 28/2026 → phần tử thứ 10 của dòng tuyến NQ 152:
//   { doiTen: {ten, tu, can}, doiNhom: {ten, tu, can}, baiBo: {tu, can} }. Áp cho cả Bảng 05, 06, 07 (cùng tên tuyến).
// Khớp theo xã + STT của Nghị quyết 152; dòng “-” khớp theo tên trong nhóm; dòng số nguyên không có dòng con = cả nhóm (hoặc tuyến đứng riêng).
const tu28 = N28.hieuLucTu, nghiepVu = { doiTen: 0, doiNhom: 0, baiBo: 0, boQua: [], khongKhop: [], nghiNgo: [], lechStt: [] };
const chuan = s => String(s || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function giong(a, b) { // hệ số Dice trên cặp ký tự
  a = chuan(a); b = chuan(b); if (a === b) return 1; if (a.length < 2 || b.length < 2) return 0;
  const m = new Map(); for (let i = 0; i < a.length - 1; i++) { const k = a.slice(i, i + 2); m.set(k, (m.get(k) || 0) + 1); }
  let c = 0; for (let i = 0; i < b.length - 1; i++) { const k = b.slice(i, i + 2), v = m.get(k); if (v) { c++; m.set(k, v - 1); } }
  return 2 * c / (a.length + b.length - 2);
}
const dong152 = xaTen => tuyen.filter(t => t[2] === 0 && t[1] === xaIdx.get(xaTen));
const soNhom = t => (nhom[t[5]] || "").match(/^(\d+)\./) ? nhom[t[5]].match(/^(\d+)\./)[1] : (/^\d+$/.test(t[4]) ? t[4] : (t[4].match(/^(\d+)\./) || [])[1]);
function khopPL(ds, coMoi) {
  const ra = []; let nhomHienTai = null;
  ds.forEach((r, i) => {
    if (!xaIdx.has(r.xa)) { nghiepVu.khongKhop.push(`${r.xa} ${r.stt}: xã ngoài danh mục`); return; }
    const ke = ds[i + 1], laSoNguyen = /^\d+$/.test(r.stt);
    if (laSoNguyen) nhomHienTai = r.stt;
    if (coMoi && !r.moi) return;                                   // tiêu đề nhóm/nhóm con, không đổi tên
    if (coMoi && /^Sửa đổi STT/i.test(r.moi)) { nghiepVu.boQua.push(`${r.xa} ${r.stt}: ${r.moi}`); return; }
    const coCon = laSoNguyen && ke && ke.xa === r.xa && (ke.stt.startsWith(r.stt + ".") || ke.stt === "-");
    const cung = dong152(r.xa);
    let chon = [], kieu;
    if (laSoNguyen) {
      chon = cung.filter(t => soNhom(t) === r.stt); kieu = "nhom";
      if (!coMoi && coCon) return;            // tiêu đề nhóm có dòng con được liệt kê
    } else if (r.stt === "-") {
      const ung = cung.filter(t => t[4] === "-" && (!nhomHienTai || soNhom(t) === nhomHienTai));
      const tot = Math.max(0, ...ung.map(t => giong(t[6], r.cu))); chon = ung.filter(t => giong(t[6], r.cu) === tot && tot >= 0.5); kieu = "tuyen";
    } else {
      const ung = cung.filter(t => t[4] === r.stt);
      // STT trùng (ví dụ hai dòng 5.1): giữ dòng giống tên cũ nhất trong mỗi bảng
      const tot = l => Math.max(0, ...ung.filter(t => t[0] === l).map(t => giong(t[6], r.cu)));
      chon = ung.filter(t => giong(t[6], r.cu) === tot(t[0])); kieu = "tuyen";
    }
    // STT ghi trong Phụ lục không khớp tên ở Nghị quyết 152 → tìm theo tên trong cùng xã (ghi lại để báo cáo)
    const simTuyen = ds2 => Math.max(0, ...ds2.map(t => giong(t[6], r.cu)));
    if (kieu === "tuyen" && simTuyen(chon) < 0.6) {
      const tot = l => Math.max(0, ...cung.filter(t => t[0] === l).map(t => giong(t[6], r.cu)));
      const theoTen = cung.filter(t => giong(t[6], r.cu) === tot(t[0]) && tot(t[0]) >= 0.85);
      if (theoTen.length) { nghiepVu.lechStt.push(`${r.xa}: Phụ lục ghi STT ${r.stt} “${r.cu.slice(0, 70)}” — tên này ở STT ${theoTen[0][4]} của Nghị quyết 152 (STT ${r.stt} là “${(chon[0] ? chon[0][6] : "—").slice(0, 60)}”); áp dụng theo tên`); chon = theoTen; }
    }
    if (!chon.length) { nghiepVu.khongKhop.push(`${r.xa} ${r.stt}: ${r.cu.slice(0, 80)}`); return; }
    const sim = kieu === "nhom" ? Math.max(...chon.map(t => Math.max(giong(nhom[t[5]].replace(/^\d+\.\s*/, ""), r.cu), giong(t[6], r.cu)))) : Math.max(...chon.map(t => giong(t[6], r.cu)));
    if (sim < 0.75) nghiepVu.nghiNgo.push(`${r.xa} ${r.stt} (${sim.toFixed(2)}): PL “${r.cu.slice(0, 70)}” ↔ NQ152 “${(kieu === "nhom" && nhom[chon[0][5]] ? nhom[chon[0][5]] : chon[0][6]).slice(0, 70)}”`);
    ra.push({ r, chon, kieu });
  });
  return ra;
}
const gan = (t, k, v) => { while (t.length < 9) t.push([]); t[9] = { ...(t[9] || {}), [k]: v }; };
for (const { r, chon, kieu } of khopPL(N28.plIV, true)) {
  const can = `Phụ lục IV Nghị quyết 28/2026, ${r.xa} STT ${r.stt}`;
  for (const t of chon) {
    if (kieu === "nhom" && nhom[t[5]]) { gan(t, "doiNhom", { ten: `${r.stt}. ${r.moi}`, tu: tu28, can }); nghiepVu.doiNhom++; }
    else { gan(t, "doiTen", { ten: r.moi, tu: tu28, can }); nghiepVu.doiTen++; }
  }
}
for (const { r, chon } of khopPL(N28.plV, false)) for (const t of chon) { gan(t, "baiBo", { tu: tu28, can: `Phụ lục V Nghị quyết 28/2026, ${r.xa} STT ${r.stt}` }); nghiepVu.baiBo++; }
console.log(`Phụ lục IV: ${nghiepVu.doiTen} dòng đổi tên tuyến, ${nghiepVu.doiNhom} dòng đổi tên nhóm; Phụ lục V: ${nghiepVu.baiBo} dòng bãi bỏ (gồm cả 3 bảng)`);
if (nghiepVu.khongKhop.length) console.warn("KHÔNG KHỚP:\n  " + nghiepVu.khongKhop.join("\n  "));
if (nghiepVu.nghiNgo.length) console.warn("TÊN CŨ KHÁC NHIỀU (kiểm tra):\n  " + nghiepVu.nghiNgo.join("\n  "));
if (nghiepVu.lechStt.length) console.warn("STT TRONG PHỤ LỤC LỆCH VỚI NGHỊ QUYẾT 152 (áp theo tên):\n  " + nghiepVu.lechStt.join("\n  "));
if (nghiepVu.boQua.length) console.log("Bỏ qua (chỉ đổi STT):\n  " + nghiepVu.boQua.join("\n  "));
const du = {
  phienBan: new Date().toISOString().slice(0, 10),
  donVi: 1000, // giá trong tệp: nghìn đồng/m²
  vanBan: [
    { id: "nq152", ten: "Nghị quyết số 152/2025/NQ-HĐND ngày 29/12/2025 của HĐND tỉnh Sơn La ban hành Bảng giá đất", hieuLucTu: G.hieu_luc_tu, nguon: "Phần mềm GPMB Sơn La — policy/nguon/nq152-2025-bang-gia-dat.json (trích từ bản Word)" },
    { id: "nq28", ten: "Nghị quyết số 28/2026/NQ-HĐND ngày 19/10/2026 của HĐND tỉnh Sơn La (sửa đổi, bổ sung Bảng giá đất)", hieuLucTu: N28.hieuLucTu, nguon: "Phụ biểu Excel kèm Nghị quyết (" + N28.nguon + "), đối chiếu bản ký",
      chuaXuLy: `Đã áp dụng Phụ lục I–III (${stt28} tuyến bổ sung), Phụ lục IV (đổi tên ${nghiepVu.doiTen + nghiepVu.doiNhom} dòng), Phụ lục V (bãi bỏ ${nghiepVu.baiBo} dòng) và Điều 2 (bãi bỏ khoản 3 Điều 4 — giảm 30% do chênh cao) từ ${N28.hieuLucTu.split("-").reverse().join("/")}. Khoản 8 Điều 7 (đất thương mại, dịch vụ có nguồn gốc đất ở = 90% giá đất ở): chọn ở công cụ tính tiền.`,
      lechStt: nghiepVu.lechStt }
  ],
  loai: LOAI.map(([, t]) => t), bangLoai: BANG_LOAI, xa, nhom, tuyen, tenNN: TEN_NN, nn, nnToanTinh, kcn
};
const dauTep = `/* Bảng giá đất tỉnh Sơn La — TỆP SINH TỰ ĐỘNG bởi cong-cu/nhap-bang-gia-dat.js, không sửa tay.
 * Nguồn: Nghị quyết số 152/2025/NQ-HĐND (phần mềm GPMB); Nghị quyết số 28/2026/NQ-HĐND (phụ biểu Excel kèm Nghị quyết, cong-cu/du-lieu/nq28-2026.json).
 * tuyen: [loại (0 đất ở | 1 TM-DV | 2 SXKD PNN), chỉ số xã, văn bản (0 NQ152 | 1 NQ28), bảng, STT, chỉ số nhóm, tên tuyến, [giá VT1..VT5 nghìn đồng/m²], cảnh báo?, thay đổi theo NQ 28?]
 * nn: [chỉ số xã, mã loại đất, giá nghìn đồng/m², bảng] */
`;
fs.writeFileSync(path.join(GOC, "app/du-lieu/bang-gia-dat.js"), dauTep + "window.QD75_BANG_GIA = " + JSON.stringify(du) + ";\n");

// Báo cáo đối chiếu NQ 152 giữa hai phần mềm
const tenZone = (r, i) => `${r.xa}, ${r.tuyen}, Vị trí ${i + 1}`;
const gp = new Map();
LOAI.forEach(([k, t]) => { for (const r of G[k]) r.vt.forEach((v, i) => { if (v != null) gp.set(t + "|" + tenZone(r, i), v * 1000); }); });
const khac = [];
const vtTuyen = new Map(); // giá các vị trí của từng tuyến (GPMB) — nhận biết lệch cột
LOAI.forEach(([k, t]) => { for (const r of G[k]) { const kk = t + "|" + r.xa + ", " + r.tuyen; if (!vtTuyen.has(kk)) vtTuyen.set(kk, []); vtTuyen.get(kk).push(r.vt.map(v => v == null ? null : v * 1000)); } });
let lechCot = 0;
for (const r of L.slice(0, -soDong28)) {
  const k = r.type + "|" + r.zone; if (!gp.has(k) || gp.get(k) === r.price) continue;
  const mm = r.zone.match(/^(.*), Vị trí (\d)$/), dsVt = vtTuyen.get(r.type + "|" + mm[1]) || [];
  const lech = dsVt.some(vt => vt.some((v, j) => j !== +mm[2] - 1 && v === r.price));
  if (lech) lechCot++;
  khac.push([r.type, r.zone, gp.get(k), r.price, lech]);
}
const thieu = [...gp.keys()].filter(k => !L.some(r => r.type + "|" + r.zone === k)).length;
const md = [`# Đối chiếu Bảng giá đất Nghị quyết 152/2025 giữa hai phần mềm`, ``,
  `Sinh tự động bởi \`cong-cu/nhap-bang-gia-dat.js\` ngày ${du.phienBan}. Phần mềm tra cứu TTHC dùng dữ liệu **phần mềm GPMB** (trích từ bản Word) làm nguồn chính cho Nghị quyết 152; phần bổ sung theo Nghị quyết 28/2026 lấy từ phần mềm Tính tiền đất đai và môi trường (${stt28} tuyến, ${soDong28} ô giá).`, ``,
  `- Ô giá cùng xã, cùng tuyến, cùng vị trí nhưng **khác giá**: **${khac.length}**.`,
  `- Trong đó **${lechCot}** ô có giá trùng với giá của một vị trí khác trên cùng tuyến (dấu hiệu lệch cột khi nhập, ví dụ giá vị trí 2 ghi vào vị trí 4) — đánh dấu “lệch cột” trong bảng.`,
  `- Ô giá có trong GPMB nhưng phần mềm Tính tiền ghi khác tên tuyến/xã (hoặc không có): ${thieu}.`, ``,
  `Đề nghị rà soát dữ liệu của phần mềm Tính tiền đất đai theo văn bản gốc.`, ``,
  `| Loại đất | Xã, tuyến, vị trí | GPMB (đồng/m²) | Tính tiền đất đai (đồng/m²) | Ghi chú |`, `|---|---|---:|---:|---|`,
  ...khac.map(([t, z, a, b, lech]) => `| ${t} | ${z.replace(/\|/g, "/")} | ${a.toLocaleString("vi-VN")} | ${b.toLocaleString("vi-VN")} | ${lech ? "lệch cột" : ""} |`)];
fs.writeFileSync(path.join(GOC, "tai-lieu/doi-chieu-bang-gia-dat.md"), md.join("\n") + "\n");
console.log(`Đã ghi app/du-lieu/bang-gia-dat.js: ${xa.length} xã, ${tuyen.length} tuyến (NQ 28: ${stt28}), ${nn.length} giá đất nông nghiệp. Đối chiếu: ${khac.length} ô khác giá.`);
