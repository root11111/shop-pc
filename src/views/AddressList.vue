<template>
  <div class="address-list">
    <div class="header">
      <el-button @click="goBack" :icon="ArrowLeft" text>返回</el-button>
      <h2>地址管理</h2>
      <el-button @click="addAddress" type="primary" :icon="Plus">添加地址</el-button>
    </div>

    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="addressList.length === 0" class="empty">
      <el-icon size="60"><Location /></el-icon>
      <p>还没有收货地址</p>
      <p class="empty-tip">马上去添加地址</p>
      <el-button @click="addAddress" type="primary">添加地址</el-button>
    </div>

    <div v-else class="address-container">
      <div 
        v-for="address in addressList" 
        :key="address.ud_id"
        class="address-item"
        :class="{ 'default': address.ud_is_default }"
      >
        <div class="address-content" @click="selectAddress(address)">
          <div class="address-header">
            <span class="name">{{ address.ud_name }}</span>
            <span class="phone">{{ address.ud_mobile }}</span>
            <el-tag v-if="address.ud_is_default" type="primary" size="small">默认</el-tag>
          </div>
          <div class="address-detail">
            <span>{{ address.ud_address }}</span>
          </div>
        </div>
        <div class="address-actions">
          <el-button 
            @click="editAddress(address)" 
            :icon="Edit" 
            text
            size="small"
          >
            编辑
          </el-button>
          <el-button 
            @click="deleteAddress(address)" 
            :icon="Delete" 
            text
            size="small"
            type="danger"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 地址编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地址' : '添加地址'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="ud_name">
          <el-input v-model="form.ud_name" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="ud_mobile">
          <el-input v-model="form.ud_mobile" placeholder="请输入手机号" />
        </el-form-item>
        
        
        <el-form-item label="详细地址" prop="ud_address">
          <el-input 
            v-model="form.ud_address" 
            type="textarea" 
            placeholder="请输入详细地址"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.ud_is_default">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="submitForm" type="primary" :loading="submitting">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Delete, 
  Location, 
  Loading 
} from '@element-plus/icons-vue'
import { 
  getAddressList, 
  addAddress as addAddressApi, 
  editAddress as editAddressApi, 
  removeAddress 
} from '@/api/address'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const addressList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  ud_id: null,
  ud_name: '',
  ud_mobile: '',
  ud_address: '',
  ud_is_default: false,
  ud_intl: '+86'
})


// 表单验证规则
const rules = {
  ud_name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  ud_mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' }
  ],
  ud_address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

// 获取地址列表
const loadAddressList = async () => {
  loading.value = true
  try {
    const response = await getAddressList()
    console.log('地址列表响应:', response)
    
    if (response && response.code === 0) {
      console.log('地址列表数据结构:', response)
      console.log('response.data:', response.data)
      console.log('response.data.records:', response.data?.records)
      console.log('response.data.items:', response.data?.items)
      
      // 根据后端返回的数据结构，地址列表在data.items中
      addressList.value = response.data?.items || response.data?.records || response.items || response.data || []
      console.log('解析后的地址列表:', addressList.value)
      if (addressList.value.length > 0) {
        console.log('第一个地址对象:', addressList.value[0])
        console.log('第一个地址的ud_id:', addressList.value[0].ud_id)
        console.log('第一个地址的所有字段:', Object.keys(addressList.value[0]))
      }
    } else {
      // 如果是登录相关错误，不显示错误提示，直接显示空状态
      if (response && response.msg && response.msg.includes('登录')) {
        console.log('用户未登录，显示空地址列表')
        addressList.value = []
      } else {
        ElMessage.error(response && response.msg ? response.msg : '获取地址列表失败')
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    // 如果是登录相关错误，不显示错误提示
    if (error.message && error.message.includes('登录')) {
      console.log('用户未登录，显示空地址列表')
      addressList.value = []
    } else {
      ElMessage.error('获取地址列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 添加地址
const addAddress = () => {
  // 检查是否已登录（这里可以添加登录状态检查）
  // 如果未登录，可以引导用户去登录页面
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑地址
const editAddress = (address) => {
  isEdit.value = true
  form.ud_id = address.ud_id
  form.ud_name = address.ud_name
  form.ud_mobile = address.ud_mobile
  form.ud_address = address.ud_address
  form.ud_is_default = address.ud_is_default
  form.ud_intl = address.ud_intl || '+86'
  
  dialogVisible.value = true
}

// 删除地址
const deleteAddress = async (address) => {
  try {
    await ElMessageBox.confirm(
      '确认删除这个地址吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    console.log('删除地址参数:', { ud_id: address.ud_id })
    const response = await removeAddress({ ud_id: address.ud_id })
    console.log('删除地址响应:', response)
    
    if (response && response.code === 0) {
      ElMessage.success('删除成功')
      loadAddressList()
    } else {
      ElMessage.error(response?.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地址失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 选择地址（用于订单页面）
const selectAddress = (address) => {
  if (route.query.from === 'checkout') {
    // 从结算页面来的，选择地址后返回
    router.back()
    // 这里可以通过事件总线或其他方式通知父页面
  }
}


// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const response = isEdit.value 
          ? await editAddressApi(form)
          : await addAddressApi(form)
        
        if (response && response.code === 0) {
          ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
          dialogVisible.value = false
          loadAddressList()
        } else {
          // 如果是登录相关错误，给出更友好的提示
          if (response && response.msg && response.msg.includes('登录')) {
            ElMessage.warning('请先登录后再添加地址')
            // 可以在这里引导用户去登录页面
            // router.push('/login')
          } else {
            ElMessage.error(response && response.msg ? response.msg : '操作失败')
          }
        }
      } catch (error) {
        console.error('提交地址失败:', error)
        // 如果是登录相关错误，给出更友好的提示
        if (error.message && error.message.includes('登录')) {
          ElMessage.warning('请先登录后再添加地址')
          // 可以在这里引导用户去登录页面
          // router.push('/login')
        } else {
          ElMessage.error('操作失败')
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    ud_id: null,
    ud_name: '',
    ud_mobile: '',
    ud_address: '',
    ud_is_default: false,
    ud_intl: '+86'
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadAddressList()
})
</script>

<style scoped>
.address-list {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #eee;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty p {
  margin: 10px 0;
  font-size: 16px;
}

.empty-tip {
  color: #666;
  font-size: 14px;
}

.address-container {
  padding: 16px;
}

.address-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.address-item.default {
  border: 2px solid #409eff;
}

.address-content {
  flex: 1;
  cursor: pointer;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.address-header .name {
  font-size: 16px;
  font-weight: 600;
  margin-right: 12px;
}

.address-header .phone {
  color: #666;
  margin-right: 12px;
}

.address-detail {
  color: #666;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .header {
    padding: 12px;
  }
  
  .header h2 {
    font-size: 16px;
  }
  
  .address-container {
    padding: 12px;
  }
  
  .address-item {
    padding: 12px;
  }
  
  .address-actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
