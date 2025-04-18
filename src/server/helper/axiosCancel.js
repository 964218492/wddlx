import axios from 'axios';
import qs from 'qs';

// * 声明一个 Map 用于存储每个请求的标识 和 取消函数
const pendingMap = new Map();

// * 序列化参数
export const getPendingUrl = (config) =>
  [
    config.method,
    config.url,
    qs.stringify(config.data),
    qs.stringify(config.params)
  ].join('&');

export function is(val, type) {
  return toString.call(val) === `[object ${type}]`;
}

export class AxiosCanceler {
  /**
   * @description: 添加请求
   * @param {Object} config
   */
  addPending(config) {
    // * 在请求开始前，对之前的请求做检查取消操作
    this.removePending(config);
    const url = getPendingUrl(config);
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!pendingMap.has(url)) {
          // 如果 pending 中不存在当前请求，则添加进去
          pendingMap.set(url, cancel);
        }
      });
  }

  /**
   * @description: 移除请求
   * @param {Object} config
   */
  removePending(config) {
    const url = getPendingUrl(config);
    if (pendingMap.has(url)) {
      // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
      const cancel = pendingMap.get(url);
      cancel && cancel();
      pendingMap.delete(url);
    }
  }

  /**
   * @description: 清空所有pending
   */
  removeAllPending() {
    // 循环所有未请求完成的请求进行移除
    pendingMap.forEach((cancel) => {
      cancel && is(cancel, 'Function') && cancel();
    });
    // 清空map
    pendingMap.clear();
  }
}
