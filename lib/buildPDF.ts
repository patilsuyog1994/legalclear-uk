/* ─────────────────────────────────────────────────────────────────
   Shared PDF generation for LegalClear UK solicitor packs.
   Used by PackPageClient (owner view) and DashboardClient (My Packs tab).
───────────────────────────────────────────────────────────────────── */

export interface TimelineEvent {
  date?: string;
  description: string;
}

export interface PackData {
  clientSummary:          string;
  timeline:               TimelineEvent[];
  legalContext:           string;
  keyFacts:               string[];
  questionsForSolicitor:  string[];
  documentsToGather:      string[];
  urgentActions:          string[];
}

export async function buildPDF(pack: PackData, title: string, dateStr: string): Promise<void> {
  const { jsPDF } = await import("jspdf");

  /* ── Layout constants (all mm) ── */
  const PW = 210, PH = 297;
  const MX = 18;
  const CW = PW - MX * 2;

  const HDR_LINE = 15;
  const CTX_TOP  = 20;
  const CTX_END  = 272;
  const FTR_LINE = 276;
  const FTR_TEXT = 282;

  const LH10 = 5.5;
  const LH9  = 5.0;
  const LH8  = 4.5;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  const t  = (hex: string) => doc.setTextColor(hex);
  const f  = (hex: string) => doc.setFillColor(hex);
  const d  = (hex: string) => doc.setDrawColor(hex);
  const lw = (w: number)   => doc.setLineWidth(w);

  function hline(yp: number, colour = "#dcd7d0", width = 0.3) {
    d(colour); lw(width);
    doc.line(MX, yp, PW - MX, yp);
  }

  function newPage() { doc.addPage(); y = CTX_TOP; }
  function checkBreak(need: number) { if (y + need > CTX_END) newPage(); }

  function wrapText(text: string, x: number, maxW: number, lhVal = LH10): void {
    const lines = doc.splitTextToSize(text.replace(/\n+/g, " "), maxW) as string[];
    for (const line of lines) { checkBreak(lhVal + 1); doc.text(line, x, y); y += lhVal; }
  }

  function sectionLabel(num: number, label: string): void {
    y += 4; checkBreak(16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); t("#0f6e56");
    doc.text(`${num}.  ${label.toUpperCase()}`, MX, y);
    y += 3.5; hline(y, "#0f6e56", 0.7); y += 6;
  }

  /* ── PAGE 1 COVER ── */
  y = 24;
  f("#0f6e56"); doc.roundedRect(MX, y - 12, 14, 14, 2.5, 2.5, "F");
  d("#ffffff"); lw(1.2);
  doc.line(MX + 3.5, y - 4.5, MX + 6, y - 2);
  doc.line(MX + 6, y - 2, MX + 10.5, y - 7.5);
  doc.setFont("helvetica", "bold"); doc.setFontSize(17); t("#1c1c1c");
  doc.text("LegalClear UK", MX + 18, y - 5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); t("#8c8c8c");
  doc.text("Pre-Solicitor Briefing Pack", MX + 18, y + 1.5);

  y = 36; hline(y, "#0f6e56", 0.9); y = 45;

  const titleLines = doc.splitTextToSize(title, CW) as string[];
  doc.setFont("helvetica", "bold"); doc.setFontSize(19); t("#1c1c1c");
  for (const tl of titleLines) { doc.text(tl, MX, y); y += 8; }

  y += 1;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); t("#8c8c8c");
  doc.text(`Generated: ${dateStr}`, MX, y);
  doc.text("England & Wales", PW - MX, y, { align: "right" });

  y += 8; hline(y, "#dcd7d0", 0.3); y += 7;

  const disclaimerText = "This document is for informational purposes only. Bring it to your first solicitor appointment. Do not rely on it as legal advice.";
  const dLines = doc.splitTextToSize(disclaimerText, CW - 10) as string[];
  const dH = dLines.length * LH8 + 8;
  f("#fffbeb"); d("#fde68a"); lw(0.5);
  doc.rect(MX, y, CW, dH, "DF");
  y += 5; doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); t("#92400e");
  for (const dl of dLines) { doc.text(dl, MX + 4, y); y += LH8; }
  y += 5;

  if (pack.urgentActions && pack.urgentActions.length > 0) {
    const urgLineGroups = pack.urgentActions.map((a) => doc.splitTextToSize(`-> ${a}`, CW - 10) as string[]);
    const urgH = urgLineGroups.reduce((s, ls) => s + ls.length * LH9, 0) + pack.urgentActions.length * 2 + 14;
    f("#fef2f2"); d("#dc2626"); lw(0.9);
    doc.rect(MX, y, CW, urgH, "DF"); lw(0.3);
    y += 6;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); t("#dc2626");
    doc.text("! URGENT ACTIONS REQUIRED BEFORE YOUR APPOINTMENT", MX + 4, y);
    y += 5;
    for (const als of urgLineGroups) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); t("#7f1d1d");
      for (const al of als) { doc.text(al, MX + 5, y); y += LH9; }
      y += 2;
    }
    y += 4;
  }

  /* ── SECTION 1: CLIENT SUMMARY ── */
  sectionLabel(1, "Client Summary");
  const summaryParas = (pack.clientSummary || "").split("\n\n").filter(Boolean);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); t("#3c3c3c");
  for (let pi = 0; pi < summaryParas.length; pi++) {
    wrapText(summaryParas[pi], MX, CW, LH10);
    if (pi < summaryParas.length - 1) y += 3;
  }

  /* ── SECTION 2: TIMELINE ── */
  if (pack.timeline && pack.timeline.length > 0) {
    sectionLabel(2, "Timeline of Events");
    const DATE_W = 30; const DOT_X = MX + DATE_W + 5; const DESC_X = DOT_X + 6; const DESC_W = CW - DATE_W - 12;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); t("#8c8c8c");
    doc.text("DATE", MX, y); doc.text("EVENT", DESC_X, y);
    y += 3; hline(y, "#dcd7d0", 0.25); y += 5;
    for (let ei = 0; ei < pack.timeline.length; ei++) {
      const event = pack.timeline[ei];
      const descLines = doc.splitTextToSize(event.description || "", DESC_W) as string[];
      const rowH = descLines.length * LH10 + 5;
      checkBreak(rowH);
      const rowY = y;
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      if (event.date) {
        t("#0f6e56");
        const dls = doc.splitTextToSize(event.date, DATE_W - 2) as string[];
        let dy = rowY;
        for (const dl of dls) { doc.text(dl, MX, dy); dy += LH9; }
      } else { t("#aaaaaa"); doc.text("—", MX, rowY); }
      f("#0f6e56"); doc.ellipse(DOT_X, rowY - 1.5, 1.5, 1.5, "F");
      if (ei < pack.timeline.length - 1) { d("#0f6e56"); lw(0.4); doc.line(DOT_X, rowY + 1, DOT_X, rowY + rowH - 1); }
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); t("#3c3c3c");
      let ey = rowY;
      for (const dl of descLines) { doc.text(dl, DESC_X, ey); ey += LH10; }
      y += rowH;
    }
    y += 2;
  }

  /* ── SECTION 3: LEGAL CONTEXT ── */
  sectionLabel(3, "Relevant UK Law");
  const legalLines = doc.splitTextToSize(pack.legalContext || "", CW - 10) as string[];
  const legalH = legalLines.length * LH10 + 10;
  checkBreak(legalH);
  f("#e8f4f0"); d("#c3e0d8"); lw(0.5); doc.rect(MX, y, CW, legalH, "DF");
  y += 5; doc.setFont("helvetica", "normal"); doc.setFontSize(10); t("#1c3a31");
  for (const ll of legalLines) { doc.text(ll, MX + 5, y); y += LH10; }
  y += 5;

  /* ── SECTION 4: KEY FACTS ── */
  if (pack.keyFacts && pack.keyFacts.length > 0) {
    sectionLabel(4, "Key Facts");
    for (let i = 0; i < pack.keyFacts.length; i++) {
      const factLines = doc.splitTextToSize(pack.keyFacts[i] || "", CW - 14) as string[];
      const rowH = factLines.length * LH10 + 5;
      checkBreak(rowH);
      f("#0f6e56"); doc.roundedRect(MX, y - 4.5, 7.5, 6, 1.2, 1.2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); t("#ffffff");
      doc.text(String(i + 1), MX + 3.75, y - 0.5, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); t("#3c3c3c");
      let fy = y;
      for (const fl of factLines) { doc.text(fl, MX + 11, fy); fy += LH10; }
      y += rowH;
    }
  }

  /* ── SECTION 5: QUESTIONS ── */
  if (pack.questionsForSolicitor && pack.questionsForSolicitor.length > 0) {
    sectionLabel(5, "Questions to Ask Your Solicitor");
    doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); t("#8c8c8c");
    doc.text("Tick each question as you cover it during your appointment.", MX, y);
    y += 7;
    for (let i = 0; i < pack.questionsForSolicitor.length; i++) {
      const qLines = doc.splitTextToSize(pack.questionsForSolicitor[i] || "", CW - 18) as string[];
      const rowH = qLines.length * LH10 + 6;
      checkBreak(rowH);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); t("#0f6e56");
      doc.text(`${i + 1}.`, MX, y);
      d("#555555"); lw(0.55); doc.rect(MX + 7, y - 3.8, 5, 5); lw(0.3);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); t("#3c3c3c");
      let qy = y;
      for (const ql of qLines) { doc.text(ql, MX + 16, qy); qy += LH10; }
      y += rowH;
    }
  }

  /* ── SECTION 6: DOCUMENTS ── */
  if (pack.documentsToGather && pack.documentsToGather.length > 0) {
    sectionLabel(6, "Documents to Bring");
    doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); t("#8c8c8c");
    doc.text("Tick each item as you collect it before your appointment.", MX, y);
    y += 7;
    for (let i = 0; i < pack.documentsToGather.length; i++) {
      const dLines = doc.splitTextToSize(pack.documentsToGather[i] || "", CW - 14) as string[];
      const rowH = dLines.length * LH9 + 5;
      checkBreak(rowH);
      d("#555555"); lw(0.55); doc.rect(MX, y - 3.5, 4.8, 4.8); lw(0.3);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); t("#3c3c3c");
      let dy2 = y;
      for (const dl of dLines) { doc.text(dl, MX + 8, dy2); dy2 += LH9; }
      y += rowH;
    }
  }

  /* ── SECTION 7: URGENT ACTIONS ── */
  if (pack.urgentActions && pack.urgentActions.length > 0) {
    sectionLabel(7, "Urgent Actions");
    const urgGroups = pack.urgentActions.map((a) => doc.splitTextToSize(a || "", CW - 18) as string[]);
    const boxH = urgGroups.reduce((s, ls) => s + ls.length * LH10 + 6, 0) + 12;
    checkBreak(boxH);
    f("#fef2f2"); d("#dc2626"); lw(1.0); doc.rect(MX, y, CW, boxH, "DF"); lw(0.3);
    y += 7;
    for (let i = 0; i < pack.urgentActions.length; i++) {
      const aLines = urgGroups[i];
      const rowH = aLines.length * LH10 + 6;
      f("#dc2626"); doc.ellipse(MX + 4.5, y - 1.5, 3.5, 3.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); t("#ffffff");
      doc.text(String(i + 1), MX + 4.5, y + 0.8, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); t("#7f1d1d");
      let ay = y;
      for (const al of aLines) { doc.text(al, MX + 12, ay); ay += LH10; }
      y += rowH;
    }
    y += 4;
  }

  /* ── HEADERS + FOOTERS ── */
  const totalPages = doc.getNumberOfPages();
  const shortTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    hline(FTR_LINE, "#dcd7d0", 0.3);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); t("#8c8c8c");
    doc.text("Generated by LegalClear UK — Legal information only, not regulated legal advice", PW / 2, FTR_TEXT, { align: "center" });
    if (p === 1) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); t("#aaaaaa");
      doc.text(`Page 1 of ${totalPages}`, PW - MX, 10, { align: "right" });
    } else {
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); t("#3c3c3c");
      doc.text(shortTitle, MX, 11);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); t("#0f6e56");
      doc.text(`Page ${p} of ${totalPages}`, PW - MX, 11, { align: "right" });
      hline(HDR_LINE, "#dcd7d0", 0.3);
    }
  }

  /* ── SAVE ── */
  const slug = title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 45);
  const today = new Date().toISOString().split("T")[0];
  doc.save(`LegalClear-SolicitorPack-${slug}-${today}.pdf`);
}
