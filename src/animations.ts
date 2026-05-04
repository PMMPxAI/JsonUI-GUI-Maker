// ==========================================================
// animations.ts — Bedrock UI animation engine + button simulation
// ==========================================================
import type { AppState, UINode, UIProps, AnimState } from './types.ts';

const SW = window.SW;

interface ButtonBinding {
  btn: HTMLElement;
  onEnter: () => void;
  onLeave: () => void;
  onDown: () => void;
  onUp: () => void;
}

interface StyleSnapshot {
  opacity: string;
  transform: string;
  transition: string;
  background: string;
  width: string;
  height: string;
  display: string;
}

const Anim: AnimState = {
  isPlaying: false,
  speed: 1,
  loop: true,
  autoAppear: true,
  runners: [],
  snapshot: null,
  buttonHandlers: [],
  play: () => {},
  pause: () => {},
  reset: () => {},
  toggle: () => {}
};
SW.anim = Anim;

const EASINGS: Record<string, string> = {
  linear: 'linear',
  in_quad: 'cubic-bezier(0.55,0.085,0.68,0.53)',
  out_quad: 'cubic-bezier(0.25,0.46,0.45,0.94)',
  in_out_quad: 'cubic-bezier(0.455,0.03,0.515,0.955)',
  in_cubic: 'cubic-bezier(0.55,0.055,0.675,0.19)',
  out_cubic: 'cubic-bezier(0.215,0.61,0.355,1)',
  in_out_cubic: 'cubic-bezier(0.645,0.045,0.355,1)',
  in_sine: 'cubic-bezier(0.47,0,0.745,0.715)',
  out_sine: 'cubic-bezier(0.39,0.575,0.565,1)',
  in_out_sine: 'cubic-bezier(0.445,0.05,0.55,0.95)',
  in_expo: 'cubic-bezier(0.95,0.05,0.795,0.035)',
  out_expo: 'cubic-bezier(0.19,1,0.22,1)',
  in_out_expo: 'cubic-bezier(1,0,0,1)',
  in_bounce: 'cubic-bezier(0.68,-0.55,0.265,1.55)',
  out_bounce: 'cubic-bezier(0.68,-0.55,0.265,1.55)',
  spring: 'cubic-bezier(0.68,-0.55,0.265,1.55)'
};

function toEasing(e: string | undefined): string {
  if (!e) return 'ease';
  return EASINGS[e] || 'ease';
}

function resolveAnimRef(ref: unknown, defs: Record<string, UINode>): UINode | null {
  if (typeof ref !== 'string' || !ref.startsWith('@')) return null;
  let name = ref.substring(1);
  if (name.includes('.')) name = name.split('.').slice(1).join('.');
  return defs[name] || null;
}

function collectAnimDefs(tree: UINode): Record<string, UINode> {
  const defs: Record<string, UINode> = {};
  SW.walk(tree, (el: UINode) => {
    if (el.props && el.props.anim_type) {
      defs[el.name] = el;
    }
  });
  return defs;
}

Anim.play = function (): void {
  if (Anim.isPlaying) return;
  Anim.isPlaying = true;
  document.getElementById('preview')!.classList.add('play-mode');
  document.body.classList.add('is-playing');
  setPlayUI(true);

  Anim.snapshot = captureSnapshot();

  const state = SW.state;
  const defs = collectAnimDefs(state.tree);

  const animated = new Set<string>();
  SW.walk(state.tree, (el: UINode) => {
    if (!el.props) return;
    for (const k of ['alpha','offset','size','color']) {
      const v = (el.props as Record<string, unknown>)[k];
      if (typeof v === 'string' && v.startsWith('@')) animated.add(el.id);
    }
  });

  document.querySelectorAll<HTMLElement>('#preview .b-el').forEach(dom => {
    dom.style.transition = 'none';
  });
  void document.getElementById('preview')!.offsetWidth;

  if (Anim.autoAppear) {
    const allDoms = [...document.querySelectorAll<HTMLElement>('#preview .b-el')];
    allDoms.forEach((dom, i) => {
      if (animated.has(dom.dataset.id!)) return;
      const origOp = dom.style.opacity;
      dom.style.opacity = '0';
      const delay = Math.min(600, i * 25) / Anim.speed;
      const runner = setTimeout(() => {
        if (!Anim.isPlaying) return;
        dom.style.transition = `opacity 300ms ease`;
        dom.style.opacity = origOp || '1';
      }, delay);
      Anim.runners.push(runner);
    });
  }

  SW.walk(state.tree, (el: UINode) => {
    ['alpha', 'offset', 'size', 'color'].forEach(prop => {
      const v = (el.props as Record<string, unknown>)[prop];
      if (typeof v === 'string' && v.startsWith('@')) {
        const def = resolveAnimRef(v, defs);
        if (def) runAnim(el, prop, def, defs, 0);
      }
    });
  });

  bindButtons(state);
  SW.toast('Lecture');
};

