# 射频测试记录工具 — v1.2.0 发行说明

本文件供 **GitHub Release / 公告** 粘贴使用，概括 **v1.0.0 → v1.2.0** 的演进与本次发布要点。完整条款仍以仓库内 [CHANGELOG.md](CHANGELOG.md) 与 [README.md](README.md) 为准。

---

## v1.0.0（基线 · 回顾）

首个公开发行的能力概览：

| 类别 | 内容 |
|------|------|
| 形态 | Windows x64 便携 exe（Electron）、Android ARM64 调试 APK（Capacitor 6）、静态网页与 GitHub Pages（`docs/`） |
| PA 核心 | 测量输入、实时计算结果、双纵轴图表（Chart.js）、本会话记录表 |
| 数据 | 本地存储；记录导出 **CSV / Excel XML** |
| 外观 | 亮色 / 暗色 / 跟随系统；主题色与取色；字体缩放（无极调节） |

---

## 自 v1.0.0 至 v1.2.0 的累积更新（概述）

在保持「仅 PA 模块完整可用」的前提下，下列能力已合入主线（版本号在仓库中以 **1.2.0** 发布；中间迭代未单独打 `v1.1` 标签）：

| 方向 | 更新摘要 |
|------|------------|
| 产品与导航 | 产品名统一为 **「射频测试记录工具」**；增加 **工作台 Hub**（多射频类模块入口，除 PA 外为「开发中」占位） |
| 测量与算法 | **Pref / Pin → VSWR、回波损耗**；**P<sub>diss</sub>、ΔT（热阻 R<sub>th</sub>）** 等热相关估算；图表 VSWR 轴下限为 1 |
| 数据组织 | **多测试集**：新建、切换、本地持久化；表头 **排序**；**JSON 配置导入** |
| 交互与壳层 | 底栏 **Dock** 分页、窄屏滑动分页、**Toast** 提示；部分环境下 **导出下载兜底**（复制 JSON） |
| 字号与布局 | 字体由无极滑条改为 **小 / 标准 / 大 / 特大** 四档预设 |
| 各端差异 | **网页 / Windows**：测试集与字号在 PA **顶栏工具区**；**Android（APK）**：二者仅在 **「设置」页**，避免与原生习惯冲突 |
| Windows 包体 | 便携 exe 侧启用更高压缩并 **精简 Electron 语言包**（见下方 v1.2.0 说明），以减小下载体积 |

---

## v1.2.0（本次发布 · 相对近期主线）

### 新增

- **删除测试集**：与「新建」并列；删除前确认；**至少保留 1 个测试集**；删除后自动切换到剩余测试集并刷新记录与图表。

### 变更与优化

- **Windows 便携 exe**：`electron-builder` 使用 **maximum** 压缩，并仅打包 **en-US、zh-CN** 语言资源，在典型环境下可较早期包 **明显减小体积**（主体仍为 Electron 运行时）。
- **文档**：主 README 补充 **示意插图**（`docs/readme-assets/`）、**范例数据表** 与当前发行文件名说明。

### 文档与仓库

- [CHANGELOG.md](CHANGELOG.md) 已收录 **\[1.2.0\]** 条目。
- 构建与附件命名见 [BUILDING.md](BUILDING.md)。

---

## 下载与校验（维护者）

| 产物（示例文件名） | 说明 |
|--------------------|------|
| `RF-Calculator-PA-1.2.0-x64-portable.exe` | Windows 便携版 |
| `RF-Calculator-PA-v1.2.0-arm64-debug.apk` | Android ARM64 调试包 |
| `RF-Calculator-PA-v1.2.0-web-offline.zip` | 离线网页包（解压打开 `index.html`） |

大体积二进制 **勿提交入 Git**；请上传至 **[Releases](https://github.com/lyz2062949601-lang/rf-calculator/releases)** 的 **Assets**。

---

## 隐私说明（不变）

数据 **仅保存在用户本机**，不上传服务器。

---

**仓库：** [lyz2062949601-lang/rf-calculator](https://github.com/lyz2062949601-lang/rf-calculator) · **在线试用：** [GitHub Pages](https://lyz2062949601-lang.github.io/rf-calculator/)
