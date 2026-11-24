/**
 * Loom Icons · React 运行时入口
 *
 * 按名查目录并委托 factory 渲染；getIconSvg 生成独立 SVG 字符串。
 * 单图标渲染逻辑全部在 factory.tsx（无目录依赖），本文件不复制实现。
 * 无 lucide / loom-ui / 框架依赖，无动画库；
 * 动画完全依赖 motion.ts 输出的共享 CSS（外部一次性引入 styles.css）。
 */
import { forwardRef } from 'react';
import { getIconDefinition, type IconName } from './catalog.js';
import { getArtLayers, renderArtLayersToSvg } from './artwork.js';
import { DefinitionIcon, type IconInstanceProps } from './factory.js';
import { getMotionCss } from './motion.js';

export { createIcon } from './factory.js';
export type { IconInstanceProps } from './factory.js';

/** 通用 <Icon> 的 props：单图标 props + name。 */
export interface IconProps extends IconInstanceProps {
  /** 图标 id，如 "plus"。 */
  name: IconName;
}

/** 通用 <Icon>，按 name 从目录取定义。 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
  const { name, ...instanceProps } = props;
  const definition = getIconDefinition(name);
  if (!definition) return null;
  return <DefinitionIcon ref={ref} definition={definition} artwork={instanceProps.mode === 'animated' ? getArtLayers(definition) : undefined} {...instanceProps} />;
});

export interface GetIconSvgOptions {
  mode?: 'static' | 'animated';
  size?: number | string;
  strokeWidth?: number;
  /** 缺省随宿主文字色（currentColor）。 */
  color?: string;
  label?: string;
  /** animated 模式下置为 data-active="true" 即可常显触发态。 */
  active?: boolean;
}

/** 转义 XML 属性值，防止外部字符串破坏标签结构。 */
function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 生成可独立使用的 SVG 字符串（浏览器内字符串模板，不读 fs、不执行脚本）。
 * static：不含 style 与动画；animated：内嵌该图标用到的 motion CSS，可独立响应 hover。
 */
export function getIconSvg(name: string, options: GetIconSvgOptions = {}): string {
  const {
    mode = 'static',
    size = 24,
    strokeWidth = 1.8,
    color,
    label,
    active = false,
  } = options;

  const definition = getIconDefinition(name);
  if (!definition) {
    throw new Error(`[loom-icons] unknown icon id: ${name}`);
  }

  const sizeAttr = typeof size === 'number' ? `${size}` : escapeXmlAttr(size);
  const labelAttr = label ? escapeXmlAttr(label) : '';
  // 颜色经根 color 属性下发：stroke 保持 currentColor（animated CSS 与 tone 才能正常着色）。
  const colorAttr = color ? ` color="${escapeXmlAttr(color)}"` : '';

  const parts = definition.parts
    .map((part) => {
      const origin = escapeXmlAttr(part.origin ?? '12px 12px');
      const toneClass = part.tone ? ` li-tone-${part.tone}` : '';
      const styleVars = [`--li-origin:${origin}`];
      if (part.delay != null) styleVars.push(`--li-delay:${part.delay}ms`);
      if (part.duration != null) styleVars.push(`--li-duration:${part.duration}ms`);
      return `<g class="li-part li-motion-${part.motion}${toneClass}" style="${styleVars.join(';')}">${part.body}</g>`;
    })
    .join('');

  const a11y = label
    ? ` role="img" aria-label="${labelAttr}"`
    : ' aria-hidden="true" focusable="false"';

  const styleTag =
    mode === 'animated'
      ? `<style>${getMotionCss(definition.parts.map((part) => part.motion))}</style>`
      : '';
  // animated 模式先铺画层（纸底/彩底/细节/高光），原始线稿完整覆盖其上；
  // 与 React factory 走同一 artwork helper，两条输出一致。
  const artLayers = mode === 'animated' ? renderArtLayersToSvg(definition) : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${sizeAttr}" height="${sizeAttr}"` +
    ` fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"` +
    ` class="li-icon" data-mode="${mode}"${active ? ' data-active="true"' : ''}${colorAttr}${a11y}>` +
    styleTag +
    artLayers +
    parts +
    '</svg>'
  );
}
