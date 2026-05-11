import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useGlobalSearchStore = defineStore("globalSearch", () => {
  const keyword = ref<string>("");
  // Increments only when the user submits a search (e.g. presses Enter).
  // List views watch this trigger to refetch — clearing the keyword on
  // navigation does NOT bump the trigger, so no stale refetch fires.
  const trigger = ref<number>(0);

  const trimmedKeyword = computed(() => keyword.value.trim());

  const setKeyword = (value: string) => {
    keyword.value = value ?? "";
    trigger.value++;
  };

  const clear = () => {
    keyword.value = "";
  };

  return { keyword, trigger, trimmedKeyword, setKeyword, clear };
});
