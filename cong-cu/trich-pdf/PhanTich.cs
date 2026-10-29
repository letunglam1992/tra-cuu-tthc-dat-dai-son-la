// Phân tích dữ liệu dòng (cau-truc.json) thành dữ liệu nghiệp vụ nguyên văn:
//   - Điều 1–24 của Quy định (văn bản chính), Điều 1–3 của Quyết định
//   - Danh mục thủ tục (mục A) và nội dung thủ tục (mục B) của Phụ lục I, II, III
//   - Các mục trình tự của Phụ lục IV
//   - Danh mục và nội dung mẫu biểu của Phụ lục V
// Không suy diễn nội dung: mọi trường văn bản là nguyên văn trích từ PDF, kèm số trang.
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

public static class PhanTich
{
    public record Dong(int tr, int h, int c, double x, double y, double r, string t);

    static readonly Regex reDauDoan = new(@"^(-|\+|•|[a-zđ]\d?\)|\([ivx]+\)|\(\d+\)|Bước\s*\d|[IVX]+\.|\d+\.\s|[A-Z]\.\s)", RegexOptions.Compiled);

    // Ghép các dòng thành đoạn: xuống đoạn khi gặp ký hiệu đầu mục, hoặc khi dòng sau viết hoa mà dòng trước
    // kết thúc câu (. : ;) hoặc là dòng ngắn (kết thúc sớm trước lề phải của khối — dấu hiệu hết đoạn/tiêu đề).
    public static string GhepDoan(IEnumerable<string> dong) => GhepDoanCore(dong.Select(t => (t, (double?)null)), null);
    public static string GhepDoan(IEnumerable<Dong> dong)
    {
        var ds = dong.ToList();
        // lề phải theo từng trang (khối có thể trải nhiều trang có lề khác nhau)
        var le = ds.GroupBy(d => d.tr).ToDictionary(g => g.Key, g => g.Max(d => d.r));
        return GhepDoanCore(ds.Select(d => (d.t, (double?)(le[d.tr] - d.r))), null);
    }
    static string GhepDoanCore(IEnumerable<(string t, double? hutLe)> dong, object? _)
    {
        var sb = new StringBuilder(); string? truoc = null; double? hutTruoc = null;
        foreach (var (raw, hut) in dong)
        {
            var t = raw.Replace(" ¦ ", " ").Trim();
            if (t.Length == 0) continue;
            if (truoc == null) sb.Append(t);
            else
            {
                bool hoa = char.IsUpper(t[0]);
                bool moi = reDauDoan.IsMatch(t) || (hoa && Regex.IsMatch(truoc, @"[.:;]$")) || (hoa && hutTruoc is > 60);
                sb.Append(moi ? "\n" : " ").Append(t);
            }
            truoc = t; hutTruoc = hut;
        }
        return sb.ToString();
    }

    static bool LaSoTrang(Dong d) => d.h == -1 && Regex.IsMatch(d.t.Trim(), @"^\d{1,3}$");

