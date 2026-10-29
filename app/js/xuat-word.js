/* Xuất tệp Word (.docx, Office Open XML) không cần thư viện ngoài: dựng document.xml và đóng gói ZIP (lưu, không nén).
 * Khổ A4, lề theo thể thức văn bản hành chính (trên/dưới 2 cm, trái 3 cm, phải 2 cm), phông Times New Roman 13. */
window.TT = window.TT || {};
TT.word = (function () {
  const maHoa = new TextEncoder();
  const xml = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- ZIP (phương thức lưu) ----------
  const bangCrc = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = bangCrc[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(tep) {
    const phan = [], trungTam = []; let viTri = 0;
    const u16 = v => [v & 0xFF, (v >>> 8) & 0xFF], u32 = v => [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF];
    for (const t of tep) {
      const ten = maHoa.encode(t.ten), du = typeof t.noiDung === "string" ? maHoa.encode(t.noiDung) : t.noiDung, crc = crc32(du);
      // cờ 0x0800: tên tệp UTF-8
      const dau = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(du.length), ...u32(du.length), ...u16(ten.length), ...u16(0)]);
      phan.push(dau, ten, du);
      trungTam.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(du.length), ...u32(du.length), ...u16(ten.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(viTri)]), ten);
      viTri += dau.length + ten.length + du.length;
    }
    const coTT = trungTam.reduce((s, b) => s + b.length, 0);
    const ket = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(tep.length), ...u16(tep.length), ...u32(coTT), ...u32(viTri), ...u16(0)]);
    return new Blob([...phan, ...trungTam, ket], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  // ---------- Đoạn văn ----------
  // khoi: { text, can: "giua"|"phai"|"deu", dam, nghieng, co (pt), truoc, sau (pt) }
  function doan(k) {
    const pPr = [`<w:spacing w:before="${(k.truoc || 0) * 20}" w:after="${(k.sau == null ? 3 : k.sau) * 20}" w:line="276" w:lineRule="auto"/>`];
    if (k.can) pPr.push(`<w:jc w:val="${{ giua: "center", phai: "right", deu: "both" }[k.can]}"/>`);
    if (k.thutLe) pPr.push(`<w:ind w:firstLine="567"/>`);
    const rPr = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${k.dam ? "<w:b/>" : ""}${k.nghieng ? "<w:i/>" : ""}<w:sz w:val="${(k.co || 13) * 2}"/><w:szCs w:val="${(k.co || 13) * 2}"/></w:rPr>`;
    // Khoảng trắng dài (ranh giới cột khi trích xuất) → ký tự tab
    const chay = String(k.text || "").split(/ {3,}/).map((s, i) => (i ? `<w:r>${rPr}<w:tab/></w:r>` : "") + `<w:r>${rPr}<w:t xml:space="preserve">${xml(s)}</w:t></w:r>`).join("");
    return `<w:p><w:pPr>${pPr.join("")}</w:pPr>${chay}</w:p>`;
  }

  // Bảng: { bang: { cot: [độ rộng twips…], dong: [[ô…]…], dau: số dòng tiêu đề, vien: true|false } }; ô là chuỗi hoặc { text, dam, can, co, nghieng, gop (số cột gộp) } hoặc mảng đoạn
  function bangXml(b) {
    const vien = b.vien === false ? "none" : "single";
    const bd = `<w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(k => `<w:${k} w:val="${vien}" w:sz="4" w:space="0" w:color="000000"/>`).join("")}</w:tblBorders>`;
    const tong = b.cot.reduce((x, y) => x + y, 0);
    const dong = b.dong.map((r, i) => {
      const laDau = i < (b.dau || 0);
      let cot = 0; // vị trí cột thực (tính cả ô gộp)
      return `<w:tr>${laDau ? "<w:trPr><w:tblHeader/></w:trPr>" : ""}${r.map(o => {
        const ds = Array.isArray(o) ? o : [o];
        const gop = (ds[0] && ds[0].gop) || 1, rong = b.cot.slice(cot, cot + gop).reduce((x, y) => x + y, 0) || 1000; cot += gop;
        const ps = ds.map(x => doan(typeof x === "string" ? { text: x, co: b.co || 12, sau: 0, dam: laDau, can: laDau ? "giua" : undefined } : { co: b.co || 12, sau: 0, ...x, dam: x.dam != null ? x.dam : laDau })).join("");
        return `<w:tc><w:tcPr><w:tcW w:w="${rong}" w:type="dxa"/>${gop > 1 ? `<w:gridSpan w:val="${gop}"/>` : ""}<w:tcMar><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/></w:tcMar></w:tcPr>${ps}</w:tc>`;
      }).join("")}</w:tr>`;
    }).join("");
    return `<w:tbl><w:tblPr><w:tblW w:w="${tong}" w:type="dxa"/><w:jc w:val="center"/>${bd}<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${b.cot.map(w => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>${dong}</w:tbl><w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>`;
  }

  function taoDocx(khoi, thuocTinh) {
    thuocTinh = thuocTinh || {};
    const than = khoi.map(k => k.bang ? bangXml(k.bang) : doan(k)).join("");
    const ngang = !!thuocTinh.ngang;
    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${than}<w:sectPr>${ngang ? '<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>' : '<w:pgSz w:w="11906" w:h="16838"/>'}<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const tep = [
      { ten: "[Content_Types].xml", noiDung: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
      { ten: "_rels/.rels", noiDung: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
      { ten: "docProps/core.xml", noiDung: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xml(thuocTinh.tieuDe)}</dc:title><dc:creator>${xml(thuocTinh.tacGia)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</dcterms:created></cp:coreProperties>` },
      { ten: "word/document.xml", noiDung: document }
    ];
    return zip(tep);
  }

  function taiVe(blob, tenTep) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = tenTep;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  // ---------- Dựng lại đoạn văn từ các dòng trích xuất PDF ----------
  // PDF lưu mỗi dòng hiển thị là một dòng; ghép lại thành đoạn theo dấu kết câu, ký hiệu đầu mục, dòng chấm điền.
  const reQuocHieu = /^CỘNG H(?:ÒA|OÀ) XÃ HỘI CHỦ NGHĨA VIỆT NAM$/i, reTieuNgu = /^Độc lập\s*-\s*Tự do\s*-\s*Hạnh phúc/;
  const laHoa = t => t.length > 2 && t === t.toUpperCase() && /[A-ZĐÀ-Ỹ]/.test(t);
  const dauMuc = t => /^(\d+(\.\d+)*\.?\s|\(\d+\)\s|[a-zđ]\)\s|[-+•]\s|[IVX]+\.\s|Kính gửi|Người làm đơn|Người đề nghị|Số:|NGƯỜI |TM\.|KT\.|\(Ký|Ghi chú|Lưu ý|[.…_]{3,})/.test(t);
  const laDongCham = t => /^[.…_\s;,]+$/.test(t);
  const hetDoan = t => /[.:;!?)]$/.test(t) && !/\.\.\.[,)]?$/.test(t.replace(/\.{4,}$/, "x")) || /(\.{4,}|…|_{3,})[;.,]?$/.test(t);
  function chuanDong(t) {
    return t.replace(/\(m\s+\)/g, "(m²)").replace(/\bm\s+\)/g, "m²)").replace(/([.…])m\s+([;,])/g, "$1m²$2").replace(/(\d|\.|…)\s*m$/, "$1 m").replace(/\s{2,}/g, " ").trim();
  }
  function dungDoan(noiDung) {
    let dong = String(noiDung || "").split("\n").map(x => x.trim()).filter(Boolean);
    // "…m" + dòng "2" (số mũ bị tách) → "m²"
    for (let i = 0; i + 1 < dong.length; i++) if (/m$/.test(dong[i]) && dong[i + 1] === "2" && /[.…\d]\s*m$/.test(dong[i])) { dong[i] = dong[i].replace(/m$/, "m²"); dong.splice(i + 1, 1); }
    const quocHieu = dong.some(x => reQuocHieu.test(x.replace(/\s+/g, " ")) || reTieuNgu.test(x));
    dong = dong.filter(x => !reQuocHieu.test(x.replace(/\s+/g, " ")) && !/^[_\-]{3,}$/.test(x)).map(x => reTieuNgu.test(x) ? "" : x).filter(Boolean);
    const doan = [], chuThich = [];
    let daKy = false, trongChuThich = false;
    for (let i = 0; i < dong.length; i++) {
      let t = chuanDong(dong[i]);
      if (!t || /^\.$/.test(t)) continue;
      // Dòng chỉ có số trước phần ký: số trang hoặc số mũ bị tách → bỏ
      if (!daKy && /^\d{1,2}$/.test(t)) continue;
      if (/^\(Ký/.test(t) || /^Người làm đơn|^NGƯỜI ĐỀ NGHỊ|^Người đề nghị/.test(t)) daKy = true;
      // Sau phần ký: dòng chỉ có số = mở chú thích
      if (daKy && /^\d{1,2}$/.test(t) && dong[i + 1]) { trongChuThich = true; chuThich.push({ so: t, text: "" }); continue; }
      if (trongChuThich) { const c = chuThich[chuThich.length - 1]; c.text = (c.text ? c.text + " " : "") + t; continue; }
      const truoc = doan[doan.length - 1];
      // Dòng chấm điền đứng riêng → nối vào trường phía trước
      if (laDongCham(t)) { if (truoc) truoc.text += t; continue; }
      const moi = !truoc || dauMuc(t) || hetDoan(truoc.text) || laHoa(t) !== laHoa(truoc.text) || /^\(\d+\)$/.test(truoc.text) || /ngày\s*[.…]+\s*tháng/.test(t);
      if (moi) doan.push({ text: t }); else truoc.text += (/[-/]$/.test(truoc.text) ? "" : " ") + t;
    }
    // Dấu chú thích "(n)" đứng riêng → gắn vào đầu đoạn sau
    for (let i = doan.length - 2; i >= 0; i--) if (/^\(\d+\)$/.test(doan[i].text)) { doan[i + 1].text = doan[i].text + " " + doan[i + 1].text; doan.splice(i, 1); }
    return { quocHieu, doan, chuThich };
  }

  // ---------- Ô điền trong mẫu: các dòng chấm (……, ....., ____) ----------
  // Chấm ngắn (2–3 dấu) chỉ là ô khi đứng tách riêng (vd. "ngày ... tháng"), không phải "email..."
  const reO = /(?:[.…_]{4,}|…+[.…_]*|(?:^|(?<=[\s,(/]))\.{2,3}(?=[\s,)/]|$))/g;
  const laDongNgay = t => /ngày\s*[.…]+\s*tháng/.test(t) && t.length < 80;
  // Chuẩn hóa đoạn trước khi tách ô — dùng chung cho màn hình điền và xuất Word
  const chuanDoanMau = t => laDongNgay(t) && /^[.…]/.test(t) ? t.replace(/^[.…\s]*,?\s*/, "……, ") : t;
  function tachO(text) {
    const phan = []; let p = 0, m; reO.lastIndex = 0;
    while ((m = reO.exec(text))) { if (m.index > p) phan.push({ t: text.slice(p, m.index) }); phan.push({ o: true, goc: m[0] }); p = m.index + m[0].length; }
    if (p < text.length) phan.push({ t: text.slice(p) });
    return phan;
  }
  // Danh sách đoạn kèm ô điền, theo đúng thứ tự dùng khi xuất Word (để giá trị điền khớp vị trí)
  function oDienMau(m) {
    const { doan } = dungDoan(m.noiDung); let i = 0;
    return doan.map(d => ({ phan: tachO(chuanDoanMau(d.text)).map(x => x.o ? { ...x, i: i++ } : x), laHoa: laHoa(d.text), ngay: laDongNgay(d.text) }));
  }
  const dienO = (text, bd) => !bd ? text : text.replace(reO, g => { const v = bd.gt[bd.i++]; return v != null && String(v).trim() ? String(v).trim() : g; });

  // Dựng nội dung Word cho một mẫu biểu Phụ lục V; giaTri (tùy chọn): mảng giá trị điền vào các ô theo thứ tự oDienMau
  function khoiMau(m, vb, giaTri) {
    const bd = giaTri ? { gt: giaTri, i: 0 } : null;
    const khoi = [{ text: `Mẫu số ${m.kyHieu}. ${m.ten}`, can: "phai", nghieng: true, co: 11, sau: 6 }];
    const { quocHieu, doan, chuThich } = dungDoan(m.noiDung);
    if (quocHieu) {
      khoi.push({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", can: "giua", dam: true, co: 13, sau: 0 });
      khoi.push({ text: "Độc lập - Tự do - Hạnh phúc", can: "giua", dam: true, co: 14, sau: 0 });
      khoi.push({ text: "_______________________", can: "giua", sau: 8 });
    }
    for (const d of doan) {
      const t = dienO(chuanDoanMau(d.text), bd), hoa = laHoa(d.text);
      if (laDongNgay(d.text)) { khoi.push({ text: t, can: "phai", nghieng: true, sau: 6 }); continue; }
      const giua = hoa && t.length < 120 || /^\(Ban hành|^\(Kèm theo|^\(Ký/.test(t);
      khoi.push({ text: t, can: giua ? "giua" : "deu", dam: hoa && t.length < 120, nghieng: /^\(Ký/.test(t), thutLe: !giua && !/^(\d+(\.\d+)*\.|[-+•]|\(\d+\)|[a-zđ]\))/.test(t) && t.length > 90, truoc: hoa ? 6 : 0 });
    }
    if (chuThich.length) {
      khoi.push({ text: "Ghi chú:", dam: true, nghieng: true, co: 11, truoc: 10 });
      for (const c of chuThich) khoi.push({ text: `(${c.so}) ${c.text}`, can: "deu", co: 11 });
    }
    khoi.push({ text: `Nguồn: Mẫu số ${m.kyHieu}, Phụ lục V ban hành kèm theo ${vb.loai} số ${vb.soKyHieu.giaTri} ngày ${vb.ngayBanHanh.giaTri} của ${vb.coQuanBanHanh} (trang ${m.trangDau}${m.trangCuoi !== m.trangDau ? "–" + m.trangCuoi : ""} tệp PDF). Nội dung được dựng lại tự động từ PDF (ghép dòng thành đoạn); bảng biểu, ô đánh dấu có thể khác bố cục gốc — đối chiếu mẫu gốc trước khi sử dụng.`, nghieng: true, co: 10, truoc: 12 });
    return khoi;
  }
  function xuatMau(m, vb, tacGia, giaTri) {
    taiVe(taoDocx(khoiMau(m, vb, giaTri), { tieuDe: `Mẫu số ${m.kyHieu}. ${m.ten}`, tacGia }), `Mau-so-${m.kyHieu}${giaTri ? "-da-dien" : ""}.docx`);
  }

  return { taoDocx, xuatMau, khoiMau, dungDoan, oDienMau, tachO, zip, crc32, taiVe };
})();
