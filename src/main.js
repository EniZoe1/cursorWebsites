import Reveal from 'reveal.js';
import RevealZoom from 'reveal.js/plugin/zoom/zoom.esm.js';

import 'reveal.js/dist/reveal.css';

import './styles/main.scss';
import './styles/print.scss';

import { injectSlides } from './js/slides-loader.js';
import {
  applyDomTranslations,
  getStoredLang,
  getThemeLabel,
  setLang,
  toggleLang,
} from './js/i18n.js';
import { getStoredTheme, isDarkTheme, setTheme, toggleTheme } from './js/theme.js';
import { openPrintPdfView } from './js/pdf.js';

const slidesRoot = document.getElementById('slides-container');
const btnTheme = document.getElementById('btn-theme');
const btnLang = document.getElementById('btn-lang');
const langLabel = document.getElementById('lang-label');
const themeLabel = document.getElementById('theme-label');
const btnPdf = document.getElementById('btn-pdf');

function syncThemeButton() {
  const dark = isDarkTheme();
  const lang = document.documentElement.getAttribute('data-lang') === 'pl' ? 'pl' : 'en';
  if (themeLabel) themeLabel.textContent = getThemeLabel(dark, lang);
  btnTheme?.setAttribute('aria-pressed', dark ? 'true' : 'false');
}

function syncLangButton() {
  const lang = document.documentElement.getAttribute('data-lang') === 'pl' ? 'pl' : 'en';
  if (langLabel) langLabel.textContent = lang.toUpperCase();
}

function initChrome() {
  setTheme(getStoredTheme());
  const lang = setLang(getStoredLang());
  applyDomTranslations(lang);
  syncThemeButton();
  syncLangButton();

  btnTheme?.addEventListener('click', () => {
    toggleTheme();
    syncThemeButton();
  });

  btnLang?.addEventListener('click', () => {
    const next = toggleLang();
    applyDomTranslations(next);
    syncThemeButton();
    syncLangButton();
  });

  btnPdf?.addEventListener('click', () => openPrintPdfView());
}

function bindDeckLogos(deck) {
  const openOverview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof deck.toggleOverview === 'function') deck.toggleOverview();
  };

  document.querySelectorAll('.js-deck-logo').forEach((el) => {
    el.addEventListener('click', openOverview);
  });

  const syncTitleSlide = () => {
    const { h, v } = deck.getIndices();
    document.body.classList.toggle('is-title-slide', h === 0 && v === 0);
  };

  deck.on('slidechanged', syncTitleSlide);
  syncTitleSlide();
}

async function boot() {
  initChrome();
  injectSlides(slidesRoot);

  const deck = new Reveal({
    hash: true,
    history: true,
    controls: true,
    progress: true,
    center: true,
    slideNumber: 'c/t',
    transition: 'slide',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    width: 1280,
    height: 720,
    margin: 0.08,
    minScale: 0.35,
    maxScale: 1.6,
    plugins: [RevealZoom],
  });

  await deck.initialize();
  bindDeckLogos(deck);
}

boot();
