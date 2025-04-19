import {
  Tsi18n,
  lang_key,
  lang_IV,
  lang_apiKey,
  lang_apiIV
} from '@/lang/index';
import { userStore } from '@/store/index';
import CryptoJS from 'crypto-js';
import big from 'big.js';
import momentTimezone from 'moment-timezone';
import { InitData } from '@/server/modules/commonApi';
import { getAuthStatus } from '@/server/modules/memberAuthApi';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { Action } from 'element-plus';
import useComputed from '@/hooks/useComputed';
import { ArgsOfFunction } from '@/types/server';
import { router_key, router_IV, router_apiKey, router_apiIV } from '@/router';
import look from '@/assets/js/look';
import {
  HoldPageDataList,
  OrderEntrustHisType,
  MemberOrderMgHoldType,
  TradingPage
} from '@/server/modules/exchangeCenterApi';
import Router from '@/router';
import { StockCode } from '@/store/storeSocket';
/**
 * 方法说明
 * @method getLangFile
 * @param(url) 要查找的图片名称（必须要带后缀）
 * @return {string} 返回要查找的图片路径
 */
export const getLangFile = (url: string): string => {
  const urlAdr = new URL(
    `../assets/image/${CONFIG.name}/${getLanguage()}/${url}`,
    import.meta.url
  );
  if (urlAdr.pathname === '/undefined') {
    return new URL(
      `../assets/image/${CONFIG.name}/en_US/${url}`,
      import.meta.url
    ).href;
  } else {
    return urlAdr.href;
  }
};

export const getFile = (url: string): string => {
  return new URL(`../assets/image/${url}`, import.meta.url).href;
};

/**
 * 获取当前语言
 */
export const getLanguage = () => {
  const store = userStore();
  return localStorage.getItem('language') || store.config.language;
};

/**
 * 方法说明
 * @method throttle 节流
 * @param {fn} [回调函数]
 * @param {delay} [设置的时长，默认300毫秒]
 * @return {Function}
 */
export const throttle = <T extends Function>(fn: T, delay: number = 300) => {
  let timer: number | NodeJS.Timeout = 0;
  return (...args: ArgsOfFunction<T>) => {
    if (!timer) {
      fn(...args);
      //只有当前定时器执行完后才进行下一次函数执行
      timer = setTimeout(() => {
        timer = 0;
      }, delay);
    }
  };
};
/**
 * 方法说明
 * @method debounce 防抖
 * @param {fn} [回调函数]
 * @param {delay} [设置的时长，默认300毫秒]
 * @return {Function}
 */
export const debounce = function <T extends Function>(
  fn: T,
  delay: number = 300
) {
  //默认300毫秒
  let timer: number | NodeJS.Timeout = 0;
  return (...args: ArgsOfFunction<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args); // this 指向vue
    }, delay);
  };
};

// 日期过滤
export const FileTime = (val: string | Date | number) => {
  const { t } = Tsi18n.global;
  if (!val) return '';
  let date: Date = new Date();
  const newDate = new Date();
  if (typeof val === 'string' && val.indexOf('-') > -1) {
    date = new Date(val.replace(/-/g, '/'));
  } else {
    date = new Date(val);
  }
  const differfrom = newDate.getTime() - date.getTime();
  const h = Math.floor(differfrom / (1000 * 60 * 60));
  const f = Math.floor((differfrom % (1000 * 60 * 60)) / (1000 * 60));
  if (h < 4) {
    if (f <= 2 && h < 1) {
      return t('just');
    } else if (f > 2 && h < 1) {
      return textI18nFilter(t('min_ago'), { f }, 'f');
    } else {
      return textI18nFilter(t('hour_ago'), { h }, 'h');
    }
  } else {
    return timeFormatHandle(val);
  }
};

// 时间转换
export const timeFormatHandle = (
  time: number | string | Date,
  format: string = 'YYYY-MM-DD HH:mm:ss'
) => {
  return momentTimezone(time).format(format);
};

export const textI18nFilter = <T extends Record<string, any>>(
  text: string,
  obj: T,
  key: string
) => {
  const keyList = key.split('|');
  let value = text;
  keyList.forEach((item, index) => {
    const exp = `%${index + 1}$s`;
    if (text.indexOf(`%${index + 1}$s`) > -1 && item in obj) {
      value = value.replace(exp, String(obj[item]) ? String(obj[item]) : '');
    } else {
      value = '';
    }
  });
  return value;
};

export const copy = (textValue: string, isTips: boolean = true): void => {
  const { t } = Tsi18n.global;
  const textarea: HTMLTextAreaElement = document.createElement('textarea');
  // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
  textarea.readOnly = true;
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  // 将要 copy 的值赋给 textarea 标签的 value 属性
  textarea.value = textValue;
  // 将 textarea 插入到 body 中
  document.body.appendChild(textarea);
  // 选中值并复制
  textarea.select();
  const result: boolean = document.execCommand('Copy');
  if (result && isTips) {
    ElMessage({ type: 'success', message: t('copySuccess') });
  }
  document.body.removeChild(textarea);
};

