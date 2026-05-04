// ==========================================================
// renderer.ts — Bedrock JSON UI → HTML preview with drag/resize
// ==========================================================
import type { AppState, UINode, UIProps, ScreenDimensions, ScreenSize } from './types.ts';

const SW = window.SW;

SW.SCREEN_SIZES = {
  phone:  { w: 480, h: 260 },
  tablet: { w: 720, h: 420 },
  pc:     { w: 960, h: 540 }
};

SW.render = function (state: AppState): void {
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
  preview.onclick = (e: MouseEvent) => {
    if (e.target === preview) SW.selectElement(null);
  };

  if (state.tree && state.tree.children) {
    for (const child of state.tree.children) {
      const node = renderEl(child, state, preview, false);
      if (node) preview.appendChild(node);
    }
  }
};

function renderEl(el: UINode, state: AppState, parentDom: HTMLElement, stackLayout: boolean): HTMLElement {
  const props = el.props || ({} as UIProps);
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
    div.style.position = 'relative';
    div.style.width = w;
    div.style.height = h;
  } else {
    div.style.width = w;
    div.style.height = h;
    const af = SW.anchorMap[props.anchor_from as string] || SW.anchorMap.center;
    const at = SW.anchorMap[props.anchor_to as string] || af;
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
    case 'grid':
      renderGrid(div, props);
      break;
    case 'toggle':
      renderToggle(div, props);
      break;
    case 'dropdown':
      renderDropdown(div, props);
      break;
    case 'slider':
      renderSlider(div, props);
      break;
    case 'fill':
      renderFill(div, props);
      break;
    case 'custom':
      renderCustom(div, props);
      break;
    case 'scrolling_panel':
      div.style.overflow = 'auto';
      div.style.position = stackLayout ? 'relative' : 'absolute';
      break;
    case 'input_panel':
      renderInputPanel(div, props);
      break;
  }

  if (el.children && el.children.length) {
    for (const child of el.children) {
      const cn = renderEl(child, state, div, stackMode);
      if (cn) div.appendChild(cn);
    }
  }

  div.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    SW.selectElement(el.id);
    startDrag(e, el, state);
  });

  if (state.selectedId === el.id && !stackLayout) {
    addResizeHandles(div, el, state);
  }

  return div;
}

