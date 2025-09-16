<template>
  <div class="favorites-page">
    <!-- 背景装饰 -->
    <div class="page-background">
      <div class="bg-gradient"></div>
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
      </div>
    </div>
    
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="title-text">我的收藏</span>
            <span class="title-decoration"></span>
          </h1>
        </div>
      </div>

      <!-- 收藏商品列表 -->
      <div class="favorites-container">
        <div v-if="loading" class="loading-container">
          <el-loading-directive v-loading="loading" />
        </div>
        
        <div v-else-if="favorites.length === 0" class="empty-state">
          <div class="empty-icon">
            <el-icon size="80" color="#ccc">
              <Star />
            </el-icon>
          </div>
          <h3 class="empty-title">暂无收藏商品</h3>
          <p class="empty-desc">您还没有收藏任何商品，快去发现心仪的商品吧！</p>
          <el-button type="primary" @click="goToProducts">
            <el-icon><Grid /></el-icon>
            去逛逛
          </el-button>
        </div>
        
        <div v-else class="favorites-grid">
          <div 
            v-for="product in favorites" 
            :key="product.id" 
            class="favorite-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge" v-if="product.isNew">新品</div>
              <div class="product-overlay">
                <el-button 
                  type="primary" 
                  size="small"
                  @click.stop="goToProductDetail(product.id)"
                  class="quick-view-btn"
                >
                  <el-icon><View /></el-icon>
                  快速查看
                </el-button>
              </div>
            </div>
            
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              
              <div class="product-rating">
                <el-rate 
                  :model-value="product.rating" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                />
                <span class="rating-count">({{ product.reviewCount || 0 }}条评价)</span>
              </div>
              
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                <div class="price-save" v-if="product.originalPrice && product.originalPrice > product.price">
                  省¥{{ (product.originalPrice - product.price).toFixed(2) }}
                </div>
              </div>
              
              <div class="product-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  @click.stop="addToCart(product)"
                  :loading="addingToCart === product.id"
                  class="add-cart-btn"
                >
                  <el-icon><ShoppingCart /></el-icon>
                  加入购物车
                </el-button>
                <el-button 
                  size="small" 
                  @click.stop="removeFavorite(product)"
                  class="remove-favorite-btn"
                >
                  <el-icon><StarFilled /></el-icon>
                  取消收藏
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { getFavoritesList, removeFromFavorites } from '@/api/favorites'
import { 
  Star, Grid, View, ShoppingCart, StarFilled 
} from '@element-plus/icons-vue'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(false)
const addingToCart = ref(null)
const favorites = ref([])

