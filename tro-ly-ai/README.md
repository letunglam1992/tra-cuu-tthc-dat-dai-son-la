# Trợ lý hỏi đáp — Cloudflare Worker trung gian

Worker nhận câu hỏi và các đoạn nguyên văn (do phần mềm tự tìm trên máy người dùng), gọi mô hình ngôn ngữ và trả lời **chỉ dựa trên các đoạn đó, có dẫn nguồn [n]**. Khóa API nằm trong biến bí mật của Worker, không đưa xuống trình duyệt.

- Nhà cung cấp chính: **Google Gemini** (mô hình đặt tại `GEMINI_MODEL` trong `wrangler.toml`, mặc định `gemini-3.5-flash`).
- Dự phòng khi Gemini lỗi hoặc hết hạn mức: **Cloudflare Workers AI** (binding `AI`, mô hình `CF_MODEL`).

## Triển khai (một lần, khoảng 5 phút)

Cần Node.js ≥ 18 và tài khoản Cloudflare (gói miễn phí dùng được).

```bash
cd tro-ly-ai
```

```bash
npx wrangler login
```

```bash
npx wrangler secret put GEMINI_API_KEY
```

(dán khóa API Gemini lấy tại Google AI Studio → API keys)

```bash
npx wrangler deploy
```

Lệnh cuối in địa chỉ dạng `https://tro-ly-tthc-dat-dai-son-la.<tài-khoản>.workers.dev`. Kiểm tra:

```bash
curl https://tro-ly-tthc-dat-dai-son-la.<tài-khoản>.workers.dev/suc-khoe
```

Sau đó đặt địa chỉ này vào `app/du-lieu/bo-sung.js` → `troLyAI.diaChi`, tăng phiên bản dữ liệu và `PHIEN_BAN` trong `app/sw.js`, đẩy mã lên `main`.

Workers AI dùng chính tài khoản Cloudflare đang triển khai (binding `AI` trong `wrangler.toml`), không cần khóa riêng. Nếu muốn gọi Workers AI bằng khóa thay cho binding: `npx wrangler secret put CF_ACCOUNT_ID` và `npx wrangler secret put CF_API_TOKEN` (token có quyền *Workers AI: Read*).

## Cấu hình (`wrangler.toml`)

| Biến | Ý nghĩa |
|---|---|
| `GEMINI_MODEL` | Tên mô hình Gemini (đổi khi Google phát hành mô hình mới) |
| `CF_MODEL` | Mô hình Workers AI dự phòng |
| `ALLOWED_ORIGINS` | Các địa chỉ trang được phép gọi (phân cách dấu phẩy) — thêm tên miền riêng nếu có |
| `GIOI_HAN_PHUT` | Số câu hỏi tối đa mỗi IP trong 1 phút (giới hạn mềm) |

## Bảo mật, quyền riêng tư

- Trình duyệt chỉ gửi câu hỏi và tối đa 10 đoạn nguyên văn (mỗi đoạn ≤ 2.500 ký tự); Worker từ chối yêu cầu lớn hơn hoặc từ nguồn không được phép.
- Câu hỏi được chuyển tới nhà cung cấp mô hình (Google hoặc Cloudflare); giao diện nhắc người dùng không nhập thông tin cá nhân.
- Có thể đặt thêm Cloudflare Rate Limiting hoặc Turnstile nếu mở công khai rộng.

## Kiểm thử

`npm test` (thư mục gốc) chạy kiểm thử Worker với Gemini/Workers AI giả lập (`kiem-thu/tro-ly.test.mjs`).

## Đang dùng: Worker Workers AI dùng chung `rasoatvanban`

Phần mềm hiện gọi Worker `rasoatvanban.letunglam1992.workers.dev` (của app Rà soát văn bản) theo giao thức `messages` — xem `troLyAI` trong `app/du-lieu/bo-sung.js`.

### Giới hạn trang web được gọi Worker (khuyến nghị)
Worker đang để trống `ALLOWED_ORIGIN` nên **mọi trang web** gọi được và dùng chung hạn mức Workers AI miễn phí của tài khoản. Đặt biến này để chỉ hai phần mềm của mình gọi được:

1. Cloudflare Dashboard → Workers & Pages → `rasoatvanban` → Settings → Variables and Secrets → Add.
2. Type: **Text**; Variable name: `ALLOWED_ORIGIN`; Value (cách nhau bằng dấu phẩy, không có dấu `/` cuối):
   ```
   https://tra-cuu-tthc-dat-dai-son-la.vercel.app,https://<địa chỉ app Rà soát văn bản>
   ```
   Nếu app Rà soát văn bản còn được mở trực tiếp từ tệp trên máy (`file://`), thêm `null` vào danh sách.
3. Deploy. Kiểm tra: mở trang Hỏi đáp của phần mềm, hỏi thử một câu; gọi từ trang khác sẽ bị trình duyệt chặn (thiếu `Access-Control-Allow-Origin`).

Không dùng `APP_TOKEN` cho phần mềm này: mã sẽ nằm trong mã nguồn công khai của trang nên không còn bí mật.

### Hạn mức phía phần mềm
- Mỗi trình duyệt được hỏi tối đa `troLyAI.gioiHanNgay` lượt/ngày (mặc định 30); khung chat hiện số lượt còn lại.
- Khi Worker trả 429 (hết hạn mức Workers AI trong ngày), phần mềm ngừng gọi đến hết ngày, chỉ hiện các đoạn nguyên văn liên quan.
