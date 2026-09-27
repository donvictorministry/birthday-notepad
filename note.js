/* ==========================================================================
   note.js — requires core.js loaded first. Independent of planner.js.
   Registers the Note tab plus its own editor, PIN lock, rename, save
   popup, template picker, note-options menu, and FAB.
   ========================================================================== */

/* ---------- Inject the overlay DOM this feature needs ---------- */
document.body.insertAdjacentHTML('beforeend', `
<div class="dv-fullmenu" id="dvTemplateMenuWrap" role="dialog" aria-modal="true" aria-label="Notepad Templates">
 <div class="dv-fullmenu-head">
  <div style="width:42px"></div>
  <div class="dv-side-title">Notepad Templates</div>
  <button class="dv-close" id="dvTemplateMenuCloseBtn" aria-label="Close templates">&times;</button>
 </div>
 <div class="dv-fullmenu-body" id="dvTemplateMenuCard"></div>
</div>

<div class="dv-fullmenu" id="dvNotepadWorkspace" role="dialog" aria-modal="true" aria-label="Note editor">
 <div class="dv-fullmenu-head dv-fullmenu-head-accent">
  <button class="dv-close" id="dvWorkspaceBackBtn" aria-label="Back">
   <svg class="dv-icon" viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8 1.4-1.4L9.8 12l6.6-6.6z"/></svg>
  </button>
  <div class="dv-side-title" id="dvWorkspaceTitle">Note</div>
  <button class="dv-save-btn" id="dvTbSave">
   <svg class="dv-icon" viewBox="0 0 24 24"><path d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 2v5h8V5H7zm0 8v6h10v-6H7z"/></svg>
   <span>SAVE</span>
  </button>
 </div>
 <div class="dv-toolbar-scroll" id="dvToolbarScroll">
  <button class="dv-tool-icn" id="dvTbNew"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/></svg><span>New</span></button>
  <button class="dv-tool-icn" id="dvTbUndo"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M7 7H4V4H2v5a1 1 0 0 0 1 1h6V8H7c2-2.2 5.1-3.4 8.2-2.6 3.7 1 6 4.9 5 8.6-1 3.7-4.9 6-8.6 5-2.4-.6-4.3-2.4-5.1-4.6l-1.9.7c1 2.9 3.4 5.2 6.5 6 4.8 1.2 9.7-1.7 10.9-6.5S20.9 5 16.1 3.8C12.4 2.9 8.6 4.3 6.4 7z"/></svg><span>Undo</span></button>
  <button class="dv-tool-icn" id="dvTbRedo"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M17 7h3V4h2v5a1 1 0 0 1-1 1h-6V8h2c-2-2.2-5.1-3.4-8.2-2.6-3.7 1-6 4.9-5 8.6 1 3.7 4.9 6 8.6 5 2.4-.6 4.3-2.4 5.1-4.6l1.9.7c-1 2.9-3.4 5.2-6.5 6-4.8 1.2-9.7-1.7-10.9-6.5S3.1 5 7.9 3.8C11.6 2.9 15.4 4.3 17.6 7z"/></svg><span>Redo</span></button>
  <button class="dv-tool-icn" id="dvTbCopy"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M8 2h9l5 5v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 1.5V7h3.5zM4 8v13a1 1 0 0 0 1 1h11v-2H6V8H4z"/></svg><span>Copy</span></button>
  <button class="dv-tool-icn" id="dvTbPaste"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M9 2h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2V3a1 1 0 0 1 1-1zm0 2v2h6V4H9zm-2 4v13h10V8H7z"/></svg><span>Paste</span></button>
  <button class="dv-tool-icn" id="dvTbSelect"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M3 3h4v2H5v2H3V3zm14 0h4v4h-2V5h-2V3zM3 17h2v2h2v2H3v-4zm18 0v4h-4v-2h2v-2h2zM7 7h10v10H7V7zm2 2v6h6V9H9z"/></svg><span>Select</span></button>
  <button class="dv-tool-icn" id="dvTbZoomOut"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM7 9h6v2H7V9zm9.6 7.6 4.2 4.2-1.4 1.4-4.2-4.2z"/></svg><span>Zoom</span></button>
  <button class="dv-tool-icn" id="dvTbZoomIn"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM9 7h2v2h2v2h-2v2H9v-2H7V9h2V7zm7.6 9.6 4.2 4.2-1.4 1.4-4.2-4.2z"/></svg><span>Zoom</span></button>
  <button class="dv-tool-icn" id="dvTbDelete"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm2 3h2v8H8V9zm6 0h2v8h-2V9z"/></svg><span>Clear</span></button>
  <button class="dv-tool-icn" id="dvTbDark"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><span>Dark</span></button>
 </div>
 <textarea id="dvNoteTextarea" class="dv-note-textarea"></textarea>
</div>

<div class="dv-fullmenu" id="dvNoteActionsWrap" role="dialog" aria-modal="true" aria-label="Note options">
 <div class="dv-fullmenu-head">
  <div style="width:42px"></div>
  <div class="dv-side-title">Note Options</div>
  <button class="dv-close" id="dvNoteActionsCloseBtn" aria-label="Close">&times;</button>
 </div>
 <div class="dv-fullmenu-body">
  <button class="dv-actionrow dv-color-primary" id="dvNaPin"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M12 2a4 4 0 0 1 4 4v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v3h4V6a2 2 0 0 0-2-2z"/></svg><span>PIN</span></button>
  <button class="dv-actionrow dv-color-primary" id="dvNaRename"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg><span>Rename</span></button>
  <button class="dv-actionrow dv-color-primary" id="dvNaEdit"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 1.5V8h4.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"/></svg><span>Edit Note</span></button>
  <button class="dv-actionrow dv-color-danger" id="dvNaDelete"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm2 3h2v8H8V9zm6 0h2v8h-2V9z"/></svg><span>Delete</span></button>
  <button class="dv-actionrow dv-color-green" id="dvNaWhatsapp"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 0 1 6.8 12.2l-.3.5.7 2.5-2.6-.7-.5.3A8 8 0 1 1 12 4z"/></svg><span>Share to WhatsApp</span></button>
  <button class="dv-actionrow" id="dvNaShare"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.1c.1-.3.1-.5.1-.8s0-.5-.1-.8L15.9 7c.6.5 1.3.8 2.1.8a3 3 0 1 0-3-3c0 .3 0 .5.1.8L7.1 9.7A3 3 0 1 0 6 15.3l7.1 4.1c-.1.3-.1.5-.1.7a3 3 0 1 0 3-3z"/></svg><span>Share Sheet</span></button>
  <button class="dv-actionrow dv-color-primary" id="dvNaExport"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M12 3v10.6l3.3-3.3 1.4 1.4L12 17.3l-4.7-5.6 1.4-1.4L12 13.6V3zM5 19h14v2H5z"/></svg><span>Export to Device</span></button>
  <button class="dv-actionrow dv-color-muted" id="dvNaExit"><svg class="dv-icon" viewBox="0 0 24 24"><path d="M6.4 4.98 12 10.59l5.6-5.61 1.41 1.41L13.41 12l5.6 5.6-1.41 1.41L12 13.41l-5.6 5.6-1.41-1.41L10.59 12l-5.6-5.61z"/></svg><span>Exit</span></button>
 </div>
</div>

<div class="dv-modal-wrap" id="dvRenameModalWrap">
 <div class="dv-modal-backdrop" id="dvRenameModalBackdrop"></div>
 <div class="dv-modal">
  <h3>Rename</h3>
  <div class="dv-field" style="margin-top:0">
   <label for="dvRenameTitleInput">Title</label>
   <input id="dvRenameTitleInput" class="dv-input" type="text" placeholder="Untitled" autocomplete="off">
  </div>
  <div class="dv-modal-actions" style="margin-top:16px">
   <button class="dv-btn dv-fill-black" id="dvRenameCancelBtn">Cancel</button>
   <button class="dv-btn dv-fill-success" id="dvRenameConfirmBtn">Save</button>
  </div>
 </div>
</div>

<div class="dv-modal-wrap" id="dvPinModalWrap">
 <div class="dv-modal-backdrop" id="dvPinModalBackdrop"></div>
 <div class="dv-modal">
  <h3 id="dvPinModalTitle">Set PIN</h3>
  <div class="dv-field" style="margin-top:0">
   <label for="dvPinInput" id="dvPinModalLabel">Choose a 4-digit PIN</label>
   <input id="dvPinInput" class="dv-input" type="tel" inputmode="numeric" maxlength="4" pattern="[0-9]*" placeholder="****" autocomplete="off" style="letter-spacing:8px;text-align:center">
  </div>
  <div class="dv-modal-actions" style="margin-top:16px">
   <button class="dv-btn dv-fill-black" id="dvPinCancelBtn">Cancel</button>
   <button class="dv-btn dv-fill-success" id="dvPinConfirmBtn">Save</button>
  </div>
 </div>
</div>

<div class="dv-modal-wrap" id="dvSaveModalWrap">
 <div class="dv-modal-backdrop" id="dvSaveModalBackdrop"></div>
 <div class="dv-modal">
  <h3>Save</h3>
  <div class="dv-field" style="margin-top:0">
   <label for="dvSaveTitleInput">Title</label>
   <input id="dvSaveTitleInput" class="dv-input" type="text" placeholder="Untitled" autocomplete="off">
  </div>
  <div class="dv-modal-actions" style="margin-top:16px">
   <button class="dv-btn dv-fill-black" id="dvSaveCancelBtn">Cancel</button>
   <button class="dv-btn dv-fill-success" id="dvSaveConfirmBtn">Save</button>
  </div>
 </div>
</div>
`);

