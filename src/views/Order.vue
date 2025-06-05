<template>
  <div class="container">
    <div class="sticky-container">
      <div class="sticky-header">
        <!-- 这里放置你的 sticky 内容 -->
        <van-row v-for="order in sortedOrders" :key="order.key" style="margin-bottom: 10px">
          <van-row>
            <span style="font-weight: bold;color:#f89705;word-break: break-word;" >{{order.data.categoryName}}</span>
          </van-row>
          <van-row v-for="(goods, index) in order.data.goodsList" :key="goods.code" class="goods-row">
            <van-col span="4">{{goods.code}}</van-col>
            <van-col span="5"><span class="price">{{format.formatGermanyMoney(goods.price)}}</span></van-col>
            <van-col span="8">
              <van-stepper :long-press="false" min="1" v-model="goods.cnt"/>
            </van-col>
            <van-col span="6"><span class="price">{{format.formatGermanyMoney(goods.cnt*goods.price)}}</span></van-col>
            <van-col span="1">
              <van-button size="mini" icon="delete" color="red" @click="deleteGood(order.key, goods.code)"></van-button>
            </van-col>
          </van-row>
        </van-row>
        <van-row class="goods-row">
          <van-col span="8" style="text-align: center">总计:<span class="price">{{total}}</span></van-col>
          <van-col span="8" style="text-align: center">桌号:<span style="color: #ed6a0c;font-weight: bold;">{{tableNumber}}</span></van-col>
          <van-col span="8" style="text-align: center"><van-button @click="onSubmit">提交</van-button></van-col>
        </van-row>
      </div>
    </div>

    <van-row>
      <van-col span="5" style="display: flex;align-items: center">
        <van-button icon="plus" type="primary" size="mini"  plain @click="handleAddCustomerGoodsClick">添加菜品</van-button>
      </van-col>
      <van-col span="19" style="text-align: center">
            <van-search
                v-model="searchTxt"
                show-action
                label=""
                placeholder="请输入搜索关键词"
            >
              <template #action>
                <div @click="onSearch">搜索</div>
              </template>
            </van-search>
      </van-col>
    </van-row>


    <van-grid :column-num="3" :gutter="2">
        <van-grid-item
            v-for="category in menuData"
            :key="category.id"
            class="my-grid-item"
            @click="handleCategoryClick(category)"
        >
          <div class="category-content-wrapper">
            <div class="image-container">
              <van-image
                  :src="getImageUrl(category.icon)"
                  class="my-grid-image"
              >
              </van-image>
            </div>
            <div class="my-grid-name">
              {{ category.name }}
            </div>
          </div>
        </van-grid-item>
      </van-grid>

    <van-dialog v-model:show="showTableNumberDialog" title="输入桌号" show-cancel-button
                @confirm="confirmTableNumber">
      <div style="width: 100%;display: flex;justify-content: space-around">
        <van-field v-model="inputTableNumber" type="number" placeholder="请输入桌号"></van-field>
      </div>
    </van-dialog>

    <van-dialog v-model:show="showDialog" title="Confirm" show-cancel-button
                :before-close="clearGoods"
                @confirm="addGoods"
                @cancel="clearGoods"
                >
      <div style="width: 100%;display: flex;justify-content: space-around">
        <van-stepper :long-press="false" v-model.number="chooseCnt" integer input-width="100px" button-size="50px"   />
      </div>
    </van-dialog>
    <!-- 分类的菜品 -->
    <van-popup
        v-model:show="showBottom"
        position="bottom"
        :style="{ height: '80%' }"
        z-index="1000"
        @close="clearCategory"
    >
      <van-grid  :column-num="3" :gutter="2">
        <van-grid-item
            v-for="goods in currentCategory.goodsList"
            :key="goods.code"
            @click="handleGoodsClick(goods)"
            class="my-grid-item"
        >
          <div class="goods-content-wrapper">
            <div class="image-container">
              <van-image
                  :src="getImageUrl(goods.icon)"
                  class="my-grid-image"
              >
              </van-image>
            </div>
            <div class="my-grid-name">
              {{ goods.name }}
            </div>
            <div class="my-grid-name">
              {{ goods.code }}
            </div>
            <div class="my-grid-name">
              <span class="price">{{format.formatGermanyMoney(goods.price)}}</span>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </van-popup>


    <!-- 搜索的菜品 -->

    <van-dialog v-model:show="showSearchStepDialog" title="Confirm" show-cancel-button
                :before-close="clearSearchStep"
                @confirm="addSearchGoods"
                @cancel="clearSearchStep"
    >
      <div style="width: 100%;display: flex;justify-content: space-around">
        <van-stepper :long-press="false" v-model.number="searchChooseCnt" integer input-width="100px" button-size="50px"   />
      </div>
    </van-dialog>
    <van-popup
        v-model:show="showSearchBottom"
        position="bottom"
        :style="{ height: '80%' }"
        z-index="1000"
        @close="clearSearch"
    >
      <van-grid  :column-num="3" :gutter="2">
        <van-grid-item
            v-for="goods in searchData"
            :key="goods.code"
            @click="handleSearchGoodsClick(goods)"
            class="my-grid-item"
        >
          <div class="goods-content-wrapper">
            <div class="image-container">
              <van-image
                  :src="getImageUrl(goods.icon)"
                  class="my-grid-image"
              >
              </van-image>
            </div>
            <div class="my-grid-name">
              {{ goods.name }}
            </div>
            <div class="my-grid-name">
              {{ goods.code }}
            </div>
            <div class="my-grid-name">
              <span class="price">{{format.formatGermanyMoney(goods.price)}}</span>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </van-popup>

    <!--自定义菜品 -->
    <van-dialog v-model:show="showCustomGoodsDialog" title="Confirm" show-cancel-button
                :before-close="clearCustomerGoods"
                @confirm="addCustomGoods"
                @cancel="clearCustomerGoods"
    >
      <van-field v-model="customerGoods.name" label="菜品名称" placeholder="请输入菜品名称" />
      <van-field v-model="customerGoods.code" label="菜品编码" placeholder="请输入菜品编码" />
      <van-field v-model="customerGoods.price" label="菜品价格" placeholder="请输入菜品编码" />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue'
