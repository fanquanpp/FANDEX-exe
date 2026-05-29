import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'docs');

async function walkDir(dir, fn) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walkDir(full, fn);
    else if (entry.name.endsWith('.md')) await fn(full);
  }
}

function cleanTruePrefix(content) {
  let changed = false;
  const lines = content.split('\n');
  const cleaned = lines.map((line) => {
    const match = line.match(/^(\s*)True([^a-zA-Z0-9])/);
    if (match) {
      changed = true;
      return match[1] + match[2];
    }
    return line;
  });
  return changed ? cleaned.join('\n') : null;
}

async function main() {
  let totalFiles = 0;
  let fixedFiles = 0;
  let totalFixes = 0;

  await walkDir(DOCS_DIR, async (filePath) => {
    totalFiles++;
    const content = await readFile(filePath, 'utf-8');
    const cleaned = cleanTruePrefix(content);
    if (cleaned) {
      const beforeMatches = content.match(/^\s*True[^a-zA-Z0-9]/gm);
      const afterMatches = cleaned.match(/^\s*True[^a-zA-Z0-9]/gm);
      const fixes = (beforeMatches?.length || 0) - (afterMatches?.length || 0);
      totalFixes += fixes;
      fixedFiles++;
      await writeFile(filePath, cleaned, 'utf-8');
      console.log(`Fixed ${fixes} lines in ${filePath.split('docs\\').pop()}`);
    }
  });

  console.log(
    `\nTotal: ${totalFiles} files scanned, ${fixedFiles} files fixed, ${totalFixes} lines cleaned`
  );
}

main().catch(console.error);
