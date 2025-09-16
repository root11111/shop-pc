import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import config from '@/config'

export const useSettingsStore = defineStore('settings', () => {
  // 状态 - 使用配置文件的默认值
  const title = ref(config.title)
  const subtitle = ref(config.subtitle)
  const description = ref(config.description)
  const logo = ref(config.logo)
  const language = ref(config.i18n)
  const copyright = ref(config.copyright)

  console.log('设置 store 初始化，默认值:', {
    title: title.value,
    subtitle: subtitle.value,
    description: description.value
  })

  // 计算属性
  const getTitle = computed(() => title.value)
  const getSubtitle = computed(() => subtitle.value)
  const getDescription = computed(() => description.value)
  const getLogo = computed(() => logo.value)
  const getLanguage = computed(() => language.value)
  const getCopyright = computed(() => copyright.value)

  // 方法
  const setTitle = (newTitle) => {
    title.value = newTitle
    localStorage.setItem('app_title', newTitle)
  }

  const setSubtitle = (newSubtitle) => {
    subtitle.value = newSubtitle
    localStorage.setItem('app_subtitle', newSubtitle)
  }

  const setDescription = (newDescription) => {
    description.value = newDescription
    localStorage.setItem('app_description', newDescription)
  }

  const setLogo = (newLogo) => {
    logo.value = newLogo
    localStorage.setItem('app_logo', newLogo)
  }

  const setLanguage = (newLanguage) => {
    language.value = newLanguage
    localStorage.setItem('app_language', newLanguage)
  }

  const setCopyright = (newCopyright) => {
    copyright.value = newCopyright
    localStorage.setItem('app_copyright', newCopyright)
  }

  // 初始化设置
  const initSettings = () => {
    console.log('初始化设置...')
    const storedTitle = localStorage.getItem('app_title')
    const storedSubtitle = localStorage.getItem('app_subtitle')
    const storedDescription = localStorage.getItem('app_description')
    const storedLogo = localStorage.getItem('app_logo')
    const storedLanguage = localStorage.getItem('app_language')
    const storedCopyright = localStorage.getItem('app_copyright')

    console.log('存储的设置:', {
      storedTitle,
      storedSubtitle,
      storedDescription,
      storedLogo,
      storedLanguage,
      storedCopyright
    })

    if (storedTitle) title.value = storedTitle
    if (storedSubtitle) subtitle.value = storedSubtitle
    if (storedDescription) description.value = storedDescription
    if (storedLogo) logo.value = storedLogo
    if (storedLanguage) language.value = storedLanguage
    if (storedCopyright) copyright.value = storedCopyright

    console.log('当前设置:', {
      title: title.value,
      subtitle: subtitle.value,
      description: description.value,
      logo: logo.value,
      language: language.value,
      copyright: copyright.value
    })
  }

  return {
    // 状态
    title,
    subtitle,
    description,
    logo,
    language,
    copyright,
    // 计算属性
    getTitle,
    getSubtitle,
    getDescription,
    getLogo,
    getLanguage,
    getCopyright,
    // 方法
    setTitle,
    setSubtitle,
    setDescription,
    setLogo,
    setLanguage,
    setCopyright,
    initSettings
  }
})
