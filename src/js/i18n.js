const DICT = {
  en: {
    'meta.title': 'Presentation',
    'ui.themeDark': 'Dark',
    'ui.themeLight': 'Light',
    'ui.pdf': 'PDF',
  },
  pl: {
    'meta.title': 'Prezentacja',
    'ui.themeDark': 'Ciemny',
    'ui.themeLight': 'Jasny',
    'ui.pdf': 'PDF',
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
}

export function getThemeLabel(isDark, lang) {
  const l = lang === 'pl' ? 'pl' : 'en';
  return isDark ? DICT[l]['ui.themeDark'] : DICT[l]['ui.themeLight'];
}
