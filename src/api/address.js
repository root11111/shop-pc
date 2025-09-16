import request from './request'

// 获取地址列表
export const getAddressList = (params) => {
  return request({
    url: '/front/account/userDeliveryAddress/list',
    method: 'get',
    params
  })
}

// 获取地址详情
export const getAddressDetail = (params) => {
  return request({
    url: '/front/account/userDeliveryAddress/get',
    method: 'get',
    params
  })
}

// 添加地址
export const addAddress = (data) => {
  return request({
    url: '/front/account/userDeliveryAddress/add',
    method: 'post',
    data
  })
}

// 编辑地址
export const editAddress = (data) => {
  return request({
    url: '/front/account/userDeliveryAddress/save',
    method: 'post',
    data
  })
}

// 删除地址
export const removeAddress = (data) => {
  return request({
    url: '/front/account/userDeliveryAddress/remove',
    method: 'post',
    data
  })
}
