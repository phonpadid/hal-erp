<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number, undefined] as PropType<string | number | undefined>,
    default: undefined,
  },
  options: {
    type: Array as PropType<{ label: string; value: string | number }[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "ກະລູນາເລືອກຂໍ້ມູນ",
  },
  // 1. เพิ่ม prop นี้ เพื่อให้ Component แม่ กำหนดได้ว่าเมื่อ Clear แล้วค่าควรเป็นอะไร
  clearValue: {
    type: [String, Number],
    default: "all", // ค่าเริ่มต้นคือ "all"
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

// 2. เพิ่ม event 'clear' เข้าไป
const emit = defineEmits(["update:modelValue", "change", "clear"]);

// 3. แก้ไขฟังก์ชัน onChange ทั้งหมด
function onChange(value: string | number | undefined) {
  // Component <a-select> จะส่งค่า 'undefined' กลับมาเมื่อผู้ใช้กดปุ่ม Clear
  if (value === undefined) {
    // นี่คือตอนที่ผู้ใช้กดปุ่ม Clear (x)
    emit("update:modelValue", props.clearValue); // Reset ค่า v-model ใน Component แม่ ให้เป็น 'all'
    emit("clear"); // ส่งสัญญาณ 'clear' ออกไปให้ Component แม่รับรู้
  } else {
    // นี่คือตอนที่ผู้ใช้เลือกค่าอื่นๆ ตามปกติ
    emit("update:modelValue", value);
    emit("change", value);
  }
}
</script>

<template>
  <a-select
    :value="modelValue"
    @change="onChange"
    :placeholder="placeholder"
    :style="{ width }"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    allow-clear
    :dropdown-match-select-width="false"
    class="custom-select"
    show-search
  >
    <a-select-option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :title="option.label"
    >
      {{ option.label }}
    </a-select-option>
  </a-select>
</template>
