# 构建与发布说明

面向在本机**从源码打包**的维护者。终端命令以 **Windows** 为例。

---

## 仓库结构（与构建相关）

| 路径 | 说明 |
|------|------|
| `www/` | 前端源码（HTML / CSS / JS），Electron 与 Capacitor 共用 |
| `docs/` | 同步自 `www/`，供 **GitHub Pages** 发布 |
| `electron-main.cjs` | Windows 桌面壳入口 |
| `android/` | Capacitor Android 工程 |
| `dist/` | 本地构建输出（已 `.gitignore`，不入库） |
| `scripts/` | 同步、国内镜像、Release 上传等脚本 |

---

## 环境要求

| 目标 | 要求 |
|------|------|
| **npm / Node.js** | LTS；用于 Electron、Capacitor CLI |
| **Windows 便携 exe** | 仅 Windows x64；`build-win.cmd` 会调用 `npm install` 与 `electron-builder` |
| **Android APK** | **JDK 17 或 21**、`ANDROID_HOME` / `ANDROID_SDK_ROOT`、已接受 `sdkmanager --licenses`；`build-apk-arm64.cmd` 会调用 Gradle |

---

## 国内网络与镜像

1. 根目录 **`.npmrc`**：`registry=https://registry.npmmirror.com`  
2. **`scripts/env-china.cmd`**（由 `build-*.cmd` 调用）：设置 `NPM_CONFIG_REGISTRY`、`ELECTRON_MIRROR`、`ELECTRON_BUILDER_BINARIES_MIRROR` 等  
3. **`npm run android:patch`**（`scripts/patch-android.cjs`）：在 `cap sync` 后为 Gradle / Maven 写入国内镜像与超时配置  

Android **SDK 本体**仍由本机 Android Studio 或 sdkmanager 安装；仓库只保证 npm / Electron / Gradle 侧镜像。

---

## 常用命令

| 操作 | 命令 |
|------|------|
| 安装依赖 | `npm install` |
| 本地桌面调试 | `npm start` |
| **仅 Windows 便携 exe + 拷贝 `www` → `dist/web-v3`** | `build-win.cmd` |
| **仅 Android 调试 APK** | `build-apk-arm64.cmd` |
| **exe + APK + 网页目录** | `build-all.cmd` |
| 同步网页到 `docs/`（提交前、发 Pages 前） | `scripts\sync-github-pages.cmd` |
| 本地起静态服务预览 `www` | `start-server.cmd` → <http://localhost:8080> |

---

## 构建产物（`dist/`）

| 产物 | 说明 |
|------|------|
| `RF-Calculator-PA-<version>-x64-portable.exe` | Windows 便携版；`package.json` 的 `build.win.artifactName` |
| `web-v3/` | `www/` 的完整拷贝，便于随发行物分发 |
| `RF-Calculator-PA-v1.2.0-arm64-debug.apk` 等 | 由 `build-apk-arm64.cmd` 从 `app-debug.apk` 复制；升级版本时请同步 **Android `versionName` / `versionCode`**、`package.json` 版本与脚本中的目标文件名 |

`build-win.cmd` 会在成功后删除 `dist/win-unpacked`，并重建 `dist/web-v3/`。

---

## GitHub Releases 与附件命名

用户下载以 **Releases** 为准；**不要将大体积 exe/apk 提交进 Git**（见根目录 `.gitignore`）。

1. 执行 `scripts\sync-github-pages.cmd` 后，将 `docs/` 打 zip，命名为 **`RF-Calculator-PA-v1.2.0-web-offline.zip`**（与主 README 表格一致；版本号随发布递增）。  
2. 设置环境变量 **`GITHUB_TOKEN`**（需 `repo` 权限），在仓库根目录执行：  
   `powershell -ExecutionPolicy Bypass -File scripts\publish-github-release.ps1`  
   亦可于 GitHub 网页手动创建 Release 并上传同名附件。

---

## 故障排查（APK 构建失败）

- 仅安装 **Java 8**：Gradle / AGP 8.x 需要 **JDK 11+**，推荐 **OpenJDK 21**（如 `winget install Microsoft.OpenJDK.21`）  
- 未配置 **ANDROID_HOME** 或未接受 SDK 许可  
- 保留 `android/` 下完整 Gradle 日志便于对照上文逐项排查  

---

## 第三方资源

- **Chart.js**：`www/vendor/chart.umd.min.js`，离线可用；更新见 `scripts/refresh-vendor-chart.cmd`
