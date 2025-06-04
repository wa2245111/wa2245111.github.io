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
                  @click="go2Add(item)"
              >
                加菜
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

  </div>
</template>

<script setup>
import {ref} from "vue";
import storage from "../utils/storage";
import {showConfirmDialog, showSuccessToast} from "vant";

const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);


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
        "name": '桌号:' + item.substring(6),
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

const go2Add = (item) => {
  showSuccessToast("正在完善")
}

const handleDetail = (item) => {
  showSuccessToast("正在完善")
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
</style>
