<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useProgress } from '@/composables/useProgress'
import { getModuleMeta, moduleCategories } from '@/data/modules'
import { ref, computed, onMounted } from 'vue'
import type { Module, ModuleFile } from '@/types'

const route = useRoute()
const router = useRouter()
const { isRead, toggleRead, getProgressPercent } = useProgress()
const moduleId = computed(() => route.params.id as string)
const meta = computed(() => getModuleMeta(moduleId.value))
const files = ref<ModuleFile[]>([])

const base = import.meta.env.BASE_URL || '/MyNotebook/'

onMounted(async () => {
  try {
    const modulesUrl = import.meta.env.DEV ? '/api/modules' : base + 'modules.json'
    const res = await fetch(modulesUrl)
    const modules: Module[] = await res.json()
    const mod = modules.find(m => m.id === moduleId.value)
    if (mod) files.value = mod.files
  } catch (e) {
    console.error(e)
  }
})

const progress = computed(() => getProgressPercent(files.value.map(f => f.path)))
const readCount = computed(() => files.value.filter(f => isRead(f.path)).length)

function navigateToDoc(slug: string) {
  router.push({ name: 'doc', params: { moduleId: moduleId.value, slug } })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const categoryInfo = computed(() => {
  if (!meta.value) return null
  return moduleCategories[meta.value.category] || null
})
</script>

<template>
  <div class="module-page" v-if="meta">
    <div class="module-header">
      <div class="header-color-bar" :style="{ background: meta.color }"></div>
      <div class="header-content">
        <div class="header-top">
          <span class="header-icon" :style="{ background: meta.color }">{{ meta.icon }}</span>
          <div class="header-text">
            <span v-if="categoryInfo" class="header-tag" :style="{ background: categoryInfo.color }">{{ categoryInfo.label }}</span>
            <h1 class="header-title">{{ meta.title }}</h1>
            <p class="header-desc">{{ meta.description }}</p>
          </div>
        </div>
        <div class="header-progress">
          <span class="progress-label">{{ readCount }} / {{ files.length }} 篇已读</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%', background: meta.color }"></div>
          </div>
          <span class="progress-pct">{{ progress }}%</span>
        </div>
      </div>
    </div>

    <div class="file-table-wrapper">
      <table class="file-table">
        <thead>
          <tr>
            <th class="col-status"></th>
            <th class="col-title">标题</th>
            <th class="col-size">大小</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in files"
            :key="file.slug"
            class="file-row"
            :class="{ read: isRead(file.path) }"
            @click="navigateToDoc(file.slug)"
          >
            <td class="col-status">
              <span class="status-block" :class="{ read: isRead(file.path) }"></span>
            </td>
            <td class="col-title">{{ file.title }}</td>
            <td class="col-size">{{ formatSize(file.size) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="module-not-found">
    <h2>模块未找到</h2>
    <button @click="router.push({ name: 'home' })">返回首页</button>
  </div>
</template>

<style scoped>
.module-page {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-2xl);
  max-width: 100%;
  width: 100%;
}

.module-header {
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: 0;
  margin-bottom: var(--spacing-lg);
  display: flex;
  overflow: hidden;
}

.header-color-bar {
  width: 6px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
  padding: var(--spacing-lg);
}

.header-top {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 0;
  color: #fff;
  font-weight: 700;
  font-size: 1.1em;
  font-family: var(--font-display);
  flex-shrink: 0;
}

.header-text {
  min-width: 0;
}

.header-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.65em;
  font-weight: 700;
  color: #fff;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-xs);
}

.header-title {
  font-size: 1.5em;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--spacing-xs) 0;
  font-family: var(--font-display);
}

.header-desc {
  font-size: 0.9em;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-label {
  font-size: 0.8em;
  color: var(--color-text-secondary);
  font-family: var(--font-display);
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 10px;
  border: 2px solid var(--color-border);
  border-radius: 0;
  background: var(--color-bg);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width var(--transition-base);
}

.progress-pct {
  font-size: 0.85em;
  font-weight: 700;
  color: var(--color-text);
  font-family: var(--font-display);
  min-width: 40px;
  text-align: right;
}

.file-table-wrapper {
  border: 2px solid var(--color-border);
  border-radius: 0;
  overflow: hidden;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
}

.file-table th {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  font-size: 0.72em;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--color-text);
  font-family: var(--font-display);
  border-bottom: 2px solid var(--color-border);
}

.file-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.file-table tr:last-child td {
  border-bottom: none;
}

.file-row {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.file-row:hover {
  background: var(--color-bg-hover);
}

.file-row.read td {
  color: var(--color-text-tertiary);
}

.col-status {
  width: 40px;
}

.col-size {
  width: 90px;
  text-align: right;
  font-size: 0.82em;
  color: var(--color-text-tertiary);
  font-family: var(--font-display);
}

.status-block {
  display: inline-block;
  width: 8px;
  height: 8px;
  border: 2px solid var(--color-border-light);
  border-radius: 0;
  transition: all var(--transition-fast);
}

.status-block.read {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
}

.col-title {
  font-weight: 500;
  color: var(--color-text);
}

.file-row.read .col-title {
  color: var(--color-text-tertiary);
}

.module-not-found {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-secondary);
}

.module-not-found h2 {
  margin-bottom: var(--spacing-md);
  font-family: var(--font-display);
}

.module-not-found button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 2px solid var(--color-primary);
  border-radius: 0;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.85em;
  letter-spacing: 0.05em;
  transition: all var(--transition-fast);
}

.module-not-found button:hover {
  background: var(--color-primary);
  color: #fff;
}
</style>
