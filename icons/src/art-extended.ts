/**
 * Loom Icons · Extended 集合的手工画层映射（animated 模式分层上色）。
 *
 * 与 art-essential.ts 同一合同：逐枚手写 ArtLayer[]，几何与
 * collections/extended.ts 的当前线稿严格重合，层置于原墨线之下。
 * - 闭合主体：paper 精确铺底 → color 主体色面 → detail 有意义的独立局部
 *   （衣服色块、屏幕内衬、锁孔衬底、日月核、礼物盖、饮料热气等，最多 3 色）；
 * - 开放笔画（蓝牙、柱状图、眼睛弧线、链接链环等）：paper 3.8 宽笔迹铺底，
 *   2.6 柔和彩色笔迹沿中轴按笔顺复描，开路径一律 fill:none；
 * - 颜色统一走 --li-art-*（纸 #f7f5ee / 墨 #45464a / 暖黄 warm #f5dc58 /
 *   青绿 cool #9bc96d / 深绿 leaf #4f7748 / 奶黄 sun #f7e4a1 / 珊瑚 rose #f08078）。
 */
import type { ArtLayer } from './artwork.js';

/** 开放笔迹的铺底参数：宽 3.8 纸描边，避免 6px 白晕。 */
const PAPER_STROKE = 'fill:none;stroke:var(--li-art-paper);stroke-width:3.8;stroke-linecap:round;stroke-linejoin:round';
/** 开放笔迹的彩色中轴复描参数。 */
function toneStroke(tone: string): string {
  return `fill:none;stroke:var(--li-art-${tone});stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round`;
}
/** 细节层的柔和彩色笔迹（比色面克制，用于内衬线条）。 */
function detailStroke(tone: string): string {
  return `fill:none;stroke:var(--li-art-${tone});stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round`;
}

