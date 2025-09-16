import request from './request'

// 获取购物车列表
export const getCartList = () => {
  return request({
    url: '/front/trade/cart/list',
    method: 'get'
  })
}

// 添加商品到购物车
export const addToCart = (data) => {
  return request({
    url: '/front/trade/cart/add',
    method: 'post',
    data
  })
}

// 更新购物车商品数量
export const updateCartQuantity = (data) => {
  return request({
    url: '/front/trade/cart/editQuantity',
    method: 'post',
    data
  })
}

// 删除购物车商品
export const removeFromCart = (data) => {
  return request({
    url: '/front/trade/cart/remove',
    method: 'post',
    data
  })
}

// 批量删除购物车商品
export const removeBatchFromCart = (data) => {
  return request({
    url: '/front/trade/cart/removeBatch',
    method: 'post',
    data
  })
}

// 清空购物车
export const clearCart = () => {
  return request({
    url: '/front/trade/cart/clear',
    method: 'post'
  })
}

// 购物车结算
export const checkoutCart = (data) => {
  return request({
    url: '/front/trade/cart/checkout',
    method: 'post',
    data
  })
}
