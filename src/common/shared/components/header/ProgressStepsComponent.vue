<template>
  <div class="w-full">
    <!-- Progress Steps -->
    <a-steps :current="currentStep" :status="currentStatus" size="small" class="custom-steps">
      <a-step
        v-for="(step, index) in defaultSteps[stepType]"
        :key="index"
        :title="step.title"
        :description="step.description"
        :disabled="step.disabled"
        class="cursor-pointer"
        @click="handleStepClick(index)"
      />
    </a-steps>

    <!-- Action Buttons -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-blue-600">{{ documentPrefix }}</span>
      </div>
      <div class="flex gap-2">
        <a-button v-if="currentStep > 0" type="default" @click="onPrevious">
          {{ previousButtonText }}
        </a-button>
        <a-button v-if="showCancelButton" type="default" @click="onCancel">
          {{ cancelButtonText }}
        </a-button>
        <a-button v-if="showNextButton" :type="isLastStep ? 'primary' : 'default'" @click="onNext">
          {{ isLastStep ? confirmButtonText : nextButtonText }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

interface Step {
  title: string;
  description?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

type StepType = "TWO_STEPS" | "THREE_STEPS" | "FOUR_STEPS";

const defaultSteps: Record<StepType, Step[]> = {
  TWO_STEPS: [
    {
      title: "ລາຍລະອຽດ",
      description: "ກະລຸນາຕື່ມຂໍ້ມູນ",
      data: null,
    },
    {
      title: "ສຳເລັດ",
      description: "ດຳເນີນການສຳເລັດ",
      data: null,
      disabled: true,
    },
  ],
  THREE_STEPS: [
    {
      title: "ລາຍລະອຽດ",
      description: "ກະລຸນາຕື່ມຂໍ້ມູນ",
      data: null,
    },
    {
      title: "ກວດສອບ",
      description: "ກວດສອບຂໍ້ມູນ",
      data: null,
      disabled: true,
    },
    {
      title: "ສຳເລັດ",
      description: "ດຳເນີນການສຳເລັດ",
      data: null,
      disabled: true,
    },
  ],
  FOUR_STEPS: [
    {
      title: "ປະເພດໃບສະເໜີ",
      description: "ເລືອກປະເພດໃບສະເໜີ",
      data: null,
    },
    {
      title: "ລາຍລະອຽດ",
      description: "ກະລຸນາຕື່ມຂໍ້ມູນ",
      data: null,
      disabled: true,
    },
    {
      title: "ກວດສອບ",
      description: "ກວດສອບຂໍ້ມູນ",
      data: null,
      disabled: true,
    },
    {
      title: "ສຳເລັດ",
      description: "ດຳເນີນການສຳເລັດ",
      data: null,
      disabled: true,
    },
  ],
};

interface Props {
  stepType: StepType;
  currentStep: number;
  currentStatus?: "wait" | "process" | "finish" | "error";
  documentPrefix?: string;
  showCancelButton?: boolean;
  showNextButton?: boolean;
  cancelButtonText?: string;
  previousButtonText?: string;
  nextButtonText?: string;
  confirmButtonText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stepsData?: Record<number, any>;
}

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "previous"): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: "next", currentStepData: any): void;
  (e: "stepChange", step: number): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: "confirm", allData: Record<number, any>): void;
  (e: "update:currentStep", step: number): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  stepType: "FOUR_STEPS",
  currentStep: 0,
  currentStatus: "process",
  documentPrefix: "ໃບສະເໜີຈັດຊື້ - ຈັດຈ້າງ",
  showCancelButton: true,
  showNextButton: true,
  cancelButtonText: "ຍົກເລີກ",
  previousButtonText: "ກັບຄືນ",
  nextButtonText: "ຕໍ່ໄປ",
  confirmButtonText: "ຢືນຢັນ",
  stepsData: () => ({}),
});

const isLastStep = computed(() => {
  return props.currentStep === defaultSteps[props.stepType].length - 1;
});

const handleStepClick = (stepIndex: number) => {
  const steps = defaultSteps[props.stepType];
  if (!steps[stepIndex].disabled && stepIndex <= props.currentStep) {
    emit("stepChange", stepIndex);
    emit("update:currentStep", stepIndex);
  }
};

const onPrevious = () => {
  if (props.currentStep > 0) {
    emit("previous");
    emit("update:currentStep", props.currentStep - 1);
  }
};

const onNext = () => {
  const steps = defaultSteps[props.stepType];
  if (isLastStep.value) {
    emit("confirm", props.stepsData);
  } else if (props.currentStep < steps.length - 1) {
    emit("next", props.stepsData[props.currentStep]);

    steps[props.currentStep + 1].disabled = false;
    emit("update:currentStep", props.currentStep + 1);
  }
};

const onCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
:deep(.ant-steps-item) {
  cursor: pointer;
}

:deep(.ant-steps-item-disabled) {
  cursor: not-allowed;
}
</style>
