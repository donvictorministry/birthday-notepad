/* install-app.js — requires core.js loaded first */
let dvDeferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  dvDeferredPrompt = e;
});

dvRegisterSettingsModule({
  id: 'install-app',
  title: null,
  render(section) {
    const btn = document.createElement('button');
    btn.className = 'dv-side-item dv-color-primary';
    btn.textContent = 'Install App';
    btn.onclick = async () => {
      if (!dvDeferredPrompt) { dvShow('Please wait and retry again.', 'error'); return; }
      dvDeferredPrompt.prompt();
      const { outcome } = await dvDeferredPrompt.userChoice;
      dvDeferredPrompt = null;
      if (outcome === 'accepted') dvShow('App installed.', 'success');
    };
    section.appendChild(btn);
  }
});
