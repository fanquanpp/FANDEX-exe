/**
 * Electron 主进程入口
 *
 * 功能概述：
 * 启动内置 Node.js 静态服务器托管 dist 目录，创建 BrowserWindow 加载本地站点。
 * 用户安装后双击图标即可使用，无需浏览器和 Node.js 运行时。
 *
 * 主进程职责：
 * - 启动静态文件服务器（端口 4321）
 * - 创建应用窗口（1400x900，最小 1024x600）
 * - 加载本地站点 URL
 * - 处理窗口生命周期（就绪、关闭、全部关闭）
 * - 注册应用菜单
 */

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');
const http = require('node:http');
const fs = require('node:fs');

/** 静态服务器端口 */
const PORT = 4321;
/** 应用窗口默认尺寸 */
const WINDOW_WIDTH = 1400;
const WINDOW_HEIGHT = 900;
const MIN_WIDTH = 1024;
const MIN_HEIGHT = 600;

/** 主窗口引用 */
let mainWindow = null;
/** 静态服务器实例 */
let server = null;

/**
 * MIME 类型映射表
 *
 * 用于静态文件服务器返回正确的 Content-Type 头。
 */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
};

/**
 * 启动静态文件服务器
 *
 * 输入：静态文件根目录路径
 * 输出：Promise<void>，服务器启动后 resolve
 * 流程：创建 HTTP 服务器 -> 监听端口 -> 返回 Promise
 */
function startServer(rootDir) {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      /** 解析 URL，去除查询参数 */
      let urlPath = decodeURIComponent(req.url.split('?')[0]);

      /** 根路径映射到 index.html */
      if (urlPath === '/') {
        urlPath = '/index.html';
      }

      /** 处理目录路径，追加 index.html */
      if (urlPath.endsWith('/')) {
        urlPath = urlPath + 'index.html';
      }

      const filePath = path.join(rootDir, urlPath);

      /** 安全检查：防止路径遍历攻击（使用 path.resolve 规范化后比较） */
      const resolvedPath = path.resolve(filePath);
      const resolvedRoot = path.resolve(rootDir);
      if (!resolvedPath.startsWith(resolvedRoot + path.sep) && resolvedPath !== resolvedRoot) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      /** 读取文件并返回 */
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        });
        res.end(data);
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`静态服务器已启动: http://127.0.0.1:${PORT}/`);
      resolve();
    });

    server.on('error', reject);
  });
}

/**
 * 创建主窗口
 *
 * 输入：无
 * 输出：BrowserWindow 实例
 * 流程：创建窗口 -> 加载 URL -> 绑定事件
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    title: 'FANDEX 知识学习平台',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    /** 自动隐藏菜单栏（Windows 下按 Alt 显示） */
    autoHideMenuBar: true,
  });

  /** 加载本地站点 */
  mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);

  /** 外部链接在系统默认浏览器中打开 */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 创建应用菜单
 *
 * 简化菜单栏，仅保留必要的菜单项。
 */
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建窗口',
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow(),
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'forceReload', label: '强制刷新' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 FANDEX',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 FANDEX',
              message: 'FANDEX 知识学习平台',
              detail:
                '版本: ' +
                app.getVersion() +
                '\n零基础到本科毕业的完整学习平台\n51 模块 · 2031 篇文档',
              buttons: ['确定'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/** 应用就绪：启动服务器并创建窗口 */
app.whenReady().then(async () => {
  /** 静态文件根目录：打包后为 resources/dist，开发时为 ../dist */
  const isDev = !app.isPackaged;
  const distDir = isDev
    ? path.join(__dirname, '..', 'dist')
    : path.join(process.resourcesPath, 'dist');

  try {
    await startServer(distDir);
    createWindow();
    createMenu();
  } catch (err) {
    console.error('启动失败:', err);
    const { dialog } = require('electron');
    dialog.showErrorBox('启动失败', '无法启动本地服务器: ' + err.message);
    app.quit();
  }
});

/** macOS 下点击 dock 图标时重新创建窗口 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/** 全部窗口关闭时退出应用（非 macOS） */
app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/** 应用退出前关闭服务器 */
app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});
