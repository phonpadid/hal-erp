// storage.store.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useToggleStore = defineStore('toggle', () => {
  // Initialize from localStorage, default to true if not set
  const storedValue = localStorage.getItem('toggle');
  const toggle = ref(storedValue !== null ? storedValue === 'true' : true);

  // Watch for changes and update localStorage
  watch(toggle, (val) => {
    localStorage.setItem('toggle', val ? 'true' : 'false');
  });

  console.log('Initial toggle value:', toggle.value);

  return { toggle };
});
