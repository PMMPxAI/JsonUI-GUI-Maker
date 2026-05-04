// ==========================================================
// picker.ts — Component Picker (choose from library with previews)
// ==========================================================
import type { ComponentType, LibraryItem, PickedComponent } from './types.ts';

const SW = window.SW;

let _library: LibraryItem[] | null = null;
let _loading: Promise<LibraryItem[]> | null = null;
let _currentCb: ((picked: PickedComponent | null) => void) | null = null;
let _currentFilterType: ComponentType | null = null;
let _currentSearch = '';

const TYPE_LIST: ComponentType[] = ['panel', 'stack_panel', 'image', 'label', 'button', 'input_panel', 'scrolling_panel', 'grid', 'toggle', 'dropdown', 'slider', 'fill', 'custom'];
const TYPE_LABELS: Record<string, string> = {
  panel: 'Panel', stack_panel: 'Stack', image: 'Image',
  label: 'Label', button: 'Button', input_panel: 'Input', scrolling_panel: 'Scroll',
  grid: 'Grid', toggle: 'Toggle', dropdown: 'Dropdown', slider: 'Slider', fill: 'Fill', custom: 'Custom'
};

async function ensureLibrary(): Promise<LibraryItem[]> {
  if (_library) return _library;
  if (_loading) return _loading;
  _loading = fetch('samples/components.json')
    .then(r => r.ok ? r.json() : [])
    .catch(() => []);
  _library = await _loading;
  _loading = null;
  return _library!;
}

SW.openPicker = function (typeFilter: ComponentType | null, onPick: (picked: PickedComponent | null) => void, options?: Record<string, unknown>): void {
  _currentCb = onPick;
  _currentFilterType = typeFilter;
  _currentSearch = '';
  ensureLibrary().then(() => buildModal(options || {}));
};

interface PickerOptions {
  title?: string;
  parentId?: string;
  filterTypes?: string[];
}

function buildModal(options: Record<string, unknown>): void {
  const opts = options as PickerOptions;
  let modal = document.getElementById('modal-picker');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-picker';
    modal.className = 'ecl-modal hidden';
    modal.innerHTML = `
      <div class="ecl-modal-card" style="max-width:1200px;display:flex;flex-direction:column">
        <div class="h-14 flex items-center px-6 border-b border-eclipse-border shrink-0">
          <div class="text-xs font-bold uppercase tracking-[0.2em] text-eclipse-muted">Bibliothèque</div>
          <h2 id="picker-title" class="font-display font-bold text-xl text-white ml-4">Choisir un composant</h2>
          <input id="picker-search" placeholder="Rechercher un composant..." class="ecl-input ml-6 w-64" />
          <button data-close-modal class="ecl-icon-btn ml-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="picker-tabs" class="flex items-center gap-1 px-5 py-2 border-b border-eclipse-border shrink-0 overflow-x-auto"></div>
        <div id="picker-grid" class="p-5 overflow-auto flex-1" style="min-height:300px;max-height:70vh"></div>
      </div>
    `;
    document.body.appendChild(modal);
    (modal.querySelector('#picker-search') as HTMLInputElement).addEventListener('input', (e: Event) => {
      _currentSearch = ((e.target as HTMLInputElement).value || '').toLowerCase();
      renderGrid();
    });
  }
  const title = modal.querySelector('#picker-title') as HTMLElement;
  title.textContent = opts.title || (
    _currentFilterType ? `Choisir un ${TYPE_LABELS[_currentFilterType] || _currentFilterType}` :
    'Choisir un composant'
  );
  renderTabs();
  renderGrid();
  SW.openModal('modal-picker');
  setTimeout(() => {
    const s = modal!.querySelector('#picker-search') as HTMLInputElement;
    if (s) { s.value = ''; s.focus(); }
  }, 50);
}

