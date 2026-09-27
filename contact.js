/* contact.js — requires core.js loaded first */
dvRegisterLeftPage({
  id: 'contact',
  label: 'Contact',
  html:
    '<p>[Organization Name]<br>[Street Address, City, Country]<br>Support hours: Mon-Fri, 9am-5pm</p>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:18px">' +
      '<a class="dv-quick-btn" href="mailto:info@yourorganization.org" style="text-decoration:none">' +
        '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h16V7.4l-8 5.6z"/></svg>' +
        '<span style="font-size:13px">Email</span>' +
      '</a>' +
      '<a class="dv-quick-btn" href="tel:+10000000000" style="text-decoration:none">' +
        '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1z"/></svg>' +
        '<span style="font-size:13px">Phone</span>' +
      '</a>' +
      '<a class="dv-quick-btn" href="https://wa.me/10000000000" target="_blank" rel="noopener" style="text-decoration:none">' +
        '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 0 1 6.8 12.2l-.3.5.7 2.5-2.6-.7-.5.3A8 8 0 1 1 12 4z"/></svg>' +
        '<span style="font-size:13px">WhatsApp</span>' +
      '</a>' +
      '<a class="dv-quick-btn" href="https://facebook.com/yourpage" target="_blank" rel="noopener" style="text-decoration:none">' +
        '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M14 21v-7h2.4l.4-3H14V9c0-.9.2-1.5 1.6-1.5H17V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H8v3h2.6v7z"/></svg>' +
        '<span style="font-size:13px">Facebook</span>' +
      '</a>' +
    '</div>'
});
