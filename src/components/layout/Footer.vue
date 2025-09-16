<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- 公司信息 -->
        <div class="footer-section">
          <h3>关于我们</h3>
          <ul>
            <li><a href="#">公司简介</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">招聘信息</a></li>
            <li><a href="#">合作伙伴</a></li>
          </ul>
        </div>

        <!-- 购物指南 -->
        <div class="footer-section">
          <h3>购物指南</h3>
          <ul>
            <li><a href="#">购物流程</a></li>
            <li><a href="#">支付方式</a></li>
            <li><a href="#">配送说明</a></li>
            <li><a href="#">售后服务</a></li>
          </ul>
        </div>

        <!-- 客户服务 -->
        <div class="footer-section">
          <h3>客户服务</h3>
          <ul>
            <li><a href="#">帮助中心</a></li>
            <li><a href="#">意见反馈</a></li>
            <li><a href="#">在线客服</a></li>
            <li><a href="#">退换货政策</a></li>
          </ul>
        </div>

        <!-- 关注我们 -->
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-links">
            <a href="#" class="social-link">
              <el-icon size="24"><Message /></el-icon>
              <span>微信</span>
            </a>
            <a href="#" class="social-link">
              <el-icon size="24"><ChatDotRound /></el-icon>
              <span>微博</span>
            </a>
            <a href="#" class="social-link">
              <el-icon size="24"><VideoPlay /></el-icon>
              <span>抖音</span>
            </a>
          </div>
          <div class="contact-info">
            <p>客服热线：400-123-4567</p>
            <p>工作时间：9:00-18:00</p>
          </div>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; 2024 {{ settingsStore.getTitle }}. All rights reserved.</p>
          <p>京ICP备12345678号 | 京公网安备11010802012345号</p>
        </div>
        <div class="footer-links">
          <a href="#">隐私政策</a>
          <a href="#">服务条款</a>
          <a href="#">法律声明</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Message, ChatDotRound, VideoPlay } from '@element-plus/icons-vue'
import { useSettingsStore } from '../../stores/settings'

const settingsStore = useSettingsStore()
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: white;
  margin-top: 60px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  padding: 40px 0;
}

.footer-section h3 {
  color: #ecf0f1;
  margin-bottom: 20px;
  font-size: 18px;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #3498db;
}

.social-links {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.social-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.social-link:hover {
  color: #3498db;
}

.social-link span {
  font-size: 12px;
  margin-top: 5px;
}

.contact-info p {
  color: #bdc3c7;
  margin-bottom: 5px;
  font-size: 14px;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.copyright p {
  color: #bdc3c7;
  font-size: 14px;
  margin-bottom: 5px;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #3498db;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px 0;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
  
  .social-links {
    justify-content: center;
  }
}
</style>
