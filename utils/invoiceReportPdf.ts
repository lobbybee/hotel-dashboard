import jsPDF from 'jspdf';
import { loadLogo } from '~/utils/invoicePdf';
import { formatDateTimeCompactInHotelTz } from '~/utils/dateFormat';
import type { Invoice } from '~/composables/useInvoices';

const money = (x: number | string | null | undefined): string => `Rs ${(Number(x) || 0).toFixed(2)}`;
const guestName = (inv: Invoice) => inv.line_items?.[0]?.guest_names?.[0] || '—';

interface ReportMeta {
  hotelName?: string;
  logoUrl?: string | null;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Render a period invoice report (all invoices for the active filters) to a jsPDF document.
 * One row per invoice with a grand total. Caller decides .save() / filename.
 */
export const generateInvoiceReportPdf = async (invoices: Invoice[], meta: ReportMeta = {}): Promise<jsPDF> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 20;

  // Logo (centered, capped at 18mm tall / 45mm wide, aspect preserved)
  if (meta.logoUrl) {
    const logo = await loadLogo(meta.logoUrl);
    if (logo) {
      const scale = Math.min(45 / logo.w, 18 / logo.h);
      const w = logo.w * scale, h = logo.h * scale;
      pdf.addImage(logo.dataUrl, (pageWidth - w) / 2, y, w, h);
      y += h + 6;
    }
  }

  // Title + period
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(meta.hotelName || 'Invoice Report'), pageWidth / 2, y, { align: 'center' });
  y += 7;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Invoice Report', pageWidth / 2, y, { align: 'center' });
  if (meta.dateFrom || meta.dateTo) {
    y += 6;
    pdf.setFontSize(10);
    pdf.setTextColor(110);
    pdf.text(`Period: ${meta.dateFrom || '—'}  to  ${meta.dateTo || '—'}`, pageWidth / 2, y, { align: 'center' });
    pdf.setTextColor(0);
  }

  // Column layout (x positions in mm)
  const cols = {
    invoice: 20,
    guest: 62,
    created: 112,
    status: 150,
    total: pageWidth - 20 // right-aligned
  };

  const header = () => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Invoice #', cols.invoice, y);
    pdf.text('Guest', cols.guest, y);
    pdf.text('Created', cols.created, y);
    pdf.text('Status', cols.status, y);
    pdf.text('Total', cols.total, y, { align: 'right' });
    y += 2;
    pdf.setLineWidth(0.3);
    pdf.line(20, y, pageWidth - 20, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
  };

  // truncate text to fit a column width
  const fit = (text: string, maxW: number) => {
    let t = String(text ?? '');
    while (t && pdf.getTextWidth(t) > maxW) t = t.slice(0, -1);
    return t.length < String(text ?? '').length ? t.slice(0, -1) + '…' : t;
  };

  y += 8;
  header();
  pdf.setFontSize(9);

  let grandTotal = 0;
  (invoices || []).forEach((inv) => {
    if (y > pageHeight - 30) { pdf.addPage(); y = 20; header(); pdf.setFontSize(9); }
    grandTotal += Number(inv.total_amount) || 0;
    pdf.text(fit(inv.invoice_number || '—', 38), cols.invoice, y);
    pdf.text(fit(guestName(inv), 46), cols.guest, y);
    pdf.text(fit(inv.created_at ? formatDateTimeCompactInHotelTz(inv.created_at) : '—', 34), cols.created, y);
    pdf.text(inv.is_locked ? 'Locked' : 'Open', cols.status, y);
    pdf.text(money(inv.total_amount), cols.total, y, { align: 'right' });
    y += 6;
  });

  // Grand total
  y += 2;
  pdf.setLineWidth(0.5);
  pdf.line(20, y, pageWidth - 20, y);
  y += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(`Invoices: ${invoices.length}`, cols.invoice, y);
  pdf.text(`Grand total: ${money(grandTotal)}`, cols.total, y, { align: 'right' });

  return pdf;
};
