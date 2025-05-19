<template>
  <a-row :gutter="16">
    <a-col :span="cols">
      <a-date-picker
        v-model:value="localStartDate"
        :placeholder="startPlaceholder"
        style="width: 100%"
        :format="displayFormat"
        :disabled="disabled"
        @change="handleStartDateChange"
        :disabledDate="disabledStartDates"
      />
    </a-col>

    <a-col :span="cols">
      <a-date-picker
        v-model:value="localEndDate"
        :placeholder="endPlaceholder"
        style="width: 100%"
        :format="displayFormat"
        :disabled="disabled"
        @change="handleEndDateChange"
        :disabledDate="disabledEndDates"
      />
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch } from "vue";
import dayjs, { Dayjs } from "dayjs";

interface DateRangeProps {
  modelValueStart?: string | null;
  modelValueEnd?: string | null;
  startPlaceholder?: string;
  endPlaceholder?: string;
  dateFormat?: string;
  disabled?: boolean;
  cols?: number;
  minDate?: string | null;
  maxDate?: string | null;
  validateEndAfterStart?: boolean;
  displayFormat?: string;
  valueFormat?: string;
}

// ใช้ defineProps แบบรวมกับค่าเริ่มต้น
const props = withDefaults(defineProps<DateRangeProps>(), {
  modelValueStart: null,
  modelValueEnd: null,
  startPlaceholder: "ເວລາເລີ່ມຕົ້ນ(ວ/ດ/ປ)",
  endPlaceholder: "ເວລາສິ້ນສຸດ(ວ/ດ/ປ)",
  displayFormat: "DD/MM/YYYY",
  dateFormat: "MM-DD-YYYY",
  disabled: false,
  cols: 12,
  minDate: null,
  maxDate: null,
  validateEndAfterStart: true,
});

// กำหนด events ที่จะ emit ออกไป
const emit = defineEmits<{
  "update:modelValueStart": [value: string];
  "update:modelValueEnd": [value: string];
  change: [dateRange: { startDate: string; endDate: string }];
}>();

// เก็บค่าวันที่เริ่มต้นและสิ้นสุดในตัวแปร ref
const localStartDate = ref<Dayjs | null>(
  props.modelValueStart ? dayjs(props.modelValueStart) : null
);
const localEndDate = ref<Dayjs | null>(
  props.modelValueEnd ? dayjs(props.modelValueEnd) : null
);

// Watch เพื่ออัปเดต localStartDate และ localEndDate เมื่อ props เปลี่ยน
watch(
  () => props.modelValueStart,
  (newValue) => {
    localStartDate.value = newValue ? dayjs(newValue) : null;
  }
);

watch(
  () => props.modelValueEnd,
  (newValue) => {
    localEndDate.value = newValue ? dayjs(newValue) : null;
  }
);

// คำนวณวันที่ต่ำสุดที่สามารถเลือกได้
const minDateValue = computed<Dayjs | null>(() => {
  if (props.minDate) {
    return dayjs(props.minDate);
  }
  return null;
});

// คำนวณวันที่สูงสุดที่สามารถเลือกได้
const maxDateValue = computed<Dayjs | null>(() => {
  if (props.maxDate) {
    return dayjs(props.maxDate);
  }
  return null;
});

// ฟังก์ชันเพื่อกำหนดวันที่ไม่สามารถเลือกได้สำหรับวันที่เริ่มต้น
const disabledStartDates = (current: Dayjs): boolean => {
  if (minDateValue.value && current.isBefore(minDateValue.value)) {
    return true;
  }
  if (maxDateValue.value && current.isAfter(maxDateValue.value)) {
    return true;
  }
  return false;
};

// ฟังก์ชันเพื่อกำหนดวันที่ไม่สามารถเลือกได้สำหรับวันที่สิ้นสุด
const disabledEndDates = (current: Dayjs): boolean => {
  if (minDateValue.value && current.isBefore(minDateValue.value)) {
    return true;
  }
  if (maxDateValue.value && current.isAfter(maxDateValue.value)) {
    return true;
  }
  if (
    props.validateEndAfterStart &&
    localStartDate.value &&
    current.isBefore(localStartDate.value)
  ) {
    return true;
  }
  return false;
};

// ฟังก์ชัน handleStartDateChange
const handleStartDateChange = (date: Dayjs | null): void => {
  if (date && date.isValid()) {
    emit("update:modelValueStart", date.format("MM-DD-YYYY"));
  } else {
    emit("update:modelValueStart", "");
  }
  emitChangeEvent();
};

// ฟังก์ชัน handleEndDateChange
const handleEndDateChange = (date: Dayjs | null): void => {
  if (date && date.isValid()) {
    emit("update:modelValueEnd", date.format("MM-DD-YYYY"));
  } else {
    emit("update:modelValueEnd", "");
  }
  emitChangeEvent();
};

// ฟังก์ชัน emitChangeEvent
const emitChangeEvent = (): void => {
  emit("change", {
    startDate: localStartDate.value
      ? localStartDate.value.format("MM-DD-YYYY")
      : "",
    endDate: localEndDate.value ? localEndDate.value.format("MM-DD-YYYY") : "",
  });
};
</script>

<style scoped>
.ant-picker {
  border-radius: 6px;
}
</style>
