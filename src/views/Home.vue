<template>
  <div class="home">
    <!-- 轮播图 -->
    <section class="banner-section">
      <el-carousel height="400px" :interval="5000" arrow="hover">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-content">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.description }}</p>
              <el-button type="primary" size="large" @click="goToProducts">
                立即购买
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 商品分类 -->
    <section class="category-section">
      <div class="container">
        <div class="category-header">
          <h2 class="section-title">商品分类</h2>
        </div>
        <div class="category-container">
          <div class="puzzle-grid" ref="categoryScroll">
            <div 
              v-for="(category, index) in categories" 
              :key="category.id"
              :class="['puzzle-piece', `puzzle-${index % 8 + 1}`]"
              @click="goToCategory(category.id)"
            >
              <div class="puzzle-content">
                <div class="puzzle-icon">
                  <img :src="category.icon" :alt="category.name" />
                </div>
                <span class="puzzle-name">{{ category.name }}</span>
              </div>
              <div class="puzzle-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 商品展示区域 -->
    <section class="products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精选商品</h2>
          <el-button type="primary" @click="goToProducts">
            查看更多
          </el-button>
        </div>
        
        <!-- 商品网格 -->
        <div class="products-grid" v-loading="productsLoading">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="product-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image">
              <img 
                :src="product.image || product.product_image || '/placeholder-product.png'" 
                :alt="product.name || product.product_name"
                @error="handleImageError"
              />
              <div class="product-overlay">
                <el-button type="primary" size="small">
                  查看详情
                </el-button>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name || product.product_name }}</h3>
              <p class="product-desc">{{ product.description || product.product_desc || '精选好物，品质保证' }}</p>
              <div class="product-price">
                <span class="current-price">¥{{ product.price || product.sale_price || '0.00' }}</span>
                <span v-if="product.original_price && product.original_price > product.price" class="original-price">
                  ¥{{ product.original_price }}
                </span>
              </div>
              <div class="product-rating">
                <el-rate 
                  :model-value="product.rating || 5" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                  score-template="{value}"
                />
                <span class="rating-count">({{ product.sales_count || 0 }}人购买)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-container" v-if="total > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48, 96]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { getCategories, getProductList } from '../api/product'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const cartStore = useCartStore()

const banners = ref([
  {
    title: '新品上市',
    description: '精选好物，品质保证',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MDllZmY7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N2VlYTtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8dGV4dCB4PSI2MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbveWbvSXkuK3mlrDlpKfmlrDvvIzlj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjx0ZXh0IHg9IjYwMCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjwvc3ZnPg=='
  },
  {
    title: '限时优惠',
    description: '全场8折，错过再等一年',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2N2MyM2E7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzRjYWY1MDtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8dGV4dCB4PSI2MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbveWbvSXkuK3mlrDlpKfmlrDvvIzlj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjx0ZXh0IHg9IjYwMCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjwvc3ZnPg=='
  },
  {
    title: '品质生活',
    description: '让生活更美好',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNTZjNmM7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmNjc0NztzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8dGV4dCB4PSI2MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbveWbvSXkuK3mlrDlpKfmlrDvvIzlj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjx0ZXh0IHg9IjYwMCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lj6/ku6XkuI3kuIDkuK3kuI3kuIDkuK3kuI3kuIDkuK08L3RleHQ+Cjwvc3ZnPg=='
  }
])

const categories = ref([])

// 商品相关数据
const products = ref([])
const productsLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 分类引用
const categoryScroll = ref(null)

// 获取商品分类
const fetchCategories = async () => {
  try {
    console.log('开始获取分类数据...')
    const response = await getCategories()
    console.log('分类接口响应:', response)
    
    // 处理API响应数据 - 按照小程序的处理方式
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
      throw error
    }
  }
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    productsLoading.value = true
    console.log('开始获取商品数据...', {
      page: currentPage.value,
      size: pageSize.value
    })
    
    const response = await getProductList({
      page: currentPage.value,
      size: pageSize.value,
      orderby: 2, // 按添加时间排序
      sort: 2     // 降序
    })
    
    console.log('商品接口响应:', response)
    
    // 处理API响应数据
    let productData = null
    let totalCount = 0
    
    if (response && response.code === 0) {
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        productData = response.data.items
        totalCount = response.data.records || response.data.total || 0
        console.log('使用 response.data.items:', productData)
      } else if (response.items && Array.isArray(response.items)) {
        productData = response.items
        totalCount = response.records || response.total || 0
        console.log('使用 response.items:', productData)
      } else if (response.data && Array.isArray(response.data)) {
        productData = response.data
        totalCount = response.records || response.total || 0
        console.log('使用 response.data:', productData)
      } else {
        console.log('商品响应数据结构:', response)
        // 尝试查找可能的数组字段
        const possibleFields = ['items', 'data', 'list', 'products']
        for (const field of possibleFields) {
          if (response[field] && Array.isArray(response[field])) {
            productData = response[field]
            totalCount = response.records || response.total || 0
            console.log(`找到数组字段 ${field}:`, productData)
            break
          }
        }
        if (!productData && response.data && typeof response.data === 'object') {
          for (const field of possibleFields) {
            if (response.data[field] && Array.isArray(response.data[field])) {
              productData = response.data[field]
              totalCount = response.data.records || response.data.total || 0
              console.log(`找到 response.data.${field}:`, productData)
              break
            }
          }
        }
      }
    } else if (Array.isArray(response)) {
      productData = response
      totalCount = response.length
      console.log('使用 response 直接:', productData)
    } else {
      console.error('商品数据格式错误或为空:', response)
      throw new Error('商品数据获取失败')
    }
    
    if (productData && Array.isArray(productData)) {
      products.value = productData.map(item => ({
        id: item.item_id || item.id,
        name: item.item_name || item.name || item.product_name,
        description: item.item_desc || item.description || item.product_desc,
        price: item.sale_price || item.price,
        original_price: item.market_price || item.original_price,
        image: item.item_image || item.image || item.product_image,
        rating: item.rating || 5,
        sales_count: item.sales_count || item.sales || 0
      }))
      total.value = totalCount
      console.log('商品数据加载成功:', products.value)
    } else {
      console.error('商品数据格式错误或为空:', response)
      throw new Error('商品数据获取失败')
    }
  } catch (error) {
    console.error('获取商品失败:', error)
    // 如果是登录相关错误，不显示错误提示，直接跳转到登录页面
    if (error.message && error.message.includes('登录')) {
      console.log('用户未登录，跳转到登录页面')
      router.push('/login')
    } else {
      ElMessage.error('获取商品数据失败')
    }
  } finally {
    productsLoading.value = false
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfmlKDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPg=='
}