export const getSha256 = (content: string) => {
  return CryptoJS.SHA256(content).toString();
};

// 涨跌额计算
export const getZdePrice = useComputed(
  (item: { price: number; preClose: number }) => {
    big.RM = 0;
    return big(+item.price).minus(+item.preClose).toString();
  }
);
// 涨跌幅计算
export const getZdfPrice = useComputed(
  (item: { price: number; preClose: number }) => {
    // 涨跌幅
    big.RM = 1;
    const zdf =
      +item.preClose === 0
        ? '0.00'
        : big(getZdePrice(item)).div(+item.preClose).times(100).toFixed(2);
    return zdf;
  }
);

/**
 * 获取对应的保留几位小数
 * @param {productType} 不传以默认币种来去保留几位小数 传了就判断是币种还是以当前股票类型来取保留几位小数
 * @return {number} 要保留几位小数
 */
export const getScaleFun = (
  val?: number | string,
  rawFn?: (val: number) => void
) => {
  const store = userStore();
  const { coinScale, productScale } = store?.basicsInfo || {};
  const dataList: Array<
    InitData['coinScale'][0] | InitData['productScale'][0]
  > = [...(coinScale || []), ...(productScale || [])];
  // 参数默认查币种
  let contrast: number | string =
    store.userInfo?.selfConfig?.default_currency ||
    store.basicsInfo?.user_default_currency ||
    'CNY';
  if (val) {
    contrast = val;
  }
  const data = dataList?.find(
    (item) =>
      (item as InitData['coinScale'][0])['coinName'] == contrast ||
      (item as InitData['productScale'][0])['productType'] == contrast
  );
  rawFn && rawFn(data?.scale ?? 2);
  return data?.scale || 2;
};

/**
 * 数字处理函数
 * @param {val} 要处理的数字
 * @param {option} 配置信息
 * @reutrn 返回处理结果
 */
export const setNumScaleFun = useComputed(
  (
    val: number | string | big.Big,
    option: {
      scale?: number | string; // 保留几位小数的标识
      rm?: number; // 取整方式
      isAdd?: boolean; // 是否拼接+
      comma?: boolean; // 是否千分符
      num?: number; // 去0 保留几位
    } = {
      rm: 0,
      num: 2
    }
  ) => {
    if (['null', 'undefined'].includes(val + '') || (!val && val + '' !== '0'))
      return '-';
    big.RM = option.rm || 0;
    let rawScale = 2;
    const scale = getScaleFun(option?.scale ?? '', (num) => {
      rawScale = num;
    });
    val = big(+val).toFixed(scale); // 先保留小数
    const parts = (val + '').split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';
    let zeroLength = 2;
    if ('num' in option) {
      zeroLength = option.num ?? 2;
    } else {
      if (rawScale < 2) {
        zeroLength = rawScale;
      }
    }
    decimalPart = decimalPart.replace(/0+$/, '').padEnd(zeroLength, '0'); // 去0
    if (option.comma) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    if (+val >= 0 && option.isAdd) {
      return `+${integerPart}${decimalPart !== '' ? `.${decimalPart}` : ''}`;
    }
    return `${integerPart}${decimalPart !== '' ? `.${decimalPart}` : ''}`;
  }
);

/**
 * 数字尾数0多余省去
 * @param {value} 要转换的数字
 * @return {string} 转换完的值
 */
export const endNumHandler = (value: number | string, num = 2) => {
  let parts = [];
  if (('' + value).indexOf('.') > -1) {
    parts = ('' + value).split('.');
  } else {
    parts = [`${value}`, '0'];
  }
  const integerPart = parts[0];
  let decimalPart = parts[1] || '';
  decimalPart = decimalPart.replace(/0+$/, '').padEnd(num, '0');
  if (decimalPart !== '') {
    return integerPart + '.' + decimalPart;
  }
  return integerPart;
};

export const getAmount = (val: string | number) => {
  if (val || val == 0) {
    const store = userStore();
    if (store.isAmountShow) {
      return setNumScaleFun(val, {
        comma: true,
        scale: store.userInfo!.selfConfig.default_currency
      });
    } else {
      return '******';
    }
  } else {
    return '-';
  }
};

/**
 * 给相应金额赋予单位
 * @param {value} 要转换的金额
 * @param {productType} 不传以默认币种来去保留几位小数 传了就判断是币种还是以当前股票类型来取保留几位小数
 * @return {string} 赋予完单位的值
 */
