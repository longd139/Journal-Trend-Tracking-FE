import { useState } from 'react';
import { Download, FileJson, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Export action buttons for report results.
 *
 * Two export options:
 * - Download JSON: raw data as .json file
 * - Export PDF: opens browser print dialog (Save as PDF) — uses native print
 *   engine which fully supports Tailwind v4 oklab/oklch color functions
 *
 * @param {object}           props
 * @param {React.RefObject}  props.contentRef  - Ref to the DOM element to print
 * @param {object}           props.jsonData    - Raw report data for JSON download
 * @param {string}           props.filename    - Base filename (without extension)
 * @param {string}           [props.accentColor]
 * @param {function}         [props.onSave]
 * @param {boolean}          [props.saving]
 */
export default function ExportButtons({
  contentRef,
  jsonData,
  filename,
  accentColor = 'var(--primary)',
  onSave,
  saving = false,
}) {
  const [pdfLoading, setPdfLoading] = useState(false);

  /** Download as JSON */
  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Export as PDF via browser's native print dialog.
   *
   * Creates a hidden iframe, clones the report content into it along with
   * all current page stylesheets (so Tailwind v4 oklab/oklch colors work),
   * then triggers the browser's print dialog where the user can "Save as PDF".
   */
  const handleExportPDF = async () => {
    const element = contentRef?.current;
    if (!element) {
      toast.error('Nothing to export — content not ready');
      return;
    }

    setPdfLoading(true);
    try {
      // 1. Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.title = filename;
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();

      // 2. Copy all current page stylesheets into the iframe
      //    This ensures Tailwind v4 classes (oklab/oklch/etc) render correctly
      const stylesheets = document.querySelectorAll(
        'style, link[rel="stylesheet"]'
      );
      let stylesHTML = '';
      stylesheets.forEach((sheet) => {
        stylesHTML += sheet.outerHTML;
      });

      // 3. Clone the report content
      const reportHTML = element.outerHTML;

      // 4. Write the full HTML document
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${filename}</title>
          ${stylesHTML}
          <style>
            /* Print-specific resets */
            @media print {
              @page { margin: 12mm; size: A4; }
              body {
                background: #101010 !important;
                color: #E1E0CC !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Ensure charts render correctly */
              .recharts-surface { max-width: 100%; }
              /* Avoid page breaks inside cards */
              .rounded-2xl, .rounded-xl { break-inside: avoid; }
            }
          </style>
        </head>
        <body style="background:#101010;color:#E1E0CC;font-family:Inter,sans-serif;padding:16px;">
          ${reportHTML}
        </body>
        </html>
      `);
      iframeDoc.close();

      // 5. Wait for iframe to fully load styles & fonts
      await new Promise((resolve) => {
        iframe.onload = resolve;
        // Fallback if onload doesn't fire
        setTimeout(resolve, 800);
      });

      // 6. Trigger print
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // 7. Clean up after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

      toast.success('Print dialog opened — choose "Save as PDF"');
    } catch (err) {
      console.error('Print export error:', err);
      toast.error('Export failed — try Download JSON instead');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 pt-2">
      {/* Download JSON */}
      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
      >
        <FileJson size={13} />
        Download JSON
      </button>

      {/* Export PDF — uses browser print dialog */}
      <button
        onClick={handleExportPDF}
        disabled={pdfLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
      >
        {pdfLoading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Opening print...
          </>
        ) : (
          <>
            <Printer size={13} />
            Export PDF
          </>
        )}
      </button>

      {/* Save to history (optional) */}
      {onSave && (
        <button
          onClick={() => onSave(jsonData)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          {saving ? 'Saving...' : 'Save Report'}
        </button>
      )}
    </div>
  );
}
