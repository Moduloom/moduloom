import type {FrameConfig} from 'loom-frame';

export default {
  name: 'Moduloom',
  outDir: 'dist/demo',
  storage: {namespace: 'moduloom-demo'},
  libraries: [{
    key: 'demo',
    name: '示例组件',
    catalog: './examples/catalog.ts',
    renderer: './examples/renderer.tsx',
    sourceRoots: ['./examples'],
  }],
} satisfies FrameConfig;
