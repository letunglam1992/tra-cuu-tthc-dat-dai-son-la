#!/usr/bin/env node
/* Dựng dữ liệu nguyên văn văn bản pháp luật đất đai cho phần mềm từ bộ “phap-ly-dat-dai” (references/van-ban/*.md, danh-muc.json).
 * Mỗi văn bản → app/du-lieu/phap-luat/<MÃ>.js (nạp khi cần); danh mục, quy tắc nhận diện, bản đồ “Điều được sửa đổi tại” → app/du-lieu/phap-luat/danh-muc.js.
 * Cách dùng: node cong-cu/nhap-phap-luat.js <thư mục references của bộ phap-ly-dat-dai>
 */
const fs = require("fs"), path = require("path");
const nguon = process.argv[2];
if (!nguon) { console.error("Cách dùng: node cong-cu/nhap-phap-luat.js <.../phap-ly-dat-dai/references>"); process.exit(1); }
const RA = path.join(__dirname, "..", "app", "du-lieu", "phap-luat");
fs.mkdirSync(RA, { recursive: true });

// Văn bản đưa vào phần mềm (được Quyết định 75 viện dẫn hoặc dùng trực tiếp khi giải quyết thủ tục, tính tiền)
// mau: biểu thức nhận diện tên văn bản trong nguyên văn (đã có dấu); ten: tên ngắn hiển thị
const CHON = {
  LDD: { ten: "Luật Đất đai số 31/2024/QH15", mau: "Luật Đất đai(?: số 31\\/2024\\/QH15)?(?: năm 2024)?" },
  NQ254: { ten: "Nghị quyết số 254/2025/QH15", mau: "Nghị quyết(?: số)? 254\\/2025\\/QH15" },
  ND49: { ten: "Nghị định số 49/2026/NĐ-CP", mau: "Nghị định(?: số)? 49\\/2026\\/NĐ-CP" },
  ND50: { ten: "Nghị định số 50/2026/NĐ-CP", mau: "Nghị định(?: số)? 50\\/2026\\/NĐ-CP" },
  ND71: { ten: "Nghị định số 71/2024/NĐ-CP", mau: "Nghị định(?: số)? 71\\/2024\\/NĐ-CP" },
  ND226: { ten: "Nghị định số 226/2025/NĐ-CP", mau: "Nghị định(?: số)? 226\\/2025\\/NĐ-CP" },
  ND291: { ten: "Nghị định số 291/2025/NĐ-CP", mau: "Nghị định(?: số)? 291\\/2025\\/NĐ-CP" },
  TT10: { ten: "Thông tư số 10/2024/TT-BTNMT", mau: "Thông tư(?: số)? 10\\/2024\\/TT-BTNMT" },
  TT23: { ten: "Thông tư số 23/2025/TT-BNNMT", mau: "Thông tư(?: số)? 23\\/2025\\/TT-BNNMT" },
  QD27: { ten: "Quyết định số 27/2026/QĐ-UBND", mau: "Quyết định(?: số)? 27\\/2026\\/QĐ-UBND" },
  QD106PL1: { ten: "Quyết định số 106/2025/QĐ-UBND (Phụ lục I)", mau: "Quyết định(?: số)? 106\\/2025\\/QĐ-UBND" },
  // Văn bản bổ sung ngoài bộ: tệp ở cong-cu/du-lieu/<MÃ>.md, danh mục ghi tại đây
  NQ28: { ten: "Nghị quyết số 28/2026/NQ-HĐND", mau: "Nghị quyết(?: số)? 28\\/2026\\/NQ-HĐND", tep: path.join(__dirname, "du-lieu", "NQ28.md"),
    dm: { loai: "Nghị quyết", so_hieu: "28/2026/NQ-HĐND", ngay: "19/10/2026", ten: "Sửa đổi, bổ sung một số điều của Quy định bảng giá các loại đất trên địa bàn tỉnh áp dụng từ ngày 01/01/2026 ban hành kèm theo Nghị quyết số 152/2025/NQ-HĐND (HĐND tỉnh Sơn La)",
      hieu_luc: "Từ 01/11/2026 (Điều 4)", sua_doi: "", ghi_chu: "Nguyên văn phần quyết nghị gõ lại từ bản sao y; Phụ lục I–V áp dụng tại trang Bảng giá đất. Điều 2 bãi bỏ khoản 3 Điều 4 Quy định kèm Nghị quyết 152/2025 (giảm 30% do chênh cao)." } }
};
// Văn bản sửa đổi → văn bản gốc (Điều của văn bản sửa đổi), theo references/quan-he-sua-doi.md
const SUA = [{ vb: "ND226", dieu: "1", goc: "ND71" }, { vb: "ND49", dieu: "10", goc: "ND71" }, { vb: "TT23", dieu: "5", goc: "TT10" }];

