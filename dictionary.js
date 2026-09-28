/* ==========================================================================
   dictionary.js — requires core.js loaded first.
   Two ways to search:
     - "Smart (All Sources)" — cascades Dictionary -> Wikipedia -> Wiktionary,
       falling back to a Google search link if none answer.
     - A specific source picked from the dropdown — queries ONLY that one.
   Requires an internet connection. Deliberate, explicit exception to the
   app's zero-dependency rule.

   Loading indicator: a top-of-screen Google-style sliding line bar
   (self-injected here, independent of core.js's circular spinner) —
   full width edge-to-edge, 12px thick, sitting 15px below the header.
   Shows on every search, vanishes when the search finishes.
   ========================================================================== */

/* ---------- Inject the top loading bar (own CSS + markup, self-contained) ---------- */
document.head.insertAdjacentHTML('beforeend', `
<style>
.dv-loadbar{
  position:fixed; left:0; right:0;
  top:calc(60px + env(safe-area-inset-top) + 15px);
  height:12px; overflow:hidden; z-index:110;
  display:none; background:transparent;
}
.dv-loadbar.show{ display:block; }
.dv-loadbar-inner{
  position:absolute; top:0; left:-40%; height:100%; width:40%;
  background:#1877F2;
  border-radius:6px;
  animation: dvLoadBarSlide 1.1s ease-in-out infinite;
}
@keyframes dvLoadBarSlide{
  0%   { left:-40%; }
  100% { left:100%; }
}
@media (prefers-reduced-motion: reduce){
  .dv-loadbar-inner{ animation:none; left:0; width:100%; }
}
</style>
`);
document.body.insertAdjacentHTML('beforeend', '<div class="dv-loadbar" id="dvLoadBar"><div class="dv-loadbar-inner"></div></div>');
const dvLoadBar = document.getElementById('dvLoadBar');
const dvShowLoadBar = () => dvLoadBar.classList.add('show');
const dvHideLoadBar = () => dvLoadBar.classList.remove('show');

const dvFetchWithTimeout = (url, ms = 7000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
};

const dvFooterHtml =
  '<hr style="margin:14px 0;border-color:rgba(150,150,150,0.2)">' +
  '<div style="display:flex;align-items:center;justify-content:center;flex-wrap:nowrap;white-space:nowrap;gap:6px;font-size:15px;opacity:0.85;padding-bottom:8px;overflow-x:auto;">' +
    '<span>Developed by</span>' +
    '<strong style="font-weight:800;">Rev. Don Victor, PhD</strong>' +
    '<span>&bull;</span>' +
    '<a href="https://donvictoracademy.net/" style="color:red;text-decoration:none;font-weight:700;" target="_blank" rel="noopener">View Portfolio</a>' +
  '</div>';

/* ---------- Source: Original Google Search (Reliable Redirect) ---------- */
const dvGoogleSearchHtml = word => {
  const googleUrl = 'https://www.google.com/search?q=' + encodeURIComponent(word);
  return '<p style="font-size:19px;">Opening Google search results in a new tab for "' + word + '".</p>' +
    '<a class="dv-btn dv-primary" style="text-decoration:none;margin-top:10px;display:block;text-align:center;" href="' + googleUrl + '" target="_blank" rel="noopener">Open Google Search</a>';
};

/* ---------- Source: Datamuse API (Keyless Dictionary Mode) ---------- */
const dvTryDatamuse = async word => {
  const res = await dvFetchWithTimeout('https://api.datamuse.com/words?sp=' + encodeURIComponent(word) + '&md=d&max=1');
  if (!res.ok) return null;
  const data = await res.json();
  const entry = data[0];
  if (!entry || !entry.defs) return null;
  let html = '<p class="dv-dict-word">' + entry.word + '</p>';
  entry.defs.slice(0, 3).forEach(d => {
    const parts = d.split('\t');
    if (parts.length > 1) {
      html += '<p class="dv-dict-pos">' + parts[0] + '</p><p class="dv-dict-def" style="font-size:19px;">' + parts[1] + '</p>';
    } else {
      html += '<p class="dv-dict-def" style="font-size:19px;">' + d + '</p>';
    }
  });
  return { html };
};

/* ---------- Source: DuckDuckGo Instant Answers (Keyless) ---------- */
const dvTryDuckDuckGo = async word => {
  const res = await dvFetchWithTimeout('https://api.duckduckgo.com/?q=' + encodeURIComponent(word) + '&format=json&no_html=1');
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.AbstractText) return null;
  return { html: '<p class="dv-dict-word">' + (data.Heading || word) + '</p><p class="dv-dict-pos">DuckDuckGo Answer</p><p class="dv-dict-def" style="font-size:19px;">' + data.AbstractText + '</p>' };
};

/* ---------- Source: Wikipedia REST summary ---------- */
const dvTryWikipedia = async word => {
  const res = await dvFetchWithTimeout('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(word));
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.extract) return null;
  const html =
    '<p class="dv-dict-word">' + (data.title || word) + '</p>' +
    '<p class="dv-dict-pos">From Wikipedia</p>' +
    '<p class="dv-dict-def" style="font-size:19px;">' + data.extract + '</p>';
  return { html };
};

