<template>
  <div class="products-page">
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
      <!-- 页面标题和筛选条件 -->
      <div class="page-header-card">
        <div class="card-glow"></div>
        <div class="header-content">
          <div class="title-section">
            <div class="title-wrapper">
              <h1 class="page-title">
                <span class="title-icon">
                  <el-icon><Grid /></el-icon>
                </span>
                <span class="title-text">商品列表</span>
                <span class="title-decoration"></span>
              </h1>
            </div>
            <div class="products-count">
              <div class="count-icon">
                <el-icon><Box /></el-icon>
              </div>
              <div class="count-text">
                <span class="count-number">{{ pagination.total }}</span>
                <span class="count-label">件商品</span>
              </div>
            </div>
          </div>
          
          <div class="filters-section">
        
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">
              <el-icon><Grid /></el-icon>
              商品分类
            </label>
            <el-select 
              v-model="filters.category" 
              placeholder="选择分类" 
              @change="handleFilterChange"
              class="filter-select"
            >
              <el-option label="全部分类" value="" />
              <el-option 
                v-for="category in categories" 
                :key="category.id" 
                :label="category.name" 
                :value="category.id" 
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <el-icon><Money /></el-icon>
              价格区间
            </label>
            <el-select 
              v-model="filters.priceRange" 
              placeholder="选择价格区间" 
              @change="handleFilterChange"
              class="filter-select"
            >
              <el-option label="全部价格" value="" />
              <el-option label="0-100元" value="0-100" />
              <el-option label="100-500元" value="100-500" />
              <el-option label="500-1000元" value="500-1000" />
              <el-option label="1000元以上" value="1000+" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <el-icon><Sort /></el-icon>
              排序方式
            </label>
            <el-select 
              v-model="filters.sortBy" 
              placeholder="选择排序方式" 
              @change="handleFilterChange"
              class="filter-select"
            >
              <el-option label="默认排序" value="default" />
              <el-option label="价格从低到高" value="price_asc" />
              <el-option label="价格从高到低" value="price_desc" />
              <el-option label="销量最高" value="sales" />
              <el-option label="最新上架" value="newest" />
            </el-select>
          </div>
          
          <div class="filter-actions">
            <el-button 
              type="default" 
              @click="resetFilters"
              class="reset-btn"
            >
              <el-icon><Refresh /></el-icon>
              重置筛选
            </el-button>
          </div>
        </div>
          </div>
        </div>
      </div>

      <!-- 商品网格 -->
      <div class="products-container">
        <div class="products-header">
          <div class="view-options">
            <el-button-group>
              <el-button 
                :type="viewMode === 'grid' ? 'primary' : 'default'"
                @click="viewMode = 'grid'"
                size="small"
              >
                <el-icon><Grid /></el-icon>
                网格视图
              </el-button>
              <el-button 
                :type="viewMode === 'list' ? 'primary' : 'default'"
                @click="viewMode = 'list'"
                size="small"
              >
                <el-icon><List /></el-icon>
                列表视图
              </el-button>
            </el-button-group>
          </div>
        </div>
        
        <div 
          class="products-grid" 
          :class="{ 'list-view': viewMode === 'list' }"
          v-loading="loading"
        >
          <div 
            v-for="product in products" 
            :key="product.id" 
            class="product-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge" v-if="product.isNew">
                <span class="badge-text">新品</span>
              </div>
              <div class="product-overlay">
                <div class="overlay-actions">
                  <el-button 
                    type="primary" 
                    size="small"
                    @click.stop="goToProductDetail(product.id)"
                    class="quick-view-btn"
                    circle
                  >
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button 
                    type="success" 
                    size="small"
                    @click.stop="addToCart(product)"
                    class="add-cart-btn"
                    circle
                  >
                    <el-icon><ShoppingCart /></el-icon>
                  </el-button>
                </div>
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
                  @click.stop="toggleFavorite(product)"
                  :class="{ 'favorited': product.isFavorite }"
                  class="favorite-btn"
                >
                  <el-icon>
                    <StarFilled v-if="product.isFavorite" />
                    <Star v-else />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductList, getCategories } from '@/api/product'
