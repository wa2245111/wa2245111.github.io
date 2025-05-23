<template>
  <div class="container">
    <router-view />
    <van-tabbar v-model="active">
      <van-tabbar-item
          v-for="(item, index) in tabItems"
          :key="index"
          :icon="item.icon"
          @click="switchTab(index, item.path)"
      >
        {{ item.text }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const active = ref(0);

const tabItems = ref([
  { path: '/order', icon: 'home-o', text: '点餐' },
  { path: '/history', icon: 'search', text: '已点' }
]);

const switchTab = (index, path) => {
  active.value = index;
  router.push(path);
};

watch(() => route.path, (newPath) => {
  const idx = tabItems.value.findIndex(item => item.path === newPath);
  if (idx >= 0) active.value = idx;
}, { immediate: true });
</script>

<style scoped>

</style>
