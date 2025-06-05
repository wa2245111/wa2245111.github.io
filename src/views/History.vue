<template>
  <div class="container">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
      >
        <van-cell
            v-for="item in list"
            :key="item.key"
            class="list-item"
        >
          <div class="item-content">
            <div class="item-info">
              <div class="item-icon">
                <i class="fas fa-utensils"></i>
              </div>
              <div class="item-name">{{ item.name }}</div>
            </div>
            <div class="item-actions">
              <van-button
                  type="primary"
                  size="small"
                  icon="plus"
                  class="action-btn add"
                  @click="go2Modify(item)"
              >
                修改
              </van-button>
              <van-button
                  type="info"
                  size="small"
                  icon="info"
                  class="action-btn detail"
                  @click="handleDetail(item)"
              >
                详情
              </van-button>
              <van-button
                  type="danger"
                  size="small"
                  icon="delete"
                  class="action-btn delete"
                  @click="confirmDelete(item)"
              >
                删除
              </van-button>
            </div>
          </div>
        </van-cell>
      </van-list>
    </van-pull-refresh>

    <van-popup
        v-model:show="showDetail"
        position="bottom"
        :style="{ height: '100%' }"
        z-index="1000"
        closeable
        @close="clearDetail"
    >
      <div class="popup-content">
          <div style="background: white; padding: 16px">
            <!-- 标题 -->
            <h2 style="text-align: center; margin-bottom: 20px">{{tableNumberStr}}</h2>

            <!-- 分类列表 -->
            <div v-for="order in sortedOrders" :key="order.key" class="order-item">
              <!-- 分类标题 -->
              <div class="category-title">
                <span>{{order.data.categoryName}}</span>
              </div>

              <!-- 商品列表 -->
              <div v-for="(goods, index) in order.data.goodsList" :key="goods.code" class="goods-row">
                <van-col span="9" class="goods-code">{{goods.code}}</van-col>
                <van-col span="6" class="goods-price">{{format.formatGermanyMoney(goods.price)}}</van-col>
                <van-col span="3" class="goods-quantity">{{goods.cnt}}</van-col>
                <van-col span="6" class="goods-total">{{format.formatGermanyMoney(goods.cnt*goods.price)}}</van-col>
              </div>
            </div>

            <!-- 固定底部：总计 -->
            <div class="total-footer">
              <div class="total-container">
                <span class="total-label">Total：</span>
                <span class="total-value">{{total}}</span>
              </div>
            </div>
          </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {showConfirmDialog, showSuccessToast} from "vant";
import storage from "../utils/storage";
import format from "../utils/format";
import router from "../router";

const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const showDetail = ref(false);
const orderedData = ref({});
const tableNumberStr = ref(undefined)

const getNumber = (str) => {
  const num = parseInt(str.substring(6), 10);
  return isNaN(num) ? 0 : num;
};

const onLoad = () => {
  // 拼接数据
  const keys = storage.getTableKeys().sort((a,b) => getNumber(a) - getNumber(b));

  if(keys.length > 0) {
    for(const item of keys) {
      list.value.push({
        "name": 'Tisch:' + item.substring(6),
        "key" : item
      });
    }
  }
  loading.value = false;
  finished.value = true;
};

const onRefresh = () => {
  // 清空列表数据
  finished.value = false;

  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true;
  list.value = [];
  refreshing.value = false;
  onLoad();
};


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



const confirmDelete = (item) => {
  showConfirmDialog({
    title: '删除确认',
    message: `确定要删除 ${item.name} 吗？此操作不可撤销。`,
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    confirmButtonColor: '#e74c3c'
  })
  .then(() => {
    storage.remove(item.key);
    showSuccessToast('删除成功');
    onRefresh();
  })
  .catch(() => {
    // 取消操作
  })
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

const go2Modify = (item) => {
  router.push({
    name: 'Order',
    query: { tdNumber: getNumber(item.key) }
  })
}

const handleDetail = (item) => {
  tableNumberStr.value = item.name;
  orderedData.value = storage.get(item.key)
  showDetail.value = true;

}

const clearDetail = () => {
  tableNumberStr.value = undefined;
  orderedData.value = {};
  showDetail.value = false;
}

</script>

<style scoped>
.container {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.list-item {
  margin-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #eee;
}

.list-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.item-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3436;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  border-radius: 50px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  padding: 0 12px;
  height: 32px;
}

.action-btn.add {
  background: linear-gradient(to right, #2ecc71, #27ae60);
  color: white;
  border: none;
}

.action-btn.detail {
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  border: none;
}

.action-btn.delete {
  background: linear-gradient(to right, #e74c3c, #c0392b);
  color: white;
  border: none;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
  background: white;
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #bdc3c7;
}

.empty-state h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #34495e;
}

@media (max-width: 768px) {
  .item-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.van-cell {
  background: transparent;
  padding: 0;
}

.van-pull-refresh {
  min-height: calc(100vh - 150px);
}

.list-item {
  animation: fadeIn 0.4s ease-out;
}

/* 分类标题样式 */
.category-title {
  background-color: #f89705;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
}

/* 商品行样式 */
.goods-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

/* 商品信息样式 */
.goods-code, .goods-price, .goods-quantity, .goods-total {
  text-align: center;
  font-size: 20px;
  /* 核心解决方案 */
  word-break: break-all;     /* 允许在任意字符间断行 */
  overflow-wrap: break-word; /* 优先尝试保留单词完整，超长时强制断行 */

  /* 可选增强 */
  white-space: normal !important; /* 强制覆盖可能存在的 nowrap 样式 */
  hyphens: auto;             /* 支持连字符断词（按需添加） */
}

.goods-price, .goods-total {
  color: #ee0a24; /* 价格红色突出 */
  font-weight: 500;
}

/* 总计行样式 */
.total-row {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 2px solid #f89705;
}

.total-text {
  text-align: right;
  font-size: 16px;
  padding-right: 16px;
}

.total-amount {
  font-weight: bold;
  font-size: 18px;
  color: #ee0a24;
}

/* 订单项间距 */
.order-item {
  margin-bottom: 10px;
}

.popup-content {
  padding: 5px 0px;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}


/* 底部总计样式 */
.total-footer {
  border-top: 2px solid #f89705;
  background: white;
  padding: 12px 16px;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.total-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.total-label {
  font-size: 30px;
  margin-right: 8px;
}

.total-value {
  font-weight: bold;
  font-size: 30px;
  color: #ee0a24;
}
</style>
