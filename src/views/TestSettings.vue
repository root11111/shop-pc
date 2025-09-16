<template>
  <div class="test-settings">
    <h1>设置测试页面</h1>
    
    <div class="settings-display">
      <h2>当前设置</h2>
      <p><strong>标题:</strong> {{ settingsStore.getTitle }}</p>
      <p><strong>副标题:</strong> {{ settingsStore.getSubtitle }}</p>
      <p><strong>描述:</strong> {{ settingsStore.getDescription }}</p>
      <p><strong>Logo:</strong> {{ settingsStore.getLogo }}</p>
      <p><strong>语言:</strong> {{ settingsStore.getLanguage }}</p>
      <p><strong>版权:</strong> {{ settingsStore.getCopyright }}</p>
    </div>

    <div class="settings-control">
      <h2>修改设置</h2>
      <div class="form-group">
        <label>标题:</label>
        <input v-model="newTitle" type="text" />
        <button @click="updateTitle">更新标题</button>
      </div>
      
      <div class="form-group">
        <label>副标题:</label>
        <input v-model="newSubtitle" type="text" />
        <button @click="updateSubtitle">更新副标题</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const newTitle = ref('')
const newSubtitle = ref('')

const updateTitle = () => {
  settingsStore.setTitle(newTitle.value)
  newTitle.value = ''
}

const updateSubtitle = () => {
  settingsStore.setSubtitle(newSubtitle.value)
  newSubtitle.value = ''
}

onMounted(() => {
  console.log('测试页面加载，当前设置:', {
    title: settingsStore.getTitle,
    subtitle: settingsStore.getSubtitle,
    description: settingsStore.getDescription
  })
})
</script>

<style scoped>
.test-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-display {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.settings-control {
  background: #e8f4f8;
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 300px;
  padding: 8px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group button {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-group button:hover {
  background: #66b1ff;
}
</style>
