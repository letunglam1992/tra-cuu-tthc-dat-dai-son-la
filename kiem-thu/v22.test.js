// Kiểm thử bản 2.2.x: thời hạn theo trường hợp, phân định thủ tục, nguyên văn pháp luật, NQ 28 (bãi bỏ/đổi tên, khoản 8 Điều 7), hạn mức trợ lý.
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("fs"), path = require("path"), vm = require("vm");
const { TT, mh, ctx } = require("./nap")();
const APP = path.join(__dirname, "..", "app");
for (const f of ["du-lieu/phap-luat/danh-muc.js", "js/phap-luat.js", "du-lieu/phap-luat/LDD.js", "du-lieu/phap-luat/ND71.js"]) vm.runInContext(fs.readFileSync(path.join(APP, f), "utf8"), ctx, { filename: f });
const pl = ctx.TT.phapLuat;

test("Thời hạn theo trường hợp: mã có trong QĐ 75, số ngày dương, NVTC đúng thủ tục", () => {
  for (const [ma, c] of Object.entries(mh.B.thoiHanTruongHop)) {
    assert.ok(mh.thuTucTheoMa[ma], "không có thủ tục " + ma);
    for (const x of c.ds) { assert.ok(x.ngay > 0 && ["nlv", "ngay"].includes(x.dv), ma + " " + x.nhan); }
  }
  const nv = ma => mh.B.thoiHanTruongHop[ma].nvtc;
  for (const ma of ["I.2", "I.3", "I.7", "I.9", "I.10", "II.2", "II.3", "II.4", "II.9", "II.10", "II.12"]) assert.equal(nv(ma), 3, ma);
  assert.equal(mh.B.thoiHanTruongHop["I.10"].ds[0].nvtc, false, "thu hồi GCN không cộng NVTC");
  assert.match(mh.B.thoiHanTruongHop["I.8"].canhBao[0], /15 ngày.*18 ngày/);
});

test("Phân định thủ tục: mọi mã hợp lệ, mỗi cặp nằm trong các lựa chọn của nhóm", () => {
  for (const g of mh.B.phanDinh) {
    const ma = new Set(g.luaChon.flatMap(l => l.ma));
    for (const m of ma) assert.ok(mh.thuTucTheoMa[m], g.id + ": " + m);
    for (const c of g.cap) for (const m of c) assert.ok(ma.has(m), `${g.id}: ${m} trong cặp nhưng không có lựa chọn`);
  }
});

test("Văn bản pháp luật: danh mục, Luật Đất đai 260 Điều, ghi chú sửa đổi Nghị định 71", () => {
  assert.ok(Object.keys(pl.danhMuc).length >= 10);
  for (const ma of Object.keys(pl.danhMuc)) assert.ok(fs.existsSync(path.join(APP, "du-lieu/phap-luat", ma + ".js")), ma);
  assert.equal(pl.dieu("LDD", "141").tieuDe, "Xác định diện tích đất ở khi công nhận quyền sử dụng đất");
  assert.match(pl.suaDoiCua("ND71", "3")[0].tom, /khoản 1 Điều 3/);
  assert.equal(pl.suaDoiCua("LDD", "3").length, 0);
});

test("Gắn liên kết viện dẫn: khoản/điểm/Điều + tên văn bản; văn bản chưa có nguyên văn để nguyên", () => {
  const h = pl.lienKet(TT.ti.e("theo điểm a khoản 2 Điều 120 Luật Đất đai, Nghị quyết số 254/2025/QH15 và Nghị định số 102/2024/NĐ-CP"), {});
  assert.match(h, /data-pl="LDD\|120\|2\|a"/); assert.match(h, /data-pl="NQ254\|\|\|"/); assert.ok(!/102\/2024[^<]*<\/a>/.test(h));
  assert.match(pl.lienKet(TT.ti.e("quy định tại Điều 137 của Luật này"), { vbHienTai: "LDD" }), /data-pl="LDD\|137\|\|"/);
  assert.equal(pl.lienKet("Luật này quy định", { vbHienTai: "LDD" }), "Luật này quy định");
  // QĐ 75: tổng số viện dẫn gắn được trong nội dung thủ tục
  let n = 0; for (const t of mh.thuTuc) for (const m of Object.values(t.muc)) if (m) for (const d of String(m.noiDung).split("\n")) n += (pl.lienKet(TT.ti.e(d), {}).match(/class="lk-pl"/g) || []).length;
  assert.ok(n >= 100, "số liên kết " + n);
});

