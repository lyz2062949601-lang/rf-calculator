# 射频计算器（目前仅 pa）

在本地完成 **射频功放** 相关计算：记录频率与功率，自动算 **增益 (dB)**、**漏极效率 DE**、**功率附加效率 PAE**，并支持 **双纵轴图表** 与记录导出。当前版本：**1.0.0**。

适用对象：需要快速估算或整理测量数据的工程师、学生；**数据只保存在你的设备上**，不会上传到任何服务器。

---

## 怎么下载？

请到本仓库右侧 **「[Releases（发行版）](https://github.com/lyz2062949601-lang/rf-calculator/releases)」** 打开 **第一版 [v1.0.0](https://github.com/lyz2062949601-lang/rf-calculator/releases/tag/v1.0.0)**，在页面下方的 **Assets** 里按需下载：

| 你用的设备 | 请下载这个文件 | 说明 |
|------------|----------------|------|
| **Windows 电脑**（64 位，常见 Win10/11） | `RF-Calculator-PA-v1.0.0-Windows-x64-portable.exe` | 便携版，**不用安装**，下载后双击运行即可。 |
| **安卓手机 / 平板**（近几年多数新机） | `RF-Calculator-PA-v1.0.0-Android-arm64-debug.apk` | 安装包。若系统提示「未知来源」，请在设置里允许后再安装。 |
| **任意电脑、想离线用浏览器** | `RF-Calculator-PA-v1.0.0-web-offline.zip` | **解压**后，用浏览器打开文件夹里的 **`index.html`** 即可使用（可拷到 U 盘带走）。 |

> 若点开 v1.0.0 后还没有附件，说明维护者尚未上传；请稍后再试，或请维护者按页面最下方「给维护者」完成上传。

---

## 在线使用（免下载安装包）

若已开启 **GitHub Pages**，可直接在浏览器打开（无需下载 exe/apk）：

**[https://lyz2062949601-lang.github.io/rf-calculator/](https://lyz2062949601-lang.github.io/rf-calculator/)**

（若打不开，说明 Pages 未配置或地址随仓库改名而变化，请以仓库 **Settings → Pages** 里显示的网址为准。）

---

## 常见问题

- **Win 提示无法运行？** 若出现 SmartScreen，选「仍要运行」；本程序未做数字签名，属正常现象。  
- **安卓安装失败？** 请确认是 **ARM64** 机型；调试包仅供自用测试，未上架应用商店。  
- **网页版图表不显示？** 请用较新的 Chrome / Edge；解压网页包时保持 `index.html` 与同目录下的 `js`、`styles`、`vendor` 文件夹在一起。

---

## 致谢与署名

界面与说明文档归属 **丨江月**。计算与图表在本地完成，感谢使用。

---

## 给维护者（发布新版本时看）

源码在 **`www/`**，构建说明见 **`BUILD.txt`**。发布网页到 Pages 前执行：`scripts\sync-github-pages.cmd`（将 `www` 同步到 `docs`）。

将 **exe、apk、网页离线 zip** 上传到 GitHub **Releases** 的推荐方式：

1. 生成网页包：同步 `docs` 后，将 `docs` 内全部文件打成 zip，命名为 **`RF-Calculator-PA-v1.0.0-web-offline.zip`**（与 README 表格一致）。  
2. 在仓库根目录设置 **`GITHUB_TOKEN`**（需 `repo` 权限），执行：  
   `powershell -ExecutionPolicy Bypass -File scripts\publish-github-release.ps1`  
   脚本会创建 **v1.0.0** 的 Release 并上传三个附件；也可在 GitHub 网页上 **手动新建 Release** 并拖入同名三个文件。

大体积 **exe / apk** 不建议长期放在 Git 仓库根目录；以 **Releases** 为主下载入口即可。
