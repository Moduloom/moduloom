# Loom-Frame

组件预览框架与 Vite 插件，默认纯 Web。需要 Node 22.18+ 参与开发和构建；构建后的普通 Web 页面可静态部署，无 Rust 或 Node 后端。

## 让 AI 完成接入

随包交付的 [AGENTS.md](./AGENTS.md) 是给代码 Agent 的完整操作指南：理解接入项目、找到与提取真实组件、通用命名和分类、登记基础依赖、编写清单与渲染器、连接主题及交互，再启动 Loom。它不替代你的项目规范。

安装后执行 `npx loom init`，再把下面的任务交给 AI：

> 阅读 frame/AGENTS.md 和本项目现有文档，按指南理解并提取本项目的可复用组件库，接入 Loom。使用真实组件、样式和资源，补齐参数及交互回传，说明启动方法、覆盖范围与缺失依赖。

若已有接入文件，先沿用它们增量修改。`npx loom agents` 也可直接输出当前安装版本的指南。Android 的原生宿主和资源准备见指南的 Android 部分。

## 独立使用

~~~sh
npm install -D ./loom-frame-0.1.0.tgz
npx loom init
npx loom dev
npx loom build
npx loom serve
~~~

loom init 只创建缺失的 frame.config.ts 和 frame/AGENTS.md，不覆盖项目已有文件。loom open 与 serve 一样提供构建后的网页，并打开系统浏览器；不是桌面 EXE。退出命令进程即关闭本次开发/预览服务及其启动的插件运行时。

框架安装包已包含从独立 Loom UI 源码构建的控件与样式，不需要另装 loom-ui。普通第三方依赖仍需要从 registry 下载，此安装包不是完整离线环境。

## 换电脑接入 Android

在新的组件库项目中同时安装框架与插件两个本地包，然后初始化：

~~~sh
npm install -D ./loom-frame-0.1.0.tgz ./loom-frame-android-0.1.0.tgz
npx loom init
~~~

阅读生成的 frame/AGENTS.md 第 8 节和 @loom-frame/android 的 README，准备组件清单与匹配协议的原生预览宿主，再显式启用插件。本机需要 Node 22.18+；运行原生预览还需要 Android SDK、设备或模拟器及系统镜像，构建新的宿主需要对应项目的 JDK 与 Gradle 工具链。无需 Rust，也无需携带 VoiceRoom 组件库。

带模拟器的 `loom-frame-android-win32-x64-<version>.tgz` 可替代轻量 Android 插件包，导入名和配置保持不变。它自带运行预览所需的模拟器、ADB、镜像与干净 AVD 模板，接入方不用再安装 SDK 或 Java；构建宿主 APK 的工具链仍属于组件库项目。当前 Google APIs 镜像打包物限个人备份迁移，公开发行需准备允许分发的镜像，详见插件 README。

静态网页 ZIP 只提供已构建的页面，不能安装为 CLI 或直接增加原生组件。要开发新组件库，应安装上述 tgz；如需修改框架本身，再携带本仓库源码、锁文件和 workspace 配置，在新电脑重新安装依赖，不搬 node_modules、模拟器数据或本机缓存。

## 组件库接入

~~~ts
import type {FrameConfig} from 'loom-frame';
export default {
  name: '我的组件预览',
  storage: {namespace: 'my-components'},
  libraries: [{
    key: 'acme', name: 'ACME UI',
    catalog: './frame/catalog.ts',
    renderer: './frame/renderer.tsx',
    themeAdapter: './frame/theme.ts',
    packages: ['@acme/ui'], sourceRoots: ['src/components'],
    styles: ['@acme/ui/styles.css'],
  }],
  plugins: [],
} satisfies FrameConfig;
~~~

~~~ts
// frame/catalog.ts：普通可序列化数据，使用 type import。
import type {Entry} from 'loom-frame';
export const catalog: Entry[] = [{
  id: 'acme:button', name: 'Button', label: '按钮', group: '操作',
  kind: 'basic', description: '触发调用方提供的操作。',
  package: '@acme/ui', source: 'src/components/Button.tsx',
  props: {children: '继续', disabled: false},
  fields: [
    {key:'children',label:'文字',kind:'text'},
    {key:'disabled',label:'禁用',kind:'boolean'},
  ],
}];
~~~

