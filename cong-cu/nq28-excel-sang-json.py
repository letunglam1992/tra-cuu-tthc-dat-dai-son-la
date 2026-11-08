#!/usr/bin/env python3
"""Chuyển phụ biểu Excel Nghị quyết số 28/2026/NQ-HĐND (sửa đổi Bảng giá đất) → cong-cu/du-lieu/nq28-2026.json.

Sheet dùng: PL.1_Bổ sung ODT, PL.2_Bổ sung TMD, PL.3_Bổ sung SKC (Phụ lục I–III: bổ sung giá),
            PL.4_Điều chỉnh tên đường (Phụ lục IV), PL.5_Bãi bỏ tên tuyến đường (Phụ lục V).
Cách dùng: python3 cong-cu/nq28-excel-sang-json.py <tệp .xlsx>
"""
import sys, json, re, os
import openpyxl

def sach(s):
    return re.sub(r"\s+", " ", str(s if s is not None else "").replace("\xa0", " ")).strip()

def la_xa(stt, ten):
    return re.fullmatch(r"\d+\.\d+", stt) and re.match(r"^(Xã|Phường|Sông Mã)", ten)

def bo_sung(ws):
    """Phụ lục I–III: [{xa, nhom, ten, vt:[5], ghiChu}] — giá nghìn đồng/m²."""
    ra, xa, nhom = [], None, ""
    for r in ws.iter_rows(min_row=6, values_only=True):
        stt, ten = sach(r[0]), sach(r[1])
        if not ten: continue
        vt = [r[i] if isinstance(r[i], (int, float)) else None for i in range(2, 7)]
        if la_xa(stt, ten):
            xa, nhom = ten if not ten.startswith("Sông Mã") else "Xã Sông Mã", ""; continue
        if not any(v is not None for v in vt):
            nhom = ten; continue  # dòng nhóm (5.x.y hoặc không số)
        n = 5
        while n and vt[n - 1] is None: n -= 1
        ra.append({"xa": xa, "nhom": nhom if stt in ("-", "") else "", "ten": ten, "vt": vt[:n], "ghiChu": sach(r[7]) if len(r) > 7 else ""})
    return ra

def iv_v(ws, co_moi):
    ra, xa = [], None
    for r in ws.iter_rows(min_row=5, values_only=True):
        stt, cu = sach(r[0]), sach(r[1])
        if not cu: continue
        if la_xa(stt, cu):
            xa = cu if not cu.startswith("Sông Mã") else "Xã Sông Mã"; continue
        moi = sach(r[2]) if co_moi else ""
        ra.append({"xa": xa, "stt": stt, "cu": cu, "moi": moi})
    return ra

wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
du = {
    "vanBan": "Nghị quyết số 28/2026/NQ-HĐND ngày 19/10/2026 của HĐND tỉnh Sơn La",
    "hieuLucTu": "2026-11-01",
    "nguon": os.path.basename(sys.argv[1]),
    "plI": bo_sung(wb["PL.1_Bổ sung ODT"]), "plII": bo_sung(wb["PL.2_Bổ sung TMD"]), "plIII": bo_sung(wb["PL.3_Bổ sung SKC"]),
    "plIV": iv_v(wb["PL.4_Điều chỉnh tên đường"], True), "plV": iv_v(wb["PL.5_Bãi bỏ tên tuyến đường"], False),
}
ra = os.path.join(os.path.dirname(__file__), "du-lieu", "nq28-2026.json")
os.makedirs(os.path.dirname(ra), exist_ok=True)
json.dump(du, open(ra, "w"), ensure_ascii=False, indent=1)
print(ra, {k: len(v) for k, v in du.items() if isinstance(v, list)})
