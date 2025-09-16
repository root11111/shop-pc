/**
 * @description 导出通用配置
 */
export default {
  // 标题
  title: '智能商城',
  // 副标题
  subtitle: '智能商城购物平台',
  // 描述
  description: '智能商城购物平台',
  // 版权信息
  copyright: 'Copyright 2024 ModulithShop',
  // 路由模式，是否为hash模式
  isHashRouterMode: false,
  // 路由白名单
  routesWhiteList: ['/login', '/register', '/callback', '/404', '/403'],
  // 加载时显示文字
  loadingText: '正在加载中...',
  // token名称
  tokenName: 'token',
  // token在localStorage、sessionStorage、cookie存储的key的名称
  tokenTableName: 'ukey',
  // token存储位置localStorage sessionStorage cookie
  storage: 'localStorage',
  // 是否记录路由
  recordRoute: true,
  // 是否开启logo，不显示时设置false，请填写src/icon路径下的图标名称
  logo: 'vuejs-fill',
  // 语言类型zh-CN、en-US、es-ES
  i18n: 'zh-CN',
  // 消息框消失时间
  messageDuration: 3000,
  // 在哪些环境下显示高亮错误 ['development', 'production']
  errorLog: 'development',
  // 是否开启登录拦截
  loginInterception: true,
  // 是否开启登录RSA加密
  loginRSA: false,
  // 角色控制
  rolesControl: true,
  // 是否只保持一个子菜单的展开
  uniqueOpened: true,
  // 默认展开的菜单path
  defaultOpeneds: [
    '/products',
    '/cart',
  ],
  // 需要加loading层的请求，防止重复提交
  debounce: ['doEdit'],
  // 是否点击一级菜单默认开启二级菜单
  openFirstMenu: true,
  // 日期格式
  dateFmt: "yyyy-MM-dd",
  dateTimeFmt: "yyyy-MM-dd hh:mm:ss",
  timeFmt: "hh:mm:ss",
  // 最大列表数量
  maxListNum: 500,
}
