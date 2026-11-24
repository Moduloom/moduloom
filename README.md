<img src="frame/assets/frame.svg" width="52" alt="Moduloom 标志">

# Moduloom

**React 组件库的浏览器工作台。**

把组件放进实际场景预览，实时调整参数、对比深浅主题，并导出验证过的配置。

![Moduloom 工作台中的组件场景与参数面板](docs/preview.png)

## 试用

需要 Node.js 22.18+ 和 pnpm 11。

```sh
git clone --recurse-submodules https://github.com/Moduloom/moduloom.git
cd moduloom
pnpm install --frozen-lockfile
pnpm demo
```

打开 [本地工作台](http://127.0.0.1:4321/)。示例会加载一个可调参数的按钮，可以直接改文字或禁用状态。

## 接入自己的组件库

在 `frame.config.ts` 中注册组件清单和预览渲染器，然后运行 `pnpm dev`。配置和接口示例见 [接入指南](frame/README.md)。

工作台使用 [Loom UI](https://github.com/Moduloom/loom-ui)。完整的产品界面预览可见 [BetterGI Web UI](https://github.com/Moduloom/bettergi-web-ui)。

## 许可证

[GPL v3](LICENSE)