/* ---------- IndexedDB: notes ---------- */
const dvNoteDBName = 'dv-notepad', dvNoteStore = 'notes';
let dvNoteDB = null;
const dvNoteOpenDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(dvNoteDBName, 1);
  req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(dvNoteStore)) db.createObjectStore(dvNoteStore, { keyPath: 'id' }); };
  req.onsuccess = () => { dvNoteDB = req.result; resolve(dvNoteDB); };
  req.onerror = () => reject(req.error);
});
const dvNoteAll = () => new Promise((resolve, reject) => {
  const tx = dvNoteDB.transaction(dvNoteStore, 'readonly');
  const req = tx.objectStore(dvNoteStore).getAll();
  req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error);
});
const dvNotePut = note => new Promise((resolve, reject) => {
  const tx = dvNoteDB.transaction(dvNoteStore, 'readwrite');
  tx.objectStore(dvNoteStore).put(note);
  tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
});
const dvNoteDelete = id => new Promise((resolve, reject) => {
  const tx = dvNoteDB.transaction(dvNoteStore, 'readwrite');
  tx.objectStore(dvNoteStore).delete(id);
  tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
});

/* ---------- Starter templates ---------- */
const dvNoteTemplates = [
  { title: 'Faith & Devotion', topic: 'Reflect on scripture, prayer requests, and your walk this week.', content: 'Faith & Devotion\n\nToday I want to reflect on where my faith stands and how I can grow closer in my walk. What scripture or truth spoke to me recently, and why did it matter?\n\nConsider a specific prayer request you want to hold onto this week. Write down one practical step you can take today to put your faith into action.\n\nEnd with a short prayer of gratitude, naming three specific things you are thankful for right now.' },
  { title: 'Gratitude Journal', topic: 'Name specific blessings and good things from today.', content: 'Gratitude Journal\n\nBefore moving on with your day, slow down enough to notice what is actually good. Write down three specific things that happened today that you are grateful for.\n\nName one person who made your day easier or better in some way.\n\nEnd by writing a short sentence of thanks addressed to whoever or whatever you feel it belongs to.' },
  { title: 'Goals & Planning', topic: 'Turn one big goal into concrete next steps.', content: 'Goals & Planning\n\nWrite down the single most important goal you are pursuing this quarter, stated as specifically as possible. Break it into three concrete milestones.\n\nIdentify the very next physical action you can take today, no matter how small.' }
];

