// ==========================================================
// tree.js — Eclipse-style layers tree
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  const ICON_LETTER = {
    panel: 'P', stack_panel: 'S', image: 'I', label: 'L',
    button: 'B', input_panel: 'N', scrolling_panel: 'C'
  };

  SW.renderTree = function (state) {
    const tree = document.getElementById('tree');
    const counter = document.getElementById('counter');
    if (!tree) return;
    tree.innerHTML = '';
    let count = 0;
    if (state.tree && state.tree.children) {
      for (const c of state.tree.children) {
        tree.appendChild(buildRow(c, state));
        SW.walk(c, () => count++);
      }
    }
    if (counter) counter.textContent = count + ' contrôle' + (count > 1 ? 's' : '');
  };

  function buildRow(el, state) {
    const wrap = document.createElement('div');
    const row = document.createElement('div');
    row.className = 'tree-row';
    if (state.selectedId === el.id) row.classList.add('selected');
    row.dataset.id = el.id;

    // Chevron
    const chev = document.createElement('span');
    chev.className = 'chev';
    if (el.children && el.children.length) {
      chev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:10px;height:10px"><polyline points="9 18 15 12 9 6"/></svg>`;
      if (state.expanded[el.id] !== false) chev.classList.add('open');
    } else {
      chev.style.visibility = 'hidden';
    }
    chev.addEventListener('click', (e) => {
      e.stopPropagation();
      state.expanded[el.id] = state.expanded[el.id] === false;
      SW.refresh();
    });
    row.appendChild(chev);

    const ti = document.createElement('span');
    ti.className = 'type-icon ti-' + (el.props.type || 'default');
    ti.textContent = ICON_LETTER[el.props.type] || '·';
    row.appendChild(ti);

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = el.name || el.id;
    row.appendChild(name);

    // Actions
    const actions = document.createElement('span');
    actions.className = 'actions';
    const addBtn = document.createElement('button');
    addBtn.title = 'Enfant';
    addBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="width:11px;height:11px"><path d="M12 5v14M5 12h14"/></svg>`;
    addBtn.addEventListener('click', (e) => { e.stopPropagation(); SW.pickAndAddChild(el.id); });
    const dup = document.createElement('button');
    dup.title = 'Dupliquer';
    dup.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    dup.addEventListener('click', (e) => { e.stopPropagation(); SW.duplicateElement(el.id); });
    const del = document.createElement('button');
    del.title = 'Supprimer';
    del.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>`;
    del.addEventListener('click', (e) => { e.stopPropagation(); SW.deleteElement(el.id); });
    actions.appendChild(addBtn); actions.appendChild(dup); actions.appendChild(del);
    row.appendChild(actions);

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = el.props.type || '';
    row.appendChild(badge);

    row.addEventListener('click', () => SW.selectElement(el.id));

    // Drag reorder
    row.draggable = true;
    row.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/sw-id', el.id);
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      const dragId = e.dataTransfer.getData('text/sw-id');
      if (!dragId || dragId === el.id) return;
      SW.moveElement(dragId, el.id);
    });

    wrap.appendChild(row);

    if (el.children && el.children.length && state.expanded[el.id] !== false) {
      const ch = document.createElement('div');
      ch.className = 'tree-children';
      for (const c of el.children) ch.appendChild(buildRow(c, state));
      wrap.appendChild(ch);
    }
    return wrap;
  }

})(window.SW);
