import axios from 'axios';
import { useStore } from '@/store';
import { AxiosCanceler } from './helper/axiosCancel';
import { checkStatus } from './helper/checkStatus';
import { showToast } from 'vant';
import 'vant/es/toast/style';
import router from '@/router';
const config = {
  timeout: 50000
  // url:import.meta.env.MODE == 'development'?'':`http://video.xmgdzx.com/api`
};

const server = axios.create(config);

const axiosCanceler = new AxiosCanceler();
// 请求拦截器
server.interceptors.request.use(
  (config) => {
    axiosCanceler.addPending(config);
    // console.log('请求拦截',config);
    return config;
  },
  (error) => {
    console.log('请求拦截', error);
  }
);

// 响应拦截器
server.interceptors.response.use(
  (response) => {
    const { config } = response;
    axiosCanceler.removePending(config);
    // console.log('响应拦截',config);
    return response;
  },
  (error) => {
    const { response } = error;
    console.log(error);
    
    // 根据响应的错误状态码，做不同的处理
    if (response) return checkStatus(response.status);
    return Promise.reject(error);
  }
);
const httpServer = (
  opts,
  data
) => {
  const store = useStore();
  const headerTypeObj = {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  };
  const httpDefaultOpts = {
    method: opts.method,
    // url: `/api${opts.url}`,
    url: `${store.apiUrl}${opts.url}`,
    data: data,
    params: data,
    headers: headerTypeObj
  };
  if (httpDefaultOpts.method === 'get') {
    delete httpDefaultOpts.data;
  } else {
    delete httpDefaultOpts.params;
  }
  return new Promise((resolve, reject) => {
    server(httpDefaultOpts)
      .then((res) => {
        console.log(res);
        if (res && res.status == 200 && 'data' in res) {
          const data = res.data
          if (data.code === 0) {
            resolve(data);
          } else{
            showToast(data.message)
            reject(data);
          }
        } else {
          // 请求失败操作的判断
          showToast(data.message)
          reject(res);
        }
      })
      .catch((error) => {
        showToast('小黑子')
        reject(error);
      });
  });
};

export default httpServer;
