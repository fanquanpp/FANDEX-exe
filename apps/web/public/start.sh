#!/bin/bash
# FANDEX 离线版启动脚本（Linux/macOS）
# 功能：启动本地静态服务器并自动打开浏览器
# 依赖：Node.js（需已安装并加入 PATH）

set -e

cd "$(dirname "$0")"

echo "============================================"
echo "  FANDEX 知识学习平台 - 离线版"
echo "============================================"
echo ""

# 检查 Node.js 是否可用
if ! command -v node &> /dev/null; then
  echo "[错误] 未检测到 Node.js，请先安装 Node.js 22 或更高版本。"
  echo "下载地址：https://nodejs.org/"
  exit 1
fi

# 检查站点文件是否存在
if [ ! -f "index.html" ]; then
  echo "[错误] 未找到站点文件，请确认已解压完整。"
  exit 1
fi

# 选择端口
PORT=4321

# 启动静态服务器
echo "正在启动本地服务器（端口 $PORT）..."
echo "浏览器将自动打开，请勿关闭此终端。"
echo "按 Ctrl+C 停止服务。"
echo ""

# 使用 Node.js 内置 http 模块启动静态服务器
node -e "
const h=require('http'),f=require('fs'),p=require('path');
h.createServer((q,r)=>{
  let u=decodeURIComponent(q.url.split('?')[0]);
  if(u==='/')u='/index.html';
  const fp=p.join('.',u);
  f.readFile(fp,(e,d)=>{
    if(e){r.writeHead(404);r.end('Not Found');return}
    const ext=p.extname(fp);
    const t={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.xml':'application/xml','.webmanifest':'application/manifest+json'}[ext]||'application/octet-stream';
    r.writeHead(200,{'Content-Type':t});
    r.end(d)
  })
}).listen($PORT,()=>{
  const c=require('child_process');
  const url='http://localhost:$PORT/';
  // 尝试打开浏览器
  if(process.platform==='darwin'){c.exec('open '+url)}
  else if(process.platform==='win32'){c.exec('start '+url)}
  else{c.exec('xdg-open '+url)}
  console.log('服务器已启动：'+url);
})
"
