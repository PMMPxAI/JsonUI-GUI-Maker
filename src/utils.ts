// ==========================================================
// utils.ts — helpers, ID generation, unicode obfuscation, etc.
// ==========================================================
import type { ColorRGBA, ComponentType, UIProps, UINode, AnchorPoint } from './types.ts';

const SW = window.SW = window.SW || ({} as typeof window.SW);

// ---- IDs ----
let _seq = 0;
SW.uid = function (prefix?: string): string {
  _seq++;
  return (prefix || 'el') + '_' + _seq.toString(36) + '_' + Date.now().toString(36).slice(-4);
};

// ---- Deep clone ----
SW.clone = function <T>(obj: T): T {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
};

// ---- Toast ----
let toastTimer: ReturnType<typeof setTimeout> | null = null;
SW.toast = function (msg: string, kind?: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('error');
  if (kind === 'error') el.classList.add('error');
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
};

// ---- Status bar ----
SW.setStatus = function (msg: string): void {
  const s = document.getElementById('status');
  if (s) s.textContent = msg;
};

// ---- Color helpers ----
SW.hexToRgba = function (hex: string, a?: number): ColorRGBA {
  if (!hex) return [1, 1, 1, a == null ? 1 : a];
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return [+r.toFixed(3), +g.toFixed(3), +b.toFixed(3), a == null ? 1 : a];
};

SW.rgbaToHex = function (rgba: ColorRGBA | unknown[]): string {
  if (!Array.isArray(rgba)) return '#ffffff';
  const c = (v: unknown) => Math.max(0, Math.min(255, Math.round((+(v as number) || 0) * 255))).toString(16).padStart(2, '0');
  return '#' + c(rgba[0]) + c(rgba[1]) + c(rgba[2]);
};

SW.rgbaToCss = function (rgba: ColorRGBA | unknown[]): string {
  if (!Array.isArray(rgba)) return 'white';
  const r = Math.round((+(rgba[0] as number) || 0) * 255);
  const g = Math.round((+(rgba[1] as number) || 0) * 255);
  const b = Math.round((+(rgba[2] as number) || 0) * 255);
  const a = rgba[3] == null ? 1 : +(rgba[3] as number);
  return `rgba(${r},${g},${b},${a})`;
};

// ---- Bedrock size parser ----
SW.parseSize = function (val: unknown, fallback?: string): string {
  if (val == null || val === 'default') return fallback || 'auto';
  if (typeof val === 'number') return val + 'px';
  if (typeof val !== 'string') return fallback || 'auto';
  const v = val.trim();
  if (v === 'default') return fallback || 'auto';
  if (/^[-+]?\d+(\.\d+)?\s*px$/i.test(v)) return v;
  if (/^[-+]?\d+(\.\d+)?$/.test(v)) return v + 'px';
  if (/%c/i.test(v) || /%cm/i.test(v)) return 'auto';
  if (v.endsWith('%')) return v;
  if (v.endsWith('x') || v.endsWith('y')) {
    const num = parseFloat(v);
    if (!isNaN(num)) return num + '%';
  }
  return fallback || 'auto';
};

// ---- Anchor mapping ----
SW.anchorMap = {
  top_left:      { x: 0,   y: 0   },
  top_middle:    { x: 0.5, y: 0   },
  top_right:     { x: 1,   y: 0   },
  left_middle:   { x: 0,   y: 0.5 },
  center:        { x: 0.5, y: 0.5 },
  right_middle:  { x: 1,   y: 0.5 },
  bottom_left:   { x: 0,   y: 1   },
  bottom_middle: { x: 0.5, y: 1   },
  bottom_right:  { x: 1,   y: 1   },
  center_middle: { x: 0.5, y: 0.5 }
} as Record<string, AnchorPoint>;

// ---- Unicode obfuscation ----
function escapeUnicode(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 0x20 && c <= 0x7E) {
      out += '\\u' + c.toString(16).padStart(4, '0');
    } else {
      out += str[i];
    }
  }
  return out;
}