function renderTabs(): void {
  const tabs = document.querySelector('#picker-tabs');
  if (!tabs) return;
  tabs.innerHTML = '';
  const types: Array<'all' | ComponentType> = ['all', ...TYPE_LIST];
  for (const t of types) {
    const count = t === 'all' ? _library!.length : _library!.filter(x => x.type === t).length;
    if (t !== 'all' && count === 0) continue;
    const btn = document.createElement('button');
    btn.className = 'picker-tab';
    if ((t === 'all' && !_currentFilterType) || t === _currentFilterType) btn.classList.add('active');
    btn.innerHTML = `${TYPE_LABELS[t] || (t === 'all' ? 'Tout' : t)} <span class="count">${count}</span>`;
    btn.onclick = () => {
      _currentFilterType = (t === 'all') ? null : t;
      renderTabs();
      renderGrid();
    };
    tabs.appendChild(btn);
  }

  const add = document.createElement('button');
  add.className = 'picker-tab create';
  add.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="width:12px;height:12px;display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M12 5v14M5 12h14"/></svg>Créer vide`;
  add.onclick = () => {
    const pickType = _currentFilterType || 'panel';
    const picked: PickedComponent = { isDefault: true, type: pickType };
    SW.closeModal('modal-picker');
    if (_currentCb) _currentCb(picked);
  };
  tabs.appendChild(add);
}

function renderGrid(): void {
  const grid = document.querySelector('#picker-grid');
  if (!grid) return;
  grid.innerHTML = '';

  let items = _library!.slice();
  if (_currentFilterType) items = items.filter(x => x.type === _currentFilterType);
  if (_currentSearch) items = items.filter(x =>
    (x.name || '').toLowerCase().includes(_currentSearch) ||
    (x.type || '').toLowerCase().includes(_currentSearch)
  );

  if (!items.length) {
    grid.innerHTML = `<div class="picker-empty">
      <div class="text-eclipse-muted text-sm text-center py-12">Aucun composant trouvé.</div>
    </div>`;

    const defaultCard = buildDefaultCard();
    grid.appendChild(defaultCard);
    return;
  }

  const defaultCard = buildDefaultCard();
  grid.appendChild(defaultCard);

  for (const item of items) {
    const card = buildCard(item);
    grid.appendChild(card);
  }
}

function buildDefaultCard(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'picker-card default';
  const type = _currentFilterType || 'panel';
  card.innerHTML = `
    <div class="picker-thumb default-thumb">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:24px;height:24px;color:rgba(255,107,26,0.6)">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </div>
    <div class="picker-info">
      <div class="picker-name">Nouveau ${TYPE_LABELS[type] || type}</div>
      <div class="picker-meta">Vide · propriétés par défaut</div>
    </div>
  `;
  card.onclick = () => {
    const picked: PickedComponent = { isDefault: true, type };
    SW.closeModal('modal-picker');
    if (_currentCb) _currentCb(picked);
  };
  return card;
}

function buildCard(item: LibraryItem): HTMLElement {
  const card = document.createElement('div');
  card.className = 'picker-card';

  const thumb = document.createElement('div');
  thumb.className = 'picker-thumb';
  try {
    if (SW._miniBuildNode) {
      const mini = SW._miniBuildNode(item.data, false);
      mini.style.transform = 'scale(0.35)';
      mini.style.transformOrigin = 'top left';
      thumb.appendChild(mini);
    }
  } catch {
    thumb.style.background = 'linear-gradient(135deg,#1a1a1a,#0d0d0d)';
  }

  const info = document.createElement('div');
  info.className = 'picker-info';
  info.innerHTML = `
    <div class="picker-name">${escapeHtml(item.name)}</div>
    <div class="picker-meta">${escapeHtml(item.type)}${item.controls ? ' · ' + item.controls + ' ctrl' : ''}${item.pack ? ' · ' + escapeHtml(item.pack) : ''}</div>
  `;

  card.appendChild(thumb);
  card.appendChild(info);

  card.onclick = () => {
    const picked: PickedComponent = { type: item.type, name: item.name, data: item.data };
    SW.closeModal('modal-picker');
    if (_currentCb) _currentCb(picked);
  };

  return card;
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

// Mini build node for picker thumbnails
SW._miniBuildNode = function (raw: Record<string, unknown>, _stackLayout: boolean): HTMLElement {
  const div = document.createElement('div');
  div.className = 'b-el mini';
  const type = (raw.type as string) || 'panel';
  div.dataset.type = type;
  const sz = (raw.size as [unknown, unknown]) || [120, 80];
  div.style.width = SW.parseSize(sz[0], '120px');
  div.style.height = SW.parseSize(sz[1], '80px');
  div.style.position = 'relative';
  if (raw.color && Array.isArray(raw.color)) {
    div.style.background = SW.rgbaToCss(raw.color as unknown[]);
  }
  if (type === 'image' && raw.texture) {
    div.style.background = 'linear-gradient(135deg, rgba(255,107,26,0.4), rgba(139,92,246,0.3))';
  }
  return div;
};
