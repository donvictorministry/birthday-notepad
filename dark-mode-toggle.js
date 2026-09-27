/* dark-mode-toggle.js — requires core.js loaded first */
dvRegisterSettingsModule({
  id: 'dark-mode',
  title: null,
  render(section) {
    section.innerHTML =
      '<div class="dv-side-row">' +
        '<span>Dark mode</span>' +
        '<button class="dv-switch" id="dvDarkSwitch" role="switch" aria-checked="false"><i></i></button>' +
      '</div>';
    const isDark = document.documentElement.getAttribute('data-dv-theme') === 'dark';
    const sw = section.querySelector('#dvDarkSwitch');
    sw.classList.toggle('on', isDark);
    sw.setAttribute('aria-checked', isDark);
    sw.onclick = dvToggleTheme;
  }
});
