<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import { createHighlighter, type Highlighter } from 'shiki'

const props = defineProps<{ content: string }>()

const rendered = ref('')
const highlighter = ref<Highlighter | null>(null)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (!highlighter.value) return ''
    const loadedLangs = highlighter.value.getLoadedLanguages()
    const resolvedLang = loadedLangs.includes(lang) ? lang : (loadedLangs.includes('text') ? 'text' : 'plaintext')
    try {
      return highlighter.value.codeToHtml(code, { lang: resolvedLang, theme: 'github-dark' })
    } catch { return '' }
  },
})

md.use(anchor, {
  slugify: (s: string) => s.trim().toLowerCase().replace(/[\s+]/g, '-'),
  permalink: anchor.permalink['ariaHidden'],
})

const headings = ref<{ id: string; text: string; level: number }[]>([])

function extractHeadings(html: string) {
  const regex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g
  const result: { id: string; text: string; level: number }[] = []
  let match
  while ((match = regex.exec(html)) !== null) {
    result.push({ level: parseInt(match[1]), id: match[2], text: match[3].replace(/<[^>]*>/g, '') })
  }
  return result
}

function wrapCodeBlocks(html: string): string {
  return html.replace(/<pre[^>]*class="shiki"[^>]*>/g, (match) => {
    const langMatch = match.match(/language-(\w+)/)
    const lang = langMatch ? langMatch[1] : 'code'
    const wrapper = '<div class="code-block-wrapper"><div class="code-block-header"><span class="code-block-lang">' + lang + '</span><button class="copy-button" data-action="copy">Copy</button></div>'
    return wrapper + match
  })
}

watch(() => props.content, () => {
  const html = md.render(props.content)
  rendered.value = wrapCodeBlocks(html)
  headings.value = extractHeadings(html)
}, { immediate: true })

onMounted(async () => {
  try {
    highlighter.value = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'html', 'css', 'json', 'bash', 'sql', 'markdown', 'vue', 'go', 'rust'],
    })
    const html = md.render(props.content)
    rendered.value = wrapCodeBlocks(html)
    headings.value = extractHeadings(html)
  } catch (e) { console.error('Failed to initialize highlighter:', e) }
})

const toc = computed(() => headings.value.filter(h => h.level <= 3))

function handleCopy(e: Event) {
  const btn = e.target as HTMLElement
  const wrapper = btn.closest('.code-block-wrapper')
  if (!wrapper) return
  const code = wrapper.querySelector('code')
  if (!code) return
  navigator.clipboard.writeText(code.textContent || '').then(() => {
    btn.textContent = 'Copied'
    btn.classList.add('copied')
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied') }, 2000)
  })
}

function handleClick(e: Event) {
  const target = e.target as HTMLElement
  if (target.classList.contains('copy-button') || target.closest('.copy-button')) {
    handleCopy(e)
  }
}
</script>

<template>
  <div class="doc-renderer" @click="handleClick">
    <aside v-if="toc.length > 3" class="doc-toc">
      <h4 class="toc-title">目录</h4>
      <ul class="toc-list">
        <li v-for="h in toc" :key="h.id" class="toc-item" :class="'toc-h' + h.level">
          <a :href="'#' + h.id" class="toc-link">{{ h.text }}</a>
        </li>
      </ul>
    </aside>
    <div class="markdown-body" v-html="rendered"></div>
  </div>
</template>

<style scoped>
.doc-renderer { display: flex; gap: var(--spacing-xl); position: relative; }
.markdown-body { flex: 1; min-width: 0; }
.doc-toc {
  position: sticky; top: calc(var(--nav-height) + var(--spacing-lg));
  width: 200px; max-height: calc(100vh - var(--nav-height) - var(--spacing-2xl));
  overflow-y: auto; flex-shrink: 0; padding: var(--spacing-md);
  border-left: 1px solid var(--color-border-light); font-size: 0.85em;
}
.toc-title { font-size: 0.75em; font-weight: 600; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 var(--spacing-sm) 0; }
.toc-list { list-style: none; padding: 0; margin: 0; }
.toc-item { margin-bottom: 2px; }
.toc-link { display: block; padding: 3px 0; color: var(--color-text-secondary); font-size: 0.9em; line-height: 1.4; transition: color var(--transition-fast); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.toc-link:hover { color: var(--color-accent); }
.toc-h2 { padding-left: var(--spacing-sm); }
.toc-h3 { padding-left: var(--spacing-lg); }
@media (max-width: 1024px) { .doc-toc { display: none; } .doc-renderer { display: block; } }
</style>