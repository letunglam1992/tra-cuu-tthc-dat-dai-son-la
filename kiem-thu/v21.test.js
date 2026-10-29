// Kiểm thử các tính năng phiên bản 2.1: mã TTHC, hiệu lực văn bản viện dẫn, phí – lệ phí (NQ 155/2025), ước tính NVTC,
// điền mẫu Word, bảng Word, Excel, sổ theo dõi, tìm ngữ cảnh hỏi đáp.
const test = require("node:test"), assert = require("node:assert/strict");
const nap = require("./nap.js");
const { TT, mh, tk, ctx } = nap();
const P = ctx.QD75_PHI;

// Đọc gói ZIP kiểu "lưu" (không nén) do phần mềm tạo
function docZip(buf) {
  const ra = {}; let p = 0;
  while (buf.readUInt32LE(p) === 0x04034b50) { const co = buf.readUInt32LE(p + 18), dt = buf.readUInt16LE(p + 26); const ten = buf.subarray(p + 30, p + 30 + dt).toString("utf8"); ra[ten] = buf.subarray(p + 30 + dt, p + 30 + dt + co).toString("utf8"); p += 30 + dt + co; }
  return ra;
}
const can = (xml, the) => (xml.match(new RegExp(`<${the}[ >]`, "g")) || []).length === (xml.match(new RegExp(`</${the}>`, "g")) || []).length;

