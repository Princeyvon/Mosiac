import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Order } from '../types';

export interface ExportPdfResult {
  success: boolean;
  error?: string;
}

/**
 * Exports the official digital receipt card to a crisp, high-resolution PDF file.
 * Preserves the obsidian atelier header, gold & emerald accents, line items,
 * financial totals, authentic barcode, QR code, and transit pass details.
 */
export async function exportReceiptToPdf(
  receiptElement: HTMLElement,
  order: Order
): Promise<ExportPdfResult> {
  try {
    // Ensure all images within the receipt element have crossOrigin set to anonymous
    const images = receiptElement.querySelectorAll('img');
    images.forEach(img => {
      if (!img.crossOrigin) {
        img.crossOrigin = 'anonymous';
      }
    });

    // Wait for any pending images to complete loading
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve on error so PDF still generates
        });
      })
    );

    // Capture using html2canvas at scale 2 for retina / print-grade sharpness
    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Find cloned receipt card in the cloned document
        const clonedCard = clonedDoc.querySelector('#printable-receipt-card') as HTMLElement | null;
        if (clonedCard) {
          clonedCard.style.boxShadow = 'none';
          clonedCard.style.margin = '0 auto';
          clonedCard.style.transform = 'none';
          clonedCard.style.width = '100%';
          clonedCard.style.maxWidth = '540px';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Standard A4 dimensions in mm: 210 x 297
    const pdfPageWidth = 210;
    const pdfPageHeight = 297;

    // Calculate scaling to center the receipt neatly on an A4 page with margins
    const marginMm = 15;
    const printableWidth = pdfPageWidth - marginMm * 2; // 180mm
    const calculatedHeight = (canvasHeight * printableWidth) / canvasWidth;

    // If receipt height exceeds single A4 page, adjust page height to fit single seamless pass
    // or use multi-page / proportional format
    let pdf: jsPDF;

    if (calculatedHeight + marginMm * 2 > pdfPageHeight) {
      // Create custom length page that fits the entire uninterrupted luxury pass
      const customPageHeight = calculatedHeight + marginMm * 2;
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfPageWidth, customPageHeight]
      });

      pdf.addImage(
        imgData,
        'PNG',
        marginMm,
        marginMm,
        printableWidth,
        calculatedHeight,
        undefined,
        'FAST'
      );
    } else {
      // Fits comfortably on standard A4 page
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const topOffset = Math.max(marginMm, (pdfPageHeight - calculatedHeight) / 2);
      pdf.addImage(
        imgData,
        'PNG',
        marginMm,
        topOffset,
        printableWidth,
        calculatedHeight,
        undefined,
        'FAST'
      );
    }

    // Set PDF document properties
    pdf.setProperties({
      title: `Mosiac Official Receipt & Transit Pass — ${order.id}`,
      subject: `Official Archival Textile Commission Receipt for ${order.customerName}`,
      author: 'Mosiac Atelier',
      keywords: 'Mosiac, Textile, Receipt, Transit Pass, Commission',
      creator: 'Mosiac Digital Archival Service'
    });

    const fileName = `Mosiac-Official-Receipt-${order.id}.pdf`;
    pdf.save(fileName);

    return { success: true };
  } catch (err: unknown) {
    console.error('Error generating PDF via html2canvas/jsPDF:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error generating PDF'
    };
  }
}
