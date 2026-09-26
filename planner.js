/* ==========================================================================
   planner.js — requires core.js loaded ONLY. Fully independent of note.js:
   own IndexedDB store, own PIN modal, own workspace editor, own FAB.
   A real planner: Daily / Weekly / Yearly pages, each entry color-coded
   and lockable with its own 4-digit PIN — like a paper planner.
   ========================================================================== */

/* ---------- Inject this feature's own DOM (all IDs prefixed dvPlanner*, unique) ---------- */
document.body.insertAdjacentHTML('beforeend', `
<button class="dv-fab dv-hidden" id="dvPlannerFab" aria-label="New entry">
 <svg class="dv-icon" viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/></svg>
</button>

<div class="dv-fullmenu" id="dvPlannerWorkspace" role="dialog" aria-modal="true" aria-label="Planner entry">
 <div class="dv-fullmenu-head dv-fullmenu-head-accent">
  <button class="dv-close" id="dvPlannerBackBtn" aria-label="Back">
   <svg class="dv-icon" viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8 1.4-1.4L9.8 12l6.6-6.6z"/></svg>
  </button>
  <div class="dv-side-title" id="dvPlannerWorkspaceTitle">Entry</div>
  <button class="dv-save-btn" id="dvPlannerSaveBtn">
   <svg class="dv-icon" viewBox="0 0 24 24"><path d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 2v5h8V5H7zm0 8v6h10v-6H7z"/></svg>
   <span>SAVE</span>
  </button>
 </div>
 <div style="padding:12px 14px 0">
  <div id="dvPlannerColorRow" style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px"></div>
 </div>
 <div class="dv-toolbar-scroll" id="dvPlannerToolbar">
  <button class="dv-tool-icn" id="dvPlannerUndo"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M7 7H4V4H2v5a1 1 0 0 0 1 1h6V8H7c2-2.2 5.1-3.4 8.2-2.6 3.7 1 6 4.9 5 8.6-1 3.7-4.9 6-8.6 5-2.4-.6-4.3-2.4-5.1-4.6l-1.9.7c1 2.9 3.4 5.2 6.5 6 4.8 1.2 9.7-1.7 10.9-6.5S20.9 5 16.1 3.8C12.4 2.9 8.6 4.3 6.4 7z"/></svg><span>Undo</span></button>
  <button class="dv-tool-icn" id="dvPlannerRedo"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M17 7h3V4h2v5a1 1 0 0 1-1 1h-6V8h2c-2-2.2-5.1-3.4-8.2-2.6-3.7 1-6 4.9-5 8.6 1 3.7 4.9 6 8.6 5 2.4-.6 4.3-2.4 5.1-4.6l1.9.7c-1 2.9-3.4 5.2-6.5 6-4.8 1.2-9.7-1.7-10.9-6.5S3.1 5 7.9 3.8C11.6 2.9 15.4 4.3 17.6 7z"/></svg><span>Redo</span></button>
  <button class="dv-tool-icn" id="dvPlannerZoomOut"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM7 9h6v2H7V9zm9.6 7.6 4.2 4.2-1.4 1.4-4.2-4.2z"/></svg><span>Zoom</span></button>
  <button class="dv-tool-icn" id="dvPlannerZoomIn"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM9 7h2v2h2v2h-2v2H9v-2H7V9h2V7zm7.6 9.6 4.2 4.2-1.4 1.4-4.2-4.2z"/></svg><span>Zoom</span></button>
  <button class="dv-tool-icn" id="dvPlannerClear"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm2 3h2v8H8V9zm6 0h2v8h-2V9z"/></svg><span>Clear</span></button>
  <button class="dv-tool-icn" id="dvPlannerLockBtn"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M12 2a4 4 0 0 1 4 4v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v3h4V6a2 2 0 0 0-2-2z"/></svg><span id="dvPlannerLockLabel">Lock</span></button>
  <button class="dv-tool-icn" id="dvPlannerDeleteBtn"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm2 3h2v8H8V9zm6 0h2v8h-2V9z"/></svg><span>Delete</span></button>
 </div>
 <textarea id="dvPlannerTextarea" class="dv-note-textarea" placeholder=""></textarea>
</div>

<div class="dv-modal-wrap" id="dvPlannerPinModalWrap">
 <div class="dv-modal-backdrop" id="dvPlannerPinBackdrop"></div>
 <div class="dv-modal">
  <h3 id="dvPlannerPinTitle">Set PIN</h3>
  <div class="dv-field" style="margin-top:0">
   <label for="dvPlannerPinInput" id="dvPlannerPinLabel">Choose a 4-digit PIN</label>
   <input id="dvPlannerPinInput" class="dv-input" type="tel" inputmode="numeric" maxlength="4" pattern="[0-9]*" placeholder="****" autocomplete="off" style="letter-spacing:8px;text-align:center">
  </div>
  <div class="dv-modal-actions" style="margin-top:16px">
   <button class="dv-btn dv-fill-black" id="dvPlannerPinCancelBtn">Cancel</button>
   <button class="dv-btn dv-fill-success" id="dvPlannerPinConfirmBtn">Save</button>
  </div>
 </div>
</div>
`);

