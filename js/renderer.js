// ==========================================================
// renderer.js — Bedrock JSON UI → HTML preview with drag/resize
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  SW.SCREEN_SIZES = {
    phone:  { w: 480, h: 260 },
    tablet: { w: 720, h: 420 },
    pc:     { w: 960, h: 540 }
  };

  SW.render = function (state) {
    const preview = document.getElementById('preview');
    if (!preview) return;

    const s = SW.SCREEN_SIZES[state.screen || 'pc'];
    preview.style.width = s.w + 'px';
    preview.style.height = s.h + 'px';

    const zoom = (state.zoom || 100) / 100;
    const inner = document.getElementById('stage-inner');
    if (inner) inner.style.transform = `scale(${zoom})`;

    preview.classList.remove('bg-dark', 'bg-grid', 'show-rulers');
    if (state.bg === 'dark') preview.classList.add('bg-dark');
    else if (state.bg === 'grid') preview.classList.add('bg-grid');
    if (state.rulers) preview.classList.add('show-rulers');

    preview.innerHTML = '';
    // Click on empty → deselect
    preview.onclick = (e) => {
      if (e.target === preview) SW.selectElement(null);
    };

    if (state.tree && state.tree.children) {
      for (const child of state.tree.children) {
        const node = renderEl(child, state, preview, false);
        if (node) preview.appendChild(node);
      }
    }
  };

  function renderEl(el, state, parentDom, stackLayout) {
    const props = el.props || {};
    const div = document.createElement('div');
    div.className = 'b-el';
    div.dataset.id = el.id;
    div.dataset.type = props.type || 'panel';
    if (el.name) div.dataset.name = el.name;

    if (state.selectedId === el.id) div.classList.add('selected');

    const sz = props.size || ['100%c', '100%c'];
    const w = SW.parseSize(sz[0], 'auto');
    const h = SW.parseSize(sz[1], 'auto');

    if (stackLayout) {
      // Inside a stack panel, children flow naturally
      div.style.position = 'relative';
      div.style.width = w;
      div.style.height = h;
    } else {
      div.style.width = w;
      div.style.height = h;
      const af = SW.anchorMap[props.anchor_from] || SW.anchorMap.center;
      const at = SW.anchorMap[props.anchor_to] || af;
      const offset = props.offset || [0, 0];
      div.style.position = 'absolute';
      div.style.left = (af.x * 100) + '%';
      div.style.top = (af.y * 100) + '%';
      const tx = `calc(${-at.x * 100}% + ${(+offset[0] || 0)}px)`;
      const ty = `calc(${-at.y * 100}% + ${(+offset[1] || 0)}px)`;
      div.style.transform = `translate(${tx}, ${ty})`;
    }

    if (props.alpha != null) div.style.opacity = String(props.alpha);
    if (props.layer != null) div.style.zIndex = String(props.layer);

    const type = props.type || 'panel';
    let stackMode = false;
    switch (type) {
      case 'image':
        renderImage(div, props);
        break;
      case 'label':
        renderLabel(div, props);
        break;
      case 'button':
        div.style.cursor = 'pointer';
        if (!el.children || !el.children.length) {
          div.style.background = 'rgba(255,107,26,0.15)';
          div.style.border = '1px solid rgba(255,107,26,0.35)';
          div.style.borderRadius = '4px';
        }
        break;
      case 'stack_panel':
        div.style.display = 'flex';
        div.style.flexDirection = (props.orientation === 'horizontal') ? 'row' : 'column';
        div.style.alignItems = 'center';
        stackMode = true;
        break;
    }

    // Children
    if (el.children && el.children.length) {
      for (const child of el.children) {
        const cn = renderEl(child, state, div, stackMode);
        if (cn) div.appendChild(cn);
      }
    }

    // Selection on click
    div.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      SW.selectElement(el.id);
      // Start drag for move if already selected (or after select if it's the same)
      startDrag(e, el, state);
    });

    // Resize handles if selected
    if (state.selectedId === el.id && !stackLayout) {
      addResizeHandles(div, el, state);
    }

    return div;
  }

  // -------- DRAG TO MOVE --------
  function startDrag(e, el, state) {
    // Only move when already selected; a first click just selects.
    if (state.selectedId !== el.id) return;
    // Don't drag if clicking a resize handle
    if (e.target.closest('.resize-handles')) return;

    const zoom = (state.zoom || 100) / 100;
    const startX = e.clientX;
    const startY = e.clientY;
    const startOffset = [
      (el.props.offset && +el.props.offset[0]) || 0,
      (el.props.offset && +el.props.offset[1]) || 0
    ];

    const dom = document.querySelector(`.b-el[data-id="${el.id}"]`);
    if (dom) dom.classList.add('dragging');

    function onMove(ev) {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      const snap = state.snap ? 1 : 0;
      const nx = snap ? Math.round(startOffset[0] + dx) : Math.round((startOffset[0] + dx) * 10) / 10;
      const ny = snap ? Math.round(startOffset[1] + dy) : Math.round((startOffset[1] + dy) * 10) / 10;
      el.props.offset = [nx, ny];
      SW.markDirty(true);
      SW.updateSelInfo(el);
      SW.renderInspectorLight(); // partial update
      // quick update DOM without full re-render
      const af = SW.anchorMap[el.props.anchor_from] || SW.anchorMap.center;
      const at = SW.anchorMap[el.props.anchor_to] || af;
      dom.style.transform = `translate(calc(${-at.x * 100}% + ${nx}px), calc(${-at.y * 100}% + ${ny}px))`;
    }
    function onUp() {
      if (dom) dom.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      SW.refreshCode(SW.state);
      SW.renderInspector(SW.state);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // -------- RESIZE HANDLES --------
  function addResizeHandles(div, el, state) {
    const wrap = document.createElement('div');
    wrap.className = 'resize-handles';
    const dirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    for (const d of dirs) {
      const h = document.createElement('div');
      h.className = 'rh-' + d;
      h.addEventListener('mousedown', (e) => startResize(e, d, el, state));
      wrap.appendChild(h);
    }
    div.appendChild(wrap);
  }

  function startResize(e, dir, el, state) {
    e.preventDefault(); e.stopPropagation();
    const zoom = (state.zoom || 100) / 100;
    const dom = document.querySelector(`.b-el[data-id="${el.id}"]`);
    if (!dom) return;
    const rect = dom.getBoundingClientRect();
    const startW = rect.width / zoom;
    const startH = rect.height / zoom;
    const startX = e.clientX;
    const startY = e.clientY;
    const startOff = [
      (el.props.offset && +el.props.offset[0]) || 0,
      (el.props.offset && +el.props.offset[1]) || 0
    ];

    function onMove(ev) {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      let nw = startW, nh = startH;
      let ox = startOff[0], oy = startOff[1];
      if (dir.includes('e')) nw = Math.max(4, startW + dx);
      if (dir.includes('s')) nh = Math.max(4, startH + dy);
      if (dir.includes('w')) { nw = Math.max(4, startW - dx); ox = startOff[0] + dx; }
      if (dir.includes('n')) { nh = Math.max(4, startH - dy); oy = startOff[1] + dy; }
      el.props.size = [Math.round(nw), Math.round(nh)];
      el.props.offset = [Math.round(ox), Math.round(oy)];
      SW.markDirty(true);
      SW.render(state);
      SW.renderInspectorLight();
      SW.updateSelInfo(el);
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      SW.renderInspector(state);
      SW.refreshCode(state);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // -------- Image rendering --------
  function renderImage(div, props) {
    const tex = (props.texture || '').toLowerCase();
    const color = props.color;
    let css = '';
    if (tex.includes('white')) {
      css = SW.rgbaToCss(color || [1, 1, 1, 1]);
    } else if (tex.includes('black')) {
      css = SW.rgbaToCss(color || [0, 0, 0, 1]);
    } else if (color) {
      css = SW.rgbaToCss(color);
    } else {
      css = 'linear-gradient(135deg, rgba(255,107,26,0.65), rgba(139,92,246,0.5))';
    }
    div.style.background = css;
    div.style.borderRadius = '2px';
    if (tex && !tex.includes('white') && !tex.includes('black')) {
      const tag = document.createElement('div');
      tag.textContent = tex.split('/').pop();
      tag.style.cssText = 'position:absolute;top:2px;left:3px;font:600 8px "JetBrains Mono";color:rgba(255,255,255,0.85);background:rgba(0,0,0,0.45);padding:1px 4px;border-radius:3px;pointer-events:none;max-width:calc(100% - 6px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      div.appendChild(tag);
    }
  }

  // -------- Minecraft color codes --------
  const MC_COLORS = {
    '0':'#000000','1':'#0000AA','2':'#00AA00','3':'#00AAAA',
    '4':'#AA0000','5':'#AA00AA','6':'#FFAA00','7':'#AAAAAA',
    '8':'#555555','9':'#5555FF','a':'#55FF55','b':'#55FFFF',
    'c':'#FF5555','d':'#FF55FF','e':'#FFFF55','f':'#FFFFFF','g':'#DDD605'
  };
  function parseMcText(text) {
    const out = [];
    if (!text) return out;
    let cur = { text: '', color: null, bold: false, italic: false, underline: false, strike: false };
    let i = 0;
    while (i < text.length) {
      const c = text[i];
      if (c === '§' && i + 1 < text.length) {
        const code = text[i + 1].toLowerCase();
        if (cur.text) out.push({ ...cur });
        cur.text = '';
        if (MC_COLORS[code]) { cur.color = MC_COLORS[code]; cur.bold = cur.italic = cur.underline = cur.strike = false; }
        else if (code === 'l') cur.bold = true;
        else if (code === 'o') cur.italic = true;
        else if (code === 'n') cur.underline = true;
        else if (code === 'm') cur.strike = true;
        else if (code === 'r') { cur.color = null; cur.bold = cur.italic = cur.underline = cur.strike = false; }
        i += 2; continue;
      }
      cur.text += c; i++;
    }
    if (cur.text) out.push(cur);
    return out;
  }

  // -------- Label rendering --------
  function renderLabel(div, props) {
    const text = (props.text == null) ? '' : String(props.text);
    div.style.display = 'flex';
    const align = props.text_alignment || 'left';
    if (align === 'center') div.style.justifyContent = 'center';
    else if (align === 'right') div.style.justifyContent = 'flex-end';
    else div.style.justifyContent = 'flex-start';
    div.style.alignItems = 'center';

    let fontPx = 10;
    if (typeof props.font_size === 'string') {
      const map = { small: 8, normal: 10, medium: 12, large: 16, extra_large: 22 };
      fontPx = map[props.font_size] || 10;
    } else if (typeof props.font_size === 'number') {
      fontPx = props.font_size;
    }
    if (props.size && typeof props.size[1] === 'number' && !props.font_size) {
      fontPx = Math.max(8, Math.min(36, props.size[1]));
    }

    const baseColor = props.color ? SW.rgbaToCss(props.color) : '#ffffff';
    const span = document.createElement('span');
    span.style.fontSize = fontPx + 'px';
    span.style.color = baseColor;
    span.style.fontFamily = '"Space Grotesk", "JetBrains Mono", monospace';
    span.style.fontWeight = '600';
    span.style.whiteSpace = 'nowrap';
    span.style.lineHeight = '1';
    if (props.shadow !== false) span.style.textShadow = '1px 1px 0 rgba(0,0,0,0.6)';

    const segs = parseMcText(text);
    if (!segs.length) span.textContent = text;
    else {
      for (const s of segs) {
        const sp = document.createElement('span');
        sp.textContent = s.text;
        if (s.color) sp.style.color = s.color;
        if (s.bold) sp.style.fontWeight = '700';
        if (s.italic) sp.style.fontStyle = 'italic';
        if (s.underline) sp.style.textDecoration = 'underline';
        if (s.strike) sp.style.textDecoration = (sp.style.textDecoration ? sp.style.textDecoration + ' ' : '') + 'line-through';
        span.appendChild(sp);
      }
    }
    div.appendChild(span);
  }

})(window.SW);
