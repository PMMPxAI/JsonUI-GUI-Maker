// ==========================================================
// import.ts — import .json / .mcpack / .zip files; library list
// ==========================================================
import type { IndexEntry } from './types.ts';

declare const JSZip: {
  loadAsync(data: ArrayBuffer): Promise<{
    forEach(fn: (path: string, entry: { dir: boolean; async(type: string): Promise<string> }) => void): void;
  }>;
};

const SW = window.SW;

SW.openImportModal = function (): void {
  SW.openModal('modal-library');
  setupDropzone();
  renderLibraryList();
};

function setupDropzone(): void {
  const dz = document.getElementById('dropzone') as HTMLElement | null;
  const input = document.getElementById('file-input') as HTMLInputElement | null;
  if (!dz || !input || dz.dataset.bound === '1') return;
  dz.dataset.bound = '1';
  dz.addEventListener('click', () => input.click());
  dz.addEventListener('dragover', (e: DragEvent) => { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
  dz.addEventListener('drop', async (e: DragEvent) => {
    e.preventDefault(); dz.classList.remove('drag');
    const files = e.dataTransfer?.files;
    if (files && files[0]) await handleFile(files[0]);
  });
  input.addEventListener('change', async () => {
    if (input.files && input.files[0]) await handleFile(input.files[0]);
  });
}

interface ZipItem {
  path: string;
  entry: { async(type: string): Promise<string> };
}

async function handleFile(file: File): Promise<void> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.json')) {
    const text = await file.text();
    tryLoadJson(text, file.name);
  } else if (name.endsWith('.zip') || name.endsWith('.mcpack')) {
    try {
      const buf = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      const jsonFiles: ZipItem[] = [];
      zip.forEach((path: string, entry: { dir: boolean; async(type: string): Promise<string> }) => {
        if (!entry.dir && /\.json$/i.test(path) && /(^|\/)(ui\/|.*ui\/)/i.test(path)) {
          jsonFiles.push({ path, entry });
        }
      });
      if (!jsonFiles.length) {
        zip.forEach((path: string, entry: { dir: boolean; async(type: string): Promise<string> }) => {
          if (!entry.dir && /\.json$/i.test(path)) jsonFiles.push({ path, entry });
        });
      }
      renderZipPicker(file.name, jsonFiles);
    } catch (e) {
      SW.toast('Lecture impossible: ' + (e as Error).message, 'error');
    }
  } else {
    SW.toast('Type non supporté: ' + name, 'error');
  }
}

function renderZipPicker(zipName: string, items: ZipItem[]): void {
  const list = document.getElementById('lib-list')!;
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = `<div class="text-sm text-slate-400 p-4">Aucun JSON trouvé dans ${zipName}</div>`;
    return;
  }
  const head = document.createElement('div');
  head.className = 'text-xs uppercase tracking-widest text-slate-400 mb-2 px-1';
  head.textContent = `${zipName} — ${items.length} JSON`;
  list.appendChild(head);
  items.sort((a, b) => a.path.localeCompare(b.path));
  for (const it of items) {
    const card = document.createElement('div');
    card.className = 'lib-item';
    card.innerHTML = `<div>
      <div class="lib-name">${it.path.split('/').pop()}</div>
      <div class="lib-meta">${it.path}</div>
    </div>`;
    const action = document.createElement('button');
    action.className = 'lib-action';
    action.textContent = 'Charger';
    action.addEventListener('click', async () => {
      try {
        const text = await it.entry.async('string');
        tryLoadJson(text, it.path);
      } catch (e) {
        SW.toast('Erreur: ' + (e as Error).message, 'error');
      }
    });
    card.appendChild(action);
    list.appendChild(card);
  }
}

function tryLoadJson(text: string, source: string): void {
  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(text); }
  catch (e) { SW.toast('JSON invalide: ' + (e as Error).message, 'error'); return; }
  if (!parsed || typeof parsed !== 'object') {
    SW.toast('JSON inattendu', 'error'); return;
  }
  SW.loadFromBedrock(parsed, source);
  SW.closeModal('modal-library');
  SW.toast('Chargé: ' + (source || 'JSON'));
}

let _libIndex: IndexEntry[] | null = null;

async function loadLibraryIndex(): Promise<IndexEntry[]> {
  if (_libIndex) return _libIndex;
  try {
    const r = await fetch('samples/index.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    _libIndex = await r.json();
  } catch (_e) {
    _libIndex = [];
  }
  return _libIndex!;
}

async function renderLibraryList(): Promise<void> {
  const list = document.getElementById('lib-list');
  if (!list) return;
  const idx = await loadLibraryIndex();
  if (!idx.length) {
    list.innerHTML = `<div class="text-sm text-slate-400 p-4 text-center">Aucun sample local disponible. Glissez/déposez un .mcpack ou .json pour explorer.</div>`;
    return;
  }
  const byPack: Record<string, IndexEntry[]> = {};
  for (const it of idx) (byPack[it.pack] = byPack[it.pack] || []).push(it);
  const packs = Object.keys(byPack).sort();
  list.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'flex items-center gap-3 mb-3 px-1';
  head.innerHTML = `
    <div class="text-xs uppercase tracking-widest text-slate-400">Bibliothèque locale</div>
    <span class="text-xs text-slate-500">${idx.length} JSON · ${packs.length} packs</span>
    <input id="lib-search" placeholder="Rechercher..." class="ml-auto bg-ink-800 border border-white/10 rounded-md px-3 py-1 text-xs w-44" />
  `;
  list.appendChild(head);
  const container = document.createElement('div');
  container.className = 'space-y-3';
  list.appendChild(container);

  function renderFiltered(): void {
    const q = ((document.getElementById('lib-search') as HTMLInputElement).value || '').toLowerCase();
    container.innerHTML = '';
    for (const pack of packs) {
      const items = byPack[pack].filter(it => !q || it.name.toLowerCase().includes(q) || pack.toLowerCase().includes(q) || (it.namespace || '').toLowerCase().includes(q));
      if (!items.length) continue;
      const sec = document.createElement('div');
      sec.innerHTML = `<div class="text-[11px] uppercase tracking-[0.18em] text-neon-cyan mb-1.5 px-1">${pack}</div>`;
      const grid = document.createElement('div');
      grid.className = 'space-y-1.5';
      for (const it of items) {
        const row = document.createElement('div');
        row.className = 'lib-item';
        row.innerHTML = `
          <div class="min-w-0 flex-1">
            <div class="lib-name truncate">${it.name}</div>
            <div class="lib-meta truncate">${it.path} · <span style="color:#a855f7">${it.namespace}</span> · ${it.controls} ctrl · ${(it.size/1024).toFixed(1)} KB</div>
          </div>
        `;
        const action = document.createElement('button');
        action.className = 'lib-action';
        action.textContent = 'Charger';
        action.addEventListener('click', async (e: MouseEvent) => {
          e.stopPropagation();
          try {
            const r = await fetch('samples/' + it.path);
            const text = await r.text();
            tryLoadJson(text, it.name);
          } catch (err) { SW.toast('Erreur: ' + (err as Error).message, 'error'); }
        });
        row.appendChild(action);
        row.addEventListener('click', () => action.click());
        grid.appendChild(row);
      }
      sec.appendChild(grid);
      container.appendChild(sec);
    }
  }
  renderFiltered();
  document.getElementById('lib-search')!.addEventListener('input', renderFiltered);
}