/* ---------- State ---------- */
let dvNotesCache = [];
let dvActiveNoteId = null, dvNoteZoom = 28, dvUndoStack = [], dvRedoStack = [], dvActionsNoteId = null;
const dvFmtDate = ts => { const d = new Date(ts); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

/* ---------- FAB visibility helper — fixes FAB floating above full-page overlays ---------- */
const dvNoteHideFab = () => dvFab.classList.add('dv-hidden');
const dvNoteRestoreFabForTab = () => dvFab.classList.toggle('dv-hidden', dvActiveTab !== 'dvTabNote');

/* ---------- Note options full page ---------- */
const dvOpenNoteActions = id => { dvActionsNoteId = id; dvNoteHideFab(); dvId('dvNoteActionsWrap').classList.add('open'); };

/* ---------- List rendering ---------- */
const dvRenderNoteRow = (item, list, onTap, onDots) => {
  const row = document.createElement('div');
  row.className = 'dv-note-row';
  const main = document.createElement('button');
  main.className = 'dv-note-row-main';
  const lockIcon = item.pin ? '<svg class="dv-icon" style="width:15px;height:15px;vertical-align:-2px;margin-right:4px" viewBox="0 0 24 24"><path d="M12 2a4 4 0 0 1 4 4v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v3h4V6a2 2 0 0 0-2-2z"/></svg>' : '';
  main.innerHTML = '<strong>' + lockIcon + '</strong><span></span>';
  main.querySelector('strong').append(document.createTextNode(item.title || 'Untitled'));
  main.querySelector('span').textContent = dvFmtDate(item.updated);
  main.onclick = onTap;
  const dots = document.createElement('button');
  dots.className = 'dv-note-dots';
  dots.setAttribute('aria-label', 'Options');
  dots.innerHTML = '<svg class="dv-icon" style="width:26px;height:26px;color:var(--dv-text)" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.6"/><circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="19" r="2.6"/></svg>';
  dots.onclick = onDots;
  row.appendChild(main); row.appendChild(dots);
  list.appendChild(row);
};

let dvNoteSearchInput, dvNotesListEl, dvNotesEmptyEl;
const dvRenderNotesList = () => {
  dvNotesListEl.innerHTML = '';
  const q = (dvNoteSearchInput.value || '').trim().toLowerCase();
  const filtered = q ? dvNotesCache.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)) : dvNotesCache;
  dvNotesEmptyEl.classList.toggle('dv-hidden', filtered.length > 0);
  dvNotesEmptyEl.querySelector('p').textContent = (q && filtered.length === 0) ? 'No notes match your search.' : 'No notes yet. Tap the + button to create your first note.';
  filtered.slice().sort((a, b) => b.updated - a.updated).forEach(note =>
    dvRenderNoteRow(note, dvNotesListEl, () => dvTryOpenWorkspace(note.id), () => dvOpenNoteActions(note.id))
  );
  if (typeof dvRenderRecent === 'function') dvRenderRecent();
};

