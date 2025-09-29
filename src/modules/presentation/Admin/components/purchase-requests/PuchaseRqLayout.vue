<script setup lang="ts">
import HeaderComponent from "@/common/shared/components/header/HeaderComponent.vue";
import ProgressStepsComponent, {
  type ActionButton,
} from "@/common/shared/components/header/ProgressStepsComponent.vue";
import { useToggleStore } from "../../stores/storage.store";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { getCustomSteps } from "./PurchaseRqStep";
import type { ButtonType } from "@/modules/shared/buttonType";
import { useNotification } from "@/modules/shared/utils/useNotification";
import { useI18n } from "vue-i18n";

/***************************************************/
const { t } = useI18n();
const { error } = useNotification();
const currentStatus = ref<"wait" | "process" | "finish" | "error">("process");

// Props for step management
interface Props {
  currentStep: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stepsData: Record<number, any>;
}

const isFormValid = computed(() => {
  return true;
});

// Define emits for v-model and confirm action
const emit = defineEmits<{
  "update:currentStep": [value: number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "confirm-step": [stepsData: Record<number, any>];
}>();

const props = defineProps<Props>();

// Use reactive ref instead of localStorage directly
const toggleStore = useToggleStore();
const { toggle } = storeToRefs(toggleStore);
const topbarStyle = computed(() => {
  const defaultL = toggle.value ? true : false;
  return defaultL ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full";
});

// Handle step changes
const handleStepChange = (step: number) => {
  emit("update:currentStep", step);
};

// Go back to previous step
const goBack = () => {
  if (props.currentStep > 0) {
    emit("update:currentStep", props.currentStep - 1);
  }
};

// Go back to first step
const goToFirstStep = () => {
  emit("update:currentStep", 0);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleConfirm = async (allData: Record<number, any>) => {
  // console.log("All steps data:", allData[0]);
  if (props.currentStep === 1) {
    try {
      emit("confirm-step", allData);
    } catch (err) {
      console.error(err);
      error("ເກີດຂໍ້ຜິດພາດ");
    }
  }
};

// const handleDone = async (allData: Record<number, any>) => {
//   console.log("All steps data:", allData);
//   if (props.currentStep === 2) {
//     try {
//       emit("update:currentStep", 3);
//     } catch (err) {
//       console.error(err);
//       error("ເກີດຂໍ້ຜິດພາດ");
//     }
//   }
// };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDone = async (allData: Record<number, any>) => {
  console.log("All steps data:", allData);
  if (props.currentStep === 2) {
    // เปลี่ยนจาก 2 เป็น final step
    try {
      emit("confirm-step", allData); // แทนที่จะ update step เป็น 3
    } catch (err) {
      console.error(err);
      error("ເກີດຂໍ້ຜິດພາດ");
    }
  }
};

const cancel = () => {
  goToFirstStep();
};
const actionButtons = computed<ActionButton[]>(() => {
  if (currentStatus.value === "finish") {
    return [];
  }

  switch (props.currentStep) {
    case 0: // ขั้นตอนที่ 1
      return [];
    case 1: // ขั้นตอนที่ 2
      return [
        {
          label: t("purchase-rq.btn.cancel"),
          onClick: () => goBack(),
          show: true,
          disabled: false,
          class: "button-hover",
          type: undefined,
        },
        {
          label: t("purchase-rq.btn.confirm"),
          onClick: async () => await handleConfirm(props.stepsData),
          show: true,
          disabled: false,
          class: "button-hover",
          type: "primary" as ButtonType,
        },
      ] as ActionButton[];
    // case 2: // ขั้นตอนที่ 3 (สุดท้าย)
    //   return [
    //     {
    //       label: t("purchase-rq.btn.cancel"),
    //       onClick: async () => cancel(),
    //       show: true,
    //       disabled: false,
    //       class: "button-hover",
    //       type: undefined,
    //     },
    //     {
    //       label: t("purchase-rq.btn.confirm"),
    //       type: "primary" as ButtonType,
    //       onClick: async () => await handleDone(props.stepsData),
    //       show: true,
    //       disabled: !isFormValid.value,
    //       class: "button-hover",
    //     },
    //   ] as ActionButton[];
    default:
      return [];
  }
});

// const actionButtons = computed<ActionButton[]>(() => {
//   if (currentStatus.value === "finish") {
//     return [];
//   }

//   switch (props.currentStep) {
//     case 0:
//       return [];
//     case 1:
//       return [
//         {
//           label: t("purchase-rq.btn.cancel"),
//           onClick: () => goBack(),
//           show: true,
//           disabled: false,
//           class: "button-hover",
//           type: undefined,
//         },
//         {
//           label: t("purchase-rq.btn.confirm"),
//           onClick: async () => await handleDone(props.stepsData),
//           show: true,
//           disabled: false,
//           class: "button-hover",
//           type: "primary" as ButtonType,
//         },
//       ] as ActionButton[];

//     case 2:
//       return [
//         {
//           label: t("purchase-rq.btn.cancel"),
//           onClick: async () => cancel(),
//           show: true,
//           disabled: false,
//           class: "button-hover",
//           type: undefined,
//         },
//         {
//           label: t("purchase-rq.btn.confirm"),
//           type: "primary" as ButtonType,
//           onClick: async () => await handleConfirm(props.stepsData),
//           show: true,
//           disabled: !isFormValid.value,
//           class: "button-hover",
//         },
//       ] as ActionButton[];
//     default:
//       return [];
//   }
// });
</script>

<template>
  <div
    class="fixed px-6 py-4 top-0 z-40 h-auto bg-white shadow-sm transition-all duration-150 mt-[4rem]"
    :class="topbarStyle"
  >
    <header-component
      :header-title="t('purchase-rq.field.proposal')"
      :breadcrumb-items="[t('purchase-rq.field.proposal'), t('purchase-rq.description')]"
      :document-prefix="t('purchase-rq.field.proposal')"
      :document-number="`${t('purchase-rq.field.pr_number')} 0036/ພລ - ${t('purchase-rq.date')}`"
      :document-date="'2025-03-26'"
    />

    <progress-steps-component
      class="mt-4"
      :current-step="props.currentStep"
      @update:current-step="handleStepChange"
      step-type="THREE_STEP"
      :custom-steps="getCustomSteps(t)"
      :custom-buttons="actionButtons"
      :show-user="true"
      :steps-data="props.stepsData"
    />
  </div>
</template>