import {showConfirmDialog,showFailToast,showSuccessToast} from 'vant'
import menuJson from '../assets/menu.json'
import storage from "../utils/storage";
import format from "../utils/format";
import { useRoute } from 'vue-router'



// 显示底部栏按钮、显示对话框
// 菜品popup
const showBottom = ref(false)
// 搜索菜品popup
const showSearchBottom = ref(false)
// 菜品选中步进器对话框
const showDialog = ref(false)
// 搜索菜品选中步进器对话框
const showSearchStepDialog = ref(false)
// 菜品选中数量步进器值
const chooseCnt = ref(1)
// 搜索菜品选中数量步进器值
const searchChooseCnt = ref(1)
// 桌号输入对话框
const showTableNumberDialog = ref(false)
// 搜素文本框值
const searchTxt = ref('')
// 搜索过滤的可选结果
const searchData = ref([])
// 自定义增加菜品dialog
const showCustomGoodsDialog = ref(false)
const customerGoods = ref({})


// 菜单数据
const menuData = ref([])

// 当前选中分类数据
const currentCategory= ref({})
// 当前选中产品数据
const currentGoods = ref({})

const currentSearchGoods = ref({})


// 已点菜单数据
const orderedData = ref({})
// 桌号
const tableNumber = ref(undefined)
const inputTableNumber = ref(undefined)

const route = useRoute()

// 正确获取查询参数
const tdNumber = route.query.tdNumber

onMounted(() => {
  menuData.value = menuJson
  orderedData.value = {}
  if(tdNumber !== undefined){
    tableNumber.value = tdNumber;
    orderedData.value = storage.get("table_" + tdNumber)
  }
})

const confirmTableNumber = () => {
  const num = inputTableNumber.value;
  if(storage.get("table_" + num) === null){
    tableNumber.value = inputTableNumber.value;
    showTableNumberDialog.value = false;
  }else {
    showConfirmDialog({
      title: '确认桌号',
      message:
          '当前桌号' + num + '存在历史数据,是否选择当前桌号？',
    })
    .then(() => {
      tableNumber.value = inputTableNumber.value;
      showTableNumberDialog.value = false;
    })
    .catch(() => {
    });
  }

}

const clearGoods = () => {
  currentGoods.value = {}
  showDialog.value = false;
  chooseCnt.value = 1
}

const clearCategory = () => {
  currentCategory.value = {};
  showBottom.value = false;
}

const clearSearch = () => {
  searchData.value = [];
  // searchTxt.value = '';
  currentSearchGoods.value = {}
  showSearchBottom.value = false;
}

const clearCustomerGoods = () => {
  showCustomGoodsDialog.value = false;
  customerGoods.value = {}
}

