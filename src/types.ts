// ==========================================================
// types.ts — Shared type definitions for Eclipse UI Forge
// ==========================================================

export type ComponentType =
  | 'panel'
  | 'stack_panel'
  | 'image'
  | 'label'
  | 'button'
  | 'input_panel'
  | 'scrolling_panel'
  | 'grid'
  | 'toggle'
  | 'dropdown'
  | 'slider'
  | 'fill'
  | 'custom';

export type AnchorPosition =
  | 'top_left'
  | 'top_middle'
  | 'top_right'
  | 'left_middle'
  | 'center'
  | 'right_middle'
  | 'bottom_left'
  | 'bottom_middle'
  | 'bottom_right'
  | 'center_middle';

export type FontSize = 'small' | 'normal' | 'medium' | 'large' | 'extra_large';
export type TextAlignment = 'left' | 'center' | 'right';
export type Orientation = 'vertical' | 'horizontal';
export type ClipDirection = 'left' | 'right' | 'up' | 'down';
export type ScreenSize = 'phone' | 'tablet' | 'pc';
export type Background = 'mc' | 'dark' | 'grid';

export type SizeValue = number | string;
export type ColorRGBA = [number, number, number, number];

export interface UIProps {
  type: ComponentType;
  size?: [SizeValue, SizeValue];
  offset?: [number, number];
  anchor_from?: AnchorPosition;
  anchor_to?: AnchorPosition;
  alpha?: number;
  layer?: number;
  color?: ColorRGBA;
  visible?: boolean;
  enabled?: boolean;
  clips_children?: boolean;

  // Image
  texture?: string;
  uv?: [number, number];
  uv_size?: [number, number];
  nine_slice_buttoned?: [number, number, number, number];
  tiled?: boolean;

  // Label
  text?: string;
  font_size?: FontSize | number | string;
  font_type?: string;
  text_alignment?: TextAlignment;
  shadow?: boolean;
  localize?: boolean;

  // Stack panel
  orientation?: Orientation;

  // Button
  $pressed_button_name?: string;
  default_control?: string;
  hover_control?: string;
  pressed_control?: string;
  controls?: unknown[];

  // Grid
  grid_dimensions?: [number, number];
  grid_item_template?: string;
  collection_name?: string;

  // Toggle
  toggle_name?: string;
  toggle_default_state?: boolean;
  toggle_group_forced_index?: number;

  // Dropdown
  dropdown_name?: string;
  dropdown_content_control?: string;
  dropdown_area?: string;

  // Slider
  slider_track_button?: string;
  slider_small_decrease_button?: string;
  slider_small_increase_button?: string;
  slider_steps?: number;
  slider_direction?: string;
  default_value?: number;

  // Fill
  clip_direction?: ClipDirection;
  clip_ratio?: number;
  clip_pixelperfect?: boolean;

  // Custom
  renderer?: string;
  property_bag?: Record<string, unknown>;

  // Input panel
  placeholder_text?: string;

  // Animation refs
  anim_type?: string;

  // Catch-all for unknown Bedrock props
  [key: string]: unknown;
}

export interface UINode {
  id: string;
  name: string;
  type: string;
  props: UIProps;
  children: UINode[];
  namespace?: string;
}

export interface AppState {
  tree: UINode;
  selectedId: string | null;
  expanded: Record<string, boolean>;
  namespace: string;
  screen: ScreenSize;
  zoom: number;
  bg: Background;
  rulers: boolean;
  snap: boolean;
  unicode: boolean;
  dirty: boolean;
  filename: string;
  history: string[];
  historyIdx: number;
}

export interface ScreenDimensions {
  w: number;
  h: number;
}

export interface AnchorPoint {
  x: number;
  y: number;
}

export interface Template {
  id: string;
  name: string;
  tag: string;
  desc: string;
  thumb: (() => string) | null;
  build: () => UINode;
}

export interface LibraryItem {
  name: string;
  type: ComponentType;
  data: Record<string, unknown>;
  pack?: string;
  controls?: number;
  depth?: number;
}

export interface ScreenEntry {
  pack: string;
  name: string;
  file: string;
  namespace: string;
  controls: number;
  size: number;
  data: Record<string, unknown>;
}