    public static void Chay(string vao, string ra)
    {
        var tatCa = JsonSerializer.Deserialize<List<Dong>>(File.ReadAllText(vao))!.Where(d => !LaSoTrang(d)).ToList();
        int TrangCua(string mau, int tu = 1) => tatCa.First(d => d.tr >= tu && d.t.Trim().StartsWith(mau)).tr;

        int trPL1 = TrangCua("Phụ lục I"), trPL2 = TrangCua("Phụ lục II", trPL1 + 1), trPL3 = TrangCua("Phụ lục III", trPL2 + 1),
            trPL4 = TrangCua("Phụ lục IV", trPL3 + 1), trPL5 = TrangCua("Phụ lục V", trPL4 + 1);
        int trCuoi = tatCa.Max(d => d.tr);

        var kq = new Dictionary<string, object?>();
        kq["trangPhuLuc"] = new { I = trPL1, II = trPL2, III = trPL3, IV = trPL4, V = trPL5, cuoi = trCuoi };
        kq["quyetDinh"] = DieuQuyetDinh(tatCa.Where(d => d.tr <= 2).ToList());
        // Phần mở đầu Quyết định: tiêu đề, số/ngày (nguyên văn, kể cả phần để trống), các căn cứ ban hành
        var dau = tatCa.Where(d => d.tr <= 2).ToList();
        int iDieu1 = dau.FindIndex(d => d.t.Trim().StartsWith("Điều 1."));
        kq["moDau"] = new
        {
            dongSo = dau.First(d => d.t.Contains("/2026/QĐ-UBND")).t,
            canCu = GhepDoan(dau.Take(iDieu1).SkipWhile(d => !d.t.Trim().StartsWith("Căn cứ"))).Split('\n').ToList(),
            noiNhanKy = dau.Skip(iDieu1).SkipWhile(d => !d.t.StartsWith("Nơi nhận")).Select(d => d.t).ToList()
        };
        kq["quyDinh"] = DieuQuyDinh(tatCa.Where(d => d.tr >= 3 && d.tr < trPL1).ToList());
        var canhBao = new List<string>();
        kq["phuLucI"] = PhuLucThuTuc("I", tatCa.Where(d => d.tr >= trPL1 && d.tr < trPL2).ToList(), canhBao);
        kq["phuLucII"] = PhuLucThuTuc("II", tatCa.Where(d => d.tr >= trPL2 && d.tr < trPL3).ToList(), canhBao);
        kq["phuLucIII"] = PhuLucThuTuc("III", tatCa.Where(d => d.tr >= trPL3 && d.tr < trPL4).ToList(), canhBao);
        kq["phuLucIV"] = PhuLucIV(tatCa.Where(d => d.tr >= trPL4 && d.tr < trPL5).ToList());
        kq["phuLucV"] = PhuLucV(tatCa.Where(d => d.tr >= trPL5).ToList(), canhBao);
        kq["canhBaoTrichXuat"] = canhBao;
        var opt = new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping };
        File.WriteAllText(ra, JsonSerializer.Serialize(kq, opt), new UTF8Encoding(false));
        foreach (var c in canhBao) Console.WriteLine("CANH BAO: " + c);
    }

    // ---------- Văn bản chính ----------
    record Dieu(string so, string tieuDe, string chuong, string noiDung, int trangDau, int trangCuoi);

    static List<Dieu> TachDieu(List<Dong> ds, bool coChuong)
    {
        var kq = new List<Dieu>(); string chuong = "";
        string? so = null, tieuDe = null; var buf = new List<Dong>(); var tieuDeBuf = new StringBuilder();
        bool dangTieuDe = false; string? chuongCho = null; var chuongTen = new StringBuilder();
        void Dong_()
        {
            if (so != null) kq.Add(new Dieu(so, tieuDe!.Trim(), chuong, GhepDoan(buf), buf.Count > 0 ? buf.Min(b => b.tr) : 0, buf.Count > 0 ? buf.Max(b => b.tr) : 0));
            buf.Clear();
        }
        foreach (var d in ds)
        {
            var t = d.t.Trim();
            if (coChuong && Regex.IsMatch(t, @"^Chương [IVX]+$")) { Dong_(); so = null; chuongCho = t; chuongTen.Clear(); continue; }
            if (chuongCho != null && so == null && !t.StartsWith("Điều ")) { chuongTen.Append(chuongTen.Length > 0 ? " " : "").Append(t); chuong = chuongCho + ". " + chuongTen; continue; }
            var m = Regex.Match(t, @"^Điều (\d+)\.\s*(.*)$");
            if (m.Success)
            {
                Dong_(); chuongCho = null; so = m.Groups[1].Value;
                // Tiêu đề điều có thể kéo dài nhiều dòng (in đậm) — dùng nguyên dòng đầu, phần còn lại thuộc nội dung
                var rest = m.Groups[2].Value;
                tieuDe = rest;
                buf.Add(d with { t = "" });
                continue;
            }
            if (so != null) buf.Add(d);
        }
        Dong_();
        return kq;
    }

    static object DieuQuyetDinh(List<Dong> ds) => TachDieu(ds.TakeWhile(d => !d.t.StartsWith("Nơi nhận")).ToList(), false).Take(3).ToList();
    static object DieuQuyDinh(List<Dong> ds) => TachDieu(ds, true);

    // ---------- Phụ lục I, II, III ----------
    record DanhMuc(int stt, string ten, int trang);
    record Muc(int so, string nhan, string noiDung, int trangDau, int trangCuoi);
    record ThuTuc(string phuLuc, int stt, string ten, int trangDau, int trangCuoi, List<Muc> muc);

    static object PhuLucThuTuc(string pl, List<Dong> ds, List<string> canhBao)
    {
        int iA = ds.FindIndex(d => d.t.Trim().StartsWith("A. DANH MỤC"));
        int iB = ds.FindIndex(d => d.t.Trim().StartsWith("B. NỘI DUNG"));
        var tieuDePL = GhepDoan(ds.Take(iA).Where(d => !d.t.StartsWith("(Ban hành")).Select(d => d.t)).Replace("\n", " ");
        // Danh mục A: cột 0 = STT, cột 1 = tên, cột 2 = ghi chú; mỗi hàng bảng là một thủ tục
        var danhMuc = new List<DanhMuc>();
        foreach (var g in ds.Skip(iA + 1).Take(iB - iA - 1).Where(d => d.h > 0).GroupBy(d => (d.tr, d.h)))
        {
            var stt = string.Join(" ", g.Where(d => d.c == 0).Select(d => d.t)).Trim();
            if (!int.TryParse(stt, out var n)) continue;
            var ten = GhepDoan(g.Where(d => d.c == 1).Select(d => d.t)).Replace("\n", " ");
            var ghiChu = string.Join(" ", g.Where(d => d.c >= 2).Select(d => d.t)).Trim();
            danhMuc.Add(new DanhMuc(n, ten + (ghiChu.Length > 0 ? " [Ghi chú: " + ghiChu + "]" : ""), g.Key.tr));
        }
        // Nội dung B: chia thành khối theo thứ tự đọc — mỗi dòng ngoài bảng là một khối, mỗi (trang, hàng) bảng là một khối.
        // Tiêu đề thủ tục có thể nằm ngoài bảng hoặc trong một hàng gộp của bảng (cột 0 bắt đầu bằng "n. ").
        var phan = ds.Skip(iB + 1).ToList();
        var khoi = new List<List<Dong>>();
        foreach (var d in phan)
        {
            if (d.h != -1 && khoi.Count > 0 && khoi[^1][0].h == d.h && khoi[^1][0].tr == d.tr) khoi[^1].Add(d);
            else if (d.h != -1 && khoi.FindLastIndex(k => k[0].tr == d.tr && k[0].h == d.h) is var j && j >= 0) khoi[j].Add(d);
            else khoi.Add(new List<Dong> { d });
        }
        static string ChuCot0(List<Dong> k) => string.Join(" ", k.Where(d => d.c == 0).OrderByDescending(d => d.y).Select(d => d.t.Trim()));
        static IEnumerable<string> DongGop(List<Dong> k) => k.GroupBy(d => Math.Round(d.y / 2.5)).OrderByDescending(g => g.Key).Select(g => string.Join(" ", g.OrderBy(d => d.x).Select(d => d.t.Trim())));
        bool LaTieuDe(List<Dong> k) => k[0].h == -1 ? Regex.IsMatch(k[0].t.Trim(), @"^\d+\.\s+\S") : Regex.IsMatch(ChuCot0(k), @"^\d+\.\s+\S");
        var thuTuc = new List<ThuTuc>();
        int i = 0;
        while (i < khoi.Count)
        {
            if (!LaTieuDe(khoi[i])) { var t0 = string.Join(" ", DongGop(khoi[i])); if (t0.Trim().Length > 0) canhBao.Add($"PL {pl} tr.{khoi[i][0].tr}: khối chưa phân loại trước tiêu đề thủ tục: {t0[..Math.Min(80, t0.Length)]}"); i++; continue; }
            var tieu = new List<string>(); int trDau = khoi[i][0].tr;
            if (khoi[i][0].h == -1)
            {
                tieu.Add(khoi[i][0].t); i++;
                while (i < khoi.Count && khoi[i][0].h == -1 && !LaTieuDe(khoi[i])) { tieu.Add(khoi[i][0].t); i++; }
            }
            else { tieu.AddRange(DongGop(khoi[i])); i++; }
            var m = Regex.Match(GhepDoan(tieu).Replace("\n", " "), @"^(\d+)\.\s+(.*)$");
            int stt = int.Parse(m.Groups[1].Value);
            var bang = new List<Dong>();
            while (i < khoi.Count && !LaTieuDe(khoi[i]))
            {
                if (khoi[i][0].h == -1) canhBao.Add($"PL {pl} TT{stt} tr.{khoi[i][0].tr}: dòng ngoài bảng trong thân thủ tục: {khoi[i][0].t}");
                else bang.AddRange(khoi[i]);
                i++;
            }
            thuTuc.Add(new ThuTuc(pl, stt, m.Groups[2].Value.TrimEnd('.', ' '), trDau, bang.Count > 0 ? bang.Max(b => b.tr) : trDau, TachMuc(pl, stt, bang, canhBao)));
        }
        // Đối chiếu số lượng
        if (danhMuc.Count != thuTuc.Count) canhBao.Add($"PL {pl}: danh mục A có {danhMuc.Count} thủ tục, nội dung B có {thuTuc.Count} thủ tục");
        return new { tieuDe = tieuDePL, danhMuc, thuTuc };
    }

    // Gán nội dung theo hàng bảng: mỗi đoạn hàng (trang, hàng) có nhãn ở cột 0 và nội dung ở cột 1
    static List<Muc> TachMuc(string pl, int stt, List<Dong> bang, List<string> canhBao)
    {
        var doan = bang.GroupBy(d => (d.tr, d.h)).OrderBy(g => g.Key.tr).ThenBy(g => g.Key.h)
            .Select(g => new
            {
                g.Key.tr, g.Key.h,
                nhan = string.Join(" ", g.Where(d => d.c == 0).OrderByDescending(d => d.y).Select(d => d.t.Trim())),
                noiDung = g.Where(d => d.c != 0).OrderByDescending(d => d.y).ThenBy(d => d.x).ToList()
            }).ToList();
        int maxH(int tr) => doan.Where(x => x.tr == tr).Max(x => x.h);
        int minH(int tr) => doan.Where(x => x.tr == tr).Min(x => x.h);
        var so = new int?[doan.Count]; var nhanGoc = new string[doan.Count];
        for (int k = 0; k < doan.Count; k++)
        {
            var m = Regex.Match(doan[k].nhan, @"^\((\d)\)\s*(.*)$");
            if (m.Success) { so[k] = int.Parse(m.Groups[1].Value); nhanGoc[k] = doan[k].nhan; }
        }
        // Đoạn không có nhãn: nếu là hàng cuối trang và đoạn đầu trang sau có nhãn → nhãn của đoạn sau (hàng bị ngắt trang);
        // nếu là hàng đầu trang → thuộc mục trước đó.
        for (int k = 0; k < doan.Count; k++)
        {
            if (so[k] != null) continue;
            bool dauTrang = doan[k].h == minH(doan[k].tr) && k > 0 && doan[k - 1].tr < doan[k].tr;
            bool cuoiTrang = doan[k].h == maxH(doan[k].tr) && k + 1 < doan.Count && doan[k + 1].tr > doan[k].tr;
            if (dauTrang && k > 0 && so[k - 1] != null) so[k] = so[k - 1];
            else if (cuoiTrang && so[k + 1] != null && (k == 0 || so[k - 1] != so[k + 1])) so[k] = so[k + 1];
            // hàng không nhãn giữa trang: do đường gạch chân/khung phụ trong ô — thuộc cùng mục với hàng trước
            else if (k > 0 && so[k - 1] != null) so[k] = so[k - 1];
            else canhBao.Add($"PL {pl} TT{stt} tr.{doan[k].tr}: hàng không xác định được mục");
        }
        // Trường hợp nhãn nằm ở phần hàng trang sau nhưng phần đầu đã gán mục trước: sửa lại theo thứ tự tăng
        var kq = new List<Muc>();
        foreach (var nhom in doan.Select((x, k) => (x, k)).Where(p => so[p.k] != null).GroupBy(p => so[p.k]!.Value).OrderBy(g => g.Key))
        {
            var nhan = nhom.Select(p => nhanGoc[p.k]).FirstOrDefault(n => n != null) ?? "";
            var dong = nhom.SelectMany(p => p.x.noiDung).ToList();
            kq.Add(new Muc(nhom.Key, Regex.Replace(nhan, @"\s+", " "), GhepDoan(dong), nhom.Min(p => p.x.tr), nhom.Max(p => p.x.tr)));
        }
        var thieu = Enumerable.Range(1, 9).Except(kq.Select(m => m.so)).ToList();
        if (thieu.Count > 0) canhBao.Add($"PL {pl} TT{stt}: thiếu mục {string.Join(",", thieu)}");
        // Kiểm tra thứ tự nhãn tăng dần theo trình tự đọc
        var thuTu = doan.Select((x, k) => so[k] ?? 0).ToList();
        for (int k = 1; k < thuTu.Count; k++) if (thuTu[k] < thuTu[k - 1]) canhBao.Add($"PL {pl} TT{stt}: thứ tự mục không tăng tại tr.{doan[k].tr}");
        return kq;
    }

    // ---------- Phụ lục IV ----------
    record MucIV(string so, string tieuDe, List<KhoanIV> khoan, int trangDau, int trangCuoi);
    record KhoanIV(string so, string noiDung, int trangDau, int trangCuoi);

    static object PhuLucIV(List<Dong> ds)
    {
        var tieuDe = "";
        var muc = new List<MucIV>();
        string? soMuc = null; var tdMuc = new List<string>(); var khoan = new List<KhoanIV>();
        string? soKhoan = null; var buf = new List<Dong>(); bool dangTieuDeMuc = false; int trMuc = 0;
        void DongKhoan() { if (soKhoan != null) khoan.Add(new KhoanIV(soKhoan, GhepDoan(buf), buf.Min(b => b.tr), buf.Max(b => b.tr))); buf.Clear(); soKhoan = null; }
        void DongMuc() { DongKhoan(); if (soMuc != null) muc.Add(new MucIV(soMuc, GhepDoan(tdMuc).Replace("\n", " "), khoan.ToList(), trMuc, khoan.Count > 0 ? khoan.Max(k => k.trangCuoi) : trMuc)); khoan.Clear(); tdMuc.Clear(); }
        foreach (var d in ds.Skip(1))
        {
            var t = d.t.Trim();
            if (t.StartsWith("(Ban hành")) continue;
            var mm = Regex.Match(t, @"^(I|II|III|IV|V|VI|VII|VIII)\.\s+(.*)$");
            if (mm.Success) { DongMuc(); soMuc = mm.Groups[1].Value; tdMuc.Add(mm.Groups[2].Value); dangTieuDeMuc = true; trMuc = d.tr; continue; }
            if (soMuc == null) { tieuDe += (tieuDe.Length > 0 ? " " : "") + t; continue; }
            var mk = Regex.Match(t, @"^(\d+)\.\s+(.*)$");
            if (mk.Success && d.x > 100) { DongKhoan(); dangTieuDeMuc = false; soKhoan = mk.Groups[1].Value; buf.Add(d with { t = mk.Groups[2].Value }); continue; }
            if (dangTieuDeMuc) { tdMuc.Add(t); continue; }
            buf.Add(d);
        }
        DongMuc();
        return new { tieuDe, muc };
    }

    // ---------- Phụ lục V ----------
    record MauDM(int stt, string kyHieu, string ten, int trang);
    record MauND(string kyHieu, string tieuDe, string noiDung, int trangDau, int trangCuoi);

    static object PhuLucV(List<Dong> ds, List<string> canhBao)
    {
        var danhMuc = new List<MauDM>();
        int iMau1 = ds.FindIndex(d => Regex.IsMatch(d.t.Trim(), @"^Mẫu số \S+\.\s"));
        foreach (var g in ds.Take(iMau1).Where(d => d.h > 0).GroupBy(d => (d.tr, d.h)))
        {
            var stt = string.Join(" ", g.Where(d => d.c == 0).Select(d => d.t)).Trim();
            if (!int.TryParse(stt, out var n)) continue;
            var c1 = string.Join(" ", g.Where(d => d.c == 1).OrderByDescending(d => d.y).Select(d => d.t)).Trim();
            var c2 = GhepDoan(g.Where(d => d.c == 2).OrderByDescending(d => d.y).Select(d => d.t)).Replace("\n", " ");
            // Một số dòng bị dồn chữ sang cột ký hiệu (vd "Mẫu số 18a Đơn đăng ký ...")
            var mk = Regex.Match(c1, @"^Mẫu số\s+(\S+)\s*(.*)$");
            var kh = mk.Success ? mk.Groups[1].Value : c1;
            var ten = (mk.Success && mk.Groups[2].Value.Length > 0 ? mk.Groups[2].Value + " " : "") + c2;
            danhMuc.Add(new MauDM(n, kh, ten.Trim(), g.Key.tr));
        }
        var mau = new List<MauND>();
        string? kh2 = null; var tdBuf = new StringBuilder(); var buf = new List<Dong>(); int trDau = 0;
        void Dong_() { if (kh2 != null) mau.Add(new MauND(kh2, tdBuf.ToString().Trim(), string.Join("\n", buf.Select(b => b.t.Replace(" ¦ ", "    ").Trim()).Where(s => s.Length > 0)), trDau, buf.Count > 0 ? buf.Max(b => b.tr) : trDau)); buf.Clear(); tdBuf.Clear(); }
        bool dangTd = false;
        foreach (var d in ds.Skip(iMau1))
        {
            var t = d.t.Trim();
            var m = Regex.Match(t, @"^Mẫu số (\S+?)\.\s*(.*)$");
            if (m.Success && d.h == -1) { Dong_(); kh2 = m.Groups[1].Value; tdBuf.Append(m.Groups[2].Value); trDau = d.tr; dangTd = true; continue; }
            if (dangTd && d.h == -1 && d.x < 200 && !t.StartsWith("CỘNG HÒA") && !Regex.IsMatch(t, @"^[A-ZĐ\s]{6,}")) { tdBuf.Append(' ').Append(t); continue; }
            dangTd = false;
            buf.Add(d);
        }
        Dong_();
        foreach (var dm in danhMuc)
            if (!mau.Any(x => ChuanKy(x.kyHieu) == ChuanKy(dm.kyHieu))) canhBao.Add($"PL V: danh mục có Mẫu số {dm.kyHieu} (STT {dm.stt}) nhưng không tìm thấy nội dung mẫu");
        foreach (var x in mau)
            if (!danhMuc.Any(dm => ChuanKy(dm.kyHieu) == ChuanKy(x.kyHieu))) canhBao.Add($"PL V: có nội dung Mẫu số {x.kyHieu} (tr.{x.trangDau}) nhưng danh mục mẫu không liệt kê");
        return new { danhMuc, mau };
    }

    public static string ChuanKy(string k) { k = k.Trim().TrimEnd('.').ToLowerInvariant(); var m = Regex.Match(k, @"^0*(\d+)(.*)$"); return m.Success ? m.Groups[1].Value + m.Groups[2].Value : k; }
}
