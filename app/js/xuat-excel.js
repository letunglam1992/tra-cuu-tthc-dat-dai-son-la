/* Xuất tệp Excel (.xlsx, Office Open XML) không cần thư viện: một hoặc nhiều trang tính, chuỗi nội tuyến, dòng tiêu đề đậm, cố định dòng đầu.
 * Dùng chung bộ đóng gói ZIP của xuat-word.js. */
window.TT = window.TT || {};
TT.excel = (function () {
  const xml = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  const cotChu = n => { let s = ""; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  // trang: { ten, cot: [tiêu đề], dong: [[giá trị…]], rong: [độ rộng ký tự] }
  function sheetXml(tr) {
    const hang = [tr.cot, ...tr.dong].map((r, i) => `<row r="${i + 1}">${r.map((v, j) => {
      const ref = cotChu(j) + (i + 1), s = i === 0 ? ' s="1"' : "";
      if (typeof v === "number" && isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
      return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
    }).join("")}</row>`).join("");
    const cols = (tr.rong || []).length ? `<cols>${tr.rong.map((w, j) => `<col min="${j + 1}" max="${j + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>` : "";
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${cols}<sheetData>${hang}</sheetData></worksheet>`;
  }
  function taoXlsx(trang) {
    const ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${trang.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`;
    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const wb = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${trang.map((t, i) => `<sheet name="${xml(String(t.ten).replace(/[\\/?*[\]:]/g, " ").slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`;
    const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${trang.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${trang.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Times New Roman"/></font><font><b/><sz val="11"/><name val="Times New Roman"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0"/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>`;
    const tep = [{ ten: "[Content_Types].xml", noiDung: ct }, { ten: "_rels/.rels", noiDung: rels }, { ten: "xl/workbook.xml", noiDung: wb }, { ten: "xl/_rels/workbook.xml.rels", noiDung: wbRels }, { ten: "xl/styles.xml", noiDung: styles },
      ...trang.map((t, i) => ({ ten: `xl/worksheets/sheet${i + 1}.xml`, noiDung: sheetXml(t) }))];
    const blob = TT.word.zip(tep);
    return new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function xuat(tenTep, trang) { TT.word.taiVe(taoXlsx(trang), tenTep); }
  return { taoXlsx, xuat };
})();
