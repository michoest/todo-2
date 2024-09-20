<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <loading-page v-if="$store.global.status == 'loading'" />
      <router-view v-else />
    </q-page-container>

    <q-footer class="bg-grey-2 text-primary">
      <q-separator />
      <q-tabs v-if="$store.user" v-model="tab" align="justify">
        <q-route-tab name="tasks" icon="checklist" to="/tasks" />
        <q-route-tab name="settings" to="/settings">
          <q-avatar class="bg-primary text-white" size="sm">{{ $store.account?.description[0] }}</q-avatar>
        </q-route-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
defineOptions({ name: 'AppLayout' });

import { ref, onBeforeMount, watch } from 'vue';
import { useStore } from 'stores/store';
import { useRouter } from 'vue-router';

import LoadingPage from 'src/pages/loading.page.vue';

const tab = ref('menu');
const $store = useStore();
const $router = useRouter();


onBeforeMount(async () => {
  if ($store.persistent.token && !$store.user) {
    if (!await $store.fetch()) {
      $router.push('/login');
    }
  }
  else {
    $store.global.status = 'ok';
  }
});
</script>
