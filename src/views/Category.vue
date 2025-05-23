<template>
  <div class="container">
    <van-grid :column-num="2" :gutter="10">
      <van-grid-item
          v-for="category in menuData"
          :key="category.id"
          class="category-item"
          @click="handleCategoryClick(category.menuList)"
      >
        <div class="content-wrapper">
          <div class="image-container">
            <van-image
                :src="getImageUrl(category.icon)"
                class="category-image"
                @error="() => handleImageError(category.id)"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import menuJson from '../assets/menu.json'

const menuData = ref([])

onMounted(() => {
  menuData.value = menuJson
})

const getImageUrl = (name) => {
  try {
    return new URL(`../assets/${name}`, import.meta.url).href
  } catch {
    return ''
  }
}


const handleCategoryClick = (menuList) => {
  console.log('Clicked menu:', menuList)
}
</script>

<style scoped>
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
  height: 180px;
  padding: 12px;
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
  height: 90px; /* 减少图片区域高度 */
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  -webkit-line-clamp: 10; /* 最多显示2行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word; /* 允许单词断开 */
}

/* 点击效果 */
.content-wrapper {
  transition: transform 0.2s;
&:active {
   transform: scale(0.98);
   background: #9af5c6;
 }
}
</style>
