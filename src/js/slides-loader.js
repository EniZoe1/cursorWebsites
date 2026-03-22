/**
 * Loads slide fragments from /slides/*.html (Vite raw imports) in sorted order.
 */
const modules = import.meta.glob('../../slides/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function naturalSortPaths(paths) {
  return [...paths].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );
}

export function injectSlides(container) {
  if (!container) return;

  const paths = naturalSortPaths(Object.keys(modules));
  let html = paths.map((p) => modules[p]).join('\n');
  const base = import.meta.env.BASE_URL;
  html = html.replace(/src="logo\.svg"/g, `src="${base}logo.svg"`);
  container.innerHTML = html;
}