export const getLangUnitfun = (value: number | string) => {
  if (isNaN(+value) || !+value) return value || '-';
  const { t } = Tsi18n.global;
  const scale = 2;
  const locale = getLanguage();
  if (['zh_CN', 'zh_HK'].includes(locale)) {
    if (+value >= 1000000000000) {
      return (
        setNumScaleFun(+big(value).div(1000000000000).toFixed(scale), {
          num: 0
        }) + t('wy')
      );
    } else if (+value >= 100000000) {
      return (
        setNumScaleFun(+big(value).div(100000000).toFixed(scale), {
          num: 0
        }) + t('yi')
      );
    } else if (+value >= 10000) {
      return (
        setNumScaleFun(+big(value).div(10000).toFixed(scale), {
          num: 0
        }) + t('wan')
      );
    } else {
      return value.toString();
    }
  } else {
    if (+value >= 1000000000000) {
      return (
        setNumScaleFun(+big(value).div(1000000000000).toFixed(scale), {
          num: 0
        }) + 'T'
      ); // 万亿
    } else if (+value >= 1000000000) {
      return (
        setNumScaleFun(+big(value).div(1000000000).toFixed(scale), {
          num: 0
        }) + 'B'
      ); // 十亿
    } else if (+value >= 1000000) {
      return (
        setNumScaleFun(+big(value).div(1000000).toFixed(scale), {
          num: 0
        }) + 'M'
      ); // 百万
    } else if (+value >= 1000) {
      return (
        setNumScaleFun(+big(value).div(1000).toFixed(scale), {
          num: 0
        }) + 'K'
      ); // 千
    } else {
      return value.toString();
    }
  }
};

/**
 * 输入框限制输入数字函数及保留几位小数
 * @param {val} 要转换的值
 * @param {scale} 保留几位小数
 * @return {string} 转换之后的值
 */
export const inputValNum = (val: string, scale: number = 2) => {
  const value = val.replace(/[^0-9.]/g, '');
  const regex = new RegExp(`^(-)*(\\d+)\\.(\\d{0,${scale}}).*$`);
  return value.replace(regex, `$1$2${scale > 0 ? '.$3' : ''}`);
};

/**
 * 获取随机验证码
 * @param {val} 获取的canvas id
 * @return {string} 生成的验证码值
 */