// 清除选中的所有数据
const clearAllChoose = () => {
  clearGoods();
  clearCategory();
  clearSearch();
  searchTxt.value = '';
}


const getImageUrl = (name) => {
  try {
    if(name ===undefined || name ==='') {
      return ''
    }
    return new URL(`../assets/${name}`, import.meta.url).href
  } catch {
    return ''
  }
}

/**
 * 点击分类
 */
const handleCategoryClick = (category) => {
  if(tableNumber.value === undefined) {
    showTableNumberDialog.value = true;
  }else {
    currentCategory.value = category
    showBottom.value = true
  }
}

/**
 * 点击菜品
 */
const handleGoodsClick = (goods) => {
  currentGoods.value = goods;
  showDialog.value = true;
}



/**
 * 点击分类方式增加菜品
 */
const addGoods = () => {
  const goods = currentGoods.value
  let item = {
    ...goods
  }
  const currentCategoryName = currentCategory.value.name;
  const currentCategoryId = currentCategory.value.id;
  if(Object.hasOwn(orderedData.value, currentCategoryId)) {
    const existCategory = orderedData.value[currentCategoryId];
    let findGoods = false;
    for(const existGoodsItem of existCategory.goodsList) {
      // code相同代表菜品相同
      if(existGoodsItem.code === item.code) {
        existGoodsItem.cnt = existGoodsItem.cnt + chooseCnt.value;
        findGoods = true;
        break;
      }
    }
    if(findGoods === false) {
      item.cnt = chooseCnt.value;
      existCategory.goodsList.push(item)
    }
  }else {
    orderedData.value[currentCategoryId] = {}
    orderedData.value[currentCategoryId].categoryName = currentCategoryName
    orderedData.value[currentCategoryId].goodsList = []
    item.cnt = chooseCnt.value;
    orderedData.value[currentCategoryId].goodsList.push(item)
  }
}



/**
 * 按订单key排序的订单数组
*/
const sortedOrders = computed(() => {
  return Object.keys(orderedData.value)
      .sort((a, b) => a - b) // 数字排序
      .map(key => ({
        key: Number(key),
        data: orderedData.value[key]
      }));
});

/**
 * 计算总价
 */
const total = computed(() => {
  let sum = 0;
  for (const categoryId in orderedData.value) {
    const category = orderedData.value[categoryId];

    // 第二层循环：遍历分类下的商品列表
    for (const goods of category.goodsList) {
      sum += goods.cnt * goods.price; // 直接累加分单位的总值
    }
  }

  return format.formatGermanyMoney(sum)
})


/**
 * 删除菜品
 */
const deleteGood = (orderKey, code) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除该商品吗？',
  }).then(() => {
    // 遍历key
    for (const categoryId in orderedData.value) {
      if(categoryId != orderKey) {
        continue
      }
      const category = orderedData.value[categoryId];

      category.goodsList = category.goodsList.filter(goods => goods.code !== code);
      if(category.goodsList.length === 0) {
        delete orderedData.value[categoryId];
      }
    }
  }).catch(() => {
    // 取消操作
  });
};

/**
 * 提交餐桌选中菜品信息
 */
const onSubmit = () => {
  if(tableNumber.value === undefined) {
    showFailToast('桌号不能为空');
    return;
  }
  showConfirmDialog({
    title: '桌号' + tableNumber.value + '菜单确认完成？',
  }).then(() => {
    storage.set('table_'+tableNumber.value, orderedData.value)
    // 清空数据
    clearAllChoose();
    inputTableNumber.value = undefined;
    orderedData.value = {};
    tableNumber.value = undefined;
    showSuccessToast('提交成功');
  }).catch(() => {
    // 取消操作
  });
}


/**
 * 搜索菜品，筛选出符合条件的菜品信息
 */
const onSearch = () => {
  const searchText = searchTxt.value;
  if(searchText === '') {
    return;
  }
  if(tableNumber.value === undefined) {
    showTableNumberDialog.value = true;
    return;
  }
  searchData.value = [];
  // 查询菜品显示菜品信息
  for (let i = 0; i < menuJson.length; i++) {
    const category = menuJson[i];
    for(let j=0; j<category.goodsList.length; j++) {
      const goods = category.goodsList[j];
      const pattern = new RegExp(searchText, 'i');
      if(pattern.test(goods.name) || pattern.test(goods.code)) {
        searchData.value.push({
          ...goods,
          categoryId: category.id,
          categoryName: category.name
        });
      }
    }
  }
  showSearchBottom.value = true;
}

