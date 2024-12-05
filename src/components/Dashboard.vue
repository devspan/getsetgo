<template>
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <v-card
        v-for="(stat, index) in stats"
        :key="index"
        class="transition-all hover:shadow-lg"
        elevation="1"
      >
        <v-card-text class="d-flex align-center">
          <div class="mr-4">
            <v-icon
              :icon="stat.icon"
              :color="stat.color"
              size="32"
              class="p-2 rounded-lg"
              :style="`background: ${stat.color}15`"
            />
          </div>
          <div class="flex-grow">
            <div class="text-sm text-gray-600 font-medium">{{ stat.label }}</div>
            <div class="text-xl font-semibold mt-1">
              <v-progress-circular
                v-if="isLoading"
                :color="stat.color"
                indeterminate
                size="20"
                class="mr-2"
              />
              <span>{{ stat.value }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Latest Topups -->
      <v-card class="overflow-visible" elevation="1">
        <card-heading 
          title="Latest Topups" 
          color="cyan" 
          icon="mdi-arrow-collapse-down"
          :actions="[
            { icon: 'mdi-refresh', click: () => refreshTable('topups') },
            { icon: 'mdi-dots-vertical' }
          ]"
        />
        <TableBlock 
          class="mt-4" 
          :path="'dashboard_rest/topups/?limit=10&offset=0'" 
          :pagin="`?limit=10&offset=0`"
          ref="topupsTable"
        />
      </v-card>

      <!-- Latest Withdrawals -->
      <v-card class="overflow-visible" elevation="1">
        <card-heading 
          title="Latest Withdrawals" 
          color="orange" 
          icon="mdi-arrow-expand-up"
          :actions="[
            { icon: 'mdi-refresh', click: () => refreshTable('withdrawals') },
            { icon: 'mdi-dots-vertical' }
          ]"
        />
        <TableBlock 
          class="mt-4" 
          :path="'dashboard_rest/withdrawals/?limit=10&offset=0'" 
          :pagin="`?limit=10&offset=0`"
          ref="withdrawalsTable"
        />
      </v-card>

      <!-- Trading and Withdrawals Fee -->
      <v-card class="overflow-visible" elevation="1">
        <card-heading 
          title="Trading and Withdrawals Fee" 
          color="green" 
          icon="mdi-percent"
          :actions="[
            { icon: 'mdi-refresh', click: () => refreshTable('tradeFee') },
            { icon: 'mdi-dots-vertical' }
          ]"
        />
        <TableBlock 
          class="mt-4" 
          :path="'dashboard_rest/tradefee/?limit=10&offset=0'" 
          :pagin="`?limit=10&offset=0`"
          ref="tradeFeeTable"
        />
      </v-card>

      <!-- User Stats -->
      <v-card class="overflow-visible" elevation="1">
        <card-heading 
          title="User Statistics" 
          color="blue" 
          icon="mdi-account-group"
          :actions="[
            { icon: 'mdi-refresh', click: () => refreshTable('userStats') },
            { icon: 'mdi-dots-vertical' }
          ]"
        />
        <TableBlock 
          class="mt-4" 
          :path="'dashboard_rest/commonusersstats/?limit=10&offset=0'" 
          :pagin="`?limit=10&offset=0`"
          ref="userStatsTable"
        />
      </v-card>
    </div>

    <!-- InOuts Stats -->
    <v-card class="overflow-visible" elevation="1">
      <card-heading 
        title="InOuts Statistics" 
        color="purple" 
        icon="mdi-swap-horizontal"
        :actions="[
          { icon: 'mdi-refresh', click: () => refreshTable('inouts') },
          { icon: 'mdi-dots-vertical' }
        ]"
      />
      <TableBlock 
        class="mt-4" 
        :path="'dashboard_rest/commoninouts/?limit=10&offset=0'" 
        :pagin="`?limit=10&offset=0`"
        ref="inoutsTable"
      />
    </v-card>
  </div>
</template>

<script setup>
import CardHeading from "@/components/CardHeading.vue"
import TableBlock from './TableBlock.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import localConfig from "@/local_config";
import axios from '@/plugins/axios';

// Table refs for refresh functionality
const topupsTable = ref(null);
const withdrawalsTable = ref(null);
const tradeFeeTable = ref(null);
const userStatsTable = ref(null);
const inoutsTable = ref(null);

const apiKey = localConfig.api;

// Add loading state for stats
const isLoading = ref(false);

// Stats data with theme colors
const stats = ref([
  {
    label: 'Total Users',
    value: '0',
    icon: 'mdi-account-multiple',
    color: localConfig.theme.colors.primary,
    endpoint: 'admin_rest/exchangeuser_list/?limit=1',
    errorValue: '0'
  },
  {
    label: '24h Volume',
    value: '$0',
    icon: 'mdi-chart-line',
    color: localConfig.theme.colors.success,
    endpoint: 'dashboard_rest/tradefee/?limit=1',
    errorValue: '$0'
  },
  {
    label: 'Active Orders',
    value: '0',
    icon: 'mdi-clipboard-list',
    color: localConfig.theme.colors.warning,
    endpoint: 'dashboard_rest/commonusersstats/?limit=1',
    errorValue: '0'
  },
  {
    label: 'Pending KYC',
    value: '0',
    icon: 'mdi-account-check',
    color: localConfig.theme.colors.error,
    endpoint: 'core_userkyc_list/?limit=1',
    errorValue: '0'
  }
]);

// Fetch dashboard stats
const fetchStats = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    const promises = stats.value.map(async stat => {
      try {
        const response = await axios.get(`${apiKey}${stat.endpoint}`);
        return {
          success: true,
          data: response.data,
          stat
        };
      } catch (error) {
        console.log(`Error fetching ${stat.label}:`, error);
        return {
          success: false,
          stat,
          error
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      const { stat, success, data, error } = result;
      
      if (!success) {
        stat.value = stat.errorValue;
        return;
      }

      try {
        switch (stat.label) {
          case 'Total Users':
            stat.value = data.count?.toString() || '0';
            break;
          case '24h Volume':
            stat.value = `$${Number(data.volume || 0).toLocaleString()}`;
            break;
          case 'Active Orders':
            stat.value = data.count?.toString() || '0';
            break;
          case 'Pending KYC':
            stat.value = data.count?.toString() || '0';
            break;
          default:
            stat.value = '0';
        }
      } catch (err) {
        console.warn(`Error processing ${stat.label} data:`, err);
        stat.value = stat.errorValue;
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Reset all values to their error states
    stats.value.forEach(stat => {
      stat.value = stat.errorValue;
    });
  } finally {
    isLoading.value = false;
  }
};

// Refresh all data
const refreshDashboard = async () => {
  await fetchStats();
  // Refresh all tables
  Object.keys(tableRefs).forEach(key => {
    refreshTable(key);
  });
};

// Auto-refresh every 30 seconds
let refreshInterval;
onMounted(() => {
  fetchStats();
  refreshInterval = setInterval(fetchStats, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Refresh table data
const refreshTable = (tableType) => {
  const tableRefs = {
    topups: topupsTable,
    withdrawals: withdrawalsTable,
    tradeFee: tradeFeeTable,
    userStats: userStatsTable,
    inouts: inoutsTable
  };

  if (tableRefs[tableType]?.value?.refreshData) {
    tableRefs[tableType].value.refreshData();
  }
};
</script>

<style scoped>
.v-card {
  transition: all 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}

/* Add loading state styles */
.v-progress-circular {
  display: inline-block;
  vertical-align: middle;
}
</style>