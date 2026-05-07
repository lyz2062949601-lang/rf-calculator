@echo off
rem 国内构建常用镜像（若已在外部 set 同名变量则不会覆盖）
if not defined NPM_CONFIG_REGISTRY set "NPM_CONFIG_REGISTRY=https://registry.npmmirror.com"
if not defined ELECTRON_MIRROR set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"
if not defined ELECTRON_BUILDER_BINARIES_MIRROR set "ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/"
if not defined CSC_IDENTITY_AUTO_DISCOVERY set "CSC_IDENTITY_AUTO_DISCOVERY=false"
