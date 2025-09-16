<template>
  <div class="checkout-page">
    <div class="container">
      <div class="page-header">
        <h1>确认订单</h1>
        <p>请确认订单信息并完成支付</p>
      </div>

      <div class="checkout-content">
        <!-- 收货地址 -->
        <div class="section">
          <h2 class="section-title">收货地址</h2>
          <div v-if="loadingAddresses" class="loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载地址中...</span>
          </div>
          <div v-else-if="addresses.length === 0" class="no-address">
            <div class="no-address-content">
              <el-icon class="address-icon"><Location /></el-icon>
              <p>请添加收货地址</p>
              <p class="address-tip">您还没有收货地址，请先添加收货地址以便完成订单</p>
              <el-button @click="addAddress" type="primary" :icon="Plus">添加收货地址</el-button>
            </div>
          </div>
          <div v-else class="address-list">
            <div 
              v-for="address in addresses" 
              :key="address.ud_id"
              class="address-item"
              :class="{ active: selectedAddress && selectedAddress.ud_id === address.ud_id }"
              @click="selectedAddress = address"
            >
              <div class="address-info">
                <div class="address-header">
                  <span class="name">{{ address.ud_name }}</span>
                  <span class="phone">{{ address.ud_mobile }}</span>
                  <el-tag v-if="address.ud_is_default" type="primary" size="small">默认</el-tag>
                </div>
                <div class="address-detail">
                  {{ address.ud_province }} {{ address.ud_city }} {{ address.ud_county }}
                  {{ address.ud_address }}
                </div>
              </div>
              <div class="address-actions">
                <el-button size="small" @click.stop="editAddress(address)">编辑</el-button>
              </div>
            </div>
          </div>
          <el-button type="primary" @click="addAddress" class="add-address-btn">
            添加新地址
          </el-button>
        </div>

        <!-- 商品清单 -->
        <div class="section">
          <h2 class="section-title">商品清单</h2>
          <div class="order-items">
            <div 
              v-for="item in orderItems" 
              :key="item.id"
              class="order-item"
            >
              <div class="item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-spec" v-if="item.variant">
                  {{ item.variant.name }}
                </p>
              </div>
              <div class="item-price">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
              <div class="item-total">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 配送方式 -->
        <div class="section">
          <h2 class="section-title">配送方式</h2>
          <div class="delivery-options">
            <div 
              v-for="option in deliveryOptions" 
              :key="option.id"
              class="delivery-option"
              :class="{ active: selectedDelivery && selectedDelivery.id === option.id }"
              @click="selectedDelivery = option"
            >
              <div class="option-info">
                <div class="option-name">{{ option.name }}</div>
                <div class="option-desc">{{ option.description }}</div>
              </div>
              <div class="option-price">
                {{ option.price === 0 ? '免费' : `¥${option.price}` }}
              </div>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="section">
          <h2 class="section-title">支付方式</h2>
          <div class="payment-options">
            <div 
              v-for="option in paymentOptions" 
              :key="option.id"
              class="payment-option"
              :class="{ 
                active: selectedPayment && selectedPayment.id === option.id,
                disabled: !option.enabled
              }"
              @click="option.enabled && (selectedPayment = option)"
            >
              <div class="option-icon">
                <el-icon size="24">
                  <component :is="option.icon" />
                </el-icon>
              </div>
              <div class="option-name">
                {{ option.name }}
                <span v-if="!option.enabled" class="disabled-text">（暂未开放）</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单备注 -->
        <div class="section">
          <h2 class="section-title">订单备注</h2>
          <el-input
            v-model="orderNote"
            type="textarea"
            :rows="3"
            placeholder="请输入订单备注（选填）"
            maxlength="200"
            show-word-limit
          />
        </div>
      </div>

      <!-- 订单汇总 -->
      <div class="order-summary">
        <div class="summary-content">
          <div class="summary-row">
            <span>商品总价：</span>
            <span>¥{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>配送费：</span>
            <span>{{ selectedDelivery && selectedDelivery.price === 0 ? '免费' : `¥${selectedDelivery ? selectedDelivery.price : 0}` }}</span>
          </div>
          <div class="summary-row total">
            <span>应付总额：</span>
            <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="summary-actions">
          <el-button size="large" @click="goBack">返回购物车</el-button>
          <el-button 
            type="primary" 
            size="large"
            :loading="submitting"
            @click="submitOrder"
          >
            提交订单
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CreditCard, Wallet, Plus, Loading, Location, Money } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { createOrder } from '@/api/order'
import { getAddressList } from '@/api/address'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const userStore = useUserStore()

