"use strict";

/**
 * 1) compileSdk / targetSdk（variables.gradle）
 * 2) 仅打包 arm64-v8a（app/build.gradle）
 * 3) Gradle Wrapper → 腾讯云分发
 * 4) settings.gradle → pluginManagement 仅阿里云（解析 Gradle 插件）
 * 5) 根 build.gradle → buildscript / allprojects 仅阿里云（去掉 google/mavenCentral 直连海外）
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const variablesGradle = path.join(root, "android", "variables.gradle");
const appBuildGradle = path.join(root, "android", "app", "build.gradle");
const wrapperProps = path.join(root, "android", "gradle", "wrapper", "gradle-wrapper.properties");
const rootBuildGradle = path.join(root, "android", "build.gradle");
const settingsGradle = path.join(root, "android", "settings.gradle");

const MARKER_GRADLE = "国内镜像（patch-android）";
const MARKER_SETTINGS = "国内源 pluginManagement（patch-android）";
const MARKER_DOMESTIC_ONLY = "仅用国内源";

function patchGradleWrapper() {
  if (!fs.existsSync(wrapperProps)) {
    console.warn("patch-android: 无 gradle-wrapper.properties，跳过");
    return;
  }
  let s = fs.readFileSync(wrapperProps, "utf8");
  const orig = s;
  if (!s.includes("mirrors.cloud.tencent.com/gradle")) {
    const m = s.match(/gradle-([\d.]+)-(all|bin)\.zip/);
    const ver = m ? m[1] : "8.2.1";
    const kind = m && m[2] === "bin" ? "bin" : "all";
    const newLine = `distributionUrl=https\\://mirrors.cloud.tencent.com/gradle/gradle-${ver}-${kind}.zip`;
    s = s.replace(/distributionUrl=.*(\r?\n)/, newLine + "$1");
    console.log(`patch-android: gradle-wrapper → 腾讯云 Gradle ${ver}-${kind}`);
  } else {
    console.log("patch-android: gradle-wrapper 已是腾讯云源");
  }
  s = s.replace(/networkTimeout=\d+/, "networkTimeout=120000");
  s = s.replace(/validateDistributionUrl\s*=\s*true/, "validateDistributionUrl=false");
  if (s !== orig) {
    fs.writeFileSync(wrapperProps, s);
    console.log("patch-android: gradle-wrapper → networkTimeout=120000，validateDistributionUrl=false");
  }
}

function patchSettingsGradle() {
  if (!fs.existsSync(settingsGradle)) {
    console.warn("patch-android: 无 settings.gradle，跳过");
    return;
  }
  let s = fs.readFileSync(settingsGradle, "utf8");
  if (s.includes(MARKER_SETTINGS)) {
    console.log("patch-android: settings.gradle 已含国内 pluginManagement");
    return;
  }
  const head =
    "// " +
    MARKER_SETTINGS +
    "\n" +
    "pluginManagement {\n" +
    "    repositories {\n" +
    "        maven { url 'https://maven.aliyun.com/repository/google' }\n" +
    "        maven { url 'https://maven.aliyun.com/repository/central' }\n" +
    "        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }\n" +
    "        maven { url 'https://maven.aliyun.com/repository/public' }\n" +
    "    }\n" +
    "}\n\n";
  fs.writeFileSync(settingsGradle, head + s);
  console.log("patch-android: settings.gradle → 已添加 pluginManagement（仅阿里云）");
}

function patchRootBuildGradle() {
  if (!fs.existsSync(rootBuildGradle)) {
    console.warn("patch-android: 无 android/build.gradle，跳过 Maven 镜像");
    return;
  }
  let g = fs.readFileSync(rootBuildGradle, "utf8");

  const inject =
    "        // " +
    MARKER_GRADLE +
    "\n" +
    "        maven { url 'https://maven.aliyun.com/repository/google' }\n" +
    "        maven { url 'https://maven.aliyun.com/repository/central' }\n" +
    "        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }\n" +
    "        maven { url 'https://maven.aliyun.com/repository/public' }\n";

  if (!g.includes(MARKER_GRADLE)) {
    const reBuildscript = /(buildscript\s*\{\s*repositories\s*\{\s*\n)(\s*)google\(\)/;
    const reAllprojects = /(allprojects\s*\{\s*repositories\s*\{\s*\n)(\s*)google\(\)/;
    let n = 0;
    if (reBuildscript.test(g)) {
      g = g.replace(reBuildscript, "$1" + inject + "$2google()");
      n++;
    }
    if (reAllprojects.test(g)) {
      g = g.replace(reAllprojects, "$1" + inject + "$2google()");
      n++;
    }
    if (n === 0) {
      console.warn("patch-android: 未匹配到 buildscript/allprojects 的 repositories");
    } else {
      console.log("patch-android: build.gradle → 已前置阿里云 Maven");
    }
  }

  if (!g.includes(MARKER_DOMESTIC_ONLY)) {
    const strip = new RegExp(
      "(maven \\{ url 'https:\\/\\/maven\\.aliyun\\.com\\/repository\\/public' \\}\\s*\\n)\\s*google\\(\\)\\s*\\n\\s*mavenCentral\\(\\)",
      "g"
    );
    const stripped = g.replace(
      strip,
      "$1        // " +
        MARKER_DOMESTIC_ONLY +
        "：已移除 google() 与 mavenCentral() 直连\n"
    );
    if (stripped !== g) {
      g = stripped;
      console.log("patch-android: build.gradle → 已移除 google()/mavenCentral()，依赖仅走阿里云");
    }
  }

  fs.writeFileSync(rootBuildGradle, g);
}

let sdkOk = false;
let abiOk = false;

if (fs.existsSync(variablesGradle)) {
  let s = fs.readFileSync(variablesGradle, "utf8");
  const compileSdk = 35;
  const targetSdk = 35;
  s = s.replace(/compileSdkVersion\s*=\s*\d+/g, `compileSdkVersion = ${compileSdk}`);
  s = s.replace(/targetSdkVersion\s*=\s*\d+/g, `targetSdkVersion = ${targetSdk}`);
  fs.writeFileSync(variablesGradle, s);
  console.log(`patch-android: variables.gradle → compileSdk/targetSdk = ${compileSdk}`);
  sdkOk = true;
} else {
  console.warn("patch-android: 跳过 SDK（未找到 android/variables.gradle，请先 npx cap add android）");
}

if (fs.existsSync(appBuildGradle)) {
  let g = fs.readFileSync(appBuildGradle, "utf8");
  if (/abiFilters\s*\(?/.test(g) && /arm64-v8a/.test(g)) {
    console.log("patch-android: app/build.gradle 已含 arm64-v8a abiFilters");
    abiOk = true;
  } else if (/ndk\s*\{/.test(g) && /abiFilters/.test(g)) {
    if (!/arm64-v8a/.test(g)) {
      g = g.replace(/abiFilters[^\n]*/, "abiFilters 'arm64-v8a'");
      fs.writeFileSync(appBuildGradle, g);
      console.log("patch-android: app/build.gradle → abiFilters 设为 arm64-v8a");
      abiOk = true;
    }
  } else {
    const needle = /defaultConfig\s*\{/;
    if (!needle.test(g)) {
      console.warn("patch-android: 无法在 app/build.gradle 中找到 defaultConfig");
    } else {
      g = g.replace(needle, function (m) {
        return (
          m +
          "\n        ndk {\n            abiFilters 'arm64-v8a'\n        }"
        );
      });
      fs.writeFileSync(appBuildGradle, g);
      console.log("patch-android: app/build.gradle → 已注入 ndk { abiFilters 'arm64-v8a' }（仅 ARM64）");
      abiOk = true;
    }
  }
} else {
  console.warn("patch-android: 跳过 ABI（未找到 android/app/build.gradle）");
}

patchGradleWrapper();
patchSettingsGradle();
patchRootBuildGradle();

process.exit(0);
