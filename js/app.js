// ==========================================================
// app.js — Eclipse UI Forge (main logic)
// ==========================================================
(function () {
  'use strict';
  const SW = window.SW;

  // ---- STATE ----
  const state = {
    tree: emptyRoot('custom_ui'),
    selectedId: null,
    expanded: {},
    namespace: 'custom_ui',
    screen: 'pc',
    zoom: 100,
    bg: 'mc',           // 'mc' | 'dark' | 'grid'
    rulers: false,
    snap: true,
    unicode: false,
    dirty: false,
    filename: 'custom.json',
    history: [], historyIdx: -1
  };
  SW.state = state;

  function emptyRoot(ns) {
    return { id: 'root', name: 'root', type: 'root', props: {}, namespace: ns, children: [] };
  }

  // ---- History (undo/redo) ----
  function snapshot() {
    const snap = JSON.stringify({ tree: state.tree, namespace: state.namespace });
    // drop redo
    state.history = state.history.slice(0, state.historyIdx + 1);
    state.history.push(snap);
    if (state.history.length > 80) state.history.shift();
    state.historyIdx = state.history.length - 1;
  }
  function restore(snapStr) {
    try {
      const data = JSON.parse(snapStr);
      state.tree = data.tree;
      state.namespace = data.namespace;
      state.selectedId = null;
      SW.refresh();
    } catch (e) { /* noop */ }
  }
  SW.undo = function () {
    if (state.historyIdx <= 0) { SW.toast('Rien à annuler'); return; }
    state.historyIdx--;
    restore(state.history[state.historyIdx]);
  };
  SW.redo = function () {
    if (state.historyIdx >= state.history.length - 1) { SW.toast('Rien à refaire'); return; }
    state.historyIdx++;
    restore(state.history[state.historyIdx]);
  };
  // Debounced snapshot
  let snapTimer = null;
  function scheduleSnapshot() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapshot, 300);
  }

  // ---- PUBLIC API ----
  SW.refresh = function () {
    SW.renderTree(state);
    SW.render(state);
    SW.renderInspector(state);
    SW.refreshCode(state);
    SW.updateSelInfo();
  };
  SW.markDirty = function (b) {
    state.dirty = !!b;
    SW.setStatus(b ? 'Modifié' : 'Prêt');
    if (b) scheduleSnapshot();
  };
  SW.selectElement = function (id) {
    state.selectedId = id;
    SW.refresh();
  };
  SW.deleteElement = function (id) {
    const parent = SW.findParent(state.tree, id);
    if (!parent || !parent.children) return;
    parent.children = parent.children.filter(c => c.id !== id);
    if (state.selectedId === id) state.selectedId = null;
    SW.markDirty(true); SW.refresh();
  };
  SW.duplicateElement = function (id) {
    const el = SW.findById(state.tree, id);
    const parent = SW.findParent(state.tree, id);
    if (!el || !parent) return;
    const copy = SW.clone(el);
    reassignIds(copy);
    if (copy.name) copy.name = copy.name + '_copy';
    const idx = parent.children.findIndex(c => c.id === id);
    parent.children.splice(idx + 1, 0, copy);
    state.selectedId = copy.id;
    SW.markDirty(true); SW.refresh();
  };
  function reassignIds(el) {
    el.id = SW.uid(el.props && el.props.type ? el.props.type : 'el');
    if (el.children) el.children.forEach(reassignIds);
  }
  SW.moveElement = function (dragId, overId) {
    if (dragId === overId) return;
    const el = SW.findById(state.tree, dragId);
    const overEl = SW.findById(state.tree, overId);
    if (!el || !overEl) return;
    if (isDescendant(el, overId)) return;
    const parent = SW.findParent(state.tree, dragId);
    if (parent && parent.children) parent.children = parent.children.filter(c => c.id !== dragId);
    const containers = ['panel','stack_panel','button','input_panel','scrolling_panel','grid','custom'];
    if (containers.indexOf(overEl.props.type) >= 0) {
      overEl.children = overEl.children || [];
      overEl.children.push(el);
    } else {
      const overParent = SW.findParent(state.tree, overId);
      if (overParent && overParent.children) {
        const i = overParent.children.findIndex(c => c.id === overId);
        overParent.children.splice(i + 1, 0, el);
      }
    }
    SW.markDirty(true); SW.refresh();
  };
  function isDescendant(el, id) {
    if (!el.children) return false;
    for (const c of el.children) {
      if (c.id === id) return true;
      if (isDescendant(c, id)) return true;
    }
    return false;
  }
  // Add a root element — opens picker (if type given, filters to that type)
  SW.addRootElement = function (type) {
    SW.openPicker(type || null, (picked) => {
      if (!picked) return;
      let el;
      if (picked.isDefault) {
        el = {
          id: SW.uid(picked.type),
          name: picked.type + '_' + (state.tree.children.length + 1),
          type: picked.type,
          props: SW.defaultProps(picked.type),
          children: []
        };
      } else {
        const fake = { namespace: 'tmp', [picked.name || 'ctl']: picked.data };
        const tree = SW.fromBedrock(fake);
        el = tree.children[0];
        if (!el) return;
        el.name = (picked.name || el.type) + '_' + (state.tree.children.length + 1);
      }
      state.tree.children.push(el);
      state.selectedId = el.id;
      state.expanded[el.id] = true;
      SW.markDirty(true); SW.refresh();
    });
  };

  SW.pickAndAddChild = function (parentId) {
    SW.openPicker(null, (picked) => {
      if (!picked) return;
      const parent = SW.findById(state.tree, parentId);
      if (!parent) return;
      parent.children = parent.children || [];
      let el;
      if (picked.isDefault) {
        el = {
          id: SW.uid(picked.type),
          name: picked.type + '_' + (parent.children.length + 1),
          type: picked.type,
          props: SW.defaultProps(picked.type),
          children: []
        };
      } else {
        const fake = { namespace: 'tmp', [picked.name || 'ctl']: picked.data };
        const tree = SW.fromBedrock(fake);
        el = tree.children[0];
        if (!el) return;
        el.name = (picked.name || el.type) + '_' + (parent.children.length + 1);
      }
      parent.children.push(el);
      state.expanded[parentId] = true;
      state.selectedId = el.id;
      SW.markDirty(true); SW.refresh();
    }, { parentId });
  };

  SW.loadFromBedrock = function (json, source) {
    const tree = SW.fromBedrock(json);
    state.tree = tree;
    state.namespace = json.namespace || state.namespace;
    state.selectedId = null;
    state.expanded = {};
    if (source) {
      state.filename = (source.split('/').pop().split('\\').pop());
      const cn = document.getElementById('code-filename'); if (cn) cn.textContent = state.filename;
      const pn = document.getElementById('project-name'); if (pn) pn.textContent = state.filename;
      const pt = document.getElementById('preview-title'); if (pt) pt.textContent = state.filename;
    }
    const nsInput = document.getElementById('namespace'); if (nsInput) nsInput.value = state.namespace;
    state.history = []; state.historyIdx = -1;
    snapshot();
    autoFitZoom();
    SW.markDirty(false);
    SW.refresh();
  };

  SW.loadTemplate = function (id) {
    const tpl = (SW.TEMPLATES || []).find(t => t.id === id);
    if (!tpl) return;
    const tree = tpl.build();
    state.tree = tree;
    state.namespace = tree.namespace || 'custom_ui';
    state.selectedId = null;
    state.expanded = {};
    state.filename = tpl.id + '.json';
    const cn = document.getElementById('code-filename'); if (cn) cn.textContent = state.filename;
    const pn = document.getElementById('project-name'); if (pn) pn.textContent = tpl.name;
    const pt = document.getElementById('preview-title'); if (pt) pt.textContent = tpl.name;
    const ns = document.getElementById('namespace'); if (ns) ns.value = state.namespace;
    state.history = []; state.historyIdx = -1;
    snapshot();
    autoFitZoom();
    SW.markDirty(false);
    SW.refresh();
    SW.toast('Template: ' + tpl.name);
  };

  // Update sel-info pill with selected element's position/size
  SW.updateSelInfo = function (el) {
    const info = document.getElementById('sel-info');
    if (!info) return;
    const sel = el || (state.selectedId ? SW.findById(state.tree, state.selectedId) : null);
    if (!sel) { info.textContent = 'Cliquez un élément'; info.style.display = ''; return; }
    const sz = sel.props.size || [];
    const off = sel.props.offset || [0, 0];
    info.textContent = `${sel.props.type} · ${fmt(sz[0])}×${fmt(sz[1])} · (${off[0]},${off[1]})`;
    function fmt(v) {
      if (typeof v === 'number') return v + 'px';
      return String(v || 'auto');
    }
  };

  // ---- Auto-fit zoom ----
  function autoFitZoom() {
    setTimeout(() => {
      const wrap = document.getElementById('stage-wrap');
      const preview = document.getElementById('preview');
      if (!wrap || !preview) return;
      const screen = SW.SCREEN_SIZES[state.screen];
      const availW = wrap.clientWidth - 96;
      const availH = wrap.clientHeight - 96;
      const fit = Math.min(availW / screen.w, availH / screen.h);
      const z = Math.max(50, Math.min(200, Math.floor(fit * 100)));
      state.zoom = z;
      const zv = document.getElementById('zoom-val'); if (zv) zv.textContent = z + '%';
      SW.render(state);
    }, 30);
  }

  // ---- TEMPLATES MODAL (Starters + Screens from packs) ----
  let _screens = null;
  async function ensureScreens() {
    if (_screens) return _screens;
    try {
      const r = await fetch('samples/screens.json');
      _screens = r.ok ? await r.json() : [];
    } catch { _screens = []; }
    return _screens;
  }

  SW.openTemplatesModal = async function () {
    const grid = document.getElementById('tpl-grid');
    grid.innerHTML = '<div class="text-center text-eclipse-muted text-sm py-12">Chargement de 80 écrans depuis les packs extraits…</div>';
    SW.openModal('modal-templates');
    const screens = await ensureScreens();
    const searchEl = document.getElementById('tpl-search');
    const search = (searchEl.value || '').toLowerCase();
    grid.innerHTML = '';

    // ----- SCREENS FIRST (real packs) -----
    const filtered = (screens || []).filter(s =>
      !search || (s.name && s.name.toLowerCase().includes(search)) ||
      (s.pack && s.pack.toLowerCase().includes(search)) ||
      (s.namespace && s.namespace.toLowerCase().includes(search))
    );
    if (filtered.length) {
      grid.appendChild(section('Écrans extraits des packs', `${filtered.length} JSONs complets · chargeables et modifiables`, 'primary'));
      const wrap = gridWrap();
      for (const s of filtered) {
        wrap.appendChild(buildScreenCard(s));
      }
      grid.appendChild(wrap);
    }

    // ----- STARTERS (Eclipse handcrafted) -----
    const starters = (SW.TEMPLATES || []).filter(t =>
      !search || t.name.toLowerCase().includes(search) || t.tag.toLowerCase().includes(search) || t.desc.toLowerCase().includes(search)
    );
    if (starters.length) {
      grid.appendChild(section('Starters Eclipse', `${starters.length} templates prêts · clean slate`, 'muted'));
      const wrap = gridWrap();
      for (const tpl of starters) {
        const card = document.createElement('div');
        card.className = 'tpl-card';
        const thumb = document.createElement('div');
        thumb.className = 'tpl-thumb';
        thumb.innerHTML = tpl.thumb ? tpl.thumb() : '';
        const info = document.createElement('div');
        info.className = 'tpl-info';
        info.innerHTML = `<h3>${tpl.name}</h3><p>${tpl.desc}</p><span class="tag">${tpl.tag}</span>`;
        card.appendChild(thumb); card.appendChild(info);
        card.onclick = () => { SW.loadTemplate(tpl.id); SW.closeModal('modal-templates'); };
        wrap.appendChild(card);
      }
      grid.appendChild(wrap);
    }

    if (!starters.length && !filtered.length) {
      grid.innerHTML = '<div class="text-center text-eclipse-muted text-sm py-12">Aucun résultat pour « ' + escapeHtml(search) + ' »</div>';
    }
  };

  function buildScreenCard(s) {
    const card = document.createElement('div');
    card.className = 'tpl-card';
    const thumb = document.createElement('div');
    thumb.className = 'tpl-thumb';
    // Try to build a mini-render
    try {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden';
      thumb.appendChild(wrapper);
      let drew = 0;
      for (const k of Object.keys(s.data).slice(0, 20)) {
        if (k === 'namespace') continue;
        const v = s.data[k];
        if (!v || typeof v !== 'object') continue;
        try { drawMiniInto(wrapper, v); drew++; } catch {}
      }
      if (!drew) throw new Error('empty');
    } catch {
      // Fallback: show a nice gradient with namespace pill
      thumb.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a1a,#0d0d0d)">
        <div style="padding:6px 14px;background:rgba(255,107,26,0.15);border:1px solid rgba(255,107,26,0.35);border-radius:6px;color:#ff6b1a;font:700 11px 'Space Grotesk';letter-spacing:0.1em;text-transform:uppercase">${escapeHtml(s.namespace || 'pack')}</div>
      </div>`;
    }
    const info = document.createElement('div');
    info.className = 'tpl-info';
    info.innerHTML = `
      <h3>${escapeHtml(s.name)}</h3>
      <p style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <span style="color:#ff6b1a;font-family:'JetBrains Mono';font-size:10px">${escapeHtml(s.namespace || '?')}</span>
        <span style="color:#5a5a5a">·</span>
        <span>${s.controls} ctrl</span>
        <span style="color:#5a5a5a">·</span>
        <span>${(s.size/1024).toFixed(1)} KB</span>
      </p>
      <span class="tag">${escapeHtml(s.pack)}</span>
    `;
    card.appendChild(thumb); card.appendChild(info);
    card.onclick = () => {
      SW.loadFromBedrock(s.data, s.file);
      SW.closeModal('modal-templates');
      SW.toast('Écran chargé: ' + s.name);
    };
    return card;
  }

  function section(title, sub, tone) {
    const h = document.createElement('div');
    h.className = 'col-span-full tpl-section ' + (tone === 'primary' ? 'tone-primary' : 'tone-accent');
    h.innerHTML = `<span class="t">${title}</span><span class="s">${sub}</span>`;
    return h;
  }
  function gridWrap() {
    const w = document.createElement('div');
    w.className = 'tpl-grid-inner col-span-full';
    return w;
  }
  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Mini render used for screen thumbs: dumps a single control at reduced scale into container
  function drawMiniInto(container, raw) {
    // Use the picker's builder if available
    if (!SW._miniBuildNode) return;
    const el = SW._miniBuildNode(raw, false);
    el.style.transform = (el.style.transform || '') + ' scale(0.28)';
    el.style.transformOrigin = 'top left';
    container.appendChild(el);
  }

  // ---- EXPORT ----
  function exportJson() {
    const json = SW.toBedrock(state.tree, { namespace: state.namespace });
    const text = state.unicode ? SW.stringifyUnicode(json, 4) : SW.prettify(json);
    SW.download(state.filename || 'ui.json', text, 'application/json');
    SW.toast('JSON exporté');
  }
  async function exportMcpack() {
    if (!window.JSZip) { SW.toast('JSZip non chargé', 'error'); return; }
    const json = SW.toBedrock(state.tree, { namespace: state.namespace });
    const text = state.unicode ? SW.stringifyUnicode(json, 4) : SW.prettify(json);
    const filename = state.filename && state.filename.endsWith('.json') ? state.filename : 'custom.json';
    const baseName = filename.replace(/\.json$/, '');
    const zip = new JSZip();
    const uuid1 = crypto.randomUUID();
    const uuid2 = crypto.randomUUID();
    const manifest = {
      format_version: 2,
      header: { name: 'Eclipse ' + baseName, description: 'Custom UI generated by Eclipse UI Forge', uuid: uuid1, version: [1,0,0], min_engine_version: [1,16,0] },
      modules: [{ type: 'resources', uuid: uuid2, version: [1,0,0] }]
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    zip.file('ui/_ui_defs.json', JSON.stringify({ ui_defs: ['ui/' + filename] }, null, 2));
    zip.file('ui/' + filename, text);
    const ico = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=').then(r => r.arrayBuffer());
    zip.file('pack_icon.png', ico);
    const blob = await zip.generateAsync({ type: 'blob' });
    SW.download(baseName + '.mcpack', blob);
    SW.toast('.mcpack exporté');
  }

  // ---- Tooltip system ----
  function wireTooltips() {
    const tip = document.getElementById('ecl-tooltip');
    let hideTimer = null;
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-tip]');
      if (!t) return;
      const rect = t.getBoundingClientRect();
      tip.textContent = t.dataset.tip;
      tip.style.left = (rect.left + rect.width / 2) + 'px';
      tip.style.top = (rect.bottom + 8) + 'px';
      tip.style.transform = 'translateX(-50%)';
      tip.classList.add('show');
      clearTimeout(hideTimer);
    });
    document.addEventListener('mouseout', (e) => {
      const t = e.target.closest('[data-tip]');
      if (!t) return;
      hideTimer = setTimeout(() => tip.classList.remove('show'), 100);
    });
  }

  // ---- WIRING ----
  function wire() {
    wireTooltips();

    // File actions
    q('[data-action="new"]').onclick = () => {
      if (state.dirty && !confirm('Document modifié. Continuer et perdre les modifications ?')) return;
      state.tree = emptyRoot(state.namespace);
      state.selectedId = null;
      state.expanded = {};
      state.filename = 'custom.json';
      state.history = []; state.historyIdx = -1;
      const cn = document.getElementById('code-filename'); if (cn) cn.textContent = 'custom.json';
      const pn = document.getElementById('project-name'); if (pn) pn.textContent = 'Nouveau projet';
      const pt = document.getElementById('preview-title'); if (pt) pt.textContent = 'Nouveau projet';
      snapshot();
      try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
      SW.markDirty(false); SW.refresh();
      SW.toast('Nouveau projet');
    };
    q('[data-action="open"]').onclick = () => SW.openImportModal();
    q('[data-action="library"]').onclick = () => SW.openImportModal();
    q('[data-action="templates"]').onclick = () => SW.openTemplatesModal();
    q('[data-action="copy"]').onclick = async () => {
      const ta = document.getElementById('code-area');
      try { await navigator.clipboard.writeText(ta.value); SW.toast('Copié'); }
      catch { ta.select(); document.execCommand('copy'); SW.toast('Copié'); }
    };
    q('[data-action="export-json"]').onclick = exportJson;
    q('[data-action="export-mcpack"]').onclick = exportMcpack;
    q('[data-action="undo"]').onclick = SW.undo;
    q('[data-action="redo"]').onclick = SW.redo;

    // Screen size
    document.querySelectorAll('[data-screen]').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('[data-screen]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        state.screen = b.dataset.screen;
        autoFitZoom();
      };
    });

    // Zoom
    const zv = document.getElementById('zoom-val');
    document.getElementById('zoom-in').onclick = () => {
      state.zoom = Math.min(300, state.zoom + 10);
      zv.textContent = state.zoom + '%';
      SW.render(state);
    };
    document.getElementById('zoom-out').onclick = () => {
      state.zoom = Math.max(25, state.zoom - 10);
      zv.textContent = state.zoom + '%';
      SW.render(state);
    };
    document.getElementById('zoom-fit').onclick = () => autoFitZoom();

    // Unicode toggle (icon button)
    const uniBtn = document.getElementById('unicode-toggle-btn');
    uniBtn.onclick = () => {
      state.unicode = !state.unicode;
      uniBtn.classList.toggle('active', state.unicode);
      uniBtn.dataset.tip = 'Obfuscation Unicode: ' + (state.unicode ? 'activée' : 'désactivée');
      SW.refreshCode(state);
      SW.toast(state.unicode ? 'Obfuscation Unicode activée' : 'Obfuscation désactivée');
    };

    // BG / rulers / snap
    document.getElementById('toggle-bg').onclick = () => {
      const order = ['mc','grid','dark'];
      const i = order.indexOf(state.bg);
      state.bg = order[(i + 1) % order.length];
      SW.render(state);
    };
    const rulersBtn = document.getElementById('toggle-rulers');
    rulersBtn.onclick = () => {
      state.rulers = !state.rulers;
      rulersBtn.classList.toggle('active', state.rulers);
      SW.render(state);
    };
    const snapBtn = document.getElementById('toggle-snap');
    snapBtn.onclick = () => {
      state.snap = !state.snap;
      snapBtn.classList.toggle('active', state.snap);
    };

    // Code panel
    const codePanel = document.getElementById('code-panel');
    document.querySelectorAll('[data-action="code-toggle"]').forEach(b => {
      b.onclick = () => codePanel.classList.toggle('open');
    });
    document.getElementById('format-json').onclick = () => {
      const ta = document.getElementById('code-area');
      try {
        const parsed = JSON.parse(ta.value);
        ta.value = state.unicode ? SW.stringifyUnicode(parsed, 4) : SW.prettify(parsed);
        SW.toast('Formaté');
      } catch (e) { SW.toast('JSON invalide', 'error'); }
    };
    document.getElementById('apply-json').onclick = () => SW.applyCode(state);

    // Namespace
    document.getElementById('namespace').oninput = (e) => {
      state.namespace = e.target.value;
      SW.refreshCode(state);
    };

    // Add root + palette  → open picker
    document.getElementById('add-root').onclick = () => SW.addRootElement(null);
    document.querySelectorAll('.ecl-palette-item[data-add]').forEach(btn => {
      btn.onclick = () => SW.addRootElement(btn.dataset.add);
    });

    // Right-click on preview stage (empty area)
    const stage = document.getElementById('stage-wrap');
    stage.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('.b-el')) SW.stageContextMenu(e);
    });
    // Right-click on elements (delegated)
    document.getElementById('preview').addEventListener('contextmenu', (e) => {
      const t = e.target.closest('.b-el');
      if (t && t.dataset.id) SW.elementContextMenu(e, t.dataset.id);
    });
    // Right-click on tree rows (delegated)
    document.getElementById('tree').addEventListener('contextmenu', (e) => {
      const t = e.target.closest('.tree-row');
      if (t && t.dataset.id) SW.elementContextMenu(e, t.dataset.id);
    });
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.onclick = () => SW.loadTemplate(btn.dataset.preset);
    });

    // Left sidebar tabs
    document.querySelectorAll('.ecl-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.ecl-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        document.getElementById('panel-layers').style.display = tabName === 'layers' ? '' : 'none';
        document.getElementById('panel-palette').style.display = tabName === 'palette' ? '' : 'none';
      };
    });

    // Inspector bottom buttons
    document.getElementById('dup-btn').onclick = () => { if (state.selectedId) SW.duplicateElement(state.selectedId); };
    document.getElementById('del-btn').onclick = () => { if (state.selectedId) SW.deleteElement(state.selectedId); };

    // Shortcuts help
    const scBtn = document.getElementById('shortcuts-help-btn');
    if (scBtn) scBtn.onclick = () => SW.openShortcutsModal();

    // Templates search
    document.getElementById('tpl-search').oninput = () => SW.openTemplatesModal();

    // Cursor coords on preview
    const stageWrap = document.getElementById('stage-wrap');
    const coords = document.getElementById('cursor-coords');
    const preview = document.getElementById('preview');
    stageWrap.addEventListener('mousemove', (e) => {
      const rect = preview.getBoundingClientRect();
      const zoom = state.zoom / 100;
      const x = Math.round((e.clientX - rect.left) / zoom);
      const y = Math.round((e.clientY - rect.top) / zoom);
      coords.textContent = `x: ${x} y: ${y}`;
    });
    stageWrap.addEventListener('mouseleave', () => coords.textContent = 'x: — y: —');

    // Global drop (file)
    window.addEventListener('dragover', (e) => { if (!e.target.closest('#dropzone')) e.preventDefault(); });
    window.addEventListener('drop', async (e) => {
      if (e.target.closest('.ecl-dropzone')) return;
      e.preventDefault();
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      const name = f.name.toLowerCase();
      if (name.endsWith('.json')) {
        const text = await f.text();
        try { SW.loadFromBedrock(JSON.parse(text), f.name); SW.toast('Chargé: ' + f.name); }
        catch { SW.toast('JSON invalide', 'error'); }
      } else {
        SW.openImportModal();
      }
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Delete' && state.selectedId) { SW.deleteElement(state.selectedId); e.preventDefault(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? SW.redo() : SW.undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); SW.redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && state.selectedId) { e.preventDefault(); SW.duplicateElement(state.selectedId); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); exportJson(); }
      else if (e.key === '?' || (e.shiftKey && e.key === '/')) { e.preventDefault(); SW.openShortcutsModal(); }
      else if (e.key === 'F2' && state.selectedId) {
        e.preventDefault();
        const el = SW.findById(state.tree, state.selectedId);
        if (el) {
          const name = prompt('Nom du composant:', el.name || '');
          if (name != null) { el.name = name.trim(); SW.markDirty(true); SW.refresh(); }
        }
      }
      else if (e.key === 'Escape') {
        document.querySelectorAll('.ecl-modal').forEach(m => m.classList.add('hidden'));
        document.getElementById('code-panel').classList.remove('open');
      }
      // Arrow keys move selection
      else if (state.selectedId && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const el = SW.findById(state.tree, state.selectedId);
        if (!el) return;
        const off = el.props.offset || [0, 0];
        if (e.key === 'ArrowLeft') off[0] -= step;
        if (e.key === 'ArrowRight') off[0] += step;
        if (e.key === 'ArrowUp') off[1] -= step;
        if (e.key === 'ArrowDown') off[1] += step;
        el.props.offset = [off[0], off[1]];
        SW.markDirty(true);
        SW.refresh();
      }
    });

    // Resize → refit
    window.addEventListener('resize', () => autoFitZoom());

    // ---- Play controls ----
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.onclick = () => SW.anim.toggle();
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.onclick = () => SW.anim.reset();
    const loopBtn = document.getElementById('loop-btn');
    if (loopBtn) loopBtn.onclick = () => {
      SW.anim.loop = !SW.anim.loop;
      loopBtn.classList.toggle('active', SW.anim.loop);
      SW.toast(SW.anim.loop ? 'Boucle activée' : 'Boucle désactivée');
    };
    document.querySelectorAll('.play-speed button[data-speed]').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.play-speed button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        SW.anim.speed = parseFloat(b.dataset.speed);
        if (SW.anim.isPlaying) { SW.anim.pause(); SW.anim.play(); }
      };
    });

    // Space toggles play when not focused on input
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') { e.preventDefault(); SW.anim.toggle(); }
    });
  }

  function q(sel) { return document.querySelector(sel); }

  // ---- Quick picker ----
  function quickPicker(items, cb) {
    const old = document.getElementById('quick-picker');
    if (old) old.remove();
    const root = document.createElement('div');
    root.id = 'quick-picker';
    root.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center';
    const card = document.createElement('div');
    card.style.cssText = 'background:#141414;border:1px solid #262626;border-radius:10px;padding:18px;min-width:260px';
    card.innerHTML = `<div style="font-family:'Space Grotesk';font-weight:700;font-size:15px;color:white;margin-bottom:12px">Ajouter un composant</div>`;
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px';
    items.forEach(t => {
      const b = document.createElement('button');
      b.className = 'ecl-palette-item';
      b.innerHTML = `<span>${t}</span>`;
      b.addEventListener('click', () => { root.remove(); cb(t); });
      grid.appendChild(b);
    });
    card.appendChild(grid);
    const cancel = document.createElement('button');
    cancel.className = 'ecl-btn-ghost';
    cancel.style.cssText = 'margin-top:12px;width:100%;justify-content:center';
    cancel.textContent = 'Annuler';
    cancel.addEventListener('click', () => { root.remove(); cb(null); });
    card.appendChild(cancel);
    root.appendChild(card);
    document.body.appendChild(root);
    root.addEventListener('click', (e) => { if (e.target === root) { root.remove(); cb(null); } });
  }

  // ---- AUTO-SAVE / RESTORE ----
  const STORAGE_KEY = 'ecl_autosave_v1';
  let autoSaveTimer = null;

  function autoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      try {
        const payload = {
          tree: state.tree,
          namespace: state.namespace,
          filename: state.filename,
          screen: state.screen,
          zoom: state.zoom,
          bg: state.bg,
          unicode: state.unicode,
          expanded: state.expanded,
          ts: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) { /* quota exceeded or private browsing */ }
    }, 500);
  }

  function tryRestore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.tree) return false;
      state.tree = data.tree;
      state.namespace = data.namespace || 'custom_ui';
      state.filename = data.filename || 'custom.json';
      state.screen = data.screen || 'pc';
      state.zoom = data.zoom || 100;
      state.bg = data.bg || 'mc';
      state.unicode = !!data.unicode;
      state.expanded = data.expanded || {};
      state.selectedId = null;
      state.history = [];
      state.historyIdx = -1;
      // Restore UI
      const ns = document.getElementById('namespace'); if (ns) ns.value = state.namespace;
      const cn = document.getElementById('code-filename'); if (cn) cn.textContent = state.filename;
      const pn = document.getElementById('project-name'); if (pn) pn.textContent = state.filename;
      const pt = document.getElementById('preview-title'); if (pt) pt.textContent = state.filename;
      const zv = document.getElementById('zoom-val'); if (zv) zv.textContent = state.zoom + '%';
      document.querySelectorAll('[data-screen]').forEach(b => {
        b.classList.toggle('active', b.dataset.screen === state.screen);
      });
      const uniBtn = document.getElementById('unicode-toggle-btn');
      if (uniBtn) uniBtn.classList.toggle('active', state.unicode);
      snapshot();
      SW.refresh();
      return true;
    } catch (e) { return false; }
  }

  // Hook auto-save into markDirty
  const _origMarkDirty = SW.markDirty;
  SW.markDirty = function (b) {
    _origMarkDirty(b);
    if (b) autoSave();
  };

  // ---- UNSAVED CHANGES WARNING ----
  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // ---- KEYBOARD SHORTCUTS HELP ----
  SW.openShortcutsModal = function () {
    let modal = document.getElementById('modal-shortcuts');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-shortcuts';
      modal.className = 'ecl-modal hidden';
      modal.innerHTML = `
        <div class="ecl-modal-card" style="max-width:560px">
          <div class="h-14 flex items-center px-6 border-b border-eclipse-border">
            <div class="text-xs font-bold uppercase tracking-[0.2em] text-eclipse-muted">Aide</div>
            <h2 class="font-display font-bold text-xl text-white ml-4">Raccourcis clavier</h2>
            <button data-close-modal class="ecl-icon-btn ml-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-6 overflow-auto" style="max-height:70vh">
            <div class="shortcuts-grid">
              <div class="sc-group">Fichier</div>
              <div class="sc-row"><span class="sc-keys"><kbd>Ctrl</kbd>+<kbd>S</kbd></span><span>Exporter JSON</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>Ctrl</kbd>+<kbd>Z</kbd></span><span>Annuler</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>Ctrl</kbd>+<kbd>Y</kbd></span><span>Refaire</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd></span><span>Refaire</span></div>
              <div class="sc-group">Éléments</div>
              <div class="sc-row"><span class="sc-keys"><kbd>Suppr</kbd></span><span>Supprimer l'élément</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>Ctrl</kbd>+<kbd>D</kbd></span><span>Dupliquer</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>F2</kbd></span><span>Renommer</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd></span><span>Déplacer (1px)</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>Shift</kbd>+<kbd>↑↓←→</kbd></span><span>Déplacer (10px)</span></div>
              <div class="sc-group">Vue</div>
              <div class="sc-row"><span class="sc-keys"><kbd>Espace</kbd></span><span>Lecture / Pause</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>Échap</kbd></span><span>Fermer panneau/modal</span></div>
              <div class="sc-row"><span class="sc-keys"><kbd>?</kbd></span><span>Aide raccourcis</span></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    SW.openModal('modal-shortcuts');
  };

  // ---- BOOT ----
  function boot() {
    wire();
    wireSplitters();
    const restored = tryRestore();
    if (!restored) {
      SW.loadTemplate('neon_sidebar');
    }
    autoFitZoom();
    if (!localStorage.getItem('ecl_seen_v1')) {
      setTimeout(() => {
        SW.toast('Bienvenue sur Eclipse UI Forge — clique un élément pour l\'éditer, glisse-le pour le déplacer');
        localStorage.setItem('ecl_seen_v1', '1');
      }, 500);
    }
  }

  // ---- RESIZABLE PANELS ----
  function wireSplitters() {
    const main = document.querySelector('main.grid');
    if (!main) return;
    const leftPanel = main.children[0];
    const centerPanel = main.children[1];
    const rightPanel = main.children[2];

    // Create left splitter
    const leftSplitter = document.createElement('div');
    leftSplitter.className = 'ecl-splitter';
    main.insertBefore(leftSplitter, centerPanel);

    // Create right splitter
    const rightSplitter = document.createElement('div');
    rightSplitter.className = 'ecl-splitter';
    main.insertBefore(rightSplitter, rightPanel);

    // Update grid template
    main.style.gridTemplateColumns = '260px 4px 1fr 4px 300px';

    function makeDraggable(splitter, panel, side) {
      let startX, startW;
      splitter.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startW = panel.getBoundingClientRect().width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        function onMove(ev) {
          const dx = side === 'left' ? ev.clientX - startX : startX - ev.clientX;
          const newW = Math.max(180, Math.min(500, startW + dx));
          const cols = main.style.gridTemplateColumns.split(' ');
          if (side === 'left') cols[0] = newW + 'px';
          else cols[4] = newW + 'px';
          main.style.gridTemplateColumns = cols.join(' ');
        }
        function onUp() {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          autoFitZoom();
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }
    makeDraggable(leftSplitter, leftPanel, 'left');
    makeDraggable(rightSplitter, rightPanel, 'right');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