~~~tsx
// frame/renderer.tsx
import type {LibraryRenderer} from 'loom-frame';
import {Button} from '@acme/ui';
import '@acme/ui/styles.css';
export const renderer: LibraryRenderer = {
  render: ({entry,props,onPatch}) => {
    if(entry.id !== 'acme:button') throw new Error('未登记预览实现');
    return <Button disabled={Boolean(props.disabled)}>{String(props.children)}</Button>;
  },
  applyTheme: (theme,tokens) => {
    document.documentElement.dataset.theme=theme.mode;
    for(const [key,value] of Object.entries(tokens)) {
      document.documentElement.style.setProperty(key,value);
    }
  },
};
~~~

@acme/ui 是示例中的接入方组件库，本包不提供它。渲染器必须实际导入组件、样式和图片；清单模块及其数据依赖使用带扩展名的 ESM 导入。options 是选项值，显示名由 field.optionLabels 声明，动态列表由 field.optionsFrom 指定。packages / sourceRoots / styles 是清单与用法生成的元信息，不会自动导入源码。交互控件使用 onPatch(key,value) 将变化回写参数面板。

themeAdapter 是可选的纯主题导出模块：只导出 `themeAdapter: LibraryThemeAdapter`（`exportCss(theme, tokens) => string`），与渲染器分离，不允许 import 预览 CSS。工作台用它生成「样式变量」可复制 CSS；未声明的库只能导出已声明的 tokens。场景高亮要求渲染器把当前组件根节点标注 `data-scene-target`（外层可加 `data-preview-wrapper` + `display:contents` 的无布局包装）；未标注的场景页不会标记任何元素。

FrameLibrary.preview 可声明 viewport、persistent、scene、states、highlight 等能力。框架只读取能力，不根据组件库 key 判断平台。只有显式 scene:true 且提供 renderScene 时才应开放场景入口。组件 ID 的 library:component 命名空间独立于运行时插件。

## 插入已有 Vite 项目

~~~ts
// vite.config.ts；沿用项目自己的 React / Tailwind 插件。
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import {framePlugin} from 'loom-frame/vite';
import frameConfig from './frame.config';
export default defineConfig(async () => ({
  plugins: [react(),tailwind(),await framePlugin(frameConfig)],
}));
~~~

开发时访问 /__frame/。原应用入口保留；构建时在原应用输出中生成 __frame/index.html 和 __frame/preview.html。框架适配不改写业务源码。可通过 framePlugin 的 base 选项更换挂载路径。服务器子路径部署时应让挂载路径与外部访问路径保持一致。

独立构建可在 frame.config.ts 中配置 base，默认相对资源路径。文件通过 HTTP/HTTPS 提供；不支持直接用 file:// 打开。

## 插件与存储接口

FrameConfig.plugins 显式登记插件。只有 enabled:true 的插件才会进入浏览器清单；没有启用的插件既不加载客户端模块，也不启动运行时；依赖该插件的组件库也不会读取清单或打入页面。客户端模块导出 plugin，可提供 Toolbar、StyleEditor、usageCode。客户端可使用 loom-frame/client 的 runtimeUrl(key,path) 访问由开发/预览服务代理的可选 sidecar。

运行时插件适用于可信本地项目；配置文件和渲染器本身是可执行代码。同源 iframe 用于样式隔离，不是运行不可信代码的沙箱。生产静态站点不会启动 sidecar；Android 等插件需要本地预览命令或自行部署运行时代理。

默认存储为 IndexedDB。storage.adapter 可指向导出 storage: FrameStorage 的浏览器模块，包含 readThemes、writeThemes、listConfigurations、saveConfiguration 四个方法。适配器负责自己的登录、权限和网络策略，核心不提供账号或远程 API。

组件参数和主题以 JSON 单独复制。loom lookup <id> 读取构建输出 components.json；修改源码后使用 loom dev 热更新，或重新 loom build。

npm 包含通用工作台源码、SDK、Vite 插件、CLI、接入规范及内置 UI 编译产物；不含 Rust、EXE、被预览组件库或原生资源。源码采用 GPL v3。

框架界面唯一依赖链是 loom-frame → loom-ui。共享控件由独立 loom-ui 源码构建，框架和插件通过 loom-frame/ui 使用同一份编译产物，框架只保留目录、参数编辑、主题和预览等业务编排及页面布局。UI 的预览适配是私有应用，不是 UI 包依赖。
