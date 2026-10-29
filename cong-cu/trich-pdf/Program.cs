// Công cụ trích xuất QĐ 75/2026 (PDF văn bản) phục vụ chuẩn hóa dữ liệu.
//   dotnet run -- text  <pdf> <out.txt>      : văn bản theo trang, đánh dấu khoảng cách cột bằng " ¦ "
//   dotnet run -- probe <pdf> <trang>        : in đường kẻ ngang/dọc của một trang (kiểm tra cấu trúc bảng)
//   dotnet run -- lines <pdf> <out.json>     : xuất từng dòng kèm trang, tọa độ, ô bảng (dùng cho bước phân tích)
using System.Text;
using System.Text.Json;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.Core;

var che = args[0];
using var doc = PdfDocument.Open(args[1]);

if (che == "text") { XuatText(doc, args[2]); return; }
if (che == "probe") { Probe(doc.GetPage(int.Parse(args[2]))); return; }
if (che == "lines") { XuatDong(doc, args[2]); return; }
if (che == "cau-truc") { CauTruc.Xuat(doc, args[2]); return; }
if (che == "phan-tich") { PhanTich.Chay(args[2], args[3]); return; }

static List<List<Word>> GomDong(Page trang)
{
    var tu = trang.GetWords().Where(w => !string.IsNullOrWhiteSpace(w.Text)).ToList();
    var dong = new List<List<Word>>();
    foreach (var w in tu.OrderByDescending(w => w.BoundingBox.Bottom).ThenBy(w => w.BoundingBox.Left))
    {
        var d = dong.FirstOrDefault(l => Math.Abs(l[0].BoundingBox.Bottom - w.BoundingBox.Bottom) < 2.5);
        if (d == null) { d = new List<Word>(); dong.Add(d); }
        d.Add(w);
    }
    foreach (var d in dong) d.Sort((a, b) => a.BoundingBox.Left.CompareTo(b.BoundingBox.Left));
    return dong.OrderByDescending(l => l[0].BoundingBox.Bottom).ToList();
}

static void XuatText(PdfDocument doc, string ra)
{
    var sb = new StringBuilder();
    foreach (var trang in doc.GetPages())
    {
        sb.AppendLine($"=== TRANG {trang.Number} ===");
        foreach (var ds in GomDong(trang))
        {
            var line = new StringBuilder($"[{ds[0].BoundingBox.Left,4:0}] ");
            for (int i = 0; i < ds.Count; i++)
            {
                if (i > 0) line.Append(ds[i].BoundingBox.Left - ds[i - 1].BoundingBox.Right > 14 ? " ¦ " : " ");
                line.Append(ds[i].Text);
            }
            sb.AppendLine(line.ToString());
        }
    }
    File.WriteAllText(ra, sb.ToString(), new UTF8Encoding(false));
}

// Đoạn thẳng ngang/dọc lấy từ đường vẽ (đường kẻ hoặc hình chữ nhật mảnh)
static (List<(double y, double x1, double x2)> ngang, List<(double x, double y1, double y2)> doc) DuongKe(Page trang)
{
    var ngang = new List<(double, double, double)>();
    var docL = new List<(double, double, double)>();
    foreach (var p in trang.ExperimentalAccess.Paths)
    {
        foreach (var sp in p)
        {
            PdfPoint? truoc = null;
            foreach (var c in sp.Commands)
            {
                if (c is PdfSubpath.Move m) { truoc = m.Location; continue; }
                if (c is PdfSubpath.Line l)
                {
                    var a = l.From; var b = l.To;
                    if (Math.Abs(a.Y - b.Y) < 0.8 && Math.Abs(a.X - b.X) > 5) ngang.Add((a.Y, Math.Min(a.X, b.X), Math.Max(a.X, b.X)));
                    else if (Math.Abs(a.X - b.X) < 0.8 && Math.Abs(a.Y - b.Y) > 5) docL.Add((a.X, Math.Min(a.Y, b.Y), Math.Max(a.Y, b.Y)));
                    truoc = b;
                }
            }
            var bb = sp.GetBoundingRectangle();
            if (bb.HasValue)
            {
                var r = bb.Value;
                if (r.Height < 2.5 && r.Width > 5) ngang.Add(((r.Top + r.Bottom) / 2, r.Left, r.Right));
                else if (r.Width < 2.5 && r.Height > 5) docL.Add(((r.Left + r.Right) / 2, r.Bottom, r.Top));
            }
        }
    }
    return (ngang, docL);
}

static void Probe(Page trang)
{
    var (ngang, docL) = DuongKe(trang);
    Console.WriteLine($"Trang {trang.Number}: {ngang.Count} ngang, {docL.Count} doc");
    foreach (var n in ngang.OrderByDescending(n => n.y)) Console.WriteLine($"  NGANG y={n.y:0.0} x={n.x1:0.0}-{n.x2:0.0}");
    foreach (var d in docL.GroupBy(d => Math.Round(d.x)).OrderBy(g => g.Key)) Console.WriteLine($"  DOC x={d.Key} ({d.Count()} doan)");
}

static void XuatDong(PdfDocument doc, string ra)
{
    var kq = new List<object>();
    foreach (var trang in doc.GetPages())
    {
        var (ngang, docL) = DuongKe(trang);
        // Ranh giới cột: các đường dọc xuất hiện; ranh giới hàng: các đường ngang dài
        var yHang = ngang.Where(n => n.x2 - n.x1 > 60).Select(n => Math.Round(n.y, 1)).Distinct().OrderByDescending(y => y).ToList();
        var xCot = docL.Select(d => Math.Round(d.x)).Distinct().OrderBy(x => x).ToList();
        foreach (var ds in GomDong(trang))
        {
            double y = ds[0].BoundingBox.Bottom;
            // tách dòng theo cột (nếu có đường dọc nằm giữa các từ)
            var phan = new List<(double x, string t)>();
            var cur = new StringBuilder(); double x0 = ds[0].BoundingBox.Left;
            for (int i = 0; i < ds.Count; i++)
            {
                if (i > 0)
                {
                    var trai = ds[i - 1].BoundingBox.Right; var phai = ds[i].BoundingBox.Left;
                    bool catCot = xCot.Any(x => x > trai - 1 && x < phai + 1) && phai - trai > 3;
                    if (catCot) { phan.Add((x0, cur.ToString())); cur.Clear(); x0 = phai; }
                    else cur.Append(' ');
                }
                cur.Append(ds[i].Text);
            }
            phan.Add((x0, cur.ToString()));
            // chỉ số hàng: số đường ngang nằm phía trên dòng
            int hang = yHang.Count(yy => yy > y + ds.Max(w => w.BoundingBox.Height) * 0.3);
            foreach (var p in phan)
                kq.Add(new { tr = trang.Number, y = Math.Round(y, 1), x = Math.Round(p.x, 1), h = hang, t = p.t });
        }
        kq.Add(new { tr = trang.Number, y = -1.0, x = -1.0, h = -1, t = "##COT:" + string.Join(",", xCot) + "|HANG:" + string.Join(",", yHang) });
    }
    File.WriteAllText(ra, JsonSerializer.Serialize(kq, new JsonSerializerOptions { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping }), new UTF8Encoding(false));
}
