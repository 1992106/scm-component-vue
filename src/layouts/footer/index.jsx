import { defineComponent } from 'vue'
import { CopyrightOutlined } from '@ant-design/icons-vue'
import setting from '@src/config'
import styles from './index.module.scss'

const { title } = setting

const MyFooter = defineComponent({
  name: 'AppFooter',
  setup() {
    return () => (
      <footer className={styles.appFooter}>
        <div className={styles.copyright}>
          Copyright <CopyrightOutlined style={{ margin: '0 6px' }} />
          <span style={{ marginRight: '6px' }}>
            {title} - {new Date().getFullYear()}
          </span>
          Interfocus Inc. All rights reserved.
        </div>
      </footer>
    )
  }
})

export default MyFooter
