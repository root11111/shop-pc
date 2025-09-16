<template>
  <div class="language-dropdown-container">
    <el-dropdown @command="handleLanguageChange" trigger="click" class="language-dropdown" :hide-on-click="false">
      <el-button type="text" class="language-switcher">
        <div class="language-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
        </div>
        <span>{{ currentLanguageName }}</span>
        <el-icon><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu class="language-dropdown-menu">
          <el-dropdown-item 
            v-for="lang in languages" 
            :key="lang.code"
            :command="lang.code"
            :class="{ active: currentLocale === lang.code }"
            class="language-dropdown-item"
          >
            <span class="language-flag">{{ lang.flag }}</span>
            <span class="language-name">{{ lang.name }}</span>
            <el-icon v-if="currentLocale === lang.code" class="check-icon">
              <Check />
            </el-icon>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { changeLocale } from '../i18n'
import { ArrowDown, Check } from '@element-plus/icons-vue'

const { locale } = useI18n()

const languages = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
]

const currentLocale = computed(() => locale.value)

const currentLanguageName = computed(() => {
  const current = languages.find(lang => lang.code === currentLocale.value)
  return current ? current.name : '中文'
})

const handleLanguageChange = (langCode) => {
  changeLocale(langCode)
}
</script>

<style scoped>
.language-dropdown-container {
  position: relative;
}

.language-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-weight: 500;
}

.language-switcher:hover {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(0, 153, 204, 0.3));
  border-color: #00d4ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.5);
  color: #00d4ff;
}

.language-switcher:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);
}

.language-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
}

.language-icon svg {
  width: 12px;
  height: 12px;
  filter: brightness(0) invert(1);
}

.language-switcher:hover .language-icon {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.5);
}

.language-flag {
  margin-right: 8px;
  font-size: 16px;
}

.language-name {
  flex: 1;
  font-weight: 500;
}

.check-icon {
  color: #00d4ff;
  margin-left: 8px;
}

.active {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.1));
  color: #00d4ff;
}
</style>

<style>
/* 全局样式 - 强制显示下拉菜单 */
.language-dropdown .el-dropdown-menu {
  background: rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  padding: 8px 0 !important;
  margin-top: 8px !important;
  overflow: visible !important;
  z-index: 9999 !important;
  min-width: 160px !important;
}

.language-dropdown .el-dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(0, 0, 0, 0.3);
}

.language-dropdown .el-dropdown-menu .el-dropdown-menu__item {
  background: transparent !important;
  color: #ffffff !important;
  padding: 12px 20px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 8px !important;
  margin: 2px 8px !important;
  display: flex !important;
  align-items: center !important;
  white-space: nowrap !important;
  min-height: 40px !important;
  width: calc(100% - 16px) !important;
  box-sizing: border-box !important;
}

.language-dropdown .el-dropdown-menu .el-dropdown-menu__item:hover {
  background: rgba(0, 212, 255, 0.15) !important;
  backdrop-filter: blur(10px) !important;
  color: #00d4ff !important;
  transform: translateX(4px) !important;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
}

.language-dropdown .el-dropdown-menu .el-dropdown-menu__item:active {
  background: rgba(0, 212, 255, 0.25) !important;
  backdrop-filter: blur(10px) !important;
  transform: translateX(2px) !important;
  border: 1px solid rgba(0, 212, 255, 0.4) !important;
}

.language-dropdown .el-dropdown-menu .el-dropdown-menu__item.active {
  background: rgba(0, 212, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  color: #00d4ff !important;
  font-weight: bold !important;
  border: 1px solid rgba(0, 212, 255, 0.2) !important;
}
</style>
