<template>
  <div class="product-detail-page" v-loading="loading">
    <div class="container">
      <div class="product-detail" v-if="product">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/products' }">商品列表</el-breadcrumb-item>
            <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="product-content">
          <!-- 商品图片 -->
          <div class="product-images">
            <div class="main-image">
              <img :src="currentImage" :alt="product.name" />
            </div>
            <div class="thumbnail-list">
              <div 
                v-for="(image, index) in product.images" 
                :key="index"
                class="thumbnail"
                :class="{ active: currentImageIndex === index }"
                @click="currentImageIndex = index"
              >
                <img :src="image" :alt="`${product.name} ${index + 1}`" />
              </div>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-rating">
              <el-rate 
                v-model="product.rating" 
                disabled 
                show-score 
                text-color="#ff9900"
              />
              <span class="rating-text">({{ product.reviewCount }}条评价)</span>
            </div>

            <div class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              <span class="discount" v-if="product.originalPrice">
                省¥{{ product.originalPrice - product.price }}
              </span>
            </div>

            <div class="product-specs">
              <div class="spec-item">
                <span class="spec-label">品牌：</span>
                <span class="spec-value">{{ product.brand }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">型号：</span>
                <span class="spec-value">{{ product.model }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">库存：</span>
                <span class="spec-value" :class="{ 'low-stock': product.stock < 10 }">
                  {{ product.stock > 0 ? `仅剩${product.stock}件` : '暂无库存' }}
                </span>
              </div>
            </div>

            <div class="product-options">
              <div class="option-group" v-if="product.variants">
                <label>颜色：</label>
                <div class="option-list">
                  <div 
                    v-for="variant in product.variants" 
                    :key="variant.id"
                    class="option-item"
                    :class="{ active: selectedVariant?.id === variant.id }"
                    @click="selectedVariant = variant"
                  >
                    {{ variant.name }}
                  </div>
                </div>
              </div>

              <div class="option-group">
                <label>数量：</label>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="product.stock"
                  :disabled="product.stock === 0"
                />
              </div>
            </div>

            <div class="product-actions">
              <el-button 
                type="primary" 
                size="large"
                :disabled="product.stock === 0"
                :loading="addingToCart"
                @click="addToCart"
              >
                {{ product.stock === 0 ? '暂无库存' : '加入购物车' }}
              </el-button>
              
              <el-button 
                size="large"
                @click="buyNow"
                :disabled="product.stock === 0"
              >
                立即购买
              </el-button>
              
              <el-button 
                size="large"
                :icon="product.isFavorite ? 'StarFilled' : 'Star'"
                :type="product.isFavorite ? 'warning' : 'default'"
                @click="toggleFavorite"
              >
                {{ product.isFavorite ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 商品详情 -->
        <div class="product-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="商品详情" name="detail">
              <div class="detail-content" v-html="product.detail"></div>
            </el-tab-pane>
            <el-tab-pane label="规格参数" name="specs">
              <div class="specs-content">
                <div 
                  v-for="(value, key) in product.specifications" 
                  :key="key"
                  class="spec-row"
                >
                  <span class="spec-key">{{ key }}：</span>
                  <span class="spec-value">{{ value }}</span>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="用户评价" name="reviews">
              <div class="reviews-content">
                <div 
                  v-for="review in product.reviews" 
                  :key="review.id"
                  class="review-item"
                >
                  <div class="review-header">
                    <el-avatar :size="40" :src="review.avatar">
                      {{ review.username.charAt(0) }}
                    </el-avatar>
                    <div class="review-info">
                      <div class="review-user">{{ review.username }}</div>
                      <div class="review-rating">
                        <el-rate v-model="review.rating" disabled size="small" />
                        <span class="review-date">{{ review.date }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="review-content">{{ review.content }}</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(false)
const addingToCart = ref(false)
const activeTab = ref('detail')
const quantity = ref(1)
const selectedVariant = ref(null)

const product = ref(null)
const currentImageIndex = ref(0)

const currentImage = computed(() => {
  if (product.value && product.value.images) {
    return product.value.images[currentImageIndex.value] || product.value.image
  }
  return ''
})

const loadProductDetail = async () => {
  if (isUnmounted) return
  
  loading.value = true
  try {
    const productId = route.params.id
    console.log('开始获取商品详情数据，商品ID:', productId)
    
    // 构建请求参数，包含用户会员类型
    const params = {
      item_id: productId
    }
    
    // 添加用户会员类型参数
    if (userStore.userInfo && userStore.userInfo.user_level_id) {
      params.user_level_id = userStore.userInfo.user_level_id
      console.log('添加用户会员类型参数:', userStore.userInfo.user_level_id)
    }
    
    const response = await getProductDetail(productId, params)
    
    // 检查组件是否已卸载
    if (isUnmounted) return
    
    console.log('商品详情API响应:', response)
    
    // 处理API响应数据 - 按照小程序的处理方式
    let productData = null
    console.log('响应结构分析:', {
      hasData: !!(response && response.data),
      hasItemRow: !!(response && response.data && response.data.item_row),
      hasImage: !!(response && response.data && response.data.image),
      responseCode: response ? response.code : 'null',
      responseMsg: response ? response.msg : 'null'
    })
    
    if (response && response.code === 0 && response.data) {
      productData = response.data
      console.log('使用 response.data:', productData)
    } else {
      console.log('API返回错误或数据格式不正确:', response)
      throw new Error(response?.msg || '商品详情获取失败')
    }
    
    if (productData) {
      // 检查组件是否已卸载
      if (isUnmounted) return
      
      console.log('商品详情数据:', productData)
      
      // 映射数据格式 - 按照API返回的实际数据结构
      const itemRow = productData.item_row || {}
      const imageData = productData.image || {}
      
      // 计算会员价格
      const memberPrice = computed(() => {
        if (!userStore.userInfo || !userStore.userInfo.user_level_id) {
          return itemRow.item_sale_price || itemRow.item_unit_price || 0
        }
        
        // 获取用户会员类型对应的价格字段
        const userLevel = userStore.userInfo.user_level
        if (userLevel && userLevel.price_field_name) {
          // 从动态字段中获取会员价格
          const dynamicFields = productData.dynamic_fields || {}
          const memberPriceValue = dynamicFields[userLevel.price_field_name]
          if (memberPriceValue && memberPriceValue > 0) {
            return memberPriceValue
          }
        }
        
        // 如果没有会员价格，返回默认价格
        return itemRow.item_sale_price || itemRow.item_unit_price || 0
      })

      product.value = {
        id: itemRow.item_id || productData.item_id,
        name: productData.product_name || itemRow.item_name || '',
        brand: productData.brand || '未知品牌',
        model: itemRow.item_number || '',
        price: memberPrice.value,
        originalPrice: itemRow.item_market_price || productData.product_unit_price_max,
        rating: 4.5, // 默认评分
        reviewCount: productData.product_evaluation_num || 0,
        stock: itemRow.available_quantity || itemRow.item_quantity || 0,
        isFavorite: productData.is_favorite || false,
        image: imageData.item_image_default || productData.product_image || '',
        images: imageData.item_image_other ? 
          [imageData.item_image_default, ...imageData.item_image_other.split(',')] : 
          [imageData.item_image_default || productData.product_image],
        variants: JSON.parse(productData.product_spec || '[]'),
        detail: productData.product_detail || productData.product_tips || '',
        specifications: JSON.parse(productData.product_spec || '[]'),
        reviews: productData.last_comments || [],
        // 添加更多字段
        productId: productData.product_id,
        storeId: productData.store_id,
        categoryId: productData.category_id,
        kindId: productData.kind_id,
        saleNum: productData.product_sale_num || 0,
        favoriteNum: productData.product_favorite_num || 0,
        category: productData.product_categorys?.[0]?.category_name || '未分类'
      }
      
      // 确保images是数组
      if (!Array.isArray(product.value.images)) {
        product.value.images = [product.value.image]
      }
      
      // 设置默认变体
      if (product.value.variants && product.value.variants.length > 0) {
        selectedVariant.value = product.value.variants[0]
      }
      
      console.log('商品详情数据加载成功:', product.value)
    } else {
      console.error('商品详情数据格式错误或为空:', response)
      throw new Error('商品详情数据获取失败')
    }
    
  } catch (error) {
    // 检查组件是否已卸载
    if (isUnmounted) return
    
    console.error('获取商品详情失败:', error)
    ElMessage.error('加载商品详情失败: ' + error.message)
    throw error
  } finally {
    // 检查组件是否已卸载
    if (isUnmounted) return
    
    loading.value = false
  }
}

const addToCart = async () => {
  addingToCart.value = true
  try {
    console.log('添加商品到购物车:', {
      productId: product.value.id,
      quantity: quantity.value,
      variant: selectedVariant.value
    })
    
    // 调用真实的购物车API
    const cartData = {
      productId: product.value.id,
      quantity: quantity.value,
      variant: selectedVariant.value?.id || null
    }
    
    // 这里可以调用 addToCart API，暂时使用 store
    cartStore.addToCart({
      ...product.value,
      quantity: quantity.value,
      variant: selectedVariant.value
    })
    
    ElMessage.success('已加入购物车')
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败: ' + error.message)
  } finally {
    addingToCart.value = false
  }
}

const buyNow = () => {
  addToCart()
  router.push('/cart')
}

const toggleFavorite = () => {
  product.value.isFavorite = !product.value.isFavorite
  ElMessage.success(product.value.isFavorite ? '已添加到收藏' : '已取消收藏')
}

// 添加组件卸载标志
let isUnmounted = false

onMounted(() => {
  loadProductDetail()
})

onUnmounted(() => {
  isUnmounted = true
})
</script>

<style scoped>
.product-detail-page {
  padding: 20px 0;
  min-height: 100vh;
  background: #f5f5f5;
}

.breadcrumb {
  margin-bottom: 20px;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.product-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: #409eff;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-text {
  color: #666;
  font-size: 14px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: #ff4757;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
}

.discount {
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.product-specs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.spec-item {
  display: flex;
  align-items: center;
}

.spec-label {
  font-weight: 500;
  color: #666;
  width: 80px;
}

.spec-value {
  color: #333;
}

.low-stock {
  color: #ff4757 !important;
  font-weight: 500;
}

.product-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-group label {
  font-weight: 500;
  color: #333;
}

.option-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.option-item {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #409eff;
}

.option-item.active {
  border-color: #409eff;
  background: #f0f9ff;
  color: #409eff;
}

.product-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.product-actions .el-button {
  flex: 1;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

.product-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.detail-content {
  padding: 30px;
  line-height: 1.8;
}

.detail-content h3 {
  color: #333;
  margin: 20px 0 10px 0;
}

.detail-content p {
  color: #666;
  margin-bottom: 15px;
}

.detail-content ul {
  color: #666;
  padding-left: 20px;
}

.specs-content {
  padding: 30px;
}

.spec-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.spec-key {
  font-weight: 500;
  color: #666;
  width: 120px;
  flex-shrink: 0;
}

.spec-value {
  color: #333;
  flex: 1;
}

.reviews-content {
  padding: 30px;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.review-info {
  flex: 1;
}

.review-user {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-date {
  color: #999;
  font-size: 14px;
}

.review-content {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  .main-image {
    height: 300px;
  }
  
  .product-title {
    font-size: 24px;
  }
  
  .current-price {
    font-size: 28px;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .detail-content,
  .specs-content,
  .reviews-content {
    padding: 20px;
  }
}
</style>
