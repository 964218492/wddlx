<script setup>
import HelloWorld from './components/HelloWorld.vue'
if(window.Telegram){
  const tg = window.Telegram.WebApp;

  tg.ready(); // 告诉 Telegram 小程序已准备就绪
  const user = tg.initDataUnsafe.user;
  console.log(user);
  
  console.log("用户ID:", user.id);
  console.log("名字:", user.first_name);
  console.log("用户名:", user.username);
  // 设置 UI 外观
  tg.expand(); // 展开为全屏
  tg.MainButton.setText("提交").show().onClick(() => {
    // 点击按钮时的处理逻辑
    tg.sendData("some_payload"); // 向 bot 发送数据
  });
  const phoneBtn = ()=>{
    tg.requestContact((contact) => {
        console.log("用户手机号:", contact.phone_number);
    });
  }
}
</script>

<template>
  <button @click="phoneBtn">拿取手机号</button>
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
