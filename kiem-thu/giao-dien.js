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
      const tuyen = ["#/tong-quan", "#/thu-tuc", "#/thu-tuc/III.3", "#/thu-tuc/I.1/ho-so", "#/quy-trinh/QT15", "#/thu-hoi", "#/mau-bieu", "#/mau-bieu/19", "#/co-quan", "#/can-cu", "#/tra-cuu?q=s%E1%BB%95%20%C4%91%E1%BB%8F", "#/tinh-han?ma=III.3", "#/phieu/III.3", "#/gioi-thieu", "#/doi-soat", "#/nghia-vu?phi=III.3", "#/phi-le-phi", "#/dien-mau", "#/dien-mau/22", "#/bao-cao", "#/so-theo-doi", "#/hoi-dap", "#/doi-soat?tab=ma-tthc"];
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
    // 5. Công cụ v2.1: sổ theo dõi + Excel, điền mẫu + Word, báo cáo Word, hỏi đáp (Worker giả lập)
    {
      const ctx = await b.newContext({ acceptDownloads: true, serviceWorkers: "block" });
      const p = await ctx.newPage(); const loi = []; p.on("pageerror", e => loi.push(e.message));
      const zipTep = buf => { const ra = {}; let o = 0; while (buf.readUInt32LE(o) === 0x04034b50) { const co = buf.readUInt32LE(o + 18), dt = buf.readUInt16LE(o + 26); ra[buf.subarray(o + 30, o + 30 + dt).toString()] = buf.subarray(o + 30 + dt, o + 30 + dt + co).toString(); o += 30 + dt + co; } return ra; };
      const taiVe = async (nut) => { const [d] = await Promise.all([p.waitForEvent("download"), p.click(nut)]); return { ten: d.suggestedFilename(), buf: fs.readFileSync(await d.path()) }; };
      // Sổ theo dõi
      await p.goto(GOC + "#/so-theo-doi"); await p.waitForSelector("#so-form");
      await p.fill('#so-form [name="soHoSo"]', "HS-KT-01"); await p.selectOption('#so-form [name="ma"]', "III.3");
      await p.fill('#so-form [name="ngayNhan"]', "2026-10-29"); await p.click('#so-form button.nut-chinh'); await p.waitForTimeout(300);
      const dong = await p.textContent("tbody tr");
      const x = await taiVe("#so-xlsx"); const zx = zipTep(x.buf);
      ghi("GD-07", "Công cụ", "Sổ theo dõi: thêm hồ sơ III.3, tính hạn trả, xuất Excel", "Hạn 16/11/2026; tệp .xlsx có số hồ sơ", `${/16\/11\/2026/.test(dong) ? "hạn đúng" : "hạn sai: " + dong.replace(/\s+/g, " ").slice(0, 80)}; ${x.ten}; có HS-KT-01: ${(zx["xl/worksheets/sheet1.xml"] || "").includes("HS-KT-01")}`, /16\/11\/2026/.test(dong) && /\.xlsx$/.test(x.ten) && (zx["xl/worksheets/sheet1.xml"] || "").includes("HS-KT-01"));
      // Điền mẫu
      await p.goto(GOC + "#/dien-mau/22"); await p.waitForSelector(".o-dien");
      await p.fill(".o-dien >> nth=0", "Văn phòng Đăng ký đất đai tỉnh Sơn La"); await p.fill(".o-dien >> nth=1", "Nguyễn Văn A");
      const w = await taiVe("#tai-dien"); const dx = zipTep(w.buf)["word/document.xml"] || "";
      ghi("GD-08", "Công cụ", "Điền Mẫu số 22 rồi tải Word: giá trị nằm trong tệp", "Tệp .docx chứa giá trị đã nhập", `${w.ten}; ${dx.includes("Nguyễn Văn A") ? "có giá trị" : "thiếu giá trị"}`, /da-dien\.docx$/.test(w.ten) && dx.includes("Nguyễn Văn A") && dx.includes("Văn phòng Đăng ký đất đai tỉnh Sơn La"));
      // Báo cáo
      await p.goto(GOC + "#/bao-cao"); await p.waitForSelector("#bc-word");
      await p.fill('#bc-tt [name="so"]', "123");
      const bc = await taiVe("#bc-word"); const bx = zipTep(bc.buf)["word/document.xml"] || "";
      const soBang = (bx.match(/<w:tbl>/g) || []).length;
      ghi("GD-09", "Công cụ", "Báo cáo tổng hợp TTHC xuất Word: phần đầu, bảng, nơi nhận", "Có quốc hiệu, số 123, ≥ 3 bảng, 45 dòng danh mục", `${bc.ten}; bảng: ${soBang}; số: ${bx.includes("Số: 123/")}; III.22: ${bx.includes("III.22")}`, soBang >= 4 && bx.includes("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM") && bx.includes("Số: 123/") && bx.includes("III.22") && bx.includes("Nơi nhận:"));
      // Hỏi đáp: chưa cấu hình → vẫn hiện đoạn nguyên văn; có Worker (giả lập) → câu trả lời có dẫn nguồn
      await p.goto(GOC + "#/hoi-dap?q=" + encodeURIComponent("Tách thửa đất mất bao nhiêu ngày làm việc?")); await p.waitForSelector(".hd-nguon li", { timeout: 5000 });
      const soNguon = await p.$$eval(".hd-nguon li", a => a.length);
      await p.route("https://tro-ly.vi-du.workers.dev/hoi", r => r.fulfill({ status: 200, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ traLoi: "- Thời hạn: 12 ngày làm việc [1]\nThông tin tham khảo.", nhaCungCap: "Giả lập", moHinh: "kiem-thu" }) }));
      await p.evaluate(() => localStorage.setItem("tthc-tro-ly-dia-chi", "https://tro-ly.vi-du.workers.dev"));
      await p.goto(GOC + "#/hoi-dap?q=" + encodeURIComponent("Tách thửa đất mất bao nhiêu ngày làm việc?") + "&t=2"); await p.reload();
      const coTraLoi = await p.waitForSelector(".hd-noi-dung a.trich-dan", { timeout: 8000 }).then(() => true, () => false);
      ghi("GD-10", "Công cụ", "Hỏi đáp: không có Worker vẫn hiện đoạn nguyên văn; có Worker hiện câu trả lời dẫn nguồn [n]", "≥ 3 đoạn; có liên kết [1]", `${soNguon} đoạn; trả lời có dẫn nguồn: ${coTraLoi}`, soNguon >= 3 && coTraLoi);
      ghi("GD-11", "Công cụ", "Không lỗi JavaScript khi dùng các công cụ mới", "0 lỗi", loi.length ? loi.join(" | ") : "0", !loi.length);
      await ctx.close();
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
