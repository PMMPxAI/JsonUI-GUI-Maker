// ==========================================================
// picker.js — Component Picker (choose from library with previews)
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  let _library = null;     // loaded from components.json
  let _loading = null;
  let _currentCb = null;
  let _currentFilterType = null;
  let _currentSearch = '';

  const TYPE_LIST = ['panel', 'stack_panel', 'image', 'label', 'button', 'input_panel', 'scrolling_panel'];
  const TYPE_LABELS = {
    panel: 'Panel', stack_panel: 'Stack', image: 'Image',
    label: 'Label', button: 'Button', input_panel: 'Input', scrolling_panel: 'Scroll'
  };

  async function ensureLibrary() {
    if (_library) return _library;
    if (_loading) return _loading;
    _loading = fetch('samples/components.json')
      .then(r => r.ok ? r.json() : [])
      .catch(() => []);
    _library = await _loading;
    _loading = null;
    return _library;
  }

  SW.openPicker = function (typeFilter, onPick, options) {
    options = options || {};
    _currentCb = onPick;
    _currentFilterType = typeFilter;
    _currentSearch = '';
    ensureLibrary().then(() => buildModal(options));
  };

  function buildModal(options) {
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
      modal.querySelector('#picker-search').addEventListener('input', (e) => {
        _currentSearch = (e.target.value || '').toLowerCase();
        renderGrid();
      });
    }
    const title = modal.querySelector('#picker-title');
    title.textContent = options.title || (
      _currentFilterType ? `Choisir un ${TYPE_LABELS[_currentFilterType] || _currentFilterType}` :
      'Choisir un composant'
    );
    renderTabs();
    renderGrid();
    SW.openModal('modal-picker');
    setTimeout(() => {
      const s = modal.querySelector('#picker-search');
      if (s) { s.value = ''; s.focus(); }
    }, 50);
  }

  function renderTabs() {
    const tabs = document.querySelector('#picker-tabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    const types = ['all', ...TYPE_LIST];
    for (const t of types) {
      const count = t === 'all' ? _library.length : _library.filter(x => x.type === t).length;
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

    // "+ Créer vide" tab
    const add = document.createElement('button');
    add.className = 'picker-tab create';
    add.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="width:12px;height:12px;display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M12 5v14M5 12h14"/></svg>Créer vide`;
    add.onclick = () => {
      const t = _currentFilterType || 'panel';
      const picked = { isDefault: true, type: t };
      SW.closeModal('modal-picker');
      if (_currentCb) _currentCb(picked);
    };
    tabs.appendChild(add);
  }

  function renderGrid() {
    const grid = document.querySelector('#picker-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Filter
    let items = _library.slice();
    if (_currentFilterType) items = items.filter(x => x.type === _currentFilterType);
    if (_currentSearch) {
      const q = _currentSearch;
      items = items.filter(x =>
        (x.name || '').toLowerCase().includes(q) ||
        (x.pack || '').toLowerCase().includes(q) ||
        (x.type || '').toLowerCase().includes(q)
      );
    }

    if (!items.length) {
      grid.innerHTML = '<div class="text-center py-16 text-eclipse-muted text-sm">Aucun composant trouvé.</div>';
      return;
    }

    // Group by type if no filter
    if (!_currentFilterType) {
      const byType = {};
      items.forEach(it => (byType[it.type] = byType[it.type] || []).push(it));
      const types = Object.keys(byType).sort((a, b) => byType[b].length - byType[a].length);
      for (const t of types) {
        const header = document.createElement('div');
        header.className = 'picker-group-header';
        header.innerHTML = `<span>${TYPE_LABELS[t] || t}</span><span class="count">${byType[t].length}</span>`;
        grid.appendChild(header);
        const gg = document.createElement('div');
        gg.className = 'picker-grid-inner';
        byType[t].slice(0, 40).forEach(it => gg.appendChild(buildCard(it)));
        grid.appendChild(gg);
      }
    } else {
      const gg = document.createElement('div');
      gg.className = 'picker-grid-inner';
      items.forEach(it => gg.appendChild(buildCard(it)));
      grid.appendChild(gg);
    }
  }

  function buildCard(item) {
    const card = document.createElement('button');
    card.className = 'picker-card';
    card.title = `${item.name} (${item.pack})`;

    const preview = document.createElement('div');
    preview.className = 'picker-preview';
    renderMini(item.data, preview, item.type);
    card.appendChild(preview);

    const meta = document.createElement('div');
    meta.className = 'picker-meta';
    meta.innerHTML = `
      <div class="picker-name">${escapeHtml(item.name || item.type)}</div>
      <div class="picker-sub">
        <span class="picker-type ti-${item.type}">${item.type}</span>
        <span class="picker-pack">${escapeHtml(item.pack || '')}</span>
      </div>
    `;
    card.appendChild(meta);

    card.onclick = () => {
      SW.closeModal('modal-picker');
      if (_currentCb) _currentCb(item);
    };
    return card;
  }

  // -------- MINI RENDER (approximate) --------
  // Renders Bedrock raw data into a fixed-size preview box using direct HTML.
  function renderMini(raw, container, topType) {
    container.innerHTML = '';
    // Determine preferred element size
    const sz = Array.isArray(raw.size) ? raw.size : ['100%c', '100%c'];
    const pxW = typeof sz[0] === 'number' ? sz[0] : null;
    const pxH = typeof sz[1] === 'number' ? sz[1] : null;

    // Canvas is 200×110
    const CW = 200, CH = 110;

    // Compute scale if real px known
    let elW = pxW || 180;
    let elH = pxH || 80;
    // Cap
    if (elW > 640) elW = 640;
    if (elH > 400) elH = 400;
    const scale = Math.min((CW - 12) / elW, (CH - 12) / elH, 1.5);

    // Root element
    const el = buildNode(raw);
    el.style.position = 'absolute';
    el.style.left = '50%'; el.style.top = '50%';
    el.style.width = (pxW || elW) + 'px';
    el.style.height = (pxH || elH) + 'px';
    el.style.transform = `translate(-50%, -50%) scale(${scale})`;
    el.style.transformOrigin = 'center center';
    container.appendChild(el);
  }

  // Public so Templates modal can draw screen previews
  SW._miniBuildNode = function(raw, inStack) { return buildNode(raw, inStack); };

  function buildNode(raw, inStack) {
    const type = raw && raw.type;
    const div = document.createElement('div');
    div.style.position = inStack ? 'relative' : 'absolute';
    div.style.boxSizing = 'border-box';
    div.style.overflow = 'hidden';

    // Size
    const sz = Array.isArray(raw.size) ? raw.size : ['100%c', '100%c'];
    div.style.width = parseSzPx(sz[0]);
    div.style.height = parseSzPx(sz[1]);

    if (!inStack) {
      const af = SW.anchorMap[raw.anchor_from] || SW.anchorMap.center;
      const at = SW.anchorMap[raw.anchor_to] || af;
      const off = raw.offset || [0, 0];
      div.style.left = (af.x * 100) + '%';
      div.style.top = (af.y * 100) + '%';
      div.style.transform = `translate(calc(${-at.x * 100}% + ${+off[0] || 0}px), calc(${-at.y * 100}% + ${+off[1] || 0}px))`;
    }
    if (raw.alpha != null) div.style.opacity = String(raw.alpha);

    switch (type) {
      case 'image': fillImage(div, raw); break;
      case 'label': fillLabel(div, raw); break;
      case 'button':
        div.style.background = 'rgba(255,107,26,0.15)';
        div.style.border = '1px solid rgba(255,107,26,0.5)';
        div.style.borderRadius = '3px';
        break;
      case 'stack_panel':
        div.style.display = 'flex';
        div.style.flexDirection = (raw.orientation === 'horizontal' ? 'row' : 'column');
        div.style.alignItems = 'center';
        break;
      default:
        // panel = transparent container (+ subtle border so it's visible in preview)
        div.style.border = '1px dashed rgba(255,255,255,0.08)';
        break;
    }

    // Children
    const ctrls = raw.controls;
    if (Array.isArray(ctrls)) {
      const isStack = (type === 'stack_panel');
      for (const wrap of ctrls) {
        if (!wrap || typeof wrap !== 'object') continue;
        const k = Object.keys(wrap)[0];
        const cv = wrap[k];
        if (!cv || typeof cv !== 'object') continue;
        const cn = buildNode(cv, isStack);
        div.appendChild(cn);
      }
    }
    return div;
  }

  function parseSzPx(v) {
    if (typeof v === 'number') return v + 'px';
    if (typeof v === 'string') {
      const s = v.trim();
      if (/%c/.test(s) || /%cm/.test(s)) return 'auto';
      if (/^[-+]?\d+(\.\d+)?$/.test(s)) return s + 'px';
      if (s.endsWith('%')) return s;
      if (s.endsWith('x') || s.endsWith('y')) {
        const n = parseFloat(s);
        if (!isNaN(n)) return n + '%';
      }
      return s;
    }
    return 'auto';
  }

  function fillImage(div, raw) {
    const tex = (raw.texture || '').toLowerCase();
    const color = raw.color;
    let bg = '';
    if (tex.includes('white')) bg = SW.rgbaToCss(color || [1,1,1,1]);
    else if (tex.includes('black')) bg = SW.rgbaToCss(color || [0,0,0,1]);
    else if (color) bg = SW.rgbaToCss(color);
    else bg = 'linear-gradient(135deg, rgba(255,107,26,0.55), rgba(168,85,247,0.45))';
    div.style.background = bg;
    div.style.borderRadius = '2px';
    if (tex && !tex.includes('white') && !tex.includes('black')) {
      const tag = document.createElement('div');
      tag.textContent = tex.split('/').pop();
      tag.style.cssText = 'position:absolute;top:1px;left:2px;font:600 7px JetBrains Mono;color:rgba(255,255,255,0.85);background:rgba(0,0,0,0.45);padding:0 3px;border-radius:2px;pointer-events:none;max-width:calc(100% - 4px);overflow:hidden;white-space:nowrap';
      div.appendChild(tag);
    }
  }

  const MC_COLORS = {
    '0':'#000','1':'#0000AA','2':'#00AA00','3':'#00AAAA','4':'#AA0000','5':'#AA00AA',
    '6':'#FFAA00','7':'#AAAAAA','8':'#555','9':'#5555FF','a':'#55FF55','b':'#55FFFF',
    'c':'#FF5555','d':'#FF55FF','e':'#FFFF55','f':'#FFF','g':'#DDD605'
  };
  function stripMc(text) {
    if (!text) return '';
    // keep a visible string with the first color applied globally
    return text.replace(/§./g, '');
  }

  function fillLabel(div, raw) {
    const text = raw.text == null ? '' : String(raw.text);
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    const align = raw.text_alignment || 'left';
    div.style.justifyContent = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
    let fontPx = 10;
    if (typeof raw.font_size === 'string') {
      const map = { small:8, normal:10, medium:12, large:16, extra_large:22 };
      fontPx = map[raw.font_size] || 10;
    } else if (typeof raw.font_size === 'number') fontPx = raw.font_size;
    if (Array.isArray(raw.size) && typeof raw.size[1] === 'number' && !raw.font_size) {
      fontPx = Math.max(8, Math.min(28, raw.size[1]));
    }
    const baseColor = raw.color ? SW.rgbaToCss(raw.color) : '#fff';
    const span = document.createElement('span');
    span.style.fontSize = fontPx + 'px';
    span.style.color = baseColor;
    span.style.fontFamily = '"Space Grotesk", monospace';
    span.style.fontWeight = '600';
    span.style.whiteSpace = 'nowrap';
    span.style.textShadow = raw.shadow !== false ? '1px 1px 0 rgba(0,0,0,0.6)' : '';

    // Parse MC codes
    const segs = parseMc(text);
    if (!segs.length) { span.textContent = text; }
    else for (const s of segs) {
      const sp = document.createElement('span');
      sp.textContent = s.text;
      if (s.color) sp.style.color = s.color;
      if (s.bold) sp.style.fontWeight = '700';
      span.appendChild(sp);
    }
    div.appendChild(span);
  }
  function parseMc(text) {
    const out = []; let cur = { text: '', color: null, bold: false };
    let i = 0;
    while (i < text.length) {
      const c = text[i];
      if (c === '§' && i + 1 < text.length) {
        const code = text[i+1].toLowerCase();
        if (cur.text) out.push({ ...cur });
        cur.text = '';
        if (MC_COLORS[code]) { cur.color = MC_COLORS[code]; cur.bold = false; }
        else if (code === 'l') cur.bold = true;
        else if (code === 'r') { cur.color = null; cur.bold = false; }
        i += 2; continue;
      }
      cur.text += c; i++;
    }
    if (cur.text) out.push(cur);
    return out;
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

})(window.SW);
