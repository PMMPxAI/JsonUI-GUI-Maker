// ==========================================================
// app.ts — Eclipse UI Forge (main logic)
// ==========================================================
import type { AppState, UINode, UIProps, ComponentType, PickedComponent, ScreenSize, Template, Background } from './types.ts';

const SW = window.SW;

// ---- STATE ----
const state: AppState = {
  tree: emptyRoot('custom_ui'),
  selectedId: null,
  expanded: {},
  namespace: 'custom_ui',
  screen: 'pc',
  zoom: 100,
  bg: 'mc',
  rulers: false,
  snap: true,
  unicode: false,
  dirty: false,
  filename: 'custom.json',
  history: [],
  historyIdx: -1
};
SW.state = state;

function emptyRoot(ns: string): UINode {
  return { id: 'root', name: 'root', type: 'root', props: {} as UIProps, namespace: ns, children: [] };
}

// ---- History (undo/redo) ----
function snapshot(): void {
  const snap = JSON.stringify({ tree: state.tree, namespace: state.namespace });
  state.history = state.history.slice(0, state.historyIdx + 1);
  state.history.push(snap);
  if (state.history.length > 80) state.history.shift();
  state.historyIdx = state.history.length - 1;
}

function restore(snapStr: string): void {
  try {
    const data = JSON.parse(snapStr);
    state.tree = data.tree;
    state.namespace = data.namespace;
    state.selectedId = null;
    SW.refresh();
  } catch (_e) { /* noop */ }
}

SW.undo = function (): void {
  if (state.historyIdx <= 0) { SW.toast('Rien à annuler'); return; }
  state.historyIdx--;
  restore(state.history[state.historyIdx]);
};

SW.redo = function (): void {
  if (state.historyIdx >= state.history.length - 1) { SW.toast('Rien à refaire'); return; }
  state.historyIdx++;
  restore(state.history[state.historyIdx]);
};

let snapTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSnapshot(): void {
  if (snapTimer) clearTimeout(snapTimer);
  snapTimer = setTimeout(snapshot, 300);
}

// ---- PUBLIC API ----
SW.refresh = function (): void {
  SW.renderTree(state);
  SW.render(state);
  SW.renderInspector(state);
  SW.refreshCode(state);
  SW.updateSelInfo();
};

SW.markDirty = function (b: boolean): void {
  state.dirty = !!b;
  SW.setStatus(b ? 'Modifié' : 'Prêt');
  if (b) scheduleSnapshot();
};

SW.selectElement = function (id: string | null): void {
  state.selectedId = id;
  SW.refresh();
};

SW.deleteElement = function (id: string): void {
  const parent = SW.findParent(state.tree, id);
  if (!parent || !parent.children) return;
  parent.children = parent.children.filter(c => c.id !== id);
  if (state.selectedId === id) state.selectedId = null;
  SW.markDirty(true); SW.refresh();
};