const dvLoadNotes = async () => {
  if (!dvNoteDB) await dvNoteOpenDB();
  dvNotesCache = await dvNoteAll();
  dvRenderNotesList();
};

/* ---------- Workspace editor ---------- */
const dvNoteTextarea = dvId('dvNoteTextarea'), dvWorkspaceTitle = dvId('dvWorkspaceTitle');
const dvNotepadWorkspace = dvId('dvNotepadWorkspace');

const dvOpenWorkspace = id => {
  const note = dvNotesCache.find(n => n.id === id);
  dvActiveNoteId = id;
  dvNoteTextarea.value = note ? note.content : '';
  dvWorkspaceTitle.textContent = note ? (note.title || 'Untitled') : 'New';
  dvUndoStack = [dvNoteTextarea.value]; dvRedoStack = [];
  dvNoteZoom = 28; dvNoteTextarea.style.fontSize = dvNoteZoom + 'px';
  dvNoteHideFab();
  dvNotepadWorkspace.classList.add('open');
};

/* ---------- PIN protection ---------- */
let dvPinMode = null, dvPinTargetId = null, dvPinUnlockResolve = null;
const dvPinModalWrap = dvId('dvPinModalWrap');
const dvOpenPinModal = (mode, noteId) => {
  dvPinMode = mode; dvPinTargetId = noteId;
  dvId('dvPinInput').value = '';
  const label = dvId('dvPinModalLabel'), title = dvId('dvPinModalTitle'), confirmBtn = dvId('dvPinConfirmBtn');
  if (mode === 'set') { title.textContent = 'Set PIN'; label.textContent = 'Choose a 4-digit PIN'; confirmBtn.textContent = 'Save'; }
  else if (mode === 'remove') { title.textContent = 'Remove PIN'; label.textContent = 'Enter current PIN to remove'; confirmBtn.textContent = 'Remove'; }
  else { title.textContent = 'Enter PIN'; label.textContent = 'This is locked'; confirmBtn.textContent = 'Unlock'; }
  dvPinModalWrap.classList.add('open');
  dvId('dvPinInput').focus();
};
const dvClosePinModal = () => { dvPinModalWrap.classList.remove('open'); };
dvId('dvPinCancelBtn').onclick = () => {
  dvClosePinModal();
  if (dvPinMode === 'unlock' && dvPinUnlockResolve) dvPinUnlockResolve(false);
  dvPinUnlockResolve = null;
};
dvId('dvPinModalBackdrop').onclick = () => dvId('dvPinCancelBtn').click();
dvId('dvPinConfirmBtn').onclick = async () => {
  const val = dvId('dvPinInput').value.trim();
  if (!/^\d{4}$/.test(val)) { dvShow('Enter exactly 4 digits.', 'error'); return; }
  const note = dvNotesCache.find(n => n.id === dvPinTargetId);
  if (!note) return;
  if (dvPinMode === 'set') {
    note.pin = val; note.updated = Date.now();
    await dvNotePut(note); dvClosePinModal(); dvShow('Locked with PIN.', 'success'); await dvLoadNotes();
  } else if (dvPinMode === 'remove') {
    if (val !== note.pin) { dvShow('Incorrect PIN.', 'error'); return; }
    delete note.pin; note.updated = Date.now();
    await dvNotePut(note); dvClosePinModal(); dvShow('PIN removed.', 'success'); await dvLoadNotes();
  } else if (dvPinMode === 'unlock') {
    if (val !== note.pin) { dvShow('Incorrect PIN.', 'error'); return; }
    dvClosePinModal();
    if (dvPinUnlockResolve) dvPinUnlockResolve(true);
    dvPinUnlockResolve = null;
  }
};
const dvTryOpenWorkspace = async id => {
  const note = dvNotesCache.find(n => n.id === id);
  if (note && note.pin) {
    const ok = await new Promise(resolve => { dvPinUnlockResolve = resolve; dvOpenPinModal('unlock', id); });
    if (!ok) return;
  }
  dvOpenWorkspace(id);
};

