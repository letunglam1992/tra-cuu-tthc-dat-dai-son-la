# Chụp ảnh các màn hình chính bằng trình duyệt Edge/Chrome chế độ không giao diện (phục vụ kiểm thử giao diện).
# Yêu cầu: máy chủ đang chạy (cong-cu\chay-may-chu.ps1). Ảnh lưu tại cong-cu\tam\anh\.
param([string]$Goc = "http://localhost:8686/", [string[]]$Chi = @())
$trinhDuyet = @("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $trinhDuyet) { throw "Không tìm thấy Edge hoặc Chrome." }
$thuMuc = Join-Path $PSScriptRoot "tam"
$ra = (New-Item -ItemType Directory -Force (Join-Path $thuMuc "anh")).FullName
$hoSo = (New-Item -ItemType Directory -Force (Join-Path $thuMuc "edge-prof")).FullName
$ds = @(
  @("01-tong-quan", "#/tong-quan", 1440, 900), @("02-thu-tuc", "#/thu-tuc", 1440, 900), @("03-thu-tuc-loc", "#/thu-tuc?pl=III&han=le5", 1440, 900),
  @("04-chi-tiet", "#/thu-tuc/I.1", 1440, 1400), @("05-trinh-tu", "#/thu-tuc/II.1/trinh-tu", 1440, 1200), @("06-ho-so", "#/thu-tuc/III.2/ho-so", 1440, 1200),
  @("07-quy-trinh", "#/quy-trinh/QT15/b3", 1440, 1100), @("08-quy-trinh-18", "#/quy-trinh/QT18", 1440, 1100), @("09-thu-hoi", "#/thu-hoi/IV", 1440, 1100),
  @("10-mau", "#/mau-bieu/19", 1440, 1000), @("11-co-quan", "#/co-quan/co-quan-thue", 1440, 1100), @("12-can-cu", "#/can-cu", 1440, 1100),
  @("13-tra-cuu", "#/tra-cuu?q=phieu%20chuyen%20thong%20tin", 1440, 1000), @("14-tra-cuu-rong", "#/tra-cuu?q=xyzkhongco", 1440, 700),
  @("15-doi-soat", "#/doi-soat?tab=bang", 1440, 1000), @("16-thu-tuc-trong", "#/thu-tuc/III.13/9", 1440, 900),
  @("20-dt-tong-quan", "#/tong-quan", 390, 1500), @("21-dt-thu-tuc", "#/thu-tuc", 390, 1500), @("22-dt-chi-tiet", "#/thu-tuc/II.6", 390, 1600), @("23-dt-quy-trinh", "#/quy-trinh/QT17", 390, 1500),
  @("30-toi-quy-trinh", "#/quy-trinh/QT16", 1440, 1000)
)
foreach ($m in $ds) {
  if ($Chi.Count -and -not ($Chi -contains $m[0])) { continue }
  $url = $Goc + $m[1]
  # Trình duyệt máy tính có bề rộng cửa sổ tối thiểu (~500px): ảnh điện thoại chụp qua khung iframe đúng bề rộng
  if ($m[2] -lt 500) {
    $khung = Join-Path $thuMuc "khung-$($m[0]).html"
    Set-Content -Path $khung -Encoding UTF8 -Value "<!doctype html><html><body style='margin:0;background:#888'><iframe src='$url' style='width:$($m[2])px;height:$($m[3])px;border:0;display:block;background:#fff'></iframe></body></html>"
    $url = "file:///" + ($khung -replace '\\', '/')
  }
  $them = @()
  if ($m[0] -like "30-*") { $them = @("--force-dark-mode", "--blink-settings=preferredColorScheme=0") }
  $rong = [Math]::Max($m[2], 520)
  $tham = @("--headless=new", "--disable-gpu", "--hide-scrollbars", "--user-data-dir=$hoSo", "--window-size=$rong,$($m[3])", "--virtual-time-budget=6000", "--screenshot=$ra\$($m[0]).png") + $them + @($url)
  $p = Start-Process -FilePath $trinhDuyet -ArgumentList $tham -PassThru -WindowStyle Hidden
  $p.WaitForExit(60000) | Out-Null
  Write-Host "Đã chụp $($m[0])"
}
