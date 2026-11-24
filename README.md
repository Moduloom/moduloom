# Moduloom

用一个浏览器工作台预览和调试你的组件库。基于 React 和 Vite，支持交互预览、主题切换和配置导出。

![Moduloom 组件工作台](docs/preview.png)

## 快速开始

需要 Node.js 22.18+ 和 pnpm 11。

~~~sh
git clone --recurse-submodules https://github.com/Moduloom/moduloom.git
cd moduloom
pnpm install --frozen-lockfile
pnpm dev
~~~

打开 [127.0.0.1:4321](http://127.0.0.1:4321/)，通过 [frame.config.ts](frame.config.ts) 注册组件库，或者运行 pnpm demo 试用示例。

[接入指南](frame/README.md) · [Loom UI](https://github.com/Moduloom/loom-ui) · [BetterGI UI](https://github.com/Moduloom/bettergi-ui) · [GPL v3](LICENSE)