/* ---------- IndexedDB: planner entries (own store, separate from note.js) ---------- */
const dvPlannerDBName = 'dv-planner', dvPlannerStore = 'entries';
let dvPlannerDB = null;
const dvPlannerOpenDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(dvPlannerDBName, 1);
  req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(dvPlannerStore)) db.createObjectStore(dvPlannerStore, { keyPath: 'id' }); };
  req.onsuccess = () => { dvPlannerDB = req.result; resolve(dvPlannerDB); };
  req.onerror = () => reject(req.error);
});
const dvPlannerAll = () => new Promise((resolve, reject) => {
  const tx = dvPlannerDB.transaction(dvPlannerStore, 'readonly');
  const req = tx.objectStore(dvPlannerStore).getAll();
  req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error);
});
const dvPlannerPut = entry => new Promise((resolve, reject) => {
  const tx = dvPlannerDB.transaction(dvPlannerStore, 'readwrite');
  tx.objectStore(dvPlannerStore).put(entry);
  tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
});
const dvPlannerDelete = id => new Promise((resolve, reject) => {
  const tx = dvPlannerDB.transaction(dvPlannerStore, 'readwrite');
  tx.objectStore(dvPlannerStore).delete(id);
  tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
});

/* ---------- Colors for entries ---------- */
const dvPlannerColors = ['#DC2626', '#EA580C', '#D97706', '#16A34A', '#0891B2', '#1877F2', '#7C3AED', '#DB2777'];

/* ---------- State ---------- */
let dvPlannerCache = [];
let dvPlannerPeriod = 'daily'; // 'daily' | 'weekly' | 'yearly'
let dvPlannerActiveId = null, dvPlannerZoom = 26, dvPlannerUndoStack = [], dvPlannerRedoStack = [], dvPlannerActiveColor = dvPlannerColors[5];
let dvPlannerListEl, dvPlannerEmptyEl, dvPlannerPeriodBtns;

const dvPlannerFmtDate = ts => { const d = new Date(ts); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const dvPlannerLabelFor = period => {
  const now = new Date();
  if (period === 'daily') return now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  if (period === 'weekly') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return 'Week of ' + start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' - ' + end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return String(now.getFullYear()) + ' Overview';
};

/* ---------- List rendering ---------- */
const dvPlannerRenderList = () => {
  dvPlannerListEl.innerHTML = '';
  const items = dvPlannerCache.filter(e => e.period === dvPlannerPeriod).sort((a, b) => b.updated - a.updated);
  dvPlannerEmptyEl.classList.toggle('dv-hidden', items.length > 0);
  const periodLabel = dvPlannerPeriod === 'daily' ? 'daily' : dvPlannerPeriod === 'weekly' ? 'weekly' : 'yearly';
  dvPlannerEmptyEl.querySelector('p').textContent = 'No ' + periodLabel + ' entries yet. Tap + to add one.';
  items.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'dv-note-row';
    row.style.borderLeft = '5px solid ' + (entry.color || dvPlannerColors[5]);
    const main = document.createElement('button');
    main.className = 'dv-note-row-main';
    const lockIcon = entry.pin ? '<svg class="dv-icon" style="width:15px;height:15px;vertical-align:-2px;margin-right:4px" viewBox="0 0 24 24"><path d="M12 2a4 4 0 0 1 4 4v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v3h4V6a2 2 0 0 0-2-2z"/></svg>' : '';
    main.innerHTML = '<strong>' + lockIcon + '</strong><span></span>';
    main.querySelector('strong').append(document.createTextNode(entry.title || 'Untitled'));
    main.querySelector('span').textContent = dvPlannerFmtDate(entry.updated);
    main.onclick = () => dvPlannerTryOpen(entry.id);
    row.appendChild(main);
    dvPlannerListEl.appendChild(row);
  });
};