/* ---------- Create / close / save ---------- */
const dvCreateNoteWith = async (title, content) => {
  const note = { id: 'n' + Date.now(), title: title || 'Untitled Note', content: content || '', updated: Date.now() };
  dvNotesCache.push(note);
  if ((content || '').trim()) await dvNotePut(note);
  dvOpenWorkspace(note.id);
};

const dvCloseWorkspace = async () => {
  dvNotepadWorkspace.classList.remove('open');
  dvNoteRestoreFabForTab();
  await dvLoadNotes();
};
dvId('dvWorkspaceBackBtn').onclick = dvCloseWorkspace;

const dvSaveActiveNote = async titleOverride => {
  if (!dvActiveNoteId) return;
  const idx = dvNotesCache.findIndex(n => n.id === dvActiveNoteId);
  const content = dvNoteTextarea.value;
  if (!content.trim() && idx < 0) return;
  const firstLine = (content.split('\n')[0] || '').trim();
  const title = (titleOverride && titleOverride.trim()) ? titleOverride.trim().slice(0, 60) : (firstLine ? firstLine.slice(0, 60) : 'Untitled');
  const note = { id: dvActiveNoteId, title, content, updated: Date.now() };
  if (idx >= 0) dvNotesCache[idx] = note; else dvNotesCache.push(note);
  await dvNotePut(note);
  dvWorkspaceTitle.textContent = note.title;
  dvShow('Saved.', 'success');
};

