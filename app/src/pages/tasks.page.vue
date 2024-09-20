<template>
  <q-page>
    <q-list class="q-py-md">
      <q-item v-for="task in tasks" :key="task.id" class="q-my-md">
        <q-item-section side>
          <q-btn v-if="['not_started', 'in_progress', 'waiting'].includes(task.status)" flat round dense
            icon="radio_button_unchecked" @click="onClickCompleteTask(task)"></q-btn>
          <q-btn v-else flat round dense icon="check" @click="onClickOpenTask(task)"></q-btn>
        </q-item-section>
        <q-item-section>
          <q-item-label><q-badge v-for="tag in task.tags" :key="tag" class="q-mr-xs">{{ tag }}</q-badge></q-item-label>
          <q-item-label>{{ task.title }}
            <q-icon v-if="task.status == 'not_started'" name="start" color="primary" class="q-ml-sm" />
            <q-icon v-else-if="task.status == 'in_progress'" name="pending" color="info" class="q-ml-sm" />
            <q-icon v-else-if="task.status == 'waiting'" name="hourglass_top" color="warning" class="q-ml-sm" />
            <q-icon v-else-if="task.status == 'completed'" name="check" color="positive" class="q-ml-sm" />
          </q-item-label>
          <q-item-label caption>
            <span class="q-mr-md" style="white-space: nowrap;"><q-icon name="person" /> {{ task.owner.description
              }}</span>
            <span class="q-mr-md" style="white-space: nowrap;"><q-icon name="alarm_on" /> {{
              dayjs(task.dueDate).fromNow() }}</span>
            <span class="q-mr-md" style="white-space: nowrap;"><q-icon name="group" /> {{ task.accessAccounts.length }}
              people</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round dense icon="more_horiz"></q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
defineOptions({ name: 'TasksPage' });

import { ref, computed, inject } from 'vue';
import { useStore } from 'src/stores/store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const $store = useStore();
const $notify = inject('notify');

const awaitTimeout = delay => new Promise(resolve => setTimeout(resolve, delay));

const tasks = computed(() => {
  return $store.tasks || [];
});

const onClickCompleteTask = async (task) => {
  const oldStatus = task.status;
  task.status = 'almost-completed';

  await awaitTimeout(500);
  await $store.updateTask(task.id, { status: 'completed' });

  $notify(`${task.title} completed!`, { actions: [{ label: 'Undo', color: 'white', handler: () => { $store.updateTask(task.id, { status: oldStatus }); } }] });
};

const onClickOpenTask = async (task) => {
  await $store.updateTask(task.id, { status: 'not_started' });

  $notify(`${task.title} re-opened!`, { actions: [{ label: 'Undo', color: 'white', handler: () => { $store.updateTask(task.id, { status: 'completed' }); } }] });
};
</script>