Anim.pause = function (): void {
  if (!Anim.isPlaying) return;
  Anim.isPlaying = false;
  document.getElementById('preview')!.classList.remove('play-mode');
  document.body.classList.remove('is-playing');
  setPlayUI(false);
  Anim.runners.forEach(t => clearTimeout(t));
  Anim.runners = [];
  unbindButtons();
  SW.toast('Pause');
};

Anim.reset = function (): void {
  Anim.pause();
  if (Anim.snapshot) {
    restoreSnapshot(Anim.snapshot as Record<string, StyleSnapshot>);
    Anim.snapshot = null;
  }
  SW.render(SW.state);
  SW.toast('Réinitialisé');
};

Anim.toggle = function (): void {
  if (Anim.isPlaying) Anim.pause();
  else Anim.play();
};

function setPlayUI(playing: boolean): void {
  const btn = document.getElementById('play-btn');
  if (!btn) return;
  btn.innerHTML = playing
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>`;
  btn.classList.toggle('active', playing);
  btn.dataset.tip = playing ? 'Pause (Espace)' : 'Lecture (Espace)';
}

function captureSnapshot(): Record<string, StyleSnapshot> {
  const snap: Record<string, StyleSnapshot> = {};
  document.querySelectorAll<HTMLElement>('#preview .b-el').forEach(dom => {
    snap[dom.dataset.id!] = {
      opacity: dom.style.opacity, transform: dom.style.transform,
      transition: dom.style.transition, background: dom.style.background,
      width: dom.style.width, height: dom.style.height,
      display: dom.style.display
    };
  });
  return snap;
}

function restoreSnapshot(snap: Record<string, StyleSnapshot>): void {
  document.querySelectorAll<HTMLElement>('#preview .b-el').forEach(dom => {
    const s = snap[dom.dataset.id!];
    if (!s) return;
    dom.style.transition = 'none';
    Object.assign(dom.style, s);
  });
}

function runAnim(el: UINode, prop: string, def: UINode, allDefs: Record<string, UINode>, chainDepth: number): void {
  if (chainDepth > 20) return;
  const dom = document.querySelector<HTMLElement>(`#preview .b-el[data-id="${el.id}"]`);
  if (!dom) return;
  const props = (def.props || {}) as Record<string, unknown>;
  const type = (props.anim_type as string) || 'wait';
  const duration = ((props.duration != null ? +(props.duration as number) : 0.5) * 1000) / Anim.speed;
  const from = props.from;
  const to = props.to;
  const easing = toEasing(props.easing as string | undefined);

  dom.style.transition = '';

  const transitionProps: string[] = [];

  switch (type) {
    case 'wait':
      break;
    case 'alpha': {
      const fromV = from != null ? String(+from) : '0';
      const toV = to != null ? String(+to) : '1';
      dom.style.opacity = fromV;
      transitionProps.push(`opacity ${duration}ms ${easing}`);
      requestAnimationFrame(() => requestAnimationFrame(() => { dom.style.opacity = toV; }));
      break;
    }
    case 'offset': {
      const fromArr = Array.isArray(from) ? from : [0, 0];
      const toArr = Array.isArray(to) ? to : [0, 0];
      const base = parseCurrentTransform(dom);
      applyOffset(dom, base, fromArr as [number, number]);
      transitionProps.push(`transform ${duration}ms ${easing}`);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        applyOffset(dom, base, toArr as [number, number]);
      }));
      break;
    }
    case 'size': {
      const fromArr = Array.isArray(from) ? from : null;
      const toArr = Array.isArray(to) ? to : null;
      if (fromArr) {
        if (typeof fromArr[0] === 'number') dom.style.width = fromArr[0] + 'px';
        if (typeof fromArr[1] === 'number') dom.style.height = fromArr[1] + 'px';
      }
      transitionProps.push(`width ${duration}ms ${easing}`, `height ${duration}ms ${easing}`);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (toArr) {
          if (typeof toArr[0] === 'number') dom.style.width = toArr[0] + 'px';
          if (typeof toArr[1] === 'number') dom.style.height = toArr[1] + 'px';
        }
      }));
      break;
    }
    case 'color': {
      const fromV = Array.isArray(from) ? from : [1, 1, 1, 1];
      const toV = Array.isArray(to) ? to : [1, 1, 1, 1];
      dom.style.background = SW.rgbaToCss(fromV as unknown[]);
      transitionProps.push(`background ${duration}ms ${easing}`);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        dom.style.background = SW.rgbaToCss(toV as unknown[]);
      }));
      break;
    }
    case 'flip_book': {
      dom.style.animation = `flipBlink ${duration}ms steps(2, end) infinite`;
      break;
    }
    case 'clip': {
      const clipDir = (props.clip_direction as string) || 'left';
      const fromRatio = +(from as number) || 0;
      const toRatio = +(to as number) || 1;
      const clipFrom = clipPathFor(clipDir, fromRatio);
      const clipTo = clipPathFor(clipDir, toRatio);
      dom.style.clipPath = clipFrom;
      transitionProps.push(`clip-path ${duration}ms ${easing}`);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        dom.style.clipPath = clipTo;
      }));
      break;
    }
    default:
      break;
  }

  if (transitionProps.length) {
    dom.style.transition = transitionProps.join(', ');
  }

  const timer = setTimeout(() => {
    if (!Anim.isPlaying) return;
    if (props.next) {
      const nextDef = resolveAnimRef(props.next, allDefs);
      if (nextDef) runAnim(el, prop, nextDef, allDefs, chainDepth + 1);
      else if (Anim.loop) runAnim(el, prop, def, allDefs, 0);
    } else if (Anim.loop && type !== 'wait') {
      runAnim(el, prop, def, allDefs, 0);
    }
  }, duration + 20);
  Anim.runners.push(timer);
}

