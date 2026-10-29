// Kiểm thử dòng lệnh (Node ≥ 18, không cần trình duyệt): dữ liệu, tìm kiếm, thời hạn, xuất Word, cấu hình triển khai.
// Chạy: node --test kiem-thu/
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("fs"), path = require("path");
const nap = require("./nap.js");
const { TT, mh, tk } = nap();
const APP = path.join(__dirname, "..", "app");
const top = (q, loai) => tk.tim(q, loai ? { loai } : undefined).ketQua.map(r => r.id);

test("Dữ liệu: kiểm tra tự động không có lỗi", () => {
  const loi = mh.kiemTra().filter(k => k.mucDo === "loi");
  assert.equal(JSON.stringify(loi.map(k => k.noiDung)), "[]");
});
test("Dữ liệu: 45 thủ tục (10/13/22), 24 điều, 45 mẫu, 5 quy trình", () => {
  assert.equal(JSON.stringify(mh.thongKe.theoPhuLuc), JSON.stringify({ I: 10, II: 13, III: 22 }));
  assert.equal(mh.dieu.length, 24); assert.equal(mh.mauBieu.length, 45); assert.equal(mh.quyTrinh.length, 5);
});
test("Hiệu lực: số, ngày theo bản ký; Điều 2 điền ngày; tự tính theo ngày", () => {
  const vb = mh.B.vanBan;
  assert.equal(vb.soKyHieu.giaTri, "75/2026/QĐ-UBND"); assert.equal(vb.ngayBanHanh.giaTri, "22/10/2026"); assert.equal(vb.ngayHieuLuc.giaTri, "22/10/2026");
  assert.ok(mh.daDoiChieuBanKy);
  assert.match(mh.dieuQD.find(d => d.so === "2").khoan[0].noiDung, /kể từ ngày 22 tháng 10 năm 2026/);
  assert.equal(mh.tinhHieuLuc(new Date(2026, 9, 21)).ma, "chua-co-hieu-luc");
  assert.equal(mh.tinhHieuLuc(new Date(2026, 9, 22)).ma, "co-hieu-luc");
  for (const f of mh.B.banKy.anh) assert.ok(fs.existsSync(path.join(APP, f.tep)), f.tep);
});
test("Tình huống thường gặp trỏ tới thủ tục có thật", () => {
  for (const th of mh.B.tinhHuong) for (const ma of th.thuTuc || []) assert.ok(mh.thuTucTheoMa[ma], `${th.id}: ${ma}`);
});

