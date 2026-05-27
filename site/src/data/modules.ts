import type { ModuleMeta } from '@/types'

export const moduleCategories: Record<string, { label: string; color: string }> = {
  'basic-tools': { label: '基础工具', color: '#6366f1' },
  'programming': { label: '编程语言', color: '#10b981' },
  'web-frontend': { label: 'Web前端', color: '#f59e0b' },
  'data': { label: '数据', color: '#ef4444' },
  'cs': { label: '计算机科学', color: '#8b5cf6' },
}

export const moduleMetas: ModuleMeta[] = [
  { id: 'git', title: 'Git', description: '分布式版本控制系统', icon: '{ }', category: 'basic-tools', color: '#6366f1' },
  { id: 'github', title: 'GitHub', description: '代码托管与协作平台', icon: '@', category: 'basic-tools', color: '#6366f1' },
  { id: 'markdown', title: 'Markdown', description: '轻量级标记语言', icon: '#', category: 'basic-tools', color: '#6366f1' },
  { id: 'c', title: 'C', description: '系统编程基础语言', icon: 'C', category: 'programming', color: '#10b981' },
  { id: 'cpp', title: 'C++', description: '高性能系统编程语言', icon: '++', category: 'programming', color: '#10b981' },
  { id: 'java', title: 'Java', description: '企业级跨平台语言', icon: 'Jv', category: 'programming', color: '#10b981' },
  { id: 'javascript', title: 'JavaScript', description: 'Web核心脚本语言', icon: 'JS', category: 'programming', color: '#10b981' },
  { id: 'python', title: 'Python', description: '通用高级编程语言', icon: 'Py', category: 'programming', color: '#10b981' },
  { id: 'typescript', title: 'TypeScript', description: '类型安全的JavaScript超集', icon: 'TS', category: 'programming', color: '#10b981' },
  { id: 'lua', title: 'Lua', description: '轻量嵌入式脚本语言', icon: '>>', category: 'programming', color: '#10b981' },
  { id: 'html5', title: 'HTML5', description: '现代Web结构标准', icon: '</>', category: 'web-frontend', color: '#f59e0b' },
  { id: 'css', title: 'CSS', description: '层叠样式表与布局', icon: '{}', category: 'web-frontend', color: '#f59e0b' },
  { id: 'vue3', title: 'Vue 3', description: '渐进式前端框架', icon: 'V3', category: 'web-frontend', color: '#f59e0b' },
  { id: 'mysql', title: 'MySQL', description: '关系型数据库管理系统', icon: 'DB', category: 'data', color: '#ef4444' },
  { id: 'data-analysis', title: '数据分析', description: 'Python数据科学工具链', icon: '~', category: 'data', color: '#ef4444' },
  { id: 'algorithm', title: '算法', description: '数据结构与算法基础', icon: 'O(n)', category: 'cs', color: '#8b5cf6' },
  { id: 'cs-fundamentals', title: 'CS基础', description: '计算机科学核心概念', icon: '01', category: 'cs', color: '#8b5cf6' },
]

export function getModuleMeta(id: string): ModuleMeta | undefined {
  return moduleMetas.find(m => m.id === id)
}

export function getModulesByCategory(category: string): ModuleMeta[] {
  return moduleMetas.filter(m => m.category === category)
}