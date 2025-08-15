<template>
  <div >
    <van-nav-bar
        :title="'Tisch:'+tdNumber"
        left-text="Back"
        left-arrow
        @click-left="onClickLeft"
    />

    <div >
        <!-- 标题 -->

        <!-- 分类列表 -->
        <div v-for="order in sortedOrders" :key="order.key">
          <!-- 分类标题 -->
          <div >
            <span>{{order.data.categoryName}}</span>
          </div>
          <!-- 商品列表 -->
          <div v-for="(goods, index) in order.data.goodsList" :key="goods.code" >
            <van-row>
              <van-col span="9" >{{goods.code}}</van-col>
              <van-col span="6" >{{format.formatGermanyMoney(goods.price)}}</van-col>
              <van-col span="3" >{{goods.cnt}}</van-col>
              <van-col span="6" >{{format.formatGermanyMoney(goods.cnt*goods.price)}}</van-col>
            </van-row>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {showConfirmDialog, showSuccessToast} from "vant";
import storage from "../utils/storage";
import format from "../utils/format";
import router from "../router";
import menuJson from "../assets/menu.json";
import {useRoute} from "vue-router";
const route = useRoute()
// 正确获取查询参数
const tdNumber = route.query.tdNumber
// 已点菜单数据
const orderedData = ref({});


const onClickLeft = () => {
  router.push({
    name: 'History',
  })

}

onMounted(() => {
  orderedData.value = storage.get("table_" + tdNumber)
})

// 按订单key排序的订单数组
const sortedOrders = computed(() => {
  return Object.keys(orderedData.value)
      .sort((a, b) => a - b) // 数字排序
      .map(key => ({
        key: Number(key),
        data: orderedData.value[key]
      }));
});
console.info(sortedOrders)


</script>

<style scoped>


</style>
