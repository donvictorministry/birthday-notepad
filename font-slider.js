/* font-slider.js — requires core.js loaded first */
dvRegisterSettingsModule({
  id: 'font-slider',
  title: 'Text Size',
  render(section) {
    let current = 19;
    try { current = +(localStorage.getItem('dv-font-size') || 19); } catch {}

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 16; slider.max = 24; slider.step = 1;
    slider.value = current;
    slider.style.width = '100%';
    slider.oninput = () => dvApplyFontSize(slider.value);
    section.appendChild(slider);
  }
});
