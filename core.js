/* ==========================================================================
   core.js — Birthday Notepad shared foundation
   MUST load first. Every other file (left pages, settings modules, tabs)
   depends on the functions defined here.

   This file provides the "room" for incoming files to plug into:
     dvRegisterLeftPage({id, label, html})         -> hamburger menu page
     dvRegisterSettingsModule({id, title, render}) -> settings panel section
     dvRegisterTab({id, label, icon, render})      -> bottom-nav tab + panel

   Call dvRegisterX(...) at the top level of your file (no wrapper needed).
   Order matters only where a file explicitly says it depends on another
   (e.g. planner.js depends on note.js).
   ========================================================================== */

const dvId = id => document.getElementById(id);

/* ---------- Toast (the ONLY notification mechanism in this app) ---------- */
const dvToastEl = dvId('dvToast');
let dvToastTimer = null;
const dvShow = (text, type) => {
  clearTimeout(dvToastTimer);
  dvToastEl.textContent = text;
  dvToastEl.className = 'dv-toast show' + (type ? ' dv-' + type : '');
  dvToastTimer = setTimeout(() => { dvToastEl.classList.remove('show'); }, 2200);
};

/* ---------- Centered spinner (used app-wide, e.g. every Dictionary search) ---------- */
const dvSpinnerWrap = dvId('dvSpinnerWrap');
const dvShowSpinner = () => dvSpinnerWrap.classList.add('show');
const dvHideSpinner = () => dvSpinnerWrap.classList.remove('show');

/* ---------- Generic confirm modal (replaces window.confirm everywhere) ---------- */
const dvModalWrap = dvId('dvModalWrap');
const dvModalTitle = dvId('dvModalTitle');
const dvModalMessage = dvId('dvModalMessage');
const dvModalOk = dvId('dvModalOk');
const dvModalCancel = dvId('dvModalCancel');
const dvModalActions = dvId('dvModalActions');
const dvModalBackdrop = dvId('dvModalBackdrop');
let dvModalResolve = null;

const dvModalOpen = (title, message, { okText = 'OK', cancelText = 'Cancel', confirm = false } = {}) =>
  new Promise(resolve => {
    dvModalResolve = resolve;
    dvModalTitle.textContent = title;
    dvModalMessage.textContent = message;
    dvModalOk.textContent = okText;
    dvModalCancel.textContent = cancelText;
    dvModalCancel.style.display = confirm ? '' : 'none';
    dvModalOk.className = 'dv-btn ' + (confirm ? 'dv-fill-danger' : 'dv-primary');
    dvModalCancel.className = 'dv-btn dv-fill-black';
    dvModalActions.classList.toggle('single', !confirm);
    dvModalWrap.classList.add('open');
    dvModalOk.focus();
  });

const dvModalClose = result => {
  dvModalWrap.classList.remove('open');
  if (dvModalResolve) { dvModalResolve(result); dvModalResolve = null; }
};
dvModalOk.onclick = () => dvModalClose(true);
dvModalCancel.onclick = () => dvModalClose(false);
dvModalBackdrop.onclick = () => dvModalClose(false);
const dvConfirm = (message, title = 'Confirm') => dvModalOpen(title, message, { confirm: true });

/* ---------- Theme ---------- */
const dvIconMoon = '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const dvIconSun = '<svg class="dv-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/></g></svg>';

const dvThemeMeta = dvId('dvThemeMeta');

const dvApplyTheme = t => {
  document.documentElement.setAttribute('data-dv-theme', t);
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--dv-p').trim();
  dvThemeMeta.setAttribute('content', t === 'dark' ? '#1a1d23' : (accent || '#1877F2'));
  const liveSwitch = document.getElementById('dvDarkSwitch');
  if (liveSwitch) {
    liveSwitch.classList.toggle('on', t === 'dark');
    liveSwitch.setAttribute('aria-checked', t === 'dark');
  }
  try { localStorage.setItem('dv-theme', t); } catch {}
};
const dvToggleTheme = () => {
  const cur = document.documentElement.getAttribute('data-dv-theme') || 'light';
  dvApplyTheme(cur === 'dark' ? 'light' : 'dark');
};

