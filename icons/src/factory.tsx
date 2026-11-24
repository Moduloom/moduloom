/**
 * Loom Icons · 单图标工厂
 *
 * 本文件是"无目录"渲染层：只依赖 React 与 IconDefinition 数据类型，
 * 绝不 import catalog / motion —— 供按需打包（dist/icons/*）直接引用，
 * 每个生成的单图标组件不携带整个目录。
 */
import { forwardRef } from 'react';
import type { CSSProperties, SVGProps } from 'react';
import type { ArtLayer } from './artwork.js';
import type { IconDefinition, IconPart } from './types.js';

/** 单枚图标的 props（不含 name，createIcon 生成的组件使用）。 */
export interface IconInstanceProps
  extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children' | 'dangerouslySetInnerHTML'> {
  /** static（默认）无动画；animated 由共享 CSS 触发。 */
  mode?: 'static' | 'animated';
  /** 尺寸，number 视为像素。默认 24。 */
  size?: number | string;
  /** 描边宽度。默认 1.8。 */
  strokeWidth?: number;
  /** animated 模式下等价于触发态（data-active）。 */
  active?: boolean;
  /** 提供时渲染为 role="img"，否则 aria-hidden。 */
  label?: string;
}

type PartStyleVars = Partial<
  Record<'--li-origin' | '--li-delay' | '--li-duration', string>
>;

/** 单个部件的公共样式变量（origin / delay / duration 覆盖）。 */
function partStyle(part: IconPart): PartStyleVars {
  const style: PartStyleVars = {
    '--li-origin': part.origin ?? '12px 12px',
  };
  if (part.delay != null) style['--li-delay'] = `${part.delay}ms`;
  if (part.duration != null) style['--li-duration'] = `${part.duration}ms`;
  return style;
}

function partClassName(part: IconPart): string {
  const classes = ['li-part', `li-motion-${part.motion}`];
  if (part.tone) classes.push(`li-tone-${part.tone}`);
  return classes.join(' ');
}

/** animated 模式下的上色画层（纸底/彩底/细节/高光），渲染在原始线稿之下。 */
function renderArtLayers(artwork: readonly ArtLayer[]) {
  return artwork.map((layer, index) => (
    <g
      key={index}
      className={`li-art-layer ${layer.className}`}
      style={Object.fromEntries(layer.style.split(';').filter(Boolean).map(rule => {
        const separator = rule.indexOf(':');
        const property = rule.slice(0, separator);
        return [property.startsWith('--') ? property : property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), rule.slice(separator + 1)];
      })) as CSSProperties}
      dangerouslySetInnerHTML={{ __html: layer.body }}
    />
  ));
}

/** 渲染一枚图标的全部部件（body 仅模块数据）。 */
function renderParts(definition: IconDefinition) {
  return definition.parts.map((part) => (
    <g
      key={part.id}
      className={partClassName(part)}
      style={partStyle(part)}
      dangerouslySetInnerHTML={{ __html: part.body }}
    />
  ));
}

/** 由调用方给出定义的通用渲染实现，Icon 与 createIcon 共用。 */
export const DefinitionIcon = forwardRef<
  SVGSVGElement,
  IconInstanceProps & { definition: IconDefinition; artwork?: readonly ArtLayer[] }
>(function DefinitionIcon(props, ref) {
  const {
    definition,
    artwork = [],
    mode = 'static',
    size = 24,
    strokeWidth = 1.8,
    active = false,
    label,
    className,
    ...svgProps
  } = props;

  const classes = ['li-icon'];
  if (className) classes.push(className);

  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classes.join(' ')}
      data-mode={mode}
      data-active={active ? 'true' : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable={label ? undefined : false}
      {...svgProps}
    >
      {mode === 'animated' && renderArtLayers(artwork)}
      {renderParts(definition)}
    </svg>
  );
});

/** 按需导出：由单个定义生成不需要 name 的独立图标组件。 */
export function createIcon(definition: IconDefinition, artwork: readonly ArtLayer[] = []) {
  const SpecificIcon = forwardRef<SVGSVGElement, IconInstanceProps>(
    function SpecificIconComponent(props, ref) {
      return <DefinitionIcon ref={ref} definition={definition} artwork={artwork} {...props} />;
    },
  );
  SpecificIcon.displayName = definition.name;
  return SpecificIcon;
}
