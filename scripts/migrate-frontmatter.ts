import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

const CONTENT_DIR = 'content'

function migrateFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n')

  if (lines[0]?.startsWith('---')) {
    console.log(`Already has frontmatter: ${filePath}`)
    return
  }

  const title = lines[0]?.replace(/^#\s*/, '').trim() || path.basename(filePath, '.md')
  const meta: Record<string, string> = {}

  let i = 0
  for (; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('> @')) {
      const match = line.match(/> @(\w+):\s*(.*)/)
      if (match) {
        meta[match[1].toLowerCase()] = match[2].trim()
      }
    } else if (line.trim() === '---' && i > 0 && lines.slice(0, i).some(l => l.startsWith('> @'))) {
      i++
      break
    } else if (i > 10) {
      break
    }
  }

  const body = lines.slice(i).join('\n').replace(/\[\[([^\]]+)\]\]/g, (_m: string, p: string) => {
    const parts = p.split('|')
    const target = parts[0].trim()
    const label = parts[1]?.trim() || target
    return `[${label}](${target})`
  })

  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `module: "${path.basename(path.dirname(filePath))}"`,
    meta.category ? `category: "${meta.category}"` : '',
    meta.description ? `description: "${meta.description.replace(/"/g, '\\"')}"` : '',
    meta.author ? `author: "${meta.author}"` : '',
    meta.updated ? `updated: ${meta.updated}` : '',
    '---',
    '',
    body
  ].filter(Boolean).join('\n')

  fs.writeFileSync(filePath, frontmatter, 'utf-8')
  console.log(`Migrated: ${filePath}`)
}

function main() {
  const files = globSync(`${CONTENT_DIR}/**/*.md`)
  files.forEach(migrateFile)
}

main()
