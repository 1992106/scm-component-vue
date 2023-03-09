import { defineComponent } from 'vue'
import { Layout } from 'ant-design-vue'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import Breadcrumb from '../breadcrumb/index.vue'
import Avatar from '../avatar/index.jsx'
import styles from './index.module.scss'

const MyHeader = defineComponent({
  name: 'AppHeader',
  props: {
    collapsed: {
      type: Boolean
    }
  },
  emits: ['update:collapsed'],
  setup(props, { emit }) {
    return () => (
      <Layout.Header class={styles.appHeader}>
        <div className={styles.leftOptions}>
          <span onClick={() => emit('update:collapsed', !props.collapsed)} className={styles.menuFold}>
            {props.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Breadcrumb />
        </div>
        <div className={styles.rightOptions}>
          <Avatar />
        </div>
      </Layout.Header>
    )
  }
})

export default MyHeader
