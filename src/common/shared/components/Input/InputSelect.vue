<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";

// --- Props Definition ---
const props = defineProps({
  modelValue: {
    type: [String, Number, undefined] as PropType<string | number | undefined>,
    default: undefined,
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
  clearValue: {
    type: [String, Number],
    default: "all",
  },
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
const emit = defineEmits(["update:modelValue", "change", "clear"]);

// --- Dynamic Placeholder ---
// สร้าง Object สำหรับเก็บข้อความในภาษาต่างๆ
const textByLang = {
  lo: "ກະລຸນາເລືອກຂໍ້ມູນ",
  en: "Please select an item",
};

// ใช้ computed property เพื่อเลือก placeholder ที่จะแสดงผล
const displayPlaceholder = computed(() => {
  // ถ้ามีการส่ง prop 'placeholder' มาโดยตรง ให้ใช้ค่านั้นก่อน
  if (props.placeholder) {
    return props.placeholder;
  }
  // ถ้าไม่ ให้เลือกตามภาษาจาก prop 'lang'
  return textByLang[props.lang];
});

// --- Core Logic with Computed v-model ---
// ใช้ computed property เพื่อจัดการค่าที่แสดงผลและค่าที่ส่งกลับ
// นี่คือหัวใจของการแก้ไขปัญหา placeholder
const internalValue = computed({
  // Getter: จะถูกเรียกเมื่อ <a-select> ต้องการแสดงผล
  get() {
    // ถ้าค่า modelValue จากข้างนอกเป็นค่า clearValue (เช่น 'all')
    // ให้เราส่งค่า 'undefined' เข้าไปใน <a-select> แทน
    // เพื่อให้ <a-select> รู้ว่าตอนนี้ไม่มีค่าที่ถูกเลือก และต้องแสดง placeholder
    if (props.modelValue === props.clearValue) {
      return undefined;
    }
    return props.modelValue;
  },
  // Setter: จะถูกเรียกเมื่อผู้ใช้เลือกค่าใน <a-select>
  set(newValue) {
    // เมื่อผู้ใช้กดปุ่ม Clear (x), <a-select> จะส่งค่า 'undefined' กลับมา
    if (newValue === undefined) {
      // เราจะ emit 'update:modelValue' ด้วยค่า clearValue (เช่น 'all') กลับไปให้ Component แม่
      emit("update:modelValue", props.clearValue);
      emit("clear");
    } else {
      emit("update:modelValue", newValue);
      emit("change", newValue);
    }
  },
});
</script>

<template>
  <a-select
    v-model:value="internalValue"
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
  >
  </a-select>
</template>
