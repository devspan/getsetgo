<template>
  <v-chip
    :color="getStatusColor"
    size="small"
    class="status-chip"
    :class="status"
  >
    {{ value }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
})

const getStatusColor = computed(() => {
  const colorMap = {
    active: 'success',
    pending: 'warning',
    rejected: 'error',
    suspended: 'error',
    verified: 'success',
    unverified: 'warning'
  }
  return colorMap[props.status.toLowerCase()] || 'default'
})
</script>

<style lang="scss" scoped>
.status-chip {
  font-weight: 500;
  
  &.active, &.verified {
    background-color: rgba(var(--v-theme-success), 0.12) !important;
    color: rgb(var(--v-theme-success)) !important;
  }
  
  &.pending, &.unverified {
    background-color: rgba(var(--v-theme-warning), 0.12) !important;
    color: rgb(var(--v-theme-warning)) !important;
  }
  
  &.rejected, &.suspended {
    background-color: rgba(var(--v-theme-error), 0.12) !important;
    color: rgb(var(--v-theme-error)) !important;
  }
}
</style> 