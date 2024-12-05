import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize dark mode based on localStorage or system preference
  const isDark = ref(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  // Watch for changes and update localStorage
  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
  })

  // Toggle theme function
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleTheme
  }
}) 