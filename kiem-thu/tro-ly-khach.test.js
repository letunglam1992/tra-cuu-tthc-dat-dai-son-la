// Kiểm thử phía trình duyệt của trợ lý hỏi đáp (app/js/tro-ly.js): hai giao thức Worker, lời nhắc khớp Worker tro-ly-ai/, cấu hình hợp CSP.
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("fs"), path = require("path");
const { TT, ctx, mh } = require("./nap")();
const nguCanh = [{ tieuDe: "III.3 Tách thửa", nguon: "Thủ tục III.3", noiDung: "Không quá 15 ngày làm việc" }];
const giaLap = (trangThai, body) => { const goi = []; ctx.__fetch = async (url, op) => { goi.push({ url: String(url), body: JSON.parse(op.body) }); return new Response(JSON.stringify(body), { status: trangThai }); }; return goi; };

test("Lời nhắc dựng tại trình duyệt giống hệt Worker tro-ly-ai/", async () => {
  const w = await import("../tro-ly-ai/src/index.js");
  assert.equal(TT.troLy.CHI_DAN, w.CHI_DAN);
  assert.equal(TT.troLy.dungLoiNhac("Tách thửa bao lâu?", nguCanh), w.dungLoiNhac("Tách thửa bao lâu?", nguCanh));
});

test("Giao thức messages: gửi system + user tới gốc Worker, đọc {text, model}", async () => {
  const goi = giaLap(200, { text: "Không quá 15 ngày làm việc [1].", model: "@cf/aisingapore/gemma-sea-lion-v4-27b-it" });
  const d = await TT.troLy.hoi({ diaChi: "https://w.example.workers.dev/", giaoThuc: "messages", moHinh: "" }, "Tách thửa bao lâu?", nguCanh);
  assert.equal(goi[0].url, "https://w.example.workers.dev");
  assert.equal(goi[0].body.messages[0].role, "system"); assert.match(goi[0].body.messages[1].content, /\[1\] III\.3 Tách thửa — Thủ tục III\.3/);
  assert.ok(!("model" in goi[0].body), "moHinh trống thì để Worker dùng mô hình mặc định");
  assert.equal(d.traLoi, "Không quá 15 ngày làm việc [1]."); assert.equal(d.nhaCungCap, "Cloudflare Workers AI"); assert.equal(d.tenMoHinh, "gemma-sea-lion-v4-27b-it");
});

test("Giao thức messages: hết hạn mức (429) báo lỗi dễ hiểu", async () => {
  giaLap(429, { error: "3036: daily free allocation exceeded" });
  await assert.rejects(TT.troLy.hoi({ diaChi: "https://w.example.workers.dev", giaoThuc: "messages" }, "x", nguCanh), /hết hạn mức/);
});

test("Giao thức tthc: gửi {cauHoi, nguCanh} tới /hoi", async () => {
  const goi = giaLap(200, { traLoi: "15 ngày làm việc [1]", nhaCungCap: "Google Gemini", moHinh: "gemini-3.5-flash" });
  const d = await TT.troLy.hoi({ diaChi: "https://t.example.workers.dev", giaoThuc: "tthc" }, "Tách thửa?", nguCanh);
  assert.equal(goi[0].url, "https://t.example.workers.dev/hoi"); assert.equal(goi[0].body.cauHoi, "Tách thửa?"); assert.equal(d.nhaCungCap, "Google Gemini");
});

test("Cấu hình trợ lý: địa chỉ HTTPS *.workers.dev, nằm trong connect-src của CSP", () => {
  const c = mh.B.troLyAI;
  assert.ok(["tthc", "messages"].includes(c.giaoThuc));
  if (!c.diaChi) return;
  assert.match(c.diaChi, /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.workers\.dev$/);
  const v = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "app", "vercel.json"), "utf8"));
  const csp = v.headers.flatMap(h => h.headers).find(h => h.key === "Content-Security-Policy").value;
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.workers\.dev/);
});