dvNoteTextarea.addEventListener('input', () => {
  dvUndoStack.push(dvNoteTextarea.value);
  if (dvUndoStack.length > 100) dvUndoStack.shift();
  dvRedoStack = [];
});
dvId('dvTbNew').onclick = async () => {
  await dvSaveActiveNote();
  const note = { id: 'n' + Date.now(), title: 'Untitled', content: '', updated: Date.now() };
  dvNotesCache.push(note);
  dvOpenWorkspace(note.id);
};
dvId('dvTbUndo').onclick = () => { if (dvUndoStack.length < 2) return; dvRedoStack.push(dvUndoStack.pop()); dvNoteTextarea.value = dvUndoStack[dvUndoStack.length - 1]; };
dvId('dvTbRedo').onclick = () => { if (!dvRedoStack.length) return; const val = dvRedoStack.pop(); dvUndoStack.push(val); dvNoteTextarea.value = val; };
dvId('dvTbPaste').onclick = async () => {
  try {
    const text = await navigator.clipboard.readText();
    const s = dvNoteTextarea.selectionStart, e = dvNoteTextarea.selectionEnd;
    dvNoteTextarea.value = dvNoteTextarea.value.slice(0, s) + text + dvNoteTextarea.value.slice(e);
    dvNoteTextarea.dispatchEvent(new Event('input'));
    dvShow('Pasted.', 'success');
  } catch { dvShow('Clipboard access denied.', 'error'); }
};
dvId('dvTbCopy').onclick = async () => {
  const s = dvNoteTextarea.selectionStart, e = dvNoteTextarea.selectionEnd;
  const text = s !== e ? dvNoteTextarea.value.slice(s, e) : dvNoteTextarea.value;
  try { await navigator.clipboard.writeText(text); dvShow('Copied.', 'success'); } catch { dvShow('Copy failed.', 'error'); }
};
dvId('dvTbDelete').onclick = () => {
  const s = dvNoteTextarea.selectionStart, e = dvNoteTextarea.selectionEnd;
  if (s === e) return;
  dvNoteTextarea.value = dvNoteTextarea.value.slice(0, s) + dvNoteTextarea.value.slice(e);
  dvNoteTextarea.selectionStart = dvNoteTextarea.selectionEnd = s;
  dvNoteTextarea.dispatchEvent(new Event('input'));
};
const dvSaveModalWrap = dvId('dvSaveModalWrap');
dvId('dvTbSave').onclick = () => {
  const note = dvNotesCache.find(n => n.id === dvActiveNoteId);
  dvId('dvSaveTitleInput').value = (note && note.title && note.title !== 'Untitled') ? note.title : '';
  dvSaveModalWrap.classList.add('open');
  dvId('dvSaveTitleInput').focus();
};
const dvCloseSaveModal = () => dvSaveModalWrap.classList.remove('open');
dvId('dvSaveModalBackdrop').onclick = dvCloseSaveModal;
dvId('dvSaveCancelBtn').onclick = dvCloseSaveModal;
dvId('dvSaveConfirmBtn').onclick = async () => { await dvSaveActiveNote(dvId('dvSaveTitleInput').value); dvCloseSaveModal(); };
dvId('dvTbSelect').onclick = () => dvNoteTextarea.select();
dvId('dvTbZoomIn').onclick = () => { dvNoteZoom = Math.min(32, dvNoteZoom + 2); dvNoteTextarea.style.fontSize = dvNoteZoom + 'px'; };
dvId('dvTbZoomOut').onclick = () => { dvNoteZoom = Math.max(26, dvNoteZoom - 2); dvNoteTextarea.style.fontSize = dvNoteZoom + 'px'; };
dvId('dvTbDark').onclick = dvToggleTheme;

