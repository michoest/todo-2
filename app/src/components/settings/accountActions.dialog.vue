<template>
  <q-dialog v-model="show" position="bottom">
    <q-card style="width: 350px">
      <q-card-section>
        <q-list separator>
          <q-item v-if="props.account.id == $store.user.defaultAccount" clickable v-ripple @click="onClickUnsetDefault">
            <q-item-section avatar>
              <q-icon name="person_remove" />
            </q-item-section>
            <q-item-section>Unset default account</q-item-section>
          </q-item>
          <q-item v-if="props.account.id != $store.user.defaultAccount" clickable v-ripple @click="onClickSetDefault">
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
          <!-- <q-item v-if="props.item.due?.date" clickable v-ripple @click="onClickPostponeItem(props.item)">
                      <q-item-section avatar>
                          <q-icon name="trending_flat" />
                      </q-item-section>
                      <q-item-section>Postpone...</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="onClickDeleteItem(props.item)">
                      <q-item-section avatar>
                          <q-icon name="delete" />
                      </q-item-section>
                      <q-item-section>Delete item</q-item-section>
                  </q-item> -->
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

const emit = defineEmits(['unsetDefault', 'setDefault', 'login']);

const onClickUnsetDefault = () => {
  show.value = false;
  emit('unsetDefault');
};

const onClickSetDefault = () => {
  show.value = false;
  emit('setDefault', props.account.id);
};

const onClickLogin = () => {
  show.value = false;
  emit('login', props.account.id);
};
</script>
