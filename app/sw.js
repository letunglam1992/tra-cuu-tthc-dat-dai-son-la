/* Bộ nhớ đệm ngoại tuyến: sau lần mở đầu tiên, phần mềm chạy được khi mất mạng.
 * - Tệp ứng dụng (TEP): nạp sẵn khi cài; phục vụ từ bộ đệm, đồng thời cập nhật ngầm từ máy chủ (stale-while-revalidate).
 * - Tệp khác cùng nguồn (PDF nguồn, ảnh bản ký): lưu khi được mở lần đầu.
 * Khi đổi danh sách tệp hoặc phát hành bản mới: tăng PHIEN_BAN (kiểm thử tự động đối chiếu danh sách với thư mục app/). */
const PHIEN_BAN = "tthc-2.1.3";
const TEP = [
  "./", "index.html", "manifest.webmanifest",
  "css/giao-dien.css",
  "du-lieu/nguon.js", "du-lieu/bo-sung.js", "du-lieu/phi-le-phi.js",
  "js/tien-ich.js", "js/mo-hinh.js", "js/tim-kiem.js", "js/thoi-han.js", "js/nghia-vu.js", "js/thu-vien/qrcode.min.js",
  "js/thanh-phan.js", "js/so-do.js", "js/xuat-word.js", "js/xuat-excel.js",
  "js/man-tong-quan.js", "js/man-thu-tuc.js", "js/man-quy-trinh.js", "js/man-tra-cuu.js", "js/man-cong-cu.js", "js/man-nghia-vu.js", "js/man-dien-mau.js", "js/man-bao-cao.js", "js/man-so-theo-doi.js", "js/tro-ly.js", "js/man-hoi-dap.js", "js/bong-bong-tro-ly.js", "js/ung-dung.js",
  "tai-nguyen/nen-nui.svg", "tai-nguyen/bieu-tuong-192.png", "tai-nguyen/bieu-tuong-512.png", "tai-nguyen/bieu-tuong-512-maskable.png",
  "tai-nguyen/fonts/be-vietnam-pro-vi-400.woff2", "tai-nguyen/fonts/be-vietnam-pro-vi-500.woff2", "tai-nguyen/fonts/be-vietnam-pro-vi-600.woff2", "tai-nguyen/fonts/be-vietnam-pro-vi-700.woff2",
  "tai-nguyen/fonts/be-vietnam-pro-latin-400.woff2", "tai-nguyen/fonts/be-vietnam-pro-latin-500.woff2", "tai-nguyen/fonts/be-vietnam-pro-latin-600.woff2", "tai-nguyen/fonts/be-vietnam-pro-latin-700.woff2"
];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(PHIEN_BAN).then(c => c.addAll(TEP)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys().then(ds => Promise.all(ds.filter(k => k.startsWith("tthc-") && k !== PHIEN_BAN).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || /kiem-thu/.test(url.pathname)) return;
  // Yêu cầu theo khoảng byte (trình xem PDF) đi thẳng tới máy chủ
  if (req.headers.has("range")) return;
  ev.respondWith(caches.open(PHIEN_BAN).then(async c => {
    const daCo = await c.match(req, { ignoreSearch: true });
    const moi = fetch(req).then(res => { if (res.ok && res.type === "basic") c.put(req, res.clone()); return res; }).catch(() => null);
    if (daCo) { ev.waitUntil(moi); return daCo; }
    const res = await moi;
    if (res) return res;
    if (req.mode === "navigate") { const trang = await c.match("index.html"); if (trang) return trang; }
    return new Response("Không có kết nối mạng và tệp chưa được lưu ngoại tuyến.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }));
});
