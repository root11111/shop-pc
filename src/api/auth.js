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

// 用户登出
export const logout = () => {
  return request({
    url: '/front/account/login/logout',
    method: 'post'
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/front/account/user/info',
    method: 'get'
  })
}

// 获取验证码
export const getVerifyCode = () => {
  return request({
    url: '/front/sys/captcha/index',
    method: 'get'
  })
}

// 发送手机验证码
export const sendMobileVerifyCode = (data) => {
  return request({
    url: '/front/sys/captcha/mobile',
    method: 'post',
    data
  })
}

// 发送邮箱验证码
export const sendEmailVerifyCode = (data) => {
  return request({
    url: '/front/sys/captcha/email',
    method: 'post',
    data
  })
}

// 短信登录
export const doSmsLogin = (data) => {
  return request({
    url: '/front/account/login/doSmsLogin',
    method: 'post',
    data
  })
}

// 设置新密码
export const setNewPassword = (data) => {
  return request({
    url: '/front/account/login/setNewPassword',
    method: 'post',
    data
  })
}

// 获取会员类型详情
export const getUserLevelInfo = (levelId) => {
  return request({
    url: `/front/account/userLevel/info/${levelId}`,
    method: 'get'
  })
}
