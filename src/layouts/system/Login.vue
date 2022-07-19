<template>
  <div class="login">
    <div class="logo">
      <img src="../../assets/logo.png" alt="patpat" />
      <span>SCM-Component</span>
    </div>
    <Form ref="formRef" :model="form" :rules="rules" class="form" @keypress.enter="handleSubmit">
      <a-form-item name="account">
        <Input v-model:value="form.account" size="large" placeholder="请输入用户名">
          <template #prefix>
            <UserOutlined />
          </template>
        </Input>
      </a-form-item>
      <a-form-item name="password">
        <a-input-password v-model:value="form.password" size="large" visibility-toggle placeholder="请输入密码">
          <template #prefix>
            <LockOutlined />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 24 }">
        <Button type="primary" size="large" block :loading="loading" @click.prevent="handleSubmit">登录</Button>
      </a-form-item>
    </Form>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { Form, Input, Button, notification } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import setting from '@src/config'

export default defineComponent({
  name: 'Login',
  components: {
    Form,
    Input,
    Button,
    UserOutlined,
    LockOutlined
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const formRef = ref()
    const form = reactive({
      account: '',
      password: ''
    })
    const loading = ref(false)

    const rules = {
      account: [{ required: true, message: '请输入用户名！', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码！', trigger: 'blur' }]
    }

    const timeTxt = () => {
      const hour = new Date().getHours()
      let str
      if (hour < 8) {
        str = '早上好'
      } else if (hour <= 11) {
        str = '上午好'
      } else if (hour <= 13) {
        str = '中午好'
      } else if (hour <= 18) {
        str = '下午好'
      } else {
        str = '晚上好'
      }
      return str
    }

    const handleSubmit = async () => {
      try {
        const { account, password } = await formRef.value.validate()
        loading.value = true
        const { token } = await store.dispatch('user/login', {
          account,
          password
        })
        loading.value = false
        if (token) {
          notification.success({ message: timeTxt(), description: `欢迎登录${setting.title}` })
          let redirect = route.query?.redirect
          if (!redirect || redirect.includes('/login')) {
            redirect = '/index'
          }
          await router.push(redirect)
        }
      } catch (err) {
        console.error('login error', err)
      }
    }

    return {
      form,
      loading,
      rules,
      formRef,
      handleSubmit
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .logo {
    margin-bottom: 20px;

    img {
      height: 44px;
      margin-right: 10px;
      vertical-align: top;
    }

    span {
      font-size: 30px;
      font-weight: 500;
      color: $text-color;
    }
  }

  .form {
    width: 360px;

    ::v-deep(.ant-form-item) {
      width: 100%;
      display: block;
    }
  }
}
</style>
