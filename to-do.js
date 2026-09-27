/* to-do.js — requires core.js loaded first */
let dvTodos = [];
try { dvTodos = JSON.parse(localStorage.getItem('dv-todos') || '[]'); } catch { dvTodos = []; }
const dvSaveTodos = () => { try { localStorage.setItem('dv-todos', JSON.stringify(dvTodos)); } catch {} };

dvRegisterSettingsModule({
  id: 'to-do',
  title: 'To-Do List',
  render(section) {
    section.innerHTML =
      '<div style="display:flex;gap:8px;margin-bottom:10px">' +
        '<input id="dvTodoInput" class="dv-input" type="text" placeholder="Add a task" autocomplete="off" style="min-height:40px">' +
        '<button class="dv-btn dv-primary" id="dvTodoAddBtn" style="width:auto;padding:0 16px;min-height:40px">+</button>' +
      '</div>' +
      '<div id="dvTodoList"></div>';

    const list = section.querySelector('#dvTodoList');
    const render = () => {
      list.innerHTML = '';
      dvTodos.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'dv-todo-row';
        row.innerHTML = '<input type="checkbox" ' + (t.done ? 'checked' : '') + '>' +
          '<span class="dv-todo-text' + (t.done ? ' done' : '') + '"></span>' +
          '<button class="dv-todo-del">&times;</button>';
        row.querySelector('span').textContent = t.text;
        row.querySelector('input').onchange = e => { dvTodos[i].done = e.target.checked; dvSaveTodos(); render(); };
        row.querySelector('.dv-todo-del').onclick = () => { dvTodos.splice(i, 1); dvSaveTodos(); render(); };
        list.appendChild(row);
      });
    };
    render();

    section.querySelector('#dvTodoAddBtn').onclick = () => {
      const input = section.querySelector('#dvTodoInput');
      const text = input.value.trim();
      if (!text) return;
      dvTodos.push({ text, done: false });
      dvSaveTodos(); render();
      input.value = '';
    };
  }
});
