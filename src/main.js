import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import { useSettingsStore } from './stores/settings'
import i18n from './i18n'
import './assets/styles/main.css'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)

// 初始化用户状态
const userStore = useUserStore()
userStore.initUserInfo()

// 初始化设置
const settingsStore = useSettingsStore()
settingsStore.initSettings()

app.mount('#app')