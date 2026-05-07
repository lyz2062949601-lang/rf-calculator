# `artifacts/` 目录说明

本目录用于存放**体积小、便于与仓库一同版本管理**的辅助文件（例如网页离线包的副本）。

## 用户从哪里下载？

请前往仓库的 **[Releases（发行版）](https://github.com/lyz2062949601-lang/rf-calculator/releases)**，在对应版本（如 **v1.0.0**）的 **Assets** 中下载：

- Windows 便携可执行文件（`.exe`）
- Android 安装包（`.apk`）
- 网页离线包（`.zip`）

**不要**在本目录对 `.exe` / `.apk` 使用「Raw」下载作为主渠道；大体积安装包以 **Releases** 为准（亦见根目录 `.gitignore`）。

## 本目录中可能出现的文件

| 文件 | 说明 |
|------|------|
| `RF-Calculator-PA-v1.0.0-web-offline.zip` | 与 Releases 中「网页离线包」一致：解压后打开 `index.html` 即可离线使用 |
