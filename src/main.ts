import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import initRouter from "../src/router"
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'
import { createHead } from "@vueuse/head"
import localConfig from './local_config'

const pinia = createPinia()

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          ...localConfig.theme.colors,
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-surface': '#1E293B',
          'border': '#E2E8F0',
          'divider': '#E2E8F0',
        }
      },
      dark: {
        dark: true,
        colors: {
          ...localConfig.theme.dark,
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-surface': '#F8FAFC',
          'border': '#334155',
          'divider': '#334155',
        }
      }
    }
  }
})

export const app = createApp(App);
const head = createHead()

app.use(vuetify)
app.use(initRouter)
app.use(pinia)
app.use(head)
// eslint-disable-next-line vue/multi-word-component-names
app.mount("#app");