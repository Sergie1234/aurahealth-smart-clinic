/**
 * High-Fidelity Real-Time Document Printing Utility
 * Handles instant browser print dialog triggering, document titles for PDF export,
 * and DOM isolation across desktop, tablet, and mobile browsers.
 */

export interface PrintDocumentOptions {
  title: string;
  isDark?: boolean;
  documentType: 'prescription' | 'receipt' | 'lab_report';
  htmlContent?: string;
}

/**
 * Triggers real-time printing using the browser's native print engine.
 * Sets document title for automatic PDF export naming and activates document print isolation.
 */
export function triggerRealtimePrint(options: PrintDocumentOptions): boolean {
  const originalTitle = document.title;
  if (options.title) {
    document.title = options.title;
  }

  // Add printing state class to documentElement for instant CSS isolation
  document.documentElement.classList.add('is-printing-document');
  document.body.classList.add('is-printing-document');

  const cleanup = () => {
    document.documentElement.classList.remove('is-printing-document');
    document.body.classList.remove('is-printing-document');
    document.title = originalTitle;
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup, { once: true });

  try {
    window.focus();
    window.print();
    return true;
  } catch (err) {
    console.warn('Native window.print() error:', err);
    cleanup();
    return false;
  } finally {
    // Fallback timer cleanup for environments where afterprint event is delayed
    setTimeout(cleanup, 1000);
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
