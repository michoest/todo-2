<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
      <q-card flat bordered style="width: 350px; max-width: 90vw;">
          <q-card-section>
              <div class="text-h6 text-center">Login</div>
          </q-card-section>

          <q-card-section>
              <q-form @submit="onClickLogin" class="q-gutter-md">
                  <q-input filled v-model="loginForm.email" label="E-mail" />
                  <q-input filled v-model="loginForm.password" label="Password" type="password" />

                  <div class="row justify-center q-mt-md">
                      <q-btn label="Login" type="submit" color="primary" />
                      <q-btn to="/signup" label="Sign up" flat class="q-ml-md" disable />
                  </div>
              </q-form>
          </q-card-section>
      </q-card>
  </q-page>
    </q-page-container>
    <q-footer class="bg-white text-black q-ma-md">
      <q-list>
        <q-expansion-item switch-toggle-side label="Advanced settings...">
          <q-input v-model="api" placeholder="API URL">
            <template v-slot:append>
              <q-btn round dense flat icon="network_check" :color="apiStatus ? 'positive' : 'negative'" @click="checkAPI" />
              <q-btn round dense flat color="primary" icon="sync" @click="setAPI" />
            </template>
          </q-input>
        </q-expansion-item>
      </q-list>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useStore } from 'stores/store';
import { useRouter } from 'vue-router';

const $notify = inject('notify');
const $store = useStore();
const $router = useRouter();

defineOptions({
  name: 'LoginPage'
});

onMounted(async () => {
  api.value = $store.persistent.api;
  await checkAPI();

  $store.global.status = 'ok';
});

const loginForm = ref({ email: '', password: '' });
const api = ref('');
const apiStatus = ref(false);

const checkAPI = async () => {
  apiStatus.value = await $store.checkAPI(api.value);
};

const setAPI = () => {
  $store.setAPI(api.value);
  $notify(`API updated!`);
}

const onClickLogin = async () => {
  if (await $store.login(loginForm.value)) {
    if ($store.account) {
      $router.push('/');
    }
    else {
      $router.push('/accounts');
    }

  }
};
</script>
