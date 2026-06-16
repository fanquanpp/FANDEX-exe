/**
 * 共享数据包 - 统一导出
 *
 * 包含站点常量、模块注册表等共享数据
 */
export { SITE } from './constants';
export { categoryLabels, categoryColors, categoryOrder, modulePrerequisites, modules, getModule, getModulesByCategory, getPrimaryCategory, docSlug } from './modules';
export type { Module } from './modules';
