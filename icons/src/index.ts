/**
 * Loom Icons · 入口
 *
 * React 使用者额外引入一次构建出的 styles.css（由 motion.ts 生成）即可启用动画。
 */
export { Icon, createIcon, getIconSvg } from './runtime.js';
export type { IconProps, GetIconSvgOptions, IconInstanceProps } from './runtime.js';
export {
  iconDefinitions,
  categories,
  getIconDefinition,
  type CatalogIcon,
  type IconName,
} from './catalog.js';
export { getMotionCss } from './motion.js';
export type {
  MotionName,
  IconCategoryId,
  IconCategory,
  IconDefinition,
  IconPart,
} from './types.js';
