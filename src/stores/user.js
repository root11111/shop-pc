import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('ukey') || null)
  
  // 计算属性
  const isLoggedIn = computed(() => {
    return !!(token.value && userInfo.value)
  })
  
  // 登录
  const login = (userData, userToken) => {
    userInfo.value = userData
    token.value = userToken
    localStorage.setItem('ukey', userToken)
    localStorage.setItem('userInfo', JSON.stringify(userData))
  }
  
  // 登出
  const logout = () => {
    console.log('用户退出登录')
    userInfo.value = null
    token.value = null
    localStorage.removeItem('ukey')
    localStorage.removeItem('userInfo')
    // 清除购物车数据
    localStorage.removeItem('cartItems')
    console.log('用户状态已清除')
  }
  
  // 初始化用户信息
  const initUserInfo = () => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo && token.value) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }
  
  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
  }
  
  // 获取完整用户信息（包括会员类型）
  const fetchUserInfo = async () => {
    if (!token.value) return null
    
    try {
      console.log('开始获取用户信息...')
      const response = await getUserInfo()
      console.log('用户信息API响应:', response)
      
      if (response && response.code === 0) {
        const userData = response.data
        console.log('原始用户数据:', userData)
        console.log('user_level_id:', userData?.user_level_id)
        console.log('user_level_name:', userData?.user_level_name)
        
        const fullUserInfo = {
          id: userData?.user_id || userData?.id,
          username: userData?.user_account || userData?.user_name || userData?.username,
          nickname: userData?.user_nickname || userData?.nickname || userData?.user_account || userData?.user_name || userData?.username,
          email: userData?.user_email || userData?.email,
          avatar: userData?.user_avatar || userData?.avatar,
          user_level_id: userData?.user_level_id,
          user_level_name: userData?.user_level_name
        }
        
        // 如果有会员类型名称，创建会员类型对象
        if (fullUserInfo.user_level_name) {
          fullUserInfo.user_level = {
            user_level_id: fullUserInfo.user_level_id,
            user_level_name: fullUserInfo.user_level_name
          }
          console.log('创建会员类型对象:', fullUserInfo.user_level)
        } else {
          console.log('没有会员类型名称，user_level_id:', fullUserInfo.user_level_id)
        }
        
        console.log('处理后的用户信息:', fullUserInfo)
        userInfo.value = fullUserInfo
        localStorage.setItem('userInfo', JSON.stringify(fullUserInfo))
        return fullUserInfo
      } else {
        console.log('用户信息API返回错误:', response)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    
    return null
  }
  
  return {
    userInfo,
    token,
    isLoggedIn,
    login,
    logout,
    initUserInfo,
    updateUserInfo,
    fetchUserInfo
  }
})