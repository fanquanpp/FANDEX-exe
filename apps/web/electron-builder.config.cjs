/**
 * electron-builder 配置文件
 *
 * 功能概述：
 * 配置 Electron 应用打包选项，包括应用图标、NSIS 安装程序、文件资源等。
 * 打包后生成 FANDEX-Setup-{version}.exe 安装包。
 *
 * 构建命令：npx electron-builder --config electron-builder.config.cjs
 * 输出目录：apps/web/release/
 */

/** @type {import('electron-builder').Configuration} */
module.exports = {
  /** 应用 ID（唯一标识） */
  appId: 'com.fandex.web',
  /** 应用名称 */
  productName: 'FANDEX',
  /** Electron 版本（固定版本号，避免 electron-builder 无法检测） */
  electronVersion: '33.4.11',
  /** 应用目录 */
  directories: {
    output: 'release',
    buildResources: 'electron/build',
  },
  /** 源代码目录 */
  files: ['electron/main.cjs', 'electron/preload.cjs', 'electron/build/**/*'],
  /** 额外资源：dist 目录打包到 resources/dist */
  extraResources: [
    {
      from: 'dist',
      to: 'dist',
      filter: ['**/*'],
    },
  ],
  /** Windows 平台配置 */
  win: {
    /** 目标架构 */
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    /** 应用图标 */
    icon: 'electron/build/icon.ico',
    /** 请求执行级别（不需要管理员权限） */
    requestedExecutionLevel: 'asInvoker',
  },
  /** NSIS 安装程序配置 */
  nsis: {
    /** 一键安装（false 显示安装向导） */
    oneClick: false,
    /** 允许用户选择安装目录 */
    perMachine: false,
    /** 允许修改安装目录 */
    allowToChangeInstallationDirectory: true,
    /** 创建桌面快捷方式 */
    createDesktopShortcut: true,
    /** 创建开始菜单快捷方式 */
    createStartMenuShortcut: true,
    /** 安装完成后运行应用 */
    runAfterFinish: true,
    /** 卸载时删除应用数据 */
    deleteAppDataOnUninstall: false,
    /** 安装程序图标 */
    installerIcon: 'electron/build/icon.ico',
    /** 卸载程序图标 */
    uninstallerIcon: 'electron/build/icon.ico',
    /** 快捷方式名称 */
    shortcutName: 'FANDEX',
  },
  /** 压缩配置 */
  compression: 'maximum',
  /** 不包含在 asar 包中的文件 */
  asarUnpack: [],
};
