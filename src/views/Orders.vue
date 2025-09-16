<template>
  <div class="orders-page">
    <div class="container">
      <div class="page-header">
        <h1>我的订单</h1>
        <p>查看和管理您的订单</p>
      </div>

      <div class="orders-content">
        <!-- 订单状态筛选 -->
        <div class="order-filters">
          <el-tabs v-model="activeStatus" @tab-change="handleStatusChange">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="待付款" name="pending" />
            <el-tab-pane label="待配货" name="picking" />
            <el-tab-pane label="待发货" name="shipping" />
            <el-tab-pane label="待收货" name="shipped" />
            <el-tab-pane label="已完成" name="completed" />
            <el-tab-pane label="已取消" name="cancelled" />
          </el-tabs>
        </div>

        <!-- 订单列表 -->
        <div class="orders-list" v-loading="loading">
          <div 
            v-for="order in filteredOrders" 
            :key="order.order_id || order.id"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-number">订单号：{{ order.order_number || order.orderNumber }}</span>
                <span class="order-date">{{ order.order_time || order.createTime }}</span>
              </div>
              <div class="order-status">
                <el-tag :type="getStatusType(getOrderStatus(order))">
                  {{ getStatusText(getOrderStatus(order)) }}
                </el-tag>
              </div>
            </div>

            <div class="order-items">
              <div v-if="order.items && order.items.length > 0">
                <div 
                  v-for="item in order.items" 
                  :key="item.order_item_id || item.orderItemId"
                  class="order-item"
                >
                  <div class="item-image">
                    <img v-if="item.order_item_image || item.orderItemImage" :src="item.order_item_image || item.orderItemImage" :alt="item.product_name || item.productName" />
                    <div v-else class="item-image-placeholder">
                      <el-icon size="24"><Picture /></el-icon>
                    </div>
                  </div>
                  <div class="item-info">
                    <h3 class="item-name">{{ item.product_name || item.productName }}</h3>
                    <p class="item-spec" v-if="item.item_name || item.itemName">
                      {{ item.item_name || item.itemName }}
                    </p>
                  </div>
                  <div class="item-price">
                    <span class="price">¥{{ item.order_item_sale_price || item.orderItemSalePrice }}</span>
                    <span class="quantity">x{{ item.order_item_quantity || item.orderItemQuantity }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="order-item-placeholder">
                <div class="item-image">
                  <div class="item-image-placeholder">
                    <el-icon size="24"><Picture /></el-icon>
                  </div>
                </div>
                <div class="item-info">
                  <h3 class="item-name">{{ order.product_name || order.productName || '商品名称' }}</h3>
                  <p class="item-spec">商品详情加载中...</p>
                </div>
                <div class="item-price">
                  <span class="price">¥0.00</span>
                  <span class="quantity">x1</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-total">
                共{{ order.items ? order.items.length : 0 }}件商品，实付：
                <span class="total-amount">¥{{ order.orderPaymentAmount || order.totalAmount || 0 }}</span>
              </div>
              <div class="order-actions">
                        <el-button 
                          v-if="getOrderStatus(order) === 'pending'"
                          type="primary" 
                          @click="payOrder(order)"
                        >
                          立即付款
                        </el-button>
                        <el-button 
                          v-if="getOrderStatus(order) === 'picking'"
                          @click="cancelOrderAction(order)"
                        >
                          取消订单
                        </el-button>
                        <el-button 
                          v-if="getOrderStatus(order) === 'shipped'"
                          type="success" 
                          @click="confirmReceipt(order)"
                        >
                          确认收货
                        </el-button>
                <el-button 
                  v-if="getOrderStatus(order) === 'completed'"
                  @click="viewOrderDetail(order)"
                >
                  查看详情
                </el-button>
                <el-button 
                  v-if="getOrderStatus(order) === 'completed'"
                  @click="buyAgain(order)"
                >
                  再次购买
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-orders" v-if="filteredOrders.length === 0 && !loading">
          <div class="empty-icon">
            <el-icon size="80"><Document /></el-icon>
          </div>
          <h3>暂无订单</h3>
          <p>快去挑选心仪的商品吧</p>
          <el-button type="primary" @click="goToProducts">
            去购物
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Picture } from '@element-plus/icons-vue'
import { getOrderList, getOrderDetail, cancelOrder } from '@/api/order'

const router = useRouter()

const loading = ref(false)
const activeStatus = ref('all')

// 订单数据
const orders = ref([])

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => {
    const status = getOrderStatus(order)
    return status === activeStatus.value
  })
})

