# Chạy bộ kiểm thử tự động (app/kiem-thu.html) bằng Edge/Chrome không giao diện, in kết quả và ghi tệp bàn giao:
#   tai-lieu/ket-qua-kiem-thu.csv, tai-lieu/bang-doi-soat.csv, tai-lieu/danh-muc-thu-tuc.csv, tai-lieu/van-de-van-ban-nguon.csv
# Yêu cầu: máy chủ đang chạy (cong-cu\chay-may-chu.ps1).
param([string]$Goc = "http://localhost:8686/")
$trinhDuyet = @("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $trinhDuyet) { throw "Không tìm thấy Edge hoặc Chrome." }
$duAn = Split-Path -Parent $PSScriptRoot
$tam = (New-Item -ItemType Directory -Force (Join-Path $PSScriptRoot "tam")).FullName
$hoSo = (New-Item -ItemType Directory -Force (Join-Path $env:TEMP "tthc-kiem-thu-edge")).FullName
$dom = Join-Path $tam "kiem-thu-dom.html"
$p = Start-Process -FilePath $trinhDuyet -ArgumentList @("--headless=new", "--disable-gpu", "--user-data-dir=$hoSo", "--window-size=1280,900", "--virtual-time-budget=20000000", "--dump-dom", ($Goc + "kiem-thu.html")) `
  -RedirectStandardOutput $dom -RedirectStandardError (Join-Path $tam "kiem-thu-stderr.txt") -PassThru -WindowStyle Hidden
$p.WaitForExit(900000) | Out-Null
$html = Get-Content $dom -Raw -Encoding UTF8
$tieuDe = ([regex]::Match($html, '<title>(.*?)</title>')).Groups[1].Value
$m = [regex]::Match($html, '<script type="application/json" id="du-lieu-ban-giao">(.*?)</script>', 'Singleline')
if (-not $m.Success) { Write-Host "Không đọc được kết quả kiểm thử (trang chưa chạy xong?). Tiêu đề: $tieuDe"; exit 1 }
$d = $m.Groups[1].Value | ConvertFrom-Json

# Mở thử tệp Word mẫu số 19 bằng Microsoft Word (nếu máy có Word) — kiểm thử WD-03
if ($d.docxMau19) {
  $tepDocx = Join-Path $tam "Mau-so-19.docx"; [IO.File]::WriteAllBytes($tepDocx, [Convert]::FromBase64String($d.docxMau19))
  $job = Start-Job -ArgumentList $tepDocx -ScriptBlock { param($f) $w = New-Object -ComObject Word.Application; $w.Visible = $false; $w.DisplayAlerts = 0
    try { $doc = $w.Documents.Open($f, $false, $true); $n = $doc.Paragraphs.Count; $dau = $doc.Paragraphs(1).Range.Text.Trim(); $doc.Close(0); "OK|$n|$dau" } catch { "LOI|$($_.Exception.Message)" } finally { $w.Quit() } }
  $kqWord = if (Wait-Job $job -Timeout 120) { Receive-Job $job } else { Stop-Job $job; "LOI|Word không phản hồi sau 120 giây" }
  $phan = "$kqWord".Split("|"); $datWord = $phan[0] -eq "OK"
  $d.ketQua += [pscustomobject]@{ ma = "WD-03"; nhom = "Xuất Word"; noiDung = "Mở tệp Mau-so-19.docx bằng Microsoft Word trên máy"; mongDoi = "Word mở được, không báo lỗi tệp hỏng"; thucTe = $(if ($datWord) { "Mở được: $($phan[1]) đoạn; đoạn đầu: $($phan[2])" } else { $phan[1] }); trangThai = $(if ($datWord) { "Đạt" } else { "Không đạt" }); ghiChu = "" }
}
$taiLieu = (New-Item -ItemType Directory -Force (Join-Path $duAn "tai-lieu")).FullName
function GhiCsv($ten, $dong) { $dong | Export-Csv -Path (Join-Path $taiLieu $ten) -NoTypeInformation -Encoding UTF8 }
GhiCsv "ket-qua-kiem-thu.csv" ($d.ketQua | ForEach-Object { [pscustomobject]@{ "Mã kiểm thử" = $_.ma; "Nhóm" = $_.nhom; "Nội dung" = $_.noiDung; "Kết quả mong đợi" = $_.mongDoi; "Kết quả thực tế" = $_.thucTe; "Trạng thái" = $_.trangThai; "Ghi chú" = $_.ghiChu } })
GhiCsv "bang-doi-soat.csv" ($d.doiSoat | ForEach-Object { [pscustomobject]@{ "STT" = $_.stt; "Nhóm" = $_.nhom; "Nội dung nguồn" = $_.nguon; "Vị trí trong văn bản" = $_.viTriNguon; "Trang PDF" = $_.trang; "Dữ liệu đã cấu trúc" = $_.duLieu; "Vị trí hiển thị" = $_.hienThi; "Kết quả kiểm tra" = $_.ketQua; "Ghi chú / cần xác minh" = $_.ghiChu } })
GhiCsv "danh-muc-thu-tuc.csv" ($d.thuTuc | ForEach-Object { [pscustomobject]@{ "Mã" = $_.ma; "Phụ lục" = $_.phuLuc; "Cấp" = $_.cap; "Tên thủ tục (danh mục)" = $_.ten; "Tên tại nội dung chi tiết" = $_.tenNoiDung; "Trang PDF" = $_.trang; "Thời hạn (chỉ mục)" = $_.thoiHan; "Thời hạn (nguyên văn)" = $_.thoiHanNguyenVan; "Số bước" = $_.soBuoc; "Mẫu Phụ lục V" = $_.mau; "Số dòng giấy tờ" = $_.giayTo } })
GhiCsv "van-de-van-ban-nguon.csv" ($d.vanDe | ForEach-Object { [pscustomobject]@{ "Mã" = $_.ma; "Mức độ" = $_.mucDo; "Vị trí" = $_.viTri; "Trang PDF" = $_.trang; "Mô tả" = $_.moTa } })

$ra = @("Kết quả: $tieuDe", "")
foreach ($r in $d.ketQua) { $ra += ("[{0}] {1} — {2}`n    Mong đợi: {3}`n    Thực tế : {4}{5}" -f $r.trangThai, $r.ma, $r.noiDung, $r.mongDoi, $r.thucTe, $(if ($r.ghiChu) { "`n    Ghi chú : " + $r.ghiChu } else { "" })) }
$ra | Out-File (Join-Path $tam "ket-qua-kiem-thu.txt") -Encoding utf8
$ra
Write-Host "`nĐã ghi tệp bàn giao vào $taiLieu"