const dvPlannerLoad = async () => {
  if (!dvPlannerDB) await dvPlannerOpenDB();
  dvPlannerCache = await dvPlannerAll();
  dvPlannerRenderList();
};

/* ---------- PIN (own, independent modal) ---------- */
let dvPlannerPinMode = null, dvPlannerPinUnlockResolve = null;
const dvPlannerPinModalWrap = dvId('dvPlannerPinModalWrap');
const dvPlannerOpenPin = mode => {
  dvPlannerPinMode = mode;
  dvId('dvPlannerPinInput').value = '';
  const title = dvId('dvPlannerPinTitle'), label = dvId('dvPlannerPinLabel'), btn = dvId('dvPlannerPinConfirmBtn');
  if (mode === 'set') { title.textContent = 'Set PIN'; label.textContent = 'Choose a 4-digit PIN'; btn.textContent = 'Save'; }
  else if (mode === 'remove') { title.textContent = 'Remove PIN'; label.textContent = 'Enter current PIN to remove'; btn.textContent = 'Remove'; }
  else { title.textContent = 'Enter PIN'; label.textContent = 'This entry is locked'; btn.textContent = 'Unlock'; }
  dvPlannerPinModalWrap.classList.add('open');
  dvId('dvPlannerPinInput').focus();
};
const dvPlannerClosePin = () => dvPlannerPinModalWrap.classList.remove('open');
dvId('dvPlannerPinCancelBtn').onclick = () => {
  dvPlannerClosePin();
  if (dvPlannerPinMode === 'unlock' && dvPlannerPinUnlockResolve) dvPlannerPinUnlockResolve(false);
  dvPlannerPinUnlockResolve = null;
};
dvId('dvPlannerPinBackdrop').onclick = () => dvId('dvPlannerPinCancelBtn').click();
dvId('dvPlannerPinConfirmBtn').onclick = async () => {
  const val = dvId('dvPlannerPinInput').value.trim();
  if (!/^\d{4}$/.test(val)) { dvShow('Enter exactly 4 digits.', 'error'); return; }
  const entry = dvPlannerCache.find(e => e.id === dvPlannerActiveId);
  if (!entry) return;
  if (dvPlannerPinMode === 'set') {
    entry.pin = val; entry.updated = Date.now();
    await dvPlannerPut(entry); dvPlannerClosePin(); dvShow('Locked with PIN.', 'success');
    dvId('dvPlannerLockLabel').textContent = 'Unlock';
  } else if (dvPlannerPinMode === 'remove') {
    if (val !== entry.pin) { dvShow('Incorrect PIN.', 'error'); return; }
    delete entry.pin; entry.updated = Date.now();
    await dvPlannerPut(entry); dvPlannerClosePin(); dvShow('PIN removed.', 'success');
    dvId('dvPlannerLockLabel').textContent = 'Lock';
  } else if (dvPlannerPinMode === 'unlock') {
    if (val !== entry.pin) { dvShow('Incorrect PIN.', 'error'); return; }
    dvPlannerClosePin();
    if (dvPlannerPinUnlockResolve) dvPlannerPinUnlockResolve(true);
    dvPlannerPinUnlockResolve = null;
  }
};

const dvPlannerTryOpen = async id => {
  const entry = dvPlannerCache.find(e => e.id === id);
  if (entry && entry.pin) {
    const ok = await new Promise(resolve => { dvPlannerPinUnlockResolve = resolve; dvPlannerActiveId = id; dvPlannerOpenPin('unlock'); });
    if (!ok) return;
  }
  dvPlannerOpenWorkspace(id);
};

