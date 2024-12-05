<template>
  <div class="table-wrapper">
    <!-- Main Table -->
    <v-data-table
      :headers="headers"
      :items="data.results"
      class="table-block elevation-1"
      hover
    >
      <!-- Table Cells -->
      <template v-slot:item="{ item }">
        <tr>
          <td 
            v-for="header in headers" 
            :key="header.key"
            class="table-cell"
          >
            <div class="cell-content">
              <template v-if="header.key === 'user' && typeof item[header.key] === 'object'">
                <div class="user-cell">
                  {{ item[header.key]?.value }}
                </div>
              </template>
              
              <template v-else-if="info.list_fields[header.key]?.type === 'datetime'">
                <div class="datetime-cell">
                  {{ formatDateTime(item[header.key]) }}
                </div>
              </template>
              
              <template v-else-if="info.list_fields[header.key]?.type === 'choice'">
                <v-chip
                  :color="getStatusColor(item[header.key])"
                  size="small"
                  class="status-chip"
                >
                  {{ getChooseValue(header.key, item[header.key]) }}
                </v-chip>
              </template>
              
              <template v-else-if="info.list_fields[header.key]?.type === 'boolean'">
                <v-icon :color="item[header.key] ? 'success' : 'error'">
                  {{ item[header.key] ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </template>
              
              <template v-else>
                <div class="text-cell">{{ item[header.key] }}</div>
              </template>
            </div>
          </td>
        </tr>
      </template>

      <!-- Loading State -->
      <template v-slot:loading>
        <v-skeleton-loader
          type="table-row-divider"
          :loading="loading"
        />
      </template>

      <!-- No Data State -->
      <template v-slot:no-data>
        <div class="no-data">
          <v-icon size="large" icon="mdi-alert-circle-outline" class="mb-2" />
          <div class="text-subtitle-1">No data available</div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import localConfig from "@/local_config"
import { ref, onBeforeMount } from 'vue'
import _ from 'lodash'
import moment from 'moment'
import { useNavStore } from '@/stores/nav'
import axios from '@/plugins/axios'

const props = defineProps({
  path: {
    type: String,
    required: true,
  },
  pagin: {
    type: String,
    default: null
  }
})

const apiKey = localConfig.api
const headers = ref([])
const info = ref([])
const data = ref([])
const loading = ref(false)

onBeforeMount(() => {
  getData()
})

const nav = useNavStore()

const getChooseValue = (field, value) => {
  let s = info.value.list_fields[field]?.attributes?.choices?.filter(i => i.value === value)?.[0]?.["text"]
  return s
}

const formatDateTime = (value) => {
  return value ? moment(value).format('DD.MM.YYYY HH:mm:ss') : ''
}

const getStatusColor = (status) => {
  const colorMap = {
    active: 'success',
    pending: 'warning',
    rejected: 'error',
    suspended: 'error',
    verified: 'success',
    unverified: 'warning'
  }
  return colorMap[status?.toLowerCase()] || 'default'
}

const normFields = (arr) => {
  let res = []
  Object.keys(arr).map($ => {
    if($ !== "_label")
      res.push({
        title: arr[$].attributes.label,
        key: arr[$].source,
        sortable: true,
        align: 'start',
      })
  })
  return res
}

const getData = async () => { 
  loading.value = true
  try {
    const options = await axios.options(`${apiKey}${props.path}`)
    info.value = options.data
    const response = await axios.get(`${apiKey}${props.path}${props.pagin ? props.pagin : ''}`)
    data.value = response.data
    headers.value = normFields(info.value.list_fields)
  } catch (error) {
    console.error(error.message)
  } finally {
    loading.value = false
  }
}

</script>

<style lang="scss">
.table-wrapper {
  background: var(--v-theme-surface);
  border-radius: 8px;
  overflow: hidden;

  .table-block {
    :deep(th) {
      font-size: 0.875rem !important;
      font-weight: 600;
      color: var(--v-theme-secondary);
      white-space: nowrap;
      user-select: none;
      height: 48px !important;
      padding: 0 16px !important;
    }

    :deep(td) {
      font-size: 0.875rem;
      color: var(--v-theme-on-surface);
      height: 48px !important;
      padding: 8px 16px !important;
    }

    .cell-content {
      display: flex;
      align-items: center;
      min-height: 36px;
    }

    .status-chip {
      font-weight: 500;
      min-width: 80px;
      justify-content: center;
    }

    .datetime-cell {
      font-family: 'Roboto Mono', monospace;
    }

    .text-cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .table-wrapper {
    .table-block {
      :deep(table) {
        display: block;
        overflow-x: auto;
      }
    }
  }
}
</style>