// Tái tạo app/du-lieu/nguon.js từ tệp PDF nguồn — chạy được trên Windows, Linux, macOS (thay cho cap-nhat-du-lieu.ps1).
// Dùng:  node cong-cu/cap-nhat-du-lieu.js [duong/dan/tep.pdf]     (hoặc: npm run cap-nhat-du-lieu)
// Yêu cầu: Node.js ≥ 18 và .NET SDK 8 (lần đầu cần Internet để tải gói PdfPig từ nuget.org).
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");
const GOC = path.join(__dirname, "..");
const pdf = path.resolve(process.argv[2] || path.join(GOC, "app", "tai-nguyen", "qd75.pdf"));
if (!fs.existsSync(pdf)) { console.error("Không tìm thấy tệp PDF: " + pdf); process.exit(1); }
const tam = path.join(GOC, "cong-cu", "tam"); fs.mkdirSync(tam, { recursive: true });
const chay = (lenh, thamSo) => execFileSync(lenh, thamSo, { stdio: ["ignore", "inherit", "inherit"] });

try { execFileSync("dotnet", ["--version"], { stdio: "ignore" }); }
catch (_) { console.error("Chưa cài .NET SDK 8 (lệnh dotnet). Tải tại https://dotnet.microsoft.com/download"); process.exit(1); }

console.log("1/4 Biên dịch công cụ trích xuất...");
const duAn = path.join(GOC, "cong-cu", "trich-pdf");
chay("dotnet", ["build", duAn, "-v", "q", "-nologo"]);
const dll = path.join(duAn, "bin", "Debug", "net8.0", "trich-pdf.dll");
const cuaCongCu = (...ts) => chay("dotnet", [dll, ...ts]);

console.log("2/4 Trích văn bản và cấu trúc bảng...");
cuaCongCu("text", pdf, path.join(tam, "qd75.txt"));
cuaCongCu("cau-truc", pdf, path.join(tam, "cau-truc.json"));

console.log("3/4 Phân tích nghiệp vụ...");
cuaCongCu("phan-tich", pdf, path.join(tam, "cau-truc.json"), path.join(tam, "trich-xuat.json"));

console.log("4/4 Ghi app/du-lieu/nguon.js ...");
const json = fs.readFileSync(path.join(tam, "trich-xuat.json"), "utf8").replace(/^﻿/, "");
JSON.parse(json); // bảo đảm hợp lệ trước khi ghi
const bam = crypto.createHash("sha256").update(fs.readFileSync(pdf)).digest("hex");
const soTrang = (fs.readFileSync(path.join(tam, "qd75.txt"), "utf8").match(/=== TRANG \d+ ===/g) || []).length;
const meta = { tepNguon: path.basename(pdf), sha256: bam, soTrang, ngayTrichXuat: new Date().toISOString().slice(0, 10), congCu: "cong-cu/trich-pdf (PdfPig)" };
const js = "/* TỆP SINH TỰ ĐỘNG bởi cong-cu/cap-nhat-du-lieu.js — KHÔNG SỬA TAY. Nội dung là nguyên văn trích từ PDF nguồn. */\n" +
  `window.QD75_NGUON = ${json.trim()};\nwindow.QD75_NGUON.thongTinTrichXuat = ${JSON.stringify(meta)};\n`;
fs.writeFileSync(path.join(GOC, "app", "du-lieu", "nguon.js"), js, "utf8");
console.log(`Xong. SHA-256 nguồn: ${bam} ; số trang: ${soTrang}. Tiếp theo: rà app/du-lieu/bo-sung.js rồi chạy npm test.`);