const submitting = ref(false)
const selectedAddress = ref(null)
const selectedDelivery = ref(null)
const selectedPayment = ref(null)
const orderNote = ref('')
const addresses = ref([])
const loadingAddresses = ref(false)

// 从购物车获取订单商品（只显示选中的商品）
const orderItems = computed(() => {
  // 如果URL中有选中的商品ID，则只显示选中的商品
  if (route.query.selectedItems) {
    const selectedItemIds = route.query.selectedItems.split(',').map(id => parseInt(id))
    return cartStore.cartItems
      .filter(item => selectedItemIds.includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        variant: { name: '默认' } // 可以根据需要添加变体信息
      }))
  }
  
  // 否则显示所有购物车商品
  return cartStore.cartItems.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    variant: { name: '默认' } // 可以根据需要添加变体信息
  }))
})

// 配送方式 - 根据用户会员类型动态生成
const deliveryOptions = computed(() => {
  const userLevelName = userStore.userInfo?.user_level_name || '普通会员'
  return [
    {
      id: 1,
      name: userLevelName,
      description: `专为${userLevelName}提供的配送服务`,
      price: 0
    }
  ]
})

const paymentOptions = ref([
  {
    id: 0,
    name: '线下支付',
    icon: 'Money',
    enabled: true
  },
  {
    id: 1,
    name: '微信支付',
    icon: 'Wallet',
    enabled: false
  },
  {
    id: 2,
    name: '支付宝',
    icon: 'Wallet',
    enabled: false
  },
  {
    id: 3,
    name: '银行卡',
    icon: 'CreditCard',
    enabled: false
  }
])

