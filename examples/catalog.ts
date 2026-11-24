import type {Entry} from 'loom-frame';

export const catalog: Entry[] = [{
  id: 'demo:button',
  name: 'Button',
  label: '按钮',
  kind: 'basic',
  group: '操作',
  package: 'loom-frame/ui',
  source: 'examples/renderer.tsx',
  description: '在工作台调整按钮内容和可用状态。',
  props: {label: '保存', disabled: false},
  fields: [{key: 'label', label: '文本', kind: 'text'}, {key: 'disabled', label: '禁用', kind: 'boolean'}],
}];
