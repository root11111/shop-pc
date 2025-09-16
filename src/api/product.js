import request from './request'

// 获取商品列表
export const getProductList = (params) => {
  return request({
    url: '/front/pt/product/list',
    method: 'get',
    params: {
      ...params,
      include_dynamic_fields: true // 包含动态字段
    }
  })
}

// 获取商品详情
export const getProductDetail = (id, extraParams = {}) => {
  return request({
    url: `/front/pt/product/detail`,
    method: 'get',
    params: { 
      item_id: id,
      include_dynamic_fields: true, // 包含动态字段
      ...extraParams // 合并额外参数
    }
  })
}

// 搜索商品
export const searchProducts = (params) => {
  return request({
    url: '/front/pt/product/search',
    method: 'get',
    params
  })
}

// 获取商品分类 - 使用listCategory接口获取一级分类
export const getCategories = () => {
  return request({
    url: '/front/pt/product/listCategory',
    method: 'get',
    params: {
      size: 500
    }
  })
}

// 获取商品评价
export const getProductComments = (productId, params) => {
  return request({
    url: `/front/pt/product/${productId}/comments`,
    method: 'get',
    params
  })
}

// 添加商品评价
export const addProductComment = (data) => {
  return request({
    url: '/front/pt/product/comment',
    method: 'post',
    data
  })
}

// 获取热门商品 - 通过商品列表接口获取，按销量排序
export const getHotProducts = (params) => {
  return request({
    url: '/front/pt/product/list',
    method: 'get',
    params: {
      ...params,
      orderby: 1, // 按销量排序
      sort: 2,    // 降序
      limit: params?.limit || 8
    }
  })
}

// 获取推荐商品 - 通过商品列表接口获取，按添加时间排序
export const getRecommendProducts = (params) => {
  return request({
    url: '/front/pt/product/list',
    method: 'get',
    params: {
      ...params,
      orderby: 2, // 按添加时间排序
      sort: 2,    // 降序
      limit: params?.limit || 8
    }
  })
}
