import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import qs from 'qs'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8101',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    console.log('请求拦截器 - 原始config:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      token: userStore.token
    })
    
    if (userStore.token) {
      // 根据后端JWT认证方式，通过URL参数传递access_token
      if (config.method === 'get') {
        // 对于GET请求，使用params选项
        config.params = config.params || {}
        config.params.access_token = userStore.token
        console.log('GET请求 - 添加access_token到params:', config.params)
      } else {
        // 对于POST请求，将access_token添加到URL参数中
        config.params = config.params || {}
        config.params.access_token = userStore.token
        console.log('POST请求 - 添加access_token到params:', config.params)
      }
    }
    
    // 对于POST请求，根据接口类型选择数据格式
    if (config.method === 'post' && config.data) {
      // 订单相关接口使用JSON格式，但取消订单接口使用form格式
      const isOrderApi = config.url && config.url.includes('order')
      const isCancelOrderApi = config.url && config.url.includes('order/cancel')
      
      if (isOrderApi && !isCancelOrderApi) {
        // 普通订单接口使用JSON格式
        config.headers['Content-Type'] = 'application/json;charset=UTF-8'
        config.data = JSON.stringify(config.data)
        console.log('订单接口 - 使用JSON格式:', config.data)
      } else if (isCancelOrderApi) {
        // 取消订单接口使用form格式
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
        config.data = qs.stringify(config.data)
        console.log('取消订单接口 - 使用form格式:', config.data)
      } else {
        // 其他接口使用form格式
        config.data = qs.stringify(config.data)
        console.log('其他接口 - 序列化后的data:', config.data)
      }
    }
    
    console.log('请求拦截器 - 最终config:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    })
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response
    
    // 根据小程序接口返回格式处理
    if (response.status === 200) {
      // 如果后端返回的数据有 code 字段
      if (data && typeof data === 'object' && 'code' in data) {
        if (data.code === 200 || data.code === 0) {
          return data
        } else {
          // 对于地址相关接口的401错误，不显示错误提示
          const isAddressApi = response.config.url && response.config.url.includes('address')
          if (isAddressApi && data.code === 401 && data.msg && data.msg.includes('登录')) {
            // 不显示错误提示，直接返回数据让调用方处理
            return data
          }
          
          // 对于订单相关接口，不显示错误提示，让调用方处理
          const isOrderApi = response.config.url && response.config.url.includes('order')
          if (isOrderApi) {
            // 不显示错误提示，直接返回数据让调用方处理
            return data
          }
          
          ElMessage.error(data.message || data.msg || '请求失败')
          return Promise.reject(new Error(data.message || data.msg || '请求失败'))
        }
      } else {
        // 如果后端直接返回数据，没有包装
        return data
      }
    } else {
      ElMessage.error('请求失败')
      return Promise.reject(new Error('请求失败'))
    }
  },
  error => {
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          const userStore = useUserStore()
          userStore.logout()
          ElMessage.error('登录已过期，请重新登录')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default request