export const getImageCode = (name = 'imgcanvas') => {
  const rc = (min: number, max: number) => {
    const r = rn(min, max);
    const g = rn(min, max);
    const b = rn(min, max);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  const rn = (max: number, min: number) => {
    return parseInt(Math.random() * (max - min) + '') + min;
  };
  const canvas: HTMLCanvasElement = document.getElementById(
    name
  ) as HTMLCanvasElement;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const context = canvas.getContext('2d')!;
  context.fillStyle = 'white';
  context.lineWidth = 5;
  context.fillRect(0, 0, w, h);
  const pool = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  let str = '';
  for (let i = 0; i < 4; i++) {
    const c = pool[rn(0, pool.length - 1)];
    const deg = rn(-30, 30);
    context.font = `${(h * 3) / 7.5}px Arial`;
    context.textBaseline = 'top';
    context.fillStyle = rc(80, 150);
    context.save();
    context.translate(0.25 * w * i + 0.125 * w, parseInt(h / 1.6 + ''));
    context.rotate((deg * Math.PI) / 180);
    context.fillText(c, -0.125 * w + 5, -0.125 * w);
    context.restore();
    str += c;
  }
  for (let i = 0; i < 40; i++) {
    context.beginPath();
    context.arc(rn(0, w), rn(0, h), 1, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = rc(150, 200);
    context.fill();
  }
  return str;
};

export const getStarsDate = (val: string) => {
  if (val && val.length > 7) {
    return (val + '').replace(/^(.{3})(.*)(.{4})$/, '$1****$3');
  }
  return val;
};

/**
 * 获取红涨绿跌还是绿涨红跌
 * @return {string} 1:红涨绿跌 2:绿涨红跌
 */
export const getUpDownColor = () => {
  const store = userStore();
  let up_down_color = '1'; // 1:红涨绿跌 2:绿涨红跌
  if (store.userInfo) {
    up_down_color = store.userInfo.selfConfig.up_down_color;
  } else {
    up_down_color = store.basicsInfo?.user_up_down_color ?? '1';
  }
  return up_down_color;
};

/**
 * 计算盈亏
 * @param {val} 计算盈亏需要的一些参数
 * @return {string} 计算完成的值 未保留小数
 */
type YkParams = Pick<
  HoldPageDataList,
  'orderType' | 'price' | 'buyPrice' | 'leverageNum' | 'totalVolume'
>;
export const ykCountFn = useComputed((val: YkParams) => {
  if (val.orderType == 1) {
    // 买入做多 （现价*持仓数量）-（开仓价*持仓数量）
    return big(+val.price)
      .times(+val.totalVolume || 0)
      .minus(big(+val.buyPrice).times(+val.totalVolume || 0))
      .toString();
  } else {
    // 卖出做空 (现价*持仓数量）-（开仓价*持仓数量)
    return big(+val.buyPrice)
      .times(val.totalVolume ?? 0)
      .minus(big(+val.price).times(val.totalVolume ?? 0))
      .toString();
  }
});
/**
 * 盈亏%
 * @param {val} 计算盈亏需要的一些参数
 * @return {string} 计算完成的值
 */
export const ykRatioCountFn = useComputed(
  (val: YkParams & { totalAmount: number | string }) => {
    big.RM = 1;
    if (val.orderType == 1) {
      // 买入做多 （现价*持仓数量）-（开仓价*持仓数量）
      return big(
        big(+val.price)
          .times(+val.totalVolume || 0)
          .minus(big(+val.buyPrice).times(+val.totalVolume || 0))
      )
        .div(val.totalAmount)
        .times(100)
        .toFixed(2);
    } else {
      // 卖出做空 (现价*持仓数量）-（开仓价*持仓数量)
      return big(
        big(+val.buyPrice)
          .times(val.totalVolume ?? 0)
          .minus(big(+val.price).times(val.totalVolume ?? 0))
      )
        .div(val.totalAmount)
        .times(100)
        .toFixed(2);
    }
  }
);
/**
 * 计算今日盈亏
 * @param {val} 计算盈亏需要的一些参数
 * @return {string} 计算完成的值 未保留小数
 */
type JRYkParams = Pick<
  HoldPageDataList,
  'orderType' | 'price' | 'totalVolume' | 'leverageNum'
> &
  MemberOrderMgHoldType;
export const jrykCountFn = useComputed((val: JRYkParams) => {
  big.RM = 1;
  if (val.orderType == 1) {
    // 买入做多 :(现价*持仓数量）-（昨收*持仓数量)
    return big(+val.price)
      .times(+val.totalVolume || 0)
      .minus(big(+val.preClose || 0).times(val.totalVolume ?? 0));
  } else {
    // 卖出做空  （昨收*持仓数量）-（现价*持仓数量）
    return big(+val.preClose || 0)
      .times(+val.totalVolume || 0)
      .minus(big(+val.price).times(+val.totalVolume || 0));
  }
});
// * @method ykZsRatioCountFn 指数盈亏计算
// * @param {val} [所需数值]
// * @param {type} [为true则返回百分比，为false则返回普通]
// * @return {数值}
// */
export const ykZsRatioCountFn = useComputed(
  (val: OrderEntrustHisType | MemberOrderMgHoldType, type?: boolean) => {
    let scale: big.Big | string | number = 0;
    let scale100: big.Big | string | number = 0;
    if (val.orderType == 1) {
      // 做多盈亏金额，计算公式为：（现价-开仓价）*数量*点数面值*汇率
      scale = big(+val.price).minus(+val.buyPrice);
      // scale100 = big(big(+val.price).minus(+val.buyPrice)).div(+val.buyPrice).times(100)
    } else {
      // 做空盈亏金额，计算公式为：（开仓价-现价)*数量*点数面值*汇率
      scale = big(+val.buyPrice).minus(+val.price);
      // scale100 = big(big(+val.buyPrice).minus(+val.price)).div(+val.buyPrice).times(100)
    }
    if (val.parValue && val.positionMargin) {
      big.RM = 1;
      scale = scale
        .times(val.totalVolume)
        .times(+val.parValue || 0)
        .times(+val.exchangeRate || 0);
      scale100 = +val.positionMargin
        ? scale.div(+val.positionMargin).times(100).toFixed(2)
        : 0;
    }
    if (type) return scale100;
    return scale;
  }
);

// * @method jrykZsRatioCountFn 指数今日盈亏计算
// * @param {val} [所需数值]
// * @param {type} [为true则返回百分比，为false贼返回普通]
// * @return {数值}
// */
export const jrykZsRatioCountFn = useComputed((val: MemberOrderMgHoldType) => {
  big.RM = 1;
  if (val.orderType == 1) {
    // 做多盈亏金额，计算公式为：（现价-昨收）*数量*点数面值*汇率
    return big(+val.price)
      .minus(+val.preClose)
      .times(+val.totalVolume)
      .times(val.parValue ?? 0)
      .times(val.exchangeRate ?? 0);
    // scale100 = big(big(+val.price).minus(+val.preClose)).div(+val.preClose).times(100)
  } else {
    // 做空盈亏金额，计算公式为：（昨收-现价）*数量*点数面值*汇率
    return big(+val.preClose)
      .minus(+val.price)
      .times(+val.totalVolume)
      .times(val.parValue ?? 0)
      .times(val.exchangeRate ?? 0);
    // scale100 = big(big(+val.preClose).minus(+val.price)).div(+val.preClose).times(100)
  }
});

// * @method ykZsRatioCountFn 指数今日盈亏百分比计算
// * @param {val} [所需数值]
// * @param {type} [为true则返回百分比，为false贼返回普通]
// * @return {数值}
// */
export const jrykZsRatioCountFn100 = useComputed(
  (val: MemberOrderMgHoldType | OrderEntrustHisType) => {
    big.RM = 1;
    if (val.positionMargin) {
      if (val.orderType == 1) {
        // 做多盈亏金额，计算公式为：（现价-昨收）*数量*点数面值*汇率
        return big(+val.price)
          .minus(+val.preClose)
          .times(+val.totalVolume)
          .times(val.parValue ?? 0)
          .times(val.exchangeRate ?? 0)
          .div(+val!.positionMargin)
          .times(100)
          .toFixed(2);
        // scale100 = big(big(+val.price).minus(+val.preClose)).div(+val.preClose).times(100)
      } else {
        // 做空盈亏金额，计算公式为：（昨收-现价）*数量*点数面值*汇率
        if (+val.positionMargin) {
          return big(+val.preClose)
            .minus(+val.price)
            .times(+val.totalVolume)
            .times(val.parValue ?? 0)
            .times(val.exchangeRate ?? 0)
            .div(+val!.positionMargin)
            .times(100)
            .toFixed(2);
        }
      }
      return 0;
      // scale100 = big(big(+val.preClose).minus(+val.price)).div(+val.preClose).times(100)
    }
  }
);

// * @method ykZsRatioCountFn 指数可用保证金
// * @param {val} [所需数值]
// * @param {type} [为true则返回百分比，为false贼返回普通]
// * @return {数值}
// */
export const zsBzjRatioCount = useComputed(
  (val: OrderEntrustHisType | MemberOrderMgHoldType) => {
    const scale: string = ykZsRatioCountFn(val);
    const stockScale: string = ykCountFn(val as MemberOrderMgHoldType);
    if (!getZsSpecialType().includes(`${val.productType}`))
      return big(val.totalAmount ?? 0).plus(stockScale);
    return big(val.positionMargin ?? 0).plus(scale);
  }
);
export const isNumber = (number: number & string): boolean => {
  if (!isNaN(parseFloat(number)) && isFinite(number)) return true;
  return false;
};

export const DetailOrderType = (type: number) => {
  const { t } = Tsi18n.global;
  const DetailOrderTypeObj = {
    1: t('Trade'),
    2: t('maichu'),
    3: t('pc'),
    4: t('pc')
  };
  if (['zh_CN', 'zh_HK'].includes(getLanguage())) {
    DetailOrderTypeObj[1] = t('Buy/Long');
    DetailOrderTypeObj[2] = t('Sell/Short');
  }
  return DetailOrderTypeObj[type as keyof typeof DetailOrderTypeObj];
};

export const orderType = (orderType: number) => {
  const { t } = Tsi18n.global;
  const orderTypeObj = {
    1: t('Buy/Long'),
    2: t('Sell/Short'),
    3: t('Buy/Long'),
    4: t('Sell/Short')
  };
  return orderTypeObj[orderType as keyof typeof orderTypeObj];
};
export const eventType = (eventType: number) => {
  const { t } = Tsi18n.global;
  const eventTypeObj = {
    1: t('Order_Placed'),
    2: t('Order_Placed'),
    3: t('kccg'),
    4: t('Position_is_closed'),
    5: t('Position_is_closed'),
    6: t('jccg'),
    8: t('Cancel_Success'),
    10: t('Finish_Adding')
  };
  return eventTypeObj[eventType as keyof typeof eventTypeObj];
};
export const closePositionType = (closePositionType: number) => {
  const { t } = Tsi18n.global;
  const closePositionTypeObj = {
    1: t('User_Close'),
    2: t('System_Close'),
    3: t('System_Take_Profit'),
    4: t('System_Stop_Loss'),
    5: t('User_Take_Profit'),
    6: t('User_Stop_Loss')
  };
  return closePositionTypeObj[
    closePositionType as keyof typeof closePositionTypeObj
  ];
};

/**
 * 获取配置信息 如果传入key就返回对应的key值 反之就返回整个对象
 * @param {string} key 取值的key
 * @return {string | object} 对应的key值 或者整个对象
 */
export const getBasics = (key: string) => {
  const store = userStore();
  const propxerty = store.basicsInfo || '';
  return key ? propxerty[key as keyof typeof store.basicsInfo] : propxerty;
};

export const Ahref = (url: string) => {
  const store = userStore();
  const { t } = Tsi18n.global;
  if (!url || (url.indexOf('http') == -1 && url.indexOf('https') == -1))
    return ElMessage.error(t('Wrong_Address'));
  try {
    if (url.indexOf('.pdf') > -1) {
      let pcUrl = '';
      if (import.meta.env.MODE == 'development') {
        pcUrl = location.origin;
      } else {
        pcUrl = store.basicsInfo?.pc_url as string;
      }
      if (!pcUrl) return;
      url = `${pcUrl}/pdf.html?url=${encodeURIComponent(url)}`;
    }
    if (window.isInElectron) {
      const { shell } = require('electron');
      shell.openExternal(url);
      return;
    }
    const winRef = window.open('', '_blank') as Window;
    winRef.location = url;
  } catch (error) {
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    document.body.appendChild(linkElement);
    linkElement.click();
    setTimeout(() => {
      document.body.removeChild(linkElement);
    }, 1000);
  }
};
const encryptKey = 'AsNlC5cQWm2Hg=';
/**
 * 方法说明
 * @method content 处理表情
 * @for common
 * @param {text} [要处理的内容]
 * @param {obj} [源数据]
 * @return {Boolean} 处理完成的数据
 */
export const emjoContent = (text: string) => {
  //默认300毫秒
  if (text) {
    const reg = /\[(.+?)\]/g; // 匹配所有用[]包裹的数据
    const options = text.match(reg);
    if (options && options.length) {
      options.forEach((item: string) => {
        if (look[item as keyof typeof look]) {
          // 排除没有的表情
          text = text.replace(
            item,
            '<img class="imgContain" style="vertical-align:middle;margin:0 2px;width: 24rem;height: 24rem;" src=' +
              look[item as keyof typeof look] +
              ' />'
          );
        }
      });
    }
    return text;
  } else {
    return '';
  }
};

export const decryptedHandle = (val: string) => {
  return CryptoJS.AES.decrypt(
    val,
    CryptoJS.enc.Utf8.parse('d#5M2B6ehn&zdVnWc5TCCWLn'),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString(CryptoJS.enc.Utf8);
};

export const parseQueryString = (url: string) => {
  const queryString = url.split('?')[1] || '';
  const params = new URLSearchParams(queryString);
  const obj: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
};

export const utils_Key = `${router_key}${lang_key}${encryptKey}`;
export const IV = `${router_IV}${lang_IV}`;
export const urlSafeBase64Encode = (base64Str: string | null) => {
  if (!base64Str) return '';
  return base64Str.replace(/\+/g, '-').replace(/\//g, '_');
};
export const urlSafeBase64Decode = (base64Str: string) => {
  if (!base64Str) return '';
  const safeStr = base64Str.replace(/-/g, '+').replace(/_/g, '/');
  const num = safeStr.length % 4;
  return safeStr + '===='.substring(0, num);
};
export const encrypt = (data: string, AES_KEY: string, IV: string | null) => {
  let encrypted;
  const key = CryptoJS.enc.Base64.parse(AES_KEY);
  if (IV) {
    const iv = CryptoJS.enc.Base64.parse(IV);
    encrypted = CryptoJS.AES.encrypt(data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  } else {
    encrypted = CryptoJS.AES.encrypt(data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
  }
  return encrypted.toString();
};
export const decrypt = (data: string, AES_KEY: string, IV: string | null) => {
  let decrypt;
  const key = CryptoJS.enc.Base64.parse(AES_KEY);
  if (IV) {
    const iv = CryptoJS.enc.Base64.parse(IV);
    decrypt = CryptoJS.AES.decrypt(data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  } else {
    decrypt = CryptoJS.AES.decrypt(data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
  }
  return decrypt.toString(CryptoJS.enc.Utf8);
};
export const fileToBase64 = (file: File, callback: Function) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e: ProgressEvent<FileReader>) {
      resolve(callback(e.target!.result));
    };
  });
};
// 加密url
export const encryptUrl: string[] = [
  '/memberStock/common',
  '/memberStock/announcement',
  '/memberStock/checkCode',
  '/memberStock/member-auth',
  '/memberStock/member',
  '/memberStock/flash/exchange',
  '/memberStock/member-follow',
  '/memberStock/member-property',
  '/memberStock/recharge',
  '/memberStock/member/self-set',
  '/memberStock/withdraw/collection',
  '/memberStock/news',
  '/memberStock/tip',
  '/memberStock/login',
  '/memberStock/register',
  '/memberStock/getLoginInfo',
  '/memberStock/mockAccountSwitching',
  '/memberStock/getCountryNum',
  '/memberStock/loginout',
  '/memberStock/check/login',
  '/memberStock/change/password',
  '/memberStock/content/activityCenter',
  '/memberStock/content/adPopup',
  '/memberStock/content/articleClassify',
  '/memberStock/content/article',
  '/payMember/payment',
  '/payMember/recharge',
  '/payMember/stock/order',
  '/payMember/withdraw/collection',
  '/payMember/withdraw',
  '/newStockSubscribe/dark/disk',
  '/newStockSubscribe/fund/carousel',
  '/newStockSubscribe/fund/config',
  '/newStockSubscribe/fund/hold',
  '/newStockSubscribe/fund/subOrder',
  '/newStockSubscribe/message/notify',
  '/newStockSubscribe/new/stock/subscribe',
  '/newStockSubscribe/release/calendar',
  '/newStockSubscribe/subscribe/order',
  '/exchangeCenter/member-order-mg',
  '/exchangeCenter/trade',
  '/exchangeCenter/index-trade',
  '/dataCenter/data',
  '/dataCenter/home',
  '/dataCenter/market',
  '/proxyMember/commission'
];
// 特殊加密url
const specialNncryptioArray = new Map();
export const specialNncryptioFunction = () => {
  if (specialNncryptioArray.size != 0) return specialNncryptioArray;
  specialNncryptioArray.set(
    '/proxyMember/flowRecord/listRecords',
    '/proxyMember/flowRecord/encypt/listRecords'
  );
  specialNncryptioArray.set(
    `/proxyMember/flowRecord/listCommissionBackTypesForKey/${getLanguage()}`,
    `/proxyMember/flowRecord/encypt/listCommissionBackTypesForKey/${getLanguage()}`
  );
  specialNncryptioArray.set(
    `/proxyMember/flowRecord/listFlowTypesAndBusinessTypes/${getLanguage()}`,
    `/proxyMember/flowRecord/encypt/listFlowTypesAndBusinessTypes/${getLanguage()}`
  );
  return specialNncryptioArray;
};

// 认证提示统一封装
export const getAuth = async (val = 'transaction') => {
  const { t } = Tsi18n.global;
  const store = userStore();
  try {
    if (store.basicsInfo?.transaction_auth) {
      const { data } = await getAuthStatus(val);
      if (data.authStatus == 1) {
        return true;
      } else {
        const title: Map<string, string> = new Map();
        title.set('mobile', t('Bind_Phone_Number'));
        title.set('email', t('Bind_Email'));
        title.set('cert', t('Upload_ID'));
        title.set('face', t('Face'));
        title.set('bank', t('Bind_Bank_Card'));
        title.set('cardThreeAuth', t('KYC_Verify'));
        const arr = data.authFlowVOList.filter((item) => item.status != 2);
        const authName = arr.map((item) => title.get(item.authName) ?? '');
        const content = `${textI18nFilter(
          t('wjxrz'),
          { arr: authName.join('、') },
          'arr'
        )}`;
        ElMessageBox.confirm(content, t('Unauthenticated_user'), {
          cancelButtonText: t('cancel'),
          confirmButtonText: t('Go_Verify'),
          center: true,
          callback: (action: Action) => {
            if (action == 'confirm') {
              Router.push(`/my/idVerification?type=${val}`);
            }
          }
        });
        return false;
      }
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

// 获取股票条数
export const getMaxCont = (val: StockCode | null) => {
  if (!val) return 240;
  let maxCont = 0;
  if (val.productType + '' === '2') {
    const sotckListNumbs = {
      TWII: 270,
      HKHSI: 330,
      HKHSCEI: 330,
      HKHSCCI: 330,
      N225: 300,
      KS11: 390,
      BSESN: 375,
      MXX: 390,
      DJI: 390,
      NSEI: 390,
      IXIC: 390,
      SPX: 390,
      BFX: 510,
      DXY: 1440,
      GDAXI: 450,
      FCHI: 420,
      FTMIB: 420,
      IRTS: 400,
      QGG01P: 390,
      X3G01P: 390,
      VNINDEX: 270,
      VN30: 270,
      HNXINDEX: 270
    };
    maxCont = sotckListNumbs[val.code as keyof typeof sotckListNumbs] || 240;
  } else if (val.productType + '' == '1') {
    // a股
    maxCont = 240;
  } else if (['4', '5'].includes(`${val.productType}`)) {
    // 数字货币、期货
    maxCont = 60;
  } else if (val.productType + '' == '12') {
    // 港股
    maxCont = 330;
  } else if (val.productType + '' == '14') {
    // 印股
    maxCont = 375;
  } else if (val.productType + '' == '100') {
    // 日股
    maxCont = 300;
  } else if (val.productType + '' == '110') {
    // 越南股
    maxCont = 270;
  } else {
    // 美股
    maxCont = 390;
  }
  return maxCont;
};

/**
 * 方法说明
 * @method content 获取指数玩法的type
 * @return {Array} 获取到哪些type需要指数玩法的算法
 */
export const getZsSpecialType = () => {
  // 2、指数 4、期货 5、数字货币
  return ['2', '4', '5'];
};

// 加密函数，使用AES算法对输入的十六进制字符串进行加密
export const encryptHex = (hexString: string) => {
  const keyHex = CryptoJS.enc.Utf8.parse(`${router_apiKey}${lang_apiKey}`);
  const ivHex = CryptoJS.enc.Utf8.parse(`${router_apiIV}${lang_apiIV}`);
  const encrypted = CryptoJS.AES.encrypt(hexString, keyHex, {
    iv: ivHex,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  return encryptedHex;
};

// 解密
export const decryptHex = (hexString: string) => {
  try {
    const keyHex = CryptoJS.enc.Utf8.parse(`${router_apiKey}${lang_apiKey}`);
    const ivHex = CryptoJS.enc.Utf8.parse(`${router_apiIV}${lang_apiIV}`);
    const decrypt = CryptoJS.AES.decrypt(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        ciphertext: CryptoJS.enc.Hex.parse(hexString)
      },
      keyHex,
      {
        iv: ivHex,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return decrypt.toString(CryptoJS.enc.Utf8) || hexString;
  } catch (error) {
    return hexString;
  }
};

// 股票代码与名称对调
export const isTransCoding = (): boolean => {
  const arr = ['vi_VI'];
  return arr.includes(getLanguage());
};

export const isRouterNext = (val: string) => {
  const str = decrypt(urlSafeBase64Decode(val), utils_Key, IV);
  let pathStr = '';
  try {
    pathStr = JSON.parse(str);
  } catch (error) {
    pathStr = str;
  }
  if (pathStr) {
    if (pathStr.includes('/home/login/index/m/')) {
      return true;
    } else if (pathStr.includes('/home/login/index/f/')) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
export const getPathName = () => {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('m') || searchParams.get('f')) {
    const str = searchParams.get('m') || searchParams.get('f') || '';
    if (str.startsWith('/')) {
      return str.slice(1);
    }
    return str;
  } else {
    return '';
  }
};
export const setPathname = (val: 'p' | 'm' | 'f' = 'p', isRun = false) => {
  // const store = userStore();
  // if (!store.config.isEncrypt) return;
  const data = `/home/login/index/${val}/${new Date().getTime()}`;
  const str = urlSafeBase64Encode(encrypt(data, utils_Key, IV));
  if (isRun) return str;
  sessionStorage.setItem('jysPC-pathName', str);
};

export const filterDropNum = (num: string | number, isPermil = true) => {
  const store = userStore();
  num = isPermil ? Permil(num) : num;
  if (store.isDrop || ['null', 'undefined'].includes(`${num}`)) return num;
  return num
    .toString()
    .replace(/,/g, '|')
    .replace(/\./g, ',')
    .replace(/\|/g, '.');
};

const Permil = (value: string | number) => {
  if (isNaN(parseFloat(`${value}`)) && !Number.isFinite(value)) return value;
  const parts = value.toString().split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1] || '';
  return `${integerPart}${decimalPart ? `.${decimalPart}` : ''}`;
};

export const getBuySeller = (val: 'Buy' | 'Sell') => {
  const { t } = Tsi18n.global;
  if (['zh_CN', 'zh_HK'].includes(getLanguage())) {
    return val == 'Buy' ? '多' : '空';
  } else {
    return val == 'Buy' ? t('Buy') : t('Sell');
  }
};

export const getOssUrlHandle = (key: 'OSSURL' | 'lineOSS') => {
  const OSSActives = +(localStorage.getItem('jysPC-OSSActives') ?? 0);
  const lineItem = CONFIG['lineList'][OSSActives] || CONFIG['lineList'][0];
  return lineItem[key];
};

export const otherFeesHandle = (
  val: TradingPage['otherFees'][0] & {
    num: number | string;
    feeReduction: TradingPage['feeReduction'];
    price: number | string;
    rate?: number | string;
    parValue?: number | string;
  }
) => {
  let value = big(+val.num)
    .times(+val.chargeNum)
    .times(big(1).minus(+val.feeReduction));

  if ('rate' in val && val.rate) {
    value = value.times(+val.rate);
  }
  if (val.chargeMethod + '' === '1') {
    value = value.times(+val.price);
    if ('parValue' in val && val.parValue) {
      // 指数和期货费用计算
      value = value.times(+val.parValue);
    }
  }
  return value.toString();
};

// 是否强更
export const isForceUpdate = (newVer: string, curVer: string): boolean => {
  if (!newVer || !curVer) {
    return false;
  }
  const newVerSplit = newVer.split('.');
  const curVerSplit = curVer.split('.');
  const maxLen = Math.max(newVerSplit.length, curVerSplit.length);
  for (let i = 0; i < maxLen; i++) {
    const newVerNum = strToInt(i < newVerSplit.length ? newVerSplit[i] : '0');
    const curVerNum = strToInt(i < curVerSplit.length ? curVerSplit[i] : '0');

    if (newVerNum > curVerNum) {
      return true;
    } else if (newVerNum < curVerNum) {
      return false;
    }
  }
  return false;
};

function strToInt(str: string): number {
  return parseInt(str, 10) || 0;
}

// 获取版本号
export const getVersion = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (import.meta.env.MODE == 'development') {
      const fs = require('fs');
      const json = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      resolve(json.version);
    } else {
      const { ipcRenderer } = require('electron');
      ipcRenderer.invoke('get-app-version').then((res) => {
        resolve(res);
      });
    }
  });
};

// 获取处理之后的100整数
export const getInteger = (
  num: string | number,
  type?: string | number,
  rm = 0
) => {
  if (!['1', '12'].includes(`${type}`)) return +num;
  big.RM = rm;
  return +big(big(+num).div(100).toFixed(0)).times(100).toString();
};

export const verifyInteger = (num: string | number, type?: string | number) => {
  if (!['1', '12'].includes(`${type}`)) return true;
  return big(+num).mod(100).eq(0);
};

/**
 * AYJcjqbGekWuZaQKEM 加上最新时间戳打乱
 * @returns 返回打乱后的字符串
 */
export const insertTimestampRandomPositions = (timestamp: string) => {
  const str = 'AYJcjqbGekWuZaQKEM';
  const chars = str.split(''); // 拆分原始字符串
  const positions = [...Array(chars.length + timestamp.length).keys()]; // 生成所有可能的位置
  positions.sort(() => Math.random() - 0.5); // 打乱位置
  // 插入时间戳的每个字符
  timestamp.split('').forEach((char, i) => {
    chars.splice(positions[i], 0, char);
  });
  return btoa(chars.join('')).replaceAll('/', '666');
};
