<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { reactive, ref } from "vue";
import type { ButtonType } from "@/modules/shared/buttonType";
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import ProgressStepsComponent from "@/common/shared/components/header/ProgressStepsComponent.vue";


const customButtons = [
  {
    label: "ປະຕິເສດ",
    type: "default" as ButtonType,
    onClick: () => {
      // Your custom cancel logic
    },
  },
  {
    label: "ອະນຸມັດ",
    type: "primary" as ButtonType,
    onClick: () => {
      // Your custom submit logic
    },
  },
];
/********************************************************** */

const currentStep = ref(0);
const currentStatus = ref<"wait" | "process" | "finish" | "error">("process");

const stepsData = reactive<Record<number, any>>({
  0: null,
  1: null,
  2: null,
  3: null,
});

const handleStepChange = (step: number) => {
  currentStep.value = step;
};

const handleNext = (stepData: any) => {
  stepsData[currentStep.value] = stepData;
};

const handlePrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleConfirm = (allData: Record<number, any>) => {
  console.log("All steps data:", allData);
};

const handleCancel = () => {
  console.log("Operation cancelled");
  // Reset the steps if needed
  currentStep.value = 0;
  currentStatus.value = "process";
  for (const key in stepsData) {
    stepsData[key] = null;
  }
};
</script>
<template>
  <div class="mt-12">{{ $t("deshboard") }}</div>

  <header-component
    header-title="ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ"
    :breadcrumb-items="['ຄຳຮ້ອງຂໍ້ - ຈັດຈ້າງ', 'ອານຸມັດ']"
    document-prefix="ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ"
    document-number="0036/ພລ - ວັນທີ"
    :document-date="new Date('2025-03-26')"
    :action-buttons="customButtons"
  />
  <br />
  <progress-steps-component
    step-type="FOUR_STEPS"
    v-model:current-step="currentStep"
    :current-status="currentStatus"
    :steps-data="stepsData"
    @step-change="handleStepChange"
    @next="handleNext"
    @previous="handlePrevious"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<style scoped></style>
