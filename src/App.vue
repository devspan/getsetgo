<template>
  <v-app :theme="theme">
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

    <!-- Global Alert Component -->
    <v-snackbar
      v-model="showAlert"
      :color="alertType"
      location="bottom right"
      class="mb-4"
    >
      {{ alertMessage }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showAlert = false"
        >
          Close
        </v-btn>
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

const route = useRoute()
const pageName = ref("")
const theme = ref('light')
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref('info')

// Theme toggle function (can be used later)
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

useHead({
  title: `${localConfig.title}`,
  titleTemplate: (title) => `${title} - Admin Panel`,
})

watch(
  () => route.name,
  (newValue) => {
    pageName.value = newValue ? newValue.toString() : "";
  }
);

// Global alert function that can be used throughout the app
const showGlobalAlert = (message, type = 'info') => {
  alertMessage.value = message
  alertType.value = type
  showAlert.value = true
}

// Expose the alert function globally
window.$showAlert = showGlobalAlert
</script>

<style>
.login {
  background: linear-gradient(135deg, var(--primary), #3D5AFE);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-application {
  background-color: var(--background) !important;
}
</style>
