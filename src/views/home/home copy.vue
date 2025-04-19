<template>
    <div>
        <div id="k-line-chart" style="height:350px"/>
        <div id="k-line-chart2" style="height:350px;margin-top: 50px;"/>
    </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { init } from '@/assets/js/klinecharts';
function genData (timestamp = new Date().getTime(), length = 800) {
  let basePrice = 5000
  timestamp = Math.floor(timestamp / 1000 / 60) * 60 * 1000 - length * 60 * 1000
  const dataList = []
  for (let i = 0; i < length; i++) {
    const prices = []
    for (let j = 0; j < 4; j++) {
      prices.push(basePrice + Math.random() * 60 - 30)
    }
    prices.sort()
    const open = +(prices[Math.round(Math.random() * 3)].toFixed(2))
    const high = +(prices[3].toFixed(2))
    const low = +(prices[0].toFixed(2))
    const close = +(prices[Math.round(Math.random() * 3)].toFixed(2))
    const volume = Math.round(Math.random() * 100) + 10
    const turnover = (open + high + low + close) / 4 * volume
    dataList.push({ timestamp, open, high,low, close, volume, turnover })

    basePrice = close
    timestamp += 60 * 1000
  }
  return dataList
}

onMounted(()=>{
    const chart = init('k-line-chart')
    const chart2 = init('k-line-chart2')
    const dataList = genData()
    chart.applyNewData(dataList)
    chart2.applyNewData(dataList)
    const dataList2 = genData()
    chart.applyNewData(dataList2, true)
    chart2.applyNewData(dataList2, true)

    // 绑定上面图表的鼠标移动事件
    console.dir(chart);
    // 同步滚动
    chart.subscribeAction('onScroll', (range) => {
        chart2.executeAction('onScroll', range)
    });
    
    // // 同步缩放
    chart.subscribeAction('onZoom', (range) => {
        chart2.executeAction('onZoom', range)
    });
    chart.subscribeAction('onCrosshairChange', (param) => {
        const value = chart.convertFromPixel({x:param.x, y:param.y})
        console.log(value);
        
        
        // console.log(param);
        console.log(chart2.convertToPixel(value));
        
        chart2.executeAction('onCrosshairChange', chart2.convertToPixel(value))
        // if (param.visible) {
        //     // 当十字光标可见时，同步下面图表的位置
        //     const kLineData = chart.getDataList();
        //     const index = param.dataIndex;
            
        //     if (index >= 0 && index < kLineData.length) {
        //     // 获取上面图表当前显示的范围
        //     const range = chart.getVisibleRange();
            
        //     // 设置下面图表显示相同的范围
        //     chart2.setVisibleRange(range);
            
        //     // 同步十字光标位置
        //     chart2.setCrosshair(param.kLineData?.timestamp || 0, {
        //         ...param,
        //         // 可能需要调整y轴位置
        //         yAxis: {
        //         ...param.yAxis,
        //         // 调整y轴位置到下面图表对应的位置
        //         }
        //     });
        //     }
        // } else {
        //     // 隐藏下面图表的十字光标
        //     chart2.setCrosshair(0, { visible: false });
        // }
    });
})


</script>
<style lang='scss' scoped>

</style>