export type ReportPdfColumn = {
  key: string;
  title: string;
};

export type ReportPdfRow = Record<string, string>;

type ReportPdfInput = {
  rows: ReportPdfRow[];
  columns: ReportPdfColumn[];
  title: string;
  subtitle: string;
  period: string;
  selectedDustbinsLabel: string;
};

type PdfPageConfig = {
  pageWidth: number;
  pageHeight: number;
  pageMarginX: number;
  pageMarginY: number;
  rowsPerPage: number;
  tableStartY: number;
  rowHeight: number;
  timestampWidth: number;
  metricWidth: number;
  titleFontSize: number;
  bodyFontSize: number;
  headerFontSize: number;
  coverTitleFontSize: number;
  coverSubtitleFontSize: number;
};

const PORTRAIT_PAGE_WIDTH = 595;
const PORTRAIT_PAGE_HEIGHT = 842;
const LANDSCAPE_PAGE_WIDTH = 842;
const LANDSCAPE_PAGE_HEIGHT = 595;

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " ");
}

function toPdfY(pageHeight: number, topY: number) {
  return pageHeight - topY;
}

function drawText(
  pageHeight: number,
  x: number,
  topY: number,
  text: string,
  font: "F1" | "F2",
  size: number,
  color: [number, number, number],
) {
  return [
    "BT",
    `/${font} ${size} Tf`,
    `${color[0]} ${color[1]} ${color[2]} rg`,
    `1 0 0 1 ${x} ${toPdfY(pageHeight, topY)} Tm`,
    `(${escapePdfText(text)}) Tj`,
    "ET",
  ].join("\n");
}

function drawFilledRect(
  pageHeight: number,
  x: number,
  topY: number,
  width: number,
  height: number,
  color: [number, number, number],
) {
  return [
    `${color[0]} ${color[1]} ${color[2]} rg`,
    `${x} ${toPdfY(pageHeight, topY + height)} ${width} ${height} re`,
    "f",
  ].join("\n");
}

function drawStrokedRect(
  pageHeight: number,
  x: number,
  topY: number,
  width: number,
  height: number,
  color: [number, number, number],
) {
  return [
    `${color[0]} ${color[1]} ${color[2]} RG`,
    "0.8 w",
    `${x} ${toPdfY(pageHeight, topY + height)} ${width} ${height} re`,
    "S",
  ].join("\n");
}