SW.duplicateElement = function (id: string): void {
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

function reassignIds(el: UINode): void {
  el.id = SW.uid(el.props && el.props.type ? el.props.type : 'el');
  if (el.children) el.children.forEach(reassignIds);
}

SW.moveElement = function (dragId: string, overId: string): void {
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

function isDescendant(el: UINode, id: string): boolean {
  if (!el.children) return false;
  for (const c of el.children) {
    if (c.id === id) return true;
    if (isDescendant(c, id)) return true;
  }
  return false;
}

SW.addRootElement = function (type: ComponentType | null): void {
  SW.openPicker(type || null, (picked: PickedComponent | null) => {
    if (!picked) return;
    let el: UINode;
    if (picked.isDefault) {
      el = {
        id: SW.uid(picked.type),
        name: picked.type + '_' + (state.tree.children.length + 1),
        type: picked.type,
        props: SW.defaultProps(picked.type),
        children: []
      };
    } else {
      const fake: Record<string, unknown> = { namespace: 'tmp', [picked.name || 'ctl']: picked.data };
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

SW.pickAndAddChild = function (parentId: string): void {
  SW.openPicker(null, (picked: PickedComponent | null) => {
    if (!picked) return;
    const parent = SW.findById(state.tree, parentId);
    if (!parent) return;
    parent.children = parent.children || [];
    let el: UINode;
    if (picked.isDefault) {
      el = {
        id: SW.uid(picked.type),
        name: picked.type + '_' + (parent.children.length + 1),
        type: picked.type,
        props: SW.defaultProps(picked.type),
        children: []
      };
    } else {
      const fake: Record<string, unknown> = { namespace: 'tmp', [picked.name || 'ctl']: picked.data };
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

SW.loadFromBedrock = function (json: Record<string, unknown>, source?: string): void {
  const tree = SW.fromBedrock(json);
  state.tree = tree;
  state.namespace = (json.namespace as string) || state.namespace;
  state.selectedId = null;
  state.expanded = {};
  if (source) {
    state.filename = (source.split('/').pop()!.split('\\').pop()!);
    const cn = document.getElementById('code-filename'); if (cn) cn.textContent = state.filename;
    const pn = document.getElementById('project-name'); if (pn) pn.textContent = state.filename;
    const pt = document.getElementById('preview-title'); if (pt) pt.textContent = state.filename;
  }
  const nsInput = document.getElementById('namespace') as HTMLInputElement | null; if (nsInput) nsInput.value = state.namespace;
  state.history = []; state.historyIdx = -1;
  snapshot();
  autoFitZoom();
  SW.markDirty(false);
  SW.refresh();
};

SW.loadTemplate = function (id: string): void {
  const tpl = (SW.TEMPLATES || []).find((t: Template) => t.id === id);
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
  const ns = document.getElementById('namespace') as HTMLInputElement | null; if (ns) ns.value = state.namespace;
  state.history = []; state.historyIdx = -1;
  snapshot();
  autoFitZoom();
  SW.markDirty(false);
  SW.refresh();
  SW.toast('Template: ' + tpl.name);
};

SW.updateSelInfo = function (el?: UINode): void {
  const info = document.getElementById('sel-info');
  if (!info) return;
  const sel = el || (state.selectedId ? SW.findById(state.tree, state.selectedId) : null);
  if (!sel) { info.textContent = 'Cliquez un élément'; info.style.display = ''; return; }
  const sz = sel.props.size || [];
  const off = sel.props.offset || [0, 0];
  info.textContent = `${sel.props.type} · ${fmt(sz[0])}×${fmt(sz[1])} · (${off[0]},${off[1]})`;
  function fmt(v: unknown): string {
    if (typeof v === 'number') return v + 'px';
    return String(v || 'auto');
  }
};

// ---- Auto-fit zoom ----
function autoFitZoom(): void {
  setTimeout(() => {
    const wrap = document.getElementById('stage-wrap');
    const preview = document.getElementById('preview');
    if (!wrap || !preview) return;
    const screen = SW.SCREEN_SIZES[state.screen as ScreenSize];
    const availW = wrap.clientWidth - 96;
    const availH = wrap.clientHeight - 96;
    const fit = Math.min(availW / screen.w, availH / screen.h);
    const z = Math.max(50, Math.min(200, Math.floor(fit * 100)));
    state.zoom = z;
    const zv = document.getElementById('zoom-val'); if (zv) zv.textContent = z + '%';
    SW.render(state);
  }, 30);
}

// ---- TEMPLATES MODAL ----
interface ScreenItem {
  name: string;
  pack: string;
  namespace: string;
  controls: number;
  size: number;
  file: string;
  data: Record<string, unknown>;
}

let _screens: ScreenItem[] | null = null;
async function ensureScreens(): Promise<ScreenItem[]> {
  if (_screens) return _screens;
  try {
    const r = await fetch('samples/screens.json');
    _screens = r.ok ? await r.json() : [];
  } catch { _screens = []; }
  return _screens!;
}

SW.openTemplatesModal = async function (): Promise<void> {
  const grid = document.getElementById('tpl-grid')!;
  grid.innerHTML = '<div class="text-center text-eclipse-muted text-sm py-12">Chargement…</div>';
  SW.openModal('modal-templates');
  const screens = await ensureScreens();
  const searchEl = document.getElementById('tpl-search') as HTMLInputElement;
  const search = (searchEl.value || '').toLowerCase();
  grid.innerHTML = '';

  const filtered = (screens || []).filter(s =>
    !search || (s.name && s.name.toLowerCase().includes(search)) ||
    (s.pack && s.pack.toLowerCase().includes(search)) ||
    (s.namespace && s.namespace.toLowerCase().includes(search))
  );
  if (filtered.length) {
    grid.appendChild(sectionEl('Écrans extraits des packs', `${filtered.length} JSONs complets · chargeables et modifiables`, 'primary'));
    const wrap = gridWrap();
    for (const s of filtered) {
      wrap.appendChild(buildScreenCard(s));
    }
    grid.appendChild(wrap);
  }

  const starters = (SW.TEMPLATES || []).filter((t: Template) =>
    !search || t.name.toLowerCase().includes(search) || t.tag.toLowerCase().includes(search) || t.desc.toLowerCase().includes(search)
  );
  if (starters.length) {
    grid.appendChild(sectionEl('Starters Eclipse', `${starters.length} templates prêts · clean slate`, 'muted'));
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

function buildScreenCard(s: ScreenItem): HTMLElement {
  const card = document.createElement('div');
  card.className = 'tpl-card';
  const thumb = document.createElement('div');
  thumb.className = 'tpl-thumb';
  try {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden';
    thumb.appendChild(wrapper);
    let drew = 0;
    for (const k of Object.keys(s.data).slice(0, 20)) {
      if (k === 'namespace') continue;
      const v = s.data[k];
      if (!v || typeof v !== 'object') continue;
      try { drawMiniInto(wrapper, v as Record<string, unknown>); drew++; } catch { /* skip */ }
    }
    if (!drew) throw new Error('empty');
  } catch {
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

function sectionEl(title: string, sub: string, tone: string): HTMLElement {
  const h = document.createElement('div');
  h.className = 'col-span-full tpl-section ' + (tone === 'primary' ? 'tone-primary' : 'tone-accent');
  h.innerHTML = `<span class="t">${title}</span><span class="s">${sub}</span>`;
  return h;
}

function gridWrap(): HTMLElement {
  const w = document.createElement('div');
  w.className = 'tpl-grid-inner col-span-full';
  return w;
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

function drawMiniInto(container: HTMLElement, raw: Record<string, unknown>): void {
  if (!SW._miniBuildNode) return;
  const el = SW._miniBuildNode(raw, false);
  el.style.transform = (el.style.transform || '') + ' scale(0.28)';
  el.style.transformOrigin = 'top left';
  container.appendChild(el);
}

// ---- EXPORT ----
function exportJson(): void {
  const json = SW.toBedrock(state.tree, { namespace: state.namespace });
  const text = state.unicode ? SW.stringifyUnicode(json, 4) : SW.prettify(json);
  SW.download(state.filename || 'ui.json', text, 'application/json');
  SW.toast('JSON exporté');
}

async function exportMcpack(): Promise<void> {
  if (!window.JSZip) { SW.toast('JSZip non chargé', 'error'); return; }
  const json = SW.toBedrock(state.tree, { namespace: state.namespace });
  const text = state.unicode ? SW.stringifyUnicode(json, 4) : SW.prettify(json);
  const filename = state.filename && state.filename.endsWith('.json') ? state.filename : 'custom.json';
  const baseName = filename.replace(/\.json$/, '');
  const zip = new window.JSZip();
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
function wireTooltips(): void {
  const tip = document.getElementById('ecl-tooltip')!;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  document.addEventListener('mouseover', (e: MouseEvent) => {
    const t = (e.target as HTMLElement).closest('[data-tip]') as HTMLElement | null;
    if (!t) return;
    const rect = t.getBoundingClientRect();
    tip.textContent = t.dataset.tip || '';
    tip.style.left = (rect.left + rect.width / 2) + 'px';
    tip.style.top = (rect.bottom + 8) + 'px';
    tip.style.transform = 'translateX(-50%)';
    tip.classList.add('show');
    if (hideTimer) clearTimeout(hideTimer);
  });
  document.addEventListener('mouseout', (e: MouseEvent) => {
    const t = (e.target as HTMLElement).closest('[data-tip]');
    if (!t) return;
    hideTimer = setTimeout(() => tip.classList.remove('show'), 100);
  });
}

// ---- WIRING ----
function q(sel: string): HTMLElement {
  return document.querySelector(sel) as HTMLElement;
}

function wire(): void {
  wireTooltips();

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
    try { localStorage.removeItem(STORAGE_KEY); } catch (_e) { /* noop */ }
    SW.markDirty(false); SW.refresh();
    SW.toast('Nouveau projet');
  };
  q('[data-action="open"]').onclick = () => SW.openImportModal();
  q('[data-action="library"]').onclick = () => SW.openImportModal();
  q('[data-action="templates"]').onclick = () => SW.openTemplatesModal();
  q('[data-action="copy"]').onclick = async () => {
    const ta = document.getElementById('code-area') as HTMLTextAreaElement;
    try { await navigator.clipboard.writeText(ta.value); SW.toast('Copié'); }
    catch { ta.select(); document.execCommand('copy'); SW.toast('Copié'); }
  };
  q('[data-action="export-json"]').onclick = exportJson;
  q('[data-action="export-mcpack"]').onclick = exportMcpack;
  q('[data-action="undo"]').onclick = SW.undo;
  q('[data-action="redo"]').onclick = SW.redo;

  document.querySelectorAll<HTMLElement>('[data-screen]').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll<HTMLElement>('[data-screen]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.screen = b.dataset.screen as ScreenSize;
      autoFitZoom();
    };
  });

  const zv = document.getElementById('zoom-val')!;
  document.getElementById('zoom-in')!.onclick = () => {
    state.zoom = Math.min(300, state.zoom + 10);
    zv.textContent = state.zoom + '%';
    SW.render(state);
  };
  document.getElementById('zoom-out')!.onclick = () => {
    state.zoom = Math.max(25, state.zoom - 10);
    zv.textContent = state.zoom + '%';
    SW.render(state);
  };
  document.getElementById('zoom-fit')!.onclick = () => autoFitZoom();

  const uniBtn = document.getElementById('unicode-toggle-btn')!;
  uniBtn.onclick = () => {
    state.unicode = !state.unicode;
    uniBtn.classList.toggle('active', state.unicode);
    uniBtn.dataset.tip = 'Obfuscation Unicode: ' + (state.unicode ? 'activée' : 'désactivée');
    SW.refreshCode(state);
    SW.toast(state.unicode ? 'Obfuscation Unicode activée' : 'Obfuscation désactivée');
  };

  document.getElementById('toggle-bg')!.onclick = () => {
    const order: Background[] = ['mc','grid','dark'];
    const i = order.indexOf(state.bg);
    state.bg = order[(i + 1) % order.length];
    SW.render(state);
  };
  const rulersBtn = document.getElementById('toggle-rulers')!;
  rulersBtn.onclick = () => {
    state.rulers = !state.rulers;
    rulersBtn.classList.toggle('active', state.rulers);
    SW.render(state);
  };
  const snapBtn = document.getElementById('toggle-snap')!;
  snapBtn.onclick = () => {
    state.snap = !state.snap;
    snapBtn.classList.toggle('active', state.snap);
  };

  const codePanel = document.getElementById('code-panel')!;
  document.querySelectorAll<HTMLElement>('[data-action="code-toggle"]').forEach(b => {
    b.onclick = () => codePanel.classList.toggle('open');
  });
  document.getElementById('format-json')!.onclick = () => {
    const ta = document.getElementById('code-area') as HTMLTextAreaElement;
    try {
      const parsed = JSON.parse(ta.value);
      ta.value = state.unicode ? SW.stringifyUnicode(parsed, 4) : SW.prettify(parsed);
      SW.toast('Formaté');
    } catch (_e) { SW.toast('JSON invalide', 'error'); }
  };
  document.getElementById('apply-json')!.onclick = () => SW.applyCode(state);

  (document.getElementById('namespace') as HTMLInputElement).oninput = (e: Event) => {
    state.namespace = (e.target as HTMLInputElement).value;
    SW.refreshCode(state);
  };

  document.getElementById('add-root')!.onclick = () => SW.addRootElement(null);
  document.querySelectorAll<HTMLElement>('.ecl-palette-item[data-add]').forEach(btn => {
    btn.onclick = () => SW.addRootElement(btn.dataset.add as ComponentType);
  });

  const stage = document.getElementById('stage-wrap')!;
  stage.addEventListener('contextmenu', (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.b-el')) SW.stageContextMenu(e);
  });
  document.getElementById('preview')!.addEventListener('contextmenu', (e: MouseEvent) => {
    const t = (e.target as HTMLElement).closest('.b-el') as HTMLElement | null;
    if (t && t.dataset.id) SW.elementContextMenu(e, t.dataset.id);
  });
  document.getElementById('tree')!.addEventListener('contextmenu', (e: MouseEvent) => {
    const t = (e.target as HTMLElement).closest('.tree-row') as HTMLElement | null;
    if (t && t.dataset.id) SW.elementContextMenu(e, t.dataset.id);
  });
  document.querySelectorAll<HTMLElement>('[data-preset]').forEach(btn => {
    btn.onclick = () => SW.loadTemplate(btn.dataset.preset!);
  });

  document.querySelectorAll<HTMLElement>('.ecl-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll<HTMLElement>('.ecl-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById('panel-layers')!.style.display = tabName === 'layers' ? '' : 'none';
      document.getElementById('panel-palette')!.style.display = tabName === 'palette' ? '' : 'none';
    };
  });

  document.getElementById('dup-btn')!.onclick = () => { if (state.selectedId) SW.duplicateElement(state.selectedId); };
  document.getElementById('del-btn')!.onclick = () => { if (state.selectedId) SW.deleteElement(state.selectedId); };

  const scBtn = document.getElementById('shortcuts-help-btn');
  if (scBtn) scBtn.onclick = () => SW.openShortcutsModal();

  document.getElementById('tpl-search')!.oninput = () => SW.openTemplatesModal();

  const stageWrap = document.getElementById('stage-wrap')!;
  const coords = document.getElementById('cursor-coords')!;
  const preview = document.getElementById('preview')!;
  stageWrap.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = preview.getBoundingClientRect();
    const zoom = state.zoom / 100;
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);
    coords.textContent = `x: ${x} y: ${y}`;
  });
  stageWrap.addEventListener('mouseleave', () => coords.textContent = 'x: — y: —');

  window.addEventListener('dragover', (e: DragEvent) => { if (!(e.target as HTMLElement).closest('#dropzone')) e.preventDefault(); });
  window.addEventListener('drop', async (e: DragEvent) => {
    if ((e.target as HTMLElement).closest('.ecl-dropzone')) return;
    e.preventDefault();
    const f = e.dataTransfer?.files && e.dataTransfer.files[0];
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

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const tag = ((e.target as HTMLElement)?.tagName) || '';
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
      document.getElementById('code-panel')!.classList.remove('open');
    }
    else if (state.selectedId && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const el = SW.findById(state.tree, state.selectedId);
      if (!el) return;
      const off = el.props.offset || [0, 0];
      if (e.key === 'ArrowLeft') off[0] = (+off[0] || 0) - step;
      if (e.key === 'ArrowRight') off[0] = (+off[0] || 0) + step;
      if (e.key === 'ArrowUp') off[1] = (+off[1] || 0) - step;
      if (e.key === 'ArrowDown') off[1] = (+off[1] || 0) + step;
      el.props.offset = [off[0], off[1]];
      SW.markDirty(true);
      SW.refresh();
    }
  });

  window.addEventListener('resize', () => autoFitZoom());

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
  document.querySelectorAll<HTMLElement>('.play-speed button[data-speed]').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll<HTMLElement>('.play-speed button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      SW.anim.speed = parseFloat(b.dataset.speed!);
      if (SW.anim.isPlaying) { SW.anim.pause(); SW.anim.play(); }
    };
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const tag = ((e.target as HTMLElement)?.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.code === 'Space') { e.preventDefault(); SW.anim.toggle(); }
  });
}

// ---- AUTO-SAVE / RESTORE ----
const STORAGE_KEY = 'ecl_autosave_v1';
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

function autoSave(): void {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
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
    } catch (_e) { /* quota exceeded or private browsing */ }
  }, 500);
}

function tryRestore(): boolean {
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
    const ns = document.getElementById('namespace') as HTMLInputElement | null; if (ns) ns.value = state.namespace;
    const cn = document.getElementById('code-filename'); if (cn) cn.textContent = state.filename;
    const pn = document.getElementById('project-name'); if (pn) pn.textContent = state.filename;
    const pt = document.getElementById('preview-title'); if (pt) pt.textContent = state.filename;
    const zv = document.getElementById('zoom-val'); if (zv) zv.textContent = state.zoom + '%';
    document.querySelectorAll<HTMLElement>('[data-screen]').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === state.screen);
    });
    const uniBtn = document.getElementById('unicode-toggle-btn');
    if (uniBtn) uniBtn.classList.toggle('active', state.unicode);
    snapshot();
    SW.refresh();
    return true;
  } catch (_e) { return false; }
}

