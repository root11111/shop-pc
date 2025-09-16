<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <router-link to="/">
            <img src="/logo.svg" :alt="settingsStore.getTitle" class="logo-img" />
                   <span class="logo-text">{{ settingsStore.getTitle }}</span>
          </router-link>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('common.search') + '商品名称或商品ID...'"
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleClear"
          clearable
        >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch" class="search-btn">
            {{ $t('common.search') }}
          </el-button>
          <el-button type="default" @click="goToProducts" class="products-btn">
            <el-icon><Grid /></el-icon>
            商品列表
          </el-button>
        </div>

        <!-- 用户操作区 -->
        <div class="user-actions">
          <!-- 语言切换 -->
          <LanguageSwitcher />
          
          <!-- 购物车 -->
          <div class="cart-icon" @click="goToCart">
            <el-badge :value="cartCount" :hidden="cartCount === 0">
              <el-icon size="24"><ShoppingCart /></el-icon>
            </el-badge>
            <span class="cart-text">{{ $t('common.cart') }}</span>
          </div>

          <!-- 用户菜单 -->
          <div class="user-menu" v-if="isLoggedIn">
            <el-dropdown @command="handleUserCommand">
              <div class="user-avatar">
                <el-avatar :size="32" :src="userInfo.avatar">
                  {{ userInfo.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <div class="user-info">
                  <span class="user-name">{{ userInfo.nickname || '用户' }}</span>
                  <el-tag v-if="userLevelName" :type="getUserLevelTagType(userInfo)" size="small" class="user-level-tag">
                    {{ userLevelName }}
                  </el-tag>
                </div>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">{{ $t('common.profile') }}</el-dropdown-item>
                  <el-dropdown-item command="orders">{{ $t('common.orders') }}</el-dropdown-item>
                  <el-dropdown-item command="favorites">{{ $t('common.favorites') }}</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>{{ $t('common.logout') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 登录/注册按钮 -->
          <div class="auth-buttons" v-else>
            <el-button @click="goToLogin">{{ $t('common.login') }}</el-button>
            <el-button type="primary" @click="goToRegister">{{ $t('common.register') }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useCartStore } from '../../stores/cart'
import { useSettingsStore } from '../../stores/settings'
import { Search, ShoppingCart, ArrowDown, Grid } from '@element-plus/icons-vue'
import LanguageSwitcher from '../LanguageSwitcher.vue'
import request from '../../api/request'
import { getSearchInfo } from '../../api/search'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()

const searchKeyword = ref('')

// 会员类型映射表
const userLevelMap = ref({})

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const cartCount = computed(() => cartStore.totalCount)

// 计算会员类型名称
const userLevelName = computed(() => {
  if (!userInfo.value?.user_level_id || !userLevelMap.value) {
    return userInfo.value?.user_level_name || '普通会员'
  }
  return userLevelMap.value[userInfo.value.user_level_id] || userInfo.value?.user_level_name || '普通会员'
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchKeyword.value.trim() }
    })
  }
}

// 清除搜索内容
const handleClear = () => {
  searchKeyword.value = ''
  console.log('Header搜索内容已清除')
}

const goToCart = () => {
  router.push('/cart')
}

const goToProducts = () => {
  router.push('/products')
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'orders':
      router.push('/orders')
      break
    case 'favorites':
      // 跳转到收藏页面
      router.push('/favorites')
      break
    case 'logout':
      userStore.logout()
      // 退出登录后直接跳转到登录页面
      router.push('/login')
      break
  }
}

// 加载会员类型映射表
const loadUserLevelMap = async () => {
  try {
    const response = await request({
      url: '/front/sys/config/info',
      method: 'get'
    })
    
    if (response && response.code === 0) {
      userLevelMap.value = response.data?.user_level_map || {}
      console.log('Header会员类型映射表:', userLevelMap.value)
    }
  } catch (error) {
    console.error('Header加载会员类型映射表失败:', error)
  }
}

// 获取会员类型标签类型
const getUserLevelTagType = (userInfo) => {
  const levelName = userLevelName.value.toLowerCase()
  
  if (levelName.includes('vip') || levelName.includes('gold') || levelName.includes('钻石')) {
    return 'danger'
  } else if (levelName.includes('platinum') || levelName.includes('白金') || levelName.includes('高级')) {
    return 'warning'
  } else if (levelName.includes('silver') || levelName.includes('银') || levelName.includes('中级')) {
    return 'success'
  } else if (levelName.includes('bronze') || levelName.includes('铜') || levelName.includes('初级')) {
    return 'primary'
  }
  
  return 'info'
}

// 组件挂载时获取用户信息
onMounted(async () => {
  console.log('Header组件挂载，当前用户状态:', {
    isLoggedIn: userStore.isLoggedIn,
    userInfo: userStore.userInfo
  })
  
  // 加载会员类型映射表
  await loadUserLevelMap()
  
  if (userStore.isLoggedIn) {
    // 如果用户已登录，尝试获取完整用户信息（包括会员类型）
    await userStore.fetchUserInfo()
    console.log('Header获取用户信息后:', userStore.userInfo)
  }
})
</script>

<style scoped>
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.logo-img {
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-input {
  flex: 1;
  margin-right: 10px;
}

.search-btn {
  height: 40px;
}

.products-btn {
  height: 40px;
  margin-left: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  color: #495057;
  font-weight: 500;
  transition: all 0.3s ease;
}

.products-btn:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  border-color: #adb5bd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.cart-icon:hover {
  background-color: #f5f5f5;
}

.cart-text {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-avatar:hover {
  background-color: #f5f5f5;
}

.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 8px;
  gap: 8px;
}

.user-name {
  font-size: 14px;
}

.user-level-tag {
  font-size: 10px;
  height: 18px;
  line-height: 16px;
  padding: 0 6px;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 0;
  }
  
  .search-box {
    order: 3;
    width: 100%;
    margin: 10px 0 0 0;
    flex-direction: column;
    gap: 8px;
  }
  
  .search-input {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .search-btn, .products-btn {
    flex: 1;
    margin-left: 0;
  }
  
  .user-actions {
    gap: 10px;
  }
  
  .cart-text {
    display: none;
  }
}
</style>
