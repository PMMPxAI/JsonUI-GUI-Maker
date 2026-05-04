// ==========================================================
// codeview.js — bottom JSON code panel sync
// ==========================================================
window.SW = window.SW || {};

(function (SW) {
  'use strict';

  SW.refreshCode = function (state) {
    const ta = document.getElementById('code-area');
    if (!ta) return;
    if (document.activeElement === ta) return; // don't overwrite while user is editing
    const json = SW.toBedrock(state.tree, { namespace: state.namespace || 'custom_ui' });
    if (state.unicode) {
      ta.value = SW.stringifyUnicode(json, 4);
    } else {
      ta.value = SW.prettify(json);
    }
  };

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
