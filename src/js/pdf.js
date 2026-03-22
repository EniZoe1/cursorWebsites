/**
 * Reveal PDF export: opens the same deck with ?print-pdf for stacked slide preview + browser print.
 * @see https://revealjs.com/pdf-export/
 */
export function openPrintPdfView() {
  const url = new URL(window.location.href);
  url.searchParams.set('print-pdf', '');
  window.location.assign(url.toString());
}
