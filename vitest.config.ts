import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest 测试配置
 *
 * 配置说明：
 * - alias '@' 指向 apps/web/src 目录，与 tsconfig.json 中的 paths 映射保持一致
 * - alias '@packages' 指向 packages 目录，支持 monorepo 内部包引用
 * - include 匹配 src 下所有测试文件（相对于 vitest 运行时 cwd，即 apps/web/）
 *
 * 注意：本配置位于 monorepo 根目录（__dirname 为 FANDEX-exe/），
 * 但 vitest 通过 npm -w apps/web 启动时 cwd 为 apps/web/，
 * 因此 include 路径相对于 apps/web/，而 alias 通过 __dirname 绝对定位。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'apps/web/src'),
      '@packages': resolve(__dirname, 'packages'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
