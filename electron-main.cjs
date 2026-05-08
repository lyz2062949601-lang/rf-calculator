"use strict";

const { app, BrowserWindow } = require("electron");
const path = require("path");

/** 与 package.json 中 ASCII productName 区分：exe 文件名用英文，窗口标题用中文 */
const APP_TITLE_ZH = "射频测试记录工具 · PA";

function createWindow() {
  const win = new BrowserWindow({
    width: 1040,
    height: 880,
    minWidth: 640,
    minHeight: 560,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.once("ready-to-show", () => {
    win.setTitle(APP_TITLE_ZH);
    win.show();
  });
  win.loadFile(path.join(__dirname, "www", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