/* ---------- Rename ---------- */
let dvRenameTargetId = null;
const dvRenameModalWrap = dvId('dvRenameModalWrap');
const dvCloseRenameModal = () => dvRenameModalWrap.classList.remove('open');
dvId('dvRenameModalBackdrop').onclick = dvCloseRenameModal;
dvId('dvRenameCancelBtn').onclick = dvCloseRenameModal;
dvId('dvRenameConfirmBtn').onclick = async () => {
  const note = dvNotesCache.find(n => n.id === dvRenameTargetId);
  if (note) {
    note.title = dvId('dvRenameTitleInput').value.trim() || 'Untitled';
    note.updated = Date.now();
    await dvNotePut(note); await dvLoadNotes();
  }
  dvCloseRenameModal();
};

/* ---------- Note options full page ---------- */
const dvNoteActionsWrap = dvId('dvNoteActionsWrap');
const dvCloseNoteActions = () => { dvNoteActionsWrap.classList.remove('open'); dvActionsNoteId = null; dvNoteRestoreFabForTab(); };
dvId('dvNaExit').onclick = dvCloseNoteActions;
dvId('dvNoteActionsCloseBtn').onclick = dvCloseNoteActions;
dvId('dvNaPin').onclick = () => {
  const note = dvNotesCache.find(n => n.id === dvActionsNoteId);
  const targetId = dvActionsNoteId;
  dvCloseNoteActions();
  if (!note) return;
  dvOpenPinModal(note.pin ? 'remove' : 'set', targetId);
};
dvId('dvNaRename').onclick = () => {
  const note = dvNotesCache.find(n => n.id === dvActionsNoteId);
  dvRenameTargetId = dvActionsNoteId;
  dvCloseNoteActions();
  dvId('dvRenameTitleInput').value = note ? (note.title || '') : '';
  dvRenameModalWrap.classList.add('open');
  dvId('dvRenameTitleInput').focus();
};
dvId('dvNaEdit').onclick = () => { const id = dvActionsNoteId; dvCloseNoteActions(); dvTryOpenWorkspace(id); };
dvId('dvNaDelete').onclick = async () => {
  const id = dvActionsNoteId;
  dvCloseNoteActions();
  const ok = await dvConfirm('Delete this? This cannot be undone.', 'Delete');
  if (!ok) return;
  await dvNoteDelete(id); await dvLoadNotes();
  dvShow('Deleted.', 'success');
};
dvId('dvNaWhatsapp').onclick = () => {
  const note = dvNotesCache.find(n => n.id === dvActionsNoteId);
  dvCloseNoteActions();
  if (!note) return;
  const text = encodeURIComponent((note.title ? note.title + '\n\n' : '') + note.content);
  window.open('https://wa.me/?text=' + text, '_blank');
};
dvId('dvNaShare').onclick = async () => {
  const note = dvNotesCache.find(n => n.id === dvActionsNoteId);
  dvCloseNoteActions();
  if (!note) return;
  if (navigator.share) { try { await navigator.share({ title: note.title || 'Note', text: note.content }); } catch {} }
  else { dvShow('Share Sheet not available on this browser.', 'error'); }
};
const dvExportNote = note => {
  const text = (note.title || 'Untitled') + '\n\n' + (note.content || '');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const safeName = (note.title || 'note').replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim() || 'note';
  const a = document.createElement('a');
  a.href = url; a.download = safeName + '.txt';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  dvShow('Exported to your device.', 'success');
};
dvId('dvNaExport').onclick = () => {
  const note = dvNotesCache.find(n => n.id === dvActionsNoteId);
  dvCloseNoteActions();
  if (!note) return;
  dvExportNote(note);
};

