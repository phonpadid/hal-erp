import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useGlobalSearchStore = defineStore("globalSearch", () => {
  const keyword = ref<string>("");

  const trimmedKeyword = computed(() => keyword.value.trim());

  const setKeyword = (value: string) => {
    keyword.value = value ?? "";
  };

  const clear = () => {
    keyword.value = "";
  };

  return { keyword, trimmedKeyword, setKeyword, clear };
});
