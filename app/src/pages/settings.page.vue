<template>
  <q-page>
    <q-list class="q-pa-sm q-pt-md">
      <q-item-label header>User</q-item-label>
      <q-item class="q-pb-lg">
          <q-item-section avatar>
              <q-avatar>
                  <img src="https://cdn.quasar.dev/img/avatar4.jpg">
              </q-avatar>
          </q-item-section>

          <q-item-section>
              <q-item-label>{{ $store.user?.name.first }} {{ $store.user?.name.last }}</q-item-label>
              <q-item-label caption lines="1">{{ $store.user?.email }}</q-item-label>
          </q-item-section>

          <q-item-section side>
              <q-btn flat round icon="more_horiz" color="grey" @click="onClickUserActions" />
          </q-item-section>
      </q-item>
      <q-item>
          <q-item-section>
              <q-btn color="negative" outline @click="onClickSignout">Sign out</q-btn>
          </q-item-section>
      </q-item>

      <q-separator inset spaced="xl" />

      <q-item-label header>Accounts</q-item-label>

      <q-item v-for="account in accounts" :key="account.id" :class="{ 'bg-grey-2': $store.account.id == account.id }">
          <q-item-section>
              <q-item-label>{{ account.description }} <q-icon v-if="$store.user?.defaultAccount == account.id" name="verified_user" color="positive" /></q-item-label>
              <q-item-label caption lines="1">{{ account.id }}</q-item-label>
          </q-item-section>

          <q-item-section side>
              <q-btn flat round icon="more_horiz" color="grey" @click="onClickAccountActions(account)" />
          </q-item-section>
      </q-item>

      <q-separator inset spaced="xl" />

      <q-item-label header>Backend</q-item-label>
      <q-item>
        <q-item-section>
          <q-input v-model="api" placeholder="API URL">
            <template v-slot:append>
              <q-btn round dense flat icon="network_check" :color="apiStatus ? 'positive' : 'negative'" @click="checkAPI" />
              <q-btn round dense flat color="primary" icon="sync" @click="setAPI" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>

  <account-actions-dialog v-model="accountActionsDialog.show" :account="accountActionsDialog.account" @unset-default="unsetDefaultAccount" @login="onClickSwitchAccounts" />
</template>

<script setup>
defineOptions({ name: 'SettingsPage' });

import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'src/stores/store';

import AccountActionsDialog from 'src/components/settings/accountActions.dialog.vue';

const $router = useRouter();
const $store = useStore();

const accountActionsDialog = ref({
  show: false,
  account: null
});

const api = ref('');
const apiStatus = ref(false);

const accounts = computed(() => {
  return $store.user?.accounts || [];
})

const checkAPI = async () => {
  apiStatus.value = await $store.checkAPI(api.value);
};

const setAPI = () => {
  $store.setAPI(api.value);

  $notify(`API updated!`);
}

const onClickSwitchAccounts = async (accountId) => {
  if (await $store.loginToAccount(accountId)) {
    $router.push('/');
  }
};

const onClickUserActions = () => {

};

const onClickAccountActions = (account) => {
  accountActionsDialog.value.account = account;
  accountActionsDialog.value.show = true;
};

const unsetDefaultAccount = async () => {
  console.log('unsetDefaultAccount');
};

const onClickSignout = async () => {
  if (await $store.logout()) {
    $router.push('/');
  }
};

onMounted(async () => {
  api.value = $store.persistent.api;
  await checkAPI();
});
</script>
