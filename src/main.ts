// ==========================================================
// main.ts — Entry point: imports all modules to register on window.SW
// ==========================================================

// Ensure SW namespace exists before any module runs
window.SW = window.SW || ({} as import('./types.ts').SW);

// Import order matters: utils first, then modules that depend on it
import './utils.ts';
import './renderer.ts';
import './inspector.ts';
import './picker.ts';
import './codeview.ts';
import './templates.ts';
import './contextmenu.ts';
import './tree.ts';
import './animations.ts';
import './import.ts';
import './app.ts';  // must be last — boots the app
