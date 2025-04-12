import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 默认为localhost
    port: 8080, // 端口号
    open: false, // 是否自动打开浏览器
    strictPort: false
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import "@/assets/css/bem.scss";
        @import "@/assets/css/index.scss";
        ` // 定义全局css
      }
    }
  }
})
