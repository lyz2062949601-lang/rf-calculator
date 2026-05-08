# Changelog

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.2.0] — 2026-05-07

### 新增

- **删除测试集**：在「新建」旁增加删除当前测试集（至少保留 1 个，确认后删除并清空该集记录）。

### 变更

- **产品命名与 Hub**：统一为「射频测试记录工具」；工作台扩展多模块占位，仅 PA 可用。
- **字号**：改为小 / 标准 / 大 / 特大四档预设；Android 上测试集与字号仅在「设置」页。
- **Windows 便携 exe**：`electron-builder` 启用 **maximum** 压缩，并仅打包 **en-US、zh-CN** 语言资源以减小体积。

### 文档

- README 补充示意插图、范例数据表与 v1.2.0 下载文件名说明。

[1.2.0]: https://github.com/lyz2062949601-lang/rf-calculator/releases/tag/v1.2.0

## [1.0.0] — 2026-05-07

### 新增

- Windows x64 便携版（Electron）
- Android ARM64 调试包（Capacitor 6）
- 静态网页与 GitHub Pages 部署目录（`docs/`）
- 测量输入、实时结果、双纵轴图表（Chart.js）、本地记录与 CSV / Excel XML 导出
- 主题色、亮/暗/跟随系统、字体缩放、网页离线包

[1.0.0]: https://github.com/lyz2062949601-lang/rf-calculator/releases/tag/v1.0.0
