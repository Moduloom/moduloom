/**
 * Loom Icons · Essential 集合的手工画层映射（animated 模式分层上色）。
 *
 * 与 artwork.ts 的自动抽取互补：本文件逐枚手写 ArtLayer[]，几何与
 * collections/essential.ts 的当前线稿严格重合，层置于原墨线之下。
 * - 闭合主体：paper 精确铺底 → color 主体色面 → detail 独立局部（笔帽、
 *   桶盖横带、文件角、山影、门洞、耳罩、符头等，最多 3 色）；
 * - 开放笔画（箭头、加减、折角、叉、托盘等）：paper 3.8 宽笔迹铺底，
 *   2.6 柔和彩色笔迹沿中轴按笔顺复描，开路径一律 fill:none；
 * - 颜色统一走 --li-art-*（纸 #f7f5ee / 墨 #45464a / 暖黄 --li-art-warm /
 *   青绿 --li-art-cool / 深绿 --li-art-leaf / 奶黄 --li-art-sun / 珊瑚 --li-art-rose）。
 * smile / image / image-upload 由 artwork.ts 的 SPECIAL_LAYERS 保留，此处不重复。
 */
import type { ArtLayer } from './artwork.js';

/** 开放笔迹的铺底参数：宽 3.8 纸描边，避免 6px 白晕。 */
const PAPER_STROKE = 'fill:none;stroke:var(--li-art-paper);stroke-width:3.8;stroke-linecap:round;stroke-linejoin:round';
/** 开放笔迹的彩色中轴复描参数。 */
function toneStroke(tone: string): string {
  return `fill:none;stroke:var(--li-art-${tone});stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round`;
}