// Bảng hồi quy tìm kiếm: [câu tìm, điều kiện]
const HOI_QUY = [
  ["tach thua", r => r[0] === "III.3", "thu-tuc"],
  ["tách thửa", r => r[0] === "III.3", "thu-tuc"],
  ["tachthua", r => r[0] === "III.3", "thu-tuc"],
  ["sổ đỏ", r => r.length > 10, "thu-tuc"],
  ["GCN", r => r.length > 10, "thu-tuc"],
  ["QSDĐ", r => r.length > 10],
  ["NVTC", r => r.length > 10],
  ["chi cục thuế", r => r[0] === "co-quan-thue", "co-quan"],
  ["kho bạc", r => r[0] === "kbnn", "co-quan"],
  ["III.3", r => r[0] === "III.3"],
  ["I.1", r => r[0] === "I.1"],
  ["mẫu 19", r => r[0] === "19"],
  ["mau so 04a", r => r[0] === "4a"],
  ["cấp lại giấy chứng nhận bị mất", r => r[0] === "III.7", "thu-tuc"],
  ["cấp đổi giấy chứng nhận", r => r[0] === "III.6", "thu-tuc"],
  ["đính chính", r => ["I.9", "II.9", "III.17"].every(x => r.slice(0, 3).includes(x)), "thu-tuc"],
  ["cap giay chung nhan lan dau", r => r.slice(0, 3).includes("II.6"), "thu-tuc"],
  ["chuyen nhuong", r => r.slice(0, 3).includes("III.2"), "thu-tuc"],
  ["mua bán đất", r => r.slice(0, 5).includes("III.2"), "thu-tuc"],
  ["lên thổ cư", r => r.slice(0, 3).includes("II.1"), "thu-tuc"],
  ["xóa ghi nợ", r => r[0] === "III.22", "thu-tuc"],
  ["15 ngày làm việc", r => r.includes("I.1"), "thu-tuc"],
  ["VBDLIS", r => r.includes("dieu-5")],
  ["cưỡng chế", r => r.length > 0],
  ['"phiếu chuyển thông tin"', r => r.includes("19"), "mau"],
  ["xyzkhongco", r => r.length === 0],
  ["sổ đỏ xe máy", r => r.length === 0]
];
for (const [q, dk, loai] of HOI_QUY) test(`Tìm kiếm: “${q}”`, () => { const r = top(q, loai); assert.ok(dk(r), `${q} → ${r.slice(0, 5).join(", ")}`); });
test("Tìm kiếm: gõ có dấu so khớp đúng dấu, ít nhiễu hơn không dấu", () => {
  assert.ok(tk.tim("thừa kế").ketQua.length < tk.tim("thua ke").ketQua.length);
  assert.ok(tk.tim("gia hạn").ketQua.length < tk.tim("gia han").ketQua.length);
});
test("Tìm kiếm: mọi kết quả chứa đủ các nhóm từ khóa", () => {
  const { ketQua } = tk.tim("đính chính giấy chứng nhận");
  assert.ok(ketQua.length > 0);
  // Từ có dấu so khớp đúng dấu, từng từ (AND)
  for (const r of ketQua) for (const w of ["đính", "chính", "giấy", "chứng", "nhận"]) assert.ok(r.truong.some(f => TT.ti.viTriDauTuCoDau(f.thuong, w) >= 0), r.id + " thiếu " + w);
});
test("Tìm kiếm: gợi ý bỏ từ cho số kết quả thật", () => {
  const r = tk.tim("sổ đỏ xe máy");
  assert.ok(r.goiY.length > 0);
  for (const g of r.goiY) assert.equal(tk.tim(g.q).ketQua.length, g.soKetQua);
});
test("Tìm kiếm: tốc độ < 150 ms/câu", () => {
  const t0 = Date.now(); for (const [q] of HOI_QUY) tk.tim(q); assert.ok((Date.now() - t0) / HOI_QUY.length < 150);
});

const th = TT.thoiHan, kh = th.khoa;
test("Thời hạn: âm lịch", () => {
  assert.deepEqual([2024, 2025, 2026, 2027, 2028].map(y => kh(th.amSangDuong(1, 1, y))), ["2024-02-10", "2025-01-29", "2026-02-17", "2027-02-06", "2028-01-26"]);
  assert.deepEqual([2024, 2025, 2026].map(y => kh(th.amSangDuong(10, 3, y))), ["2024-04-18", "2025-04-07", "2026-04-26"]);
});
test("Thời hạn: ngày làm việc, khu vực III, ngày lễ, nghỉ bù, ngày lịch", () => {
  assert.equal(kh(th.tinh({ ngayNhan: new Date(2026, 9, 29), soNgay: 12, donVi: "ngày làm việc" }).ngayHen), "2026-11-16");
  assert.equal(kh(th.tinh({ ngayNhan: new Date(2026, 9, 29), soNgay: 12, donVi: "ngày làm việc", tangThem: 10 }).ngayHen), "2026-11-30");
  assert.equal(kh(th.tinh({ ngayNhan: new Date(2026, 11, 31), soNgay: 1, donVi: "ngày làm việc" }).ngayHen), "2027-01-04");
  assert.equal(th.thongTinNgay(new Date(2027, 4, 3)).lam, false); // 1/5/2027 thứ Bảy → nghỉ bù thứ Hai 3/5
  assert.equal(th.thongTinNgay(new Date(2026, 3, 27)).lam, false); // Giỗ Tổ 26/4/2026 Chủ nhật → nghỉ bù 27/4
  const r = th.tinh({ ngayNhan: new Date(2026, 9, 23), soNgay: 30, donVi: "ngày" });
  assert.equal(kh(r.ngayHen), "2026-11-23"); assert.ok(r.canhBao.length);
  assert.equal(kh(th.tinh({ ngayNhan: new Date(2026, 9, 29), soNgay: 2, donVi: "ngày làm việc", tamDung: 3 }).ngayHen), "2026-11-05");
});
test("Thời hạn: thông báo lịch nghỉ chính thức thay cho tạm tính", () => {
  const lich = { theoNam: [{ nam: 2030, ngayNghi: ["2030-02-01"], ngayLamBu: ["2030-02-09"] }] };
  assert.equal(th.thongTinNgay(new Date(2030, 1, 1), lich).loai, "thong-bao");
  assert.equal(th.thongTinNgay(new Date(2030, 1, 9), lich).lam, true); // thứ Bảy làm bù
  assert.ok(th.tinh({ ngayNhan: new Date(2027, 0, 25), soNgay: 15, donVi: "ngày làm việc" }).canhBao.some(c => /TẠM TÍNH/.test(c)));
});
test("Thời hạn: nhận diện thời gian tăng thêm xã khu vực III ở mọi thủ tục", () => {
  const co = mh.thuTuc.filter(t => /khu vực III/i.test(t.muc[3].noiDung));
  assert.ok(co.length > 0);
  for (const t of co) assert.ok(th.tangThemKhuVucIII(t.muc[3].noiDung), t.ma);
});

