#!/usr/bin/env node
/* Dựng app/du-lieu/bang-gia-dat.js từ dữ liệu bảng giá đất của hai phần mềm cùng tác giả:
 *   1) Phần mềm GPMB (letunglam1992/phanmemGPMB): policy/nguon/nq152-2025-bang-gia-dat.json
 *      — Bảng giá đất ban hành kèm Nghị quyết số 152/2025/NQ-HĐND (trích từ bản Word, có cảnh báo dòng bất thường). Dùng làm NGUỒN CHÍNH.
 *   2) Phần mềm Tính tiền đất đai và môi trường (letunglam1992/tinhtiendatdai): index.html, khối seed-data
 *      — chỉ lấy phần bổ sung theo Nghị quyết số 28/2026/NQ-HĐND (Phụ lục I–III), là các dòng nhập sau dòng cuối của Nghị quyết 152.
 * Đồng thời ghi tai-lieu/doi-chieu-bang-gia-dat.md: các ô giá Nghị quyết 152 hai phần mềm ghi khác nhau, để tác giả rà soát.
 *
 * Cách dùng: node cong-cu/nhap-bang-gia-dat.js <đường dẫn phanmemGPMB> <đường dẫn tinhtiendatdai>
 */
const fs = require("fs"), path = require("path");
const [gpmbDir, ttddDir] = process.argv.slice(2);
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
// 2) Nghị quyết 28/2026 (tinhtiendatdai: các dòng cuối)
const bs = L.slice(-soDong28), gom = new Map();
for (const r of bs) {
  const li = LOAI.findIndex(([, t]) => t === r.type);
  const mm = r.zone.match(/^((?:Xã|Phường) [^,]+), (.*), Vị trí (\d)$/);
  if (li < 0 || !mm || !xaIdx.has(mm[1])) throw new Error("Dòng Nghị quyết 28 không đọc được: " + JSON.stringify(r));
  const khoa = li + "|" + mm[1] + "|" + mm[2];
  if (!gom.has(khoa)) gom.set(khoa, { li, xa: mm[1], ten: mm[2], vt: [null, null, null, null, null] });
  gom.get(khoa).vt[+mm[3] - 1] = r.price / 1000;
}
let stt28 = 0;
for (const t of gom.values()) {
  // "Nhóm: tuyến" — tách phần trước dấu hai chấm làm tên nhóm (khu vực/trục chính)
  const i = t.ten.indexOf(": ");
  const nh = i > 0 ? t.ten.slice(0, i) : "", ten = i > 0 ? t.ten.slice(i + 2) : t.ten;
  let n = 5; while (n > 0 && t.vt[n - 1] == null) n--;
  const dong = [t.li, xaIdx.get(t.xa), 1, BANG_LOAI[t.li], "", layNhom(nh), ten, t.vt.slice(0, n)];
  const cb = []; for (let j = 1; j < n; j++) if (t.vt[j] != null && t.vt[j - 1] != null && t.vt[j] > t.vt[j - 1]) { cb.push("Giá vị trí sau cao hơn vị trí trước"); break; }
  if (t.vt.slice(0, n).some(v => v == null)) cb.push("Có vị trí trống");
  if (cb.length) dong.push(cb);
  tuyen.push(dong); stt28++;
}

// Đất nông nghiệp, khu/cụm công nghiệp (Nghị quyết 152)
const TEN_NN = { LUC: "Đất chuyên trồng lúa (lúa hai vụ)", LUK: "Đất trồng lúa còn lại (lúa một vụ, lúa nương)", HNK: "Đất trồng cây hàng năm khác", CLN: "Đất trồng cây lâu năm", NTS: "Đất nuôi trồng thủy sản", RSX: "Đất rừng sản xuất" };
const nn = G.dat_nong_nghiep.filter(r => r.xa !== "Toàn tỉnh").map(r => [xaIdx.get(r.xa), r.loai_dat, r.gia, r.bang]);
const nnToanTinh = G.dat_nong_nghiep.filter(r => r.xa === "Toàn tỉnh").map(r => [r.loai_dat, r.gia, r.bang]);
const kcn = G.dat_kcn_ccn.map(r => [r.ten, xaIdx.has(r.xa) ? xaIdx.get(r.xa) : -1, r.gia, r.bang]);

const du = {
  phienBan: new Date().toISOString().slice(0, 10),
  donVi: 1000, // giá trong tệp: nghìn đồng/m²
  vanBan: [
    { id: "nq152", ten: "Nghị quyết số 152/2025/NQ-HĐND ngày 29/12/2025 của HĐND tỉnh Sơn La ban hành Bảng giá đất", hieuLucTu: G.hieu_luc_tu, nguon: "Phần mềm GPMB Sơn La — policy/nguon/nq152-2025-bang-gia-dat.json (trích từ bản Word)" },
    { id: "nq28", ten: "Nghị quyết số 28/2026/NQ-HĐND ngày 19/10/2026 của HĐND tỉnh Sơn La (sửa đổi, bổ sung Bảng giá đất)", hieuLucTu: nk28.effect, nguon: "Phần mềm Tính tiền đất đai và môi trường — dữ liệu giá bổ sung (Phụ lục I–III)",
      chuaXuLy: "Chưa áp dụng Phụ lục IV (đổi tên tuyến), Phụ lục V (bãi bỏ tuyến) và khoản 8 Điều 7 (đất thương mại, dịch vụ có nguồn gốc đất ở = 90% giá đất ở) — đối chiếu văn bản khi tra tuyến có liên quan." }
  ],
  loai: LOAI.map(([, t]) => t), bangLoai: BANG_LOAI, xa, nhom, tuyen, tenNN: TEN_NN, nn, nnToanTinh, kcn
};
const dauTep = `/* Bảng giá đất tỉnh Sơn La — TỆP SINH TỰ ĐỘNG bởi cong-cu/nhap-bang-gia-dat.js, không sửa tay.
 * Nguồn: Nghị quyết số 152/2025/NQ-HĐND (phần mềm GPMB) và phần bổ sung theo Nghị quyết số 28/2026/NQ-HĐND (phần mềm Tính tiền đất đai và môi trường).
 * tuyen: [loại (0 đất ở | 1 TM-DV | 2 SXKD PNN), chỉ số xã, văn bản (0 NQ152 | 1 NQ28), bảng, STT, chỉ số nhóm, tên tuyến, [giá VT1..VT5 nghìn đồng/m²], cảnh báo?]
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
