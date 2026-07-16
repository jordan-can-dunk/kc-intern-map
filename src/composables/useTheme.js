import { ref } from 'vue'

// index.html sets data-theme before first paint; read it as the initial value.
const theme = ref(document.documentElement.dataset.theme || 'dark')

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value
    try {
      localStorage.setItem('fca-theme', theme.value)
    } catch {
      /* private mode — theme just won't persist */
    }
  }

  return { theme, toggleTheme }
}