import { addToFavorites, removeFromFavorites } from '@/api/favorites'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { 
  Filter, Grid, Money, Sort, Refresh, 
  List, View, ShoppingCart, Star, StarFilled, Box 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(false)
const addingToCart = ref(null)
const viewMode = ref('grid') // 视图模式：grid 或 list

const filters = reactive({
  category: '',
  priceRange: '',
  sortBy: 'default'
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 12,
  total: 0
})

const products = ref([])
const categories = ref([])

// 获取商品分类
const fetchCategories = async () => {
  try {
    console.log('开始获取分类数据...')
    const response = await getCategories()
    console.log('分类接口响应:', response)
    
    // 处理API响应数据 - 按照主页面的处理方式
    let categoryData = null
    console.log('分类响应结构分析:', {
      hasData: !!(response && response.data),
      hasItems: !!(response && response.items),
      responseCode: response ? response.code : 'null',
      responseMsg: response ? response.msg : 'null'
    })
    
    if (response && response.code === 0) {
      if (response.items && Array.isArray(response.items)) {
        categoryData = response.items
        console.log('使用 response.items:', categoryData)
      } else if (response.data && Array.isArray(response.data)) {
        categoryData = response.data
        console.log('使用 response.data:', categoryData)
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        categoryData = response.data.items
        console.log('使用 response.data.items:', categoryData)
      } else {
        console.log('分类响应数据结构:', response)
        console.log('尝试查找数组字段...')
        // 尝试查找可能的数组字段
        const possibleFields = ['items', 'data', 'list', 'categories']
        for (const field of possibleFields) {
          if (response[field] && Array.isArray(response[field])) {
            categoryData = response[field]
            console.log(`找到数组字段 ${field}:`, categoryData)
            break
          }
        }
        if (!categoryData && response.data && typeof response.data === 'object') {
          for (const field of possibleFields) {
            if (response.data[field] && Array.isArray(response.data[field])) {
              categoryData = response.data[field]
              console.log(`找到 response.data.${field}:`, categoryData)
              break
            }
          }
        }
      }
    } else if (Array.isArray(response)) {
      categoryData = response
      console.log('使用 response 直接:', categoryData)
    } else {
      console.error('分类数据格式错误或为空:', response)
      throw new Error('分类数据获取失败')
    }
    
    if (categoryData && Array.isArray(categoryData)) {
      categories.value = categoryData.map(item => ({
        id: item.category_id || item.id,
        name: item.category_name || item.name,
        icon: item.category_image || item.icon || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iIzQwOWVmZiIvPgo8dGV4dCB4PSIzMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lupTnlKjliIbnsbs8L3RleHQ+Cjwvc3ZnPg=='
      }))
      console.log('分类数据加载成功:', categories.value)
    } else {
      console.error('分类数据格式错误或为空:', response)
      throw new Error('分类数据获取失败')
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    // 如果是登录相关错误，不显示错误提示，直接跳转到登录页面
    if (error.message && error.message.includes('登录')) {
      console.log('用户未登录，跳转到登录页面')
      router.push('/login')
    } else {
      ElMessage.error('获取分类数据失败')
    }
  }
}

// 商品数据现在从API获取

const loadProducts = async () => {
  loading.value = true
  try {
    console.log('开始获取商品列表数据...')
    
    // 构建API请求参数
    const params = {
      page: pagination.currentPage,
      limit: pagination.pageSize
    }
    
    // 添加用户会员类型参数
    if (userStore.userInfo && userStore.userInfo.user_level_id) {
      params.user_level_id = userStore.userInfo.user_level_id
      console.log('添加用户会员类型参数:', userStore.userInfo.user_level_id)
    }
    
    // 添加分类筛选
    if (filters.category) {
      params.category_id = filters.category
      console.log('添加分类筛选参数:', filters.category)
    }
    
    // 添加排序参数
    switch (filters.sortBy) {
      case 'price_asc':
        params.orderby = 3 // 按价格排序
        params.sort = 1    // 升序
        break
      case 'price_desc':
        params.orderby = 3 // 按价格排序
        params.sort = 2    // 降序
        break
      case 'sales':
        params.orderby = 1 // 按销量排序
        params.sort = 2    // 降序
        break
      case 'newest':
        params.orderby = 2 // 按添加时间排序
        params.sort = 2    // 降序
        break
      default:
        params.orderby = 1 // 默认按销量排序
        params.sort = 2    // 降序
    }
    
    console.log('商品列表API请求参数:', params)
    const response = await getProductList(params)
    console.log('商品列表API响应:', response)
    
    // 处理不同的响应格式
    let productData = null
    console.log('响应结构分析:', {
      hasData: !!(response && response.data),
      dataType: response && response.data ? typeof response.data : 'null',
      dataKeys: response && response.data ? Object.keys(response.data) : 'null',
      isDataArray: Array.isArray(response && response.data)
    })
    
    if (response && response.data) {
      // 检查 data 是否是数组
      if (Array.isArray(response.data)) {
        productData = response.data
        console.log('使用 response.data (数组):', productData)
      } else if (response.data.items && Array.isArray(response.data.items)) {
        productData = response.data.items
        console.log('使用 response.data.items:', productData)
      } else if (response.data.list && Array.isArray(response.data.list)) {
        productData = response.data.list
        console.log('使用 response.data.list:', productData)
      } else if (response.data.records && Array.isArray(response.data.records)) {
        productData = response.data.records
        console.log('使用 response.data.records:', productData)
      } else {
        console.log('response.data 不是数组，完整结构:', response.data)
        // 如果 data 是对象，尝试找到数组字段
        const possibleArrayFields = ['items', 'list', 'records', 'data', 'content']
        for (const field of possibleArrayFields) {
          if (response.data[field] && Array.isArray(response.data[field])) {
            productData = response.data[field]
            console.log(`找到数组字段 ${field}:`, productData)
            break
          }
        }
      }
    } else if (response && response.items) {
      productData = response.items
      console.log('使用 response.items:', productData)
    } else if (Array.isArray(response)) {
      productData = response
      console.log('使用 response 直接:', productData)
    }
    
    if (productData && Array.isArray(productData)) {
      // 映射数据格式
      products.value = productData.map(item => {
        console.log('商品项数据结构:', item)
        console.log('商品项ID字段:', {
          id: item.id,
          item_id: item.item_id,
          product_id: item.product_id,
          product_item_id: item.product_item_id,
          sku_id: item.sku_id
        })
        
        // 计算会员价格
        const calculateMemberPrice = (item) => {
          if (!userStore.userInfo || !userStore.userInfo.user_level_id) {
            return item.price || item.item_unit_price || item.product_unit_price_min || 0
          }
          
          // 获取用户会员类型对应的价格字段
          const userLevel = userStore.userInfo.user_level
          if (userLevel && userLevel.price_field_name) {
            // 从动态字段中获取会员价格
            const dynamicFields = item.dynamic_fields || {}
            const memberPriceValue = dynamicFields[userLevel.price_field_name]
            if (memberPriceValue && memberPriceValue > 0) {
              return memberPriceValue
            }
          }
          
          // 如果没有会员价格，返回默认价格
          return item.price || item.item_unit_price || item.product_unit_price_min || 0
        }

        return {
          id: item.id || item.item_id || item.product_id || item.product_item_id || item.sku_id,
          name: item.name || item.product_name,
          description: item.description || item.brief || item.product_tips,
          price: calculateMemberPrice(item),
          originalPrice: item.originalPrice || item.original_price || item.product_unit_price_max,
          image: item.image || item.product_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjdlZWE7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izc2NGJhMjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbveWbvSXkuK3mlrDlpKfmlrDvvIzlj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjwvc3ZnPg==',
          rating: item.rating || 4.5,
          reviewCount: item.review_count || 0,
          isNew: item.isNew || false,
          isFavorite: item.isFavorite || false,
          category: item.category || 'electronics'
        }
      })
      
      // 设置分页信息
      if (response && response.data && response.data.total) {
        pagination.total = response.data.total
        console.log('使用 response.data.total:', response.data.total)
      } else if (response && response.total) {
        pagination.total = response.total
        console.log('使用 response.total:', response.total)
      } else {
        pagination.total = productData.length
        console.log('使用 productData.length:', productData.length)
      }
      
      console.log('商品列表数据加载成功:', products.value)
    } else {
      console.error('商品列表数据格式错误或为空:', response)
      throw new Error('商品列表数据获取失败')
    }
    
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('加载商品失败: ' + error.message)
    throw error
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.currentPage = 1
  loadProducts()
}

// 重置筛选条件
const resetFilters = () => {
  filters.category = ''
  filters.priceRange = ''
  filters.sortBy = 'default'
  pagination.currentPage = 1
  loadProducts()
  ElMessage.success('筛选条件已重置')
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadProducts()
}

const handlePageChange = (page) => {
  pagination.currentPage = page
  loadProducts()
}

const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

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

const toggleFavorite = async (product) => {
  try {
    if (product.isFavorite) {
      // 取消收藏
      console.log('开始取消收藏商品:', product.id)
      const response = await removeFromFavorites(product.id)
      console.log('取消收藏API响应:', response)
      
      if (response && response.code === 0) {
        product.isFavorite = false
        ElMessage.success('已取消收藏')
      } else {
        ElMessage.error(response?.msg || '取消收藏失败')
      }
    } else {
      // 添加收藏
      console.log('开始添加收藏商品:', product.id)
      const response = await addToFavorites(product.id)
      console.log('添加收藏API响应:', response)
      
      if (response && response.code === 0) {
        product.isFavorite = true
        ElMessage.success('已添加到收藏')
      } else {
        ElMessage.error(response?.msg || '添加收藏失败')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('收藏操作失败')
  }
}

onMounted(async () => {
  try {
    // 处理路由查询参数
    if (route.query.category) {
      filters.category = route.query.category
      console.log('从路由参数设置分类筛选:', route.query.category)
    }
    
    // 同时加载分类和商品数据
    await Promise.all([
      fetchCategories(),
      loadProducts()
    ])
  } catch (error) {
    console.error('页面初始化失败:', error)
  }
})

watch(() => filters, () => {
  loadProducts()
}, { deep: true })
</script>

<style scoped>
.products-page {
  padding: 20px 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
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
  background: radial-gradient(circle at 20% 80%, rgba(108, 117, 125, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(73, 80, 87, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(52, 58, 64, 0.03) 0%, transparent 50%);
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
  background: rgba(255, 255, 255, 0.3);
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%);
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

@keyframes glow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.page-header-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  animation: glow 8s ease-in-out infinite;
  pointer-events: none;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
}

.title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  font-size: 16px;
  margin-right: 10px;
}


.products-count {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
}

.count-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.count-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.count-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.count-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
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

.page-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 30px;
  font-weight: 500;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.filters-section {
  background: rgba(248, 249, 250, 0.9);
  border-radius: 16px;
  padding: 18px 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}




.highlight {
  color: #667eea;
  font-weight: 600;
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
  flex: 1;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  margin: 0;
}

.filter-select {
  width: 100%;
}

.filter-actions {
  display: flex;
  align-items: end;
  margin-left: auto;
  flex-shrink: 0;
  gap: 10px;
}

.reset-btn {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.products-container {
  position: relative;
  z-index: 2;
}

.products-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.view-options {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
  margin-bottom: 40px;
  padding: 0 4px;
  transition: all 0.3s ease;
}

.products-grid.list-view {
  grid-template-columns: 1fr;
  gap: 20px;
}

.products-grid.list-view .product-card {
  display: flex;
  flex-direction: row;
  height: 200px;
}

.products-grid.list-view .product-image {
  width: 200px;
  height: 100%;
  flex-shrink: 0;
}

.products-grid.list-view .product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}

.product-card {
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

.product-card::before {
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

.product-card:hover {
  transform: translateY(-12px) scale(1.03);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.product-card:hover::before {
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  backdrop-filter: blur(5px);
}

.overlay-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.quick-view-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-view-btn:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
}

.add-cart-btn {
  background: linear-gradient(135deg, #2ed573 0%, #1e90ff 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(46, 213, 115, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-cart-btn:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 10px 30px rgba(46, 213, 115, 0.5);
}

.product-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(64, 158, 255, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.product-card:hover .product-image::before {
  opacity: 1;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.product-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
  z-index: 3;
  animation: pulse 2s infinite;
  backdrop-filter: blur(10px);
}

.badge-text {
  display: block;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

.product-card:hover .product-name {
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

.favorite-btn {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  color: #6c757d;
  min-width: 40px;
  flex: 0 0 40px;
}

.favorite-btn:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-btn.favorited {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 16px rgba(243, 156, 18, 0.3);
}

.favorite-btn.favorited:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}

.product-actions .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.product-actions .el-button:hover::before {
  left: 100%;
}

.product-actions .el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.product-actions .el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.product-actions .el-button--default {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.product-actions .el-button--default:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-actions .el-button--warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
}

.product-actions .el-button--warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
}

.pagination-section {
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .header-content {
    padding: 25px 20px;
  }
  
  .title-text {
    font-size: 2.2rem;
  }
  
  .filters-section {
    padding: 20px;
  }
  
  .filters-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .filter-actions {
    margin-left: 0;
    align-self: stretch;
  }
  
  .products-header {
    justify-content: center;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 0 2px;
  }
  
  .products-grid.list-view .product-card {
    flex-direction: column;
    height: auto;
  }
  
  .products-grid.list-view .product-image {
    width: 100%;
    height: 200px;
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
  .products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .product-card {
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
