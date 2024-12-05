<template>
  <v-navigation-drawer
    v-model="isDrawerOpen"
    :rail="isRailMode"
    @click="isRailMode = false"
    permanent
    :color="themeStore.isDark ? 'surface' : 'white'"
    class="sidebar-nav"
    :width="320"
    :rail-width="68"
    :theme="themeStore.isDark ? 'dark' : 'light'"
  >
    <!-- Fixed Header -->
    <div class="sidebar-header">
      <div class="d-flex align-center">
        <v-btn
          variant="text"
          icon="mdi-menu"
          class="toggle-btn"
          @click.stop="isRailMode = !isRailMode"
        />
        <transition name="fade">
          <div v-if="!isRailMode" class="brand-content">
            <h1 class="brand-title">{{ localConfig.title }}</h1>
            <span class="brand-subtitle">Admin Control Panel</span>
          </div>
        </transition>
      </div>
      
      <transition name="fade">
        <div v-if="!isRailMode" class="user-menu">
          <v-btn
            class="user-btn"
            variant="flat"
          >
            <v-avatar size="40" color="primary" class="mr-3">
              <span class="text-h6 font-weight-medium">A</span>
            </v-avatar>
            <div class="user-info">
              <span class="user-name">Administrator</span>
              <span class="user-role">Super Admin</span>
            </div>
            <v-icon icon="mdi-chevron-down" size="20" class="ml-2" />
          </v-btn>
        </div>
      </transition>
    </div>

    <!-- Scrollable Content -->
    <div class="sidebar-content">
      <!-- Search -->
      <transition name="fade">
        <div v-if="!isRailMode" class="search-container">
          <v-text-field
            v-model="searchQuery"
            density="comfortable"
            variant="outlined"
            placeholder="Search navigation..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="search-field"
            bg-color="rgba(var(--v-theme-surface), 0.5)"
          />
        </div>
      </transition>

      <!-- Navigation -->
      <v-list class="nav-list" nav>
        <template v-for="(item, i) in filteredItems" :key="i">
          <!-- Section Header -->
          <template v-if="item.heading && !isRailMode">
            <div class="nav-section-header">
              <span class="nav-section-line"></span>
              <span class="nav-section-text">{{ item.heading }}</span>
              <span class="nav-section-line"></span>
            </div>
          </template>

          <!-- Navigation Item -->
          <v-list-item
            v-else-if="item.icon"
            :to="`/page/${item.link === '/' ? 'dashboard' : item.link.name}`"
            :prepend-icon="getIcon(item.icon)"
            :title="item.text"
            rounded="lg"
            class="nav-item"
            :active="route.path.includes(item.link?.name)"
            :tooltip="isRailMode ? item.text : undefined"
            :tooltip-location="isRailMode ? 'right' : undefined"
          >
            <template v-slot:prepend>
              <v-icon size="24" class="nav-icon" />
            </template>
          </v-list-item>
          
          <!-- Divider -->
          <v-divider
            v-else-if="!item.link && !item.heading"
            class="nav-divider"
          />
        </template>
      </v-list>
    </div>

    <!-- Fixed Footer -->
    <div class="sidebar-footer">
      <v-btn
        v-if="!isRailMode"
        variant="tonal"
        class="action-btn mb-3"
        prepend-icon="mdi-cog-outline"
        block
      >
        Settings
      </v-btn>

      <v-btn
        variant="tonal"
        :class="['theme-btn', { 'rail-mode': isRailMode }]"
        @click="themeStore.toggleTheme"
        block
      >
        <template v-if="!isRailMode">
          <v-icon 
            :icon="themeStore.isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
            size="22"
            class="mr-2"
          />
          {{ themeStore.isDark ? 'Dark Mode' : 'Light Mode' }}
        </template>
        <template v-else>
          <v-icon 
            :icon="themeStore.isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
            size="22"
          />
        </template>
      </v-btn>

      <v-btn
        v-if="!isRailMode"
        variant="text"
        class="action-btn mt-3"
        color="error"
        prepend-icon="mdi-logout"
        @click="logout"
        block
      >
        Logout
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import localConfig from '@/local_config'
import { useNavStore } from '@/stores/nav'
import axios from "@/plugins/axios"
import router from "@/router"

const route = useRoute()
const themeStore = useThemeStore()
const nav = useNavStore()
const apiKey = localConfig.api

