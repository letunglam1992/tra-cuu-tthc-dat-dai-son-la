// Nạp mô hình dữ liệu và bộ tìm kiếm trong Node (không cần trình duyệt) — dùng cho kiểm thử dòng lệnh
const fs = require("fs"), path = require("path"), vm = require("vm");
module.exports = function nap() {
  const app = path.join(__dirname, "..", "app");
  const ctx = { console, URLSearchParams, TextEncoder, TextDecoder, Intl, Date, Blob, AbortSignal, fetch: (...a) => ctx.__fetch(...a) };
  ctx.window = ctx; vm.createContext(ctx);
  for (const f of ["du-lieu/nguon.js", "du-lieu/bo-sung.js", "du-lieu/phi-le-phi.js", "js/tien-ich.js", "js/mo-hinh.js", "js/tim-kiem.js", "js/thoi-han.js", "js/xuat-word.js", "js/xuat-excel.js", "js/nghia-vu.js", "js/tro-ly.js"])
    if (fs.existsSync(path.join(app, f))) vm.runInContext(fs.readFileSync(path.join(app, f), "utf8"), ctx, { filename: f });
  const mh = ctx.TT.taoMoHinh(ctx.QD75_NGUON, ctx.QD75_BO_SUNG, ctx.QD75_PHI);
  return { TT: ctx.TT, mh, tk: ctx.TT.taoTimKiem(mh), ctx };
};
