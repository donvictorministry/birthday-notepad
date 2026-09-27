/* ==========================================================================
   to-do.js — requires core.js loaded first.
   To-Do is its own full-page modal (like Note's editor), not a section
   crammed into the Settings side panel. Settings just gets a button
   that opens this page. Persisted in localStorage.
   ========================================================================== */

/* ---------- Inject the full-page To-Do modal ---------- */
document.body.insertAdjacentHTML('beforeend', `
<div class="dv-fullmenu" id="dvTodoPage" role="dialog" aria-modal="true" aria-label="To-Do List">
 <div class="dv-fullmenu-head dv-fullmenu-head-accent">
  <div style="width:42px"></div>
  <div class="dv-side-title">To-Do List</div>
  <button class="dv-close" id="dvTodoCloseBtn" aria-label="Close">&times;</button>
 </div>
 <div class="dv-fullmenu-body">
  <div style="display:flex;gap:8px;margin-bottom:16px">
   <input id="dvTodoInput" class="dv-input" type="text" placeholder="Add a task" autocomplete="off">
   <button class="dv-btn dv-primary" id="dvTodoAddBtn" style="width:auto;padding:0 20px">+</button>
  </div>
  <div id="dvTodoEmpty" class="dv-info-page"><p>Nothing on your list yet. Add your first task above.</p></div>
  <div id="dvTodoList"></div>
 </div>
</div>
`);

let dvTodos = [];
try { dvTodos = JSON.parse(localStorage.getItem('dv-todos') || '[]'); } catch { dvTodos = []; }
const dvSaveTodos = () => { try { localStorage.setItem('dv-todos', JSON.stringify(dvTodos)); } catch {} };

const dvTodoPage = dvId('dvTodoPage');
const dvTodoListEl = dvId('dvTodoList');
const dvTodoEmptyEl = dvId('dvTodoEmpty');

const dvRenderTodos = () => {
  dvTodoListEl.innerHTML = '';
  dvTodoEmptyEl.classList.toggle('dv-hidden', dvTodos.length > 0);
  dvTodos.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'dv-todo-row';
    row.innerHTML = '<input type="checkbox" ' + (t.done ? 'checked' : '') + '>' +
      '<span class="dv-todo-text' + (t.done ? ' done' : '') + '"></span>' +
      '<button class="dv-todo-del">&times;</button>';
    row.querySelector('span').textContent = t.text;
    row.querySelector('input').onchange = e => { dvTodos[i].done = e.target.checked; dvSaveTodos(); dvRenderTodos(); };
    row.querySelector('.dv-todo-del').onclick = () => { dvTodos.splice(i, 1); dvSaveTodos(); dvRenderTodos(); };
    dvTodoListEl.appendChild(row);
  });
};

const dvOpenTodoPage = () => { dvRenderTodos(); dvTodoPage.classList.add('open'); };
const dvCloseTodoPage = () => dvTodoPage.classList.remove('open');
dvId('dvTodoCloseBtn').onclick = dvCloseTodoPage;
dvId('dvTodoAddBtn').onclick = () => {
  const input = dvId('dvTodoInput');
  const text = input.value.trim();
  if (!text) return;
  dvTodos.push({ text, done: false });
  dvSaveTodos(); dvRenderTodos();
  input.value = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && dvTodoPage.classList.contains('open')) dvCloseTodoPage();
});

/* ---------- Settings entry: a simple button that opens the full page ---------- */
dvRegisterSettingsModule({
  id: 'to-do',
  title: null,
  render(section) {
    const btn = document.createElement('button');
    btn.className = 'dv-side-item dv-color-primary';
    btn.textContent = 'To-Do List';
    btn.onclick = () => { dvCloseSettings(); dvOpenTodoPage(); };
    section.appendChild(btn);
  }
});
