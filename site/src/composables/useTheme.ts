import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mynotebook-theme'

const theme = ref<Theme>('light')

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
}

try {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (saved === 'dark' || saved === 'light') {
    theme.value = saved
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
} catch {}

applyTheme(theme.value)

watchEffect(() => {
  applyTheme(theme.value)
  try {
    localStorage.setItem(STORAGE_KEY, theme.value)
  } catch {}
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}