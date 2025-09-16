<template>
  <div class="login-container">
    <!-- 炫酷视频背景 -->
    <div class="background">
      <!-- 视频背景 -->
      <div class="video-background">
        <video 
          autoplay 
          loop 
          muted 
          playsinline
          class="background-video"
          @loadstart="onVideoLoadStart"
          @error="onVideoError"
          @loadeddata="onVideoLoaded"
          @canplay="onVideoCanPlay"
          @loadend="onVideoLoadEnd"
          @waiting="onVideoWaiting"
          @stalled="onVideoStalled"
        >
          <source :src="videoSrc" type="video/mp4">
          您的浏览器不支持HTML5视频标签。
        </video>
        <div class="video-overlay"></div>
        <div class="animated-particles">
          <div class="particle" v-for="n in 50" :key="n" :style="getParticleStyle(n)"></div>
        </div>
        <div class="geometric-shapes">
          <div class="shape triangle"></div>
          <div class="shape square"></div>
          <div class="shape circle"></div>
          <div class="shape hexagon"></div>
        </div>
        <div class="grid-lines">
          <div class="line horizontal" v-for="n in 20" :key="'h' + n"></div>
          <div class="line vertical" v-for="n in 30" :key="'v' + n"></div>
        </div>
      </div>
    </div>

    <!-- 多语言切换按钮 -->
    <div class="language-switcher">
      <LanguageSwitcher />
    </div>

    <div class="login-wrapper">
      <!-- 左侧内容 -->
      <div class="left-content">
        <div class="welcome-text">
                 <h1 class="main-title">{{ $t('login.welcome') }}</h1>
                 <h2 class="sub-title">{{ settingsStore.getTitle }}</h2>
                 <p class="description">{{ settingsStore.getDescription }}</p>
        </div>
      </div>
      
      <!-- 右侧登录卡片 -->
      <div class="login-card">
        <el-form
          ref="formRef"
          class="login-form"
          :model="form"
          :rules="rules"
        >
          <!-- 系统标题 -->
          <div class="form-header">
            <div class="logo">
              <div class="logo-icon">🛒</div>
            </div>
                   <h1 class="title">{{ settingsStore.getTitle }}</h1>
                   <p class="subtitle">{{ settingsStore.getSubtitle }}</p>
          </div>

          <!-- 表单内容 -->
          <div class="form-body">
            <el-form-item prop="username">
              <el-input
                v-model.trim="form.username"
                v-focus
                :placeholder="$t('login.username')"
                size="large"
                class="form-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                :key="passwordType"
                ref="passwordRef"
                v-model.trim="form.password"
                :placeholder="$t('login.password')"
                size="large"
                :type="passwordType"
                class="form-input"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
                <template #suffix>
                  <el-icon
                    class="password-toggle"
                    @click="handlePassword"
                  >
                    <View v-if="passwordType === 'password'" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                class="login-btn"
                :loading="loading"
                type="primary"
                size="large"
                @click="handleLogin"
              >
                {{ loading ? $t('common.loading') : $t('common.login') }}
              </el-button>
            </el-form-item>
          </div>
        </el-form>
        
        <!-- 注册链接 -->
        <div class="login-footer">
          <p>{{ $t('login.noAccount') }}<router-link to="/register">{{ $t('common.register') }}</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { login } from '@/api/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const formRef = ref()
const passwordRef = ref()
const loading = ref(false)
const passwordType = ref('password')
const videoSrc = ref('/videos/background.mp4')

const form = reactive({
  username: '',
  password: ''
})

const rules = computed(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' }
  ]
}))

// 密码显示/隐藏
const handlePassword = () => {
  passwordType.value = passwordType.value === 'password' ? '' : 'password'
  nextTick(() => {
    passwordRef.value?.focus()
  })
}

