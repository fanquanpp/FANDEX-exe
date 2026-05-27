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

onMounted(async () => { try { const modulesUrl = import.meta.env.DEV ? '/api/modules' : base + 'modules.json'; const res = await fetch(modulesUrl); const modules: Module[] = await res.json(); const mod = modules.find(m => m.id === moduleId.value); if (mod) files.value = mod.files } catch (e) { console.error(e) } })
const progress = computed(() => getProgressPercent(files.value.map(f => f.path)))
const readCount = computed(() => files.value.filter(f => isRead(f.path)).length)
function navigateToDoc(slug: string) { router.push({ name: 'doc', params: { moduleId: moduleId.value, slug } }) }
function formatSize(bytes: number): string { if (bytes < 1024) return bytes + ' B'; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'; return (bytes / (1024 * 1024)).toFixed(1) + ' MB' }
</script>

<template>
  <div class="module-page" v-if="meta">
    <div class="module-hero" :style="{ '--module-color': meta.color }">
      <div class="module-hero-content">
        <span class="module-hero-icon" :style="{ background: meta.color }">{{ meta.icon }}</span>
        <div class="module-hero-text">
          <span class="module-hero-tag" :style="{ color: meta.color, borderColor: meta.color }">{{ moduleCategories[meta.category].label }}</span>
          <h1 class="module-hero-title">{{ meta.title }}</h1>
          <p class="module-hero-desc">{{ meta.description }}</p>
        </div>
      </div>
      <div class="module-hero-progress">
        <div class="progress-info"><span class="progress-label">学习进度</span><span class="progress-value">{{ readCount }} / {{ files.length }} 篇已读</span></div>
        <div class="progress-bar-lg"><div class="progress-fill-lg" :style="{ width: progress + '%', background: meta.color }"></div></div>
        <span class="progress-percent">{{ progress }}%</span>
      </div>
    </div>
    <div class="file-table-wrapper">
      <table class="file-table">
        <thead><tr><th class="col-status">状态</th><th class="col-title">标题</th><th class="col-size">大小</th></tr></thead>
        <tbody>
          <tr v-for="file in files" :key="file.slug" class="file-row" :class="{ read: isRead(file.path) }" @click="navigateToDoc(file.slug)">
            <td class="col-status"><span class="status-indicator" :class="{ read: isRead(file.path) }"><svg v-if="isRead(file.path)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><span v-else class="status-dot"></span></span></td>
            <td class="col-title">{{ file.title }}</td>
            <td class="col-size">{{ formatSize(file.size) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="module-not-found"><h2>模块未找到</h2><button @click="router.push({ name: 'home' })">返回首页</button></div>
</template>

<style scoped>
.module-page { max-width: 900px; margin: 0 auto; padding: var(--spacing-xl) var(--spacing-lg); }
.module-hero { background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); position: relative; overflow: hidden; }
.module-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--module-color); }
.module-hero-content { display: flex; align-items: center; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg); }
.module-hero-icon { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: var(--radius-lg); color: #fff; font-weight: 700; font-size: 1.2em; font-family: var(--font-code); flex-shrink: 0; }
.module-hero-text { min-width: 0; }
.module-hero-tag { font-size: 0.7em; padding: 2px 8px; border: 1px solid; border-radius: var(--radius-full); font-weight: 500; display: inline-block; margin-bottom: var(--spacing-xs); }
.module-hero-title { font-size: 1.75em; font-weight: 800; color: var(--color-text-primary); margin: 0 0 var(--spacing-xs) 0; }
.module-hero-desc { font-size: 0.95em; color: var(--color-text-secondary); margin: 0; }
.module-hero-progress { display: flex; align-items: center; gap: var(--spacing-md); }
.progress-info { display: flex; flex-direction: column; gap: 2px; min-width: 100px; }
.progress-label { font-size: 0.75em; color: var(--color-text-tertiary); font-weight: 500; }
.progress-value { font-size: 0.85em; color: var(--color-text-secondary); font-weight: 600; }
.progress-bar-lg { flex: 1; height: 8px; border-radius: var(--radius-full); background: var(--color-bg-tertiary); overflow: hidden; }
.progress-fill-lg { height: 100%; border-radius: var(--radius-full); transition: width var(--transition-slow); }
.progress-percent { font-size: 0.9em; font-weight: 700; color: var(--color-text-primary); font-family: var(--font-code); min-width: 40px; text-align: right; }
.file-table-wrapper { background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); overflow: hidden; }
.file-table { width: 100%; border-collapse: collapse; }
.file-table th { padding: var(--spacing-md) var(--spacing-lg); text-align: left; font-size: 0.75em; font-weight: 600; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border-light); }
.file-table td { padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-border-light); }
.file-table tr:last-child td { border-bottom: none; }
.file-row { cursor: pointer; transition: background var(--transition-fast); }
.file-row:hover { background: var(--color-bg-hover); }
.file-row.read td { color: var(--color-text-tertiary); }
.col-status { width: 50px; }
.col-size { width: 100px; text-align: right; }
.status-indicator { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; }
.status-indicator.read { color: var(--color-accent); background: var(--color-accent-light); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); }
.col-title { font-weight: 500; color: var(--color-text-primary); }
.file-row.read .col-title { color: var(--color-text-tertiary); }
.col-size { font-size: 0.85em; color: var(--color-text-tertiary); font-family: var(--font-code); }
.module-not-found { text-align: center; padding: var(--spacing-3xl); color: var(--color-text-secondary); }
.module-not-found h2 { margin-bottom: var(--spacing-md); }
.module-not-found button { padding: var(--spacing-sm) var(--spacing-lg); border: 1px solid var(--color-accent); border-radius: var(--radius-md); background: transparent; color: var(--color-accent); cursor: pointer; font-family: var(--font-body); transition: all var(--transition-fast); }
.module-not-found button:hover { background: var(--color-accent); color: #fff; }
</style>