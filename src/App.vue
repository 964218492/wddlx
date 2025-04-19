<script setup>
import { onMounted, ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/store';
import { login } from '@/server/modules/loginApi'
const store = useStore()
const route = useRoute();
const router = useRouter();
let load = ref(false);
if(window.Telegram && window.Telegram.WebApp){
  onMounted(async ()=>{
    try{
      const tg = window.Telegram.WebApp
      tg.ready();
      const { hash, auth_date, user } = tg.initDataUnsafe
      console.log(tg)
      console.log(tg.initDataUnsafe)
      const { data } = await login({
        ...user,
        hash,
        auth_date,
        nickname: user.first_name,
        // auth_date: "1745068793",
        // hash: "40ece322c2a0c5f87d85b679527ed22d5e4610a98cf6693741fcb5c9573e0165",
        // allows_write_to_pm: true,
        // first_name: "超",
        // id: 7127007092,
        // language_code: "zh-hans",
        // last_name: "",
        // photo_url: "https://t.me/i/userpic/320/MkGUMLc3GmGIZLhviw_z2WBp8eio6EEyqeN-Q0dsuxw_HOiPEFtrYni3mMJgvdf8.svg"
      })
      
      store.userInfo = data
      load.value = true
    }catch(error){
      load.value = true
      router.replace('/')
      console.log(error)
    }
  })
}
// let tg
// if(window.Telegram && window.Telegram.WebApp){
//   tg = window.Telegram.WebApp;
//   console.log(tg);
  
//   tg.ready(); // 告诉 Telegram 小程序已准备就绪
//   const user = tg.initDataUnsafe.user;
//   console.log(user);
  
//   console.log("用户ID:", user.id);
//   console.log("名字:", user.first_name);
//   console.log("用户名:", user.username);
//   // 设置 UI 外观
//   tg.expand(); // 展开为全屏
//   tg.MainButton.setText("提交").show().onClick(() => {
//     // 点击按钮时的处理逻辑
//     tg.sendData("some_payload"); // 向 bot 发送数据
//   });
  
// }
// const phoneBtn = ()=>{
//   if(tg){
//     tg.requestContact((contact) => {
//       console.log("用户手机号:", contact.phone_number);
//     });
//   }
// }
// 要缓存的页面
let include = ref([]);
router.beforeEach((to, from, next) => {
  // 路由进入之前判断是否是要缓存的页面
  if (to.meta.KeepAlive) {
    includeAdd(to.name);
  }
  next();
});
// 添加缓存页面
const includeAdd = (name) => {
  if (!include.value.includes(name)) {
    include.value.push(name);
  }
};
// 移除缓存
const includeDel = (name) => {
  include.value = include.value.filter((item) => item !== name);
};
provide('includeDel', includeDel);

</script>

<template>
  <!-- <button @click="phoneBtn">拿取手机号</button> -->
  <router-view v-slot="{ route, Component }">
    <keep-alive :include="include">
      <component
        :is="Component"
        v-if="route.meta.KeepAlive && load"
        :key="route.name"
      />
    </keep-alive>
    <component
      :is="Component"
      v-if="!route.meta.KeepAlive && load"
      :key="route.name"
    />
  </router-view>
</template>

<style scoped>
</style>