const _origMarkDirty = SW.markDirty;
SW.markDirty = function (b: boolean): void {
  _origMarkDirty(b);
  if (b) autoSave();
};

window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
  if (state.dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ---- KEYBOARD SHORTCUTS HELP ----
SW.openShortcutsModal = function (): void {
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

// ---- RESIZABLE PANELS ----
function wireSplitters(): void {
  const main = document.querySelector('main.grid') as HTMLElement | null;
  if (!main) return;
  const leftPanel = main.children[0] as HTMLElement;
  const centerPanel = main.children[1] as HTMLElement;
  const rightPanel = main.children[2] as HTMLElement;

  const leftSplitter = document.createElement('div');
  leftSplitter.className = 'ecl-splitter';
  main.insertBefore(leftSplitter, centerPanel);

  const rightSplitter = document.createElement('div');
  rightSplitter.className = 'ecl-splitter';
  main.insertBefore(rightSplitter, rightPanel);

  main.style.gridTemplateColumns = '260px 4px 1fr 4px 300px';

  function makeDraggable(splitter: HTMLElement, panel: HTMLElement, side: 'left' | 'right'): void {
    let startX: number, startW: number;
    splitter.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      startX = e.clientX;
      startW = panel.getBoundingClientRect().width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(ev: MouseEvent): void {
        const dx = side === 'left' ? ev.clientX - startX : startX - ev.clientX;
        const newW = Math.max(180, Math.min(500, startW + dx));
        const cols = main!.style.gridTemplateColumns.split(' ');
        if (side === 'left') cols[0] = newW + 'px';
        else cols[4] = newW + 'px';
        main!.style.gridTemplateColumns = cols.join(' ');
      }
      function onUp(): void {
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

// ---- BOOT ----
function boot(): void {
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
