// ==========================================================
// inspector.js — Eclipse-style property inspector
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  const TYPES = ['panel','stack_panel','image','label','button','input_panel','scrolling_panel','grid','toggle','dropdown','slider','fill','custom'];
  const ANCHORS = ['top_left','top_middle','top_right','left_middle','center','right_middle','bottom_left','bottom_middle','bottom_right'];
  const FONT_SIZES = ['small','normal','medium','large','extra_large'];
  const ALIGNS = ['left','center','right'];
  const ORIENTATIONS = ['vertical','horizontal'];

  SW.renderInspector = function (state) {
    const insp = document.getElementById('inspector');
    const title = document.getElementById('insp-title');
    if (!insp || !title) return;
    insp.innerHTML = '';

    const sel = state.selectedId ? SW.findById(state.tree, state.selectedId) : null;
    if (!sel) {
      title.textContent = '— aucun élément —';
      insp.innerHTML = `<div class="insp-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h18v18H3zM3 9h18M9 3v18"/></svg>
        <div>Sélectionnez un élément pour éditer ses propriétés.</div>
      </div>`;
      return;
    }

    title.textContent = sel.name || sel.id;

    // Identity
    insp.appendChild(section('Identité', true, [
      row('Nom', textInput(sel.name || '', v => { sel.name = v; SW.markDirty(true); SW.refresh(); })),
      row('Type', selectInput(TYPES, sel.props.type, v => { sel.props.type = v; sel.type = v; SW.markDirty(true); SW.refresh(); }))
    ]));

    // Layout
    const sizeArr = sel.props.size || ['100%c', '100%c'];
    const offArr = sel.props.offset || [0, 0];

    insp.appendChild(section('Layout', true, [
      row('Taille', pairInput(
        valToString(sizeArr[0]), valToString(sizeArr[1]),
        (a, b) => { sel.props.size = [smartParse(a), smartParse(b)]; SW.markDirty(true); SW.refresh(); }
      )),
      row('Offset', pairInput(
        String(offArr[0] || 0), String(offArr[1] || 0),
        (a, b) => { sel.props.offset = [+a || 0, +b || 0]; SW.markDirty(true); SW.refresh(); },
        'number'
      )),
      row('Anc. From', selectInput(ANCHORS, sel.props.anchor_from || 'center', v => { sel.props.anchor_from = v; SW.markDirty(true); SW.refresh(); })),
      row('Anc. To',   selectInput(ANCHORS, sel.props.anchor_to   || 'center', v => { sel.props.anchor_to   = v; SW.markDirty(true); SW.refresh(); })),
      row('Layer', numberInput(sel.props.layer != null ? sel.props.layer : 0, v => { sel.props.layer = +v || 0; SW.markDirty(true); SW.refresh(); })),
      row('Alpha', rangeInput(sel.props.alpha != null ? sel.props.alpha : 1, v => { sel.props.alpha = parseFloat(v); SW.markDirty(true); SW.refresh(); }))
    ]));

    // Type-specific
    if (sel.props.type === 'image') {
      insp.appendChild(section('Image', true, [
        row('Texture', textInput(sel.props.texture || '', v => { sel.props.texture = v; SW.markDirty(true); SW.refresh(); })),
        row('Couleur', colorRow(sel.props.color || [1,1,1,1], v => { sel.props.color = v; SW.markDirty(true); SW.refresh(); }))
      ]));
    }

    if (sel.props.type === 'label') {
      insp.appendChild(section('Texte', true, [
        row('Texte', textareaInput(sel.props.text || '', v => { sel.props.text = v; SW.markDirty(true); SW.refresh(); })),
        row('Couleur', colorRow(sel.props.color || [1,1,1,1], v => { sel.props.color = v; SW.markDirty(true); SW.refresh(); })),
        row('Font', selectInput(FONT_SIZES, typeof sel.props.font_size === 'string' ? sel.props.font_size : 'normal', v => { sel.props.font_size = v; SW.markDirty(true); SW.refresh(); })),
        row('Align', selectInput(ALIGNS, sel.props.text_alignment || 'left', v => { sel.props.text_alignment = v; SW.markDirty(true); SW.refresh(); })),
        row('Ombre', checkInput(sel.props.shadow !== false, v => { sel.props.shadow = v; SW.markDirty(true); SW.refresh(); }))
      ]));
    }

    if (sel.props.type === 'stack_panel') {
      insp.appendChild(section('Stack', true, [
        row('Orientation', selectInput(ORIENTATIONS, sel.props.orientation || 'vertical', v => { sel.props.orientation = v; SW.markDirty(true); SW.refresh(); }))
      ]));
    }

    if (sel.props.type === 'button') {
      insp.appendChild(section('Button', false, [
        row('Pressed', textInput(sel.props.$pressed_button_name || '', v => { sel.props.$pressed_button_name = v; SW.markDirty(true); })),
        row('Default', textInput(sel.props.default_control || '', v => { sel.props.default_control = v; SW.markDirty(true); })),
        row('Hover',   textInput(sel.props.hover_control || '',   v => { sel.props.hover_control = v;   SW.markDirty(true); })),
        row('Pressé',  textInput(sel.props.pressed_control || '', v => { sel.props.pressed_control = v; SW.markDirty(true); }))
      ]));
    }

    if (sel.props.type === 'grid') {
      const gd = sel.props.grid_dimensions || [4, 4];
      insp.appendChild(section('Grid', true, [
        row('Colonnes', numberInput(gd[0] || 4, v => { sel.props.grid_dimensions = [+v || 4, (sel.props.grid_dimensions || [4,4])[1]]; SW.markDirty(true); SW.refresh(); })),
        row('Lignes', numberInput(gd[1] || 4, v => { sel.props.grid_dimensions = [(sel.props.grid_dimensions || [4,4])[0], +v || 4]; SW.markDirty(true); SW.refresh(); })),
        row('Template', textInput(sel.props.grid_item_template || '', v => { sel.props.grid_item_template = v; SW.markDirty(true); })),
        row('Collection', textInput(sel.props.collection_name || '', v => { sel.props.collection_name = v; SW.markDirty(true); }))
      ]));
    }

    if (sel.props.type === 'toggle') {
      insp.appendChild(section('Toggle', true, [
        row('Nom', textInput(sel.props.toggle_name || '', v => { sel.props.toggle_name = v; SW.markDirty(true); })),
        row('État', checkInput(!!sel.props.toggle_default_state, v => { sel.props.toggle_default_state = v; SW.markDirty(true); SW.refresh(); })),
        row('Index', numberInput(sel.props.toggle_group_forced_index || 0, v => { sel.props.toggle_group_forced_index = +v || 0; SW.markDirty(true); }))
      ]));
    }

    if (sel.props.type === 'dropdown') {
      insp.appendChild(section('Dropdown', true, [
        row('Nom', textInput(sel.props.dropdown_name || '', v => { sel.props.dropdown_name = v; SW.markDirty(true); SW.refresh(); })),
        row('Content', textInput(sel.props.dropdown_content_control || '', v => { sel.props.dropdown_content_control = v; SW.markDirty(true); })),
        row('Area', textInput(sel.props.dropdown_area || '', v => { sel.props.dropdown_area = v; SW.markDirty(true); }))
      ]));
    }

    if (sel.props.type === 'slider') {
      insp.appendChild(section('Slider', true, [
        row('Steps', numberInput(sel.props.slider_steps || 10, v => { sel.props.slider_steps = +v || 10; SW.markDirty(true); })),
        row('Direction', selectInput(['horizontal', 'vertical'], sel.props.slider_direction || 'horizontal', v => { sel.props.slider_direction = v; SW.markDirty(true); SW.refresh(); })),
        row('Valeur', rangeInput(sel.props.default_value != null ? sel.props.default_value : 0.5, v => { sel.props.default_value = parseFloat(v); SW.markDirty(true); SW.refresh(); }))
      ]));
    }

    if (sel.props.type === 'fill') {
      const CLIP_DIRS = ['left', 'right', 'up', 'down'];
      insp.appendChild(section('Fill', true, [
        row('Couleur', colorRow(sel.props.color || [0.2, 0.8, 0.2, 1], v => { sel.props.color = v; SW.markDirty(true); SW.refresh(); })),
        row('Direction', selectInput(CLIP_DIRS, sel.props.clip_direction || 'left', v => { sel.props.clip_direction = v; SW.markDirty(true); SW.refresh(); })),
        row('Ratio', rangeInput(sel.props.clip_ratio != null ? sel.props.clip_ratio : 0.7, v => { sel.props.clip_ratio = parseFloat(v); SW.markDirty(true); SW.refresh(); }))
      ]));
    }

    if (sel.props.type === 'custom') {
      insp.appendChild(section('Custom', true, [
        row('Renderer', textInput(sel.props.renderer || '', v => { sel.props.renderer = v; SW.markDirty(true); SW.refresh(); }))
      ]));
    }

    // Nine-slice section (for image type)
    if (sel.props.type === 'image') {
      const ns = sel.props.nine_slice_buttoned || null;
      insp.appendChild(section('Nine Slice', false, [
        row('Activé', checkInput(!!ns, v => {
          if (v) sel.props.nine_slice_buttoned = sel.props.nine_slice_buttoned || [4, 4, 4, 4];
          else delete sel.props.nine_slice_buttoned;
          SW.markDirty(true); SW.refresh();
        })),
        row('Tiled', checkInput(!!sel.props.tiled, v => { sel.props.tiled = v; SW.markDirty(true); }))
      ]));
    }

    // Visibility section for all types
    insp.appendChild(section('Visibilité', false, [
      row('Visible', checkInput(sel.props.visible !== false, v => { sel.props.visible = v; SW.markDirty(true); SW.refresh(); })),
      row('Enabled', checkInput(sel.props.enabled !== false, v => { sel.props.enabled = v; SW.markDirty(true); })),
      row('Clip', checkInput(!!sel.props.clips_children, v => { sel.props.clips_children = v; SW.markDirty(true); SW.refresh(); }))
    ]));

    // Animation section — only for editable elements
    insp.appendChild(animationSection(sel));

    insp.appendChild(rawJsonSection(sel));
  };

  // ====== Animation section ======
  function animationSection(sel) {
    const wrap = document.createElement('div');
    wrap.className = 'insp-section';
    const head = document.createElement('div');
    head.className = 'insp-section-head';
    head.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6"/></svg><span>Animation</span>`;
    const body = document.createElement('div');
    body.className = 'insp-section-body';
    body.style.display = 'none';

    // If this element IS an animation definition, show its editor
    if (sel.props && sel.props.anim_type) {
      body.appendChild(animEditor(sel));
    } else {
      // Otherwise, show presets to apply to a property
      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:10px;color:#8a8a8a;margin-bottom:6px';
      hint.textContent = 'Cliquer pour animer cette propriété';
      body.appendChild(hint);

      const ALPHA_PRESETS = [
        { id: 'fade_in', label: 'Fade in', sub: '0 → 1 · 0.4s' },
        { id: 'fade_out', label: 'Fade out', sub: '1 → 0 · 0.4s' }
      ];
      const OFFSET_PRESETS = [
        { id: 'slide_in_left',  label: 'Slide ← ', sub: 'depuis gauche' },
        { id: 'slide_in_right', label: 'Slide →',  sub: 'depuis droite' },
        { id: 'slide_in_top',   label: 'Slide ↓',  sub: 'depuis haut' },
        { id: 'bounce',         label: 'Bounce',   sub: 'rebond' }
      ];
      const SIZE_PRESETS = [
        { id: 'pop_in', label: 'Pop in', sub: 'grandit' },
        { id: 'pulse_size', label: 'Pulse', sub: 'respire' }
      ];

      body.appendChild(presetGroup('Alpha', ALPHA_PRESETS, 'alpha', sel.id));
      body.appendChild(presetGroup('Offset', OFFSET_PRESETS, 'offset', sel.id));
      body.appendChild(presetGroup('Size', SIZE_PRESETS, 'size', sel.id));

      // Show current refs
      const refs = [];
      for (const k of ['alpha', 'offset', 'size', 'color']) {
        const v = sel.props && sel.props[k];
        if (typeof v === 'string' && v.startsWith('@')) refs.push({ k, v });
      }
      if (refs.length) {
        const hr = document.createElement('div');
        hr.style.cssText = 'height:1px;background:#262626;margin:8px 0';
        body.appendChild(hr);
        const title = document.createElement('div');
        title.style.cssText = 'font-size:10px;color:#8a8a8a;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.1em';
        title.textContent = 'Animations actives';
        body.appendChild(title);
        refs.forEach(({ k, v }) => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 6px;background:#0d0d0d;border:1px solid #262626;border-radius:4px;margin-top:4px';
          row.innerHTML = `<span style="font-family:JetBrains Mono;font-size:10px;color:#ff6b1a">${k}</span><span style="font-family:JetBrains Mono;font-size:10px;color:#d4d4d4;flex:1;overflow:hidden;text-overflow:ellipsis">${v}</span>`;
          const rm = document.createElement('button');
          rm.style.cssText = 'background:transparent;color:#ff6b6b;border:0;font-size:10px;cursor:pointer;padding:2px 6px';
          rm.textContent = '✕';
          rm.onclick = () => {
            delete sel.props[k];
            SW.markDirty(true); SW.refresh();
          };
          row.appendChild(rm);
          body.appendChild(row);
        });
      }
    }

    head.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : '';
      head.classList.toggle('open', !isOpen);
    });
    wrap.appendChild(head); wrap.appendChild(body);
    return wrap;
  }

  function presetGroup(title, presets, prop, elementId) {
    const wrap = document.createElement('div');
    wrap.style.marginBottom = '8px';
    const t = document.createElement('div');
    t.style.cssText = 'font-size:10px;font-weight:700;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px';
    t.textContent = title;
    wrap.appendChild(t);
    const grid = document.createElement('div');
    grid.className = 'anim-preset-grid';
    for (const p of presets) {
      const b = document.createElement('button');
      b.className = 'anim-preset';
      b.innerHTML = `<div class="anim-label">${p.label}</div><div class="anim-sub">${p.sub}</div>`;
      b.onclick = () => SW.createAnimationOn(elementId, prop, p.id);
      grid.appendChild(b);
    }
    wrap.appendChild(grid);
    return wrap;
  }

  function animEditor(sel) {
    const wrap = document.createElement('div');
    wrap.style.display = 'grid'; wrap.style.gap = '8px';

    const ANIM_TYPES = ['wait', 'alpha', 'offset', 'size', 'color', 'clip', 'flip_book'];
    const EASINGS = ['linear','in_quad','out_quad','in_out_quad','in_cubic','out_cubic','in_out_cubic','in_sine','out_sine','in_out_sine','in_expo','out_expo','in_out_expo','spring'];

    wrap.appendChild(row('Type', selectInput(ANIM_TYPES, sel.props.anim_type || 'wait', v => {
      sel.props.anim_type = v; SW.markDirty(true); SW.refresh();
    })));
    wrap.appendChild(row('Durée', numberInput(sel.props.duration != null ? sel.props.duration : 0.4, v => {
      sel.props.duration = parseFloat(v) || 0; SW.markDirty(true);
    })));
    wrap.appendChild(row('Easing', selectInput(EASINGS, sel.props.easing || 'linear', v => {
      sel.props.easing = v; SW.markDirty(true);
    })));
    wrap.appendChild(row('From', textInput(JSON.stringify(sel.props.from ?? ''), v => {
      try { sel.props.from = JSON.parse(v); } catch { sel.props.from = v; }
      SW.markDirty(true);
    })));
    wrap.appendChild(row('To', textInput(JSON.stringify(sel.props.to ?? ''), v => {
      try { sel.props.to = JSON.parse(v); } catch { sel.props.to = v; }
      SW.markDirty(true);
    })));
    wrap.appendChild(row('Next', textInput(sel.props.next || '', v => {
      if (v) sel.props.next = v; else delete sel.props.next;
      SW.markDirty(true);
    })));
    const playRow = document.createElement('button');
    playRow.className = 'ecl-btn-primary';
    playRow.style.justifyContent = 'center';
    playRow.style.width = '100%';
    playRow.textContent = '▶ Tester';
    playRow.onclick = () => {
      if (!SW.anim.isPlaying) SW.anim.play();
      else { SW.anim.pause(); setTimeout(() => SW.anim.play(), 50); }
    };
    wrap.appendChild(playRow);
    return wrap;
  }

  // Light inspector update during drag/resize (updates numeric fields without rebuilding)
  SW.renderInspectorLight = function () {
    const sel = SW.state.selectedId ? SW.findById(SW.state.tree, SW.state.selectedId) : null;
    if (!sel) return;
    const inputs = document.querySelectorAll('#inspector .insp-input, #inspector .insp-select');
    // too complex to match by type reliably; just refresh the whole inspector when fields are not focused
    if (document.activeElement && document.activeElement.closest('#inspector')) return;
    SW.renderInspector(SW.state);
  };

  // ====== UI helpers ======
  function section(title, open, rows) {
    const wrap = document.createElement('div');
    wrap.className = 'insp-section';
    const head = document.createElement('div');
    head.className = 'insp-section-head' + (open ? ' open' : '');
    head.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6"/></svg><span>${title}</span>`;
    const body = document.createElement('div');
    body.className = 'insp-section-body';
    if (!open) body.style.display = 'none';
    rows.forEach(r => body.appendChild(r));
    head.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : '';
      head.classList.toggle('open', !isOpen);
    });
    wrap.appendChild(head); wrap.appendChild(body);
    return wrap;
  }
  function row(label, control) {
    const wrap = document.createElement('div');
    wrap.className = 'insp-row';
    const lab = document.createElement('label');
    lab.textContent = label;
    wrap.appendChild(lab);
    wrap.appendChild(control);
    return wrap;
  }
  function textInput(value, onChange) {
    const i = document.createElement('input');
    i.className = 'insp-input'; i.type = 'text'; i.value = value;
    i.addEventListener('input', () => onChange(i.value));
    return i;
  }
  function textareaInput(value, onChange) {
    const ta = document.createElement('textarea');
    ta.className = 'insp-input'; ta.rows = 2; ta.style.resize = 'vertical';
    ta.value = value;
    ta.addEventListener('input', () => onChange(ta.value));
    return ta;
  }
  function numberInput(value, onChange) {
    const i = document.createElement('input');
    i.className = 'insp-input'; i.type = 'number'; i.step = 'any'; i.value = value;
    i.addEventListener('input', () => onChange(i.value));
    return i;
  }
  function rangeInput(value, onChange) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px';
    const r = document.createElement('input');
    r.type = 'range'; r.min = '0'; r.max = '1'; r.step = '0.01'; r.value = value;
    r.style.flex = '1';
    const v = document.createElement('span');
    v.style.cssText = 'font-family:JetBrains Mono;font-size:10px;color:#8a8a8a;min-width:30px;text-align:right';
    v.textContent = (+value).toFixed(2);
    r.addEventListener('input', () => { v.textContent = (+r.value).toFixed(2); onChange(r.value); });
    wrap.appendChild(r); wrap.appendChild(v);
    return wrap;
  }
  function checkInput(value, onChange) {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer';
    const c = document.createElement('input');
    c.type = 'checkbox'; c.checked = !!value;
    c.addEventListener('change', () => onChange(c.checked));
    wrap.appendChild(c);
    const lbl = document.createElement('span'); lbl.style.cssText = 'font-size:11px;color:#8a8a8a';
    lbl.textContent = value ? 'activé' : 'désactivé';
    c.addEventListener('change', () => lbl.textContent = c.checked ? 'activé' : 'désactivé');
    wrap.appendChild(lbl);
    return wrap;
  }
  function selectInput(options, value, onChange) {
    const s = document.createElement('select');
    s.className = 'insp-select';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      if (opt === value) o.selected = true;
      s.appendChild(o);
    });
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }
  function pairInput(a, b, onChange, type) {
    const w = document.createElement('div'); w.className = 'insp-pair';
    const ia = document.createElement('input'); const ib = document.createElement('input');
    ia.className = ib.className = 'insp-input';
    ia.type = ib.type = type === 'number' ? 'number' : 'text';
    if (type === 'number') { ia.step = ib.step = 'any'; }
    ia.value = a; ib.value = b;
    const fire = () => onChange(ia.value, ib.value);
    ia.addEventListener('input', fire);
    ib.addEventListener('input', fire);
    w.appendChild(ia); w.appendChild(ib);
    return w;
  }
  function colorRow(rgba, onChange) {
    const w = document.createElement('div'); w.className = 'insp-color-row';
    const cp = document.createElement('input'); cp.type = 'color';
    cp.value = SW.rgbaToHex(rgba);
    const alpha = document.createElement('input');
    alpha.type = 'number'; alpha.className = 'insp-input';
    alpha.style.width = '52px'; alpha.step = '0.05'; alpha.min = '0'; alpha.max = '1';
    alpha.value = rgba[3] != null ? rgba[3] : 1;
    const hex = document.createElement('input');
    hex.className = 'insp-input'; hex.style.flex = '1';
    hex.value = SW.rgbaToHex(rgba);
    cp.addEventListener('input', () => {
      hex.value = cp.value;
      onChange(SW.hexToRgba(cp.value, +alpha.value));
    });
    alpha.addEventListener('input', () => {
      onChange(SW.hexToRgba(cp.value, +alpha.value));
    });
    hex.addEventListener('change', () => {
      try {
        cp.value = hex.value;
        onChange(SW.hexToRgba(hex.value, +alpha.value));
      } catch (e) {}
    });
    w.appendChild(cp); w.appendChild(hex); w.appendChild(alpha);
    return w;
  }
  function valToString(v) {
    if (Array.isArray(v)) return JSON.stringify(v);
    if (v == null) return '';
    return String(v);
  }
  function smartParse(s) {
    if (s == null) return s;
    s = String(s).trim();
    if (s === 'default') return 'default';
    if (/^[-+]?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    return s;
  }
  function rawJsonSection(sel) {
    const wrap = document.createElement('div'); wrap.className = 'insp-section';
    const head = document.createElement('div'); head.className = 'insp-section-head';
    head.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6"/></svg><span>JSON brut</span>`;
    const body = document.createElement('div'); body.className = 'insp-section-body'; body.style.display = 'none';
    const ta = document.createElement('textarea');
    ta.className = 'insp-input'; ta.rows = 8;
    ta.style.resize = 'vertical'; ta.style.fontSize = '10px';
    ta.value = JSON.stringify(sel.props, null, 2);
    const apply = document.createElement('button');
    apply.className = 'ecl-btn-primary text-xs';
    apply.style.justifyContent = 'center';
    apply.textContent = 'Appliquer';
    apply.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(ta.value);
        sel.props = parsed;
        if (parsed.type) sel.type = parsed.type;
        SW.markDirty(true);
        SW.refresh();
        SW.toast('Propriétés appliquées');
      } catch (e) { SW.toast('JSON invalide: ' + e.message, 'error'); }
    });
    body.appendChild(ta); body.appendChild(apply);
    head.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : '';
      head.classList.toggle('open', !isOpen);
    });
    wrap.appendChild(head); wrap.appendChild(body);
    return wrap;
  }

})(window.SW);
