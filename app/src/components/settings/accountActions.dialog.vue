<template>
  <q-dialog v-model="show" position="bottom">
    <q-card style="width: 350px">
      <q-card-section>
        <q-list separator>
          <q-item v-if="props.account.id == $store.user.defaultAccount" clickable v-ripple @click="onClickSetDefault(false)">
            <q-item-section avatar>
              <q-icon name="person_remove" />
            </q-item-section>
            <q-item-section>Unset default account</q-item-section>
          </q-item>
          <q-item v-if="props.account.id != $store.user.defaultAccount" clickable v-ripple @click="onClickSetDefault(true)">
            <q-item-section avatar>
              <q-icon name="person_add" />
            </q-item-section>
            <q-item-section>Set as default account</q-item-section>
          </q-item>
          <q-item v-if="props.account.id != $store.account.id" clickable v-ripple @click="onClickLogin">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>Login to {{ props.account.description }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineOptions({ name: 'AccountActionsDialog' });

import { useStore } from 'src/stores/store';
const $store = useStore();

const show = defineModel();
const props = defineProps({
  account: Object
});

const emit = defineEmits(['setDefault', 'login']);

const onClickSetDefault = (set) => {
  show.value = false;
  emit('setDefault', set ? props.account.id : null);
};

const onClickLogin = () => {
  show.value = false;
  emit('login', props.account.id);
};
</script>
