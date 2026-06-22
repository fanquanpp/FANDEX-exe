/**
 * Electron 预加载脚本
 *
 * 功能概述：
 * 在渲染进程加载前执行，通过 contextBridge 暴露安全的 API 给渲染进程。
 * 当前仅暴露应用版本信息，供前端检测运行环境使用。
 */

const { contextBridge } = require('electron');

/** 通过 contextBridge 暴露安全 API */
contextBridge.exposeInMainWorld('electronAPI', {
  /** 应用版本号 */
  version: process.env.npm_package_version || '1.0.0',
  /** 是否为 Electron 环境 */
  isElectron: true,
  /** 平台信息 */
  platform: process.platform,
});
