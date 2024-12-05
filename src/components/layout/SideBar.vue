<template>
  <v-app-bar 
    :color="localConfig.theme.colors.primary" 
    elevation="1" 
    height="56"
    class="transition-all"
  >
    <template v-slot:prepend>
      <div class="pl-8 text-lg font-semibold text-white">
        {{ localConfig.title }}
      </div>
    </template>
    <template v-slot:append>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn 
            class="mr-4"
            variant="text"
            v-bind="props"
          >
            <v-icon icon="mdi-account-circle" class="mr-2" />
            <span class="hidden sm:inline">Admin</span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout()">
            <template v-slot:prepend>
              <v-icon icon="mdi-logout" size="small" />
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>

  <v-navigation-drawer
    permanent
    :color="localConfig.theme.colors.surface"
    class="card-shadow"
    width="260"
  >
    <v-list v-model:selected="selected" class="pa-2">
      <template v-for="(item, i) in navigation">
        <v-list-item
          v-if="item.icon"
          :key="i"
          :to="`/page/${item.link === '/' ? 'dashboard' : item.link.name}`"
          :title="item.text"
          :prepend-icon="item.icon"
          :value="item.text"
          class="rounded-lg mb-1 transition-all"
          :class="{ 'text-gradient font-medium': route.path.includes(item.link.name) }"
        >
        </v-list-item>
        <v-list-subheader 
          v-else-if="item.heading"
          :key="i + '_'"
          :title="item.heading"
          class="text-xs font-semibold text-gray-500 px-3 my-2"
        />
        <v-divider 
          v-if="!item.link && !item.heading" 
          class="my-2 opacity-50"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import axios from "../../plugins/axios";
import { onBeforeMount, ref } from "vue";
import { useNavStore } from "@/stores/nav";
import initRouter from "@/router/";
import localConfig from "@/local_config";
import { useRoute } from "vue-router";

const route = useRoute();
const nav = useNavStore();

const apiKey = localConfig.api;

const navigation = ref([]);
const resources = ref([]);

const selected = ref([]);

const logout = () => {
  localStorage.setItem("jwt_token", "");
  initRouter.push({ name: "Login" });
};
const param = ref(route.path);

const devs = ref({});

const getNavigation = async () => {
  if (!window.location.href.includes("/login"))
    try {
      const response = await axios.get(`${apiKey}navigation/`);
      navigation.value = response.data;
      nav.setNavigation(response.data);
      let dStr = "";
      navigation.value.map(($, k) => {
        if ($.heading) {
          devs.value[$.heading] = false;
          dStr = $.heading;
        }
        navigation.value[k]["head"] = dStr;
      });
      try {
        let menu = JSON.parse(localStorage.getItem("menu"));
        if (menu) devs.value = menu;
      } catch (e) {
        console.log(e);
      }
    } catch (error) {
      if (
        error?.response?.data?.type === "authentication_failed" ||
        error?.response?.data?.code?.code === "token_not_valid" ||
        error?.response?.data?.type === "not_authenticated"
      ) {
        initRouter.push({ name: "Login" });
      }
    }
};

const openMenu = ($) => {
  devs.value[$] = !devs.value[$];
  localStorage.setItem("menu", JSON.stringify(devs.value));
};

const getResources = async () => {
  try {
    const response = await axios.get(`${apiKey}resources/`);
    resources.value = response.data;
    nav.setResources(response.data);
  } catch (error) {
    console.log(error.type);
  }
};

onBeforeMount(() => {
  getNavigation();
  getResources();
});
</script>

<style scoped>
.v-list-item--active {
  background: linear-gradient(45deg, rgba(41, 98, 255, 0.1), rgba(61, 90, 254, 0.1));
}

.v-navigation-drawer :deep(.v-list-item__prepend) {
  opacity: 0.7;
}

.v-navigation-drawer :deep(.v-list-item--active .v-list-item__prepend) {
  opacity: 1;
}
</style>
