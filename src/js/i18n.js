const DICT = {
  en: {
    'meta.title': 'Presentation',
    'ui.themeDark': 'Dark',
    'ui.themeLight': 'Light',
    'ui.pdf': 'PDF',
    'ui.printHint':
      'Print: turn off “Headers and footers” (removes the URL) and pick Color instead of black & white if you want gold and backgrounds.',
    'logo.overview': 'Open slide overview',
    'logo.closeOverview': 'Close slide overview — return to previous slide',
  },
  pl: {
    'meta.title': 'Prezentacja',
    'ui.themeDark': 'Ciemny',
    'ui.themeLight': 'Jasny',
    'ui.pdf': 'PDF',
    'ui.printHint':
      'Druk: wyłącz „Nagłówki i stopki” (zniknie adres URL) i wybierz Kolor zamiast czarno-białego, jeśli chcesz złoto i tła.',
    'logo.overview': 'Otwórz przegląd slajdów',
    'logo.closeOverview': 'Zamknij mapę slajdów — powrót do poprzedniego widoku',
  },
};

const STORAGE_KEY = 'reveal-deck-lang';

export function getStoredLang() {
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage === 'en' || fromStorage === 'pl') return fromStorage;
  const nav = navigator.language || 'en';
  return nav.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

export function setLang(lang) {
  const next = lang === 'pl' ? 'pl' : 'en';
  document.documentElement.setAttribute('data-lang', next);
  document.documentElement.lang = next === 'pl' ? 'pl' : 'en';
  localStorage.setItem(STORAGE_KEY, next);
  applyDomTranslations(next);
  return next;
}

export function toggleLang() {
  const current = document.documentElement.getAttribute('data-lang') === 'pl' ? 'pl' : 'en';
  return setLang(current === 'pl' ? 'en' : 'pl');
}

export function applyDomTranslations(lang) {
  const t = DICT[lang] || DICT.en;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && t[key]) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (key && t[key]) el.setAttribute('aria-label', t[key]);
  });

  const chromeLogo = document.querySelector('.ui-brand .js-deck-logo');
  if (chromeLogo) {
    const inOverview = document.querySelector('.reveal')?.classList.contains('overview');
    const key = inOverview ? 'logo.closeOverview' : 'logo.overview';
    if (t[key]) chromeLogo.setAttribute('aria-label', t[key]);
  }
}

export function getThemeLabel(isDark, lang) {
  const l = lang === 'pl' ? 'pl' : 'en';
  return isDark ? DICT[l]['ui.themeDark'] : DICT[l]['ui.themeLight'];
}
