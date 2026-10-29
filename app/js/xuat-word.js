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

  function taoDocx(khoi, thuocTinh) {
    const than = khoi.map(doan).join("");
    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${than}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
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

  // Dựng nội dung Word cho một mẫu biểu Phụ lục V
  function khoiMau(m, vb) {
    const khoi = [{ text: `Mẫu số ${m.kyHieu}. ${m.ten}`, dam: true, co: 12, sau: 6 }];
    for (const dong of String(m.noiDung).split("\n")) {
      const t = dong.trim(); if (!t) continue;
      const hoa = t.length > 3 && t === t.toUpperCase() && /[A-ZĐ]/.test(t);
      const giua = hoa || /^(Độc lập|Kính gửi|\(Ban hành|\(Kèm theo)/.test(t) || /^-{3,}$/.test(t);
      khoi.push({ text: t, can: giua ? "giua" : undefined, dam: hoa && t.length < 90 });
    }
    khoi.push({ text: `Nguồn: Mẫu số ${m.kyHieu}, Phụ lục V ban hành kèm theo ${vb.loai} số ${vb.soKyHieu.giaTri} ngày ${vb.ngayBanHanh.giaTri} của ${vb.coQuanBanHanh} (trang ${m.trangDau}${m.trangCuoi !== m.trangDau ? "–" + m.trangCuoi : ""} tệp PDF). Nội dung được chuyển tự động từ PDF; đối chiếu định dạng với mẫu gốc trước khi sử dụng.`, nghieng: true, co: 10, truoc: 12 });
    return khoi;
  }
  function xuatMau(m, vb, tacGia) {
    taiVe(taoDocx(khoiMau(m, vb), { tieuDe: `Mẫu số ${m.kyHieu}. ${m.ten}`, tacGia }), `Mau-so-${m.kyHieu}.docx`);
  }

  return { taoDocx, xuatMau, khoiMau, zip, crc32, taiVe };
})();
