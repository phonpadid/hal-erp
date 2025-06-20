// storage.store.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useToggleStore = defineStore('toggle', () => {
  const toggle = ref(localStorage.getItem('toggle') === 'true');

  watch(toggle, (val) => {
    localStorage.setItem('toggle', String(val));
  });

  return { toggle };
});
