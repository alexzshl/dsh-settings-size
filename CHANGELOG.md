# Changelog

本项目的所有重要变更都记录在此文件。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.4] - 2026-09-21

为插件补上**显式的 DSH 版本兼容声明**：把"升级 DSH 后莫名不工作"提前为"启动时明确的版本冲突告警"。

### 新增

- **DSH 兼容范围声明**：`package.json` 的 `peerDependencies` 增加 `"@deepseek-ai/dsh": "^0.1.0"`。
  DSH 启动时由 `dsh-app-boot` 的 `evaluatePluginCompatibility` 读取，并用
  `semver.satisfies(runtime, range, { includePrerelease: true })` 校验；不满足时输出插件名、插件版本
  与运行版本，不再等到运行期才失败。
- README 新增「版本兼容性」小节：列出已手动验证的 DSH 版本，说明插件只依赖稳定契约，并给出反馈路径。

### 说明

- 兼容性声明**只能**写在 `peerDependencies`。`dsh-app-boot` 只扫描 `@deepseek-ai/dsh` 与
  `@deepseek-ai/dsh-*` 开头的 peer；`cordis.yml` / `cordis.patch.yml` 里的自定义字段不会被读取，
  多塞一个键只会让 loader 告警并跳过该条目。

## [0.1.3] - 2026-09-21

### 新增

- **中英双语**：设置行文案接入 DSH 的 `locale` 服务（命名空间 `settings.size`），跟随 DSH 语言自动切换。
- README 增加中文 / 英文界面截图。

### 变更

- **移除「恢复默认」按钮**：「标准 800×800」预设已覆盖同一功能，该按钮属于冗余。

## [0.1.2] - 2026-09-21

首个带 tag 的发布。

### 修复

- **预设选中态**：React 内联样式在 `border` 简写与 `borderColor` 长写之间切换时，取消选中只会清掉长写，
  留下 `border-width/style` 并把颜色回退到 `currentColor`——表现为每点一次预设就永久多一条边框。
  两个状态改用同一个属性名后解决。
- **「恢复默认」语义**：此前回到插件的初始尺寸 1080×900，改为回到 DSH 原生的 800×800。

### 变更

- 预设药丸的边框处理对齐官方「外观」卡：未选中为 `.5px` 细边框，选中换亮边框并加底色。
- README 结构调整：安装 / 卸载提到简介之后，深挖内容折叠为 `<details>`。

## [0.1.0] – [0.1.1] - 2026-09-21

初始开发阶段，未单独打 tag。

### 新增

- **设置 → 通用** 增加「设置弹框尺寸」行：四档预设（标准 / 大 / 超大 / 近全屏）+ 宽高双滑块，拖动实时生效。
- **同时放开两层宽度限制**：设置面板本身（shipped 硬编码 800×800）与各分区内容列（720–760px）。
  只放大面板的话，多出的宽度会是一片空白。
- 尺寸写入 `localStorage`（键 `dsh-settings-size:size`），刷新后保留。
- 工程化：双面包结构（host no-op + browser bundle）、中英双 README、MIT 许可、`dsh-plugin` topic。

[0.1.4]: https://github.com/alexzshl/dsh-settings-size/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/alexzshl/dsh-settings-size/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/alexzshl/dsh-settings-size/releases/tag/0.1.2
