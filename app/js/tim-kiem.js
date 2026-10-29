/* Tìm kiếm toàn văn tiếng Việt: có dấu / không dấu, nhiều từ khóa (AND), ưu tiên khớp tiêu đề và khớp cả cụm.
 * Chỉ trả về tài liệu thực sự chứa toàn bộ từ khóa — không có kết quả "gợi ý" giả. */
window.TT = window.TT || {};
TT.taoTimKiem = function (mh) {
  const ti = TT.ti;
  const tl = []; // { loai, nhom, id, tieuDe, phu, lienKet, truong:[{ten, goc, chuan, trongSo, lienKet}] }
  const truong = (ten, goc, trongSo, lienKet) => ({ ten, goc: goc || "", chuan: ti.chuanHoa(goc || ""), trongSo, lienKet });

  for (const t of mh.thuTuc) {
    const f = [truong("Tên thủ tục", t.ten, 10), truong("Mã", "Thủ tục " + t.ma + " " + t.ma, 8)];
    if (!t.khopTen) f.push(truong("Tên tại nội dung", t.tenNoiDung, 6));
    for (const k of [1, 2, 3, 4, 5, 6, 7, 8, 9]) if (t.muc[k]) f.push(truong(mh.TEN_MUC[k], t.muc[k].noiDung, k === 5 || k === 8 ? 3 : 1, `#/thu-tuc/${t.ma}/${k}`));
    tl.push({ loai: "thu-tuc", nhom: "Thủ tục hành chính", id: t.ma, tieuDe: t.ten, phu: `Thủ tục ${t.ma} · Phụ lục ${t.phuLuc} · ${t.cap}`, lienKet: "#/thu-tuc/" + t.ma, truong: f });
  }
  for (const q of mh.quyTrinh) {
    for (const b of q.buoc) {
      tl.push({ loai: "buoc-qt", nhom: "Bước quy trình luân chuyển", id: q.id + "/" + b.id, tieuDe: b.ten, phu: `${q.ten} · Khoản ${b.canCu.khoan} Điều ${b.canCu.dieu}`, lienKet: `#/quy-trinh/${q.id}/${b.id}`,
        truong: [truong("Công đoạn", b.ten, 8), truong("Nguyên văn", b.nguyenVan, 2), truong("Cơ quan", (mh.coQuanTheoId[b.lane] || {}).ten, 3), truong("Thời hạn", b.thoiHan && (b.thoiHan.nguyenVan || b.thoiHan.ghiChu), 2)] });
    }
  }
  for (const m of mh.mauBieu) {
    tl.push({ loai: "mau", nhom: "Mẫu đơn, tờ khai, biểu mẫu", id: m.khoa, tieuDe: `Mẫu số ${m.kyHieu}. ${m.ten}`, phu: `Phụ lục V · trang ${m.trangDau}`, lienKet: "#/mau-bieu/" + m.khoa,
      truong: [truong("Tên mẫu", `Mẫu số ${m.kyHieu} ${m.ten}`, 10), truong("Nội dung mẫu", m.noiDung, 1)] });
  }
  for (const d of mh.dieuQD) tl.push({ loai: "dieu", nhom: "Căn cứ pháp lý", id: "qd-" + d.so, tieuDe: `Điều ${d.so} Quyết định. ${d.tieuDe}`, phu: `Quyết định · trang ${d.trangDau}`, lienKet: "#/can-cu/qd-" + d.so, truong: [truong("Tiêu đề", `Điều ${d.so} ${d.tieuDe}`, 8), truong("Nội dung", d.noiDung, 1)] });
  for (const d of mh.dieu) tl.push({ loai: "dieu", nhom: "Căn cứ pháp lý", id: "dieu-" + d.so, tieuDe: `Điều ${d.so}. ${d.tieuDe}`, phu: `${d.chuong} · trang ${d.trangDau}`, lienKet: "#/can-cu/dieu-" + d.so, truong: [truong("Tiêu đề", `Điều ${d.so} ${d.tieuDe}`, 8), truong("Nội dung", d.noiDung, 1)] });
  for (const m of mh.phuLucIV) tl.push({ loai: "pl4", nhom: "Thu hồi đất, bồi thường, hỗ trợ, tái định cư (Phụ lục IV)", id: m.so, tieuDe: `${m.so}. ${m.tieuDe}`, phu: `Phụ lục IV · trang ${m.trangDau}–${m.trangCuoi}`, lienKet: "#/thu-hoi/" + m.so, truong: [truong("Tiêu đề", m.tieuDe, 8), ...m.khoan.map(k => truong("Khoản " + k.so, k.noiDung, 1, `#/thu-hoi/${m.so}/${k.so}`))] });
  for (const c of mh.coQuan) if (mh.chiMucCoQuan[c.id]) tl.push({ loai: "co-quan", nhom: "Cơ quan, chủ thể", id: c.id, tieuDe: c.ten, phu: c.nhom, lienKet: "#/co-quan/" + c.id, truong: [truong("Tên", c.ten, 10)] });
  for (const v of Object.values(mh.vanBanDanChieu)) tl.push({ loai: "van-ban", nhom: "Văn bản được viện dẫn", id: v.ten, tieuDe: v.ten, phu: `Được viện dẫn tại ${v.viTri.length} vị trí`, lienKet: "#/can-cu?vb=" + encodeURIComponent(v.ten), truong: [truong("Tên văn bản", v.ten, 10)] });

  function tachTuKhoa(q) {
    const chuan = ti.chuanHoa(q);
    // Cụm trong ngoặc kép giữ nguyên; còn lại tách theo khoảng trắng
    const cum = []; let du = chuan.replace(/"([^"]+)"/g, (_, c) => { cum.push(c.trim()); return " "; });
    for (const w of du.split(" ")) if (w.trim()) cum.push(w.trim());
    return { chuan: chuan.replace(/"/g, "").trim(), tu: [...new Set(cum)] };
  }

  function tim(q, boLoc) {
    const { chuan, tu } = tachTuKhoa(q);
    if (!tu.length) return { tu: [], ketQua: [] };
    const ketQua = [];
    for (const d of tl) {
      if (boLoc && boLoc.loai && boLoc.loai !== d.loai) continue;
      let diem = 0, du = true, truongKhop = null;
      for (const w of tu) {
        let tot = 0;
        for (const f of d.truong) if (ti.chuaDauTu(f.chuan, w)) { tot = Math.max(tot, f.trongSo); if (!truongKhop || f.trongSo > truongKhop.trongSo) truongKhop = f; }
        if (!tot) { du = false; break; }
        diem += tot;
      }
      if (!du) continue;
      // Thưởng khi cả cụm xuất hiện liền nhau, và khi khớp ở đầu tiêu đề
      if (tu.length > 1) for (const f of d.truong) if (ti.chuaDauTu(f.chuan, chuan)) { diem += f.trongSo * 3; truongKhop = f; break; }
      const tdChuan = ti.chuanHoa(d.tieuDe);
      if (tdChuan.startsWith(chuan)) diem += 15;
      // Trường hiển thị trích đoạn: ưu tiên trường có cả cụm, rồi trường có trọng số cao nhất chứa từ khóa đầu
      let fTrich = d.truong.find(f => ti.chuaDauTu(f.chuan, chuan) && f.trongSo < 8) || d.truong.find(f => tu.every(w => ti.chuaDauTu(f.chuan, w)) && f.trongSo < 8) || truongKhop;
      ketQua.push({ ...d, diem, truongTrich: fTrich ? fTrich.ten : null, trich: fTrich && fTrich.trongSo < 8 ? ti.trichDoan(fTrich.goc, [chuan, ...tu]) : null, lienKetTruong: fTrich && fTrich.lienKet });
    }
    ketQua.sort((a, b) => b.diem - a.diem || a.tieuDe.localeCompare(b.tieuDe, "vi"));
    return { tu: [chuan, ...tu], ketQua };
  }

  return { tim, tachTuKhoa, soTaiLieu: tl.length };
};
