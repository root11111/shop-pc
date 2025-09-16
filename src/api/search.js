import request from './request'

// 获取搜索信息（热门搜索词、搜索历史、建议搜索词）
export const getSearchInfo = () => {
  return request({
    url: '/front/shop/mobile/getSearchInfo',
    method: 'get'
  })
}

// 搜索商品
export const searchProducts = (params) => {
  return request({
    url: '/front/pt/product/list',
    method: 'get',
    params: {
      ...params,
      include_dynamic_fields: true // 包含动态字段
    }
  })
}

// 获取搜索建议（如果需要的话）
export const getSearchSuggestions = (keyword) => {
  return request({
    url: '/front/pt/product/searchSuggestions',
    method: 'get',
    params: {
      keyword: keyword
    }
  })
}
