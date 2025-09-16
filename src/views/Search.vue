<template>
  <div class="search-page">
    <div class="container">
      <!-- 搜索框 -->
      <div class="search-header">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品..."
            size="large"
            @keyup.enter="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" @click="handleSearch">
            搜索
          </el-button>
        </div>
        
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
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="hasSearched">
        <div class="results-header">
          <div class="results-info">
            <span>找到 <strong>{{ totalResults }}</strong> 个相关商品</span>
            <span class="search-keyword">"{{ searchKeyword }}"</span>
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
import { Search } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const searchKeyword = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const addingToCart = ref(null)
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)
const totalResults = ref(0)

const searchHistory = ref(['iPhone', 'MacBook', 'Nike', '运动鞋'])
const searchResults = ref([])

// 模拟推荐商品
const recommendedProducts = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: '最新款iPhone，性能强劲',
    price: 7999,
    originalPrice: 8999,
    image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro'
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    description: '轻薄便携，性能卓越',
    price: 8999,
    originalPrice: 9999,
    image: 'https://via.placeholder.com/300x300?text=MacBook+Air+M2'
  },
  {
    id: 3,
    name: 'Nike Air Max',
    description: '舒适运动鞋，时尚百搭',
    price: 599,
    originalPrice: 699,
    image: 'https://via.placeholder.com/300x300?text=Nike+Air+Max'
  },
  {
    id: 4,
    name: '无印良品收纳盒',
    description: '简约设计，实用收纳',
    price: 89,
    image: 'https://via.placeholder.com/300x300?text=收纳盒'
  }
])

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
    ElMessage.warning('请输入搜索关键词')
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

const searchByTag = (tag) => {
  searchKeyword.value = tag
  performSearch()
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
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟搜索结果
    let results = [...mockSearchResults]
    
    // 应用排序
    switch (sortBy.value) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        results.sort((a, b) => b.price - a.price)
        break
      case 'sales':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        results.sort((a, b) => b.isNew - a.isNew)
        break
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    searchResults.value = results.slice(start, end)
    totalResults.value = results.length
    
  } catch (error) {
    ElMessage.error('搜索失败，请重试')
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

const toggleFavorite = (product) => {
  product.isFavorite = !product.isFavorite
  ElMessage.success(product.isFavorite ? '已添加到收藏' : '已取消收藏')
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

onMounted(() => {
  // 从URL参数获取搜索关键词
  if (route.query.q) {
    searchKeyword.value = route.query.q
    handleSearch()
  }
})
</script>

<style scoped>
.search-page {
  padding: 20px 0;
  min-height: 100vh;
  background: #f5f5f5;
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
