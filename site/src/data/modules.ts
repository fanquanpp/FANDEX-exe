import type { ModuleMeta } from '@/types'

export const moduleCategories: Record<string, { label: string; color: string }> = {
  'basic-tools': { label: '工具链', color: '#6366f1' },
  'programming': { label: '编程语言', color: '#10b981' },
  'web-frontend': { label: '前端工程', color: '#f59e0b' },
  'data': { label: '数据技术', color: '#ef4444' },
  'cs': { label: '计算理论', color: '#8b5cf6' },
}

export const moduleMetas: ModuleMeta[] = [
  { id: 'git', title: 'Git', description: '版本控制与分支管理', icon: '{ }', category: 'basic-tools', color: '#6366f1' },
  { id: 'github', title: 'GitHub', description: '代码协作与CI/CD', icon: '@', category: 'basic-tools', color: '#6366f1' },
  { id: 'markdown', title: 'Markdown', description: '文档标记与写作规范', icon: '#', category: 'basic-tools', color: '#6366f1' },
  { id: 'c', title: 'C', description: '底层系统编程', icon: 'C', category: 'programming', color: '#10b981' },
  { id: 'cpp', title: 'C++', description: '高性能与泛型编程', icon: '++', category: 'programming', color: '#10b981' },
  { id: 'java', title: 'Java', description: '企业级应用开发', icon: 'Jv', category: 'programming', color: '#10b981' },
  { id: 'javascript', title: 'JavaScript', description: '动态类型脚本语言', icon: 'JS', category: 'programming', color: '#10b981' },
  { id: 'python', title: 'Python', description: '通用编程与自动化', icon: 'Py', category: 'programming', color: '#10b981' },
  { id: 'typescript', title: 'TypeScript', description: '静态类型JavaScript', icon: 'TS', category: 'programming', color: '#10b981' },
  { id: 'lua', title: 'Lua', description: '嵌入式脚本引擎', icon: '>>', category: 'programming', color: '#10b981' },
  { id: 'html5', title: 'HTML5', description: 'Web结构与语义', icon: '</>', category: 'web-frontend', color: '#f59e0b' },
  { id: 'css', title: 'CSS', description: '样式与视觉布局', icon: '{}', category: 'web-frontend', color: '#f59e0b' },
  { id: 'vue3', title: 'Vue 3', description: '响应式前端框架', icon: 'V3', category: 'web-frontend', color: '#f59e0b' },
  { id: 'mysql', title: 'MySQL', description: '关系型数据存储', icon: 'DB', category: 'data', color: '#ef4444' },
  { id: 'data-analysis', title: '数据分析', description: '统计建模与可视化', icon: '~', category: 'data', color: '#ef4444' },
  { id: 'algorithm', title: '算法', description: '数据结构与算法设计', icon: 'O(n)', category: 'cs', color: '#8b5cf6' },
  { id: 'cs-fundamentals', title: 'CS基础', description: '操作系统与网络原理', icon: '01', category: 'cs', color: '#8b5cf6' },
]

export function getModuleMeta(id: string): ModuleMeta | undefined {
  return moduleMetas.find(m => m.id === id)
}

export function getModulesByCategory(category: string): ModuleMeta[] {
  return moduleMetas.filter(m => m.category === category)
}
