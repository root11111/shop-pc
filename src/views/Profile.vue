<template>
  <div class="profile-page">
    <div class="container">
      <div class="page-header">
        <h1>个人中心</h1>
        <p>管理您的个人信息和账户设置</p>
      </div>

      <div class="profile-content">
        <div class="profile-sidebar">
          <div class="user-info">
            <div class="avatar">
              <el-avatar :size="80" :src="userInfo.avatar">
                {{ (userInfo.nickname || userInfo.username)?.charAt(0) || 'U' }}
              </el-avatar>
            </div>
            <div class="user-details">
              <h3>{{ userInfo.nickname || userInfo.username || '用户' }}</h3>
              <p class="user-account">账号：{{ userInfo.username || '无' }}</p>
              <p>{{ userInfo.email }}</p>
              <p v-if="userLevelName" class="user-level">
                <el-tag type="primary" size="small">{{ userLevelName }}</el-tag>
              </p>
            </div>
          </div>
          
          <div class="menu-list">
            <div 
              v-for="item in menuItems" 
              :key="item.key"
              class="menu-item"
              :class="{ active: activeMenu === item.key }"
              @click="activeMenu = item.key"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="profile-main">
          <!-- 基本信息 -->
          <div v-if="activeMenu === 'basic'" class="profile-section">
            <h2>基本信息</h2>
            <el-form :model="userInfo" label-width="100px" class="profile-form">
              <el-form-item label="用户账号">
                <el-input v-model="userInfo.username" disabled />
                <div class="field-tip">用户账号不可修改</div>
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="userInfo.nickname" />
              </el-form-item>
              <el-form-item label="会员类型">
                <el-input v-model="userLevelName" disabled />
                <div class="field-tip">会员类型不可修改</div>
              </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userInfo.email" />
        </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="userInfo.phone" />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="userInfo.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                  <el-radio label="other">其他</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日">
                <el-date-picker
                  v-model="userInfo.birthday"
                  type="date"
                  placeholder="选择生日"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveBasicInfo">保存</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 收货地址 -->
          <div v-if="activeMenu === 'address'" class="profile-section">
            <div class="section-header">
              <h2>收货地址</h2>
              <el-button type="primary" @click="addAddress">添加地址</el-button>
            </div>
            <div v-if="addresses.length === 0" class="empty-state">
              <p>暂无收货地址</p>
              <el-button type="primary" @click="addAddress">添加地址</el-button>
            </div>
            <div v-else class="address-list">
              <div 
                v-for="address in addresses" 
                :key="address.ud_id"
                class="address-card"
              >
                <div class="address-info">
                  <div class="address-header">
                    <span class="name">{{ address.ud_name }}</span>
                    <span class="phone">{{ address.ud_mobile }}</span>
                    <el-tag v-if="address.ud_is_default" type="success" size="small">默认</el-tag>
                  </div>
                  <div class="address-detail">{{ address.ud_address }}</div>
                </div>
                <div class="address-actions">
                  <el-button size="small" @click="editAddress(address)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteAddress(address)">删除</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 订单管理 -->
          <div v-if="activeMenu === 'orders'" class="profile-section">
            <h2>订单管理</h2>
            <div class="order-stats">
              <div class="stat-item">
                <div class="stat-number">{{ orderStats.pending }}</div>
                <div class="stat-label">待付款</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ orderStats.shipped }}</div>
                <div class="stat-label">待收货</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ orderStats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
            <el-button type="primary" @click="goToOrders">查看全部订单</el-button>
          </div>

          <!-- 安全设置 -->
          <div v-if="activeMenu === 'security'" class="profile-section">
            <h2>安全设置</h2>
            <div class="security-items">
              <div class="security-item">
                <div class="item-info">
                  <h3>修改密码</h3>
                  <p>定期修改密码有助于保护账户安全</p>
                </div>
                <el-button @click="changePassword">修改密码</el-button>
              </div>
              <div class="security-item">
                <div class="item-info">
                  <h3>绑定手机</h3>
                  <p>已绑定手机号：{{ userInfo.phone || '未绑定' }}</p>
                </div>
                <el-button @click="bindPhone">绑定手机</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, MapLocation, Document, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getAddressList } from '@/api/address'
import { getOrderList } from '@/api/order'
import request from '@/api/request'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('basic')

// 使用用户store中的数据
const userInfo = computed(() => userStore.userInfo || {
  nickname: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  avatar: '',
  user_level_name: ''
})

