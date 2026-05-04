// ==========================================================
// codeview.ts — bottom JSON code panel with syntax highlighting
// ==========================================================
import type { AppState } from './types.ts';

const SW = window.SW;

let highlightEl: HTMLPreElement | null = null;

function ensureHighlight(): void {
  if (highlightEl) return;
  const ta = document.getElementById('code-area') as HTMLTextAreaElement | null;
  if (!ta) return;
  const wrap = ta.parentElement;
  if (!wrap) return;
  highlightEl = document.createElement('pre');
  highlightEl.className = 'ecl-code-highlight';
  highlightEl.setAttribute('aria-hidden', 'true');
  wrap.style.position = 'relative';
  wrap.insertBefore(highlightEl, ta);
  ta.classList.add('ecl-code-area-transparent');

  ta.addEventListener('scroll', () => {
    if (highlightEl) {
      highlightEl.scrollTop = ta.scrollTop;
      highlightEl.scrollLeft = ta.scrollLeft;
    }
  });
}

function highlightJSON(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?/g, function (match) {
      let cls = 'jv-string';
      if (/:$/.test(match)) {
        cls = 'jv-key';
      } else if (/^"/.test(match)) {
        cls = 'jv-string';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    })
    .replace(/\b(true|false)\b/g, '<span class="jv-bool">$1</span>')
    .replace(/\b(null)\b/g, '<span class="jv-null">$1</span>')
    .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="jv-num">$1</span>');
}

function updateHighlight(text: string): void {
  ensureHighlight();
  if (!highlightEl) return;
  highlightEl.innerHTML = highlightJSON(text) + '\n';
}

SW.refreshCode = function (state: AppState): void {
  const ta = document.getElementById('code-area') as HTMLTextAreaElement | null;
  if (!ta) return;
  if (document.activeElement === ta) return;
  const json = SW.toBedrock(state.tree, { namespace: state.namespace || 'custom_ui' });
  let text: string;
  if (state.unicode) {
    text = SW.stringifyUnicode(json, 4);
  } else {
    text = SW.prettify(json);
  }
  ta.value = text;
  updateHighlight(text);
};

document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('code-area') as HTMLTextAreaElement | null;
  if (ta) {
    ta.addEventListener('input', () => updateHighlight(ta.value));
  }
});

SW.applyCode = function (state: AppState): boolean {
  const ta = document.getElementById('code-area') as HTMLTextAreaElement | null;
  if (!ta) return false;
  try {
    const parsed = JSON.parse(ta.value);
    const tree = SW.fromBedrock(parsed);
    state.tree = tree;
    state.namespace = parsed.namespace || state.namespace;
    state.selectedId = null;
    SW.markDirty(true);
    SW.refresh();
    SW.toast('JSON appliqué');
    return true;
  } catch (e) {
    SW.toast('JSON invalide: ' + (e as Error).message, 'error');
    return false;
  }
};
