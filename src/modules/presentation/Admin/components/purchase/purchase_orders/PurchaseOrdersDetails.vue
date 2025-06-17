<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import ProgressStepsComponent, {
  type ActionButton,
} from "@/common/shared/components/header/ProgressStepsComponent.vue";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import { computed, reactive, ref } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";

/************************************* */
const currentStep = ref(0);
const currentStatus = ref<"wait" | "process" | "finish" | "error">("process");

// Custom steps
const customSteps = [
  {
    title: "ອານຸມັດຈັດຊື້",
    data: null,
  },
  {
    title: "ກວດສອບ",
    data: null,
    disabled: true,
  },
  {
    title: "ສຳເລັດ",
    data: null,
    disabled: true,
  },
];

// Form validation example
const isFormValid = computed(() => {
  // Your validation logic here
  return true;
});

// Steps data
const stepsData = reactive({
  0: null,
  1: null,
  2: null,
});

// Custom buttons with different configurations for each step
const actionButtons = computed<ActionButton[]>(() => {
  switch (currentStep.value) {
    case 0:
      return [
        {
          label: "ຢືນຢັນໃບອານຸມັດ",
          type: "primary" as ButtonType,
          onClick: () => handleNext(),
          show: true,
          disabled: !isFormValid.value,
          class: "button-hover",
        },
      ];
    case 1:
      return [
        {
          label: "ຢືນຢັນໃບອານຸມັດ",
          type: "primary" as ButtonType,
          onClick: () => handleNext(),
          show: true,
          disabled: !isFormValid.value,
          class: "button-hover",
        },
      ];

    case 2:
      return [
        {
          label: "ຢືນຢັນ",
          type: "primary" as ButtonType,
          onClick: () => handleConfirm(stepsData),
          show: true,
          disabled: !isFormValid.value,
          class: "button-hover",
        },
      ];

    default:
      return [];
  }
});
// Event handlers
const handleStepChange = (step: number) => {
  currentStep.value = step;
};

const handleNext = (stepData?: any) => {
  if (stepData) {
    stepsData[currentStep.value] = stepData;
  }
  currentStep.value++;
};

const handlePrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleConfirm = (allData: Record<number, any>) => {
  console.log("All steps data:", allData);
  // Your confirmation logic
};

const handleButtonClick = (buttonData: any) => {
  console.log("Button clicked:", buttonData);
  // Additional button click handling
};
</script>
<template>
  <br />
  <header-component
    header-title="ອານຸມັດຈັດຊື້"
    :breadcrumb-items="['ອານຸມັດຈັດຊື້ > ເພີ່ມຂໍ້ມູນ']"
    :show-document-date="false"
    :show-document-number="false"
    :show-document-prefix="false"
  />
  <progress-steps-component
    step-type="THREE_STEPS"
    v-model:current-step="currentStep"
    :current-status="currentStatus"
    :steps-data="stepsData"
    :custom-steps="customSteps"
    :custom-buttons="actionButtons"
    :show-user="true"
    document-prefix="ສ້າງໃບອານຸມັດຊື້ - ຈັດຈ້າງ"
    @step-change="handleStepChange"
    @next="handleNext"
    @previous="handlePrevious"
    @confirm="handleConfirm"
    @button-click="handleButtonClick"
  />
</template>
