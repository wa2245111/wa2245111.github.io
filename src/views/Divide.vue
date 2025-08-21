<template>
  <div >
    <van-nav-bar
        :title="'Tisch:'+tdNumber"
        left-text="Back"
        left-arrow
        @click-left="onClickLeft"
    />

    <div style="overflow: auto;margin-bottom: 5rem">
        <!-- 标题 -->
      <van-row style="display: flex;justify-content: right">
        <van-button @click="addDivide">Account Splitting</van-button>
      </van-row>
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
<!--              <van-col span="3" >{{allocatedCntMap[goods.code]||0}}</van-col>-->
              <van-col span="3" >{{goods.cnt}}</van-col>
              <van-col span="6" >{{format.formatGermanyMoney(goods.price)}}</van-col>
              <van-col span="6" >{{format.formatGermanyMoney(goods.cnt*goods.price)}}</van-col>
            </van-row>
          </div>
        </div>
        <div style="display: flex;justify-content: right;">
          <van-row style="font-weight: bold;font-size: 20px">
            Total:<span >{{total}}</span>
          </van-row>
        </div>

      <!-- 添加空对象默认值，防止报错 -->
      <div v-for="([name, cntMap], index) in Object.entries(settledData || {})" :key="name">
        <van-divider
            :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
        >
        </van-divider>
          <div style="display: flex;justify-content: space-around;align-items: center">
            <div ><span style="font-weight: bold">{{name}}</span></div>
            <div ><van-button @click="modifyDivide(name)">Modify</van-button>
              <van-button style="margin-left: 1rem" @click="deleteDivide(name)">Delete</van-button></div>
          </div>
          <div v-for="order in sortedOrders" :key="order.key">
            <div v-if="showCategory(order,cntMap)">
              <div >
                <span>{{order.data.categoryName}}</span>
              </div>
              <!-- 商品列表 -->
              <div v-for="(goods, index) in order.data.goodsList" :key="goods.code" >
                <van-row v-if="goods.code in cntMap">
                  <van-col span="9" >{{goods.code}}</van-col>
                  <van-col span="3" >{{cntMap[goods.code]||0}}</van-col>
                  <van-col span="6" >{{format.formatGermanyMoney(goods.price)}}</van-col>
                  <van-col span="6" >{{format.formatGermanyMoney((cntMap[goods.code]||0)*goods.price)}}</van-col>
                </van-row>
              </div>
            </div>
          </div>
          <div style="display: flex;justify-content: right;">
            <van-row style="font-weight: bold;font-size: 20px">
              Total:<span >{{sumGoods(cntMap)}}</span>
            </van-row>
          </div>
      </div>



    </div>
    <van-popup
        v-model:show="showAddDividePop"
        position="bottom"
        :style="{ height: '100%' }"
        z-index="1000"
        :closeable="!disableName"
        @close="clearDivide"
    >
      <div style="margin-top:2rem;padding-left: 1rem">
        <!-- 标题 -->
        <van-field  required :disabled="disableName" v-model="divideName" placeholder="Please Input Name" input-align="center"/>
        <div v-for="order in sortedOrders" :key="order.key">
          <!-- 分类标题 -->
          <div style="margin-top:0.1rem">
            <span>{{order.data.categoryName}}</span>
          </div>
          <div v-for="(goods, index) in order.data.goodsList" :key="goods.code" >
            <van-row >
              <van-col span="9" >{{goods.code}}</van-col>
              <van-col span="4" >{{allocatedCntMap[goods.code]||0}}</van-col>
              <van-col span="4" >{{goods.cnt}}</van-col>
              <van-col span="7"><van-stepper :long-press="false" min="0" :max="Number(goods.cnt) - Number(allocatedCntMap[goods.code]||0)" v-model.number="divideGoodsCntMap[goods.code]"/></van-col>
            </van-row>
          </div>
        </div>
        <van-row style="display: flex;justify-content: center">
          <van-button type="primary"  plain style="width: 50%" @click="doDivide" >Confirm</van-button>
        </van-row>
      </div>
    </van-popup>
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
const sortedOrders = ref({})
// 已经分账菜单数据
const settledData = ref({});

// 已经分账code-cnt
const allocatedCntMap = ref({})

const total = ref(undefined)

const showAddDividePop = ref(false);

const divideName = ref(undefined)
const divideGoodsCntMap = ref({})

const codeGoodsMap = ref({})

const disableName = ref(false)

const onClickLeft = () => {
  router.push({
    name: 'History',
  })

}