/* ---------- Accent color (applied here; the swatch UI itself lives in accent-color-selector.js) ---------- */
const dvApplyAccent = hex => {
  document.documentElement.style.setProperty('--dv-p', hex);
  const dark = document.documentElement.getAttribute('data-dv-theme') === 'dark';
  dvThemeMeta.setAttribute('content', dark ? '#1a1d23' : hex);
  try { localStorage.setItem('dv-accent', hex); } catch {}
  document.querySelectorAll('.dv-swatch').forEach(s => s.classList.toggle('active', s.dataset.hex === hex));
};

/* ---------- Font family / size (applied here; UI lives in font-selector.js / font-slider.js) ---------- */
const dvApplyFont = family => {
  document.documentElement.style.setProperty('--dv-font', family);
  try { localStorage.setItem('dv-font', family); } catch {}
};
const dvApplyFontSize = px => {
  document.documentElement.style.setProperty('--dv-min', px + 'px');
  try { localStorage.setItem('dv-font-size', px); } catch {}
};

/* ---------- Color parsing helper (hex OR CSS color name), reused by any color field ---------- */
const dvColorProbe = document.createElement('div');
dvColorProbe.style.display = 'none';
document.body.appendChild(dvColorProbe);
const dvRgbToHex = rgb => {
  const m = rgb.match(/\d+/g);
  if (!m) return null;
  return '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
};
const dvResolveColor = input => {
  const v = (input || '').trim();
  if (!v) return null;
  dvColorProbe.style.color = '';
  dvColorProbe.style.color = v;
  if (!dvColorProbe.style.color) return null;
  return dvRgbToHex(getComputedStyle(dvColorProbe).color);
};

/* ---------- Left hamburger menu (list + drill-down pages) ---------- */
const dvLeftMenu = dvId('dvLeftMenu');
const dvHamburgerBtn = dvId('dvHamburgerBtn');
const dvLeftList = dvId('dvLeftList');
const dvLeftPagesContainer = dvId('dvLeftPagesContainer');
const dvLeftBackBtn = dvId('dvLeftBackBtn');
const dvLeftCloseBtn = dvId('dvLeftCloseBtn');
const dvLeftMenuTitle = dvId('dvLeftMenuTitle');

/** Call this from any left-page file, e.g. about-us.js, contact.js, etc.
 *  { id: 'contact', label: 'Contact', html: '<p>...</p>' } */
const dvRegisterLeftPage = ({ id, label, html }) => {
  const btn = document.createElement('button');
  btn.className = 'dv-side-item';
  btn.dataset.page = id;
  btn.textContent = label;
  btn.onclick = () => dvShowLeftPage(id, label);
  dvLeftList.appendChild(btn);

  const page = document.createElement('div');
  page.className = 'dv-info-page dv-hidden';
  page.dataset.page = id;
  page.innerHTML = html;
  dvLeftPagesContainer.appendChild(page);
};

const dvShowLeftList = () => {
  dvLeftList.classList.remove('dv-hidden');
  dvLeftPagesContainer.querySelectorAll('.dv-info-page').forEach(p => p.classList.add('dv-hidden'));
  dvLeftBackBtn.classList.add('dv-hidden');
  dvLeftMenuTitle.textContent = 'Menu';
};
const dvShowLeftPage = (id, label) => {
  const page = dvLeftPagesContainer.querySelector('.dv-info-page[data-page="' + id + '"]');
  if (!page) return;
  dvLeftList.classList.add('dv-hidden');
  dvLeftPagesContainer.querySelectorAll('.dv-info-page').forEach(p => p.classList.add('dv-hidden'));
  page.classList.remove('dv-hidden');
  dvLeftBackBtn.classList.remove('dv-hidden');
  dvLeftMenuTitle.textContent = label || 'Menu';
};
const dvOpenLeftMenu = () => { dvShowLeftList(); dvLeftMenu.classList.add('open'); };
const dvCloseLeftMenu = () => dvLeftMenu.classList.remove('open');
dvHamburgerBtn.onclick = dvOpenLeftMenu;
dvLeftCloseBtn.onclick = dvCloseLeftMenu;
dvLeftBackBtn.onclick = dvShowLeftList;