function trimToPdfCell(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= 3) {
    return value.slice(0, maxLength);
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function getPdfPageConfig(columnCount: number): PdfPageConfig {
  const isLandscape = columnCount > 7;
  const pageWidth = isLandscape ? LANDSCAPE_PAGE_WIDTH : PORTRAIT_PAGE_WIDTH;
  const pageHeight = isLandscape ? LANDSCAPE_PAGE_HEIGHT : PORTRAIT_PAGE_HEIGHT;
  const pageMarginX = 32;
  const pageMarginY = 36;
  const usableWidth = pageWidth - pageMarginX * 2;
  const timestampWidth = isLandscape ? 112 : 135;
  const metricColumnCount = Math.max(0, columnCount - 1);
  const metricWidth =
    metricColumnCount > 0
      ? Math.floor((usableWidth - timestampWidth) / metricColumnCount)
      : usableWidth;

  return {
    pageWidth,
    pageHeight,
    pageMarginX,
    pageMarginY,
    rowsPerPage: isLandscape ? 18 : 26,
    tableStartY: isLandscape ? 126 : 152,
    rowHeight: 22,
    timestampWidth,
    metricWidth,
    titleFontSize: isLandscape ? 16 : 19,
    bodyFontSize: isLandscape ? 8 : 9,
    headerFontSize: isLandscape ? 7 : 9,
    coverTitleFontSize: isLandscape ? 24 : 28,
    coverSubtitleFontSize: isLandscape ? 16 : 18,
  };
}

function getColumnWidths(columns: ReportPdfColumn[], config: PdfPageConfig) {
  return columns.map((column, index) =>
    index === 0 && column.key === "timestamp"
      ? config.timestampWidth
      : config.metricWidth,
  );
}

function createCoverPage(input: ReportPdfInput, config: PdfPageConfig) {
  const commands: string[] = [];
  const innerWidth = config.pageWidth - 72;
  const lowerPanelTop = config.pageHeight - 224;

  commands.push(
    drawFilledRect(config.pageHeight, 0, 0, config.pageWidth, config.pageHeight, [
      0.98, 0.99, 0.99,
    ]),
  );
  commands.push(
    drawFilledRect(config.pageHeight, 36, 54, innerWidth, 136, [0.18, 0.42, 0.31]),
  );
  commands.push(
    drawFilledRect(
      config.pageHeight,
      36,
      lowerPanelTop,
      innerWidth,
      138,
      [0.2, 0.74, 0.72],
    ),
  );
  commands.push(
    drawFilledRect(
      config.pageHeight,
      72,
      225,
      config.pageWidth - 144,
      Math.max(180, config.pageHeight - 360),
      [0.9, 0.97, 0.95],
    ),
  );
  commands.push(
    drawStrokedRect(
      config.pageHeight,
      72,
      225,
      config.pageWidth - 144,
      Math.max(180, config.pageHeight - 360),
      [0.18, 0.42, 0.31],
    ),
  );
  commands.push(drawText(config.pageHeight, 84, 120, "WCE GMS", "F2", 34, [1, 1, 1]));
  commands.push(
    drawText(
      config.pageHeight,
      72,
      288,
      "Garbage Management System",
      "F2",
      22,
      [0.18, 0.42, 0.31],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      72,
      328,
      input.subtitle,
      "F2",
      config.coverSubtitleFontSize,
      [0.15, 0.27, 0.24],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      72,
      368,
      `Monitoring period: ${input.period}`,
      "F1",
      12,
      [0.22, 0.3, 0.29],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      72,
      394,
      `Selected dustbins: ${trimToPdfCell(input.selectedDustbinsLabel, 70)}`,
      "F1",
      12,
      [0.22, 0.3, 0.29],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      72,
      420,
      `Rows captured: ${input.rows.length}`,
      "F1",
      12,
      [0.22, 0.3, 0.29],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      72,
      446,
      `Generated from website report sheet: ${new Date().toLocaleString()}`,
      "F1",
      11,
      [0.22, 0.3, 0.29],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      84,
      lowerPanelTop + 70,
      input.title,
      "F2",
      config.coverTitleFontSize,
      [1, 1, 1],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      84,
      lowerPanelTop + 106,
      "Sensor Monitoring Report",
      "F1",
      14,
      [0.94, 1, 0.98],
    ),
  );

  return commands.join("\n");
}

function createTablePage(
  rows: ReportPdfRow[],
  columns: ReportPdfColumn[],
  title: string,
  subtitle: string,
  period: string,
  pageNumber: number,
  pageCount: number,
  config: PdfPageConfig,
) {
  const commands: string[] = [];
  const columnWidths = getColumnWidths(columns, config);
  const tableWidth = columnWidths.reduce((sum, value) => sum + value, 0);
  const pageFooterY = config.pageHeight - 26;

  commands.push(
    drawFilledRect(config.pageHeight, 0, 0, config.pageWidth, config.pageHeight, [1, 1, 1]),
  );
  commands.push(
    drawFilledRect(
      config.pageHeight,
      config.pageMarginX,
      config.pageMarginY,
      tableWidth,
      44,
      [0.18, 0.42, 0.31],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      config.pageMarginX + 12,
      config.pageMarginY + 26,
      title,
      "F2",
      config.titleFontSize,
      [1, 1, 1],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      config.pageMarginX + 12,
      config.pageMarginY + 52,
      trimToPdfCell(`${subtitle} | Period: ${period}`, 110),
      "F1",
      10,
      [0.2, 0.3, 0.28],
    ),
  );
  commands.push(
    drawText(
      config.pageHeight,
      config.pageMarginX + tableWidth - 84,
      config.pageMarginY + 52,
      `Page ${pageNumber}/${pageCount}`,
      "F1",
      10,
      [0.2, 0.3, 0.28],
    ),
  );

  let x = config.pageMarginX;
  for (let index = 0; index < columns.length; index += 1) {
    const width = columnWidths[index];
    commands.push(
      drawFilledRect(
        config.pageHeight,
        x,
        config.tableStartY,
        width,
        config.rowHeight,
        [0.18, 0.42, 0.31],
      ),
    );
    commands.push(
      drawStrokedRect(
        config.pageHeight,
        x,
        config.tableStartY,
        width,
        config.rowHeight,
        [0.84, 0.92, 0.88],
      ),
    );
    commands.push(
      drawText(
        config.pageHeight,
        x + 4,
        config.tableStartY + 15,
        trimToPdfCell(columns[index].title, width > 80 ? 18 : 12),
        "F2",
        config.headerFontSize,
        [1, 1, 1],
      ),
    );
    x += width;
  }

  rows.forEach((row, rowIndex) => {
    const rowTop = config.tableStartY + config.rowHeight + rowIndex * config.rowHeight;
    const fillColor: [number, number, number] =
      rowIndex % 2 === 0 ? [0.97, 1, 0.97] : [1, 1, 1];

    let rowX = config.pageMarginX;
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
      const width = columnWidths[columnIndex];
      const value = row[columns[columnIndex].key] ?? "";
      const maxLength = width > 100 ? 18 : width > 70 ? 12 : 9;

      commands.push(
        drawFilledRect(
          config.pageHeight,
          rowX,
          rowTop,
          width,
          config.rowHeight,
          fillColor,
        ),
      );
      commands.push(
        drawStrokedRect(
          config.pageHeight,
          rowX,
          rowTop,
          width,
          config.rowHeight,
          [0.84, 0.92, 0.88],
        ),
      );
      commands.push(
        drawText(
          config.pageHeight,
          rowX + 4,
          rowTop + 15,
          trimToPdfCell(value, maxLength),
          "F1",
          config.bodyFontSize,
          [0.2, 0.24, 0.22],
        ),
      );
      rowX += width;
    }
  });

  commands.push(
    drawText(
      config.pageHeight,
      config.pageMarginX,
      pageFooterY,
      "WCE GMS autogenerated report export",
      "F1",
      10,
      [0.35, 0.41, 0.39],
    ),
  );

  return commands.join("\n");
}

