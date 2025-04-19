import { defineStore } from 'pinia';
export const useStore = defineStore('wddlx', {
  state: () => {
    return {
      userInfo: null,
      apiUrl: 'https://wccx.site:18000'
    };
  },
  persist: [
    {
      paths: ['userInfo'],
      key: 'nb',
      storage: localStorage
    }
  ]
});
