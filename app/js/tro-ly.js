/* Gọi trợ lý AI qua Worker trung gian. Hai giao thức:
 *  - "tthc":     Worker riêng của phần mềm (tro-ly-ai/) — POST {cauHoi, nguCanh} tới /hoi, nhận {traLoi, nhaCungCap, moHinh}; lời nhắc dựng ở Worker.
 *  - "messages": Worker Workers AI dùng chung (ví dụ Worker của app Rà soát văn bản) — POST {model, messages, max_tokens} tới gốc, nhận {text, model};
 *                lời nhắc (chỉ dẫn + đoạn trích) dựng tại trình duyệt, giống hệt tro-ly-ai/src/index.js (kiểm thử đối chiếu).
 * Không chứa khóa API: khóa nằm trong biến bí mật của Worker. */
window.TT = window.TT || {};
TT.troLy = (function () {
  const CHI_DAN = `Bạn là trợ lý tra cứu thủ tục hành chính về đất đai tỉnh Sơn La, trả lời bằng tiếng Việt.
Quy tắc bắt buộc:
1. Chỉ dùng thông tin trong các ĐOẠN TRÍCH được cung cấp (đánh số [1], [2]…). Không dùng hiểu biết bên ngoài, không suy đoán.
2. Mỗi ý trả lời phải ghi nguồn dạng [n] ngay sau ý đó.
3. Giữ đúng thuật ngữ và đơn vị trong văn bản: "ngày làm việc" khác "ngày"; ghi đúng số, mã thủ tục, số mẫu, điều, khoản.
4. Nếu các đoạn trích không đủ để trả lời, nói rõ "Các đoạn trích không có thông tin về …" và gợi ý người hỏi tra cứu mục liên quan; không bịa.
5. Trả lời ngắn gọn, có cấu trúc (gạch đầu dòng khi liệt kê), không quá 250 từ. Không đưa ý kiến tư vấn pháp lý cá nhân.
6. Cuối câu trả lời thêm một dòng: "Thông tin tham khảo — đối chiếu nguyên văn trước khi giải quyết hồ sơ."`;
  const dungLoiNhac = (cauHoi, nguCanh) => `ĐOẠN TRÍCH:\n${nguCanh.map((x, i) => `[${i + 1}] ${x.tieuDe}${x.nguon ? " — " + x.nguon : ""}\n${x.noiDung}`).join("\n\n")}\n\nCÂU HỎI: ${cauHoi}`;
  const tenMoHinh = m => String(m || "").replace(/^@cf\/[^/]+\//, "");
  // Mã lỗi Workers AI thường gặp → lời nhắn dễ hiểu
  const giaiThich = (st, loi) => st === 429 || /3036|3040|capacity|limit/i.test(loi) ? "đã hết hạn mức Workers AI miễn phí trong ngày hoặc máy chủ đang quá tải — thử lại sau"
    : st === 401 ? "Worker yêu cầu mã truy cập (APP_TOKEN)" : (loi || "máy chủ trả lỗi " + st);

  async function goiJson(url, body, ms) {
    const op = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
    if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) op.signal = AbortSignal.timeout(ms || 45000);
    const r = await fetch(url, op);
    return { r, d: await r.json().catch(() => ({})) };
  }
  // cauHinh: { diaChi, giaoThuc, moHinh }; nguCanh: [{tieuDe, nguon, noiDung}]
  async function hoi(cauHinh, cauHoi, nguCanh) {
    const dc = String(cauHinh.diaChi || "").replace(/\/+$/, "");
    if (cauHinh.giaoThuc === "messages") {
      const body = { messages: [{ role: "system", content: CHI_DAN }, { role: "user", content: dungLoiNhac(cauHoi, nguCanh) }], max_tokens: 1024 };
      if (cauHinh.moHinh) body.model = cauHinh.moHinh;
      const { r, d } = await goiJson(dc, body);
      const text = String(d.text || "").trim();
      if (!r.ok || !text) throw new Error(giaiThich(r.status, d.error || (r.ok ? "mô hình không trả nội dung" : "")));
      return { traLoi: text, nhaCungCap: "Cloudflare Workers AI", moHinh: d.model || cauHinh.moHinh || "", tenMoHinh: tenMoHinh(d.model || cauHinh.moHinh) };
    }
    const { r, d } = await goiJson(dc + "/hoi", { cauHoi, nguCanh });
    if (!r.ok || !d.traLoi) throw new Error(giaiThich(r.status, d.loi));
    return { ...d, tenMoHinh: tenMoHinh(d.moHinh) };
  }
  // Kiểm tra kết nối (chế độ kiểm soát)
  async function kiemTra(cauHinh) {
    const dc = String(cauHinh.diaChi || "").replace(/\/+$/, "");
    if (cauHinh.giaoThuc === "messages") {
      const body = { messages: [{ role: "user", content: "Chỉ trả lời đúng một từ: OK" }], max_tokens: 64 };
      if (cauHinh.moHinh) body.model = cauHinh.moHinh;
      const { r, d } = await goiJson(dc, body, 30000);
      if (!r.ok) throw new Error(giaiThich(r.status, d.error));
      return `Kết nối được · Workers AI · mô hình ${tenMoHinh(d.model)}`;
    }
    const r = await fetch(dc + "/suc-khoe"); const d = await r.json();
    return `Kết nối được · Gemini: ${d.gemini ? "có khóa" : "chưa có khóa"} · Workers AI: ${d.workersAi ? "có" : "không"} · mô hình ${d.moHinh || ""}`;
  }
  return { CHI_DAN, dungLoiNhac, hoi, kiemTra };
})();
