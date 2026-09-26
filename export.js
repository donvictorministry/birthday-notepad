/* export.js — requires core.js loaded first.
   Calls dvNoteAll() / dvDiaryAll() from note.js / planner.js lazily
   inside the click handler, so load order relative to those two
   files does not matter (by the time someone taps the button, every
   script has already finished loading). */
dvRegisterSettingsModule({
  id: 'export',
  title: null,
  render(section) {
    const btn = document.createElement('button');
    btn.className = 'dv-side-item dv-color-primary';
    btn.textContent = 'Export All Data';
    btn.onclick = async () => {
      const notes = (typeof dvNoteAll === 'function') ? await dvNoteAll().catch(() => []) : [];
      const diary = (typeof dvPlannerAll === 'function') ? await dvPlannerAll().catch(() => []) : [];
      const todos = (typeof dvTodos !== 'undefined') ? dvTodos : [];
      const backup = { exportedAt: new Date().toISOString(), notes, diary, todos };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'birthday-notepad-backup.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      dvShow('Backup exported to your device.', 'success');
    };
    section.appendChild(btn);
  }
});
