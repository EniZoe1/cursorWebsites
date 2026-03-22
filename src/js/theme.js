const STORAGE_KEY = 'reveal-deck-theme';

export function getStoredTheme() {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'light' || v === 'dark') return v;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function setTheme(mode) {
  const next = mode === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  return setTheme(current === 'dark' ? 'light' : 'dark');
}

export function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') !== 'light';
}
