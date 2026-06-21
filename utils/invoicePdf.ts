import jsPDF from 'jspdf';
import { formatDateOnlyInHotelTz } from '~/utils/dateFormat';
import type { Invoice } from '~/composables/useInvoices';

// Coerce string|number money (preview = number, saved invoice = string) to a Rs string. Never NaN.
const money = (x: number | string | null | undefined): string => `Rs ${(Number(x) || 0).toFixed(2)}`;

// Fetch a remote logo as a data URL + natural dimensions. Returns null on any failure (CORS, 404)
// so the PDF still renders without it.
export const loadLogo = async (url: string): Promise<{ dataUrl: string; w: number; h: number } | null> => {
  try {
    // S3 sends no CORS headers, so fetch through our same-origin proxy (server/api/logo.get.ts).
    const blob = await (await fetch(`/api/logo?url=${encodeURIComponent(url)}`)).blob();
    const dataUrl = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number } | null>((res) => {
      const img = new Image();
      img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => res(null);
      img.src = dataUrl;
    });
    return dims && dims.w ? { dataUrl, ...dims } : null;
  } catch {
    return null;
  }
};

/**
 * Render an invoice (preview or saved) to a jsPDF document. Caller decides .save() / filename.
 * Shared by the checkout dialog and the billing detail dialog.
 * Pass logoUrl (from the hotel record) to print the logo above the header.
 */
export const generateInvoicePdf = async (data: Invoice, logoUrl?: string | null): Promise<jsPDF> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 20;

  const hotel = data.booking_details?.hotel || {};
  const guest = data.booking_details?.guest;

  // Logo (centered, capped at 22mm tall / 50mm wide, aspect preserved)
  if (logoUrl) {
    const logo = await loadLogo(logoUrl);
    if (logo) {
      const maxH = 22, maxW = 50;
      const scale = Math.min(maxW / logo.w, maxH / logo.h);
      const w = logo.w * scale, h = logo.h * scale;
      pdf.addImage(logo.dataUrl, (pageWidth - w) / 2, y, w, h);
      y += h + 6;
    }
  }

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(hotel.name || 'TAX INVOICE'), pageWidth / 2, y, { align: 'center' });

  y += 8;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  if (data.invoice_number) {
    pdf.text(`Invoice: ${data.invoice_number}`, pageWidth / 2, y, { align: 'center' });
    y += 6;
  }
  pdf.text(`Date: ${formatDateOnlyInHotelTz(data.created_at || new Date())}`, pageWidth / 2, y, { align: 'center' });

  // Guest
  y += 14;
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To', 20, y);
  y += 7;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  if (guest) {
    pdf.text(`Name: ${guest.full_name}`, 20, y); y += 6;
    pdf.text(`WhatsApp: ${guest.whatsapp_number || 'N/A'}`, 20, y); y += 6;
    pdf.text(`Email: ${guest.email || 'Not provided'}`, 20, y); y += 6;
  }

  // Line items header
  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Room', 20, y);
  pdf.text('Nights', 105, y, { align: 'right' });
  pdf.text('Rate', 140, y, { align: 'right' });
  pdf.text('Amount', pageWidth - 20, y, { align: 'right' });
  y += 2;
  pdf.setLineWidth(0.3);
  pdf.line(20, y, pageWidth - 20, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  (data.line_items || []).forEach((li) => {
    if (y > pageHeight - 60) { pdf.addPage(); y = 20; }
    const label = `${li.room_type || 'Room'} - ${li.room_number || 'N/A'}`;
    pdf.text(label, 20, y);
    pdf.text(String(li.nights), 105, y, { align: 'right' });
    pdf.text(money(li.rate), 140, y, { align: 'right' });
    pdf.text(money(li.amount), pageWidth - 20, y, { align: 'right' });
    y += 6;
    // show base_price vs rate override delta when they differ
    if (Number(li.base_price) !== Number(li.rate)) {
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(`(base ${money(li.base_price)})`, 20, y);
      pdf.setTextColor(0);
      pdf.setFontSize(10);
      y += 5;
    }
  });

  // Totals
  y += 2;
  pdf.setLineWidth(0.5);
  pdf.line(20, y, pageWidth - 20, y);
  y += 8;
  pdf.setFontSize(11);
  const totalLine = (label: string, value: string, bold = false) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.text(label, pageWidth - 80, y);
    pdf.text(value, pageWidth - 20, y, { align: 'right' });
    y += 7;
  };
  totalLine('Subtotal:', money(data.subtotal));
  if (Number(data.discount_amount) > 0) totalLine('Discount:', `- ${money(data.discount_amount)}`);
  totalLine('GST:', money(data.gst_amount));
  pdf.setFontSize(12);
  totalLine('Total:', money(data.total_amount), true);

  // Footer
  y = pageHeight - 25;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your stay!', pageWidth / 2, y, { align: 'center' });

  return pdf;
};
