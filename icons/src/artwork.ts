/** 100 枚图标的手工画层。React 与独立 SVG 共用；不根据轮廓自动填色。 */
import type { IconDefinition } from './types.js';
import { essentialArt } from './art-essential.js';
import { extendedArt } from './art-extended.js';
export type ArtLayerClass = 'li-art-paper' | 'li-art-color' | 'li-art-detail' | 'li-art-trace';
export interface ArtLayer { className: ArtLayerClass; body: string; style: string }
const SPECIAL_LAYERS: Record<string, ArtLayer[]> = {
  smile: [
    { className: 'li-art-paper', body: '<circle cx="12" cy="12" r="8.1"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<circle cx="12" cy="12" r="7.45"/>', style: 'fill:var(--li-art-warm)' },
    {
      className: 'li-art-trace',
      body: '<circle cx="12" cy="12" r="7.35"/>',
      style: '--li-dash:46.2',
    },
  ],
  image: [
    { className: 'li-art-paper', body: '<rect x="3.6" y="4.8" width="16.8" height="14.4" rx="2.2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.35" y="5.55" width="15.3" height="13.65" rx="0.9"/>', style: 'fill:var(--li-art-sky)' },
    {
      className: 'li-art-detail',
      body: '<path d="M6.4 16.4L10.1 12 12.7 15 14.7 12.7 17.6 16.4V19.2H6.4Z"/>',
      style: 'fill:var(--li-art-leaf);transform-origin:50% 100%;--li-detail-from:0.64',
    },
    { className: 'li-art-detail', body: '<circle cx="16" cy="9.1" r="1.7"/>', style: 'fill:var(--li-art-sun)' },
  ],
  'image-upload': [
    { className: 'li-art-paper', body: '<rect x="3.6" y="6.4" width="15.6" height="13" rx="2.2"/>', style: 'fill:var(--li-art-paper)' },
    { className: 'li-art-color', body: '<rect x="4.35" y="7.15" width="14.1" height="12.25" rx="0.9"/>', style: 'fill:var(--li-art-sky)' },
    {
      className: 'li-art-detail',
      body: '<path d="M6.3 16.3L9.7 12.3 12.1 15.1 14 12.9 16.7 16.3V19.4H6.3Z"/>',
      style: 'fill:var(--li-art-leaf);transform-origin:50% 100%;--li-detail-from:0.64',
    },
    { className: 'li-art-detail', body: '<circle cx="15.2" cy="10.3" r="1.5"/>', style: 'fill:var(--li-art-sun)' },
  ],
};
const artById = { ...essentialArt, ...extendedArt, ...SPECIAL_LAYERS };
const cache = new WeakMap<IconDefinition, ArtLayer[]>();

/** 纸边承接主体以外的加号、天线等笔画，深色背景上也保持清楚。 */
function paperEdge(definition: IconDefinition): ArtLayer {
  return {
    className: 'li-art-paper',
    body: definition.parts.map(part => part.body.replace(/\s(?:fill|stroke|stroke-width)="[^"]*"/g, '')).join(''),
    style: 'fill:none;stroke:var(--li-art-paper);stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round',
  };
}
export function getArtLayers(definition: IconDefinition): ArtLayer[] {
  const previous = cache.get(definition);
  if (previous) return previous;
  const layers = artById[definition.id];
  if (!layers?.length) throw new Error(`[loom-icons] missing artwork: ${definition.id}`);
  const result = [paperEdge(definition), ...layers];
  cache.set(definition, result);
  return result;
}
export function renderArtLayersToSvg(definition: IconDefinition): string {
  return getArtLayers(definition).map(layer => `<g class="li-art-layer ${layer.className}" style="${layer.style}">${layer.body}</g>`).join('');
}