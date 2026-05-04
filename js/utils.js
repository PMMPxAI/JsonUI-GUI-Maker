// ==========================================================
// utils.js — helpers, ID generation, unicode obfuscation, etc.
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  // ---- IDs ----
  let _seq = 0;
  SW.uid = function (prefix) {
    _seq++;
    return (prefix || 'el') + '_' + _seq.toString(36) + '_' + Date.now().toString(36).slice(-4);
  };

  // ---- Deep clone (structuredClone fallback) ----
  SW.clone = function (obj) {
    if (typeof structuredClone === 'function') return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  };

  // ---- Toast ----
  let toastTimer = null;
  SW.toast = function (msg, kind) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('error');
    if (kind === 'error') el.classList.add('error');
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  };

  // ---- Status bar ----
  SW.setStatus = function (msg) {
    const s = document.getElementById('status');
    if (s) s.textContent = msg;
  };

  // ---- Color helpers ----
  // Bedrock color = [r,g,b,a] in 0..1
  SW.hexToRgba = function (hex, a) {
    if (!hex) return [1, 1, 1, a == null ? 1 : a];
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return [+r.toFixed(3), +g.toFixed(3), +b.toFixed(3), a == null ? 1 : a];
  };
  SW.rgbaToHex = function (rgba) {
    if (!Array.isArray(rgba)) return '#ffffff';
    const c = (v) => Math.max(0, Math.min(255, Math.round((+v || 0) * 255))).toString(16).padStart(2, '0');
    return '#' + c(rgba[0]) + c(rgba[1]) + c(rgba[2]);
  };
  SW.rgbaToCss = function (rgba) {
    if (!Array.isArray(rgba)) return 'white';
    const r = Math.round((+rgba[0] || 0) * 255);
    const g = Math.round((+rgba[1] || 0) * 255);
    const b = Math.round((+rgba[2] || 0) * 255);
    const a = rgba[3] == null ? 1 : +rgba[3];
    return `rgba(${r},${g},${b},${a})`;
  };

  // ---- Bedrock size parser (returns css value)
  // accepts numbers (px), or strings like "100%", "100%c", "100%cm", "50%y", "50%x", "12px"
  // For our flat HTML preview we approximate %c (children content) as 'auto' and % as % of parent
  SW.parseSize = function (val, fallback) {
    if (val == null || val === 'default') return fallback || 'auto';
    if (typeof val === 'number') return val + 'px';
    if (typeof val !== 'string') return fallback || 'auto';
    val = val.trim();
    // Special "default"
    if (val === 'default') return fallback || 'auto';
    // Patterns: "100%", "100%c", "100%cm", "50%c+5px", etc.
    // We'll approximate %c/%cm with auto and ignore additive offsets in CSS, leaving width: auto
    if (/^[-+]?\d+(\.\d+)?\s*px$/i.test(val)) return val;
    if (/^[-+]?\d+(\.\d+)?$/.test(val)) return val + 'px';
    if (/%c/i.test(val) || /%cm/i.test(val)) {
      // content-sized — return 'auto' so children determine size
      return 'auto';
    }
    if (val.endsWith('%')) return val;
    if (val.endsWith('x') || val.endsWith('y')) {
      // % of viewport axis
      const num = parseFloat(val);
      if (!isNaN(num)) return num + '%';
    }
    return fallback || 'auto';
  };

  // ---- Anchor mapping
  // Bedrock anchors: top_left, top_middle, top_right, left_middle, center, right_middle,
  //                  bottom_left, bottom_middle, bottom_right
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
    // common variants
    center_middle: { x: 0.5, y: 0.5 }
  };

  // ---- Unicode obfuscation (encode all keys & string values to \uXXXX where applicable) ----
  // This matches the leaked packs style. We escape ASCII-printable chars to \u00XX.
  function escapeUnicode(str) {
    let out = '';
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      // escape printable ASCII range so it's hard to read but JSON-valid
      // keep newline/etc unchanged (they shouldn't appear in keys/values mostly)
      if (c >= 0x20 && c <= 0x7E) {
        out += '\\u' + c.toString(16).padStart(4, '0');
      } else {
        out += str[i];
      }
    }
    return out;
  }

  // Custom JSON stringify that escapes keys & string values to \u escapes
  SW.stringifyUnicode = function (obj, indent) {
    indent = indent == null ? 4 : indent;
    function step(v, depth) {
      const pad = ' '.repeat(indent * depth);
      const padInner = ' '.repeat(indent * (depth + 1));
      if (v === null) return 'null';
      if (typeof v === 'boolean' || typeof v === 'number') return String(v);
      if (typeof v === 'string') return '"' + escapeUnicode(v) + '"';
      if (Array.isArray(v)) {
        if (v.length === 0) return '[]';
        const items = v.map(it => padInner + step(it, depth + 1));
        return '[\n' + items.join(',\n') + '\n' + pad + ']';
      }
      if (typeof v === 'object') {
        const keys = Object.keys(v);
        if (keys.length === 0) return '{}';
        const items = keys.map(k => padInner + '"' + escapeUnicode(k) + '": ' + step(v[k], depth + 1));
        return '{\n' + items.join(',\n') + '\n' + pad + '}';
      }
      return 'null';
    }
    return step(obj, 0);
  };

  // ---- Pretty stringify that decodes any \u escapes for readability ----
  SW.prettify = function (obj) {
    return JSON.stringify(obj, null, 4);
  };

  // ---- Sanitize: convert any \u escapes inside a parsed JSON object's strings stays the same.
  // But raw text JSON with escapes parses fine into normal characters by JSON.parse already.

  // ---- Modal helpers ----
  SW.openModal = function (id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('hidden');
  };
  SW.closeModal = function (id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
  };
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('[data-close-modal]') || t.closest('[data-close-modal]')) {
      const m = t.closest('.ecl-modal, .modal');
      if (m) m.classList.add('hidden');
    }
  });

  // ---- File download ----
  SW.download = function (filename, content, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  };

  // ---- Find element by id in tree (depth-first) ----
  SW.findById = function (root, id) {
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
  SW.findParent = function (root, id, parent) {
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
  SW.walk = function (root, fn) {
    if (!root) return;
    fn(root);
    if (root.children) root.children.forEach(c => SW.walk(c, fn));
  };

  // ---- Default props for a component type ----
  SW.defaultProps = function (type) {
    const base = {
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
        return Object.assign(base, { size: [200, 100] });
      case 'stack_panel':
        return Object.assign(base, { orientation: 'vertical', size: ['100%c', '100%c'] });
      case 'image':
        return Object.assign(base, {
          size: [120, 120],
          texture: 'textures/ui/Black',
          color: [1, 1, 1, 1]
        });
      case 'label':
        return Object.assign(base, {
          size: ['default', 16],
          text: 'Hello Bedrock',
          color: [1, 1, 1, 1],
          font_size: 'normal',
          text_alignment: 'center',
          shadow: true
        });
      case 'button':
        return Object.assign(base, {
          size: [180, 40],
          $pressed_button_name: 'button.menu_exit',
          default_control: 'default',
          hover_control: 'hover',
          pressed_control: 'pressed',
          controls: []
        });
      case 'input_panel':
        return Object.assign(base, { size: [200, 40] });
      case 'scrolling_panel':
        return Object.assign(base, { size: [240, 200] });
      case 'grid':
        return Object.assign(base, {
          size: [200, 200],
          grid_dimensions: [4, 4],
          grid_item_template: 'grid_item'
        });
      case 'toggle':
        return Object.assign(base, {
          size: [20, 20],
          toggle_name: '',
          toggle_default_state: false,
          toggle_group_forced_index: 0
        });
      case 'dropdown':
        return Object.assign(base, {
          size: [200, 30],
          dropdown_name: 'dropdown',
          dropdown_content_control: 'content',
          dropdown_area: 'content_area'
        });
      case 'slider':
        return Object.assign(base, {
          size: [200, 20],
          slider_track_button: 'track',
          slider_small_decrease_button: 'less',
          slider_small_increase_button: 'more',
          slider_steps: 10,
          slider_direction: 'horizontal',
          default_value: 0.5
        });
      case 'fill':
        return Object.assign(base, {
          size: [200, 20],
          color: [0.2, 0.8, 0.2, 1],
          clip_direction: 'left',
          clip_ratio: 0.7
        });
      case 'custom':
        return Object.assign(base, {
          size: [200, 200],
          renderer: 'custom_renderer'
        });
      default:
        return base;
    }
  };

  // ---- Convert internal element tree to Bedrock JSON ----
  // Internal element: { id, name, type, props:{...}, children:[...] }
  SW.toBedrock = function (root, options) {
    options = options || {};
    const namespace = options.namespace || 'custom_ui';
    const out = { namespace };

    function bedrockEl(el) {
      const o = {};
      // Order: type then known props
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
        if (el.props[k] !== undefined) o[k] = el.props[k];
      }
      // Add any extra
      for (const k of Object.keys(el.props)) {
        if (k === 'type') continue;
        if (order.indexOf(k) >= 0) continue;
        o[k] = el.props[k];
      }
      // Children -> controls
      if (el.children && el.children.length) {
        o.controls = el.children.map(c => {
          const inner = bedrockEl(c);
          const wrap = {};
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

  // ---- Convert Bedrock JSON back to internal tree ----
  SW.fromBedrock = function (json) {
    const root = { id: 'root', name: 'root', type: 'root', props: {}, children: [] };
    if (!json || typeof json !== 'object') return root;
    const namespace = json.namespace || 'custom_ui';
    root.namespace = namespace;
    for (const key of Object.keys(json)) {
      if (key === 'namespace') continue;
      const el = json[key];
      if (!el || typeof el !== 'object') continue;
      root.children.push(parseEl(key, el));
    }
    return root;

    function parseEl(name, raw) {
      const props = {};
      const children = [];
      for (const k of Object.keys(raw)) {
        if (k === 'controls' && Array.isArray(raw[k])) {
          for (const ctrl of raw[k]) {
            if (!ctrl || typeof ctrl !== 'object') continue;
            const cname = Object.keys(ctrl)[0];
            const cdata = ctrl[cname];
            if (cdata && typeof cdata === 'object') {
              children.push(parseEl(cname, cdata));
            }
          }
        } else {
          props[k] = raw[k];
        }
      }
      if (!props.type) props.type = 'panel';
      return {
        id: SW.uid(props.type),
        name: name,
        type: props.type,
        props,
        children
      };
    }
  };

})(window.SW);