// 分页处理函数
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchProducts()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchProducts()
}

// 跳转到商品详情页
const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 跳转到商品列表页
const goToProducts = () => {
  router.push('/products')
}

// 跳转到分类页面
const goToCategory = (categoryId) => {
  router.push({
    path: '/products',
    query: { category: categoryId }
  })
}


onMounted(async () => {
  try {
    await Promise.all([
      fetchCategories(),
      fetchProducts()
    ])
  } catch (error) {
    // 错误已经在各自的函数中处理了
    console.log('首页数据加载失败:', error)
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.banner-section {
  margin-bottom: 60px;
}

.banner-item {
  height: 400px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.banner-content {
  text-align: center;
  color: white;
  z-index: 1;
  position: relative;
}

.banner-content h2 {
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: bold;
}

.banner-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.category-section,
.products-section {
  padding: 60px 0;
}

.category-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

.category-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

.products-section {
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #333;
  position: relative;
  z-index: 2;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
}

.category-indicators {
  display: flex;
  gap: 10px;
}

.scroll-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.scroll-indicator:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-indicator.left {
  margin-right: 10px;
}

.scroll-indicator.right {
  margin-left: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.category-container {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 10px 0;
  max-height: 400px;
  overflow-y: auto;
  position: relative;
}

.puzzle-grid::-webkit-scrollbar {
  width: 8px;
}

.puzzle-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.puzzle-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.puzzle-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: scaleY(1.2);
}

.puzzle-piece {
  position: relative;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transform: translateY(50px);
}

.puzzle-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.puzzle-piece:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.puzzle-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.puzzle-piece:hover .puzzle-glow {
  opacity: 1;
}

/* 拼图形状定义 */
.puzzle-1 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 20px 20px 20px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.puzzle-2 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 20px 5px 20px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.puzzle-3 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 5px 20px 20px 5px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.puzzle-4 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 20px 20px 5px 20px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.puzzle-5 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 20px 20px 20px 5px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.puzzle-6 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 5px 5px 20px 20px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.puzzle-7 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 20px 5px 5px 20px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.puzzle-8 {
  grid-column: span 1;
  grid-row: span 1;
  border-radius: 5px 20px 5px 5px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.puzzle-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 12px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.puzzle-piece:hover .puzzle-icon {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6);
}

.puzzle-icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.puzzle-name {
  font-size: 0.9rem;
  color: white;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  transition: all 0.3s ease;
}

.puzzle-piece:hover .puzzle-name {
  transform: translateY(-2px);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
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

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-count {
  font-size: 0.9rem;
  color: #666;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .banner-content h2 {
    font-size: 2rem;
  }
  
  .banner-content p {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .category-header {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
  
  .category-indicators {
    order: -1;
  }
  
  .category-container {
    padding: 15px;
  }
  
  .category-scroll {
    gap: 16px;
    padding: 8px 0;
  }
  
  .category-item {
    min-width: 110px;
    padding: 20px 12px;
  }
  
  .category-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 8px;
  }
  
  .category-icon img {
    width: 30px;
    height: 30px;
  }
  
  .category-name {
    font-size: 0.8rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .category-item {
    min-width: 90px;
    padding: 12px 8px;
  }
  
  .category-icon {
    width: 45px;
    height: 45px;
  }
  
  .category-icon img {
    width: 25px;
    height: 25px;
  }
  
  .category-name {
    font-size: 0.75rem;
  }
}

/* 跳动动画定义 */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.3);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px) scale(1.05);
  }
  70% {
    transform: translateY(5px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 持续跳动动画 */
@keyframes continuousBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 为拼图块添加持续跳动效果 */
.puzzle-piece {
  animation: bounceIn 0.6s ease-out forwards, continuousBounce 3s ease-in-out infinite;
}

.puzzle-1 { animation-delay: 0.1s, 0.1s; }
.puzzle-2 { animation-delay: 0.2s, 0.2s; }
.puzzle-3 { animation-delay: 0.3s, 0.3s; }
.puzzle-4 { animation-delay: 0.4s, 0.4s; }
.puzzle-5 { animation-delay: 0.5s, 0.5s; }
.puzzle-6 { animation-delay: 0.6s, 0.6s; }
.puzzle-7 { animation-delay: 0.7s, 0.7s; }
.puzzle-8 { animation-delay: 0.8s, 0.8s; }
</style>
