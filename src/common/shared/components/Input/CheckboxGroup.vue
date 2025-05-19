<script setup lang="ts">
import { defineProps, defineEmits, watch, computed } from "vue";

type OptionType = { label: string; value: string | number; group?: string };

const props = defineProps<{
  options: OptionType[];
  groupBy?: string;
  modelValue?: (string | number)[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: (string | number)[]): void;
}>();

// ใช้ computed สำหรับ two-way binding
const selectedValues = computed({
  get: () => props.modelValue || [],
  set: (value) => emit("update:modelValue", value),
});

// Log ค่าเมื่อมีการเปลี่ยนแปลง modelValue
watch(
  () => props.modelValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (newValue) => {
    // console.log("CheckboxGroup received modelValue:", newValue);
  },
  { immediate: true, deep: true }
);

// Log ค่าเมื่อ component mount
// onMounted(() => {
//   console.log("CheckboxGroup mounted with values:", props.modelValue);
// });

const groupedOptions = computed(() => {
  if (!props.groupBy) return { "": props.options };

  const groups: Record<string, OptionType[]> = {};
  props.options.forEach((option) => {
    const groupName = option.group || "";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(option);
  });
  return groups;
});

// ฟังก์ชันที่ปรับปรุงเพื่อให้การเปรียบเทียบค่าถูกต้องมากขึ้น
const isSelected = (value: string | number): boolean => {
  return (props.modelValue || []).some((v) => {
    // แปลงค่าเป็น string เพื่อเปรียบเทียบ
    return String(v) === String(value);
  });
};

const toggleOption = (value: string | number) => {
  const currentValues = [...(props.modelValue || [])];

  // ใช้ String เพื่อเปรียบเทียบค่า
  const index = currentValues.findIndex((v) => String(v) === String(value));

  if (index === -1) {
    // เพิ่มค่า
    currentValues.push(value);
  } else {
    // ลบค่า
    currentValues.splice(index, 1);
  }

  console.log("After toggle, values:", currentValues);
  emit("update:modelValue", currentValues);
};
</script>

<template>
  <!-- For non-grouped options -->
  <div v-if="!props.groupBy">
    <a-checkbox-group :options="props.options" v-model="selectedValues" />
  </div>

  <!-- For grouped options -->
  <div v-else class="flex flex-wrap gap-3">
    <div
      v-for="(options, groupName) in groupedOptions"
      :key="groupName"
      class="w-44"
    >
      <h3
        v-if="groupName"
        class="block mb-2 text-sm font-medium dark:text-white"
      >
        {{ groupName }}
      </h3>
      <ul
        class="w-44 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <li
          v-for="option in options"
          :key="option.value"
          class="w-full px-2 py-1 border-b border-gray-200 dark:border-gray-600"
        >
          <a-checkbox
            :value="option.value"
            :checked="isSelected(option.value)"
            @change="() => toggleOption(option.value)"
          >
            {{ option.label }}
          </a-checkbox>
        </li>
      </ul>
    </div>
  </div>
</template>
