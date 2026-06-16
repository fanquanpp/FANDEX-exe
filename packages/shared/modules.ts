/**
 * 模块注册表 - 从 metadata/modules.json 加载模块数据
 *
 * 数据源：metadata/modules.json
 * 导出内容：分类标签、分类颜色、分类顺序、模块列表、模块前置依赖、工具函数
 */
import moduleData from '../../metadata/modules.json';

/** 分类中文标签映射 */
export const categoryLabels: Record<string, string> = moduleData.categoryLabels;

/** 分类颜色映射（每个分类一种统一颜色） */
export const categoryColors: Record<string, string> = moduleData.categoryColors;

/** 分类排列顺序 */
export const categoryOrder: string[] = moduleData.categoryOrder;

/** 模块前置依赖关系（key 为模块 id，value 为前置模块 id 数组） */
export const modulePrerequisites: Record<string, string[]> = moduleData.modulePrerequisites;

/** 模块类型定义（从 JSON 数据结构推断） */
export interface Module {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
  readonly categories: readonly string[];
}

/** 全部模块列表 */
export const modules: readonly Module[] = moduleData.modules;

/**
 * 根据 id 查找模块
 * @param id - 模块唯一标识
 * @returns 匹配的模块对象，未找到则返回 undefined
 */
export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

/**
 * 根据分类筛选模块
 * @param category - 分类标识（如 'tools', 'frontend'）
 * @returns 属于该分类的模块数组
 */
export function getModulesByCategory(category: string): readonly Module[] {
  return modules.filter((m) => m.categories.includes(category));
}

/**
 * 获取模块的主分类（第一个分类）
 * @param mod - 模块对象
 * @returns 主分类标识字符串
 */
export function getPrimaryCategory(mod: Module): string {
  return mod.categories[0];
}

/**
 * 从 content collection id 中提取 slug（文件名去除 .md 后缀）
 * @param id - content collection 条目的 id 字段
 * @returns 去除路径和后缀的 slug 字符串
 */
export function docSlug(id: string): string {
  return (id.split('/').pop() || id).replace(/\.(md|mdx)$/, '');
}
