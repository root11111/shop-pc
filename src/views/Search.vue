<template>
  <div class="search-page">
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
      <!-- 搜索提示和标签 -->
      <div class="search-header" v-if="!hasSearched">
        <!-- 搜索提示 -->
        <div class="search-tips">
          <span class="tip-text">💡 支持搜索商品名称、商品ID，输入数字将按商品ID搜索</span>
        </div>
        
        <!-- 搜索历史 -->
        <div class="search-tags" v-if="searchHistory.length > 0">
          <span class="tags-label">搜索历史：</span>
          <el-tag
            v-for="tag in searchHistory"
            :key="tag"
            class="search-tag"
            @click="searchByTag(tag)"
            closable
            @close="removeSearchHistory(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
        
        <!-- 热门搜索 -->
        <div class="search-tags" v-if="hotKeywords.length > 0">
          <span class="tags-label">热门搜索：</span>
          <el-tag
            v-for="tag in hotKeywords"
            :key="tag"
            class="search-tag hot-tag"
            @click="searchByTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="hasSearched">
        <div class="results-header">
          <div class="results-info">
            <span>找到 <strong>{{ totalResults }}</strong> 个相关商品</span>
            <span class="search-keyword">"{{ searchKeyword }}"</span>
            <el-button 
              type="text" 
              @click="handleClear" 
              class="clear-search-btn"
              size="small"
            >
              <el-icon><Close /></el-icon>
              清除搜索
            </el-button>
          </div>
          
          <div class="sort-options">
            <el-select v-model="sortBy" @change="handleSortChange" placeholder="排序方式">
              <el-option label="综合排序" value="default" />
              <el-option label="价格从低到高" value="price_asc" />
              <el-option label="价格从高到低" value="price_desc" />
              <el-option label="销量最高" value="sales" />
              <el-option label="最新上架" value="newest" />
            </el-select>
          </div>
        </div>

        <div class="products-grid" v-loading="loading">
          <div 
            v-for="product in searchResults" 
            :key="product.id" 
            class="product-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge" v-if="product.isNew">新品</div>
            </div>
            
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              
              <div class="product-rating">
                <el-rate 
                  v-model="product.rating" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                />
              </div>
              
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              </div>
              
              <div class="product-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  @click.stop="addToCart(product)"
                  :loading="addingToCart === product.id"
                >
                  加入购物车
                </el-button>
                <el-button 
                  size="small" 
                  @click.stop="toggleFavorite(product)"
                  :icon="product.isFavorite ? 'StarFilled' : 'Star'"
                  :type="product.isFavorite ? 'warning' : 'default'"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section" v-if="totalResults > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48, 96]"
            :total="totalResults"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div class="no-results" v-else-if="hasSearched && searchResults.length === 0">
        <div class="no-results-icon">
          <el-icon size="80"><Search /></el-icon>
        </div>
        <h3>没有找到相关商品</h3>
        <p>试试其他关键词或浏览推荐商品</p>
        <el-button type="primary" @click="goToProducts">
          浏览商品
        </el-button>
      </div>

      <!-- 推荐商品 -->
      <div class="recommendations" v-if="!hasSearched">
        <h2>推荐商品</h2>
        <div class="products-grid">
          <div 
            v-for="product in recommendedProducts" 
            :key="product.id" 
            class="product-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Close } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { getSearchInfo, searchProducts } from '@/api/search'
import { addToFavorites, removeFromFavorites } from '@/api/favorites'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const addingToCart = ref(null)
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)
const totalResults = ref(0)

// 搜索相关数据
const searchHistory = ref([])
const hotKeywords = ref([])
const suggestKeyword = ref('')
const searchResults = ref([])

// 推荐商品
const recommendedProducts = ref([])