/* ---------- Right settings sidebar (each module renders its own section) ---------- */
const dvSettingsSidebar = dvId('dvSettingsSidebar');
const dvDotsBtn = dvId('dvDotsBtn');
const dvSettingsCloseBtn = dvId('dvSettingsCloseBtn');
const dvSettingsBody = dvId('dvSettingsBody');
const dvOpenSettings = () => dvSettingsSidebar.classList.add('open');
const dvCloseSettings = () => dvSettingsSidebar.classList.remove('open');
dvDotsBtn.onclick = dvOpenSettings;
dvSettingsCloseBtn.onclick = dvCloseSettings;
dvId('dvSettingsBackdrop').onclick = dvCloseSettings;

/** Call this from any settings-module file, e.g. dark-mode-toggle.js.
 *  { id: 'dark-mode', title: 'Dark Mode', render(sectionEl) { ... } } */
const dvRegisterSettingsModule = ({ id, title, render }) => {
  const section = document.createElement('div');
  section.className = 'dv-settings-section';
  section.dataset.module = id;
  if (title) {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    section.appendChild(h3);
  }
  dvSettingsBody.appendChild(section);
  render(section);
};

/* ---------- Bottom nav + tabs (each tab file renders its own panel) ---------- */
const dvBottomNav = dvId('dvBottomNav');
const dvTabContainer = dvId('dvTabContainer');
const dvFab = dvId('dvFab');
let dvActiveTab = null;
const dvTabRegistry = {};

/** Call this from any tab file, e.g. home.js, note.js, dictionary.js, planner.js.
 *  { id:'dvTabNote', label:'Note', icon:'<svg>...</svg>', showFab:true, render(panelEl){...} } */
const dvRegisterTab = ({ id, label, icon, showFab = false, render }) => {
  const navBtn = document.createElement('button');
  navBtn.className = 'dv-navbtn';
  navBtn.dataset.tab = id;
  navBtn.innerHTML = icon + '<span>' + label + '</span>';
  navBtn.onclick = () => dvSwitchTab(id);
  dvBottomNav.appendChild(navBtn);

  const panel = document.createElement('div');
  panel.className = 'dv-tab-panel';
  panel.id = id;
  dvTabContainer.appendChild(panel);

  dvTabRegistry[id] = { showFab, navBtn, panel };
  render(panel);

  if (!dvActiveTab) dvSwitchTab(id);
};

const dvSwitchTab = id => {
  if (!dvTabRegistry[id]) return;
  dvActiveTab = id;
  Object.keys(dvTabRegistry).forEach(key => {
    dvTabRegistry[key].panel.classList.toggle('active', key === id);
    dvTabRegistry[key].navBtn.classList.toggle('active', key === id);
  });
  dvFab.classList.toggle('dv-hidden', !dvTabRegistry[id].showFab);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.dispatchEvent(new CustomEvent('dv-tab-changed', { detail: { id } }));
};

/* ---------- Restore persisted appearance on load, register service worker ---------- */
const dvBoot = () => {
  let theme = '', accent = '', font = '', fontSize = '';
  try {
    theme = localStorage.getItem('dv-theme') || '';
    accent = localStorage.getItem('dv-accent') || '';
    font = localStorage.getItem('dv-font') || '';
    fontSize = localStorage.getItem('dv-font-size') || '';
  } catch {}
  dvApplyTheme(theme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  dvApplyAccent(accent || '#1877F2');
  if (font) dvApplyFont(font);
  if (fontSize) dvApplyFontSize(fontSize);

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (dvModalWrap.classList.contains('open')) { dvModalClose(false); return; }
    if (dvSettingsSidebar.classList.contains('open')) { dvCloseSettings(); return; }
    if (dvLeftMenu.classList.contains('open')) { dvCloseLeftMenu(); return; }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
};
