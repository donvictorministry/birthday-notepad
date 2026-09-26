/* ==========================================================================
   dictionary.js — requires core.js loaded first.
   "Smart Dictionary": cascades through multiple live sources so a lookup
   almost always returns something useful, even if one service is down.
     1. api.dictionaryapi.dev  — real dictionary definitions
     2. Wikipedia REST summary  — encyclopedic fallback
     3. Wiktionary (MediaWiki API) — wiki-dictionary fallback
     4. Google search link — last resort, opens in a new tab
   This is a deliberate, explicit exception to the app's zero-dependency
   rule. Requires an internet connection.
   ========================================================================== */

const dvFetchWithTimeout = (url, ms = 7000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
};

/* ---------- Source 1: api.dictionaryapi.dev ---------- */
const dvTryDictionaryApi = async word => {
  const res = await dvFetchWithTimeout('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
  if (!res.ok) return null;
  const data = await res.json();
  const entry = data[0];
  if (!entry) return null;
  const phon = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text) || {}).text || '';
  let html = '<p class="dv-dict-word">' + entry.word + '</p>';
  if (phon) html += '<p class="dv-dict-phonetic">' + phon + '</p>';
  (entry.meanings || []).forEach(m => {
    html += '<p class="dv-dict-pos">' + m.partOfSpeech + '</p>';
    (m.definitions || []).slice(0, 3).forEach(d => {
      html += '<p class="dv-dict-def">' + d.definition + '</p>';
      if (d.example) html += '<p class="dv-dict-example">"' + d.example + '"</p>';
    });
  });
  return { html, source: 'Dictionary' };
};

/* ---------- Source 2: Wikipedia REST summary ---------- */
const dvTryWikipedia = async word => {
  const res = await dvFetchWithTimeout('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(word));
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.extract) return null;
  const html =
    '<p class="dv-dict-word">' + (data.title || word) + '</p>' +
    '<p class="dv-dict-pos">From Wikipedia</p>' +
    '<p class="dv-dict-def">' + data.extract + '</p>';
  return { html, source: 'Wikipedia' };
};

/* ---------- Source 3: Wiktionary (MediaWiki action API, CORS-enabled via origin=*) ---------- */
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
    '<p class="dv-dict-def">' + page.extract.replace(/\n+/g, '<br>') + '</p>';
  return { html, source: 'Wiktionary' };
};

/* ---------- Cascade: try each source in order, fall back to Google search ---------- */
const dvDictLookup = async (input, resultsEl, emptyEl) => {
  const word = input.value.trim();
  if (!word) { dvShow('Type a word to search.', 'error'); return; }
  dvShowSpinner();
  resultsEl.innerHTML = '';
  emptyEl.classList.add('dv-hidden');

  const sources = [dvTryDictionaryApi, dvTryWikipedia, dvTryWiktionary];
  let found = null;
  let anySourceReachable = false;

  for (const trySource of sources) {
    try {
      const result = await trySource(word);
      anySourceReachable = true;
      if (result) { found = result; break; }
    } catch {
      // this source failed or timed out — move on to the next one
    }
  }

  dvHideSpinner();

  if (found) {
    resultsEl.innerHTML = '<div class="dv-card">' + found.html + '</div>';
    return;
  }

  emptyEl.classList.remove('dv-hidden');
  const googleUrl = 'https://www.google.com/search?q=' + encodeURIComponent(word);
  resultsEl.innerHTML =
    '<div class="dv-card">' +
      '<p>No definition found in Dictionary, Wikipedia or Wiktionary for "' + word + '".</p>' +
      '<a class="dv-btn dv-primary" style="text-decoration:none;margin-top:10px" href="' + googleUrl + '" target="_blank" rel="noopener">Search Google instead</a>' +
    '</div>';

  if (!anySourceReachable) {
    dvShow('Dictionary services are unavailable right now. Check your connection.', 'error');
  } else {
    dvShow('No definition found for that word.', 'error');
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
      '<button class="dv-btn dv-primary" id="dvDictSearchBtn" style="margin-bottom:16px">Search</button>' +
      '<div id="dvDictResults"></div>' +
      '<div id="dvDictEmpty" class="dv-info-page"><p>Search any word — this looks across a live dictionary, Wikipedia and Wiktionary automatically.</p></div>';

    const input = panel.querySelector('#dvDictInput');
    const resultsEl = panel.querySelector('#dvDictResults');
    const emptyEl = panel.querySelector('#dvDictEmpty');
    panel.querySelector('#dvDictSearchBtn').onclick = () => dvDictLookup(input, resultsEl, emptyEl);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') dvDictLookup(input, resultsEl, emptyEl); });
  }
});
