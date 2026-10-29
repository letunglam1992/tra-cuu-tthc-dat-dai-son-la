// Xuất dòng văn bản kèm vị trí ô bảng (hàng/cột) dựa trên đường kẻ bảng thực trong PDF.
// Kết quả: JSON mảng { tr, h (chỉ số hàng, -1 = ngoài bảng), c (chỉ số cột, -1 = ngoài bảng), x, t }.
using System.Text;
using System.Text.Json;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.Core;

public static class CauTruc
{
    record Dong(int tr, int h, int c, double x, double y, double r, string t);

    public static void Xuat(PdfDocument doc, string ra)
    {
        var kq = new List<Dong>();
        foreach (var trang in doc.GetPages()) kq.AddRange(XuLyTrang(trang));
        var opt = new JsonSerializerOptions { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping };
        File.WriteAllText(ra, JsonSerializer.Serialize(kq, opt), new UTF8Encoding(false));
        Console.WriteLine($"Dong: {kq.Count}");
    }

    static List<double> Cum(IEnumerable<double> v, double tol)
    {
        var ds = v.OrderBy(a => a).ToList(); var kq = new List<double>();
        foreach (var a in ds) if (kq.Count == 0 || a - kq[^1] > tol) kq.Add(a);
        return kq;
    }

    static IEnumerable<Dong> XuLyTrang(Page trang)
    {
        var ngang = new List<(double y, double x1, double x2)>();
        var docL = new List<(double x, double y1, double y2)>();
        foreach (var p in trang.ExperimentalAccess.Paths)
            foreach (var sp in p)
            {
                foreach (var c in sp.Commands)
                    if (c is PdfSubpath.Line l)
                    {
                        var a = l.From; var b = l.To;
                        if (Math.Abs(a.Y - b.Y) < 0.8) ngang.Add((a.Y, Math.Min(a.X, b.X), Math.Max(a.X, b.X)));
                        else if (Math.Abs(a.X - b.X) < 0.8) docL.Add((a.X, Math.Min(a.Y, b.Y), Math.Max(a.Y, b.Y)));
                    }
                var bb = sp.GetBoundingRectangle();
                if (bb.HasValue)
                {
                    var r = bb.Value;
                    if (r.Height < 2.5) ngang.Add(((r.Top + r.Bottom) / 2, r.Left, r.Right));
                    else if (r.Width < 2.5) docL.Add(((r.Left + r.Right) / 2, r.Bottom, r.Top));
                }
            }
        // Đường kẻ bảng: dài, không phải viền trang (0..595)
        var vien = ngang.Where(n => n.x2 - n.x1 > 120 && n.x1 > 20 && n.x2 < 590).ToList();
        var yHang = Cum(vien.Select(n => n.y), 2.5).OrderByDescending(y => y).ToList();
        var xCot = Cum(docL.Where(d => d.y2 - d.y1 > 20 && d.x > 20 && d.x < 590).Select(d => d.x), 3);

        var tu = trang.GetWords().Where(w => !string.IsNullOrWhiteSpace(w.Text)).ToList();
        // Gom theo (hàng, cột) trước rồi theo dòng
        var nhom = new Dictionary<(int h, int c), List<Word>>();
        foreach (var w in tu)
        {
            double yGiua = (w.BoundingBox.Bottom + w.BoundingBox.Top) / 2;
            int h = yHang.Count(yy => yy > yGiua);
            bool trongBang = yHang.Count >= 2 && h > 0 && h < yHang.Count;
            int c = -1;
            if (trongBang && xCot.Count >= 2)
            {
                c = xCot.Count(xx => xx < w.BoundingBox.Left + 1) - 1;
                if (c < 0 || c >= xCot.Count - 1) c = -1;
            }
            if (!trongBang) h = -1;
            var k = (h, c);
            if (!nhom.TryGetValue(k, out var ds)) nhom[k] = ds = new List<Word>();
            ds.Add(w);
        }
        var kq = new List<Dong>();
        foreach (var (k, ds) in nhom)
        {
            var dong = new List<List<Word>>();
            foreach (var w in ds.OrderByDescending(w => w.BoundingBox.Bottom).ThenBy(w => w.BoundingBox.Left))
            {
                var d = dong.FirstOrDefault(l => Math.Abs(l[0].BoundingBox.Bottom - w.BoundingBox.Bottom) < 2.5);
                if (d == null) { d = new List<Word>(); dong.Add(d); }
                d.Add(w);
            }
            foreach (var d in dong)
            {
                d.Sort((a, b) => a.BoundingBox.Left.CompareTo(b.BoundingBox.Left));
                var sb = new StringBuilder();
                for (int i = 0; i < d.Count; i++)
                {
                    if (i > 0) sb.Append(d[i].BoundingBox.Left - d[i - 1].BoundingBox.Right > 14 && k.c == -1 ? " ¦ " : " ");
                    sb.Append(d[i].Text);
                }
                kq.Add(new Dong(trang.Number, k.h, k.c, Math.Round(d[0].BoundingBox.Left, 1), Math.Round(d[0].BoundingBox.Bottom, 1), Math.Round(d[^1].BoundingBox.Right, 1), sb.ToString()));
            }
        }
        // thứ tự đọc: theo y giảm dần; cùng y thì theo cột
        return kq.OrderByDescending(d => d.y).ThenBy(d => d.x);
    }
}
