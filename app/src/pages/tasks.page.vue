<template>
  <q-page>
    <q-list class="q-py-md">
      <q-item v-for="task in tasks" :key="task.id" class="q-my-md">
        <q-item-section side>
          <q-btn flat round dense icon="radio_button_unchecked"></q-btn>
        </q-item-section>
        <q-item-section>
          <q-item-label><q-badge v-for="tag in task.tags" :key="tag" class="q-mr-xs">{{ tag }}</q-badge></q-item-label>
          <q-item-label>{{ task.title }}
            <q-icon v-if="task.status == 'not_started'" name="start" color="primary" class="q-ml-sm" />
            <q-icon v-else-if="task.status == 'in_progress'" name="pending" color="info" class="q-ml-sm" />
            <q-icon v-else-if="task.status == 'waiting'" name="start" color="warning" class="q-ml-sm" />
            <q-icon v-else-if="task.status == 'completed'" name="start" color="positive" class="q-ml-sm" />
          </q-item-label>
          <q-item-label caption>
            <span class="q-mr-md" style="white-space: nowrap;"><q-icon name="person" /> {{ task.owner.description }}</span>
            <span class="q-mr-md" style="white-space: nowrap;"><q-icon name="alarm_on" /> {{ dayjs(task.dueDate).fromNow() }}</span>
            <span class="q-mr-md" style="white-space: nowrap;"><q-icon name="group" /> {{ task.accessAccounts.length }} people</span>
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

import { computed } from 'vue';
import { useStore } from 'src/stores/store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const $store = useStore();

const tasks = computed(() => {
  return $store.tasks || [];
});
</script>
