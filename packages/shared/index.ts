/**
 * 共享数据包 - 统一导出
 *
 * 包含站点常量、模块注册表等共享数据
 */
export { SITE } from './constants';
export type { Module } from './modules';
export {
  categoryColors,
  categoryLabels,
  categoryOrder,
  docSlug,
  getModule,
  getModulesByCategory,
  getPrimaryCategory,
  modulePrerequisites,
  modules,
} from './modules';
