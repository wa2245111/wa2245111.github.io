<template>
  <div class="container">
    <!-- 使用 Vant 的 Grid 组件实现 2 列布局 -->
    <van-grid :column-num="2" :gutter="10">
      <van-grid-item
          v-for="category in menuData"
          :key="category.id"
          class="category-item"
          @click="handleCategoryClick(category.menuList)"
      >
        <!-- 使用统一的容器包裹内容 -->
        <div class="content-wrapper">
          <van-image
              :src="getImageUrl(category.icon)"
              height="60"
              class="category-image"
          />
          <div class="category-name">
            {{ category.name }}
          </div>
        </div>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import storage from '../utils/storage'
import menuJson from '../assets/menu.json'  // 注意路径要根据实际位置调整

const menuData = ref([])

// 初始化加载数据
onMounted(() => {
  // 实际项目中可能需要异步加载
  menuData.value = menuJson
  // TODO 校验数据有效性，如果有重复的code，则提示用户并退出程序
  // window.location.href = "about:blank";
})

const getImageUrl = (name) => {
  return new URL(`../assets/${name}`, import.meta.url).href
}

const handleCategoryClick = (menuList) => {
// 这里可以添加点击分类后的逻辑，例如跳转到对应的页面
  console.log(menuList);
}
</script>

<style scoped>
/* 覆盖 vant 默认样式 */
.custom-grid {
  --van-grid-item-content-padding: 0;
  --van-grid-item-content-background: transparent;
}

.category-item {
  /* 移除默认内边距 */
  padding: 0 !important;

  /* 点击效果 */
  transition: background-color 0.2s;

&:active {
   background-color: #f5f5f5;
 }
}

.content-wrapper {
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;

  /* 统一圆角 */
  border-radius: 8px;

  /* 添加点击涟漪效果 */
  position: relative;
  overflow: hidden;
}

/* 自定义点击涟漪效果 */
.content-wrapper::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.05);
  opacity: 0;
  transition: opacity 0.2s;
}

.category-item:active .content-wrapper::after {
  opacity: 1;
}

/* 优化后的样式 */
.category-image {
  width: 100%; /* 新增 */
  margin-bottom: 8px;
  display: flex; /* 新增 */
  justify-content: center; /* 新增 */
  align-items: center; /* 新增 */

  /* 图片容器样式 */
  :deep(.van-image) {
    display: block; /* 新增 */
    width: 60px; /* 保持与高度一致 */
  }

  /* 图片本身样式 */
  :deep(.van-image__img) {
    background: transparent;
    object-fit: contain; /* 新增：保持图片比例 */
  }
}

.category-name {
  font-size: 14px;
  color: #333;
  text-align: center;
  line-height: 1.4;
}
</style>
