# 仓库结构说明

便于贡献者与维护者快速定位：**源码以何为准、何处可删改、何处勿提交**。

---

## 单一事实来源

| 路径 | 角色 |
|------|------|
| **`www/`** | **前端唯一源码**：HTML / CSS / JS / `vendor`。开发、改功能只改这里。 |
| **`electron-main.cjs`** | Electron 桌面壳（加载 `www/index.html`）。 |
| **`capacitor.config.json`** | Capacitor：`webDir` 指向 `www`。 |
| **`package.json`** | 版本号、`electron-builder` 与 npm 脚本。 |

---

## 与 `www/` 同步的目录（勿手改易覆盖）

| 路径 | 角色 |
|------|------|
| **`docs/`** | **GitHub Pages** 发布目录。内容与 `www/` 基本一致；另有 `readme-assets/`（README 用插图）。**更新 Pages：改完 `www/` 后执行 `scripts\sync-github-pages.cmd`。勿长期只在 `docs/` 改代码。** |
| **`android/app/src/main/assets/public`**（若存在） | `npx cap sync` 从 `www/` 复制而来；已被 `android/.gitignore` 忽略，不纳入版本控制。 |

---

## Android / Gradle

| 路径 | 角色 |
|------|------|
| **`android/`** | Capacitor Android 工程（Gradle、`MainActivity`、资源等）。`build/`、`.gradle/` 等已在 **`android/.gitignore`** 中忽略。 |

构建 APK：`BUILDING.md`、`build-apk-arm64.cmd`。

---

## 构建产物（一律不入库）

| 路径 | 说明 |
|------|------|
| **`dist/`** | electron-builder 输出 exe、`web-v3/` 等 — **根 `.gitignore`** |
| **`node_modules/`** | **根 `.gitignore`** |
| **`release/`** | **根 `.gitignore`**（备用输出目录） |

---

## `artifacts/`

仅保留 **`artifacts/README.md`** 等小文件，说明「用户应从 **Releases** 下载附件」。**不要将 `.exe` / `.apk` / `.zip` 等大文件提交进 Git**（已在 `.gitignore` 中排除）。

---

## 脚本（`scripts/`）

| 文件 | 用途 |
|------|------|
| `sync-github-pages.cmd` | 将 `www\*` 复制到 `docs\`，供 Pages 部署前提交。 |
| `env-china.cmd` | 国内镜像（npm / Electron / electron-builder）；由 `build-*.cmd` 调用。 |
| `patch-android.cjs` | `cap sync` 后为 Gradle/Maven 写镜像与超时（`npm run android:patch`）。 |
| `publish-github-release.ps1` | 上传 Release 资产（需 `GITHUB_TOKEN`）。 |
| `refresh-vendor-chart.cmd` | 刷新 `www/vendor` 内 Chart.js（按需）。 |

根目录 **`build-win.cmd` / `build-apk-arm64.cmd` / `build-all.cmd`**：一键构建 Windows / Android / 全部。

---

## 文档索引

| 文件 | 内容 |
|------|------|
| [README.md](README.md) | 用户面向：功能、下载、Pages、FAQ |
| [BUILDING.md](BUILDING.md) | 维护者构建与环境 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更记录 |
| [RELEASE_v1.2.0.md](RELEASE_v1.2.0.md) | v1.2 发行说明（可复制到 GitHub Release） |
| [BUILD.txt](BUILD.txt) | 跳转至 `BUILDING.md` |

---

## 许可证

见根目录 [LICENSE](LICENSE)。
