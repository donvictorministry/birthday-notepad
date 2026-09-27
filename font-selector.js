/* font-selector.js — requires core.js loaded first */
dvRegisterSettingsModule({
  id: 'font-selector',
  title: 'Font',
  render(section) {
    let current = "Roboto,-apple-system,system-ui,sans-serif";
    try { current = localStorage.getItem('dv-font') || current; } catch {}

    const select = document.createElement('select');
    select.className = 'dv-select';
    select.innerHTML =
      '<option value="Roboto,-apple-system,system-ui,sans-serif">Default (Sans)</option>' +
      '<option value="Georgia,\'Times New Roman\',serif">Serif</option>' +
      '<option value="\'Courier New\',monospace">Monospace</option>' +
      '<option value="Verdana,sans-serif">Verdana</option>';
    select.value = current;
    select.onchange = () => dvApplyFont(select.value);
    section.appendChild(select);
  }
});
