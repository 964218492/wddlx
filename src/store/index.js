import { defineStore } from 'pinia';
export const useStore = defineStore('wddlx', {
  state: () => {
    return {
      userInfo: null,
      apiUrl: 'http://zzzu.site:9999'
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