SW.stringifyUnicode = function (obj: unknown, indent?: number): string {
  const ind = indent == null ? 4 : indent;
  function step(v: unknown, depth: number): string {
    const pad = ' '.repeat(ind * depth);
    const padInner = ' '.repeat(ind * (depth + 1));
    if (v === null) return 'null';
    if (typeof v === 'boolean' || typeof v === 'number') return String(v);
    if (typeof v === 'string') return '"' + escapeUnicode(v) + '"';
    if (Array.isArray(v)) {
      if (v.length === 0) return '[]';
      const items = v.map(it => padInner + step(it, depth + 1));
      return '[\n' + items.join(',\n') + '\n' + pad + ']';
    }
    if (typeof v === 'object' && v !== null) {
      const keys = Object.keys(v);
      if (keys.length === 0) return '{}';
      const items = keys.map(k => padInner + '"' + escapeUnicode(k) + '": ' + step((v as Record<string, unknown>)[k], depth + 1));
      return '{\n' + items.join(',\n') + '\n' + pad + '}';
    }
    return 'null';
  }
  return step(obj, 0);
};

SW.prettify = function (obj: unknown): string {
  return JSON.stringify(obj, null, 4);
};

// ---- Modal helpers ----
SW.openModal = function (id: string): void {
  const m = document.getElementById(id);
  if (m) m.classList.remove('hidden');
};
SW.closeModal = function (id: string): void {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
};
document.addEventListener('click', (e: MouseEvent) => {
  const t = e.target as HTMLElement;
  if (t.matches('[data-close-modal]') || t.closest('[data-close-modal]')) {
    const m = t.closest('.ecl-modal, .modal');
    if (m) m.classList.add('hidden');
  }
});

// ---- File download ----
SW.download = function (filename: string, content: string | Blob, mime?: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
};

// ---- Find element by id ----
SW.findById = function (root: UINode, id: string): UINode | null {
  if (!root) return null;
  if (root.id === id) return root;
  if (root.children) {
    for (const c of root.children) {
      const f = SW.findById(c, id);
      if (f) return f;
    }
  }
  return null;
};

SW.findParent = function (root: UINode, id: string, parent?: UINode | null): UINode | null {
  if (!root || root.id === id) return parent || null;
  if (root.children) {
    for (const c of root.children) {
      const f = SW.findParent(c, id, root);
      if (f) return f;
    }
  }
  return null;
};

// ---- Walk all elements ----
SW.walk = function (root: UINode, fn: (el: UINode) => void): void {
  if (!root) return;
  fn(root);
  if (root.children) root.children.forEach(c => SW.walk(c, fn));
};

// ---- Default props ----
SW.defaultProps = function (type: ComponentType): UIProps {
  const base: UIProps = {
    type,
    size: ['100%c', '100%c'],
    offset: [0, 0],
    anchor_from: 'center',
    anchor_to: 'center',
    alpha: 1,
    layer: 0
  };
  switch (type) {
    case 'panel':
      return Object.assign(base, { size: [200, 100] as [number, number] });
    case 'stack_panel':
      return Object.assign(base, { orientation: 'vertical' as const, size: ['100%c', '100%c'] as [string, string] });
    case 'image':
      return Object.assign(base, {
        size: [120, 120] as [number, number],
        texture: 'textures/ui/Black',
        color: [1, 1, 1, 1] as ColorRGBA
      });
    case 'label':
      return Object.assign(base, {
        size: ['default', 16] as [string, number],
        text: 'Hello Bedrock',
        color: [1, 1, 1, 1] as ColorRGBA,
        font_size: 'normal' as const,
        text_alignment: 'center' as const,
        shadow: true
      });
    case 'button':
      return Object.assign(base, {
        size: [180, 40] as [number, number],
        $pressed_button_name: 'button.menu_exit',
        default_control: 'default',
        hover_control: 'hover',
        pressed_control: 'pressed',
        controls: []
      });
    case 'input_panel':
      return Object.assign(base, { size: [200, 40] as [number, number] });
    case 'scrolling_panel':
      return Object.assign(base, { size: [240, 200] as [number, number] });
    case 'grid':
      return Object.assign(base, {
        size: [200, 200] as [number, number],
        grid_dimensions: [4, 4] as [number, number],
        grid_item_template: 'grid_item'
      });
    case 'toggle':
      return Object.assign(base, {
        size: [20, 20] as [number, number],
        toggle_name: '',
        toggle_default_state: false,
        toggle_group_forced_index: 0
      });
    case 'dropdown':
      return Object.assign(base, {
        size: [200, 30] as [number, number],
        dropdown_name: 'dropdown',
        dropdown_content_control: 'content',
        dropdown_area: 'content_area'
      });
    case 'slider':
      return Object.assign(base, {
        size: [200, 20] as [number, number],
        slider_track_button: 'track',
        slider_small_decrease_button: 'less',
        slider_small_increase_button: 'more',
        slider_steps: 10,
        slider_direction: 'horizontal',
        default_value: 0.5
      });
    case 'fill':
      return Object.assign(base, {
        size: [200, 20] as [number, number],
        color: [0.2, 0.8, 0.2, 1] as ColorRGBA,
        clip_direction: 'left' as const,
        clip_ratio: 0.7
      });
    case 'custom':
      return Object.assign(base, {
        size: [200, 200] as [number, number],
        renderer: 'custom_renderer'
      });
    default:
      return base;
  }
};

