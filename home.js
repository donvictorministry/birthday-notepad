/* ==========================================================================
   home.js — requires core.js loaded first. Reads dvNotesCache / dvPlannerCache
   from note.js / planner.js when available (guarded so load order never
   crashes the app even if this file loads before them).
   ========================================================================== */

let dvRecentListEl, dvRecentEmptyEl;

const dvRenderRecent = () => {
  if (!dvRecentListEl) return;
  const notes = (typeof dvNotesCache !== 'undefined' ? dvNotesCache : []).map(n => ({ ...n, kind: 'Note', isDiary: false }));
  const diary = (typeof dvPlannerCache !== 'undefined' ? dvPlannerCache : []).map(n => ({ ...n, kind: 'Diary', isDiary: true }));
  const combined = [...notes, ...diary].sort((a, b) => b.updated - a.updated).slice(0, 5);
  dvRecentListEl.innerHTML = '';
  dvRecentEmptyEl.classList.toggle('dv-hidden', combined.length > 0);
  combined.forEach(item => {
    const row = document.createElement('button');
    row.className = 'dv-recent-row';
    row.innerHTML =
      '<span><strong style="color:var(--dv-p)"></strong><br><span style="font-size:13px;color:var(--dv-muted)"></span></span>' +
      '<span style="font-size:13px;color:var(--dv-muted)">' + item.kind + '</span>';
    row.querySelector('strong').textContent = item.title || 'Untitled';
    row.querySelectorAll('span')[1].textContent = dvFmtDate(item.updated);
    row.onclick = () => {
      dvSwitchTab(item.isDiary ? 'dvTabDiary' : 'dvTabNote');
      if (item.isDiary) { if (typeof dvPlannerTryOpen === 'function') dvPlannerTryOpen(item.id); }
      else { dvTryOpenWorkspace(item.id, false); }
    };
    dvRecentListEl.appendChild(row);
  });
};

dvRegisterTab({
  id: 'dvTabHome',
  label: 'Home',
  icon: '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v9.5l4-4 3 3 5-5 3 3V7H5z"/></svg>',
  showFab: false,
  render(panel) {
    panel.innerHTML =
      '<div class="dv-hero">' +
        '<h1>Happy planning!</h1>' +
        '<p>Notes, diary entries and a dictionary — all in one place, all on this device.</p>' +
      '</div>' +
      '<div class="dv-quick-row">' +
        '<button class="dv-quick-btn" id="dvQuickNewNote">' +
          '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/></svg>New Note</button>' +
        '<button class="dv-quick-btn" id="dvQuickNewDiary">' +
          '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm2 5h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>New Diary Entry</button>' +
        '<button class="dv-quick-btn" id="dvQuickDictionary">' +
          '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm7.5 10.1 4.4 4.4-1.4 1.4-4.4-4.4z"/></svg>Dictionary</button>' +
        '<button class="dv-quick-btn" id="dvQuickTodo">' +
          '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M4 4h16v2H4V4zm3 4.5 2 2 4-4 1.4 1.4-5.4 5.4-3.4-3.4zM4 14h16v2H4v-2zm0 6h16v2H4v-2z"/></svg>To-Do List</button>' +
      '</div>' +
      '<div class="dv-card">' +
        '<h2>Recent</h2>' +
        '<div id="dvRecentList"></div>' +
        '<div id="dvRecentEmpty" class="dv-info-page"><p>Nothing yet — create a note or diary entry to see it here.</p></div>' +
      '</div>';

    dvRecentListEl = panel.querySelector('#dvRecentList');
    dvRecentEmptyEl = panel.querySelector('#dvRecentEmpty');

    panel.querySelector('#dvQuickNewNote').onclick = async () => {
      dvSwitchTab('dvTabNote');
      if (typeof dvCreateNoteWith === 'function') await dvCreateNoteWith('Untitled Note', '');
    };
    panel.querySelector('#dvQuickNewDiary').onclick = async () => {
      dvSwitchTab('dvTabDiary');
      if (typeof dvPlannerCreate === 'function') await dvPlannerCreate();
    };
    panel.querySelector('#dvQuickDictionary').onclick = () => {
      dvSwitchTab('dvTabDictionary');
      const input = dvId('dvDictInput');
      if (input) input.focus();
    };
    panel.querySelector('#dvQuickTodo').onclick = () => { if (typeof dvOpenTodoPage === 'function') dvOpenTodoPage(); else dvOpenSettings(); };

    dvRenderRecent();
  }
});
