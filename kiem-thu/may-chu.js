// Máy chủ tĩnh tối giản (không phụ thuộc thư viện) — phục vụ thư mục app/ cho kiểm thử và chạy cục bộ.
// Dùng: node kiem-thu/may-chu.js [cổng]   (mặc định 8686)
const http = require("http"), fs = require("fs"), path = require("path");
const GOC = path.join(__dirname, "..", "app");
const LOAI = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".pdf": "application/pdf", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8" };
function khoiDong(cong) {
  const sv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const tep = path.normalize(path.join(GOC, p));
    if (!tep.startsWith(GOC)) { res.writeHead(403); return res.end(); }
    fs.stat(tep, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Không tìm thấy"); }
      res.writeHead(200, { "Content-Type": LOAI[path.extname(tep).toLowerCase()] || "application/octet-stream", "Content-Length": st.size, "Cache-Control": "no-cache" });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(tep).pipe(res);
    });
  });
  return new Promise(ok => sv.listen(cong, "127.0.0.1", () => ok(sv)));
}
module.exports = khoiDong;
if (require.main === module) {
  const cong = +process.argv[2] || 8686;
  khoiDong(cong).then(() => console.log(`Phần mềm: http://localhost:${cong}/  ·  Kiểm thử: http://localhost:${cong}/kiem-thu.html  (Ctrl+C để dừng)`));
}
