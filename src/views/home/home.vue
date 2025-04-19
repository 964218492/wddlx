<template>
    <div>
      <van-nav-bar title="牛币量化" left-arrow>
        <template #left>
          <van-icon @click="userHandle" name="user-o" size="18" color="var(--nb-color)" />
        </template>
        <template #right>
          <van-icon name="exchange" size="18" color="var(--nb-black)" />
        </template>
      </van-nav-bar>
      <div>12312</div>
      <!-- 左侧弹出 -->
      <van-popup v-model:show="userShow"
        position="left" closeable
        :style="{ width: '75%', height: '100%' }">
        <div class="nb-user flex">
          <img class="imgCover nb-user__avatar" :src="store.userInfo.photo_url" alt="">
          <div>
            <p class="nb-user__nickname">{{ store.userInfo.nickname }}caho</p>
            <span>ID:{{ store.userInfo.app_id }}</span>
          </div>
        </div>
        <div class="nb-fun">
          <h3 class="fs16">常用功能</h3>
          <ul class="flex wraps">
            <li class="nb-fun__list flex direction center">
              <van-icon name="setting-o" class="nb-fun--icon" />
              <p>设置</p>
            </li>
            <li class="nb-fun__list flex direction center">
              <van-icon name="cluster-o" class="nb-fun--icon" />
              <p>我的配置</p>
            </li>
            <li class="nb-fun__list flex direction center">
              <van-icon name="gold-coin-o" class="nb-fun--icon" />
              <p>我的欧易</p>
            </li>
          </ul>
        </div>
      </van-popup>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from '@/store';
const store = useStore()

const userShow = ref(false)
const userHandle= ()=>{
  userShow.value = true
}

</script>
<style lang='scss' scoped>
@include b('user'){
  padding: 20px 14px;
  font-size: 12px;
  color: var(--nb-gray);
  border-bottom: 1px solid #ebedf0;
  @include e('avatar'){
    width: 54px;
    min-width: 54px;
    height: 54px;
    border-radius: 50%;
    margin-right: 12px;
  }
  @include e('nickname'){
    color: var(--nb-black);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
  }
}
@include b('fun'){
  font-size: 12px;
  color: var(--nb-black);
  padding: 20px 14px 0;
  @include e('list'){
    width: 25%;
    padding: 14px 0;
  }
  @include m('icon'){
    font-size: 22px;
    margin-bottom: 4px;
    color: var(--nb-black);
  }
}
</style>