// ---- Convert tree to Bedrock JSON ----
SW.toBedrock = function (root: UINode, options?: { namespace?: string }): Record<string, unknown> {
  const opts = options || {};
  const namespace = opts.namespace || 'custom_ui';
  const out: Record<string, unknown> = { namespace };

  function bedrockEl(el: UINode): Record<string, unknown> {
    const o: Record<string, unknown> = {};
    o.type = el.props.type || 'panel';
    const order = [
      'orientation', 'size', 'offset', 'anchor_from', 'anchor_to',
      'layer', 'alpha', 'color', 'texture', 'uv', 'uv_size',
      'nine_slice_buttoned', 'tiled', 'clip_direction', 'clip_ratio', 'clip_pixelperfect',
      'text', 'font_size', 'font_type', 'text_alignment', 'shadow',
      'localize', 'visible', 'enabled',
      '$pressed_button_name', 'default_control', 'hover_control', 'pressed_control',
      'toggle_name', 'toggle_default_state', 'toggle_group_forced_index',
      'grid_dimensions', 'grid_item_template', 'collection_name',
      'dropdown_name', 'dropdown_content_control', 'dropdown_area',
      'slider_track_button', 'slider_small_decrease_button', 'slider_small_increase_button',
      'slider_steps', 'slider_direction', 'default_value',
      'renderer', 'property_bag'
    ];
    for (const k of order) {
      if ((el.props as Record<string, unknown>)[k] !== undefined) o[k] = (el.props as Record<string, unknown>)[k];
    }
    for (const k of Object.keys(el.props)) {
      if (k === 'type') continue;
      if (order.indexOf(k) >= 0) continue;
      o[k] = (el.props as Record<string, unknown>)[k];
    }
    if (el.children && el.children.length) {
      o.controls = el.children.map(c => {
        const inner = bedrockEl(c);
        const wrap: Record<string, unknown> = {};
        wrap[c.name || c.id] = inner;
        return wrap;
      });
    }
    return o;
  }

  if (root && root.children) {
    for (const c of root.children) {
      const name = c.name || c.id;
      out[name] = bedrockEl(c);
    }
  }
  return out;
};

// ---- Convert Bedrock JSON to tree ----
SW.fromBedrock = function (json: Record<string, unknown>): UINode {
  const root: UINode = { id: 'root', name: 'root', type: 'root', props: { type: 'panel' } as UIProps, children: [] };
  if (!json || typeof json !== 'object') return root;
  const namespace = (json.namespace as string) || 'custom_ui';
  root.namespace = namespace;
  for (const key of Object.keys(json)) {
    if (key === 'namespace') continue;
    const el = json[key];
    if (!el || typeof el !== 'object') continue;
    root.children.push(parseEl(key, el as Record<string, unknown>));
  }
  return root;

  function parseEl(name: string, raw: Record<string, unknown>): UINode {
    const props: Record<string, unknown> = {};
    const children: UINode[] = [];
    for (const k of Object.keys(raw)) {
      if (k === 'controls' && Array.isArray(raw[k])) {
        for (const ctrl of raw[k] as Record<string, unknown>[]) {
          if (!ctrl || typeof ctrl !== 'object') continue;
          const cname = Object.keys(ctrl)[0];
          const cdata = ctrl[cname];
          if (cdata && typeof cdata === 'object') {
            children.push(parseEl(cname, cdata as Record<string, unknown>));
          }
        }
      } else {
        props[k] = raw[k];
      }
    }
    if (!props.type) props.type = 'panel';
    return {
      id: SW.uid(props.type as string),
      name: name,
      type: props.type as string,
      props: props as UIProps,
      children
    };
  }
};