export const extendedArt: Record<string, ArtLayer[]> = {
  // ── people ──
  user: [
    { className: 'li-art-paper', body: '<circle cx="12" cy="8" r="3.4"/>', style: 'fill:var(--li-art-paper)' },
    {
      className: 'li-art-paper',
      body: '<path d="M5.2 19.4c0-3.4 3-5.6 6.8-5.6s6.8 2.2 6.8 5.6"/>',
      style: PAPER_STROKE,
    },
    {
      className: 'li-art-color',
      body: '<circle cx="12" cy="8" r="2.65"/>',
      style: 'fill:var(--li-art-warm)',
    },
    {
      className: 'li-art-detail',
      body: '<path d="M5.2 19.4c0-3.4 3-5.6 6.8-5.6s6.8 2.2 6.8 5.6"/>',
      style: detailStroke('cool'),
    },
  ],
  users: [
    { className: 'li-art-paper', body: '<circle cx="9" cy="8" r="3"/>', style: 'fill:var(--li-art-paper)' },
    {
      className: 'li-art-paper',
      body: '<path d="M3.4 19.4c0-3 2.5-5.2 5.6-5.2s5.6 2.2 5.6 5.2"/><path d="M15.8 14.6c2.7.4 4.7 2.3 4.7 4.8M16.9 5.3a2.4 2.4 0 0 1 0 4.6"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<circle cx="9" cy="8" r="2.3"/>', style: 'fill:var(--li-art-warm)' },
    {
      className: 'li-art-detail',
      body: '<path d="M3.4 19.4c0-3 2.5-5.2 5.6-5.2s5.6 2.2 5.6 5.2"/>',
      style: detailStroke('cool'),
    },
    {
      className: 'li-art-detail',
      body: '<path d="M15.8 14.6c2.7.4 4.7 2.3 4.7 4.8M16.9 5.3a2.4 2.4 0 0 1 0 4.6"/>',
      style: detailStroke('sun'),
    },
  ],
  'user-plus': [
    { className: 'li-art-paper', body: '<circle cx="10.4" cy="7.8" r="3.1"/>', style: 'fill:var(--li-art-paper)' },
    {
      className: 'li-art-paper',
      body: '<path d="M4.6 19.2c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4"/><path d="M17.7 11.4h4"/><path d="M19.7 9.4v4"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<circle cx="10.4" cy="7.8" r="2.35"/>', style: 'fill:var(--li-art-warm)' },
    {
      className: 'li-art-detail',
      body: '<path d="M4.6 19.2c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4"/>',
      style: detailStroke('cool'),
    },
    {
      className: 'li-art-detail',
      body: '<path d="M17.7 11.4h4"/><path d="M19.7 9.4v4"/>',
      style: detailStroke('sun'),
    },
  ],
  lock: [
    { className: 'li-art-paper', body: '<rect x="5.4" y="10.4" width="13.2" height="9" rx="2"/>', style: 'fill:var(--li-art-paper)' },
    {
      className: 'li-art-paper',
      body: '<path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 7.2 0v2.8"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<rect x="6.3" y="11.3" width="11.4" height="7.2" rx="1.4"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<circle cx="12" cy="14.2" r="2.05"/>', style: 'fill:var(--li-art-sun)' },
  ],
  unlock: [
    { className: 'li-art-paper', body: '<rect x="5.4" y="10.4" width="13.2" height="9" rx="2"/>', style: 'fill:var(--li-art-paper)' },
    {
      className: 'li-art-paper',
      body: '<path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 6.9-1.4"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<rect x="6.3" y="11.3" width="11.4" height="7.2" rx="1.4"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<circle cx="12" cy="14.2" r="2.05"/>', style: 'fill:var(--li-art-sun)' },
  ],
  key: [
    {
      className: 'li-art-paper',
      body: '<circle cx="8" cy="8" r="3.6"/><path d="M10.6 10.6L19 19"/><path d="M14.2 14.2l2-2M17 17l2-2" fill="none"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<circle cx="8" cy="8" r="2.85"/>', style: 'fill:var(--li-art-warm)' },
    {
      className: 'li-art-detail',
      body: '<path d="M10.6 10.6L19 19"/><path d="M14.2 14.2l2-2M17 17l2-2" fill="none"/>',
      style: detailStroke('cool'),
    },
  ],
  shield: [
    {
      className: 'li-art-paper',
      body: '<path d="M12 3.6l7 2.6v5.4c0 4.3-2.9 7.1-7 8.6-4.1-1.5-7-4.3-7-8.6V6.2z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M12 3.6l7 2.6v5.4c0 4.3-2.9 7.1-7 8.6-4.1-1.5-7-4.3-7-8.6V6.2z"/>',
      style: 'fill:var(--li-art-cool)',
    },
    { className: 'li-art-detail', body: '<rect x="11.1" y="7.3" width="1.8" height="9.7" rx="0.9"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'shield-check': [
    {
      className: 'li-art-paper',
      body: '<path d="M12 3.6l7 2.6v5.4c0 4.3-2.9 7.1-7 8.6-4.1-1.5-7-4.3-7-8.6V6.2z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M12 3.6l7 2.6v5.4c0 4.3-2.9 7.1-7 8.6-4.1-1.5-7-4.3-7-8.6V6.2z"/>',
      style: 'fill:var(--li-art-cool)',
    },
    { className: 'li-art-detail', body: '<path d="M8.9 12.2l2.4 2.5 4-4.6"/>', style: detailStroke('leaf') },
  ],
  eye: [
    {
      className: 'li-art-paper',
      body: '<path d="M2.9 12c2.2-4.1 5.4-6.2 9.1-6.2s6.9 2.1 9.1 6.2c-2.2 4.1-5.4 6.2-9.1 6.2S5.1 16.1 2.9 12z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<circle cx="12" cy="12" r="2.15"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<circle cx="13" cy="11" r="0.9"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'eye-off': [
    {
      className: 'li-art-paper',
      body: '<path d="M4 8.6C6.2 5.6 8.9 4.2 12 4.2s5.8 1.4 8 4.4"/><path d="M3.4 13.2c2.1 3.6 5.1 5.4 8.6 5.4s6.5-1.8 8.6-5.4"/><path d="M6 17.6l-1.2 1.8M12 19.2v2M18 17.6l1.2 1.8"/>',
      style: PAPER_STROKE,
    },
    {
      className: 'li-art-color',
      body: '<path d="M4 8.6C6.2 5.6 8.9 4.2 12 4.2s5.8 1.4 8 4.4"/>',
      style: toneStroke('warm'),
    },
    {
      className: 'li-art-detail',
      body: '<path d="M3.4 13.2c2.1 3.6 5.1 5.4 8.6 5.4s6.5-1.8 8.6-5.4"/>',
      style: detailStroke('cool'),
    },
  ],

  // ── workspace ──
  search: [
    {
      className: 'li-art-paper',
      body: '<circle cx="10.6" cy="10.6" r="5.8"/><path d="M15 15l4.6 4.6"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<circle cx="10.6" cy="10.6" r="5.05"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<circle cx="8.9" cy="8.9" r="1.4"/>', style: 'fill:var(--li-art-sun)' },
    { className: 'li-art-detail', body: '<path d="M15 15l4.6 4.6"/>', style: detailStroke('warm') },
  ],
  settings: [
    {
      className: 'li-art-paper',
      body: '<path d="M10.825 3.077L13.175 3.077L13.889 4.949L15.65 5.678L17.479 4.86L19.14 6.521L18.322 8.35L19.051 10.111L20.923 10.825L20.923 13.175L19.051 13.889L18.322 15.65L19.14 17.479L17.479 19.14L15.65 18.322L13.889 19.051L13.175 20.923L10.825 20.923L10.111 19.051L8.35 18.322L6.521 19.14L4.86 17.479L5.678 15.65L4.949 13.889L3.077 13.175L3.077 10.825L4.949 10.111L5.678 8.35L4.86 6.521L6.521 4.86L8.35 5.678L10.111 4.949Z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M10.825 3.077L13.175 3.077L13.889 4.949L15.65 5.678L17.479 4.86L19.14 6.521L18.322 8.35L19.051 10.111L20.923 10.825L20.923 13.175L19.051 13.889L18.322 15.65L19.14 17.479L17.479 19.14L15.65 18.322L13.889 19.051L13.175 20.923L10.825 20.923L10.111 19.051L8.35 18.322L6.521 19.14L4.86 17.479L5.678 15.65L4.949 13.889L3.077 13.175L3.077 10.825L4.949 10.111L5.678 8.35L4.86 6.521L6.521 4.86L8.35 5.678L10.111 4.949Z"/>',
      style: 'fill:var(--li-art-cool)',
    },
    { className: 'li-art-detail', body: '<circle cx="12" cy="12" r="1.9"/>', style: 'fill:var(--li-art-sun)' },
  ],
  filter: [
    {
      className: 'li-art-paper',
      body: '<path d="M4.4 5h15.2l-5.8 7v5.4l-3.6 2.2v-7.6z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<path d="M4.4 5h15.2l-5.8 7v5.4l-3.6 2.2v-7.6z"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<circle cx="12" cy="20.4" r="1.3"/>', style: 'fill:var(--li-art-sun)' },
  ],
  sliders: [
    {
      className: 'li-art-paper',
      body: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<path d="M4 7h16M4 12h16M4 17h16"/>', style: toneStroke('cool') },
    {
      className: 'li-art-detail',
      body: '<circle cx="15" cy="7" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="13.5" cy="17" r="1.5"/>',
      style: 'fill:var(--li-art-warm)',
    },
  ],
  grid: [
    {
      className: 'li-art-paper',
      body: '<rect x="4" y="4" width="6.8" height="6.8" rx="1.6"/><rect x="13.2" y="4" width="6.8" height="6.8" rx="1.6"/><rect x="4" y="13.2" width="6.8" height="6.8" rx="1.6"/><rect x="13.2" y="13.2" width="6.8" height="6.8" rx="1.6"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<rect x="4.9" y="4.9" width="5" height="5" rx="1"/><rect x="14.1" y="14.1" width="5" height="5" rx="1"/>',
      style: 'fill:var(--li-art-cool)',
    },
    {
      className: 'li-art-detail',
      body: '<rect x="14.1" y="4.9" width="5" height="5" rx="1"/><rect x="4.9" y="14.1" width="5" height="5" rx="1"/>',
      style: 'fill:var(--li-art-warm)',
    },
  ],
  list: [
    {
      className: 'li-art-paper',
      body: '<path d="M7.5 6.5h12"/><path d="M7.5 12.5h12"/><path d="M7.5 18.5h12"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<path d="M7.5 6.5h12"/><path d="M7.5 12.5h12"/><path d="M7.5 18.5h12"/>', style: toneStroke('cool') },
    {
      className: 'li-art-detail',
      body: '<circle cx="4.6" cy="6.5" r="1.55"/><circle cx="4.6" cy="12.5" r="1.55"/><circle cx="4.6" cy="18.5" r="1.55"/>',
      style: 'fill:var(--li-art-warm)',
    },
  ],
  layout: [
    { className: 'li-art-paper', body: '<rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.5" y="5.5" width="15" height="3.4" rx="1.2"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M6.4 12.6h5M6.4 15.6h5"/>', style: detailStroke('warm') },
  ],
  sidebar: [
    { className: 'li-art-paper', body: '<rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.5" y="5.5" width="3.6" height="13" rx="1.4"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<circle cx="6.3" cy="10" r="1.25"/><circle cx="6.3" cy="14" r="1.25"/>', style: 'fill:var(--li-art-warm)' },
  ],
  calendar: [
    {
      className: 'li-art-paper',
      body: '<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/><path d="M8 3.4v3.2M16 3.4v3.2" fill="none" stroke="var(--li-art-paper)" stroke-width="2.8"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<rect x="5.3" y="10.9" width="13.4" height="8.1" rx="1.2"/>', style: 'fill:var(--li-art-warm)' },
    {
      className: 'li-art-detail',
      body: '<circle cx="8.4" cy="13.4" r="1.55"/><circle cx="12" cy="13.4" r="1.55"/><circle cx="15.6" cy="13.4" r="1.55"/><circle cx="8.4" cy="16.8" r="1.55"/>',
      style: 'fill:var(--li-art-sun)',
    },
  ],
  clock: [
    { className: 'li-art-paper', body: '<circle cx="12" cy="12" r="8.4"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<circle cx="12" cy="12" r="7.65"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M12 12V7.4"/><path d="M12 12l3.4 2.2"/>', style: detailStroke('warm') },
  ],

  // ── content ──
  bookmark: [
    {
      className: 'li-art-paper',
      body: '<path d="M6.6 4.6h10.8v15.6L12 15.8l-5.4 4.4z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<path d="M6.6 4.6h10.8v15.6L12 15.8l-5.4 4.4z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M6.6 14.4l5.4-2.4 5.4 2.4"/>', style: detailStroke('leaf') },
  ],
  star: [
    {
      className: 'li-art-paper',
      body: '<path d="M12 3.8l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-3.9 5.7-.7z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M12 3.8l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-3.9 5.7-.7z"/>',
      style: 'fill:var(--li-art-warm)',
    },
    { className: 'li-art-detail', body: '<circle cx="12" cy="11.6" r="1.5"/>', style: 'fill:var(--li-art-sun)' },
  ],
  tag: [
    {
      className: 'li-art-paper',
      body: '<path d="M4.6 4.6h6.6l8.2 8.2-6.6 6.6-8.2-8.2z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<path d="M4.6 4.6h6.6l8.2 8.2-6.6 6.6-8.2-8.2z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<circle cx="8.2" cy="8.2" r="1.4"/>', style: 'fill:var(--li-art-sun)' },
  ],
  link: [
    {
      className: 'li-art-paper',
      body: '<path d="M9.2 14.8l5.6-5.6"/><path d="M10.8 17.6l-1.6 1.6a4.2 4.2 0 0 1-5.9-5.9l1.6-1.6"/><path d="M13.2 6.4l1.6-1.6a4.2 4.2 0 0 1 5.9 5.9l-1.6 1.6"/>',
      style: PAPER_STROKE,
    },
    {
      className: 'li-art-color',
      body: '<path d="M10.8 17.6l-1.6 1.6a4.2 4.2 0 0 1-5.9-5.9l1.6-1.6"/><path d="M13.2 6.4l1.6-1.6a4.2 4.2 0 0 1 5.9 5.9l-1.6 1.6"/>',
      style: toneStroke('cool'),
    },
    { className: 'li-art-detail', body: '<path d="M9.2 14.8l5.6-5.6"/>', style: detailStroke('warm') },
  ],
  globe: [
    { className: 'li-art-paper', body: '<circle cx="12" cy="12" r="8.4"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<circle cx="12" cy="12" r="7.65"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<ellipse cx="12" cy="12" rx="3.6" ry="7.65"/>', style: detailStroke('leaf') },
  ],
  language: [
    { className: 'li-art-paper', body: '<rect x="3.4" y="4.4" width="8.2" height="8.2" rx="1.5"/>', style: 'fill:var(--li-art-paper)' },
    {
      className: 'li-art-paper',
      body: '<path d="M5.6 7.2h3.8M7.5 5.6v5M5.9 10.4c.9.9 2.2.9 3.2 0"/><path d="M14 15.6L16.6 8.8l2.6 6.8M14.9 13.6h3.5M13.8 18.6h5.7"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<rect x="4.3" y="5.3" width="6.4" height="6.4" rx="1.1"/>', style: 'fill:var(--li-art-warm)' },
    {
      className: 'li-art-detail',
      body: '<path d="M5.6 7.2h3.8M7.5 5.6v5M5.9 10.4c.9.9 2.2.9 3.2 0"/><path d="M14 15.6L16.6 8.8l2.6 6.8M14.9 13.6h3.5M13.8 18.6h5.7"/>',
      style: detailStroke('leaf'),
    },
  ],
  code: [
    {
      className: 'li-art-paper',
      body: '<path d="M8.4 8.6L4.8 12l3.6 3.4"/><path d="M15.6 8.6L19.2 12l-3.6 3.4"/><path d="M13.4 6.4l-2.8 11.2"/>',
      style: PAPER_STROKE,
    },
    {
      className: 'li-art-color',
      body: '<path d="M8.4 8.6L4.8 12l3.6 3.4"/><path d="M15.6 8.6L19.2 12l-3.6 3.4"/>',
      style: toneStroke('cool'),
    },
    { className: 'li-art-detail', body: '<path d="M13.4 6.4l-2.8 11.2"/>', style: detailStroke('warm') },
  ],
  terminal: [
    {
      className: 'li-art-paper',
      body: '<rect x="3.6" y="4.8" width="16.8" height="14.4" rx="2"/><path d="M7 9.4l2.6 2.4L7 14.2" fill="none"/><path d="M12.4 14.4h4.8" fill="none"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<rect x="4.5" y="5.7" width="15" height="12.6" rx="1.4"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M7 9.4l2.6 2.4L7 14.2" fill="none"/><path d="M12.4 14.4h4.8" fill="none"/>', style: detailStroke('warm') },
  ],
  'pen-tool': [
    {
      className: 'li-art-paper',
      body: '<path d="M4.5 19.5L6.4 10.3 14.1 5.6 18.4 9.9 13.7 17.6Z"/><path d="M13.7 6L16.3 3.4 20.6 7.7 18 10.3z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<path d="M6.4 10.3L14.1 5.6 18.4 9.9 13.7 17.6Z"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M13.7 6L16.3 3.4 20.6 7.7 18 10.3z"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<circle cx="10.5" cy="13.5" r="1.2"/>', style: 'fill:var(--li-art-sun)' },
  ],
  palette: [
    {
      className: 'li-art-paper',
      body: '<path d="M12 3.6c-4.6 0-8.4 3.4-8.4 7.8 0 4.6 3.4 8.2 7.6 8.2 1.5 0 2.2-.9 2.2-1.9 0-1.4-1.2-1.8-1.2-3 0-1 .8-1.7 2-1.7h2.1c2.3 0 4.1-1.7 4.1-4.1 0-3.1-3.6-5.3-8.4-5.3z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M12 3.6c-4.6 0-8.4 3.4-8.4 7.8 0 4.6 3.4 8.2 7.6 8.2 1.5 0 2.2-.9 2.2-1.9 0-1.4-1.2-1.8-1.2-3 0-1 .8-1.7 2-1.7h2.1c2.3 0 4.1-1.7 4.1-4.1 0-3.1-3.6-5.3-8.4-5.3z"/>',
      style: 'fill:var(--li-art-warm)',
    },
    {
      className: 'li-art-detail',
      body: '<circle cx="7.6" cy="8.4" r="1.75"/><circle cx="12" cy="6.8" r="1.75"/><circle cx="16.4" cy="8.6" r="1.75"/>',
      style: 'fill:var(--li-art-rose)',
    },
  ],

  // ── devices ──
  monitor: [
    { className: 'li-art-paper', body: '<rect x="3.2" y="4.6" width="17.6" height="11.6" rx="1.8"/>', style: 'fill:var(--li-art-paper)' },
    {
      className: 'li-art-paper',
      body: '<path d="M12 16.2v2.4M8.4 20.4h7.2"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<rect x="4.1" y="5.5" width="15.8" height="9.8" rx="1.2"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M6 7.6h4"/>', style: detailStroke('warm') },
    { className: 'li-art-detail', body: '<path d="M12 16.2v2.4M8.4 20.4h7.2"/>', style: detailStroke('sun') },
  ],
  laptop: [
    {
      className: 'li-art-paper',
      body: '<rect x="5" y="4.6" width="14" height="9.6" rx="1.5"/><path d="M3.2 17.6c0-.8.6-1.4 1.4-1.4h14.8c.8 0 1.4.6 1.4 1.4z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<rect x="5.9" y="5.5" width="12.2" height="7.8" rx="1"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<path d="M7.6 15.8h8.8"/>', style: detailStroke('warm') },
  ],
  smartphone: [
    { className: 'li-art-paper', body: '<rect x="7" y="3" width="10" height="18" rx="2.4"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="7.9" y="3.9" width="8.2" height="16.2" rx="1.6"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<circle cx="12" cy="17.8" r="1.55"/>', style: 'fill:var(--li-art-warm)' },
  ],
  tablet: [
    { className: 'li-art-paper', body: '<rect x="4.2" y="3.4" width="15.6" height="17.2" rx="2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="5.1" y="4.3" width="13.8" height="15.4" rx="1.4"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M7.6 7.4h8.8M7.6 10.8h6"/>', style: detailStroke('cool') },
    { className: 'li-art-detail', body: '<circle cx="12" cy="18.4" r="1.45"/>', style: 'fill:var(--li-art-sun)' },
  ],
  keyboard: [
    { className: 'li-art-paper', body: '<rect x="3.2" y="7" width="17.6" height="10.6" rx="1.8"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.1" y="7.9" width="15.8" height="8.8" rx="1.2"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<rect x="17" y="12.3" width="1.7" height="1.7" rx="0.3"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<path d="M8.5 15.6h7"/>', style: detailStroke('sun') },
  ],
  mouse: [
    {
      className: 'li-art-paper',
      body: '<path d="M12 3.6c3.6 0 6 2.8 6 7v3c0 4.2-2.4 7-6 7s-6-2.8-6-7v-3c0-4.2 2.4-7 6-7z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M12 4.5c3.1 0 5.1 2.4 5.1 6.1v3c0 3.7-2 6.1-5.1 6.1s-5.1-2.4-5.1-6.1v-3c0-3.7 2-6.1 5.1-6.1z"/>',
      style: 'fill:var(--li-art-cool)',
    },
    { className: 'li-art-detail', body: '<rect x="10.9" y="8.4" width="2.2" height="3.6" rx="1.1"/>', style: 'fill:var(--li-art-warm)' },
  ],
  wifi: [
    {
      className: 'li-art-paper',
      body: '<path d="M4.4 9.8C6.6 7.4 9.2 6.2 12 6.2s5.4 1.2 7.6 3.6"/><path d="M7.4 13c1.4-1.4 2.9-2.1 4.6-2.1s3.2.7 4.6 2.1"/><circle cx="12" cy="17.6" r="1.6"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<path d="M4.4 9.8C6.6 7.4 9.2 6.2 12 6.2s5.4 1.2 7.6 3.6"/><path d="M7.4 13c1.4-1.4 2.9-2.1 4.6-2.1s3.2.7 4.6 2.1"/>', style: toneStroke('cool') },
    { className: 'li-art-detail', body: '<circle cx="12" cy="17.6" r="1.15"/>', style: 'fill:var(--li-art-warm)' },
  ],
  bluetooth: [
    {
      className: 'li-art-paper',
      body: '<path d="M12 3.5v17"/><path d="M12 3.5L16.5 7.5 7.5 16.5"/><path d="M7.5 7.5L16.5 16.5 12 20.5"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<path d="M12 3.5v17"/><path d="M12 3.5L16.5 7.5 7.5 16.5"/><path d="M7.5 7.5L16.5 16.5 12 20.5"/>', style: toneStroke('cool') },
  ],
  battery: [
    { className: 'li-art-paper', body: '<rect x="3.2" y="8.6" width="15.2" height="6.8" rx="1.8"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.1" y="9.5" width="13.4" height="5" rx="1.2"/>', style: 'fill:var(--li-art-cool)' },
    {
      className: 'li-art-detail',
      body: '<rect x="5.35" y="10.35" width="3.5" height="3.3" rx="0.9"/><rect x="9.55" y="10.35" width="3.5" height="3.3" rx="0.9"/>',
      style: 'fill:var(--li-art-warm)',
    },
  ],
  printer: [
    {
      className: 'li-art-paper',
      body: '<path d="M5.6 8.2h12.8v7.2H5.6z"/><rect x="7" y="15.4" width="10" height="4.4" rx="0.8"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-paper',
      body: '<path d="M7 8.2V4.4h10v3.8"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<rect x="6.5" y="9.1" width="11" height="5.4"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<rect x="7.9" y="16.3" width="8.2" height="2.6" rx="0.7"/>', style: 'fill:var(--li-art-warm)' },
  ],

  // ── lifestyle ──
  sun: [
    { className: 'li-art-paper', body: '<circle cx="12" cy="12" r="4"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<circle cx="12" cy="12" r="3.25"/>', style: 'fill:var(--li-art-warm)' },
    {
      className: 'li-art-detail',
      body: '<g><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/></g>',
      style: detailStroke('cool'),
    },
  ],
  moon: [
    {
      className: 'li-art-paper',
      body: '<path d="M14.8 3.8a8.4 8.4 0 1 0 5.4 12.2 6.8 6.8 0 0 1-5.4-12.2z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M14.8 3.8a8.4 8.4 0 1 0 5.4 12.2 6.8 6.8 0 0 1-5.4-12.2z"/>',
      style: 'fill:var(--li-art-warm)',
    },
    {
      className: 'li-art-detail',
      body: '<path d="M17.6 4.4l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z"/>',
      style: 'fill:var(--li-art-sun)',
    },
  ],
  'map-pin': [
    {
      className: 'li-art-paper',
      body: '<path d="M12 3.6c3.8 0 6.6 2.9 6.6 6.5 0 4.8-6.6 10.2-6.6 10.2S5.4 14.9 5.4 10.1C5.4 6.5 8.2 3.6 12 3.6z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M12 3.6c3.8 0 6.6 2.9 6.6 6.5 0 4.8-6.6 10.2-6.6 10.2S5.4 14.9 5.4 10.1C5.4 6.5 8.2 3.6 12 3.6z"/>',
      style: 'fill:var(--li-art-rose)',
    },
    { className: 'li-art-detail', body: '<circle cx="12" cy="10.2" r="2.4"/>', style: 'fill:var(--li-art-paper)' },
  ],
  'shopping-cart': [
    {
      className: 'li-art-paper',
      body: '<path d="M4 5h2.4l2.6 10.4h9.4l2.2-7.4H7.2"/><circle cx="9.6" cy="19.4" r="1.5"/><circle cx="16" cy="19.4" r="1.5"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<path d="M4 5h2.4l2.6 10.4h9.4l2.2-7.4H7.2"/>', style: toneStroke('warm') },
    { className: 'li-art-detail', body: '<circle cx="9.6" cy="19.4" r="0.85"/><circle cx="16" cy="19.4" r="0.85"/>', style: 'fill:var(--li-art-cool)' },
  ],
  wallet: [
    { className: 'li-art-paper', body: '<rect x="4" y="6.4" width="16" height="12.8" rx="2.2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.9" y="7.3" width="14.2" height="11" rx="1.7"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<rect x="4.9" y="11.3" width="14.2" height="7" rx="1.4"/>', style: 'fill:var(--li-art-cool)' },
  ],
  'chart-bar': [
    {
      className: 'li-art-paper',
      body: '<path d="M4.6 4.8v13.6h14.2"/><path d="M7.6 18.4v-5.2"/><path d="M12 18.4v-8.4"/><path d="M16.4 18.4v-3.6"/>',
      style: PAPER_STROKE,
    },
    { className: 'li-art-color', body: '<path d="M4.6 4.8v13.6h14.2"/>', style: toneStroke('cool') },
    {
      className: 'li-art-detail',
      body: '<path d="M7.6 18.4v-5.2"/><path d="M12 18.4v-8.4"/><path d="M16.4 18.4v-3.6"/>',
      style: detailStroke('warm'),
    },
  ],
  database: [
    {
      className: 'li-art-paper',
      body: '<path d="M5.2 6.2v11.6c0 1.6 3 2.8 6.8 2.8s6.8-1.2 6.8-2.8V6.2Z"/><ellipse cx="12" cy="6.2" rx="6.8" ry="2.8"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<path d="M5.2 6.2v11.6c0 1.6 3 2.8 6.8 2.8s6.8-1.2 6.8-2.8V6.2Z"/>', style: 'fill:var(--li-art-cool)' },
    { className: 'li-art-detail', body: '<ellipse cx="12" cy="6.2" rx="6" ry="2.3"/>', style: 'fill:var(--li-art-warm)' },
  ],
  gift: [
    {
      className: 'li-art-paper',
      body: '<rect x="4.4" y="9.6" width="15.2" height="10.8" rx="1.4"/><rect x="3.4" y="6.4" width="17.2" height="3.2" rx="1.2"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<rect x="5.3" y="10.5" width="13.4" height="9" rx="0.9"/>', style: 'fill:var(--li-art-warm)' },
    { className: 'li-art-detail', body: '<rect x="4.3" y="7.3" width="15.4" height="1.4" rx="0.7"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<path d="M12 9.6v10.8"/>', style: detailStroke('sun') },
  ],
  coffee: [
    {
      className: 'li-art-paper',
      body: '<path d="M5.4 7.4h11v7.2c0 2.4-1.8 4-4.6 4h-1.8c-2.8 0-4.6-1.6-4.6-4z"/><path d="M16.4 9h1.4a2.6 2.6 0 0 1 0 5.2h-1.4Z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    { className: 'li-art-color', body: '<path d="M5.4 7.4h11v7.2c0 2.4-1.8 4-4.6 4h-1.8c-2.8 0-4.6-1.6-4.6-4z"/>', style: 'fill:var(--li-art-rose)' },
    { className: 'li-art-detail', body: '<path d="M9 4.6v2M12 3.6v2.8M15 4.6v2"/>', style: detailStroke('warm') },
  ],
  sparkles: [
    {
      className: 'li-art-paper',
      body: '<path d="M9.4 3.6l1.5 4.2 4.2 1.5-4.2 1.5-1.5 4.2-1.5-4.2-4.2-1.5 4.2-1.5z"/><path d="M17.4 13.2l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>',
      style: 'fill:var(--li-art-paper)',
    },
    {
      className: 'li-art-color',
      body: '<path d="M9.4 3.6l1.5 4.2 4.2 1.5-4.2 1.5-1.5 4.2-1.5-4.2-4.2-1.5 4.2-1.5z"/>',
      style: 'fill:var(--li-art-warm)',
    },
    {
      className: 'li-art-detail',
      body: '<path d="M17.4 13.2l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>',
      style: 'fill:var(--li-art-cool)',
    },
    { className: 'li-art-detail', body: '<circle cx="18" cy="5.6" r="1.75"/>', style: 'fill:var(--li-art-sun)' },
  ],
}
