/// <reference types="vite/client" />

declare module 'markdown-it-anchor' {
  import type { PluginWithOptions } from 'markdown-it'
  const anchor: PluginWithOptions<any> & {
    permalink: {
      headerLink: (opts?: any) => any
      linkAfterHeader: (opts?: any) => any
      linkBeforeHeader: (opts?: any) => any
    }
  }
  export default anchor
}