// -------- DRAG TO MOVE --------
function startDrag(e: MouseEvent, el: UINode, state: AppState): void {
  if (state.selectedId !== el.id) return;
  if ((e.target as HTMLElement).closest('.resize-handles')) return;

  const zoom = (state.zoom || 100) / 100;
  const startX = e.clientX;
  const startY = e.clientY;
  const startOffset: [number, number] = [
    (el.props.offset && +(el.props.offset[0])) || 0,
    (el.props.offset && +(el.props.offset[1])) || 0
  ];

  const dom = document.querySelector(`.b-el[data-id="${el.id}"]`) as HTMLElement | null;
  if (dom) dom.classList.add('dragging');

  function onMove(ev: MouseEvent): void {
    const dx = (ev.clientX - startX) / zoom;
    const dy = (ev.clientY - startY) / zoom;
    const snap = state.snap ? 1 : 0;
    const nx = snap ? Math.round(startOffset[0] + dx) : Math.round((startOffset[0] + dx) * 10) / 10;
    const ny = snap ? Math.round(startOffset[1] + dy) : Math.round((startOffset[1] + dy) * 10) / 10;
    el.props.offset = [nx, ny];
    SW.markDirty(true);
    SW.updateSelInfo(el);
    SW.renderInspectorLight();
    const af = SW.anchorMap[el.props.anchor_from as string] || SW.anchorMap.center;
    const at = SW.anchorMap[el.props.anchor_to as string] || af;
    if (dom) dom.style.transform = `translate(calc(${-at.x * 100}% + ${nx}px), calc(${-at.y * 100}% + ${ny}px))`;
  }
  function onUp(): void {
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
function addResizeHandles(div: HTMLElement, el: UINode, state: AppState): void {
  const wrap = document.createElement('div');
  wrap.className = 'resize-handles';
  const dirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  for (const d of dirs) {
    const h = document.createElement('div');
    h.className = 'rh-' + d;
    h.addEventListener('mousedown', (e: MouseEvent) => startResize(e, d, el, state));
    wrap.appendChild(h);
  }
  div.appendChild(wrap);
}

function startResize(e: MouseEvent, dir: string, el: UINode, state: AppState): void {
  e.preventDefault(); e.stopPropagation();
  const zoom = (state.zoom || 100) / 100;
  const dom = document.querySelector(`.b-el[data-id="${el.id}"]`) as HTMLElement | null;
  if (!dom) return;
  const rect = dom.getBoundingClientRect();
  const startW = rect.width / zoom;
  const startH = rect.height / zoom;
  const startX = e.clientX;
  const startY = e.clientY;
  const startOff: [number, number] = [
    (el.props.offset && +(el.props.offset[0])) || 0,
    (el.props.offset && +(el.props.offset[1])) || 0
  ];

  function onMove(ev: MouseEvent): void {
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
  function onUp(): void {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    SW.renderInspector(state);
    SW.refreshCode(state);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// -------- Image rendering --------
function renderImage(div: HTMLElement, props: UIProps): void {
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
    tag.textContent = tex.split('/').pop() || '';
    tag.style.cssText = 'position:absolute;top:2px;left:3px;font:600 8px "JetBrains Mono";color:rgba(255,255,255,0.85);background:rgba(0,0,0,0.45);padding:1px 4px;border-radius:3px;pointer-events:none;max-width:calc(100% - 6px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    div.appendChild(tag);
  }
}

// -------- Minecraft color codes --------
const MC_COLORS: Record<string, string> = {
  '0':'#000000','1':'#0000AA','2':'#00AA00','3':'#00AAAA',
  '4':'#AA0000','5':'#AA00AA','6':'#FFAA00','7':'#AAAAAA',
  '8':'#555555','9':'#5555FF','a':'#55FF55','b':'#55FFFF',
  'c':'#FF5555','d':'#FF55FF','e':'#FFFF55','f':'#FFFFFF','g':'#DDD605'
};

interface McTextSegment {
  text: string;
  color: string | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
}

function parseMcText(text: string): McTextSegment[] {
  const out: McTextSegment[] = [];
  if (!text) return out;
  const cur: McTextSegment = { text: '', color: null, bold: false, italic: false, underline: false, strike: false };
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

// -------- Grid rendering --------
function renderGrid(div: HTMLElement, props: UIProps): void {
  const dims = props.grid_dimensions || [4, 4];
  const cols = dims[0] || 4;
  const rows = dims[1] || 4;
  div.style.display = 'grid';
  div.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  div.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  div.style.gap = '1px';
  div.style.background = 'rgba(255,255,255,0.05)';
  div.style.border = '1px solid rgba(255,255,255,0.1)';
  div.style.borderRadius = '2px';
  const total = cols * rows;
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.style.cssText = 'background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font:600 7px "JetBrains Mono";color:rgba(255,255,255,0.25);min-height:0';
    cell.textContent = String(i);
    div.appendChild(cell);
  }
  const tag = document.createElement('div');
  tag.textContent = `grid ${cols}×${rows}`;
  tag.style.cssText = 'position:absolute;top:2px;left:3px;font:600 8px "JetBrains Mono";color:rgba(255,255,255,0.6);background:rgba(0,0,0,0.55);padding:1px 4px;border-radius:3px;pointer-events:none;z-index:1';
  div.appendChild(tag);
}

// -------- Toggle rendering --------
function renderToggle(div: HTMLElement, props: UIProps): void {
  div.style.cursor = 'pointer';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  const track = document.createElement('div');
  const isOn = !!props.toggle_default_state;
  track.style.cssText = `width:100%;height:100%;border-radius:999px;background:${isOn ? 'rgba(255,107,26,0.8)' : 'rgba(100,100,100,0.5)'};position:relative;transition:background 0.2s`;
  const thumb = document.createElement('div');
  thumb.style.cssText = `width:45%;height:80%;border-radius:50%;background:white;position:absolute;top:10%;${isOn ? 'right:4%' : 'left:4%'};box-shadow:0 1px 3px rgba(0,0,0,0.4)`;
  track.appendChild(thumb);
  div.appendChild(track);
}

// -------- Dropdown rendering --------
function renderDropdown(div: HTMLElement, props: UIProps): void {
  div.style.background = 'rgba(0,0,0,0.4)';
  div.style.border = '1px solid rgba(255,255,255,0.2)';
  div.style.borderRadius = '4px';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.padding = '0 8px';
  div.style.cursor = 'pointer';
  const lbl = document.createElement('span');
  lbl.style.cssText = 'flex:1;font:500 10px "Space Grotesk";color:rgba(255,255,255,0.7)';
  lbl.textContent = props.dropdown_name || 'Select...';
  const arrow = document.createElement('span');
  arrow.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.5);margin-left:4px';
  arrow.textContent = '▼';
  div.appendChild(lbl);
  div.appendChild(arrow);
}

// -------- Slider rendering --------
function renderSlider(div: HTMLElement, props: UIProps): void {
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.padding = '0 4px';
  const track = document.createElement('div');
  track.style.cssText = 'flex:1;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;position:relative';
  const ratio = props.default_value != null ? +props.default_value : 0.5;
  const fill = document.createElement('div');
  fill.style.cssText = `width:${ratio * 100}%;height:100%;background:rgba(255,107,26,0.8);border-radius:2px`;
  const handle = document.createElement('div');
  handle.style.cssText = `width:10px;height:10px;border-radius:50%;background:white;position:absolute;top:-3px;left:${ratio * 100}%;transform:translateX(-50%);box-shadow:0 1px 3px rgba(0,0,0,0.4)`;
  track.appendChild(fill);
  track.appendChild(handle);
  div.appendChild(track);
}

// -------- Fill / progress bar rendering --------
function renderFill(div: HTMLElement, props: UIProps): void {
  div.style.background = 'rgba(0,0,0,0.3)';
  div.style.borderRadius = '2px';
  div.style.overflow = 'hidden';
  div.style.position = div.style.position || 'relative';
  const ratio = props.clip_ratio != null ? +props.clip_ratio : 0.7;
  const fillDiv = document.createElement('div');
  const color = props.color ? SW.rgbaToCss(props.color) : 'rgba(50,200,50,0.8)';
  const dir = props.clip_direction || 'left';
  fillDiv.style.cssText = 'position:absolute;top:0;bottom:0;';
  if (dir === 'left') {
    fillDiv.style.left = '0';
    fillDiv.style.width = (ratio * 100) + '%';
  } else if (dir === 'right') {
    fillDiv.style.right = '0';
    fillDiv.style.width = (ratio * 100) + '%';
  } else if (dir === 'up') {
    fillDiv.style.bottom = '0';
    fillDiv.style.left = '0';
    fillDiv.style.right = '0';
    fillDiv.style.height = (ratio * 100) + '%';
    fillDiv.style.width = '100%';
  } else {
    fillDiv.style.top = '0';
    fillDiv.style.left = '0';
    fillDiv.style.right = '0';
    fillDiv.style.height = (ratio * 100) + '%';
    fillDiv.style.width = '100%';
  }
  fillDiv.style.background = color;
  fillDiv.style.borderRadius = '2px';
  div.appendChild(fillDiv);
  const tag = document.createElement('div');
  tag.textContent = Math.round(ratio * 100) + '%';
  tag.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:600 8px "JetBrains Mono";color:white;text-shadow:0 1px 2px rgba(0,0,0,0.6);pointer-events:none;z-index:1';
  div.appendChild(tag);
}

// -------- Custom control rendering --------
function renderCustom(div: HTMLElement, props: UIProps): void {
  div.style.background = 'rgba(139,92,246,0.1)';
  div.style.border = '1px dashed rgba(139,92,246,0.4)';
  div.style.borderRadius = '4px';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  const tag = document.createElement('div');
  tag.style.cssText = 'font:600 9px "JetBrains Mono";color:rgba(139,92,246,0.7);text-align:center';
  tag.textContent = props.renderer || 'custom';
  div.appendChild(tag);
}

// -------- Input panel rendering --------
function renderInputPanel(div: HTMLElement, props: UIProps): void {
  div.style.background = 'rgba(0,0,0,0.3)';
  div.style.border = '1px solid rgba(255,255,255,0.15)';
  div.style.borderRadius = '4px';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.padding = '0 8px';
  if (!div.querySelector('span')) {
    const placeholder = document.createElement('span');
    placeholder.style.cssText = 'font:400 10px "Space Grotesk";color:rgba(255,255,255,0.3);pointer-events:none';
    placeholder.textContent = props.placeholder_text || 'Input...';
    div.appendChild(placeholder);
  }
}

// -------- Label rendering --------
function renderLabel(div: HTMLElement, props: UIProps): void {
  const text = (props.text == null) ? '' : String(props.text);
  div.style.display = 'flex';
  const align = props.text_alignment || 'left';
  if (align === 'center') div.style.justifyContent = 'center';
  else if (align === 'right') div.style.justifyContent = 'flex-end';
  else div.style.justifyContent = 'flex-start';
  div.style.alignItems = 'center';

  let fontPx = 10;
  if (typeof props.font_size === 'string') {
    const map: Record<string, number> = { small: 8, normal: 10, medium: 12, large: 16, extra_large: 22 };
    fontPx = map[props.font_size] || 10;
  } else if (typeof props.font_size === 'number') {
    fontPx = props.font_size;
  }
  if (props.size && typeof props.size[1] === 'number' && !props.font_size) {
    fontPx = Math.max(8, Math.min(36, props.size[1] as number));
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
