<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useProgress } from '@/composables/useProgress'
import { getModuleMeta, moduleCategories } from '@/data/modules'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { ref, computed, onMounted, watch } from 'vue'
import type { Module, ModuleFile } from '@/types'

const route = useRoute()
const router = useRouter()
const { isRead, toggleRead, markAsRead } = useProgress()

const moduleId = computed(() => route.params.moduleId as string)
const slug = computed(() => route.params.slug as string)
const meta = computed(() => getModuleMeta(moduleId.value))
const docPath = computed(() => moduleId.value + '/' + slug.value + '.md')

const content = ref('')
const files = ref<ModuleFile[]>([])
const loading = ref(true)

const base = import.meta.env.BASE_URL || '/MyNotebook/'

async function loadDoc() {
  loading.value = true
  try {
    const contentUrl = import.meta.env.DEV
      ? '/api/content/' + docPath.value
      : base + 'content/' + docPath.value
    const res = await fetch(contentUrl)
    if (res.ok) {
      content.value = await res.text()
      markAsRead(docPath.value)
    } else {
      content.value = '# 文档未找到\n\n请求的文档不存在。'
    }
  } catch (e) {
    content.value = '# 加载失败\n\n无法加载文档内容。'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadFiles() {
  try {
    const modulesUrl = import.meta.env.DEV
      ? '/api/modules'
      : base + 'modules.json'
    const res = await fetch(modulesUrl)
    const modules: Module[] = await res.json()
    const mod = modules.find(m => m.id === moduleId.value)
    if (mod) files.value = mod.files
  } catch (e) {
    console.error(e)
  }
}

const currentIndex = computed(() => files.value.findIndex(f => f.slug === slug.value))
const prevDoc = computed(() => currentIndex.value > 0 ? files.value[currentIndex.value - 1] : null)
const nextDoc = computed(() => currentIndex.value < files.value.length - 1 ? files.value[currentIndex.value + 1] : null)

function navigateToDoc(fileSlug: string) {
  router.push({ name: 'doc', params: { moduleId: moduleId.value, slug: fileSlug } })
}

onMounted(() => { loadDoc(); loadFiles() })
watch([moduleId, slug], () => { loadDoc() })
</script>

<template>
  <div class="doc-page" v-if="meta">
    <nav class="breadcrumb">
      <router-link :to="{ name: 'home' }" class="breadcrumb-link">首页</router-link>
      <span class="breadcrumb-sep">/</span>
      <router-link :to="{ name: 'module', params: { id: moduleId } }" class="breadcrumb-link">{{ meta.title }}</router-link>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-current">{{ slug }}</span>
    </nav>

    <div class="doc-content" v-if="!loading">
      <MarkdownRenderer :content="content" />
    </div>
    <div v-else class="doc-loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <div class="doc-actions">
      <button
        class="read-toggle"
        :class="{ active: isRead(docPath) }"
        @click="toggleRead(docPath)"
      >
        <svg v-if="isRead(docPath)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
        {{ isRead(docPath) ? '已读' : '标记已读' }}
      </button>
    </div>

    <nav class="doc-nav" v-if="prevDoc || nextDoc">
      <button v-if="prevDoc" class="nav-btn nav-prev" @click="navigateToDoc(prevDoc.slug)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <div class="nav-btn-text">
          <span class="nav-btn-label">上一篇</span>
          <span class="nav-btn-title">{{ prevDoc.title }}</span>
        </div>
      </button>
      <div v-else></div>
      <button v-if="nextDoc" class="nav-btn nav-next" @click="navigateToDoc(nextDoc.slug)">
        <div class="nav-btn-text">
          <span class="nav-btn-label">下一篇</span>
          <span class="nav-btn-title">{{ nextDoc.title }}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.doc-page { max-width: 860px; margin: 0 auto; padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-3xl); }
.breadcrumb {
  display: flex; align-items: center; gap: var(--spacing-sm);
  padding: var(--spacing-md) 0; margin-bottom: var(--spacing-md);
  font-size: 0.85em; color: var(--color-text-tertiary);
  border-bottom: 1px solid var(--color-border-light);
}
.breadcrumb-link { color: var(--color-text-secondary); transition: color var(--transition-fast); }
.breadcrumb-link:hover { color: var(--color-accent); }
.breadcrumb-sep { color: var(--color-text-tertiary); opacity: 0.5; }
.breadcrumb-current { color: var(--color-text-primary); font-weight: 500; }
.doc-content { min-height: 300px; }
.doc-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: var(--spacing-3xl); color: var(--color-text-tertiary); gap: var(--spacing-md);
}
.loading-spinner {
  width: 32px; height: 32px; border: 3px solid var(--color-border-light);
  border-top-color: var(--color-accent); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.doc-actions { margin: var(--spacing-xl) 0; padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border-light); }
.read-toggle {
  display: inline-flex; align-items: center; gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border); border-radius: var(--radius-full);
  background: var(--color-bg-card); color: var(--color-text-secondary);
  font-size: 0.85em; font-family: var(--font-body); cursor: pointer;
  transition: all var(--transition-fast);
}
.read-toggle:hover { border-color: var(--color-accent); color: var(--color-accent); }
.read-toggle.active { background: var(--color-accent-light); border-color: var(--color-accent); color: var(--color-accent); }
.doc-nav {
  display: flex; justify-content: space-between; gap: var(--spacing-md);
  margin-top: var(--spacing-xl); padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}
.nav-btn {
  display: flex; align-items: center; gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border-light); border-radius: var(--radius-lg);
  background: var(--color-bg-card); color: var(--color-text-secondary);
  cursor: pointer; font-family: var(--font-body); transition: all var(--transition-fast);
  max-width: 45%;
}
.nav-btn:hover { border-color: var(--color-accent); color: var(--color-accent); box-shadow: var(--shadow-sm); }
.nav-btn-text { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.nav-next .nav-btn-text { text-align: right; }
.nav-btn-label { font-size: 0.7em; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
.nav-btn-title { font-size: 0.85em; font-weight: 500; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
</style>