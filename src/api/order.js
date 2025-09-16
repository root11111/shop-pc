import request from './request'

// 创建订单
export const createOrder = (data) => {
  return request({
    url: '/front/trade/order/add',
    method: 'post',
    data
  })
}

// 获取订单列表
export const getOrderList = (params) => {
  return request({
    url: '/front/trade/order/list',
    method: 'get',
    params
  })
}

// 获取订单详情
export const getOrderDetail = (id) => {
  return request({
    url: `/front/trade/order/detail`,
    method: 'get',
    params: { order_id: id }
  })
}

// 取消订单
export const cancelOrder = (data) => {
  return request({
    url: '/front/trade/order/cancel',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  })
}

// 确认收货
export const confirmOrder = (data) => {
  return request({
    url: '/front/trade/order/receive',
    method: 'post',
    data
  })
}