<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
import { Icon } from "@iconify/vue";
import dayjs from "dayjs";

// Step interface
interface Step {
  title: string;
  description?: string;
  disabled?: boolean;
  data?: any;
}

// Define the step types
type StepType = "TWO_STEPS" | "THREE_STEPS" | "FOUR_STEPS";

// Default steps configuration
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

// Button type definition
type ButtonType = "default" | "primary" | "dashed" | "text" | "link" | "danger";

// Custom button interface
export interface ActionButton {
  label: string;
  type: ButtonType;
  onClick: () => void;
  show?: boolean;
  icon?: string;
  class?: string;
  loading?: boolean;
  disabled?: boolean;
  tooltip?: string;
  permission?: string;
}

// Props interface
interface Props {
  stepType: StepType;
  currentStep: number;
  currentStatus?: "wait" | "process" | "finish" | "error";
  documentPrefix?: string;
  customButtons?: ActionButton[];
  showCancelButton?: boolean;
  showNextButton?: boolean;
  cancelButtonText?: string;
  previousButtonText?: string;
  nextButtonText?: string;
  confirmButtonText?: string;
  stepsData?: Record<number, any>;
  currentDateTime?: string;
  currentUser?: string;
  showDateTime?: boolean;
  showUser?: boolean;
  customSteps?: Step[];
}

// Emits
const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "previous"): void;
  (e: "next", currentStepData: any): void;
  (e: "stepChange", step: number): void;
  (e: "confirm", allData: Record<number, any>): void;
  (e: "update:currentStep", step: number): void;
  (e: "buttonClick", buttonData: ActionButton): void;
}>();

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  stepType: "FOUR_STEPS",
  currentStep: 0,
  currentStatus: "process",
  documentPrefix: "",
  showCancelButton: true,
  showNextButton: true,
  cancelButtonText: "ຍົກເລີກ",
  previousButtonText: "ກັບຄືນ",
  nextButtonText: "ຕໍ່ໄປ",
  confirmButtonText: "ຢືນຢັນ",
  stepsData: () => ({}),
  currentDateTime: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
  currentUser: "",
  showDateTime: false,
  showUser: false,
  customSteps: undefined,
  customButtons: undefined,
});

// Computed properties
const steps = computed(() => {
  return props.customSteps || defaultSteps[props.stepType];
});

const visibleButtons = computed(() => {
  return props.customButtons?.filter((button) => button.show !== false) || [];
});

const isLastStep = computed(() => {
  return props.currentStep === steps.value.length - 1;
});

// Methods
const formatDateTime = (datetime: string) => {
  return dayjs(datetime).format("YYYY-MM-DD HH:mm:ss");
};

const handleStepClick = (stepIndex: number) => {
  const currentSteps = steps.value;
  if (!currentSteps[stepIndex].disabled && stepIndex <= props.currentStep) {
    emit("stepChange", stepIndex);
    emit("update:currentStep", stepIndex);
  }
};

const handleButtonClick = (button: ActionButton) => {
  if (!button.disabled) {
    button.onClick();
    emit("buttonClick", button);
  }
};

const onPrevious = () => {
  if (props.currentStep > 0) {
    emit("previous");
    emit("update:currentStep", props.currentStep - 1);
  }
};

const onNext = () => {
  const currentSteps = steps.value;
  if (isLastStep.value) {
    emit("confirm", props.stepsData);
  } else if (props.currentStep < currentSteps.length - 1) {
    emit("next", props.stepsData[props.currentStep]);
    if (currentSteps[props.currentStep + 1]) {
      currentSteps[props.currentStep + 1].disabled = false;
    }
    emit("update:currentStep", props.currentStep + 1);
  }
};

const onCancel = () => {
  emit("cancel");
};
</script>

<template>
  <div class="w-full">
    <!-- Progress Steps -->
    <a-steps :current="currentStep" :status="currentStatus" size="small" class="custom-steps">
      <a-step
        v-for="(step, index) in steps"
        :key="index"
        :title="step.title"
        :description="step.description"
        :disabled="step.disabled"
        class="cursor-pointer"
        @click="handleStepClick(index)"
      />
    </a-steps>

    <!-- Action Buttons Section -->
    <div class="flex justify-between items-center mt-4">
      <!-- Left side content -->
      <div class="flex items-center gap-2">
        <span v-if="showDateTime" class="text-gray-600 text-sm">
          {{ formatDateTime(currentDateTime) }}
        </span>
        <span v-if="showUser" class="text-gray-600 text-sm">
          {{ currentUser }}
        </span>
        <span v-if="documentPrefix" class="text-blue-600">
          {{ documentPrefix }}
        </span>
      </div>

      <!-- Right side buttons -->
      <div class="flex gap-2">
        <template v-if="customButtons?.length">
          <template v-for="(button, index) in visibleButtons" :key="index">
            <a-tooltip v-if="button.tooltip">
              <template #title>{{ button.tooltip }}</template>
              <a-button
                :type="button.type"
                :class="[button.class, { 'opacity-50 cursor-not-allowed': button.disabled }]"
                @click="handleButtonClick(button)"
                :disabled="button.disabled"
              >
                <template v-if="button.icon" #icon>
                  <Icon :icon="button.icon" />
                </template>
                {{ button.label }}
              </a-button>
            </a-tooltip>
            <a-button
              v-else
              :type="button.type"
              :class="[button.class, { 'opacity-50 cursor-not-allowed': button.disabled }]"
              @click="handleButtonClick(button)"
              :disabled="button.disabled"
            >
              <template v-if="button.icon" #icon>
                <Icon :icon="button.icon" />
              </template>
              {{ button.label }}
            </a-button>
          </template>
        </template>

        <!-- Default buttons if no custom buttons provided -->
        <template v-else>
          <a-button v-if="currentStep > 0" type="default" @click="onPrevious">
            {{ previousButtonText }}
          </a-button>
          <a-button v-if="showCancelButton" type="default" @click="onCancel">
            {{ cancelButtonText }}
          </a-button>
          <a-button
            v-if="showNextButton"
            :type="isLastStep ? 'primary' : 'default'"
            @click="onNext"
          >
            {{ isLastStep ? confirmButtonText : nextButtonText }}
          </a-button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-steps {
  margin-bottom: 1rem;
}

:deep(.ant-steps-item) {
  cursor: pointer;
}

:deep(.ant-steps-item-disabled) {
  cursor: not-allowed;
}

.button-hover {
  transition: all 0.3s ease;
}

.button-hover:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
