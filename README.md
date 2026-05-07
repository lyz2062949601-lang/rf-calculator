# 射频计算器（目前仅pa）

本地计算功放增益、DE、PAE，支持图表与导出。当前版本 **1.0.0**。归属 **丨江月**。

> GitHub 仓库若仍使用旧英文名（如 `rf-calculator`），可在仓库 **Settings → General → Repository name** 中改名为「射频计算器（目前仅pa）」等；应用内与网页标题已统一为「射频计算器（目前仅pa）」。

## 仓库里三块内容

| 目录 | 用途 |
|------|------|
| **`docs/`** | **网页版**（静态文件）。给 **GitHub Pages** 用，打开后浏览器里直接用。 |
| **`artifacts/`** | **Windows 便携 exe**、**Android APK**。把本机构建好的文件复制到这里再提交，别人在 GitHub 上点「下载」即可。 |
| **`www/`** 等 | 完整工程源码；自己改功能、本地打包仍用 `BUILD.txt`。 |

网页与源码是同一套界面：发布前用脚本把 `www` 同步到 `docs`（见下）。

---

## 新手：推到 GitHub 的三步

### 1. 同步网页到 `docs/`（提交前做一次）

在项目根目录双击或在终端执行：

```bat
scripts\sync-github-pages.cmd
```

会把 `www\` 全部复制到 `docs\`，保证线上和本地网页一致。

### 2. 把 exe、apk 放进 `artifacts/`

本地打完包后（见 `BUILD.txt`），将例如：

- `dist\RF-Calculator-PA-1.0.0-x64-portable.exe`
- `dist\RF-Calculator-PA-v1.0.0-arm64-debug.apk`

**复制到** `artifacts\` 文件夹（可与仓库里已有同名文件覆盖）。

### 3. 提交并推送

```bat
git add docs artifacts README.md BUILD.txt
git commit -m "Release 1.0.0: 射频计算器（目前仅pa）"
git push
```

第一次建仓库时，在 GitHub 网页创建空仓库后按提示 `git remote add origin ...` 再 `push`。

---

## 打开 GitHub Pages（网页地址）

1. 打开 GitHub 上该仓库 → **Settings** → **Pages**。  
2. **Build and deployment** → **Source**：**Deploy from a branch**。  
3. **Branch**：`main`，文件夹选 **`/docs`** → **Save**。  
4. 等约 1 分钟，页面会显示站点地址，一般为：

   **`https://你的用户名.github.io/仓库名/`**

若仓库名是 **`你的用户名.github.io`** 且用 `docs`，则站点在子路径，以 GitHub 提示为准。

---

## 别人怎么下 exe / apk

在仓库里打开 **`artifacts/`** 目录，点击对应文件名 → **Download raw file**（或 Raw）。  
也可在仓库首页 **README** 里自己加直达链接，例如：

`https://github.com/用户名/仓库名/raw/main/artifacts/RF-Calculator-PA-1.0.0-x64-portable.exe`

（路径以你实际上传的文件名为准。）

---

## 不要提交的大文件（已写在 `.gitignore`）

`node_modules/`、`dist/` 构建缓存等不必进仓库；**网页只提交 `docs/`，安装包只提交 `artifacts/` 里你复制进去的那几个文件**。
