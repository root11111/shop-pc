# ModulithShop 商城前台

基于 Vue 3 + TypeScript + Element Plus 构建的现代化商城前台系统。

## 项目特性

- 🚀 **Vue 3** - 使用最新的 Vue 3 Composition API
- 📦 **TypeScript** - 完整的类型支持
- 🎨 **Element Plus** - 现代化的 UI 组件库
- 🏪 **Pinia** - 轻量级状态管理
- 🛣️ **Vue Router** - 官方路由管理
- 📱 **响应式设计** - 完美适配移动端
- 🎯 **模块化架构** - 清晰的代码组织

## 功能模块

### 用户系统
- 用户注册/登录
- 个人中心
- 用户信息管理
- 收货地址管理

### 商品系统
- 商品列表展示
- 商品详情页面
- 商品搜索功能
- 商品分类浏览
- 商品评价系统

### 购物系统
- 购物车管理
- 订单结算
- 订单管理
- 支付集成

### 其他功能
- 响应式布局
- 多语言支持
- 主题切换
- 搜索功能

## 技术栈

- **前端框架**: Vue 3.5+
- **开发语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios
- **样式预处理**: CSS3

## 项目结构

```
src/
├── api/                 # API 接口
│   ├── request.js      # Axios 配置
│   ├── user.js         # 用户相关接口
│   └── product.js      # 商品相关接口
├── assets/             # 静态资源
│   └── styles/         # 样式文件
├── components/         # 公共组件
│   └── layout/         # 布局组件
├── stores/             # 状态管理
│   ├── user.js         # 用户状态
│   └── cart.js         # 购物车状态
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Login.vue       # 登录页
│   └── ...
├── router/             # 路由配置
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 环境配置

创建 `.env.local` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080

# 应用标题
VITE_APP_TITLE=ModulithShop商城
```

## 后端接口

本项目需要配合 ModulithShop 后端系统使用，后端提供以下主要接口：

- 用户管理接口 (`/front/account/*`)
- 商品管理接口 (`/front/pt/*`)
- 订单管理接口 (`/front/trade/*`)
- 支付接口 (`/front/pay/*`)

## 开发规范

### 代码风格

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名使用 PascalCase
- 文件名使用 kebab-case

### 提交规范

- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 联系方式

- 项目地址: [GitHub](https://github.com/your-username/modulithshop-frontend)
- 问题反馈: [Issues](https://github.com/your-username/modulithshop-frontend/issues)