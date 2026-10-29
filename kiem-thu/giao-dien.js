// Kiểm thử giao diện bằng Playwright (Chromium): bộ kiểm thử trong trình duyệt (kiem-thu.html), khổ điện thoại,
// ngoại tuyến (Service Worker), bản in phiếu A4. Ghi kết quả vào tai-lieu/ket-qua-kiem-thu.csv.
// Chạy: node kiem-thu/giao-dien.js   (cần: npm i -D playwright && npx playwright install chromium)
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const khoiDong = require("./may-chu.js");
const CONG = +process.env.CONG || 8699, GOC = `http://127.0.0.1:${CONG}/`;
const kq = [];
const ghi = (ma, nhom, noiDung, mongDoi, thucTe, dat, ghiChu) => { kq.push({ ma, nhom, noiDung, mongDoi, thucTe: String(thucTe), trangThai: dat ? "Đạt" : "Không đạt", ghiChu: ghiChu || "" }); console.log(`${dat ? "✔" : "✘"} ${ma} ${noiDung} — ${thucTe}`); };

(async () => {
  const sv = await khoiDong(CONG);
  const b = await chromium.launch();
  try {
    // 1. Bộ kiểm thử trong trình duyệt
    {
      const p = await b.newPage();
      const loi = []; p.on("pageerror", e => loi.push(e.message));
      await p.goto(GOC + "kiem-thu.html");
      await p.waitForFunction(() => window.KET_QUA_KIEM_THU, null, { timeout: 600000 });
      const r = await p.evaluate(() => window.KET_QUA_KIEM_THU);
      for (const x of r.chiTiet) kq.push(x);
      console.log(`Bộ kiểm thử trình duyệt: ${r.dat}/${r.tong} đạt`);
      for (const x of r.chiTiet.filter(x => x.trangThai !== "Đạt")) console.log(`✘ ${x.ma} ${x.noiDung} — ${x.thucTe} ${x.ghiChu}`);
      if (loi.length) ghi("GD-00", "Giao diện", "Không lỗi JavaScript khi chạy bộ kiểm thử", "0 lỗi", loi.join(" | "), false);
      await p.close();
    }
    // 2. Khổ điện thoại 375 px: không tràn ngang, không lỗi, chân trang không cố định, menu có lớp phủ
    {
      const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: "block", hasTouch: true, isMobile: true });
      const p = await ctx.newPage(); const loi = []; p.on("pageerror", e => loi.push(e.message));
      const tuyen = ["#/tong-quan", "#/thu-tuc", "#/thu-tuc/III.3", "#/thu-tuc/I.1/ho-so", "#/quy-trinh/QT15", "#/thu-hoi", "#/mau-bieu", "#/mau-bieu/19", "#/co-quan", "#/can-cu", "#/tra-cuu?q=s%E1%BB%95%20%C4%91%E1%BB%8F", "#/tinh-han?ma=III.3", "#/phieu/III.3", "#/gioi-thieu", "#/doi-soat"];
      const tran = [];
      await p.goto(GOC + "#/tong-quan"); await p.waitForSelector(".ben-muc");
      for (const h of tuyen) {
        const truoc = await p.evaluate(() => TT.soLanVe);
        await p.evaluate(x => { location.hash = x; }, h);
        await p.waitForFunction(x => TT.soLanVe > x, truoc, { timeout: 5000 }).catch(() => { });
        if (await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) tran.push(h);
      }
      ghi("GD-01", "Điện thoại", "Khổ 375 px: không tràn ngang trên các màn hình chính", `0/${tuyen.length} màn hình tràn`, tran.length ? tran.join(", ") : `0/${tuyen.length}`, !tran.length && !loi.length, loi.join(" | "));
      await p.evaluate(() => { location.hash = "#/quy-trinh/QT15"; }); await p.waitForTimeout(300);
      const qt = await p.evaluate(() => ({ cheDo: document.querySelector(".trang").getAttribute("data-qt"), soBuoc: document.querySelectorAll(".qt-dong-buoc").length, soDoAn: getComputedStyle(document.querySelector("#so-do")).display === "none" }));
      ghi("GD-02", "Điện thoại", "Quy trình NVTC hiện dạng danh sách bước", "data-qt=ds, có các bước, ẩn sơ đồ", JSON.stringify(qt), qt.cheDo === "ds" && qt.soBuoc > 3 && qt.soDoAn);
      const chan = await p.evaluate(() => getComputedStyle(document.querySelector(".chan")).position);
      await p.click("#nut-menu"); await p.waitForTimeout(250);
      const menu = await p.evaluate(() => ({ mo: document.getElementById("thanh-ben").classList.contains("mo"), phu: !document.getElementById("nen-menu").hidden }));
      await p.click("#nen-menu", { position: { x: 340, y: 400 } }); await p.waitForTimeout(250);
      const dong = await p.evaluate(() => !document.getElementById("thanh-ben").classList.contains("mo"));
      ghi("GD-03", "Điện thoại", "Chân trang không cố định; menu trượt có lớp phủ, chạm ra ngoài để đóng", "position≠fixed; mở có lớp phủ; đóng được", `chân trang: ${chan}; menu: ${JSON.stringify(menu)}; đóng: ${dong}`, chan !== "fixed" && menu.mo && menu.phu && dong);
      await p.evaluate(() => { location.hash = "#/thu-tuc"; }); await p.waitForTimeout(300);
      const loc = await p.evaluate(() => ({ an: getComputedStyle(document.querySelector("#loc select")).display === "none", nut: getComputedStyle(document.querySelector(".nut-loc")).display !== "none" }));
      await p.click(".nut-loc"); const loc2 = await p.evaluate(() => getComputedStyle(document.querySelector("#loc select")).display !== "none");
      ghi("GD-04", "Điện thoại", "Bộ lọc thủ tục thu gọn sau nút “Bộ lọc”", "Ẩn bộ lọc; bấm nút thì hiện", `${JSON.stringify(loc)}; sau khi bấm: ${loc2}`, loc.an && loc.nut && loc2);
      await ctx.close();
    }
    // 3. Ngoại tuyến: Service Worker lưu tệp; tải lại khi mất mạng vẫn chạy
    {
      const ctx = await b.newContext();
      const p = await ctx.newPage();
      await p.goto(GOC + "#/tong-quan"); await p.waitForSelector(".ben-muc");
      await p.evaluate(() => navigator.serviceWorker.ready);
      await p.reload(); await p.waitForSelector(".ben-muc");
      await ctx.setOffline(true);
      await p.goto(GOC + "#/thu-tuc/III.3"); const ok = await p.waitForSelector("#noi-dung h1", { timeout: 8000 }).then(() => true, () => false);
      const h1 = ok ? await p.textContent("#noi-dung h1") : "";
      ghi("GD-05", "Ngoại tuyến", "Mất mạng sau lần mở đầu tiên: phần mềm vẫn mở được, tra cứu được", "Mở được thủ tục III.3 khi ngoại tuyến", h1 || "không mở được", ok && /Tách thửa/.test(h1));
      await ctx.close();
    }
    // 4. In phiếu hướng dẫn hồ sơ: 1–2 trang A4, có mã QR
    {
      const p = await b.newPage();
      await p.goto(GOC + "#/phieu/III.3"); await p.waitForSelector(".phieu");
      const qr = await p.evaluate(() => !!document.querySelector(".phieu-qr svg"));
      await p.emulateMedia({ media: "print" });
      const pdf = await p.pdf({ format: "A4" });
      const soTrang = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
      ghi("GD-06", "In ấn", "Phiếu hướng dẫn hồ sơ III.3 in gọn, có mã QR", "≤ 2 trang A4, có QR", `${soTrang} trang; QR: ${qr}`, qr && soTrang >= 1 && soTrang <= 2);
      await p.close();
    }
  } finally {
    await b.close(); sv.close();
  }
  const dat = kq.filter(x => x.trangThai === "Đạt").length;
  const esc = v => { const s = String(v == null ? "" : v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = "﻿" + [["Mã", "Nhóm", "Nội dung kiểm thử", "Kết quả mong đợi", "Kết quả thực tế", "Trạng thái", "Ghi chú"].join(","), ...kq.map(x => [x.ma, x.nhom, x.noiDung, x.mongDoi, x.thucTe, x.trangThai, x.ghiChu].map(esc).join(","))].join("\r\n");
  fs.writeFileSync(path.join(__dirname, "..", "tai-lieu", "ket-qua-kiem-thu.csv"), csv);
  console.log(`\nTỔNG: ${dat}/${kq.length} đạt — đã ghi tai-lieu/ket-qua-kiem-thu.csv`);
  process.exit(dat === kq.length ? 0 : 1);
})().catch(err => { console.error(err); process.exit(1); });