/* ---------- FAB + template picker ---------- */
const dvFabMenuWrap = dvId('dvFabMenuWrap'), dvTemplateMenuWrap = dvId('dvTemplateMenuWrap'), dvTemplateMenuCard = dvId('dvTemplateMenuCard');
const dvCloseFabMenu = () => { dvFabMenuWrap.classList.remove('open'); dvFab.classList.remove('dv-fab-open'); };
const dvCloseTemplateMenu = () => { dvTemplateMenuWrap.classList.remove('open'); dvNoteRestoreFabForTab(); };
dvFabMenuWrap.onclick = e => { if (e.target === dvFabMenuWrap) dvCloseFabMenu(); };
dvTemplateMenuWrap.onclick = e => { if (e.target === dvTemplateMenuWrap) dvCloseTemplateMenu(); };
dvFab.onclick = () => {
  const isOpen = dvFabMenuWrap.classList.toggle('open');
  dvFab.classList.toggle('dv-fab-open', isOpen);
};
dvId('dvFabNewNote').onclick = async () => {
  dvCloseFabMenu();
  await dvCreateNoteWith('Untitled Note', '');
};
dvId('dvFabTemplates').onclick = () => {
  dvCloseFabMenu();
  dvNoteHideFab();
  dvTemplateMenuCard.innerHTML = dvNoteTemplates.map((t, i) =>
    '<button class="dv-note-row" style="width:100%;text-align:left;display:block" data-i="' + i + '">' +
    '<strong style="display:block;font-size:19px;font-weight:800;color:var(--dv-p)">' + t.title + '</strong>' +
    '<span style="display:block;font-size:15px;color:var(--dv-muted);margin-top:4px">' + t.topic + '</span>' +
    '</button>'
  ).join('');
  dvTemplateMenuCard.querySelectorAll('[data-i]').forEach(btn => {
    btn.onclick = async () => {
      const t = dvNoteTemplates[+btn.dataset.i];
      dvTemplateMenuWrap.classList.remove('open');
      await dvCreateNoteWith(t.title, t.content);
    };
  });
  dvTemplateMenuWrap.classList.add('open');
};
dvId('dvTemplateMenuCloseBtn').onclick = dvCloseTemplateMenu;

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (dvPinModalWrap.classList.contains('open')) { dvId('dvPinCancelBtn').click(); return; }
  if (dvRenameModalWrap.classList.contains('open')) { dvCloseRenameModal(); return; }
  if (dvSaveModalWrap.classList.contains('open')) { dvCloseSaveModal(); return; }
  if (dvTemplateMenuWrap.classList.contains('open')) { dvCloseTemplateMenu(); return; }
  if (dvFabMenuWrap.classList.contains('open')) { dvCloseFabMenu(); return; }
  if (dvNoteActionsWrap.classList.contains('open')) { dvCloseNoteActions(); return; }
  if (dvNotepadWorkspace.classList.contains('open')) { dvCloseWorkspace(); return; }
});

document.addEventListener('dv-tab-changed', () => {
  if (!dvNotepadWorkspace.classList.contains('open') &&
      !dvNoteActionsWrap.classList.contains('open') &&
      !dvTemplateMenuWrap.classList.contains('open')) {
    dvNoteRestoreFabForTab();
  }
});

/* ---------- Register the Note tab ---------- */
dvRegisterTab({
  id: 'dvTabNote',
  label: 'Note',
  icon: '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 1.5V8h4.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"/></svg>',
  showFab: true,
  render(panel) {
    panel.innerHTML =
      '<div class="dv-search-row">' +
        '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm7.5 10.1 4.4 4.4-1.4 1.4-4.4-4.4z"/></svg>' +
        '<input id="dvNoteSearch" type="text" placeholder="Search saved notes" autocomplete="off">' +
      '</div>' +
      '<div id="dvNotesEmpty" class="dv-info-page"><p>No notes yet. Tap the + button to create your first note.</p></div>' +
      '<div id="dvNotesList"></div>';
    dvNoteSearchInput = panel.querySelector('#dvNoteSearch');
    dvNotesListEl = panel.querySelector('#dvNotesList');
    dvNotesEmptyEl = panel.querySelector('#dvNotesEmpty');
    dvNoteSearchInput.oninput = dvRenderNotesList;
    dvLoadNotes();
  }
});
