# Máy chủ tĩnh cục bộ để chạy thử phần mềm (không cần cài đặt thêm).
# Dùng:  powershell -ExecutionPolicy Bypass -File cong-cu\chay-may-chu.ps1 [-Cong 8686]
# Sau đó mở http://localhost:8686/ trên trình duyệt. Nhấn Ctrl+C để dừng.
# Lưu ý: phần mềm cũng chạy được bằng cách mở trực tiếp app\index.html; máy chủ chỉ cần khi kiểm thử tự động
# hoặc khi trình duyệt chặn mở tệp PDF cục bộ.
param([int]$Cong = 8686)
$goc = (Resolve-Path (Join-Path (Split-Path -Parent $PSScriptRoot) "app")).Path
$loai = @{ ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".json" = "application/json; charset=utf-8";
  ".svg" = "image/svg+xml"; ".woff2" = "font/woff2"; ".pdf" = "application/pdf"; ".png" = "image/png"; ".txt" = "text/plain; charset=utf-8"; ".ico" = "image/x-icon" }
$nghe = New-Object System.Net.HttpListener
$nghe.Prefixes.Add("http://localhost:$Cong/")
$nghe.Start()
Write-Host "Đang phục vụ $goc tại http://localhost:$Cong/  (Ctrl+C để dừng)"
try {
  while ($nghe.IsListening) {
    $ctx = $nghe.GetContext()
    $res = $ctx.Response
    try {
      $duong = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
      if ($duong -eq "") { $duong = "index.html" }
      $tep = [IO.Path]::GetFullPath((Join-Path $goc $duong))
      $coThan = $ctx.Request.HttpMethod -ne "HEAD"
      # Chặn truy cập ra ngoài thư mục app
      if (-not $tep.StartsWith($goc, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $tep -PathType Leaf)) {
        $res.StatusCode = 404; [byte[]]$b = [Text.Encoding]::UTF8.GetBytes("Khong tim thay")
      } else {
        $ext = [IO.Path]::GetExtension($tep).ToLower()
        $res.ContentType = if ($loai.ContainsKey($ext)) { $loai[$ext] } else { "application/octet-stream" }
        $res.Headers.Add("X-Content-Type-Options", "nosniff")
        $res.Headers.Add("Cache-Control", "no-cache")
        [byte[]]$b = [IO.File]::ReadAllBytes($tep)
      }
      $res.ContentLength64 = $b.Length
      if ($coThan) { $res.OutputStream.Write($b, 0, $b.Length) }
    } catch {
      Write-Host "Loi phuc vu $($ctx.Request.Url): $($_.Exception.Message)"
    } finally {
      try { $res.OutputStream.Close() } catch { }
    }
  }
} finally { $nghe.Stop() }
