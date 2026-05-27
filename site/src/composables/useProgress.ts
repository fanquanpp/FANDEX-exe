import { ref, watchEffect } from 'vue'
import type { ReadProgress } from '@/types'

const STORAGE_KEY = 'mynotebook-read-progress'

const progress = ref<ReadProgress>({})

try {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) progress.value = JSON.parse(saved)
} catch {}

watchEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress.value))
  } catch {}
})

export function useProgress() {
  function markAsRead(path: string) {
    progress.value[path] = true
  }

  function markAsUnread(path: string) {
    delete progress.value[path]
  }

  function isRead(path: string): boolean {
    return !!progress.value[path]
  }

  function getReadCount(paths: string[]): number {
    return paths.filter(p => isRead(p)).length
  }

  function getProgressPercent(paths: string[]): number {
    if (paths.length === 0) return 0
    return Math.round((getReadCount(paths) / paths.length) * 100)
  }

  function toggleRead(path: string) {
    if (isRead(path)) {
      markAsUnread(path)
    } else {
      markAsRead(path)
    }
  }

  return {
    progress,
    markAsRead,
    markAsUnread,
    isRead,
    getReadCount,
    getProgressPercent,
    toggleRead,
  }
}