// 加载推荐商品
const loadRecommendedProducts = async () => {
  try {
    console.log('开始获取推荐商品...')
    
    // 构建API请求参数（不传搜索参数，获取推荐商品）
    const params = {
      page: 1,
      limit: 8  // 获取8个推荐商品
    }
    
    // 添加用户会员类型参数
    if (userStore.userInfo && userStore.userInfo.user_level_id) {
      params.user_level_id = userStore.userInfo.user_level_id
    }
    
    // 按销量排序获取热门商品作为推荐
    params.orderby = 1 // 按销量排序
    params.sort = 2    // 降序
    
    console.log('推荐商品API请求参数:', params)
    const response = await searchProducts(params)
    console.log('推荐商品API响应:', response)
    
    // 处理推荐商品数据
    let productData = null
    if (response && response.code === 0) {
      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        productData = response.data.records
      } else if (response.data && Array.isArray(response.data)) {
        productData = response.data
      } else if (response.records && Array.isArray(response.records)) {
        productData = response.records
      } else {
        console.log('推荐商品响应数据结构:', response)
        // 尝试查找可能的数组字段
        const possibleFields = ['records', 'data', 'items', 'list']
        for (const field of possibleFields) {
          if (response[field] && Array.isArray(response[field])) {
            productData = response[field]
            break
          }
        }
        if (!productData && response.data && typeof response.data === 'object') {
          for (const field of possibleFields) {
            if (response.data[field] && Array.isArray(response.data[field])) {
              productData = response.data[field]
              break
            }
          }
        }
      }
    } else if (Array.isArray(response)) {
      productData = response
    }
    
    if (productData && Array.isArray(productData)) {
      // 映射推荐商品数据格式
      recommendedProducts.value = productData.map(item => {
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
          isFavorite: item.is_favorite || false
        }
      })
      
      console.log('推荐商品加载成功:', recommendedProducts.value)
    } else {
      console.log('没有找到推荐商品数据')
      recommendedProducts.value = []
    }
    
  } catch (error) {
    console.error('获取推荐商品失败:', error)
    recommendedProducts.value = []
  }
}

// 加载搜索信息
const loadSearchInfo = async () => {
  try {
    console.log('开始获取搜索信息...')
    const response = await getSearchInfo()
    console.log('搜索信息API响应:', response)
    
    if (response && response.code === 0) {
      const data = response.data
      // 设置热门搜索词
      if (data.search_hot_words && Array.isArray(data.search_hot_words)) {
        hotKeywords.value = data.search_hot_words
      }
      
      // 设置搜索历史
      if (data.search_history_words && Array.isArray(data.search_history_words)) {
        searchHistory.value = data.search_history_words
      }
      
      // 设置建议搜索词
      if (data.suggest_search_words && data.suggest_search_words.default_search_words) {
        suggestKeyword.value = data.suggest_search_words.default_search_words
      }
      
      console.log('搜索信息加载成功:', {
        hotKeywords: hotKeywords.value,
        searchHistory: searchHistory.value,
        suggestKeyword: suggestKeyword.value
      })
    } else {
      console.error('搜索信息获取失败:', response)
    }
  } catch (error) {
    console.error('获取搜索信息失败:', error)
    // 设置默认值
    hotKeywords.value = ['手机', '电脑', '服装', '运动鞋', '化妆品']
    suggestKeyword.value = '搜索商品'
  }
}

// 模拟搜索结果
const mockSearchResults = [
  {
    id: 1,
    name: 'iPhone 15 Pro 256GB 深空黑色',
    description: '最新款iPhone，性能强劲，拍照效果出色',
    price: 7999,
    originalPrice: 8999,
    image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
    rating: 4.8,
    isNew: true,
    isFavorite: false
  },
  {
    id: 2,
    name: 'iPhone 14 Pro 128GB 深空黑色',
    description: '上一代旗舰，性价比之选',
    price: 6999,
    originalPrice: 7999,
    image: 'https://via.placeholder.com/300x300?text=iPhone+14+Pro',
    rating: 4.6,
    isNew: false,
    isFavorite: true
  },
  {
    id: 3,
    name: 'iPhone 13 128GB 粉色',
    description: '经典设计，稳定可靠',
    price: 4999,
    originalPrice: 5999,
    image: 'https://via.placeholder.com/300x300?text=iPhone+13',
    rating: 4.5,
    isNew: false,
    isFavorite: false
  }
]

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    return
  }
  
  // 添加到搜索历史
  if (!searchHistory.value.includes(searchKeyword.value)) {
    searchHistory.value.unshift(searchKeyword.value)
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }
  }
  
  performSearch()
}

// 清除搜索内容
const handleClear = () => {
  // 直接跳转到商品列表页面
  router.push('/products')
}

const searchByTag = (tag) => {
  // 跳转到搜索页面并传递搜索关键词
  router.push({
    name: 'Search',
    query: { q: tag }
  })
}

const removeSearchHistory = (tag) => {
  const index = searchHistory.value.indexOf(tag)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
}