const subtotal = computed(() => {
  return orderItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

const totalAmount = computed(() => {
  return subtotal.value + (selectedDelivery.value ? selectedDelivery.value.price : 0)
})


// 加载地址列表
const loadAddresses = async () => {
  loadingAddresses.value = true
  try {
    const response = await getAddressList()
    console.log('地址列表响应:', response)
    
    if (response && response.code === 0) {
      // 根据后端返回的数据结构，地址列表在data.items中
      addresses.value = response.data?.items || response.data?.records || response.items || response.data || []
      // 设置默认地址
      const defaultAddress = addresses.value.find(addr => addr.ud_is_default)
      if (defaultAddress) {
        selectedAddress.value = defaultAddress
      } else if (addresses.value.length > 0) {
        selectedAddress.value = addresses.value[0]
      }
    } else {
      // 如果是401错误或登录相关错误，不显示错误提示，直接显示空状态
      if (response && (response.code === 401 || (response.msg && response.msg.includes('登录')))) {
        console.log('用户未登录或需要重新登录，显示添加地址界面')
        addresses.value = []
      } else {
        ElMessage.error(response && response.msg ? response.msg : '获取地址列表失败')
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    // 如果是401错误或登录相关错误，不显示错误提示
    if (error.response && error.response.status === 401) {
      console.log('用户未登录，显示添加地址界面')
      addresses.value = []
    } else if (error.message && error.message.includes('登录')) {
      console.log('用户未登录，显示添加地址界面')
      addresses.value = []
    } else {
      ElMessage.error('获取地址列表失败')
    }
  } finally {
    loadingAddresses.value = false
  }
}

// 添加地址
const addAddress = () => {
  router.push({
    path: '/address',
    query: { from: 'checkout' }
  })
}

// 编辑地址
const editAddress = (address) => {
  router.push({
    path: '/address',
    query: { 
      from: 'checkout',
      edit: address.ud_id 
    }
  })
}

const goBack = () => {
  router.back()
}

const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (!selectedDelivery.value) {
    ElMessage.warning('请选择配送方式')
    return
  }
  
  if (!selectedPayment.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  submitting.value = true
  
  try {
    // 构建订单数据 - 使用后端OrderAddReq的字段名（驼峰格式）
    const orderData = {
      // 收货地址
      udId: selectedAddress.value.ud_id,
      
      // 配送方式
      deliveryTypeId: selectedDelivery.value.id === 1 ? 10 : 5, // 10=配送, 5=自提
      
      // 支付方式
      paymentTypeId: selectedPayment.value.id === 0 ? 2 : 1, // 0=线下支付(货到付款), 其他=在线支付
      
      // 商品信息 - 小程序格式：商品ID|数量|购物车ID
      cartId: orderItems.value.map(item => `${item.id}|${item.quantity}|${item.id}`).join(','),
      
      // 订单备注 - 小程序格式：JSON字符串
      orderMessage: orderNote.value ? JSON.stringify({ "1": orderNote.value }) : JSON.stringify({}),
      
      // 其他参数 - 参照小程序
      userVoucherIds: '', // 优惠券ID（逗号分隔）
      userInvoiceId: 0, // 发票ID
      channelType: 0, // 来源渠道
      chainId: 0, // 门店编号
      activityId: 0, // 活动编号
      gbId: 0, // 拼团编号
    }
    
    console.log('提交订单数据:', orderData)
    console.log('订单数据是否为空:', !orderData || Object.keys(orderData).length === 0)
    
    const response = await createOrder(orderData)
    console.log('订单创建响应:', response)
    
    if (response && response.code === 0) {
      // 订单创建成功，清空购物车中的已购买商品
      const purchasedItemIds = orderItems.value.map(item => item.id)
      purchasedItemIds.forEach(itemId => {
        cartStore.removeFromCart(itemId)
      })
      
      ElMessage.success('订单提交成功！')
      router.push('/orders')
    } else {
      // 如果是登录相关错误，给出更友好的提示
      if (response && response.msg && response.msg.includes('登录')) {
        ElMessage.warning('请先登录后再提交订单')
        // 可以在这里引导用户去登录页面
        // router.push('/login')
      } else {
        ElMessage.error(response && response.msg ? response.msg : '订单提交失败，请重试')
      }
    }
  } catch (error) {
    console.error('订单提交失败:', error)
    // 如果是登录相关错误，给出更友好的提示
    if (error.message && error.message.includes('登录')) {
      ElMessage.warning('请先登录后再提交订单')
      // 可以在这里引导用户去登录页面
      // router.push('/login')
    } else {
      ElMessage.error('订单提交失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 检查购物车是否为空
  if (cartStore.cartItems.length === 0) {
    ElMessage.warning('购物车为空，请先添加商品')
    router.push('/cart')
    return
  }
  
  // 加载地址列表
  loadAddresses()
  
  // 设置默认值
  selectedDelivery.value = deliveryOptions.value[0]
  selectedPayment.value = paymentOptions.value[0] // 线下支付默认选中
})
</script>

<style scoped>
.checkout-page {
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

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.address-list {
  margin-bottom: 20px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-item:hover {
  border-color: #409eff;
}

.address-item.active {
  border-color: #409eff;
  background: #f0f9ff;
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

.add-address-btn {
  width: 100%;
  height: 40px;
}

.no-address {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-address-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.address-icon {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 8px;
}

.no-address-content p {
  margin: 0;
  font-size: 16px;
}

.address-tip {
  font-size: 14px !important;
  color: #999 !important;
  margin-bottom: 8px !important;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fa;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-spec {
  font-size: 14px;
  color: #666;
}

.item-price {
  text-align: right;
  margin-right: 16px;
}

.price {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: block;
}

.quantity {
  font-size: 14px;
  color: #666;
}

.item-total {
  font-size: 18px;
  font-weight: 600;
  color: #ff4757;
  min-width: 80px;
  text-align: right;
}

.delivery-options,
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delivery-option,
.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delivery-option:hover,
.payment-option:hover {
  border-color: #409eff;
}

.delivery-option.active,
.payment-option.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.option-name {
  font-weight: 500;
  color: #333;
}

.option-desc {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.option-price {
  font-weight: 600;
  color: #ff4757;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover:not(.disabled) {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px;
}

.payment-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #999;
}

.option-icon {
  color: #409eff;
}

.payment-option.disabled .option-icon {
  color: #999;
}

.disabled-text {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.order-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  bottom: 20px;
}

.summary-content {
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: #666;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
  padding-top: 16px;
}

.total-amount {
  color: #ff4757;
  font-size: 24px;
}

.summary-actions {
  display: flex;
  gap: 16px;
}

.summary-actions .el-button {
  flex: 1;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .item-price {
    text-align: left;
    margin-right: 0;
  }
  
  .item-total {
    text-align: left;
  }
  
  .summary-actions {
    flex-direction: column;
  }
}
</style>
