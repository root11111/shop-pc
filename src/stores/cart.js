import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 初始化时清空可能存在的模拟数据
  const initializeCart = () => {
    const stored = localStorage.getItem('cartItems')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // 检查是否是模拟数据（通过商品名称判断）
        const isMockData = parsed.some(item => 
          item.name && (
            item.name.includes('iPhone 15 Pro') || 
            item.name.includes('MacBook Air M2') || 
            item.name.includes('Nike Air Max')
          )
        )
        if (isMockData) {
          localStorage.removeItem('cartItems')
          return []
        }
        return parsed
      } catch {
        localStorage.removeItem('cartItems')
        return []
      }
    }
    return []
  }
  
  const cartItems = ref(initializeCart())

  // 总数量
  const totalCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 总价格
  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  // 添加商品到购物车
  const addToCart = (product) => {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += product.quantity || 1
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1,
        stock: product.stock || 0
      })
    }
    
    saveToLocalStorage()
  }

  // 更新商品数量
  const updateQuantity = (productId, quantity) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
        saveToLocalStorage()
      }
    }
  }

  // 从购物车移除商品
  const removeFromCart = (productId) => {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  // 清空购物车
  const clearCart = () => {
    cartItems.value = []
    saveToLocalStorage()
  }

  // 保存到本地存储
  const saveToLocalStorage = () => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
  }

  // 检查商品是否在购物车中
  const isInCart = (productId) => {
    return cartItems.value.some(item => item.id === productId)
  }

  // 获取商品在购物车中的数量
  const getCartQuantity = (productId) => {
    const item = cartItems.value.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  return {
    cartItems,
    totalCount,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getCartQuantity
  }
})
