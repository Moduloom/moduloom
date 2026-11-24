/**
 * Loom Icons · 动效样式唯一来源
 *
 * getMotionCss(usedMotions?) 生成 animated 模式的过渡样式；后续构建器
 * 从本文件生成对外发布的 styles.css。静态模式（无 data-mode="animated"）
 * 下所有选择器均不命中，无任何样式动作。
 *
 * 动效语言（参考 VoiceRoom Composer 的"线稿 → 上色"插画式响应）：
 * - 全部使用 CSS transition 回收，无 keyframes：hover 后停在稳定的上色插画，
 *   移出时沿原路平滑回到线稿，可重复播放。
 * - 根节点：enter 520ms cubic-bezier(.4,0,.2,1)，scale 1.06 + rotate 2deg，
 *   同时 color 切到 --li-art-ink（描边经 currentColor 跟随为墨色）。
 * - 画层（artwork.ts 生成）：纸底 scale .72 展开；彩底自底边 scaleY .08 展开，
 *   delay 100ms；细节层 scale 从 --li-detail-from（默认 .2）点亮，delay 230ms；
 *   高光描边 dashoffset 描出，delay 230ms。leave 时 delay 一律归 0。
 * - 部件 motion 标签仅映射极小的稳定响应（rotate 2~4deg / translate 0.4px /
 *   scale 1.04 / 眼部 scaleY 1.22），保证线稿始终完整可读、不脱节。
 * - 触发：图标自身 hover / focus-visible / data-active，或祖先 .li-trigger 的
 *   hover / focus-visible（不含 focus-within，避免点击后 hover 无法重播）。
 * - prefers-reduced-motion：整体回退静态外观（画层隐藏、根色还原）。
 */
import type { MotionName } from './types.js';

/** enter 过渡统一时长与缓动（参考 --vr-duration/ease-composer-action）。 */
const ENTER = '520ms cubic-bezier(0.4, 0, 0.2, 1)';

/** 图标自身触发动画的选择器。 */
const TRIGGER_SELF =
  '.li-icon[data-mode="animated"]:is(:hover, :focus-visible, [data-active="true"])';
/** 祖先 .li-trigger 触发动画的选择器（不用 focus-within）。 */
const TRIGGER_PARENT =
  '.li-trigger:is(:hover, :focus-visible) .li-icon[data-mode="animated"]';

/** 为一条部件规则生成“自身触发 + 父级触发”两组选择器。 */
function triggered(partSelector: string): string {
  return `${TRIGGER_SELF} ${partSelector},\n${TRIGGER_PARENT} ${partSelector}`;
}

/**
 * motion 标签 → 极小稳定响应。value 为 transform 值。
 * draw / check 不做部件变换：主轮廓永远原样，高光由画层负责。
 */
const PART_RESPONSE: Partial<Record<Exclude<MotionName, 'none'>, string>> = {
  swing: 'rotate(2deg)',
  spin: 'rotate(2.5deg)',
  turn: 'rotate(3deg)',
  wave: 'rotate(2deg)',
  nod: 'rotate(2deg)',
  flip: 'rotate(3deg)',
  fold: 'rotate(2deg)',
  float: 'translateY(-0.4px)',
  rise: 'translateY(-0.4px)',
  drop: 'translateY(0.4px)',
  bounce: 'translateY(-0.4px)',
  'slide-left': 'translateX(-0.4px)',
  'slide-right': 'translateX(0.4px)',
  scan: 'translateX(0.4px)',
  shake: 'translateX(0.4px)',
  orbit: 'translate(0.4px, -0.2px)',
  pop: 'scale(1.04)',
  pulse: 'scale(1.04)',
  ripple: 'scale(1.04)',
  spark: 'scale(1.04)',
  beat: 'scale(1.04)',
  shutter: 'scale(1.04)',
  'stretch-x': 'scaleX(1.04)',
  'stretch-y': 'scaleY(1.04)',
  blink: 'scaleY(1.22)',
  wink: 'scaleY(1.22)',
};

/**
 * 生成动画 CSS。
 * @param usedMotions 只输出这些 motion 标签的部件响应；缺省输出全部。
 */