/* ---------- Workspace ---------- */
const dvPlannerWorkspace = dvId('dvPlannerWorkspace');
const dvPlannerTextarea = dvId('dvPlannerTextarea');
const dvPlannerColorRow = dvId('dvPlannerColorRow');
dvPlannerColors.forEach(hex => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'dv-swatch';
  b.style.background = hex;
  b.dataset.hex = hex;
  b.setAttribute('aria-label', 'Color ' + hex);
  b.onclick = () => { dvPlannerActiveColor = hex; dvPlannerColorRow.querySelectorAll('.dv-swatch').forEach(s => s.classList.toggle('active', s.dataset.hex === hex)); };
  dvPlannerColorRow.appendChild(b);
});

const dvPlannerOpenWorkspace = id => {
  const entry = dvPlannerCache.find(e => e.id === id);
  dvPlannerActiveId = id;
  dvPlannerTextarea.value = entry ? entry.content : '';
  dvId('dvPlannerWorkspaceTitle').textContent = entry ? (entry.title || 'Untitled') : 'New Entry';
  dvPlannerActiveColor = (entry && entry.color) || dvPlannerColors[5];
  dvPlannerColorRow.querySelectorAll('.dv-swatch').forEach(s => s.classList.toggle('active', s.dataset.hex === dvPlannerActiveColor));
  dvId('dvPlannerLockLabel').textContent = (entry && entry.pin) ? 'Unlock' : 'Lock';
  dvPlannerUndoStack = [dvPlannerTextarea.value]; dvPlannerRedoStack = [];
  dvPlannerZoom = 26; dvPlannerTextarea.style.fontSize = dvPlannerZoom + 'px';
  dvPlannerWorkspace.classList.add('open');
};

const dvPlannerCreate = async (titleOverride, contentOverride) => {
  const entry = {
    id: 'p' + Date.now(),
    period: dvPlannerPeriod,
    title: titleOverride || dvPlannerLabelFor(dvPlannerPeriod),
    content: contentOverride || '',
    color: dvPlannerColors[5],
    updated: Date.now()
  };
  dvPlannerCache.push(entry);
  if ((entry.content || '').trim()) await dvPlannerPut(entry);
  dvPlannerOpenWorkspace(entry.id);
};

const dvPlannerCloseWorkspace = async () => { dvPlannerWorkspace.classList.remove('open'); await dvPlannerLoad(); };
dvId('dvPlannerBackBtn').onclick = dvPlannerCloseWorkspace;

const dvPlannerSave = async () => {
  if (!dvPlannerActiveId) return;
  const idx = dvPlannerCache.findIndex(e => e.id === dvPlannerActiveId);
  const content = dvPlannerTextarea.value;
  if (!content.trim() && idx < 0) return;
  const existing = idx >= 0 ? dvPlannerCache[idx] : null;
  const entry = {
    id: dvPlannerActiveId,
    period: existing ? existing.period : dvPlannerPeriod,
    title: existing ? existing.title : dvPlannerLabelFor(dvPlannerPeriod),
    content,
    color: dvPlannerActiveColor,
    pin: existing ? existing.pin : undefined,
    updated: Date.now()
  };
  if (idx >= 0) dvPlannerCache[idx] = entry; else dvPlannerCache.push(entry);
  await dvPlannerPut(entry);
  dvShow('Saved.', 'success');
};
dvId('dvPlannerSaveBtn').onclick = dvPlannerSave;

