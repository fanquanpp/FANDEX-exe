@echo off
chcp 65001 >nul
REM FANDEX 离线版启动脚本（Windows）
REM 功能：启动本地静态服务器并自动打开浏览器
REM 依赖：Node.js（需已安装并加入 PATH）

cd /d "%~dp0"

echo ============================================
echo   FANDEX 知识学习平台 - 离线版
echo ============================================
echo.

REM 检查 Node.js 是否可用
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [错误] 未检测到 Node.js，请先安装 Node.js 22 或更高版本。
  echo 下载地址：https://nodejs.org/
  pause
  exit /b 1
)

REM 检查 dist 目录是否存在
if not exist "index.html" (
  echo [错误] 未找到站点文件，请确认已解压完整。
  pause
  exit /b 1
)

REM 选择端口
set PORT=4321

REM 启动静态服务器
echo 正在启动本地服务器（端口 %PORT%）...
echo 浏览器将自动打开，请勿关闭此窗口。
echo 关闭此窗口即可停止服务。
echo.

REM 使用 Node.js 内置 http 模块启动静态服务器
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const fp=p.join('.',u);f.readFile(fp,(e,d)=>{if(e){r.writeHead(404);r.end('Not Found');return}const ext=p.extname(fp);const t={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.xml':'application/xml','.webmanifest':'application/manifest+json'}[ext]||'application/octet-stream';r.writeHead(200,{'Content-Type':t});r.end(d)})}).listen(%PORT%,()=>{const c=require('child_process');c.exec('start http://localhost:%PORT%/');console.log('服务器已启动：http://localhost:%PORT%/')})"

pause