// 登录处理
const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 调用真实的登录API
        const loginData = {
          username: form.username,
          password: form.password,
          user_account: form.username,
          encrypt: false,
          client_info: {
            platform: 'web',
            version: '1.0.0'
          }
        }

        console.log('发送登录请求:', loginData)
        const response = await login(loginData)
        console.log('登录响应:', response)

        if (response && response.code === 0) {
          // 登录成功
          const userData = {
            id: response.data?.user_id || response.data?.id,
            username: form.username,
            nickname: response.data?.user_nickname || response.data?.nickname || form.username,
            email: response.data?.user_email || response.data?.email || `${form.username}@example.com`,
            avatar: response.data?.user_avatar || response.data?.avatar || 'https://via.placeholder.com/100',
            user_level_id: response.data?.user_level_id,
            user_level: response.data?.user_level || null
          }

          const token = response.data?.token || response.token

          // 保存用户信息到store
          userStore.login(userData, token)

          ElMessage.success(t('login.loginSuccess'))

          // 跳转到目标页面或首页
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          // 登录失败
          const errorMsg = response?.msg || response?.message || t('login.usernameOrPasswordError')
          ElMessage.error(errorMsg)
        }
      } catch (error) {
        console.error('登录失败:', error)
        // 如果是登录相关错误，给出更友好的提示
        if (error.message && error.message.includes('登录')) {
          ElMessage.warning('请检查用户名和密码')
        } else {
          ElMessage.error('登录失败，请重试')
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 视频事件处理
const onVideoLoadStart = () => {
  console.log('视频开始加载...')
}

const onVideoError = () => {
  console.log('视频加载失败，使用背景渐变')
}

const onVideoLoaded = () => {
  console.log('视频加载完成')
}

const onVideoCanPlay = () => {
  console.log('视频可以播放')
}

const onVideoLoadEnd = () => {
  console.log('视频加载结束')
}

const onVideoWaiting = () => {
  console.log('视频缓冲中...')
}

const onVideoStalled = () => {
  console.log('视频加载停滞...')
}

// 粒子动画样式
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const animationDuration = Math.random() * 20 + 10
  const animationDelay = Math.random() * 5
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${animationDelay}s`
  }
}

// 自定义指令：自动聚焦
const vFocus = {
  mounted(el) {
    el.querySelector('input')?.focus()
  }
}

onMounted(() => {
  // 初始化设置
  settingsStore.initSettings()
  
  console.log('登录页面设置:', {
    title: settingsStore.getTitle,
    subtitle: settingsStore.getSubtitle,
    description: settingsStore.getDescription
  })
  
  // 如果已经登录，直接跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style lang="scss" scoped>
/* 确保视频能够正确铺满整个页面 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: visible;
  background: transparent;

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
    border: none;
    outline: none;

    .video-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000000;
      border: none;
      outline: none;

      .background-video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
        z-index: 1;
        opacity: 0.9;
        min-width: 100%;
        min-height: 100%;
        transform: scale(1.01);
        border: none;
        outline: none;
        display: block;
      }

      .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
        animation: overlayPulse 8s ease-in-out infinite;
        z-index: 2;
      }

      .animated-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3;

        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          animation: particleFloat linear infinite;
          pointer-events: none;
        }
      }

      .geometric-shapes {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3;

        .shape {
          position: absolute;
          opacity: 0.1;
          animation: shapeRotate 20s linear infinite;

          &.triangle {
            width: 0;
            height: 0;
            border-left: 50px solid transparent;
            border-right: 50px solid transparent;
            border-bottom: 87px solid #00ffff;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
          }

          &.square {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            top: 60%;
            right: 20%;
            animation-delay: 5s;
          }

          &.circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(45deg, #667eea, #764ba2);
            top: 30%;
            right: 10%;
            animation-delay: 10s;
          }

          &.hexagon {
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #f093fb, #f5576c);
            clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
            top: 70%;
            left: 20%;
            animation-delay: 15s;
          }
        }
      }

      .grid-lines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3;

        .line {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
          animation: lineMove 15s linear infinite;

          &.horizontal {
            width: 100%;
            height: 1px;
            left: 0;
            top: calc(var(--i) * 5%);
            animation-delay: calc(var(--i) * 0.5s);
          }

          &.vertical {
            height: 100%;
            width: 1px;
            top: 0;
            left: calc(var(--i) * 3.33%);
            animation-delay: calc(var(--i) * 0.3s);
          }
        }
      }
    }
  }

  .language-switcher {
    position: absolute;
    top: 2rem;
    right: 2rem;
    z-index: 1000;
  }

  .login-wrapper {
    position: relative;
    z-index: 2;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 2rem;

    .left-content {
      position: absolute;
      top: 2rem;
      left: 2rem;
      z-index: 10;

      .welcome-text {
        text-align: left;
        color: white;

        .main-title {
          font-size: 2.5rem;
          font-weight: 300;
          margin: 0 0 0.5rem 0;
          opacity: 0.9;
        }

        .sub-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .description {
          font-size: 1rem;
          margin: 0;
          opacity: 0.8;
        }
      }
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      padding: 3rem;
      animation: slideInRight 0.8s ease-out;

      .form-header {
        text-align: center;
        margin-bottom: 2rem;

        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

          .logo-icon {
            font-size: 40px;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          }
        }

        .title {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
      }

      .form-body {
        .form-input {
          margin-bottom: 1.5rem;
          width: 100%;

          :deep(.el-input__wrapper) {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;

            &:hover {
              border-color: #00d4ff;
              box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
            }

            &.is-focus {
              border-color: #00d4ff;
              box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
            }
          }

          :deep(.el-input__inner) {
            height: 50px;
            font-size: 16px;
            color: #ffffff;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            padding: 0 50px 0 25px;
            border-radius: 8px;
            font-weight: 400;
            line-height: 1.5;
            width: 100%;
            box-sizing: border-box;

            &::placeholder {
              color: rgba(255, 255, 255, 0.6);
              font-weight: 300;
              font-style: italic;
            }

            &:focus {
              outline: none;
              background: rgba(0, 0, 0, 0.2);
            }
          }

          :deep(.el-input__prefix) {
            color: rgba(255, 255, 255, 0.6);
            left: 8px;
          }

          :deep(.el-input__suffix) {
            right: 8px;
          }

          .password-toggle {
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            transition: color 0.3s ease;

            &:hover {
              color: #00d4ff;
            }
          }
        }

        .login-btn {
          width: 100% !important;
          height: 50px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          border-radius: 12px !important;
          background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
          border: 1px solid rgba(0, 212, 255, 0.5) !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3) !important;
          color: white !important;
          position: relative !important;
          z-index: 1 !important;
          animation: loginButtonSlideIn 0.5s ease-out !important;

          &:hover:not(:disabled) {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.5) !important;
            background: linear-gradient(135deg, #00b8e6, #0088bb) !important;
          }

          &:active:not(:disabled) {
            transform: translateY(0) !important;
          }

          &:disabled {
            background: rgba(0, 212, 255, 0.3) !important;
            border-color: rgba(0, 212, 255, 0.3) !important;
            cursor: not-allowed !important;
            opacity: 0.6 !important;
            transform: none !important;
            box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2) !important;
          }
        }
      }

      .login-footer {
        text-align: center;
        margin-top: 2rem;
        color: rgba(255, 255, 255, 0.8);

        a {
          color: #00d4ff;
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            color: #0099cc;
          }
        }
      }
    }
  }
}

// 动画
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes overlayPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes shapeRotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes lineMove {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes loginButtonSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    .language-switcher {
      top: 1rem;
      right: 1rem;
    }

    .login-wrapper {
      flex-direction: column;
      justify-content: flex-start;
      padding: 1rem;

      .left-content {
        position: absolute;
        top: 1rem;
        left: 1rem;
        right: 1rem;
        text-align: center;

        .welcome-text {
          .main-title {
            font-size: 2rem;
          }

          .sub-title {
            font-size: 1.5rem;
          }

          .description {
            font-size: 0.9rem;
          }
        }
      }

      .login-card {
        max-width: 100%;
        padding: 2rem;
        margin-top: 2rem;
      }
    }
  }
}
</style>