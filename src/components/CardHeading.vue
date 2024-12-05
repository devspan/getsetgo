<template>
  <div class="px-6 py-4 flex items-center justify-between border-b border-gray-100">
    <div class="flex items-center space-x-3">
      <div 
        class="rounded-lg p-2"
        :style="`background: ${color}15; color: ${color}`"
      >
        <v-icon :icon="icon" />
      </div>
      <h2 class="text-lg font-semibold">{{ title }}</h2>
    </div>
    
    <div class="flex items-center space-x-2" v-if="actions">
      <v-btn
        v-for="(action, index) in actions"
        :key="index"
        :icon="action.icon"
        variant="text"
        density="comfortable"
        size="small"
        @click="action.click"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  icon: {
    type: String,
    required: true
  },
  actions: {
    type: Array,
    default: () => []
  }
});
</script>
