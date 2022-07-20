import { defineComponent, computed, createVNode } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Menu, Dropdown, Avatar, Modal, notification, Button, Space } from 'ant-design-vue'
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import XDownloads from '@components/Downloads'
import setting from '@src/config'
import styles from './index.module.scss'

const MyAvatar = defineComponent({
  name: 'MyAvatar',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const userInfo = computed(() => store.state.user.userInfo)

    const handleClick = e => {
      if (e.key === 'logout') {
        Modal.confirm({
          title: '提示',
          icon: createVNode(ExclamationCircleOutlined),
          content: `您确定要退出【${setting.title}】吗？`,
          onOk: handleLogout
        })
      }
    }

    const handleLogout = async () => {
      notification.success({
        message: '提示',
        description: `已成功退出【${setting.title}】！`
      })
      await handleLogin()
    }

    const handleLogin = async () => {
      await store.dispatch('user/logout')
      await router.push(`/login?redirect=${route.path}`)
    }

    const MenuOverlay = (
      <Menu onClick={handleClick}>
        <Menu.Item key='logout'>退出登录</Menu.Item>
      </Menu>
    )

    const visible = computed({
      get: () => store.getters['user/visible'],
      set: visible => store.commit('user/setVisible', visible)
    })

    return () => (
      <>
        {userInfo.value?.name ? (
          <Space>
            <XDownloads v-model:visible={visible.value} />
            <Dropdown overlay={MenuOverlay} class={styles.userDropdown}>
              <div>
                <Avatar size={28} src={`https://api.multiavatar.com/${userInfo.value.name}.png`} />
                <span className={styles.name}>{userInfo.value.name}</span>
                <DownOutlined class={styles.icon} />
              </div>
            </Dropdown>
          </Space>
        ) : (
          <Button type='link' size='small' onClick={handleLogin}>
            去登录
          </Button>
        )}
      </>
    )
  }
})

export default MyAvatar
