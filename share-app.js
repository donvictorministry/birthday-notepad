/* share-app.js — requires core.js loaded first */
dvRegisterSettingsModule({
  id: 'share-app',
  title: null,
  render(section) {
    const btn = document.createElement('button');
    btn.className = 'dv-side-item dv-color-primary';
    btn.textContent = 'Share App';
    btn.onclick = async () => {
      const shareData = { title: 'DV Birthday Notepad', text: 'Notes, diary and dictionary in one app.', url: location.href };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch {}
      } else {
        try { await navigator.clipboard.writeText(location.href); dvShow('Link copied to clipboard.', 'success'); }
        catch { dvShow('Sharing not available on this browser.', 'error'); }
      }
    };
    section.appendChild(btn);
  }
});
