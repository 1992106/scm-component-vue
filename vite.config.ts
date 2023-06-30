import { UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
// import Components from 'unplugin-vue-components/vite'
// import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import viteHtml from 'vite-plugin-html'
import { resolve } from 'path'
import setting from './src/config'

const pathResolve = (dir: string) => resolve(__dirname, dir)

const config: UserConfigExport = {
  plugins: [
    vue(),
    vueJsx({}),
    // Components({
    //   resolvers: [
    //     AntDesignVueResolver(),
    //   ],
    //   dts: true,
    //   include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    // }),
    viteHtml({
      minify: true,
      inject: {
        injectData: {
          title: setting.title
        }
      }
    })
  ],
  base: './',
  resolve: {
    alias: [
      { find: /^@src/, replacement: pathResolve('src') },
      { find: /^@components/, replacement: pathResolve('src/components') },
      { find: /^@views/, replacement: pathResolve('src/views') },
      { find: /^@hooks/, replacement: pathResolve('src/hooks') },
      { find: /^@utils/, replacement: pathResolve('src/utils') }
    ]
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {},
        javascriptEnabled: true
      },
      scss: {
        additionalData: '@import "./src/styles/global.scss";'
      }
    }
  },
  optimizeDeps: {
    include: [
      'ant-design-vue/es/locale/zh_CN',
      'ant-design-vue/es/locale/en_US',
      'dayjs/locale/zh-cn',
      'dayjs/locale/en'
    ],
    exclude: []
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        keep_infinity: true, // 防止 Infinity 被压缩成 1/0
        drop_console: true, // 生产环境去除 console
        drop_debugger: true // 生产环境去除 debugger
      }
    }
  }
}

// https://vitejs.dev/config/
export default ({ mode }) => {
  const { plugins = [], build = {} } = config

  if (mode === 'lib') {
    build.lib = {
      entry: pathResolve('src/entry.js'),
      name: 'ScmComponent',
      formats: ['es', 'cjs', 'umd']
    }
    build.rollupOptions = {
      output: {
        inlineDynamicImports: true,
        exports: 'named',
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'vue',
          vuex: 'vuex',
          'vue-router': 'vue-router',
          'ant-design-vue': 'ant-design-vue',
          '@ant-design/icons-vue': '@ant-design/icons-vue',
          'vxe-table': 'vxe-table',
          dayjs: 'dayjs',
          'lodash-es': 'lodash-es',
          'scm-ui-vue': 'scm-ui-vue',
          'echarts/core': 'echarts/core',
          'echarts/charts': 'echarts/charts',
          'echarts/renderers': 'echarts/renderers',
          'echarts/components': 'echarts/components',
          'echarts/features': 'echarts/features',
          '@vueup/vue-quill': '@vueup/vue-quill',
          jspdf: 'jspdf',
          html2canvas: 'html2canvas',
          jsbarcode: 'jsbarcode',
          'qrcodejs2-fix': 'qrcodejs2-fix'
        }
      },
      // 确保外部化处理那些你不想打包进库的依赖
      external: [
        'vue',
        'vuex',
        'vue-router',
        'ant-design-vue',
        '@ant-design/icons-vue',
        'vxe-table',
        'dayjs',
        'lodash-es',
        'scm-ui-vue',
        'echarts/core',
        'echarts/charts',
        'echarts/renderers',
        'echarts/components',
        'echarts/features',
        '@vueup/vue-quill',
        'jspdf',
        'html2canvas'
      ]
    }
  }

  if (mode === 'development') {
    config.server = {
      port: 9999,
      force: true
    }
    config.plugins = [...plugins]
  }

  if (mode === 'production') {
    config.plugins = [
      ...plugins,
      legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      })
    ]
  }

  return config
}
