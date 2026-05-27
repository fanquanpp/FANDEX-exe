import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import path from 'path'

const repoRoot = path.resolve(__dirname, '..')
const contentDir = repoRoot

function contentServer(): Plugin {
  return {
    name: 'content-server',
    configureServer(server) {
      server.middlewares.use('/api/content', (req, res) => {
        const filePath = path.join(contentDir, req.url?.replace(/^\//, '') || '')
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(fs.readFileSync(filePath))
        } else {
          res.statusCode = 404
          res.end('Not found')
        }
      })
      server.middlewares.use('/api/modules', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Access-Control-Allow-Origin', '*')
        const modules = fs.readdirSync(contentDir)
          .filter(d => fs.statSync(path.join(contentDir, d)).isDirectory() && !d.startsWith('.') && d !== 'docs' && d !== 'site')
          .map(d => ({
            id: d,
            files: fs.readdirSync(path.join(contentDir, d))
              .filter(f => f.endsWith('.md') && f !== 'README.md')
              .map(f => ({
                slug: f.replace('.md', ''),
                title: f.replace('.md', ''),
                path: `${d}/${f}`,
                size: fs.statSync(path.join(contentDir, d, f)).size
              }))
          }))
        res.end(JSON.stringify(modules))
      })
    }
  }
}

function copyContent(): Plugin {
  return {
    name: 'copy-content',
    closeBundle() {
      const publicContent = path.resolve(__dirname, 'dist/content')
      if (!fs.existsSync(publicContent)) {
        fs.mkdirSync(publicContent, { recursive: true })
      }
      const moduleDirs = fs.readdirSync(repoRoot)
        .filter(d => {
          const fullPath = path.join(repoRoot, d)
          return fs.statSync(fullPath).isDirectory()
            && !d.startsWith('.')
            && d !== 'docs'
            && d !== 'site'
            && d !== 'node_modules'
        })
      for (const dir of moduleDirs) {
        const srcDir = path.join(repoRoot, dir)
        const destDir = path.join(publicContent, dir)
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'))
        for (const file of files) {
          fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file))
        }
        const subDirs = fs.readdirSync(srcDir)
          .filter(f => fs.statSync(path.join(srcDir, f)).isDirectory() && !f.startsWith('.'))
        for (const sub of subDirs) {
          const subSrc = path.join(srcDir, sub)
          const subDest = path.join(destDir, sub)
          if (!fs.existsSync(subDest)) {
            fs.mkdirSync(subDest, { recursive: true })
          }
          const subFiles = fs.readdirSync(subSrc).filter(f => f.endsWith('.md') || f.endsWith('.sql') || f.endsWith('.ts'))
          for (const file of subFiles) {
            fs.copyFileSync(path.join(subSrc, file), path.join(subDest, file))
          }
        }
      }
      const modulesJson = path.resolve(__dirname, 'dist/modules.json')
      const modules = moduleDirs.map(d => ({
        id: d,
        files: fs.readdirSync(path.join(repoRoot, d))
          .filter(f => f.endsWith('.md') && f !== 'README.md')
          .map(f => ({
            slug: f.replace('.md', ''),
            title: f.replace('.md', ''),
            path: `${d}/${f}`,
            size: fs.statSync(path.join(repoRoot, d, f)).size
          }))
      }))
      fs.writeFileSync(modulesJson, JSON.stringify(modules, null, 2))
      console.log(`Content copied: ${moduleDirs.length} modules`)
    }
  }
}

export default defineConfig({
  base: '/MyNotebook/',
  plugins: [
    vue(),
    vueDevTools(),
    contentServer(),
    copyContent(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
