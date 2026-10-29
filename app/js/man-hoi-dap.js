/* Màn hình: hỏi đáp bằng ngôn ngữ tự nhiên (trợ lý AI có dẫn nguồn).
 * Bước 1 (trên máy người dùng, chạy cả khi mất mạng): tìm các đoạn nguyên văn liên quan bằng bộ tìm kiếm của phần mềm.
 * Bước 2 (cần mạng): gửi câu hỏi + các đoạn đó tới Worker trung gian (tro-ly-ai/) — mô hình chỉ được trả lời dựa trên đoạn trích, dẫn nguồn [n].
 * Câu hỏi được gửi tới nhà cung cấp mô hình (Google Gemini / Cloudflare Workers AI) — giao diện thông báo rõ cho người dùng. */
window.TT = window.TT || {};
TT.man = TT.man || {};
(function () {
  const ti = TT.ti, tp = TT.tp, e = ti.e, bt = tp.bt;
  const KHOA_DC = "tthc-tro-ly-dia-chi", KHOA_GT = "tthc-tro-ly-giao-thuc";
  // Cấu hình trợ lý: mặc định từ bo-sung.js (troLyAI), có thể ghi đè trên từng trình duyệt ở chế độ kiểm soát
  const cauHinh = mh => {
    const g = mh.B.troLyAI || {}; let dc = "", gt = "";
    try { dc = localStorage.getItem(KHOA_DC) || ""; gt = localStorage.getItem(KHOA_GT) || ""; } catch (_) { }
    return dc ? { diaChi: dc.replace(/\/+$/, ""), giaoThuc: gt || "tthc", moHinh: gt === "messages" ? g.moHinh || "" : "" }
      : { diaChi: (g.diaChi || "").replace(/\/+$/, ""), giaoThuc: g.giaoThuc || "tthc", moHinh: g.moHinh || "" };
  };
  const GOI_Y = ["Tách thửa đất mất bao nhiêu ngày làm việc?", "Cấp lại Giấy chứng nhận bị mất cần những giấy tờ gì?", "Lệ phí cấp Giấy chứng nhận lần đầu cho cá nhân ở xã là bao nhiêu?", "Cơ quan thuế ban hành thông báo nộp tiền trong thời hạn bao lâu?", "Ai có thẩm quyền giao đất cho hộ gia đình chuyển mục đích sang đất ở?"];

  // Đoạn trích gửi kèm: kết quả tìm + mục (3) thời hạn của thủ tục (câu hỏi thường hỏi thời hạn)
  function nguCanh(mh, cauHoi) {
    const kq = TT.tk.timNguCanh(cauHoi, 7), ds = [];
    for (const r of kq) {
      let noi = r.noiDung;
      if (r.loai === "thu-tuc" && mh.thuTucTheoMa[r.id] && !/^Thời hạn/.test(r.truong || "")) { const m3 = mh.thuTucTheoMa[r.id].muc[3]; if (m3) noi += "\nThời hạn giải quyết: " + ti.gopTrang(m3.noiDung).slice(0, 400); }
      ds.push({ tieuDe: r.tieuDe.slice(0, 280), nguon: [r.phu, r.truong].filter(Boolean).join(" · ").slice(0, 200), noiDung: noi.slice(0, 2400), lienKet: r.lienKet, nhom: r.nhom });
    }
    return ds;
  }
  // Hiển thị câu trả lời: thoát HTML, xuống dòng, gạch đầu dòng, [n] → liên kết nguồn
  function veTraLoi(text, nguon) {
    return e(text).split(/\n+/).map(dong => {
      let d = dong.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[(\d+(?:\s*[,;–-]\s*\d+)*)\]/g, (m, ds) => { const so = ds.split(/\s*[,;–-]\s*/); return so.every(n => nguon[+n - 1]) ? so.map(n => `<a class="trich-dan" href="${nguon[+n - 1].lienKet}" title="${e(nguon[+n - 1].tieuDe)}">[${n}]</a>`).join("") : m; });
      return /^\s*[-*•]\s+/.test(dong) ? `<li>${d.replace(/^\s*[-*•]\s+/, "")}</li>` : `<p>${d}</p>`;
    }).join("").replace(/(<li>.*?<\/li>)+/g, m => `<ul>${m}</ul>`);
  }

  TT.man["hoi-dap"] = function (ctx) {
    const { mh, q } = ctx;
    const ch = cauHinh(mh), dc = ch.diaChi;
    const html = `<div class="trang">
      <div class="dong-tieu-de"><div><div class="nhan-trang">Hỏi đáp</div><h1>Hỏi đáp về thủ tục hành chính đất đai</h1>
        <div class="mo-ta">Đặt câu hỏi bằng lời thường. Phần mềm tìm các đoạn nguyên văn liên quan, trợ lý AI tóm tắt câu trả lời <b>chỉ dựa trên các đoạn đó</b> và ghi nguồn [n] — bấm vào để mở đúng vị trí.</div></div></div>
      <form class="the hoi-dap-o" id="hd-form"><label class="sr" for="hd-q">Câu hỏi</label><textarea id="hd-q" rows="2" maxlength="600" placeholder="Ví dụ: Tách thửa đất mất bao nhiêu ngày làm việc và cần giấy tờ gì?">${e(q.q || "")}</textarea>
        <div class="tang"><button class="nut nut-chinh">${bt("tim", 15)} Hỏi</button><span class="chu-nho mo">${dc ? `Câu hỏi và các đoạn trích được gửi tới dịch vụ AI (${ch.giaoThuc === "messages" ? "Cloudflare Workers AI" : "Google Gemini hoặc Cloudflare Workers AI"}). Không nhập thông tin cá nhân.` : `Trợ lý AI chưa được cấu hình — phần mềm vẫn tìm các đoạn liên quan.`}</span></div>
        <div class="hd-goi-y">${GOI_Y.map(g => `<button type="button" class="nut nut-nho" data-goi-y="${e(g)}">${e(g)}</button>`).join("")}</div></form>
      <div id="hd-kq" aria-live="polite"></div>
      ${TT.quanTri ? `<details class="the" style="margin-top:16px"><summary style="padding:12px 16px;cursor:pointer;font-weight:600">Cấu hình trợ lý (chế độ kiểm soát)</summary><div class="the-than chu-nho">
        <label class="truong"><span>Địa chỉ Worker (ví dụ https://tro-ly-tthc-dat-dai-son-la.&lt;tài khoản&gt;.workers.dev)</span><input id="hd-dc" value="${e(dc)}"></label>
        <label class="truong"><span>Giao thức</span><select id="hd-gt"><option value="tthc"${ch.giaoThuc === "tthc" ? " selected" : ""}>Worker của phần mềm (tro-ly-ai/: /hoi, Gemini → Workers AI)</option><option value="messages"${ch.giaoThuc === "messages" ? " selected" : ""}>Worker Workers AI dùng chung ({messages} → {text})</option></select></label>
        <div class="tang" style="margin-top:8px"><button type="button" class="nut nut-nho" id="hd-luu-dc">Lưu trên trình duyệt này</button><button type="button" class="nut nut-nho" id="hd-kt">Kiểm tra kết nối</button><span id="hd-kt-kq"></span></div>
        <p class="mo">Cấu hình chung cho mọi người dùng: đặt <code>troLyAI.diaChi</code> trong <code>app/du-lieu/bo-sung.js</code>. Hướng dẫn triển khai Worker: <code>tro-ly-ai/README.md</code>.</p></div></details>` : ""}
    </div>`;
    return { tieuDe: "Hỏi đáp", html,
      sau(root) {
        const f = root.querySelector("#hd-form"), o = root.querySelector("#hd-q"), kq = root.querySelector("#hd-kq");
        async function hoi() {
          const cauHoi = o.value.trim(); if (!cauHoi) return;
          history.replaceState(null, "", "#/hoi-dap?q=" + encodeURIComponent(cauHoi));
          const nguon = nguCanh(mh, cauHoi);
          const dsNguon = nguon.length ? `<div class="the" style="margin-top:12px"><div class="the-dau"><h3>Các đoạn nguyên văn liên quan</h3><div class="phai">${tp.dauNguon.nv()}</div></div><ol class="hd-nguon">${nguon.map((x, i) => `<li id="nguon-${i + 1}"><a href="${x.lienKet}"><b>[${i + 1}] ${e(x.tieuDe)}</b></a><div class="chu-nho mo">${e(x.nguon)}</div><div class="chu-nho">${e(x.noiDung.length > 420 ? x.noiDung.slice(0, 418) + "…" : x.noiDung)}</div></li>`).join("")}</ol></div>` : "";
          if (!nguon.length) { kq.innerHTML = `<div class="the trong"><b>Không tìm thấy đoạn văn bản liên quan.</b>Thử diễn đạt khác, dùng tên thủ tục hoặc từ khóa (ví dụ: tách thửa, cấp đổi, lệ phí). <a href="#/tra-cuu?q=${encodeURIComponent(cauHoi)}">Tra cứu nhanh</a></div>`; return; }
          const ch = cauHinh(mh);
          if (!ch.diaChi) { kq.innerHTML = `<div class="thong-bao thong-bao-vang">${bt("thongTin")}<div>Trợ lý AI chưa được cấu hình; dưới đây là các đoạn nguyên văn liên quan nhất.</div></div>${dsNguon}`; return; }
          if (!navigator.onLine) { kq.innerHTML = `<div class="thong-bao thong-bao-vang">${bt("canhBao")}<div>Đang mất mạng — trợ lý AI cần kết nối. Các đoạn nguyên văn liên quan:</div></div>${dsNguon}`; return; }
          kq.innerHTML = `<div class="the hd-tra-loi"><div class="the-than"><p class="mo">Đang soạn câu trả lời…</p></div></div>${dsNguon}`;
          try {
            const d = await TT.troLy.hoi(ch, cauHoi, nguon.map(({ tieuDe, nguon, noiDung }) => ({ tieuDe, nguon, noiDung })));
            kq.querySelector(".hd-tra-loi").innerHTML = `<div class="the-dau"><h3>Trả lời</h3><div class="phai"><span class="nhan nhan-tim" title="${e(d.moHinh || "")}">AI · ${e(d.nhaCungCap || "")}${d.tenMoHinh ? " · " + e(d.tenMoHinh) : ""}${d.duPhong ? " (dự phòng)" : ""}</span></div></div><div class="the-than hd-noi-dung">${veTraLoi(d.traLoi, nguon)}
              <p class="chu-nho mo" style="margin-top:10px">Câu trả lời do AI tóm tắt từ các đoạn nguyên văn bên dưới, có thể sai hoặc thiếu. Luôn đối chiếu nguyên văn và văn bản gốc trước khi giải quyết hồ sơ.</p></div>`;
          } catch (err) {
            kq.querySelector(".hd-tra-loi").innerHTML = `<div class="the-than"><div class="thong-bao thong-bao-vang" style="margin:0">${bt("canhBao")}<div>Trợ lý AI chưa trả lời được (${e(err.message)}). Các đoạn nguyên văn liên quan vẫn hiển thị bên dưới.</div></div></div>`;
          }
        }
        f.addEventListener("submit", ev => { ev.preventDefault(); hoi(); });
        o.addEventListener("keydown", ev => { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); hoi(); } });
        root.querySelectorAll("[data-goi-y]").forEach(b => b.addEventListener("click", () => { o.value = b.getAttribute("data-goi-y"); hoi(); }));
        const luu = root.querySelector("#hd-luu-dc");
        if (luu) {
          const nhap = () => ({ diaChi: root.querySelector("#hd-dc").value.trim().replace(/\/+$/, ""), giaoThuc: root.querySelector("#hd-gt").value, moHinh: "" });
          luu.addEventListener("click", () => { const c = nhap(); try { localStorage.setItem(KHOA_DC, c.diaChi); localStorage.setItem(KHOA_GT, c.giaoThuc); } catch (_) { } root.querySelector("#hd-kt-kq").textContent = "Đã lưu."; });
          root.querySelector("#hd-kt").addEventListener("click", async () => { const out = root.querySelector("#hd-kt-kq"); out.textContent = "Đang kiểm tra…"; try { out.textContent = await TT.troLy.kiemTra(nhap()); } catch (err) { out.textContent = "Không kết nối được: " + err.message; } });
        }
        if (q.q) hoi(); else o.focus();
      } };
  };
  TT.hoiDap = { nguCanh, veTraLoi, cauHinh };
})();
