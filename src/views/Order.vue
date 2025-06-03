<template>
  <div class="container">
    <van-sticky :offset-top="0" >
      <div style="background: white" >
        <van-row  v-for="order in sortedOrders" :key="order.key" style="margin-bottom: 10px">
          <van-row>
            <span style="font-weight: bold;color:#f89705;word-break: break-word;" >{{order.data.categoryName}}</span>
          </van-row>
          <van-row  v-for="(goods, index) in order.data.goodsList" key="goods.code" class="goods-row"  >

            <van-col span="4" >
              {{goods.code}}
            </van-col>
            <van-col span="5">
              {{goods.price/100.0}}
            </van-col>

            <van-col span="8">
              <van-stepper min="1" v-model="goods.cnt">
              </van-stepper>
            </van-col>


            <van-col span="6">
              {{goods.cnt*goods.price/100.0}}
            </van-col>
            <van-col span="1">
              <van-button size="mini" icon="delete" color="red"  @click="deleteGood(order.key, goods.code)"></van-button>
            </van-col>
          </van-row>
        </van-row>
        <van-row class="goods-row">
          <van-col span="8">总计:{{total}}</van-col>
          <van-col span="10"> <van-field v-model="tableNumber" label="桌号" placeholder="请输入桌号" /></van-col>
          <van-col span="6"><van-button @click="onSubmit">Submit</van-button></van-col>
        </van-row>
      </div>

    </van-sticky>
    <van-grid :column-num="2" :gutter="10">
        <van-grid-item
            v-for="category in menuData"
            :key="category.id"
            class="category-item"
            @click="handleCategoryClick(category)"
        >
          <div class="content-wrapper">
            <div class="image-container">
              <van-image
                  :src="getImageUrl(category.icon)"
                  class="category-image"
              >
                <template #error>
                  <div class="image-placeholder">
                    <van-icon name="photo-fail" size="24" />
                  </div>
                </template>
                <template #loading>
                  <van-loading type="spinner" size="20" />
                </template>
              </van-image>
            </div>
            <div class="category-name">
              {{ category.name }}
            </div>
          </div>
        </van-grid-item>
      </van-grid>

    <van-dialog v-model:show="showDialog" title="Confirm" show-cancel-button
                :before-close="clearGoods"
                @confirm="addGoods"
                @cancel="clearGoods"
                >
      <div style="width: 100%;display: flex;justify-content: space-around">
        <van-stepper v-model.number="chooseCnt" integer input-width="100px" button-size="50px"   />
      </div>
    </van-dialog>
    <!-- 底部弹出 -->
    <van-popup
        v-model:show="showBottom"
        position="bottom"
        :style="{ height: '80%' }"
        z-index="1000"
        @close="clearCategory"
        closeable
    >
      <van-grid :column-num="2" :gutter="10">
        <van-grid-item
            v-for="goods in currentCategory.goodsList"
            :key="goods.code"
            @click="handleGoodsClick(goods)"
            class="category-item"
        >
          <div class="content-wrapper">
            <div class="image-container">
              <van-image
                  :src="getImageUrl(goods.icon)"
                  class="category-image"
              >
                <template #error>
                  <div class="image-placeholder">
                    <van-icon name="photo-fail" size="24" />
                  </div>
                </template>
                <template #loading>
                  <van-loading type="spinner" size="20" />
                </template>
              </van-image>
            </div>
            <div class="category-name">
              {{ goods.name }}
            </div>
            <div class="category-name">
              {{ goods.code }}
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue'
import {showConfirmDialog} from 'vant'
import menuJson from '../assets/menu.json'

// 显示底部栏按钮、显示对话框
const showBottom = ref(false)
const showDialog = ref(false)
const chooseCnt = ref(1)

// 菜单数据
const menuData = ref([])

// 当前选中分类数据
const currentCategory= ref({})
// 当前选中产品数据
const currentGoods = ref({})


// 已点菜单数据
const orderedData = ref({})
const tableNumber = ref(0)

onMounted(() => {
  menuData.value = menuJson
  orderedData.value = {}
})

const clearGoods = () => {
  currentGoods.value = {}
  showDialog.value = false;
  chooseCnt.value = 1
}

const clearCategory = () => {
  currentCategory.value = {};
  showBottom.value = false;
}

// 清除选中的所有数据
const clearAllChoose = () => {
  clearGoods();
  clearCategory();
}


const getImageUrl = (name) => {
  try {
    return new URL(`../assets/${name}`, import.meta.url).href
  } catch {
    return ''
  }
}


const handleCategoryClick = (category) => {
  currentCategory.value = category
  showBottom.value = true
}

const handleGoodsClick = (goods) => {
  currentGoods.value = goods;
  showDialog.value = true;
}


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
    item.cnt = 1;
    orderedData.value[currentCategoryId].goodsList.push(item)
  }
}


// 按订单key排序的订单数组
const sortedOrders = computed(() => {
  return Object.keys(orderedData.value)
      .sort((a, b) => a - b) // 数字排序
      .map(key => ({
        key: Number(key),
        data: orderedData.value[key]
      }));
});

const total = computed(() => {
  let sum = 0;
  for (const categoryId in orderedData.value) {
    const category = orderedData.value[categoryId];

    // 第二层循环：遍历分类下的商品列表
    for (const goods of category.goodsList) {
      sum += goods.cnt * goods.price; // 直接累加分单位的总值
    }
  }

  return sum/100.0;
})

// 删除商品方法
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
    }
  }).catch(() => {
    // 取消操作
  });
};

const onSubmit = () => {
  // showConfirmDialog({
  //   title: '确认删除',
  //   message: '确定要删除该商品吗？',
  // }).then(() => {
  //   orderedData[orderKey].goodsList.splice(index, 1);
  // }).catch(() => {
  //   // 取消操作
  // });
}
</script>
<style>
.container {
  padding: 12px;
}

/* 网格项样式 */
.category-item {
  padding: 0;
  margin: 0;
}

.content-wrapper {
  width: 100%;
  height: 160px;
  padding: 16px;
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
  height: 100px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 保持网格项宽度固定 */
.van-grid-item {
  flex-basis: 50% !important;
  max-width: 50% !important;
  min-width: 0 !important; /* 重要：防止内容撑开 */
}
/* 图片样式 */
.category-image {
  width: 80px;
  height: 80px;

:deep(.van-image) {
  width: 100%;
  height: 100%;
}

:deep(img) {
  object-fit: contain;
}
}

/* 占位符样式 */
.image-placeholder {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* 分类名称 */
.category-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: center;
  line-height: 1;
  width: 100%;

  /* 新增换行控制 */
  display: -webkit-box;
  -webkit-line-clamp: 5; /* 最多显示10行 */
  -webkit-box-orient: vertical;
  word-break: break-word; /* 允许单词断开 */
  overflow: visible;
}

/* 点击效果 */
.content-wrapper {
  transition: transform 0.2s;
&:active {
   transform: scale(0.98);
   background: #9af5c6 !important;
 }
}



.goods-row {
  display: flex;
  align-items: center;  /* 商品行垂直居中 */
  margin-bottom: 8px;
  width: 100%;
}
</style>
