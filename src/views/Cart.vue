<template>
  <div class="cart-page">
    <div class="container">
      <div class="page-header">
        <h1>购物车</h1>
        <p>确认商品信息，完成购买</p>
      </div>

      <div class="cart-content" v-if="cartItems.length > 0">
        <!-- 购物车列表 -->
        <div class="cart-list">
          <div class="cart-header">
            <el-checkbox 
              v-model="selectAll" 
              @change="handleSelectAll"
              :indeterminate="isIndeterminate"
            >
              全选
            </el-checkbox>
            <span class="header-text">商品信息</span>
            <span class="header-text">单价</span>
            <span class="header-text">数量</span>
            <span class="header-text">小计</span>
            <span class="header-text">操作</span>
          </div>

          <div class="cart-items">
            <div 
              v-for="item in cartItems" 
              :key="item.id"
              class="cart-item"
            >
              <div class="item-checkbox">
                <el-checkbox 
                  v-model="item.selected" 
                  @change="handleItemSelect"
                />
              </div>
              
              <div class="item-info">
                <div class="item-image">
                  <img :src="item.image" :alt="item.name" />
                </div>
                <div class="item-details">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <p class="item-spec" v-if="item.variant">
                    颜色：{{ item.variant.name }}
                  </p>
                </div>
              </div>
              
              <div class="item-price">
                <span class="current-price">¥{{ item.price }}</span>
                <span class="original-price" v-if="item.originalPrice">
                  ¥{{ item.originalPrice }}
                </span>
              </div>
              
              <div class="item-quantity">
                <el-input-number 
                  v-model="item.quantity" 
                  :min="1" 
                  :max="item.stock || 999"
                  @change="updateQuantity(item)"
                />
              </div>
              
              <div class="item-total">
                <span class="total-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              
              <div class="item-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeItem(item)"
                  :icon="'Delete'"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 结算区域 -->
        <div class="cart-summary">
          <div class="summary-info">
            <div class="selected-count">
              已选择 <span class="count">{{ selectedItems.length }}</span> 件商品
            </div>
            <div class="total-amount">
              合计：<span class="amount">¥{{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="summary-actions">
            <el-button 
              type="primary" 
              size="large"
              :disabled="selectedItems.length === 0"
              @click="goToCheckout"
            >
              去结算 ({{ selectedItems.length }})
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空购物车 -->
      <div class="empty-cart" v-else>
        <div class="empty-icon">
          <el-icon size="80"><ShoppingCart /></el-icon>
        </div>
        <h3>购物车是空的</h3>
        <p>快去挑选心仪的商品吧</p>
        <el-button type="primary" @click="goToProducts">
          去购物
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const selectAll = ref(false)
const cartItems = computed(() => cartStore.cartItems)

const selectedItems = computed(() => {
  return cartItems.value.filter(item => item.selected)
})

const totalAmount = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

const isIndeterminate = computed(() => {
  const selectedCount = selectedItems.value.length
  return selectedCount > 0 && selectedCount < cartItems.value.length
})

const loadCartItems = () => {
  // 购物车数据直接从store获取，不需要加载模拟数据
  // 默认全选所有商品
  cartItems.value.forEach(item => {
    item.selected = true
  })
  updateSelectAll()
}

const updateSelectAll = () => {
  const selectedCount = selectedItems.value.length
  selectAll.value = selectedCount === cartItems.value.length && cartItems.value.length > 0
}

const handleSelectAll = (checked) => {
  cartItems.value.forEach(item => {
    item.selected = checked
  })
}

const handleItemSelect = () => {
  updateSelectAll()
}

const updateQuantity = (item) => {
  if (item.quantity < 1) {
    item.quantity = 1
  }
  if (item.stock && item.quantity > item.stock) {
    item.quantity = item.stock
    ElMessage.warning('库存不足')
  }
  // 使用store更新数量
  cartStore.updateQuantity(item.id, item.quantity)
}

const removeItem = async (item) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个商品吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 使用store删除商品
    cartStore.removeFromCart(item.id)
    ElMessage.success('已删除')
    updateSelectAll()
  } catch {
    // 用户取消删除
  }
}

const goToCheckout = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  // 将选中的商品ID传递给结算页面
  const selectedItemIds = selectedItems.value.map(item => item.id).join(',')
  router.push({
    path: '/checkout',
    query: { 
      selectedItems: selectedItemIds,
      totalAmount: totalAmount.value
    }
  })
}

const goToProducts = () => {
  router.push('/products')
}

onMounted(() => {
  loadCartItems()
})
</script>

<style scoped>
.cart-page {
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

.cart-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cart-list {
  border-bottom: 1px solid #f0f0f0;
}

.cart-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 120px 100px;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 500;
  color: #333;
}

.header-text {
  text-align: center;
}

.cart-items {
  max-height: 600px;
  overflow-y: auto;
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 120px 100px;
  gap: 20px;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.cart-item:hover {
  background: #f8f9fa;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-checkbox {
  display: flex;
  justify-content: center;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  line-height: 1.4;
}

.item-spec {
  font-size: 14px;
  color: #666;
}

.item-price {
  text-align: center;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff4757;
  display: block;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.item-quantity {
  display: flex;
  justify-content: center;
}

.item-total {
  text-align: center;
}

.total-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4757;
}

.item-actions {
  display: flex;
  justify-content: center;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #f8f9fa;
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.selected-count {
  color: #666;
  font-size: 14px;
}

.count {
  color: #409eff;
  font-weight: 600;
}

.total-amount {
  font-size: 18px;
  color: #333;
}

.amount {
  font-size: 24px;
  font-weight: 700;
  color: #ff4757;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  color: #ddd;
  margin-bottom: 20px;
}

.empty-cart h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.empty-cart p {
  color: #666;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .cart-header,
  .cart-item {
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: left;
  }
  
  .cart-header {
    display: none;
  }
  
  .cart-item {
    padding: 15px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  .item-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-image {
    width: 100px;
    height: 100px;
  }
  
  .cart-summary {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .summary-info {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
