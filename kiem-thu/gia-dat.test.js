// Kiểm thử Bảng giá đất (app/du-lieu/bang-gia-dat.js, app/js/gia-dat.js) và tiền chuyển mục đích nhiều lớp, theo trường hợp đất trước.
const test = require("node:test"), assert = require("node:assert/strict");
const { TT, ctx, mh } = require("./nap")();
const gd = TT.giaDat, nv = TT.nghiaVu, ch = mh.B.nghiaVuTaiChinh;
gd.gan(ctx.QD75_BANG_GIA);
const D = gd.D, xa = ten => D.xa.indexOf(ten);

test("Dữ liệu bảng giá: 75 xã, phường; NQ 152 + NQ 28; giá nông nghiệp đủ 5 loại mỗi xã", () => {
  assert.equal(D.xa.length, 75);
  assert.equal(JSON.stringify(D.vanBan.map(v => v.hieuLucTu)), JSON.stringify(["2026-01-01", "2026-11-01"]));
  const dem = vb => D.tuyen.filter(t => t[2] === vb).length;
  assert.equal(dem(0), 1795 + 1793 + 1797); assert.equal(dem(1), 396);
  for (let i = 0; i < 75; i++) for (const m of ["LUC", "LUK", "HNK", "CLN", "NTS"]) assert.ok(gd.giaNN(i, m), `${D.xa[i]} thiếu ${m}`);
  assert.equal(gd.giaNN(-1, "RSX").gia, 12000);
});

test("Tra tuyến: Xã Đoàn Kết, QL 43 — đúng giá 5 vị trí (nghìn đồng → đồng)", () => {
  const t = gd.timTuyen({ loai: "o", xa: xa("Xã Đoàn Kết"), q: "truong thcs hua pang" })[0];
  assert.match(t.ten, /Từ giáp đất huyện Vân Hồ/);
  assert.deepEqual([...[1, 2, 3, 4, 5].map(v => gd.giaViTri(t.i, v).gia)], [720000, 420000, 320000, 210000, 150000]);
  assert.match(gd.giaViTri(t.i, 2).moTa, /Bảng 05, Nghị quyết 152\/2025/);
});

test("Lấy GPMB làm nguồn Nghị quyết 152: Chiềng Sơ QL 12 vị trí 4 = 270.000 (không phải 530.000 lệch cột)", () => {
  const t = gd.timTuyen({ loai: "o", xa: xa("Xã Chiềng Sơ"), q: "Phiêng Lợi" })[0];
  assert.equal(gd.giaViTri(t.i, 4).gia, 270000); assert.equal(gd.giaViTri(t.i, 2).gia, 530000);
});

test("Nghị quyết 28/2026: tuyến bổ sung đánh dấu chưa hiệu lực trước 01/11/2026", () => {
  const ds = gd.timTuyen({ loai: "o", xa: xa("Xã Đoàn Kết"), q: "km 45+590", ngay: "2026-10-29" });
  assert.ok(ds.length && ds.every(t => t.vb === 1 && t.chuaHieuLuc));
  assert.ok(gd.timTuyen({ loai: "o", xa: xa("Xã Đoàn Kết"), q: "km 45+590", ngay: "2026-11-01" }).every(t => !t.chuaHieuLuc));
});

test("Điều chỉnh: chênh cao −30%, đường đất 70% chỉ vị trí 2–5, đất NN xen kẹt +50%", () => {
  const t = gd.timTuyen({ loai: "o", xa: xa("Xã Đoàn Kết") })[0];
  assert.equal(gd.giaViTri(t.i, 1, { duongDat: true }).gia, 720000);
  assert.equal(gd.giaViTri(t.i, 2, { duongDat: true }).gia, 294000);
  assert.equal(gd.giaViTri(t.i, 2, { duongDat: true, chenhCao: true }).gia, 205800);
  assert.equal(gd.giaNNDieuChinh(xa("Xã Đoàn Kết"), "HNK", true).gia, 102000);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(l => gd.tyLeLop("o", l)), [100, 60, 36, 21.6, 12.96, 12.96]);
  assert.deepEqual([1, 2, 3, 4].map(l => gd.tyLeLop("tmdv", l)), [100, 50, 25, 12.5]);
});

test("Tìm không dấu, không phân biệt hoa thường", () => {
  assert.ok(gd.timTuyen({ loai: "o", q: "to hieu" }).length > 0);
});

test("Chuyển mục đích: ví dụ đối chiếu phần mềm Tính tiền đất đai (giao đất, thuê một lần, tiền trước bằng 0)", () => {
  const t = ts => nv.tinh({ loai: "chuyen-muc-dich", dienTich: 100, giaSau: 2000000, giaTruoc: 300000, ...ts }, ch);
  assert.equal(t({ truongHop: "nn-giao-khong-thu" }).soTien, 170000000);
  assert.equal(t({ truongHop: "nn-thue-1-lan", thoiHanGoc: 50, daSuDung: 20 }).soTien, 182000000);
  assert.equal(t({ truongHop: "nn-thue-hang-nam", giaTruoc: "" }).soTien, 200000000);
  assert.ok(t({ truongHop: "pnn-co-thoi-han" }).loi, "thiếu thời hạn phải báo lỗi");
});

test("Chuyển mục đích nhiều lớp: 100 m² lớp 1 + 50 m² lớp 2 (60%), đất HNK → đất ở Đoàn Kết VT1", () => {
  const tu = gd.timTuyen({ loai: "o", xa: xa("Xã Đoàn Kết") })[0], gs = gd.giaViTri(tu.i, 1).gia, gt = gd.giaNN(xa("Xã Đoàn Kết"), "HNK").gia;
  const r = nv.tinh({ loai: "chuyen-muc-dich", truongHop: "nn-giao-khong-thu", lop: [{ ten: "Lớp 1", dienTich: 100, giaSau: gs, giaTruoc: gt }, { ten: "Lớp 2", dienTich: 50, giaSau: gs * 0.6, giaTruoc: gt }] }, ch);
  assert.equal(r.tienSau, 100 * 720000 + 50 * 432000); assert.equal(r.tienTruoc, 150 * 68000);
  assert.equal(r.soTien, 72000000 + 21600000 - 10200000); assert.equal(r.chiTiet.length, 2);
});