const dm = JSON.parse(fs.readFileSync(path.join(nguon, "danh-muc.json"), "utf8"));
const docVB = ma => {
  const s = fs.readFileSync(CHON[ma] && CHON[ma].tep ? CHON[ma].tep : path.join(nguon, "van-ban", ma + ".md"), "utf8").split(/\r?\n/);
  const dieu = []; let chuong = "", cur = null, mo = [];
  for (const l of s) {
    let m;
    if ((m = l.match(/^# (.+)/))) { chuong = m[1].trim(); if (cur) { dieu.push(cur); cur = null; } continue; }
    if ((m = l.match(/^## Điều (\d+[a-zđ]?)\.?\s*(.*)$/))) { if (cur) dieu.push(cur); cur = { so: m[1], tieuDe: m[2].trim(), chuong, dong: [] }; continue; }
    if (/^### /.test(l)) { if (cur && /Nơi nhận|chữ ký/i.test(l)) { dieu.push(cur); cur = null; } else if (cur) cur.dong.push(l.replace(/^###\s*/, "")); continue; }
    if (/^>/.test(l)) continue;
    if (cur) { if (l.trim()) cur.dong.push(l.trim()); } else if (!dieu.length && l.trim() && mo.length < 6) mo.push(l.trim());
  }
  if (cur) dieu.push(cur);
  return { dieu: dieu.map(d => [d.so, d.tieuDe, d.dong.join("\n"), d.chuong]), mo: mo.join("\n") };
};

const danhMuc = {}, suaDoi = {};
for (const [ma, c] of Object.entries(CHON)) {
  const d = c.dm || dm.find(x => x.id === ma); if (!d) throw new Error("Danh mục không có " + ma);
  const vb = docVB(ma);
  fs.writeFileSync(path.join(RA, ma + ".js"), `/* ${c.ten} — nguyên văn từ bộ phap-ly-dat-dai; TỆP SINH TỰ ĐỘNG bởi cong-cu/nhap-phap-luat.js. dieu: [số, tiêu đề, nội dung, chương] */\nTT.phapLuat && TT.phapLuat.nhan(${JSON.stringify(ma)}, ${JSON.stringify(vb)});\n`);
  danhMuc[ma] = { ten: c.ten, mau: c.mau, loai: d.loai, soHieu: d.so_hieu, ngay: d.ngay, trichYeu: d.ten, hieuLuc: d.hieu_luc, suaDoi: d.sua_doi || "", ghiChu: d.ghi_chu || "", soDieu: vb.dieu.length };
  console.log(ma.padEnd(9), String(vb.dieu.length).padStart(4), "Điều", (fs.statSync(path.join(RA, ma + ".js")).size / 1024).toFixed(0) + " KB");
}
// Bản đồ sửa đổi: khoản của văn bản sửa đổi nêu “Sửa đổi/Bổ sung/Bãi bỏ … Điều N” → văn bản gốc, Điều N
for (const s of SUA) {
  const vb = docVB(s.vb), d = vb.dieu.find(x => x[0] === s.dieu); if (!d) throw new Error(`${s.vb} không có Điều ${s.dieu}`);
  for (const dong of d[2].split("\n")) {
    const m = dong.match(/^(\d+)\.\s+(.*?(?:Sửa đổi|Bổ sung|Bãi bỏ|Thay thế|sửa đổi|bổ sung|bãi bỏ|thay thế).*)$/); if (!m) continue;
    const dieuGoc = [...m[2].matchAll(/Điều (\d+[a-zđ]?)/g)].map(x => x[1]);
    for (const n of new Set(dieuGoc)) ((suaDoi[s.goc] ||= {})[n] ||= []).push({ vb: s.vb, dieu: s.dieu, khoan: m[1], tom: m[2].replace(/\s+như sau:?$/, "").slice(0, 200) });
  }
}
const tong = Object.values(suaDoi).reduce((a, o) => a + Object.keys(o).length, 0);
fs.writeFileSync(path.join(RA, "danh-muc.js"), `/* Danh mục văn bản pháp luật có nguyên văn trong phần mềm — TỆP SINH TỰ ĐỘNG bởi cong-cu/nhap-phap-luat.js (nguồn: bộ phap-ly-dat-dai).
 * suaDoi: văn bản gốc → Điều → các khoản của văn bản sửa đổi nêu Điều đó (để cảnh báo “đã được sửa đổi tại …”). */
window.QD75_PHAP_LUAT = ${JSON.stringify({ phienBan: new Date().toISOString().slice(0, 10), danhMuc, suaDoi })};\n`);
console.log("Bản đồ sửa đổi:", tong, "Điều gốc có ghi chú sửa đổi");