function parseCurrentTransform(dom: HTMLElement): string {
  return dom.style.transform || '';
}

function applyOffset(dom: HTMLElement, baseTransform: string, off: [number, number]): void {
  dom.style.transform = `${baseTransform} translate(${+off[0] || 0}px, ${+off[1] || 0}px)`;
}

function clipPathFor(dir: string, ratio: number): string {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  const inv = 100 - pct;
  if (dir === 'left')   return `inset(0 ${inv}% 0 0)`;
  if (dir === 'right')  return `inset(0 0 0 ${inv}%)`;
  if (dir === 'up')     return `inset(0 0 ${inv}% 0)`;
  if (dir === 'down')   return `inset(${inv}% 0 0 0)`;
  if (dir === 'center') return `inset(${inv/2}% ${inv/2}% ${inv/2}% ${inv/2}%)`;
  return 'none';
}

function bindButtons(state: AppState): void {
  unbindButtons();
  const buttons = document.querySelectorAll<HTMLElement>('#preview .b-el[data-type="button"]');
  buttons.forEach(btn => {
    const id = btn.dataset.id!;
    const el = SW.findById(state.tree, id);
    if (!el || !el.children || !el.children.length) return;
    const defName = el.props.default_control || 'default';
    const hovName = el.props.hover_control   || 'hover';
    const preName = el.props.pressed_control || 'pressed';
    const defEl = el.children.find(c => c.name === defName);
    const hovEl = el.children.find(c => c.name === hovName);
    const preEl = el.children.find(c => c.name === preName);
    if (!defEl && !hovEl && !preEl) return;

    function domOf(e: UINode | undefined): HTMLElement | null { return e ? btn.querySelector<HTMLElement>(`.b-el[data-id="${e.id}"]`) : null; }
    const dDef = domOf(defEl), dHov = domOf(hovEl), dPre = domOf(preEl);

    function showOnly(which: string): void {
      if (dDef) dDef.style.display = (which === 'default') ? '' : 'none';
      if (dHov) dHov.style.display = (which === 'hover')   ? '' : 'none';
      if (dPre) dPre.style.display = (which === 'pressed') ? '' : 'none';
    }
    showOnly('default');

    const onEnter = () => showOnly(dHov ? 'hover' : 'default');
    const onLeave = () => showOnly('default');
    const onDown  = () => { showOnly(dPre ? 'pressed' : (dHov ? 'hover' : 'default')); btn.style.transform = (btn.style.transform || '') + ' scale(0.98)'; };
    const onUp    = () => { showOnly(dHov ? 'hover' : 'default'); btn.style.transform = btn.style.transform.replace(/ scale\(0\.98\)/g, ''); };

    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('mouseup', onUp);
    btn.style.cursor = 'pointer';
    Anim.buttonHandlers.push({ el: btn as HTMLElement, handler: onEnter as EventListener });
  });

  document.querySelectorAll<HTMLElement>('#preview .b-el[data-type="button"]').forEach(b => {
    b.classList.add('play-btn');
  });
}

