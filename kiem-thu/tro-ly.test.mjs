// Kiểm thử Worker trợ lý hỏi đáp với nhà cung cấp giả lập (không gọi mạng thật).
import test from "node:test";
import assert from "node:assert/strict";
import worker, { kiemTraYeuCau, dungLoiNhac } from "../tro-ly-ai/src/index.js";

const ORIGIN = "https://tra-cuu-tthc-dat-dai-son-la.vercel.app";
const envCoBan = { ALLOWED_ORIGINS: ORIGIN + ",http://localhost:8686", GEMINI_MODEL: "gemini-3.5-flash", CF_MODEL: "@cf/test", GIOI_HAN_PHUT: "100" };
const yeuCau = (body, origin = ORIGIN, ip = "1.1.1.1") => new Request("https://w.example/hoi", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, "CF-Connecting-IP": ip }, body: JSON.stringify(body) });
const hopLe = { cauHoi: "Tách thửa mất bao nhiêu ngày?", nguCanh: [{ tieuDe: "III.3 Tách thửa", nguon: "Thủ tục III.3", noiDung: "12 (mười hai) ngày làm việc" }] };

test("Kiểm tra yêu cầu: thiếu câu hỏi, quá dài, quá nhiều đoạn", () => {
  assert.ok(kiemTraYeuCau({ nguCanh: [] }));
  assert.ok(kiemTraYeuCau({ cauHoi: "x".repeat(601), nguCanh: hopLe.nguCanh }));
  assert.ok(kiemTraYeuCau({ cauHoi: "a", nguCanh: Array(11).fill(hopLe.nguCanh[0]) }));
  assert.equal(kiemTraYeuCau(hopLe), null);
  assert.match(dungLoiNhac(hopLe.cauHoi, hopLe.nguCanh), /\[1\] III\.3 Tách thửa/);
});

test("Gọi Gemini, giữ khóa ở máy chủ (gửi qua header, không qua URL)", async () => {
  const goc = globalThis.fetch; let daGoi;
  globalThis.fetch = async (url, op) => { daGoi = { url: String(url), op }; return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "12 ngày làm việc [1]" }] } }] }), { status: 200 }); };
  try {
    const r = await worker.fetch(yeuCau(hopLe), { ...envCoBan, GEMINI_API_KEY: "khoa-bi-mat" });
    const d = await r.json();
    assert.equal(r.status, 200); assert.equal(d.nhaCungCap, "Google Gemini"); assert.match(d.traLoi, /\[1\]/);
    assert.ok(!daGoi.url.includes("khoa-bi-mat")); assert.equal(daGoi.op.headers["x-goog-api-key"], "khoa-bi-mat");
    assert.match(daGoi.url, /gemini-3\.5-flash:generateContent/);
    assert.equal(r.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  } finally { globalThis.fetch = goc; }
});

test("Gemini lỗi → dự phòng Workers AI", async () => {
  const goc = globalThis.fetch;
  globalThis.fetch = async () => new Response("quota", { status: 429 });
  try {
    const AI = { run: async (mh, tin) => { assert.equal(mh, "@cf/test"); assert.equal(tin.messages[0].role, "system"); return { response: "Trả lời dự phòng [1]" }; } };
    const r = await worker.fetch(yeuCau(hopLe, ORIGIN, "2.2.2.2"), { ...envCoBan, GEMINI_API_KEY: "k", AI });
    const d = await r.json();
    assert.equal(r.status, 200); assert.equal(d.nhaCungCap, "Cloudflare Workers AI"); assert.equal(d.duPhong, true);
  } finally { globalThis.fetch = goc; }
});

test("Chặn nguồn gọi lạ, phương thức sai, giới hạn tần suất", async () => {
  assert.equal((await worker.fetch(yeuCau(hopLe, "https://la.example"), envCoBan)).status, 403);
  assert.equal((await worker.fetch(new Request("https://w.example/hoi"), envCoBan)).status, 404);
  const env = { ...envCoBan, GIOI_HAN_PHUT: "2", AI: { run: async () => ({ response: "ok" }) } };
  const ma = [];
  for (let i = 0; i < 3; i++) ma.push((await worker.fetch(yeuCau(hopLe, ORIGIN, "3.3.3.3"), env)).status);
  assert.deepEqual(ma, [200, 200, 429]);
  const sk = await (await worker.fetch(new Request("https://w.example/suc-khoe", { headers: { Origin: ORIGIN } }), env)).json();
  assert.equal(sk.workersAi, true); assert.equal(sk.gemini, false);
});
