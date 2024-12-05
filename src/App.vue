<template>
  <v-app :theme="themeStore.isDark ? 'dark' : 'light'">
    <SideBar v-if="pageName !== 'Login'" />
    <v-main 
      :class="{
        'login': pageName === 'Login',
        'bg-background': true,
      }"
      class="min-h-screen transition-all"
    >
      <div 
        v-if="pageName !== 'Login'"
        class="p-6 max-w-[1920px] mx-auto"
      >
        <router-view />
      </div>
      <router-view v-else />
    </v-main>

    <v-snackbar
      v-model="showAlert"
      :color="alertType"
      location="bottom right"
      class="mb-4"
    >
      {{ alertMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showAlert = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue';
import SideBar from './components/layout/SideBar.vue'
import { useRoute } from 'vue-router'
import localConfig from "./local_config"
import { useHead } from '@vueuse/head'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const route = useRoute()
const pageName = ref("")
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref('info')

useHead({
  title: `${localConfig.title}`,
  titleTemplate: (title) => `${title} - Admin Panel`,
})

watch(
  () => route.name,
  (name) => {
    pageName.value = name;
  }
);

// Global alert function
const showGlobalAlert = (message, type = 'info') => {
  alertMessage.value = message
  alertType.value = type
  showAlert.value = true
}

// Expose the alert function globally
window.$showAlert = showGlobalAlert
</script>

<style>
:root {
  color-scheme: light dark;
}

.v-application {
  background-color: rgb(var(--v-theme-background)) !important;
}

.v-theme--dark {
  --v-theme-overlay-multiplier: 0.8;
}

/* Transition effects */
.v-application *,
.v-application *::before,
.v-application *::after {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>
