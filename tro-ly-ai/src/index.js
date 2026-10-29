/* Worker trung gian cho trợ lý hỏi đáp thủ tục hành chính đất đai tỉnh Sơn La.
 * - Trình duyệt tự tìm các đoạn nguyên văn liên quan (dữ liệu nằm trên máy người dùng) rồi gửi kèm câu hỏi.
 * - Worker chỉ chuyển câu hỏi + các đoạn đó cho mô hình ngôn ngữ, yêu cầu trả lời DỰA TRÊN các đoạn và dẫn nguồn [n].
 * - Khóa API nằm trong biến bí mật của Worker (wrangler secret), không bao giờ đưa xuống trình duyệt.
 * Nhà cung cấp: Gemini (GEMINI_API_KEY) → dự phòng Cloudflare Workers AI (binding AI, hoặc CF_ACCOUNT_ID + CF_API_TOKEN).
 */
const CHI_DAN = `Bạn là trợ lý tra cứu thủ tục hành chính về đất đai tỉnh Sơn La, trả lời bằng tiếng Việt.
Quy tắc bắt buộc:
1. Chỉ dùng thông tin trong các ĐOẠN TRÍCH được cung cấp (đánh số [1], [2]…). Không dùng hiểu biết bên ngoài, không suy đoán.
2. Mỗi ý trả lời phải ghi nguồn dạng [n] ngay sau ý đó.
3. Giữ đúng thuật ngữ và đơn vị trong văn bản: "ngày làm việc" khác "ngày"; ghi đúng số, mã thủ tục, số mẫu, điều, khoản.
4. Nếu các đoạn trích không đủ để trả lời, nói rõ "Các đoạn trích không có thông tin về …" và gợi ý người hỏi tra cứu mục liên quan; không bịa.
5. Trả lời ngắn gọn, có cấu trúc (gạch đầu dòng khi liệt kê), không quá 250 từ. Không đưa ý kiến tư vấn pháp lý cá nhân.
6. Cuối câu trả lời thêm một dòng: "Thông tin tham khảo — đối chiếu nguyên văn trước khi giải quyết hồ sơ."`;

const json = (o, trangThai, cors) => new Response(JSON.stringify(o), { status: trangThai || 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors } });
const demIP = new Map(); // giới hạn mềm trong một phiên bản Worker

export function dungLoiNhac(cauHoi, nguCanh) {
  const doan = nguCanh.map((x, i) => `[${i + 1}] ${x.tieuDe}${x.nguon ? " — " + x.nguon : ""}\n${x.noiDung}`).join("\n\n");
  return `ĐOẠN TRÍCH:\n${doan}\n\nCÂU HỎI: ${cauHoi}`;
}

export function kiemTraYeuCau(b) {
  if (!b || typeof b.cauHoi !== "string" || !b.cauHoi.trim()) return "Thiếu câu hỏi";
  if (b.cauHoi.length > 600) return "Câu hỏi quá dài (tối đa 600 ký tự)";
  if (!Array.isArray(b.nguCanh) || !b.nguCanh.length) return "Thiếu đoạn trích ngữ cảnh";
  if (b.nguCanh.length > 10) return "Tối đa 10 đoạn trích";
  for (const x of b.nguCanh) if (!x || typeof x.noiDung !== "string" || x.noiDung.length > 2500 || typeof x.tieuDe !== "string" || x.tieuDe.length > 300) return "Đoạn trích không hợp lệ";
  return null;
}

async function goiGemini(env, loiNhac) {
  const mh = env.GEMINI_MODEL || "gemini-3.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(mh)}:generateContent`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: CHI_DAN }] }, contents: [{ role: "user", parts: [{ text: loiNhac }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 1024 } }),
    signal: AbortSignal.timeout(25000)
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  const text = ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || []).map(p => p.text || "").join("").trim();
  if (!text) throw new Error("Gemini không trả nội dung" + (d.promptFeedback ? " (" + JSON.stringify(d.promptFeedback).slice(0, 120) + ")" : ""));
  return { traLoi: text, nhaCungCap: "Google Gemini", moHinh: mh };
}

async function goiWorkersAI(env, loiNhac) {
  const mh = env.CF_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const tin = { messages: [{ role: "system", content: CHI_DAN }, { role: "user", content: loiNhac }], max_tokens: 1024, temperature: 0.2 };
  let d;
  if (env.AI && typeof env.AI.run === "function") d = await env.AI.run(mh, tin);
  else if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${mh}`, { method: "POST", headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(tin), signal: AbortSignal.timeout(25000) });
    if (!r.ok) throw new Error(`Workers AI ${r.status}`);
    d = (await r.json()).result;
  } else throw new Error("Chưa cấu hình Workers AI");
  const text = String((d && (d.response || (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content))) || "").trim();
  if (!text) throw new Error("Workers AI không trả nội dung");
  return { traLoi: text, nhaCungCap: "Cloudflare Workers AI", moHinh: mh };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get("Origin") || "";
    const choPhep = String(env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const hopLe = choPhep.includes(origin);
    const cors = hopLe ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", Vary: "Origin" } : { Vary: "Origin" };
    if (req.method === "OPTIONS") return new Response(null, { status: hopLe ? 204 : 403, headers: cors });
    if (url.pathname === "/suc-khoe") return json({ ok: true, gemini: !!env.GEMINI_API_KEY, workersAi: !!(env.AI || (env.CF_ACCOUNT_ID && env.CF_API_TOKEN)), moHinh: env.GEMINI_MODEL }, 200, cors);
    if (url.pathname !== "/hoi" || req.method !== "POST") return json({ loi: "Không tìm thấy" }, 404, cors);
    if (!hopLe) return json({ loi: "Nguồn gọi không được phép" }, 403, cors);
    // Giới hạn tần suất (mềm)
    const ip = req.headers.get("CF-Connecting-IP") || "?", phut = Math.floor(Date.now() / 60000), k = ip + ":" + phut;
    const n = (demIP.get(k) || 0) + 1; demIP.set(k, n); if (demIP.size > 5000) demIP.clear();
    if (n > (+env.GIOI_HAN_PHUT || 12)) return json({ loi: "Hỏi quá nhiều trong 1 phút, vui lòng thử lại sau" }, 429, cors);
    let b; try { b = await req.json(); } catch (_) { return json({ loi: "Dữ liệu gửi lên không phải JSON" }, 400, cors); }
    const loi = kiemTraYeuCau(b); if (loi) return json({ loi }, 400, cors);
    const loiNhac = dungLoiNhac(b.cauHoi.trim(), b.nguCanh);
    const loiGap = [];
    if (env.GEMINI_API_KEY) { try { return json(await goiGemini(env, loiNhac), 200, cors); } catch (err) { loiGap.push(err.message); } }
    try { return json({ ...(await goiWorkersAI(env, loiNhac)), duPhong: loiGap.length > 0 }, 200, cors); } catch (err) { loiGap.push(err.message); }
    return json({ loi: "Dịch vụ trả lời tạm thời không khả dụng", chiTiet: loiGap }, 502, cors);
  }
};