export const essentialArt: Record<string, ArtLayer[]> = {
  // ── actions ──
  plus: [
    { className: 'li-art-paper', body: '<path d="M5.5 12h13"/><path d="M12 5.5v13"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M5.5 12h13"/><path d="M12 5.5v13"/>', style: toneStroke('warm') },
  ],
  minus: [
    { className: 'li-art-paper', body: '<path d="M12 12H5.5"/><path d="M12 12h6.5"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M12 12H5.5"/><path d="M12 12h6.5"/>', style: toneStroke('cool') },
  ],
  check: [
    { className: 'li-art-paper', body: '<path d="M5.6 12.6l4.1 4.3"/><path d="M9.7 16.9L18.6 7.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M5.6 12.6l4.1 4.3"/><path d="M9.7 16.9L18.6 7.4"/>', style: toneStroke('warm') },
  ],
  close: [
    { className: 'li-art-paper', body: '<path d="M6.8 6.8l10.4 10.4"/><path d="M17.2 6.8L6.8 17.2"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M6.8 6.8l10.4 10.4"/><path d="M17.2 6.8L6.8 17.2"/>', style: toneStroke('rose') },
  ],
  edit: [
    { className: 'li-art-paper', body: '<path d="M15.7 4.9l3.4 3.4L8.8 18.6l-4.6 1.2 1.2-4.6z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M15.7 4.9l3.4 3.4L8.8 18.6l-4.6 1.2 1.2-4.6z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M15.7 4.9l3.4 3.4-1.7 1.7-3.4-3.4z"/>', style: 'fill:var(--li-art-rose)' },
  ],
  trash: [
    { className: 'li-art-paper', body: '<path d="M6.4 7.2h11.2l-.9 12.2a1.6 1.6 0 0 1-1.6 1.4H8.9a1.6 1.6 0 0 1-1.6-1.4z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M6.4 7.2h11.2l-.9 12.2a1.6 1.6 0 0 1-1.6 1.4H8.9a1.6 1.6 0 0 1-1.6-1.4z"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<rect x="6.7" y="8.1" width="10.6" height="1.7" rx="0.85"/>', style: 'fill:var(--li-art-sun)' },
  ],
  copy: [
    { className: 'li-art-paper', body: '<rect x="8.8" y="8.8" width="11.2" height="11.2" rx="2.2"/><rect x="4" y="4" width="11.2" height="11.2" rx="2.2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.75" y="4.75" width="9.7" height="9.7" rx="1.45"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<rect x="9.55" y="9.55" width="9.7" height="9.7" rx="1.45"/>', style: 'fill:var(--li-art-sun)' },
  ],
  undo: [
    { className: 'li-art-paper', body: '<path d="M5 10.2h9.3a4.9 4.9 0 0 1 0 9.8h-4.1"/><path d="M8.5 6.7L5 10.2l3.5 3.5"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M5 10.2h9.3a4.9 4.9 0 0 1 0 9.8h-4.1"/><path d="M8.5 6.7L5 10.2l3.5 3.5"/>', style: toneStroke('warm') },
  ],
  redo: [
    { className: 'li-art-paper', body: '<path d="M19 10.2H9.7a4.9 4.9 0 0 0 0 9.8h4.1"/><path d="M15.5 6.7L19 10.2l-3.5 3.5"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M19 10.2H9.7a4.9 4.9 0 0 0 0 9.8h4.1"/><path d="M15.5 6.7L19 10.2l-3.5 3.5"/>', style: toneStroke('warm') },
  ],
  refresh: [
    {
      className: 'li-art-paper',
      body: '<path d="M19 7A8 8 0 1 0 20 13"/><path d="M19 3v4h-4"/>',
      style: PAPER_STROKE,
    },
    {
      className: 'li-art-color',
      body: '<path d="M19 7A8 8 0 1 0 20 13"/><path d="M19 3v4h-4"/>',
      style: toneStroke('cool'),
    },
  ],

  // ── navigation ──
  'arrow-up': [
    { className: 'li-art-paper', body: '<path d="M12 19.2V5.2"/><path d="M6.2 11.4L12 5.4l5.8 6"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M12 19.2V5.2"/><path d="M6.2 11.4L12 5.4l5.8 6"/>', style: toneStroke('cool') },
  ],
  'arrow-down': [
    { className: 'li-art-paper', body: '<path d="M12 4.8v14"/><path d="M6.2 12.6L12 18.6l5.8-6"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M12 4.8v14"/><path d="M6.2 12.6L12 18.6l5.8-6"/>', style: toneStroke('cool') },
  ],
  'arrow-left': [
    { className: 'li-art-paper', body: '<path d="M19.2 12H5.2"/><path d="M11.4 6.2L5.4 12l6 5.8"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M19.2 12H5.2"/><path d="M11.4 6.2L5.4 12l6 5.8"/>', style: toneStroke('cool') },
  ],
  'arrow-right': [
    { className: 'li-art-paper', body: '<path d="M4.8 12h14"/><path d="M12.6 6.2L18.6 12l-6 5.8"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M4.8 12h14"/><path d="M12.6 6.2L18.6 12l-6 5.8"/>', style: toneStroke('cool') },
  ],
  'chevron-up': [
    { className: 'li-art-paper', body: '<path d="M6.6 14.6L12 9.2"/><path d="M12 9.2l5.4 5.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M6.6 14.6L12 9.2"/><path d="M12 9.2l5.4 5.4"/>', style: toneStroke('cool') },
  ],
  'chevron-down': [
    { className: 'li-art-paper', body: '<path d="M6.6 9.4L12 14.8"/><path d="M12 14.8l5.4-5.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M6.6 9.4L12 14.8"/><path d="M12 14.8l5.4-5.4"/>', style: toneStroke('cool') },
  ],
  'chevron-left': [
    { className: 'li-art-paper', body: '<path d="M14.6 6.6L9.2 12"/><path d="M9.2 12l5.4 5.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M14.6 6.6L9.2 12"/><path d="M9.2 12l5.4 5.4"/>', style: toneStroke('cool') },
  ],
  'chevron-right': [
    { className: 'li-art-paper', body: '<path d="M9.4 6.6L14.8 12"/><path d="M14.8 12l-5.4 5.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M9.4 6.6L14.8 12"/><path d="M14.8 12l-5.4 5.4"/>', style: toneStroke('cool') },
  ],
  home: [
    { className: 'li-art-paper', body: '<path d="M6.2 10.2L12 5.6l5.8 4.6v8.3H6.2z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M6.2 10.2L12 5.6l5.8 4.6v8.3H6.2z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<rect x="10.1" y="13.6" width="3.8" height="4.9"/>', style: 'fill:var(--li-art-rose)' },
  ],
  'external-link': [
    { className: 'li-art-paper', body: '<path d="M13.6 5.2H7a2.2 2.2 0 0 0-2.2 2.2v9.4A2.2 2.2 0 0 0 7 19h9.4a2.2 2.2 0 0 0 2.2-2.2v-6.6"/><path d="M13.8 4.8h5.6v5.6M19.4 4.8l-6.6 6.6"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M13.6 5.2H7a2.2 2.2 0 0 0-2.2 2.2v9.4A2.2 2.2 0 0 0 7 19h9.4a2.2 2.2 0 0 0 2.2-2.2v-6.6"/><path d="M13.8 4.8h5.6v5.6M19.4 4.8l-6.6 6.6"/>', style: toneStroke('cool') },
  ],

  // ── files ──
  folder: [
    { className: 'li-art-paper', body: '<path d="M4.5 18.6V7a1.9 1.9 0 0 1 1.9-1.9h3.8l2.1 2.7h5.3A1.9 1.9 0 0 1 19.5 9.7v8.9z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M4.5 18.6V7a1.9 1.9 0 0 1 1.9-1.9h3.8l2.1 2.7h5.3A1.9 1.9 0 0 1 19.5 9.7v8.9z"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<rect x="6.6" y="9.7" width="12.4" height="1.4" rx="0.7"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'folder-open': [
    { className: 'li-art-paper', body: '<path d="M4.5 18.6V7.2a2 2 0 0 1 2-2h3.7l2 2.6h5.4a2 2 0 0 1 2 2v1.8H4.5z"/><path d="M4.5 11.6h15.1l-2.4 7H6.9z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M4.5 18.6V7.2a2 2 0 0 1 2-2h3.7l2 2.6h5.4a2 2 0 0 1 2 2v1.8H4.5z"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M4.5 11.6h15.1l-2.4 7H6.9z"/>', style: 'fill:var(--li-art-sun)' },
  ],
  file: [
    { className: 'li-art-paper', body: '<path d="M6.5 4.6h7.4l4.1 4.1v10.7a1.6 1.6 0 0 1-1.6 1.6H8.1a1.6 1.6 0 0 1-1.6-1.6z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M6.5 4.6h7.4l4.1 4.1v10.7a1.6 1.6 0 0 1-1.6 1.6H8.1a1.6 1.6 0 0 1-1.6-1.6z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M13.9 4.6l4.1 4.1h-4.1z"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'file-text': [
    { className: 'li-art-paper', body: '<path d="M6.5 4.6h7.4l4.1 4.1v10.7a1.6 1.6 0 0 1-1.6 1.6H8.1a1.6 1.6 0 0 1-1.6-1.6z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M6.5 4.6h7.4l4.1 4.1v10.7a1.6 1.6 0 0 1-1.6 1.6H8.1a1.6 1.6 0 0 1-1.6-1.6z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<rect x="9.4" y="11.45" width="5.4" height="1.1" rx="0.55"/><rect x="9.4" y="14.25" width="5.4" height="1.1" rx="0.55"/><rect x="9.4" y="17.05" width="3.6" height="1.1" rx="0.55"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'file-plus': [
    { className: 'li-art-paper', body: '<path d="M6.5 4.6h7.4l4.1 4.1v10.7a1.6 1.6 0 0 1-1.6 1.6H8.1a1.6 1.6 0 0 1-1.6-1.6z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M6.5 4.6h7.4l4.1 4.1v10.7a1.6 1.6 0 0 1-1.6 1.6H8.1a1.6 1.6 0 0 1-1.6-1.6z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<rect x="9.7" y="13.85" width="4.8" height="1.1" rx="0.55"/><rect x="11.55" y="12" width="1.1" height="4.8" rx="0.55"/>', style: 'fill:var(--li-art-sun)' },
  ],
  upload: [
    { className: 'li-art-paper', body: '<path d="M4.5 15.2v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/><path d="M12 15.6V5.2"/><path d="M7.7 9.5L12 5.1l4.3 4.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M4.5 15.2v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/><path d="M12 15.6V5.2"/><path d="M7.7 9.5L12 5.1l4.3 4.4"/>', style: toneStroke('cool') },
  ],
  download: [
    { className: 'li-art-paper', body: '<path d="M4.5 15.2v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/><path d="M12 4.8v10.4"/><path d="M7.7 11.1l4.3 4.4 4.3-4.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M4.5 15.2v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/><path d="M12 4.8v10.4"/><path d="M7.7 11.1l4.3 4.4 4.3-4.4"/>', style: toneStroke('cool') },
  ],
  'cloud-upload': [
    { className: 'li-art-paper', body: '<path d="M7.3 17.4a3.6 3.6 0 0 1 .2-7.2 5.3 5.3 0 0 1 10.2 1.6 3.2 3.2 0 0 1-.7 5.6z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M7.3 17.4a3.6 3.6 0 0 1 .2-7.2 5.3 5.3 0 0 1 10.2 1.6 3.2 3.2 0 0 1-.7 5.6z"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M12 15.4V10.5M9.8 12.7L12 10.5l2.2 2.2"/>', style: toneStroke('warm') },
  ],
  // image / image-upload / smile：由 artwork.ts 的 SPECIAL_LAYERS 保留。

  // ── communication ──
  heart: [
    { className: 'li-art-paper', body: '<path d="M12 19.6C7 15.9 4.1 12.9 4.1 9.7a4 4 0 0 1 4-4c1.6 0 3 .8 3.9 2.3a4.6 4.6 0 0 1 3.9-2.3 4 4 0 0 1 4 4c0 3.2-2.9 6.2-7.9 9.9z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M12 19.6C7 15.9 4.1 12.9 4.1 9.7a4 4 0 0 1 4-4c1.6 0 3 .8 3.9 2.3a4.6 4.6 0 0 1 3.9-2.3 4 4 0 0 1 4 4c0 3.2-2.9 6.2-7.9 9.9z"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<circle cx="9.4" cy="9.7" r="1.5"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'thumbs-up': [
    { className: 'li-art-paper', body: '<path d="M9.4 19h7.9a2.2 2.2 0 0 0 2.1-1.6l1.5-4.9a1.8 1.8 0 0 0-1.7-2.3h-4.6l.8-3.7a1.9 1.9 0 0 0-3.4-1.5L9.4 9.1z"/><rect x="3.8" y="10.6" width="3.9" height="8.4" rx="1.3"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M9.4 19h7.9a2.2 2.2 0 0 0 2.1-1.6l1.5-4.9a1.8 1.8 0 0 0-1.7-2.3h-4.6l.8-3.7a1.9 1.9 0 0 0-3.4-1.5L9.4 9.1z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<rect x="4.55" y="11.35" width="2.4" height="6.9" rx="0.85"/>', style: 'fill:var(--li-art-cool)' },
  ],
  message: [
    { className: 'li-art-paper', body: '<path d="M5.3 5H18.7A2 2 0 0 1 20.7 7v8a2 2 0 0 1-2 2h-8.3l-5.1 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M5.3 5H18.7A2 2 0 0 1 20.7 7v8a2 2 0 0 1-2 2h-8.3l-5.1 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<rect x="8.6" y="9.75" width="6.8" height="1.1" rx="0.55"/><rect x="8.6" y="12.45" width="4.2" height="1.1" rx="0.55"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'message-dots': [
    { className: 'li-art-paper', body: '<path d="M5.3 5H18.7A2 2 0 0 1 20.7 7v8a2 2 0 0 1-2 2h-8.3l-5.1 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M5.3 5H18.7A2 2 0 0 1 20.7 7v8a2 2 0 0 1-2 2h-8.3l-5.1 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<circle cx="8.7" cy="10.3" r="1.45"/><circle cx="12.1" cy="10.3" r="1.45"/><circle cx="15.5" cy="10.3" r="1.45"/>', style: 'fill:var(--li-art-sun)' },
  ],
  send: [
    { className: 'li-art-paper', body: '<path d="M20.6 3.6L3.8 10.5l6.5 2.7 2.7 6.5z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M20.6 3.6L3.8 10.5l6.5 2.7 2.7 6.5z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M20.6 3.6L10.3 13.2"/>', style: toneStroke('cool') },
  ],
  mail: [
    { className: 'li-art-paper', body: '<rect x="3.6" y="5.4" width="16.8" height="13.2" rx="2.2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.35" y="6.15" width="15.3" height="11.7" rx="1.45"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M4.95 6.2h14.1L12 12.85z"/>', style: 'fill:var(--li-art-sun)' },
  ],
  bell: [
    { className: 'li-art-paper', body: '<path d="M6.2 16.4v-4.1a5.8 5.8 0 0 1 11.6 0v4.1l1.4 2.3H4.8z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M6.2 16.4v-4.1a5.8 5.8 0 0 1 11.6 0v4.1l1.4 2.3H4.8z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M10.1 20.5a1.9 1.9 0 0 0 3.8 0z"/>', style: 'fill:var(--li-art-rose)' },
  ],
  'at-sign': [
    { className: 'li-art-paper', body: '<path d="M19.6 12A7.6 7.6 0 1 1 12 4.4c2.6 0 4.9 1.3 6.3 3.2"/><circle cx="12" cy="12" r="3.2"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M19.6 12A7.6 7.6 0 1 1 12 4.4c2.6 0 4.9 1.3 6.3 3.2"/>', style: toneStroke('warm') },
    { className: 'li-art-detail', body: '<circle cx="12" cy="12" r="2.45"/>', style: 'fill:var(--li-art-sun)' },
  ],
  share: [
    { className: 'li-art-paper', body: '<circle cx="6.4" cy="12" r="2.5"/><circle cx="17.2" cy="6" r="2.5"/><circle cx="17.2" cy="18" r="2.5"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M8.7 10.8l6.2-3.6M8.7 13.2l6.2 3.6"/>', style: toneStroke('cool') },
    { className: 'li-art-detail', body: '<circle cx="6.4" cy="12" r="1.9"/><circle cx="17.2" cy="6" r="1.9"/><circle cx="17.2" cy="18" r="1.9"/>', style: 'fill:var(--li-art-sun)' },
  ],

  // ── media ──
  camera: [
    { className: 'li-art-paper', body: '<rect x="3.6" y="7" width="16.8" height="12.6" rx="2.4"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.35" y="7.75" width="15.3" height="11.1" rx="1.65"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<circle cx="12" cy="13.3" r="3.7"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<circle cx="17.6" cy="10.4" r="1.3"/>', style: 'fill:var(--li-art-sun)' },
  ],
  video: [
    { className: 'li-art-paper', body: '<rect x="3.4" y="6.6" width="12.2" height="10.8" rx="2.2"/><path d="M16.4 10.6l4.2-2.4v7.6l-4.2-2.4z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.15" y="7.35" width="10.7" height="9.3" rx="1.45"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M16.4 10.6l4.2-2.4v7.6l-4.2-2.4z"/>', style: 'fill:var(--li-art-warm)' },
  ],
  play: [
    { className: 'li-art-paper', body: '<circle cx="12" cy="12" r="8.2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<circle cx="12" cy="12" r="7.45"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<path d="M9.72 7.8L16.76 12 9.72 16.2z"/>', style: 'fill:var(--li-art-sun)' },
    { className: 'li-art-trace', body: '<circle cx="12" cy="12" r="7.35"/>', style: '--li-dash:46.2' },
  ],
  pause: [
    { className: 'li-art-paper', body: '<path d="M8.6 5.8v12.4"/><path d="M15.4 5.8v12.4"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M8.6 5.8v12.4"/><path d="M15.4 5.8v12.4"/>', style: toneStroke('cool') },
  ],
  stop: [
    { className: 'li-art-paper', body: '<circle cx="12" cy="12" r="8.2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<circle cx="12" cy="12" r="7.45"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<rect x="7.2" y="7.2" width="9.6" height="9.6" rx="1.8"/>', style: 'fill:var(--li-art-sun)' },
    { className: 'li-art-trace', body: '<circle cx="12" cy="12" r="7.35"/>', style: '--li-dash:46.2' },
  ],
  microphone: [
    { className: 'li-art-paper', body: '<rect x="8.9" y="3.5" width="6.2" height="10.6" rx="3.1"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="9.65" y="4.25" width="4.7" height="9.1" rx="2.35"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<path d="M6.4 11.6a5.6 5.6 0 0 0 11.2 0"/>', style: toneStroke('warm') },
  ],
  'microphone-off': [
    { className: 'li-art-paper', body: '<rect x="8.9" y="3.5" width="6.2" height="10.6" rx="3.1"/><path d="M6.4 11.6a5.6 5.6 0 0 0 11.2 0M12 17.2v3M8.8 20.4h6.4"/><path d="M5 4.6l14 14.8"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M5 4.6l14 14.8"/>', style: toneStroke('rose') },
  ],
  volume: [
    { className: 'li-art-paper', body: '<path d="M4.4 9.4v5.2h3.1l4.1 3.6V5.8L7.5 9.4z"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<path d="M4.4 9.4v5.2h3.1l4.1 3.6V5.8L7.5 9.4z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M14.6 9.6a3.4 3.4 0 0 1 0 4.8"/><path d="M17.2 7.2a6.8 6.8 0 0 1 0 9.6"/>', style: toneStroke('cool') },
  ],
  headphones: [
    { className: 'li-art-paper', body: '<path d="M4.7 15.6v-2.4a7.3 7.3 0 0 1 14.6 0v2.4"/><rect x="3.5" y="14.4" width="3.7" height="5.6" rx="1.7" fill="var(--li-art-paper)" stroke="none"/><rect x="16.8" y="14.4" width="3.7" height="5.6" rx="1.7" fill="var(--li-art-paper)" stroke="none"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M4.7 15.6v-2.4a7.3 7.3 0 0 1 14.6 0v2.4"/>', style: toneStroke('cool') },
    { className: 'li-art-detail', body: '<rect x="4.25" y="15.15" width="2.2" height="5.1" rx="1"/><rect x="17.55" y="15.15" width="2.2" height="5.1" rx="1"/>', style: 'fill:var(--li-art-warm)' },
  ],
  music: [
    { className: 'li-art-paper', body: '<path d="M9.2 16.8V6.2l9.2-1.7v10.4"/><ellipse cx="6.7" cy="17" rx="2.6" ry="2.1" fill="var(--li-art-paper)" stroke="none"/><ellipse cx="16" cy="15.4" rx="2.6" ry="2.1" fill="var(--li-art-paper)" stroke="none"/>', style: PAPER_STROKE },
    { className: 'li-art-color', body: '<path d="M9.2 16.8V6.2l9.2-1.7v10.4"/>', style: toneStroke('cool') },
    { className: 'li-art-detail', body: '<ellipse cx="6.7" cy="17" rx="2.6" ry="2.1"/><ellipse cx="16" cy="15.4" rx="2.6" ry="2.1"/>', style: 'fill:var(--li-art-warm)' },
  ],
}