const isDrawerOpen = ref(true)
const isRailMode = ref(false)
const searchQuery = ref('')
const navigation = ref([])
const resources = ref([])

// Filter navigation items based on search
const filteredItems = computed(() => {
  if (!searchQuery.value) return navigation.value
  
  const query = searchQuery.value.toLowerCase()
  return navigation.value.filter(item => {
    if (item.heading) return true
    if (!item.text) return false
    return item.text.toLowerCase().includes(query)
  })
})

// Fetch navigation items
const getNavigation = async () => {
  if (!window.location.href.includes("/login")) {
    try {
      const response = await axios.get(`${apiKey}navigation/`)
      navigation.value = response.data
      nav.setNavigation(response.data)
    } catch (error) {
      if (
        error?.response?.data?.type === "authentication_failed" ||
        error?.response?.data?.code?.code === "token_not_valid" ||
        error?.response?.data?.type === "not_authenticated"
      ) {
        router.push({ name: "Login" })
      }
    }
  }
}

// Fetch resources
const getResources = async () => {
  try {
    const response = await axios.get(`${apiKey}resources/`)
    resources.value = response.data
    nav.setResources(response.data)
  } catch (error) {
    console.error('Error fetching resources:', error)
  }
}

// Logout function
const logout = () => {
  localStorage.setItem("jwt_token", "")
  router.push({ name: "Login" })
}

// Initialize data
onBeforeMount(() => {
  getNavigation()
  getResources()
})

// Updated icon mapping
const getIcon = (icon) => {
  const iconMap = {
    'mdi-view-dashboard': 'mdi-view-grid-outline',
    'mdi-account': 'mdi-account-group-outline',
    'mdi-cog': 'mdi-cog-outline',
    'mdi-currency-usd': 'mdi-cash-multiple',
    'mdi-chart-bar': 'mdi-chart-box-outline',
    'mdi-shield': 'mdi-shield-check-outline',
    'mdi-history': 'mdi-clock-outline',
    'mdi-bank': 'mdi-bank-outline',
    'mdi-account-key': 'mdi-account-key-outline',
    'mdi-security': 'mdi-security',
    // Add more mappings as needed
  }
  return iconMap[icon] || icon
}
</script>

<style scoped>
.sidebar-nav {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.sidebar-header {
  flex-shrink: 0;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-footer {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
}

.nav-section-header {
  display: flex;
  align-items: center;
  padding: 24px 12px 12px;
  gap: 12px;
}

.nav-section-line {
  flex-grow: 1;
  height: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
}

.nav-section-text {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
}

.nav-item {
  height: 48px;
  margin: 4px 8px;
  padding: 0 12px;
  font-size: 0.9375rem;
  font-weight: 500;
}

.nav-icon {
  font-size: 24px;
}

.nav-list {
  padding: 8px 0;
}

.action-btn,
.theme-btn {
  height: 48px;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.25px;
  border-radius: 12px;
}

.sidebar-content::-webkit-scrollbar {
  width: 5px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(var(--v-border-color), 0.2);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-border-color), 0.3);
}

.toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.brand-content {
  margin-left: 12px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin: 0;
}

.brand-subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.7;
  margin-top: 2px;
}

.user-menu {
  margin-top: 16px;
}

.user-btn {
  height: 64px;
  width: 100%;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  margin-top: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: auto;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.15px;
  line-height: 1.4;
}

.user-role {
  font-size: 0.8125rem;
  font-weight: 500;
  opacity: 0.7;
}

.search-container {
  padding: 16px;
}

.search-field :deep(.v-field) {
  border-radius: 12px;
  font-size: 0.9375rem;
}

.nav-divider {
  margin: 16px 0;
  opacity: 0.08;
}

.nav-header {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  opacity: 0.7;
  margin: 32px 0 12px;
}

.action-btn {
  width: 100%;
  height: 44px;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.25px;
}

.theme-btn {
  width: 100%;
  height: 44px;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.25px;
}

.theme-btn.rail-mode {
  width: 44px;
  padding: 0;
  justify-content: center;
}

.nav-icon {
  opacity: 0.9;
}

:deep(.v-list-item--active) {
  font-weight: 600;
  background: rgba(var(--v-theme-primary), 0.1) !important;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Add subtle hover effects */
.nav-item:hover:not(.v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.05);
}

.action-btn:hover,
.theme-btn:hover {
  transform: translateY(-1px);
}
</style>
