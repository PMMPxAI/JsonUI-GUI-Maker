// ==========================================================
// codeview.js — bottom JSON code panel with syntax highlighting
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  let highlightEl = null;

  function ensureHighlight() {
    if (highlightEl) return;
    const ta = document.getElementById('code-area');
    if (!ta) return;
    const wrap = ta.parentElement;
    if (!wrap) return;
    // Create a highlight overlay behind the textarea
    highlightEl = document.createElement('pre');
    highlightEl.className = 'ecl-code-highlight';
    highlightEl.setAttribute('aria-hidden', 'true');
    wrap.style.position = 'relative';
    wrap.insertBefore(highlightEl, ta);
    ta.classList.add('ecl-code-area-transparent');

    // Sync scroll
    ta.addEventListener('scroll', () => {
      highlightEl.scrollTop = ta.scrollTop;
      highlightEl.scrollLeft = ta.scrollLeft;
    });
  }

  function highlightJSON(text) {
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

  function updateHighlight(text) {
    ensureHighlight();
    if (!highlightEl) return;
    highlightEl.innerHTML = highlightJSON(text) + '\n';
  }

  SW.refreshCode = function (state) {
    const ta = document.getElementById('code-area');
    if (!ta) return;
    if (document.activeElement === ta) return;
    const json = SW.toBedrock(state.tree, { namespace: state.namespace || 'custom_ui' });
    let text;
    if (state.unicode) {
      text = SW.stringifyUnicode(json, 4);
    } else {
      text = SW.prettify(json);
    }
    ta.value = text;
    updateHighlight(text);
  };

  // Listen for user edits to update highlighting
  document.addEventListener('DOMContentLoaded', () => {
    const ta = document.getElementById('code-area');
    if (ta) {
      ta.addEventListener('input', () => updateHighlight(ta.value));
    }
  });

  SW.applyCode = function (state) {
    const ta = document.getElementById('code-area');
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
      SW.toast('JSON invalide: ' + e.message, 'error');
      return false;
    }
  };

})(window.SW);