const performSearch = async () => {
  loading.value = true
  hasSearched.value = true
  
  try {
    console.log('开始搜索商品:', searchKeyword.value)
    
    // 构建搜索参数
    const searchTerm = searchKeyword.value.trim()
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    // 设置搜索参数
    if (searchTerm) {
      // 如果搜索词是纯数字，只按商品ID搜索
      if (/^\d+$/.test(searchTerm)) {
        params.productId = parseInt(searchTerm)
        console.log('搜索词为纯数字，按商品ID搜索:', searchTerm)
      } else {
        // 非纯数字，按商品名称和关键词搜索
        params.keywords = searchTerm  // 关键词搜索（主要搜索方式）
        params.productName = searchTerm  // 商品名称搜索
        console.log('搜索词为文字，按商品名称和关键词搜索:', searchTerm)
      }
      
      console.log('搜索参数:', params)
    }
    
    // 添加用户会员类型参数
    if (userStore.userInfo && userStore.userInfo.user_level_id) {
      params.user_level_id = userStore.userInfo.user_level_id
    }
    
    // 添加排序参数
    switch (sortBy.value) {
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
    
    console.log('搜索API请求参数:', params)
    const response = await searchProducts(params)
    console.log('搜索API响应:', response)
    
    // 处理搜索结果
    let productData = null
    if (response && response.code === 0) {
      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        productData = response.data.records
        totalResults.value = response.data.total || 0
      } else if (response.data && Array.isArray(response.data)) {
        productData = response.data
        totalResults.value = response.total || 0
      } else if (response.records && Array.isArray(response.records)) {
        productData = response.records
        totalResults.value = response.total || 0
      } else {
        console.log('搜索响应数据结构:', response)
        // 尝试查找可能的数组字段
        const possibleFields = ['records', 'data', 'items', 'list']
        for (const field of possibleFields) {
          if (response[field] && Array.isArray(response[field])) {
            productData = response[field]
            totalResults.value = response.total || 0
            break
          }
        }
        if (!productData && response.data && typeof response.data === 'object') {
          for (const field of possibleFields) {
            if (response.data[field] && Array.isArray(response.data[field])) {
              productData = response.data[field]
              totalResults.value = response.data.total || 0
              break
            }
          }
        }
      }
    } else if (Array.isArray(response)) {
      productData = response
      totalResults.value = response.length
    }
    
    if (productData && Array.isArray(productData)) {
      // 映射搜索结果数据格式
      searchResults.value = productData.map(item => {
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
          isFavorite: item.is_favorite || false
        }
      })
      
      console.log('搜索结果加载成功:', searchResults.value)
    } else {
      searchResults.value = []
      totalResults.value = 0
      console.log('没有找到搜索结果')
    }
    
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
    searchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

const handleSortChange = () => {
  currentPage.value = 1
  performSearch()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  performSearch()
}

const handlePageChange = (page) => {
  currentPage.value = page
  performSearch()
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

const goToProducts = () => {
  router.push('/products')
}

// 监听路由参数变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchKeyword.value = newQuery
    handleSearch()
  }
}, { immediate: true })

onMounted(async () => {
  // 加载搜索信息（热门搜索词、搜索历史等）
  await loadSearchInfo()
  
  // 从URL参数获取搜索关键词
  if (route.query.q) {
    searchKeyword.value = route.query.q
    handleSearch()
  } else {
    // 如果没有搜索关键词，加载推荐商品
    await loadRecommendedProducts()
  }
})
</script>

<style scoped>
.search-page {
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
  right: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  right: 20%;
  animation-delay: -4s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: -14s;
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

.container {
  position: relative;
  z-index: 2;
}

.search-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-box .el-input {
  flex: 1;
}

.search-box .el-button {
  height: 40px;
  padding: 0 24px;
}

.search-tips {
  margin-bottom: 20px;
  text-align: center;
}

.tip-text {
  color: #666;
  font-size: 14px;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
}

.search-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tags-label {
  color: #666;
  font-size: 14px;
}

.search-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-tag:hover {
  background: #409eff;
  color: white;
}

.hot-tag {
  background: #ff6b6b;
  color: white;
  border: none;
}

.hot-tag:hover {
  background: #ff5252;
  color: white;
}

.search-results {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.search-keyword {
  color: #409eff;
  font-weight: 500;
}

.clear-search-btn {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.clear-search-btn:hover {
  color: #409eff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 30px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-rating {
  margin-bottom: 12px;
}

.product-price {
  margin-bottom: 16px;
}

.current-price {
  font-size: 20px;
  font-weight: 600;
  color: #ff4757;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.product-actions .el-button {
  flex: 1;
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px 30px;
  border-top: 1px solid #f0f0f0;
}

.no-results {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-results-icon {
  color: #ddd;
  margin-bottom: 20px;
}

.no-results h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.no-results p {
  color: #666;
  margin-bottom: 30px;
}

.recommendations {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recommendations h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }
  
  .results-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    padding: 20px;
  }
  
  .product-info {
    padding: 15px;
  }
}
</style>