const menuItems = [
  { key: 'basic', label: '基本信息', icon: 'User' },
  { key: 'address', label: '收货地址', icon: 'MapLocation' },
  { key: 'orders', label: '订单管理', icon: 'Document' },
  { key: 'security', label: '安全设置', icon: 'Lock' }
]

const addresses = ref([])
const orderStats = reactive({
  pending: 0,
  shipped: 0,
  completed: 0
})

// 会员类型映射表
const userLevelMap = ref({})
// 计算会员类型名称
const userLevelName = computed(() => {
  console.log('计算会员类型名称:', {
    user_level_id: userInfo.value?.user_level_id,
    user_level_name: userInfo.value?.user_level_name,
    userLevelMap: userLevelMap.value
  })
  
  if (!userInfo.value?.user_level_id || !userLevelMap.value) {
    const fallback = userInfo.value?.user_level_name || '普通会员'
    console.log('使用回退值:', fallback)
    return fallback
  }
  
  const mappedName = userLevelMap.value[userInfo.value.user_level_id]
  const result = mappedName || userInfo.value?.user_level_name || '普通会员'
  console.log('映射结果:', { mappedName, result })
  return result
})

// 加载地址列表
const loadAddresses = async () => {
  try {
    const response = await getAddressList()
    if (response && response.code === 0) {
      addresses.value = response.data?.items || []
    }
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

// 加载订单统计
const loadOrderStats = async () => {
  try {
    const response = await getOrderList({ page: 1, size: 1000 })
    if (response && response.code === 0) {
      const orders = response.data?.items || []
      
      // 统计订单状态
      orderStats.pending = orders.filter(order => order.order_state === 1).length // 待付款
      orderStats.shipped = orders.filter(order => order.order_state === 3).length // 待收货
      orderStats.completed = orders.filter(order => order.order_state === 4).length // 已完成
    }
  } catch (error) {
    console.error('加载订单统计失败:', error)
  }
}

// 加载会员类型映射表
const loadUserLevelMap = async () => {
  try {
    // 调用系统配置信息接口获取会员类型映射
    const response = await request({
      url: '/front/sys/config/info',
      method: 'get'
    })
    
    if (response && response.code === 0) {
      userLevelMap.value = response.data?.user_level_map || {}
      console.log('会员类型映射表:', userLevelMap.value)
    }
  } catch (error) {
    console.error('加载会员类型映射表失败:', error)
  }
}

const saveBasicInfo = () => {
  ElMessage.success('保存成功')
}

const addAddress = () => {
  router.push('/address')
}

const editAddress = (address) => {
  router.push(`/address?edit=${address.ud_id}`)
}

const deleteAddress = (address) => {
  ElMessage.info('删除地址功能待开发')
}

const goToOrders = () => {
  router.push('/orders')
}

const changePassword = () => {
  ElMessage.info('修改密码功能待开发')
}

const bindPhone = () => {
  ElMessage.info('绑定手机功能待开发')
}

onMounted(async () => {
  // 确保用户信息是最新的
  if (userStore.isLoggedIn) {
    await userStore.fetchUserInfo()
  }
  
  // 加载会员类型映射表
  await loadUserLevelMap()
  
  // 加载地址和订单数据
  await loadAddresses()
  await loadOrderStats()
})
</script>

<style scoped>
.profile-page {
  padding: 20px 0;
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.profile-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.profile-sidebar {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.user-info {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar {
  margin-bottom: 16px;
}

.user-details h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
}

.user-details p {
  color: #666;
  font-size: 14px;
}

.user-account {
  color: #999;
  font-size: 12px;
  margin-bottom: 4px;
}

.user-level {
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 16px;
  font-size: 16px;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.menu-item:hover {
  background: #f8f9fa;
  color: #333;
}

.menu-item.active {
  background: #e6f7ff;
  color: #1890ff;
}

.profile-main {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.profile-form {
  max-width: 500px;
}

.field-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.address-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.name {
  font-weight: 500;
  color: #333;
}

.phone {
  color: #666;
}

.address-detail {
  color: #666;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.order-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.item-info h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.item-info p {
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .profile-sidebar {
    order: 2;
  }
  
  .profile-main {
    order: 1;
  }
  
  .order-stats {
    grid-template-columns: 1fr;
  }
  
  .address-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .address-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