export interface IndexEntry {
  pack: string;
  name: string;
  path: string;
  namespace: string;
  controls: number;
  size: number;
}

export interface ContextMenuItem {
  label?: string;
  icon?: string;
  shortcut?: string;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
}

export interface PickedComponent {
  isDefault?: boolean;
  type: ComponentType;
  name?: string;
  data?: Record<string, unknown>;
}

export interface AnimState {
  isPlaying: boolean;
  speed: number;
  loop: boolean;
  autoAppear: boolean;
  runners: ReturnType<typeof setTimeout>[];
  snapshot: unknown;
  buttonHandlers: Array<{ el: HTMLElement; handler: EventListener }>;
  play: () => void;
  pause: () => void;
  reset: () => void;
  toggle: () => void;
}

/**
 * The global SW namespace — all modules attach their exports here.
 */
export interface SW {
  state: AppState;
  anim: AnimState;

  // utils.ts
  uid: (prefix?: string) => string;
  clone: <T>(obj: T) => T;
  toast: (msg: string, kind?: string) => void;
  setStatus: (msg: string) => void;
  hexToRgba: (hex: string, a?: number) => ColorRGBA;
  rgbaToHex: (rgba: ColorRGBA | unknown[]) => string;
  rgbaToCss: (rgba: ColorRGBA | unknown[]) => string;
  parseSize: (val: unknown, fallback?: string) => string;
  anchorMap: Record<string, AnchorPoint>;
  stringifyUnicode: (obj: unknown, indent?: number) => string;
  prettify: (obj: unknown) => string;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  download: (filename: string, content: string | Blob, mime?: string) => void;
  findById: (root: UINode, id: string) => UINode | null;
  findParent: (root: UINode, id: string, parent?: UINode | null) => UINode | null;
  walk: (root: UINode, fn: (el: UINode) => void) => void;
  defaultProps: (type: ComponentType) => UIProps;
  toBedrock: (root: UINode, options?: { namespace?: string }) => Record<string, unknown>;
  fromBedrock: (json: Record<string, unknown>) => UINode;

  // renderer.ts
  SCREEN_SIZES: Record<ScreenSize, ScreenDimensions>;
  render: (state: AppState) => void;

  // inspector.ts
  renderInspector: (state: AppState) => void;
  renderInspectorLight: () => void;

  // picker.ts
  openPicker: (typeFilter: ComponentType | null, onPick: (picked: PickedComponent | null) => void, options?: Record<string, unknown>) => void;
  _miniBuildNode: ((raw: Record<string, unknown>, stackLayout: boolean) => HTMLElement) | null;

  // templates.ts
  TEMPLATES: Template[];

  // import.ts
  openImportModal: () => void;

  // app.ts
  refresh: () => void;
  markDirty: (b: boolean) => void;
  selectElement: (id: string | null) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (dragId: string, overId: string) => void;
  addRootElement: (type: ComponentType | null) => void;
  pickAndAddChild: (parentId: string) => void;
  loadFromBedrock: (json: Record<string, unknown>, source?: string) => void;
  loadTemplate: (id: string) => void;
  updateSelInfo: (el?: UINode) => void;
  openTemplatesModal: () => Promise<void>;
  openShortcutsModal: () => void;
  undo: () => void;
  redo: () => void;

  // tree.ts
  renderTree: (state: AppState) => void;

  // contextmenu.ts
  openContextMenu: (e: MouseEvent, items: ContextMenuItem[]) => void;
  stageContextMenu: (e: MouseEvent) => void;
  elementContextMenu: (e: MouseEvent, id: string) => void;
  addRootFromLibrary: (picked: PickedComponent) => void;
  clipboardEl: UINode | null;

  // codeview.ts
  applyCode: (state: AppState) => boolean;
  refreshCode: (state: AppState) => void;

  // animations.ts
  createAnimationOn: (elementId: string, prop: string, presetName: string) => void;
}

declare global {
  interface Window {
    SW: SW;
    JSZip: { new(): { file(path: string, data: string | ArrayBuffer): void; generateAsync(opts: { type: string }): Promise<Blob> } };
  }
}