export function getMotionCss(usedMotions?: readonly MotionName[]): string {
  const motions = usedMotions
    ? [...new Set(usedMotions.filter((m) => m !== 'none'))]
    : Object.keys(PART_RESPONSE);

  const chunks: string[] = [];

  // ── 基础 SVG 隔离（静态 / 动画共用，纯结构无动作） ──
  chunks.push(`/* Loom Icons runtime · li- namespace */
.li-icon {
  display: inline-block;
  vertical-align: middle;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* 画层默认调色。独立 SVG 文档中 :root 即 svg 根；宿主可在任意祖先覆盖。 */
:root {
  --li-art-paper: #f7f5ee;
  --li-art-ink: #45464a;
  --li-art-warm: #f5dc58;
  --li-art-cool: #9bc96d;
  --li-art-sky: #9bc96d;
  --li-art-leaf: #4f7748;
  --li-art-sun: #f7e4a1;
  --li-art-rose: #f08078;
}`);

  // ── 根节点：enter 抬升 + 墨色 ──
  chunks.push(`.li-icon[data-mode="animated"] {
  transform-origin: center;
  transition: transform ${ENTER}, color ${ENTER};
}
${TRIGGER_SELF},
${TRIGGER_PARENT} {
  transform: scale(1.06) rotate(2deg);
}
@media (prefers-reduced-motion: no-preference) {
  ${TRIGGER_SELF}, ${TRIGGER_PARENT} { color: var(--li-art-ink, #45464a); }
}`);

  // ── 画层：纸底 / 彩底 / 细节 / 高光，离开时 delay 归 0 ──
  chunks.push(`.li-icon[data-mode="animated"] .li-art-layer {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform ${ENTER}, opacity ${ENTER};
}
.li-icon[data-mode="animated"] .li-art-paper {
  fill: var(--li-art-paper, #f7f5ee);
  stroke: none;
  opacity: 0;
  transform: scale(0.72);
}
.li-icon[data-mode="animated"] .li-art-color {
  fill: var(--li-art-warm, #f5dc58);
  stroke: none;
  transform-origin: 50% 100%;
  opacity: 0;
  transform: scaleY(0.08);
}
.li-icon[data-mode="animated"] .li-art-detail {
  fill: var(--li-art-sun, #f7e4a1);
  stroke: none;
  opacity: 0;
  transform: scale(var(--li-detail-from, 0.2));
}
.li-icon[data-mode="animated"] .li-art-trace {
  fill: none;
  stroke: var(--li-art-paper, #f7f5ee);
  stroke-width: 1.2;
  stroke-dasharray: var(--li-dash, 64);
  stroke-dashoffset: var(--li-dash, 64);
  transition: stroke-dashoffset 230ms ease;
}
/* 进入延迟挂在触发态：移出回到基态时 delay 归 0，沿原路回收。 */
${triggered('.li-art-paper')} {
  opacity: 1;
  transform: scale(1);
}
${triggered('.li-art-color')} {
  opacity: 1;
  transform: scaleY(1);
  transition-delay: 100ms;
}
${triggered('.li-art-detail')} {
  opacity: 1;
  transform: scale(1);
  transition-delay: 230ms;
}
${triggered('.li-art-trace')} {
  stroke-dashoffset: 0;
  transition-delay: 230ms;
}`);

  // ── 部件：小响应过渡（原始线稿永远完整） ──
  const partRules: string[] = [];
  for (const motion of motions) {
    const response = PART_RESPONSE[motion as Exclude<MotionName, 'none'>];
    if (!response) continue;
    partRules.push(`${triggered(`.li-part.li-motion-${motion}`)} {\n  transform: ${response};\n}`);
  }
  chunks.push(`.li-icon[data-mode="animated"] .li-part {
  transform-box: view-box;
  transform-origin: var(--li-origin, 12px 12px);
  transition: transform 230ms cubic-bezier(0.4, 0, 0.2, 1), opacity 160ms ease;
}
${partRules.join('\n\n')}`);

  // ── 无障碍：跟随系统偏好整体回静态外观 ──
  chunks.push(`@media (prefers-reduced-motion: reduce) {
  .li-icon[data-mode="animated"],
  ${TRIGGER_SELF},
  ${TRIGGER_PARENT} {
    transform: none !important;
    transition: none !important;
  }
  .li-icon[data-mode="animated"] .li-part,
  .li-icon[data-mode="animated"] .li-art-layer {
    transform: none !important;
    transition: none !important;
  }
  .li-icon[data-mode="animated"] .li-art-layer {
    opacity: 0 !important;
    stroke-dashoffset: var(--li-dash, 64) !important;
  }
}`);

  return chunks.join('\n\n') + '\n';
}