test("Tìm trong văn bản: khớp nguyên từ, xếp tiêu đề lên trước", () => {
  assert.equal(pl.tim("LDD", "tách thửa")[0].so, "220");
  assert.equal(pl.tim("LDD", "giá đất cụ thể")[0].so, "160");
});

test("Bảng giá đất: khoản 8 Điều 7 (TM-DV gốc đất ở = 90% giá đất ở); tuyến bãi bỏ, đổi tên theo ngày", () => {
  const gd = TT.giaDat; gd.gan(JSON.parse(JSON.stringify(ctx.QD75_BANG_GIA)));
  const xa = gd.D.xa.indexOf("Xã Đoàn Kết"), tm = gd.timTuyen({ loai: "tmdv", xa })[0];
  assert.equal(gd.giaTMDVNguonGocDatO(tm.i, 2).gia, 378000);
  // Giả lập Phụ lục IV/V trên một bản sao dữ liệu
  const D = JSON.parse(JSON.stringify(ctx.QD75_BANG_GIA)), o = D.tuyen.findIndex(t => t[0] === 0 && t[1] === xa);
  D.tuyen[o][8] = D.tuyen[o][8] || []; D.tuyen[o][9] = { doiTen: { ten: "Tên mới thử", tu: "2026-11-01", can: "PL IV" } };
  D.tuyen[o + 1][8] = D.tuyen[o + 1][8] || []; D.tuyen[o + 1][9] = { baiBo: { tu: "2026-11-01", can: "PL V" } };
  gd.gan(D);
  const truoc = gd.timTuyen({ loai: "o", xa, ngay: "2026-10-31" }), sau = gd.timTuyen({ loai: "o", xa, ngay: "2026-11-02" });
  assert.ok(!truoc.some(t => t.daBaiBo) && truoc[0].ten !== "Tên mới thử");
  assert.equal(sau.find(t => t.i === o).ten, "Tên mới thử"); assert.ok(sau.find(t => t.i === o).tenCu);
  assert.ok(sau[sau.length - 1].daBaiBo, "tuyến bãi bỏ xếp cuối");
  assert.ok(gd.timTuyen({ loai: "o", xa, q: "ten moi thu", ngay: "2026-11-02" }).length === 1, "tìm theo tên mới");
  gd.gan(ctx.QD75_BANG_GIA);
});

test("Hạn mức trợ lý: đếm lượt theo ngày, chặn khi đủ, ngừng gọi khi Worker báo 429", async () => {
  const kho = {}; ctx.localStorage = { getItem: k => kho[k] ?? null, setItem: (k, v) => { kho[k] = String(v); } };
  const ch = { diaChi: "https://w.example.workers.dev", giaoThuc: "messages", gioiHanNgay: 2 }, nc = [{ tieuDe: "A", noiDung: "x" }];
  let goi = 0; ctx.__fetch = async () => { goi++; return new Response(JSON.stringify({ text: "ok [1]", model: "m" }), { status: 200 }); };
  await TT.troLy.hoi(ch, "a", nc); await TT.troLy.hoi(ch, "b", nc);
  await assert.rejects(TT.troLy.hoi(ch, "c", nc), /hết 2 lượt/); assert.equal(goi, 2);
  assert.equal(TT.troLy.hanMuc(ch).conLai, 0);
  delete kho["tthc-tro-ly-han-muc"];
  ctx.__fetch = async () => { goi++; return new Response(JSON.stringify({ error: "3036: daily free allocation exceeded" }), { status: 429 }); };
  await assert.rejects(TT.troLy.hoi(ch, "d", nc), /hết hạn mức/); const g = goi;
  await assert.rejects(TT.troLy.hoi(ch, "e", nc), /tạm dừng đến ngày mai/); assert.equal(goi, g, "không gọi lại khi đã hết hạn mức");
  delete ctx.localStorage;
});