function buildPdfDocument(pageContents: string[], config: PdfPageConfig) {
  const objects: string[] = [];
  const pageCount = pageContents.length;

  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");

  const kids = pageContents
    .map((_, index) => `${3 + index * 2} 0 R`)
    .join(" ");
  objects.push(`2 0 obj << /Type /Pages /Kids [${kids}] /Count ${pageCount} >> endobj`);

  pageContents.forEach((content, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;

    objects.push(
      `${pageObjectNumber} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${config.pageWidth} ${config.pageHeight}] /Resources << /Font << /F1 ${3 + pageCount * 2} 0 R /F2 ${4 + pageCount * 2} 0 R >> >> /Contents ${contentObjectNumber} 0 R >> endobj`,
    );
    objects.push(
      `${contentObjectNumber} 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
    );
  });

  objects.push(
    `${3 + pageCount * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
  );
  objects.push(
    `${4 + pageCount * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`,
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadSensorMonitoringReportPdf(input: ReportPdfInput) {
  const config = getPdfPageConfig(input.columns.length);
  const rowPages: ReportPdfRow[][] = [];

  for (let index = 0; index < input.rows.length; index += config.rowsPerPage) {
    rowPages.push(input.rows.slice(index, index + config.rowsPerPage));
  }

  const pageContents = [createCoverPage(input, config)];
  const totalPages = rowPages.length + 1;

  rowPages.forEach((pageRows, index) => {
    pageContents.push(
      createTablePage(
        pageRows,
        input.columns,
        input.title,
        input.subtitle,
        input.period,
        index + 2,
        totalPages,
        config,
      ),
    );
  });

  const pdfBlob = buildPdfDocument(pageContents, config);
  const filename = `wcegms-monitoring-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  downloadBlob(pdfBlob, filename);
}