// 加载收藏商品列表
const loadFavorites = async () => {
  loading.value = true
  try {
    console.log('开始获取收藏列表数据...')
    const response = await getFavoritesList({
      page: 1,
      size: 50 // 获取更多收藏商品
    })
    
    console.log('收藏列表API响应:', response)
    
    // 处理API响应数据
    let favoritesData = null
    if (response && response.code === 0) {
      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        favoritesData = response.data.records
        console.log('使用 response.data.records:', favoritesData)
      } else if (response.data && Array.isArray(response.data)) {
        favoritesData = response.data
        console.log('使用 response.data:', favoritesData)
      } else if (response.records && Array.isArray(response.records)) {
        favoritesData = response.records
        console.log('使用 response.records:', favoritesData)
      } else {
        console.log('收藏响应数据结构:', response)
        // 尝试查找可能的数组字段
        const possibleFields = ['records', 'data', 'items', 'list']
        for (const field of possibleFields) {
          if (response[field] && Array.isArray(response[field])) {
            favoritesData = response[field]
            console.log(`找到数组字段 ${field}:`, favoritesData)
            break
          }
        }
        if (!favoritesData && response.data && typeof response.data === 'object') {
          for (const field of possibleFields) {
            if (response.data[field] && Array.isArray(response.data[field])) {
              favoritesData = response.data[field]
              console.log(`找到 response.data.${field}:`, favoritesData)
              break
            }
          }
        }
      }
    } else if (Array.isArray(response)) {
      favoritesData = response
      console.log('使用 response 直接:', favoritesData)
    } else {
      console.error('收藏数据格式错误或为空:', response)
      throw new Error('收藏数据获取失败')
    }
    
    if (favoritesData && Array.isArray(favoritesData)) {
      // 映射数据格式
      favorites.value = favoritesData.map(item => {
        console.log('收藏项数据结构:', item)
        
        return {
          id: item.item_id || item.id,
          name: item.item_name || item.name || item.product_name || '商品名称',
          description: item.item_desc || item.description || item.product_desc || '商品描述',
          price: item.sale_price || item.price || item.item_unit_price || 0,
          originalPrice: item.market_price || item.original_price || item.product_unit_price_max,
          image: item.item_image || item.image || item.product_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjdlZWE7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izc2NGJhMjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbveWbvSXkuK3mlrDlpKfmlrDvvIzlj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjwvc3ZnPg==',
          rating: item.rating || 4.5,
          reviewCount: item.review_count || item.sales_count || 0,
          isNew: item.is_new || false,
          favoritesItemId: item.favorites_item_id || item.id
        }
      })
      
      console.log('收藏列表数据加载成功:', favorites.value)
    } else {
      console.error('收藏数据格式错误或为空:', response)
      throw new Error('收藏数据获取失败')
    }
    
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    // 如果是登录相关错误，不显示错误提示，直接跳转到登录页面
    if (error.message && error.message.includes('登录')) {
      console.log('用户未登录，跳转到登录页面')
      router.push('/login')
    } else {
      ElMessage.error('加载收藏列表失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 跳转到商品详情页
const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 跳转到商品列表页
const goToProducts = () => {
  router.push('/products')
}

// 加入购物车
const addToCart = async (product) => {
  addingToCart.value = product.id
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    cartStore.addToCart(product)
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error('加入购物车失败')
  } finally {
    addingToCart.value = null
  }
}

// 取消收藏
const removeFavorite = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏"${product.name}"吗？`,
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    console.log('开始取消收藏商品:', product.id)
    
    // 调用真实的API取消收藏
    const response = await removeFromFavorites(product.id)
    console.log('取消收藏API响应:', response)
    
    if (response && response.code === 0) {
      // 从本地列表中移除
      const index = favorites.value.findIndex(item => item.id === product.id)
      if (index > -1) {
        favorites.value.splice(index, 1)
      }
      
      ElMessage.success('已取消收藏')
    } else {
      ElMessage.error(response?.msg || '取消收藏失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  }
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites-page {
  padding: 20px 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 30%, #d1e7ff 70%, #b8daff 100%);
  position: relative;
  overflow: hidden;
}

.page-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, rgba(64, 158, 255, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(24, 144, 255, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(135, 208, 104, 0.04) 0%, transparent 50%);
  animation: gradientShift 20s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 25s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: -7s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: -14s;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(24, 144, 255, 0.08) 100%);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes gradientShift {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(180deg);
  }
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
  z-index: 2;
}

.header-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-title {
  position: relative;
  margin-bottom: 0;
}

.title-text {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  position: relative;
}

.title-decoration {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.favorites-container {
  position: relative;
  z-index: 2;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 10px;
}

.empty-desc {
  color: #999;
  margin-bottom: 30px;
  line-height: 1.6;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
  padding: 0 4px;
}

.favorite-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.favorite-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.favorite-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(64, 158, 255, 0.2);
}

.favorite-card:hover::before {
  opacity: 1;
}

.product-image {
  position: relative;
  height: 240px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 3;
}

.favorite-card:hover .product-overlay {
  opacity: 1;
}

.quick-view-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  padding: 12px 20px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.quick-view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.favorite-card:hover .product-image img {
  transform: scale(1.08);
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  z-index: 3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  }
  50% {
    box-shadow: 0 2px 12px rgba(255, 71, 87, 0.5);
  }
  100% {
    box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  }
}

.product-info {
  padding: 24px 20px 20px;
  position: relative;
  z-index: 2;
}

.product-name {
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.favorite-card:hover .product-name {
  color: #409eff;
}

.product-desc {
  color: #7f8c8d;
  font-size: 13px;
  margin-bottom: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 400;
}

.product-rating {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-rating :deep(.el-rate) {
  display: flex;
  align-items: center;
}

.product-rating :deep(.el-rate__text) {
  font-size: 12px;
  color: #7f8c8d;
  margin-left: 4px;
}

.rating-count {
  font-size: 12px;
  color: #7f8c8d;
}

.product-price {
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  position: relative;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.original-price {
  font-size: 14px;
  color: #bdc3c7;
  text-decoration: line-through;
  font-weight: 500;
}

.price-save {
  position: absolute;
  top: -8px;
  right: 0;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
}

.product-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.product-actions .el-button {
  flex: 1;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 40px;
}

.add-cart-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.add-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.remove-favorite-btn {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 16px rgba(243, 156, 18, 0.3);
}

.remove-favorite-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}

@media (max-width: 768px) {
  .header-content {
    padding: 25px 20px;
  }
  
  .title-text {
    font-size: 2.2rem;
  }
  
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 0 2px;
  }
  
  .product-info {
    padding: 20px 16px 16px;
  }
  
  .product-name {
    font-size: 16px;
  }
  
  .current-price {
    font-size: 20px;
  }
  
  .product-actions {
    gap: 8px;
  }
  
  .product-actions .el-button {
    font-size: 13px;
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .favorite-card {
    border-radius: 12px;
  }
  
  .product-image {
    height: 200px;
  }
  
  .product-info {
    padding: 18px 14px 14px;
  }
}
</style>
