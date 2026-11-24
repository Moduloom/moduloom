/**
 * Loom Icons · 图标目录
 *
 * 从 collections 汇总全部图标定义，提供分类元数据与查找。
 * 集合作者只产出数据，无需感知运行时。
 */
import { essentialIcons } from './collections/essential.js';
import { extendedIcons } from './collections/extended.js';
import type { IconCategory, IconDefinition } from './types.js';

/** 全部图标定义（essential + extended）。保留字面量类型以推导 IconName。 */
export const iconDefinitions = [
  ...essentialIcons,
  ...extendedIcons,
] as const satisfies readonly IconDefinition[];

/** 目录中单个图标的精确类型（含字面量 id）。 */
export type CatalogIcon = (typeof iconDefinitions)[number];

/** 图标名联合类型，从 const 数据的 id 推导。 */
export type IconName = CatalogIcon['id'];

/** 分类中文元数据，顺序即目录展示顺序。 */
export const categories: readonly IconCategory[] = [
  { id: 'actions', label: '操作', description: '增删、确认、撤销等基础操作。' },
  { id: 'navigation', label: '导航', description: '页面与层级间的跳转、返回与定位。' },
  { id: 'files', label: '文件', description: '文件、文件夹与文档形态。' },
  { id: 'communication', label: '沟通', description: '消息、通知与提醒。' },
  { id: 'media', label: '媒体', description: '播放、音量与图像等多媒体控制。' },
  { id: 'people', label: '人物', description: '用户、账号与群组。' },
  { id: 'workspace', label: '工作区', description: '编辑、布局、看板等生产力元素。' },
  { id: 'content', label: '内容', description: '文本、列表与富内容块。' },
  { id: 'devices', label: '设备', description: '屏幕、外设与系统状态。' },
  { id: 'lifestyle', label: '生活', description: '时间、位置与日常事物。' },
];

const definitionById = new Map<string, CatalogIcon>(
  iconDefinitions.map((def) => [def.id, def]),
);

/** 按 id 查找图标定义。 */
export function getIconDefinition(id: string): CatalogIcon | undefined {
  return definitionById.get(id);
}
