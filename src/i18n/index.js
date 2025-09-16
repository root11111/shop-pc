import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN.js'
import enUS from '../locales/en-US.js'
import esES from '../locales/es-ES.js'

// 获取浏览器语言设置
const getDefaultLocale = () => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale) {
    return savedLocale
  }
  
  const browserLocale = navigator.language || navigator.languages[0]
  if (browserLocale.startsWith('zh')) {
    return 'zh-CN'
  } else if (browserLocale.startsWith('es')) {
    return 'es-ES'
  } else {
    return 'zh-CN' // 默认中文
  }
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'es-ES': esES
  }
})

// 导出切换语言的方法
export const changeLocale = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

export default i18n
