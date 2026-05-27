<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useProgress } from '@/composables/useProgress'
import { moduleMetas, moduleCategories, getModulesByCategory } from '@/data/modules'
import { ref, computed, onMounted } from 'vue'
import type { Module } from '@/types'

const router = useRouter()
const { getProgressPercent, isRead } = useProgress()
const modules = ref<Module[]>([])
const searchQuery = ref('')

onMounted(async () => {
  try {
    const base = import.meta.env.BASE_URL || '/MyNotebook/'
    const modulesUrl = import.meta.env.DEV ? '/api/modules' : base + 'modules.json'
    const res = await fetch(modulesUrl)
    modules.value = await res.json()
  } catch (e) {
    console.error(e)
  }
})

const filteredMetas = computed(() => {
  if (!searchQuery.value) return moduleMetas
  const q = searchQuery.value.toLowerCase()
  return moduleMetas.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.description.toLowerCase().includes(q) ||
    m.id.toLowerCase().includes(q)
  )
})

const categoryOrder = ['basic-tools', 'programming', 'web-frontend', 'data', 'cs']

const groupedModules = computed(() => {
  return categoryOrder
    .filter(cat => getModulesByCategory(cat).some(m => filteredMetas.value.includes(m)))
    .map(cat => ({
      key: cat,
      ...moduleCategories[cat],
      modules: getModulesByCategory(cat).filter(m => filteredMetas.value.includes(m))
    }))
})

function getFileCount(moduleId: string): number {
  const mod = modules.value.find(m => m.id === moduleId)
  return mod ? mod.files.length : 0
}

function getModuleProgress(moduleId: string): number {
  const mod = modules.value.find(m => m.id === moduleId)
  if (!mod) return 0
  const paths = mod.files.map(f => f.path)
  return getProgressPercent(paths)
}

function navigateToModule(id: string) {
  router.push({ name: 'module', params: { id } })
}

const totalProgress = computed(() => {
  if (modules.value.length === 0) return 0
  const allPaths = modules.value.flatMap(m => m.files.map(f => f.path))
  return getProgressPercent(allPaths)
})
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">MyNotebook</h1>
        <p class="hero-subtitle">综合技术自学资料库</p>
        <div class="hero-search">
          <svg class="hero-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="搜索模块..." class="hero-search-input" />
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">{{ modules.length }}</span>
            <span class="stat-label">模块</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ modules.reduce((s, m) => s + m.files.length, 0) }}</span>
            <span class="stat-label">文档</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ totalProgress }}%</span>
            <span class="stat-label">进度</span>
          </div>
        </div>
      </div>
    </section>

    <section class="modules-section">
      <div v-for="group in groupedModules" :key="group.key" class="category-group">
        <div class="category-header">
          <span class="category-dot" :style="{ background: group.color }"></span>
          <h2 class="category-title">{{ group.label }}</h2>
          <span class="category-count">{{ group.modules.length }}</span>
        </div>
        <div class="module-grid">
          <div
            v-for="mod in group.modules"
            :key="mod.id"
            class="module-card"
            @click="navigateToModule(mod.id)"
          >
            <div class="card-header">
              <span class="card-icon" :style="{ background: mod.color }">{{ mod.icon }}</span>
              <span class="card-tag" :style="{ color: mod.color, borderColor: mod.color }">{{ moduleCategories[mod.category].label }}</span>
            </div>
            <h3 class="card-title">{{ mod.title }}</h3>
            <p class="card-desc">{{ mod.description }}</p>
            <div class="card-footer">
              <span class="card-files">{{ getFileCount(mod.id) }} 篇</span>
              <div class="card-progress-bar">
                <div class="card-progress-fill" :style="{ width: getModuleProgress(mod.id) + '%', background: mod.color }"></div>
              </div>
              <span class="card-progress-text">{{ getModuleProgress(mod.id) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { max-width: 1200px; margin: 0 auto; padding: 0 var(--spacing-lg) var(--spacing-3xl); }
.hero {
  background: linear-gradient(135deg, #312e81 0%, #1e3a5f 40%, #065f46 100%);
  margin: 0 calc(-1 * var(--spacing-lg));
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse at 70% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; }
.hero-title {
  font-size: 3em;
  font-weight: 800;
  color: #fff;
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.hero-subtitle {
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: var(--spacing-xl);
  font-weight: 400;
}
.hero-search {
  position: relative;
  max-width: 480px;
  margin: 0 auto var(--spacing-xl);
}
.hero-search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}
.hero-search-input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 1em;
  font-family: var(--font-body);
  outline: none;
  transition: all var(--transition-fast);
}
.hero-search-input::placeholder { color: rgba(255, 255, 255, 0.5); }
.hero-search-input:focus { border-color: rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.15); box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1); }
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-value { font-size: 1.5em; font-weight: 700; color: #fff; }
.stat-label { font-size: 0.8em; color: rgba(255, 255, 255, 0.6); }
.stat-divider { width: 1px; height: 32px; background: rgba(255, 255, 255, 0.2); }
.modules-section { margin-top: var(--spacing-2xl); }
.category-group { margin-bottom: var(--spacing-2xl); }
.category-header { display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg); }
.category-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.category-title { font-size: 1.25em; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.category-count {
  font-size: 0.75em;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  font-weight: 500;
}
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-md);
}
.module-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}
.module-card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-md); }
.card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: var(--radius-md);
  color: #fff; font-weight: 700; font-size: 0.85em; font-family: var(--font-code);
}
.card-tag {
  font-size: 0.7em;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: var(--radius-full);
  font-weight: 500;
}
.card-title { font-size: 1.1em; font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--spacing-xs) 0; }
.card-desc { font-size: 0.85em; color: var(--color-text-secondary); margin: 0 0 var(--spacing-md) 0; line-height: 1.5; }
.card-footer { display: flex; align-items: center; gap: var(--spacing-sm); }
.card-files { font-size: 0.75em; color: var(--color-text-tertiary); white-space: nowrap; }
.card-progress-bar {
  flex: 1; height: 4px; border-radius: var(--radius-full);
  background: var(--color-bg-tertiary); overflow: hidden;
}
.card-progress-fill { height: 100%; border-radius: var(--radius-full); transition: width var(--transition-slow); }
.card-progress-text { font-size: 0.75em; color: var(--color-text-tertiary); font-weight: 600; font-family: var(--font-code); white-space: nowrap; }
@media (max-width: 768px) {
  .hero-title { font-size: 2em; }
  .hero-subtitle { font-size: 1em; }
  .module-grid { grid-template-columns: 1fr; }
}
</style>