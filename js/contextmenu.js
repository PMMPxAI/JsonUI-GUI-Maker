// ==========================================================
// contextmenu.js — Eclipse-style right-click context menu
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  let menuEl = null;

  function ensureMenu() {
    if (menuEl) return menuEl;
    menuEl = document.createElement('div');
    menuEl.className = 'ecl-ctx-menu';
    document.body.appendChild(menuEl);
    document.addEventListener('click', () => closeMenu(), true);
    document.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('.ecl-ctx-menu')) closeMenu();
    }, true);
    window.addEventListener('blur', () => closeMenu());
    window.addEventListener('resize', () => closeMenu());
    return menuEl;
  }
  function closeMenu() {
    if (menuEl) menuEl.classList.remove('open');
  }

  SW.openContextMenu = function (e, items) {
    e.preventDefault();
    const m = ensureMenu();
    m.innerHTML = '';
    for (const it of items) {
      if (it.separator) {
        const sep = document.createElement('div');
        sep.className = 'ecl-ctx-sep';
        m.appendChild(sep);
        continue;
      }
      const row = document.createElement('button');
      row.className = 'ecl-ctx-item';
      if (it.danger) row.classList.add('danger');
      if (it.disabled) row.classList.add('disabled');
      row.innerHTML = `
        <span class="ico">${it.icon || ''}</span>
        <span class="lbl">${it.label}</span>
        <span class="shortcut">${it.shortcut || ''}</span>
      `;
      if (!it.disabled) {
        row.onclick = () => { closeMenu(); it.action && it.action(); };
      }
      m.appendChild(row);
    }
    // Position
    const pad = 4;
    m.style.left = '0px'; m.style.top = '0px';
    m.classList.add('open');
    const w = m.offsetWidth, h = m.offsetHeight;
    let x = e.clientX, y = e.clientY;
    if (x + w + pad > window.innerWidth) x = window.innerWidth - w - pad;
    if (y + h + pad > window.innerHeight) y = window.innerHeight - h - pad;
    m.style.left = x + 'px';
    m.style.top = y + 'px';
  };

  // -------- Context menu actions for an element --------
  SW.elementContextMenu = function (e, elementId) {
    e.preventDefault(); e.stopPropagation();
    SW.selectElement(elementId);
    const state = SW.state;
    const el = SW.findById(state.tree, elementId);
    if (!el) return;
    const parent = SW.findParent(state.tree, elementId);
    const siblings = parent ? parent.children : [];
    const idx = siblings.findIndex(c => c.id === elementId);
    const canContainer = ['panel','stack_panel','button','input_panel','scrolling_panel'].includes(el.props.type);

    const items = [
      {
        label: 'Ajouter un enfant…',
        icon: ico('plus'),
        shortcut: '',
        disabled: !canContainer,
        action: () => SW.openPicker(null, (picked) => {
          if (picked) addAsChild(elementId, picked);
        }, { parentId: elementId })
      },
      {
        label: 'Envelopper dans un Panel',
        icon: ico('box'),
        action: () => wrapInPanel(elementId)
      },
      { separator: true },
      {
        label: 'Renommer',
        icon: ico('edit'),
        shortcut: 'F2',
        action: () => renameElement(elementId)
      },
      {
        label: 'Dupliquer',
        icon: ico('copy'),
        shortcut: 'Ctrl+D',
        action: () => SW.duplicateElement(elementId)
      },
      {
        label: 'Copier le JSON',
        icon: ico('clipboard'),
        action: () => copyElementJson(el)
      },
      {
        label: 'Coller comme enfant',
        icon: ico('paste'),
        disabled: !canContainer || !SW.clipboardEl,
        action: () => pasteAsChild(elementId)
      },
      { separator: true },
      {
        label: 'Monter',
        icon: ico('up'),
        shortcut: 'Alt+↑',
        disabled: idx <= 0,
        action: () => moveSibling(elementId, -1)
      },
      {
        label: 'Descendre',
        icon: ico('down'),
        shortcut: 'Alt+↓',
        disabled: idx < 0 || idx >= siblings.length - 1,
        action: () => moveSibling(elementId, 1)
      },
      { separator: true },
      {
        label: 'Changer le type…',
        icon: ico('swap'),
        action: () => changeType(elementId)
      },
      { separator: true },
      {
        label: 'Supprimer',
        icon: ico('trash'),
        shortcut: 'Suppr',
        danger: true,
        action: () => SW.deleteElement(elementId)
      }
    ];
    SW.openContextMenu(e, items);
  };

  // -------- Context menu on empty preview / stage --------
  SW.stageContextMenu = function (e) {
    e.preventDefault();
    const items = [
      {
        label: 'Ajouter un composant…',
        icon: ico('plus'),
        action: () => SW.openPicker(null, (picked) => { if (picked) SW.addRootFromLibrary(picked); })
      },
      { separator: true },
      {
        label: 'Coller',
        icon: ico('paste'),
        disabled: !SW.clipboardEl,
        action: () => pasteAsRoot()
      },
      { separator: true },
      {
        label: 'Désélectionner',
        icon: ico('x'),
        action: () => SW.selectElement(null)
      }
    ];
    SW.openContextMenu(e, items);
  };

  // -------- Helpers --------
  function addAsChild(parentId, picked) {
    const parent = SW.findById(SW.state.tree, parentId);
    if (!parent) return;
    parent.children = parent.children || [];
    const el = cloneFromLib(picked);
    parent.children.push(el);
    SW.state.expanded[parentId] = true;
    SW.state.selectedId = el.id;
    SW.markDirty(true);
    SW.refresh();
  }
  SW.addRootFromLibrary = function (picked) {
    const el = cloneFromLib(picked);
    SW.state.tree.children.push(el);
    SW.state.selectedId = el.id;
    SW.state.expanded[el.id] = true;
    SW.markDirty(true);
    SW.refresh();
  };

  function cloneFromLib(libItem) {
    // If it's a type-only placeholder (new default)
    if (libItem.isDefault) {
      const t = libItem.type;
      return {
        id: SW.uid(t), name: t + '_' + Math.floor(Math.random() * 1000),
        type: t, props: SW.defaultProps(t), children: []
      };
    }
    // Build from raw Bedrock data
    const raw = libItem.data;
    const fake = { namespace: 'tmp', [libItem.name || 'ctl']: raw };
    const tree = SW.fromBedrock(fake);
    const el = tree.children[0];
    if (el) {
      // give unique name
      el.name = (libItem.name || el.type) + '_' + Math.floor(Math.random() * 1000);
    }
    return el || {
      id: SW.uid('panel'), name: 'panel_1', type: 'panel',
      props: SW.defaultProps('panel'), children: []
    };
  }

  function renameElement(id) {
    const el = SW.findById(SW.state.tree, id);
    if (!el) return;
    const name = prompt('Nom du composant:', el.name || '');
    if (name == null) return;
    el.name = name.trim();
    SW.markDirty(true);
    SW.refresh();
  }

  function copyElementJson(el) {
    SW.clipboardEl = SW.clone(el);
    navigator.clipboard.writeText(JSON.stringify(el.props, null, 2)).catch(()=>{});
    SW.toast('Copié: ' + (el.name || el.id));
  }

  function pasteAsChild(parentId) {
    if (!SW.clipboardEl) return;
    const parent = SW.findById(SW.state.tree, parentId);
    if (!parent) return;
    const copy = SW.clone(SW.clipboardEl);
    reassignIds(copy);
    copy.name = (copy.name || 'pasted') + '_copy';
    parent.children = parent.children || [];
    parent.children.push(copy);
    SW.state.expanded[parentId] = true;
    SW.state.selectedId = copy.id;
    SW.markDirty(true);
    SW.refresh();
  }
  function pasteAsRoot() {
    if (!SW.clipboardEl) return;
    const copy = SW.clone(SW.clipboardEl);
    reassignIds(copy);
    copy.name = (copy.name || 'pasted') + '_copy';
    SW.state.tree.children.push(copy);
    SW.state.selectedId = copy.id;
    SW.markDirty(true);
    SW.refresh();
  }
  function reassignIds(el) {
    el.id = SW.uid(el.props && el.props.type ? el.props.type : 'el');
    if (el.children) el.children.forEach(reassignIds);
  }

  function moveSibling(id, delta) {
    const parent = SW.findParent(SW.state.tree, id);
    if (!parent || !parent.children) return;
    const i = parent.children.findIndex(c => c.id === id);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= parent.children.length) return;
    const [el] = parent.children.splice(i, 1);
    parent.children.splice(j, 0, el);
    SW.markDirty(true);
    SW.refresh();
  }

  function wrapInPanel(id) {
    const el = SW.findById(SW.state.tree, id);
    const parent = SW.findParent(SW.state.tree, id);
    if (!el || !parent) return;
    const idx = parent.children.findIndex(c => c.id === id);
    const wrapper = {
      id: SW.uid('panel'),
      name: 'wrapper',
      type: 'panel',
      props: { type: 'panel', size: SW.clone(el.props.size) || ['100%c', '100%c'],
               offset: SW.clone(el.props.offset) || [0, 0],
               anchor_from: el.props.anchor_from || 'center',
               anchor_to: el.props.anchor_to || 'center' },
      children: [el]
    };
    // Reset child transform
    el.props.offset = [0, 0];
    el.props.anchor_from = 'center';
    el.props.anchor_to = 'center';
    parent.children.splice(idx, 1, wrapper);
    SW.state.expanded[wrapper.id] = true;
    SW.state.selectedId = wrapper.id;
    SW.markDirty(true);
    SW.refresh();
  }

  function changeType(id) {
    const el = SW.findById(SW.state.tree, id);
    if (!el) return;
    const types = ['panel','stack_panel','image','label','button','input_panel'];
    SW.openPicker(null, (picked) => {
      if (!picked) return;
      el.props.type = picked.type;
      el.type = picked.type;
      SW.markDirty(true);
      SW.refresh();
    }, { filterTypes: types, title: 'Changer le type en…' });
  }

  // --- Small inline SVG icons ---
  function ico(name) {
    const s = {
      plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
      box:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
      edit:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
      clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="2" width="8" height="4" rx="1"/><rect x="4" y="6" width="16" height="16" rx="2"/></svg>',
      paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
      up:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
      down:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
      swap:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18"/></svg>',
      trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
      x:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
    };
    return s[name] || '';
  }

})(window.SW);
