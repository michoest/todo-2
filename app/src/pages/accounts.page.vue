<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="q-pa-md">
          <q-card v-for="account in accounts" :key="account.id" flat :bordered="selectedAccount == account.id"
            @click="onClickSelectAccount(account.id)">
            <q-card-section>
              <div class="text-h6">{{ account.description }}</div>
              <div class="text-subtitle2">{{ account.id }}</div>
            </q-card-section>

          </q-card>
        </div>

        <q-checkbox v-model="setAsDefaultAccount">Set as default account</q-checkbox>

        <q-page-sticky position="bottom" :offset="[18, 18]">
          <q-btn fab icon="login" color="accent" :disable="!selectedAccount" @click="onClickLogin" />
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
defineOptions({ name: 'TasksPage' });

import { ref, computed } from 'vue';
import { useStore } from 'src/stores/store';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const $router = useRouter();
const $store = useStore();

const selectedAccount = ref(null);
const setAsDefaultAccount = ref(false);

const accounts = computed(() => {
  return $store.user?.accounts || [];
});

const onClickSelectAccount = (accountId) => {
  selectedAccount.value = accountId;
}

const onClickLogin = async () => {
  if (await $store.loginToAccount(selectedAccount.value, setAsDefaultAccount.value)) {
    $router.push('/');
  }
};
</script>
