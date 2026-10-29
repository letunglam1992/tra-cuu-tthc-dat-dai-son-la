# Tái tạo dữ liệu nghiệp vụ từ tệp PDF nguồn.
# Dùng:  powershell -ExecutionPolicy Bypass -File cong-cu\cap-nhat-du-lieu.ps1 [-Pdf duong\dan\tep.pdf]
# Yêu cầu: .NET SDK 8 (lần đầu cần Internet để tải gói PdfPig từ nuget.org).
param([string]$Pdf = "")
$ErrorActionPreference = "Stop"
$goc = Split-Path -Parent $PSScriptRoot
if ($Pdf -eq "") { $Pdf = Join-Path $goc "app\tai-nguyen\qd75.pdf" }
$Pdf = (Resolve-Path $Pdf).Path
$tam = Join-Path $goc "cong-cu\tam"
New-Item -ItemType Directory -Force $tam | Out-Null

Write-Host "1/4 Biên dịch công cụ trích xuất..."
dotnet build (Join-Path $goc "cong-cu\trich-pdf") -v q -nologo | Out-Null
$exe = Join-Path $goc "cong-cu\trich-pdf\bin\Debug\net8.0\trich-pdf.exe"

Write-Host "2/4 Trích văn bản và cấu trúc bảng..."
& $exe text $Pdf (Join-Path $tam "qd75.txt")
& $exe cau-truc $Pdf (Join-Path $tam "cau-truc.json")

Write-Host "3/4 Phân tích nghiệp vụ..."
& $exe phan-tich $Pdf (Join-Path $tam "cau-truc.json") (Join-Path $tam "trich-xuat.json")

Write-Host "4/4 Ghi app\du-lieu\nguon.js ..."
$json = Get-Content (Join-Path $tam "trich-xuat.json") -Raw -Encoding UTF8
$bam = (Get-FileHash $Pdf -Algorithm SHA256).Hash.ToLower()
$soTrang = ([regex]::Matches((Get-Content (Join-Path $tam "qd75.txt") -Raw -Encoding UTF8), '=== TRANG \d+ ===')).Count
$meta = @{ tepNguon = (Split-Path $Pdf -Leaf); sha256 = $bam; soTrang = $soTrang; ngayTrichXuat = (Get-Date -Format "yyyy-MM-dd"); congCu = "cong-cu/trich-pdf (PdfPig)" } | ConvertTo-Json -Compress
$js = "/* TỆP SINH TỰ ĐỘNG bởi cong-cu/cap-nhat-du-lieu.ps1 — KHÔNG SỬA TAY. Nội dung là nguyên văn trích từ PDF nguồn. */`n" +
      "window.QD75_NGUON = $json;`nwindow.QD75_NGUON.thongTinTrichXuat = $meta;`n"
$ra = Join-Path $goc "app\du-lieu\nguon.js"
New-Item -ItemType Directory -Force (Split-Path $ra) | Out-Null
[IO.File]::WriteAllText($ra, $js, (New-Object Text.UTF8Encoding $false))
Write-Host "Xong. SHA-256 nguồn: $bam ; số trang: $soTrang"
