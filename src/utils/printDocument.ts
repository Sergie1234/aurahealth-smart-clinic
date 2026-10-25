/**
 * High-Fidelity Real-Time Document Printing Utility
 * Handles browser print dialog triggering, document titles for PDF export,
 * and reliable print flow across desktop, tablet, and mobile browsers.
 */

export interface PrintDocumentOptions {
  title: string;
  isDark?: boolean;
  documentType: 'prescription' | 'receipt' | 'lab_report';
  htmlContent?: string;
}

/**
 * Triggers real-time printing using the browser's native print engine.
 * Sets document title for automatic PDF export naming and triggers window.print().
 */
export function triggerRealtimePrint(options: PrintDocumentOptions): boolean {
  const originalTitle = document.title;
  if (options.title) {
    document.title = options.title;
  }

  const cleanup = () => {
    document.title = originalTitle;
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup, { once: true });

  try {
    // Focus window before triggering print (crucial for iframe environments)
    if (typeof window !== 'undefined') {
      window.focus();
      window.print();
    }
    return true;
  } catch (err) {
    console.warn('Native window.print() exception:', err);
    cleanup();
    return false;
  }
}

/**
 * Backward compatibility wrapper
 */
export async function printHtmlViaIframe(
  _elementHtml: string,
  options: PrintDocumentOptions
): Promise<boolean> {
  return triggerRealtimePrint(options);
}