test("Xuất Word: ghép đoạn, m², quốc hiệu, chú thích, giữ đủ chữ", () => {
  for (const m of mh.mauBieu) {
    const d = TT.word.dungDoan(m.noiDung);
    const goc = new Set((m.noiDung.match(/[\p{L}]{3,}/gu) || []).map(x => x.toLowerCase()));
    const ra = [...d.doan.map(x => x.text), ...d.chuThich.map(x => x.text)].join(" ").toLowerCase() + (d.quocHieu ? " cộng hòa hoà xã hội chủ nghĩa việt nam độc lập tự do hạnh phúc" : "");
    const mat = [...goc].filter(w => !ra.includes(w));
    assert.ok(mat.length / goc.size < 0.01, `Mẫu ${m.kyHieu} mất chữ: ${mat.slice(0, 8).join(", ")}`);
  }
  const d1 = TT.word.dungDoan(mh.mauTheoKhoa["1"].noiDung);
  assert.ok(d1.quocHieu); assert.ok(d1.chuThich.length >= 4);
  assert.ok(d1.doan.some(x => x.text.startsWith("1. Người đề nghị")));
  assert.ok(d1.doan.some(x => x.text.includes("(m²)")));
});

test("Ngoại tuyến: sw.js liệt kê đủ script của index.html và tệp tồn tại", () => {
  const sw = fs.readFileSync(path.join(APP, "sw.js"), "utf8");
  const ds = JSON.parse("[" + sw.split("const TEP = [")[1].split("];")[0] + "]");
  for (const f of ds) if (f !== "./") assert.ok(fs.existsSync(path.join(APP, f)), "Thiếu tệp " + f);
  const html = fs.readFileSync(path.join(APP, "index.html"), "utf8");
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(ds.includes(m[1]), "sw.js thiếu " + m[1]);
  assert.match(sw, new RegExp(`PHIEN_BAN = "tthc-${mh.B.phienBanDuLieu.replace(/\./g, "\\.")}"`), "Phiên bản bộ đệm phải trùng phiên bản dữ liệu");
});
test("Triển khai: vercel.json, manifest hợp lệ; bộ kiểm thử không đưa lên production", () => {
  const v = JSON.parse(fs.readFileSync(path.join(APP, "vercel.json"), "utf8"));
  const h = v.headers.find(x => x.source === "/(.*)").headers.map(x => x.key);
  for (const k of ["Content-Security-Policy", "X-Content-Type-Options", "Referrer-Policy"]) assert.ok(h.includes(k), k);
  // Vercel (path-to-regexp) không chấp nhận nhóm ngoặc lồng nhau trong "source" — lỗi này làm hỏng mọi lần triển khai
  for (const x of v.headers) assert.ok(!/\([^)]*\(/.test(x.source), "Mẫu source không hợp lệ: " + x.source);
  const mf = JSON.parse(fs.readFileSync(path.join(APP, "manifest.webmanifest"), "utf8"));
  for (const i of mf.icons) assert.ok(fs.existsSync(path.join(APP, i.src)), i.src);
  assert.match(fs.readFileSync(path.join(APP, ".vercelignore"), "utf8"), /kiem-thu\.html/);
});
