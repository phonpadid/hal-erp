<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";

// --- Props Definition ---
const props = defineProps({
  modelValue: {
    type: [String, Number, Array, null] as PropType<string | number | number[] | string[] | null>,
    default: null,
  },
  options: {
    type: Array as PropType<{ label: string; value: string | number }[]>,
    default: () => [],
  },
  lang: {
    type: String as PropType<"lo" | "en">,
    default: "lo",
  },
  placeholder: {
    type: String,
    default: "",
  },
  // ไม่ต้องใช้ clearValue อีกต่อไป
  width: {
    type: String,
    default: "100%",
  },
  size: {
    type: String as PropType<"large" | "middle" | "small">,
    default: "middle",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// --- Emits Definition ---
const emit = defineEmits(["update:modelValue", "change"]);

const textByLang = {
  lo: "ກະລຸນາເລືอกຂໍ້ມູນ",
  en: "Please select an item",
};

const displayPlaceholder = computed(() => {
  if (props.placeholder) {
    return props.placeholder;
  }
  return textByLang[props.lang];
});

const value = computed({
  get() {
    return props.modelValue;
  },

  set(newValue) {
    const emitValue = newValue === undefined ? null : newValue;
    emit("update:modelValue", emitValue);
    emit("change", emitValue);
  },
});
</script>

<template>
  <a-select
    v-model:value="value"
    :placeholder="displayPlaceholder"
    :style="{ width }"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :options="options"
    allow-clear
    :dropdown-match-select-width="false"
    show-search
    class="custom-select"
  />
</template>