// 根据后端订单状态映射到前端状态
const getOrderStatus = (order) => {
  const orderStateId = order.order_state_id || order.orderStateId
  
  // 根据后端状态码映射到前端状态（按照后台管理页面的状态定义）
  if (orderStateId === 2010) return 'pending' // 待支付
  if (orderStateId === 2011) return 'pending' // 待订单审核
  if (orderStateId === 2013) return 'pending' // 待财务审核
  if (orderStateId === 2020) return 'picking' // 待配货/待出库审核
  if (orderStateId === 2030) return 'shipping' // 待发货
  if (orderStateId === 2040) return 'shipped' // 已发货/待收货确认
  if (orderStateId === 2060) return 'completed' // 已完成/已签收
  if (orderStateId === 2070) return 'cancelled' // 已取消/已作废
  
  return 'pending' // 默认状态
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    picking: 'info',
    shipping: 'primary',
    shipped: 'success',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待付款',
    picking: '待配货',
    shipping: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知状态'
}

const handleStatusChange = (status) => {
  activeStatus.value = status
}

const payOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认支付订单 ${order.orderNumber} 吗？`,
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 模拟支付
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    order.status = 'paid'
    ElMessage.success('支付成功！')
  } catch {
    // 用户取消支付
  } finally {
    loading.value = false
  }
}

const cancelOrderAction = async (order) => {
  try {
    // 检查订单状态，只有待配货状态才能取消
    const status = getOrderStatus(order)
    if (status !== 'picking') {
      ElMessage.warning('只有待配货状态的订单才能取消')
      return
    }

    const { value: reason } = await ElMessageBox.prompt(
      '请输入取消订单的原因',
      '取消订单',
      {
        confirmButtonText: '确认取消',
        cancelButtonText: '不取消',
        type: 'warning',
        inputPlaceholder: '请输入取消原因',
        inputValidator: (value) => {
          if (!value || value.trim().length === 0) {
            return '请输入取消原因'
          }
          return true
        }
      }
    )
    
    loading.value = true
    
    // 调用取消订单API
    const response = await cancelOrder({
      orderId: order.order_id || order.id,
      orderCancelReason: reason.trim()
    })
    
    if (response && response.code === 0) {
      ElMessage.success('订单取消成功')
      // 重新加载订单列表
      await loadOrders()
    } else {
      ElMessage.error(response?.msg || '取消订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  } finally {
    loading.value = false
  }
}

const confirmReceipt = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认收货订单 ${order.orderNumber} 吗？`,
      '确认收货',
      {
        confirmButtonText: '确认收货',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    order.status = 'completed'
    ElMessage.success('确认收货成功！')
  } catch {
    // 用户取消操作
  }
}

const viewOrderDetail = (order) => {
  ElMessage.info('查看订单详情功能待开发')
}

const buyAgain = (order) => {
  ElMessage.info('再次购买功能待开发')
}

const goToProducts = () => {
  router.push('/products')
}

// 加载订单数据
const loadOrders = async () => {
  loading.value = true
  try {
    const response = await getOrderList()
    
    if (response && response.code === 0) {
      // 根据后端返回的数据结构处理订单数据
      const orderList = response.data?.items || response.data?.records || response.items || response.data || []
      
      // 为每个订单获取详细信息（包括商品信息）
      orders.value = []
      for (let i = 0; i < orderList.length; i++) {
        const order = orderList[i]
        
        try {
          const detailResponse = await getOrderDetail(order.order_id)
          
          if (detailResponse && detailResponse.code === 0) {
            const orderDetail = detailResponse.data
            // 合并列表数据和详情数据
            const mergedOrder = {
              ...order,
              ...orderDetail,
              // 确保items字段存在
              items: orderDetail.items || []
            }
            orders.value.push(mergedOrder)
          } else {
            console.error(`获取订单详情失败:`, detailResponse?.msg || '未知错误')
            // 如果获取详情失败，仍然使用列表数据
            orders.value.push(order)
          }
        } catch (detailError) {
          console.error(`获取订单详情失败:`, detailError)
          // 如果获取详情失败，仍然使用列表数据
          orders.value.push(order)
        }
      }
    } else {
      console.error('获取订单列表失败:', response?.msg || '未知错误')
      ElMessage.error(response?.msg || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page {
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

.orders-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-filters {
  padding: 20px 30px 0;
  border-bottom: 1px solid #f0f0f0;
}

.orders-list {
  padding: 20px 30px;
}

.order-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-weight: 500;
  color: #333;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-items {
  padding: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-placeholder {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
  opacity: 0.6;
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

.item-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #ccc;
  border-radius: 6px;
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

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
}

.order-total {
  color: #666;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #ff4757;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.empty-orders {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  color: #ddd;
  margin-bottom: 20px;
}

.empty-orders h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.empty-orders p {
  color: #666;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .item-price {
    text-align: left;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
