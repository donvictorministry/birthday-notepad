/* accent-color-selector.js — requires core.js loaded first */
dvRegisterSettingsModule({
  id: 'accent-color',
  title: 'Accent Color',
  render(section) {
    const presets = ['#1877F2', '#DB2777', '#DC2626', '#EA580C', '#D97706', '#16A34A', '#0891B2', '#7C3AED', '#475569', '#111827'];
    let current = '#1877F2';
    try { current = localStorage.getItem('dv-accent') || current; } catch {}

    const row = document.createElement('div');
    row.className = 'dv-swatches-row';
    presets.forEach(hex => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dv-swatch' + (hex === current ? ' active' : '');
      b.style.background = hex;
      b.dataset.hex = hex;
      b.setAttribute('aria-label', 'Accent color ' + hex);
      b.onclick = () => dvApplyAccent(hex);
      row.appendChild(b);
    });
    section.appendChild(row);
  }
});