function unbindButtons(): void {
  Anim.buttonHandlers = [];
  document.querySelectorAll<HTMLElement>('#preview .b-el.play-btn').forEach(b => b.classList.remove('play-btn'));
}

(SW as unknown as Record<string, Function>).createAnimationOn = function (elementId: string, prop: string, presetName: string): void {
  const el = SW.findById(SW.state.tree, elementId);
  if (!el) return;
  const presets: Record<string, Record<string, unknown>> = {
    fade_in:     { anim_type: 'alpha', duration: 0.4, from: 0, to: 1, easing: 'out_cubic' },
    fade_out:    { anim_type: 'alpha', duration: 0.4, from: 1, to: 0, easing: 'in_cubic' },
    slide_in_left:  { anim_type: 'offset', duration: 0.4, from: [-100, 0], to: [0, 0], easing: 'out_cubic' },
    slide_in_right: { anim_type: 'offset', duration: 0.4, from: [100, 0], to: [0, 0], easing: 'out_cubic' },
    slide_in_top:   { anim_type: 'offset', duration: 0.4, from: [0, -50], to: [0, 0], easing: 'out_cubic' },
    bounce:      { anim_type: 'offset', duration: 0.6, from: [0, -30], to: [0, 0], easing: 'out_bounce' },
    pulse_size:  { anim_type: 'size', duration: 0.8, from: [100, 20], to: [120, 24], easing: 'in_out_sine' },
    pop_in:      { anim_type: 'size', duration: 0.35, from: [0, 0], to: [el.props.size && el.props.size[0] || 120, el.props.size && el.props.size[1] || 40], easing: 'out_bounce' }
  };
  const preset = presets[presetName] || presets.fade_in;
  const animName = `anim_${prop}_${Date.now().toString(36).slice(-5)}`;
  const animEl: UINode = {
    id: SW.uid('anim'),
    name: animName,
    type: 'animation',
    props: { ...preset } as UIProps,
    children: []
  };
  SW.state.tree.children.push(animEl);
  (el.props as Record<string, unknown>)[prop] = '@' + (SW.state.namespace || 'custom_ui') + '.' + animName;
  SW.markDirty(true);
  SW.refresh();
  SW.toast(`Animation ${presetName} ajoutée sur ${prop}`);
};
