# 射频计算器（目前仅 PA）

[![Release](https://img.shields.io/github/v/release/lyz2062949601-lang/rf-calculator?style=flat-square)](https://github.com/lyz2062949601-lang/rf-calculator/releases)
[![License](https://img.shields.io/github/license/lyz2062949601-lang/rf-calculator?style=flat-square)](LICENSE)
[![Pages](https://img.shields.io/badge/GitHub-Pages-4285F4?style=flat-square)](https://lyz2062949601-lang.github.io/rf-calculator/)

在本地完成射频 **功率放大器（PA）** 相关计算：录入频率与功率后，自动计算 **增益 (dB)**、**漏极效率 DE**、**功率附加效率 PAE**，并提供 **双纵轴图表**、测量记录与 **CSV / Excel XML** 导出。当前版本 **1.0.0**。

**隐私：** 数据仅保存在你的设备上，不会上传到服务器。

---

## 功能一览

| 模块 | 说明 |
|------|------|
| 测量输入 | 频率（MHz / GHz 换算）、Pin / Pout / Pdc 多单位、步进微调、备注 |
| 计算结果 | 实时显示增益、DE、PAE 等 |
| 图表 | 横轴与双纵轴可选，支持导出 SVG |
| 设置 | 亮 / 暗 / 跟随系统、字体缩放、主题色与取色、记录管理 |

**技术栈：** 静态前端（`www/`）+ [Chart.js](https://www.chartjs.org/)（已内置 vendor）；Windows 为 [Electron](https://www.electronjs.org/)；Android 为 [Capacitor 6](https://capacitorjs.com/)。

---

## 下载安装

在 **[Releases（发行版）](https://github.com/lyz2062949601-lang/rf-calculator/releases)** 打开 **[v1.0.0](https://github.com/lyz2062949601-lang/rf-calculator/releases/tag/v1.0.0)**，在 **Assets** 中按需选择：

| 使用场景 | 文件名 | 说明 |
|----------|--------|------|
| Windows 10 / 11（64 位） | `RF-Calculator-PA-v1.0.0-Windows-x64-portable.exe` | 便携版，无需安装，双击运行 |
| Android（ARM64） | `RF-Calculator-PA-v1.0.0-Android-arm64-debug.apk` | 调试包；需在系统中允许安装未知来源应用 |
| 浏览器离线使用 | `RF-Calculator-PA-v1.0.0-web-offline.zip` | 解压后打开 **`index.html`** |

若 v1.0.0 页面尚无附件，请稍后再试或由维护者完成 [Releases 上传](#维护者与源码构建)。

---

## 在线使用（GitHub Pages）

无需安装包时，可在浏览器直接访问：

**<https://lyz2062949601-lang.github.io/rf-calculator/>**

若无法打开，请在仓库 **Settings → Pages** 确认已启用 **Branch `main` / folder `docs`**，并以页面显示的 URL 为准。

---

## 常见问题

| 现象 | 处理建议 |
|------|----------|
| Windows SmartScreen 拦截 | 选择「仍要运行」。可执行文件未做代码签名，属常见情况 |
| Android 无法安装 | 确认设备为 **ARM64**；调试包未上架应用商店 |
| 网页图表空白 | 使用较新版本 **Chrome** 或 **Edge**；解压离线包时勿拆开 `js`、`styles`、`vendor` 与 `index.html` 的相对位置 |

---

## 维护者与源码构建

- **源码目录：** `www/`  
- **构建说明：** [BUILDING.md](BUILDING.md)（原 `BUILD.txt` 仅作跳转）  
- **同步 Pages 静态文件：** 运行 `scripts\sync-github-pages.cmd`（将 `www` 复制到 `docs`）  
- **发布 Release 附件：** 见 [BUILDING.md](BUILDING.md) 中的「GitHub Releases 与附件命名」一节，或执行 `scripts/publish-github-release.ps1`（需 `GITHUB_TOKEN`）

**仓库目录速览**

| 路径 | 用途 |
|------|------|
| `www/` | 前端源码 |
| `docs/` | Pages 发布用静态站（由脚本同步） |
| `artifacts/` | 小体积校验文件说明，见 [artifacts/README.md](artifacts/README.md) |
| `android/` | Capacitor Android 工程 |
| `scripts/` | 同步、镜像、Release 等自动化脚本 |

---

## 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。

---

## 许可与致谢

- **许可证：** [MIT](LICENSE)  
- **界面与文档署名：** 丨江月  

感谢使用。
