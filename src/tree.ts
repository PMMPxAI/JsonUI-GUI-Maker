// ==========================================================
// tree.ts — Eclipse-style layers tree
// ==========================================================
import type { AppState, UINode } from './types.ts';

const SW = window.SW;

const ICON_LETTER: Record<string, string> = {
  panel: 'P', stack_panel: 'S', image: 'I', label: 'L',
  button: 'B', input_panel: 'N', scrolling_panel: 'C'
};

SW.renderTree = function (state: AppState): void {
  const tree = document.getElementById('tree');
  const counter = document.getElementById('counter');
  if (!tree) return;

  let searchWrap = document.getElementById('tree-search-wrap');
  if (!searchWrap) {
    searchWrap = document.createElement('div');
    searchWrap.id = 'tree-search-wrap';
    searchWrap.className = 'tree-search-wrap';
    searchWrap.innerHTML = `<input id="tree-search" placeholder="Filtrer…" class="tree-search-input" />`;
    tree.parentElement!.insertBefore(searchWrap, tree);
    searchWrap.querySelector('#tree-search')!.addEventListener('input', () => SW.renderTree(state));
  }

  const searchInput = document.getElementById('tree-search') as HTMLInputElement | null;
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  tree.innerHTML = '';
  let count = 0;
  if (state.tree && state.tree.children) {
    for (const c of state.tree.children) {
      if (query && !matchesSearch(c, query)) continue;
      tree.appendChild(buildRow(c, state, query));
      SW.walk(c, () => count++);
    }
  }
  if (counter) counter.textContent = count + ' contrôle' + (count > 1 ? 's' : '');
};

function matchesSearch(el: UINode, query: string): boolean {
  if ((el.name || '').toLowerCase().includes(query)) return true;
  if ((el.props && el.props.type || '').toLowerCase().includes(query)) return true;
  if (el.children) {
    for (const c of el.children) {
      if (matchesSearch(c, query)) return true;
    }
  }
  return false;
}

function buildRow(el: UINode, state: AppState, query: string): HTMLElement {
  const wrap = document.createElement('div');
  const row = document.createElement('div');
  row.className = 'tree-row';
  if (state.selectedId === el.id) row.classList.add('selected');
  row.dataset.id = el.id;

  const chev = document.createElement('span');
  chev.className = 'chev';
  if (el.children && el.children.length) {
    chev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:10px;height:10px"><polyline points="9 18 15 12 9 6"/></svg>`;
    if (state.expanded[el.id] !== false) chev.classList.add('open');
  } else {
    chev.style.visibility = 'hidden';
  }
  chev.addEventListener('click', (e: MouseEvent) => {
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
  const nameStr = el.name || el.id;
  if (query && nameStr.toLowerCase().includes(query)) {
    const idx = nameStr.toLowerCase().indexOf(query);
    name.innerHTML = escName(nameStr.slice(0, idx)) + '<mark class="tree-highlight">' + escName(nameStr.slice(idx, idx + query.length)) + '</mark>' + escName(nameStr.slice(idx + query.length));
  } else {
    name.textContent = nameStr;
  }
  row.appendChild(name);

  const actions = document.createElement('span');
  actions.className = 'actions';
  const addBtn = document.createElement('button');
  addBtn.title = 'Enfant';
  addBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="width:11px;height:11px"><path d="M12 5v14M5 12h14"/></svg>`;
  addBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); SW.pickAndAddChild(el.id); });
  const dup = document.createElement('button');
  dup.title = 'Dupliquer';
  dup.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  dup.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); SW.duplicateElement(el.id); });
  const del = document.createElement('button');
  del.title = 'Supprimer';
  del.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>`;
  del.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); SW.deleteElement(el.id); });
  actions.appendChild(addBtn); actions.appendChild(dup); actions.appendChild(del);
  row.appendChild(actions);

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = el.props.type || '';
  row.appendChild(badge);

  row.addEventListener('click', () => SW.selectElement(el.id));

  row.draggable = true;
  row.addEventListener('dragstart', (e: DragEvent) => {
    e.dataTransfer!.setData('text/sw-id', el.id);
    e.dataTransfer!.effectAllowed = 'move';
  });
  row.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    row.classList.add('drop-target');
  });
  row.addEventListener('dragleave', () => row.classList.remove('drop-target'));
  row.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();
    row.classList.remove('drop-target');
    const dragId = e.dataTransfer!.getData('text/sw-id');
    if (!dragId || dragId === el.id) return;
    SW.moveElement(dragId, el.id);
  });

  wrap.appendChild(row);

  if (el.children && el.children.length && state.expanded[el.id] !== false) {
    const ch = document.createElement('div');
    ch.className = 'tree-children';
    for (const c of el.children) {
      if (query && !matchesSearch(c, query)) continue;
      ch.appendChild(buildRow(c, state, query));
    }
    wrap.appendChild(ch);
  }
  return wrap;
}

function escName(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
