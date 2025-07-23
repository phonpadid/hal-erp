<template>
  <a-date-picker
    v-model:value="internalValue"
    :placeholder="placeholder"
    :format="format"
    :disabled="disabled"
    :size="size"
    :show-time="showTime"
    :disabled-date="disabledDate"
    :picker="picker"
    :allow-clear="allowClear"
    :bordered="bordered"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Dayjs } from "dayjs";

interface Props {
  modelValue?: Dayjs | null;
  placeholder?: string;
  format?: string;
  disabled?: boolean;
  size?: "large" | "middle" | "small";
  showTime?: boolean | object;
  disabledDate?: (current: Dayjs) => boolean;
  picker?: "date" | "week" | "month" | "quarter" | "year";
  allowClear?: boolean;
  bordered?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: Dayjs | null): void;
  (e: "change", value: Dayjs | null, dateString: string): void;
  (e: "focus", event: FocusEvent): void;
  (e: "blur", event: FocusEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select date",
  format: "YYYY-MM-DD",
  disabled: false,
  size: "middle",
  showTime: false,
  picker: "date",
  allowClear: true,
  bordered: true,
});

const emit = defineEmits<Emits>();

// Two-way binding
const internalValue = computed({
  get: () => props.modelValue || null,
  set: (value: Dayjs | null) => {
    emit("update:modelValue", value);
  },
});

// Event handlers
const handleChange = (value: Dayjs | null, dateString: string) => {
  emit("change", value, dateString);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};
</script>
