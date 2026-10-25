/**
 * High-Fidelity Real-Time Document Printing Utility
 * Handles isolated iframe printing, browser print dialogs, and downloadable print-ready documents.
 */

export interface PrintDocumentOptions {
  title: string;
  isDark: boolean;
  documentType: 'prescription' | 'receipt' | 'lab_report';
}

function getBaseStyles(isDark: boolean): string {
  const bg = isDark ? '#0b1120' : '#ffffff';
  const text = isDark ? '#f8fafc' : '#0f172a';
  const mutedText = isDark ? '#94a3b8' : '#475569';
  const subBg = isDark ? '#1e293b' : '#f8fafc';
  const border = isDark ? '#334155' : '#e2e8f0';
  const brandTeal = isDark ? '#14b8a6' : '#0d9488';
  const brandTealBg = isDark ? '#042f2e' : '#f0fdfa';

  return `
    @page {
      size: auto;
      margin: 10mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background-color: ${bg} !important;
      color: ${text} !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
    }
    .print-sheet {
      max-width: 800px;
      margin: 0 auto;
      padding: 16px 20px;
      background-color: ${bg};
      color: ${text};
    }
    .no-print {
      display: none !important;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background-color: ${subBg};
      color: ${mutedText};
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid ${border};
    }
    td {
      border-bottom: 1px solid ${border};
      font-size: 11px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-normal {
      background-color: ${isDark ? '#064e3b' : '#d1fae5'};
      color: ${isDark ? '#6ee7b7' : '#065f46'};
      border: 1px solid ${isDark ? '#047857' : '#a7f3d0'};
    }
    .badge-high {
      background-color: ${isDark ? '#4c0519' : '#ffe4e6'};
      color: ${isDark ? '#fda4af' : '#9f1239'};
      border: 1px solid ${isDark ? '#9f1239' : '#fecdd3'};
    }
    .badge-info {
      background-color: ${brandTealBg};
      color: ${brandTeal};
      border: 1px solid ${brandTeal};
    }
    .card-meta {
      background-color: ${subBg};
      border: 1px solid ${border};
      border-radius: 8px;
      padding: 12px 14px;
      margin: 12px 0;
    }
    .signature-line {
      border-top: 1px solid ${border};
      margin-top: 24px;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    @media print {
      body {
        background-color: ${bg} !important;
        color: ${text} !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
}

/**
 * Creates a standalone printable HTML document with embedded CSS.
 */
export function buildStandalonePrintHtml(
  elementHtml: string,
  options: PrintDocumentOptions
): string {
  const styles = getBaseStyles(options.isDark);
  return `<!DOCTYPE html>
<html lang="en" class="${options.isDark ? 'dark' : ''}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title} - Smart Clinic Healthcare</title>
  <style>
    ${styles}
  </style>
</head>
<body class="${options.isDark ? 'dark' : ''}">
  <div class="print-sheet">
    ${elementHtml}
  </div>
  <script>
    // Automatically trigger print on load if opened standalone
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 300);
    });
  </script>
</body>
</html>`;
}

/**
 * Triggers printing using a hidden sandbox-safe iframe, with fallback to window.print.
 */
export function printHtmlViaIframe(
  elementHtml: string,
  options: PrintDocumentOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const fullHtml = buildStandalonePrintHtml(elementHtml, options);

      // Find or create hidden printing iframe
      let iframe = document.getElementById('smartclinic-print-frame') as HTMLIFrameElement;
      if (iframe) {
        iframe.remove();
      }

      iframe = document.createElement('iframe');
      iframe.id = 'smartclinic-print-frame';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0.01';
      iframe.style.pointerEvents = 'none';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        throw new Error('Unable to access iframe document');
      }

      doc.open();
      doc.write(fullHtml);
      doc.close();

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          setTimeout(() => {
            iframe.contentWindow?.print();
            resolve(true);
          }, 150);
        } catch (err) {
          console.warn('Iframe print error, falling back to window.print:', err);
          document.body.classList.add('printing-active');
          window.focus();
          window.print();
          setTimeout(() => {
            document.body.classList.remove('printing-active');
          }, 600);
          resolve(true);
        }
      };

      // Fallback timeout in case onload does not fire
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {}
        resolve(true);
      }, 400);
    } catch (err) {
      console.error('Print utility error:', err);
      // Host window fallback
      document.body.classList.add('printing-active');
      window.focus();
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-active');
      }, 600);
      resolve(false);
    }
  });
}

/**
 * Downloads a standalone, self-printing HTML document file that can be opened or converted to PDF.
 */
export function downloadPrintDocument(
  elementHtml: string,
  fileName: string,
  options: PrintDocumentOptions
): void {
  try {
    const fullHtml = buildStandalonePrintHtml(elementHtml, options);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  } catch (err) {
    console.error('Failed to download document:', err);
  }
}