/**
 * 清除搜索步进器对话框
 */
const clearSearchStep = () => {
  showSearchStepDialog.value = false;
  searchChooseCnt.value = 1;
}


/**
 * 处理搜索菜品点击事件
 * @param goods
 */
const handleSearchGoodsClick = (goods) => {
  currentSearchGoods.value = goods;
  showSearchStepDialog.value = true;
}


/**
 * 增加搜索菜品到订单中
 */
const addSearchGoods = () => {
  const goods = currentSearchGoods.value
  let item = {
    ...goods
  }
  const currentCategoryName = currentSearchGoods.value.categoryName;
  const currentCategoryId = currentSearchGoods.value.categoryId;
  if(Object.hasOwn(orderedData.value, currentCategoryId)) {
    const existCategory = orderedData.value[currentCategoryId];
    let findGoods = false;
    for(const existGoodsItem of existCategory.goodsList) {
      // code相同代表菜品相同
      if(existGoodsItem.code === item.code) {
        existGoodsItem.cnt = existGoodsItem.cnt + searchChooseCnt.value;
        findGoods = true;
        break;
      }
    }
    if(findGoods === false) {
      item.cnt = searchChooseCnt.value;
      existCategory.goodsList.push(item)
    }
  }else {
    orderedData.value[currentCategoryId] = {}
    orderedData.value[currentCategoryId].categoryName = currentCategoryName
    orderedData.value[currentCategoryId].goodsList = []
    item.cnt = searchChooseCnt.value;
    orderedData.value[currentCategoryId].goodsList.push(item)
  }
}

const handleAddCustomerGoodsClick = () => {
  if(tableNumber.value === undefined) {
    showTableNumberDialog.value = true;
  }else {
    showCustomGoodsDialog.value = true
  }
}

const addCustomGoods = () => {
  const goods = customerGoods.value
  let item = {
    ...goods
  }
  const currentCategoryName = 'Sonstiges';
  const currentCategoryId = 88888888;
  if(Object.hasOwn(orderedData.value, currentCategoryId)) {
    const existCategory = orderedData.value[currentCategoryId];
    let findGoods = false;
    for(const existGoodsItem of existCategory.goodsList) {
      // code相同代表菜品相同
      if(existGoodsItem.code === item.code) {
        existGoodsItem.cnt = existGoodsItem.cnt + 1;
        findGoods = true;
        break;
      }
    }
    if(findGoods === false) {
      item.cnt = 1;
      existCategory.goodsList.push(item)
    }
  }else {
    orderedData.value[currentCategoryId] = {}
    orderedData.value[currentCategoryId].categoryName = currentCategoryName
    orderedData.value[currentCategoryId].goodsList = []
    item.cnt = 1;
    orderedData.value[currentCategoryId].goodsList.push(item)
  }
}
</script>
<style>
.container {
  padding: 12px;
}

.sticky-container{
  max-height: 400px; /* 设置最大高度 */
  overflow-y: auto;
  padding: 10px;
  position: relative;
}

.sticky-header {
  background: white;
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.goods-row {
  display: flex;
  align-items: center;  /* 商品行垂直居中 */
  margin-bottom: 8px;
  width: 100%;
}
.goods-row:last-child {
  margin-bottom: 0;
}

/* 网格项样式 */
.my-grid-item {
  padding: 0;
  margin: 0;
}

.category-content-wrapper {
  width: 100%;
  height: 80px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.goods-content-wrapper {
  width: 100%;
  height: 120px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 图片容器 */
.image-container {
  width: 100%;
  height: 50px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 保持网格项宽度固定 */
.van-grid-item {
  flex-basis: 32% !important;
  max-width: 32% !important;
  min-width: 0 !important; /* 重要：防止内容撑开 */
}
/* 图片样式 */
.my-grid-image {
  width: 50px;
  height: 50px;
  :deep(.van-image) {
    width: 100%;
    height: 100%;
  }
  :deep(img) {
    object-fit: contain;
  }
}

.my-grid-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  text-align: center;
  line-height: 1;
  width: 100%;
  /* 新增换行控制 */
  display: -webkit-box;
  -webkit-line-clamp: 5; /* 最多显示5行 */
  -webkit-box-orient: vertical;
  word-break: break-word; /* 允许单词断开 */
  overflow: visible;
}

.price {
  color: orangered;
  font-weight: bold;
}

</style>