test("Mã TTHC quốc gia: 39 khớp, 3 gợi ý; tìm theo mã", () => {
  assert.equal(mh.thuTuc.filter(t => t.maQuocGia && t.maQuocGia.mucDo === "khop").length, 39);
  assert.equal(mh.thuTuc.filter(t => t.maQuocGia && t.maQuocGia.mucDo === "goi-y").length, 3);
  assert.equal(mh.thuTucTheoMa["III.3"].maQuocGia.ma, "1.012784");
  assert.equal(tk.tim("1.012784").ketQua[0].id, "III.3");
  assert.equal(tk.tim("1.099999").ketQua.length, 0);
  for (const t of mh.thuTuc) if (t.maQuocGia) assert.match(t.maQuocGia.ma, /^[12]\.0\d{5}$/, t.ma);
});
test("Hiệu lực văn bản viện dẫn lấy từ căn cứ ban hành, Điều 2 và NQ 155", () => {
  const h = ten => mh.vanBanDanChieu[ten] && mh.vanBanDanChieu[ten].hieuLuc;
  assert.equal(h("Luật Đất đai số 31/2024/QH15").ma, "co-hieu-luc");
  assert.equal(h("Luật Đất đai số 31/2024/QH15").suaDoiBoi.length, 12);
  assert.equal(h("Nghị định số 226/2025/NĐ-CP").suaDoi.length, 3);
  assert.equal(h("Quyết định số 45/2021/QĐ-UBND").ma, "het-hieu-luc");
  assert.equal(h("Quyết định số 106/2025/QĐ-UBND").ma, "het-mot-phan");
  assert.equal(h("Luật Phí và lệ phí").ma, "co-hieu-luc");
  assert.equal(h("Thông tư số 89/2026/TT-BTC").ma, "chua-xac-minh");
});
test("Phí, lệ phí theo Nghị quyết 155/2025/NQ-HĐND", () => {
  const f = ts => [...TT.nghiaVu.tinhPhiGCN(ts, P).dong.map(x => x.soTien)];
  assert.deepEqual(f({ doiTuong: "ca-nhan", diaBan: "xa", hoSo: "lan-dau", mucDich: "nha-o" }), [100000, 45000]);
  assert.deepEqual(f({ doiTuong: "ca-nhan", diaBan: "phuong", hoSo: "lan-dau", mucDich: "kinh-doanh" }), [310000, 90000]);
  assert.deepEqual(f({ doiTuong: "ca-nhan", diaBan: "phuong", hoSo: "bien-dong", hinhThuc: "xac-nhan", soTrichLuc: 2 }), [105000, 28000, 30000]);
  assert.deepEqual(f({ doiTuong: "to-chuc", hoSo: "lan-dau", dienTich: 999 }), [1050000, 400000]);
  assert.deepEqual(f({ doiTuong: "to-chuc", hoSo: "bien-dong", dienTich: 500000 }), [4300000, 40000]);
  assert.equal(TT.nghiaVu.tinhPhiGCN({ doiTuong: "ca-nhan", diaBan: "xa", hoSo: "lan-dau", mien: true }, P).tong, 0);
  assert.equal(P.vanBan.hieuLuc, "08/01/2026");
  for (const ma of Object.keys(P.theoThuTuc)) assert.ok(mh.thuTucTheoMa[ma], ma);
  assert.ok(mh.vanDeNguon.some(v => v.ma.startsWith("PHI-")));
  assert.ok(tk.tim("lệ phí cấp giấy chứng nhận", { loai: "phi" }).ketQua.length > 0);
});
test("Ước tính nghĩa vụ tài chính: công thức, đọc số bằng chữ, bảng giá", () => {
  const c = mh.B.nghiaVuTaiChinh, nv = TT.nghiaVu;
  assert.equal(nv.tinh({ loai: "chuyen-muc-dich", dienTich: "120", giaTruoc: "60.000", giaSau: "2.500.000" }, c).soTien, 292800000);
  assert.equal(nv.tinh({ loai: "chuyen-muc-dich", dienTich: "100", giaTruoc: "100000", giaSau: "1000000", tyLeThu: "50" }, c).soTien, 45000000);
  assert.equal(nv.tinh({ loai: "le-phi-truoc-ba", dienTich: "150,5", gia: "1.800.000" }, c).soTien, 1354500);
  assert.equal(nv.tinh({ loai: "thue-tncn", giaTriChuyenNhuong: "1.000.000.000" }, c).soTien, 20000000);
  assert.equal(nv.tinh({ loai: "giao-dat", dienTich: "100", gia: "1000000", duocTru: "30000000", mienGiamPhanTram: "50" }, c).soTien, 20000000);
  assert.ok(nv.tinh({ loai: "thue-hang-nam", dienTich: "100", gia: "1000000" }, c).loi);
  assert.equal(nv.docSo(1000005), "Một triệu không trăm lẻ năm đồng");
  assert.equal(nv.docSo(21000000000), "Hai mươi mốt tỷ đồng");
  assert.equal(nv.docSo(115000), "Một trăm mười lăm nghìn đồng");
  const bg = nv.docBangGia("Xã/Phường\tTuyến đường\tVị trí\tLoại đất\tGiá (đồng/m²)\nXã A\tQL6\t1\tĐất ở\t2.400.000");
  assert.equal(bg.ds[0].gia, 2400000);
  assert.equal(nv.docBangGia('"Xã","Đường","Giá"\n"Xã B","Ngõ 1","1.000.000"').ds[0].gia, 1000000);
});
test("Điền mẫu: ô điền khớp vị trí khi xuất Word", async () => {
  const m = mh.mauTheoKhoa["22"], o = TT.word.oDienMau(m), n = o.flatMap(d => d.phan).filter(x => x.o).length;
  assert.ok(n > 20);
  const gt = Array.from({ length: n }, (_, i) => "GT" + i);
  const van = TT.word.khoiMau(m, mh.B.vanBan, gt).map(k => k.text).join("\n");
  for (const i of [0, 5, n - 1]) assert.ok(van.includes("GT" + i), "thiếu GT" + i);
  // Ô để trống giữ nguyên dòng chấm
  const van2 = TT.word.khoiMau(m, mh.B.vanBan, []).map(k => k.text).join("\n");
  assert.equal(van2, TT.word.khoiMau(m, mh.B.vanBan).map(k => k.text).join("\n"));
  const tong = mh.mauBieu.reduce((s, x) => s + TT.word.oDienMau(x).flatMap(d => d.phan).filter(y => y.o).length, 0);
  assert.ok(tong > 500);
});
test("Word có bảng, ô gộp, trang ngang: XML cân thẻ", async () => {
  const b = TT.word.taoDocx([{ text: "Tiêu đề" }, { bang: { cot: [1000, 2000, 1000], dau: 1, dong: [["A", "B", "C"], [{ text: "gộp", gop: 2 }, "z"]] } }], { ngang: true });
  const z = docZip(Buffer.from(await b.arrayBuffer())), x = z["word/document.xml"];
  assert.ok(x.includes('w:orient="landscape"')); assert.ok(x.includes('<w:gridSpan w:val="2"/>')); assert.ok(x.includes("<w:tblHeader/>"));
  for (const t of ["w:tbl", "w:tr", "w:tc", "w:p", "w:body"]) assert.ok(can(x, t), "lệch thẻ " + t);
});
test("Excel .xlsx: đủ phần, chuỗi tiếng Việt, dòng tiêu đề", async () => {
  const b = TT.excel.taoXlsx([{ ten: "Sổ: theo dõi/2026", cot: ["Số hồ sơ", "Hạn"], dong: [["HS-01 <&>", 12], ["Tách thửa", "30/11/2026"]], rong: [12, 14] }]);
  const z = docZip(Buffer.from(await b.arrayBuffer()));
  for (const f of ["[Content_Types].xml", "xl/workbook.xml", "xl/worksheets/sheet1.xml", "xl/styles.xml", "xl/_rels/workbook.xml.rels"]) assert.ok(z[f], f);
  assert.ok(z["xl/worksheets/sheet1.xml"].includes("HS-01 &lt;&amp;&gt;")); assert.ok(z["xl/worksheets/sheet1.xml"].includes("<v>12</v>"));
  assert.ok(!/[\\/:]/.test(z["xl/workbook.xml"].match(/name="([^"]+)"/)[1]));
});
test("Tìm ngữ cảnh hỏi đáp: câu hỏi tự nhiên ra đúng đoạn", () => {
  const ids = q => tk.timNguCanh(q, 6).map(r => r.id);
  assert.ok(ids("Tách thửa đất mất bao nhiêu ngày và cần những giấy tờ gì?").includes("III.3"));
  assert.ok(ids("Thủ tục cấp lại sổ đỏ bị mất nộp ở đâu?")[0] === "III.7");
  assert.ok(ids("Lệ phí cấp giấy chứng nhận lần đầu ở xã là bao nhiêu?").some(id => /Phụ lục II/.test(id)));
  assert.equal(tk.timNguCanh("xyzkhongco abcvo", 5).length, 0);
});