onMounted(() => {
  orderedData.value = storage.get("table_" + tdNumber)
  if (orderedData.value === null || orderedData.value === undefined) {
    orderedData.value = {}
  }
  for (const categoryId in orderedData.value) {
    const category = orderedData.value[categoryId];
    for (const goods of category.goodsList) {
      codeGoodsMap.value[goods.code] = goods
    }
  }
  sortedOrders.value =  Object.keys(orderedData.value)
      .sort((a, b) => a - b) // 数字排序
      .map(key => ({
        key: Number(key),
        data: orderedData.value[key]
      }));
  settledData.value = storage.get("divide_table_" + tdNumber)
  if (settledData.value === null || settledData.value === undefined) {
    settledData.value = {}
  }



  updateAllocatedCntMap()

  updateTotal()
})

// 更新已分配code->cnt映射
const updateAllocatedCntMap = () => {
  // 初始化分配数量映射对象（mp）
  const mp = {};
  // 计算每个商品的已分配数量
  if (settledData.value !== undefined && settledData.value !== null) {
    for (const [person, goodsCodeCntMap] of Object.entries(settledData.value)) {
      for (const [goodsCode, goodsCnt] of Object.entries(goodsCodeCntMap)) {
          // 初始化并累加数量
          if (mp[goodsCode] === undefined) {
            mp[goodsCode] = 0;
          }
          mp[goodsCode] += goodsCnt;
      }
    }
  }
  allocatedCntMap.value = mp
}


// 更新显示总价
const updateTotal = () => {
  // 计算总价
  let sum = 0;
  for (const categoryId in orderedData.value) {
    const category = orderedData.value[categoryId];

    // 第二层循环：遍历分类下的商品列表
    for (const goods of category.goodsList) {
      sum += goods.cnt * goods.price; // 直接累加分单位的总值
    }
  }
  total.value = format.formatGermanyMoney(sum)
}

// 新增分账
const addDivide = () => {
  disableName.value = false;
  const cntMap = {}
  for (const categoryId in orderedData.value) {
    const category = orderedData.value[categoryId];

    // 第二层循环：遍历分类下的商品列表
    for (const goods of category.goodsList) {
      cntMap[goods.code] = 0
    }
  }
  divideGoodsCntMap.value = cntMap
  showAddDividePop.value = true;
}

const modifyDivide = (name) => {
  disableName.value = true;
  const cntMap =  settledData.value[name] || {}
  for (const categoryId in orderedData.value) {
    const category = orderedData.value[categoryId];

    // 第二层循环：遍历分类下的商品列表
    for (const goods of category.goodsList) {
      if (!goods.code in cntMap) {
        cntMap[goods.code] = 0
      }
    }
  }
  divideGoodsCntMap.value = cntMap
  divideName.value = name;
  delete settledData.value[name];
  storage.set("divide_table_" + tdNumber, settledData.value)
  updateAllocatedCntMap()
  showAddDividePop.value = true;
}

const deleteDivide = (name) => {
  showConfirmDialog({
    title: 'Delete',
    message: `Are you sure to delete ${name}?`,
  })
      .then(() => {
        delete settledData.value[name];
        storage.set("divide_table_" + tdNumber, settledData.value)
        updateAllocatedCntMap()
      })
      .catch(() => {});
}

const clearDivide = () => {
  showAddDividePop.value = false;
  divideName.value = undefined;
  divideGoodsCntMap.value = {};
}

// 分账
const doDivide = () => {
  // 校验参数
  if (divideName.value === undefined || divideGoodsCntMap.value === null) {
    showSuccessToast("Please Input Name");
    return;
  }
  const realDivideMap = {}
  for (const [goodsCode, goodsCnt] of Object.entries(divideGoodsCntMap.value||{})) {
    if (goodsCnt > 0) {
      realDivideMap[goodsCode] = goodsCnt;
    }
  }
  settledData.value[divideName.value] = realDivideMap
  // 计算总价

  storage.set("divide_table_" + tdNumber, settledData.value)
  updateAllocatedCntMap()
  clearDivide()
}


const showCategory = (order,v) => {
  // 基础校验
  if (!order?.data?.goodsList || !Array.isArray(order.data.goodsList)) {
    return false;
  }

  // 检查是否有符合条件的商品
  return order.data.goodsList.some(item => {
    return item?.code != null
        && item.code in v;
  });
}

const sumGoods = (v) => {
  let sum = 0;
  for (const order of sortedOrders.value) {
    for (const goods of order.data.goodsList) {
      if (goods.code in v) {
        sum += (v[goods.code]||0) * goods.price
      }
    }
  }
  return format.formatGermanyMoney(sum);
}

</script>

<style scoped>


</style>
