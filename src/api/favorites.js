import request from './request'

// 获取收藏商品列表
export const getFavoritesList = (params = {}) => {
  return request({
    url: '/front/shop/userFavoritesItem/lists',
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 20,
      ...params
    }
  })
}

// 添加商品到收藏
export const addToFavorites = (itemId) => {
  return request({
    url: '/front/shop/userFavoritesItem/add',
    method: 'post',
    data: {
      item_id: itemId
    }
  })
}

// 从收藏中移除商品
export const removeFromFavorites = (itemId) => {
  return request({
    url: '/front/shop/userFavoritesItem/remove',
    method: 'post',
    data: {
      item_id: itemId
    }
  })
}
