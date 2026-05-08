# `artifacts/` 目录说明

本目录**仅用于存放可与仓库一同版本管理的说明类小文件**，用于指向正确的下载渠道。

## 用户从哪里下载？

请前往仓库的 **[Releases（发行版）](https://github.com/lyz2062949601-lang/rf-calculator/releases)**，在对应版本（例如 **v1.2.0**）的 **Assets** 中下载：

- Windows 便携可执行文件（`.exe`）
- Android 安装包（`.apk`）
- 网页离线包（`.zip`，解压后打开根目录 `index.html`）

**不要**依赖本仓库内对 `.exe` / `.apk` / `.zip` 的「Raw」下载作为主渠道。大体积附件以 **Releases** 为准；根目录 `.gitignore` 已忽略 `artifacts/*.exe`、`artifacts/*.apk`、`artifacts/*.zip`，避免误提交。

## 维护者本地打包输出

构建生成的 exe / apk / 离线 zip 请放在项目根目录的 **`dist/`**（已被忽略，不入库），再上传到 GitHub Releases。详见 [BUILDING.md](../BUILDING.md) 与 [REPO_LAYOUT.md](../REPO_LAYOUT.md)。
