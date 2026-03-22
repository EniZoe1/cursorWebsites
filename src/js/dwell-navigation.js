/**
 * Directional dwell navigation: hold pointer near screen edges to navigate after a delay.
 * @param {object} deck - Initialized Reveal instance
 * @param {object} [options]
 */
export function initDwellNavigation(deck, options = {}) {
  const DWELL_MS = options.dwellMs ?? 800;
  const COOLDOWN_MS = options.cooldownMs ?? 1000;
  const thresholdPx = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Math.max(50, Math.round(Math.min(w, h) * 0.03));
  };

  const revealEl = document.querySelector('.reveal');
  if (!revealEl) return () => {};

  const cursorRoot = document.createElement('div');
  cursorRoot.className = 'dwell-cursor';
  cursorRoot.setAttribute('aria-hidden', 'true');
  cursorRoot.innerHTML = `
    <svg class="dwell-cursor__svg" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(18 18)">
        <circle class="dwell-cursor__track" cx="0" cy="0" r="15" fill="none" />
        <g class="dwell-cursor__progress-wrap" transform="rotate(-90)">
          <circle class="dwell-cursor__progress" cx="0" cy="0" r="15" fill="none" />
        </g>
      </g>
    </svg>
  `;
  document.body.appendChild(cursorRoot);

  const progressCircle = cursorRoot.querySelector('.dwell-cursor__progress');
  const R = 15;
  const C = 2 * Math.PI * R;
  progressCircle.setAttribute('stroke-dasharray', String(C));
  progressCircle.setAttribute('stroke-dashoffset', String(C));

  let dwellZone = null;
  let dwellStart = 0;
  let rafId = 0;
  let cooldownUntil = 0;

  let pendingX = 0;
  let pendingY = 0;
  let rafPointerId = 0;

  /** Print / PDF only — overview keeps cursor + dwell active */
  function isPrintPaused() {
    if (document.documentElement.classList.contains('print-pdf')) return true;
    if (document.documentElement.classList.contains('reveal-print')) return true;
    return false;
  }

  function isOverChrome(x, y) {
    const el = document.elementFromPoint(x, y);
    return el?.closest?.('.ui-chrome, .ui-brand');
  }

  const POINTER_ANCESTOR =
    'a[href], button, [role="button"], .ui-btn, .controls button, .js-deck-logo, .slide-title-logo, label[for], input[type="checkbox"], input[type="radio"], select, textarea';

  /** Zwraca 'gold' | 'accent' | 'default' albo null — pod kursorem jest element „pointer” */
  function getPointerVariant(el) {
    if (!el || el.classList?.contains('dwell-cursor')) return null;

    const interactive = el.closest(POINTER_ANCESTOR);

    if (interactive) {
      if (
        interactive.matches(':disabled') ||
        interactive.getAttribute('aria-disabled') === 'true'
      ) {
        return null;
      }
      if (
        interactive.matches('.slide-title-logo, .js-deck-logo') ||
        interactive.closest('.ui-brand')
      ) {
        return 'gold';
      }
      if (interactive.matches('.ui-btn--accent')) {
        return 'accent';
      }
      return 'default';
    }

    let n = el;
    for (let i = 0; i < 10 && n; i++) {
      const c = getComputedStyle(n).cursor;
      if (c === 'pointer' || c === 'grab') {
        return 'default';
      }
      n = n.parentElement;
    }
    return null;
  }

  function updatePointerCursorState(target) {
    const variant = getPointerVariant(target);
    cursorRoot.classList.toggle('dwell-cursor--pointer', !!variant);
    if (variant) {
      cursorRoot.setAttribute('data-dwell-variant', variant);
    } else {
      cursorRoot.removeAttribute('data-dwell-variant');
    }
  }

  function getEdgeZone(x, y) {
    const t = thresholdPx();
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (x < t) return 'left';
    if (x >= w - t) return 'right';
    if (y < t) return 'top';
    if (y >= h - t) return 'bottom';
    return null;
  }

  function setProgress(p) {
    const clamped = Math.max(0, Math.min(1, p));
    progressCircle.setAttribute('stroke-dashoffset', String(C * (1 - clamped)));
  }

  function setLoadingState(active) {
    cursorRoot.classList.toggle('dwell-cursor--loading', active);
  }

  function resetProgress() {
    dwellZone = null;
    dwellStart = 0;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    setProgress(0);
    setLoadingState(false);
  }

  function executeNav(zone) {
    if (typeof deck.next !== 'function') return;
    switch (zone) {
      case 'right':
        deck.next();
        break;
      case 'left':
        deck.prev();
        break;
      case 'top':
        deck.up();
        break;
      case 'bottom':
        deck.down();
        break;
      default:
        break;
    }
  }

  function tick() {
    if (isPrintPaused()) {
      resetProgress();
      return;
    }

    if (Date.now() < cooldownUntil) {
      resetProgress();
      return;
    }

    if (!dwellZone) {
      setProgress(0);
      return;
    }

    const elapsed = Date.now() - dwellStart;
    const p = elapsed / DWELL_MS;
    setProgress(p);

    if (p >= 1) {
      executeNav(dwellZone);
      cooldownUntil = Date.now() + COOLDOWN_MS;
      resetProgress();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function handleDwellLogic(x, y) {
    const target = document.elementFromPoint(x, y);
    const overReveal = !!target?.closest?.('.reveal');
    cursorRoot.classList.toggle('dwell-cursor--hidden', !overReveal);

    if (!overReveal || isPrintPaused()) {
      cursorRoot.classList.remove('dwell-cursor--pointer');
      cursorRoot.removeAttribute('data-dwell-variant');
      resetProgress();
      return;
    }

    updatePointerCursorState(target);

    if (isOverChrome(x, y)) {
      cursorRoot.classList.remove('dwell-cursor--pointer');
      cursorRoot.removeAttribute('data-dwell-variant');
      resetProgress();
      return;
    }

    if (Date.now() < cooldownUntil) {
      resetProgress();
      return;
    }

    const z = getEdgeZone(x, y);

    if (z !== dwellZone) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      setProgress(0);
      dwellZone = z;
      dwellStart = z ? Date.now() : 0;
      setLoadingState(!!z);
      if (z) {
        rafId = requestAnimationFrame(tick);
      }
    }
  }

  function flushPointerFrame() {
    rafPointerId = 0;
    cursorRoot.style.setProperty('--dwell-x', `${pendingX}px`);
    cursorRoot.style.setProperty('--dwell-y', `${pendingY}px`);
    handleDwellLogic(pendingX, pendingY);
  }

  function onMove(e) {
    pendingX = e.clientX;
    pendingY = e.clientY;
    if (!rafPointerId) {
      rafPointerId = requestAnimationFrame(flushPointerFrame);
    }
  }

  function onLeave() {
    resetProgress();
    cursorRoot.classList.add('dwell-cursor--hidden');
  }

  function onResize() {
    resetProgress();
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave, true);
  window.addEventListener('blur', onLeave);
  window.addEventListener('resize', onResize, { passive: true });

  const onOverview = () => resetProgress();
  deck.addEventListener('overviewshown', onOverview);
  deck.addEventListener('overviewhidden', onOverview);

  return function destroyDwellNavigation() {
    window.removeEventListener('mousemove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave, true);
    window.removeEventListener('blur', onLeave);
    window.removeEventListener('resize', onResize);
    deck.removeEventListener('overviewshown', onOverview);
    deck.removeEventListener('overviewhidden', onOverview);
    if (rafPointerId) cancelAnimationFrame(rafPointerId);
    resetProgress();
    cursorRoot.remove();
  };
}