dvPlannerTextarea.addEventListener('input', () => {
  dvPlannerUndoStack.push(dvPlannerTextarea.value);
  if (dvPlannerUndoStack.length > 100) dvPlannerUndoStack.shift();
  dvPlannerRedoStack = [];
});
dvId('dvPlannerUndo').onclick = () => { if (dvPlannerUndoStack.length < 2) return; dvPlannerRedoStack.push(dvPlannerUndoStack.pop()); dvPlannerTextarea.value = dvPlannerUndoStack[dvPlannerUndoStack.length - 1]; };
dvId('dvPlannerRedo').onclick = () => { if (!dvPlannerRedoStack.length) return; const val = dvPlannerRedoStack.pop(); dvPlannerUndoStack.push(val); dvPlannerTextarea.value = val; };
dvId('dvPlannerZoomIn').onclick = () => { dvPlannerZoom = Math.min(32, dvPlannerZoom + 2); dvPlannerTextarea.style.fontSize = dvPlannerZoom + 'px'; };
dvId('dvPlannerZoomOut').onclick = () => { dvPlannerZoom = Math.max(20, dvPlannerZoom - 2); dvPlannerTextarea.style.fontSize = dvPlannerZoom + 'px'; };
dvId('dvPlannerClear').onclick = async () => {
  const ok = await dvConfirm('Clear all text in this entry?', 'Clear Entry');
  if (!ok) return;
  dvPlannerTextarea.value = '';
  dvPlannerTextarea.dispatchEvent(new Event('input'));
};
dvId('dvPlannerLockBtn').onclick = () => {
  if (!dvPlannerActiveId) return;
  const entry = dvPlannerCache.find(e => e.id === dvPlannerActiveId);
  dvPlannerOpenPin(entry && entry.pin ? 'remove' : 'set');
};
dvId('dvPlannerDeleteBtn').onclick = async () => {
  const id = dvPlannerActiveId;
  const ok = await dvConfirm('Delete this entry? This cannot be undone.', 'Delete Entry');
  if (!ok) return;
  await dvPlannerDelete(id);
  dvPlannerWorkspace.classList.remove('open');
  await dvPlannerLoad();
  dvShow('Deleted.', 'success');
};

/* ---------- FAB (own, independent of note.js's FAB) ---------- */
const dvPlannerFab = dvId('dvPlannerFab');
dvPlannerFab.onclick = () => dvPlannerCreate();
document.addEventListener('dv-tab-changed', e => {
  dvPlannerFab.classList.toggle('dv-hidden', e.detail.id !== 'dvTabDiary');
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (dvPlannerPinModalWrap.classList.contains('open')) { dvId('dvPlannerPinCancelBtn').click(); return; }
  if (dvPlannerWorkspace.classList.contains('open')) { dvPlannerCloseWorkspace(); return; }
});

/* ---------- Register the Diary/Planner tab ---------- */
dvRegisterTab({
  id: 'dvTabDiary',
  label: 'Diary',
  icon: '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm2 5h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>',
  showFab: false,
  render(panel) {
    panel.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px" id="dvPlannerPeriodRow">' +
        '<button class="dv-chip active" data-period="daily" style="padding:10px 4px;border-radius:10px;background:var(--dv-hover);border:1px solid var(--dv-border);font-weight:800">Daily</button>' +
        '<button class="dv-chip" data-period="weekly" style="padding:10px 4px;border-radius:10px;background:var(--dv-card);border:1px solid var(--dv-border);font-weight:800">Weekly</button>' +
        '<button class="dv-chip" data-period="yearly" style="padding:10px 4px;border-radius:10px;background:var(--dv-card);border:1px solid var(--dv-border);font-weight:800">Yearly</button>' +
      '</div>' +
      '<div id="dvPlannerEmpty" class="dv-info-page"><p>No entries yet. Tap + to add one.</p></div>' +
      '<div id="dvPlannerList"></div>';

    dvPlannerListEl = panel.querySelector('#dvPlannerList');
    dvPlannerEmptyEl = panel.querySelector('#dvPlannerEmpty');
    dvPlannerPeriodBtns = panel.querySelectorAll('#dvPlannerPeriodRow .dv-chip');
    dvPlannerPeriodBtns.forEach(btn => {
      btn.onclick = () => {
        dvPlannerPeriod = btn.dataset.period;
        dvPlannerPeriodBtns.forEach(b => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.style.background = active ? 'var(--dv-p)' : 'var(--dv-card)';
          b.style.color = active ? '#fff' : 'var(--dv-text)';
        });
        dvPlannerRenderList();
      };
    });
    dvPlannerFab.classList.toggle('dv-hidden', dvActiveTab !== 'dvTabDiary');
    dvPlannerLoad();
  }
});
