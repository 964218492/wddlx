<script setup>
import HelloWorld from './components/HelloWorld.vue'
const tg = window.Telegram.WebApp;

tg.ready(); // 告诉 Telegram 小程序已准备就绪

// 设置 UI 外观
tg.expand(); // 展开为全屏
tg.MainButton.setText("提交").show().onClick(() => {
  // 点击按钮时的处理逻辑
  tg.sendData("some_payload"); // 向 bot 发送数据
});
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
