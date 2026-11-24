/**
 * Loom Icons · 数据合同
 *
 * collections/ 下的集合只依赖本文件的类型；
 * 运行时（runtime.tsx / motion.ts / catalog.ts）负责把数据渲染成 SVG 与动画。
 */

/** 每个图元部件可用的动作名。none 表示静止。 */
export type MotionName =
  | 'none'
  | 'draw'
  | 'pop'
  | 'float'
  | 'swing'
  | 'spin'
  | 'turn'
  | 'rise'
  | 'drop'
  | 'slide-left'
  | 'slide-right'
  | 'stretch-x'
  | 'stretch-y'
  | 'blink'
  | 'wink'
  | 'pulse'
  | 'ripple'
  | 'orbit'
  | 'shutter'
  | 'nod'
  | 'bounce'
  | 'shake'
  | 'flip'
  | 'wave'
  | 'check'
  | 'scan'
  | 'fold'
  | 'spark'
  | 'beat';

/** 图标分类，与 catalog.ts 中 categories 元数据的顺序一致。 */
export type IconCategoryId =
  | 'actions'
  | 'navigation'
  | 'files'
  | 'communication'
  | 'media'
  | 'people'
  | 'workspace'
  | 'content'
  | 'devices'
  | 'lifestyle';

/** 单个图元部件。body 只包含可信的原始 SVG 图元字符串（模块数据，非外部输入）。 */
export interface IconPart {
  id: string;
  /** 原始 SVG 图元（path/circle/rect/line/polyline/polygon/ellipse/g）。 */
  body: string;
  motion: MotionName;
  /** transform-origin，CSS 值，如 "12px 12px"。 */
  origin?: string;
  /** 动画延迟，毫秒。 */
  delay?: number;
  /** 动画时长，毫秒。 */
  duration?: number;
  /** accent：hover 时使用 --li-accent；fill：hover 时淡填色；默认单色线条。 */
  tone?: 'accent' | 'fill';
}

/** 单枚图标的完整定义。 */
export interface IconDefinition {
  id: string;
  /** Pascal 命名，不带 Icon 后缀。 */
  name: string;
  /** 中文短标签。 */
  label: string;
  category: IconCategoryId;
  tags: readonly string[];
  description: string;
  parts: readonly IconPart[];
}

/** 分类中文元数据。 */
export interface IconCategory {
  id: IconCategoryId;
  label: string;
  description: string;
}
