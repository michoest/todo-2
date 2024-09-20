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
        <q-item-section @click="onClickSwitchAccounts(account.id)">
          <q-item-label>{{ account.description }} <q-icon v-if="$store.user?.defaultAccount == account.id"
              name="verified_user" color="positive" /></q-item-label>
          <q-item-label caption lines="1">{{ account.id }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn flat round icon="more_horiz" color="grey" @click="onClickAccountActions(account)" />
        </q-item-section>
      </q-item>

      <q-separator inset spaced="xl" />

      <q-item-label header class="flex justify-between items-center">
        <span>Notifications<q-badge v-if="numberOfUnreadNotifications > 0" color="negative" rounded class="q-ml-sm">{{
            numberOfUnreadNotifications }}</q-badge></span>
        <q-toggle v-model="showAllNotifications" label="Show all" />
      </q-item-label>
      <q-item v-for="notification in notifications" :key="notification.id">
        <q-item-section side>
          <q-btn v-if="!notification.read" flat round dense icon="mark_email_read"
            @click="notification.read = true"></q-btn>
          <q-btn v-else flat round dense icon="mark_email_unread" @click="notification.read = false"></q-btn>
        </q-item-section>
        <q-item-section :class="{ 'text-bold': !notification.read }">
          <q-item-label>{{ notification.title }}</q-item-label>
          <q-item-label caption>{{ notification.body }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-if="notifications.length == 0" class="flex justify-center">
        <q-item-section v-if="showAllNotifications" class="text-center">
          There are no notifications!
        </q-item-section>
        <q-item-section v-else class="text-center">
          There are no unread notifications!
        </q-item-section>
      </q-item>

      <q-separator inset spaced="xl" />

      <q-item-label header>Backend</q-item-label>
      <q-item>
        <q-item-section>
          <q-input v-model="api" placeholder="API URL">
            <template v-slot:append>
              <q-btn round dense flat icon="network_check" :color="apiStatus ? 'positive' : 'negative'"
                @click="checkAPI" />
              <q-btn round dense flat color="primary" icon="sync" @click="setAPI" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>

      <q-separator inset spaced="xl" />

      <q-item-label header>SSE<q-badge v-if="$store.global.sse" color="positive"
          class="q-ml-sm">connected</q-badge></q-item-label>
      <q-item>
        <q-item-section>
          <q-btn v-if="!$store.global.sse" flat @click="$store.initSSE">Start SSE</q-btn>
          <q-btn v-else flat @click="$store.closeSSE">Close SSE</q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>

  <account-actions-dialog v-model="accountActionsDialog.show" :account="accountActionsDialog.account"
    @set-default="setDefaultAccount" @login="onClickSwitchAccounts" />
</template>

<script setup>
defineOptions({ name: 'SettingsPage' });

import { onMounted, ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'src/stores/store';

import AccountActionsDialog from 'src/components/settings/accountActions.dialog.vue';

const $router = useRouter();
const $store = useStore();
const $notify = inject('notify');

const accountActionsDialog = ref({
  show: false,
  account: null
});

const api = ref('');
const apiStatus = ref(false);
const showAllNotifications = ref(false);

const accounts = computed(() => {
  return $store.user?.accounts || [];
})

const notifications = computed(() => {
  return showAllNotifications.value ? $store.notifications : $store.notifications.filter(notification => notification.read == false);
});

const numberOfUnreadNotifications = computed(() => {
  return $store.notifications.filter(notification => notification.read == false).length;
});

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

const setDefaultAccount = async (id) => {
  await $store.setDefaultAccount(id);
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
