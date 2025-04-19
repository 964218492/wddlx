import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import legacy from '@vitejs/plugin-legacy';
// px转vw、vh
import pxtoViewPort from 'postcss-px-to-viewport-8-plugin';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(), 
    Components({
      resolvers: [VantResolver()], // 自动解析 Vant 组件
    }),
    legacy({
      targets: ['Chrome 52']
    })
  ],
  server: {
    host: '0.0.0.0', // 默认为localhost
    port: 8080, // 端口号
    open: false, // 是否自动打开浏览器
    strictPort: false
  },
  resolve: {
    // 配置路径别名
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import "@/assets/css/bem.scss";
        ` // 定义全局css
      }
    },
    postcss: {
      plugins: [
        pxtoViewPort({
          unitToConvert: 'px', // 要转换的单位
          viewportWidth: 375 // 宽度
        })
      ]
    }
  }
})
