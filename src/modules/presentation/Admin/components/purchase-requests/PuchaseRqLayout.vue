<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import ProgressStepsComponent from "@/common/shared/components/header/ProgressStepsComponent.vue";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { customSteps } from "./PurchaseRqStep";

// Props for step management
interface Props {
  currentStep: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stepsData: Record<number, any>;
}

// Define emits for v-model
const emit = defineEmits<{
  'update:currentStep': [value: number];
}>();

const props = defineProps<Props>();

// Use reactive ref instead of localStorage directly
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);

const topbarStyle = computed(() => {
  return toggle.value
    ? "left-64 w-[calc(100%-16rem)]" // 16rem = 256px = sidebar width
    : "left-0 w-full";
});

// Function to handle toggle and persist to localStorage
const handleToggle = () => {
  toggle.value = !toggle.value;
  localStorage.setItem("toggle", toggle.value.toString());
};

// Handle step changes
const handleStepChange = (step: number) => {
  emit('update:currentStep', step);
};
</script>

<template>
  <div
    class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
    :class="topbarStyle"
  >
    <header-component
      @toggle="handleToggle"
      header-title="ໃບສະເໜີ"
      :breadcrumb-items="['ໃບສະເໜີ', 'ລາຍລະອຽດ']"
      document-prefix="ໃບສະເໜີ"
      document-number="ເລກທີ 0036/ພລ - ວັນທີ"
      :document-date="new Date('2025-03-26')"
    />

    <progress-steps-component
      class="mt-4"
      @toggle="handleToggle"
      :current-step="props.currentStep"
      @update:current-step="handleStepChange"
      step-type="FOUR_STEPS"
      :custom-steps="customSteps"
      :show-user="true"
      :steps-data="props.stepsData"
    />
  </div>
</template>
