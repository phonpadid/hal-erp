<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- ใช้ a-checkbox จาก Ant Design -->
  <a-checkbox :checked="isChecked" :disabled="disabled" @change="onChange">
    {{ label }}
  </a-checkbox>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";

// กำหนดประเภทของ props
const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false, // ค่าเริ่มต้นของ checkbox
  },
  value: {
    type: [String, Number, Boolean],
    default: "", // ค่าที่จะเพิ่มเข้าไปใน array เมื่อ checkbox ถูกเลือก
  },
  label: {
    type: String,
    default: "", // ข้อความที่จะแสดงใน checkbox
  },
  disabled: {
    type: Boolean,
    default: false, // ควบคุมสถานะของ checkbox ว่าเป็น disabled หรือไม่
  },
});

// ฟังก์ชันที่ใช้ส่งค่ากลับไปยัง parent component เมื่อมีการเปลี่ยนแปลง
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean | unknown[]): void;
}>();

// คำนวณว่า checkbox นี้ถูกเลือกหรือไม่
const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return !!props.modelValue;
});

const onChange = (e: { target: { checked: boolean } }) => {
  const isChecked = e.target.checked;

  if (Array.isArray(props.modelValue)) {
    // ถ้า modelValue เป็น array
    const newValue = [...props.modelValue];

    if (isChecked) {
      // ถ้าเลือก เพิ่มค่าเข้าไปใน array (ถ้ายังไม่มี)
      if (!newValue.includes(props.value)) {
        newValue.push(props.value);
      }
    } else {
      // ถ้ายกเลิกการเลือก ลบค่าออกจาก array
      const index = newValue.indexOf(props.value);
      if (index !== -1) {
        newValue.splice(index, 1);
      }
    }

    emit("update:modelValue", newValue);
  } else {
    // ถ้า modelValue เป็น boolean
    emit("update:modelValue", isChecked);
  }
};
</script>

<style scoped>
/* คุณสามารถใส่สไตล์ที่ต้องการเพิ่มเติมที่นี่ */
</style>