/* ---------- Source: Wiktionary (MediaWiki action API, CORS via origin=*) ---------- */
const dvTryWiktionary = async word => {
  const url = 'https://en.wiktionary.org/w/api.php?action=query&titles=' +
    encodeURIComponent(word) + '&prop=extracts&exintro&explaintext&format=json&origin=*';
  const res = await dvFetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  const pages = (data.query && data.query.pages) || {};
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined || !page.extract) return null;
  const html =
    '<p class="dv-dict-word">' + (page.title || word) + '</p>' +
    '<p class="dv-dict-pos">From Wiktionary</p>' +
    '<p class="dv-dict-def" style="font-size:19px;">' + page.extract.replace(/\n+/g, '<br>') + '</p>';
  return { html };
};

/* ---------- Lookup: either one specific source, or the smart cascade ---------- */
const dvDictLookup = async (input, resultsEl, emptyEl, sourceSelect) => {
  const word = input.value.trim();
  if (!word) { dvShow('Type a word to search.', 'error'); return; }
  const source = sourceSelect.value;

  resultsEl.innerHTML = '';
  emptyEl.classList.add('dv-hidden');

  if (source === 'google') {
    resultsEl.innerHTML = '<div class="dv-card">' + dvGoogleSearchHtml(word) + dvFooterHtml + '</div>';
    window.open('https://www.google.com/search?q=' + encodeURIComponent(word), '_blank');
    return;
  }

  dvShowLoadBar();

  const singleSourceFns = { 
    datamuse: dvTryDatamuse, 
    duckduckgo: dvTryDuckDuckGo,
    wikipedia: dvTryWikipedia, 
    wiktionary: dvTryWiktionary
  };

  try {
    if (source !== 'smart') {
      const result = await singleSourceFns[source](word);
      if (result) { resultsEl.innerHTML = '<div class="dv-card">' + result.html + dvFooterHtml + '</div>'; return; }
      emptyEl.classList.remove('dv-hidden');
      resultsEl.innerHTML = '<div class="dv-card"><p>No result from that source for "' + word + '".</p></div>';
      dvShow('No definition found for that word.', 'error');
      return;
    }

    // Smart cascade: Datamuse -> DuckDuckGo -> Wikipedia -> Wiktionary
    const sources = [dvTryDatamuse, dvTryDuckDuckGo, dvTryWikipedia, dvTryWiktionary];
    let found = null, anySourceReachable = false;
    for (const trySource of sources) {
      try {
        const result = await trySource(word);
        anySourceReachable = true;
        if (result) { found = result; break; }
      } catch { /* move to next source on failure */ }
    }

    if (found) { resultsEl.innerHTML = '<div class="dv-card">' + found.html + dvFooterHtml + '</div>'; return; }

    emptyEl.classList.remove('dv-hidden');
    resultsEl.innerHTML =
      '<div class="dv-card">' +
        '<p style="font-size:19px;">No definition found in dictionaries or wikis for "' + word + '".</p>' +
        '<a class="dv-btn dv-primary" style="text-decoration:none;margin-top:10px;display:block;text-align:center;" href="https://www.google.com/search?q=' + encodeURIComponent(word) + '" target="_blank" rel="noopener">Search Google instead</a>' +
        dvFooterHtml +
      '</div>';
    dvShow(anySourceReachable ? 'No definition found for that word.' : 'Dictionary services are unavailable right now. Check your connection.', 'error');
  } catch {
    emptyEl.classList.remove('dv-hidden');
    dvShow('Dictionary services are unavailable right now. Check your connection.', 'error');
  } finally {
    dvHideLoadBar();
  }
};

dvRegisterTab({
  id: 'dvTabDictionary',
  label: 'Dictionary',
  icon: '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M6 2h12a1 1 0 0 1 1 1v18l-7-3-7 3V3a1 1 0 0 1 1-1z"/></svg>',
  showFab: false,
  render(panel) {
    panel.innerHTML =
      '<div class="dv-search-row">' +
        '<svg class="dv-icon" viewBox="0 0 24 24"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm7.5 10.1 4.4 4.4-1.4 1.4-4.4-4.4z"/></svg>' +
        '<input id="dvDictInput" type="text" placeholder="Look up a word" autocomplete="off">' +
      '</div>' +
      '<div class="dv-field" style="margin-top:0;margin-bottom:14px">' +
        '<select class="dv-select" id="dvDictSource">' +
          '<option value="smart">Smart (All Sources)</option>' +
          '<option value="datamuse">Dictionary (Datamuse)</option>' +
          '<option value="duckduckgo">DuckDuckGo Answers</option>' +
          '<option value="wikipedia">Wikipedia</option>' +
          '<option value="wiktionary">Wiktionary</option>' +
          '<option value="google">Google Live Search</option>' +
        '</select>' +
      '</div>' +
      '<button class="dv-btn dv-primary" id="dvDictSearchBtn" style="margin-bottom:16px">Search</button>' +
      '<div id="dvDictResults"></div>' +
      '<div id="dvDictEmpty" class="dv-info-page"><p>Search any word. "Smart" cascades through Datamuse, DuckDuckGo, Wikipedia, and Wiktionary.</p></div>';

    const input = panel.querySelector('#dvDictInput');
    const resultsEl = panel.querySelector('#dvDictResults');
    const emptyEl = panel.querySelector('#dvDictEmpty');
    const sourceSelect = panel.querySelector('#dvDictSource');
    panel.querySelector('#dvDictSearchBtn').onclick = () => dvDictLookup(input, resultsEl, emptyEl, sourceSelect);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') dvDictLookup(input, resultsEl, emptyEl, sourceSelect); });
  }
});
