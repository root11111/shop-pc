import request from './request'

// 用户登录
export const login = (data) => {
  return request({
    url: '/front/account/login/login',
    method: 'post',
    data
  })
}

// 用户注册
export const register = (data) => {
  return request({
    url: '/front/account/login/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/front/account/user/info',
    method: 'get'
  })
}

// 更新用户信息
export const updateUserInfo = (data) => {
  return request({
    url: '/front/account/user/edit',
    method: 'post',
    data
  })
}

// 用户退出登录
export const logout = () => {
  return request({
    url: '/front/account/login/logout',
    method: 'post'
  })
}

// 绑定手机号
export const bindMobile = (data) => {
  return request({
    url: '/front/account/user/bindMobile',
    method: 'post',
    data
  })
}

// 获取用户等级列表
export const getUserLevels = () => {
  return request({
    url: '/front/account/user/listBaseUserLevel',
    method: 'get'
  })
}
