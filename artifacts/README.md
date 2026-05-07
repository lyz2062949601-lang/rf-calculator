# 安装包（放这里再提交）

把本机构建生成的文件**复制到此文件夹**后再 `git add` / `git push`，即可在 GitHub 网页上提供下载。

当前版本 **1.0.0** 建议文件名：

- `RF-Calculator-PA-1.0.0-x64-portable.exe` — Windows 便携版  
- `RF-Calculator-PA-v1.0.0-arm64-debug.apk` — Android ARM64 调试包  

来源一般为本地 `dist\` 下同名文件（与 `package.json` 的 `version`、`build.win.artifactName` 及 `build-apk-arm64.cmd` 一致）。

单个文件请小于 **100 MB**（GitHub 限制）。
