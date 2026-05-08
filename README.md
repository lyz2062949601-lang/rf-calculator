# 射频测试记录工具

[![Release](https://img.shields.io/github/v/release/lyz2062949601-lang/rf-calculator?style=flat-square)](https://github.com/lyz2062949601-lang/rf-calculator/releases)
[![License](https://img.shields.io/github/license/lyz2062949601-lang/rf-calculator?style=flat-square)](LICENSE)
[![Pages](https://img.shields.io/badge/GitHub-Pages-4285F4?style=flat-square)](https://lyz2062949601-lang.github.io/rf-calculator/)

在本地完成射频 **功率放大器（PA）** 台架相关记录与计算：录入频率、功率与可选驻波/热阻后，自动得到 **增益**、**DE**、**PAE**、**VSWR**、**耗散功率** 与 **ΔT** 等，并提供 **双纵轴图表**、**多测试集**、**CSV / Excel XML** 导出。当前 **v1.2.0** 仅 **PA** 模块完整可用，Hub 中其他入口为「开发中」占位。

**隐私：** 数据仅保存在你的设备上，不会上传到服务器。

---

## 界面示意

| 工作台（多模块入口，仅 PA 可进） | 顶栏：测试集 + 字号（Web / Windows；APK 在「设置」页） |
|:--:|:--:|
| ![工作台示意](docs/readme-assets/hub-overview.svg) | ![顶栏与测试集示意](docs/readme-assets/pa-toolbar-session.svg) |

*上图为结构示意，非真实截图。*

---

## 功能一览

| 区域 | 说明 |
|------|------|
| 工作台 Hub | 常见射频类模块入口；除 PA 外标为开发中 |
| 测量输入 | 频率（MHz / GHz）、Pin / Pout / Pref / Pdc、热阻 Rth、步进微调、备注 |
| 计算结果 | 实时增益、DE、PAE、VSWR、回波损耗、P<sub>diss</sub>、ΔT |
| 图表 | 横轴与双纵轴可选，VSWR 轴下限为 1，可导出 SVG |
| 设置 | 亮 / 暗 / 跟随系统、主题取色、JSON 导入、记录导出与清空 |
| 测试集 | 新建、切换、**删除**（至少保留 1 个） |
| 字号 | 小 / 标准 / 大 / 特大 四档（非无极滑条） |

**技术栈：** 静态前端（`www/`）+ [Chart.js](https://www.chartjs.org/)（已内置 vendor）；Windows 为 [Electron](https://www.electronjs.org/)（便携 exe 启用 **最高压缩** 并 **裁剪 Electron 语言包** 以减小体积）；Android 为 [Capacitor 6](https://capacitorjs.com/)。

---

## 计算范例（说明用）

下列数值为**虚构示例**，便于对照表头含义（真实工况以你的仪器读数为准）。

| 项目 | 示例值 | 备注 |
|------|--------|------|
| 频率 | 2.45 GHz | 输入框可 MHz / GHz |
| P<sub>in</sub> | 10 dBm | |
| P<sub>out</sub> | 40 dBm | |
| P<sub>ref</sub> | −10 dBm（相对耦合） | 用于 Γ²=P<sub>ref</sub>/P<sub>in</sub> → VSWR |
| P<sub>DC</sub> | 45 W | |
| R<sub>th</sub> | 2.5 K/W | ΔT ≈ P<sub>diss</sub>×R<sub>th</sub> |

由此可得量级正确的 **增益 ≈ 30 dB**、效率类指标及 VSWR（视 Pref 与 Pin 是否合理而定）。应用内「保存到记录」后可在「计算结果 / 设置」查看表格并导出。

---

## 下载安装

在 **[Releases（发行版）](https://github.com/lyz2062949601-lang/rf-calculator/releases)** 打开最新版本（或 **[v1.2.0](https://github.com/lyz2062949601-lang/rf-calculator/releases/tag/v1.2.0)**），在 **Assets** 中按需选择：

| 使用场景 | 文件名（示例） | 说明 |
|----------|----------------|------|
| Windows 10 / 11（64 位） | `RF-Calculator-PA-1.2.0-x64-portable.exe` | 便携版，无需安装；若体积仍较大，主要为内置 Chromium 运行时属正常现象 |
| Android（ARM64） | `RF-Calculator-PA-v1.2.0-arm64-debug.apk` | 调试包；需在系统中允许安装未知来源应用 |
| 浏览器离线使用 | `RF-Calculator-PA-v1.2.0-web-offline.zip`（维护者打包） | 解压后打开 **`index.html`** |

若 Release 页面尚无附件，可由维护者完成 [源码构建](BUILDING.md) 与上传。

---

## 在线使用（GitHub Pages）

**<https://lyz2062949601-lang.github.io/rf-calculator/>**

请在仓库 **Settings → Pages** 确认 **Branch `main` / folder `docs`**（或以页面显示的 URL 为准）。

---

## 常见问题

| 现象 | 处理建议 |
|------|----------|
| Windows SmartScreen 拦截 | 选择「仍要运行」。未做代码签名时属常见情况 |
| exe 体积偏大 | 已启用 `compression: maximum` 与精简 `electronLanguages`；主体仍为 Electron 运行时 |
| Android 无法安装 | 确认设备为 **ARM64**；调试包未上架应用商店 |
| 网页图表空白 | 使用较新版本 **Chrome** 或 **Edge**；离线包勿拆开目录结构 |

---

## 维护者与源码构建

- **构建说明：** [BUILDING.md](BUILDING.md)  
- **同步 Pages：** 运行 `scripts\sync-github-pages.cmd`（将 `www` 复制到 `docs`）  
- **发布 Release：** 见 [BUILDING.md](BUILDING.md) 或 `scripts/publish-github-release.ps1`（需 `GITHUB_TOKEN`）

**仓库目录速览**

| 路径 | 用途 |
|------|------|
| `www/` | 前端源码 |
| `docs/` | Pages 静态站（含 Readme 用 `readme-assets/` 图示） |
| `artifacts/` | 校验说明，见 [artifacts/README.md](artifacts/README.md) |
| `android/` | Capacitor Android 工程 |
| `scripts/` | 同步、镜像、Release 等 |

---

## 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。

---

## 许可与致谢

- **许可证：** [MIT](LICENSE)  
- **界面与文档署名：** 丨江月  

感谢使用。
